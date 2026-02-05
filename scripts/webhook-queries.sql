-- Webhook Debugging SQL Queries
-- Copy and paste these queries into Supabase SQL Editor or psql

-- ====================
-- RECENT ACTIVITY
-- ====================

-- Recent webhook attempts (last 24 hours)
SELECT
  flow_id,
  stripe_event_id,
  stripe_event_type,
  step,
  status,
  duration_ms,
  error_code,
  error_message,
  created_at
FROM webhook_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 50;

-- ====================
-- FAILURE ANALYSIS
-- ====================

-- Recent failures only
SELECT
  flow_id,
  stripe_event_id,
  stripe_event_type,
  step,
  error_code,
  error_message,
  created_at
FROM webhook_attempts
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Failure rate by event type (last 7 days)
SELECT
  stripe_event_type,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures,
  ROUND(100.0 * SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate_pct
FROM webhook_attempts
WHERE step = 'completed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY stripe_event_type
ORDER BY failure_rate_pct DESC;

-- Failures by error code (last 7 days)
SELECT
  error_code,
  COUNT(*) as count,
  array_agg(DISTINCT stripe_event_type) as affected_event_types,
  MAX(created_at) as last_occurrence
FROM webhook_attempts
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_code
ORDER BY count DESC;

-- ====================
-- SPECIFIC WEBHOOK TRACING
-- ====================

-- Trace webhook by Stripe event ID
-- Replace 'evt_xxxxx' with actual event ID from Stripe dashboard
SELECT
  flow_id,
  step,
  status,
  duration_ms,
  error_code,
  error_message,
  metadata,
  created_at
FROM webhook_attempts
WHERE stripe_event_id = 'evt_xxxxx'
ORDER BY created_at;

-- Trace entire flow by flow ID
-- Replace 'stripe-xxxxx' with actual flow ID from logs
SELECT
  step,
  status,
  duration_ms,
  error_code,
  error_message,
  metadata,
  created_at
FROM webhook_attempts
WHERE flow_id = 'stripe-xxxxx'
ORDER BY created_at;

-- Find webhooks for a specific session ID
-- Replace 'cs_xxxxx' with actual Stripe session ID
SELECT
  flow_id,
  stripe_event_id,
  step,
  status,
  error_code,
  created_at
FROM webhook_attempts
WHERE metadata->>'sessionId' = 'cs_xxxxx'
ORDER BY created_at;

-- ====================
-- PERFORMANCE ANALYSIS
-- ====================

-- Average processing time by step (last 7 days)
SELECT
  step,
  COUNT(*) as attempts,
  ROUND(AVG(duration_ms)::numeric, 2) as avg_ms,
  MAX(duration_ms) as max_ms,
  MIN(duration_ms) as min_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99_ms
FROM webhook_attempts
WHERE duration_ms IS NOT NULL
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY step
ORDER BY avg_ms DESC;

-- Slow webhooks (>2 seconds end-to-end)
SELECT
  flow_id,
  stripe_event_id,
  stripe_event_type,
  SUM(duration_ms) as total_duration_ms,
  COUNT(*) as steps_count,
  MIN(created_at) as started_at,
  MAX(created_at) as completed_at
FROM webhook_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY flow_id, stripe_event_id, stripe_event_type
HAVING SUM(duration_ms) > 2000
ORDER BY total_duration_ms DESC;

-- ====================
-- IDEMPOTENCY & RETRIES
-- ====================

-- Idempotent retries detected (last 7 days)
SELECT
  stripe_event_id,
  metadata->>'sessionId' as session_id,
  COUNT(*) as retry_count,
  MIN(created_at) as first_attempt,
  MAX(created_at) as last_attempt
FROM webhook_attempts
WHERE metadata->>'idempotent' = 'true'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY stripe_event_id, metadata->>'sessionId'
ORDER BY retry_count DESC;

-- Check for duplicate donations (should be empty!)
SELECT
  stripe_session_id,
  COUNT(*) as count,
  array_agg(id) as donation_ids,
  array_agg(created_at) as created_times
FROM donations
GROUP BY stripe_session_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- ====================
-- DONATIONS CORRELATION
-- ====================

-- Recent successful donations with webhook tracking
SELECT
  wa.flow_id,
  wa.stripe_event_id,
  wa.created_at as webhook_received_at,
  d.id as donation_id,
  d.stripe_session_id,
  d.amount_cents,
  d.email,
  d.created_at as donation_created_at,
  (d.created_at - wa.created_at) as processing_delay
FROM webhook_attempts wa
JOIN donations d ON d.stripe_session_id = (wa.metadata->>'sessionId')
WHERE wa.step = 'completed'
  AND wa.status = 'success'
  AND wa.created_at > NOW() - INTERVAL '24 hours'
ORDER BY wa.created_at DESC
LIMIT 20;

-- Missing donations (webhook succeeded but no donation record)
SELECT
  flow_id,
  stripe_event_id,
  metadata->>'sessionId' as session_id,
  metadata->>'amountCents' as amount_cents,
  metadata->>'email' as masked_email,
  created_at
FROM webhook_attempts
WHERE step = 'db_operation'
  AND status = 'success'
  AND metadata->>'sessionId' IS NOT NULL
  AND created_at > NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM donations d
    WHERE d.stripe_session_id = (webhook_attempts.metadata->>'sessionId')
  )
ORDER BY created_at DESC;

-- ====================
-- SIGNATURE ISSUES
-- ====================

-- Signature verification failures (may indicate config issues)
SELECT
  COUNT(*) as total_failures,
  MAX(created_at) as last_failure,
  array_agg(DISTINCT error_code) as error_codes
FROM webhook_attempts
WHERE step = 'signature_verification'
  AND status = 'failed'
  AND created_at > NOW() - INTERVAL '24 hours';

-- ====================
-- HOURLY TRENDS
-- ====================

-- Webhook volume and failure rate by hour (last 24 hours)
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total_webhooks,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures,
  ROUND(100.0 * SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate_pct,
  ROUND(AVG(duration_ms)::numeric, 2) as avg_duration_ms
FROM webhook_attempts
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND step = 'completed'
GROUP BY hour
ORDER BY hour DESC;

-- ====================
-- CLEANUP QUERIES (USE WITH CAUTION)
-- ====================

-- Count records older than 90 days (for retention planning)
SELECT COUNT(*) as old_records_count
FROM webhook_attempts
WHERE created_at < NOW() - INTERVAL '90 days';

-- Delete records older than 90 days (UNCOMMENT CAREFULLY)
-- DELETE FROM webhook_attempts
-- WHERE created_at < NOW() - INTERVAL '90 days';
-- SELECT COUNT(*) as deleted_count FROM webhook_attempts WHERE false; -- shows deletion count

-- ====================
-- TABLE STATISTICS
-- ====================

-- Overall webhook_attempts table stats
SELECT
  COUNT(*) as total_records,
  COUNT(DISTINCT flow_id) as unique_flows,
  COUNT(DISTINCT stripe_event_id) as unique_events,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record,
  pg_size_pretty(pg_total_relation_size('webhook_attempts')) as table_size
FROM webhook_attempts;

-- Event type distribution
SELECT
  stripe_event_type,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM webhook_attempts
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY stripe_event_type
ORDER BY count DESC;
