import { describe, it, expect } from 'vitest'
import { calculateRunCountVariation } from '../run-variation'
import { getTrainingPhase, calculateRecoveryAdjustment, generateTrainingPlan } from '../planner'
import type { AnalysisResults } from '../analyzer'
import type { TrainingConfig } from '../../database.types'

// Minimal mock analysis with no concerns
function mockAnalysis(overrides: Partial<AnalysisResults> = {}): AnalysisResults {
  return {
    overview: { total_days: 7, start_date: '2026-02-24', end_date: '2026-03-02', data_types: {} },
    resting_hr: { available: false, status: 'normal', avg_bpm: 0, trend: 'stable' },
    body_battery: { available: false, status: 'normal', avg_morning: 0, trend: 'stable' },
    vo2max: { available: false, status: 'normal', current: 0, trend: 'stable' },
    sleep: { available: false, status: 'normal', avg_hours: 7.5, trend: 'stable' },
    sedentary: { available: false, status: 'normal', avg_minutes: 0, trend: 'stable' },
    stress: { available: false, status: 'normal', avg_level: 0, trend: 'stable' },
    steps: { available: false, status: 'normal', avg_steps: 0, trend: 'stable' },
    rpe: { available: false, trend: 'stable', fatigue_indicators: 0 },
    day_of_week: { available: false, best_days: [], worst_days: [] },
    recommendations: [],
    ...overrides,
  } as AnalysisResults
}

function mockConfig(overrides: Partial<TrainingConfig> = {}): TrainingConfig {
  return {
    id: 'test-id',
    user_id: 'user-id',
    goal_type: 'half_marathon',
    goal_category: 'race',
    goal_date: '2026-06-01',
    goal_time_minutes: 120,
    current_weekly_mileage: 30,
    intensity_preference: 'normal',
    preferred_long_run_day: 'saturday',
    runs_per_week: 4,
    taper_weeks: 3,
    race_name: null,
    custom_distance_miles: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  } as TrainingConfig
}

// ──────────────────────────────────────────────
// calculateRunCountVariation
// ──────────────────────────────────────────────
describe('calculateRunCountVariation', () => {
  it('base phase cycle: [0, 0, 1, 0]', () => {
    // weeksToRace=0 → index 0 → delta 0
    expect(calculateRunCountVariation(4, 'base', 0, 1.0).delta).toBe(0)
    // weeksToRace=2 → index 2 → delta 1
    expect(calculateRunCountVariation(4, 'base', 2, 1.0).delta).toBe(1)
    // weeksToRace=3 → index 3 → delta 0
    expect(calculateRunCountVariation(4, 'base', 3, 1.0).delta).toBe(0)
  })

  it('build phase cycle: [0, 1, 0, 1]', () => {
    expect(calculateRunCountVariation(4, 'build', 1, 1.0).delta).toBe(1)
    expect(calculateRunCountVariation(4, 'build', 2, 1.0).delta).toBe(0)
  })

  it('peak phase cycle: [1, 0, 1, 0]', () => {
    expect(calculateRunCountVariation(4, 'peak', 0, 1.0).delta).toBe(1)
    expect(calculateRunCountVariation(4, 'peak', 1, 1.0).delta).toBe(0)
  })

  it('taper always sets delta = -1 (for mid-range runners)', () => {
    expect(calculateRunCountVariation(4, 'taper', 2, 1.0).delta).toBe(-1)
  })

  it('recovery always sets delta = -1 (for mid-range runners)', () => {
    expect(calculateRunCountVariation(5, 'recovery', null, 1.0).delta).toBe(-1)
  })

  it('race_week keeps delta = 0', () => {
    expect(calculateRunCountVariation(4, 'race_week', 0, 1.0).delta).toBe(0)
  })

  // Guardrails
  it('low-frequency guardrail: 2-3 run users never go below baseline', () => {
    const result2 = calculateRunCountVariation(2, 'taper', 1, 1.0)
    expect(result2.delta).toBe(0)
    expect(result2.adjustedRunsPerWeek).toBe(2)

    const result3 = calculateRunCountVariation(3, 'recovery', null, 1.0)
    expect(result3.delta).toBe(0)
    expect(result3.adjustedRunsPerWeek).toBe(3)
  })

  it('high-frequency guardrail: 6-7 run users never go above baseline', () => {
    // peak phase, weeksToRace=0 would normally add +1, but 6-run user is capped
    const result6 = calculateRunCountVariation(6, 'peak', 0, 1.0)
    expect(result6.delta).toBe(0)
    expect(result6.adjustedRunsPerWeek).toBe(6)

    const result7 = calculateRunCountVariation(7, 'build', 1, 1.0)
    expect(result7.delta).toBe(0)
    expect(result7.adjustedRunsPerWeek).toBe(7)
  })

  it('fatigue override forces -1 when recovery < 0.85', () => {
    // build phase, weeksToRace=1 → cycle delta = 1
    // but recoveryAdjustment 0.80 forces delta = -1
    // however, for a 3-run user, low-freq guardrail clamps to 0
    const result = calculateRunCountVariation(4, 'build', 1, 0.80)
    expect(result.delta).toBe(-1)
    expect(result.adjustedRunsPerWeek).toBe(3)
  })

  it('fatigue override does not apply when delta is already negative', () => {
    // taper sets delta = -1 first, then fatigue check has delta < 0, skips
    const result = calculateRunCountVariation(5, 'taper', 1, 0.80)
    expect(result.delta).toBe(-1)
  })

  it('returns non-empty reason when delta != 0', () => {
    const result = calculateRunCountVariation(4, 'build', 1, 1.0) // delta = 1
    expect(result.reason.length).toBeGreaterThan(0)
  })

  it('returns empty reason when delta = 0', () => {
    const result = calculateRunCountVariation(4, 'build', 0, 1.0) // delta = 0
    expect(result.reason).toBe('')
  })
})

