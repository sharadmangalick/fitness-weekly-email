/**
 * Training Plan Generator
 *
 * Orchestrates weekly training plan generation based on user goals and health metrics.
 * Delegates to specialized modules for plan types, coaching, and run variation.
 */

import type { AnalysisResults } from './analyzer'
import type { TrainingConfig } from '../database.types'
import type { DistanceUnit } from '../platforms/interface'
import { paceLabel } from '../platforms/interface'
import type { AdaptationResult } from './adaptations'
import { applyStructureChanges, applyLongRunAdjustment } from './adaptations'
import { calculateRunCountVariation } from './run-variation'
import { generateCoachingNotes, generateRecoveryRecommendations } from './coaching'
import { generateRecoveryPlan } from './plans/recovery'
import { generateTaperPlan } from './plans/taper'
import { generateRaceWeekPlan } from './plans/race-week'
import { generateFrequencyAwarePlan } from './plans/frequency-aware'

// Race distance mapping
const RACE_DISTANCES: Record<string, number> = {
  '5k': 3.1,
  '10k': 6.2,
  'half_marathon': 13.1,
  'marathon': 26.2,
}

// Phase multipliers for different training phases
const PHASE_MULTIPLIERS: Record<string, number> = {
  base: 0.85,
  build: 1.0,
  peak: 1.1,
  taper: 0.6,
  race_week: 0.3,
  recovery: 0.75,
}

// Intensity multipliers for user preference
const INTENSITY_MULTIPLIERS: Record<string, number> = {
  conservative: 0.85,
  normal: 1.0,
  aggressive: 1.15,
}

// Long run percentage by phase
const LONG_RUN_PCT: Record<string, number> = {
  base: 0.28,
  build: 0.30,
  peak: 0.32,
  taper: 0.25,
  race_week: 0.15,
  recovery: 0.25,
}

export interface WeekProjection {
  weekNumber: number
  weekStartDate: string
  weeksUntilRace: number
  phase: string
  projectedMileage: number
  longRunMiles: number
  isCurrentWeek: boolean
}

export interface DayPlan {
  day: string
  workout_type: 'rest' | 'easy' | 'tempo' | 'long_run' | 'intervals' | 'race'
  title: string
  distance_miles: number | null
  description: string
  notes: string | null
}

export interface TrainingPlan {
  week_summary: {
    total_miles: number
    training_phase: string
    goal_type: string
    focus: string
  }
  daily_plan: DayPlan[]
  coaching_notes: string[]
  recovery_recommendations: string[]
}

/**
 * Determine training phase based on weeks until race
 * @param taperWeeks configurable taper length (1-3 weeks, default 3)
 */
export function getTrainingPhase(weeksUntilRace: number | null, taperWeeks: number = 3): string {
  if (weeksUntilRace === null) return 'maintenance'
  if (weeksUntilRace > 12) return 'base'
  if (weeksUntilRace > 3 + taperWeeks) return 'build'
  if (weeksUntilRace > taperWeeks) return 'peak'
  if (weeksUntilRace > 0) return 'taper'
  return 'race_week'
}

/**
 * Calculate weeks until race
 */
function calculateWeeksUntilRace(goalDate: string | null): number | null {
  if (!goalDate) return null
  const today = new Date()
  const race = new Date(goalDate)
  const diffTime = race.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.floor(diffDays / 7))
}

/**
 * Calculate target pace from goal time and distance
 */
