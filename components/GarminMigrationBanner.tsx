'use client'

interface GarminMigrationBannerProps {
  onReconnect: () => void
  onDismiss: () => void
}

export default function GarminMigrationBanner({
  onReconnect,
  onDismiss,
}: GarminMigrationBannerProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-blue-800">Reconnect Your Garmin Account</p>
          <p className="text-sm text-blue-700 mt-1">
            We&apos;ve upgraded to Garmin&apos;s official production API for better reliability. Please reconnect your account to continue receiving weekly training plans.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onReconnect}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reconnect Garmin
            </button>
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
