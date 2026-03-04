/**
 * Coaching Notes & Recovery Recommendations
 *
 * Generates phase-appropriate coaching notes and recovery recommendations
 * based on training phase, health analysis, and user config.
 */

import type { AnalysisResults } from './analyzer'

/**
 * Generate coaching notes
 */
export function generateCoachingNotes(
  phase: string,
  weeksToRace: number | null,
  goalType: string,
  recoveryAdjustment: number,
  userRaceName?: string | null,
  runsPerWeek?: number | null
): string[] {
  const notes: string[] = []

  const raceNames: Record<string, string> = {
    '5k': '5K', '10k': '10K', 'half_marathon': 'Half Marathon',
    'marathon': 'Marathon', 'ultra': 'Ultra', 'custom': 'Race',
  }
  const raceName = userRaceName || raceNames[goalType] || 'race'

  if (phase === 'recovery') {
    notes.push('Recovery phase — easy runs only, no speed work. Focus on rebuilding safely with gradual progression.')
    notes.push('Listen to your body. If anything feels off during a run, it\'s okay to stop or walk.')
    notes.push('Rest days aren\'t lazy — they\'re when your body heals and gets stronger.')
    return notes
  }

  if (phase === 'peak') {
    notes.push(`Peak week with ${weeksToRace} weeks to ${raceName}. Quality over quantity - nail your long run and tempo.`)
  } else if (phase === 'build') {
    notes.push(`Building phase - ${weeksToRace} weeks until ${raceName}. Consistency with 4-5 runs per week builds a strong foundation.`)
  } else if (phase === 'taper') {
    notes.push(`Taper time for ${raceName}. Reduced volume feels weird but it's working. Trust the process.`)
  } else if (phase === 'race_week') {
    notes.push(`${raceName} week! Minimal running, maximum rest. Stay calm, trust your training.`)
  } else if (phase === 'base') {
    notes.push(`Base building phase - ${weeksToRace} weeks out from ${raceName}. Focus on easy miles and building your aerobic engine.`)
  }

  if (recoveryAdjustment < 1.0) {
    notes.push('Your health metrics show some fatigue - this week\'s plan has been adjusted to prioritize recovery.')
  }

  if (phase === 'build' || phase === 'peak') {
    const runDays = runsPerWeek || 5
    if (runDays <= 3) {
      notes.push(`With ${runDays} running days, focus on making each run count: long run for endurance, easy runs for recovery.`)
    } else {
      notes.push(`With ${runDays} running days, every run has purpose: long run for endurance, tempo for race fitness, easy runs for recovery.`)
    }
  }

  notes.push('Rest days aren\'t lazy - they\'re when your body adapts and gets stronger. Use them wisely.')

  return notes
}

/**
 * Generate recovery recommendations
 */
export function generateRecoveryRecommendations(analysis: AnalysisResults, recoveryAdjustment: number): string[] {
  const recs: string[] = []

  if (analysis.sleep.available && analysis.sleep.status === 'concern') {
    recs.push(`Sleep is critical: You're averaging ${analysis.sleep.avg_hours} hours. Aim for 7-8 hours to support recovery.`)
  }

  if (analysis.resting_hr.available && analysis.resting_hr.status === 'concern') {
    recs.push('Elevated resting heart rate detected. Consider extra rest days if fatigue persists.')
  }

  if (analysis.body_battery.available && analysis.body_battery.status === 'concern') {
    recs.push('Body Battery is low. Prioritize sleep and reduce stress where possible.')
  }

  // RPE-based recovery recommendations (only if RPE data available)
  if (analysis.rpe?.available) {
    if (analysis.rpe.trend === 'rising') {
      recs.push('RPE trending up - workouts are feeling harder. Consider swapping a hard session for an easy one.')
    }
    if ((analysis.rpe.fatigue_indicators ?? 0) >= 2) {
      recs.push('High effort with low training effect detected - your body may be under-recovered.')
    }
  }

  if (recoveryAdjustment < 0.85) {
    recs.push('Multiple fatigue indicators present - consider a recovery week with reduced intensity.')
  }

  return recs
}
