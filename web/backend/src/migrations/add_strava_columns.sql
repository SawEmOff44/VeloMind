-- Add Strava integration columns to sessions table
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS total_time INTEGER,
ADD COLUMN IF NOT EXISTS total_distance DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS avg_power DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS max_power DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS avg_speed DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS max_speed DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS strava_activity_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'app';

-- Rename old columns to match new naming (if they exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='sessions' AND column_name='duration') THEN
    ALTER TABLE sessions RENAME COLUMN duration TO total_time;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='sessions' AND column_name='distance') THEN
    ALTER TABLE sessions RENAME COLUMN distance TO total_distance;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='sessions' AND column_name='average_power') THEN
    ALTER TABLE sessions RENAME COLUMN average_power TO avg_power;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='sessions' AND column_name='average_speed') THEN
    ALTER TABLE sessions RENAME COLUMN average_speed TO avg_speed;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='sessions' AND column_name='average_cadence') THEN
    ALTER TABLE sessions RENAME COLUMN average_cadence TO avg_cadence;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='sessions' AND column_name='average_heart_rate') THEN
    ALTER TABLE sessions RENAME COLUMN average_heart_rate TO avg_heart_rate;
  END IF;
END $$;
