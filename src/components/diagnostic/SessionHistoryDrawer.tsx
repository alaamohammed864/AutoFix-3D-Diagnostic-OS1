// AutoFix 3D - Diagnostic Session History Manager
// View, compare, restore, and export past diagnostic scans

import React, { useState } from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';
import { DiagnosticSessionReport } from '../../simulation/types';

interface SessionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onViewReport: (report: DiagnosticSessionReport) => void;
}

export const SessionHistoryDrawer: React.FC<SessionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  onViewReport,
}) => {
  const { savedSessions, deleteSession } = useSimulation();
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const isArabic = lang === 'ar';

  if (!isOpen) return null;

  const handleToggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compareReport1 = savedSessions.find((s) => s.id === selectedForCompare[0]);
  const compareReport2 = savedSessions.find((s) => s.id === selectedForCompare[1]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="w-full sm:w-[500px] lg:w-[580px] bg-surface-container-lowest border-s border-white/10 shadow-2xl h-full flex flex-col text-on-surface animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-surface-container-low/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary-container text-xl">history</span>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {isArabic ? 'سجل الفحوصات والتقارير المحفوظة' : 'Diagnostic Session History'}
              </h3>
              <p className="text-[11px] text-outline">
                {savedSessions.length} {isArabic ? 'جلسات مسجلة' : 'Saved Sessions in Local DB'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Compare Toolbar */}
          {selectedForCompare.length === 2 && compareReport1 && compareReport2 && (
            <div className="p-4 rounded-xl bg-primary-container/10 border border-primary-container/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary-container flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">compare_arrows</span>
                  <span>{isArabic ? 'مقارنة جلستي فحص' : 'Session Comparison View'}</span>
                </span>
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="text-[10px] text-outline hover:text-on-surface cursor-pointer"
                >
                  {isArabic ? 'إلغاء المقارنة' : 'Clear Comparison'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-code-sm">
                <div className="p-2.5 rounded-lg bg-surface-container border border-white/5 space-y-1">
                  <span className="text-[10px] text-outline block truncate">{compareReport1.date}</span>
                  <div className="flex justify-between">
                    <span className="text-outline">Health:</span>
                    <span className="font-bold text-on-surface">{compareReport1.overallHealthScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">DTCs:</span>
                    <span className="font-bold text-rose-400">{compareReport1.activeDtcs.length}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-container border border-white/5 space-y-1">
                  <span className="text-[10px] text-outline block truncate">{compareReport2.date}</span>
                  <div className="flex justify-between">
                    <span className="text-outline">Health:</span>
                    <span className="font-bold text-on-surface">{compareReport2.overallHealthScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">DTCs:</span>
                    <span className="font-bold text-rose-400">{compareReport2.activeDtcs.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions List */}
          {savedSessions.length === 0 ? (
            <div className="p-8 text-center text-outline space-y-2 text-xs">
              <span className="material-symbols-outlined text-3xl opacity-40">inventory_2</span>
              <p>
                {isArabic
                  ? 'لا توجد جلسات فحص محفوظة بعد. قم بإجراء فحص شامل للمركبة لحفظ أول تقرير.'
                  : 'No saved diagnostic sessions found. Run a vehicle scan to generate your first report.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedSessions.map((session) => {
                const isCompared = selectedForCompare.includes(session.id);

                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isCompared
                        ? 'bg-primary-container/15 border-primary-container'
                        : 'bg-surface-container-low border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-code-sm text-outline block">
                          {session.date}
                        </span>
                        <h4 className="font-bold text-xs text-on-surface mt-0.5">
                          {session.vehicleMake} {session.vehicleModel} ({session.vehicleYear})
                        </h4>
                        <span className="text-[10px] font-code-sm text-cyan-400">
                          VIN: {session.vin}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-code-sm font-bold ${
                            session.overallHealthScore >= 80
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {session.overallHealthScore}%
                        </span>
                      </div>
                    </div>

                    {/* Active DTC Badges */}
                    {session.activeDtcs.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {session.activeDtcs.map((code) => (
                          <span
                            key={code}
                            className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-code-sm font-bold"
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs font-code-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewReport(session)}
                          className="px-3 py-1 rounded-lg bg-primary-container text-on-primary-container font-bold hover:brightness-110 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                        >
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          <span>{isArabic ? 'عرض' : 'View'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleCompare(session.id)}
                          className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer text-[11px] ${
                            isCompared
                              ? 'bg-primary-container/30 border-primary-container text-primary-container font-bold'
                              : 'bg-surface-container border-white/5 text-outline hover:text-on-surface'
                          }`}
                        >
                          {isCompared ? (isArabic ? 'محدد' : 'Selected') : isArabic ? 'مقارنة' : 'Compare'}
                        </button>
                      </div>

                      <button
                        onClick={() => deleteSession(session.id)}
                        className="p-1 rounded text-outline hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Session"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
