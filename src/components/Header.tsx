import React from 'react';
import {
  RotateCcw,
  Settings,
  BookOpen,
  BarChart2,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Dices
} from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface HeaderProps {
  lang: Language;
  themeMode: 'light' | 'dark';
  isMuted: boolean;
  onNewGame: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  themeMode,
  isMuted,
  onNewGame,
  onToggleTheme,
  onToggleSound,
  onOpenSettings,
  onOpenRules,
  onOpenStats
}) => {
  const t = translations[lang];

  const logoSrc = themeMode === 'dark' ? '/kaiwen-logo-white.png' : '/kaiwen-logo-dark.png';

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="brand-logo-container">
          <img src={logoSrc} alt="Kaiwen Logo" className="brand-logo-img" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 className="brand-title">BACKGAMMON</h1>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="header-btn"
          onClick={onNewGame}
          title={t.newGame}
        >
          <RotateCcw size={15} />
          <span>{t.newGame}</span>
        </button>

        <button
          className="header-icon-btn"
          onClick={onOpenRules}
          title={t.rules}
        >
          <BookOpen size={16} />
        </button>

        <button
          className="header-icon-btn"
          onClick={onOpenStats}
          title={t.stats}
        >
          <BarChart2 size={16} />
        </button>

        <button
          className="header-icon-btn"
          onClick={onToggleSound}
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          className="header-icon-btn"
          onClick={onToggleTheme}
          title={themeMode === 'light' ? 'Koyu Tema' : 'Açık Tema'}
        >
          {themeMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <button
          className="header-icon-btn"
          onClick={onOpenSettings}
          title={t.settings}
        >
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
};
