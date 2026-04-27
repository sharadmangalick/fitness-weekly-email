/**
 * Health Snapshot Builder
 *
 * Builds health metric snapshots from analysis data for email display.
 */

import type { AnalysisResults } from '../analyzer'

export interface HealthMetric {
  metric: string
  value: string
  detail: string
  status: 'good' | 'normal' | 'concern'
  emoji: string
}

export interface RecoveryStatus {
  status: string
  message: string
  color: string
}

export function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    good: '&#9989;',      // Green checkmark
    normal: '&#128310;',  // Yellow circle
    concern: '&#9888;',   // Warning sign
  }
  return emojis[status] || '&#128310;'
}

export function determineRecoveryStatus(analysis: AnalysisResults): RecoveryStatus {
  let concernCount = 0
  let goodCount = 0

  const metrics = [analysis.resting_hr, analysis.body_battery, analysis.sleep, analysis.stress]

  for (const metric of metrics) {
    if (metric.available) {
      if (metric.status === 'concern') concernCount++
      else if (metric.status === 'good') goodCount++
    }
  }

  if (concernCount >= 2) {
    return {
      status: 'recovery_recommended',
      message: 'Multiple fatigue indicators detected',
      color: '#dc3545',
    }
  } else if (concernCount === 1) {
    return {
      status: 'caution',
      message: 'Monitor recovery this week',
      color: '#ffc107',
    }
  } else if (goodCount >= 2) {
    return {
      status: 'ready_to_train',
      message: 'Recovery metrics look strong',
      color: '#28a745',
    }
  }
  return {
    status: 'normal',
    message: 'Recovery within normal range',
    color: '#6c757d',
  }
}

export function buildHealthSnapshot(analysis: AnalysisResults, platform?: 'garmin' | 'strava'): HealthMetric[] {
  const snapshot: HealthMetric[] = []

  // Only show Resting HR for Garmin users — Strava cannot measure true resting HR
  if (analysis.resting_hr.available && platform !== 'strava') {
    const changeStr = analysis.resting_hr.change
      ? `${analysis.resting_hr.change > 0 ? '+' : ''}${analysis.resting_hr.change} from baseline`
      : ''
    snapshot.push({
      metric: 'Resting HR',
      value: `${analysis.resting_hr.current || 'N/A'} bpm`,
      detail: changeStr,
      status: analysis.resting_hr.status || 'normal',
      emoji: getStatusEmoji(analysis.resting_hr.status || 'normal'),
    })
  }

  if (analysis.body_battery.available) {
    snapshot.push({
      metric: 'Body Battery',
      value: `${analysis.body_battery.current_wake || 'N/A'} wake avg`,
      detail: (analysis.body_battery.trend || '').charAt(0).toUpperCase() + (analysis.body_battery.trend || '').slice(1),
      status: analysis.body_battery.status || 'normal',
      emoji: getStatusEmoji(analysis.body_battery.status || 'normal'),
    })
  }

  if (analysis.sleep.available) {
    // The Sleep row in the weekly email reports on the prior week, not
    // the full 30-day analysis window. Fall back to the 30-day stats if
    // the user has no sleep data in the last 7 days.
    const weeklyAvail = (analysis.sleep.weekly_total_nights ?? 0) > 0
    const avg = (weeklyAvail ? analysis.sleep.weekly_avg_hours : analysis.sleep.avg_hours) ?? 0
    const nights = (weeklyAvail
      ? analysis.sleep.weekly_under_6h_nights
      : analysis.sleep.under_6h_nights) ?? 0
    const detail = nights === 1 ? '1 night under 6h' : `${nights} nights under 6h`
    snapshot.push({
      metric: 'Sleep',
      value: `${avg || 'N/A'} hrs avg`,
      detail,
      status: analysis.sleep.status || 'normal',
      emoji: getStatusEmoji(analysis.sleep.status || 'normal'),
    })
  }

  if (analysis.stress.available) {
    // Prefer last-7-days stats; fall back to the 30-day window when no
    // dailies have landed in the last week.
    const weeklyAvail = (analysis.stress.weekly_total_days ?? 0) > 0
    const avg = (weeklyAvail ? analysis.stress.weekly_avg : analysis.stress.avg) ?? 0
    const elevated = (weeklyAvail
      ? analysis.stress.weekly_high_stress_days
      : analysis.stress.high_stress_days) ?? 0
    const detail = elevated === 1 ? '1 elevated stress day' : `${elevated} elevated stress days`
    snapshot.push({
      metric: 'Stress',
      value: `${stressLabel(avg)} (${avg})`,
      detail,
      status: analysis.stress.status || 'normal',
      emoji: getStatusEmoji(analysis.stress.status || 'normal'),
    })
  }

  return snapshot
}

/**
 * Garmin's published stress score bands (0-100):
 *   Rest 0-25 · Low 26-50 · Medium 51-75 · High 76-100
 */
function stressLabel(avg: number): string {
  if (avg <= 25) return 'Rest'
  if (avg <= 50) return 'Low'
  if (avg <= 75) return 'Medium'
  return 'High'
}
