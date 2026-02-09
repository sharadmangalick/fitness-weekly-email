/**
 * Mileage Calculator
 *
 * Calculates average weekly mileage from activity data to pre-populate
 * the current_weekly_mileage field during onboarding and update baseline
 * based on actual training history.
 */

import type { Activity } from '@/lib/platforms/interface'

export interface WeeklyMileageSummary {
  calculatedMileage: number        // Rounded average weekly miles
  weeksAnalyzed: number            // Number of weeks with data
  totalRunCount: number            // Total runs found
  confidence: 'high' | 'medium' | 'low'
}

export interface BaselineUpdate {
  newBaseline: number              // Updated baseline mileage
  previousBaseline: number         // Old baseline for comparison
  actualRecentAverage: number      // What user actually ran
  changePercent: number            // Percent change applied
  weeksAnalyzed: number            // How many weeks of data used
  reasoning: string                // Explanation of the adjustment
}

/**
 * Get the Monday of a given date's week (Monday-Sunday week boundaries)
 */
function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  // Adjust to Monday (day 0 = Sunday, so Sunday goes back 6 days)
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

/**
 * Get the start of the current week (for excluding incomplete current week)
 */
function getCurrentWeekStart(): string {
  return getWeekStart(new Date())
}

/**
 * Calculate average weekly mileage from activity data
 *
 * @param activities - Array of activities from platform data
 * @returns WeeklyMileageSummary with calculated mileage and confidence
 */
export function calculateWeeklyMileage(activities: Activity[]): WeeklyMileageSummary {
  // Filter for running activities only
  const runs = activities.filter(a => a.type === 'run')

  if (runs.length === 0) {
    return {
      calculatedMileage: 0,
      weeksAnalyzed: 0,
      totalRunCount: 0,
      confidence: 'low'
    }
  }

  // Group runs by week (Monday-Sunday)
  const weeklyMileage: Map<string, number> = new Map()
  const currentWeekStart = getCurrentWeekStart()

  for (const run of runs) {
    const weekStart = getWeekStart(run.date)

    // Skip the current incomplete week
    if (weekStart === currentWeekStart) {
      continue
    }

    const currentMiles = weeklyMileage.get(weekStart) || 0
    weeklyMileage.set(weekStart, currentMiles + run.distance_miles)
  }

  const weeks = Array.from(weeklyMileage.values())
  const weeksAnalyzed = weeks.length

  if (weeksAnalyzed === 0) {
    return {
      calculatedMileage: 0,
      weeksAnalyzed: 0,
      totalRunCount: runs.length,
      confidence: 'low'
    }
  }

  // Calculate average
  const totalMiles = weeks.reduce((sum, miles) => sum + miles, 0)
  const averageMiles = totalMiles / weeksAnalyzed
  const calculatedMileage = Math.round(averageMiles)

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low'

  if (weeksAnalyzed >= 4 && runs.length >= 8) {
    // 4+ weeks of data with multiple runs = high confidence
    confidence = 'high'
  } else if (weeksAnalyzed >= 2 && runs.length >= 4) {
    // 2-3 weeks of data with some runs = medium confidence
    confidence = 'medium'
  } else {
    // Limited data = low confidence
    confidence = 'low'
  }

  return {
    calculatedMileage,
    weeksAnalyzed,
    totalRunCount: runs.length,
    confidence
  }
}

/**
 * Calculate updated baseline mileage from recent training history
 *
 * Uses a rolling average of the last 2-4 weeks with safety constraints:
 * - Don't increase more than 10% per week (prevents aggressive ramping)
 * - Don't decrease more than 25% per week (allows recovery after missed weeks)
 * - Require at least 2 weeks of data
 * - Weight recent weeks more heavily
 *
 * @param activities - Array of activities from platform data (last 4+ weeks)
 * @param currentBaseline - Current baseline mileage from training_config
 * @returns BaselineUpdate with new baseline and reasoning
 */
