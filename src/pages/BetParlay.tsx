import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUpcomingGames } from '../data';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  homeRecord?: string;
  awayRecord?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  homePoints?: number;
  awayPoints?: number;
}

interface ParlaySelection {
  gameId: number;
  team: string;
  odds: number;
  game: Game;
}

function BetParlay() {
  const { user, profile, refreshProfile } = useAuth();
  const { language, t } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<ParlaySelection[]>([]);
  const [betAmount, setBetAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getUpcomingGames()
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function calculateOdds(teamPoints: number, opponentPoints: number): number {
    if (!teamPoints || !opponentPoints) return 2.0;
    const pointDiff = teamPoints - opponentPoints;
    const baseOdds = 2.0;
    const adjustment = pointDiff * 0.02;
    return Math.max(1.1, Math.min(5.0, baseOdds - adjustment));
  }

  function toggleSelection(game: Game, team: 'home' | 'away') {
    const teamName = team === 'home' ? game.homeTeam : game.awayTeam;
    const odds = team === 'home' 
      ? calculateOdds(game.homePoints || 0, game.awayPoints || 0)
      : calculateOdds(game.awayPoints || 0, game.homePoints || 0);

    const existingIndex = selections.findIndex(s => s.gameId === game.id);
    
    if (existingIndex >= 0) {
      if (selections[existingIndex].team === teamName) {
        setSelections(selections.filter(s => s.gameId !== game.id));
      } else {
        const newSelections = [...selections];
        newSelections[existingIndex] = { gameId: game.id, team: teamName, odds, game };
        setSelections(newSelections);
      }
    } else {
      setSelections([...selections, { gameId: game.id, team: teamName, odds, game }]);
    }
  }

  function getTotalOdds(): number {
    return selections.reduce((acc, sel) => acc * sel.odds, 1);
  }

  function getPotentialWin(): number {
    return betAmount * getTotalOdds();
  }

  async function placeParlayBet() {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    if (selections.length < 2) {
      alert(language === 'fr' ? 'Sélectionnez au moins 2 matchs' : 'Select at least 2 games');
      return;
    }

    if (betAmount <= 0 || betAmount > profile.currency) {
      alert(t.betting.invalidAmount);
      return;
    }

    try {
      const { error } = await supabase.from('parlay_bets').insert({
        user_id: user.id,
        selections: selections.map(s => ({ game_id: s.gameId, team: s.team, odds: s.odds })),
        bet_amount: betAmount,
        total_odds: getTotalOdds(),
        potential_win: getPotentialWin(),
        status: 'pending'
      });

      if (error) {
        console.error('Parlay insert error:', error);
        alert(t.betting.failedBet + ': ' + error.message);
        return;
      }

      await supabase
        .from('profiles')
        .update({ currency: profile.currency - betAmount })
        .eq('id', user.id);

      await refreshProfile();
      alert(t.betting.betPlaced);
      setSelections([]);
      setBetAmount(0);
    } catch (err: any) {
      console.error('Parlay error:', err);
      alert(t.betting.failedBet + ': ' + err.message);
    }
  }

  if (loading) return <div className="container"><h1>{t.common.loading}</h1></div>;

  return (
    <div className="container">
      <h1>{language === 'fr' ? 'Faites un parlay' : 'Do a Parlay'}</h1>
      {profile && (
        <div style={{ marginTop: '1rem' }}>
          {t.betting.availableCurrency}: <strong>{profile.currency} MC</strong>
        </div>
      )}

      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '1rem' }}>{language === 'fr' ? `Matchs du ${new Date().toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}` : `Games on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}</h2>
          {games.map(game => {
            const gameTime = new Date(game.startTime);
            const now = new Date();
            const timeDiff = (now.getTime() - gameTime.getTime()) / (1000 * 60);
            const bettingClosed = timeDiff > 5;
            const homeSelected = selections.find(s => s.gameId === game.id && s.team === game.homeTeam);
            const awaySelected = selections.find(s => s.gameId === game.id && s.team === game.awayTeam);

            return (
              <div key={game.id} className="division-card" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', flex: 1, cursor: bettingClosed ? 'not-allowed' : 'pointer', opacity: bettingClosed ? 0.5 : 1, background: awaySelected ? 'var(--selected-bg)' : 'transparent', padding: '1rem', borderRadius: '4px' }} onClick={() => !bettingClosed && toggleSelection(game, 'away')}>
                    <img src={game.awayTeamLogo} alt={game.awayTeam} style={{ width: '60px', height: '60px' }} />
                    <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{game.awayTeamName || game.awayTeam}</p>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '0.25rem' }}>{game.awayRecord}</p>
                    <p style={{ color: 'var(--accent-yellow)' }}>{calculateOdds(game.awayPoints || 0, game.homePoints || 0).toFixed(2)}x</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>@</div>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                      {new Date(game.startTime).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, cursor: bettingClosed ? 'not-allowed' : 'pointer', opacity: bettingClosed ? 0.5 : 1, background: homeSelected ? 'var(--selected-bg)' : 'transparent', padding: '1rem', borderRadius: '4px' }} onClick={() => !bettingClosed && toggleSelection(game, 'home')}>
                    <img src={game.homeTeamLogo} alt={game.homeTeam} style={{ width: '60px', height: '60px' }} />
                    <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{game.homeTeamName || game.homeTeam}</p>
                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '0.25rem' }}>{game.homeRecord}</p>
                    <p style={{ color: 'var(--accent-yellow)' }}>{calculateOdds(game.homePoints || 0, game.awayPoints || 0).toFixed(2)}x</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h2 style={{ marginBottom: '1rem' }}>{language === 'fr' ? 'Votre parlay' : 'Your Parlay'}</h2>
          <div className="division-card" style={{ position: 'sticky', top: '2rem' }}>
            {selections.length === 0 ? (
              <p style={{ color: '#aaa' }}>{language === 'fr' ? 'Sélectionnez au moins 2 matchs' : 'Select at least 2 games'}</p>
            ) : (
              <>
                {selections.map(sel => (
                  <div key={sel.gameId} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span>{sel.team}</span>
                    <span>{sel.odds.toFixed(2)}x</span>
                  </div>
                ))}
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong>{language === 'fr' ? 'Cote totale :' : 'Total Odds:'}</strong>
                    <strong style={{ color: 'var(--accent-yellow)' }}>{getTotalOdds().toFixed(2)}x</strong>
                  </div>
                  <input
                    type="number"
                    placeholder={t.betting.betAmount}
                    value={betAmount || ''}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                    min="1"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span>{language === 'fr' ? 'Gain potentiel :' : 'Potential Win:'}</span>
                    <strong style={{ color: '#4ade80' }}>{getPotentialWin().toFixed(2)} MC</strong>
                  </div>
                  <button onClick={placeParlayBet} style={{ width: '100%' }}>
                    {language === 'fr' ? 'Placer le parlay' : 'Place Parlay'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BetParlay;
