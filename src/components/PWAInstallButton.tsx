import React, { useState, useEffect } from 'react';
import { subscribeToPWAInstall, promptPWAInstall } from '../offline/registerSW';

interface PWAInstallButtonProps {
  lang: 'en' | 'ar';
  variant?: 'header' | 'sidebar' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang, variant = 'header' }) => {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);
  const isAr = lang === 'ar';

  useEffect(() => {
    const unsub = subscribeToPWAInstall((installable) => {
      setCanInstall(installable);
    });
    return unsub;
  }, []);

  const handleInstall = async () => {
    const outcome = await promptPWAInstall();
    if (outcome === 'accepted') {
      setInstalled(true);
      setCanInstall(false);
    }
  };

  // If installed or not installable on current browser, do not clutter unless it's a banner with status
  if (!canInstall && variant !== 'banner') {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleInstall}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-primary-container/10 hover:bg-primary-container/20 border border-primary-container/30 text-primary-container text-xs font-code-sm transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">
            install_desktop
          </span>
          <span className="font-bold">{isAr ? 'تثبيت التطبيق (PWA)' : 'Install Desktop App'}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-container/20 font-bold uppercase">
          Offline
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-primary-container/40 text-primary-container text-xs font-code-sm font-semibold transition-all cursor-pointer"
      title={isAr ? 'تثبيت التطبيق على جهازك للعمل بدون إنترنت' : 'Install AutoFix OS to operate completely offline'}
    >
      <span className="material-symbols-outlined text-sm">download_for_offline</span>
      <span className="hidden sm:inline">{isAr ? 'تثبيت التطبيق' : 'Install PWA'}</span>
    </button>
  );
};
