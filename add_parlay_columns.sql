-- Add parlay columns to score_predictions table
ALTER TABLE score_predictions ADD COLUMN IF NOT EXISTS parlay_amount INTEGER DEFAULT 0;
ALTER TABLE score_predictions ADD COLUMN IF NOT EXISTS parlay_odds DECIMAL(10,2) DEFAULT 1.0;
