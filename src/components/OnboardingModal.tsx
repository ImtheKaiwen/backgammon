import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Play,
  X,
  Shield,
  Crosshair,
  Trophy,
  Flame,
  ArrowRight
} from 'lucide-react';
import type { Language } from '../utils/i18n';

interface OnboardingModalProps {
  lang: Language;
  themeMode: 'light' | 'dark';
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  lang,
  themeMode,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    {
      id: 'rules',
      label: lang === 'en' ? 'Basics' : 'Temel Kurallar',
      title: lang === 'en' ? 'Checker Movement & Direction' : 'Taşların Yönü & Temel Hareket',
      subtitle:
        lang === 'en'
          ? 'Backgammon is a race. Travel all 15 checkers around the board into your home quadrant.'
          : 'Tavla iki kişilik stratejik bir yarış oyunudur. 15 taşınızı rakip hanelerden dolaştırarak kendi evinize getirin.',
      icon: <ArrowRight size={28} className="step-icon" />,
      bullets: [
        lang === 'en'
          ? 'White moves counter-clockwise: Point 24 → Point 1 (Home: 1-6).'
          : 'Beyaz taşlar saat yönünün tersine: 24 numaralı haneden 1 numaraya doğru ilerler.',
        lang === 'en'
          ? 'Black moves clockwise: Point 1 → Point 24 (Home: 19-24).'
          : 'Siyah taşlar saat yönünde: 1 numaralı haneden 24 numaraya doğru ilerler.',
        lang === 'en'
          ? 'Rolling doubles awards 4 full moves of that die value!'
          : 'Çift zar (örn. 4-4) atıldığında zar değeri 4 kez oynanır!'
      ]
    },
    {
      id: 'primes',
      label: lang === 'en' ? 'Primes & Hits' : 'Kapı & Kırma',
      title: lang === 'en' ? 'Making Primes and Hitting Blots' : 'Kapı Alma & Taş Kırma (Açık)',
      subtitle:
        lang === 'en'
          ? 'Control the board by building protected points and attacking lone enemy checkers.'
          : 'Tek başına duran taşlar açık hedeftir. İki veya daha fazla taşınızı üst üste getirerek kapı alın.',
      icon: <Shield size={28} className="step-icon" />,
      bullets: [
        lang === 'en'
          ? 'Prime (Door): 2+ of your checkers secure a point. Opponent cannot land here.'
          : 'Kapı Alma: Bir hanede aynı renkten 2 veya daha fazla taş varsa orası kapıdır. Rakip oraya konamaz.',
        lang === 'en'
          ? 'Blot (Hit): A lone checker is hit when opponent lands on it, sending it to the Bar.'
          : 'Taş Kırma: Hanede tek duran taş "açıktır". Rakip bu haneye gelirse taşınızı kırar ve orta bara gönderir.',
        lang === 'en'
          ? 'Mandatory Re-entry: Checkers on the bar MUST re-enter before any other move!'
          : 'Kırık Taş Önceliği: Bardaki kırık taşınızı oyuna sokmadan başka hiçbir hamle yapamazsınız.'
      ]
    },
    {
      id: 'bearing',
      label: lang === 'en' ? 'Bear Off' : 'Taş Toplama',
      title: lang === 'en' ? 'Bearing Off Checkers' : 'Evi Tamamlama & Taş Toplama',
      subtitle:
        lang === 'en'
          ? 'Once all 15 checkers enter your home board, you can start bearing them off to victory.'
          : '15 taşınızın tamamı kendi evinize (son 6 haneye) girdiğinde taş toplamaya başlarsınız.',
      icon: <Crosshair size={28} className="step-icon" />,
      bullets: [
        lang === 'en'
          ? 'White Home: Points 1 to 6. Black Home: Points 19 to 24.'
          : 'Beyazın Evi: 1 - 6 arası haneler. Siyahın Evi: 19 - 24 arası hanelerdir.',
        lang === 'en'
          ? 'Exact rolls or highest home checkers bear off into your tray.'
          : 'Zar hanesine denk gelen veya o hanede taş kalmamışsa en uzaktaki taşlar toplanır.',
        lang === 'en'
          ? 'The first player to bear off all 15 checkers wins the game!'
          : '15 taşını tahtadan ilk toplayıp bitiren oyuncu maçı kazanır!'
      ]
    },
    {
      id: 'mars',
      label: lang === 'en' ? 'Victory & Mars' : 'Mars & Puanlama',
      title: lang === 'en' ? 'Gammon and Backgammon Scoring' : 'Mars & Katmerli Mars Puanları',
      subtitle:
        lang === 'en'
          ? 'Win with style: shut out your opponent to score double or triple match points.'
          : 'Rakibinize fırsat vermeden kazanarak 2 veya 3 katı maç puanı toplayın.',
      icon: <Flame size={28} className="step-icon" />,
      bullets: [
        lang === 'en'
          ? 'Normal Win (1 Pt): Opponent has collected at least 1 checker.'
          : 'Normal Galibiyet (1 Puan): Rakip en az 1 taş toplamayı başarmışsa 1 puan kazanırsınız.',
        lang === 'en'
          ? 'Mars / Gammon (2 Pts): Winner collects all 15 checkers before opponent collects any!'
          : 'Mars (2 Puan): Rakip tek bir taş bile toplayamadan tüm taşlarınızı toplarsanız MARS olur.',
        lang === 'en'
          ? 'Katmerli Mars / Backgammon (3 Pts): Opponent has 0 collected AND still has a checker on the bar or in your home.'
          : 'Katmerli Mars (3 Puan): Rakip hiç taş toplayamamışken halen evinizde veya barda taşı kalmışsa 3 puan kazanırsınız!'
      ]
    }
  ];

  const step = steps[currentStep];
  const isFinalStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isFinalStep) {
      onClose();
    } else {
      setCurrentStep(s => Math.min(steps.length - 1, s + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(s => Math.max(0, s - 1));
  };

  const logoSrc = themeMode === 'dark' ? '/kaiwen-logo-white.png' : '/kaiwen-logo-dark.png';

  return (
    <div className="modal-backdrop">
      <div className="modal-card onboarding-card">
        {/* TOP BRANDING & CLOSE */}
        <div className="onboarding-top-bar">
          <div className="onboarding-logo-wrapper">
            <img src={logoSrc} alt="Kaiwen" className="onboarding-logo-img" />
            <span className="onboarding-logo-text">BACKGAMMON</span>
          </div>
          <button className="onboarding-close-btn" onClick={onClose} title="Kapat">
            <X size={18} />
          </button>
        </div>

        {/* STEPPER BREADCRUMBS */}
        <div className="stepper-breadcrumbs">
          {steps.map((st, idx) => (
            <React.Fragment key={st.id}>
              <div
                className={`stepper-item ${idx === currentStep ? 'active' : ''} ${
                  idx < currentStep ? 'completed' : ''
                }`}
                onClick={() => setCurrentStep(idx)}
              >
                <span className="stepper-bubble">{idx + 1}</span>
                <span className="stepper-name">{st.label}</span>
              </div>
              {idx < steps.length - 1 && <span className="stepper-separator">›</span>}
            </React.Fragment>
          ))}
        </div>

        {/* STEP CONTENT BODY */}
        <div className="onboarding-body">
          <div className="onboarding-icon-badge">
            {step.icon}
          </div>

          <h3 className="onboarding-title">{step.title}</h3>
          <p className="onboarding-subtitle">{step.subtitle}</p>

          <div className="onboarding-bullets-container">
            {step.bullets.map((b, i) => (
              <div key={i} className="onboarding-bullet-row">
                <div className="bullet-bullet" />
                <span className="bullet-text">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="onboarding-footer">
          <button
            className="btn-onboarding-secondary"
            onClick={currentStep === 0 ? onClose : handlePrev}
          >
            {currentStep === 0 ? (lang === 'en' ? 'Skip' : 'Atla') : (
              <>
                <ChevronLeft size={16} />
                <span>{lang === 'en' ? 'Previous' : 'Önceki'}</span>
              </>
            )}
          </button>

          <button className="btn-onboarding-primary" onClick={handleNext}>
            <span>{isFinalStep ? (lang === 'en' ? "Let's Play" : 'Oyuna Başla') : (lang === 'en' ? 'Next step' : 'Sonraki Adım')}</span>
            {isFinalStep ? <Play size={15} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
