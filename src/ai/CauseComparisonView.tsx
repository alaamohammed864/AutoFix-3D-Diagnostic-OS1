import React from 'react';
import { CauseComparison } from './types';

interface CauseComparisonViewProps {
  comparison: CauseComparison;
}

export const CauseComparisonView: React.FC<CauseComparisonViewProps> = ({ comparison }) => {
  return (
    <div className="mt-3 p-4 rounded-xl bg-surface-container-low border border-amber-500/20 shadow-md">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[20px]">
            balance
          </span>
          <div>
            <span className="font-telemetry-label text-[10px] text-amber-400 uppercase tracking-widest font-bold block">
              Differential Diagnosis Matrix
            </span>
            <h4 className="font-headline-md text-sm font-bold text-on-surface">
              {comparison.symptom}
            </h4>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-code-sm text-[11px] border border-amber-500/20">
          {comparison.vehicle}
        </span>
      </div>

      <div className="space-y-3">
        {comparison.causes.map((cause) => (
          <div
            key={cause.id}
            className="p-3 rounded-lg bg-surface-container border border-white/5 hover:border-white/15 transition-all text-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-headline-md font-bold text-on-surface text-[13px]">
                  {cause.name}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-outline text-[10px] font-code-sm">
                  {cause.system}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-code-sm text-xs font-bold text-amber-400">
                  {cause.probability}% Probable
                </span>
                <span className="text-outline-variant font-code-sm text-[11px]">{cause.estCost}</span>
              </div>
            </div>

            {/* Probability visual meter */}
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${
                  cause.probability >= 40
                    ? 'bg-amber-400'
                    : cause.probability >= 20
                    ? 'bg-secondary'
                    : 'bg-outline'
                }`}
                style={{ width: `${cause.probability}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-code-sm text-on-surface-variant">
              <div>
                <strong className="text-outline">Key Indicators:</strong> {cause.keyIndicators}
              </div>
              <div>
                <strong className="text-outline">Definitive Test:</strong>{' '}
                <span className="text-primary-container font-semibold">{cause.verificationTest}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
