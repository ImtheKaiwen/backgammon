import React from 'react';
import {
  Settings,
  X,
  Bot,
  Users,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldCheck,
  Check
} from 'lucide-react';
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
  autoConfirmMoves: boolean;
  onToggleAutoConfirm: (enabled: boolean) => void;
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
  autoConfirmMoves,
  onToggleAutoConfirm,
  onClose
}) => {
  const t = translations[lang];

  const themes: { id: BoardTheme; name: string; color: string; desc: string }[] = [
    {
      id: 'classic-wood',
      name: t.classicWood,
      color: '#5c2e14',
      desc: lang === 'en' ? 'Walnut & Oak' : 'Ceviz & Meşe'
    },
    {
      id: 'dark-slate',
      name: t.darkSlate,
      color: '#1e293b',
      desc: lang === 'en' ? 'Obsidian Slate' : 'Obsidyen Gece'
    },
    {
      id: 'emerald-table',
      name: t.emeraldTable,
      color: '#064e3b',
      desc: lang === 'en' ? 'Royal Velvet' : 'Kraliyet Kadife'
    },
    {
      id: 'sapphire-night',
      name: t.sapphireNight,
      color: '#1e3a8a',
      desc: lang === 'en' ? 'Deep Ocean' : 'Derin Safir'
    }
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-card settings-modal-card">
        <div className="modal-header-icon badge-info">
          <Settings size={28} />
        </div>

        <h2 className="modal-title">{t.settings}</h2>
        <p className="modal-desc" style={{ marginBottom: '1.25rem' }}>
          {lang === 'en' ? 'Customize game rules, controls and appearance' : 'Oyun kuralları, kontroller ve görsel tercihleri düzenleyin'}
        </p>

        <div className="settings-content-flow">
          {/* 1. OYUN MODU (SEGMENTED PILL) */}
          <div className="custom-setting-row">
            <div className="custom-setting-info">
              <span className="custom-setting-title">{t.gameMode}</span>
              <span className="custom-setting-sub">
                {gameMode === 'ai' ? (lang === 'en' ? 'Play against computer bot' : 'Bilgisayar botuna karşı oyna') : (lang === 'en' ? 'Play with friend on same device' : 'Aynı cihazda arkadaşınla oyna')}
              </span>
            </div>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn ${gameMode === 'ai' ? 'active' : ''}`}
                onClick={() => onChangeGameMode('ai')}
              >
                <Bot size={14} />
                <span>{t.vsAi}</span>
              </button>
              <button
                type="button"
                className={`segmented-btn ${gameMode === 'pvp' ? 'active' : ''}`}
                onClick={() => onChangeGameMode('pvp')}
              >
                <Users size={14} />
                <span>{t.pvp}</span>
              </button>
            </div>
          </div>

          {/* 2. BOT ZORLUĞU (IF AI) */}
          {gameMode === 'ai' && (
            <div className="custom-setting-row">
              <div className="custom-setting-info">
                <span className="custom-setting-title">{t.difficulty}</span>
                <span className="custom-setting-sub">
                  {difficulty === 'easy' ? 'Rastgele ve temel hamleler' : difficulty === 'medium' ? 'Dengeli kapı stratejisi' : 'Usta seviye blokaj ve vuruş'}
                </span>
              </div>
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segmented-btn ${difficulty === 'easy' ? 'active' : ''}`}
                  onClick={() => onChangeDifficulty('easy')}
                >
                  <span>{t.easy}</span>
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${difficulty === 'medium' ? 'active' : ''}`}
                  onClick={() => onChangeDifficulty('medium')}
                >
                  <span>{t.medium}</span>
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${difficulty === 'hard' ? 'active' : ''}`}
                  onClick={() => onChangeDifficulty('hard')}
                >
                  <span>{t.hard}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. TAHTA TEMASI (VISUAL SWATCHES) */}
          <div className="custom-setting-col">
            <span className="custom-setting-title">{t.theme}</span>
            <div className="theme-swatch-grid">
              {themes.map(th => {
                const isSelected = boardTheme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    className={`theme-swatch-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => onChangeBoardTheme(th.id)}
                  >
                    <div className="theme-swatch-circle" style={{ backgroundColor: th.color }}>
                      {isSelected && <Check size={12} color="#ffffff" />}
                    </div>
                    <div className="theme-swatch-info">
                      <span className="theme-swatch-name">{th.name}</span>
                      <span className="theme-swatch-desc">{th.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. ARAYÜZ MODU (AÇIK / KOYU) */}
          <div className="custom-setting-row">
            <div className="custom-setting-info">
              <span className="custom-setting-title">{t.themeMode}</span>
              <span className="custom-setting-sub">
                {themeMode === 'light' ? 'Açık arka plan ve yüksek kontrast' : 'Göz yormayan koyu gece modu'}
              </span>
            </div>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn ${themeMode === 'light' ? 'active' : ''}`}
                onClick={() => onToggleThemeMode('light')}
              >
                <Sun size={14} />
                <span>{t.light}</span>
              </button>
              <button
                type="button"
                className={`segmented-btn ${themeMode === 'dark' ? 'active' : ''}`}
                onClick={() => onToggleThemeMode('dark')}
              >
                <Moon size={14} />
                <span>{t.dark}</span>
              </button>
            </div>
          </div>

          {/* 5. SES EFEKTLERİ (SWITCH) */}
          <div className="custom-setting-row">
            <div className="custom-setting-info">
              <span className="custom-setting-title">{t.sound}</span>
              <span className="custom-setting-sub">Zar atma ve taş vuruş sesleri</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${!isMuted ? 'active' : ''}`}
              onClick={onToggleSound}
              role="switch"
              aria-checked={!isMuted}
            >
              <div className="toggle-switch-thumb">
                {!isMuted ? <Volume2 size={12} /> : <VolumeX size={12} />}
              </div>
            </button>
          </div>

          {/* 6. OTOMATİK HAMLE ONAYI (SWITCH) */}
          <div className="custom-setting-row">
            <div className="custom-setting-info">
              <span className="custom-setting-title">{t.autoConfirmMoves}</span>
              <span className="custom-setting-sub">
                {autoConfirmMoves
                  ? 'Zarlar bittiğinde sıra otomatik devreder'
                  : 'Taşı oynadıktan sonra "Hamleyi Onayla" butonu çıkar'}
              </span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${autoConfirmMoves ? 'active' : ''}`}
              onClick={() => onToggleAutoConfirm(!autoConfirmMoves)}
              role="switch"
              aria-checked={autoConfirmMoves}
            >
              <div className="toggle-switch-thumb">
                {autoConfirmMoves ? <Check size={12} /> : <X size={12} />}
              </div>
            </button>
          </div>

          {/* 7. DİL SEÇİMİ (SEGMENTED PILL) */}
          <div className="custom-setting-row">
            <div className="custom-setting-info">
              <span className="custom-setting-title">{t.language}</span>
              <span className="custom-setting-sub">Arayüz dili</span>
            </div>
            <div className="segmented-control">
              <button
                type="button"
                className={`segmented-btn ${lang === 'tr' ? 'active' : ''}`}
                onClick={() => onToggleLang('tr')}
              >
                <span>Türkçe</span>
              </button>
              <button
                type="button"
                className={`segmented-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => onToggleLang('en')}
              >
                <span>English</span>
              </button>
            </div>
          </div>
        </div>

        <button className="modal-btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '1.25rem' }}>
          <X size={15} />
          <span>{t.close}</span>
        </button>
      </div>
    </div>
  );
};
