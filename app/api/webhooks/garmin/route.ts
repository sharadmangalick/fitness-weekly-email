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
 * Routing: every event carries a Garmin-supplied `userId` we use to look
 * up the matching active platform_connections row. Unmatched deliveries
 * are still persisted (user_id=NULL) so we never drop data and can
 * re-attribute later.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const eventTypes = Object.keys(payload)
    log('info', 'Garmin webhook received', { eventTypes })

    const supabase = createAdminClient()

    const insertDelivery = async (
      garminUserId: string | undefined,
      webhookType: string,
      eventPayload: unknown,
      opts: { processed?: boolean; processedAt?: string } = {},
    ) => {
      const connection = await findConnectionByGarminUserId(supabase, garminUserId)
      if (!connection) {
        log('warn', 'Unmatched Garmin webhook — persisting with user_id=NULL', {
          webhookType,
          garminUserId,
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('garmin_webhook_deliveries')
        .insert(buildDeliveryRow({
          connection,
          garminUserId,
          webhookType,
          payload: eventPayload,
          processed: opts.processed,
          processedAt: opts.processedAt,
        }))
      if (error) {
        log('error', 'Failed to insert webhook delivery', {
          webhookType, garminUserId, error: error.message,
        })
      }
      return connection
    }

    // ── Deregistrations ─────────────────────────────────────────────────────
    if (Array.isArray(payload.deregistrations)) {
      for (const { userId: garminUserId } of payload.deregistrations) {
        try {
          const connection = await findConnectionByGarminUserId(supabase, garminUserId)
          if (connection) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('platform_connections')
              .update({ status: 'expired', updated_at: new Date().toISOString() })
              .eq('id', connection.id)
            log('info', 'Connection deregistered', { connectionId: connection.id, garminUserId })
          } else {
            log('warn', 'No active Garmin connection found for deregistration', { garminUserId })
          }
          await insertDelivery(garminUserId, 'deregistration', { userId: garminUserId }, {
            processed: true,
            processedAt: new Date().toISOString(),
          })
        } catch (err) {
          log('error', 'Error processing deregistration', { error: err, garminUserId })
        }
      }
    }

    // ── User Permissions Change ──────────────────────────────────────────────
    if (Array.isArray(payload.userPermissionsChange)) {
      for (const item of payload.userPermissionsChange) {
        try {
          await insertDelivery(item.userId, 'user_permission', item, {
            processed: true,
            processedAt: new Date().toISOString(),
          })
          log('info', 'User permission change logged', { garminUserId: item.userId })
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
          // Persist every activity type (run, bike, strength, walk, etc.) —
          // the weekly recap and adaptation rules cover cross-training, so
          // dropping non-runs here was hiding real training volume from
          // the rest of the pipeline.
          const connection = await insertDelivery(garminUserId, 'activity', activity)
          if (!connection) continue

          // Mileage recalc is run-specific — skip the trigger for non-runs.
          const isRunning = activityType?.toLowerCase().includes('run')
          if (isRunning) {
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/calculate-mileage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: connection.user_id })
            }).catch(err => {
              log('error', 'Failed to trigger mileage calculation', { error: err, userId: connection.user_id })
            })
          }

          log('info', 'Activity webhook stored', { activityId, activityType, userId: connection.user_id })
        } catch (err) {
          log('error', 'Error processing activity', { error: err, activityId })
        }
      }
    }

    // ── Daily Summaries ──────────────────────────────────────────────────────
    if (Array.isArray(payload.dailies)) {
      for (const daily of payload.dailies) {
        try {
          await insertDelivery(daily.userId, 'daily_summary', daily)
          log('info', 'Daily summary stored', { garminUserId: daily.userId })
        } catch (err) {
          log('error', 'Error processing daily summary', { error: err })
        }
      }
    }

    // ── Sleep ────────────────────────────────────────────────────────────────
    if (Array.isArray(payload.sleeps)) {
      for (const sleep of payload.sleeps) {
        try {
          await insertDelivery(sleep.userId, 'sleep', sleep)
          log('info', 'Sleep data stored', { garminUserId: sleep.userId })
        } catch (err) {
          log('error', 'Error processing sleep data', { error: err })
        }
      }
    }

    // ── Stress ───────────────────────────────────────────────────────────────
    if (Array.isArray(payload.stressDetails)) {
      for (const stress of payload.stressDetails) {
        try {
          await insertDelivery(stress.userId, 'stress', stress)
          log('info', 'Stress data stored', { garminUserId: stress.userId })
        } catch (err) {
          log('error', 'Error processing stress data', { error: err })
        }
      }
    }

    // ── Health Snapshots (carries resting HR + body battery aggregates) ─────
    if (Array.isArray(payload.healthSnapshot)) {
      for (const snapshot of payload.healthSnapshot) {
        try {
          await insertDelivery(snapshot.userId, 'health_snapshot', snapshot)
          log('info', 'Health snapshot stored', { garminUserId: snapshot.userId })
        } catch (err) {
          log('error', 'Error processing health snapshot', { error: err })
        }
      }
    }

    // ── User Metrics (VO2 max, fitness age) ─────────────────────────────────
    if (Array.isArray(payload.userMetrics)) {
      for (const metric of payload.userMetrics) {
        try {
          await insertDelivery(metric.userId, 'user_metrics', metric)
          log('info', 'User metrics stored', { garminUserId: metric.userId })
        } catch (err) {
          log('error', 'Error processing user metrics', { error: err })
        }
      }
    }

    // ── Heart Rate Epochs (15-min activity intensity, NOT resting HR) ───────
    // Stored under webhook_type='heart_rate' for historical reasons; payload
    // contains met/intensity/steps but no HR value.
    if (Array.isArray(payload.epochs)) {
      for (const epoch of payload.epochs) {
        try {
          await insertDelivery(epoch.userId, 'heart_rate', epoch)
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
