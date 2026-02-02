import Stripe from 'stripe'
import { loadStripe, Stripe as StripeJs } from '@stripe/stripe-js'

// Server-side Stripe client
let stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    })
  }
  return stripe
}

// Client-side Stripe promise
let stripePromise: Promise<StripeJs | null> | null = null

export function getStripeJs() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
  }
  return stripePromise
}

// Donation amount presets in cents
export const DONATION_PRESETS = [
  { amount: 500, label: '$5' },
  { amount: 1000, label: '$10' },
  { amount: 2000, label: '$20' },
  { amount: 5000, label: '$50' },
]

export const DEFAULT_DONATION_AMOUNT = 1000 // $10
