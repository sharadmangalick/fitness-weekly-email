import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { log } from '@/lib/logging'
import type { Database } from '@/lib/database.types'

// Admin client for cron operations
const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Process Activity Webhook
 * Stores activity data and triggers mileage recalculation
 */
async function processActivityWebhook(webhook: any) {
  const { user_id, payload } = webhook

  log('info', 'Processing activity webhook', {
    webhookId: webhook.id,
    userId: user_id,
    activityId: payload.activityId
  })

  // In a full implementation:
  // 1. Parse activity data from payload
  // 2. Store in database (activities table)
  // 3. Trigger weekly mileage recalculation
  // 4. Update training plan if needed

  // For now, just log it
  log('info', 'Activity webhook processed', {
    webhookId: webhook.id,
    activityId: payload.activityId
  })
}

/**
 * Process Sleep Webhook
 * Stores sleep data for training plan adaptation
 */
async function processSleepWebhook(webhook: any) {
  const { user_id, payload } = webhook

  log('info', 'Processing sleep webhook', {
    webhookId: webhook.id,
    userId: user_id
  })

  // In a full implementation:
  // 1. Parse sleep data from payload
  // 2. Calculate sleep quality score
  // 3. Store in database
  // 4. Update recovery metrics

  log('info', 'Sleep webhook processed', {
    webhookId: webhook.id
  })
}

/**
 * Process Daily Summary Webhook
 * Stores body battery, stress, steps, etc.
 */
async function processDailySummaryWebhook(webhook: any) {
  const { user_id, payload } = webhook

  log('info', 'Processing daily summary webhook', {
    webhookId: webhook.id,
    userId: user_id
  })

  // In a full implementation:
  // 1. Parse daily summary data
  // 2. Extract body battery, stress levels
  // 3. Store in database
  // 4. Update recovery metrics for training plan

  log('info', 'Daily summary webhook processed', {
    webhookId: webhook.id
  })
}

/**
 * Process Heart Rate Webhook
 * Stores resting HR and HRV data
 */
async function processHeartRateWebhook(webhook: any) {
  const { user_id, payload } = webhook

  log('info', 'Processing heart rate webhook', {
    webhookId: webhook.id,
    userId: user_id
  })

  // In a full implementation:
  // 1. Parse heart rate data
  // 2. Track resting HR trends
  // 3. Calculate HRV if available
  // 4. Update recovery metrics

  log('info', 'Heart rate webhook processed', {
    webhookId: webhook.id
  })
}

/**
 * Process Stress Webhook
 * Stores stress level data
 */
async function processStressWebhook(webhook: any) {
  const { user_id, payload } = webhook

  log('info', 'Processing stress webhook', {
    webhookId: webhook.id,
    userId: user_id
  })

  // Store stress data for recovery analysis
  log('info', 'Stress webhook processed', {
    webhookId: webhook.id
  })
}

/**
 * Background job to process unprocessed Garmin webhooks
 * Runs every 15 minutes via Vercel Cron
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    log('warn', 'Unauthorized cron request', {
      hasAuth: !!authHeader,
      expectedPrefix: 'Bearer ...'
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  log('info', 'Starting Garmin webhook processing job')

  const supabase = createAdminClient()

  try {
    // Get unprocessed webhooks (limit 100 per run)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: webhooks, error: fetchError } = await (supabase as any)
      .from('garmin_webhook_deliveries')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(100)

    if (fetchError) {
      log('error', 'Failed to fetch unprocessed webhooks', { error: fetchError })
      return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 })
    }

    if (!webhooks || webhooks.length === 0) {
      log('info', 'No unprocessed webhooks found')
      return NextResponse.json({ processed: 0, status: 'idle' })
    }

    log('info', 'Found unprocessed webhooks', { count: webhooks.length })

    let processedCount = 0
    let failedCount = 0

    for (const webhook of webhooks) {
      try {
        log('info', 'Processing webhook', {
          webhookId: webhook.id,
          type: webhook.webhook_type,
          userId: webhook.user_id
        })

        // Process based on webhook type
        switch (webhook.webhook_type) {
          case 'activity':
            await processActivityWebhook(webhook)
            break
          case 'sleep':
            await processSleepWebhook(webhook)
            break
          case 'daily_summary':
            await processDailySummaryWebhook(webhook)
            break
          case 'heart_rate':
            await processHeartRateWebhook(webhook)
            break
          case 'stress':
            await processStressWebhook(webhook)
            break
          default:
            log('warn', 'Unknown webhook type', { type: webhook.webhook_type })
        }

        // Mark as processed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('garmin_webhook_deliveries')
          .update({
            processed: true,
            processed_at: new Date().toISOString()
          })
          .eq('id', webhook.id)

        if (updateError) {
          log('error', 'Failed to mark webhook as processed', {
            webhookId: webhook.id,
            error: updateError
          })
        } else {
          processedCount++
        }

      } catch (error) {
        log('error', 'Error processing webhook', {
          webhookId: webhook.id,
          error: error instanceof Error ? error.message : 'Unknown'
        })

        // Log error but continue processing others
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('garmin_webhook_deliveries')
          .update({
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', webhook.id)

        failedCount++
      }
    }

    log('info', 'Webhook processing job completed', {
      processed: processedCount,
      failed: failedCount,
      total: webhooks.length
    })

    return NextResponse.json({
      success: true,
      processed: processedCount,
      failed: failedCount,
      total: webhooks.length
    })

  } catch (error) {
    log('error', 'Webhook processing job failed', { error })
    return NextResponse.json(
      {
        error: 'Processing job failed',
        details: error instanceof Error ? error.message : 'Unknown'
      },
      { status: 500 }
    )
  }
}
