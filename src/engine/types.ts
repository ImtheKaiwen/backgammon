export type Player = 'white' | 'black';

export type GameMode = 'ai' | 'pvp';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface Point {
  pointIndex: number; // 0 to 23 (representing Points 1 to 24)
  player: Player | null;
  count: number;
}

export type BoardState = Point[]; // Length 24

export interface BarState {
  white: number;
  black: number;
}

export interface BorneOffState {
  white: number;
  black: number;
}

export interface DiceState {
  dice: [number, number]; // e.g. [4, 2]
  movesLeft: number[];   // e.g. [4, 2] or if double [4, 4, 4, 4]
  hasRolled: boolean;
}

export interface Move {
  from: number | 'bar';       // 0-23 or 'bar'
  to: number | 'off';         // 0-23 or 'off'
  dieUsed: number;
  isHit: boolean;
}

export interface MoveRecord {
  player: Player;
  move: Move;
  diceRoll: [number, number];
  timestamp: string;
}

export type WinType = 'normal' | 'gammon' | 'backgammon'; // 1 pt, 2 pt (Mars), 3 pt (Katmerli Mars)

export interface GameOverResult {
  winner: Player;
  winType: WinType;
  points: number; // 1, 2, or 3
  reason: string;
}

export type BoardTheme = 'classic-wood' | 'dark-slate' | 'emerald-table' | 'sapphire-night';
