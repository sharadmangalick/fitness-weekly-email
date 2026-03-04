/**
 * Race Week Plan Generator
 *
 * Minimal running with shakeout runs leading into race day.
 */

import type { DayPlan } from '../planner'

export function generateRaceWeekPlan(
  goalType: string,
  raceDistance: number,
  easyPace: string,
  unitLabel: string = '/mile',
  userRaceName?: string | null
): DayPlan[] {
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
