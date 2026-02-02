-- Add onboarding status tracking to user_profiles
ALTER TABLE user_profiles
ADD COLUMN onboarding_status TEXT DEFAULT 'not_started'
  CHECK (onboarding_status IN ('not_started', 'platform_connected', 'goals_set', 'completed', 'skipped'));

ALTER TABLE user_profiles
ADD COLUMN onboarding_completed_at TIMESTAMPTZ;

-- Create index for querying users by onboarding status
CREATE INDEX idx_user_profiles_onboarding_status ON user_profiles(onboarding_status);