function getTargetPace(goalTimeMinutes: number | null, goalType: string, customDistance: number | null): string {
  if (!goalTimeMinutes) return '9:00'

  const distance = (goalType === 'custom' || goalType === 'ultra') && customDistance
    ? customDistance
    : RACE_DISTANCES[goalType] || 26.2

  const pacePerMile = goalTimeMinutes / distance
  const mins = Math.floor(pacePerMile)
  const secs = Math.round((pacePerMile - mins) * 60)

  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate recovery adjustment based on analysis results
 * Includes RPE analysis when available (backwards compatible)
 */
export function calculateRecoveryAdjustment(analysis: AnalysisResults): number {
  let concerns = 0

  // Existing concerns (unchanged for backwards compatibility)
  if (analysis.resting_hr.available && analysis.resting_hr.status === 'concern') concerns++
  if (analysis.body_battery.available && analysis.body_battery.status === 'concern') concerns++
  if (analysis.sleep.available && analysis.sleep.status === 'concern') concerns++

  // RPE-based concerns (only if RPE data exists)
  if (analysis.rpe?.available) {
    if (analysis.rpe.trend === 'rising') concerns++
    if ((analysis.rpe.fatigue_indicators ?? 0) >= 2) concerns++
  }

  if (concerns >= 4) return 0.75
  if (concerns >= 3) return 0.80
  if (concerns >= 2) return 0.85
  if (concerns === 1) return 0.90
  return 1.0
}

/**
 * Generate daily training plan — dispatches to specialized generators
 */
function generateDailyPlan(
  weeklyMiles: number,
  longRunMiles: number,
  longRunDay: string,
  phase: string,
  targetPace: string,
  goalType: string,
  raceDistance: number,
  unit: DistanceUnit = 'mi',
  userRaceName?: string | null,
  runsPerWeek?: number | null
): DayPlan[] {
  // Parse target pace (per mile)
  const [paceMins, paceSecs] = targetPace.split(':').map(Number)
  const pacePerMileMinutes = paceMins + paceSecs / 60

  // Calculate pace zones in the user's preferred unit
  const unitLabel = paceLabel(unit)
  const convertPace = (paceMinPerMile: number): string => {
    const paceMinPerUnit = unit === 'km' ? paceMinPerMile / 1.60934 : paceMinPerMile
    const m = Math.floor(paceMinPerUnit)
    const s = Math.round((paceMinPerUnit - m) * 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const easyPace = `${convertPace(pacePerMileMinutes + 1)}-${convertPace(pacePerMileMinutes + 2)}`
  const tempoPace = `${convertPace(pacePerMileMinutes)}-${convertPace(pacePerMileMinutes + 0.25)}`
  const displayTargetPace = convertPace(pacePerMileMinutes)

  // Recovery phase: easy runs only, extra rest days, no speed work
  if (phase === 'recovery') {
    return generateRecoveryPlan(weeklyMiles, longRunMiles, longRunDay, easyPace, unitLabel)
  }

  // Taper and race-week use specialized generators (check before frequency-aware)
  if (phase === 'race_week') {
    return generateRaceWeekPlan(goalType, raceDistance, easyPace, unitLabel, userRaceName)
  }

  const remainingMiles = weeklyMiles - longRunMiles

  if (phase === 'taper') {
    return generateTaperPlan(remainingMiles, longRunMiles, longRunDay, easyPace, tempoPace, displayTargetPace, unitLabel)
  }

  // Frequency-aware plan generation (effectiveRunsPerWeek is always 2-7)
  return generateFrequencyAwarePlan(
    weeklyMiles, longRunMiles, longRunDay, phase, easyPace, tempoPace,
    displayTargetPace, unitLabel, runsPerWeek || 4, unit
  )
}

/**
 * Generate training plan from user config and analysis
 */
export function generateTrainingPlan(
  config: TrainingConfig,
  analysis: AnalysisResults,
  distanceUnit: DistanceUnit = 'mi',
  adaptations?: AdaptationResult
): TrainingPlan {
  const weeksToRace = calculateWeeksUntilRace(config.goal_date)
  const taperWeeks = config.taper_weeks ?? 3
  const phase = config.goal_category === 'race'
    ? getTrainingPhase(weeksToRace, taperWeeks)
    : config.goal_type === 'maintain_fitness' ? 'maintenance'
    : config.goal_type === 'get_faster' ? 'peak'
    : config.goal_type === 'return_from_injury' ? 'recovery'
    : 'build'

  const baseMileage = config.current_weekly_mileage
  // Use adaptations multiplier if provided, otherwise fall back to legacy calculation
  const recoveryAdjustment = adaptations
    ? adaptations.mileageMultiplier
    : calculateRecoveryAdjustment(analysis)
  const phaseMultiplier = PHASE_MULTIPLIERS[phase] || 1.0
  const intensityMultiplier = INTENSITY_MULTIPLIERS[config.intensity_preference || 'normal'] || 1.0
  const longRunPct = LONG_RUN_PCT[phase] || 0.28

  let weeklyMiles = Math.round(baseMileage * phaseMultiplier * intensityMultiplier)
  if (recoveryAdjustment < 1.0) {
    weeklyMiles = Math.round(weeklyMiles * recoveryAdjustment)
  }

  // Safety cap for injury recovery: never exceed stated current mileage
  if (phase === 'recovery') {
    weeklyMiles = Math.min(weeklyMiles, baseMileage)
  }

  // Dynamic run count variation
  const baselineRuns = config.runs_per_week ?? 4
  const runVariation = calculateRunCountVariation(baselineRuns, phase, weeksToRace, recoveryAdjustment)
  const effectiveRunsPerWeek = runVariation.adjustedRunsPerWeek

  // Adjust weekly miles ±10% to match the run count change
  if (runVariation.delta !== 0) {
    weeklyMiles = Math.round(weeklyMiles * (1 + runVariation.delta * 0.1))
  }

  let longRunMiles = Math.round(weeklyMiles * longRunPct)

  // Cap long run based on goal type
  const maxLongRun: Record<string, number> = {
    '5k': 10, '10k': 12, 'half_marathon': 16, 'marathon': 22,
  }
  // Ultra scales with race distance: cap at ~65% of race distance
  const ultraDist = config.goal_type === 'ultra' && config.custom_distance_miles
    ? config.custom_distance_miles : 0
  const longRunCap = config.goal_type === 'ultra' && ultraDist > 26.2
    ? Math.min(Math.round(ultraDist * 0.65), 35)
    : maxLongRun[config.goal_type] || 20
  longRunMiles = Math.min(longRunMiles, longRunCap)
  longRunMiles = Math.max(longRunMiles, 4)

  // Apply long run adjustment from adaptations
  if (adaptations?.longRunAdjustment) {
    longRunMiles = applyLongRunAdjustment(longRunMiles, adaptations.longRunAdjustment)
    longRunMiles = Math.max(longRunMiles, 3) // safety floor
  }

  const targetPace = getTargetPace(config.goal_time_minutes, config.goal_type, config.custom_distance_miles)
  const raceDistance = (config.goal_type === 'custom' || config.goal_type === 'ultra') && config.custom_distance_miles
    ? config.custom_distance_miles
    : RACE_DISTANCES[config.goal_type] || 26.2

  let dailyPlan = generateDailyPlan(
    weeklyMiles,
    longRunMiles,
    config.preferred_long_run_day,
    phase,
    targetPace,
    config.goal_type,
    raceDistance,
    distanceUnit,
    config.race_name,
    effectiveRunsPerWeek
  )

  // Apply structure changes from adaptations
  if (adaptations && adaptations.structureChanges.length > 0) {
    const [paceMins, paceSecs] = targetPace.split(':').map(Number)
    const pacePerMileMinutes = paceMins + paceSecs / 60
    const unitLabel = paceLabel(distanceUnit)
    const convertPace = (paceMinPerMile: number): string => {
      const paceMinPerUnit = distanceUnit === 'km' ? paceMinPerMile / 1.60934 : paceMinPerMile
      const m = Math.floor(paceMinPerUnit)
      const s = Math.round((paceMinPerUnit - m) * 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    }
    const easyPace = `${convertPace(pacePerMileMinutes + 1)}-${convertPace(pacePerMileMinutes + 2)}`
    dailyPlan = applyStructureChanges(dailyPlan, adaptations.structureChanges, easyPace, unitLabel)
  }

  const totalMiles = dailyPlan.reduce((sum, day) => sum + (day.distance_miles || 0), 0)

  const coachingNotes = generateCoachingNotes(phase, weeksToRace, config.goal_type, recoveryAdjustment, config.race_name, effectiveRunsPerWeek)
  const recoveryRecommendations = generateRecoveryRecommendations(analysis, recoveryAdjustment)

  // Splice run count variation note right after the phase intro
  if (runVariation.delta !== 0 && runVariation.reason) {
    coachingNotes.splice(1, 0, runVariation.reason)
  }

  // Merge adaptation insights into coaching notes
  if (adaptations && adaptations.insights.length > 0) {
    const adaptationNotes = adaptations.insights
      .filter(i => i.severity === 'warning' || i.severity === 'positive')
      .map(i => i.message)
    coachingNotes.push(...adaptationNotes)
  }

  const raceNames: Record<string, string> = {
    '5k': '5K', '10k': '10K', 'half_marathon': 'Half Marathon',
    'marathon': 'Marathon', 'ultra': 'Ultra', 'build_mileage': 'Mileage Building',
    'get_faster': 'Speed Training', 'maintain_fitness': 'Fitness Maintenance', 'base_building': 'Base Building',
    'return_from_injury': 'Injury Recovery',
  }
  const displayRaceName = config.race_name || raceNames[config.goal_type] || 'race'

  let focus = ''
  if (phase === 'recovery') {
    focus = 'Injury recovery — conservative plan with easy runs only'
  } else if (recoveryAdjustment < 0.85) {
    focus = 'Recovery focus - reduced volume due to fatigue indicators'
  } else if (phase === 'base') {
    focus = 'Building aerobic foundation with easy miles'
  } else if (phase === 'build') {
    focus = 'Increasing volume and introducing quality workouts'
  } else if (phase === 'peak') {
    focus = `Peak training - highest volume week, ${weeksToRace} weeks to ${displayRaceName}`
  } else if (phase === 'taper') {
    focus = `Tapering - maintaining fitness while recovering for ${displayRaceName}`
  } else if (phase === 'race_week') {
    focus = `${displayRaceName} week - stay fresh and execute your race plan!`
  } else if (config.goal_type === 'get_faster') {
    focus = 'Speed-focused training with tempo and quality workouts'
  } else {
    focus = raceNames[config.goal_type] || 'General training'
  }

  return {
    week_summary: {
      total_miles: Math.round(totalMiles),
      training_phase: phase,
      goal_type: config.goal_type,
      focus,
    },
    daily_plan: dailyPlan,
    coaching_notes: coachingNotes,
    recovery_recommendations: recoveryRecommendations,
  }
}

/**
 * Get the Monday of the current week
 */
function getWeekStartDate(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when Sunday
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Generate full plan projection from now until race date
 * Uses deterministic calculation based on training config
 */
export function generatePlanProjection(config: TrainingConfig): WeekProjection[] {
  if (!config.goal_date) {
    return []
  }

  const raceDate = new Date(config.goal_date)
  const today = new Date()
  const currentWeekStart = getWeekStartDate(today)

  // Calculate total weeks from now until race
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const totalWeeks = Math.ceil((raceDate.getTime() - currentWeekStart.getTime()) / msPerWeek)

  if (totalWeeks <= 0) {
    return []
  }

  const projections: WeekProjection[] = []
  const baseMileage = config.current_weekly_mileage
  const intensityMultiplier = INTENSITY_MULTIPLIERS[config.intensity_preference || 'normal'] || 1.0

  const taperWeeks = config.taper_weeks ?? 3

  for (let i = 0; i < totalWeeks; i++) {
    const weekStart = new Date(currentWeekStart)
    weekStart.setDate(weekStart.getDate() + (i * 7))

    const weeksUntilRace = totalWeeks - i - 1
    const phase = getTrainingPhase(weeksUntilRace, taperWeeks)
    const phaseMultiplier = PHASE_MULTIPLIERS[phase] || 1.0
    const longRunPct = LONG_RUN_PCT[phase] || 0.28

    const projectedMileage = Math.round(baseMileage * phaseMultiplier * intensityMultiplier)
    let longRunMiles = Math.round(projectedMileage * longRunPct)

    // Cap long run based on goal type
    const maxLongRun: Record<string, number> = {
      '5k': 10, '10k': 12, 'half_marathon': 16, 'marathon': 22,
    }
    const ultraDist = config.goal_type === 'ultra' && config.custom_distance_miles
      ? config.custom_distance_miles : 0
    const longRunCap = config.goal_type === 'ultra' && ultraDist > 26.2
      ? Math.min(Math.round(ultraDist * 0.65), 35)
      : maxLongRun[config.goal_type] || 20
    longRunMiles = Math.min(longRunMiles, longRunCap)
    longRunMiles = Math.max(longRunMiles, 4)

    // Race week doesn't have a traditional long run
    if (phase === 'race_week') {
      longRunMiles = 0
    }

    projections.push({
      weekNumber: i + 1,
      weekStartDate: weekStart.toISOString().split('T')[0],
      weeksUntilRace,
      phase,
      projectedMileage,
      longRunMiles,
      isCurrentWeek: i === 0,
    })
  }

  return projections
}

/**
 * Calculate recovery concerns from analysis results
 */
export function getRecoveryConcerns(analysis: AnalysisResults): string[] {
  const concerns: string[] = []

  if (analysis.resting_hr.available && analysis.resting_hr.status === 'concern') {
    concerns.push('elevated_hr')
  }
  if (analysis.body_battery.available && analysis.body_battery.status === 'concern') {
    concerns.push('low_battery')
  }
  if (analysis.sleep.available && analysis.sleep.status === 'concern') {
    concerns.push('poor_sleep')
  }

  // RPE-based concerns (only if RPE data available)
  if (analysis.rpe?.available) {
    if (analysis.rpe.trend === 'rising') {
      concerns.push('rising_rpe')
    }
    if ((analysis.rpe.fatigue_indicators ?? 0) >= 2) {
      concerns.push('rpe_fatigue')
    }
  }

  return concerns
}
