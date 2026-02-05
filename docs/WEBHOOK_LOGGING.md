# Stripe Webhook Logging

Comprehensive logging system for tracking Stripe webhook processing with end-to-end visibility.

## Overview

The webhook logging system provides:
- **Flow ID tracking** for tracing each webhook end-to-end
- **Database persistence** to `webhook_attempts` table
- **Step-by-step logging** with timing metrics
- **Sensitive data masking** (emails partially masked)
- **Improved error handling** (returns 500 for DB errors so Stripe retries)
- **Idempotency** to prevent duplicate donations on retry

## Architecture

Following the same pattern as OAuth logging (`lib/logging.ts`), the webhook logging consists of:

1. **Database Table**: `webhook_attempts` (similar to `oauth_attempts`)
2. **Logging Utilities**: `lib/webhook-logging.ts`
3. **Enhanced Webhook Route**: `app/api/donate/webhook/route.ts`

## Database Schema

```sql
CREATE TABLE webhook_attempts (
  id UUID PRIMARY KEY,
  flow_id TEXT NOT NULL,              -- Format: stripe-{timestamp}-{random}
  stripe_event_id TEXT,                -- Stripe's event ID (e.g., evt_xxx)
  stripe_event_type TEXT NOT NULL,     -- e.g., checkout.session.completed
  step TEXT NOT NULL,                  -- Webhook processing step
  status TEXT NOT NULL,                -- 'started', 'success', 'failed'
  duration_ms INTEGER,                 -- Operation duration
  error_code TEXT,                     -- Error classification
  error_message TEXT,                  -- Error details
  metadata JSONB,                      -- Sanitized context data
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes
- `idx_webhook_attempts_flow_id` - Trace entire webhook flow
- `idx_webhook_attempts_stripe_event_id` - Correlate with Stripe dashboard
- `idx_webhook_attempts_status_created` - Find recent failures
- `idx_webhook_attempts_event_type` - Analyze by event type

## Webhook Processing Steps

Each webhook goes through these logged steps:

1. **`received`** - Initial webhook request received
2. **`signature_verification`** - Stripe signature validation
3. **`event_parsing`** - Event type routing and parsing
4. **`db_operation`** - Database insert operation
5. **`completed`** - Successful completion

## Error Codes

Standard error codes used in the system:

- `SIGNATURE_MISSING` - No stripe-signature header present
- `SIGNATURE_INVALID` - Signature verification failed
- `WEBHOOK_SECRET_MISSING` - Environment variable not configured
- `DB_INSERT_FAILED` - Database operation failed
- `UNKNOWN_ERROR` - Catch-all for unexpected errors

## Data Masking

Sensitive data is masked before logging:

- **Emails**: `ab***@example.com` (first 2 chars + domain)
- **Session IDs**: Logged fully (needed for Stripe correlation)
- **Amounts**: Logged in cents (not PII)
- **Customer details**: Full email, phone, name, address NOT logged

## Key Features

### 1. Idempotency
Prevents duplicate donations when Stripe retries:
```typescript
// Check if already processed
const { data: existing } = await supabase
  .from('donations')
  .select('id')
  .eq('stripe_session_id', session.id)
  .single()

if (existing) {
  // Return success without duplicate insert
  return NextResponse.json({ received: true, duplicate: true })
}
```

### 2. Proper Error Handling
Returns 500 for database errors (not 200) to enable Stripe retry:
```typescript
catch (dbError) {
  // Return 500 so Stripe will retry
  return NextResponse.json(
    { error: 'Database error', retry: true },
    { status: 500 }
  )
}
```

### 3. Performance Tracking
Records timing for each operation:
```typescript
const timer = logger.startTimer()
// ... operation ...
const duration = timer()  // milliseconds

await logger.record({
  step: 'db_operation',
  status: 'success',
  durationMs: duration
})
```

## Running the Migration

### Development
```bash
# Using psql
psql $DATABASE_URL -f supabase/migrations/008_webhook_attempts.sql

# Verify table exists
psql $DATABASE_URL -c "\d webhook_attempts"
```

### Production (Vercel)
The migration will be applied automatically on next deployment, or manually via Supabase dashboard:
1. Go to SQL Editor in Supabase dashboard
2. Paste contents of `supabase/migrations/008_webhook_attempts.sql`
3. Execute

## Testing

### Local Testing with Stripe CLI

1. **Start the dev server:**
```bash
npm run dev
```

2. **Run the test script:**
```bash
./scripts/test-webhook.sh
```

This will:
- Check if Stripe CLI is installed
- Verify server is running
- Start listening for webhooks

3. **Trigger test events (in another terminal):**
```bash
stripe trigger checkout.session.completed
```

4. **Check logs:**
- Console logs will show flow ID and processing steps
- Database will have records in `webhook_attempts` table

### Manual Testing

Test invalid signature:
```bash
curl -X POST http://localhost:3000/api/donate/webhook \
  -H "stripe-signature: invalid" \
  -d '{"type":"test"}'
