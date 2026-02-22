/**
 * Adaptive Training Plan Rules
 *
 * Deterministic, explainable rule-based adaptations that make training plans
 * genuinely responsive to real health and activity data. Each rule has a clear
 * "if X then Y" structure and produces human-readable insights.
 *
 * Graceful degradation: Strava users (missing body battery, RPE, stress, sleep scores)
 * get applicable rules only. Missing rules tracked in rulesSkipped[].
 */

import type { AnalysisResults } from './analyzer'
import type { AllPlatformData, Activity } from '../platforms/interface'
import type { DayPlan } from './planner'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Insight {
  category: 'recovery' | 'pace' | 'structure' | 'long_run' | 'positive' | 'data_quality'
  severity: 'info' | 'warning' | 'positive'
  message: string
  source: string // rule ID for debugging
}

export interface StructureChange {
  dayIndex: number
  fromType: DayPlan['workout_type']
  toType: DayPlan['workout_type']
  reason: string
}

export interface PaceAdjustment {
  type: 'easy' | 'hard'
  actualPacePerMile: number  // minutes per mile
  goalDerivedPacePerMile: number
  divergenceSeconds: number
}

export interface LongRunAdjustment {
  type: 'cap' | 'reduce_percent'
  value: number // cap distance in miles, or reduction percentage (e.g. 0.10 = 10%)
  reason: string
}

