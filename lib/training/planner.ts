/**
 * Training Plan Generator
 *
 * Generates weekly training plans based on user goals and health metrics.
 * This is a TypeScript port of the Python training_plan_generator.py
 */

import type { AnalysisResults } from './analyzer'
import type { TrainingConfig } from '../database.types'
import type { DistanceUnit } from '../platforms/interface'
import { displayDistance, distanceLabelShort, paceLabel } from '../platforms/interface'
import type { AdaptationResult } from './adaptations'
import { applyStructureChanges, applyLongRunAdjustment } from './adaptations'

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

// Run count variation cycles by phase (4-week repeating pattern)
const RUN_COUNT_CYCLES: Record<string, number[]> = {
  base: [0, 0, 1, 0],
  build: [0, 1, 0, 1],
  peak: [1, 0, 1, 0],
  maintenance: [0, 1, 0, -1],
}

interface RunCountVariation {
  adjustedRunsPerWeek: number
  delta: number
  reason: string
}

/**
 * Calculate dynamic run count variation based on training phase and week cycle.
 * Returns adjusted run count, delta, and a coaching reason.
 */
function calculateRunCountVariation(
  baselineRuns: number,
  phase: string,
  weeksToRace: number | null,
  recoveryAdjustment: number
): RunCountVariation {
  // Determine week index: weeksToRace for race goals, weeks-since-epoch for non-race
  const weekIndex = weeksToRace !== null
    ? weeksToRace
    : Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))

  let delta = 0

  // Fixed phases always use a set delta
  if (phase === 'taper') {
    delta = -1
  } else if (phase === 'recovery') {
    delta = -1
  } else if (phase === 'race_week') {
    delta = 0
  } else {
    // Use the 4-week cycle for the phase
    const cycle = RUN_COUNT_CYCLES[phase] || [0, 0, 0, 0]
    delta = cycle[weekIndex % cycle.length]
  }

  // Fatigue override: force -1 when recovery is poor
  if (recoveryAdjustment < 0.85 && delta >= 0) {
    delta = -1
  }

  // Guardrails for low-frequency runners (can't go below 2)
  if (baselineRuns <= 3 && delta < 0) {
    delta = 0
  }

  // Guardrails for high-frequency runners (can't go above 7)
  if (baselineRuns >= 6 && delta > 0) {
    delta = 0
  }

  const adjustedRunsPerWeek = Math.min(7, Math.max(2, baselineRuns + delta))

  // Generate coaching reason
  const reason = getVariationReason(delta, phase, adjustedRunsPerWeek, recoveryAdjustment)

  return { adjustedRunsPerWeek, delta, reason }
}

/**
 * Get a coaching note explaining why the run count changed this week.
 */
function getVariationReason(
  delta: number,
  phase: string,
  adjustedRuns: number,
  recoveryAdjustment: number
): string {
  if (delta === 0) return ''

  if (delta > 0) {
    switch (phase) {
      case 'base':
        return 'This week includes an extra short, easy run to give your aerobic engine more time on feet.'
      case 'build':
        return `We added a ${getOrdinal(adjustedRuns)} run this week — short and easy — to build your aerobic base during the build phase.`
      case 'peak':
        return 'An extra easy run this week helps maintain your fitness peak without adding hard effort.'
      case 'maintenance':
        return 'A bonus easy run this week adds a little extra aerobic stimulus.'
      default:
        return 'An extra easy run this week for additional aerobic development.'
    }
  }

  // delta < 0
  if (recoveryAdjustment < 0.85) {
    return 'Your recovery metrics suggest extra rest this week — one fewer run to help you bounce back.'
  }
  switch (phase) {
    case 'taper':
      return 'Taper week — one fewer run to keep legs fresh for race day.'
    case 'recovery':
      return 'Recovery phase — fewer runs to let your body heal and rebuild.'
    case 'maintenance':
      return 'This is a lighter week to let your body consolidate recent training gains.'
    default:
      return 'This is a lighter week to let your body consolidate recent training gains.'
  }
}

function getOrdinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' }
  const mod = n % 10
  return `${n}${(mod >= 1 && mod <= 3 && n !== 11 && n !== 12 && n !== 13) ? suffixes[mod] : 'th'}`
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
function getTrainingPhase(weeksUntilRace: number | null, taperWeeks: number = 3): string {
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
 * Generate daily training plan
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
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const longRunIdx = longRunDay === 'saturday' ? 5 : 6

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

  // If user specified run frequency, use frequency-aware plan generation
  if (runsPerWeek && runsPerWeek >= 2 && runsPerWeek <= 7) {
    return generateFrequencyAwarePlan(
      weeklyMiles, longRunMiles, longRunDay, phase, easyPace, tempoPace,
      displayTargetPace, unitLabel, runsPerWeek, unit
    )
  }

  const remainingMiles = weeklyMiles - longRunMiles
  const includeTempo = phase === 'build' || phase === 'peak'

  let tempoMiles = 0
  let easyMiles = 0

  if (includeTempo) {
    tempoMiles = Math.min(Math.max(Math.round(remainingMiles * 0.25), 5), 7)
    easyMiles = Math.max(Math.round((remainingMiles - tempoMiles) / 3), 4)
  } else {
    easyMiles = Math.max(Math.round(remainingMiles / 3), 4)
  }

  if (phase === 'race_week') {
    return generateRaceWeekPlan(goalType, raceDistance, easyPace, unitLabel, userRaceName)
  }

  if (phase === 'taper') {
    return generateTaperPlan(remainingMiles, longRunMiles, longRunDay, easyPace, tempoPace, displayTargetPace, unitLabel)
  }

  const plan: DayPlan[] = []

  for (let i = 0; i < 7; i++) {
    const day = days[i]

    if (i === longRunIdx) {
      plan.push({
        day,
        workout_type: 'long_run',
        title: 'Long Run',
        distance_miles: longRunMiles,
        description: `Start easy at ${easyPace}${unitLabel}, then settle into ${displayTargetPace}${unitLabel} for the middle portion. Practice race-day nutrition.`,
        notes: 'Key workout #1 - stay relaxed and focus on time on feet.',
      })
    } else if (i === 0) {
      plan.push({
        day,
        workout_type: 'rest',
        title: 'Rest Day',
        distance_miles: null,
        description: 'Complete rest or light stretching/yoga. Let your body recover from the long run.',
        notes: 'Recovery is when fitness gains happen.',
      })
    } else if (i === 1) {
      plan.push({
        day,
        workout_type: 'easy',
        title: 'Easy Run',
        distance_miles: easyMiles,
        description: `Easy pace at ${easyPace}${unitLabel}. Keep heart rate in Zone 2.`,
        notes: null,
      })
    } else if (i === 2) {
      if (includeTempo) {
        const warmCoolDist = unit === 'km' ? '1.6 km' : '1 mile'
        const tempoCoreDist = unit === 'km' ? displayDistance(tempoMiles - 2, unit, 0) + ' km' : `${tempoMiles - 2} miles`
        plan.push({
          day,
          workout_type: 'tempo',
          title: 'Tempo Run',
          distance_miles: tempoMiles,
          description: `${warmCoolDist} warm-up, ${tempoCoreDist} at ${tempoPace}${unitLabel}, ${warmCoolDist} cool-down.`,
          notes: 'Key workout #2 - comfortably hard effort.',
        })
      } else {
        plan.push({
          day,
          workout_type: 'rest',
          title: 'Rest Day',
          distance_miles: null,
          description: 'Rest or cross-training (swimming, cycling, yoga).',
          notes: 'Active recovery keeps you fresh.',
        })
      }
    } else if (i === 3) {
      plan.push({
        day,
        workout_type: 'rest',
        title: 'Rest / Cross-Train',
        distance_miles: null,
        description: 'Rest day or optional cross-training. Good day for strength work or yoga.',
        notes: 'Quality over quantity - rest makes you faster.',
      })
    } else if (i === 4) {
      const easyDisplay = `${displayDistance(easyMiles, unit, 0)} ${distanceLabelShort(unit)}`
      plan.push({
        day,
        workout_type: 'easy',
        title: 'Easy Run + Strides',
        distance_miles: easyMiles,
        description: `Easy ${easyDisplay} at ${easyPace}${unitLabel}, then 4x100m strides with full recovery.`,
        notes: 'Strides keep your legs feeling snappy.',
      })
    } else if (i === 5 && longRunDay === 'sunday') {
      plan.push({
        day,
        workout_type: 'easy',
        title: 'Pre-Long Run Shakeout',
        distance_miles: Math.round(easyMiles * 0.6),
        description: `Short easy run at ${easyPace}${unitLabel}. Just loosening up for tomorrow.`,
        notes: 'Keep it short and easy. Prepare gear for tomorrow.',
      })
    } else if (i === 6 && longRunDay === 'saturday') {
      plan.push({
        day,
        workout_type: 'rest',
        title: 'Rest Day',
        distance_miles: null,
        description: 'Complete rest. Recover from yesterday\'s long run.',
        notes: 'Enjoy your rest day!',
      })
    } else {
      plan.push({
        day,
        workout_type: 'easy',
        title: 'Easy Run',
        distance_miles: easyMiles,
        description: `Easy pace at ${easyPace}${unitLabel}.`,
        notes: null,
      })
    }
  }

  return plan
}

