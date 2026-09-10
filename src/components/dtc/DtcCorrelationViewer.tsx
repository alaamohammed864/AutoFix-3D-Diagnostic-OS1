import React from 'react';
import { DtcCorrelation } from '../../db/dtcDatabase';
import { Language } from '../../types';

interface DtcCorrelationViewerProps {
  lang: Language;
  activeCodes: string[];
  correlations: DtcCorrelation[];
  onStartUnifiedDiagnosis: (correlation: DtcCorrelation) => void;
}

export const DtcCorrelationViewer: React.FC<DtcCorrelationViewerProps> = ({
  lang,
  activeCodes,
  correlations,
  onStartUnifiedDiagnosis,
}) => {
  if (activeCodes.length < 2) {
    return (
      <div className="bg-surface-container-low rounded-xl border border-white/5 p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-outline font-code-sm text-xs">
          <span className="material-symbols-outlined text-base text-secondary">hub</span>
          <span>
            {lang === 'ar'
              ? 'أدخل كودين أو أكثر لتفعيل محرك الترابط والتحليل السببي المشترك (مثل P0301 + P0171)'
              : 'Enter 2 or more fault codes to activate the Multi-DTC Correlation & Root-Cause Engine (e.g. P0301 + P0171)'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl border border-primary-container/30 p-5 relative overflow-hidden shadow-2xl space-y-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/10 rounded-bl-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary-container/20 border border-primary-container/40 text-primary-container">
            <span className="material-symbols-outlined text-lg">alt_route</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                {lang === 'ar' ? 'محرك الترابط السببي بين الأكواد (DTC Correlation Engine)' : 'DTC Correlation & Multi-Fault Engine'}
              </h4>
              <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-code-sm text-[10px] font-bold">
                {correlations.length > 0 ? `${correlations.length} Active Link(s)` : 'Independent Analysis'}
              </span>
            </div>
            <p className="font-body-sm text-xs text-outline">
              {lang === 'ar'
                ? 'تحليل الروابط الميكانيكية والكهربائية المشتركة لمنع استبدال قطع غير تالفة'
                : 'Identifies systemic causal relationships between active DTCs instead of treating faults independently'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-code-sm text-xs">
          <span className="text-outline">{lang === 'ar' ? 'الأكواد المحللة:' : 'Analyzing:'}</span>
          <div className="flex gap-1.5 flex-wrap">
            {activeCodes.map((code) => (
              <span
                key={code}
                className="px-2 py-0.5 rounded bg-surface-container-highest text-primary-container font-bold border border-primary-container/30"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Detected Correlations List */}
      {correlations.length > 0 ? (
        <div className="space-y-4 relative z-10">
          {correlations.map((corr, idx) => (
            <div
              key={idx}
              className="bg-surface-container-lowest rounded-xl p-4 border border-white/10 space-y-3 hover:border-primary-container/40 transition-colors"
            >
              {/* Correlation Title & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    {corr.codes.map((c, i) => (
                      <React.Fragment key={c}>
                        <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-code-sm text-xs font-bold">
                          {c}
                        </span>
                        {i < corr.codes.length - 1 && (
                          <span className="text-outline font-bold">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="font-headline-sm text-sm font-bold text-on-surface">
                    {lang === 'ar' ? corr.titleAr : corr.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-primary-container/20 text-primary-container border border-primary-container/40 font-code-sm text-xs font-bold">
                    {corr.correlationStrength}% {lang === 'ar' ? 'قوة الارتباط' : 'Correlation Match'}
                  </span>
                  <span className="px-2 py-1 rounded bg-surface-container-high text-secondary font-code-sm text-xs font-medium">
                    {corr.relationshipType}
                  </span>
                </div>
              </div>

              {/* Relationship Diagram / Arrow Flow */}
              <div className="p-3 rounded-lg bg-surface-container-low border border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-code-sm">
                <div className="flex-1 text-center md:text-start">
                  <span className="text-outline uppercase text-[10px] block font-bold">
                    {lang === 'ar' ? 'السبب الجذري الأولي (Root Trigger)' : 'Primary Root Trigger'}
                  </span>
                  <span className="text-error font-bold text-sm">{corr.primaryRootCause}</span>
                </div>

                <div className="flex items-center gap-2 text-primary-container px-2">
                  <span className="hidden md:inline font-bold">────────►</span>
                  <span className="material-symbols-outlined text-lg">sync_problem</span>
                  <span className="hidden md:inline font-bold">────────►</span>
                </div>

                <div className="flex-1 text-center md:text-end">
                  <span className="text-outline uppercase text-[10px] block font-bold">
                    {lang === 'ar' ? 'العطل المتولد كنتيجة (Consequential Flag)' : 'Consequential Fault Codes'}
                  </span>
                  <span className="text-secondary font-bold text-sm">
                    {corr.consequentialCodes.join(', ')}
                  </span>
                </div>
              </div>

              {/* Summary Explanation */}
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                {lang === 'ar' ? corr.summaryAr : corr.summary}
              </p>

              {/* Unified Diagnostic Checklist */}
              <div className="space-y-1.5">
                <span className="font-telemetry-label text-[11px] text-secondary uppercase tracking-wider block font-bold">
                  {lang === 'ar'
                    ? 'إجراءات الفحص الموحدة المقترحة لحل الكودين معاً:'
                    : 'Unified Diagnostic Roadmap (Solve Both Codes Concurrently):'}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {corr.unifiedDiagnosticProcedure.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2 rounded bg-surface-container-low border border-white/5 flex items-start gap-2 text-xs font-code-sm"
                    >
                      <span className="h-5 w-5 rounded-full bg-primary-container/30 text-primary-container flex items-center justify-center font-bold text-[10px] shrink-0">
                        {sIdx + 1}
                      </span>
                      <span className="text-on-surface">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Components Involved */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs font-code-sm">
                <span className="text-outline font-semibold">
                  {lang === 'ar' ? 'القطع المشتركة المعنية:' : 'Shared Components Involved:'}
                </span>
                {corr.sharedComponents.map((comp) => (
                  <span
                    key={comp}
                    className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface border border-white/10"
                  >
                    {comp}
                  </span>
                ))}
              </div>

              {/* Unified Launch CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onStartUnifiedDiagnosis(corr)}
                  className="w-full py-2.5 rounded-lg bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">account_tree</span>
                  <span>
                    {lang === 'ar'
                      ? `بدء شجرة التشخيص الموحدة للترابط (${corr.codes.join(' + ')})`
                      : `Launch Unified Root-Cause Tree for ${corr.codes.join(' + ')}`}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback when multiple codes have no direct shared failure root */
        <div className="bg-surface-container-lowest rounded-xl p-4 border border-white/10 space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-secondary font-code-sm text-xs font-bold">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>
              {lang === 'ar'
                ? 'الأكواد الحالية تنتمي إلى دوائر منفصلة كهربائياً'
                : 'Active codes reside on distinct functional circuits'}
            </span>
          </div>
          <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
            {lang === 'ar'
              ? 'لم يتم رصد تداخل سببي مباشر بين الأكواد المدخلة. ينصح ببدء الفحص بالأكواد ذات الأولوية الحرجة (أعطال شبكة CAN أو ميس فاير المحرك) قبل الانتقال لأعطال الهيكل.'
              : 'No direct cascade failure was detected between the input codes. We recommend diagnosing high-priority powertrain or network codes first before proceeding to secondary comfort or body faults.'}
          </p>
          <div className="flex gap-2">
            <div className="flex-1 p-2 rounded bg-surface-container-low text-xs font-code-sm text-outline border border-white/5">
              Priority 1: Powertrain (P0xxx)
            </div>
            <div className="flex-1 p-2 rounded bg-surface-container-low text-xs font-code-sm text-outline border border-white/5">
              Priority 2: Chassis (C0xxx)
            </div>
            <div className="flex-1 p-2 rounded bg-surface-container-low text-xs font-code-sm text-outline border border-white/5">
              Priority 3: Body & Restraints (B0xxx)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
