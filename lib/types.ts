export interface Team {
  id: string;
  name: string;
  logo_url?: string;
  group_name?: string;
  access_token?: string; // NOVO: Token do link exclusivo
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  shirt_number?: number;
  document_id?: string;
  goals?: number;
}

// NOVO: Interface para Comissão Técnica
export interface Staff {
  id: string;
  team_id: string;
  name: string;
  role: string;
  document_id?: string;
}

export interface Standing {
  team_id: string;
  team_name: string;
  pts: number;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
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
  youtube_url?: string;
  home_team?: Team;
  away_team?: Team;
}

export interface TopScorer {
  player_id: string;
  player_name: string;
  team_name: string;
  goals: number;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  image_url?: string;
  youtube_url?: string;
  created_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  tier: string;
  active: boolean;
}