export interface AdaptationResult {
  mileageMultiplier: number
  structureChanges: StructureChange[]
  paceAdjustments: PaceAdjustment[]
  longRunAdjustment: LongRunAdjustment | null
  insights: Insight[]
  rulesEvaluated: number
  rulesFired: number
  rulesSkipped: string[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clampMultiplier(value: number, floor = 0.70): number {
  return Math.max(floor, Math.min(1.0, value))
}

/**
 * Get the longest run distance from last 7 days of activities
 */
function getLongestRecentRun(activities: Activity[]): number | null {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const recentRuns = activities
    .filter(a => a.type === 'run' && new Date(a.date) >= oneWeekAgo)

  if (recentRuns.length === 0) return null

  return Math.max(...recentRuns.map(a => a.distance_miles))
}

/**
 * Calculate weighted average pace from running activities.
 * Last 2 weeks weighted 2x vs earlier activities.
 * Returns pace in minutes per mile.
 */
function getWeightedPace(
  runs: Activity[],
  filter: (a: Activity) => boolean
): { pace: number; count: number } | null {
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const filtered = runs.filter(filter)
  if (filtered.length === 0) return null

  let weightedSum = 0
  let totalWeight = 0

  for (const run of filtered) {
    if (run.distance_miles <= 0 || run.duration_minutes <= 0) continue
    const pace = run.duration_minutes / run.distance_miles
    const weight = new Date(run.date) >= twoWeeksAgo ? 2 : 1
    weightedSum += pace * weight
    totalWeight += weight
  }

  if (totalWeight === 0) return null

  return { pace: weightedSum / totalWeight, count: filtered.length }
}

function formatPaceMinutes(paceMinPerMile: number): string {
  const mins = Math.floor(paceMinPerMile)
  const secs = Math.round((paceMinPerMile - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ─── Rule Evaluation ─────────────────────────────────────────────────────────

export function computeAdaptations(
  analysis: AnalysisResults,
  platformData: AllPlatformData,
  phase: string,
  goalPaceMinPerMile: number | null,
  expectedLongRunMiles: number | null,
  longRunDay: string = 'saturday'
): AdaptationResult {
  const result: AdaptationResult = {
    mileageMultiplier: 1.0,
    structureChanges: [],
    paceAdjustments: [],
    longRunAdjustment: null,
    insights: [],
    rulesEvaluated: 0,
    rulesFired: 0,
    rulesSkipped: [],
  }

  let mileageRulesFired = 0

  // ═══ Category 1: Mileage Adjustment (Rules 1-3) ═══

  // Rule 1: RHR elevated
  result.rulesEvaluated++
  if (analysis.resting_hr.available) {
    if (analysis.resting_hr.status === 'concern' && (analysis.resting_hr.change ?? 0) > 3) {
      result.mileageMultiplier *= 0.90
      mileageRulesFired++
      result.rulesFired++
      result.insights.push({
        category: 'recovery',
        severity: 'warning',
        message: `RHR elevated +${analysis.resting_hr.change} bpm from baseline (${analysis.resting_hr.baseline}\u2192${analysis.resting_hr.current}). Volume reduced 10%.`,
        source: 'rule_1_rhr_elevated',
      })
    }
  } else {
    result.rulesSkipped.push('rule_1_rhr_elevated')
  }

  // Rule 2: Body battery low
  result.rulesEvaluated++
  if (analysis.body_battery.available) {
    if (analysis.body_battery.status === 'concern') {
      result.mileageMultiplier *= 0.85
      mileageRulesFired++
      result.rulesFired++
      result.insights.push({
        category: 'recovery',
        severity: 'warning',
        message: `Body Battery wake average is ${analysis.body_battery.current_wake}, below recovery threshold. Volume reduced 15%.`,
        source: 'rule_2_body_battery_low',
      })
    }
  } else {
    result.rulesSkipped.push('rule_2_body_battery_low')
  }

  // Rule 3: Poor sleep
  result.rulesEvaluated++
  if (analysis.sleep.available) {
    if (analysis.sleep.status === 'concern') {
      result.mileageMultiplier *= 0.85
      mileageRulesFired++
      result.rulesFired++
      result.insights.push({
        category: 'recovery',
        severity: 'warning',
        message: `Sleep averaging ${analysis.sleep.avg_hours}h with ${analysis.sleep.under_6h_nights} nights under 6h. Volume reduced 15%.`,
        source: 'rule_3_poor_sleep',
      })
    }
  } else {
    result.rulesSkipped.push('rule_3_poor_sleep')
  }

  // Clamp mileage multiplier
  result.mileageMultiplier = clampMultiplier(result.mileageMultiplier)

  // ═══ Category 2: Structure Changes (Rules 4-7) ═══

  const includeTempo = phase === 'build' || phase === 'peak'

  // Rule 4: Swap tempo when fatigued (2+ mileage rules fired AND build/peak phase)
  result.rulesEvaluated++
  if (includeTempo) {
    if (mileageRulesFired >= 2) {
      result.structureChanges.push({
        dayIndex: 2, // Wednesday (tempo day)
        fromType: 'tempo',
        toType: 'easy',
        reason: 'Multiple recovery signals detected',
      })
      result.rulesFired++
      result.insights.push({
        category: 'structure',
        severity: 'warning',
        message: 'Tempo replaced with easy run \u2014 multiple recovery signals detected.',
        source: 'rule_4_swap_tempo_fatigued',
      })
    }
  } else {
    result.rulesSkipped.push('rule_4_swap_tempo_fatigued')
  }

  // Rule 5: Extra rest on body battery decline
  result.rulesEvaluated++
  if (analysis.body_battery.available) {
    if (analysis.body_battery.trend === 'declining') {
      // Find the last easy run day (scan backwards, skip long run day)
      const longRunIdx = longRunDay === 'saturday' ? 5 : 6
      // Look for easy runs to convert: Friday(4), Tuesday(1), or Saturday pre-run(5 if sunday long)
      const easyDayOrder = longRunDay === 'saturday'
        ? [4, 1] // Friday, Tuesday
        : [4, 1, 5] // Friday, Tuesday, Saturday shakeout
      const targetDay = easyDayOrder.find(idx => idx !== longRunIdx)

      if (targetDay !== undefined) {
        result.structureChanges.push({
          dayIndex: targetDay,
          fromType: 'easy',
          toType: 'rest',
          reason: 'Body Battery trending down over 7+ days',
        })
        result.rulesFired++
        result.insights.push({
          category: 'structure',
          severity: 'warning',
          message: 'Added extra rest day \u2014 Body Battery trending down over 7+ days.',
          source: 'rule_5_extra_rest_declining',
        })
      }
    }
  } else {
    result.rulesSkipped.push('rule_5_extra_rest_declining')
  }

  // Rule 6: No intervals when sleep-deprived (3+ nights under 6h)
  result.rulesEvaluated++
  if (analysis.sleep.available) {
    if ((analysis.sleep.under_6h_nights ?? 0) >= 3) {
      // Intervals would be on a day like Wednesday — swap any intervals to easy
      result.structureChanges.push({
        dayIndex: 2, // Wednesday
        fromType: 'intervals',
        toType: 'easy',
        reason: '3+ poor sleep nights this week',
      })
      result.rulesFired++
      result.insights.push({
        category: 'structure',
        severity: 'warning',
        message: `Intervals replaced with easy \u2014 ${analysis.sleep.under_6h_nights} poor sleep nights this week.`,
        source: 'rule_6_no_intervals_sleep_deprived',
      })
    }
  } else {
    result.rulesSkipped.push('rule_6_no_intervals_sleep_deprived')
  }

  // Rule 7: Swap tempo on RPE fatigue
  result.rulesEvaluated++
  if (analysis.rpe?.available) {
    if (analysis.rpe.trend === 'rising' && (analysis.rpe.fatigue_indicators ?? 0) >= 2) {
      // Only add if rule 4 didn't already swap this day
      const alreadySwapped = result.structureChanges.some(
        sc => sc.dayIndex === 2 && sc.fromType === 'tempo'
      )
      if (!alreadySwapped && includeTempo) {
        result.structureChanges.push({
          dayIndex: 2,
          fromType: 'tempo',
          toType: 'easy',
          reason: 'Workouts feeling harder with less training benefit',
        })
        result.rulesFired++
        result.insights.push({
          category: 'structure',
          severity: 'warning',
          message: 'Tempo replaced with easy \u2014 workouts are feeling harder with less training benefit.',
          source: 'rule_7_rpe_fatigue_swap',
        })
      }
    }
  } else {
    result.rulesSkipped.push('rule_7_rpe_fatigue_swap')
  }

  // ═══ Category 3: Pace Personalization (Rules 8-9) ═══

  const runs = platformData.activities.filter(a => a.type === 'run')

  // Rule 8: Easy pace from real data
  result.rulesEvaluated++
  if (runs.length >= 3 && goalPaceMinPerMile) {
    const goalEasyPace = goalPaceMinPerMile + 1.5 // midpoint of +1 to +2 range

    // Easy runs: pace > goal + 0.5 min/mi OR avg HR < 150
    const easyResult = getWeightedPace(runs, (a) => {
      if (a.distance_miles <= 0 || a.duration_minutes <= 0) return false
      const pace = a.duration_minutes / a.distance_miles
      return pace > (goalPaceMinPerMile + 0.5) || (a.avg_hr !== undefined && a.avg_hr < 150)
    })

    if (easyResult && easyResult.count >= 2) {
      const divergenceSeconds = Math.abs(easyResult.pace - goalEasyPace) * 60
      if (divergenceSeconds > 30) {
        const fasterSlower = easyResult.pace < goalEasyPace ? 'faster' : 'slower'
        result.paceAdjustments.push({
          type: 'easy',
          actualPacePerMile: easyResult.pace,
          goalDerivedPacePerMile: goalEasyPace,
          divergenceSeconds,
        })
        result.rulesFired++
        result.insights.push({
          category: 'pace',
          severity: 'info',
          message: `Your actual easy pace is ${formatPaceMinutes(easyResult.pace)}/mi based on ${easyResult.count} runs \u2014 ${fasterSlower} than goal suggests (${formatPaceMinutes(goalEasyPace)}/mi).`,
          source: 'rule_8_easy_pace_real',
        })
      }
    }
  } else {
    result.rulesSkipped.push('rule_8_easy_pace_real')
  }

  // Rule 9: Tempo/hard effort gap
  result.rulesEvaluated++
  if (runs.length >= 3 && goalPaceMinPerMile) {
    // Hard runs: pace within 30s of goal pace or faster
    const hardResult = getWeightedPace(runs, (a) => {
      if (a.distance_miles <= 0 || a.duration_minutes <= 0) return false
      const pace = a.duration_minutes / a.distance_miles
      return pace <= (goalPaceMinPerMile + 0.5)
    })

    if (hardResult && hardResult.count >= 2) {
      const divergenceSeconds = Math.abs(hardResult.pace - goalPaceMinPerMile) * 60
      if (divergenceSeconds > 30) {
        result.paceAdjustments.push({
          type: 'hard',
          actualPacePerMile: hardResult.pace,
          goalDerivedPacePerMile: goalPaceMinPerMile,
          divergenceSeconds,
        })
        result.rulesFired++
        result.insights.push({
          category: 'pace',
          severity: 'info',
          message: `Your recent hard efforts average ${formatPaceMinutes(hardResult.pace)}/mi vs goal pace of ${formatPaceMinutes(goalPaceMinPerMile)}/mi.`,
          source: 'rule_9_tempo_gap',
        })
      }
    }
  } else {
    result.rulesSkipped.push('rule_9_tempo_gap')
  }

  // ═══ Category 4: Long Run Adjustments (Rules 10-12) ═══

  // Rule 10: Cap on poor recovery (2+ mileage rules fired)
  result.rulesEvaluated++
  if (mileageRulesFired >= 2 && expectedLongRunMiles) {
    const longestRecent = getLongestRecentRun(platformData.activities)
    if (longestRecent !== null && longestRecent < expectedLongRunMiles) {
      result.longRunAdjustment = {
        type: 'cap',
        value: longestRecent,
        reason: 'No progression while recovery metrics are concerning',
      }
      result.rulesFired++
      result.insights.push({
        category: 'long_run',
        severity: 'warning',
        message: `Long run capped at ${Math.round(longestRecent)} mi \u2014 no progression while recovery metrics are concerning.`,
        source: 'rule_10_cap_poor_recovery',
      })
    }
  }

  // Rule 11: Reduce on eve-of data (day-of-week analysis shows long run eve has worst recovery)
  result.rulesEvaluated++
  if (analysis.day_of_week.available && analysis.day_of_week.by_day) {
    const longRunDayName = longRunDay === 'saturday' ? 'Saturday' : 'Sunday'
    // Eve = day before the long run
    const eveDayName = longRunDay === 'saturday' ? 'Friday' : 'Saturday'
    const eveData = analysis.day_of_week.by_day[eveDayName]

    // Check if eve day has worst body battery or worst sleep
    const isWorstBB = analysis.day_of_week.worst_bb_day === eveDayName
    const isWorstSleep = analysis.day_of_week.worst_sleep_day === eveDayName

    if ((isWorstBB || isWorstSleep) && !result.longRunAdjustment) {
      result.longRunAdjustment = {
        type: 'reduce_percent',
        value: 0.10,
        reason: `${eveDayName} recovery is typically lower`,
      }
      result.rulesFired++
      result.insights.push({
        category: 'long_run',
        severity: 'info',
        message: `Your ${eveDayName} recovery is typically lower \u2014 long run reduced 10%.`,
        source: 'rule_11_eve_of_data',
      })
    }
  } else {
    result.rulesSkipped.push('rule_11_eve_of_data')
  }

  // Rule 12: Reduce after missed long run
  result.rulesEvaluated++
  if (expectedLongRunMiles && !result.longRunAdjustment) {
    const longestRecent = getLongestRecentRun(platformData.activities)
    const threshold = expectedLongRunMiles * 0.6
    if (longestRecent === null || longestRecent < threshold) {
      result.longRunAdjustment = {
        type: 'reduce_percent',
        value: 0.15,
        reason: 'No long run detected last week',
      }
      result.rulesFired++
      result.insights.push({
        category: 'long_run',
        severity: 'info',
        message: "No long run detected last week \u2014 this week's reduced to rebuild safely.",
        source: 'rule_12_missed_long_run',
      })
    }
  }

  // ═══ Category 5: Positive Insights (Rules 13-14) ═══

  // Rule 13: All metrics good
  result.rulesEvaluated++
  const availableMetrics = [analysis.resting_hr, analysis.body_battery, analysis.sleep]
    .filter(m => m.available)
  const allGood = availableMetrics.length > 0 &&
    availableMetrics.every(m => m.status === 'good')
  const noConcerns = mileageRulesFired === 0

  if (allGood && noConcerns) {
    result.rulesFired++
    result.insights.push({
      category: 'positive',
      severity: 'positive',
      message: 'Recovery metrics look strong \u2014 great week to push your training.',
      source: 'rule_13_all_good',
    })
  }

  // Rule 14: VO2 max improving
  result.rulesEvaluated++
  if (analysis.vo2max.available) {
    if (analysis.vo2max.trend === 'improving' && (analysis.vo2max.change ?? 0) > 0.5) {
      result.rulesFired++
      result.insights.push({
        category: 'positive',
        severity: 'positive',
        message: `VO2 max trending up (+${analysis.vo2max.change}) \u2014 your aerobic fitness is progressing.`,
        source: 'rule_14_vo2max_improving',
      })
    }
  } else {
    result.rulesSkipped.push('rule_14_vo2max_improving')
  }

  // ═══ Data Quality Insight ═══

  if (result.rulesSkipped.length > 0) {
    const garminOnlyRules = result.rulesSkipped.filter(r =>
      ['rule_2_body_battery_low', 'rule_5_extra_rest_declining', 'rule_7_rpe_fatigue_swap'].includes(r)
    )
    if (garminOnlyRules.length > 0) {
      result.insights.push({
        category: 'data_quality',
        severity: 'info',
        message: `${result.rulesSkipped.length} adaptation rules skipped due to limited health data. Connect a Garmin device for full personalization.`,
        source: 'data_quality_notice',
      })
    }
  }

  return result
}

/**
 * Apply structure changes to an existing daily plan.
 * Modifies workout types and adds "(adjusted)" to titles.
 */
export function applyStructureChanges(
  dailyPlan: DayPlan[],
  changes: StructureChange[],
  easyPace: string,
  unitLabel: string
): DayPlan[] {
  const plan = dailyPlan.map(d => ({ ...d })) // shallow clone

  for (const change of changes) {
    const day = plan[change.dayIndex]
    if (!day) continue

    // Only apply if the current type matches what we expect to swap from
    if (day.workout_type !== change.fromType) continue

    if (change.toType === 'rest') {
      day.workout_type = 'rest'
      day.title = `Rest Day (adjusted)`
      day.distance_miles = null
      day.description = `Rest or light stretching. ${change.reason}.`
      day.notes = 'Plan adjusted based on your recovery data.'
    } else if (change.toType === 'easy') {
      const prevDistance = day.distance_miles
      day.workout_type = 'easy'
      day.title = `Easy Run (adjusted)`
      day.distance_miles = prevDistance ? Math.round(prevDistance * 0.8) : null
      day.description = `Easy pace at ${easyPace}${unitLabel}. ${change.reason}.`
      day.notes = 'Plan adjusted based on your recovery data.'
    }
  }

  return plan
}

/**
 * Apply long run adjustment to the long run distance.
 */
export function applyLongRunAdjustment(
  longRunMiles: number,
  adjustment: LongRunAdjustment | null
): number {
  if (!adjustment) return longRunMiles

  if (adjustment.type === 'cap') {
    return Math.min(longRunMiles, adjustment.value)
  } else {
    return Math.round(longRunMiles * (1 - adjustment.value))
  }
}
