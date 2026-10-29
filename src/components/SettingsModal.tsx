import React from 'react';
import { Settings, X } from 'lucide-react';
import type {
  GameMode,
  AIDifficulty,
  BoardTheme
} from '../engine/types';
import type { Language } from '../utils/i18n';
import { translations } from '../utils/i18n';

interface SettingsModalProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
  themeMode: 'light' | 'dark';
  onToggleThemeMode: (mode: 'light' | 'dark') => void;
  boardTheme: BoardTheme;
  onChangeBoardTheme: (theme: BoardTheme) => void;
  gameMode: GameMode;
  onChangeGameMode: (mode: GameMode) => void;
  difficulty: AIDifficulty;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  lang,
  onToggleLang,
  themeMode,
  onToggleThemeMode,
  boardTheme,
  onChangeBoardTheme,
  gameMode,
  onChangeGameMode,
  difficulty,
  onChangeDifficulty,
  isMuted,
  onToggleSound,
  onClose
}) => {
  const t = translations[lang];

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header-icon badge-info">
          <Settings size={32} />
        </div>

        <h2 className="modal-title">{t.settings}</h2>

        <div className="settings-group">
          {/* Game Mode */}
          <div className="setting-item">
            <span className="setting-label">{t.gameMode}</span>
            <select
              className="setting-select"
              value={gameMode}
              onChange={e => onChangeGameMode(e.target.value as GameMode)}
            >
              <option value="ai">{t.vsAi}</option>
              <option value="pvp">{t.pvp}</option>
            </select>
          </div>

          {/* AI Difficulty */}
          {gameMode === 'ai' && (
            <div className="setting-item">
              <span className="setting-label">{t.difficulty}</span>
              <select
                className="setting-select"
                value={difficulty}
                onChange={e => onChangeDifficulty(e.target.value as AIDifficulty)}
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="hard">{t.hard}</option>
              </select>
            </div>
          )}

          {/* Board Table Theme */}
          <div className="setting-item">
            <span className="setting-label">{t.theme}</span>
            <select
              className="setting-select"
              value={boardTheme}
              onChange={e => onChangeBoardTheme(e.target.value as BoardTheme)}
            >
              <option value="classic-wood">{t.classicWood}</option>
              <option value="dark-slate">{t.darkSlate}</option>
              <option value="emerald-table">{t.emeraldTable}</option>
              <option value="sapphire-night">{t.sapphireNight}</option>
            </select>
          </div>

          {/* UI Theme Mode */}
          <div className="setting-item">
            <span className="setting-label">{t.themeMode}</span>
            <select
              className="setting-select"
              value={themeMode}
              onChange={e => onToggleThemeMode(e.target.value as 'light' | 'dark')}
            >
              <option value="light">{t.light}</option>
              <option value="dark">{t.dark}</option>
            </select>
          </div>

          {/* Sound */}
          <div className="setting-item">
            <span className="setting-label">{t.sound}</span>
            <select
              className="setting-select"
              value={isMuted ? 'off' : 'on'}
              onChange={onToggleSound}
            >
              <option value="on">{t.on}</option>
              <option value="off">{t.off}</option>
            </select>
          </div>

          {/* Language */}
          <div className="setting-item">
            <span className="setting-label">{t.language}</span>
            <select
              className="setting-select"
              value={lang}
              onChange={e => onToggleLang(e.target.value as Language)}
            >
              <option value="tr">{t.turkish}</option>
              <option value="en">{t.english}</option>
            </select>
          </div>
        </div>

        <button className="modal-btn-primary" onClick={onClose} style={{ width: '100%' }}>
          <X size={16} style={{ display: 'inline', marginRight: '6px' }} />
          {t.close}
        </button>
      </div>
    </div>
  );
};
