import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { log } from '@/lib/logging'
import type { Database } from '@/lib/database.types'

// Admin client for webhook operations
const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Garmin Activities Webhook Handler
 *
 * Called when a user uploads a new activity to Garmin Connect.
 * We store the webhook and trigger mileage recalculation.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    log('info', 'Garmin activities webhook received', {
      activityCount: payload.activities?.length || 0
    })

    const { activities } = payload

    if (!activities || !Array.isArray(activities)) {
      log('warn', 'Invalid activities payload', { payload })
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const results = []

    for (const activity of activities) {
      const { userId: garminUserId, activityId, activityType } = activity

      try {
        // Only process running activities
        const isRunning = activityType?.toLowerCase().includes('run')
        if (!isRunning) {
          log('info', 'Skipping non-running activity', { activityId, activityType })
          continue
        }

        log('info', 'Processing running activity', { garminUserId, activityId, activityType })

        // Find user connection by garmin_user_id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: connections } = await (supabase as any)
          .from('platform_connections')
          .select('id, user_id')
          .eq('platform', 'garmin')
          .eq('status', 'active')

        // In production, decrypt tokens and match garmin_user_id
        // For now, we assume first active connection
        const connection = connections?.[0]

        if (!connection) {
          log('warn', 'No active Garmin connection found', { garminUserId })
          continue
        }

        // Store webhook delivery (unprocessed - will be processed by cron job)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
          .from('garmin_webhook_deliveries')
          .insert({
            user_id: connection.user_id,
            webhook_type: 'activity',
            garmin_user_id: garminUserId,
            payload: activity,
            processed: false  // Will be processed by background job
          })

        if (insertError) {
          log('error', 'Failed to store webhook delivery', { error: insertError, activityId })
          results.push({ activityId, status: 'error', error: insertError.message })
          continue
        }

        log('info', 'Activity webhook stored', {
          userId: connection.user_id,
          activityId
        })

        // Trigger mileage recalculation (async - don't wait)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/calculate-mileage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: connection.user_id })
        }).catch(err => {
          log('error', 'Failed to trigger mileage calculation', { error: err, userId: connection.user_id })
        })

        results.push({ activityId, status: 'success' })

      } catch (error) {
        log('error', 'Error processing activity webhook', { error, activityId })
        results.push({
          activityId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown'
        })
      }
    }

    return NextResponse.json({ success: true, results })

  } catch (error) {
    log('error', 'Activities webhook error', { error })
    return NextResponse.json(
      { error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
