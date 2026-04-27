-- Migration: Garmin Webhook Routing Fix
-- Purpose:
--   1. Add garmin_user_id column to platform_connections so webhook handlers
--      can route an incoming webhook to the right RunPlan user, instead of
--      attaching every webhook to whichever active Garmin row Postgres
--      returned first.
--   2. Allow webhook_type values 'health_snapshot' and 'user_metrics' on
--      garmin_webhook_deliveries — Garmin already pushes those event types
--      and the existing CHECK constraint was silently rejecting them.
-- Created: 2026-04-27

-- ── 1. platform_connections.garmin_user_id ─────────────────────────────────
ALTER TABLE platform_connections
    ADD COLUMN IF NOT EXISTS garmin_user_id TEXT;

COMMENT ON COLUMN platform_connections.garmin_user_id IS
    'Garmin Connect user id returned by the OAuth token exchange. Required for routing inbound webhooks to the right RunPlan user.';

-- Lookup index used by webhook handlers on every inbound delivery.
CREATE INDEX IF NOT EXISTS idx_platform_connections_garmin_user_id
    ON platform_connections(garmin_user_id)
    WHERE platform = 'garmin' AND garmin_user_id IS NOT NULL;

-- A given Garmin account should map to at most one active RunPlan
-- connection at a time. Older expired/error rows are exempt.
CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_connections_garmin_user_active
    ON platform_connections(garmin_user_id)
    WHERE platform = 'garmin' AND status = 'active' AND garmin_user_id IS NOT NULL;

-- ── 2. Allow health_snapshot + user_metrics webhook types ──────────────────
-- Garmin pushes HEALTH_SNAPSHOT (resting HR, body battery aggregates) and
-- USER_METRICS (VO2 max, fitness age) but our original CHECK constraint
-- omitted them, so every insert was being rejected. Replace the constraint
-- with the full Garmin Health API event set we care about.
ALTER TABLE garmin_webhook_deliveries
    DROP CONSTRAINT IF EXISTS garmin_webhook_deliveries_webhook_type_check;

ALTER TABLE garmin_webhook_deliveries
    ADD CONSTRAINT garmin_webhook_deliveries_webhook_type_check
    CHECK (webhook_type IN (
        'activity',
        'daily_summary',
        'sleep',
        'heart_rate',
        'stress',
        'body_battery',
        'health_snapshot',
        'user_metrics',
        'deregistration',
        'user_permission'
    ));
