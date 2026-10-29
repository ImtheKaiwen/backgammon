import React from 'react';
import {
  Dices,
  SkipForward,
  Undo2,
  Flag,
  Bot,
  User
} from 'lucide-react';
import type {
  Player,
  GameMode,
  BarState,
  BorneOffState
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
  logs: string[];
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
  logs
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
            {currentTurn === 'black' && <span className="turn-pill">{t.turnIndicator}</span>}
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <DiceView
            dice={dice}
            movesLeft={movesLeft}
            isRolling={isRolling}
            onRollClick={onRoll}
            canRoll={canRoll}
          />
          {movesLeft.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Kalan hamleler: {movesLeft.join(' , ')}
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

        {/* EVENT LOG */}
        <div className="event-log-container">
          <span className="event-log-title">Hamle Günlüğü</span>
          <div className="event-log-list">
            {logs.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                Oyun başladı. Zarları atın!
              </span>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="event-log-item">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
