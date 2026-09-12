import React from 'react';

interface LoadingStateProps {
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Interrogating CAN-BUS Gateway...',
  sublabel = 'Awaiting ECU response packet (500 kbps)',
  size = 'md',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center min-h-[220px]">
      {/* Animated Gyroscope / Radar Ring */}
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary-container/20 animate-ping absolute"></div>
        <div className="w-12 h-12 rounded-full border-2 border-t-primary-container border-r-transparent border-b-secondary border-l-transparent animate-spin"></div>
        <span className="material-symbols-outlined text-primary-container text-lg absolute">
          memory
        </span>
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wider">
          {label}
        </h4>
        {sublabel && (
          <p className="font-code-sm text-xs text-outline leading-relaxed">{sublabel}</p>
        )}
      </div>

      {/* Pulsing Signal Bar */}
      <div className="flex items-center gap-1">
        <span className="h-1 w-3 rounded-full bg-primary-container animate-pulse"></span>
        <span className="h-1 w-3 rounded-full bg-primary-container/70 animate-pulse delay-75"></span>
        <span className="h-1 w-3 rounded-full bg-primary-container/40 animate-pulse delay-150"></span>
      </div>
    </div>
  );
};
