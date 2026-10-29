import React from 'react';
import { BarChart2, Trash2, X, Flame, Trophy } from 'lucide-react';
import type { Language } from '../utils/i18n';
import {
  getStats,
  getHistory,
  clearStats
} from '../services/statsService';

interface StatsModalProps {
  lang: Language;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ lang, onClose }) => {
  const [stats, setStats] = React.useState(getStats);
  const [history, setHistory] = React.useState(getHistory);

  const handleClear = () => {
    if (confirm(lang === 'en' ? 'Reset all statistics?' : 'Tüm istatistikler sıfırlansın mı?')) {
      clearStats();
      setStats(getStats());
      setHistory([]);
    }
  };

  const winRate =
    stats.matchesPlayed > 0
      ? Math.round((stats.wins / stats.matchesPlayed) * 100)
      : 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '520px' }}>
        <div className="modal-header-icon badge-info">
          <BarChart2 size={32} />
        </div>

        <h2 className="modal-title">
          {lang === 'en' ? 'Performance & History' : 'İstatistikler & Maç Geçmişi'}
        </h2>

        {/* 4-Stat Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.65rem',
            width: '100%',
            marginBottom: '1.25rem'
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Maç</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {stats.matchesPlayed}
            </span>
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Kazanma Oranı</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>
              %{winRate}
            </span>
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Toplam Puan</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              {stats.totalPoints}
            </span>
          </div>
        </div>

        {/* Mars Counts */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-subtle)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={15} color="var(--accent-danger)" />
            <span>Mars: <strong>{stats.gammonsWon}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trophy size={15} color="var(--accent-amber)" />
            <span>Katmerli Mars: <strong>{stats.backgammonsWon}</strong></span>
          </div>
        </div>

        {/* History List */}
        <div style={{ width: '100%', textAlign: 'left', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Son Karşılaşmalar
          </span>
          <div
            style={{
              maxHeight: '160px',
              overflowY: 'auto',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              marginTop: '0.4rem',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            {history.length === 0 ? (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0.5rem' }}>
                Kayıtlı maç bulunmuyor.
              </span>
            ) : (
              history.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    fontSize: '0.8rem'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{item.opponent}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: item.winner === 'player' ? 'var(--accent-secondary)' : 'var(--accent-danger)'
                    }}
                  >
                    {item.winner === 'player' ? `+${item.points} Puan (${item.winType.toUpperCase()})` : 'Mağlubiyet'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-btn-row">
          <button
            className="modal-btn-secondary"
            onClick={handleClear}
            style={{ color: 'var(--accent-danger)' }}
          >
            <Trash2 size={15} />
            <span>Sıfırla</span>
          </button>
          <button className="modal-btn-primary" onClick={onClose}>
            <X size={15} />
            <span>{lang === 'en' ? 'Close' : 'Kapat'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
