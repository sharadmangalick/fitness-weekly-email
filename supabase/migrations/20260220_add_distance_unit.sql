-- Add distance_unit column to user_profiles
-- Defaults to 'mi' (miles). Auto-detected from Strava or manually set by user.
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS distance_unit TEXT NOT NULL DEFAULT 'mi' CHECK (distance_unit IN ('mi', 'km'));
