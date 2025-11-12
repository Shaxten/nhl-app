-- Enable Row Level Security on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Allow users to view all profiles (for leaderboard)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to insert their own profile on signup
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- CRITICAL: Users can only update their username, NOT currency
-- Currency can only be updated by authenticated backend or admin
CREATE POLICY "Users can update only username"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent currency modification by comparing old and new values
    currency = (SELECT currency FROM profiles WHERE id = auth.uid())
  );

-- Enable Row Level Security on bets table
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own bets" ON bets;
DROP POLICY IF EXISTS "Users can insert their own bets" ON bets;
DROP POLICY IF EXISTS "Users can view all bets" ON bets;

-- Users can view their own bets
CREATE POLICY "Users can view their own bets"
  ON bets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert bets (currency deduction handled by trigger)
CREATE POLICY "Users can insert their own bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a function to handle bet placement with currency deduction
CREATE OR REPLACE FUNCTION place_bet_with_deduction()
RETURNS TRIGGER AS $$
DECLARE
  user_currency INTEGER;
BEGIN
  -- Get current user currency
  SELECT currency INTO user_currency
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Check if user has enough currency
  IF user_currency < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;
  
  -- Deduct currency
  UPDATE profiles
  SET currency = currency - NEW.amount
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for bet placement
DROP TRIGGER IF EXISTS bet_placement_trigger ON bets;
CREATE TRIGGER bet_placement_trigger
  BEFORE INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION place_bet_with_deduction();

-- Create a function to handle bet resolution (win/loss)
CREATE OR REPLACE FUNCTION resolve_bet()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed to 'won' or 'lost'
  IF NEW.status = 'won' AND OLD.status = 'pending' THEN
    -- Add winnings (bet amount * odds)
    UPDATE profiles
    SET currency = currency + (NEW.amount * COALESCE(NEW.odds, 2.0))
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for bet resolution
DROP TRIGGER IF EXISTS bet_resolution_trigger ON bets;
CREATE TRIGGER bet_resolution_trigger
  AFTER UPDATE ON bets
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('won', 'lost'))
  EXECUTE FUNCTION resolve_bet();

-- Add username validation
ALTER TABLE profiles ADD CONSTRAINT username_length_check 
  CHECK (char_length(username) >= 3 AND char_length(username) <= 20);

ALTER TABLE profiles ADD CONSTRAINT username_format_check 
  CHECK (username ~ '^[a-zA-Z0-9_-]+$');
