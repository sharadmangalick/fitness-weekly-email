/**
 * Run Count Variation
 *
 * Dynamic run count variation based on training phase and week cycle.
 * Adjusts the number of runs per week to prevent staleness and respond to fatigue.
 */

// Run count variation cycles by phase (4-week repeating pattern)
export const RUN_COUNT_CYCLES: Record<string, number[]> = {
  base: [0, 0, 1, 0],
  build: [0, 1, 0, 1],
  peak: [1, 0, 1, 0],
  maintenance: [0, 1, 0, -1],
}

export interface RunCountVariation {
  adjustedRunsPerWeek: number
  delta: number
  reason: string
}

/**
 * Calculate dynamic run count variation based on training phase and week cycle.
 * Returns adjusted run count, delta, and a coaching reason.
 */
export function calculateRunCountVariation(
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
export function getVariationReason(
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

export function getOrdinal(n: number): string {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' }
  const mod = n % 10
  return `${n}${(mod >= 1 && mod <= 3 && n !== 11 && n !== 12 && n !== 13) ? suffixes[mod] : 'th'}`
}
