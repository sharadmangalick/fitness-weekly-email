import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { decryptTokens, encryptTokens } from '@/lib/encryption'
import { refreshAccessToken } from '@/lib/platforms/garmin/oauth-client'
import { log } from '@/lib/logging'
import type { Database } from '@/lib/database.types'
import type { GarminOAuthTokens } from '@/lib/platforms/interface'

const GARMIN_API_BASE = 'https://apis.garmin.com/wellness-api/rest'

// Backfill data types that satisfy the Endpoint Coverage Test
const BACKFILL_TYPES = [
  'dailies',
  'epochs',
  'sleeps',
  'stressDetails',
  'activities',
  'hrv',
  'healthSnapshot',
]

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's Garmin connection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: connection } = await (supabase as any)
      .from('platform_connections')
      .select('id, tokens_encrypted, iv')
      .eq('user_id', user.id)
      .eq('platform', 'garmin')
      .eq('status', 'active')
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'No active Garmin connection found' }, { status: 404 })
    }

    // Decrypt access token
    let tokens = decryptTokens<GarminOAuthTokens>(
      connection.tokens_encrypted,
      connection.iv
    )

    // Refresh token if expired or expiring within the next hour
    const oneHourFromNow = Math.floor(Date.now() / 1000) + 3600
    if (!tokens.expires_at || tokens.expires_at < oneHourFromNow) {
      log('info', 'Garmin backfill: token expired, refreshing', { userId: user.id })
      try {
        tokens = await refreshAccessToken(tokens.refresh_token, 'garmin-backfill')

        // Persist the new tokens
        const encrypted = encryptTokens(tokens)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('platform_connections')
          .update({
            tokens_encrypted: encrypted.tokens_encrypted,
            iv: encrypted.iv,
            updated_at: new Date().toISOString(),
          })
          .eq('id', connection.id)

        log('info', 'Garmin backfill: token refreshed and persisted', { userId: user.id })
      } catch (refreshErr) {
        log('error', 'Garmin backfill: token refresh failed', { error: String(refreshErr) })
        return NextResponse.json({ error: 'Token refresh failed', details: String(refreshErr) }, { status: 401 })
      }
    }

    // Last 7 days in Unix seconds
    const now = Math.floor(Date.now() / 1000)
    const sevenDaysAgo = now - 7 * 24 * 60 * 60

    const results: Record<string, { status: number; ok: boolean; body?: string }> = {}

    for (const type of BACKFILL_TYPES) {
      try {
        const url = `${GARMIN_API_BASE}/backfill/${type}?summaryStartTimeInSeconds=${sevenDaysAgo}&summaryEndTimeInSeconds=${now}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        })

        const body = await response.text()
        results[type] = { status: response.status, ok: response.ok, body }
        log('info', `Garmin backfill: ${type}`, { status: response.status, ok: response.ok, userId: user.id })
      } catch (err) {
        log('error', `Garmin backfill failed: ${type}`, { error: String(err) })
        results[type] = { status: 0, ok: false, body: String(err) }
      }
    }

    return NextResponse.json({ success: true, results })

  } catch (error) {
    log('error', 'Garmin backfill error', { error: String(error) })
    return NextResponse.json({ error: 'Backfill failed', details: String(error) }, { status: 500 })
  }
}
