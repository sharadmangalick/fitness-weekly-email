/**
 * Email Generator
 *
 * Generates HTML email content for weekly training reports.
 * Sub-modules handle health snapshots, week context, and HTML sections.
 */

import type { TrainingPlan } from './planner'
import type { AnalysisResults } from './analyzer'
import type { Insight } from './adaptations'
import type { TrainingConfig, UserProfile } from '../database.types'
import type { AllPlatformData, DistanceUnit } from '../platforms/interface'
import { displayDistance, distanceLabel, distanceLabelShort, paceLabel } from '../platforms/interface'
import { buildHealthSnapshot, determineRecoveryStatus } from './email/health-snapshot'
import { getRaceName, getWeekDates, calculateWeeksUntilRace, buildPriorWeekRecap, buildPlanExplanation } from './email/week-context'
import { generatePriorWeekRecapHtml, generatePlanExplanationHtml } from './email/html-sections'

/**
 * Generate HTML email content
 */
export function generateEmailHtml(
  user: UserProfile,
  config: TrainingConfig,
  analysis: AnalysisResults,
  plan: TrainingPlan,
  platformData: AllPlatformData | null,
  goalsUpdateUrl?: string,
  platform?: 'garmin' | 'strava',
  distanceUnit: DistanceUnit = 'mi',
  insights?: Insight[]
): string {
  const week = getWeekDates()
  const weeksToRace = calculateWeeksUntilRace(config.goal_date)
  const raceName = getRaceName(config.goal_type, config.goal_target)
  const healthSnapshot = buildHealthSnapshot(analysis, platform)
  const recoveryStatus = determineRecoveryStatus(analysis)

  // Build prior week recap and plan explanation
  const priorWeekRecap = buildPriorWeekRecap(platformData)
  const planExplanation = buildPlanExplanation(config, analysis, plan)

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
              ${day.distance_miles ? `<div style="color: #666; font-size: 14px; margin-top: 4px;">${displayDistance(day.distance_miles, distanceUnit)} ${distanceLabel(distanceUnit)}</div>` : ''}
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

          <!-- Prior Week Recap -->
          ${generatePriorWeekRecapHtml(priorWeekRecap, platform, distanceUnit, platformData?.primaryDeviceName)}

          <!-- Health Snapshot -->
          ${healthSnapshot.length > 0 ? `
          <tr>
            <td style="padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #eee;">
                <tr>
                  <td>
                    <h2 style="color: #333; font-size: 18px; margin: 0;">Health Snapshot</h2>
                  </td>
                  ${platform === 'garmin' ? `
                  <td style="text-align: right; vertical-align: middle;">
                    <img src="https://www.runplan.fun/garmin-tag-black.png" alt="Garmin" height="14" style="height: 14px; width: auto; opacity: 0.6; vertical-align: middle;" />
                  </td>
                  ` : ''}
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${healthSnapshotHtml}
              </table>
              ${platform === 'garmin' ? `
              <p style="color: #999; font-size: 11px; margin: 12px 0 0 0;">This data was created using data provided by Garmin.</p>
              ` : ''}
            </td>
          </tr>
          ` : platform === 'strava' ? `
          <tr>
            <td style="padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                <tr>
                  <td style="padding: 16px;">
                    <strong style="color: #0d47a1; font-size: 14px;">Health Snapshot</strong>
                    <p style="color: #1565c0; font-size: 13px; margin: 8px 0 0 0;">
                      Health metrics aren't available from Strava. Your plan is personalized based on your training patterns. For sleep, stress, and recovery insights, connect a Garmin device at <a href="https://www.runplan.fun/dashboard" style="color: #0d47a1;">runplan.fun/dashboard</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Week Summary -->
          <tr>
            <td style="padding: 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea;">
                      ${displayDistance(plan.week_summary.total_miles, distanceUnit, 0)}
                    </div>
                    <div style="color: #666; font-size: 14px;">${distanceLabel(distanceUnit)} this week</div>
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

          <!-- Plan Explanation -->
          ${generatePlanExplanationHtml(planExplanation, plan.week_summary.total_miles, raceName, distanceUnit)}

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

          ${insights && insights.length > 0 ? `
          <!-- Personalized Adjustments -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #eee;">
                Personalized Adjustments
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${insights.map(insight => {
                  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
                    warning: { bg: '#fff8e1', border: '#ffc107', text: '#856404' },
                    info: { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1' },
                    positive: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' },
                  }
                  const colors = colorMap[insight.severity] || colorMap.info
                  return `
                <tr>
                  <td style="padding: 6px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${colors.bg}; border-left: 3px solid ${colors.border}; border-radius: 4px;">
                      <tr>
                        <td style="padding: 10px 12px;">
                          <span style="color: ${colors.text}; font-size: 13px;">${insight.message}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                }).join('')}
              </table>
            </td>
          </tr>
          ` : ''}
          ${coachingNotesHtml}
          ${recoveryRecsHtml}
          ${updateGoalsHtml}

          <!-- Feedback & Share -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f7ff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #333; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
                      How was this week's plan?
                    </p>
                    <p style="color: #555; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
                      Hit reply or <a href="mailto:sharad@runplan.fun?subject=RunPlan%20Feedback%20-%20Week%20of%20${encodeURIComponent(week.start)}" style="color: #667eea; text-decoration: underline;">email me directly</a> &mdash; I read every message. &mdash; Sharad
                    </p>
                    <p style="color: #888; font-size: 13px; margin: 0;">
                      Know a runner who'd like this? Send them to <a href="https://runplan.fun" style="color: #667eea; text-decoration: underline;">runplan.fun</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0 0 12px 0;">
                Goal: ${raceName}${config.goal_date ? ` | Race Date: ${new Date(config.goal_date).toLocaleDateString()}` : ''}
              </p>
              <p style="color: #888; font-size: 12px; margin: 0 0 12px 0;">
                Find this useful? A little support helps keep RunPlan running. <a href="https://www.runplan.fun/support" style="color: #764ba2; text-decoration: underline;">Support here</a>
              </p>
              ${platform === 'garmin' ? `
              <p style="color: #bbb; font-size: 11px; margin: 0 0 8px 0;">
                Insights derived in part from Garmin device-sourced data.
              </p>
              ` : ''}
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
