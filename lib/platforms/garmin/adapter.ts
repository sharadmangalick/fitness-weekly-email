/**
 * Garmin Adapter - Implements FitnessPlatform interface for Garmin Connect
 */

import {
  FitnessPlatform,
  PlatformName,
  GarminTokens,
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
  GarminClient,
  GarminActivityRaw,
  GarminSleepRaw,
  GarminHeartRateRaw,
  GarminDailyStatsRaw,
  GarminVO2MaxRaw,
} from './client'
import {
  GarminOAuthClient,
  GarminOAuthTokens,
  refreshAccessToken,
} from './oauth-client'

export class GarminAdapter implements FitnessPlatform {
  readonly name: PlatformName = 'garmin'
  private client: GarminClient
  private oauthClient: GarminOAuthClient | null = null

  constructor() {
    this.client = new GarminClient()
  }

  /**
   * Type guard to check if tokens are OAuth tokens (new) vs legacy tokens
   */
  private isOAuthTokens(tokens: PlatformTokens): tokens is GarminOAuthTokens {
    // OAuth tokens have user_id and token_type fields
    return (
      'user_id' in tokens &&
      'token_type' in tokens &&
      'access_token' in tokens &&
      !('oauth1_token' in tokens)
    )
  }

  /**
   * Type guard for legacy Garmin tokens
   */
  private isLegacyTokens(tokens: PlatformTokens): tokens is GarminTokens {
    return 'oauth1_token' in tokens && 'oauth2_token' in tokens
  }

  /**
   * Connect to Garmin
   * Supports both OAuth (via code) and legacy email/password
   */
  async connect(credentials: Record<string, string>): Promise<ConnectResult> {
    // OAuth flow (new method)
    if (credentials.code) {
      return this.connectViaOAuth(credentials.code)
    }

    // Legacy email/password flow (deprecated, for backwards compatibility)
    if (credentials.email && credentials.password) {
      return this.connectViaEmailPassword(credentials)
    }

    return {
      success: false,
      error: 'Invalid credentials format. Provide either OAuth code or email/password.',
    }
  }

  /**
   * Connect via OAuth 2.0 (new method)
   * Note: Token exchange happens in the callback handler
   * This method is here for interface compatibility
   */
  private async connectViaOAuth(code: string): Promise<ConnectResult> {
    return {
      success: false,
      error: 'OAuth token exchange should happen in callback handler',
    }
  }

  /**
   * Connect via email/password (legacy method)
   * Kept for backwards compatibility during migration
   */
  private async connectViaEmailPassword(credentials: {
    email: string
    password: string
  }): Promise<ConnectResult> {
    const { email, password } = credentials

    if (!email || !password) {
      return {
        success: false,
        error: 'Email and password are required',
      }
    }

    try {
      const tokens = await this.client.login(email, password)
      return {
        success: true,
        tokens,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Garmin',
      }
    }
  }

  /**
   * Refresh tokens
   * Supports both OAuth and legacy session refresh
   */
  async refreshTokens(tokens: PlatformTokens): Promise<RefreshResult> {
    // OAuth token refresh (new method)
    if (this.isOAuthTokens(tokens)) {
      return this.refreshOAuthTokens(tokens)
    }

    // Legacy session refresh
    if (this.isLegacyTokens(tokens)) {
      return this.refreshLegacyTokens(tokens)
    }

    return {
      success: false,
      error: 'Unknown token type',
    }
  }

