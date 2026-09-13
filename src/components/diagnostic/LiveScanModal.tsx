// AutoFix 3D - Full Vehicle Diagnostic Scanner Modal
// 9-Stage Progressive Diagnostic Sweep with Live ISO 15765-4 Simulation

import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';
import { DiagnosticSessionReport } from '../../simulation/types';

interface LiveScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onViewFullReport?: (report: DiagnosticSessionReport) => void;
}

export const LiveScanModal: React.FC<LiveScanModalProps> = ({
  isOpen,
  onClose,
  lang,
  onViewFullReport,
}) => {
  const { executeFullVehicleScan, activeDtcs, healthScore } = useSimulation();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentStageName, setCurrentStageName] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<DiagnosticSessionReport | null>(null);

  const startScan = () => {
    setIsScanning(true);
    setCurrentStep(1);
    setProgressPct(0);
    setGeneratedReport(null);

    executeFullVehicleScan(
      (step, stageName, pct) => {
        setCurrentStep(step);
        setCurrentStageName(stageName);
        setProgressPct(pct);
      },
      (report) => {
        setIsScanning(false);
        setGeneratedReport(report);
      }
    );
  };

  useEffect(() => {
    if (isOpen && !isScanning && !generatedReport) {
      startScan();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isArabic = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="relative w-full max-w-2xl rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl overflow-hidden flex flex-col text-on-surface max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-surface-container-low/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
              <span className="material-symbols-outlined text-2xl animate-pulse">radar</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                {isArabic ? 'ماسح تشخيص المركبة المباشر' : 'Live Vehicle Diagnostic Scanner'}
              </h2>
              <p className="text-xs text-outline flex items-center gap-2">
                <span>ISO 15765-4 CAN (CAN-FD)</span>
                <span>•</span>
                <span className="text-secondary font-medium">
                  {isArabic ? 'محاكاة تشخيصية حية' : 'Simulated Diagnostic Interface'}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Hardware Notice Banner */}
          <div className="p-3 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-start gap-3 text-xs">
            <span className="material-symbols-outlined text-primary-container text-base mt-0.5">info</span>
            <div className="space-y-1">
              <span className="font-bold text-primary-container">
                {isArabic ? 'نظام المحاكاة الهندسية النشط' : 'Active Engineering Simulation Engine'}
              </span>
              <p className="text-on-surface-variant leading-relaxed">
                {isArabic
                  ? 'يتم توليد إشارات الحساسات وبروتوكولات CAN-Bus وحسابات الأعطال عبر محرك محاكاة داخلي مطابق للمواصفات القياسية OBD-II لضمان استجابة تشخيصية تفاعلية واقعية.'
                  : 'Sensors, CAN-Bus frames, and DTC evaluation are continuously computed by an internal automotive simulation engine adhering to standard OBD-II protocols.'}
              </p>
            </div>
          </div>

          {/* Progress Bar & Current Stage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-code-sm">
              <span className="text-outline font-bold flex items-center gap-1.5">
                {isScanning && <span className="h-2 w-2 rounded-full bg-primary-container animate-ping"></span>}
                {isScanning
                  ? `${isArabic ? 'المرحلة' : 'Stage'} ${currentStep}/9: ${currentStageName}`
                  : isArabic
                  ? 'اكتمل الفحص التشخيصي بنجاح'
                  : 'Diagnostic Scan Completed'}
              </span>
              <span className="font-bold text-primary-container">{progressPct}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-primary-container to-secondary transition-all duration-300 shadow-sm"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Scan Steps Visual Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 1, name: isArabic ? 'الاتصال' : 'OBD Connect' },
              { id: 2, name: isArabic ? 'تهيئة CAN-FD' : 'ISO 15765 Init' },
              { id: 3, name: isArabic ? 'وحدات ECU' : 'ECU Discovery' },
              { id: 4, name: isArabic ? 'جهد الشبكة' : 'Bus Voltage' },
              { id: 5, name: isArabic ? 'البرمجيات' : 'Firmware Scan' },
              { id: 6, name: isArabic ? 'أكواد الأعطال' : 'DTC Sweep' },
              { id: 7, name: isArabic ? 'الإشارات الحية' : 'Live Streams' },
              { id: 8, name: isArabic ? 'تحليل الصحة' : 'Health Score' },
              { id: 9, name: isArabic ? 'التقرير النهائي' : 'Report Build' },
            ].map((stg) => {
              const isDone = currentStep > stg.id || (!isScanning && generatedReport);
              const isCurrent = currentStep === stg.id && isScanning;

              return (
                <div
                  key={stg.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isCurrent
                      ? 'bg-primary-container/20 border-primary-container text-primary-container font-bold shadow-md animate-pulse'
                      : 'bg-surface-container border-white/5 text-outline opacity-60'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isDone ? 'check_circle' : isCurrent ? 'hourglass_top' : 'radio_button_unchecked'}
                  </span>
                  <span className="truncate">{stg.name}</span>
                </div>
              );
            })}
          </div>

          {/* Scan Results Summary (When Finished) */}
          {generatedReport && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">verified</span>
                  <span className="font-bold text-sm text-on-surface">
                    {isArabic ? 'نتائج الفحص المعتمد' : 'Verified Scan Results'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-code-sm font-bold">
                  <span className="text-outline">{isArabic ? 'كفاءة المركبة:' : 'Health Score:'}</span>
                  <span
                    className={
                      healthScore.overallScore > 80
                        ? 'text-emerald-400'
                        : healthScore.overallScore > 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }
                  >
                    {healthScore.overallScore}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-code-sm">
                <div className="p-2 rounded-lg bg-surface-container border border-white/5">
                  <span className="text-outline block text-[10px]">
                    {isArabic ? 'أكواد مؤكدة' : 'Confirmed DTCs'}
                  </span>
                  <span className="font-bold text-rose-400 text-sm">{activeDtcs.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container border border-white/5">
                  <span className="text-outline block text-[10px]">
                    {isArabic ? 'أكواد معلقة' : 'Pending DTCs'}
                  </span>
                  <span className="font-bold text-amber-400 text-sm">
                    {generatedReport.pendingDtcs.length}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container border border-white/5">
                  <span className="text-outline block text-[10px]">
                    {isArabic ? 'وحدات متصلة' : 'ECUs Online'}
                  </span>
                  <span className="font-bold text-cyan-400 text-sm">7 / 7</span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container border border-white/5">
                  <span className="text-outline block text-[10px]">
                    {isArabic ? 'جهد البطارية' : 'Bus Voltage'}
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">14.2 V</span>
                </div>
              </div>

              {/* Active DTC Badges */}
              {activeDtcs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-outline">
                    {isArabic ? 'الأعطال النشطة المكتشفة:' : 'Detected Fault Codes:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDtcs.map((code) => (
                      <span
                        key={code}
                        className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-code-sm font-bold flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">warning</span>
                        {code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-surface-container-low/60 flex items-center justify-between gap-3">
          <button
            onClick={startScan}
            disabled={isScanning}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs font-bold text-on-surface transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-sm ${isScanning ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>{isArabic ? 'إعادة الفحص' : 'Re-run Scan'}</span>
          </button>

          <div className="flex items-center gap-2">
            {generatedReport && onViewFullReport && (
              <button
                onClick={() => {
                  onClose();
                  onViewFullReport(generatedReport);
                }}
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">description</span>
                <span>{isArabic ? 'عرض التقرير الكامل' : 'View Full Report'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
