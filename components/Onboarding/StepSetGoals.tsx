'use client'

import GoalWizard from '@/components/GoalWizard'
import { useCalculatedMileage } from '@/hooks/useCalculatedMileage'

interface TrainingConfig {
  goal_category: 'race' | 'non_race'
  goal_type: string
  goal_date: string | null
  goal_time_minutes: number | null
  current_weekly_mileage: number
  email_enabled: boolean
}

interface StepSetGoalsProps {
  initialConfig: TrainingConfig | null
  onSave: () => void
  onPlanGenerate?: () => Promise<void>
}

export default function StepSetGoals({
  initialConfig,
  onSave,
  onPlanGenerate,
}: StepSetGoalsProps) {
  const { calculatedMileage, isLoading, confidence } = useCalculatedMileage()

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Set Your Training Goals
        </h3>
        <p className="text-gray-600">
          Tell us about your goals so we can create a personalized training plan.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500 animate-pulse text-center">
          Analyzing your recent training...
        </p>
      )}

      <GoalWizard
        initialConfig={initialConfig}
        calculatedMileage={calculatedMileage}
        mileageConfidence={confidence}
        onClose={() => {}} // No-op since we're in embedded mode
        onSave={onSave}
        onPlanGenerate={onPlanGenerate}
        embedded={true}
      />
    </div>
  )
}
