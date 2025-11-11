import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getUpcomingGames, placeBet } from '../data';
import { useNavigate, Link } from 'react-router-dom';
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

function Betting() {
  const { user, profile, refreshProfile } = useAuth();
  const { language, t } = useLanguage();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [awayBetAmount, setAwayBetAmount] = useState<{ [key: number]: number }>({});
  const [homeBetAmount, setHomeBetAmount] = useState<{ [key: number]: number }>({});
  const navigate = useNavigate();

  useEffect(() => {
    getUpcomingGames()
      .then(data => {
        console.log('Games loaded:', data);
        setGames(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading games:', error);
        setLoading(false);
      });
  }, []);

  async function handleScorePrediction(gameId: number, homeTeam: string, awayTeam: string) {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    const { data: existing } = await supabase
      .from('score_predictions')
      .select('id')
      .eq('user_id', user.id)
      .eq('game_id', gameId)
      .single();

    if (existing) {
      alert(t.betting.alreadyPredicted);
      return;
    }

    const awayScore = parseInt((document.getElementById(`away-${gameId}`) as HTMLInputElement).value);
    const homeScore = parseInt((document.getElementById(`home-${gameId}`) as HTMLInputElement).value);
    const parlayAmount = parseInt((document.getElementById(`parlay-amount-${gameId}`) as HTMLInputElement)?.value || '0');

    if (isNaN(awayScore) || isNaN(homeScore)) {
      alert(t.betting.enterValidScores);
      return;
    }

    if (parlayAmount > 0 && parlayAmount > profile.currency) {
      alert(t.betting.invalidAmount);
      return;
    }

    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;

      const winner = homeScore > awayScore ? homeTeam : awayTeam;
      const baseOdds = winner === homeTeam 
        ? calculateOdds(game.homePoints || 0, game.awayPoints || 0)
        : calculateOdds(game.awayPoints || 0, game.homePoints || 0);
      
      const parlayOdds = parlayAmount > 0 ? baseOdds * 5.0 : 1.0;

      await supabase.from('score_predictions').insert({
        user_id: user.id,
        game_id: gameId,
        home_team: homeTeam,
        away_team: awayTeam,
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
        parlay_amount: parlayAmount,
        parlay_odds: parlayOdds,
        status: 'pending'
      });

      if (parlayAmount > 0) {
        await supabase
          .from('profiles')
          .update({ currency: profile.currency - parlayAmount })
          .eq('id', user.id);
        await refreshProfile();
      }

      alert(t.betting.predictionSubmitted);
      (document.getElementById(`away-${gameId}`) as HTMLInputElement).value = '';
      (document.getElementById(`home-${gameId}`) as HTMLInputElement).value = '';
      if (document.getElementById(`parlay-amount-${gameId}`)) {
        (document.getElementById(`parlay-amount-${gameId}`) as HTMLInputElement).value = '';
      }
    } catch (error) {
      alert(t.betting.failedPrediction);
    }
  }

  function calculateOdds(teamPoints: number, opponentPoints: number): number {
    if (!teamPoints || !opponentPoints) return 2.0;
    const pointDiff = teamPoints - opponentPoints;
    const baseOdds = 2.0;
    const adjustment = pointDiff * 0.02;
    return Math.max(1.1, Math.min(5.0, baseOdds - adjustment));
  }

  async function handleBet(gameId: number, teamChoice: 'home' | 'away') {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }

    const game = games.find(g => g.id === gameId);
    if (game) {
      const gameTime = new Date(game.startTime);
      const now = new Date();
      const timeDiff = (now.getTime() - gameTime.getTime()) / (1000 * 60);
      
      if (timeDiff > 30) {
        alert(t.betting.bettingClosed + ': Game started more than 30 minutes ago');
        return;
      }
    }

    const amount = teamChoice === 'away' ? (awayBetAmount[gameId] || 0) : (homeBetAmount[gameId] || 0);
    if (amount <= 0 || amount > profile.currency) {
      alert(t.betting.invalidAmount);
      return;
    }

    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;
      
      const odds = teamChoice === 'home' 
        ? calculateOdds(game.homePoints || 0, game.awayPoints || 0)
        : calculateOdds(game.awayPoints || 0, game.homePoints || 0);
      
      await placeBet(user.id, gameId, teamChoice === 'home' ? game.homeTeam : game.awayTeam, amount, game.homeTeam, game.awayTeam, odds);
      await refreshProfile();
      alert(t.betting.betPlaced);
      if (teamChoice === 'away') {
        setAwayBetAmount({ ...awayBetAmount, [gameId]: 0 });
      } else {
        setHomeBetAmount({ ...homeBetAmount, [gameId]: 0 });
      }
    } catch (error) {
      alert(t.betting.failedBet);
    }
  }

  if (loading) return <div className="container"><h1>{t.common.loading}</h1></div>;

  const today = new Date();
  const dateStr = today.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="container">
      <h1>{language === 'fr' ? `Placez vos bets du ${dateStr}` : `Place Your Bets for ${dateStr}`}</h1>
      {profile && (
        <div className="betting-currency" style={{ marginTop: '1rem' }}>
          {t.betting.availableCurrency}: <strong>{profile.currency} MC</strong>
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {language === 'fr' ? 'Pour placer un parlay, allez ' : 'To place a parlay go '}
            <Link to="/bet-parlay" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{language === 'fr' ? 'ici' : 'here'}</Link>.
          </div>
        </div>
      )}
      <div style={{ marginTop: '2rem' }}>
        {games.length === 0 && (
          <p style={{ color: '#aaa', textAlign: 'center' }}>
            {language === 'fr' ? 'Aucun match à venir aujourd\'hui' : 'No upcoming games today'}
          </p>
        )}
        {games.map(game => {
          const gameTime = new Date(game.startTime);
          const now = new Date();
          const timeDiff = (now.getTime() - gameTime.getTime()) / (1000 * 60);
          const bettingClosed = timeDiff > 30;
          
          return (
          <div key={game.id} className="division-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <img src={game.awayTeamLogo} alt={game.awayTeam} style={{ width: '80px', height: '80px' }} />
                <p style={{ marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.3rem' }}>{game.awayTeamName || game.awayTeam}</p>
                <p className="pSmall" style={{ color: '#aaa', marginTop: '0.25rem' }}>{game.awayRecord}</p>
                <p style={{ color: 'var(--accent-yellow)', marginTop: '0.25rem' }}>{calculateOdds(game.awayPoints || 0, game.homePoints || 0).toFixed(2)}x</p>
                {!bettingClosed && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <input
                      type="number"
                      placeholder={t.betting.betAmount}
                      value={awayBetAmount[game.id] || ''}
                      onChange={(e) => setAwayBetAmount({ ...awayBetAmount, [game.id]: Number(e.target.value) })}
                      style={{ padding: '0.5rem', width: '100px' }}
                      min="1"
                    />
                    <button onClick={() => handleBet(game.id, 'away')}>
                      {language === 'fr' ? 'Miser' : 'Bet'}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                <div className="game-vs" style={{ fontWeight: 'bold', marginTop: '90px' }}>@</div>
                <p style={{ color: '#aaa', fontSize: '1.3rem', marginTop: '55px' }}>
                  {new Date(game.startTime).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <img src={game.homeTeamLogo} alt={game.homeTeam} style={{ width: '80px', height: '80px' }} />
                <p style={{ marginTop: '0.5rem', fontWeight: 'bold', fontSize: '1.3rem' }}>{game.homeTeamName || game.homeTeam}</p>
                <p className="pSmall" style={{ color: '#aaa', marginTop: '0.25rem' }}>{game.homeRecord}</p>
                <p style={{ color: 'var(--accent-yellow)', marginTop: '0.25rem' }}>{calculateOdds(game.homePoints || 0, game.awayPoints || 0).toFixed(2)}x</p>
                {!bettingClosed && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <input
                      type="number"
                      placeholder={t.betting.betAmount}
                      value={homeBetAmount[game.id] || ''}
                      onChange={(e) => setHomeBetAmount({ ...homeBetAmount, [game.id]: Number(e.target.value) })}
                      style={{ padding: '0.5rem', width: '100px' }}
                      min="1"
                    />
                    <button onClick={() => handleBet(game.id, 'home')}>
                      {language === 'fr' ? 'Miser' : 'Bet'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {bettingClosed ? (
              <p style={{ color: '#ff4a4a', marginTop: '1rem', textAlign: 'center' }}>{t.betting.bettingClosed}</p>
            ) : (
              <>
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>{language === 'fr' ? 'Prédiction du score final' : 'Score Prediction'}</h4>
                                  <p className="pSmall" style={{ color: 'var(--accent-yellow)', marginBottom: '0.5rem' }}>{language === 'fr' ? 'Prédit gratuitement ou risque de gagner 5x ta mise si le score est exact!' : 'Predict for free or get 5x your stake if you guess the exact score!'}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="number"
                      placeholder={game.awayTeam}
                      min="0"
                      style={{ width: '60px', padding: '0.5rem' }}
                      id={`away-${game.id}`}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder={game.homeTeam}
                      min="0"
                      style={{ width: '60px', padding: '0.5rem' }}
                      id={`home-${game.id}`}
                    />
                    <input
                      type="number"
                      placeholder={language === 'fr' ? 'Montant (optionnel)' : 'Amount (optional)'}
                      min="0"
                      style={{ width: '140px', padding: '0.5rem' }}
                      id={`parlay-amount-${game.id}`}
                    />
                    <button onClick={() => handleScorePrediction(game.id, game.homeTeam, game.awayTeam)}>
                      {t.betting.submitPrediction}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}

export default Betting;
