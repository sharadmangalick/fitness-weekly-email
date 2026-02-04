'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

function GoogleAnalyticsTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }, [pathname, searchParams])

  return null
}

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <GoogleAnalyticsTracking />
      </Suspense>
    </>
  )
}

// Event tracking helpers
export function trackSignup() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'sign_up', {
    method: 'email',
  })
}

export function trackPlatformConnection(platform: 'garmin' | 'strava') {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'platform_connected', {
    platform,
  })
}

export function trackGoalConfigured() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'goal_configured', {})
}

export function trackDonation(amount: number) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'purchase', {
    value: amount,
    currency: 'USD',
    items: [{ item_name: 'Donation' }],
  })
}

// Set user ID for cross-session tracking
export function setUserId(userId: string) {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, { user_id: userId })
  }
}

// Onboarding funnel events
export function trackOnboardingStarted() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'onboarding_started', {})
}

export function trackOnboardingPlatformConnected(platform: 'garmin' | 'strava') {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'onboarding_platform_connected', { platform })
}

export function trackOnboardingGoalsSet() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'onboarding_goals_set', {})
}

export function trackOnboardingCompleted() {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'onboarding_completed', {})
}

export function trackOnboardingSkipped(step: number) {
  if (!GA_MEASUREMENT_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'onboarding_skipped', { step })
}
