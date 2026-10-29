import React, { useState, useEffect, useRef } from 'react';
import type {
  Player,
  BoardState,
  BarState,
  BorneOffState,
  Move,
  MoveRecord,
  GameMode,
  AIDifficulty,
  BoardTheme,
  GameOverResult
} from './engine/types';
import {
  createInitialBoard,
  createInitialBar,
  createInitialBorneOff,
  rollDice,
  calculatePipCount,
  getAllLegalMoves,
  getLegalMovesForSource,
  executeMove,
  checkGameOver
} from './engine/backgammonEngine';
import { getBestMoveSequence } from './services/backgammonAi';
import { sound } from './utils/sound';
import { getStoredLanguage, setStoredLanguage } from './utils/i18n';
import type { Language } from './utils/i18n';
import { recordMatchResult } from './services/statsService';

import { Header } from './components/Header';
import { BackgammonBoard } from './components/BackgammonBoard';
import { GameSidebar } from './components/GameSidebar';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
import { RulesModal } from './components/RulesModal';
import { StatsModal } from './components/StatsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HistoryDrawer } from './components/HistoryDrawer';

import './styles/theme.css';
import './styles/components.css';

interface HistorySnapshot {
  board: BoardState;
  bar: BarState;
  borneOff: BorneOffState;
  movesLeft: number[];
  logs: string[];
}