/**
 * Generate a plan that respects the user's preferred run frequency.
 * Distributes miles across the specified number of run days, fills rest on others.
 * For 2-3 day runners: long run + easy runs, no speed work.
 * For 4+ day runners: long run + easy runs + tempo if in build/peak.
 */
function generateFrequencyAwarePlan(
  weeklyMiles: number,
  longRunMiles: number,
  longRunDay: string,
  phase: string,
  easyPace: string,
  tempoPace: string,
  targetPace: string,
  unitLabel: string,
  runsPerWeek: number,
  unit: DistanceUnit
): DayPlan[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const longRunIdx = longRunDay === 'saturday' ? 5 : 6
  const remainingMiles = weeklyMiles - longRunMiles
  const includeTempo = (phase === 'build' || phase === 'peak') && runsPerWeek >= 4

  // Determine which day indices are run days (excluding long run day which is always a run)
  // Spread run days evenly through the week
  const runDayIndices = selectRunDays(runsPerWeek - 1, longRunIdx) // -1 because long run is always included

  let tempoMiles = 0
  let tempoDayIdx = -1
  const easyRunCount = includeTempo ? runDayIndices.length - 1 : runDayIndices.length

  if (includeTempo && runDayIndices.length > 0) {
    tempoMiles = Math.min(Math.max(Math.round(remainingMiles * 0.25), 4), 7)
    // Put tempo on Wednesday (idx 2) if available, otherwise first available run day
    tempoDayIdx = runDayIndices.includes(2) ? 2 : runDayIndices[0]
  }

  const easyMilesTotal = remainingMiles - tempoMiles
  const easyMilesPerRun = easyRunCount > 0 ? Math.max(Math.round(easyMilesTotal / easyRunCount), 2) : 0

  const plan: DayPlan[] = []

  for (let i = 0; i < 7; i++) {
    const day = days[i]

    if (i === longRunIdx) {
      plan.push({
        day,
        workout_type: 'long_run',
        title: 'Long Run',
        distance_miles: longRunMiles,
        description: `Start easy at ${easyPace}${unitLabel}, then settle into ${targetPace}${unitLabel} for the middle portion.`,
        notes: 'Key workout — stay relaxed and focus on time on feet.',
      })
    } else if (i === tempoDayIdx && includeTempo) {
      const warmCoolDist = unit === 'km' ? '1.6 km' : '1 mile'
      const tempoCoreDist = unit === 'km'
        ? displayDistance(tempoMiles - 2, unit, 0) + ' km'
        : `${tempoMiles - 2} miles`
      plan.push({
        day,
        workout_type: 'tempo',
        title: 'Tempo Run',
        distance_miles: tempoMiles,
        description: `${warmCoolDist} warm-up, ${tempoCoreDist} at ${tempoPace}${unitLabel}, ${warmCoolDist} cool-down.`,
        notes: 'Key workout — comfortably hard effort.',
      })
    } else if (runDayIndices.includes(i)) {
      // Check if this is the last easy run before long run day — make it a shakeout
      const isPreLongRun = (longRunDay === 'sunday' && i === 5) || (longRunDay === 'saturday' && i === 4)
      plan.push({
        day,
        workout_type: 'easy',
        title: isPreLongRun ? 'Pre-Long Run Shakeout' : 'Easy Run',
        distance_miles: isPreLongRun ? Math.round(easyMilesPerRun * 0.6) : easyMilesPerRun,
        description: isPreLongRun
          ? `Short easy run at ${easyPace}${unitLabel}. Just loosening up for tomorrow.`
          : `Easy pace at ${easyPace}${unitLabel}. Keep heart rate in Zone 2.`,
        notes: null,
      })
    } else {
      plan.push({
        day,
        workout_type: 'rest',
        title: 'Rest Day',
        distance_miles: null,
        description: 'Rest or cross-training (swimming, cycling, yoga).',
        notes: null,
      })
    }
  }

  return plan
}

