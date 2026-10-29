import type { WinType } from '../engine/types';

export interface BackgammonStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  gammonsWon: number;      // Mars
  backgammonsWon: number;  // Katmerli Mars
  totalPoints: number;
}

export interface MatchHistoryItem {
  id: string;
  date: string;
  opponent: string;
  winner: 'player' | 'opponent';
  winType: WinType;
  points: number;
  durationSeconds: number;
}

const STATS_KEY = 'kaiwen_bg_stats';
const HISTORY_KEY = 'kaiwen_bg_history';

export function getStats(): BackgammonStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    gammonsWon: 0,
    backgammonsWon: 0,
    totalPoints: 0
  };
}

export function recordMatchResult(
  isWin: boolean,
  winType: WinType,
  points: number,
  opponentName: string,
  durationSeconds: number
): BackgammonStats {
  const current = getStats();
  current.matchesPlayed++;

  if (isWin) {
    current.wins++;
    current.totalPoints += points;
    if (winType === 'gammon') current.gammonsWon++;
    if (winType === 'backgammon') current.backgammonsWon++;
  } else {
    current.losses++;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(current));

    // Save history
    const history = getHistory();
    const item: MatchHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      opponent: opponentName,
      winner: isWin ? 'player' : 'opponent',
      winType,
      points,
      durationSeconds
    };
    history.unshift(item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  } catch {
    // Fallback
  }

  return current;
}

export function getHistory(): MatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return [];
}

export function clearStats() {
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(HISTORY_KEY);
}
