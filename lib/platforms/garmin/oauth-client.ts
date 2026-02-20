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
const GARMIN_TOKEN_URL = process.env.GARMIN_TOKEN_URL || 'https://diauth.garmin.com/di-oauth2-service/oauth/token'
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
   * Get date range for queries (YYYY-MM-DD format).
   * Used by endpoints that require date string params (heartRates, bodyBattery).
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
   * Get 24-hour chunk ranges for the specified number of days.
   * Garmin pull API enforces a max 86400-second (24h) window per request.
   * Returns an array of { start, end } pairs to iterate over.
   */
  private get24hChunks(days: number): { start: number; end: number }[] {
    const now = Math.floor(Date.now() / 1000)
    const chunks: { start: number; end: number }[] = []
    for (let d = 0; d < days; d++) {
      const end = now - d * 86400
      const start = end - 86400
      chunks.push({ start, end })
    }
    return chunks
  }

  /**
   * Fetch activities for the specified number of days.
   *
   * Garmin Health API endpoint: /activities
   * Uses uploadStartTimeInSeconds / uploadEndTimeInSeconds params.
   * Returns all activity types — filter for RUNNING in the adapter.
   */
  async getActivities(days: number): Promise<GarminActivityRaw[]> {
    const chunks = this.get24hChunks(days)
    const all: GarminActivityRaw[] = []

    for (const { start, end } of chunks) {
      try {
        const response = await this.request<any>(
          `/activities?uploadStartTimeInSeconds=${start}&uploadEndTimeInSeconds=${end}`
        )
        const items = response?.activities || []
        all.push(...items)
      } catch (error) {
        log('error', 'Failed to fetch Garmin activities', { error: String(error), days })
      }
    }

    return all
  }

  /**
   * Fetch sleep data for the specified number of days.
   *
   * Garmin Health API endpoint: /sleeps
   * Uses uploadStartTimeInSeconds / uploadEndTimeInSeconds params.
   */
  async getSleepData(days: number): Promise<{ date: string; data: GarminSleepRaw }[]> {
    const chunks = this.get24hChunks(days)
    const all: { date: string; data: GarminSleepRaw }[] = []

    for (const { start, end } of chunks) {
      try {
        const response = await this.request<any>(
          `/sleeps?uploadStartTimeInSeconds=${start}&uploadEndTimeInSeconds=${end}`
        )
        const items: GarminSleepRaw[] = response?.sleeps || []
        all.push(...items.map(item => ({ date: item.calendarDate || '', data: item })))
      } catch (error) {
        log('error', 'Failed to fetch Garmin sleep data', { error: String(error), days })
      }
    }

    return all
  }

  /**
   * Fetch daily summaries for the specified number of days.
   *
   * Garmin Health API endpoint: /dailies
   * Uses uploadStartTimeInSeconds / uploadEndTimeInSeconds params.
   */
  async getDailySummaries(days: number): Promise<{ date: string; data: GarminDailyStatsRaw }[]> {
    const chunks = this.get24hChunks(days)
    const all: { date: string; data: GarminDailyStatsRaw }[] = []

    for (const { start, end } of chunks) {
      try {
        const response = await this.request<any>(
          `/dailies?uploadStartTimeInSeconds=${start}&uploadEndTimeInSeconds=${end}`
        )
        const items: GarminDailyStatsRaw[] = response?.dailies || []
        all.push(...items.map(item => ({ date: item.calendarDate || '', data: item })))
      } catch (error) {
        log('error', 'Failed to fetch Garmin daily summaries', { error: String(error), days })
      }
    }

    return all
  }

  /**
   * Fetch heart rate data for the specified number of days.
   *
   * Garmin Health API endpoint: /heartRates
   * Uses date string params (this endpoint does not support unix timestamps).
   */
  async getHeartRateData(days: number): Promise<{ date: string; data: GarminHeartRateRaw }[]> {
    const { startDate, endDate } = this.getDateRange(days)

    try {
      const response = await this.request<any>(
        `/heartRates?startDate=${startDate}&endDate=${endDate}`
      )

      const items: GarminHeartRateRaw[] = response?.heartRates || []
      return items.map(item => ({
        date: item.calendarDate || '',
        data: item,
      }))
    } catch (error) {
      log('error', 'Failed to fetch Garmin heart rate data', { error: String(error), days })
      return []
    }
  }

  /**
   * Fetch stress data for the specified number of days.
   *
   * Garmin Health API endpoint: /stressDetails
   * Uses uploadStartTimeInSeconds / uploadEndTimeInSeconds params.
   */
  async getStressData(days: number): Promise<any[]> {
    const chunks = this.get24hChunks(days)
    const all: any[] = []

    for (const { start, end } of chunks) {
      try {
        const response = await this.request<any>(
          `/stressDetails?uploadStartTimeInSeconds=${start}&uploadEndTimeInSeconds=${end}`
        )
        all.push(...(response?.stressDetails || []))
      } catch (error) {
        log('error', 'Failed to fetch Garmin stress data', { error: String(error), days })
      }
    }

    return all
  }

  /**
   * Fetch body battery data for the specified number of days.
   *
   * Garmin Health API endpoint: /bodyBattery
   * Uses date string params.
   */
  async getBodyBattery(days: number): Promise<any[]> {
    const { startDate, endDate } = this.getDateRange(days)

    try {
      const response = await this.request<any>(
        `/bodyBattery?startDate=${startDate}&endDate=${endDate}`
      )

      // Response may be a wrapped object or bare array depending on API version
      if (Array.isArray(response)) return response
      return response?.bodyBatteryReadings || response?.bodyBattery || []
    } catch (error) {
      log('error', 'Failed to fetch Garmin body battery data', { error: String(error), days })
      return []
    }
  }

  /**
   * Fetch epoch summaries for the specified number of days.
   *
   * Garmin Health API endpoint: /epochs
   * Uses uploadStartTimeInSeconds / uploadEndTimeInSeconds params.
   */
  async getEpochs(days: number): Promise<any[]> {
    const chunks = this.get24hChunks(days)
    const all: any[] = []

    for (const { start, end } of chunks) {
      try {
        const response = await this.request<any>(
          `/epochs?uploadStartTimeInSeconds=${start}&uploadEndTimeInSeconds=${end}`
        )
        all.push(...(response?.epochs || []))
      } catch (error) {
        log('error', 'Failed to fetch Garmin epochs', { error: String(error), days })
      }
    }

    return all
  }

  /**
   * Fetch HRV (Heart Rate Variability) data for the specified number of days.
   *
   * Garmin Health API endpoint: /hrv
   * Uses uploadStartTimeInSeconds / uploadEndTimeInSeconds params.
   */
  async getHRV(days: number): Promise<any[]> {
    const chunks = this.get24hChunks(days)
    const all: any[] = []

    for (const { start, end } of chunks) {
      try {
        const response = await this.request<any>(
          `/hrv?uploadStartTimeInSeconds=${start}&uploadEndTimeInSeconds=${end}`
        )
        all.push(...(response?.hrv || response?.hrvSummaries || []))
      } catch (error) {
        log('error', 'Failed to fetch Garmin HRV data', { error: String(error), days })
      }
    }

    return all
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
      log('error', 'Failed to fetch Garmin VO2 max data', { error: String(error) })
      return null
    }
  }

  /**
   * Fetch all pull-available data types for the specified number of days.
   * Note: heartRates, bodyBattery, and vo2Max are push-only (404 on pull).
   */
  async fetchAll(days: number) {
    const [activities, sleep, dailySummaries, stress, epochs, hrv] = await Promise.allSettled([
      this.getActivities(days),
      this.getSleepData(days),
      this.getDailySummaries(days),
      this.getStressData(days),
      this.getEpochs(days),
      this.getHRV(days),
    ])

    return {
      activities: activities.status === 'fulfilled' ? activities.value : [],
      sleep: sleep.status === 'fulfilled' ? sleep.value : [],
      dailySummaries: dailySummaries.status === 'fulfilled' ? dailySummaries.value : [],
      stress: stress.status === 'fulfilled' ? stress.value : [],
      epochs: epochs.status === 'fulfilled' ? epochs.value : [],
      hrv: hrv.status === 'fulfilled' ? hrv.value : [],
    }
  }
}
