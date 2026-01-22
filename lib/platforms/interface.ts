/**
 * Platform Interface - Abstract interface for fitness data platforms
 *
 * Both Garmin and Strava adapters implement this interface, allowing
 * the training logic to work with normalized data from any platform.
 */

export type PlatformName = 'garmin' | 'strava'

// Token types
export interface GarminTokens {
  oauth1_token: {
    oauth_token: string
    oauth_token_secret: string
  }
  oauth2_token: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

export interface StravaTokens {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete_id: number
}

export type PlatformTokens = GarminTokens | StravaTokens

// Normalized data types (platform-agnostic)
export type ActivityType = 'run' | 'bike' | 'swim' | 'walk' | 'hike' | 'other'

export interface Activity {
  id: string
  date: Date
  type: ActivityType
  name: string
  distance_miles: number
  duration_minutes: number
  avg_pace_per_mile?: string  // "9:30" format
  avg_hr?: number
  max_hr?: number
  elevation_gain_ft?: number
  calories?: number
  avg_cadence?: number
}

export interface SleepData {
  date: string  // YYYY-MM-DD
  total_sleep_hours: number
  deep_sleep_hours: number
  light_sleep_hours: number
  rem_sleep_hours: number
  awake_hours: number
  sleep_score?: number
}

export interface HeartRateData {
  date: string  // YYYY-MM-DD
  resting_hr: number
  max_hr?: number
  avg_hr?: number
}

export interface DailySummary {
  date: string  // YYYY-MM-DD
  steps: number
  total_distance_miles?: number
  active_calories?: number
  total_calories?: number
  sedentary_minutes?: number
  active_minutes?: number
  vigorous_minutes?: number
  stress_level?: number  // Garmin-specific
  body_battery_high?: number  // Garmin-specific
  body_battery_low?: number  // Garmin-specific
  body_battery_charged?: number  // Garmin-specific
  body_battery_drained?: number  // Garmin-specific
}

export interface VO2MaxData {
  date: string
  vo2max: number
  fitness_level?: string
}

export interface AllPlatformData {
  activities: Activity[]
  sleep: SleepData[]
  heartRate: HeartRateData[]
  dailySummaries: DailySummary[]
  vo2max?: VO2MaxData[]
}

// Connect result
export interface ConnectResult {
  success: boolean
  tokens?: PlatformTokens
  error?: string
}

// Refresh result
export interface RefreshResult {
  success: boolean
  tokens?: PlatformTokens
  error?: string
}

/**
 * Abstract interface for fitness platforms
 */
export interface FitnessPlatform {
  readonly name: PlatformName

  /**
   * Connect to the platform and obtain tokens
   * For Garmin: uses email/password to authenticate
   * For Strava: uses OAuth code from callback
   */
  connect(credentials: Record<string, string>): Promise<ConnectResult>

  /**
   * Refresh expired tokens
   */
  refreshTokens(tokens: PlatformTokens): Promise<RefreshResult>

  /**
   * Check if tokens are still valid
   */
  isTokenValid(tokens: PlatformTokens): boolean

  /**
   * Fetch activities for the specified number of days
   */
  getActivities(tokens: PlatformTokens, days: number): Promise<Activity[]>

  /**
   * Fetch sleep data for the specified number of days
   * Note: Strava doesn't provide sleep data, returns empty array
   */
  getSleepData(tokens: PlatformTokens, days: number): Promise<SleepData[]>

  /**
   * Fetch heart rate data for the specified number of days
   * Note: Strava provides HR only in activities, not daily summaries
   */
  getHeartRateData(tokens: PlatformTokens, days: number): Promise<HeartRateData[]>

  /**
   * Fetch daily summary data for the specified number of days
   */
  getDailySummary(tokens: PlatformTokens, days: number): Promise<DailySummary[]>

  /**
   * Fetch all data types for the specified number of days
   */
  getAllData(tokens: PlatformTokens, days: number): Promise<AllPlatformData>
}

// Utility functions for activity type mapping
export function normalizeActivityType(rawType: string): ActivityType {
  const typeMap: Record<string, ActivityType> = {
    // Garmin types
    'running': 'run',
    'trail_running': 'run',
    'treadmill_running': 'run',
    'track_running': 'run',
    'cycling': 'bike',
    'road_biking': 'bike',
    'mountain_biking': 'bike',
    'indoor_cycling': 'bike',
    'swimming': 'swim',
    'lap_swimming': 'swim',
    'open_water_swimming': 'swim',
    'walking': 'walk',
    'hiking': 'hike',

    // Strava types
    'Run': 'run',
    'TrailRun': 'run',
    'VirtualRun': 'run',
    'Ride': 'bike',
    'VirtualRide': 'bike',
    'MountainBikeRide': 'bike',
    'GravelRide': 'bike',
    'Swim': 'swim',
    'Walk': 'walk',
    'Hike': 'hike',
  }

  return typeMap[rawType] || 'other'
}

// Convert meters to miles
export function metersToMiles(meters: number): number {
  return meters * 0.000621371
}

// Convert seconds to minutes
export function secondsToMinutes(seconds: number): number {
  return seconds / 60
}

// Format pace as "M:SS" per mile
export function formatPace(totalMinutes: number, distanceMiles: number): string {
  if (distanceMiles <= 0) return '--:--'

  const pacePerMile = totalMinutes / distanceMiles
  const mins = Math.floor(pacePerMile)
  const secs = Math.round((pacePerMile - mins) * 60)

  return `${mins}:${secs.toString().padStart(2, '0')}`
}
