import { Team, Player } from './types';
import { fetchStandings, fetchTeamRoster, fetchSkaterStats, fetchSkaterStatsDetailed } from './api';

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
  const roster = await fetchTeamRoster(teamAbbrev);
  const forwards = roster.forwards || [];
  const defensemen = roster.defensemen || [];
  const allPlayers = [...forwards, ...defensemen];
  
  return allPlayers.map((player: any) => ({
    id: player.id,
    name: `${player.firstName.default} ${player.lastName.default}`,
    teamAbbrev,
    goals: 0,
    assists: 0,
    points: 0
  }));
}

export async function getUpcomingGames() {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`https://corsproxy.io/?https://api-web.nhle.com/v1/schedule/${today}`);
  const data = await response.json();
  const games = data.gameWeek?.[0]?.games || [];
  
  const now = new Date();
  const upcomingGames = games.filter((game: any) => new Date(game.startTimeUTC) > now);
  
  return upcomingGames.map((game: any) => ({
    id: game.id,
    homeTeam: game.homeTeam.abbrev,
    awayTeam: game.awayTeam.abbrev,
    startTime: game.startTimeUTC
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
    goals: goalsMap.get(player.id) || 0,
    assists: assistsMap.get(player.id) || 0,
    points: player.value
  }));
}
