import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase-server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const supabase = createAdminClient()

      await (supabase as any).from('donations').insert({
        stripe_session_id: session.id,
        amount_cents: session.amount_total || 0,
        email: session.customer_details?.email || null,
      })

      console.log('Donation recorded:', {
        sessionId: session.id,
        amount: session.amount_total,
        email: session.customer_details?.email,
      })
    } catch (dbError) {
      console.error('Failed to record donation:', dbError)
      // Don't fail the webhook - Stripe will retry
    }
  }

  return NextResponse.json({ received: true })
}
