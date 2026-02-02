-- Donations table for tracking Stripe donations
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_session_id TEXT UNIQUE NOT NULL,
    amount_cents INTEGER NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
