import React from 'react';

interface InternalServerErrorViewProps {
  errorCode?: string;
  onRetry?: () => void;
  onReturnDashboard?: () => void;
}

export const InternalServerErrorView: React.FC<InternalServerErrorViewProps> = ({
  errorCode = 'INTERNAL_SERVER_ERROR',
  onRetry,
  onReturnDashboard,
}) => {
  const incidentRef = 'SEC-FLT-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="min-h-[500px] w-full flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-2xl bg-surface-container-low border border-rose-500/30 p-8 shadow-2xl space-y-6 text-center">
        {/* Pulsing 500 Hazard Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <span className="text-3xl font-telemetry-value-md font-extrabold">500</span>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-code-sm font-bold">
            <span className="material-symbols-outlined text-xs">gpp_maybe</span>
            <span>Zero Stack-Trace Leak Enforced</span>
          </div>

          <h2 className="text-xl font-headline-md font-bold text-on-surface">
            Server Telemetry Fault (HTTP 500)
          </h2>

          <p className="text-xs font-code-sm text-outline leading-relaxed">
            An internal server exception occurred while processing the request. In accordance with production security protocol, technical stack traces and internal memory pointers are securely retained on the server log stream and suppressed from the client.
          </p>
        </div>

        {/* Security Incident Metadata Box */}
        <div className="rounded-xl bg-surface-container-lowest border border-white/5 p-4 text-start space-y-2 font-code-sm text-xs">
          <div className="flex items-center justify-between">
            <span className="text-outline">Error Code:</span>
            <span className="text-on-surface font-semibold">{errorCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-outline">Security Incident Ref:</span>
            <span className="text-primary-container font-bold">{incidentRef}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-outline">Audit Log Action:</span>
            <span className="text-emerald-400 font-medium">Logged & Tamper-Hashed</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-code-sm font-semibold transition-all cursor-pointer"
              type="button"
            >
              Retry Request
            </button>
          )}

          {onReturnDashboard && (
            <button
              onClick={onReturnDashboard}
              className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-code-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 transition-all cursor-pointer"
              type="button"
            >
              Return to Safe Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
