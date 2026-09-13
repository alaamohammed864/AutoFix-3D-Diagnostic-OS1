import React from 'react';
import { Language, VehicleSpec } from '../types';
import { translations } from '../data/translations';
import { useAuth } from '../security/AuthContext';
import { ROLE_BADGE_STYLES } from '../security/authTypes';

interface HeaderProps {
  lang: Language;
  currentVehicle?: VehicleSpec;
  onToggleLang: (lang: Language) => void;
  onOpenCommandPalette: () => void;
  onOpenMobileSidebar: () => void;
  onSwapVehicle: () => void;
  onOpenAiAssistant?: () => void;
  onOpenSecurityHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  currentVehicle,
  onToggleLang,
  onOpenCommandPalette,
  onOpenMobileSidebar,
  onSwapVehicle,
  onOpenAiAssistant,
  onOpenSecurityHub,
}) => {
  const { user, role } = useAuth();
  const t = translations[lang];
  const isAr = lang === 'ar';
  const roleStyle = ROLE_BADGE_STYLES[role];

  return (
    <header className="fixed top-0 start-0 lg:start-72 end-0 h-16 bg-surface/90 backdrop-blur-xl z-30 flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-white/5 overflow-hidden">
      {/* Left side items with robust min-width & truncation */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 max-w-[50%] xl:max-w-[55%]">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
          type="button"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Pro Scanner Badge */}
        <div className="shrink-0 flex items-center">
          <span className="bg-surface-container-high text-primary-container border border-primary-container/30 px-2 py-0.5 rounded text-[10px] font-code-sm tracking-wider font-semibold whitespace-nowrap shadow-[0_0_12px_rgba(0,240,255,0.2)]">
            {t.proScannerBadge}
          </span>
        </div>

        {/* Current Vehicle Badge (Fully Dynamic, Collision-Proof & Truncated) */}
        <div className="hidden md:flex items-center gap-2 bg-surface-container-low px-2.5 py-1 rounded-lg text-on-surface border border-white/5 min-w-0 overflow-hidden">
          <span className="material-symbols-outlined text-secondary text-[16px] shrink-0">commute</span>
          <div className="flex items-center gap-1.5 text-xs min-w-0 overflow-hidden">
            <span
              className="font-headline-md font-semibold text-on-surface truncate max-w-[120px] sm:max-w-[160px] xl:max-w-[200px]"
              title={currentVehicle ? `${currentVehicle.make} - ${currentVehicle.model}` : 'Active Calibration Rig'}
            >
              {currentVehicle ? `${currentVehicle.make} ${currentVehicle.model}` : 'Active Calibration Rig'}
            </span>
            <span className="text-outline shrink-0 hidden xl:inline">•</span>
            <span
              className="font-code-sm text-on-surface-variant truncate max-w-[110px] 2xl:max-w-[150px] hidden xl:inline"
              title={currentVehicle?.powertrain || 'DOHC Multivalve'}
            >
              {currentVehicle?.powertrain || 'DOHC Multivalve'}
            </span>
            <span className="text-outline shrink-0 hidden 2xl:inline">•</span>
            <span
              className="font-code-sm text-secondary truncate max-w-[110px] hidden 2xl:inline"
              title={currentVehicle?.gearbox || 'Direct Drive'}
            >
              {currentVehicle?.gearbox || 'Direct Drive'}
            </span>
          </div>
          <button
            onClick={onSwapVehicle}
            className="ms-1 text-outline hover:text-primary transition-colors flex items-center cursor-pointer shrink-0 p-0.5 rounded hover:bg-white/5"
            title={isAr ? 'تبديل مركبة الورشة' : 'Swap Vehicle Rig'}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          </button>
        </div>
      </div>

      {/* Right side items with responsive spacing, shrinkage controls & zero overlap */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0 ms-2">
        {/* Search input with ⌘K & Voice indicator */}
        <div
          onClick={onOpenCommandPalette}
          className="relative flex items-center cursor-pointer group min-w-0"
          title={isAr ? 'البحث الذكي الصوتي والنصي (عربي / English)' : 'Multilingual Smart Search & Voice (English / Arabic)'}
        >
          <span className="material-symbols-outlined absolute start-2.5 text-outline text-[16px] group-hover:text-primary transition-colors shrink-0 pointer-events-none">
            search
          </span>
          <input
            readOnly
            className="bg-surface-container-lowest text-on-surface text-body-sm font-code-sm rounded-lg ps-8 pe-12 sm:pe-14 py-1.5 w-28 sm:w-44 md:w-52 lg:w-60 focus:outline-none ring-1 ring-white/10 group-hover:ring-primary-container/50 text-xs placeholder:text-outline-variant cursor-pointer transition-all truncate"
            placeholder={isAr ? 'بحث سريع...' : 'Search...'}
            type="text"
          />
          <div className="absolute end-1.5 sm:end-2 flex items-center gap-1 pointer-events-none">
            <span className="material-symbols-outlined text-outline group-hover:text-primary text-[14px] hidden sm:inline">
              mic
            </span>
            <span className="font-code-sm text-[9px] sm:text-[10px] bg-surface-container-high px-1 py-0.5 rounded text-outline group-hover:text-on-surface font-semibold">
              ⌘K
            </span>
          </div>
        </div>

        {/* AutoFix AI Trigger */}
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-primary-container border border-primary-container/30 font-code-sm text-xs font-semibold transition-all hover:shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer shrink-0"
            type="button"
            title="Launch AutoFix AI Diagnostic Assistant"
          >
            <span className="material-symbols-outlined text-[16px] animate-pulse">auto_awesome</span>
            <span className="hidden md:inline whitespace-nowrap">AutoFix AI</span>
          </button>
        )}

        {/* CAN-BUS Online Live Beacon (Shown only on ultra-wide viewports) */}
        <div className="hidden 2xl:flex items-center gap-2 bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-white/5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
          </span>
          <span className="font-code-sm text-secondary-fixed-dim text-[11px] whitespace-nowrap">
            {t.canBusOnline}
          </span>
          <span className="font-telemetry-label text-outline text-[10px]">12ms</span>
        </div>

        {/* Language switch & actions */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="inline-flex rounded-lg bg-surface-container-low p-0.5 border border-white/5 shrink-0">
            <button
              onClick={() => onToggleLang('en')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] font-code-sm rounded transition-all cursor-pointer ${
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
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] font-code-sm rounded transition-all cursor-pointer ${
                lang === 'ar'
                  ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              عربي
            </button>
          </div>

          <div className="relative shrink-0">
            <button
              className="p-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors flex items-center cursor-pointer border border-white/5"
              type="button"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[16px]">notifications</span>
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-error text-on-error flex items-center justify-center text-[8px] font-bold">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Production Security & RBAC Quick Trigger */}
        {onOpenSecurityHub && (
          <button
            onClick={onOpenSecurityHub}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/10 hover:border-primary-container/40 font-code-sm text-xs transition-all cursor-pointer group shrink-0"
            type="button"
            title={isAr ? 'مركز الأمان وإدارة الصلاحيات (RBAC)' : 'Security & RBAC Management Hub'}
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-400 group-hover:scale-110 transition-transform">
              security
            </span>
            <span className="hidden xl:inline font-semibold text-on-surface text-[11px]">
              {isAr ? 'الأمان' : 'Security'}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
            >
              {role}
            </span>
          </button>
        )}

        {/* Developer / Technician profile */}
        <button
          onClick={onOpenSecurityHub}
          className="flex items-center gap-2 ps-1 rounded-xl p-1 hover:bg-surface-container transition-colors cursor-pointer text-start shrink-0 min-w-0"
          type="button"
          title={isAr ? 'المطور ومسؤول النظام: المهندس علاء محمد (تبديل الصلاحيات وسجل التدقيق)' : 'Lead Developer: Eng. Aala Mohammed (Role Switch & Security Hub)'}
        >
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border shadow-sm shrink-0 ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              {roleStyle.icon}
            </span>
          </div>
          <div className="hidden lg:flex flex-col text-start min-w-0 max-w-[110px]">
            <span className="font-body-sm font-semibold text-on-surface leading-none text-xs truncate">
              {user.name}
            </span>
            <span className="font-telemetry-label text-secondary leading-tight text-[10px] flex items-center gap-0.5 mt-0.5 truncate">
              <span>{role}</span>
              <span className="material-symbols-outlined text-[10px] shrink-0">expand_more</span>
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