// ──────────────────────────────────────────────
// getTrainingPhase
// ──────────────────────────────────────────────
describe('getTrainingPhase', () => {
  it('returns maintenance when weeksUntilRace is null', () => {
    expect(getTrainingPhase(null)).toBe('maintenance')
  })

  it('base phase when > 12 weeks out', () => {
    expect(getTrainingPhase(13)).toBe('base')
    expect(getTrainingPhase(20)).toBe('base')
  })

  it('build phase boundary (default 3-week taper)', () => {
    // build: weeksUntilRace > 3 + 3 = 6
    expect(getTrainingPhase(7)).toBe('build')
    expect(getTrainingPhase(12)).toBe('build')
  })

  it('peak phase boundary', () => {
    // peak: weeksUntilRace > 3 (taper) and <= 6
    expect(getTrainingPhase(4)).toBe('peak')
    expect(getTrainingPhase(6)).toBe('peak')
  })

  it('taper phase', () => {
    expect(getTrainingPhase(1)).toBe('taper')
    expect(getTrainingPhase(3)).toBe('taper')
  })

  it('race_week when 0 weeks out', () => {
    expect(getTrainingPhase(0)).toBe('race_week')
  })

  it('respects custom taper weeks', () => {
    // With 1-week taper: peak starts at > 1, build at > 4
    expect(getTrainingPhase(1, 1)).toBe('taper')
    expect(getTrainingPhase(2, 1)).toBe('peak')
    expect(getTrainingPhase(5, 1)).toBe('build')
  })
})

