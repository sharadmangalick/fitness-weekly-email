'use client'

import PlatformConnector from '@/components/PlatformConnector'

interface Connection {
  platform: 'garmin' | 'strava'
  status: 'active' | 'expired' | 'error'
}

interface StepConnectPlatformProps {
  connections: Connection[]
  onGarminConnect: () => void
  onStravaConnect: () => void
  onDisconnect: (platform: 'garmin' | 'strava') => void
}

export default function StepConnectPlatform({
  connections,
  onGarminConnect,
  onStravaConnect,
  onDisconnect,
}: StepConnectPlatformProps) {
  const garminConnection = connections.find(c => c.platform === 'garmin')
  const stravaConnection = connections.find(c => c.platform === 'strava')
  const hasConnection = connections.length > 0

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Fitness Platform
        </h3>
        <p className="text-gray-600">
          Link your Garmin or Strava account to sync your training data and get personalized weekly plans.
        </p>
      </div>

      <div className="grid gap-4">
        <PlatformConnector
          platform="garmin"
          connected={!!garminConnection}
          status={garminConnection?.status}
          onConnect={onGarminConnect}
          onDisconnect={() => onDisconnect('garmin')}
        />
        <PlatformConnector
          platform="strava"
          connected={!!stravaConnection}
          status={stravaConnection?.status}
          onConnect={onStravaConnect}
          onDisconnect={() => onDisconnect('strava')}
        />
      </div>

      {hasConnection && (
        <div className="animate-success mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">Platform connected!</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Great! We can now sync your fitness data.
          </p>
        </div>
      )}
    </div>
  )
}