  /**
   * Refresh OAuth 2.0 tokens (new method)
   */
  private async refreshOAuthTokens(tokens: GarminOAuthTokens): Promise<RefreshResult> {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token)
      return {
        success: true,
        tokens: newTokens,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh OAuth tokens',
      }
    }
  }

  /**
   * Refresh legacy session tokens
   */
  private async refreshLegacyTokens(tokens: GarminTokens): Promise<RefreshResult> {
    try {
      const restored = await this.client.restoreSession(tokens)
      if (restored) {
        // Session restored successfully, tokens are still valid
        return {
          success: true,
          tokens,
        }
      }
      return {
        success: false,
        error: 'Session expired, re-authentication required',
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
    // OAuth tokens
    if (this.isOAuthTokens(tokens)) {
      if (!tokens.expires_at) {
        return false
      }

      // Check if token expires within the next hour
      const expiresAt = tokens.expires_at * 1000 // Convert to ms
      const oneHourFromNow = Date.now() + (60 * 60 * 1000)

      return expiresAt > oneHourFromNow
    }

    // Legacy tokens
    if (this.isLegacyTokens(tokens)) {
      if (!tokens.oauth2_token?.expires_at) {
        return false
      }

      // Check if token expires within the next hour
      const expiresAt = tokens.oauth2_token.expires_at * 1000 // Convert to ms
      const oneHourFromNow = Date.now() + (60 * 60 * 1000)

      return expiresAt > oneHourFromNow
    }

    return false
  }

  /**
   * Ensure client is authenticated with the provided tokens
   */
  private async ensureAuthenticated(tokens: PlatformTokens): Promise<void> {
    // OAuth authentication
    if (this.isOAuthTokens(tokens)) {
      // Check if token needs refresh
      if (!this.isTokenValid(tokens)) {
        const refreshResult = await this.refreshOAuthTokens(tokens)
        if (!refreshResult.success || !refreshResult.tokens) {
          throw new Error('Failed to refresh OAuth tokens')
        }
        // Use refreshed tokens
        this.oauthClient = new GarminOAuthClient(
          (refreshResult.tokens as GarminOAuthTokens).access_token
        )
      } else {
        // Use existing tokens
        this.oauthClient = new GarminOAuthClient(tokens.access_token)
      }
      return
    }

    // Legacy authentication
    if (this.isLegacyTokens(tokens)) {
      if (!this.client.isLoggedIn()) {
        const restored = await this.client.restoreSession(tokens)
        if (!restored) {
          throw new Error('Failed to restore Garmin session')
        }
      }
      return
    }

    throw new Error('Unknown token type')
  }

  /**
   * Convert raw Garmin activity to normalized Activity
   */
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
      // RPE fields (optional - may not be present in all activities)
      perceived_exertion: raw.perceivedExertion,
      aerobic_training_effect: raw.aerobicTrainingEffect,
      anaerobic_training_effect: raw.anaerobicTrainingEffect,
    }
  }

  /**
   * Convert raw Garmin sleep to normalized SleepData
   */
  private normalizeSleep(date: string, raw: GarminSleepRaw): SleepData | null {
    const dto = raw.dailySleepDTO
    if (!dto || !dto.sleepTimeSeconds) {
      return null
    }

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

  /**
   * Convert raw Garmin heart rate to normalized HeartRateData
   */
  private normalizeHeartRate(date: string, raw: GarminHeartRateRaw): HeartRateData | null {
    if (!raw.restingHeartRate) {
      return null
    }

    return {
      date,
      resting_hr: raw.restingHeartRate,
      max_hr: raw.maxHeartRate,
    }
  }

  /**
   * Convert raw Garmin daily stats to normalized DailySummary
   */
  private normalizeDailySummary(date: string, raw: GarminDailyStatsRaw): DailySummary {
    return {
      date,
      steps: raw.totalSteps || 0,
      total_distance_miles: raw.totalDistanceMeters
        ? metersToMiles(raw.totalDistanceMeters)
        : undefined,
      active_calories: raw.activeKilocalories,
      total_calories: raw.totalKilocalories,
      sedentary_minutes: raw.sedentarySeconds
        ? Math.round(raw.sedentarySeconds / 60)
        : undefined,
      active_minutes: raw.activeSeconds
        ? Math.round(raw.activeSeconds / 60)
        : undefined,
      vigorous_minutes: raw.vigorousIntensityMinutes,
      stress_level: raw.averageStressLevel,
      body_battery_high: raw.bodyBatteryHighestValue,
      body_battery_low: raw.bodyBatteryLowestValue,
      body_battery_charged: raw.bodyBatteryChargedValue,
      body_battery_drained: raw.bodyBatteryDrainedValue,
    }
  }

  /**
   * Convert raw Garmin VO2 max to normalized VO2MaxData
   */
  private normalizeVO2Max(date: string, raw: GarminVO2MaxRaw): VO2MaxData | null {
    const vo2 =
      raw.generic?.vo2MaxValue ||
      raw.running?.vo2MaxValue ||
      raw.cycling?.vo2MaxValue ||
      raw.vo2MaxValue ||
      raw.vo2Max

    if (!vo2) {
      return null
    }

    // Determine fitness level
    let fitnessLevel = 'Needs Improvement'
    if (vo2 >= 55) fitnessLevel = 'Excellent'
    else if (vo2 >= 50) fitnessLevel = 'Very Good'
    else if (vo2 >= 45) fitnessLevel = 'Good'
    else if (vo2 >= 40) fitnessLevel = 'Fair'

    return {
      date,
      vo2max: vo2,
      fitness_level: fitnessLevel,
    }
  }

  /**
   * Fetch activities
   */
  async getActivities(tokens: PlatformTokens, days: number): Promise<Activity[]> {
    await this.ensureAuthenticated(tokens)

    // Use OAuth client if available
    if (this.oauthClient) {
      const rawActivities = await this.oauthClient.getActivities(days)
      return rawActivities.map((raw) => this.normalizeActivity(raw))
    }

    // Fall back to legacy client
    const rawActivities = await this.client.fetchActivities(days)
    return rawActivities.map((raw) => this.normalizeActivity(raw))
  }

  /**
   * Fetch sleep data
   */
  async getSleepData(tokens: PlatformTokens, days: number): Promise<SleepData[]> {
    await this.ensureAuthenticated(tokens)

    // Use OAuth client if available
    if (this.oauthClient) {
      const rawSleep = await this.oauthClient.getSleepData(days)
      return rawSleep
        .map(({ date, data }) => this.normalizeSleep(date, data))
        .filter((s): s is SleepData => s !== null)
    }

    // Fall back to legacy client
    const rawSleep = await this.client.fetchSleep(days)
    return rawSleep
      .map(({ date, data }) => this.normalizeSleep(date, data))
      .filter((s): s is SleepData => s !== null)
  }

  /**
   * Fetch heart rate data
   */
  async getHeartRateData(tokens: PlatformTokens, days: number): Promise<HeartRateData[]> {
    await this.ensureAuthenticated(tokens)

    // Use OAuth client if available
    if (this.oauthClient) {
      const rawHR = await this.oauthClient.getHeartRateData(days)
      return rawHR
        .map(({ date, data }) => this.normalizeHeartRate(date, data))
        .filter((hr): hr is HeartRateData => hr !== null)
    }

    // Fall back to legacy client
    const rawHR = await this.client.fetchHeartRate(days)
    return rawHR
      .map(({ date, data }) => this.normalizeHeartRate(date, data))
      .filter((hr): hr is HeartRateData => hr !== null)
  }

  /**
   * Fetch daily summaries
   */
  async getDailySummary(tokens: PlatformTokens, days: number): Promise<DailySummary[]> {
    await this.ensureAuthenticated(tokens)

    // Use OAuth client if available
    if (this.oauthClient) {
      const rawSummaries = await this.oauthClient.getDailySummaries(days)
      return rawSummaries.map(({ date, data }) => this.normalizeDailySummary(date, data))
    }

    // Fall back to legacy client
    const rawSummaries = await this.client.fetchDailySummaries(days)
    return rawSummaries.map(({ date, data }) => this.normalizeDailySummary(date, data))
  }

  /**
   * Fetch all data
   */
  async getAllData(tokens: PlatformTokens, days: number): Promise<AllPlatformData> {
    await this.ensureAuthenticated(tokens)

    // Use OAuth client if available
    if (this.oauthClient) {
      const rawData = await this.oauthClient.fetchAll(days)

      return {
        activities: rawData.activities.map((raw) => this.normalizeActivity(raw)),
        sleep: rawData.sleep
          .map(({ date, data }) => this.normalizeSleep(date, data))
          .filter((s): s is SleepData => s !== null),
        heartRate: rawData.heartRate
          .map(({ date, data }) => this.normalizeHeartRate(date, data))
          .filter((hr): hr is HeartRateData => hr !== null),
        dailySummaries: rawData.dailySummaries.map(({ date, data }) =>
          this.normalizeDailySummary(date, data)
        ),
        vo2max: rawData.vo2max
          .map(({ date, data }) => this.normalizeVO2Max(date, data))
          .filter((v): v is VO2MaxData => v !== null),
      }
    }

    // Fall back to legacy client
    const rawData = await this.client.fetchAll(days)

    return {
      activities: rawData.activities.map((raw) => this.normalizeActivity(raw)),
      sleep: rawData.sleep
        .map(({ date, data }) => this.normalizeSleep(date, data))
        .filter((s): s is SleepData => s !== null),
      heartRate: rawData.heartRate
        .map(({ date, data }) => this.normalizeHeartRate(date, data))
        .filter((hr): hr is HeartRateData => hr !== null),
      dailySummaries: rawData.dailySummaries.map(({ date, data }) =>
        this.normalizeDailySummary(date, data)
      ),
      vo2max: rawData.vo2max
        .map(({ date, data }) => this.normalizeVO2Max(date, data))
        .filter((v): v is VO2MaxData => v !== null),
    }
  }
}

// Singleton instance
export const garminAdapter = new GarminAdapter()
