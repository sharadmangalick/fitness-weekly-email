-- Migration: Garmin Webhook Data Storage
-- Purpose: Store webhook deliveries for real-time data sync
-- Created: 2026-02-17

-- Table to store webhook deliveries for debugging and processing
CREATE TABLE IF NOT EXISTS garmin_webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    webhook_type TEXT NOT NULL CHECK (webhook_type IN (
        'activity',
        'daily_summary',
        'sleep',
        'heart_rate',
        'stress',
        'body_battery',
        'deregistration',
        'user_permission'
    )),
    garmin_user_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_user_id ON garmin_webhook_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_garmin_user_id ON garmin_webhook_deliveries(garmin_user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_type ON garmin_webhook_deliveries(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_processed ON garmin_webhook_deliveries(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON garmin_webhook_deliveries(created_at DESC);

-- Composite index for processing unprocessed webhooks
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_processing
    ON garmin_webhook_deliveries(processed, created_at)
    WHERE processed = FALSE;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_garmin_webhook_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER garmin_webhook_deliveries_updated_at
    BEFORE UPDATE ON garmin_webhook_deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_garmin_webhook_deliveries_updated_at();

-- RLS policies
ALTER TABLE garmin_webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Users can view their own webhook deliveries
CREATE POLICY "Users can view own webhook deliveries" ON garmin_webhook_deliveries
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert webhook deliveries (webhooks come from Garmin, not users)
CREATE POLICY "Service role can insert webhook deliveries" ON garmin_webhook_deliveries
    FOR INSERT WITH CHECK (true);

-- Service role can update webhook deliveries (for processing)
CREATE POLICY "Service role can update webhook deliveries" ON garmin_webhook_deliveries
    FOR UPDATE USING (true);

-- Comment on table
COMMENT ON TABLE garmin_webhook_deliveries IS
'Stores webhook deliveries from Garmin for debugging and asynchronous processing. Webhooks are inserted immediately and processed by background jobs.';

-- Comment on columns
COMMENT ON COLUMN garmin_webhook_deliveries.webhook_type IS
'Type of webhook: activity, daily_summary, sleep, heart_rate, stress, body_battery, deregistration, user_permission';

COMMENT ON COLUMN garmin_webhook_deliveries.garmin_user_id IS
'Garmin user ID from webhook payload (used to lookup user_id)';

COMMENT ON COLUMN garmin_webhook_deliveries.payload IS
'Raw JSON payload from Garmin webhook';

COMMENT ON COLUMN garmin_webhook_deliveries.processed IS
'Whether this webhook has been processed by background job';

COMMENT ON COLUMN garmin_webhook_deliveries.processed_at IS
'Timestamp when webhook was successfully processed';

COMMENT ON COLUMN garmin_webhook_deliveries.error_message IS
'Error message if processing failed';
