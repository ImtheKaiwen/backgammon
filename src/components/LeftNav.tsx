import React, { useState } from 'react';
import {
  Gamepad2,
  History,
  BarChart2,
  GraduationCap,
  Settings,
  RotateCcw,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface LeftNavProps {
  lang: Language;
  themeMode: 'light' | 'dark';
  isMuted: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onNewGame: () => void;
  onOpenHistory: () => void;
  onOpenStats: () => void;
  onOpenOnboarding: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onToggleLang: () => void;
}

export const LeftNav: React.FC<LeftNavProps> = ({
  lang,
  themeMode,
  isMuted,
  isOpenMobile = false,
  onCloseMobile,
  onNewGame,
  onOpenHistory,
  onOpenStats,
  onOpenOnboarding,
  onOpenSettings,
  onToggleTheme,
  onToggleSound,
  onToggleLang
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('kaiwen_leftnav_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('kaiwen_leftnav_collapsed', String(next));
      return next;
    });
  };

  const handleItemClick = (action?: () => void) => {
    if (action) action();
    if (onCloseMobile) onCloseMobile();
  };

  const t = translations[lang];
  const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const logoSrc = themeMode === 'dark' ? `${baseUrl}kaiwen-logo-white.png` : `${baseUrl}kaiwen-logo-dark.png`;
  const showLabels = !isCollapsed || isOpenMobile;

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpenMobile && (
        <div className="left-nav-backdrop" onClick={onCloseMobile} />
      )}

      <nav className={`left-nav ${isCollapsed && !isOpenMobile ? 'collapsed' : ''} ${isOpenMobile ? 'mobile-open' : ''}`}>
      {/* BRAND HEADER */}
      <div>
        <div className="left-nav-brand">
          <div className="left-nav-brand-main">
            <img src={logoSrc} alt="Logo" className="left-nav-logo" />
            {showLabels && <span className="left-nav-title">BACKGAMMON</span>}
          </div>
          <div className="left-nav-brand-actions">
            <button
              type="button"
              className="collapse-toggle-btn desktop-only"
              onClick={toggleCollapse}
              title={isCollapsed ? (lang === 'en' ? 'Expand Menu' : 'Menüyü Genişlet') : (lang === 'en' ? 'Collapse Menu' : 'Menüyü Küçült')}
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <button
              type="button"
              className="collapse-toggle-btn mobile-close-btn"
              onClick={onCloseMobile}
              title={lang === 'en' ? 'Close Menu' : 'Menüyü Kapat'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MAIN NAVIGATION ITEMS */}
        <div className="left-nav-menu">
          <button
            className="left-nav-item active"
            onClick={() => handleItemClick()}
            title={lang === 'en' ? 'Play Match' : 'Oyuna Dön'}
          >
            <Gamepad2 size={19} className="nav-item-icon" />
            {showLabels && <span>{lang === 'en' ? 'Play' : 'Oyna'}</span>}
          </button>

          <button
            className="left-nav-item"
            onClick={() => handleItemClick(onOpenHistory)}
            title={lang === 'en' ? 'Move History & Log' : 'Hamle Geçmişi'}
          >
            <History size={19} className="nav-item-icon" />
            {showLabels && <span>{lang === 'en' ? 'History' : 'Hamleler'}</span>}
          </button>

          <button
            className="left-nav-item"
            onClick={() => handleItemClick(onOpenStats)}
            title={t.stats}
          >
            <BarChart2 size={19} className="nav-item-icon" />
            {showLabels && <span>{t.stats}</span>}
          </button>

          <button
            className="left-nav-item"
            onClick={() => handleItemClick(onOpenOnboarding)}
            title={lang === 'en' ? 'How to Play Guide' : 'Nasıl Oynanır'}
          >
            <GraduationCap size={19} className="nav-item-icon" />
            {showLabels && <span>{lang === 'en' ? 'How to Play' : 'Nasıl Oynanır'}</span>}
          </button>

          <button
            className="left-nav-item"
            onClick={() => handleItemClick(onOpenSettings)}
            title={t.settings}
          >
            <Settings size={19} className="nav-item-icon" />
            {showLabels && <span>{t.settings}</span>}
          </button>
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="left-nav-bottom">
        <button
          className="left-nav-action-btn"
          onClick={() => handleItemClick(onNewGame)}
          title={t.newGame}
        >
          <RotateCcw size={16} />
          {showLabels && <span>{t.newGame}</span>}
        </button>

        <div className={`left-nav-bottom-row ${isCollapsed && !isOpenMobile ? 'collapsed' : ''}`}>
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
            title={lang === 'tr' ? 'Switch to English' : "Türkçe'ye Geç"}
          >
            <Languages size={17} />
          </button>
        </div>
      </div>
    </nav>
    </>
  );
};