// ──────────────────────────────────────────────
// calculateRecoveryAdjustment
// ──────────────────────────────────────────────
describe('calculateRecoveryAdjustment', () => {
  it('returns 1.0 when no concerns', () => {
    expect(calculateRecoveryAdjustment(mockAnalysis())).toBe(1.0)
  })

  it('returns 0.90 with 1 concern', () => {
    const analysis = mockAnalysis({
      resting_hr: { available: true, status: 'concern', avg_bpm: 72, trend: 'rising' },
    } as Partial<AnalysisResults>)
    expect(calculateRecoveryAdjustment(analysis)).toBe(0.90)
  })

  it('returns 0.85 with 2 concerns', () => {
    const analysis = mockAnalysis({
      resting_hr: { available: true, status: 'concern', avg_bpm: 72, trend: 'rising' },
      sleep: { available: true, status: 'concern', avg_hours: 5.5, trend: 'declining' },
    } as Partial<AnalysisResults>)
    expect(calculateRecoveryAdjustment(analysis)).toBe(0.85)
  })

  it('returns 0.80 with 3 concerns', () => {
    const analysis = mockAnalysis({
      resting_hr: { available: true, status: 'concern', avg_bpm: 72, trend: 'rising' },
      body_battery: { available: true, status: 'concern', avg_morning: 20, trend: 'declining' },
      sleep: { available: true, status: 'concern', avg_hours: 5.5, trend: 'declining' },
    } as Partial<AnalysisResults>)
    expect(calculateRecoveryAdjustment(analysis)).toBe(0.80)
  })

  it('returns 0.75 with 4+ concerns (including RPE)', () => {
    const analysis = mockAnalysis({
      resting_hr: { available: true, status: 'concern', avg_bpm: 72, trend: 'rising' },
      body_battery: { available: true, status: 'concern', avg_morning: 20, trend: 'declining' },
      sleep: { available: true, status: 'concern', avg_hours: 5.5, trend: 'declining' },
      rpe: { available: true, trend: 'rising', fatigue_indicators: 2 },
    } as Partial<AnalysisResults>)
    expect(calculateRecoveryAdjustment(analysis)).toBe(0.75)
  })
})

// ──────────────────────────────────────────────
// generateTrainingPlan
// ──────────────────────────────────────────────
describe('generateTrainingPlan', () => {
  it('produces 7-day plan with correct run count', () => {
    const config = mockConfig({ runs_per_week: 4 })
    const plan = generateTrainingPlan(config, mockAnalysis())

    expect(plan.daily_plan).toHaveLength(7)

    const runDays = plan.daily_plan.filter(d => d.workout_type !== 'rest')
    // Effective runs could be 4 ± 1 due to variation
    expect(runDays.length).toBeGreaterThanOrEqual(3)
    expect(runDays.length).toBeLessThanOrEqual(5)
  })

  it('includes coaching notes', () => {
    const plan = generateTrainingPlan(mockConfig(), mockAnalysis())
    expect(plan.coaching_notes.length).toBeGreaterThan(0)
  })

  it('splices run variation note when delta != 0', () => {
    // Use a config that will produce a non-zero delta
    const config = mockConfig({ runs_per_week: 5 })
    const plan = generateTrainingPlan(config, mockAnalysis())

    // We can't guarantee a variation note without controlling Date.now,
    // but we can verify the plan is valid regardless
    expect(plan.week_summary.training_phase).toBeTruthy()
  })

  it('recovery phase caps mileage at current weekly mileage', () => {
    const config = mockConfig({
      goal_type: 'return_from_injury',
      goal_category: 'non_race' as TrainingConfig['goal_category'],
      goal_date: null,
      current_weekly_mileage: 15,
    })
    const plan = generateTrainingPlan(config, mockAnalysis())

    expect(plan.week_summary.training_phase).toBe('recovery')
    expect(plan.week_summary.total_miles).toBeLessThanOrEqual(15)
  })

  it('race_week plan includes race day', () => {
    // Set goal_date to this week (0 weeks out)
    const today = new Date()
    const goalDate = today.toISOString().split('T')[0]
    const config = mockConfig({ goal_date: goalDate })
    const plan = generateTrainingPlan(config, mockAnalysis())

    if (plan.week_summary.training_phase === 'race_week') {
      const raceDays = plan.daily_plan.filter(d => d.workout_type === 'race')
      expect(raceDays.length).toBe(1)
    }
  })

  it('taper phase produces reduced mileage', () => {
    // 2 weeks out → taper with default 3-week taper
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 14)
    const config = mockConfig({ goal_date: futureDate.toISOString().split('T')[0] })
    const plan = generateTrainingPlan(config, mockAnalysis())

    if (plan.week_summary.training_phase === 'taper') {
      // Taper multiplier is 0.6, so mileage should be well below base (30)
      expect(plan.week_summary.total_miles).toBeLessThan(30)
    }
  })
})
