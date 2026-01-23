-- Generated Plans table for caching
-- Stores generated training plans to avoid excessive API calls

CREATE TABLE generated_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    plan_json JSONB NOT NULL,
    analysis_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)  -- Only store one plan per user (most recent)
);

-- Enable RLS
ALTER TABLE generated_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own generated plans" ON generated_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated plans" ON generated_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated plans" ON generated_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated plans" ON generated_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_generated_plans_user_created
    ON generated_plans(user_id, created_at DESC);
