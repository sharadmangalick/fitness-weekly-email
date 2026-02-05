import { NextRequest, NextResponse } from 'next/server'
import { getStripe, DEFAULT_DONATION_AMOUNT } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const amountCents = body.amount || DEFAULT_DONATION_AMOUNT

    if (amountCents < 100) {
      return NextResponse.json(
        { error: 'Minimum donation is $1' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runplan.fun'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support RunPlan.fun',
              description: 'Thank you for supporting free personalized training plans!',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/support`,
      submit_type: 'donate',
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