```

Expected: 400 response, `SIGNATURE_INVALID` error logged

## Debugging Queries

### Find recent failures
```sql
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
ORDER BY created_at DESC
LIMIT 20;
```

### Trace specific webhook by Stripe event ID
```sql
SELECT
  step,
  status,
  duration_ms,
  error_code,
  error_message,
  metadata,
  created_at
FROM webhook_attempts
WHERE stripe_event_id = 'evt_xxx'
ORDER BY created_at;
```

### Trace entire flow by flow ID
```sql
SELECT *
FROM webhook_attempts
WHERE flow_id = 'stripe-xxx'
ORDER BY created_at;
```

### Performance analysis
```sql
SELECT
  step,
  AVG(duration_ms) as avg_ms,
  MAX(duration_ms) as max_ms,
  MIN(duration_ms) as min_ms,
  COUNT(*) as count
FROM webhook_attempts
WHERE duration_ms IS NOT NULL
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY step
ORDER BY avg_ms DESC;
```

### Failure rate by event type
```sql
SELECT
  stripe_event_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failures,
  ROUND(100.0 * SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate_pct
FROM webhook_attempts
WHERE step = 'completed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY stripe_event_type;
```

### Recent successful donations
```sql
SELECT
  wa.flow_id,
  wa.stripe_event_id,
  wa.created_at as webhook_received,
  d.id as donation_id,
  d.amount_cents,
  d.created_at as donation_created
FROM webhook_attempts wa
JOIN donations d ON d.stripe_session_id = JSON_EXTRACT_PATH_TEXT(wa.metadata, 'sessionId')
WHERE wa.step = 'completed'
  AND wa.status = 'success'
ORDER BY wa.created_at DESC
LIMIT 10;
```

## Monitoring

### Key Metrics to Watch

1. **Failure Rate**: Should be <1%
   - Query: See "Failure rate by event type" above

2. **Processing Time**: Should be <2 seconds
   - Query: See "Performance analysis" above

3. **Signature Failures**: May indicate configuration issues
   ```sql
   SELECT COUNT(*) FROM webhook_attempts
   WHERE error_code LIKE 'SIGNATURE%'
   AND created_at > NOW() - INTERVAL '1 day';
   ```

4. **Database Errors**: Should be rare (transient failures)
   ```sql
   SELECT COUNT(*) FROM webhook_attempts
   WHERE error_code LIKE 'DB_%'
   AND created_at > NOW() - INTERVAL '1 day';
   ```

5. **Idempotent Retries**: Indicates Stripe retry behavior
   ```sql
   SELECT COUNT(*) FROM webhook_attempts
   WHERE metadata->>'idempotent' = 'true'
   AND created_at > NOW() - INTERVAL '1 day';
   ```

## Troubleshooting

### Problem: Webhooks failing with signature errors
**Check:**
- `STRIPE_WEBHOOK_SECRET` is set correctly
- Using webhook secret from correct Stripe environment (test vs live)
- Webhook endpoint URL matches Stripe dashboard configuration

### Problem: Duplicate donations
**Check:**
- Idempotency check is working (search for `idempotent: true` in metadata)
- `stripe_session_id` is unique constraint on donations table

### Problem: Database errors
**Check:**
- Supabase connection is healthy
- RLS policies allow admin client to insert (they do - admin bypasses RLS)
- Migration was applied successfully

### Problem: No logs in database
**Check:**
- Migration was applied
- Admin client has correct service role key
- Non-blocking logging isn't silently failing (check console for warnings)

## Production Checklist

Before deploying to production:

- [ ] Migration applied to production database
- [ ] Build succeeds (`npm run build`)
- [ ] Test webhook with Stripe CLI
- [ ] Verify logs appear in database
- [ ] Confirm email masking works
- [ ] Test idempotency (send same event twice)
- [ ] Test database error handling
- [ ] Update monitoring alerts if needed
- [ ] Document Stripe webhook URL for team

## Files Changed

- ✅ `supabase/migrations/008_webhook_attempts.sql` - Database table
- ✅ `lib/webhook-logging.ts` - Logging utilities
- ✅ `app/api/donate/webhook/route.ts` - Enhanced webhook handler
- ✅ `lib/database.types.ts` - TypeScript types
- ✅ `scripts/test-webhook.sh` - Testing helper
- ✅ `docs/WEBHOOK_LOGGING.md` - This documentation

## Support

For questions or issues:
1. Check the debugging queries above
2. Review console logs for flow IDs
3. Query `webhook_attempts` table by flow ID
4. Correlate with Stripe dashboard using `stripe_event_id`
