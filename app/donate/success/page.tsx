import Link from 'next/link'

export default function DonationSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
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
            className="block w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Return to Dashboard
          </Link>

          <Link
            href="/"
            className="block text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
