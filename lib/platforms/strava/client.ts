/**
 * Strava API Client
 *
 * Uses OAuth 2.0 for authentication and the Strava REST API for data fetching.
 * Works with FREE Strava accounts - only uses activity data.
 */

import { log, maskSensitive } from '@/lib/logging'

const STRAVA_API_BASE = 'https://www.strava.com/api/v3'
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'

export interface StravaTokens {
  access_token: string
  refresh_token: string
  expires_at: number  // Unix timestamp
  athlete_id: number
}

export interface StravaAthlete {
  id: number
  firstname: string
  lastname: string
  profile: string
  measurement_preference?: string  // 'feet' or 'meters'
}

export interface StravaActivity {
  id: number
  name: string
  type: string  // 'Run', 'Ride', 'Swim', etc.
  sport_type: string
  start_date_local: string  // ISO 8601 format
  distance: number  // meters
  moving_time: number  // seconds
  elapsed_time: number  // seconds
  total_elevation_gain: number  // meters
  average_speed: number  // meters/second
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  average_cadence?: number
  kilojoules?: number
  has_heartrate: boolean
}

export interface StravaActivityStats {
  recent_run_totals: {
    count: number
    distance: number
    moving_time: number
    elevation_gain: number
  }
  ytd_run_totals: {
    count: number
    distance: number
    moving_time: number
    elevation_gain: number
  }
  all_run_totals: {
    count: number
    distance: number
    moving_time: number
    elevation_gain: number
  }
}

/**
 * Generate the Strava OAuth authorization URL
 */
export function getStravaAuthUrl(state?: string): string {
  const clientId = process.env.STRAVA_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI

  if (!clientId || !redirectUri) {
    throw new Error('STRAVA_CLIENT_ID and NEXT_PUBLIC_STRAVA_REDIRECT_URI must be set')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'activity:read_all',  // Read all activities (works with FREE accounts)
    ...(state && { state }),
  })

  return `${STRAVA_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for access tokens
 */
export interface StravaTokenExchangeResult {
  tokens: StravaTokens
  measurement_preference?: string  // 'feet' or 'meters'
}

export async function exchangeCodeForTokens(code: string, flowId?: string): Promise<StravaTokenExchangeResult> {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  log('info', 'Token exchange: checking environment', {
    flowId,
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    codeLength: code.length,
    codeMasked: maskSensitive(code),
  })

  if (!clientId || !clientSecret) {
    log('error', 'Token exchange: missing credentials', { flowId, hasClientId: !!clientId, hasClientSecret: !!clientSecret })
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set')
  }

  log('info', 'Token exchange: sending request to Strava', { flowId })

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  })

  log('info', 'Token exchange: received response', {
    flowId,
    status: response.status,
    statusText: response.statusText,
  })

  if (!response.ok) {
    const error = await response.text()
    log('error', 'Token exchange: request failed', {
      flowId,
      status: response.status,
      error: error.substring(0, 200),
    })
    throw new Error(`Failed to exchange code: ${response.status} ${error}`)
  }

  const data = await response.json()

  log('info', 'Token exchange: success', {
    flowId,
    athleteId: data.athlete?.id,
    hasAccessToken: !!data.access_token,
    hasRefreshToken: !!data.refresh_token,
    expiresAt: data.expires_at,
    accessTokenLength: data.access_token?.length || 0,
  })

  return {
    tokens: {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete_id: data.athlete.id,
    },
    measurement_preference: data.athlete?.measurement_preference,
  }
}

/**
 * Refresh expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<StravaTokens> {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set')
  }

  const response = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const data = await response.json()

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete_id: data.athlete?.id || 0,
  }
}

/**
 * Strava API Client
 */
export class StravaClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Make an authenticated request to Strava API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${STRAVA_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Strava API error: ${response.status} ${error}`)
    }

    return response.json()
  }

  /**
   * Get authenticated athlete profile
   */
  async getAthlete(): Promise<StravaAthlete> {
    return this.request<StravaAthlete>('/athlete')
  }

  /**
   * Get athlete stats
   */
  async getAthleteStats(athleteId: number): Promise<StravaActivityStats> {
    return this.request<StravaActivityStats>(`/athletes/${athleteId}/stats`)
  }

  /**
   * Fetch activities with pagination
   *
   * @param after - Unix timestamp to fetch activities after
   * @param before - Unix timestamp to fetch activities before
   * @param page - Page number (default 1)
   * @param perPage - Number per page (default 30, max 200)
   */
  async getActivities(options: {
    after?: number
    before?: number
    page?: number
    perPage?: number
  } = {}): Promise<StravaActivity[]> {
    const { after, before, page = 1, perPage = 100 } = options

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    })

    if (after) params.set('after', after.toString())
    if (before) params.set('before', before.toString())

    return this.request<StravaActivity[]>(`/athlete/activities?${params.toString()}`)
  }

  /**
   * Get detailed activity by ID
   */
  async getActivity(activityId: number): Promise<StravaActivity> {
    return this.request<StravaActivity>(`/activities/${activityId}`)
  }

  /**
   * Fetch activities for the last N days
   */
  async fetchActivitiesForDays(days: number): Promise<StravaActivity[]> {
    const now = Math.floor(Date.now() / 1000)
    const daysAgo = now - (days * 24 * 60 * 60)

    const allActivities: StravaActivity[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const activities = await this.getActivities({
        after: daysAgo,
        before: now,
        page,
        perPage,
      })

      allActivities.push(...activities)

      // If we got fewer than perPage, we've reached the end
      if (activities.length < perPage) {
        break
      }

      page++

      // Safety limit to prevent infinite loops
      if (page > 10) {
        break
      }
    }

    return allActivities
  }
}

/**
 * Create a Strava client with auto-refresh capability
 */
export async function createStravaClient(tokens: StravaTokens): Promise<{
  client: StravaClient
  tokens: StravaTokens
}> {
  // Check if token is expired or about to expire (within 5 minutes)
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = tokens.expires_at - now

  if (expiresIn < 300) {
    // Token expired or expiring soon, refresh it
    const newTokens = await refreshAccessToken(tokens.refresh_token)
    return {
      client: new StravaClient(newTokens.access_token),
      tokens: newTokens,
    }
  }

  return {
    client: new StravaClient(tokens.access_token),
    tokens,
  }
}
