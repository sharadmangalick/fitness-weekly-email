-- Add runs_per_week column to training_configs
-- Allows users to specify how many days per week they run (2-7)
-- NULL means use default behavior (5-6 day plan)
ALTER TABLE training_configs
ADD COLUMN IF NOT EXISTS runs_per_week integer DEFAULT NULL;

-- Add check constraint for valid range
ALTER TABLE training_configs
ADD CONSTRAINT runs_per_week_range CHECK (runs_per_week IS NULL OR (runs_per_week >= 2 AND runs_per_week <= 7));
