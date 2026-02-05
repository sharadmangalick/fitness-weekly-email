/**
 * Logging utilities for Stripe webhook debugging
 * Follows the same pattern as OAuth logging (lib/logging.ts)
 */

import { createAdminClient } from '@/lib/supabase-server'
import type { Database } from '@/lib/database.types'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type WebhookStep =
  | 'received'
  | 'signature_verification'
  | 'event_parsing'
  | 'db_operation'
  | 'completed'

export type WebhookStatus = 'started' | 'success' | 'failed'

export interface LogContext {
  flowId?: string
  stripeEventId?: string
  stripeEventType?: string
  step?: WebhookStep
  [key: string]: unknown
}

/**
 * Generate a unique flow ID to trace a webhook end-to-end
 * Format: stripe-{timestamp}-{random}
 */
export function generateWebhookFlowId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `stripe-${timestamp}-${random}`
}

/**
 * Mask email addresses for safe logging
 * Format: ab***@example.com (shows first 2 chars + domain)
 */
export function maskEmail(email: string | undefined | null): string {
  if (!email) return '[no-email]'

  const [local, domain] = email.split('@')
  if (!domain) return '[invalid-email]'

  const maskedLocal = local.length <= 2
    ? '***'
    : `${local.substring(0, 2)}***`

  return `${maskedLocal}@${domain}`
}

/**
 * Sanitize Stripe session data for logging
 * Removes sensitive fields, keeps session ID, amount, masked email
 */
export function sanitizeSessionData(session: {
  id: string
  amount_total?: number | null
  customer_details?: {
    email?: string | null
  } | null
}): Record<string, unknown> {
  return {
    sessionId: session.id,
    amountCents: session.amount_total || 0,
    email: session.customer_details?.email
      ? maskEmail(session.customer_details.email)
      : '[no-email]',
  }
}

/**
 * Extract error code and message from unknown error types
 */
export function extractErrorDetails(error: unknown): {
  code: string
  message: string
} {
  if (error instanceof Error) {
    return {
      code: error.name || 'Error',
      message: error.message,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>
    return {
      code: String(err.code || err.name || 'UnknownError'),
      message: String(err.message || JSON.stringify(error)),
    }
  }

  return {
    code: 'UnknownError',
    message: String(error),
  }
}

/**
 * Structured console logging with timestamp and context
 */
export function logWebhook(
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
 * Record a webhook step to the database for later debugging
 * Non-blocking - failures won't break the webhook flow
 */
export async function recordWebhookStep(params: {
  flowId: string
  stripeEventId?: string | null
  stripeEventType: string
  step: WebhookStep
  status: WebhookStatus
  durationMs?: number | null
  errorCode?: string | null
  errorMessage?: string | null
  metadata?: Record<string, unknown> | null
}): Promise<void> {
  const {
    flowId,
    stripeEventId,
    stripeEventType,
    step,
    status,
    durationMs,
    errorCode,
    errorMessage,
    metadata,
  } = params

  try {
    const supabase = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('webhook_attempts')
      .insert({
        flow_id: flowId,
        stripe_event_id: stripeEventId || null,
        stripe_event_type: stripeEventType,
        step,
        status,
        duration_ms: durationMs || null,
        error_code: errorCode || null,
        error_message: errorMessage || null,
        metadata: metadata || null,
      })

    if (error) {
      // Don't throw - logging should never break the main flow
      logWebhook('warn', 'Failed to record webhook step to database', {
        flowId,
        step,
        error: error.message,
      })
    }
  } catch (err) {
    // Don't throw - logging should never break the main flow
    logWebhook('warn', 'Exception recording webhook step', {
      flowId,
      step,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}

/**
 * Timer helper for measuring operation duration
 */
export function startTimer(): () => number {
  const start = Date.now()
  return () => Date.now() - start
}

/**
 * Helper to create a scoped logger for a webhook flow
 */
export function createWebhookLogger(flowId: string) {
  return {
    debug: (message: string, context: Omit<LogContext, 'flowId'> = {}) =>
      logWebhook('debug', message, { flowId, ...context }),

    info: (message: string, context: Omit<LogContext, 'flowId'> = {}) =>
      logWebhook('info', message, { flowId, ...context }),

    warn: (message: string, context: Omit<LogContext, 'flowId'> = {}) =>
      logWebhook('warn', message, { flowId, ...context }),

    error: (message: string, context: Omit<LogContext, 'flowId'> = {}) =>
      logWebhook('error', message, { flowId, ...context }),

    record: (params: Omit<Parameters<typeof recordWebhookStep>[0], 'flowId'>) =>
      recordWebhookStep({ ...params, flowId }),

    startTimer,
  }
}
