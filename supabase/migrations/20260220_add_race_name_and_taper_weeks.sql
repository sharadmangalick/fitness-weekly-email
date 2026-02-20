-- Add race_name column for custom race event names (e.g. "Boston Marathon")
ALTER TABLE training_configs ADD COLUMN race_name TEXT DEFAULT NULL;

-- Add taper_weeks column for configurable taper length (1-3 weeks)
ALTER TABLE training_configs ADD COLUMN taper_weeks INTEGER NOT NULL DEFAULT 3 CHECK (taper_weeks IN (1, 2, 3));
