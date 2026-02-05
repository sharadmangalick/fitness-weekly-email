-- Create webhook_attempts table for tracking Stripe webhook processing
-- Similar to oauth_attempts, this table provides comprehensive visibility into webhook failures

CREATE TABLE IF NOT EXISTS webhook_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Webhook identification
  flow_id TEXT NOT NULL,           -- Format: stripe-{timestamp}-{random}
  stripe_event_id TEXT,             -- Stripe's event ID (e.g., evt_xxx)
  stripe_event_type TEXT NOT NULL,  -- e.g., checkout.session.completed

  -- Progress tracking
  step TEXT NOT NULL,               -- 'received', 'signature_verification', 'event_parsing', 'db_operation', 'completed'
  status TEXT NOT NULL,             -- 'started', 'success', 'failed'

  -- Performance metrics
  duration_ms INTEGER,              -- Time taken for this step

  -- Error tracking
  error_code TEXT,                  -- e.g., 'SIGNATURE_INVALID', 'DB_INSERT_FAILED'
  error_message TEXT,

  -- Context data (sanitized)
  metadata JSONB,                   -- Sanitized session data, masked email

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_webhook_attempts_flow_id ON webhook_attempts(flow_id);
CREATE INDEX IF NOT EXISTS idx_webhook_attempts_stripe_event_id ON webhook_attempts(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_attempts_status_created ON webhook_attempts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_attempts_event_type ON webhook_attempts(stripe_event_type);

-- Enable RLS (service role bypasses this)
ALTER TABLE webhook_attempts ENABLE ROW LEVEL SECURITY;
