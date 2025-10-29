import { Team, Player } from './types';
import { fetchStandings, fetchSkaterStats, fetchSkaterStatsDetailed, fetchGoalieStats, getCurrentSeason } from './api';

export async function getTeams(): Promise<Team[]> {
  const data = await fetchStandings();
  return data.standings.flatMap((standing: any) => 
    standing.teamAbbrev ? [{
      id: standing.teamAbbrev.default,
      name: standing.teamName.default,
      abbrev: standing.teamAbbrev.default,
      division: standing.divisionName,
      wins: standing.wins,
      losses: standing.losses,
      otLosses: standing.otLosses,
      points: standing.points,
      gamesPlayed: standing.gamesPlayed
    }] : []
  );
}

export async function getTeamPlayers(teamAbbrev: string): Promise<Player[]> {
  try {
    const season = getCurrentSeason();
    const response = await fetch(`https://corsproxy.io/?https://api-web.nhle.com/v1/club-stats/${teamAbbrev}/${season}/2`);
    const data = await response.json();
    
    const skaters = data.skaters || [];
    const goalies = data.goalies || [];
    
    const skatersList = skaters.map((player: any) => ({
      id: player.playerId,
      name: player.firstName.default + ' ' + player.lastName.default,
      teamAbbrev,
      goals: player.goals,
      assists: player.assists,
      points: player.points
    }));
    
    const goaliesList = goalies.map((player: any) => ({
      id: player.playerId,
      name: player.firstName.default + ' ' + player.lastName.default + ' (G)',
      teamAbbrev,
      goals: player.gamesPlayed || 0,
      assists: player.savePercentage ? (player.savePercentage * 100).toFixed(2) : '0.00',
      points: 0
    }));
    
    return [...skatersList.sort((a: any, b: any) => b.points - a.points), ...goaliesList];
  } catch (error) {
    console.error('Error fetching team players:', error);
    return [];
  }
}

export async function getUpcomingGames() {
  const today = new Date().toISOString().split('T')[0];
  const [scheduleResponse, standingsData] = await Promise.all([
    fetch(`https://corsproxy.io/?https://api-web.nhle.com/v1/schedule/${today}`),
    fetchStandings()
  ]);
  const data = await scheduleResponse.json();
  const games = data.gameWeek?.[0]?.games || [];
  
  const teamRecords = new Map();
  standingsData.standings.forEach((team: any) => {
    if (team.teamAbbrev) {
      teamRecords.set(team.teamAbbrev.default, `${team.wins}-${team.losses}-${team.otLosses}`);
    }
  });
  
  const now = new Date();
  const upcomingGames = games.filter((game: any) => new Date(game.startTimeUTC) > now);
  
  return upcomingGames.map((game: any) => ({
    id: game.id,
    homeTeam: game.homeTeam.abbrev,
    awayTeam: game.awayTeam.abbrev,
    startTime: game.startTimeUTC,
    homeTeamLogo: game.homeTeam.logo,
    awayTeamLogo: game.awayTeam.logo,
    homeRecord: teamRecords.get(game.homeTeam.abbrev) || '',
    awayRecord: teamRecords.get(game.awayTeam.abbrev) || ''
  }));
}

export async function placeBet(userId: string, gameId: number, teamChoice: string, amount: number, homeTeam: string, awayTeam: string) {
  const { supabase } = await import('./supabase');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', userId)
    .single();
  
  if (!profile || profile.currency < amount) {
    throw new Error('Insufficient funds');
  }
  
  await supabase.from('bets').insert({
    user_id: userId,
    game_id: gameId,
    team_choice: teamChoice,
    amount,
    status: 'pending',
    home_team: homeTeam,
    away_team: awayTeam
  });
  
  await supabase
    .from('profiles')
    .update({ currency: profile.currency - amount })
    .eq('id', userId);
}

export async function getTopPlayers(): Promise<Player[]> {
  const [pointsData, detailedData] = await Promise.all([
    fetchSkaterStats(),
    fetchSkaterStatsDetailed()
  ]);
  
  const playersList = pointsData.points || [];
  const goalsMap = new Map((detailedData.goals.goals || []).map((p: any) => [p.id, p.value]));
  const assistsMap = new Map((detailedData.assists.assists || []).map((p: any) => [p.id, p.value]));
  
  return playersList.map((player: any) => ({
    id: player.id,
    name: player.firstName.default + ' ' + player.lastName.default,
    teamAbbrev: player.teamAbbrev,
    teamLogo: `https://assets.nhle.com/logos/nhl/svg/${player.teamAbbrev}_light.svg`,
    goals: goalsMap.get(player.id) || 0,
    assists: assistsMap.get(player.id) || 0,
    points: player.value
  }));
}

export async function getTopGoalies(): Promise<any[]> {
  const data = await fetchGoalieStats();
  const goaliesList = data.savePctg || [];
  
  return goaliesList.map((goalie: any) => ({
    id: goalie.id,
    name: goalie.firstName.default + ' ' + goalie.lastName.default,
    teamAbbrev: goalie.teamAbbrev,
    teamLogo: goalie.teamLogo || `https://assets.nhle.com/logos/nhl/svg/${goalie.teamAbbrev}_light.svg`,
    savePct: (goalie.value * 100).toFixed(2)
  }));
}