export const App: React.FC = () => {
  // Theme & Preferences
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kaiwen_bg_theme_mode') as 'light' | 'dark') || 'light';
  });
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(() => {
    return (localStorage.getItem('kaiwen_bg_board_theme') as BoardTheme) || 'classic-wood';
  });
  const [lang, setLang] = useState<Language>(getStoredLanguage);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted);

  // Game Settings
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  // Core Game State
  const [board, setBoard] = useState<BoardState>(createInitialBoard);
  const [bar, setBar] = useState<BarState>(createInitialBar);
  const [borneOff, setBorneOff] = useState<BorneOffState>(createInitialBorneOff);
  const [currentTurn, setCurrentTurn] = useState<Player>('white');

  // Dice State
  const [dice, setDice] = useState<[number, number]>([3, 1]);
  const [movesLeft, setMovesLeft] = useState<number[]>([]);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Interaction State
  const [selectedSource, setSelectedSource] = useState<number | 'bar' | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [turnHistory, setTurnHistory] = useState<HistorySnapshot[]>([]);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<MoveRecord | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());

  // Auto-pass and AI status
  const [autoPassNotice, setAutoPassNotice] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Game Over
  const [gameOverResult, setGameOverResult] = useState<GameOverResult | null>(null);

  // Modals
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('kaiwen_bg_onboarded');
  });
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);

  // AI execution lock ref
  const isAiActingRef = useRef<boolean>(false);

  // Synchronize HTML theme class
  useEffect(() => {
    document.documentElement.className = `theme-${themeMode}`;
    localStorage.setItem('kaiwen_bg_theme_mode', themeMode);
  }, [themeMode]);

  // Log helper
  const addLog = (text: string) => {
    setLogs(prev => [text, ...prev.slice(0, 25)]);
  };

  // Start / Reset Game
  const handleNewGame = () => {
    setBoard(createInitialBoard());
    setBar(createInitialBar());
    setBorneOff(createInitialBorneOff());
    setCurrentTurn('white');
    setDice([3, 1]);
    setMovesLeft([]);
    setHasRolled(false);
    setIsRolling(false);
    setSelectedSource(null);
    setLegalMoves([]);
    setTurnHistory([]);
    setMoveHistory([]);
    setLastMove(null);
    setAutoPassNotice(null);
    setIsAiThinking(false);
    setGameOverResult(null);
    isAiActingRef.current = false;
    setLogs(['Yeni oyun başlatıldı. Beyaz oyuncu başlıyor.']);
    sound.playCheckerMove();
  };

  // Roll Dice Action
  const handleRollDice = () => {
    if (hasRolled || isRolling || gameOverResult) return;

    setIsRolling(true);
    sound.playDiceRoll();

    setTimeout(() => {
      const roll = rollDice();
      setDice(roll.dice);
      setMovesLeft(roll.movesLeft);
      setHasRolled(true);
      setIsRolling(false);
      setTurnHistory([]);

      const playerLabel = currentTurn === 'white' ? 'Beyaz' : 'Siyah';
      addLog(`${playerLabel} zar attı: ${roll.dice[0]} - ${roll.dice[1]}`);

      // Check if any legal moves are possible
      const available = getAllLegalMoves(board, bar, currentTurn, roll.movesLeft);
      if (available.length === 0) {
        addLog(`Oynanacak yasal hamle yok! Sıra rakibe geçiyor.`);
        setAutoPassNotice('Yapılacak yasal hamleniz yoktu! Sıra rakibe devrediliyor...');
        setTimeout(() => {
          switchTurn(currentTurn === 'white' ? 'black' : 'white');
          setAutoPassNotice(null);
        }, 1800);
      }
    }, 450);
  };

  // Select a point on the board
  const handleSelectPoint = (pointIndex: number) => {
    if (!hasRolled || movesLeft.length === 0 || gameOverResult) return;
    if (gameMode === 'ai' && currentTurn === 'black') return; // AI is playing

    // If source is already selected, check if pointIndex is a destination
    if (selectedSource !== null) {
      const matchedMove = legalMoves.find(m => m.to === pointIndex);

      if (matchedMove) {
        applyUserMove(matchedMove);
        return;
      }
    }

    // Otherwise, select this point as source if it belongs to current player
    const point = board[pointIndex];
    if (point.player === currentTurn && point.count > 0) {
      if (bar[currentTurn] > 0) {
        addLog(`Önce bardaki kırık taşınızı oyuna sokmalısınız!`);
        return;
      }

      const availableMoves = getLegalMovesForSource(board, bar, currentTurn, pointIndex, movesLeft);
      setSelectedSource(pointIndex);
      setLegalMoves(availableMoves);
    } else {
      setSelectedSource(null);
      setLegalMoves([]);
    }
  };

  // Select the Bar as source
  const handleSelectBar = (player: Player) => {
    if (!hasRolled || movesLeft.length === 0 || gameOverResult) return;
    if (gameMode === 'ai' && currentTurn === 'black') return;
    if (player !== currentTurn || bar[player] === 0) return;

    const availableMoves = getLegalMovesForSource(board, bar, currentTurn, 'bar', movesLeft);
    setSelectedSource('bar');
    setLegalMoves(availableMoves);
  };

  // Bear-off selected
  const handleSelectBearOff = () => {
    if (selectedSource === null) return;
    const bearOffMove = legalMoves.find(m => m.to === 'off');
    if (bearOffMove) {
      applyUserMove(bearOffMove);
    }
  };

  // Apply User Move
  const applyUserMove = (move: Move) => {
    // Snapshot for undo
    setTurnHistory(prev => [
      ...prev,
      {
        board: board.map(p => ({ ...p })),
        bar: { ...bar },
        borneOff: { ...borneOff },
        movesLeft: [...movesLeft],
        logs: [...logs]
      }
    ]);

    const result = executeMove(board, bar, borneOff, currentTurn, move, movesLeft);

    // Play appropriate sound
    if (move.to === 'off') {
      sound.playBearOff();
    } else if (move.isHit) {
      sound.playHitSound();
    } else {
      sound.playCheckerMove();
    }

    // Record last move
    const record: MoveRecord = {
      player: currentTurn,
      move,
      diceRoll: dice,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLastMove(record);
    setMoveHistory(prev => [record, ...prev]);

    // Log the move
    const fromLabel = move.from === 'bar' ? 'Bar' : `Hane ${move.from + 1}`;
    const toLabel = move.to === 'off' ? 'Toplandı' : `Hane ${move.to + 1}`;
    const hitLabel = move.isHit ? ' (Taş kırıldı!)' : '';
    const comboLabel = move.isCompound ? ' (Kombo Hamle)' : '';
    addLog(`${fromLabel} ➔ ${toLabel} [Zar: ${move.dieUsed}]${hitLabel}${comboLabel}`);

    // Update states
    setBoard(result.newBoard);
    setBar(result.newBar);
    setBorneOff(result.newBorneOff);
    setMovesLeft(result.newMovesLeft);
    setSelectedSource(null);
    setLegalMoves([]);

    // Check game over
    const endResult = checkGameOver(result.newBorneOff, result.newBoard, result.newBar);
    if (endResult) {
      finishGame(endResult);
      return;
    }

    // Check if turn ends naturally or via auto-pass
    if (result.newMovesLeft.length === 0) {
      switchTurn(currentTurn === 'white' ? 'black' : 'white');
    } else {
      const remainingLegal = getAllLegalMoves(result.newBoard, result.newBar, currentTurn, result.newMovesLeft);
      if (remainingLegal.length === 0) {
        setAutoPassNotice('Kalan zarla yapılabilecek yasal hamle kalmadı! Sıra devrediliyor...');
        setTimeout(() => {
          switchTurn(currentTurn === 'white' ? 'black' : 'white');
          setAutoPassNotice(null);
        }, 1600);
      }
    }
  };

  // Pass Turn (when no moves left)
  const handlePassTurn = () => {
    if (!hasRolled) return;
    switchTurn(currentTurn === 'white' ? 'black' : 'white');
  };

  // Undo Move (within current turn)
  const handleUndo = () => {
    if (turnHistory.length === 0) return;
    const lastSnapshot = turnHistory[turnHistory.length - 1];
    setBoard(lastSnapshot.board);
    setBar(lastSnapshot.bar);
    setBorneOff(lastSnapshot.borneOff);
    setMovesLeft(lastSnapshot.movesLeft);
    setLogs(lastSnapshot.logs);
    setTurnHistory(prev => prev.slice(0, -1));
    setSelectedSource(null);
    setLegalMoves([]);
    sound.playCheckerMove();
  };

  // Switch Turn
  const switchTurn = (nextPlayer: Player) => {
    setCurrentTurn(nextPlayer);
    setHasRolled(false);
    setMovesLeft([]);
    setSelectedSource(null);
    setLegalMoves([]);
    setTurnHistory([]);
  };

  // Resign / Surrender
  const handleResign = () => {
    if (gameOverResult) return;
    const opponent: Player = currentTurn === 'white' ? 'black' : 'white';
    const result: GameOverResult = {
      winner: opponent,
      winType: 'normal',
      points: 1,
      reason: `${currentTurn === 'white' ? 'Beyaz' : 'Siyah'} oyuncu maçı terk etti.`
    };
    finishGame(result);
  };

  // Finish Game Helper
  const finishGame = (result: GameOverResult) => {
    setGameOverResult(result);
    sound.playVictory();

    const duration = Math.round((Date.now() - startTime) / 1000);
    const opponentName = gameMode === 'ai' ? `Kaiwen AI (${difficulty})` : 'İki Kişilik';
    recordMatchResult(
      result.winner === 'white',
      result.winType,
      result.points,
      opponentName,
      duration
    );
  };

  // AI Turn Handling (Fluid Pacing & Visual Clarity)
  useEffect(() => {
    if (gameMode !== 'ai' || currentTurn !== 'black' || gameOverResult) return;
    if (isAiActingRef.current) return;

    isAiActingRef.current = true;
    setIsAiThinking(true);

    // Step 1: AI Rolls Dice after a measured human pause (1000ms)
    const rollTimer = setTimeout(() => {
      setIsRolling(true);
      sound.playDiceRoll();

      setTimeout(() => {
        const roll = rollDice();
        setDice(roll.dice);
        setIsRolling(false);
        setHasRolled(true);

        addLog(`Kaiwen AI zar attı: ${roll.dice[0]} - ${roll.dice[1]}`);

        // Step 2: Calculate AI sequence
        const sequence = getBestMoveSequence(
          board,
          bar,
          borneOff,
          'black',
          roll.movesLeft,
          difficulty
        );

        if (sequence.length === 0) {
          addLog(`Kaiwen AI için oynanabilir hamle yok. Sıra size devredildi.`);
          setAutoPassNotice('Kaiwen AI için hamle yoktu! Sıra size geçti.');
          setTimeout(() => {
            switchTurn('white');
            setAutoPassNotice(null);
            setIsAiThinking(false);
            isAiActingRef.current = false;
          }, 1600);
          return;
        }

        // Step 3: Play each AI move with deliberate, smooth pacing (1200ms per step)
        let curBoard = board;
        let curBar = bar;
        let curBorne = borneOff;
        let curMoves = roll.movesLeft;

        sequence.forEach((m, idx) => {
          setTimeout(() => {
            const res = executeMove(curBoard, curBar, curBorne, 'black', m, curMoves);
            curBoard = res.newBoard;
            curBar = res.newBar;
            curBorne = res.newBorneOff;
            curMoves = res.newMovesLeft;

            if (m.to === 'off') sound.playBearOff();
            else if (m.isHit) sound.playHitSound();
            else sound.playCheckerMove();

            const fromStr = m.from === 'bar' ? 'Bar' : `Hane ${m.from + 1}`;
            const toStr = m.to === 'off' ? 'Toplandı' : `Hane ${m.to + 1}`;
            const hitNotice = m.isHit ? ' (Taşınızı kırdı!)' : '';
            addLog(`Bot: ${fromStr} ➔ ${toStr} [Zar: ${m.dieUsed}]${hitNotice}`);

            const record: MoveRecord = {
              player: 'black',
              move: m,
              diceRoll: roll.dice,
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            setLastMove(record);
            setMoveHistory(prev => [record, ...prev]);

            setBoard(curBoard);
            setBar(curBar);
            setBorneOff(curBorne);
            setMovesLeft(curMoves);

            // Check game over during sequence
            const end = checkGameOver(curBorne, curBoard, curBar);
            if (end) {
              finishGame(end);
              setIsAiThinking(false);
              isAiActingRef.current = false;
              return;
            }

            // If last move in sequence
            if (idx === sequence.length - 1) {
              setTimeout(() => {
                switchTurn('white');
                setIsAiThinking(false);
                isAiActingRef.current = false;
              }, 900);
            }
          }, (idx + 1) * 1200);
        });
      }, 600);
    }, 1000);

    return () => clearTimeout(rollTimer);
  }, [currentTurn, gameMode, gameOverResult]);

  // Derived values
  const whitePip = calculatePipCount(board, bar, 'white');
  const blackPip = calculatePipCount(board, bar, 'black');
  const canRoll = !hasRolled && !isRolling && !gameOverResult && (gameMode === 'pvp' || currentTurn === 'white');
  const canPass = hasRolled && movesLeft.length > 0 && getAllLegalMoves(board, bar, currentTurn, movesLeft).length === 0;

  return (
    <div className="app-container">
      {/* HEADER */}
      <Header
        lang={lang}
        themeMode={themeMode}
        isMuted={isMuted}
        onNewGame={handleNewGame}
        onToggleTheme={() => setThemeMode(m => (m === 'light' ? 'dark' : 'light'))}
        onToggleSound={() => setIsMuted(sound.toggleMute())}
        onOpenSettings={() => setShowSettings(true)}
        onOpenRules={() => setShowOnboarding(true)}
        onOpenStats={() => setShowStats(true)}
      />

      {/* MAIN STAGE */}
      <main className="main-stage">
        {/* BOARD ARENA */}
        <section className="board-arena">
          <BackgammonBoard
            board={board}
            bar={bar}
            borneOff={borneOff}
            currentTurn={currentTurn}
            selectedSource={selectedSource}
            legalMoves={legalMoves}
            onSelectPoint={handleSelectPoint}
            onSelectBar={handleSelectBar}
            onSelectBearOff={handleSelectBearOff}
            theme={boardTheme}
          />
        </section>

        {/* SIDEBAR */}
        <GameSidebar
          lang={lang}
          gameMode={gameMode}
          currentTurn={currentTurn}
          whitePip={whitePip}
          blackPip={blackPip}
          bar={bar}
          borneOff={borneOff}
          dice={dice}
          movesLeft={movesLeft}
          hasRolled={hasRolled}
          isRolling={isRolling}
          canRoll={canRoll}
          canPass={canPass}
          canUndo={turnHistory.length > 0}
          onRoll={handleRollDice}
          onPass={handlePassTurn}
          onUndo={handleUndo}
          onResign={handleResign}
          lastMove={lastMove}
          onOpenHistory={() => setShowHistoryDrawer(true)}
          isAiThinking={isAiThinking}
          autoPassNotice={autoPassNotice}
        />
      </main>

      {/* STEP-BY-STEP ONBOARDING HOW TO PLAY MODAL */}
      {showOnboarding && (
        <OnboardingModal
          lang={lang}
          themeMode={themeMode}
          onClose={() => {
            localStorage.setItem('kaiwen_bg_onboarded', 'true');
            setShowOnboarding(false);
          }}
        />
      )}

      {/* SLIDE-OVER HISTORY DRAWER */}
      <HistoryDrawer
        isOpen={showHistoryDrawer}
        history={moveHistory}
        lang={lang}
        onClose={() => setShowHistoryDrawer(false)}
      />

      {/* GAME OVER MODAL */}
      {gameOverResult && (
        <GameOverModal
          result={gameOverResult}
          humanPlayer="white"
          lang={lang}
          onRematch={handleNewGame}
          onClose={() => setGameOverResult(null)}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          lang={lang}
          onToggleLang={l => {
            setLang(l);
            setStoredLanguage(l);
          }}
          themeMode={themeMode}
          onToggleThemeMode={setThemeMode}
          boardTheme={boardTheme}
          onChangeBoardTheme={t => {
            setBoardTheme(t);
            localStorage.setItem('kaiwen_bg_board_theme', t);
          }}
          gameMode={gameMode}
          onChangeGameMode={setGameMode}
          difficulty={difficulty}
          onChangeDifficulty={setDifficulty}
          isMuted={isMuted}
          onToggleSound={() => setIsMuted(sound.toggleMute())}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* RULES MODAL (Quick View) */}
      {showRules && (
        <RulesModal
          lang={lang}
          onClose={() => setShowRules(false)}
        />
      )}

      {/* STATS MODAL */}
      {showStats && (
        <StatsModal
          lang={lang}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
};

export default App;
