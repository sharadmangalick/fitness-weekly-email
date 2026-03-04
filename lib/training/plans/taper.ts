/**
 * Taper Plan Generator
 *
 * Reduced-volume plan for the taper phase leading into race day.
 */

import type { DayPlan } from '../planner'

export function generateTaperPlan(
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
