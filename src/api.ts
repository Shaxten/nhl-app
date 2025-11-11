function getUrl(path: string) {
  return `https://corsproxy.io/?${encodeURIComponent('https://api-web.nhle.com/v1' + path)}`;
}

export async function fetchStandings() {
  const response = await fetch(getUrl('/standings/now'));
  return response.json();
}

export async function fetchTeamRoster(teamAbbrev: string) {
  const response = await fetch(getUrl(`/roster/${teamAbbrev}/current`));
  return response.json();
}

export async function fetchPlayerStats(playerId: number) {
  const response = await fetch(getUrl(`/player/${playerId}/landing`));
  return response.json();
}

export function getCurrentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return month >= 9 ? `${year}${year + 1}` : `${year - 1}${year}`;
}

export async function fetchSkaterStats() {
  const season = getCurrentSeason();
  const response = await fetch(getUrl(`/skater-stats-leaders/${season}/2?categories=points&limit=100`));
  return response.json();
}

export async function fetchSkaterStatsDetailed() {
  const season = getCurrentSeason();
  const response = await fetch(getUrl(`/skater-stats-leaders/${season}/2?categories=goals&limit=100`));
  const goalsData = await response.json();
  const assistsResponse = await fetch(getUrl(`/skater-stats-leaders/${season}/2?categories=assists&limit=100`));
  const assistsData = await assistsResponse.json();
  return { goals: goalsData, assists: assistsData };
}

export async function fetchGoalieStats() {
  const season = getCurrentSeason();
  const response = await fetch(getUrl(`/goalie-stats-leaders/${season}/2?categories=savePctg&limit=50`));
  const data = await response.json();
  return data;
}
