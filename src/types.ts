export interface Team {
  id: number;
  name: string;
  abbrev: string;
  division: string;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  gamesPlayed: number;
}

export interface Player {
  id: number;
  name: string;
  teamAbbrev: string;
  goals: number;
  assists: number;
  points: number;
}
