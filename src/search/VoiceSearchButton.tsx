import React from 'react';
import { Language } from '../types';

interface VoiceSearchButtonProps {
  isListening: boolean;
  isSupported: boolean;
  lang: Language;
  onClick: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  isListening,
  isSupported,
  lang,
  onClick,
  size = 'md',
  className = '',
}) => {
  const isAr = lang === 'ar';

  const tooltipText = !isSupported
    ? isAr
      ? 'البحث الصوتي غير مدعوم في متصفحك'
      : 'Voice search not supported in this browser'
    : isListening
    ? isAr
      ? 'جاري الاستماع... اضغط للإيقاف'
      : 'Listening... Click to stop'
    : isAr
    ? 'تحدث بالعربية أو الإنجليزية للبحث الصوتي'
    : 'Speak in English or Arabic for voice search';

  const sizeClasses =
    size === 'sm'
      ? 'p-1.5 text-xs rounded-lg'
      : 'p-2 text-sm rounded-xl';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={onClick}
        title={tooltipText}
        aria-label={tooltipText}
        className={`relative flex items-center justify-center transition-all cursor-pointer ${sizeClasses} ${
          isListening
            ? 'bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.6)] animate-pulse ring-2 ring-rose-400'
            : isSupported
            ? 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-primary-container border border-white/10 hover:border-primary-container/40'
            : 'bg-surface-container text-outline/50 border border-white/5 cursor-not-allowed opacity-60'
        } ${className}`}
      >
        {isListening ? (
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px] animate-bounce">mic</span>
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-white rounded-full animate-[ping_0.8s_infinite] h-2"></span>
              <span className="w-0.5 bg-white rounded-full animate-[ping_1.2s_infinite] h-3"></span>
              <span className="w-0.5 bg-white rounded-full animate-[ping_0.6s_infinite] h-1.5"></span>
            </div>
          </div>
        ) : (
          <span className="material-symbols-outlined text-[18px]">
            {isSupported ? 'mic' : 'mic_off'}
          </span>
        )}
      </button>

      {/* Pulsing ring indicator while listening */}
      {isListening && (
        <span className="absolute -inset-1 rounded-xl bg-rose-500/30 animate-ping pointer-events-none"></span>
      )}
    </div>
  );
};
