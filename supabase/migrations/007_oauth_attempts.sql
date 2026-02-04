-- OAuth attempts table for debugging connection issues
-- Tracks each step of the OAuth flow for troubleshooting

CREATE TABLE IF NOT EXISTS oauth_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  flow_id TEXT NOT NULL,
  step TEXT NOT NULL,  -- 'initiation', 'callback_received', 'state_validation', 'token_exchange', 'token_encryption', 'db_storage', 'verification', 'completed'
  status TEXT NOT NULL,  -- 'started', 'success', 'failed'
  error_code TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by flow_id (most common lookup)
CREATE INDEX IF NOT EXISTS idx_oauth_attempts_flow_id ON oauth_attempts(flow_id);

-- Index for querying by user_id
CREATE INDEX IF NOT EXISTS idx_oauth_attempts_user_id ON oauth_attempts(user_id);

-- Index for finding recent failures
CREATE INDEX IF NOT EXISTS idx_oauth_attempts_status_created ON oauth_attempts(status, created_at DESC);

-- Enable RLS
ALTER TABLE oauth_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own OAuth attempts
CREATE POLICY "Users can view own oauth attempts" ON oauth_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: authenticated users can insert (needed for initiation before user_id is set)
CREATE POLICY "Authenticated users can insert oauth attempts" ON oauth_attempts
  FOR INSERT
  WITH CHECK (true);

-- Service role can do everything (for admin debugging)
-- This is implicit with service role key
