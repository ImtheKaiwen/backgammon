import React from 'react';
import {
  Dices,
  SkipForward,
  Undo2,
  Flag,
  Bot,
  User,
  History,
  ArrowRight,
  Sparkles,
  Check,
  RotateCcw,
  Play,
  Swords,
  Users
} from 'lucide-react';
import type {
  Player,
  GameMode,
  AIDifficulty,
  BarState,
  BorneOffState,
  MoveRecord,
  Move
} from '../engine/types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import { DiceView } from './DiceView';

export interface OpeningRollState {
  white: number | null;
  black: number | null;
  isRolling: boolean;
  message: string | null;
  winner: Player | null;
}

interface GameSidebarProps {
  lang: Language;
  matchPhase: 'setup' | 'opening_roll' | 'playing';
  gameMode: GameMode;
  onChangeGameMode: (mode: GameMode) => void;
  difficulty: AIDifficulty;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  onStartOpeningRoll: () => void;
  openingRollState: OpeningRollState;
  onRollOpeningDice: () => void;
  onCompleteOpeningRoll: () => void;

  currentTurn: Player;
  whitePip: number;
  blackPip: number;
  bar: BarState;
  borneOff: BorneOffState;
  dice: [number, number];
  movesLeft: number[];
  hasRolled: boolean;
  isRolling: boolean;
  canRoll: boolean;
  canPass: boolean;
  canUndo: boolean;
  canConfirm?: boolean;
  onConfirmMove?: () => void;
  onRoll: () => void;
  onPass: () => void;
  onUndo: () => void;
  onResign: () => void;
  recentMoves: MoveRecord[];
  onOpenHistory: () => void;
  isAiThinking: boolean;
  autoPassNotice: string | null;

  aiAssistantEnabled?: boolean;
  aiRecommendedMoves?: Move[];
  onApplyAiHint?: () => void;
  canReplayAi?: boolean;
  onReplayAi?: () => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  lang,
  matchPhase,
  gameMode,
  onChangeGameMode,
  difficulty,
  onChangeDifficulty,
  onStartOpeningRoll,
  openingRollState,
  onRollOpeningDice,
  onCompleteOpeningRoll,

  currentTurn,
  whitePip,
  blackPip,
  bar,
  borneOff,
  dice,
  movesLeft,
  hasRolled,
  isRolling,
  canRoll,
  canPass,
  canUndo,
  canConfirm,
  onConfirmMove,
  onRoll,
  onPass,
  onUndo,
  onResign,
  recentMoves,
  onOpenHistory,
  isAiThinking,
  autoPassNotice,

