export interface Team {
  id: string;
  name: string;
  logo_url?: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  jersey_number?: number;
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: 'scheduled' | 'live' | 'finished';
  match_date: string;
  round: number;
  home_team?: Team;
  away_team?: Team;
}

export interface Standing {
  team_id: string;
  team_name: string;
  logo_url?: string;
  j: number;
  pts: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
}

export interface TopScorer {
  player_id: string;
  player_name: string;
  jersey_number?: number;
  team_name: string;
  team_logo?: string;
  goals: number;
}
