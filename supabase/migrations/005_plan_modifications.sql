-- Plan Modifications Table
-- Tracks when recovery metrics cause volume adjustments to the training plan

CREATE TABLE plan_modifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    original_mileage INTEGER NOT NULL,
    adjusted_mileage INTEGER NOT NULL,
    recovery_adjustment DECIMAL(3,2) NOT NULL,
    concerns TEXT[] NOT NULL,
    phase TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start_date)
);

-- Enable RLS
ALTER TABLE plan_modifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own modifications
CREATE POLICY "Users can view own modifications" ON plan_modifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own modifications
CREATE POLICY "Users can insert own modifications" ON plan_modifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own modifications
CREATE POLICY "Users can update own modifications" ON plan_modifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own modifications
CREATE POLICY "Users can delete own modifications" ON plan_modifications
    FOR DELETE USING (auth.uid() = user_id);

-- Index for efficient lookups
CREATE INDEX idx_plan_modifications_user_week ON plan_modifications(user_id, week_start_date);
