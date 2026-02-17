import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { decryptTokens } from '@/lib/encryption'
import { log } from '@/lib/logging'
import type { Database } from '@/lib/database.types'

const GARMIN_API_BASE = 'https://apis.garmin.com/wellness-api/rest'

// Backfill data types that satisfy the Endpoint Coverage Test
const BACKFILL_TYPES = [
  'dailies',
  'epochs',
  'sleeps',
  'stressDetails',
  'activities',
  'hrv',
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
      .select('tokens_encrypted, iv')
      .eq('user_id', user.id)
      .eq('platform', 'garmin')
      .eq('status', 'active')
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'No active Garmin connection found' }, { status: 404 })
    }

    // Decrypt access token
    const tokens = decryptTokens<{ access_token: string }>(
      connection.tokens_encrypted,
      connection.iv
    )

    // Last 7 days in Unix seconds
    const now = Math.floor(Date.now() / 1000)
    const sevenDaysAgo = now - 7 * 24 * 60 * 60

    const results: Record<string, { status: number; ok: boolean }> = {}

    for (const type of BACKFILL_TYPES) {
      try {
        const url = `${GARMIN_API_BASE}/backfill/${type}?summaryStartTimeInSeconds=${sevenDaysAgo}&summaryEndTimeInSeconds=${now}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        })

        results[type] = { status: response.status, ok: response.ok }
        log('info', `Garmin backfill: ${type}`, { status: response.status, userId: user.id })
      } catch (err) {
        log('error', `Garmin backfill failed: ${type}`, { error: err })
        results[type] = { status: 0, ok: false }
      }
    }

    return NextResponse.json({ success: true, results })

  } catch (error) {
    log('error', 'Garmin backfill error', { error })
    return NextResponse.json({ error: 'Backfill failed' }, { status: 500 })
  }
}
