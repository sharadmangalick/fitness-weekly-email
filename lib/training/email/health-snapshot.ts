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
    snapshot.push({
      metric: 'Sleep',
      value: `${analysis.sleep.avg_hours || 'N/A'} hrs avg`,
      detail: `${analysis.sleep.under_6h_pct || 0}% nights under 6h`,
      status: analysis.sleep.status || 'normal',
      emoji: getStatusEmoji(analysis.sleep.status || 'normal'),
    })
  }

  if (analysis.stress.available) {
    snapshot.push({
      metric: 'Stress',
      value: `${analysis.stress.avg || 'N/A'} avg`,
      detail: `${analysis.stress.high_stress_pct || 0}% high stress days`,
      status: analysis.stress.status || 'normal',
      emoji: getStatusEmoji(analysis.stress.status || 'normal'),
    })
  }

  return snapshot
}