/**
 * Select which day indices should be run days, spread evenly through the week.
 * Excludes the long run day index.
 */
function selectRunDays(count: number, longRunIdx: number): number[] {
  // Preferred run day slots in priority order (Tue, Fri, Wed, Sat/Sun non-long-run, Thu, Mon)
  const preferred = [1, 4, 2, 5, 6, 3, 0].filter(i => i !== longRunIdx)
  return preferred.slice(0, count)
}

/**
 * Generate a conservative recovery plan for return-from-injury goal.
 * Only easy runs and rest — no speed work, no tempo.
 * 3-4 run days max with extra rest.
 */
function generateRecoveryPlan(
  weeklyMiles: number,
  longRunMiles: number,
  longRunDay: string,
  easyPace: string,
  unitLabel: string
): DayPlan[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const longRunIdx = longRunDay === 'saturday' ? 5 : 6
  const remainingMiles = weeklyMiles - longRunMiles

  // Distribute remaining miles across 2-3 easy runs
  const easyRunMiles = Math.max(Math.round(remainingMiles / 3), 2)

  const plan: DayPlan[] = []

  for (let i = 0; i < 7; i++) {
    const day = days[i]

    if (i === longRunIdx) {
      plan.push({
        day,
        workout_type: 'long_run',
        title: 'Easy Long Run',
        distance_miles: longRunMiles,
        description: `Keep it easy at ${easyPace}${unitLabel}. Walk breaks are fine — focus on time on feet, not pace.`,
        notes: 'Recovery long run — listen to your body and stop if anything feels off.',
      })
    } else if (i === 1) {
      plan.push({
        day,
        workout_type: 'easy',
        title: 'Easy Run',
        distance_miles: easyRunMiles,
        description: `Easy pace at ${easyPace}${unitLabel}. Keep effort conversational.`,
        notes: 'Start slow and check in with your body throughout.',
      })
    } else if (i === 4) {
      plan.push({
        day,
        workout_type: 'easy',
        title: 'Easy Run',
        distance_miles: easyRunMiles,
        description: `Easy pace at ${easyPace}${unitLabel}. Walk breaks are encouraged if needed.`,
        notes: null,
      })
    } else {
      plan.push({
        day,
        workout_type: 'rest',
        title: 'Rest / Recovery',
        distance_miles: null,
        description: i === 2
          ? 'Cross-training: swimming, cycling, or yoga. Avoid high-impact activities.'
          : 'Complete rest. Focus on sleep, nutrition, and recovery.',
        notes: i === 0 ? 'Recovery phase — rest days are essential for healing.' : null,
      })
    }
  }

  return plan
}

