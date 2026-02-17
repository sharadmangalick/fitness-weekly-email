-- Enable RLS on donations table
-- This table is managed server-side only (via Stripe webhooks)
-- Regular users should not have direct access

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- No public policies needed - only service role (server-side) can access
-- Service role bypasses RLS automatically, so this table is effectively server-only

-- Optional: Add a policy comment for documentation
COMMENT ON TABLE donations IS 'Stripe donations table - server-side access only via service role';
