import React from 'react';
import {
  Gamepad2,
  History,
  BarChart2,
  GraduationCap,
  BookOpen,
  Settings,
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface LeftNavProps {
  lang: Language;
  themeMode: 'light' | 'dark';
  isMuted: boolean;
  onNewGame: () => void;
  onOpenHistory: () => void;
  onOpenStats: () => void;
  onOpenOnboarding: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onToggleLang: () => void;
}

export const LeftNav: React.FC<LeftNavProps> = ({
  lang,
  themeMode,
  isMuted,
  onNewGame,
  onOpenHistory,
  onOpenStats,
  onOpenOnboarding,
  onOpenRules,
  onOpenSettings,
  onToggleTheme,
  onToggleSound,
  onToggleLang
}) => {
  const t = translations[lang];
  const logoSrc = themeMode === 'dark' ? '/kaiwen-logo-white.png' : '/kaiwen-logo-dark.png';

  return (
    <nav className="left-nav">
      {/* BRAND HEADER */}
      <div>
        <div className="left-nav-brand">
          <img src={logoSrc} alt="Logo" className="left-nav-logo" />
          <span className="left-nav-title">BACKGAMMON</span>
        </div>

        {/* MAIN NAVIGATION ITEMS */}
        <div className="left-nav-menu">
          <button
            className="left-nav-item active"
            title={lang === 'en' ? 'Play Match' : 'Oyuna Dön'}
          >
            <Gamepad2 size={19} />
            <span>{lang === 'en' ? 'Play' : 'Oyna'}</span>
          </button>

          <button
            className="left-nav-item"
            onClick={onOpenHistory}
            title={lang === 'en' ? 'Move History & Log' : 'Hamle Geçmişi'}
          >
            <History size={19} />
            <span>{lang === 'en' ? 'History' : 'Hamleler'}</span>
          </button>

          <button
            className="left-nav-item"
            onClick={onOpenStats}
            title={t.stats}
          >
            <BarChart2 size={19} />
            <span>{t.stats}</span>
          </button>

          <button
            className="left-nav-item"
            onClick={onOpenOnboarding}
            title={lang === 'en' ? 'How to Play Guide' : 'Nasıl Oynanır'}
          >
            <GraduationCap size={19} />
            <span>{lang === 'en' ? 'How to Play' : 'Nasıl Oynanır'}</span>
          </button>

          <button
            className="left-nav-item"
            onClick={onOpenRules}
            title={t.rules}
          >
            <BookOpen size={19} />
            <span>{t.rules}</span>
          </button>

          <button
            className="left-nav-item"
            onClick={onOpenSettings}
            title={t.settings}
          >
            <Settings size={19} />
            <span>{t.settings}</span>
          </button>
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="left-nav-bottom">
        <button
          className="left-nav-action-btn"
          onClick={onNewGame}
          title={t.newGame}
        >
          <RotateCcw size={16} />
          <span>{t.newGame}</span>
        </button>

        <div className="left-nav-bottom-row">
          <button
            className="left-nav-icon-btn"
            onClick={onToggleTheme}
            title={themeMode === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
          >
            {themeMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button
            className="left-nav-icon-btn"
            onClick={onToggleSound}
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          <button
            className="left-nav-icon-btn"
            onClick={onToggleLang}
            title={lang === 'tr' ? 'Switch to English' : 'Türkçe\'ye Geç'}
          >
            <Languages size={17} />
          </button>
        </div>
      </div>
    </nav>
  );
};
