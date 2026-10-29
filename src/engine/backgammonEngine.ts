import type {
  Player,
  BoardState,
  BarState,
  BorneOffState,
  Move,
  WinType,
  GameOverResult
} from './types';

/**
 * Standard Backgammon Point Layout (0 to 23 corresponding to 1 to 24)
 * - White moves: Point 24 (index 23) -> Point 1 (index 0) -> Bear off
 *   White Home: Points 1 to 6 (index 0 to 5)
 * - Black moves: Point 1 (index 0) -> Point 24 (index 23) -> Bear off
 *   Black Home: Points 19 to 24 (index 18 to 23)
 */
export function createInitialBoard(): BoardState {
  const board: BoardState = Array.from({ length: 24 }, (_, i) => ({
    pointIndex: i,
    player: null,
    count: 0
  }));

  // Point 24 (index 23): 2 White
  board[23] = { pointIndex: 23, player: 'white', count: 2 };

  // Point 13 (index 12): 5 White
  board[12] = { pointIndex: 12, player: 'white', count: 5 };

  // Point 8 (index 7): 3 White
  board[7] = { pointIndex: 7, player: 'white', count: 3 };

  // Point 6 (index 5): 5 White
  board[5] = { pointIndex: 5, player: 'white', count: 5 };

  // Point 1 (index 0): 2 Black
  board[0] = { pointIndex: 0, player: 'black', count: 2 };

  // Point 12 (index 11): 5 Black
  board[11] = { pointIndex: 11, player: 'black', count: 5 };

  // Point 17 (index 16): 3 Black
  board[16] = { pointIndex: 16, player: 'black', count: 3 };

  // Point 19 (index 18): 5 Black
  board[18] = { pointIndex: 18, player: 'black', count: 5 };

  return board;
}

export function createInitialBar(): BarState {
  return { white: 0, black: 0 };
}

export function createInitialBorneOff(): BorneOffState {
  return { white: 0, black: 0 };
}

/**
 * Roll two six-sided dice. If doubles, player receives 4 moves of that value.
 */
export function rollDice(): { dice: [number, number]; movesLeft: number[] } {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;

  if (d1 === d2) {
    return { dice: [d1, d2], movesLeft: [d1, d1, d1, d1] };
  }
  return { dice: [d1, d2], movesLeft: [d1, d2] };
}

/**
 * Calculates pip count for a player (distance remaining for all checkers).
 */
export function calculatePipCount(board: BoardState, bar: BarState, player: Player): number {
  let pips = 0;

  if (player === 'white') {
    // Bar checkers must travel 25 pips
    pips += bar.white * 25;
    for (let i = 0; i < 24; i++) {
      if (board[i].player === 'white') {
        pips += board[i].count * (i + 1); // Distance to point 0 + 1
      }
    }
  } else {
    // Black bar checkers must travel 25 pips
    pips += bar.black * 25;
    for (let i = 0; i < 24; i++) {
      if (board[i].player === 'black') {
        pips += board[i].count * (24 - i); // Distance to point 23 + 1
      }
    }
  }

  return pips;
}

/**
 * Checks if a player is in position to bear off checkers.
 * All checkers must be in the home board (or already borne off), with 0 on the bar.
 */
