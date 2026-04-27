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
  // Sunday: point to tomorrow's Monday (the upcoming week the email plans for).
  // Mon–Sat: point to this week's Monday.
  const daysFromMonday = dayOfWeek === 0 ? -1 : dayOfWeek - 1
  monday.setDate(today.getDate() - daysFromMonday)

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
  totalWorkouts: number
  // Counts by type. `otherCount` covers anything we don't recognize
  // (yoga, pilates, HIIT, indoor cardio, etc.).
  runCount: number
  bikeCount: number
  walkCount: number
  hikeCount: number
  swimCount: number
  strengthCount: number
  otherCount: number
  // Volume-per-type. Miles are only meaningful for run/walk/hike;
  // minutes are the right unit for bike/swim/strength/other where
  // distance is missing or apples-to-oranges.
  runMiles: number
  walkMiles: number
  hikeMiles: number
  bikeMinutes: number
  swimMinutes: number
  strengthMinutes: number
  otherMinutes: number
  longestRun: { distance: number; day: string } | null
  totalActiveMinutes: number
  /** Average pace across runs only (formatted as M:SS). */
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

  const sumMiles = (acts: Activity[]) =>
    acts.reduce((sum, a) => sum + (a.distance_miles || 0), 0)
  const sumMinutes = (acts: Activity[]) =>
    Math.round(acts.reduce((sum, a) => sum + (a.duration_minutes || 0), 0))
  const round1 = (n: number) => Math.round(n * 10) / 10

  const runs = lastWeekActivities.filter(a => a.type === 'run')
  const bikes = lastWeekActivities.filter(a => a.type === 'bike')
  const walks = lastWeekActivities.filter(a => a.type === 'walk')
  const hikes = lastWeekActivities.filter(a => a.type === 'hike')
  const swims = lastWeekActivities.filter(a => a.type === 'swim')
  const strengths = lastWeekActivities.filter(a => a.type === 'strength')
  const others = lastWeekActivities.filter(a =>
    !['run', 'bike', 'walk', 'hike', 'swim', 'strength'].includes(a.type)
  )

  const totalActiveMinutes = sumMinutes(lastWeekActivities)

  let longestRun: { distance: number; day: string } | null = null
  if (runs.length > 0) {
    const longest = runs.reduce((max, r) => r.distance_miles > max.distance_miles ? r : max)
    const dayName = new Date(longest.date).toLocaleDateString('en-US', { weekday: 'long' })
    longestRun = { distance: longest.distance_miles, day: dayName }
  }

  let avgPace: string | null = null
  if (runs.length > 0) {
    const totalRunMiles = sumMiles(runs)
    const totalRunMinutes = runs.reduce((sum, r) => sum + (r.duration_minutes || 0), 0)
    if (totalRunMiles > 0) {
      const pacePerMile = totalRunMinutes / totalRunMiles
      const mins = Math.floor(pacePerMile)
      const secs = Math.round((pacePerMile - mins) * 60)
      avgPace = `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }

  return {
    totalWorkouts: lastWeekActivities.length,
    runCount: runs.length,
    bikeCount: bikes.length,
    walkCount: walks.length,
    hikeCount: hikes.length,
    swimCount: swims.length,
    strengthCount: strengths.length,
    otherCount: others.length,
    runMiles: round1(sumMiles(runs)),
    walkMiles: round1(sumMiles(walks)),
    hikeMiles: round1(sumMiles(hikes)),
    bikeMinutes: sumMinutes(bikes),
    swimMinutes: sumMinutes(swims),
    strengthMinutes: sumMinutes(strengths),
    otherMinutes: sumMinutes(others),
    longestRun,
    totalActiveMinutes,
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
