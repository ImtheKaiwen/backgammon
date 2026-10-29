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
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import type {
  Player,
  GameMode,
  BarState,
  BorneOffState,
  MoveRecord
} from '../engine/types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';
import { DiceView } from './DiceView';

interface GameSidebarProps {
  lang: Language;
  gameMode: GameMode;
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
  onRoll: () => void;
  onPass: () => void;
  onUndo: () => void;
  onResign: () => void;
  lastMove: MoveRecord | null;
  onOpenHistory: () => void;
  isAiThinking: boolean;
  autoPassNotice: string | null;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  lang,
  gameMode,
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
  onRoll,
  onPass,
  onUndo,
  onResign,
  lastMove,
  onOpenHistory,
  isAiThinking,
  autoPassNotice
}) => {
  const t = translations[lang];

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

        {/* LAST MOVE CARD (SPOTLIGHT) */}
        <div className="last-move-card">
          <div className="last-move-header">
            <span className="last-move-title">Son Hamle</span>
            <button className="view-history-btn" onClick={onOpenHistory} title="Tüm Hamleleri İncele">
              <History size={13} />
              <span>Tümünü Gör</span>
            </button>
          </div>

          {lastMove ? (
            <div className="last-move-content">
              <div className="last-move-top-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className={`drawer-player-avatar ${lastMove.player === 'white' ? 'white' : 'black'}`} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    {lastMove.player === 'white' ? 'Beyaz' : 'Siyah'}
                  </span>
                </div>
                <div className="mini-dice-badge">
                  <span>🎲 {lastMove.move.dieUsed}</span>
                </div>
              </div>

              <div className="last-move-route">
                <span className="route-point">
                  {lastMove.move.from === 'bar' ? 'Bar' : `Hane ${lastMove.move.from + 1}`}
                </span>
                <ArrowRight size={13} className="route-arrow" />
                <span className="route-point">
                  {lastMove.move.to === 'off' ? 'Toplandı' : `Hane ${lastMove.move.to + 1}`}
                </span>

                {lastMove.move.isHit && (
                  <span className="hit-badge">KIRMA</span>
                )}
                {lastMove.move.isCompound && (
                  <span className="compound-badge">KOMBO</span>
                )}
              </div>
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
