/**
 * HTML Email Sections
 *
 * Generates HTML snippets for prior week recap and plan explanation sections.
 */

import type { DistanceUnit } from '../../platforms/interface'
import { displayDistance, distanceLabel, distanceLabelShort, paceLabel } from '../../platforms/interface'
import type { PriorWeekRecap, PlanExplanation } from './week-context'

/**
 * Generate HTML for prior week recap section
 */
export function generatePriorWeekRecapHtml(recap: PriorWeekRecap | null, platform?: 'garmin' | 'strava', unit: DistanceUnit = 'mi', deviceName?: string): string {
  if (!recap) {
    return `
      <tr>
        <td style="padding: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 16px; text-align: center;">
                <div style="font-size: 16px; color: #666;">
                  Connect your fitness platform to see your weekly activity recap
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
  }

  // Build workout type summary
  const workoutParts: string[] = []
  if (recap.runCount > 0) workoutParts.push(`${recap.runCount} run${recap.runCount !== 1 ? 's' : ''}`)
  if (recap.bikeCount > 0) workoutParts.push(`${recap.bikeCount} bike${recap.bikeCount !== 1 ? 's' : ''}`)
  if (recap.walkCount > 0) workoutParts.push(`${recap.walkCount} walk${recap.walkCount !== 1 ? 's' : ''}`)
  if (recap.otherCount > 0) workoutParts.push(`${recap.otherCount} other`)
  const workoutSummary = workoutParts.join(' &#183; ')

  // Format active time
  const hours = Math.floor(recap.totalActiveMinutes / 60)
  const minutes = recap.totalActiveMinutes % 60
  const activeTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  return `
    <tr>
      <td style="padding: 24px 24px 12px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #eee;">
          <tr>
            <td>
              <h2 style="color: #333; font-size: 18px; margin: 0;">Last Week's Training</h2>
            </td>
            ${platform === 'garmin' ? `
            <td style="text-align: right; vertical-align: middle;">
              <img src="https://www.runplan.fun/garmin-tag-black.png" alt="Garmin" height="14" style="height: 14px; width: auto; opacity: 0.6; vertical-align: middle; margin-right: 4px;" /><span style="color: #999; font-size: 11px;">${deviceName || 'Garmin'}</span>
            </td>
            ` : ''}
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f7ff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="font-size: 16px;">&#127939;</span>
                    <span style="color: #333; margin-left: 8px;">
                      <strong>${recap.totalWorkouts} workouts</strong> &#183; ${displayDistance(recap.totalMiles, unit)} ${distanceLabel(unit)} total
                    </span>
                  </td>
                </tr>
                ${recap.longestRun ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="font-size: 16px;">&#128207;</span>
                    <span style="color: #333; margin-left: 8px;">
                      Longest run: <strong>${displayDistance(recap.longestRun.distance, unit)} ${distanceLabel(unit)}</strong> (${recap.longestRun.day})
                    </span>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="font-size: 16px;">&#9201;</span>
                    <span style="color: #333; margin-left: 8px;">
                      <strong>${activeTime}</strong> active time
                    </span>
                  </td>
                </tr>
                ${recap.avgPace ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="font-size: 16px;">&#128168;</span>
                    <span style="color: #333; margin-left: 8px;">
                      Avg pace: <strong>${recap.avgPace}${paceLabel(unit)}</strong>
                    </span>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}

/**
 * Generate HTML for plan explanation section
 */
export function generatePlanExplanationHtml(explanation: PlanExplanation, totalMiles: number, raceName: string, unit: DistanceUnit = 'mi'): string {
  const phaseLabels: Record<string, string> = {
    base: 'Base building',
    build: 'Build phase',
    peak: 'Peak phase',
    taper: 'Taper phase',
    race_week: 'Race week',
    maintenance: 'Maintenance',
    recovery: 'Injury recovery',
  }

  const bullets: string[] = []

  // Phase info
  const phaseLabel = phaseLabels[explanation.phase] || explanation.phase
  if (explanation.weeksToRace !== null && explanation.weeksToRace > 0) {
    bullets.push(`${phaseLabel} - ${explanation.weeksToRace} week${explanation.weeksToRace !== 1 ? 's' : ''} to ${raceName}`)
  } else if (explanation.phase === 'race_week') {
    bullets.push(`${raceName} this week!`)
  } else {
    bullets.push(phaseLabel)
  }

  // Intensity info (only show if not normal)
  if (explanation.intensity !== 'normal') {
    bullets.push(`${explanation.intensityLabel.charAt(0).toUpperCase() + explanation.intensityLabel.slice(1)} intensity setting`)
  }

  // Recovery info
  bullets.push(`Recovery: ${explanation.recoveryMessage}`)

  return `
    <tr>
      <td style="padding: 12px 24px 24px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; overflow: hidden; border-left: 4px solid #667eea;">
          <tr>
            <td style="padding: 16px;">
              <div style="font-size: 14px; color: #333; margin-bottom: 8px;">
                <strong>This Week: ${displayDistance(totalMiles, unit, 0)} ${distanceLabel(unit)}</strong>
                <span style="color: #666;"> based on your ${displayDistance(explanation.baseMileage, unit, 0)} ${distanceLabelShort(unit)}/week base</span>
              </div>
              <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 13px;">
                ${bullets.map(b => `<li style="margin-bottom: 4px;">${b}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}
