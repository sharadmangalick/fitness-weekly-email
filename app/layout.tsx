import './globals.css'
import type { Metadata } from 'next'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'RunPlan — Personalized weekly running plans, free forever',
  description: 'Free, personalized weekly running plans built from your Garmin or Strava data. Adapts to your sleep, resting HR, and recovery. From 5K to ultra, base building to injury return.',
  metadataBase: new URL('https://runplan.fun'),
  alternates: {
    canonical: 'https://runplan.fun',
  },
  openGraph: {
    title: 'RunPlan — Personalized weekly running plans, free forever',
    description: 'Free, personalized weekly running plans built from your Garmin or Strava data. Adapts to your recovery week to week.',
    url: 'https://runplan.fun',
    siteName: 'RunPlan',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RunPlan — Personalized weekly running plans, free forever',
    description: 'Free, personalized weekly running plans built from your Garmin or Strava data. Adapts to your recovery week to week.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RunPlan.fun',
    url: 'https://runplan.fun',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    description: 'Personalized weekly running training plans based on your Garmin or Strava recovery data. Adapts to your resting heart rate, sleep, and body battery.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: 'Garmin Connect integration, Strava integration, personalized training plans, recovery-based adaptation, weekly email delivery',
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}
