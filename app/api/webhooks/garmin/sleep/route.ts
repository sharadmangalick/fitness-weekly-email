import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { log } from '@/lib/logging'
import { findConnectionByGarminUserId, buildDeliveryRow } from '@/lib/platforms/garmin/webhook-routing'
import type { Database } from '@/lib/database.types'

const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Garmin Sleep Webhook Handler
 *
 * Routes by Garmin's userId. Unmatched deliveries are still persisted with
 * user_id=NULL so we never drop data.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    log('info', 'Garmin sleep webhook received', payload)

    const { userId: garminUserId } = payload
    if (!garminUserId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const connection = await findConnectionByGarminUserId(supabase, garminUserId)
    if (!connection) {
      log('warn', 'Unmatched Garmin sleep webhook — persisting with user_id=NULL', { garminUserId })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('garmin_webhook_deliveries')
      .insert(buildDeliveryRow({
        connection,
        garminUserId,
        webhookType: 'sleep',
        payload,
      }))

    if (error) {
      log('error', 'Failed to insert sleep delivery', { garminUserId, error: error.message })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    log('error', 'Sleep webhook error', { error })
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
