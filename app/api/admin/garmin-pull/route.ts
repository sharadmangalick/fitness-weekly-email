import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { decryptTokens, encryptTokens } from '@/lib/encryption'
import { GarminOAuthClient, refreshAccessToken } from '@/lib/platforms/garmin/oauth-client'
import { log } from '@/lib/logging'
import type { Database } from '@/lib/database.types'
import type { GarminOAuthTokens } from '@/lib/platforms/interface'

/**
 * Pull-based Garmin API fetch.
 *
 * Calls the Garmin Health REST API directly (as a "pull") to satisfy
 * the Garmin Partner Center Pull Test. The backfill endpoint handles
 * push-based data; this endpoint handles pull-based data.
 */
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

    let tokens = decryptTokens<GarminOAuthTokens>(
      connection.tokens_encrypted,
      connection.iv
    )

    // Refresh token if expired or expiring within the next hour
    const oneHourFromNow = Math.floor(Date.now() / 1000) + 3600
    if (!tokens.expires_at || tokens.expires_at < oneHourFromNow) {
      log('info', 'Garmin pull: token expired, refreshing', { userId: user.id })
      try {
        tokens = await refreshAccessToken(tokens.refresh_token, 'garmin-pull')

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

        log('info', 'Garmin pull: token refreshed and persisted', { userId: user.id })
      } catch (refreshErr) {
        log('error', 'Garmin pull: token refresh failed', { error: String(refreshErr) })
        return NextResponse.json({ error: 'Token refresh failed', details: String(refreshErr) }, { status: 401 })
      }
    }

    const client = new GarminOAuthClient(tokens.access_token)

    log('info', 'Garmin pull: fetching all data types', { userId: user.id })

    // Fetch all data types in parallel (7-day window)
    const data = await client.fetchAll(7)

    const summary = {
      activities: Array.isArray(data.activities) ? data.activities.length : 0,
      sleep: Array.isArray(data.sleep) ? data.sleep.length : 0,
      dailySummaries: Array.isArray(data.dailySummaries) ? data.dailySummaries.length : 0,
      stress: Array.isArray(data.stress) ? data.stress.length : 0,
      epochs: Array.isArray(data.epochs) ? data.epochs.length : 0,
      hrv: Array.isArray(data.hrv) ? data.hrv.length : 0,
    }

    log('info', 'Garmin pull: complete', { userId: user.id, summary })

    return NextResponse.json({ success: true, summary, data })

  } catch (error) {
    log('error', 'Garmin pull error', { error: String(error) })
    return NextResponse.json({ error: 'Pull fetch failed', details: String(error) }, { status: 500 })
  }
}
