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

    // Compound moves from bar (if player has 1 checker on the bar and >= 2 dice)
    if (bar[player] === 1 && movesLeft.length >= 2) {
      const isDouble = movesLeft.every(m => m === movesLeft[0]);

      if (!isDouble && movesLeft.length >= 2) {
        const d1 = movesLeft[0];
        const d2 = movesLeft[1];
        const sum = d1 + d2;

        // Path 1: enter with d1, then move d2
        let path1Valid = false;
        let path1Hit = false;
        let path1IntermediateHit = false;
        let target1 = -1;

        const enter1 = player === 'white' ? 24 - d1 : d1 - 1;
        const check1 = isPointOpen(board, enter1, player);
        if (check1.open) {
          path1IntermediateHit = check1.isHit;
          const step2 = player === 'white' ? enter1 - d2 : enter1 + d2;
          if (step2 >= 0 && step2 <= 23) {
            const { open, isHit } = isPointOpen(board, step2, player);
            if (open) {
              path1Valid = true;
              path1Hit = isHit;
              target1 = step2;
            }
          }
        }

        // Path 2: enter with d2, then move d1
        let path2Valid = false;
        let path2Hit = false;
        let path2IntermediateHit = false;
        let target2 = -1;

        const enter2 = player === 'white' ? 24 - d2 : d2 - 1;
        const check2 = isPointOpen(board, enter2, player);
        if (check2.open) {
          path2IntermediateHit = check2.isHit;
          const step2 = player === 'white' ? enter2 - d1 : enter2 + d1;
          if (step2 >= 0 && step2 <= 23) {
            const { open, isHit } = isPointOpen(board, step2, player);
            if (open) {
              path2Valid = true;
              path2Hit = isHit;
              target2 = step2;
            }
          }
        }

        if (path1Valid && path2Valid && target1 === target2 && path1IntermediateHit !== path2IntermediateHit) {
          // Two distinct strategic routes: one hits an opponent blot on the way, the other passes safely!
          // Route A: Hits on the way
          const hitSeq = path1IntermediateHit ? [d1, d2] : [d2, d1];
          const hitPoint = path1IntermediateHit ? enter1 : enter2;
          const hitFinal = path1IntermediateHit ? path1Hit : path2Hit;
          legalMoves.push({
            from: 'bar',
            to: target1,
            dieUsed: sum,
            diceSequence: hitSeq,
            isHit: hitFinal || true,
            isCompound: true,
            intermediateHits: [hitPoint],
            intermediatePoint: hitPoint,
            routeDescription: `Zar ${hitSeq[0]}+${hitSeq[1]} (Hane ${hitPoint + 1}'de Kırarak)`
          });

          // Route B: Does not hit on the way
          const safeSeq = !path1IntermediateHit ? [d1, d2] : [d2, d1];
          const safePoint = !path1IntermediateHit ? enter1 : enter2;
          const safeFinal = !path1IntermediateHit ? path1Hit : path2Hit;
          legalMoves.push({
            from: 'bar',
            to: target1,
            dieUsed: sum,
            diceSequence: safeSeq,
            isHit: safeFinal,
            isCompound: true,
            intermediatePoint: safePoint,
            routeDescription: `Zar ${safeSeq[0]}+${safeSeq[1]} (Kırmadan)`
          });
        } else if (path1Valid || path2Valid) {
          const chosenTarget = path1Valid ? target1 : target2;
          const chosenHit = path1Valid ? path1Hit : path2Hit;
          const chosenSeq = path1Valid ? [d1, d2] : [d2, d1];
          const intermediateHit = path1Valid ? path1IntermediateHit : path2IntermediateHit;
          const intermediatePt = path1Valid ? enter1 : enter2;

          if (!legalMoves.some(m => m.to === chosenTarget)) {
            legalMoves.push({
              from: 'bar',
              to: chosenTarget,
              dieUsed: sum,
              diceSequence: chosenSeq,
              isHit: chosenHit || intermediateHit,
              isCompound: true,
              intermediateHits: intermediateHit ? [intermediatePt] : undefined,
              intermediatePoint: intermediatePt,
              routeDescription: intermediateHit ? `Zar ${chosenSeq[0]}+${chosenSeq[1]} (Kırarak)` : undefined
            });
          }
        }
      } else if (isDouble) {
        const d = movesLeft[0];
        const enterPoint = player === 'white' ? 24 - d : d - 1;
        if (isPointOpen(board, enterPoint, player).open) {
          let curPoint = enterPoint;
          const curSeq = [d];
          for (let k = 2; k <= movesLeft.length; k++) {
            const nextPoint = player === 'white' ? curPoint - d : curPoint + d;
            curSeq.push(d);
            if (nextPoint >= 0 && nextPoint <= 23) {
              const { open, isHit } = isPointOpen(board, nextPoint, player);
              if (open) {
                if (!legalMoves.some(m => m.to === nextPoint)) {
                  legalMoves.push({
                    from: 'bar',
                    to: nextPoint,
                    dieUsed: d * k,
                    diceSequence: [...curSeq],
                    isHit,
                    isCompound: true
                  });
                }
                curPoint = nextPoint;
              } else {
                break;
              }
            } else {
              break;
            }
          }
        }
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

  // Calculate combined / compound moves if 2 or more dice are available
  if (movesLeft.length >= 2) {
    const isDouble = movesLeft.length >= 2 && movesLeft.every(m => m === movesLeft[0]);

    if (!isDouble && movesLeft.length >= 2) {
      const d1 = movesLeft[0];
      const d2 = movesLeft[1];
      const sum = d1 + d2;

      // Check Path 1: d1 then d2
      let path1Valid = false;
      let path1Hit = false;
      let target1: number | 'off' = 'off';

      if (player === 'white') {
        const step1 = from - d1;
        if (step1 >= 0 && isPointOpen(board, step1, player).open) {
          const step2 = step1 - d2;
          if (step2 >= 0) {
            const { open, isHit } = isPointOpen(board, step2, player);
            if (open) {
              path1Valid = true;
              path1Hit = isHit;
              target1 = step2;
            }
          } else if (isBearingOff && (step1 === d2 - 1 || (step1 < d2 - 1 && step1 === highestHome))) {
            path1Valid = true;
            target1 = 'off';
          }
        }
      } else {
        const step1 = from + d1;
        if (step1 <= 23 && isPointOpen(board, step1, player).open) {
          const step2 = step1 + d2;
          if (step2 <= 23) {
            const { open, isHit } = isPointOpen(board, step2, player);
            if (open) {
              path1Valid = true;
              path1Hit = isHit;
              target1 = step2;
            }
          } else if (isBearingOff && (step1 === 24 - d2 || (step1 > 24 - d2 && step1 === highestHome))) {
            path1Valid = true;
            target1 = 'off';
          }
        }
      }

      // Check Path 2: d2 then d1
      let path2Valid = false;
      let path2Hit = false;
      let target2: number | 'off' = 'off';

      if (player === 'white') {
        const step1 = from - d2;
        if (step1 >= 0 && isPointOpen(board, step1, player).open) {
          const step2 = step1 - d1;
          if (step2 >= 0) {
            const { open, isHit } = isPointOpen(board, step2, player);
            if (open) {
              path2Valid = true;
              path2Hit = isHit;
              target2 = step2;
            }
          } else if (isBearingOff && (step1 === d1 - 1 || (step1 < d1 - 1 && step1 === highestHome))) {
            path2Valid = true;
            target2 = 'off';
          }
        }
      } else {
        const step1 = from + d2;
        if (step1 <= 23 && isPointOpen(board, step1, player).open) {
          const step2 = step1 + d1;
          if (step2 <= 23) {
            const { open, isHit } = isPointOpen(board, step2, player);
            if (open) {
              path2Valid = true;
              path2Hit = isHit;
              target2 = step2;
            }
          } else if (isBearingOff && (step1 === 24 - d1 || (step1 > 24 - d1 && step1 === highestHome))) {
            path2Valid = true;
            target2 = 'off';
          }
        }
      }

      if (path1Valid || path2Valid) {
        const chosenTarget = path1Valid ? target1 : target2;
        const chosenHit = path1Valid ? path1Hit : path2Hit;
        const chosenSequence = path1Valid ? [d1, d2] : [d2, d1];

        // Avoid duplicate target if already present as single die
        if (!legalMoves.some(m => m.to === chosenTarget)) {
          legalMoves.push({
            from,
            to: chosenTarget,
            dieUsed: sum,
            diceSequence: chosenSequence,
            isHit: chosenHit,
            isCompound: true
          });
        }
      }
    } else if (isDouble) {
      // Doubles compound (2x, 3x, 4x)
      const d = movesLeft[0];
      let curFrom = from;
      let curStep = 0;
      let curSeq: number[] = [];

      for (let k = 1; k <= movesLeft.length; k++) {
        curStep += d;
        curSeq.push(d);
        let nextTarget: number | 'off';

        if (player === 'white') {
          const destIdx = from - curStep;
          if (destIdx >= 0) {
            const { open, isHit } = isPointOpen(board, destIdx, player);
            if (!open) break;
            if (k >= 2 && !legalMoves.some(m => m.to === destIdx)) {
              legalMoves.push({
                from,
                to: destIdx,
                dieUsed: curStep,
                diceSequence: [...curSeq],
                isHit,
                isCompound: true
              });
            }
          } else if (isBearingOff) {
            if (!legalMoves.some(m => m.to === 'off')) {
              legalMoves.push({
                from,
                to: 'off',
                dieUsed: curStep,
                diceSequence: [...curSeq],
                isHit: false,
                isCompound: true
              });
            }
            break;
          } else {
            break;
          }
        } else {
          // Black doubles
          const destIdx = from + curStep;
          if (destIdx <= 23) {
            const { open, isHit } = isPointOpen(board, destIdx, player);
            if (!open) break;
            if (k >= 2 && !legalMoves.some(m => m.to === destIdx)) {
              legalMoves.push({
                from,
                to: destIdx,
                dieUsed: curStep,
                diceSequence: [...curSeq],
                isHit,
                isCompound: true
              });
            }
          } else if (isBearingOff) {
            if (!legalMoves.some(m => m.to === 'off')) {
              legalMoves.push({
                from,
                to: 'off',
                dieUsed: curStep,
                diceSequence: [...curSeq],
                isHit: false,
                isCompound: true
              });
            }
            break;
          } else {
            break;
          }
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
 * Applies a simple single move without compounds
 */
function executeSimpleMove(
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
 * Applies a move (single or compound multi-die) deterministically.
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
  if (move.isCompound && move.diceSequence && move.diceSequence.length > 1) {
    let curBoard = board;
    let curBar = bar;
    let curBorneOff = borneOff;
    let curMovesLeft = [...movesLeft];
    let curFrom = move.from;

    for (const die of move.diceSequence) {
      let intermediateTo: number | 'off';
      if (player === 'white') {
        const nextIdx = curFrom === 'bar' ? 24 - die : curFrom - die;
        intermediateTo = nextIdx < 0 ? 'off' : nextIdx;
      } else {
        const nextIdx = curFrom === 'bar' ? die - 1 : curFrom + die;
        intermediateTo = nextIdx > 23 ? 'off' : nextIdx;
      }

      const singleMove: Move = {
        from: curFrom,
        to: intermediateTo,
        dieUsed: die,
        isHit: intermediateTo !== 'off' && curBoard[intermediateTo]?.player !== null && curBoard[intermediateTo]?.player !== player && curBoard[intermediateTo]?.count === 1
      };

      const res = executeSimpleMove(curBoard, curBar, curBorneOff, player, singleMove, curMovesLeft);
      curBoard = res.newBoard;
      curBar = res.newBar;
      curBorneOff = res.newBorneOff;
      curMovesLeft = res.newMovesLeft;
      if (intermediateTo === 'off') {
        break;
      }
      curFrom = intermediateTo;
    }

    return {
      newBoard: curBoard,
      newBar: curBar,
      newBorneOff: curBorneOff,
      newMovesLeft: curMovesLeft
    };
  }

  return executeSimpleMove(board, bar, borneOff, player, move, movesLeft);
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
    let reason = 'Tüm 15 taş tahtadan başarıyla toplandı.';

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
    let reason = 'Tüm 15 taş tahtadan başarıyla toplandı.';

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
