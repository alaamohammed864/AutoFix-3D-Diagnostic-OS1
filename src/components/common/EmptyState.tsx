import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'check_circle',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface-container-low/60 p-10 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center text-primary-container shadow-inner">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-headline-md font-bold text-on-surface">
          {title}
        </h3>
        <p className="text-xs font-code-sm text-outline leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-code-sm font-bold shadow-md hover:scale-105 transition-all cursor-pointer"
              type="button"
            >
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-code-sm font-medium transition-all cursor-pointer"
              type="button"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
