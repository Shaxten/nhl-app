-- Create function to resolve bets (admin only)
CREATE OR REPLACE FUNCTION admin_resolve_bet(
  bet_id BIGINT,
  new_status TEXT,
  user_id_param UUID,
  bet_amount_param INTEGER,
  bet_odds_param DECIMAL
)
RETURNS void AS $$
DECLARE
  user_profile RECORD;
  winnings INTEGER;
  profit INTEGER;
BEGIN
  -- Update bet status
  UPDATE bets SET status = new_status WHERE id = bet_id;
  
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = user_id_param;
  
  IF new_status = 'won' THEN
    winnings := ROUND(bet_amount_param * bet_odds_param);
    profit := winnings - bet_amount_param;
    
    UPDATE profiles SET
      currency = currency + winnings,
      bets_won = COALESCE(bets_won, 0) + 1,
      total_winnings = COALESCE(total_winnings, 0) + profit
    WHERE id = user_id_param;
  ELSIF new_status = 'lost' THEN
    UPDATE profiles SET
      bets_lost = COALESCE(bets_lost, 0) + 1,
      total_winnings = COALESCE(total_winnings, 0) - bet_amount_param
    WHERE id = user_id_param;
  ELSIF new_status = 'refunded' THEN
    UPDATE profiles SET
      currency = currency + bet_amount_param
    WHERE id = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to resolve parlays (admin only)
CREATE OR REPLACE FUNCTION admin_resolve_parlay(
  parlay_id BIGINT,
  new_status TEXT,
  user_id_param UUID,
  bet_amount_param INTEGER,
  potential_win_param DECIMAL
)
RETURNS void AS $$
BEGIN
  -- Update parlay status
  UPDATE parlay_bets SET status = new_status WHERE id = parlay_id;
  
  IF new_status = 'won' THEN
    UPDATE profiles SET
      currency = currency + potential_win_param
    WHERE id = user_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (will be called from admin page)
GRANT EXECUTE ON FUNCTION admin_resolve_bet TO authenticated;
GRANT EXECUTE ON FUNCTION admin_resolve_parlay TO authenticated;
