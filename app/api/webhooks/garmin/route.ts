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

// Garmin sends a GET ping to verify the endpoint is reachable
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

/**
 * Unified Garmin Webhook Handler
 *
 * Garmin sends all event types to a single URL. The payload contains
 * different top-level keys depending on what data is included.
 * A single request may contain multiple event types simultaneously.
 *
 * Supported event types:
 *   - activities         → running activity uploaded
 *   - dailies            → daily health summary
 *   - sleeps             → sleep data
 *   - stressDetails      → stress data
 *   - epochs             → heart rate epoch data
 *   - deregistrations    → user revoked access
 *   - userPermissionsChange → user changed data sharing permissions
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const eventTypes = Object.keys(payload)
    log('info', 'Garmin webhook received', { eventTypes })

    const supabase = createAdminClient()

    // Helper: find an active Garmin connection (best-effort match)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findConnection = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('platform_connections')
        .select('id, user_id')
        .eq('platform', 'garmin')
        .eq('status', 'active')
        .limit(1)
      return data?.[0] ?? null
    }

    // ── Deregistrations ─────────────────────────────────────────────────────
    if (Array.isArray(payload.deregistrations)) {
      for (const { userId: garminUserId } of payload.deregistrations) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: connections } = await (supabase as any)
            .from('platform_connections')
            .select('id, user_id')
            .eq('platform', 'garmin')
            .eq('status', 'active')

          const connection = connections?.[0]
          if (connection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('platform_connections')
              .update({ status: 'expired', updated_at: new Date().toISOString() })
              .eq('id', connection.id)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('garmin_webhook_deliveries')
              .insert({
                user_id: connection.user_id,
                webhook_type: 'deregistration',
                garmin_user_id: garminUserId,
                payload: { userId: garminUserId },
                processed: true,
                processed_at: new Date().toISOString()
              })

            log('info', 'Connection deregistered', { connectionId: connection.id, garminUserId })
          } else {
            log('warn', 'No active Garmin connection found for deregistration', { garminUserId })
          }
        } catch (err) {
          log('error', 'Error processing deregistration', { error: err, garminUserId })
        }
      }
    }

    // ── User Permissions Change ──────────────────────────────────────────────
    if (Array.isArray(payload.userPermissionsChange)) {
      for (const item of payload.userPermissionsChange) {
        try {
          const connection = await findConnection()
          if (connection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('garmin_webhook_deliveries')
              .insert({
                user_id: connection.user_id,
                webhook_type: 'user_permission',
                garmin_user_id: item.userId,
                payload: item,
                processed: true,
                processed_at: new Date().toISOString()
              })
            log('info', 'User permission change logged', { garminUserId: item.userId })
          }
        } catch (err) {
          log('error', 'Error processing user permission change', { error: err })
        }
      }
    }

    // ── Activities ───────────────────────────────────────────────────────────
    if (Array.isArray(payload.activities)) {
      for (const activity of payload.activities) {
        const { userId: garminUserId, activityId, activityType } = activity
        try {
          const isRunning = activityType?.toLowerCase().includes('run')
          if (!isRunning) {
            log('info', 'Skipping non-running activity', { activityId, activityType })
            continue
          }

          const connection = await findConnection()
          if (!connection) {
            log('warn', 'No active Garmin connection found for activity', { garminUserId })
            continue
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('garmin_webhook_deliveries')
            .insert({
              user_id: connection.user_id,
              webhook_type: 'activity',
              garmin_user_id: garminUserId,
              payload: activity,
              processed: false
            })

          // Trigger mileage recalculation async
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/calculate-mileage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: connection.user_id })
          }).catch(err => {
            log('error', 'Failed to trigger mileage calculation', { error: err, userId: connection.user_id })
          })

          log('info', 'Activity webhook stored', { activityId, userId: connection.user_id })
        } catch (err) {
          log('error', 'Error processing activity', { error: err, activityId })
        }
      }
    }

    // ── Daily Summaries ──────────────────────────────────────────────────────
    if (Array.isArray(payload.dailies)) {
      for (const daily of payload.dailies) {
        try {
          const connection = await findConnection()
          if (connection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('garmin_webhook_deliveries')
              .insert({
                user_id: connection.user_id,
                webhook_type: 'daily_summary',
                garmin_user_id: daily.userId,
                payload: daily,
                processed: false
              })
            log('info', 'Daily summary stored', { garminUserId: daily.userId })
          }
        } catch (err) {
          log('error', 'Error processing daily summary', { error: err })
        }
      }
    }

    // ── Sleep ────────────────────────────────────────────────────────────────
    if (Array.isArray(payload.sleeps)) {
      for (const sleep of payload.sleeps) {
        try {
          const connection = await findConnection()
          if (connection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('garmin_webhook_deliveries')
              .insert({
                user_id: connection.user_id,
                webhook_type: 'sleep',
                garmin_user_id: sleep.userId,
                payload: sleep,
                processed: false
              })
            log('info', 'Sleep data stored', { garminUserId: sleep.userId })
          }
        } catch (err) {
          log('error', 'Error processing sleep data', { error: err })
        }
      }
    }

    // ── Stress ───────────────────────────────────────────────────────────────
    if (Array.isArray(payload.stressDetails)) {
      for (const stress of payload.stressDetails) {
        try {
          const connection = await findConnection()
          if (connection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('garmin_webhook_deliveries')
              .insert({
                user_id: connection.user_id,
                webhook_type: 'stress',
                garmin_user_id: stress.userId,
                payload: stress,
                processed: false
              })
            log('info', 'Stress data stored', { garminUserId: stress.userId })
          }
        } catch (err) {
          log('error', 'Error processing stress data', { error: err })
        }
      }
    }

    // ── Health Snapshots ─────────────────────────────────────────────────────
    if (Array.isArray(payload.healthSnapshot)) {
      for (const snapshot of payload.healthSnapshot) {
        try {
          const connection = await findConnection()
          if (connection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('garmin_webhook_deliveries')
              .insert({
                user_id: connection.user_id,
                webhook_type: 'health_snapshot',
                garmin_user_id: snapshot.userId,
                payload: snapshot,
                processed: false
              })
            log('info', 'Health snapshot stored', { garminUserId: snapshot.userId })
          }
        } catch (err) {
          log('error', 'Error processing health snapshot', { error: err })
        }
      }
    }

    // ── Heart Rate Epochs ────────────────────────────────────────────────────
    if (Array.isArray(payload.epochs)) {
      for (const epoch of payload.epochs) {
        try {
          const connection = await findConnection()
          if (connection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('garmin_webhook_deliveries')
              .insert({
                user_id: connection.user_id,
                webhook_type: 'heart_rate',
                garmin_user_id: epoch.userId,
                payload: epoch,
                processed: false
              })
          }
        } catch (err) {
          log('error', 'Error processing heart rate epoch', { error: err })
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    log('error', 'Garmin webhook error', { error })
    return NextResponse.json(
      { error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
