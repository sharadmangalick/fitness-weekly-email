/**
 * First Week Email Generator
 *
 * Generates an email with a training plan for the remaining days of the current week.
 * Sent immediately after user completes onboarding.
 */

import type { TrainingPlan, DayPlan } from './planner'
import type { AnalysisResults } from './analyzer'
import type { TrainingConfig, UserProfile } from '../database.types'
import type { AllPlatformData } from '../platforms/interface'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Get remaining days of the week (including today)
 */
function getRemainingDays(): string[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday

  // Reorder to start from Monday
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday=0 index

  return weekDays.slice(todayIndex)
}

/**
 * Filter daily plan to only include remaining days
 */
function filterToRemainingDays(dailyPlan: DayPlan[]): DayPlan[] {
  const remainingDayNames = getRemainingDays()
  return dailyPlan.filter(day => remainingDayNames.includes(day.day))
}

/**
 * Get today's name and remaining count
 */
function getTodayInfo(): { dayName: string; daysRemaining: number } {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dayName = DAY_NAMES[dayOfWeek]
  const daysRemaining = dayOfWeek === 0 ? 1 : 7 - dayOfWeek + 1 // Days including today until end of week
  return { dayName, daysRemaining }
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

/**
 * Generate HTML for first week email
 */
export function generateFirstWeekEmailHtml(
  user: UserProfile,
  config: TrainingConfig,
  analysis: AnalysisResults,
  plan: TrainingPlan,
  platformData: AllPlatformData | null,
  dashboardUrl: string,
  platform?: 'garmin' | 'strava'
): string {
  const { dayName, daysRemaining } = getTodayInfo()
  const weeksToRace = calculateWeeksUntilRace(config.goal_date)
  const raceName = getRaceName(config.goal_type, config.goal_target)

  // Filter to remaining days only
  const remainingPlan = filterToRemainingDays(plan.daily_plan)
  const remainingMiles = remainingPlan.reduce((sum, day) => sum + (day.distance_miles || 0), 0)

  // Generate daily plan HTML
  const dailyPlanHtml = remainingPlan.map((day, index) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="80" style="vertical-align: top;">
              <strong style="color: #667eea; font-size: 14px;">${day.day.slice(0, 3).toUpperCase()}${index === 0 ? ' (Today)' : ''}</strong>
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

  // Build goal info
  let goalInfo = ''
  if (config.goal_category === 'race' && config.goal_date) {
    goalInfo = `Training for ${raceName} | ${weeksToRace} weeks to go`
  } else {
    goalInfo = `Goal: ${raceName}`
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Training Plan is Ready!</title>
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
                Welcome to RunPlan! 🎉
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">
                Your personalized training plan is ready
              </p>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 24px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Hi${user.name ? ` ${user.name.split(' ')[0]}` : ''}! Your training journey starts now.
              </p>
              <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0;">
                Here's your plan for the rest of this week. Starting ${dayName}, you have <strong>${daysRemaining} days</strong> of training ahead.
              </p>
            </td>
          </tr>

          <!-- Goal Banner -->
          <tr>
            <td style="padding: 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 8px; border-left: 4px solid #667eea;">
                <tr>
                  <td style="padding: 16px;">
                    <strong style="color: #667eea;">${goalInfo}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Week Summary -->
          <tr>
            <td style="padding: 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #667eea;">
                      ${Math.round(remainingMiles)}
                    </div>
                    <div style="color: #666; font-size: 14px;">miles remaining this week</div>
                  </td>
                  <td style="padding: 16px; text-align: center; border-left: 1px solid #dee2e6;">
                    <div style="font-size: 18px; font-weight: 600; color: #333;">
                      ${remainingPlan.length}
                    </div>
                    <div style="color: #666; font-size: 14px;">days of training</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Daily Plan -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #eee;">
                Your Plan: ${dayName} - Sunday
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${dailyPlanHtml}
              </table>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50;">
                <tr>
                  <td style="padding: 16px;">
                    <strong style="color: #2e7d32;">What happens next?</strong>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #555; font-size: 14px;">
                      <li style="margin-bottom: 4px;">You'll receive your full weekly training plan every <strong>${config.email_day || 'Sunday'}</strong></li>
                      <li style="margin-bottom: 4px;">Each plan is personalized based on your recent activity and recovery metrics</li>
                      <li>Visit your dashboard anytime to see your plan and update your goals</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 24px 24px 24px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Your Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 13px; margin: 0 0 8px 0;">
                Questions? Just reply to this email.
              </p>
              <p style="color: #bbb; font-size: 11px; margin: 0;">
                ${platform === 'garmin' ? 'Training plan derived in part from Garmin device-sourced data.<br>' : ''}RunPlan.fun - Personalized training, powered by your data
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
 * Generate email subject for first week email
 */
export function generateFirstWeekEmailSubject(userName: string | null): string {
  if (userName) {
    const firstName = userName.split(' ')[0]
    return `${firstName}, your training plan is ready! 🏃`
  }
  return `Your training plan is ready! 🏃`
}
