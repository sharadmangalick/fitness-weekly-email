/**
 * Garmin Webhook Routing
 *
 * Resolves an incoming Garmin webhook to the RunPlan user it belongs to,
 * by matching the Garmin-supplied user id against platform_connections.
 *
 * Background: prior to 2026-04-27 every webhook handler did
 * `.eq('platform','garmin').eq('status','active').limit(1)` with no filter
 * on the inbound Garmin user — so all users' webhooks landed on whichever
 * row Postgres returned first. This module is the single replacement.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { log } from '@/lib/logging'

export interface ResolvedConnection {
  id: string
  user_id: string
}

/**
 * Look up the active Garmin connection for the given Garmin user id.
 * Returns null if no match — callers should still persist the delivery
 * with user_id=NULL so we don't drop data while debugging.
 */
export async function findConnectionByGarminUserId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  garminUserId: string | null | undefined,
): Promise<ResolvedConnection | null> {
  if (!garminUserId) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('platform_connections')
    .select('id, user_id')
    .eq('platform', 'garmin')
    .eq('status', 'active')
    .eq('garmin_user_id', garminUserId)
    .maybeSingle()

  if (error) {
    log('error', 'Garmin connection lookup failed', { garminUserId, error: error.message })
    return null
  }

  return data ?? null
}

/**
 * Build the row to insert into garmin_webhook_deliveries. If the Garmin
 * user id can't be resolved to a RunPlan user, user_id is left NULL so
 * the delivery is preserved for later re-attribution / debugging.
 */
export function buildDeliveryRow(params: {
  connection: ResolvedConnection | null
  garminUserId: string | null | undefined
  webhookType: string
  payload: unknown
  processed?: boolean
  processedAt?: string
}) {
  return {
    user_id: params.connection?.user_id ?? null,
    webhook_type: params.webhookType,
    garmin_user_id: params.garminUserId ?? null,
    payload: params.payload,
    processed: params.processed ?? false,
    processed_at: params.processedAt ?? null,
  }
}
