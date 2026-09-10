import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
  onOpenCommandPalette: () => void;
  onOpenMobileSidebar: () => void;
  onSwapVehicle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onOpenCommandPalette,
  onOpenMobileSidebar,
  onSwapVehicle,
}) => {
  const t = translations[lang];

  return (
    <header className="fixed top-0 start-0 lg:start-72 end-0 h-16 bg-surface/85 backdrop-blur-xl z-30 flex items-center justify-between px-4 lg:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-white/5">
      {/* Left side items */}
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
          type="button"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="bg-surface-container-high text-primary-container border border-primary-container/30 px-2 py-0.5 rounded text-[10px] font-code-sm tracking-wider font-semibold shadow-[0_0_12px_rgba(0,240,255,0.2)]">
            {t.proScannerBadge}
          </span>
        </div>

        {/* Current Vehicle Badge */}
        <div className="hidden xl:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg text-on-surface border border-white/5">
          <span className="material-symbols-outlined text-secondary text-[16px]">commute</span>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-headline-md font-medium">2022 Porsche 911 Carrera (992)</span>
            <span className="text-outline">•</span>
            <span className="font-code-sm text-on-surface-variant">3.0L Boxer 6 Twin-Turbo</span>
            <span className="text-outline">•</span>
            <span className="font-code-sm text-secondary">PDK</span>
          </div>
          <button
            onClick={onSwapVehicle}
            className="ms-2 text-outline hover:text-primary transition-colors flex items-center cursor-pointer"
            title="Swap Vehicle Rig"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          </button>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-3">
        {/* Search input with ⌘K */}
        <div
          onClick={onOpenCommandPalette}
          className="relative flex items-center cursor-pointer group"
        >
          <span className="material-symbols-outlined absolute start-3 text-outline text-[16px] group-hover:text-primary transition-colors">
            search
          </span>
          <input
            readOnly
            className="bg-surface-container-lowest text-on-surface text-body-sm font-code-sm rounded-lg ps-9 pe-12 py-1.5 w-44 sm:w-64 focus:outline-none ring-1 ring-white/10 group-hover:ring-primary-container/50 text-xs placeholder:text-outline-variant cursor-pointer transition-all"
            placeholder={t.searchPlaceholder}
            type="text"
          />
          <span className="absolute end-2 font-code-sm text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded text-outline group-hover:text-on-surface">
            ⌘K
          </span>
        </div>

        {/* CAN-BUS Online Live Beacon */}
        <div className="hidden lg:flex items-center gap-2 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-white/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
          </span>
          <span className="font-code-sm text-secondary-fixed-dim text-[11px]">
            {t.canBusOnline}
          </span>
          <span className="font-telemetry-label text-outline text-[10px]">12ms</span>
        </div>

        {/* Language switch & actions */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-lg bg-surface-container-low p-0.5 border border-white/5">
            <button
              onClick={() => onToggleLang('en')}
              className={`px-2 py-1 text-xs font-code-sm rounded transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              EN
            </button>
            <button
              onClick={() => onToggleLang('ar')}
              className={`px-2 py-1 text-xs font-code-sm rounded transition-all cursor-pointer ${
                lang === 'ar'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              العربية
            </button>
          </div>

          <div className="relative">
            <button
              className="p-1.5 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex items-center cursor-pointer border border-white/5"
              type="button"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[16px]">notifications</span>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error text-on-error flex items-center justify-center text-[9px] font-bold">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Technician profile */}
        <div className="flex items-center gap-2 ps-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.3)]">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="hidden md:flex flex-col text-start">
            <span className="font-body-sm font-semibold text-on-surface leading-none text-xs">
              Alex Vance
            </span>
            <span className="font-telemetry-label text-secondary leading-tight text-[10px]">
              {t.masterTech}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
