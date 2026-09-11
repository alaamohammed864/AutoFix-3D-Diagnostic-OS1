import React from 'react';
import { AiIntent } from './types';

interface ArchitectureBreadcrumbProps {
  currentIntent?: AiIntent;
  vehicleName?: string;
  isProcessing?: boolean;
}

export const ArchitectureBreadcrumb: React.FC<ArchitectureBreadcrumbProps> = ({
  currentIntent,
  vehicleName,
  isProcessing,
}) => {
  const steps = [
    { label: 'User Question', icon: 'help', badge: 'INPUT' },
    { label: 'Intent Detection', icon: 'psychology', badge: currentIntent ? currentIntent.replace('_', ' ') : 'NLP' },
    { label: 'Vehicle Context', icon: 'directions_car', badge: vehicleName || 'PROFILE' },
    { label: 'Database Retrieval', icon: 'database', badge: 'STRICT DB' },
    { label: 'Relevant Procedures', icon: 'menu_book', badge: 'PROCEDURES' },
    { label: 'AI Reasoning', icon: 'auto_awesome', badge: 'GROUNDED' },
    { label: 'Answer', icon: 'chat', badge: 'SYNTHESIS' },
    { label: 'Sources', icon: 'verified', badge: 'CITATIONS' },
  ];

  return (
    <div className="w-full overflow-x-auto py-2.5 px-3 bg-surface-container-lowest/80 border border-white/5 rounded-xl text-xs font-code-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary-container animate-pulse"></span>
          <span className="font-telemetry-label uppercase tracking-wider text-[11px] text-outline">
            AutoFix AI Retrieval-Augmented Pipeline
          </span>
        </div>
        <span className="text-[10px] text-secondary font-semibold">Zero-Hallucination Verified Flow</span>
      </div>

      <div className="flex items-center gap-1.5 min-w-max">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <React.Fragment key={step.label}>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${
                  isProcessing && idx === 5
                    ? 'bg-primary-container/30 text-primary-container border border-primary-container animate-pulse'
                    : 'bg-surface-container text-on-surface border border-white/5 hover:border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  {step.icon}
                </span>
                <span className="text-[11px] font-medium whitespace-nowrap">{step.label}</span>
              </div>
              {!isLast && (
                <span className="material-symbols-outlined text-outline-variant text-[14px]">
                  arrow_forward
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
