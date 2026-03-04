/**
 * Recovery Plan Generator
 *
 * Conservative plan for return-from-injury goal.
 * Only easy runs and rest — no speed work, no tempo.
 */

import type { DayPlan } from '../planner'

/**
 * Generate a conservative recovery plan.
 * 3-4 run days max with extra rest.
 */
export function generateRecoveryPlan(
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
