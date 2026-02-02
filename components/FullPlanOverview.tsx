'use client'

import { useState, useEffect } from 'react'
import type { WeekProjection } from '@/lib/training/planner'
import type { PlanModification } from '@/lib/database.types'

interface PlanOverviewData {
  projection: WeekProjection[]
  modifications: PlanModification[]
  summary: {
    totalWeeks: number
    currentWeek: number
    peakMileageWeek: number
    raceDate: string | null
  }
}

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  base: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  build: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  peak: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  taper: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  race_week: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  maintenance: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
}

const CONCERN_LABELS: Record<string, string> = {
  elevated_hr: 'Elevated heart rate',
  low_battery: 'Low body battery',
  poor_sleep: 'Poor sleep quality',
}

export default function FullPlanOverview() {
  const [data, setData] = useState<PlanOverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadPlanOverview()
  }, [])

  const loadPlanOverview = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/plan-overview')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load plan overview')
      }

      const planData = await response.json()
      setData(planData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan overview')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    // Don't show error for non-race goals
    if (error.includes('only available for race goals')) {
      return null
    }
    return (
      <div className="card p-6 bg-red-50 border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  if (!data || data.projection.length === 0) {
    return null
  }

  const { projection, modifications, summary } = data

  // Create a map of modifications by week start date
  const modificationMap = new Map<string, PlanModification>()
  modifications.forEach(mod => {
    modificationMap.set(mod.week_start_date, mod)
  })

  // Show only first 4 weeks when collapsed
  const visibleWeeks = expanded ? projection : projection.slice(0, 4)
  const hasMoreWeeks = projection.length > 4

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <section>
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Full Training Plan</h2>
            <p className="text-sm text-gray-500">
              {summary.totalWeeks} weeks until {summary.raceDate ? formatDate(summary.raceDate) : 'race day'}
            </p>
          </div>
          {hasMoreWeeks && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1"
            >
              {expanded ? 'Show less' : `Show all ${summary.totalWeeks} weeks`}
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Wk</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Phase</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Miles</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Long</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleWeeks.map((week) => {
                const modification = modificationMap.get(week.weekStartDate)
                const phaseStyle = PHASE_COLORS[week.phase] || PHASE_COLORS.maintenance
                const isRaceWeek = week.phase === 'race_week'
                const isPeakWeek = week.weekNumber === summary.peakMileageWeek

                return (
                  <tr
                    key={week.weekNumber}
                    className={`border-b last:border-b-0 ${
                      week.isCurrentWeek ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Week number */}
                    <td className="px-4 py-3">
                      <span className={`font-medium ${week.isCurrentWeek ? 'text-primary' : 'text-gray-900'}`}>
                        {week.weekNumber}
                        {week.isCurrentWeek && '*'}
                      </span>
                    </td>

                    {/* Phase badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${phaseStyle.bg} ${phaseStyle.text}`}>
                        {week.phase.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Projected mileage */}
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${modification ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {week.projectedMileage}
                      </span>
                      {modification && (
                        <span className="ml-1 font-medium text-amber-600">
                          {modification.adjusted_mileage}
                        </span>
                      )}
                    </td>

                    {/* Long run */}
                    <td className="px-4 py-3 text-right text-gray-600">
                      {isRaceWeek ? '--' : week.longRunMiles}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {week.isCurrentWeek && (
                        <span className="text-primary font-medium flex items-center gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                          Current Week
                        </span>
                      )}
                      {modification && !week.isCurrentWeek && (
                        <span className="text-amber-600 flex items-center gap-1 group relative">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-xs">
                            Reduced ({Math.round((1 - modification.recovery_adjustment) * 100)}%)
                          </span>
                          {/* Tooltip */}
                          <span className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                            {modification.concerns.map(c => CONCERN_LABELS[c] || c).join(', ')}
                          </span>
                        </span>
                      )}
                      {week.isCurrentWeek && modification && (
                        <span className="text-amber-600 text-xs ml-2">
                          (Adjusted)
                        </span>
                      )}
                      {isPeakWeek && !week.isCurrentWeek && !modification && (
                        <span className="text-orange-600 text-xs font-medium">
                          Peak Week
                        </span>
                      )}
                      {isRaceWeek && (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <span>🏁</span>
                          Race Day!
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Show more indicator when collapsed */}
        {!expanded && hasMoreWeeks && (
          <div className="px-6 py-3 border-t bg-gray-50/50 text-center">
            <button
              onClick={() => setExpanded(true)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              + {projection.length - 4} more weeks
            </button>
          </div>
        )}

        {/* Modifications legend */}
        {modifications.length > 0 && expanded && (
          <div className="px-6 py-4 border-t bg-amber-50">
            <div className="flex items-start gap-2 text-sm text-amber-800">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium">Plan Modifications</p>
                <p className="text-amber-700">
                  {modifications.length} week{modifications.length > 1 ? 's' : ''} had reduced mileage due to recovery metrics.
                  Your plan adjusts automatically based on your body's recovery status.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
