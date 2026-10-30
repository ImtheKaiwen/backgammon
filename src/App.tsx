import React, { useState, useEffect, useRef, useMemo } from 'react';
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

import { LeftNav } from './components/LeftNav';
import { SplashScreen } from './components/SplashScreen';
import { BackgammonBoard } from './components/BackgammonBoard';
import { GameSidebar, OpeningRollState } from './components/GameSidebar';
import { GameOverModal } from './components/GameOverModal';
import { SettingsModal } from './components/SettingsModal';
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

interface AILastTurnSnapshot {
  dice: [number, number];
  moves: Move[];
  boardBefore: BoardState;
  barBefore: BarState;
  borneOffBefore: BorneOffState;
}

export const App: React.FC = () => {
  // Theme & Preferences - default to sapphire-night as requested!
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('kaiwen_bg_theme_mode') as 'light' | 'dark') || 'light';
  });
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(() => {
    return (localStorage.getItem('kaiwen_bg_board_theme') as BoardTheme) || 'sapphire-night';
  });
  const [lang, setLang] = useState<Language>(getStoredLanguage);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted);

  // Match Phase: setup -> opening_roll -> playing
  const [matchPhase, setMatchPhase] = useState<'setup' | 'opening_roll' | 'playing'>('setup');

  // Game Settings
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');

  // Opening Roll State
  const [openingRollState, setOpeningRollState] = useState<OpeningRollState>({
    white: null,
    black: null,
    isRolling: false,
    message: 'Oyuna başlamak için zarları atın.',
    winner: null
  });

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
  const [logs, setLogs] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Auto-pass and AI status
  const [autoPassNotice, setAutoPassNotice] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // AI Replay state
  const [aiLastTurn, setAiLastTurn] = useState<AILastTurnSnapshot | null>(null);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  // AI Assistant / Coach mode (toggleable in Settings)
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem('kaiwen_bg_ai_assistant');
    return stored !== null ? stored === 'true' : true;
  });

  // Auto Confirm Moves setting (toggleable in Settings)
  const [autoConfirmMoves, setAutoConfirmMoves] = useState<boolean>(() => {
    const stored = localStorage.getItem('kaiwen_bg_autoconfirm');
    return stored !== null ? stored === 'true' : false;
  });

  // Game Over
  const [gameOverResult, setGameOverResult] = useState<GameOverResult | null>(null);

  // Splash Screen & Onboarding
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setShowOnboarding(true);
  };

  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
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

  // Start / Reset Game -> returns to pre-game setup
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
    setAutoPassNotice(null);
    setIsAiThinking(false);
    setGameOverResult(null);
    setAiLastTurn(null);
    setIsReplaying(false);
    isAiActingRef.current = false;
    setMatchPhase('setup');
    setLogs(['Yeni karşılaşma başlatıldı. Sağ menüden oyun modunu seçin.']);
    sound.playCheckerMove();
  };

  // Pre-Game Setup -> Transition to Opening Roll
  const handleStartOpeningRoll = () => {
    setMatchPhase('opening_roll');
    setOpeningRollState({
      white: null,
      black: null,
      isRolling: false,
      message: 'Oyuna başlamak için taraflar birer zar atar.',
      winner: null
    });
  };

  // Roll Opening Dice
  const handleRollOpeningDice = () => {
    if (openingRollState.isRolling) return;
    setOpeningRollState(prev => ({ ...prev, isRolling: true, message: 'Zarlar atılıyor...' }));
    sound.playDiceRoll();

    setTimeout(() => {
      const w = Math.floor(Math.random() * 6) + 1;
      const b = Math.floor(Math.random() * 6) + 1;

      let winner: Player | null = null;
      let msg = '';

      if (w > b) {
        winner = 'white';
        msg = `Beyaz ${w}, Siyah ${b} attı! Oyuna BEYAZ başlıyor. (İlk zarlar: ${w}-${b})`;
      } else if (b > w) {
        winner = 'black';
        msg = `Siyah ${b}, Beyaz ${w} attı! Oyuna ${gameMode === 'ai' ? 'Kaiwen AI' : 'SİYAH'} başlıyor. (İlk zarlar: ${b}-${w})`;
      } else {
        msg = `Zarlar eşit (${w} - ${b})! Kurallar gereği tekrar zar atılıyor.`;
      }

      setOpeningRollState({
        white: w,
        black: b,
        isRolling: false,
        message: msg,
        winner
      });
    }, 600);
  };

  // Complete Opening Roll and Start Playing with the Rolled Dice!
  const handleCompleteOpeningRoll = () => {
    if (!openingRollState.winner || openingRollState.white === null || openingRollState.black === null) return;
    const w = openingRollState.white;
    const b = openingRollState.black;
    const winner = openingRollState.winner;

    setBoard(createInitialBoard());
    setBar(createInitialBar());
    setBorneOff(createInitialBorneOff());
    setCurrentTurn(winner);
    setDice([w, b]);
    setMovesLeft([w, b]);
    setHasRolled(true);
    setIsRolling(false);
    setSelectedSource(null);
    setLegalMoves([]);
    setTurnHistory([]);
    setMoveHistory([]);
    setAutoPassNotice(null);
    setGameOverResult(null);
    setStartTime(Date.now());
    isAiActingRef.current = false;

    setMatchPhase('playing');
    addLog(`Açılış zarı tamamlandı: Beyaz ${w}, Siyah ${b}. Oyuna ${winner === 'white' ? 'Beyaz' : 'Siyah'} başladı.`);
  };

  // Roll Dice Action during Match
  const handleRollDice = () => {
    if (hasRolled || isRolling || gameOverResult || isReplaying) return;

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

  // AI Assistant / Coach calculated recommendations
  const aiRecommendedMoves = useMemo(() => {
    if (!aiAssistantEnabled || matchPhase !== 'playing' || currentTurn !== 'white' || !hasRolled || movesLeft.length === 0 || gameOverResult || isReplaying) {
      return [];
    }
    return getBestMoveSequence(board, bar, borneOff, 'white', movesLeft, 'hard');
  }, [aiAssistantEnabled, matchPhase, currentTurn, hasRolled, movesLeft, board, bar, borneOff, gameOverResult, isReplaying]);

  // Apply AI Recommendation
  const handleApplyAiHint = () => {
    if (aiRecommendedMoves.length === 0) return;
    const nextMove = aiRecommendedMoves[0];
    applyUserMove(nextMove);
  };

  // Select a point on the board (supports specificMove for route selection)
  const handleSelectPoint = (pointIndex: number, specificMove?: Move) => {
    if (matchPhase !== 'playing' || !hasRolled || movesLeft.length === 0 || gameOverResult || isReplaying) return;
    if (gameMode === 'ai' && currentTurn === 'black') return;

    // If source is already selected, check if pointIndex is a destination
    if (selectedSource !== null) {
      const matchedMove = specificMove || legalMoves.find(m => m.to === pointIndex);

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
    if (matchPhase !== 'playing' || !hasRolled || movesLeft.length === 0 || gameOverResult || isReplaying) return;
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
    setMoveHistory(prev => [record, ...prev]);

    // Update state
    setBoard(result.newBoard);
    setBar(result.newBar);
    setBorneOff(result.newBorneOff);
    setMovesLeft(result.newMovesLeft);
    setSelectedSource(null);
    setLegalMoves([]);

    const fromStr = move.from === 'bar' ? 'Bar' : `Hane ${move.from + 1}`;
    const toStr = move.to === 'off' ? 'Toplandı' : `Hane ${move.to + 1}`;
    const hitStr = move.isHit ? ' (Taş kırıldı!)' : '';
    addLog(`Hamle: ${fromStr} ➔ ${toStr} [Zar: ${move.dieUsed}]${hitStr}`);

    // Check game over
    const end = checkGameOver(result.newBorneOff, result.newBoard, result.newBar);
    if (end) {
      finishGame(end);
      return;
    }

    // If autoConfirmMoves is enabled AND no moves left, switch turn automatically in AI mode
    if (result.newMovesLeft.length === 0 && autoConfirmMoves && gameMode === 'ai') {
      setTimeout(() => {
        switchTurn(currentTurn === 'white' ? 'black' : 'white');
      }, 350);
      return;
    }

    // If remaining dice have NO legal moves, inform and switch turn
    if (result.newMovesLeft.length > 0) {
      const remainingLegal = getAllLegalMoves(result.newBoard, result.newBar, currentTurn, result.newMovesLeft);
      if (remainingLegal.length === 0) {
        addLog(`Kalan zarlarla (${result.newMovesLeft.join(', ')}) oynanabilecek hamle yok. Sıra rakibe devrediliyor.`);
        setAutoPassNotice(`Kalan zarınızla (${result.newMovesLeft.join(', ')}) oynanabilecek yasal hamle kalmadı! Sıra devrediliyor...`);
        setTimeout(() => {
          switchTurn(currentTurn === 'white' ? 'black' : 'white');
          setAutoPassNotice(null);
        }, 1600);
      }
    }
  };

  // Manual Turn Confirmation
  const handleConfirmMove = () => {
    if (turnHistory.length === 0 || gameOverResult) return;
    if (gameMode === 'ai' && currentTurn !== 'white') return;
    switchTurn(currentTurn === 'white' ? 'black' : 'white');
  };

  // Undo Last Action in Current Turn
  const handleUndo = () => {
    if (turnHistory.length === 0 || gameOverResult) return;
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

  // Pass Turn
  const handlePassTurn = () => {
    switchTurn(currentTurn === 'white' ? 'black' : 'white');
  };

  // Surrender / Resign
  const handleResign = () => {
    if (gameOverResult) return;
    const winner: Player = currentTurn === 'white' ? 'black' : 'white';
    finishGame({
      winner,
      winType: 'normal',
      points: 1,
      reason: `${currentTurn === 'white' ? 'Beyaz' : 'Siyah'} oyuncu maçı terk etti.`
    });
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

  // Finish Game & Record Statistics
  const finishGame = (res: GameOverResult) => {
    setGameOverResult(res);
    sound.playVictory();

    const duration = Math.round((Date.now() - startTime) / 1000);
    const opponentName = gameMode === 'ai' ? `Kaiwen AI (${difficulty})` : 'Oyuncu 2 (Lokal)';

    recordMatchResult(
      res.winner === 'white',
      res.winType,
      res.points,
      opponentName,
      duration
    );
  };

  // AI Turn Handling (Fluid Pacing & Visual Clarity)
  useEffect(() => {
    if (matchPhase !== 'playing') return;
    if (gameMode !== 'ai' || currentTurn !== 'black' || gameOverResult || isReplaying) return;
    if (isAiActingRef.current) return;

    isAiActingRef.current = true;
    setIsAiThinking(true);

    const executeAiSequence = (rollDiceValues: [number, number], rollMovesLeft: number[]) => {
      // Step 2: Calculate AI sequence
      const sequence = getBestMoveSequence(
        board,
        bar,
        borneOff,
        'black',
        rollMovesLeft,
        difficulty
      );

      // Snapshot AI turn for replay!
      setAiLastTurn({
        dice: rollDiceValues,
        moves: sequence,
        boardBefore: board.map(p => ({ ...p })),
        barBefore: { ...bar },
        borneOffBefore: { ...borneOff }
      });

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
      let curMoves = rollMovesLeft;

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
            diceRoll: rollDiceValues,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          };
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
    };

    // If AI already has dice from the Opening Roll (e.g. 5-2), do NOT re-roll; play immediately!
    if (hasRolled && movesLeft.length > 0) {
      const startTimer = setTimeout(() => {
        executeAiSequence(dice, movesLeft);
      }, 700);
      return () => clearTimeout(startTimer);
    }

    // Otherwise, normal turn: AI rolls dice
    const rollTimer = setTimeout(() => {
      setIsRolling(true);
      sound.playDiceRoll();

      setTimeout(() => {
        const roll = rollDice();
        setDice(roll.dice);
        setIsRolling(false);
        setHasRolled(true);

        addLog(`Kaiwen AI zar attı: ${roll.dice[0]} - ${roll.dice[1]}`);
        executeAiSequence(roll.dice, roll.movesLeft);
      }, 600);
    }, 1000);

    return () => clearTimeout(rollTimer);
  }, [matchPhase, currentTurn, gameMode, gameOverResult, isReplaying, hasRolled]);

  // AI Move Replay Handler
  const handleReplayAi = () => {
    if (!aiLastTurn || isReplaying || currentTurn !== 'white' || gameOverResult) return;

    setIsReplaying(true);
    setAutoPassNotice(`AI hamleleri tekrar oynatılıyor (${aiLastTurn.dice[0]} - ${aiLastTurn.dice[1]})...`);

    // Restore board state before AI turn
    setBoard(aiLastTurn.boardBefore);
    setBar(aiLastTurn.barBefore);
    setBorneOff(aiLastTurn.borneOffBefore);

    let curBoard = aiLastTurn.boardBefore;
    let curBar = aiLastTurn.barBefore;
    let curBorne = aiLastTurn.borneOffBefore;

    aiLastTurn.moves.forEach((m, idx) => {
      setTimeout(() => {
        const res = executeMove(curBoard, curBar, curBorne, 'black', m, [m.dieUsed]);
        curBoard = res.newBoard;
        curBar = res.newBar;
        curBorne = res.newBorneOff;

        if (m.isHit) sound.playHitSound();
        else sound.playCheckerMove();

        setBoard(curBoard);
        setBar(curBar);
        setBorneOff(curBorne);

        if (idx === aiLastTurn.moves.length - 1) {
          setTimeout(() => {
            setIsReplaying(false);
            setAutoPassNotice(null);
          }, 800);
        }
      }, (idx + 1) * 1000);
    });
  };

  // Derived values
  const whitePip = calculatePipCount(board, bar, 'white');
  const blackPip = calculatePipCount(board, bar, 'black');
  const canRoll = matchPhase === 'playing' && !hasRolled && !isRolling && !gameOverResult && !isReplaying && (gameMode === 'pvp' || currentTurn === 'white');
  const canPass = matchPhase === 'playing' && hasRolled && turnHistory.length === 0 && movesLeft.length > 0 && getAllLegalMoves(board, bar, currentTurn, movesLeft).length === 0;

  return (
    <div className="app-container">
      {/* LEFT NAVIGATION SIDEBAR (CHESS-STYLE MAIN MENU) */}
      <LeftNav
        lang={lang}
        themeMode={themeMode}
        isMuted={isMuted}
        onNewGame={handleNewGame}
        onOpenHistory={() => setShowHistoryDrawer(true)}
        onOpenStats={() => setShowStats(true)}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenSettings={() => setShowSettings(true)}
        onToggleTheme={() => setThemeMode(m => (m === 'light' ? 'dark' : 'light'))}
        onToggleSound={() => setIsMuted(sound.toggleMute())}
        onToggleLang={() => {
          const nextLang = lang === 'tr' ? 'en' : 'tr';
          setLang(nextLang);
          setStoredLanguage(nextLang);
        }}
      />

      {/* MAIN WORKSPACE AREA */}
      <div className="app-main-workspace">
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
              aiHintMoves={aiRecommendedMoves}
            />
          </section>

          {/* SIDEBAR */}
          <GameSidebar
            lang={lang}
            matchPhase={matchPhase}
            gameMode={gameMode}
            onChangeGameMode={setGameMode}
            difficulty={difficulty}
            onChangeDifficulty={setDifficulty}
            onStartOpeningRoll={handleStartOpeningRoll}
            openingRollState={openingRollState}
            onRollOpeningDice={handleRollOpeningDice}
            onCompleteOpeningRoll={handleCompleteOpeningRoll}
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
            canConfirm={
              turnHistory.length > 0 &&
              !gameOverResult &&
              (gameMode === 'pvp' || (!autoConfirmMoves && currentTurn === 'white'))
            }
            onConfirmMove={handleConfirmMove}
            onRoll={handleRollDice}
            onPass={handlePassTurn}
            onUndo={handleUndo}
            onResign={handleResign}
            recentMoves={moveHistory}
            onOpenHistory={() => setShowHistoryDrawer(true)}
            isAiThinking={isAiThinking}
            autoPassNotice={autoPassNotice}
            aiAssistantEnabled={aiAssistantEnabled}
            aiRecommendedMoves={aiRecommendedMoves}
            onApplyAiHint={handleApplyAiHint}
            canReplayAi={Boolean(aiLastTurn && aiLastTurn.moves.length > 0)}
            onReplayAi={handleReplayAi}
          />
        </main>
      </div>

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
          autoConfirmMoves={autoConfirmMoves}
          onToggleAutoConfirm={enabled => {
            setAutoConfirmMoves(enabled);
            localStorage.setItem('kaiwen_bg_autoconfirm', enabled ? 'true' : 'false');
          }}
          aiAssistantEnabled={aiAssistantEnabled}
          onToggleAiAssistant={enabled => {
            setAiAssistantEnabled(enabled);
            localStorage.setItem('kaiwen_bg_ai_assistant', enabled ? 'true' : 'false');
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* STATS MODAL */}
      {showStats && (
        <StatsModal
          lang={lang}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* 1-SECOND SPLASH SCREEN WITH KAIWEN LOGO */}
      {showSplash && (
        <SplashScreen
          themeMode={themeMode}
          onComplete={handleSplashComplete}
        />
      )}
    </div>
  );
};

export default App;
