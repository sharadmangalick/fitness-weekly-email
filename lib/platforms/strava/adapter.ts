/**
 * Strava Adapter - Implements FitnessPlatform interface for Strava
 *
 * Note: Strava only provides activity data through its API.
 * Sleep, heart rate (outside activities), and daily summaries are not available.
 * We extract what we can from activities (HR during runs, etc.)
 */

import {
  FitnessPlatform,
  PlatformName,
  StravaTokens as InterfaceStravaTokens,
  PlatformTokens,
  ConnectResult,
  RefreshResult,
  Activity,
  SleepData,
  HeartRateData,
  DailySummary,
  AllPlatformData,
  normalizeActivityType,
  metersToMiles,
  secondsToMinutes,
  formatPace,
} from '../interface'
import {
  StravaTokens,
  StravaActivity,
  exchangeCodeForTokens,
  refreshAccessToken,
  createStravaClient,
  getStravaAuthUrl,
} from './client'

export class StravaAdapter implements FitnessPlatform {
  readonly name: PlatformName = 'strava'

  /**
   * Get the OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    return getStravaAuthUrl(state)
  }

  /**
   * Connect to Strava using OAuth code
   */
  async connect(credentials: Record<string, string>): Promise<ConnectResult> {
    const { code } = credentials

    if (!code) {
      return {
        success: false,
        error: 'OAuth code is required',
      }
    }

    try {
      const result = await exchangeCodeForTokens(code)
      return {
        success: true,
        tokens: result.tokens,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Strava',
      }
    }
  }

  /**
   * Refresh Strava OAuth tokens
   */
  async refreshTokens(tokens: PlatformTokens): Promise<RefreshResult> {
    const stravaTokens = tokens as StravaTokens

    try {
      const newTokens = await refreshAccessToken(stravaTokens.refresh_token)
      return {
        success: true,
        tokens: newTokens,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh tokens',
      }
    }
  }

  /**
   * Check if tokens are valid
   */
  isTokenValid(tokens: PlatformTokens): boolean {
    const stravaTokens = tokens as StravaTokens

    if (!stravaTokens.expires_at) {
      return false
    }

    // Check if token expires within the next 5 minutes
    const now = Math.floor(Date.now() / 1000)
    return stravaTokens.expires_at > (now + 300)
  }

  /**
   * Convert Strava activity to normalized Activity
   */
  private normalizeActivity(raw: StravaActivity): Activity {
    const distanceMiles = metersToMiles(raw.distance || 0)
    const durationMinutes = secondsToMinutes(raw.moving_time || 0)

    return {
      id: raw.id.toString(),
      date: new Date(raw.start_date_local),
      type: normalizeActivityType(raw.type),
      name: raw.name || 'Activity',
      distance_miles: Math.round(distanceMiles * 100) / 100,
      duration_minutes: Math.round(durationMinutes * 10) / 10,
      avg_pace_per_mile: formatPace(durationMinutes, distanceMiles),
      avg_hr: raw.average_heartrate,
      max_hr: raw.max_heartrate,
      elevation_gain_ft: raw.total_elevation_gain
        ? Math.round(raw.total_elevation_gain * 3.28084)
        : undefined,
      calories: raw.kilojoules ? Math.round(raw.kilojoules * 0.239006) : undefined,
      avg_cadence: raw.average_cadence ? Math.round(raw.average_cadence * 2) : undefined,
    }
  }

  /**
   * Fetch activities
   */
  async getActivities(tokens: PlatformTokens, days: number): Promise<Activity[]> {
    const stravaTokens = tokens as StravaTokens

    try {
      const { client, tokens: refreshedTokens } = await createStravaClient(stravaTokens)
      const rawActivities = await client.fetchActivitiesForDays(days)

      return rawActivities.map((raw) => this.normalizeActivity(raw))
    } catch (error) {
      console.error('Error fetching Strava activities:', error)
      return []
    }
  }

  /**
   * Strava doesn't provide sleep data
   */
  async getSleepData(tokens: PlatformTokens, days: number): Promise<SleepData[]> {
    // Strava doesn't have sleep data
    return []
  }

  /**
   * Extract heart rate data from activities
   *
   * Since Strava doesn't provide daily HR data, we extract what we can
   * from activities and aggregate by day
   */
  async getHeartRateData(tokens: PlatformTokens, days: number): Promise<HeartRateData[]> {
    const activities = await this.getActivities(tokens, days)

    // Group activities by date and extract HR
    const hrByDate = new Map<string, { avgHr: number[]; maxHr: number[] }>()

    for (const activity of activities) {
      if (activity.avg_hr || activity.max_hr) {
        const dateStr = activity.date.toISOString().split('T')[0]
        const existing = hrByDate.get(dateStr) || { avgHr: [], maxHr: [] }

        if (activity.avg_hr) existing.avgHr.push(activity.avg_hr)
        if (activity.max_hr) existing.maxHr.push(activity.max_hr)

        hrByDate.set(dateStr, existing)
      }
    }

    // Convert to HeartRateData array
    const result: HeartRateData[] = []
    hrByDate.forEach((data, date) => {
      if (data.avgHr.length > 0) {
        // Use the lowest average HR from activities as a rough "resting" estimate
        // This is not accurate but gives some data point
        const minAvgHr = Math.min(...data.avgHr)
        result.push({
          date,
          resting_hr: minAvgHr, // Not accurate but best we can do
          max_hr: data.maxHr.length > 0 ? Math.max(...data.maxHr) : undefined,
          avg_hr: Math.round(data.avgHr.reduce((a, b) => a + b, 0) / data.avgHr.length),
        })
      }
    })

    return result
  }

  /**
   * Strava doesn't provide daily summaries like Garmin
   * We aggregate from activities instead
   */
  async getDailySummary(tokens: PlatformTokens, days: number): Promise<DailySummary[]> {
    const activities = await this.getActivities(tokens, days)

    // Group activities by date
    const summaryByDate = new Map<string, DailySummary>()

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      summaryByDate.set(dateStr, {
        date: dateStr,
        steps: 0, // Strava doesn't track steps
        total_distance_miles: 0,
        active_calories: 0,
        active_minutes: 0,
      })
    }

    // Aggregate activity data by date
    for (const activity of activities) {
      const dateStr = activity.date.toISOString().split('T')[0]
      const existing = summaryByDate.get(dateStr)

      if (existing) {
        existing.total_distance_miles = (existing.total_distance_miles || 0) + activity.distance_miles
        existing.active_calories = (existing.active_calories || 0) + (activity.calories || 0)
        existing.active_minutes = (existing.active_minutes || 0) + activity.duration_minutes
      }
    }

    return Array.from(summaryByDate.values())
  }

  /**
   * Fetch all available data
   */
  async getAllData(tokens: PlatformTokens, days: number): Promise<AllPlatformData> {
    const [activities, heartRate, dailySummaries] = await Promise.all([
      this.getActivities(tokens, days),
      this.getHeartRateData(tokens, days),
      this.getDailySummary(tokens, days),
    ])

    return {
      activities,
      sleep: [], // Strava doesn't provide sleep data
      heartRate,
      dailySummaries,
      // Strava doesn't provide VO2 max through API for free accounts
    }
  }
}

// Singleton instance
export const stravaAdapter = new StravaAdapter()
