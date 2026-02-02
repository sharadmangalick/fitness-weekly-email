-- Migration: Add intensity_preference to training_configs
-- This allows users to adjust how aggressive their training plan is

ALTER TABLE training_configs
ADD COLUMN intensity_preference TEXT DEFAULT 'normal'
CHECK (intensity_preference IN ('conservative', 'normal', 'aggressive'));

-- Comment on the column
COMMENT ON COLUMN training_configs.intensity_preference IS 'User preference for plan intensity: conservative (0.85x), normal (1.0x), or aggressive (1.15x)';
