-- Allow all authenticated users to view all parlay bets (for leaderboard stats)
DROP POLICY IF EXISTS "Users can view all parlay bets for stats" ON parlay_bets;

CREATE POLICY "Users can view all parlay bets for stats"
  ON parlay_bets FOR SELECT
  USING (true);
