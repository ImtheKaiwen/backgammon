import type {
  Player,
  BoardState,
  BarState,
  BorneOffState,
  Move,
  AIDifficulty
} from '../engine/types';
import {
  getAllLegalMoves,
  executeMove
} from '../engine/backgammonEngine';

/**
 * Heuristically evaluates a board state from the perspective of the player.
 */
function evaluatePosition(
  board: BoardState,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  difficulty: AIDifficulty
): number {
  const opponent: Player = player === 'white' ? 'black' : 'white';
  let score = 0;

  // 1. Checkers borne off (highest priority)
  score += borneOff[player] * 120;
  score -= borneOff[opponent] * 120;

  // 2. Bar penalty (being on bar is awful)
  score -= bar[player] * 90;
  score += bar[opponent] * 90;

  // 3. Doors / Primes (Kapı) vs Vulnerable Blots (Açık)
  for (let i = 0; i < 24; i++) {
    const point = board[i];
    if (point.player === player) {
      if (point.count >= 2) {
        // Holding a door
        let primeValue = 25;
        // Key points (Golden point, Bar point) have higher strategic value
        if (player === 'white') {
          if (i === 4 || i === 5 || i === 6) primeValue += 15; // Points 5, 6, 7
        } else {
          if (i === 17 || i === 18 || i === 19) primeValue += 15; // Points 18, 19, 20
        }
        score += primeValue;
      } else if (point.count === 1) {
        // Blot penalty depends on difficulty
        const blotPenalty = difficulty === 'hard' ? 40 : difficulty === 'medium' ? 25 : 10;
        score -= blotPenalty;
      }

      // Progress bonus: how close to home quadrant
      if (player === 'white') {
        score += (24 - i) * 1.5;
      } else {
        score += (i + 1) * 1.5;
      }
    } else if (point.player === opponent) {
      if (point.count === 1) {
        // Opponent blot is an opportunity
        score += 15;
      }
    }
  }

  return score;
}

/**
 * Finds the best sequence of moves for the AI player given their remaining dice.
 */
export function getBestMoveSequence(
  board: BoardState,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  movesLeft: number[],
  difficulty: AIDifficulty
): Move[] {
  if (movesLeft.length === 0) return [];

  // If easy mode, add random variance
  if (difficulty === 'easy' && Math.random() < 0.35) {
    const legal = getAllLegalMoves(board, bar, player, movesLeft);
    if (legal.length > 0) {
      const randomMove = legal[Math.floor(Math.random() * legal.length)];
      const nextState = executeMove(board, bar, borneOff, player, randomMove, movesLeft);
      return [randomMove, ...getBestMoveSequence(
        nextState.newBoard,
        nextState.newBar,
        nextState.newBorneOff,
        player,
        nextState.newMovesLeft,
        difficulty
      )];
    }
  }

  // Recursive search for best combination of moves
  function searchBest(
    b: BoardState,
    br: BarState,
    bo: BorneOffState,
    ml: number[]
  ): { moves: Move[]; score: number } {
    if (ml.length === 0) {
      return { moves: [], score: evaluatePosition(b, br, bo, player, difficulty) };
    }

    const available = getAllLegalMoves(b, br, player, ml);
    if (available.length === 0) {
      return { moves: [], score: evaluatePosition(b, br, bo, player, difficulty) };
    }

    let bestScore = -Infinity;
    let bestPath: Move[] = [];

    // Sort moves to prioritize hits and bearing off
    const sortedMoves = [...available].sort((m1, m2) => {
      let v1 = 0;
      let v2 = 0;
      if (m1.to === 'off') v1 += 100;
      if (m1.isHit) v1 += 80;
      if (m2.to === 'off') v2 += 100;
      if (m2.isHit) v2 += 80;
      return v2 - v1;
    });

    for (const move of sortedMoves) {
      const next = executeMove(b, br, bo, player, move, ml);
      const sub = searchBest(next.newBoard, next.newBar, next.newBorneOff, next.newMovesLeft);

      if (sub.score > bestScore) {
        bestScore = sub.score;
        bestPath = [move, ...sub.moves];
      }
    }

    return { moves: bestPath, score: bestScore };
  }

  const result = searchBest(board, bar, borneOff, movesLeft);
  return result.moves;
}
