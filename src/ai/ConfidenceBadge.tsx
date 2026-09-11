import React from 'react';
import { ConfidenceLevel, SourceCitation } from './types';

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  switch (confidence) {
    case 'High':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-code-sm font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>High Confidence (Verified Match)</span>
        </div>
      );
    case 'Medium':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-400 text-[11px] font-code-sm font-semibold shadow-[0_0_10px_rgba(245,158,11,0.2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
          <span>Medium Confidence (Standard Ref)</span>
        </div>
      );
    case 'Low':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-950/60 border border-orange-500/30 text-orange-400 text-[11px] font-code-sm font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
          <span>Low Confidence (Limited Database Entry)</span>
        </div>
      );
    case 'Insufficient':
    default:
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 text-[11px] font-code-sm font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]">
          <span className="material-symbols-outlined text-[14px]">gpp_bad</span>
          <span>Insufficient Data (Zero Hallucination Guardrail)</span>
        </div>
      );
  }
};

interface SourceCitationsBoxProps {
  sources: SourceCitation[];
  onOpenProcedure?: (id: string) => void;
  onOpenExternalUrl?: (url: string) => void;
}

export const SourceCitationsBox: React.FC<SourceCitationsBoxProps> = ({
  sources,
  onOpenProcedure,
  onOpenExternalUrl,
}) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-white/10 bg-surface-container-lowest/60 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-telemetry-label uppercase tracking-wider text-outline">
          <span className="material-symbols-outlined text-secondary text-[16px]">menu_book</span>
          <span className="font-semibold text-on-surface">Verified Sources & References</span>
        </div>
        <span className="text-[10px] font-code-sm text-secondary bg-secondary-container/20 px-2 py-0.5 rounded border border-secondary-container/30">
          Strict Database Grounding
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sources.map((src) => {
          const isDb = src.type === 'Vehicle database';
          const isRepair = src.type === 'Repair reference';
          const isDoc = src.type === 'Manufacturer documentation';
          const isVideo = src.type === 'External video reference';

          return (
            <div
              key={src.id}
              className="p-2.5 rounded bg-surface-container-low border border-white/5 flex flex-col gap-1 hover:border-white/15 transition-all text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded font-code-sm text-[9px] uppercase font-bold tracking-wide ${
                    isDb
                      ? 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                      : isRepair
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isDoc
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {src.type}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-code-sm text-secondary">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Verified
                </span>
              </div>

              <div className="font-body-md font-medium text-on-surface text-[12px] line-clamp-1">
                {src.title}
              </div>

              <div className="text-[11px] font-code-sm text-on-surface-variant line-clamp-2">
                {src.detail}
              </div>

              {src.url && (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-[10px] font-code-sm text-primary-container hover:underline"
                >
                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  <span>View Public Video Guide</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
