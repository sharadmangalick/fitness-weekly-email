/**
 * Logging utilities for OAuth flow debugging
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type OAuthStep =
  | 'initiation'
  | 'callback_received'
  | 'state_validation'
  | 'token_exchange'
  | 'token_encryption'
  | 'db_storage'
  | 'verification'
  | 'completed'

export type OAuthStatus = 'started' | 'success' | 'failed'

export interface LogContext {
  flowId?: string
  userId?: string
  platform?: string
  step?: OAuthStep
  [key: string]: unknown
}

/**
 * Generate a unique flow ID to trace an OAuth attempt end-to-end
 * Format: strava-{timestamp}-{random}
 */
export function generateFlowId(platform: string = 'strava'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${platform}-${timestamp}-${random}`
}

/**
 * Mask sensitive values for safe logging
 * Shows first 4 and last 4 characters for values > 12 chars
 */
export function maskSensitive(value: string | undefined | null): string {
  if (!value) return '[empty]'
  if (value.length <= 12) return '[redacted]'
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
}

/**
 * Structured console logging with timestamp and context
 */
export function log(
  level: LogLevel,
  message: string,
  context: LogContext = {}
): void {
  const timestamp = new Date().toISOString()
  const { flowId, ...rest } = context

  const logData = {
    timestamp,
    level,
    message,
    ...(flowId && { flowId }),
    ...rest,
  }

  // In production, use structured JSON logging
  // In development, use more readable format
  if (process.env.NODE_ENV === 'production') {
    console[level](JSON.stringify(logData))
  } else {
    const prefix = flowId ? `[${flowId}]` : ''
    const contextStr = Object.keys(rest).length > 0
      ? ` ${JSON.stringify(rest)}`
      : ''
    console[level](`${timestamp} ${level.toUpperCase()} ${prefix} ${message}${contextStr}`)
  }
}

/**
 * Record an OAuth step to the database for later debugging
 * This persists the step information for troubleshooting user issues
 */
export async function recordOAuthStep(params: {
  userId?: string
  platform: string
  flowId: string
  step: OAuthStep
  status: OAuthStatus
  errorCode?: string
  errorMessage?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  const { userId, platform, flowId, step, status, errorCode, errorMessage, metadata } = params

  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('oauth_attempts')
      .insert({
        user_id: userId || null,
        platform,
        flow_id: flowId,
        step,
        status,
        error_code: errorCode || null,
        error_message: errorMessage || null,
        metadata: metadata || null,
      })

    if (error) {
      // Don't throw - logging should never break the main flow
      log('warn', 'Failed to record OAuth step to database', {
        flowId,
        step,
        error: error.message,
      })
    }
  } catch (err) {
    // Don't throw - logging should never break the main flow
    log('warn', 'Exception recording OAuth step', {
      flowId,
      step,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}

/**
 * Helper to create a scoped logger for an OAuth flow
 */
export function createOAuthLogger(flowId: string, platform: string = 'strava') {
  return {
    debug: (message: string, context: Omit<LogContext, 'flowId' | 'platform'> = {}) =>
      log('debug', message, { flowId, platform, ...context }),
    info: (message: string, context: Omit<LogContext, 'flowId' | 'platform'> = {}) =>
      log('info', message, { flowId, platform, ...context }),
    warn: (message: string, context: Omit<LogContext, 'flowId' | 'platform'> = {}) =>
      log('warn', message, { flowId, platform, ...context }),
    error: (message: string, context: Omit<LogContext, 'flowId' | 'platform'> = {}) =>
      log('error', message, { flowId, platform, ...context }),
    record: (params: Omit<Parameters<typeof recordOAuthStep>[0], 'flowId' | 'platform'>) =>
      recordOAuthStep({ ...params, flowId, platform }),
  }
}
