import React from 'react';

interface NotFoundViewProps {
  missingPath?: string;
  onReturnHome: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  missingPath = 'Target ECU Address',
  onReturnHome,
}) => {
  return (
    <div className="min-h-[500px] w-full flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl bg-surface-container-low border border-white/10 p-8 shadow-2xl space-y-6 text-center">
        {/* Radar Scanner Graphic */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-surface-container-high border border-primary-container/30 flex items-center justify-center">
          <span className="text-2xl font-telemetry-value-md text-primary-container font-black">
            404
          </span>
          <div className="absolute inset-0 rounded-full border border-primary-container/40 animate-ping"></div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container-highest text-outline text-[11px] font-code-sm font-semibold">
            <span className="material-symbols-outlined text-xs text-rose-400">gps_off</span>
            <span>CAN-ID NOT_RESPONDING</span>
          </div>

          <h2 className="text-xl font-headline-md font-bold text-on-surface">
            Subsystem Not Found
          </h2>

          <p className="text-xs font-code-sm text-outline leading-relaxed">
            The requested diagnostic endpoint or vehicle route{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-primary-container">
              {missingPath}
            </code>{' '}
            is not mapped in the powertrain bus topology.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onReturnHome}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-code-sm font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Return to Telemetry Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