function generateTaperPlan(
  remainingMiles: number,
  longRunMiles: number,
  longRunDay: string,
  easyPace: string,
  tempoPace: string,
  targetPace: string,
  unitLabel: string = '/mile'
): DayPlan[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const longRunIdx = longRunDay === 'saturday' ? 5 : 6
  const easyMiles = Math.round(remainingMiles / 3)

  const plan: DayPlan[] = []

  for (let i = 0; i < 7; i++) {
    const day = days[i]

    if (i === longRunIdx) {
      plan.push({
        day,
        workout_type: 'long_run',
        title: 'Taper Long Run',
        distance_miles: longRunMiles,
        description: `Easy effort at ${easyPace}${unitLabel} with a few at ${targetPace}${unitLabel} to stay sharp.`,
        notes: 'Keep it controlled - save energy for race day.',
      })
    } else if (i === 0 || i === 3) {
      plan.push({
        day,
        workout_type: 'rest',
        title: 'Rest Day',
        distance_miles: null,
        description: 'Complete rest. Focus on sleep and nutrition.',
        notes: i === 0 ? 'Taper = trust the process.' : null,
      })
    } else if (i === 1 || i === 4) {
      plan.push({
        day,
        workout_type: 'easy',
        title: i === 4 ? 'Easy Run + Strides' : 'Easy Run',
        distance_miles: easyMiles,
        description: i === 4
          ? `Easy ${easyMiles} miles with 4x100m strides at the end.`
          : `Easy at ${easyPace}${unitLabel}. Keep legs moving.`,
        notes: i === 4 ? 'Keep the legs feeling fresh and fast.' : null,
      })
    } else if (i === 2) {
      plan.push({
        day,
        workout_type: 'tempo',
        title: 'Short Tempo',
        distance_miles: easyMiles,
        description: `Easy warm-up, tempo at ${tempoPace}${unitLabel}, easy cool-down. Stay sharp without fatiguing.`,
        notes: 'Brief quality to maintain sharpness.',
      })
    } else {
      plan.push({
        day,
        workout_type: 'rest',
        title: 'Rest Day',
        distance_miles: null,
        description: 'Rest and recovery.',
        notes: null,
      })
    }
  }

  return plan
}

function generateRaceWeekPlan(goalType: string, raceDistance: number, easyPace: string, unitLabel: string = '/mile', userRaceName?: string | null): DayPlan[] {
  const raceNames: Record<string, string> = {
    '5k': '5K',
    '10k': '10K',
    'half_marathon': 'Half Marathon',
    'marathon': 'Marathon',
    'ultra': 'Ultra',
    'custom': 'Race',
  }
  const raceName = userRaceName || raceNames[goalType] || 'Race'

  // Adjust shakeout distances based on race distance
  let shakeout1 = 3, shakeout2 = 2, shakeout3 = 2
  if (raceDistance <= 6.2) {
    shakeout1 = 2
    shakeout2 = 1.5
    shakeout3 = 1.5
  } else if (raceDistance <= 13.1) {
    shakeout1 = 2.5
    shakeout2 = 2
    shakeout3 = 2
  }

  return [
    { day: 'Monday', workout_type: 'rest', title: 'Rest Day', distance_miles: null, description: 'Complete rest. Focus on hydration and sleep.', notes: 'Race week begins - stay calm.' },
    { day: 'Tuesday', workout_type: 'easy', title: 'Easy Shakeout', distance_miles: shakeout1, description: `Very easy shakeout at ${easyPace}${unitLabel} with 4 strides.`, notes: 'Keep legs loose.' },
    { day: 'Wednesday', workout_type: 'rest', title: 'Rest Day', distance_miles: null, description: 'Complete rest. Visualize your race.', notes: null },
    { day: 'Thursday', workout_type: 'easy', title: 'Easy Shakeout', distance_miles: shakeout2, description: `Very easy shakeout. Just blood flow.`, notes: 'Short and sweet.' },
    { day: 'Friday', workout_type: 'rest', title: 'Rest Day', distance_miles: null, description: 'Rest. Prepare race gear, pin your bib, lay out clothes.', notes: 'Early bedtime tonight.' },
    { day: 'Saturday', workout_type: 'easy', title: 'Pre-Race Shakeout', distance_miles: shakeout3, description: 'Easy 15-20 min with 4 strides. Shake out the nerves.', notes: 'Stay off your feet the rest of the day.' },
    { day: 'Sunday', workout_type: 'race', title: `RACE DAY - ${raceName}!`, distance_miles: raceDistance, description: 'Execute your race plan. Start conservative, negative split, finish strong!', notes: 'Trust your training - you\'ve got this!' },
  ]
}

