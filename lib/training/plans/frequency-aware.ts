/**
 * Frequency-Aware Plan Generator
 *
 * Generates plans that respect the user's preferred number of runs per week.
 * Distributes miles across the specified run days, fills rest on others.
 */

import type { DayPlan } from '../planner'
import type { DistanceUnit } from '../../platforms/interface'
import { displayDistance } from '../../platforms/interface'

/**
 * Generate a plan that respects the user's preferred run frequency.
 * For 2-3 day runners: long run + easy runs, no speed work.
 * For 4+ day runners: long run + easy runs + tempo if in build/peak.
 */
export function generateFrequencyAwarePlan(
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
export function selectRunDays(count: number, longRunIdx: number): number[] {
  // Preferred run day slots in priority order (Tue, Fri, Wed, Sat/Sun non-long-run, Thu, Mon)
  const preferred = [1, 4, 2, 5, 6, 3, 0].filter(i => i !== longRunIdx)
  return preferred.slice(0, count)
}
