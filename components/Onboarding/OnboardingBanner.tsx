'use client'

type OnboardingStatus = 'not_started' | 'platform_connected' | 'goals_set' | 'completed' | 'skipped'

interface OnboardingBannerProps {
  status: OnboardingStatus
  hasConnections: boolean
  hasConfig: boolean
  onResume: () => void
}

export default function OnboardingBanner({
  status,
  hasConnections,
  hasConfig,
  onResume,
}: OnboardingBannerProps) {
  // Determine what step they should resume at
  const getResumeMessage = () => {
    if (!hasConnections) {
      return {
        title: 'Connect your fitness platform',
        description: 'Link your Garmin or Strava account to get personalized training plans.',
      }
    }
    if (!hasConfig) {
      return {
        title: 'Set your training goals',
        description: 'Tell us about your goals so we can create your personalized plan.',
      }
    }
    return {
      title: 'Finish setting up',
      description: 'Complete the onboarding to get your personalized training plan.',
    }
  }

  const message = getResumeMessage()

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{message.title}</h3>
            <p className="text-sm text-gray-600">{message.description}</p>
          </div>
        </div>
        <button
          onClick={onResume}
          className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
        >
          Continue Setup
        </button>
      </div>
    </div>
  )
}
