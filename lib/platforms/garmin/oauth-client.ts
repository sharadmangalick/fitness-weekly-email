/**
 * Garmin OAuth 2.0 API Client
 *
 * Uses OAuth 2.0 for authentication and the Garmin Health/Activity APIs for data fetching.
 * This replaces the unofficial garmin-connect package with official OAuth.
 */

import { log, maskSensitive } from '@/lib/logging'
import type { GarminOAuthTokens } from '../interface'
import type {
  GarminActivityRaw,
  GarminSleepRaw,
  GarminHeartRateRaw,
  GarminDailyStatsRaw,
  GarminVO2MaxRaw,
} from './client'

const GARMIN_OAUTH_BASE_URL = process.env.GARMIN_OAUTH_BASE_URL || 'https://connect.garmin.com/oauth2Confirm'
const GARMIN_TOKEN_URL = process.env.GARMIN_TOKEN_URL || 'https://connectapi.garmin.com/oauth-service/oauth/token'
const GARMIN_API_BASE_URL = process.env.GARMIN_API_BASE_URL || 'https://apis.garmin.com/wellness-api/rest'

/**
 * Generate a PKCE code verifier and challenge.
 * Garmin OAuth 2.0 requires PKCE (S256).
 */
function generatePKCE(): { verifier: string; challenge: string } {
  const crypto = require('crypto')
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

/**
 * Generate the Garmin OAuth 2.0 authorization URL with PKCE.
 * Auth endpoint: https://connect.garmin.com/oauth2Confirm
 */
export function getGarminAuthUrl(state?: string): { url: string; codeVerifier: string } {
  const clientId = process.env.GARMIN_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_GARMIN_REDIRECT_URI

  if (!clientId || !redirectUri) {
    throw new Error('GARMIN_CLIENT_ID and NEXT_PUBLIC_GARMIN_REDIRECT_URI must be set')
  }

  const { verifier, challenge } = generatePKCE()

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    ...(state && { state }),
  })

  return {
    url: `${GARMIN_OAUTH_BASE_URL}?${params.toString()}`,
    codeVerifier: verifier,
  }
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  flowId?: string
): Promise<GarminOAuthTokens> {
  const clientId = process.env.GARMIN_CLIENT_ID
  const clientSecret = process.env.GARMIN_CLIENT_SECRET

  log('info', 'Token exchange: checking environment', {
    flowId,
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    codeLength: code?.length || 0,
  })

  if (!clientId || !clientSecret) {
    log('error', 'Token exchange: missing credentials', { flowId })
    throw new Error('GARMIN_CLIENT_ID and GARMIN_CLIENT_SECRET must be set')
  }

  log('info', 'Token exchange: requesting tokens from Garmin', {
    flowId,
    url: GARMIN_TOKEN_URL,
    clientId: maskSensitive(clientId),
  })

  const redirectUri = process.env.NEXT_PUBLIC_GARMIN_REDIRECT_URI

  // Create Basic Auth header (standard OAuth 2.0 client authentication)
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(GARMIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri!,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    log('error', 'Token exchange failed', {
      flowId,
      status: response.status,
      statusText: response.statusText,
      errorBody: errorText,
    })
    throw new Error(`Garmin token exchange failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  log('info', 'Token exchange successful', {
    flowId,
    hasAccessToken: !!data.access_token,
    hasRefreshToken: !!data.refresh_token,
    expiresIn: data.expires_in,
    userId: data.user_id,
  })

  // Garmin returns expires_in (seconds from now), convert to expires_at (Unix timestamp)
  const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 3600)

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAt,
    user_id: data.user_id,
    token_type: data.token_type || 'Bearer',
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  flowId?: string
): Promise<GarminOAuthTokens> {
  const clientId = process.env.GARMIN_CLIENT_ID
  const clientSecret = process.env.GARMIN_CLIENT_SECRET

  log('info', 'Token refresh: requesting new tokens', {
    flowId,
    hasRefreshToken: !!refreshToken,
  })

  if (!clientId || !clientSecret) {
    throw new Error('GARMIN_CLIENT_ID and GARMIN_CLIENT_SECRET must be set')
  }

  // Create Basic Auth header (standard OAuth 2.0 client authentication)
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(GARMIN_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    log('error', 'Token refresh failed', {
      flowId,
      status: response.status,
      statusText: response.statusText,
      errorBody: errorText,
    })
    throw new Error(`Garmin token refresh failed: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  log('info', 'Token refresh successful', {
    flowId,
    hasAccessToken: !!data.access_token,
    hasRefreshToken: !!data.refresh_token,
    expiresIn: data.expires_in,
  })

  const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 3600)

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: expiresAt,
    user_id: data.user_id,
    token_type: data.token_type || 'Bearer',
  }
}

/**
 * Garmin OAuth API Client
 */
