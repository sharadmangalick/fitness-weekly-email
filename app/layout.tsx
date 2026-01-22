import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fitness Weekly Email - Personalized Training Plans',
  description: 'Connect your Garmin or Strava account and receive personalized weekly training plans based on your fitness data.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
