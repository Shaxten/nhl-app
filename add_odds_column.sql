-- Add odds column to bets table
ALTER TABLE bets ADD COLUMN IF NOT EXISTS odds DECIMAL(4,2) DEFAULT 2.0;