export function calculateUpdatedBaseline(
  activities: Activity[],
  currentBaseline: number
): BaselineUpdate {
  // Filter for running activities only
  const runs = activities.filter(a => a.type === 'run')

  if (runs.length === 0) {
    return {
      newBaseline: currentBaseline,
      previousBaseline: currentBaseline,
      actualRecentAverage: 0,
      changePercent: 0,
      weeksAnalyzed: 0,
      reasoning: 'No running activities found - keeping baseline unchanged'
    }
  }

  // Group runs by week (Monday-Sunday), excluding current incomplete week
  const weeklyMileage: Map<string, number> = new Map()
  const currentWeekStart = getCurrentWeekStart()

  for (const run of runs) {
    const weekStart = getWeekStart(run.date)

    // Skip the current incomplete week
    if (weekStart === currentWeekStart) {
      continue
    }

    const currentMiles = weeklyMileage.get(weekStart) || 0
    weeklyMileage.set(weekStart, currentMiles + run.distance_miles)
  }

  // Get sorted weeks (oldest to newest)
  const sortedWeeks = Array.from(weeklyMileage.entries())
    .sort(([weekA], [weekB]) => weekA.localeCompare(weekB))
  const weeks = sortedWeeks.map(([_, miles]) => miles)
  const weeksAnalyzed = weeks.length

  // Need at least 2 weeks of data
  if (weeksAnalyzed < 2) {
    return {
      newBaseline: currentBaseline,
      previousBaseline: currentBaseline,
      actualRecentAverage: weeks[0] || 0,
      changePercent: 0,
      weeksAnalyzed,
      reasoning: `Only ${weeksAnalyzed} week${weeksAnalyzed !== 1 ? 's' : ''} of data - need at least 2 to update baseline`
    }
  }

  // Calculate weighted average (recent weeks weighted 2x)
  // For 2-3 weeks: use simple average
  // For 4+ weeks: weight last 2 weeks at 2x
  let weightedSum = 0
  let weightTotal = 0

  if (weeksAnalyzed >= 4) {
    // Use last 4 weeks with recency weighting
    const last4Weeks = weeks.slice(-4)
    // Weights: [1, 1, 2, 2] for oldest to newest
    const weights = [1, 1, 2, 2]

    for (let i = 0; i < last4Weeks.length; i++) {
      weightedSum += last4Weeks[i] * weights[i]
      weightTotal += weights[i]
    }
  } else {
    // For 2-3 weeks, use simple average
    weightedSum = weeks.reduce((sum, miles) => sum + miles, 0)
    weightTotal = weeks.length
  }

  const actualRecentAverage = weightedSum / weightTotal

  // Apply safety constraints
  const maxIncrease = currentBaseline * 1.10  // 10% max increase
  const maxDecrease = currentBaseline * 0.75  // 25% max decrease (allows for injury/rest weeks)

  let newBaseline = Math.round(actualRecentAverage)
  let reasoning = ''

  // Check if increase is too aggressive
  if (newBaseline > maxIncrease) {
    newBaseline = Math.round(maxIncrease)
    reasoning = `Capped at 10% increase (${Math.round(actualRecentAverage)} mi/week average, but limited to ${newBaseline} mi/week for safety)`
  }
  // Check if decrease is too steep
  else if (newBaseline < maxDecrease) {
    newBaseline = Math.round(maxDecrease)
    reasoning = `Capped at 25% decrease (${Math.round(actualRecentAverage)} mi/week average, but limited to ${newBaseline} mi/week to avoid over-correction)`
  }
  // Normal case - actual average is within safe bounds
  else {
    const change = newBaseline - currentBaseline
    if (change > 0) {
      reasoning = `Increased baseline based on ${weeksAnalyzed} weeks of training (averaging ${Math.round(actualRecentAverage)} mi/week)`
    } else if (change < 0) {
      reasoning = `Decreased baseline to match recent training volume (${weeksAnalyzed} weeks averaging ${Math.round(actualRecentAverage)} mi/week)`
    } else {
      reasoning = `Baseline unchanged - actual training matches current baseline (${weeksAnalyzed} weeks)`
    }
  }

  // Ensure minimum of 5 miles/week (prevent going to zero)
  if (newBaseline < 5) {
    newBaseline = 5
    reasoning = `Set to minimum 5 mi/week (actual: ${Math.round(actualRecentAverage)} mi/week)`
  }

  const changePercent = currentBaseline > 0
    ? Math.round(((newBaseline - currentBaseline) / currentBaseline) * 100)
    : 0

  return {
    newBaseline,
    previousBaseline: currentBaseline,
    actualRecentAverage: Math.round(actualRecentAverage * 10) / 10,
    changePercent,
    weeksAnalyzed,
    reasoning
  }
}
