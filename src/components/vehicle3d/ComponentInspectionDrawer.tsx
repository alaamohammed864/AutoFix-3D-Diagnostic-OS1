import React, { useState } from 'react';
import { ComponentDetail, AUTOMOTIVE_COMPONENTS } from '../../db/componentDatabase';
import { Language } from '../../types';

interface ComponentInspectionDrawerProps {
  component: ComponentDetail | null;
  onClose: () => void;
  onSelectRelated: (componentId: string) => void;
  lang: Language;
}

export const ComponentInspectionDrawer: React.FC<ComponentInspectionDrawerProps> = ({
  component,
  onClose,
  onSelectRelated,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnostics' | 'repair' | 'tools'>(
    'overview'
  );

  if (!component) return null;

  const relatedComponents = component.relatedComponentIds
    .map((id) => AUTOMOTIVE_COMPONENTS[id])
    .filter(Boolean);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] lg:w-[460px] bg-surface-container-lowest/95 backdrop-blur-xl border-s border-white/10 shadow-2xl z-30 flex flex-col text-on-surface animate-in slide-in-from-right duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-surface-container-low/60 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30 text-[10px] font-code-sm font-bold uppercase tracking-wider">
              {component.system}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline text-[10px] font-code-sm">
              {component.subsystem}
            </span>
          </div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">precision_manufacturing</span>
            {component.name}
          </h3>
          <p className="text-xs text-outline flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">pin_drop</span>
            <span>{component.location}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
          title="Close"
          type="button"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-surface-container-low/40 px-3 pt-2 gap-1 overflow-x-auto text-xs font-code-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          {lang === 'ar' ? 'الوظيفة والمواصفات' : 'Function & Specs'}
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-3 py-2 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'diagnostics'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          {lang === 'ar' ? 'الأعطال والتشخيص' : 'Failures & Testing'}
        </button>
        <button
          onClick={() => setActiveTab('repair')}
          className={`px-3 py-2 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'repair'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          {lang === 'ar' ? 'الصيانة والاستبدال' : 'Maintenance & Repair'}
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-3 py-2 border-b-2 font-bold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'tools'
              ? 'border-primary-container text-primary-container'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          {lang === 'ar' ? 'القطع والأدوات' : 'Tools & Parts'}
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-body-md leading-relaxed">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Function Statement */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 space-y-1.5">
              <h4 className="font-code-sm text-[11px] font-bold text-primary-container uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">settings_suggest</span>
                {lang === 'ar' ? 'الوظيفة الهندسية الأساسية' : 'Engineering Function'}
              </h4>
              <p className="text-on-surface-variant text-xs">{component.functionDesc}</p>
            </div>

            {/* Quick Specs Grid if available */}
            {component.specs && component.specs.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-code-sm text-[11px] font-bold text-outline uppercase tracking-wider">
                  {lang === 'ar' ? 'المواصفات الفنية المعتمدة' : 'OEM Technical Specifications'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {component.specs.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-container border border-white/5 flex flex-col"
                    >
                      <span className="text-[10px] font-code-sm text-outline uppercase">{sp.label}</span>
                      <span className="font-code-sm font-bold text-on-surface text-xs mt-0.5">
                        {sp.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Warnings */}
            {component.safetyWarnings && component.safetyWarnings.length > 0 && (
              <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-on-error-container space-y-1.5">
                <div className="flex items-center gap-1.5 text-error font-bold text-xs">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>{lang === 'ar' ? 'تحذيرات السلامة المهنية' : 'Safety Warnings & Precautions'}</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-on-surface-variant">
                  {component.safetyWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Components Highlight Trigger */}
            {relatedComponents.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="font-code-sm text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center justify-between">
                  <span>{lang === 'ar' ? 'مكونات متصلة (تمييز ثانوي)' : 'Related Components (Secondary Highlight)'}</span>
                  <span className="text-[10px] text-outline">{relatedComponents.length} connected</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {relatedComponents.map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => onSelectRelated(rel.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/25 text-xs font-code-sm transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">hub</span>
                      <span>{rel.name.split('(')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="space-y-4">
            {/* Symptoms */}
            <div className="space-y-2">
              <h4 className="font-code-sm text-[11px] font-bold text-error uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">symptoms</span>
                {lang === 'ar' ? 'الأعراض وعلامات التحذير' : 'Observable Symptoms & Warnings'}
              </h4>
              <ul className="space-y-1.5">
                {component.symptoms.map((symp, i) => (
                  <li
                    key={i}
                    className="p-2 rounded-lg bg-surface-container-low border border-white/5 text-on-surface-variant flex items-start gap-2"
                  >
                    <span className="material-symbols-outlined text-xs text-error mt-0.5">report_problem</span>
                    <span>{symp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Failure Modes */}
            <div className="space-y-2">
              <h4 className="font-code-sm text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">dangerous</span>
                {lang === 'ar' ? 'أنماط الأعطال الشائعة' : 'Common Failure Modes'}
              </h4>
              <ul className="space-y-1.5">
                {component.commonFailures.map((fail, i) => (
                  <li
                    key={i}
                    className="p-2 rounded-lg bg-surface-container border border-white/5 text-on-surface-variant flex items-start gap-2"
                  >
                    <span className="material-symbols-outlined text-xs text-primary-container mt-0.5">
                      brightness_empty
                    </span>
                    <span>{fail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testing Procedures */}
            <div className="space-y-2">
              <h4 className="font-code-sm text-[11px] font-bold text-primary-container uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">biotech</span>
                {lang === 'ar' ? 'إجراءات الفحص والقياس' : 'Diagnostic Testing & Validation'}
              </h4>
              <ol className="space-y-2">
                {component.diagnosticProcedures.map((proc, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-lg bg-surface-container-high/60 border border-white/5 text-on-surface flex items-start gap-2.5"
                  >
                    <span className="h-5 w-5 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-xs leading-relaxed">{proc}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'repair' && (
          <div className="space-y-4">
            {/* Maintenance Rules */}
            <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 space-y-1.5">
              <h4 className="font-code-sm text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">event_repeat</span>
                {lang === 'ar' ? 'جداول الصيانة الوقائية' : 'Scheduled Maintenance Interval'}
              </h4>
              <p className="text-on-surface-variant text-xs">{component.maintenance}</p>
            </div>

            {/* Step-by-Step Replacement Procedures */}
            <div className="space-y-2">
              <h4 className="font-code-sm text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">build</span>
                {lang === 'ar' ? 'خطوات فك وتركيب القطعة' : 'Removal & Replacement Procedures'}
              </h4>
              <div className="space-y-2">
                {component.repairProcedures.map((step, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-surface-container border border-white/5 flex items-start gap-3"
                  >
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary-container font-code-sm font-bold text-[10px] shrink-0 mt-0.5">
                      STEP {i + 1}
                    </span>
                    <p className="text-xs text-on-surface leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-4">
            {/* Required Tools */}
            <div className="space-y-2">
              <h4 className="font-code-sm text-[11px] font-bold text-primary-container uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">handyman</span>
                {lang === 'ar' ? 'الأدوات والمعدات المطلوبة' : 'Required Workshop Tools'}
              </h4>
              <div className="grid grid-cols-1 gap-1.5">
                {component.requiredTools.map((tool, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-surface-container border border-white/5 flex items-center gap-2.5 text-xs text-on-surface font-code-sm"
                  >
                    <span className="material-symbols-outlined text-secondary text-sm">construction</span>
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related OEM Parts */}
            <div className="space-y-2">
              <h4 className="font-code-sm text-[11px] font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                {lang === 'ar' ? 'أرقام قطع الغيار الأصلية OEM' : 'OEM Related Parts Catalog'}
              </h4>
              <div className="space-y-2">
                {component.relatedParts.map((part, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-on-surface text-xs">{part.name}</div>
                      <div className="font-code-sm text-[10px] text-outline">
                        OEM: <span className="text-primary-container font-semibold">{part.oemNumber}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-surface-container font-code-sm text-secondary font-bold text-xs">
                      {part.avgCost}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Quick Jump */}
      <div className="p-3 border-t border-white/10 bg-surface-container-lowest flex items-center justify-between text-xs font-code-sm">
        <span className="text-outline">AutoFix 3D Visualizer</span>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors cursor-pointer"
        >
          {lang === 'ar' ? 'إغلاق المعاينة' : 'Dismiss Panel'}
        </button>
      </div>
    </div>
  );
};
