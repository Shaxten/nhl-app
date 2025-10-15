import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

interface Bet {
  id: number;
  game_id: number;
  team_choice: string;
  amount: number;
  status: string;
  created_at: string;
  home_team?: string;
  away_team?: string;
}

function MyBets() {
  const { user, refreshProfile } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadBets();
  }, [user]);

  async function loadBets() {
    const { data } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      const betsWithTeams = await Promise.all(
        data.map(async (bet) => {
          try {
            const response = await fetch(`https://corsproxy.io/?https://api-web.nhle.com/v1/gamecenter/${bet.game_id}/landing`);
            const gameData = await response.json();
            return {
              ...bet,
              home_team: gameData.homeTeam?.abbrev || 'N/A',
              away_team: gameData.awayTeam?.abbrev || 'N/A'
            };
          } catch {
            return { ...bet, home_team: 'N/A', away_team: 'N/A' };
          }
        })
      );
      setBets(betsWithTeams);
    }
    setLoading(false);
  }

  async function cancelBet(betId: number, amount: number) {
    if (!confirm('Cancel this bet and refund your currency?')) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('currency')
      .eq('id', user?.id)
      .single();

    await supabase.from('bets').delete().eq('id', betId);
    
    await supabase
      .from('profiles')
      .update({ currency: (profile?.currency || 0) + amount })
      .eq('id', user?.id);

    await refreshProfile();
    loadBets();
  }

  if (loading) return <div className="container"><h1>Loading...</h1></div>;

  return (
    <div className="container">
      <h1>My Bets</h1>
      <table style={{ marginTop: '2rem' }}>
        <thead>
          <tr>
            <th>Game</th>
            <th>Your Pick</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bets.map(bet => (
            <tr key={bet.id}>
              <td>{bet.away_team} @ {bet.home_team}</td>
              <td>{bet.team_choice}</td>
              <td>{bet.amount}</td>
              <td>
                <span style={{ 
                  color: bet.status === 'won' ? '#4a9eff' : bet.status === 'lost' ? '#ff4a4a' : '#aaa' 
                }}>
                  {bet.status}
                </span>
              </td>
              <td>{new Date(bet.created_at).toLocaleString()}</td>
              <td>
                {bet.status === 'pending' && (
                  <button 
                    onClick={() => cancelBet(bet.id, bet.amount)}
                    style={{ background: '#ff4a4a' }}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyBets;
