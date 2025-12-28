-- Add Strava integration columns to sessions table
DO $$ 
BEGIN
  -- Add columns only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sessions' AND column_name='strava_activity_id') THEN
    ALTER TABLE sessions ADD COLUMN strava_activity_id BIGINT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sessions' AND column_name='source') THEN
    ALTER TABLE sessions ADD COLUMN source VARCHAR(50) DEFAULT 'app';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sessions' AND column_name='max_power') THEN
    ALTER TABLE sessions ADD COLUMN max_power DECIMAL(8,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sessions' AND column_name='max_speed') THEN
    ALTER TABLE sessions ADD COLUMN max_speed DECIMAL(6,2);
  END IF;
END $$;

