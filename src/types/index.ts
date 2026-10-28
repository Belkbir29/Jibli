export type GameId = 
  | 'charades' 
  | 'laugh' 
  | 'five_seconds' 
  | 'who_among_us' 
  | 'would_you_rather' 
  | 'truth_or_dare';

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export interface Player {
  id: string;
  name: string;
  teamId?: string;
  score: number;
}

export interface GameMetadata {
  id: GameId;
  title: string;
  tagline: string;
  iconName: string;
  badge: string;
  themeColor: string;
  bgGradient: string;
  description: string;
  minPlayers: number;
  duration: string;
}

export interface CharadesCard {
  id: string;
  category: 'movies' | 'proverbs' | 'jobs' | 'situations';
  categoryLabel: string;
  phrase: string;
  difficulty: 'easy' | 'medium' | 'hard';
  clue?: string;
}

export interface LaughCard {
  id: string;
  category: 'silly' | 'smart' | 'situations' | 'dad_jokes';
  categoryLabel: string;
  setup: string;
  punchline?: string;
}

export interface FiveSecondCard {
  id: string;
  category: string;
  prompt: string;
}

export interface WhoAmongUsCard {
  id: string;
  prompt: string;
  category: string;
}

export interface WouldYouRatherCard {
  id: string;
  optionA: string;
  optionB: string;
  votesA?: number;
  votesB?: number;
}

export interface TruthOrDareCard {
  id: string;
  type: 'truth' | 'dare';
  text: string;
  intensity: 'fun' | 'spicy' | 'crazy';
}
