import React from 'react';
import { AutomotiveSystem } from '../../db/componentDatabase';
import { Language } from '../../types';

export const ALL_SYSTEMS: AutomotiveSystem[] = [
  'Engine',
  'Transmission',
  'Cooling',
  'Brakes',
  'Suspension',
  'Electrical',
  'Fuel',
  'HVAC',
];

interface SystemExplorerBarProps {
  visibleSystems: AutomotiveSystem[];
  onToggleSystem: (system: AutomotiveSystem) => void;
  onSelectAllSystems: () => void;
  onIsolateSystem: (system: AutomotiveSystem) => void;

  explodedLevel: number; // 0 to 1
  onChangeExplodedLevel: (val: number) => void;

  xrayMode: boolean;
  onToggleXrayMode: () => void;

  transparentMode: boolean;
  onToggleTransparentMode: () => void;

  showLabels: boolean;
  onToggleLabels: () => void;

  measureMode: boolean;
  onToggleMeasureMode: () => void;

  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;

  onResetCamera: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;

  lang: Language;
}

export const SystemExplorerBar: React.FC<SystemExplorerBarProps> = ({
  visibleSystems,
  onToggleSystem,
  onSelectAllSystems,
  onIsolateSystem,
  explodedLevel,
  onChangeExplodedLevel,
  xrayMode,
  onToggleXrayMode,
  transparentMode,
  onToggleTransparentMode,
  showLabels,
  onToggleLabels,
  measureMode,
  onToggleMeasureMode,
  isAutoRotating,
  onToggleAutoRotate,
  onResetCamera,
  isFullscreen,
  onToggleFullscreen,
  lang,
}) => {
  const isAllActive = ALL_SYSTEMS.every((s) => visibleSystems.includes(s));

  const getSystemIcon = (sys: AutomotiveSystem) => {
    switch (sys) {
      case 'Engine':
        return 'electric_bolt';
      case 'Transmission':
        return 'tune';
      case 'Cooling':
        return 'mode_fan';
      case 'Brakes':
        return 'album';
      case 'Suspension':
        return 'swap_vert';
      case 'Electrical':
        return 'bolt';
      case 'Fuel':
        return 'local_gas_station';
      case 'HVAC':
        return 'ac_unit';
      default:
        return 'settings';
    }
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="p-3 bg-surface-container-low/90 backdrop-blur-md border-b border-white/10 flex flex-col gap-2.5 select-none"
    >
      {/* Upper Row: System Toggles & Explorer Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-code-sm text-[11px] font-bold uppercase tracking-wider text-primary-container flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">view_in_ar</span>
            <span>{lang === 'ar' ? 'مستكشف الأنظمة 3D' : '3D System Explorer'}</span>
          </span>

          <button
            onClick={onSelectAllSystems}
            className={`px-2 py-1 rounded text-[11px] font-code-sm transition-colors cursor-pointer ${
              isAllActive
                ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            {isAllActive
              ? lang === 'ar'
                ? 'جميع الأنظمة مفعلة'
                : 'All 8 Active'
              : lang === 'ar'
              ? 'تفعيل الكل'
              : 'Show All'}
          </button>
        </div>

        {/* 8 Systems Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ALL_SYSTEMS.map((sys) => {
            const isActive = visibleSystems.includes(sys);
            return (
              <div key={sys} className="relative group flex items-center">
                <button
                  onClick={() => onToggleSystem(sys)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-code-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-surface-container-high text-on-surface border border-primary-container/40 shadow-sm'
                      : 'bg-surface-container-lowest/60 text-outline/50 border border-white/5 hover:text-outline'
                  }`}
                  title={`${isActive ? 'Hide' : 'Show'} ${sys}`}
                >
                  <span
                    className={`material-symbols-outlined text-xs ${
                      isActive ? 'text-primary-container' : 'text-outline/40'
                    }`}
                  >
                    {getSystemIcon(sys)}
                  </span>
                  <span>{sys}</span>
                </button>

                {/* Quick Isolation Button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onIsolateSystem(sys);
                  }}
                  className="hidden group-hover:inline-flex p-0.5 ms-0.5 rounded bg-surface-container-highest text-secondary text-[9px] font-code-sm hover:bg-secondary hover:text-on-secondary cursor-pointer"
                  title={`Isolate ${sys} only`}
                >
                  Solo
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Row: View Modes & Camera Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-white/5">
        {/* Left Side: Modes */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Exploded View Toggle & Range */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-container border border-white/5 text-xs font-code-sm">
            <button
              onClick={() => onChangeExplodedLevel(explodedLevel > 0 ? 0 : 0.8)}
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                explodedLevel > 0 ? 'text-primary-container font-bold' : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">open_in_full</span>
              <span>{lang === 'ar' ? 'منظور مفكك' : 'Exploded View'}</span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedLevel}
              onChange={(e) => onChangeExplodedLevel(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
              title="Explosion Distance"
            />
            {explodedLevel > 0 && (
              <span className="text-[10px] text-primary-container font-bold">
                {Math.round(explodedLevel * 100)}%
              </span>
            )}
          </div>

          {/* X-Ray Mode */}
          <button
            onClick={onToggleXrayMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-code-sm transition-colors cursor-pointer ${
              xrayMode
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">blur_on</span>
            <span>{lang === 'ar' ? 'أشعة سينية X-Ray' : 'X-Ray Mode'}</span>
          </button>

          {/* Transparent Mode */}
          <button
            onClick={onToggleTransparentMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-code-sm transition-colors cursor-pointer ${
              transparentMode
                ? 'bg-secondary text-on-secondary font-bold'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">opacity</span>
            <span>{lang === 'ar' ? 'هيكل شفاف' : 'Transparent Shell'}</span>
          </button>

          {/* 3D Component Labels */}
          <button
            onClick={onToggleLabels}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-code-sm transition-colors cursor-pointer ${
              showLabels
                ? 'bg-surface-container-high text-primary-container border border-primary-container/30 font-bold'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">label</span>
            <span>{lang === 'ar' ? 'العلامات 3D' : 'Labels'}</span>
          </button>

          {/* Measurement Mode */}
          <button
            onClick={onToggleMeasureMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-code-sm transition-colors cursor-pointer ${
              measureMode
                ? 'bg-surface-container-high text-secondary border border-secondary/30 font-bold'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">straighten</span>
            <span>{lang === 'ar' ? 'أبعاد القياس' : 'Measurements'}</span>
          </button>
        </div>

        {/* Right Side: Camera Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleAutoRotate}
            className={`p-1.5 rounded-lg text-xs font-code-sm transition-colors cursor-pointer flex items-center gap-1 ${
              isAutoRotating
                ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                : 'bg-surface-container text-outline hover:text-on-surface'
            }`}
            title="Toggle Auto Rotation"
          >
            <span className="material-symbols-outlined text-sm">360</span>
            <span className="hidden md:inline">{lang === 'ar' ? 'دوران تلقائي' : 'Rotate'}</span>
          </button>

          <button
            onClick={onResetCamera}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface text-xs font-code-sm transition-colors cursor-pointer flex items-center gap-1"
            title="Reset Camera View"
          >
            <span className="material-symbols-outlined text-sm">center_focus_strong</span>
            <span className="hidden md:inline">{lang === 'ar' ? 'إعادة الكاميرا' : 'Reset'}</span>
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface text-xs font-code-sm transition-colors cursor-pointer flex items-center gap-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <span className="material-symbols-outlined text-sm">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
            <span className="hidden md:inline">
              {isFullscreen
                ? lang === 'ar'
                  ? 'تصغير'
                  : 'Exit'
                : lang === 'ar'
                ? 'ملء الشاشة'
                : 'Fullscreen'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
