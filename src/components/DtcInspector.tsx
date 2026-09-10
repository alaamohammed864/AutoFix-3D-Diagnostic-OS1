import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface DtcInspectorProps {
  lang: Language;
  onLaunchTree: () => void;
  onInspect3d: () => void;
  onSyncVideo: () => void;
  onOpenDtcSuite?: () => void;
}

export const DtcInspector: React.FC<DtcInspectorProps> = ({
  lang,
  onLaunchTree,
  onInspect3d,
  onSyncVideo,
  onOpenDtcSuite,
}) => {
  const t = translations[lang];

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-2xl relative overflow-hidden border border-white/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-error-container/10 rounded-bl-full pointer-events-none"></div>

      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-code-sm text-xs font-bold uppercase tracking-wide">
            {t.activeDtc}
          </span>
          <span className="font-code-sm text-xs text-outline">{t.milOn}</span>
        </div>
        <span className="font-code-sm text-xs text-outline">{t.dtcCount}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display-lg text-telemetry-value-lg text-error font-bold tracking-tight">
            {t.dtcCode}
          </span>
          <span className="font-code-sm text-xs text-outline">{t.dtcCategory}</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface font-semibold leading-tight">
          {t.dtcTitle}
        </h3>
        <p className="font-body-md text-body-sm text-on-surface-variant leading-relaxed">
          {t.dtcDesc}
        </p>
      </div>

      {/* Freeze Frame Monospace Telemetry Matrix */}
      <div className="mt-4 bg-surface-container-low p-3 rounded-lg space-y-2 border border-white/5">
        <div className="flex items-center justify-between">
          <span className="font-telemetry-label text-telemetry-label text-secondary uppercase">
            {t.freezeFrameSnapshot}
          </span>
          <span className="font-code-sm text-[10px] text-outline">{t.triggerFrame}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-code-sm pt-1">
          <div className="flex justify-between bg-surface-container-lowest px-2 py-1 rounded">
            <span className="text-outline">{t.engineRpm}:</span>
            <span className="text-on-surface font-semibold">2,150</span>
          </div>
          <div className="flex justify-between bg-surface-container-lowest px-2 py-1 rounded">
            <span className="text-outline">{t.engineLoad}:</span>
            <span className="text-on-surface font-semibold">38.4 %</span>
          </div>
          <div className="flex justify-between bg-surface-container-lowest px-2 py-1 rounded">
            <span className="text-outline">{t.stftBank1}:</span>
            <span className="text-error font-bold">+24.8 %</span>
          </div>
          <div className="flex justify-between bg-surface-container-lowest px-2 py-1 rounded">
            <span className="text-outline">{t.ltftBank1}:</span>
            <span className="text-error font-bold">+18.2 %</span>
          </div>
          <div className="flex justify-between bg-surface-container-lowest px-2 py-1 rounded">
            <span className="text-outline">{t.vehicleSpeed}:</span>
            <span className="text-on-surface font-semibold">58 km/h</span>
          </div>
          <div className="flex justify-between bg-surface-container-lowest px-2 py-1 rounded">
            <span className="text-outline">{t.fuelRail}:</span>
            <span className="text-secondary font-semibold">142 Bar</span>
          </div>
        </div>
      </div>

      {/* Potential Causes Checklist */}
      <div className="mt-4 space-y-2">
        <span className="font-telemetry-label text-telemetry-label text-outline uppercase">
          {t.probableCauses}
        </span>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-code-sm p-1.5 rounded bg-surface-container-low border border-white/5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-error"></span>
              <span className="text-on-surface">{t.cause1}</span>
            </div>
            <span className="text-error font-bold">78%</span>
          </div>
          <div className="flex items-center justify-between text-xs font-code-sm p-1.5 rounded bg-surface-container-low border border-white/5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary-fixed-dim"></span>
              <span className="text-on-surface">{t.cause2}</span>
            </div>
            <span className="text-on-surface-variant font-medium">54%</span>
          </div>
          <div className="flex items-center justify-between text-xs font-code-sm p-1.5 rounded bg-surface-container-low border border-white/5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-outline"></span>
              <span className="text-on-surface">{t.cause3}</span>
            </div>
            <span className="text-on-surface-variant font-medium">32%</span>
          </div>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="mt-5 space-y-2">
        {onOpenDtcSuite && (
          <button
            onClick={onOpenDtcSuite}
            className="w-full bg-error-container hover:bg-error-container/80 text-on-error-container py-2.5 rounded-lg font-code-sm text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-error/30"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">troubleshoot</span>
            <span>{lang === 'ar' ? 'فاحص OBD-II ومحرك الترابط (DTC Suite)' : 'Open OBD-II / DTC Suite & Correlation'}</span>
          </button>
        )}

        <button
          onClick={onLaunchTree}
          className="w-full bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container py-2.5 rounded-lg font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-sm">account_tree</span>
          <span>{t.launchDiagnosticTree}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onInspect3d}
            className="bg-surface-container hover:bg-surface-container-high text-secondary py-2 rounded-lg font-code-sm text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/5 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>{t.inspectIn3D}</span>
          </button>
          <button
            onClick={onSyncVideo}
            className="bg-surface-container hover:bg-surface-container-high text-primary-fixed-dim py-2 rounded-lg font-code-sm text-xs transition-colors flex items-center justify-center gap-1.5 border border-white/5 cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">play_circle</span>
            <span>{t.syncVideoGuide}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
