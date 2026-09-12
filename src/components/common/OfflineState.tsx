import React from 'react';

interface OfflineStateProps {
  cachedVehiclesCount?: number;
  pendingSyncCount?: number;
  onRetryConnection?: () => void;
}

export const OfflineState: React.FC<OfflineStateProps> = ({
  cachedVehiclesCount = 5,
  pendingSyncCount = 0,
  onRetryConnection,
}) => {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-surface-container-low p-6 lg:p-8 max-w-2xl mx-auto space-y-6 shadow-2xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <span className="material-symbols-outlined text-2xl">cloud_off</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-headline-md font-bold text-on-surface">
              Workshop Offline Protocol Engaged
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-code-sm font-bold border border-amber-500/30">
              IndexedDB Active
            </span>
          </div>
          <p className="text-xs font-code-sm text-outline leading-relaxed">
            Internet connectivity is unavailable. The local automotive cache is serving all critical specifications, wiring schematics, and diagnostic trees safely without interruption.
          </p>
        </div>
      </div>

      {/* Offline Capabilities Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
          <span className="text-[10px] font-code-sm text-outline uppercase font-semibold">
            Locally Cached Rigs
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-telemetry-value-md text-primary-container font-bold">
              {cachedVehiclesCount}
            </span>
            <span className="text-[11px] font-code-sm text-outline">Vehicles</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
          <span className="text-[10px] font-code-sm text-outline uppercase font-semibold">
            Pending Sync Queue
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-telemetry-value-md text-amber-400 font-bold">
              {pendingSyncCount}
            </span>
            <span className="text-[11px] font-code-sm text-outline">Operations</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
          <span className="text-[10px] font-code-sm text-outline uppercase font-semibold">
            Service Worker Cache
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-code-sm text-emerald-400 font-bold">
              PRE-CACHED
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="text-[11px] font-code-sm text-outline">
          Automatic retry in progress every 15 seconds.
        </span>
        {onRetryConnection && (
          <button
            onClick={onRetryConnection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-code-sm font-semibold text-on-surface border border-white/10 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Check Connectivity</span>
          </button>
        )}
      </div>
    </div>
  );
};
