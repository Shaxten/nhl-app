-- Create parlay_bets table
CREATE TABLE IF NOT EXISTS parlay_bets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  selections JSONB NOT NULL,
  bet_amount INTEGER NOT NULL,
  total_odds DECIMAL(10,2) NOT NULL,
  potential_win DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE parlay_bets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own parlay bets"
  ON parlay_bets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own parlay bets"
  ON parlay_bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parlay bets"
  ON parlay_bets FOR UPDATE
  USING (auth.uid() = user_id);
