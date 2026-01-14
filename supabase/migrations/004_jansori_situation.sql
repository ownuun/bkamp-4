-- Add situation field to jansori_goals for personalized nagging
ALTER TABLE jansori_goals ADD COLUMN IF NOT EXISTS situation TEXT CHECK (char_length(situation) <= 5000);

COMMENT ON COLUMN jansori_goals.situation IS 'User''s current situation for personalized nagging (max 5000 chars)';
