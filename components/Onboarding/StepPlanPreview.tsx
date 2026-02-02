'use client'

import { useState, useEffect } from 'react'
import type { TrainingPlan, DayPlan } from '@/lib/training/planner'

interface StepPlanPreviewProps {
  onComplete: () => void
  loading?: boolean
}

export default function StepPlanPreview({ onComplete, loading = false }: StepPlanPreviewProps) {
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [planLoading, setPlanLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlan()
  }, [])

  const loadPlan = async () => {
    try {
      setPlanLoading(true)
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.plan) {
          setPlan(data.plan)
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to generate plan')
      }
    } catch (err) {
      setError('Failed to load plan')
    } finally {
      setPlanLoading(false)
    }
  }

  // Get daily plan from plan
  const dailyPlan = plan?.daily_plan

  if (planLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Plan</h3>
        <p className="text-gray-500">Analyzing your fitness data and generating a personalized training plan...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Couldn't Generate Plan</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={loadPlan} className="btn-secondary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Celebration Header */}
      <div className="text-center animate-success">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Your Training Plan is Ready!
        </h3>
        <p className="text-gray-600">
          Here's a preview of your first week of training.
        </p>
      </div>

      {/* Week Preview */}
      {dailyPlan && dailyPlan.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">This Week</h4>
            <span className="text-sm text-gray-500">
              {plan?.week_summary?.total_miles?.toFixed(1) || '—'} miles total
            </span>
          </div>

          <div className="space-y-2">
            {dailyPlan.slice(0, 7).map((day: DayPlan, index: number) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  day.workout_type === 'rest' ? 'bg-gray-100' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    day.workout_type === 'rest' ? 'bg-gray-400' :
                    day.workout_type === 'long_run' ? 'bg-primary' :
                    day.workout_type === 'tempo' || day.workout_type === 'intervals' ? 'bg-orange-500' :
                    'bg-green-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700">
                    {day.day}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-900">
                    {day.title}
                  </span>
                  {day.distance_miles && day.workout_type !== 'rest' && (
                    <span className="text-xs text-gray-500 ml-2">
                      {day.distance_miles.toFixed(1)} mi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What's Next */}
      <div className="bg-primary/5 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3">What happens next?</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>You'll receive a weekly email with your training plan</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Your plan adapts based on your actual training data</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Access your full plan anytime from the dashboard</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onComplete}
          disabled={loading}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50"
        >
          {loading ? 'Finishing Setup...' : 'Start Training'}
        </button>
      </div>
    </div>
  )
}
