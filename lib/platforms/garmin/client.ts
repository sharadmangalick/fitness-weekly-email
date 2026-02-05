/**
 * Garmin Connect API Client
 *
 * Uses the garmin-connect npm package to interact with Garmin Connect API.
 * This is a TypeScript port of the Python garmin_client.py, adapted for
 * serverless environments (no file caching, no interactive prompts).
 */

import { GarminConnect } from 'garmin-connect'
import type { GarminTokens } from '../interface'

// Date helper to get YYYY-MM-DD format
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Get date N days ago
function getDateDaysAgo(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

export interface GarminActivityRaw {
  activityId: number
  activityName: string
  activityType?: { typeKey?: string }
  startTimeLocal: string
  distance: number  // meters
  duration: number  // seconds
  averageHR?: number
  maxHR?: number
  elevationGain?: number
  calories?: number
  averageRunningCadenceInStepsPerMinute?: number
  // RPE fields - user-logged perceived exertion and Garmin's training effect
  perceivedExertion?: number           // User-logged RPE (1-10)
  aerobicTrainingEffect?: number       // Garmin's aerobic training effect (1-5)
  anaerobicTrainingEffect?: number     // Garmin's anaerobic training effect (1-5)
}

export interface GarminSleepRaw {
  dailySleepDTO?: {
    sleepTimeSeconds?: number
    deepSleepSeconds?: number
    lightSleepSeconds?: number
    remSleepSeconds?: number
    awakeSleepSeconds?: number
    sleepScores?: {
      totalScore?: number
    }
  }
}

export interface GarminHeartRateRaw {
  restingHeartRate?: number
  maxHeartRate?: number
  calendarDate?: string
}

export interface GarminDailyStatsRaw {
  totalSteps?: number
  totalDistanceMeters?: number
  activeKilocalories?: number
  totalKilocalories?: number
  sedentarySeconds?: number
  activeSeconds?: number
  vigorousIntensityMinutes?: number
  averageStressLevel?: number
  bodyBatteryHighestValue?: number
  bodyBatteryLowestValue?: number
  bodyBatteryChargedValue?: number
  bodyBatteryDrainedValue?: number
}

export interface GarminVO2MaxRaw {
  generic?: { vo2MaxValue?: number }
  running?: { vo2MaxValue?: number }
  cycling?: { vo2MaxValue?: number }
  vo2MaxValue?: number
  vo2Max?: number
}

/**
 * Garmin Connect API Client
 *
 * Note: This client uses the garmin-connect npm package which uses
 * email/password authentication. The tokens are session tokens that
 * can be reused for subsequent requests.
 */
export class GarminClient {
  private client: GarminConnect | null = null

  /**
   * Authenticate with Garmin Connect using email/password
   * Returns session tokens that can be stored and reused
   */
  async login(email: string, password: string): Promise<GarminTokens> {
    const client = new GarminConnect({
      username: email,
      password: password,
    })

    await client.login()

    // Get the session tokens from the client
    // The garmin-connect library stores OAuth tokens internally
    const exportedSession = await client.exportToken()

    this.client = client

    return {
      oauth1_token: exportedSession.oauth1 || { oauth_token: '', oauth_token_secret: '' },
      oauth2_token: exportedSession.oauth2 || { access_token: '', refresh_token: '', expires_at: 0 }
    }
  }

  /**
   * Restore a session from saved tokens
   */
  async restoreSession(tokens: GarminTokens): Promise<boolean> {
    try {
      // Pass placeholder credentials - they won't be used since we're loading tokens
      const client = new GarminConnect({
        username: 'placeholder',
        password: 'placeholder'
      })

      // Load the tokens to restore the session
      client.loadToken(tokens.oauth1_token as any, tokens.oauth2_token as any)

      this.client = client
      return true
    } catch (error) {
      console.error('Failed to restore Garmin session:', error)
      return false
    }
  }

  /**
   * Check if we have an active client
   */
  isLoggedIn(): boolean {
    return this.client !== null
  }

  /**
   * Fetch activities for the specified number of days
   */
  async fetchActivities(days: number = 7): Promise<GarminActivityRaw[]> {
    if (!this.client) {
      throw new Error('Not logged in to Garmin Connect')
    }

    const endDate = new Date()
    const startDate = getDateDaysAgo(days)

    try {
      const activities = await this.client.getActivities(
        0,  // start index
        100, // limit
        // Additional params would go here for date filtering
      )

      // Filter activities by date and cast to our extended type
      // Note: garmin-connect IActivity type is incomplete, but the actual API
      // returns additional fields including RPE data
      return ((activities || []) as unknown as GarminActivityRaw[]).filter((activity) => {
        const activityDate = new Date(activity.startTimeLocal)
        return activityDate >= startDate && activityDate <= endDate
      })
    } catch (error) {
      console.error('Error fetching Garmin activities:', error)
      return []
    }
  }

  /**
   * Fetch sleep data for the specified number of days
   */
  async fetchSleep(days: number = 7): Promise<{ date: string; data: GarminSleepRaw }[]> {
    if (!this.client) {
      throw new Error('Not logged in to Garmin Connect')
    }

    const results: { date: string; data: GarminSleepRaw }[] = []
    const endDate = new Date()

    for (let i = 0; i < days; i++) {
      const currentDate = getDateDaysAgo(i)
      const dateStr = formatDate(currentDate)

      try {
        const sleepData = await this.client.getSleepData(currentDate)
        if (sleepData) {
          results.push({ date: dateStr, data: sleepData as any })
        }
      } catch (error) {
        // Sleep data might not be available for all days
        console.warn(`No sleep data for ${dateStr}`)
      }
    }

    return results
  }

  /**
   * Fetch heart rate data for the specified number of days
   */
  async fetchHeartRate(days: number = 7): Promise<{ date: string; data: GarminHeartRateRaw }[]> {
    if (!this.client) {
      throw new Error('Not logged in to Garmin Connect')
    }

    const results: { date: string; data: GarminHeartRateRaw }[] = []

    for (let i = 0; i < days; i++) {
      const currentDate = getDateDaysAgo(i)
      const dateStr = formatDate(currentDate)

      try {
        const hrData = await this.client.getHeartRate(currentDate)
        if (hrData) {
          results.push({ date: dateStr, data: hrData })
        }
      } catch (error) {
        console.warn(`No heart rate data for ${dateStr}`)
      }
    }

    return results
  }

  /**
   * Fetch daily summaries for the specified number of days
   * Note: garmin-connect library doesn't have a full daily summary method
   * We use getSteps as a partial substitute
   */
  async fetchDailySummaries(days: number = 7): Promise<{ date: string; data: GarminDailyStatsRaw }[]> {
    if (!this.client) {
      throw new Error('Not logged in to Garmin Connect')
    }

    const results: { date: string; data: GarminDailyStatsRaw }[] = []

    for (let i = 0; i < days; i++) {
      const currentDate = getDateDaysAgo(i)
      const dateStr = formatDate(currentDate)

      try {
        const steps = await this.client.getSteps(currentDate)
        if (steps) {
          results.push({
            date: dateStr,
            data: { totalSteps: steps as any }
          })
        }
      } catch (error) {
        console.warn(`No daily summary for ${dateStr}`)
      }
    }

    return results
  }

  /**
   * Fetch VO2 max data for the specified number of days
   * Note: garmin-connect library doesn't support VO2 max fetching
   */
  async fetchVO2Max(days: number = 7): Promise<{ date: string; data: GarminVO2MaxRaw }[]> {
    // VO2 max not available through this library
    return []
  }

  /**
   * Fetch all data types for the specified number of days
   */
  async fetchAll(days: number = 7) {
    const [activities, sleep, heartRate, dailySummaries, vo2max] = await Promise.all([
      this.fetchActivities(days),
      this.fetchSleep(days),
      this.fetchHeartRate(days),
      this.fetchDailySummaries(days),
      this.fetchVO2Max(days),
    ])

    return {
      activities,
      sleep,
      heartRate,
      dailySummaries,
      vo2max,
    }
  }
}
