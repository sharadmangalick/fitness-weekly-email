/**
 * Email Generator
 *
 * Generates HTML email content for weekly training reports.
 * This is a TypeScript port of the Python email_generator.py
 */

import type { TrainingPlan } from './planner'
import type { AnalysisResults } from './analyzer'
import type { TrainingConfig, UserProfile } from '../database.types'

interface HealthMetric {
  metric: string
  value: string
  detail: string
  status: 'good' | 'normal' | 'concern'
  emoji: string
}

interface RecoveryStatus {
  status: string
  message: string
  color: string
}

function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    good: '&#9989;',      // Green checkmark
    normal: '&#128310;',  // Yellow circle
    concern: '&#9888;',   // Warning sign
  }
  return emojis[status] || '&#128310;'
}

function determineRecoveryStatus(analysis: AnalysisResults): RecoveryStatus {
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

function buildHealthSnapshot(analysis: AnalysisResults): HealthMetric[] {
  const snapshot: HealthMetric[] = []

  if (analysis.resting_hr.available) {
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

function getRaceName(goalType: string, goalTarget: string | null): string {
  const raceNames: Record<string, string> = {
    '5k': '5K',
    '10k': '10K',
    'half_marathon': 'Half Marathon',
    'marathon': 'Marathon',
    'ultra': 'Ultra',
    'custom': 'Race',
    'build_mileage': 'Mileage Building',
    'maintain_fitness': 'Fitness Maintenance',
    'base_building': 'Base Building',
    'return_from_injury': 'Return to Running',
  }

  return goalTarget || raceNames[goalType] || 'Training'
}

function getWeekDates(): { start: string; end: string } {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const formatEnd = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return {
    start: format(monday),
    end: formatEnd(sunday),
  }
}

/**
 * Calculate weeks until race
 */
function calculateWeeksUntilRace(goalDate: string | null): number | null {
  if (!goalDate) return null
  const today = new Date()
  const race = new Date(goalDate)
  const diffTime = race.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, Math.floor(diffDays / 7))
}

/**
 * Generate HTML email content
 */
export function generateEmailHtml(
  user: UserProfile,
  config: TrainingConfig,
  analysis: AnalysisResults,
  plan: TrainingPlan,
  goalsUpdateUrl?: string
): string {
  const week = getWeekDates()
  const weeksToRace = calculateWeeksUntilRace(config.goal_date)
  const raceName = getRaceName(config.goal_type, config.goal_target)
  const healthSnapshot = buildHealthSnapshot(analysis)
  const recoveryStatus = determineRecoveryStatus(analysis)

  const weekHeader = weeksToRace !== null
    ? `Week of ${week.start} | ${weeksToRace} weeks to ${raceName}`
    : `Week of ${week.start} | ${raceName}`

  // Generate daily plan HTML
  const dailyPlanHtml = plan.daily_plan.map(day => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80" style="vertical-align: top;">
              <strong style="color: #667eea; font-size: 14px;">${day.day.slice(0, 3).toUpperCase()}</strong>
            </td>
            <td>
              <div style="font-weight: 600; color: #333;">${day.title}</div>
              ${day.distance_miles ? `<div style="color: #666; font-size: 14px; margin-top: 4px;">${day.distance_miles} miles</div>` : ''}
              <div style="color: #888; font-size: 13px; margin-top: 4px;">${day.description}</div>
              ${day.notes ? `<div style="color: #764ba2; font-size: 12px; margin-top: 4px; font-style: italic;">${day.notes}</div>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  // Generate health snapshot HTML
  const healthSnapshotHtml = healthSnapshot.map(metric => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="40" style="font-size: 20px;">${metric.emoji}</td>
            <td>
              <strong style="color: #333;">${metric.metric}</strong><br>
              <span style="color: #666; font-size: 14px;">${metric.value}</span>
              ${metric.detail ? `<span style="color: #999; font-size: 12px;"> (${metric.detail})</span>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  // Generate coaching notes HTML
  const coachingNotesHtml = plan.coaching_notes.length > 0 ? `
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <h2 style="color: #333; font-size: 18px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #eee;">
          Coach's Notes
        </h2>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${plan.coaching_notes.map(note => `
            <tr>
              <td style="padding: 8px 0; padding-left: 16px; border-left: 3px solid #667eea; margin-bottom: 8px;">
                <span style="color: #444; font-size: 14px;">${note}</span>
              </td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>
  ` : ''

  // Generate recovery recommendations HTML
  const recoveryRecsHtml = plan.recovery_recommendations.length > 0 ? `
    <tr>
      <td style="padding: 0 24px 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
          <tr>
            <td style="padding: 16px;">
              <strong style="color: #856404;">Recovery Focus</strong>
              <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #856404;">
                ${plan.recovery_recommendations.map(rec => `<li style="margin-bottom: 4px;">${rec}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : ''

  // Generate update goals button HTML
  const updateGoalsHtml = goalsUpdateUrl ? `
    <tr>
      <td style="padding: 0 24px 24px 24px; text-align: center;">
        <a href="${goalsUpdateUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Update Your Training Goals
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 8px;">
          Changed your race or fitness goals? Update them anytime.
        </p>
      </td>
    </tr>
  ` : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Training Plan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">
                Your Weekly Training Plan
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">
                ${weekHeader}
              </p>
            </td>
          </tr>

          <!-- Recovery Status Banner -->
          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${recoveryStatus.color}15; border-left: 4px solid ${recoveryStatus.color};">
                <tr>
                  <td style="padding: 16px 20px;">
                    <strong style="color: ${recoveryStatus.color};">${recoveryStatus.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
                    <span style="color: #666;"> - ${recoveryStatus.message}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Health Snapshot -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #eee;">
                Health Snapshot
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${healthSnapshotHtml}
              </table>
            </td>
          </tr>

          <!-- Week Summary -->
          <tr>
            <td style="padding: 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea;">
                      ${plan.week_summary.total_miles}
                    </div>
                    <div style="color: #666; font-size: 14px;">miles this week</div>
                  </td>
                  <td style="padding: 16px; text-align: center; border-left: 1px solid #dee2e6;">
                    <div style="font-size: 18px; font-weight: 600; color: #333;">
                      ${plan.week_summary.training_phase.charAt(0).toUpperCase() + plan.week_summary.training_phase.slice(1)}
                    </div>
                    <div style="color: #666; font-size: 14px;">training phase</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Daily Plan -->
          <tr>
            <td style="padding: 24px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #eee;">
                This Week's Plan
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${dailyPlanHtml}
              </table>
            </td>
          </tr>

          ${coachingNotesHtml}
          ${recoveryRecsHtml}
          ${updateGoalsHtml}

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0 0 12px 0;">
                Goal: ${raceName}${config.goal_date ? ` | Race Date: ${new Date(config.goal_date).toLocaleDateString()}` : ''}
              </p>
              <p style="color: #888; font-size: 12px; margin: 0 0 12px 0;">
                Find this useful? A little support helps keep RunPlan running. <a href="https://www.runplan.fun/donate" style="color: #764ba2; text-decoration: underline;">Support here</a>
              </p>
              <p style="color: #bbb; font-size: 11px; margin: 0;">
                Generated by RunPlan.fun
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Generate email subject line
 */
export function generateEmailSubject(config: TrainingConfig): string {
  const week = getWeekDates()
  const weeksToRace = calculateWeeksUntilRace(config.goal_date)
  const raceName = getRaceName(config.goal_type, config.goal_target)

  if (weeksToRace !== null) {
    return `Your Training Plan: Week of ${week.start} | ${weeksToRace} weeks to ${raceName}`
  }
  return `Your Training Plan: Week of ${week.start} | ${raceName}`
}

/**
 * Generate plain text preview of the training plan
 */
export function generatePreviewText(plan: TrainingPlan): string {
  const lines: string[] = []

  lines.push('=== WEEKLY TRAINING PLAN ===')
  lines.push(`Total Miles: ${plan.week_summary.total_miles}`)
  lines.push(`Phase: ${plan.week_summary.training_phase}`)
  lines.push(`Focus: ${plan.week_summary.focus}`)
  lines.push('')

  lines.push('=== DAILY SCHEDULE ===')
  for (const day of plan.daily_plan) {
    const dayStr = day.day.slice(0, 3).toUpperCase()
    const distanceStr = day.distance_miles ? ` - ${day.distance_miles}mi` : ''
    lines.push(`${dayStr}: ${day.title}${distanceStr}`)
    if (day.description) {
      lines.push(`     ${day.description}`)
    }
  }

  lines.push('')
  lines.push('=== COACHING NOTES ===')
  for (const note of plan.coaching_notes) {
    lines.push(`- ${note}`)
  }

  if (plan.recovery_recommendations.length > 0) {
    lines.push('')
    lines.push('=== RECOVERY RECOMMENDATIONS ===')
    for (const rec of plan.recovery_recommendations) {
      lines.push(`- ${rec}`)
    }
  }

  return lines.join('\n')
}
