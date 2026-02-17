/**
 * Garmin Adapter - Implements FitnessPlatform interface for Garmin Connect
 * Uses the official Garmin Health API via OAuth 2.0
 */

import {
  FitnessPlatform,
  PlatformName,
  GarminOAuthTokens,
  PlatformTokens,
  ConnectResult,
  RefreshResult,
  Activity,
  SleepData,
  HeartRateData,
  DailySummary,
  VO2MaxData,
  AllPlatformData,
  normalizeActivityType,
  metersToMiles,
  secondsToMinutes,
  formatPace,
} from '../interface'
import {
  GarminActivityRaw,
  GarminSleepRaw,
  GarminHeartRateRaw,
  GarminDailyStatsRaw,
  GarminVO2MaxRaw,
} from './client'
import {
  GarminOAuthClient,
  refreshAccessToken,
} from './oauth-client'

export class GarminAdapter implements FitnessPlatform {
  readonly name: PlatformName = 'garmin'
  private oauthClient: GarminOAuthClient | null = null

  /**
   * Connect to Garmin via OAuth 2.0 code flow.
   * Note: Token exchange is handled by the callback route directly.
   * This method exists for interface compatibility.
   */
  async connect(_credentials: Record<string, string>): Promise<ConnectResult> {
    return {
      success: false,
      error: 'OAuth token exchange is handled in the callback route',
    }
  }

