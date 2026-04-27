-- Migration: Re-attribute Historical Garmin Webhook Deliveries
-- Purpose: Until 2026-04-27 the webhook router didn't filter by Garmin's
--   userId, so all incoming webhooks were attributed to whichever active
--   Garmin connection happened to be returned first. This migration walks
--   garmin_webhook_deliveries and rewrites user_id to match the
--   platform_connections row that owns each garmin_user_id.
--
-- Prereqs:
--   - 20260427_garmin_routing_fix.sql applied (adds platform_connections.garmin_user_id)
--   - scripts/backfill-garmin-user-ids.mjs run successfully (populates the new column)
--
-- Safe to run more than once: the WHERE clause skips rows that are already
-- correctly attributed.
-- Created: 2026-04-27

BEGIN;

-- Snapshot counts before
DO $$
DECLARE
    total BIGINT;
    null_user BIGINT;
    distinct_garmin BIGINT;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE user_id IS NULL),
           COUNT(DISTINCT garmin_user_id)
      INTO total, null_user, distinct_garmin
      FROM garmin_webhook_deliveries;

    RAISE NOTICE 'BEFORE re-attribution: total=%, null_user=%, distinct_garmin_user_ids=%',
        total, null_user, distinct_garmin;
END $$;

-- Re-attribute. Match by garmin_user_id; ignore rows already correct.
WITH updated AS (
    UPDATE garmin_webhook_deliveries d
       SET user_id = pc.user_id
      FROM platform_connections pc
     WHERE pc.platform = 'garmin'
       AND pc.garmin_user_id = d.garmin_user_id
       AND (d.user_id IS DISTINCT FROM pc.user_id)
    RETURNING 1
)
SELECT COUNT(*) AS rows_updated FROM updated;

-- Snapshot counts after
DO $$
DECLARE
    null_user BIGINT;
    unmatched BIGINT;
BEGIN
    SELECT COUNT(*) FILTER (WHERE user_id IS NULL),
           COUNT(*) FILTER (
               WHERE user_id IS NULL
                 AND garmin_user_id NOT IN (
                     SELECT garmin_user_id FROM platform_connections
                      WHERE platform = 'garmin' AND garmin_user_id IS NOT NULL
                 )
           )
      INTO null_user, unmatched
      FROM garmin_webhook_deliveries;

    RAISE NOTICE 'AFTER re-attribution: null_user=%, unmatched=%',
        null_user, unmatched;
END $$;

COMMIT;
