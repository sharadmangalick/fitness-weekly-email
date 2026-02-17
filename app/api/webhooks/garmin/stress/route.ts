import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { log } from '@/lib/logging'
import type { Database } from '@/lib/database.types'

const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Garmin Stress Webhook Handler
 * Stores stress data for background processing
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    log('info', 'Garmin stress webhook received', payload)

    const supabase = createAdminClient()
    const { userId: garminUserId } = payload

    if (!garminUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Find user connection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: connections } = await (supabase as any)
      .from('platform_connections')
      .select('user_id')
      .eq('platform', 'garmin')
      .eq('status', 'active')
      .limit(1)

    const connection = connections?.[0]
    if (!connection) {
      log('warn', 'No active Garmin connection found', { garminUserId })
      return NextResponse.json({ success: true })
    }

    // Store webhook delivery
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('garmin_webhook_deliveries')
      .insert({
        user_id: connection.user_id,
        webhook_type: 'stress',
        garmin_user_id: garminUserId,
        payload,
        processed: false
      })

    return NextResponse.json({ success: true })

  } catch (error) {
    log('error', 'Stress webhook error', { error })
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