/**
 * Generate coaching notes
 */
function generateCoachingNotes(
  phase: string,
  weeksToRace: number | null,
  goalType: string,
  recoveryAdjustment: number,
  userRaceName?: string | null,
  runsPerWeek?: number | null
): string[] {
  const notes: string[] = []

  const raceNames: Record<string, string> = {
    '5k': '5K', '10k': '10K', 'half_marathon': 'Half Marathon',
    'marathon': 'Marathon', 'ultra': 'Ultra', 'custom': 'Race',
  }
  const raceName = userRaceName || raceNames[goalType] || 'race'

  if (phase === 'recovery') {
    notes.push('Recovery phase — easy runs only, no speed work. Focus on rebuilding safely with gradual progression.')
    notes.push('Listen to your body. If anything feels off during a run, it\'s okay to stop or walk.')
    notes.push('Rest days aren\'t lazy — they\'re when your body heals and gets stronger.')
    return notes
  }

  if (phase === 'peak') {
    notes.push(`Peak week with ${weeksToRace} weeks to ${raceName}. Quality over quantity - nail your long run and tempo.`)
  } else if (phase === 'build') {
    notes.push(`Building phase - ${weeksToRace} weeks until ${raceName}. Consistency with 4-5 runs per week builds a strong foundation.`)
  } else if (phase === 'taper') {
    notes.push(`Taper time for ${raceName}. Reduced volume feels weird but it's working. Trust the process.`)
  } else if (phase === 'race_week') {
    notes.push(`${raceName} week! Minimal running, maximum rest. Stay calm, trust your training.`)
  } else if (phase === 'base') {
    notes.push(`Base building phase - ${weeksToRace} weeks out from ${raceName}. Focus on easy miles and building your aerobic engine.`)
  }

  if (recoveryAdjustment < 1.0) {
    notes.push('Your health metrics show some fatigue - this week\'s plan has been adjusted to prioritize recovery.')
  }

  if (phase === 'build' || phase === 'peak') {
    const runDays = runsPerWeek || 5
    if (runDays <= 3) {
      notes.push(`With ${runDays} running days, focus on making each run count: long run for endurance, easy runs for recovery.`)
    } else {
      notes.push(`With ${runDays} running days, every run has purpose: long run for endurance, tempo for race fitness, easy runs for recovery.`)
    }
  }

  notes.push('Rest days aren\'t lazy - they\'re when your body adapts and gets stronger. Use them wisely.')

  return notes
}

/**
 * Generate recovery recommendations
 */
function generateRecoveryRecommendations(analysis: AnalysisResults, recoveryAdjustment: number): string[] {
  const recs: string[] = []

  if (analysis.sleep.available && analysis.sleep.status === 'concern') {
    recs.push(`Sleep is critical: You're averaging ${analysis.sleep.avg_hours} hours. Aim for 7-8 hours to support recovery.`)
  }

  if (analysis.resting_hr.available && analysis.resting_hr.status === 'concern') {
    recs.push('Elevated resting heart rate detected. Consider extra rest days if fatigue persists.')
  }

  if (analysis.body_battery.available && analysis.body_battery.status === 'concern') {
    recs.push('Body Battery is low. Prioritize sleep and reduce stress where possible.')
  }

  // RPE-based recovery recommendations (only if RPE data available)
  if (analysis.rpe?.available) {
    if (analysis.rpe.trend === 'rising') {
      recs.push('RPE trending up - workouts are feeling harder. Consider swapping a hard session for an easy one.')
    }
    if ((analysis.rpe.fatigue_indicators ?? 0) >= 2) {
      recs.push('High effort with low training effect detected - your body may be under-recovered.')
    }
  }

  if (recoveryAdjustment < 0.85) {
    recs.push('Multiple fatigue indicators present - consider a recovery week with reduced intensity.')
  }

  return recs
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
