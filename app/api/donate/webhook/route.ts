import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-server'
import Stripe from 'stripe'
import {
  generateWebhookFlowId,
  createWebhookLogger,
  sanitizeSessionData,
  extractErrorDetails,
} from '@/lib/webhook-logging'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Step 1: Initialize logging for this webhook
  const flowId = generateWebhookFlowId()
  const logger = createWebhookLogger(flowId)

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  logger.info('Webhook received', { method: request.method })
  await logger.record({
    stripeEventType: 'unknown',
    step: 'received',
    status: 'started',
    metadata: { hasSignature: !!signature, bodySize: body.length },
  })

  // Step 2: Validate signature header
  if (!signature) {
    logger.error('Missing stripe-signature header')
    await logger.record({
      stripeEventType: 'unknown',
      step: 'signature_verification',
      status: 'failed',
      errorCode: 'SIGNATURE_MISSING',
      errorMessage: 'No stripe-signature header in request',
    })
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Step 3: Validate webhook secret configuration
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not configured')
    await logger.record({
      stripeEventType: 'unknown',
      step: 'signature_verification',
      status: 'failed',
      errorCode: 'WEBHOOK_SECRET_MISSING',
      errorMessage: 'STRIPE_WEBHOOK_SECRET environment variable not set',
    })
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  // Step 4: Verify webhook signature
  let event: Stripe.Event
  const verifyTimer = logger.startTimer()

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    const duration = verifyTimer()

    logger.info('Signature verified', { eventId: event.id, eventType: event.type })
    await logger.record({
      stripeEventId: event.id,
      stripeEventType: event.type,
      step: 'signature_verification',
      status: 'success',
      durationMs: duration,
    })
  } catch (err) {
    const duration = verifyTimer()
    const { code, message } = extractErrorDetails(err)

    logger.error('Signature verification failed', { errorCode: code, errorMessage: message })
    await logger.record({
      stripeEventType: 'unknown',
      step: 'signature_verification',
      status: 'failed',
      durationMs: duration,
      errorCode: code === 'Error' ? 'SIGNATURE_INVALID' : code,
      errorMessage: message,
    })

    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Step 5: Route event by type
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    logger.info('Processing checkout.session.completed', { eventId: event.id })
    await logger.record({
      stripeEventId: event.id,
      stripeEventType: event.type,
      step: 'event_parsing',
      status: 'success',
      metadata: sanitizeSessionData(session),
    })

    // Step 6: Check for duplicate (idempotency)
    const supabase = createAdminClient()
    const { data: existing } = await (supabase as any)
      .from('donations')
      .select('id')
      .eq('stripe_session_id', session.id)
      .single()

    if (existing) {
      logger.info('Donation already processed (idempotent retry)', {
        sessionId: session.id,
        donationId: existing.id,
      })
      await logger.record({
        stripeEventId: event.id,
        stripeEventType: event.type,
        step: 'completed',
        status: 'success',
        metadata: { idempotent: true },
      })
      return NextResponse.json({ received: true, duplicate: true })
    }

    // Step 7: Insert new donation
    const dbTimer = logger.startTimer()

    try {
      const { error } = await (supabase as any).from('donations').insert({
        stripe_session_id: session.id,
        amount_cents: session.amount_total || 0,
        email: session.customer_details?.email || null,
      })

      if (error) throw error

      const duration = dbTimer()
      logger.info('Donation recorded', {
        sessionId: session.id,
        amountCents: session.amount_total,
        durationMs: duration,
      })

      await logger.record({
        stripeEventId: event.id,
        stripeEventType: event.type,
        step: 'db_operation',
        status: 'success',
        durationMs: duration,
      })
    } catch (dbError) {
      const duration = dbTimer()
      const { code, message } = extractErrorDetails(dbError)

      logger.error('Failed to record donation', {
        sessionId: session.id,
        errorCode: code,
        errorMessage: message,
      })

      await logger.record({
        stripeEventId: event.id,
        stripeEventType: event.type,
        step: 'db_operation',
        status: 'failed',
        durationMs: duration,
        errorCode: code,
        errorMessage: message,
      })

      // CRITICAL: Return 500 so Stripe will retry (was returning 200 before!)
      return NextResponse.json(
        { error: 'Database error', retry: true },
        { status: 500 }
      )
    }
  } else {
    // Log ignored event types too
    logger.info('Ignoring event type', { eventType: event.type, eventId: event.id })
    await logger.record({
      stripeEventId: event.id,
      stripeEventType: event.type,
      step: 'completed',
      status: 'success',
      metadata: { ignored: true },
    })
    return NextResponse.json({ received: true, ignored: true })
  }

  // Step 8: Mark webhook as completed
  await logger.record({
    stripeEventId: event.id,
    stripeEventType: event.type,
    step: 'completed',
    status: 'success',
  })

  return NextResponse.json({ received: true })
}
