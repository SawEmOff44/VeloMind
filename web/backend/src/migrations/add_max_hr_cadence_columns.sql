-- Add max heart rate and cadence columns to sessions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sessions' AND column_name='max_heart_rate') THEN
    ALTER TABLE sessions ADD COLUMN max_heart_rate INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='sessions' AND column_name='max_cadence') THEN
    ALTER TABLE sessions ADD COLUMN max_cadence INTEGER;
  END IF;
END $$;
