'use client'

import { useState, useEffect } from 'react'
import OnboardingStep from './OnboardingStep'
import StepConnectPlatform from './StepConnectPlatform'
import StepSetGoals from './StepSetGoals'
import StepPlanPreview from './StepPlanPreview'
import GarminConnectModal from '@/components/GarminConnectModal'

type OnboardingStatus = 'not_started' | 'platform_connected' | 'goals_set' | 'completed' | 'skipped'

interface Connection {
  platform: 'garmin' | 'strava'
  status: 'active' | 'expired' | 'error'
}

interface TrainingConfig {
  goal_category: 'race' | 'non_race'
  goal_type: string
  goal_date: string | null
  goal_time_minutes: number | null
  current_weekly_mileage: number
  email_enabled: boolean
}

interface OnboardingFlowProps {
  initialStatus: OnboardingStatus
  connections: Connection[]
  config: TrainingConfig | null
  onComplete: () => void
  onSkip: () => void
  onConnectionsChange: () => void
  onConfigChange: () => void
}

export default function OnboardingFlow({
  initialStatus,
  connections,
  config,
  onComplete,
  onSkip,
  onConnectionsChange,
  onConfigChange,
}: OnboardingFlowProps) {
  const [showGarminModal, setShowGarminModal] = useState(false)
  const [completing, setCompleting] = useState(false)

  // Determine current step based on actual state
  const getCurrentStep = (): number => {
    const hasConnection = connections.length > 0
    const hasConfig = config !== null

    if (!hasConnection) return 1
    if (!hasConfig) return 2
    return 3
  }

  const currentStep = getCurrentStep()
  const totalSteps = 3

  const handleGarminConnect = () => {
    setShowGarminModal(true)
  }

  const handleStravaConnect = () => {
    window.location.href = '/api/connect/strava'
  }

  const handleDisconnect = async (platform: 'garmin' | 'strava') => {
    // This shouldn't really happen in onboarding, but handle it
    onConnectionsChange()
  }

  const handleGarminSuccess = async () => {
    setShowGarminModal(false)
    // Update onboarding status
    await updateOnboardingStatus('platform_connected')
    onConnectionsChange()
  }

  const handleGoalsSaved = async () => {
    // Update onboarding status
    await updateOnboardingStatus('goals_set')
    onConfigChange()
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await updateOnboardingStatus('completed')
      onComplete()
    } finally {
      setCompleting(false)
    }
  }

  const handleSkip = async () => {
    await updateOnboardingStatus('skipped')
    onSkip()
  }

  const updateOnboardingStatus = async (status: OnboardingStatus) => {
    try {
      await fetch('/api/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch (err) {
      console.error('Failed to update onboarding status:', err)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Connect Your Platform'
      case 2:
        return 'Set Your Goals'
      case 3:
        return 'Your Training Plan'
      default:
        return 'Getting Started'
    }
  }

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return 'Link your fitness tracker to get started'
      case 2:
        return 'Tell us about your training goals'
      case 3:
        return "You're almost ready to start training"
      default:
        return ''
    }
  }

  return (
    <>
      {/* Full Screen Overlay */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl my-8 max-h-[90vh] flex flex-col">
          <OnboardingStep
            currentStep={currentStep}
            totalSteps={totalSteps}
            title={getStepTitle()}
            subtitle={getStepSubtitle()}
            onSkip={handleSkip}
            showSkip={currentStep < 3}
          >
            {/* Step 1: Connect Platform */}
            {currentStep === 1 && (
              <StepConnectPlatform
                connections={connections}
                onGarminConnect={handleGarminConnect}
                onStravaConnect={handleStravaConnect}
                onDisconnect={handleDisconnect}
              />
            )}

            {/* Step 2: Set Goals */}
            {currentStep === 2 && (
              <StepSetGoals
                initialConfig={config}
                onSave={handleGoalsSaved}
              />
            )}

            {/* Step 3: Plan Preview */}
            {currentStep === 3 && (
              <StepPlanPreview
                onComplete={handleComplete}
                loading={completing}
              />
            )}
          </OnboardingStep>
        </div>
      </div>

      {/* Garmin Modal */}
      <GarminConnectModal
        isOpen={showGarminModal}
        onClose={() => setShowGarminModal(false)}
        onSuccess={handleGarminSuccess}
      />
    </>
  )
}
