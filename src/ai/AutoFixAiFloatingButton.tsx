import React from 'react';
import { Language } from '../types';

interface AutoFixAiFloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
  lang?: Language;
}

export const AutoFixAiFloatingButton: React.FC<AutoFixAiFloatingButtonProps> = ({
  onClick,
  isOpen,
  lang = 'en',
}) => {
  if (isOpen) return null;

  const isAr = lang === 'ar';

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 end-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-surface-container-high/95 hover:bg-surface-container-highest border border-primary-container/40 shadow-[0_0_25px_rgba(0,240,255,0.35)] text-on-surface hover:text-primary-container transition-all group cursor-pointer backdrop-blur-md"
      type="button"
      title={isAr ? 'فتح مساعد التشخيص الذكي AutoFix AI' : 'Open AutoFix AI Diagnostic Assistant'}
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
      </span>

      <span className="material-symbols-outlined text-[20px] text-primary-container group-hover:scale-110 transition-transform">
        auto_awesome
      </span>

      <span className="font-code-sm text-xs font-bold tracking-wide">
        {isAr ? 'مساعد AutoFix الذكي' : 'AutoFix AI'}
      </span>

      <span className="px-1.5 py-0.2 rounded bg-primary-container/20 text-primary-container text-[9px] font-code-sm font-bold border border-primary-container/30">
        {isAr ? 'مساعد الورشة' : 'COPILOT'}
      </span>
    </button>
  );
};

