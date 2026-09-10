import React from 'react';
import { Language, NavPath } from '../types';
import { translations } from '../data/translations';

interface SidebarProps {
  currentPath: NavPath;
  onNavigate: (path: NavPath) => void;
  lang: Language;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  lang,
  isOpenMobile,
  onCloseMobile,
}) => {
  const t = translations[lang];

  const logoUrl =
    'https://lh3.googleusercontent.com/aida/AEtjO1WXpXJD9ETKZOKMJuacT6FljUgBcBaSjO66BPYLG7UXu8ehW49zOlT37RSmgvAtDBuettqxjFl1tjs4DVI8sTLM7wBPOpJ6ZSIM4MrmqnCpXeHsKqpZBQ9Zq_gh-NcWTLcCCMBx5h5u_LdhYoBLmt8MM3Z9_6ApveVz6rHaEw4IgoH-565S-ZHDul1FIiudz1Y39wofQucMTgIbV3iy8TN23nsL_PgFCXV8lxN04hEid08E1cVt1fRqyw';

  const navItemClass = (path: NavPath) =>
    `flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer text-xs ${
      currentPath === path
        ? 'bg-primary-container text-on-primary-container font-semibold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 bg-surface-container-low/40 gap-3 border-b border-white/5">
          <img
            alt="AutoFix 3D Hexagon Core Logo"
            className="h-8 w-auto object-contain"
            src={logoUrl}
          />
          <div className="flex flex-col">
            <span className="font-headline-md text-lg text-primary tracking-tight leading-none font-bold">
              {t.appTitle}
            </span>
            <span className="font-telemetry-label text-[10px] text-secondary tracking-widest uppercase mt-0.5">
              {t.appSubtitle}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="px-3 py-3 flex flex-col gap-1">
          {/* Section 1: Workspace & Scanner */}
          <div className="px-2 pt-2 pb-1">
            <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider">
              {t.workspaceScanner}
            </span>
          </div>

          <a
            className={navItemClass('dashboard')}
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">speed</span>
              <span className="font-body-md">{t.dashboard}</span>
            </div>
            {currentPath === 'dashboard' && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container shadow-[0_0_8px_rgba(0,240,255,0.8)]"></span>
            )}
          </a>

          <a
            className={navItemClass('vehicle-explorer')}
            onClick={() => {
              onNavigate('vehicle-explorer');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">directions_car</span>
              <span className="font-body-md">{t.vehicleExplorer}</span>
            </div>
          </a>

          <a
            className={navItemClass('diagnostic-engine')}
            onClick={() => {
              onNavigate('diagnostic-engine');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">account_tree</span>
              <span className="font-body-md">{lang === 'ar' ? 'محرك التشخيص' : 'Diagnostic Engine'}</span>
            </div>
            <span className="bg-primary-container/20 text-primary-container px-1.5 py-0.5 rounded text-[10px] font-code-sm font-bold">
              TREE
            </span>
          </a>

          <a
            className={navItemClass('3d-telemetry-cad')}
            onClick={() => {
              onNavigate('3d-telemetry-cad');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
              <span className="font-body-md">{t.threeDTelemetry}</span>
            </div>
            <span className="bg-surface-container-high text-secondary px-1.5 py-0.5 rounded text-[10px] font-code-sm font-bold">
              3D
            </span>
          </a>

          <a
            className={navItemClass('live-dtc-scanner')}
            onClick={() => {
              onNavigate('live-dtc-scanner');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span className="font-body-md">{t.liveDtc}</span>
            </div>
            <span className="bg-error-container text-on-error-container px-1.5 py-0.5 rounded text-[10px] font-code-sm font-bold">
              3 Alerts
            </span>
          </a>

          {/* Section 2: Vehicle Subsystems */}
          <div className="px-2 pt-3 pb-1">
            <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider">
              {t.vehicleSubsystems}
            </span>
          </div>

          <a
            className={navItemClass('powertrain-engine')}
            onClick={() => {
              onNavigate('powertrain-engine');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">settings_input_component</span>
              <span className="font-body-md">{t.powertrainEngine}</span>
            </div>
            <span className="text-outline-variant font-code-sm text-[11px]">CAN 1</span>
          </a>

          <a
            className={navItemClass('transmission-pdk')}
            onClick={() => {
              onNavigate('transmission-pdk');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">auto_mode</span>
              <span className="font-body-md">{t.transmissionPdk}</span>
            </div>
          </a>

          <a
            className={navItemClass('braking-abs')}
            onClick={() => {
              onNavigate('braking-abs');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">adjust</span>
              <span className="font-body-md">{t.brakingAbs}</span>
            </div>
          </a>

          <a
            className={navItemClass('thermal-cooling')}
            onClick={() => {
              onNavigate('thermal-cooling');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">ac_unit</span>
              <span className="font-body-md">{t.thermalCooling}</span>
            </div>
          </a>

          <a
            className={navItemClass('electrical-wiring')}
            onClick={() => {
              onNavigate('electrical-wiring');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">schema</span>
              <span className="font-body-md">{t.electricalWiring}</span>
            </div>
          </a>

          <a
            className={navItemClass('suspension-steering')}
            onClick={() => {
              onNavigate('suspension-steering');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">height</span>
              <span className="font-body-md">{t.suspensionSteering}</span>
            </div>
          </a>

          {/* Section 3: Maintenance & Repairs */}
          <div className="px-2 pt-3 pb-1">
            <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider">
              {t.maintenanceRepairs}
            </span>
          </div>

          <a
            className={navItemClass('service-schedules')}
            onClick={() => {
              onNavigate('service-schedules');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              <span className="font-body-md">{t.serviceSchedules}</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-tertiary-container"></span>
          </a>

          <a
            className={navItemClass('repair-guides')}
            onClick={() => {
              onNavigate('repair-guides');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              <span className="font-body-md">{t.repairGuides}</span>
            </div>
            <span className="font-code-sm text-[10px] text-secondary">VIDEO SYNC</span>
          </a>

          <a
            className={navItemClass('fluid-specs')}
            onClick={() => {
              onNavigate('fluid-specs');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">opacity</span>
              <span className="font-body-md">{t.fluidSpecs}</span>
            </div>
          </a>

          <a
            className={navItemClass('tools-torque')}
            onClick={() => {
              onNavigate('tools-torque');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">build</span>
              <span className="font-body-md">{t.toolsTorque}</span>
            </div>
          </a>

          <a
            className={navItemClass('parts-catalog')}
            onClick={() => {
              onNavigate('parts-catalog');
              onCloseMobile();
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px]">hub</span>
              <span className="font-body-md">{t.partsCatalog}</span>
            </div>
          </a>
        </nav>
      </div>

      {/* Offline Database & Settings */}
      <div className="p-3 bg-surface-container-lowest/80 flex flex-col gap-2 border-t border-white/5">
        <div className="p-2.5 bg-surface-container-low rounded-lg flex flex-col gap-1 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="font-telemetry-label text-[10px] text-outline uppercase">
              {t.offlineDb}
            </span>
            <span className="inline-flex items-center gap-1 font-code-sm text-[10px] text-secondary-container">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary-container animate-pulse"></span>
              {t.synced}
            </span>
          </div>
          <div className="font-code-sm text-xs text-on-surface">{t.vehiclesIndexed}</div>
        </div>

        <a
          onClick={() => {
            onNavigate('system-settings');
            onCloseMobile();
          }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer text-xs"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span className="font-body-md">{t.systemSettings}</span>
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed top-0 bottom-0 start-0 w-72 bg-surface-container-lowest z-40 flex-col border-e border-white/5">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[80vw] bg-surface-container-lowest h-full z-50 shadow-2xl flex flex-col border-e border-white/10">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
