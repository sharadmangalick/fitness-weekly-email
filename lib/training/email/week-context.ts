/**
 * Week Context Helpers
 *
 * Date calculations, prior week recap, and plan explanation builders.
 */

import type { AnalysisResults } from '../analyzer'
import type { TrainingPlan } from '../planner'
import type { TrainingConfig } from '../../database.types'
import type { AllPlatformData, Activity } from '../../platforms/interface'
import { RACE_NAMES } from '../constants'

export function getRaceName(goalType: string, goalTarget: string | null): string {
  return goalTarget || RACE_NAMES[goalType] || 'Training'
}

export function getWeekDates(): { start: string; end: string } {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const formatEnd = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return {
    start: format(monday),
    end: formatEnd(sunday),
  }
}

/**
 * Calculate weeks until race
 */
export function calculateWeeksUntilRace(goalDate: string | null): number | null {
  if (!goalDate) return null
  const today = new Date()
  const race = new Date(goalDate)
  const diffTime = race.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.floor(diffDays / 7))
}

export interface PriorWeekRecap {
  totalMiles: number
  totalWorkouts: number
  runCount: number
  bikeCount: number
  walkCount: number
  otherCount: number
  longestRun: { distance: number; day: string } | null
  totalActiveMinutes: number
  avgPace: string | null
}

/**
 * Build prior week recap from platform data
 */
export function buildPriorWeekRecap(platformData: AllPlatformData | null): PriorWeekRecap | null {
  if (!platformData || !platformData.activities || platformData.activities.length === 0) {
    return null
  }

  const activities = platformData.activities

  // Get last 7 days of activities
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const lastWeekActivities = activities.filter(a => new Date(a.date) >= oneWeekAgo)

  if (lastWeekActivities.length === 0) {
    return null
  }

  const runs = lastWeekActivities.filter(a => a.type === 'run')
  const bikes = lastWeekActivities.filter(a => a.type === 'bike')
  const walks = lastWeekActivities.filter(a => a.type === 'walk')
  const others = lastWeekActivities.filter(a => !['run', 'bike', 'walk'].includes(a.type))

  // Calculate total miles (all activities)
  const totalMiles = lastWeekActivities.reduce((sum, a) => sum + (a.distance_miles || 0), 0)

  // Calculate total active minutes
  const totalActiveMinutes = lastWeekActivities.reduce((sum, a) => sum + (a.duration_minutes || 0), 0)

  // Find longest run
  let longestRun: { distance: number; day: string } | null = null
  if (runs.length > 0) {
    const longest = runs.reduce((max, r) => r.distance_miles > max.distance_miles ? r : max)
    const dayName = new Date(longest.date).toLocaleDateString('en-US', { weekday: 'long' })
    longestRun = { distance: longest.distance_miles, day: dayName }
  }

  // Calculate average pace for runs
  let avgPace: string | null = null
  if (runs.length > 0) {
    const totalRunMiles = runs.reduce((sum, r) => sum + (r.distance_miles || 0), 0)
    const totalRunMinutes = runs.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)
    if (totalRunMiles > 0) {
      const pacePerMile = totalRunMinutes / totalRunMiles
      const mins = Math.floor(pacePerMile)
      const secs = Math.round((pacePerMile - mins) * 60)
      avgPace = `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }

  return {
    totalMiles: Math.round(totalMiles * 10) / 10,
    totalWorkouts: lastWeekActivities.length,
    runCount: runs.length,
    bikeCount: bikes.length,
    walkCount: walks.length,
    otherCount: others.length,
    longestRun,
    totalActiveMinutes: Math.round(totalActiveMinutes),
    avgPace,
  }
}

export interface PlanExplanation {
  baseMileage: number
  intensity: 'conservative' | 'normal' | 'aggressive'
  intensityLabel: string
  recoveryStatus: 'good' | 'some_fatigue' | 'needs_recovery'
  recoveryMessage: string
  phase: string
  weeksToRace: number | null
}

/**
 * Build plan explanation based on config and analysis
 */
export function buildPlanExplanation(
  config: TrainingConfig,
  analysis: AnalysisResults,
  plan: TrainingPlan
): PlanExplanation {
  const intensity = config.intensity_preference || 'normal'
  const intensityLabels: Record<string, string> = {
    conservative: 'conservative (85% intensity)',
    normal: 'normal',
    aggressive: 'aggressive (115% intensity)',
  }

  // Determine recovery status from analysis
  let concernCount = 0
  const metrics = [analysis.resting_hr, analysis.body_battery, analysis.sleep, analysis.stress]
  for (const metric of metrics) {
    if (metric.available && metric.status === 'concern') concernCount++
  }

  let recoveryStatus: 'good' | 'some_fatigue' | 'needs_recovery'
  let recoveryMessage: string
  if (concernCount >= 2) {
    recoveryStatus = 'needs_recovery'
    recoveryMessage = 'multiple fatigue indicators - volume reduced'
  } else if (concernCount === 1) {
    recoveryStatus = 'some_fatigue'
    recoveryMessage = 'some fatigue indicators - monitoring closely'
  } else {
    recoveryStatus = 'good'
    recoveryMessage = 'good recovery this week'
  }

  return {
    baseMileage: config.current_weekly_mileage,
    intensity,
    intensityLabel: intensityLabels[intensity] || 'normal',
    recoveryStatus,
    recoveryMessage,
    phase: plan.week_summary.training_phase,
    weeksToRace: calculateWeeksUntilRace(config.goal_date),
  }
}
