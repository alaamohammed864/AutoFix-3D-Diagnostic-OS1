import React, { useState, useMemo } from 'react';
import {
  CANONICAL_DTC_DATABASE,
  parseAndDecodeDtc,
  evaluateDtcCorrelations,
  DtcDetail,
  DtcCorrelation,
} from '../../db/dtcDatabase';
import { Language } from '../../types';
import { InteractiveEngineVisualizer } from './InteractiveEngineVisualizer';
import { DtcCorrelationViewer } from './DtcCorrelationViewer';

interface DtcModulePageProps {
  lang: Language;
  onStartDiagnosis: (initialSymptom: string, targetComponentId?: string) => void;
  onInspectIn3D?: (componentId: string) => void;
  onNavigateToRepair?: () => void;
}

export const DtcModulePage: React.FC<DtcModulePageProps> = ({
  lang,
  onStartDiagnosis,
  onInspectIn3D,
  onNavigateToRepair,
}) => {
  // Active entered codes state (default to user's example P0301 + P0171)
  const [activeCodes, setActiveCodes] = useState<string[]>(['P0301', 'P0171']);
  const [selectedCode, setSelectedCode] = useState<string>('P0301');
  const [inputCodeText, setInputCodeText] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Multi-code presets for rapid testing
  const presets = [
    { label: 'P0301 + P0171 (Lean Misfire Synergy)', codes: ['P0301', 'P0171'] },
    { label: 'P0300 + P0171 (Intake Vacuum Leak / Low Fuel)', codes: ['P0300', 'P0171'] },
    { label: 'P0420 + P0301 (Misfire Melts Catalyst)', codes: ['P0420', 'P0301'] },
    { label: 'P2187 + P0171 (Idle Vacuum Leak / EVAP)', codes: ['P2187', 'P0171'] },
    { label: 'U0100 + C0035 (CAN Bus Loss & ABS Speed)', codes: ['U0100', 'C0035'] },
    { label: 'B0001 (Driver Airbag Squib Circuit)', codes: ['B0001'] },
    { label: 'P3000 (HV Hybrid Battery Pack)', codes: ['P3000'] },
  ];

  // Decode the currently selected active code
  const currentDtc: DtcDetail = useMemo(() => {
    return parseAndDecodeDtc(selectedCode, lang);
  }, [selectedCode, lang]);

  // Compute multi-code correlations
  const correlations: DtcCorrelation[] = useMemo(() => {
    return evaluateDtcCorrelations(activeCodes);
  }, [activeCodes]);

  // Add new code from input
  const handleAddCode = (rawCode: string) => {
    const trimmed = rawCode.trim().toUpperCase();
    if (!trimmed) return;

    // Handle comma or space separated input
    const parts = trimmed
      .split(/[\s,]+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 3);

    setActiveCodes((prev) => {
      const next = [...prev];
      for (const p of parts) {
        if (!next.includes(p)) {
          next.push(p);
        }
      }
      return next;
    });

    if (parts.length > 0) {
      setSelectedCode(parts[0]);
    }
    setInputCodeText('');
  };

  const handleRemoveCode = (codeToRemove: string) => {
    setActiveCodes((prev) => {
      const next = prev.filter((c) => c !== codeToRemove);
      if (selectedCode === codeToRemove && next.length > 0) {
        setSelectedCode(next[0]);
      }
      return next;
    });
  };

  const handleSelectPreset = (presetCodes: string[]) => {
    setActiveCodes(presetCodes);
    setSelectedCode(presetCodes[0]);
  };

  // Launch diagnostic flow with exact DTC context
  const handleTriggerDiagnosis = () => {
    const symptomQuery = `${currentDtc.code} - ${currentDtc.description} (${currentDtc.possibleCauses[0]?.name || 'Fault'})`;
    onStartDiagnosis(symptomQuery, currentDtc.targetComponentId);
  };

  const handleStartUnifiedDiagnosis = (correlation: DtcCorrelation) => {
    const symptomQuery = `Correlated: ${correlation.codes.join(' + ')} - ${correlation.title} (${correlation.primaryRootCause})`;
    onStartDiagnosis(symptomQuery, currentDtc.targetComponentId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner & DTC Input Station */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-white/5 relative overflow-hidden shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-error-container/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-high text-primary-container font-code-sm text-[11px] tracking-widest uppercase border border-primary-container/20 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-container animate-pulse" />
                <span>OBD-II / DTC Diagnostic Suite & Correlation Engine</span>
              </div>
              <h2 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">
                {lang === 'ar' ? 'فاحص الأكواد الذكي ومحرك الترابط التشخيصي' : 'OBD-II / DTC Explorer & Fault Correlation'}
              </h2>
              <p className="font-body-md text-sm text-on-surface-variant max-w-2xl">
                {lang === 'ar'
                  ? 'دعم شامل للأكواد القياسية والخاصة (P0000-P3999) وأكواد الهيكل B والشاسيه C والشبكة U مع ربط سببي متقدم ومعاينة تفاعلية للمحرك.'
                  : 'Full support for P0000-P3999, B-codes, C-codes, and U-codes with real-time cylinder visualization and multi-DTC correlation analysis.'}
              </p>
            </div>

            {/* Quick Code Input Field */}
            <div className="w-full md:w-auto md:min-w-[340px] space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddCode(inputCodeText);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                    search
                  </span>
                  <input
                    type="text"
                    value={inputCodeText}
                    onChange={(e) => setInputCodeText(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل كوداً (مثل P0301 أو عدة أكواد)...' : 'Enter DTC (e.g. P0301, P0171)...'}
                    className="w-full bg-surface-container-lowest text-on-surface pl-9 pr-3 py-2 rounded-lg border border-white/10 font-code-sm text-xs uppercase focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold rounded-lg transition-all shadow-md shrink-0 cursor-pointer"
                >
                  {lang === 'ar' ? 'إضافة كود' : 'Add Code'}
                </button>
              </form>

              <div className="flex items-center justify-between text-[11px] font-code-sm text-outline px-1">
                <span>Supports: P0xxx, P1xxx, P2xxx, P3xxx, B, C, U</span>
                <span className="text-secondary font-bold">{activeCodes.length} Active</span>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-code-sm text-outline whitespace-nowrap">
              {lang === 'ar' ? 'سيناريوهات شائعة:' : 'Correlation Scenarios:'}
            </span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.codes)}
                className="px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-primary-container text-xs font-code-sm font-medium border border-white/5 whitespace-nowrap transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Active Codes Chip Bar */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs font-code-sm text-outline">
              {lang === 'ar' ? 'الأكواد النشطة في الفحص:' : 'Active Diagnostic Codes:'}
            </span>
            {activeCodes.map((code) => {
              const isSelected = code === selectedCode;
              return (
                <div
                  key={code}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-code-sm text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-error-container text-on-error-container border-error shadow-[0_0_12px_rgba(255,84,73,0.3)]'
                      : 'bg-surface-container-high text-on-surface hover:border-white/20 border-white/5'
                  }`}
                  onClick={() => setSelectedCode(code)}
                >
                  <span>{code}</span>
                  {activeCodes.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCode(code);
                      }}
                      className="hover:text-error text-outline p-0.5 rounded transition-colors"
                      title="Remove code"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MULTI-DTC CORRELATION ENGINE PANEL */}
      {activeCodes.length >= 2 && (
        <DtcCorrelationViewer
          lang={lang}
          activeCodes={activeCodes}
          correlations={correlations}
          onStartUnifiedDiagnosis={handleStartUnifiedDiagnosis}
        />
      )}

      {/* DEDICATED DTC PAGE AS REQUESTED */}
      <div className="space-y-6">
        {/* Main DTC Summary Card (Code, Description, System, "Start Diagnosis" CTA) */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-error-container/15 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-display-lg text-3xl md:text-4xl text-error font-extrabold tracking-tight">
                  {currentDtc.code}
                </span>
                <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-code-sm text-xs font-bold uppercase tracking-wider">
                  {currentDtc.milStatus}
                </span>
                <span className="px-2.5 py-1 rounded bg-surface-container-high text-secondary font-code-sm text-xs font-semibold">
                  {currentDtc.standardType}
                </span>
                <span className="px-2.5 py-1 rounded bg-surface-container-high text-outline font-code-sm text-xs">
                  Category: {currentDtc.category}
                </span>
              </div>

              <h3 className="font-headline-lg text-xl md:text-2xl font-bold text-on-surface">
                {lang === 'ar' ? currentDtc.descriptionAr : currentDtc.description}
              </h3>

              <div className="flex items-center gap-4 text-xs font-code-sm pt-1 text-on-surface-variant flex-wrap">
                <div>
                  <span className="text-outline">{lang === 'ar' ? 'المنظومة الرئيسية: ' : 'System: '}</span>
                  <span className="text-primary-container font-bold">
                    {lang === 'ar' ? currentDtc.systemAr : currentDtc.system}
                  </span>
                </div>
                <span>•</span>
                <div>
                  <span className="text-outline">{lang === 'ar' ? 'المنظومة الفرعية: ' : 'Subsystem: '}</span>
                  <span className="text-on-surface font-semibold">{currentDtc.subsystem}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: "Start Diagnosis" & "Inspect in 3D" */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleTriggerDiagnosis}
                className="px-6 py-3.5 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-sm font-extrabold transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">account_tree</span>
                <span>{lang === 'ar' ? 'بدء التشخيص (Start Diagnosis)' : 'Start Diagnosis'}</span>
              </button>

              {currentDtc.targetComponentId && onInspectIn3D && (
                <button
                  type="button"
                  onClick={() => onInspectIn3D(currentDtc.targetComponentId!)}
                  className="px-5 py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-secondary font-code-sm text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">view_in_ar</span>
                  <span>{lang === 'ar' ? 'معاينة في مجسم 3D' : 'Inspect in 3D CAD'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* INTERACTIVE ENGINE VISUALIZATION (Requested in prompt) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-telemetry-label text-xs text-primary-container uppercase tracking-wider font-bold">
              {lang === 'ar' ? 'المعاينة التفاعلية للمحرك والأسطوانات' : 'Interactive Engine Visualization'}
            </span>
            <span className="font-code-sm text-xs text-outline">
              {currentDtc.highlightCylinder ? `Active Cylinder: #${currentDtc.highlightCylinder}` : 'System View'}
            </span>
          </div>

          <InteractiveEngineVisualizer
            lang={lang}
            highlightCylinder={currentDtc.highlightCylinder || 1}
            highlightBank={currentDtc.highlightBank || 1}
            dtcCode={currentDtc.code}
            onSelectComponentForDiagnosis={(part) => {
              onStartDiagnosis(`${currentDtc.code} ${part} test`, currentDtc.targetComponentId);
            }}
          />
        </section>

        {/* 2-COLUMN DETAILED DIAGNOSTIC BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Possible Causes & Symptoms (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. POSSIBLE CAUSES (Requested) */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-base">checklist</span>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wide">
                    {lang === 'ar' ? 'الأسباب المحتملة (Possible Causes)' : 'Possible Causes'}
                  </h4>
                </div>
                <span className="text-xs font-code-sm text-outline">Sorted by Likelihood</span>
              </div>

              <div className="space-y-2.5">
                {currentDtc.possibleCauses.map((cause, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 flex items-center justify-between gap-3 hover:border-primary-container/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-code-sm font-bold bg-surface-container-high text-secondary">
                          {cause.category}
                        </span>
                        <span className="text-xs font-body-md font-semibold text-on-surface">
                          {lang === 'ar' ? cause.nameAr : cause.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 bg-surface-container-high rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary-container h-full rounded-full"
                          style={{ width: `${cause.probability}%` }}
                        />
                      </div>
                      <span className="font-code-sm text-xs font-bold text-primary-container w-9 text-right">
                        {cause.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SYMPTOMS (Requested) */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-base">warning</span>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wide">
                    {lang === 'ar' ? 'الأعراض المرافقة (Symptoms)' : 'Symptoms'}
                  </h4>
                </div>
                <span className="text-xs font-code-sm text-outline">{currentDtc.symptoms.length} Manifestations</span>
              </div>

              <div className="space-y-2">
                {currentDtc.symptoms.map((symptom, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-error shrink-0" />
                      <span className="text-xs font-body-md text-on-surface">
                        {lang === 'ar' ? symptom.titleAr : symptom.title}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-code-sm font-bold uppercase ${
                        symptom.impact === 'Critical'
                          ? 'bg-error-container text-on-error-container'
                          : symptom.impact === 'High'
                          ? 'bg-error/20 text-error'
                          : 'bg-surface-container-high text-outline'
                      }`}
                    >
                      {symptom.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. FREEZE FRAME SNAPSHOT TELEMETRY */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">camera</span>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wide">
                    {lang === 'ar' ? 'بيانات إطار التجميد (Freeze Frame Matrix)' : 'Freeze Frame Snapshot Matrix'}
                  </h4>
                </div>
                <span className="text-xs font-code-sm text-outline">Trigger Frame #1</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-code-sm">
                <div className="flex justify-between bg-surface-container-lowest p-2 rounded border border-white/5">
                  <span className="text-outline">Engine RPM:</span>
                  <span className="text-on-surface font-semibold">{currentDtc.freezeFrameTemplate.rpm}</span>
                </div>
                <div className="flex justify-between bg-surface-container-lowest p-2 rounded border border-white/5">
                  <span className="text-outline">Engine Load:</span>
                  <span className="text-on-surface font-semibold">{currentDtc.freezeFrameTemplate.engineLoad}</span>
                </div>
                <div className="flex justify-between bg-surface-container-lowest p-2 rounded border border-white/5">
                  <span className="text-outline">Coolant Temp:</span>
                  <span className="text-on-surface font-semibold">{currentDtc.freezeFrameTemplate.coolantTemp}</span>
                </div>
                <div className="flex justify-between bg-surface-container-lowest p-2 rounded border border-white/5">
                  <span className="text-outline">STFT Bank 1:</span>
                  <span className="text-error font-bold">{currentDtc.freezeFrameTemplate.stft}</span>
                </div>
                <div className="flex justify-between bg-surface-container-lowest p-2 rounded border border-white/5">
                  <span className="text-outline">LTFT Bank 1:</span>
                  <span className="text-error font-bold">{currentDtc.freezeFrameTemplate.ltft}</span>
                </div>
                <div className="flex justify-between bg-surface-container-lowest p-2 rounded border border-white/5">
                  <span className="text-outline">Fuel Pressure:</span>
                  <span className="text-secondary font-semibold">{currentDtc.freezeFrameTemplate.fuelPressure}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Diagnostic Steps, Affected Components, Recommended Checks, Repair References (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* 4. DIAGNOSTIC STEPS (Requested) */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-base">format_list_numbered</span>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wide">
                    {lang === 'ar' ? 'خطوات الفحص التشخيصي (Diagnostic Steps)' : 'Diagnostic Steps'}
                  </h4>
                </div>
                <span className="text-xs font-code-sm text-outline">{currentDtc.diagnosticSteps.length} Sequential Steps</span>
              </div>

              <div className="space-y-3">
                {currentDtc.diagnosticSteps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-3.5 rounded-lg bg-surface-container-lowest border border-white/5 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary-container/20 text-primary-container font-code-sm text-xs font-bold flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <h5 className="font-code-sm text-xs font-bold text-on-surface">
                          {lang === 'ar' ? step.titleAr : step.title}
                        </h5>
                      </div>
                    </div>

                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed pl-8">
                      {step.action}
                    </p>

                    <div className="bg-surface-container-low/70 p-2 rounded ml-8 space-y-1 text-[11px] font-code-sm border border-white/5">
                      <div className="flex items-start gap-1.5">
                        <span className="text-secondary font-semibold shrink-0">Expected Result:</span>
                        <span className="text-on-surface">{step.expectedResult}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-outline shrink-0">Tools:</span>
                        <span className="text-outline-variant">{step.toolsNeeded}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. COMMON AFFECTED COMPONENTS (Requested) */}
            <div className="bg-surface-container-low rounded-xl p-5 border border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-base">build_circle</span>
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface uppercase tracking-wide">
                    {lang === 'ar' ? 'القطع المتأثرة الشائعة (Common Affected Components)' : 'Common Affected Components'}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentDtc.commonAffectedComponents.map((comp, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-body-md text-xs font-bold text-on-surface">
                        {comp.name}
                      </span>
                      <span className="font-code-sm text-xs text-secondary font-bold shrink-0">
                        {comp.estCost}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-code-sm text-outline">
                      <span>OEM: {comp.oemPartNumber}</span>
                      <span className="text-primary-container">{comp.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. RECOMMENDED CHECKS & 7. REPAIR REFERENCES (Requested) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recommended Checks */}
              <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                  <span className="material-symbols-outlined text-tertiary text-base">flaky</span>
                  <h4 className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wide">
                    {lang === 'ar' ? 'الفحوصات الموصى بها' : 'Recommended Checks'}
                  </h4>
                </div>

                <div className="space-y-2">
                  {currentDtc.recommendedChecks.map((check, idx) => (
                    <div key={idx} className="bg-surface-container-lowest p-2 rounded text-xs font-code-sm border border-white/5 space-y-0.5">
                      <div className="text-on-surface font-medium">{check.testName}</div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-outline">PID: {check.sensorPid}</span>
                        <span className="text-secondary font-semibold">{check.specValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repair References */}
              <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-white/5">
                  <span className="material-symbols-outlined text-primary-container text-base">menu_book</span>
                  <h4 className="font-headline-sm text-xs font-bold text-on-surface uppercase tracking-wide">
                    {lang === 'ar' ? 'المراجع الفنية وكتيبات الصانع' : 'Repair References'}
                  </h4>
                </div>

                <div className="space-y-2">
                  {currentDtc.repairReferences.map((ref, idx) => (
                    <div key={idx} className="bg-surface-container-lowest p-2 rounded text-xs font-code-sm border border-white/5 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.2 rounded bg-surface-container-high text-primary-container text-[10px] font-bold">
                          {ref.type}
                        </span>
                        <span className="text-outline text-[10px]">{ref.referenceCode}</span>
                      </div>
                      <p className="text-on-surface-variant text-[11px] leading-tight">
                        {ref.title}
                      </p>
                    </div>
                  ))}
                </div>

                {onNavigateToRepair && (
                  <button
                    type="button"
                    onClick={onNavigateToRepair}
                    className="w-full py-2 px-3 rounded-lg bg-primary-container/15 hover:bg-primary-container/25 border border-primary-container/30 text-primary-container text-xs font-code-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">menu_book</span>
                    <span>{lang === 'ar' ? 'فتح مركز الإصلاح المعتمد' : 'Open Repair Procedures'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
