'use client'

import Image from 'next/image'
import type { TrainingPlan, DayPlan } from '@/lib/training/planner'
import type { AnalysisResults } from '@/lib/training/analyzer'
import type { Insight } from '@/lib/training/adaptations'
import IntensitySelector, { type IntensityPreference } from './IntensitySelector'
import { displayDistance, distanceLabel, type DistanceUnit } from '@/lib/platforms/interface'

interface TrainingPlanViewProps {
  plan: TrainingPlan
  analysis: AnalysisResults
  generatedAt: string
  onRefresh: () => void
  refreshing?: boolean
  intensityPreference?: IntensityPreference
  onIntensityChange?: (value: IntensityPreference) => void
  platform?: 'garmin' | 'strava'
  distanceUnit?: DistanceUnit
  insights?: Insight[]
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'good':
      return 'text-green-600 bg-green-50'
    case 'concern':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-yellow-600 bg-yellow-50'
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'good':
      return 'text-green-500'
    case 'concern':
      return 'text-red-500'
    default:
      return 'text-yellow-500'
  }
}

function getWorkoutTypeColor(type: DayPlan['workout_type']): string {
  switch (type) {
    case 'rest':
      return 'bg-gray-100 text-gray-600'
    case 'easy':
      return 'bg-green-100 text-green-700'
    case 'tempo':
      return 'bg-orange-100 text-orange-700'
    case 'long_run':
      return 'bg-purple-100 text-purple-700'
    case 'intervals':
      return 'bg-red-100 text-red-700'
    case 'race':
      return 'bg-primary/10 text-primary'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function HealthMetricCard({
  label,
  value,
  detail,
  status,
}: {
  label: string
  value: string
  detail?: string
  status?: 'good' | 'normal' | 'concern'
}) {
  return (
    <div className={`p-4 rounded-xl ${status ? getStatusColor(status) : 'bg-gray-50 text-gray-700'}`}>
      <div className="text-xs uppercase tracking-wide opacity-70 mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {detail && <div className="text-xs mt-1 opacity-80">{detail}</div>}
    </div>
  )
}

function DayCard({ day, unit = 'mi' }: { day: DayPlan; unit?: DistanceUnit }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-14 shrink-0 text-center">
        <div className="text-xs uppercase text-gray-500">{day.day.slice(0, 3)}</div>
        <div className={`text-xs mt-1 px-2 py-0.5 rounded-full ${getWorkoutTypeColor(day.workout_type)}`}>
          {day.workout_type.replace('_', ' ')}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900">{day.title}</div>
        {day.distance_miles && (
          <div className="text-sm text-primary font-medium mt-0.5">
            {displayDistance(day.distance_miles, unit)} {distanceLabel(unit)}
          </div>
        )}
        <div className="text-sm text-gray-600 mt-1">{day.description}</div>
        {day.notes && (
          <div className="text-xs text-purple-600 italic mt-2">{day.notes}</div>
        )}
      </div>
    </div>
  )
}

export default function TrainingPlanView({
  plan,
  analysis,
  generatedAt,
  onRefresh,
  refreshing,
  intensityPreference = 'normal',
  onIntensityChange,
  platform,
  distanceUnit = 'mi',
  insights,
}: TrainingPlanViewProps) {
  const generatedDate = new Date(generatedAt)
  const daysSinceGenerated = Math.floor((Date.now() - generatedDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">Your Training Plan</h2>
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              {plan.week_summary.training_phase}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            This is what your weekly email will contain
          </p>
        </div>
        <div className="text-right">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            {refreshing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Refreshing...
              </span>
            ) : (
              'Refresh Plan'
            )}
          </button>
          <div className="text-xs text-gray-400 mt-1">
            Generated {daysSinceGenerated === 0 ? 'today' : `${daysSinceGenerated} day${daysSinceGenerated !== 1 ? 's' : ''} ago`}
          </div>
        </div>
      </div>

      {/* Week Summary */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center sm:border-r sm:pr-6 sm:border-gray-200">
            <div className="text-4xl font-bold text-primary">{displayDistance(plan.week_summary.total_miles, distanceUnit, 0)}</div>
            <div className="text-sm text-gray-500">{distanceLabel(distanceUnit)} this week</div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="font-semibold text-gray-900">{plan.week_summary.focus}</div>
            <div className="text-sm text-gray-500 mt-1">
              Goal: {plan.week_summary.goal_type.replace(/_/g, ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Plan Intensity */}
      {onIntensityChange && (
        <IntensitySelector
          value={intensityPreference}
          onChange={onIntensityChange}
          disabled={refreshing}
        />
      )}

      {/* Health Snapshot */}
      {(() => {
        const hasAnyMetric = analysis.resting_hr.available || analysis.body_battery.available || analysis.sleep.available || analysis.stress.available
        if (hasAnyMetric) {
          return (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Health Snapshot</h3>
                {platform === 'garmin' && (
                  <div className="flex flex-col items-end gap-0.5">
                    <Image src="/garmin-tag-black.png" alt="Garmin" width={60} height={16} className="h-3.5 w-auto opacity-60" />
                    <span className="text-[10px] text-gray-400">Data provided by Garmin</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analysis.resting_hr.available && (
                  <HealthMetricCard
                    label="Resting HR"
                    value={`${analysis.resting_hr.current} bpm`}
                    detail={platform === 'strava'
                      ? '(estimated from activities)'
                      : analysis.resting_hr.change
                        ? `${analysis.resting_hr.change > 0 ? '+' : ''}${analysis.resting_hr.change} from baseline`
                        : undefined}
                    status={analysis.resting_hr.status}
                  />
                )}
                {analysis.body_battery.available && (
                  <HealthMetricCard
                    label="Body Battery"
                    value={`${analysis.body_battery.current_wake}`}
                    detail={`${(analysis.body_battery.trend || '').charAt(0).toUpperCase()}${(analysis.body_battery.trend || '').slice(1)}`}
                    status={analysis.body_battery.status}
                  />
                )}
                {analysis.sleep.available && (
                  <HealthMetricCard
                    label="Sleep"
                    value={`${analysis.sleep.avg_hours} hrs`}
                    detail={`${analysis.sleep.under_6h_pct}% nights under 6h`}
                    status={analysis.sleep.status}
                  />
                )}
                {analysis.stress.available && (
                  <HealthMetricCard
                    label="Stress"
                    value={`${analysis.stress.avg}`}
                    detail={`${analysis.stress.high_stress_pct}% high stress days`}
                    status={analysis.stress.status}
                  />
                )}
              </div>
            </div>
          )
        }
        // Empty state: no health metrics available
        if (platform === 'strava') {
          return (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Snapshot</h3>
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
                <p>Strava provides activity data but not daily health metrics like resting heart rate, sleep, or body battery. Your plan adapts based on your training patterns instead.</p>
                <p className="mt-2 text-blue-600">Connect a Garmin device for full health-based personalization.</p>
              </div>
            </div>
          )
        }
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Snapshot</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              Your health data is syncing. Metrics typically appear within 24-48 hours of wearing your device.
            </div>
          </div>
        )
      })()}

      {/* This Week's Adjustments */}
      {insights && insights.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week&apos;s Adjustments</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const colorMap = {
                warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
                info: 'bg-blue-50 border-blue-400 text-blue-800',
                positive: 'bg-green-50 border-green-400 text-green-800',
              }
              const colors = colorMap[insight.severity] || colorMap.info
              return (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${colors}`}>
                  <p className="text-sm">{insight.message}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weekly Schedule */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week's Schedule</h3>
        <div className="space-y-3">
          {plan.daily_plan.map((day) => (
            <DayCard key={day.day} day={day} unit={distanceUnit} />
          ))}
        </div>
      </div>

      {/* Coaching Notes */}
      {plan.coaching_notes.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Coach&apos;s Notes</h3>
          {platform === 'garmin' && (
            <p className="text-xs text-gray-400 mb-3">Insights derived in part from Garmin device-sourced data.</p>
          )}
          <div className="space-y-3">
            {plan.coaching_notes.map((note, index) => (
              <div key={index} className="flex gap-3 pl-4 border-l-3 border-primary">
                <p className="text-gray-700">{note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Recommendations */}
      {plan.recovery_recommendations.length > 0 && (
        <div className="card p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">Recovery Focus</h3>
          <ul className="space-y-2">
            {plan.recovery_recommendations.map((rec, index) => (
              <li key={index} className="flex gap-2 text-yellow-800">
                <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
