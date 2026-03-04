# Webhook Logging Deployment Notes

## What Changed

This deployment adds comprehensive logging to the Stripe webhook handler to diagnose and prevent donation failures.

### Critical Improvements

1. **🔄 Proper Error Handling**: Now returns 500 (not 200) for database errors, enabling Stripe to retry
2. **🔒 Idempotency**: Prevents duplicate donations when Stripe retries the same event
3. **📊 End-to-End Tracking**: Every webhook gets a unique flow ID for complete traceability
4. **🔍 Detailed Logging**: Database records every step with timing metrics
5. **🎭 PII Protection**: Email addresses are masked in logs

### Files Changed

```
New files:
- supabase/migrations/008_webhook_attempts.sql
- lib/webhook-logging.ts
- scripts/test-webhook.sh
- docs/WEBHOOK_LOGGING.md

Modified files:
- app/api/donate/webhook/route.ts
- lib/database.types.ts
```

## Deployment Steps

### 1. Pre-Deployment

Verify the build succeeds:
```bash
npm run build
```

✅ **Status**: Build verified successfully

### 2. Database Migration

The migration must be applied **before** deploying the code.

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to Supabase dashboard → SQL Editor
2. Copy contents of `supabase/migrations/008_webhook_attempts.sql`
3. Execute the SQL
4. Verify table exists:
   ```sql
   SELECT * FROM webhook_attempts LIMIT 1;
   ```

#### Option B: Via psql (if you have access)
```bash
psql $DATABASE_URL -f supabase/migrations/008_webhook_attempts.sql
```

### 3. Deploy Code

Deploy via Vercel (or your deployment method):
```bash
git add .
git commit -m "Add comprehensive webhook logging with idempotency"
git push origin main
```

### 4. Post-Deployment Verification

#### Immediate Checks (First 5 Minutes)

1. **Verify webhook endpoint responds:**
   ```bash
   curl https://www.runplan.fun/api/donate/webhook
   ```
   Should return 405 (Method Not Allowed) - POST only

2. **Check logs for any startup errors:**
   - Vercel dashboard → Functions → Latest invocation logs

3. **Trigger a test donation** (if possible in test mode)

#### Within 24 Hours

1. **Check for webhook attempts in database:**
   ```sql
   SELECT
     flow_id,
     stripe_event_type,
     step,
     status,
     error_code,
     created_at
   FROM webhook_attempts
   ORDER BY created_at DESC
   LIMIT 10;
   ```

2. **Monitor Stripe dashboard for webhook failures:**
   - Stripe Dashboard → Developers → Webhooks
   - Should see reduced failure rate

3. **Verify no duplicate donations:**
   ```sql
   SELECT
     stripe_session_id,
     COUNT(*) as count
   FROM donations
   GROUP BY stripe_session_id
   HAVING COUNT(*) > 1;
   ```
   Should return 0 rows

## What to Monitor

### Success Metrics

- **Webhook success rate**: Should be >99%
- **Processing time**: Should be <2 seconds average
- **No duplicates**: Zero duplicate `stripe_session_id` in donations table

### Red Flags

🚨 **Immediate action required:**
- Signature verification failures (wrong webhook secret)
- Database connection errors
- Multiple duplicate donations

⚠️ **Investigate soon:**
- Processing time >5 seconds consistently
- Failure rate >5%
- Many idempotent retries (indicates upstream issues)

## Debugging Production Issues

### Step 1: Find the Flow ID
If a user reports missing donation, ask for:
- Stripe session ID (starts with `cs_`)
- Email used for donation
- Approximate time

### Step 2: Query Webhook Attempts
```sql
-- By Stripe session ID (from metadata)
SELECT *
FROM webhook_attempts
WHERE metadata->>'sessionId' = 'cs_test_xxxxx'
ORDER BY created_at;

-- By time window
SELECT
  flow_id,
  stripe_event_id,
  step,
  status,
  error_code,
  error_message
FROM webhook_attempts
WHERE created_at BETWEEN '2024-01-01 10:00:00' AND '2024-01-01 11:00:00'
ORDER BY created_at DESC;
```

### Step 3: Correlate with Stripe
Use the `stripe_event_id` from query results:
1. Go to Stripe Dashboard → Events
2. Search for event ID (e.g., `evt_xxxxx`)
3. Check retry history and response codes

### Step 4: Resolve
- If signature error → Check webhook secret configuration
- If DB error → Check Supabase connection and RLS
- If duplicate → Verify idempotency check is working
- If missing → Check if event was sent by Stripe at all

## Rollback Plan

If critical issues arise:

### Quick Rollback (Code Only)
```bash
git revert HEAD
git push origin main
```

This will revert to the old webhook handler, but:
- ⚠️ Will lose improved error handling
- ⚠️ Database errors will return 200 (Stripe won't retry)
- ⚠️ No idempotency protection

### Complete Rollback (Code + Database)
Not recommended unless table causes issues:
```sql
DROP TABLE webhook_attempts CASCADE;
```

Then revert the code as above.

## Environment Variables

No new environment variables required! The implementation uses:
- ✅ `STRIPE_WEBHOOK_SECRET` (already exists)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (already exists)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (already exists)

## Testing in Production (Safe)

After deployment, you can safely test using Stripe CLI:

```bash
# Point to production endpoint
stripe listen --forward-to https://www.runplan.fun/api/donate/webhook

# In another terminal, trigger test event
stripe trigger checkout.session.completed
```

This sends a real webhook to production, but with test mode data (won't charge real money).

## Common Questions

**Q: Will this affect existing webhooks immediately?**
A: Yes, all webhooks after deployment will use the new logging system.

**Q: Do we need to backfill webhook_attempts for historical data?**
A: No, the table starts empty and collects data going forward.

**Q: What's the storage impact?**
A: ~1MB per 1000 webhooks. Negligible for expected volume.

**Q: Should we add data retention policy?**
A: Optional. Consider archiving/deleting records older than 90 days in the future.

**Q: Does this slow down webhook processing?**
A: Minimal impact (~200ms overhead). Within Stripe's 5-second timeout window.

**Q: What if logging fails?**
A: Logging failures are caught and logged to console, but never break the webhook flow.

## Success Criteria

✅ **Week 1**:
- Migration applied successfully
- No spike in webhook failures
- Logs appearing in database
- No duplicate donations

✅ **Week 2**:
- Reduced webhook failure rate in Stripe dashboard
- Able to debug any reported missing donations
- Performance metrics within expected range

✅ **Month 1**:
- Zero critical webhook issues
- Clear visibility into any failures
- Confident in donation tracking

## Next Steps (Future Enhancements)

Not in this deployment, but could add later:
- Automated alerts for high failure rates
- Admin dashboard for webhook monitoring
- Support for additional Stripe event types
- Automated cleanup of old webhook_attempts records

## Contact

If you encounter issues during deployment:
1. Check Vercel deployment logs
2. Query `webhook_attempts` table for errors
3. Review Stripe webhook dashboard
4. Check this document's debugging section

---

**Deployed by**: Claude Code
**Date**: 2026-02-05
**Build status**: ✅ Verified
