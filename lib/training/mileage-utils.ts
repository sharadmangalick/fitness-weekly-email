/**
 * Mileage Utilities
 *
 * Shared long run cap and mileage calculation logic.
 */

const MAX_LONG_RUN: Record<string, number> = {
  '5k': 10, '10k': 12, 'half_marathon': 16, 'marathon': 22,
}

/**
 * Cap long run miles based on goal type and distance.
 * Enforces a minimum of `floor` miles (default 4).
 */
export function capLongRun(
  longRunMiles: number,
  goalType: string,
  customDistanceMiles: number | null,
  floor: number = 4
): number {
  const ultraDist = goalType === 'ultra' && customDistanceMiles
    ? customDistanceMiles : 0
  const cap = goalType === 'ultra' && ultraDist > 26.2
    ? Math.min(Math.round(ultraDist * 0.65), 35)
    : MAX_LONG_RUN[goalType] || 20

  return Math.max(Math.min(longRunMiles, cap), floor)
}
