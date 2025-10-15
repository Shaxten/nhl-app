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
      points: standing.points
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
