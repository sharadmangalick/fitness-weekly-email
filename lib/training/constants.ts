/**
 * Shared Training Constants
 *
 * Single source of truth for race distances, phase multipliers,
 * intensity multipliers, long run percentages, and display names.
 */

// Race distance mapping (miles)
export const RACE_DISTANCES: Record<string, number> = {
  '5k': 3.1,
  '10k': 6.2,
  'half_marathon': 13.1,
  'marathon': 26.2,
}

// Phase multipliers for different training phases
export const PHASE_MULTIPLIERS: Record<string, number> = {
  base: 0.85,
  build: 1.0,
  peak: 1.1,
  taper: 0.6,
  race_week: 0.3,
  recovery: 0.75,
}

// Intensity multipliers for user preference
export const INTENSITY_MULTIPLIERS: Record<string, number> = {
  conservative: 0.85,
  normal: 1.0,
  aggressive: 1.15,
}

// Long run percentage of weekly mileage by phase
export const LONG_RUN_PCT: Record<string, number> = {
  base: 0.28,
  build: 0.30,
  peak: 0.32,
  taper: 0.25,
  race_week: 0.15,
  recovery: 0.25,
}

// Display names for goal types and race types
export const RACE_NAMES: Record<string, string> = {
  '5k': '5K',
  '10k': '10K',
  'half_marathon': 'Half Marathon',
  'marathon': 'Marathon',
  'ultra': 'Ultra',
  'custom': 'Race',
  'build_mileage': 'Mileage Building',
  'get_faster': 'Speed Training',
  'maintain_fitness': 'Fitness Maintenance',
  'base_building': 'Base Building',
  'return_from_injury': 'Injury Recovery',
}
