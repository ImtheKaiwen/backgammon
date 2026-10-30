import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  themeMode: 'light' | 'dark';
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ themeMode, onComplete }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const baseUrl = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const logoSrc = themeMode === 'dark' ? `${baseUrl}kaiwen-logo-white.png` : `${baseUrl}kaiwen-logo-dark.png`;

  useEffect(() => {
    // Show splash for 1000ms, then start 300ms fade out
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(finishTimer);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`splash-screen-container ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <img src={logoSrc} alt="Logo" className="splash-logo-img" />
        </div>
        <h1 className="splash-title">BACKGAMMON</h1>
        <div className="splash-loader-bar">
          <div className="splash-loader-progress" />
        </div>
      </div>
    </div>
  );
};