  /**
   * Refresh OAuth 2.0 tokens using the refresh token
   */
  async refreshTokens(tokens: PlatformTokens): Promise<RefreshResult> {
    const oauthTokens = tokens as GarminOAuthTokens
    try {
      const newTokens = await refreshAccessToken(oauthTokens.refresh_token)
      return { success: true, tokens: newTokens }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh tokens',
      }
    }
  }

  /**
   * Check if OAuth tokens are still valid (not expiring within the next hour)
   */
  isTokenValid(tokens: PlatformTokens): boolean {
    const oauthTokens = tokens as GarminOAuthTokens
    if (!oauthTokens.expires_at) return false
    const oneHourFromNow = Date.now() + 60 * 60 * 1000
    return oauthTokens.expires_at * 1000 > oneHourFromNow
  }

  /**
   * Set up the OAuth client, refreshing the token if needed
   */
  private async ensureAuthenticated(tokens: PlatformTokens): Promise<void> {
    const oauthTokens = tokens as GarminOAuthTokens
    if (!this.isTokenValid(tokens)) {
      const refreshResult = await this.refreshTokens(tokens)
      if (!refreshResult.success || !refreshResult.tokens) {
        throw new Error('Failed to refresh Garmin tokens')
      }
      this.oauthClient = new GarminOAuthClient(
        (refreshResult.tokens as GarminOAuthTokens).access_token
      )
    } else {
      this.oauthClient = new GarminOAuthClient(oauthTokens.access_token)
    }
  }

  // ── Normalization helpers ────────────────────────────────────────────────

  private normalizeActivity(raw: GarminActivityRaw): Activity {
    const distanceMiles = metersToMiles(raw.distance || 0)
    const durationMinutes = secondsToMinutes(raw.duration || 0)

    return {
      id: raw.activityId.toString(),
      date: new Date(raw.startTimeLocal),
      type: normalizeActivityType(raw.activityType?.typeKey || 'other'),
      name: raw.activityName || 'Activity',
      distance_miles: Math.round(distanceMiles * 100) / 100,
      duration_minutes: Math.round(durationMinutes * 10) / 10,
      avg_pace_per_mile: formatPace(durationMinutes, distanceMiles),
      avg_hr: raw.averageHR,
      max_hr: raw.maxHR,
      elevation_gain_ft: raw.elevationGain ? Math.round(raw.elevationGain * 3.28084) : undefined,
      calories: raw.calories,
      avg_cadence: raw.averageRunningCadenceInStepsPerMinute,
      perceived_exertion: raw.perceivedExertion,
      aerobic_training_effect: raw.aerobicTrainingEffect,
      anaerobic_training_effect: raw.anaerobicTrainingEffect,
    }
  }

  private normalizeSleep(date: string, raw: GarminSleepRaw): SleepData | null {
    const dto = raw.dailySleepDTO
    if (!dto || !dto.sleepTimeSeconds) return null

    return {
      date,
      total_sleep_hours: (dto.sleepTimeSeconds || 0) / 3600,
      deep_sleep_hours: (dto.deepSleepSeconds || 0) / 3600,
      light_sleep_hours: (dto.lightSleepSeconds || 0) / 3600,
      rem_sleep_hours: (dto.remSleepSeconds || 0) / 3600,
      awake_hours: (dto.awakeSleepSeconds || 0) / 3600,
      sleep_score: dto.sleepScores?.totalScore,
    }
  }

  private normalizeHeartRate(date: string, raw: GarminHeartRateRaw): HeartRateData | null {
    if (!raw.restingHeartRate) return null
    return {
      date,
      resting_hr: raw.restingHeartRate,
      max_hr: raw.maxHeartRate,
    }
  }

  private normalizeDailySummary(date: string, raw: GarminDailyStatsRaw): DailySummary {
    return {
      date,
      steps: raw.totalSteps || 0,
      total_distance_miles: raw.totalDistanceMeters
        ? metersToMiles(raw.totalDistanceMeters)
        : undefined,
      active_calories: raw.activeKilocalories,
      total_calories: raw.totalKilocalories,
      sedentary_minutes: raw.sedentarySeconds ? Math.round(raw.sedentarySeconds / 60) : undefined,
      active_minutes: raw.activeSeconds ? Math.round(raw.activeSeconds / 60) : undefined,
      vigorous_minutes: raw.vigorousIntensityMinutes,
      stress_level: raw.averageStressLevel,
      body_battery_high: raw.bodyBatteryHighestValue,
      body_battery_low: raw.bodyBatteryLowestValue,
      body_battery_charged: raw.bodyBatteryChargedValue,
      body_battery_drained: raw.bodyBatteryDrainedValue,
    }
  }

  private normalizeVO2Max(date: string, raw: GarminVO2MaxRaw): VO2MaxData | null {
    const vo2 =
      raw.generic?.vo2MaxValue ||
      raw.running?.vo2MaxValue ||
      raw.cycling?.vo2MaxValue ||
      raw.vo2MaxValue ||
      raw.vo2Max

    if (!vo2) return null

    let fitnessLevel = 'Needs Improvement'
    if (vo2 >= 55) fitnessLevel = 'Excellent'
    else if (vo2 >= 50) fitnessLevel = 'Very Good'
    else if (vo2 >= 45) fitnessLevel = 'Good'
    else if (vo2 >= 40) fitnessLevel = 'Fair'

    return { date, vo2max: vo2, fitness_level: fitnessLevel }
  }

  // ── Data fetching ────────────────────────────────────────────────────────

  async getActivities(tokens: PlatformTokens, days: number): Promise<Activity[]> {
    await this.ensureAuthenticated(tokens)
    const raw = await this.oauthClient!.getActivities(days)
    return raw.map((r) => this.normalizeActivity(r))
  }

  async getSleepData(tokens: PlatformTokens, days: number): Promise<SleepData[]> {
    await this.ensureAuthenticated(tokens)
    const raw = await this.oauthClient!.getSleepData(days)
    return raw
      .map(({ date, data }) => this.normalizeSleep(date, data))
      .filter((s): s is SleepData => s !== null)
  }

  async getHeartRateData(tokens: PlatformTokens, days: number): Promise<HeartRateData[]> {
    await this.ensureAuthenticated(tokens)
    const raw = await this.oauthClient!.getHeartRateData(days)
    return raw
      .map(({ date, data }) => this.normalizeHeartRate(date, data))
      .filter((hr): hr is HeartRateData => hr !== null)
  }

  async getDailySummary(tokens: PlatformTokens, days: number): Promise<DailySummary[]> {
    await this.ensureAuthenticated(tokens)
    const raw = await this.oauthClient!.getDailySummaries(days)
    return raw.map(({ date, data }) => this.normalizeDailySummary(date, data))
  }

  async getAllData(tokens: PlatformTokens, days: number): Promise<AllPlatformData> {
    await this.ensureAuthenticated(tokens)
    const raw = await this.oauthClient!.fetchAll(days)

    return {
      activities: raw.activities.map((r) => this.normalizeActivity(r)),
      sleep: raw.sleep
        .map(({ date, data }) => this.normalizeSleep(date, data))
        .filter((s): s is SleepData => s !== null),
      heartRate: raw.heartRate
        .map(({ date, data }) => this.normalizeHeartRate(date, data))
        .filter((hr): hr is HeartRateData => hr !== null),
      dailySummaries: raw.dailySummaries.map(({ date, data }) =>
        this.normalizeDailySummary(date, data)
      ),
      vo2max: raw.vo2max
        .map(({ date, data }) => this.normalizeVO2Max(date, data))
        .filter((v): v is VO2MaxData => v !== null),
    }
  }
}

// Singleton instance
export const garminAdapter = new GarminAdapter()
