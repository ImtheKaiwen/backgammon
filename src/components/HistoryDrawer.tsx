import React, { useState } from 'react';
import { X, History, Dices, ArrowRight, Crosshair, Filter } from 'lucide-react';
import type { MoveRecord, Player } from '../engine/types';
import type { Language } from '../utils/i18n';

interface HistoryDrawerProps {
  isOpen: boolean;
  history: MoveRecord[];
  lang: Language;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  history,
  lang,
  onClose
}) => {
  const [filter, setFilter] = useState<'all' | 'white' | 'black'>('all');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.player === filter;
  });

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        {/* DRAWER HEADER */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <div className="drawer-icon-badge">
              <History size={18} />
            </div>
            <div>
              <h3 className="drawer-title">{lang === 'en' ? 'Match Move History' : 'Maç Hamle Geçmişi'}</h3>
              <p className="drawer-subtitle">{history.length} {lang === 'en' ? 'moves played' : 'hamle oynandı'}</p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="drawer-filter-bar">
          <button
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {lang === 'en' ? 'All Moves' : 'Tüm Hamleler'}
          </button>
          <button
            className={`filter-chip ${filter === 'white' ? 'active' : ''}`}
            onClick={() => setFilter('white')}
          >
            {lang === 'en' ? 'White' : 'Beyaz'}
          </button>
          <button
            className={`filter-chip ${filter === 'black' ? 'active' : ''}`}
            onClick={() => setFilter('black')}
          >
            {lang === 'en' ? 'Black (AI)' : 'Siyah (AI)'}
          </button>
        </div>

        {/* HISTORY LIST */}
        <div className="drawer-list">
          {filteredHistory.length === 0 ? (
            <div className="drawer-empty-state">
              <Dices size={36} className="empty-icon" />
              <span>{lang === 'en' ? 'No moves recorded yet.' : 'Henüz hamle kaydedilmedi.'}</span>
            </div>
          ) : (
            filteredHistory.map((rec, index) => {
              const isWhite = rec.player === 'white';
              const fromLabel = rec.move.from === 'bar' ? 'Bar' : `Hane ${rec.move.from + 1}`;
              const toLabel = rec.move.to === 'off' ? 'Toplandı' : `Hane ${rec.move.to + 1}`;

              return (
                <div key={index} className="drawer-item">
                  <div className="drawer-item-left">
                    <span className="drawer-step-num">#{filteredHistory.length - index}</span>
                    <div className={`drawer-player-avatar ${isWhite ? 'white' : 'black'}`} />
                    <div className="drawer-move-info">
                      <div className="drawer-path">
                        <span className="path-from">{fromLabel}</span>
                        <ArrowRight size={13} className="path-arrow" />
                        <span className="path-to">{toLabel}</span>
                        {rec.move.isHit && (
                          <span className="hit-badge">{lang === 'en' ? 'HIT' : 'KIRMA'}</span>
                        )}
                        {rec.move.isCompound && (
                          <span className="compound-badge">{lang === 'en' ? 'COMBO' : 'TOPLAM'}</span>
                        )}
                      </div>
                      <span className="drawer-time">{rec.timestamp}</span>
                    </div>
                  </div>

                  <div className="drawer-dice-tag">
                    <span className="dice-val">Zar {rec.move.dieUsed}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