  aiAssistantEnabled = false,
  aiRecommendedMoves = [],
  onApplyAiHint,
  canReplayAi = false,
  onReplayAi
}) => {
  const t = translations[lang];

  // 1. PRE-GAME MATCH SETUP VIEW
  if (matchPhase === 'setup') {
    return (
      <aside className="game-sidebar">
        <div className="sidebar-scroll">
          <div className="match-setup-panel">
            <div className="setup-card">
              <div className="setup-card-header">
                <Swords size={18} color="var(--accent-primary)" />
                <span className="setup-card-title">Karşılaşma Ayarları</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Oyuna başlamadan önce oyun modunu ve bot zorluğunu belirleyin.
              </p>

              {/* Mode Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Oyun Modu
                </span>
                <div className="setup-btn-grid">
                  <button
                    type="button"
                    className={`setup-option-btn ${gameMode === 'ai' ? 'active' : ''}`}
                    onClick={() => onChangeGameMode('ai')}
                  >
                    <Bot size={20} />
                    <span>Yapay Zeka</span>
                  </button>
                  <button
                    type="button"
                    className={`setup-option-btn ${gameMode === 'pvp' ? 'active' : ''}`}
                    onClick={() => onChangeGameMode('pvp')}
                  >
                    <Users size={20} />
                    <span>İki Kişilik</span>
                  </button>
                </div>
              </div>

              {/* Bot Difficulty (if AI) */}
              {gameMode === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Kaiwen Bot Zorluğu
                  </span>
                  <div className="segmented-control full-width">
                    <button
                      type="button"
                      className={`segmented-btn ${difficulty === 'easy' ? 'active' : ''}`}
                      onClick={() => onChangeDifficulty('easy')}
                    >
                      <span>Başlangıç</span>
                    </button>
                    <button
                      type="button"
                      className={`segmented-btn ${difficulty === 'medium' ? 'active' : ''}`}
                      onClick={() => onChangeDifficulty('medium')}
                    >
                      <span>Orta</span>
                    </button>
                    <button
                      type="button"
                      className={`segmented-btn ${difficulty === 'hard' ? 'active' : ''}`}
                      onClick={() => onChangeDifficulty('hard')}
                    >
                      <span>Usta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              type="button"
              className="btn-primary-action"
              onClick={onStartOpeningRoll}
              style={{ marginTop: 'auto', padding: '1rem', fontSize: '0.95rem' }}
            >
              <Dices size={20} />
              <span>Açılış Zarına Geç</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Helper component to render authentic die face with dots
  const renderOpeningDie = (value: number | null, isRolling: boolean) => {
    const dotPositions: Record<number, number[]> = {
      1: [4],
      2: [2, 6],
      3: [2, 4, 6],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };
    const activeDots = value ? (dotPositions[value] || [4]) : [];

    return (
      <div
        className={`die-cube ${isRolling ? 'is-rolling' : ''} available`}
        style={{
          cursor: 'default',
          width: '52px',
          height: '52px',
          boxShadow: '0 6px 14px rgba(0, 0, 0, 0.25)'
        }}
      >
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            className={value && activeDots.includes(idx) ? 'die-dot' : ''}
            style={{ width: '8px', height: '8px', borderRadius: '50%' }}
          />
        ))}
      </div>
    );
  };

  // 2. OPENING ROLL BATTLE VIEW
  if (matchPhase === 'opening_roll') {
    return (
      <aside className="game-sidebar">
        <div className="sidebar-scroll">
          <div className="opening-roll-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Dices size={20} color="var(--accent-primary)" />
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>Açılış Zarı</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Geleneksel tavla kurallarına göre, oyuna kimin başlayacağını belirlemek için taraflar birer zar atar. En yüksek zarı atan oyuna başlar ve atılan zarlarla hamle yapar.
            </p>

            <div className="opening-players-row">
              {/* White */}
              <div className={`opening-player-box ${openingRollState.winner === 'white' ? 'winner' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Beyaz</span>
                </div>
                {renderOpeningDie(openingRollState.white, openingRollState.isRolling)}
              </div>

              {/* Black */}
              <div className={`opening-player-box ${openingRollState.winner === 'black' ? 'winner' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {gameMode === 'ai' ? <Bot size={14} /> : <User size={14} />}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {gameMode === 'ai' ? 'Kaiwen AI' : 'Siyah'}
                  </span>
                </div>
                {renderOpeningDie(openingRollState.black, openingRollState.isRolling)}
              </div>
            </div>

            {openingRollState.message && (
              <div className="opening-status-msg">
                {openingRollState.message}
              </div>
            )}

            {!openingRollState.winner ? (
              <button
                type="button"
                className="btn-primary-action"
                onClick={onRollOpeningDice}
                disabled={openingRollState.isRolling}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Dices size={18} />
                <span>{openingRollState.isRolling ? 'Zarlar Atılıyor...' : 'Zarları At'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary-action btn-confirm-turn"
                onClick={onCompleteOpeningRoll}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Play size={18} />
                <span>Hamleye Başla ({openingRollState.white} - {openingRollState.black})</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // 3. ACTIVE PLAYING VIEW
  return (
    <aside className="game-sidebar">
      <div className="sidebar-scroll">
        {/* BLACK PLAYER CARD (AI / P2) */}
        <div className={`player-card ${currentTurn === 'black' ? 'active-turn' : ''}`}>
          <div className="player-info-row">
            <div className="player-identity">
              <div className="player-avatar-chip black">
                {gameMode === 'ai' ? <Bot size={14} color="#ffffff" /> : <User size={14} color="#ffffff" />}
              </div>
              <span className="player-name">
                {gameMode === 'ai' ? t.aiBot : t.blackPlayer}
              </span>
            </div>
            {currentTurn === 'black' && (
              <span className="turn-pill">
                {isAiThinking ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} className="spin-icon" /> Düşünüyor
                  </span>
                ) : (
                  t.turnIndicator
                )}
              </span>
            )}
          </div>

          <div className="player-stats-mini">
            <div className="mini-stat">
              <span className="mini-stat-label">{t.pipCount}</span>
              <span className="mini-stat-value">{blackPip}</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">{t.borneOff}</span>
              <span className="mini-stat-value">{borneOff.black} / 15</span>
            </div>
            {bar.black > 0 && (
              <div className="mini-stat" style={{ gridColumn: 'span 2', color: 'var(--accent-danger)' }}>
                <span className="mini-stat-label">{t.bar}</span>
                <span className="mini-stat-value">{bar.black} taş kırık</span>
              </div>
            )}
          </div>
        </div>

        {/* DICE DISPLAY ARENA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
          <DiceView
            dice={dice}
            movesLeft={movesLeft}
            isRolling={isRolling}
            onRollClick={onRoll}
            canRoll={canRoll}
          />
          {movesLeft.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Kalan zarlar: {movesLeft.join(' , ')}
            </span>
          )}
        </div>

        {/* WHITE PLAYER CARD (YOU / P1) */}
        <div className={`player-card ${currentTurn === 'white' ? 'active-turn' : ''}`}>
          <div className="player-info-row">
            <div className="player-identity">
              <div className="player-avatar-chip white">
                <User size={14} color="#1e293b" />
              </div>
              <span className="player-name">{t.whitePlayer}</span>
            </div>
            {currentTurn === 'white' && <span className="turn-pill">{t.turnIndicator}</span>}
          </div>

          <div className="player-stats-mini">
            <div className="mini-stat">
              <span className="mini-stat-label">{t.pipCount}</span>
              <span className="mini-stat-value">{whitePip}</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-label">{t.borneOff}</span>
              <span className="mini-stat-value">{borneOff.white} / 15</span>
            </div>
            {bar.white > 0 && (
              <div className="mini-stat" style={{ gridColumn: 'span 2', color: 'var(--accent-danger)' }}>
                <span className="mini-stat-label">{t.bar}</span>
                <span className="mini-stat-value">{bar.white} taş kırık</span>
              </div>
            )}
          </div>
        </div>

        {/* AUTO PASS NOTICE BANNER */}
        {autoPassNotice && (
          <div className="autopass-banner">
            <span className="autopass-dot" />
            <span className="autopass-text">{autoPassNotice}</span>
          </div>
        )}

        {/* AI COACH / ASSISTANT SUGGESTION BANNER */}
        {aiAssistantEnabled && currentTurn === 'white' && hasRolled && movesLeft.length > 0 && aiRecommendedMoves.length > 0 && (
          <div className="ai-coach-banner">
            <div className="ai-coach-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} /> AI Hamle Koçu
              </span>
              {onApplyAiHint && (
                <button
                  type="button"
                  onClick={onApplyAiHint}
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem',
                    padding: '2px 7px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Uygula
                </button>
              )}
            </div>
            <div className="ai-coach-moves">
              {aiRecommendedMoves.map((m, i) => {
                const f = m.from === 'bar' ? 'Bar' : `Hane ${m.from + 1}`;
                const to = m.to === 'off' ? 'Toplandı' : `Hane ${m.to + 1}`;
                return <span key={i}>{f} ➔ {to}{i < aiRecommendedMoves.length - 1 ? ' , ' : ''}</span>;
              })}
            </div>
          </div>
        )}

        {/* AI LAST TURN REPLAY BUTTON */}
        {gameMode === 'ai' && canReplayAi && onReplayAi && currentTurn === 'white' && (
          <button
            type="button"
            className="ai-replay-btn"
            onClick={onReplayAi}
            title="Botun son hamlelerini adım adım tekrar oynat"
          >
            <RotateCcw size={14} />
            <span>AI Hamlelerini Tekrar İzle</span>
          </button>
        )}

        {/* ACTION BUTTONS */}
        <div className="sidebar-actions">
          {canRoll && (
            <button
              className="btn-primary-action"
              onClick={onRoll}
              disabled={isRolling}
            >
              <Dices size={18} />
              <span>{t.rollDice}</span>
            </button>
          )}

          {canConfirm && onConfirmMove && (
            <button
              className="btn-primary-action btn-confirm-turn"
              onClick={onConfirmMove}
            >
              <Check size={18} />
              <span>{t.confirmMove}</span>
            </button>
          )}

          {canPass && (
            <button
              className="btn-primary-action"
              style={{ background: 'var(--accent-amber)' }}
              onClick={onPass}
            >
              <SkipForward size={18} />
              <span>{t.passTurn}</span>
            </button>
          )}

          <div className="actions-row">
            <button
              className="btn-sub-action"
              onClick={onUndo}
              disabled={!canUndo}
              title={t.undo}
            >
              <Undo2 size={15} />
              <span>{t.undo}</span>
            </button>

            <button
              className="btn-sub-action"
              style={{ color: 'var(--accent-danger)' }}
              onClick={onResign}
              title={t.surrender}
            >
              <Flag size={15} />
              <span>{t.surrender}</span>
            </button>
          </div>
        </div>

        {/* LAST TWO MOVES CARD (ANCHORED TO BOTTOM) */}
        <div className="last-move-card">
          <div className="last-move-header">
            <span className="last-move-title">Son İki Hamle</span>
            <button className="view-history-btn" onClick={onOpenHistory} title="Tüm Hamleleri İncele">
              <History size={13} />
              <span>Tümünü Gör</span>
            </button>
          </div>

          {recentMoves && recentMoves.length > 0 ? (
            <div className="recent-moves-container">
              {recentMoves.slice(0, 2).map((rec, i) => (
                <div key={i} className="recent-move-item">
                  <div className="last-move-top-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className={`drawer-player-avatar ${rec.player === 'white' ? 'white' : 'black'}`} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {rec.player === 'white' ? 'Beyaz' : 'Siyah'}
                      </span>
                    </div>
                    <div className="mini-dice-badge">
                      <span>Zar {rec.move.dieUsed}</span>
                    </div>
                  </div>

                  <div className="last-move-route">
                    <span className="route-point">
                      {rec.move.from === 'bar' ? 'Bar' : `Hane ${rec.move.from + 1}`}
                    </span>
                    <ArrowRight size={13} className="route-arrow" />
                    <span className="route-point">
                      {rec.move.to === 'off' ? 'Toplandı' : `Hane ${rec.move.to + 1}`}
                    </span>

                    {rec.move.isHit && (
                      <span className="hit-badge">KIRMA</span>
                    )}
                    {rec.move.isCompound && (
                      <span className="compound-badge">KOMBO</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="last-move-empty">
              <span>Karşılaşma başladı. İlk zarları atın.</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
