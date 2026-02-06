'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { trackDonation } from '@/components/GoogleAnalytics'

export default function DonationSuccessPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Track donation - amount can be passed via query param from Stripe redirect
    const amountParam = searchParams.get('amount')
    const amount = amountParam ? parseFloat(amountParam) : 5 // Default to $5 if not specified
    trackDonation(amount)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-purple-100 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You!
        </h1>

        <p className="text-gray-600 mb-6">
          Your donation means a lot and helps keep RunPlan.fun free for runners everywhere. We appreciate your support!
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
          >
            Return to Dashboard
          </Link>

          <Link
            href="/"
            className="block text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
