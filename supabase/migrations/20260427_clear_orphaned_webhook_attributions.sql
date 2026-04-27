-- Migration: Clear Orphaned Webhook Attributions
-- Purpose: The 2026-04-27 re-attribution migration only MOVED deliveries to
--   matching connections. It didn't CLEAR deliveries whose garmin_user_id
--   has no current active connection — those rows still carry whatever
--   user_id was assigned during the routing bug.
--
--   Concretely: until ben@13h.org and alex.rp.martin@gmail.com reconnect,
--   their pre-reconnect activities still appear under smangalick@gmail.com's
--   user_id (the row Postgres returned first from .limit(1) for everyone).
--   The weekly recap therefore includes other users' runs.
--
--   This migration NULLs out user_id for any row whose (user_id, garmin_user_id)
--   pair doesn't match a real platform_connections record. Once the rightful
--   owner reconnects, the standard re-attribution migration picks the rows up
--   and assigns them correctly.
--
-- Idempotent. Safe to run multiple times.
-- Created: 2026-04-27

BEGIN;

DO $$
DECLARE
    before_misattributed BIGINT;
BEGIN
    SELECT COUNT(*) INTO before_misattributed
    FROM garmin_webhook_deliveries d
    WHERE d.user_id IS NOT NULL
      AND d.garmin_user_id IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM platform_connections pc
          WHERE pc.user_id = d.user_id
            AND pc.platform = 'garmin'
            AND pc.status = 'active'
            AND pc.garmin_user_id = d.garmin_user_id
      );
    RAISE NOTICE 'Misattributed rows before clear: %', before_misattributed;
END $$;

-- Clear rows whose user_id was set during the routing bug but whose
-- garmin_user_id doesn't match the assigned user's active garmin connection.
WITH cleared AS (
    UPDATE garmin_webhook_deliveries d
       SET user_id = NULL
     WHERE d.user_id IS NOT NULL
       AND d.garmin_user_id IS NOT NULL
       AND NOT EXISTS (
           SELECT 1 FROM platform_connections pc
           WHERE pc.user_id = d.user_id
             AND pc.platform = 'garmin'
             AND pc.garmin_user_id = d.garmin_user_id
       )
    RETURNING 1
)
SELECT COUNT(*) AS rows_cleared FROM cleared;

DO $$
DECLARE
    null_user BIGINT;
    matched BIGINT;
BEGIN
    SELECT COUNT(*) FILTER (WHERE user_id IS NULL),
           COUNT(*) FILTER (
               WHERE user_id IS NOT NULL
                 AND EXISTS (
                     SELECT 1 FROM platform_connections pc
                     WHERE pc.user_id = garmin_webhook_deliveries.user_id
                       AND pc.platform = 'garmin'
                       AND pc.garmin_user_id = garmin_webhook_deliveries.garmin_user_id
                 )
           )
      INTO null_user, matched
      FROM garmin_webhook_deliveries;

    RAISE NOTICE 'AFTER clear: null_user=% (orphaned, awaiting reconnect), correctly attributed=%', null_user, matched;
END $$;

COMMIT;
