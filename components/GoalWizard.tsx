'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase-browser'

interface GoalWizardProps {
  initialConfig?: any
  onClose: () => void
  onSave: () => void
  onPlanGenerate?: () => void  // Optional callback to trigger plan generation after saving
  embedded?: boolean  // When true, renders without modal wrapper for embedding in onboarding
}

const RACE_DISTANCES: Record<string, number> = {
  '5k': 3.1,
  '10k': 6.2,
  'half_marathon': 13.1,
  'marathon': 26.2,
  'ultra': 50.0,
}

export default function GoalWizard({ initialConfig, onClose, onSave, onPlanGenerate, embedded = false }: GoalWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [goalCategory, setGoalCategory] = useState<'race' | 'non_race'>(
    initialConfig?.goal_category || 'race'
  )
  const [goalType, setGoalType] = useState(initialConfig?.goal_type || 'marathon')
  const [goalDate, setGoalDate] = useState(initialConfig?.goal_date || '')
  const [goalHours, setGoalHours] = useState(
    initialConfig?.goal_time_minutes ? Math.floor(initialConfig.goal_time_minutes / 60) : 3
  )
  const [goalMinutes, setGoalMinutes] = useState(
    initialConfig?.goal_time_minutes ? initialConfig.goal_time_minutes % 60 : 45
  )
  const [currentMileage, setCurrentMileage] = useState(initialConfig?.current_weekly_mileage || 35)
  const [targetMileage, setTargetMileage] = useState(initialConfig?.target_weekly_mileage || 50)
  const [experienceLevel, setExperienceLevel] = useState(initialConfig?.experience_level || 'intermediate')
  const [longRunDay, setLongRunDay] = useState(initialConfig?.preferred_long_run_day || 'sunday')
  const [emailDay, setEmailDay] = useState(initialConfig?.email_day || 'sunday')
  const [emailEnabled, setEmailEnabled] = useState(initialConfig?.email_enabled ?? true)

  const supabase = createBrowserClient()

  // Calculate pace
  const calculatePace = () => {
    const totalMinutes = goalHours * 60 + goalMinutes
    const distance = RACE_DISTANCES[goalType] || 26.2
    const pacePerMile = totalMinutes / distance
    const mins = Math.floor(pacePerMile)
    const secs = Math.round((pacePerMile - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = async () => {
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const config = {
        user_id: user.id,
        goal_category: goalCategory,
        goal_type: goalType,
        goal_date: goalCategory === 'race' ? goalDate : null,
        goal_time_minutes: goalCategory === 'race' ? goalHours * 60 + goalMinutes : null,
        goal_target: goalCategory === 'race'
          ? `${goalHours}:${goalMinutes.toString().padStart(2, '0')} ${goalType.replace(/_/g, ' ')}`
          : goalType.replace(/_/g, ' '),
        target_weekly_mileage: goalType === 'build_mileage' ? targetMileage : null,
        current_weekly_mileage: currentMileage,
        experience_level: experienceLevel,
        preferred_long_run_day: longRunDay,
        email_day: emailDay,
        email_enabled: emailEnabled,
      }

      const { error } = await (supabase as any)
        .from('training_configs')
        .upsert(config, { onConflict: 'user_id' })

      if (error) throw error

      // Trigger plan generation if callback is provided
      if (onPlanGenerate) {
        setGeneratingPlan(true)
        try {
          await onPlanGenerate()
        } catch {
          // Plan generation errors are handled by the parent
        }
        setGeneratingPlan(false)
      }

      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  // Set default goal date
  if (!goalDate) {
    const future = new Date()
    future.setDate(future.getDate() + 84) // 12 weeks
    setGoalDate(future.toISOString().split('T')[0])
  }

  // Content that's shared between modal and embedded modes
  const wizardContent = (
    <>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Step 1: Goal Category */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">What's your goal?</h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setGoalCategory('race')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                goalCategory === 'race'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">🏁</div>
              <div className="font-semibold">Race Goal</div>
              <div className="text-sm text-gray-500">Training for a specific race</div>
            </button>

            <button
              onClick={() => setGoalCategory('non_race')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                goalCategory === 'non_race'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">📈</div>
              <div className="font-semibold">Fitness Goal</div>
              <div className="text-sm text-gray-500">Build mileage or maintain</div>
            </button>
          </div>

          {goalCategory === 'race' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Race Distance</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="input-field"
                >
                  <option value="5k">5K (3.1 miles)</option>
                  <option value="10k">10K (6.2 miles)</option>
                  <option value="half_marathon">Half Marathon (13.1 miles)</option>
                  <option value="marathon">Marathon (26.2 miles)</option>
                  <option value="ultra">Ultra Marathon (50+ miles)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Target Finish Time</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={goalHours}
                    onChange={(e) => setGoalHours(parseInt(e.target.value) || 0)}
                    className="input-field w-20 text-center"
                  />
                  <span className="text-gray-500">:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={goalMinutes}
                    onChange={(e) => setGoalMinutes(parseInt(e.target.value) || 0)}
                    className="input-field w-20 text-center"
                  />
                </div>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                  Target pace: <strong className="text-primary">{calculatePace()}/mile</strong>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Race Date</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
            </>
          )}

          {goalCategory === 'non_race' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Type</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className="input-field"
                >
                  <option value="build_mileage">Build Weekly Mileage</option>
                  <option value="maintain_fitness">Maintain Current Fitness</option>
                  <option value="base_building">Base Building</option>
                  <option value="return_from_injury">Return from Injury</option>
                </select>
              </div>

              {goalType === 'build_mileage' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Weekly Mileage
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="150"
                    value={targetMileage}
                    onChange={(e) => setTargetMileage(parseInt(e.target.value) || 50)}
                    className="input-field"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Step 2: Training Profile */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Training Profile</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Weekly Mileage
            </label>
            <input
              type="number"
              min="5"
              max="150"
              value={currentMileage}
              onChange={(e) => setCurrentMileage(parseInt(e.target.value) || 35)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="input-field"
            >
              <option value="beginner">Beginner (less than 1 year running)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="advanced">Advanced (3+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Long Run Day
            </label>
            <select
              value={longRunDay}
              onChange={(e) => setLongRunDay(e.target.value)}
              className="input-field"
            >
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 3: Email Preferences */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Email Preferences</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Send Training Email On
            </label>
            <select
              value={emailDay}
              onChange={(e) => setEmailDay(e.target.value)}
              className="input-field"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="saturday">Saturday</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="emailEnabled"
              checked={emailEnabled}
              onChange={(e) => setEmailEnabled(e.target.checked)}
              className="w-5 h-5 rounded text-primary"
            />
            <label htmlFor="emailEnabled" className="text-gray-700">
              Enable weekly training emails
            </label>
          </div>

          {/* Summary */}
          <div className="p-4 bg-primary/5 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Goal</span>
                <span className="font-medium">
                  {goalCategory === 'race'
                    ? `${goalType.replace(/_/g, ' ')} - ${goalHours}:${goalMinutes.toString().padStart(2, '0')}`
                    : goalType.replace(/_/g, ' ')}
                </span>
              </div>
              {goalCategory === 'race' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Race Date</span>
                  <span className="font-medium">{new Date(goalDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Mileage</span>
                <span className="font-medium">{currentMileage} miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email Day</span>
                <span className="font-medium capitalize">{emailDay}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="btn-secondary">
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary">
            Next →
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading || generatingPlan}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : generatingPlan ? 'Creating Your Plan...' : 'Save Goals'}
          </button>
        )}
      </div>
    </>
  )

  // Embedded mode: render without modal wrapper
  if (embedded) {
    return (
      <div className="space-y-4">
        {wizardContent}
      </div>
    )
  }

  // Modal mode: render with full modal wrapper
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl my-8">
        <div className="gradient-primary p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Training Goals Wizard</h2>
              <p className="text-white/80 text-sm mt-1">Step {step} of 3</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {wizardContent}
        </div>
      </div>
    </div>
  )
}
