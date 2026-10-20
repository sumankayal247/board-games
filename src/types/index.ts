export type GameCategory = 'Board' | 'Card' | 'Classic' | 'Strategy' | 'Family' | 'Abstract' | 'Word' | 'Party';

export type GameStatus = 'playable' | 'prototype' | 'coming_soon' | 'unavailable';

export type AIDifficulty = 'noob' | 'master' | 'god';

export type PlayerType = 'human' | 'computer';

export interface PlayerConfig {
  id: string;
  name: string;
  type: PlayerType;
  avatar: string;
  color: string;
  difficulty?: AIDifficulty;
}

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: GameCategory[];
  tags: string[];
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: string;
  estimatedMinutes: [number, number];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: GameStatus;
  supportsAI: boolean;
  supportedAIDifficulties: AIDifficulty[];
  supportsOnline?: boolean;
  rulesSummary: string;
  instructions: {
    objective: string;
    setup: string;
    turnStructure: string;
    legalMoves: string;
    ending: string;
    winning: string;
    rulesetNote?: string;
  };
  features: string[];
  icon: string;
  color: string;
  accent: string;
}

export interface MoveRecord {
  playerIndex: number;
  move: any;
  timestamp: number;
  notation?: string;
}

export interface BaseGameState {
  gameId: string;
  matchId: string;
  players: PlayerConfig[];
  currentPlayer: number;
  status: 'setup' | 'playing' | 'paused' | 'finished';
  winner: number | null;
  isDraw: boolean;
  moveHistory: MoveRecord[];
  createdAt: number;
  updatedAt: number;
  durationSeconds: number;
}

export interface MatchResult {
  winner: number | null;
  isDraw: boolean;
  scores?: number[];
  reason: string;
}