export function canBearOff(board: BoardState, bar: BarState, player: Player): boolean {
  if (bar[player] > 0) return false;

  if (player === 'white') {
    // Home quadrant is points 0 to 5 (Points 1 to 6)
    // Any checker in points 6 to 23 invalidates bear off
    for (let i = 6; i < 24; i++) {
      if (board[i].player === 'white' && board[i].count > 0) {
        return false;
      }
    }
    return true;
  } else {
    // Black home quadrant is points 18 to 23 (Points 19 to 24)
    // Any checker in points 0 to 17 invalidates bear off
    for (let i = 0; i < 18; i++) {
      if (board[i].player === 'black' && board[i].count > 0) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Finds highest occupied point in the home board for bearing off with larger dice.
 */
function getHighestOccupiedHomePoint(board: BoardState, player: Player): number {
  if (player === 'white') {
    // White home is 5 down to 0
    for (let i = 5; i >= 0; i--) {
      if (board[i].player === 'white' && board[i].count > 0) {
        return i;
      }
    }
  } else {
    // Black home is 18 up to 23
    for (let i = 18; i <= 23; i++) {
      if (board[i].player === 'black' && board[i].count > 0) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Determines whether a destination point is open for the moving player.
 * A point is open if it has:
 * 1. No opponent checkers
 * 2. Own checkers
 * 3. Exactly 1 opponent checker (blot - will be hit!)
 */
export function isPointOpen(board: BoardState, targetIndex: number, player: Player): {
  open: boolean;
  isHit: boolean;
} {
  const target = board[targetIndex];
  if (!target || target.player === null || target.player === player) {
    return { open: true, isHit: false };
  }
  if (target.count === 1) {
    return { open: true, isHit: true };
  }
  return { open: false, isHit: false };
}

/**
 * Gets all legal moves for a specific source ('bar' or a point index 0..23)
 * considering the current available dice.
 */
export function getLegalMovesForSource(
  board: BoardState,
  bar: BarState,
  player: Player,
  from: number | 'bar',
  movesLeft: number[]
): Move[] {
  if (movesLeft.length === 0) return [];

  // If player has checkers on the bar, they CANNOT move any point on the board
  if (from !== 'bar' && bar[player] > 0) {
    return [];
  }

  const legalMoves: Move[] = [];
  const uniqueDice = Array.from(new Set(movesLeft));

  if (from === 'bar') {
    if (bar[player] === 0) return [];

    for (const die of uniqueDice) {
      const targetIndex = player === 'white' ? 24 - die : die - 1;
      const { open, isHit } = isPointOpen(board, targetIndex, player);

      if (open) {
        legalMoves.push({
          from: 'bar',
          to: targetIndex,
          dieUsed: die,
          isHit
        });
      }
    }
    return legalMoves;
  }

  // From a board point
  const currentPoint = board[from];
  if (currentPoint.player !== player || currentPoint.count === 0) {
    return [];
  }

  const isBearingOff = canBearOff(board, bar, player);
  const highestHome = isBearingOff ? getHighestOccupiedHomePoint(board, player) : -1;

  for (const die of uniqueDice) {
    if (player === 'white') {
      const targetIndex = from - die;

      if (targetIndex >= 0) {
        const { open, isHit } = isPointOpen(board, targetIndex, player);
        if (open) {
          legalMoves.push({
            from,
            to: targetIndex,
            dieUsed: die,
            isHit
          });
        }
      } else if (isBearingOff) {
        // Bearing off check
        // Exactly landing off (targetIndex === -1 corresponds to from === die - 1)
        if (from === die - 1) {
          legalMoves.push({
            from,
            to: 'off',
            dieUsed: die,
            isHit: false
          });
        } else if (from < die - 1 && from === highestHome) {
          // Can bear off with a die higher than needed IF this is the farthest checker
          legalMoves.push({
            from,
            to: 'off',
            dieUsed: die,
            isHit: false
          });
        }
      }
    } else {
      // Black moves: from + die
      const targetIndex = from + die;

      if (targetIndex <= 23) {
        const { open, isHit } = isPointOpen(board, targetIndex, player);
        if (open) {
          legalMoves.push({
            from,
            to: targetIndex,
            dieUsed: die,
            isHit
          });
        }
      } else if (isBearingOff) {
        // Black bearing off: targetIndex >= 24
        // Exact bear off is 24 - die (e.g. point 23 requires die 1)
        if (from === 24 - die) {
          legalMoves.push({
            from,
            to: 'off',
            dieUsed: die,
            isHit: false
          });
        } else if (from > 24 - die && from === highestHome) {
          // Can bear off if roll is higher than distance and checker is farthest from point 24
          legalMoves.push({
            from,
            to: 'off',
            dieUsed: die,
            isHit: false
          });
        }
      }
    }
  }

  return legalMoves;
}

/**
 * Retrieves ALL legal moves available across the entire board for the player.
 */
export function getAllLegalMoves(
  board: BoardState,
  bar: BarState,
  player: Player,
  movesLeft: number[]
): Move[] {
  if (movesLeft.length === 0) return [];

  if (bar[player] > 0) {
    return getLegalMovesForSource(board, bar, player, 'bar', movesLeft);
  }

  const allMoves: Move[] = [];
  for (let i = 0; i < 24; i++) {
    if (board[i].player === player && board[i].count > 0) {
      const moves = getLegalMovesForSource(board, bar, player, i, movesLeft);
      allMoves.push(...moves);
    }
  }

  return allMoves;
}

/**
 * Applies a move deterministically, producing new board, bar, borne-off and remaining dice states.
 */
export function executeMove(
  board: BoardState,
  bar: BarState,
  borneOff: BorneOffState,
  player: Player,
  move: Move,
  movesLeft: number[]
): {
  newBoard: BoardState;
  newBar: BarState;
  newBorneOff: BorneOffState;
  newMovesLeft: number[];
} {
  const opponent: Player = player === 'white' ? 'black' : 'white';
  const newBoard: BoardState = board.map(pt => ({ ...pt }));
  const newBar: BarState = { ...bar };
  const newBorneOff: BorneOffState = { ...borneOff };

  // 1. Remove from source
  if (move.from === 'bar') {
    newBar[player] = Math.max(0, newBar[player] - 1);
  } else {
    const srcPoint = newBoard[move.from];
    srcPoint.count--;
    if (srcPoint.count === 0) {
      srcPoint.player = null;
    }
  }

  // 2. Add to destination or bear off
  if (move.to === 'off') {
    newBorneOff[player]++;
  } else {
    const destPoint = newBoard[move.to];

    // If hitting opponent's blot
    if (destPoint.player === opponent && destPoint.count === 1) {
      newBar[opponent]++;
      destPoint.player = player;
      destPoint.count = 1;
    } else {
      destPoint.player = player;
      destPoint.count++;
    }
  }

  // 3. Remove the used die from movesLeft
  const dieIndex = movesLeft.indexOf(move.dieUsed);
  const newMovesLeft = [...movesLeft];
  if (dieIndex !== -1) {
    newMovesLeft.splice(dieIndex, 1);
  }

  return {
    newBoard,
    newBar,
    newBorneOff,
    newMovesLeft
  };
}

/**
 * Checks if the game has ended and evaluates win type:
 * - Normal Win (1 pt): Opponent has borne off >= 1 checker.
 * - Mars / Gammon (2 pt): Opponent has borne off 0 checkers.
 * - Katmerli Mars / Backgammon (3 pt): Opponent has borne off 0 checkers AND still has
 *   checkers on the bar or in the winner's home board!
 */
export function checkGameOver(
  borneOff: BorneOffState,
  board: BoardState,
  bar: BarState
): GameOverResult | null {
  if (borneOff.white === 15) {
    const opponentBorne = borneOff.black;
    let winType: WinType = 'normal';
    let points = 1;
    let reason = 'Normal Galibiyet (1 Puan)';

    if (opponentBorne === 0) {
      // Check if black has checkers on the bar or in White's home board (points 0 to 5)
      const hasOnBar = bar.black > 0;
      let hasInWhiteHome = false;
      for (let i = 0; i <= 5; i++) {
        if (board[i].player === 'black' && board[i].count > 0) {
          hasInWhiteHome = true;
          break;
        }
      }

      if (hasOnBar || hasInWhiteHome) {
        winType = 'backgammon';
        points = 3;
        reason = 'Katmerli Mars! (3 Puan) · Rakibin henüz evi terk etmemiş taşı var';
      } else {
        winType = 'gammon';
        points = 2;
        reason = 'Mars! (2 Puan) · Rakip hiç taş toplayamadı';
      }
    }

    return { winner: 'white', winType, points, reason };
  }

  if (borneOff.black === 15) {
    const opponentBorne = borneOff.white;
    let winType: WinType = 'normal';
    let points = 1;
    let reason = 'Normal Galibiyet (1 Puan)';

    if (opponentBorne === 0) {
      // Check if white has checkers on bar or in Black's home board (points 18 to 23)
      const hasOnBar = bar.white > 0;
      let hasInBlackHome = false;
      for (let i = 18; i <= 23; i++) {
        if (board[i].player === 'white' && board[i].count > 0) {
          hasInBlackHome = true;
          break;
        }
      }

      if (hasOnBar || hasInBlackHome) {
        winType = 'backgammon';
        points = 3;
        reason = 'Katmerli Mars! (3 Puan) · Rakibin henüz evi terk etmemiş taşı var';
      } else {
        winType = 'gammon';
        points = 2;
        reason = 'Mars! (2 Puan) · Rakip hiç taş toplayamadı';
      }
    }

    return { winner: 'black', winType, points, reason };
  }

  return null;
}
