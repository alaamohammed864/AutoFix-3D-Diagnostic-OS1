import React, { useState } from 'react';
import { DiagnosticChecklist } from './types';

interface InteractiveChecklistViewProps {
  checklist: DiagnosticChecklist;
}

export const InteractiveChecklistView: React.FC<InteractiveChecklistViewProps> = ({ checklist }) => {
  const [items, setItems] = useState(checklist.items);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const completedCount = items.filter((i) => i.checked).length;
  const progressPct = Math.round((completedCount / items.length) * 100);

  const handleCopy = () => {
    const text = `DIAGNOSTIC CHECKLIST: ${checklist.title} (${checklist.vehicle})\n` +
      items
        .map(
          (i) =>
            `[${i.checked ? 'X' : ' '}] Step ${i.stepNumber}: ${i.task} (Tool: ${i.tool} | Spec: ${i.spec})`
        )
        .join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-3 p-4 rounded-xl bg-surface-container-low border border-primary-container/20 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[18px]">
              checklist
            </span>
            <h4 className="font-headline-md text-sm font-bold text-on-surface">
              {checklist.title}
            </h4>
          </div>
          <p className="text-xs font-code-sm text-outline mt-0.5">
            Vehicle: <span className="text-on-surface font-semibold">{checklist.vehicle}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-sm text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            <span>Copy Checklist</span>
          </button>
          <div className="text-right">
            <span className="font-code-sm text-xs text-primary-container font-bold">
              {completedCount}/{items.length} Done ({progressPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-surface-container-lowest h-1.5 rounded-full my-3 overflow-hidden">
        <div
          className="bg-primary-container h-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        ></div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
              item.checked
                ? 'bg-primary-container/10 border-primary-container/30 text-on-surface'
                : 'bg-surface-container border-white/5 hover:border-white/15 text-on-surface-variant'
            }`}
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {}} // handled by div click
                className="rounded border-white/20 text-primary-container focus:ring-primary-container/30 h-4 w-4 bg-surface-container-lowest cursor-pointer"
              />
            </div>

            <div className="flex-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-code-sm font-bold text-secondary">
                  Step {item.stepNumber}
                </span>
                <span className="font-body-md font-medium text-on-surface">{item.task}</span>
                {item.critical && (
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-code-sm text-[10px] font-bold border border-rose-500/30">
                    CRITICAL SAFETY
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 font-code-sm text-[11px] text-outline">
                <span>
                  <strong className="text-outline-variant">Tool:</strong> {item.tool}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-outline-variant">Spec:</strong>{' '}
                  <span className="text-secondary font-semibold">{item.spec}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
