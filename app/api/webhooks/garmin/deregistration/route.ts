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
 * Garmin Deregistration Webhook Handler
 *
 * Called when a user disconnects their Garmin account or revokes access.
 * Routes by Garmin's userId; only the matching connection's status is
 * updated. Unmatched deliveries are still persisted for traceability.
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    log('info', 'Garmin deregistration webhook received', { payload })

    const { deregistrations } = payload

    if (!deregistrations || !Array.isArray(deregistrations)) {
      log('warn', 'Invalid deregistration payload', { payload })
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const results = []

    for (const { userId: garminUserId } of deregistrations) {
      try {
        log('info', 'Processing deregistration', { garminUserId })

        const connection = await findConnectionByGarminUserId(supabase, garminUserId)

        if (connection) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: updateError } = await (supabase as any)
            .from('platform_connections')
            .update({
              status: 'deregistered',
              updated_at: new Date().toISOString()
            })
            .eq('id', connection.id)

          if (updateError) {
            log('error', 'Failed to update connection status', { error: updateError, garminUserId })
          } else {
            log('info', 'Connection deregistered', {
              connectionId: connection.id,
              userId: connection.user_id,
              garminUserId
            })
          }
        } else {
          log('warn', 'No matching connection found for deregistration', { garminUserId })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('garmin_webhook_deliveries')
          .insert(buildDeliveryRow({
            connection,
            garminUserId,
            webhookType: 'deregistration',
            payload: { userId: garminUserId },
            processed: true,
            processedAt: new Date().toISOString(),
          }))

        results.push({ garminUserId, status: connection ? 'success' : 'not_found' })

      } catch (error) {
        log('error', 'Error processing deregistration', { error, garminUserId })
        results.push({ garminUserId, status: 'error', error: error instanceof Error ? error.message : 'Unknown' })
      }
    }

    return NextResponse.json({ success: true, results })

  } catch (error) {
    log('error', 'Deregistration webhook error', { error })
    return NextResponse.json(
      { error: 'Processing failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
