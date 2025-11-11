import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../supabase';

interface Bet {
  id: number;
  game_id: number;
  team_choice: string;
  amount: number;
  odds?: number;
  status: string;
  created_at: string;
  home_team?: string;
  away_team?: string;
  game_start_time?: string;
}

function MyBets() {
  const { user, refreshProfile } = useAuth();
  const { language, t } = useLanguage();
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
              away_team: gameData.awayTeam?.abbrev || 'N/A',
              game_start_time: gameData.startTimeUTC
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

  if (loading) return <div className="container"><h1>{t.common.loading}</h1></div>;

  return (
    <div className="container">
      <h1>{t.myBets.title}</h1>
      <table style={{ marginTop: '2rem' }}>
        <thead className="tableright">
          <tr>
            <th className="game-center">{t.myBets.game}</th>
            <th>{t.myBets.betOn}</th>
            <th>{t.myBets.amount}</th>
            <th>{language === 'fr' ? 'Cote' : 'Odds'}</th>
            <th>{language === 'fr' ? 'Gain potentiel' : 'Potential Win'}</th>
            <th className="game-center">{t.myBets.status}</th>
            <th className="date-left">{language === 'fr' ? 'Date' : 'Date'}</th>
            <th>{language === 'fr' ? 'Action' : 'Action'}</th>
          </tr>
        </thead>
        <tbody className="tableright">
          {bets.map(bet => (
            <tr key={bet.id}>
              <td className="game-center">{bet.away_team} @ {bet.home_team}</td>
              <td>
                <img src={`https://assets.nhle.com/logos/nhl/svg/${bet.team_choice}_light.svg`} alt={bet.team_choice} style={{ width: '40px', height: '40px' }} />
              </td>
              <td>{bet.amount} MC</td>
              <td style={{ color: 'var(--accent-yellow)' }}>{bet.odds ? bet.odds.toFixed(2) : '2.00'}x</td>
              <td style={{ color: 'var(--text-primary)' }}>{Math.round(bet.amount * (bet.odds || 2.0))} MC</td>
              <td className="game-center">
                <span style={{ 
                          color: bet.status === 'won' ? '#4ade80' : bet.status === 'lost' ? '#ff4a4a' : '#aaa' 
                }}>
                  {bet.status === 'pending' ? t.myBets.pending : bet.status === 'won' ? t.myBets.won : t.myBets.lost}
                </span>
              </td>
              <td className="date-left">{new Date(bet.created_at).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
              <td>
                {bet.status === 'pending' && (() => {
                  const gameStartTime = bet.game_start_time ? new Date(bet.game_start_time) : null;
                  const now = new Date();
                  const fifteenMinutesAfterStart = gameStartTime ? new Date(gameStartTime.getTime() + 15 * 60 * 1000) : null;
                  const canCancel = !fifteenMinutesAfterStart || now < fifteenMinutesAfterStart;
                  
                  return canCancel ? (
                    <button 
                      onClick={() => cancelBet(bet.id, bet.amount)}
                      style={{ background: '#ff4a4a' }}
                    >
                      Cancel
                    </button>
                  ) : null;
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MyBets;
