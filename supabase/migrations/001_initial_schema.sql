-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    timezone TEXT DEFAULT 'America/Los_Angeles',
    preferred_platform TEXT DEFAULT 'garmin' CHECK (preferred_platform IN ('garmin', 'strava')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform connections (supports multiple platforms per user)
CREATE TABLE platform_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('garmin', 'strava')),

    -- Encrypted tokens (for both Garmin session tokens and Strava OAuth tokens)
    tokens_encrypted TEXT NOT NULL,
    iv TEXT NOT NULL,

    -- Token metadata
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'error')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, platform)
);

-- Training configuration (platform-agnostic)
CREATE TABLE training_configs (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    goal_category TEXT NOT NULL CHECK (goal_category IN ('race', 'non_race')),
    goal_type TEXT NOT NULL,
    goal_date DATE,
    goal_time_minutes INTEGER,
    goal_target TEXT,
    custom_distance_miles DECIMAL(5,2),
    target_weekly_mileage INTEGER,
    current_weekly_mileage INTEGER DEFAULT 35,
    experience_level TEXT DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
    preferred_long_run_day TEXT DEFAULT 'sunday' CHECK (preferred_long_run_day IN ('saturday', 'sunday')),
    email_day TEXT DEFAULT 'sunday',
    email_time TIME DEFAULT '07:00',
    email_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email history
CREATE TABLE email_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('garmin', 'strava')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
    error_message TEXT
);

-- Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for platform_connections
CREATE POLICY "Users can view own connections" ON platform_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON platform_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON platform_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON platform_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for training_configs
CREATE POLICY "Users can view own config" ON training_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config" ON training_configs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config" ON training_configs
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for email_history
CREATE POLICY "Users can view own email history" ON email_history
    FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_connections_updated_at
    BEFORE UPDATE ON platform_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_configs_updated_at
    BEFORE UPDATE ON training_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Runner'));
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Index for faster email scheduling queries
CREATE INDEX idx_training_configs_email_schedule
    ON training_configs(email_enabled, email_day, email_time);

CREATE INDEX idx_platform_connections_status
    ON platform_connections(user_id, status);