export class GarminOAuthClient {
  private accessToken: string
  private baseUrl: string = GARMIN_API_BASE_URL

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Make authenticated request to Garmin API
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    log('info', 'Garmin API request', {
      endpoint,
      method: options?.method || 'GET',
    })

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      log('error', 'Garmin API request failed', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
      })

      // Rate limiting
      if (response.status === 429) {
        throw new Error('Garmin API rate limit exceeded')
      }

      throw new Error(`Garmin API error: ${response.status} ${errorText}`)
    }

    return response.json()
  }

  /**
   * Get date range for queries (YYYY-MM-DD format)
   */
  private getDateRange(days: number): { startDate: string; endDate: string } {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)

    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    }
  }

  /**
   * Fetch activities for the specified number of days
   *
   * Garmin Health API endpoint: /activities
   * Returns running activities with distance, duration, HR, etc.
   */
  async getActivities(days: number): Promise<GarminActivityRaw[]> {
    const { startDate, endDate } = this.getDateRange(days)

    try {
      // Garmin Health API activities endpoint
      // Note: Actual endpoint may vary based on Garmin's API documentation
      // This is a placeholder structure - adjust based on official docs
      const response = await this.request<GarminActivityRaw[]>(
        `/activities?startDate=${startDate}&endDate=${endDate}&activityType=running`
      )

      return response || []
    } catch (error) {
      log('error', 'Failed to fetch Garmin activities', { error, days })
      return []
    }
  }

  /**
   * Fetch sleep data for the specified number of days
   *
   * Garmin Health API endpoint: /sleep
   */
  async getSleepData(days: number): Promise<{ date: string; data: GarminSleepRaw }[]> {
    const { startDate, endDate } = this.getDateRange(days)

    try {
      const response = await this.request<any>(
        `/sleep?startDate=${startDate}&endDate=${endDate}`
      )

      // Transform response to match expected format
      // Adjust based on actual Garmin API response structure
      if (Array.isArray(response)) {
        return response.map(item => ({
          date: item.calendarDate || item.date,
          data: item
        }))
      }

      return []
    } catch (error) {
      log('error', 'Failed to fetch Garmin sleep data', { error, days })
      return []
    }
  }

  /**
   * Fetch daily summaries for the specified number of days
   *
   * Garmin Health API endpoint: /dailies
   */
  async getDailySummaries(days: number): Promise<{ date: string; data: GarminDailyStatsRaw }[]> {
    const { startDate, endDate } = this.getDateRange(days)

    try {
      const response = await this.request<any>(
        `/dailies?startDate=${startDate}&endDate=${endDate}`
      )

      if (Array.isArray(response)) {
        return response.map(item => ({
          date: item.calendarDate || item.date,
          data: item
        }))
      }

      return []
    } catch (error) {
      log('error', 'Failed to fetch Garmin daily summaries', { error, days })
      return []
    }
  }

  /**
   * Fetch heart rate data for the specified number of days
   *
   * Garmin Health API endpoint: /heartRates
   */
  async getHeartRateData(days: number): Promise<{ date: string; data: GarminHeartRateRaw }[]> {
    const { startDate, endDate } = this.getDateRange(days)

    try {
      const response = await this.request<any>(
        `/heartRates?startDate=${startDate}&endDate=${endDate}`
      )

      if (Array.isArray(response)) {
        return response.map(item => ({
          date: item.calendarDate || item.date,
          data: item
        }))
      }

      return []
    } catch (error) {
      log('error', 'Failed to fetch Garmin heart rate data', { error, days })
      return []
    }
  }

  /**
   * Fetch stress data for the specified number of days
   *
   * Garmin Health API endpoint: /stress
   */
  async getStressData(days: number): Promise<any[]> {
    const { startDate, endDate } = this.getDateRange(days)

    try {
      const response = await this.request<any>(
        `/stress?startDate=${startDate}&endDate=${endDate}`
      )

      return Array.isArray(response) ? response : []
    } catch (error) {
      log('error', 'Failed to fetch Garmin stress data', { error, days })
      return []
    }
  }

  /**
   * Fetch body battery data for the specified number of days
   *
   * Garmin Health API endpoint: /bodyBattery
   */
  async getBodyBattery(days: number): Promise<any[]> {
    const { startDate, endDate } = this.getDateRange(days)

    try {
      const response = await this.request<any>(
        `/bodyBattery?startDate=${startDate}&endDate=${endDate}`
      )

      return Array.isArray(response) ? response : []
    } catch (error) {
      log('error', 'Failed to fetch Garmin body battery data', { error, days })
      return []
    }
  }

  /**
   * Fetch VO2 max data
   *
   * Garmin Health API endpoint: /vo2Max
   */
  async getVO2Max(): Promise<GarminVO2MaxRaw | null> {
    try {
      const response = await this.request<GarminVO2MaxRaw>('/vo2Max')
      return response
    } catch (error) {
      log('error', 'Failed to fetch Garmin VO2 max data', { error })
      return null
    }
  }

  /**
   * Fetch all data types for the specified number of days
   */
  async fetchAll(days: number) {
    const [activities, sleep, heartRate, dailySummaries, stress, bodyBattery, vo2max] = await Promise.allSettled([
      this.getActivities(days),
      this.getSleepData(days),
      this.getHeartRateData(days),
      this.getDailySummaries(days),
      this.getStressData(days),
      this.getBodyBattery(days),
      this.getVO2Max(),
    ])

    return {
      activities: activities.status === 'fulfilled' ? activities.value : [],
      sleep: sleep.status === 'fulfilled' ? sleep.value : [],
      heartRate: heartRate.status === 'fulfilled' ? heartRate.value : [],
      dailySummaries: dailySummaries.status === 'fulfilled' ? dailySummaries.value : [],
      stress: stress.status === 'fulfilled' ? stress.value : [],
      bodyBattery: bodyBattery.status === 'fulfilled' ? bodyBattery.value : [],
      vo2max: vo2max.status === 'fulfilled' && vo2max.value ? [{ date: new Date().toISOString().split('T')[0], data: vo2max.value }] : [],
    }
  }
}
