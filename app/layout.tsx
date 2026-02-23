import './globals.css'
import type { Metadata } from 'next'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'RunPlan.fun - Personalized Training Plans',
  description: 'Connect your Garmin or Strava account and receive personalized weekly training plans based on your fitness data.',
  metadataBase: new URL('https://runplan.fun'),
  openGraph: {
    title: 'RunPlan.fun - AI-Powered Training Plans',
    description: 'Get personalized weekly running plans delivered to your inbox. Connect Garmin or Strava and let AI coach you to your next PR.',
    url: 'https://runplan.fun',
    siteName: 'RunPlan.fun',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RunPlan.fun - Personalized Training Plans',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RunPlan.fun - AI-Powered Training Plans',
    description: 'Get personalized weekly running plans delivered to your inbox. Connect Garmin or Strava and let AI coach you to your next PR.',
    images: ['/og-image.png'],
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
