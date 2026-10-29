import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, RefreshCw, X } from 'lucide-react';
import type { GameOverResult, Player } from '../engine/types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface GameOverModalProps {
  result: GameOverResult;
  humanPlayer: Player;
  lang: Language;
  onRematch: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  result,
  humanPlayer,
  lang,
  onRematch,
  onClose
}) => {
  const t = translations[lang];
  const isHumanWinner = result.winner === humanPlayer;

  useEffect(() => {
    confetti({
      particleCount: result.winType === 'backgammon' ? 120 : 80,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, [result]);

  const winnerLabel =
    result.winner === 'white'
      ? t.whitePlayer
      : t.blackPlayer;

  let titleBadge = 'Normal Galibiyet (1 Puan)';
  let badgeClass = 'badge-win';
  let icon = <Trophy size={36} />;

  if (result.winType === 'backgammon') {
    titleBadge = 'KATMERLİ MARS! (3 Puan) 🔥';
    badgeClass = 'badge-mars';
    icon = <Flame size={36} />;
  } else if (result.winType === 'gammon') {
    titleBadge = 'MARS! (2 Puan) 👑';
    badgeClass = 'badge-mars';
    icon = <Trophy size={36} />;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className={`modal-header-icon ${badgeClass}`}>
          {icon}
        </div>

        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '0.2rem 0.65rem',
            borderRadius: '9999px',
            background: 'var(--bg-subtle)',
            color: 'var(--accent-primary)',
            marginBottom: '0.75rem',
            textTransform: 'uppercase'
          }}
        >
          {titleBadge}
        </span>

        <h2 className="modal-title">
          {winnerLabel} {t.winnerNotice}
        </h2>

        <p className="modal-desc">
          {result.reason}
        </p>

        <div className="modal-btn-row">
          <button className="modal-btn-primary" onClick={onRematch}>
            <RefreshCw size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {t.rematch}
          </button>
          <button
            className="modal-btn-secondary"
            onClick={() => {
              onRematch();
              onClose();
            }}
          >
            <X size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
