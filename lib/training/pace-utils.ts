/**
 * Pace Utilities
 *
 * Shared pace conversion and zone calculation used across plan generators.
 */

import type { DistanceUnit } from '../platforms/interface'
import { paceLabel } from '../platforms/interface'

/**
 * Convert a pace (min/mile) to a formatted string in the user's preferred unit.
 */
export function convertPace(paceMinPerMile: number, unit: DistanceUnit): string {
  const paceMinPerUnit = unit === 'km' ? paceMinPerMile / 1.60934 : paceMinPerMile
  const m = Math.floor(paceMinPerUnit)
  const s = Math.round((paceMinPerUnit - m) * 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Parse a target pace string (e.g. "8:30") and compute easy, tempo,
 * and display pace zones in the user's preferred unit.
 */
export function computePaceZones(targetPace: string, unit: DistanceUnit) {
  const [paceMins, paceSecs] = targetPace.split(':').map(Number)
  const pacePerMileMinutes = paceMins + paceSecs / 60
  const unitLabel = paceLabel(unit)

  const easyPace = `${convertPace(pacePerMileMinutes + 1, unit)}-${convertPace(pacePerMileMinutes + 2, unit)}`
  const tempoPace = `${convertPace(pacePerMileMinutes, unit)}-${convertPace(pacePerMileMinutes + 0.25, unit)}`
  const displayTargetPace = convertPace(pacePerMileMinutes, unit)

  return { easyPace, tempoPace, displayTargetPace, unitLabel, pacePerMileMinutes }
}
