/**
 * Mileage Calculator
 *
 * Calculates average weekly mileage from activity data to pre-populate
 * the current_weekly_mileage field during onboarding.
 */

import type { Activity } from '@/lib/platforms/interface'

export interface WeeklyMileageSummary {
  calculatedMileage: number        // Rounded average weekly miles
  weeksAnalyzed: number            // Number of weeks with data
  totalRunCount: number            // Total runs found
  confidence: 'high' | 'medium' | 'low'
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
