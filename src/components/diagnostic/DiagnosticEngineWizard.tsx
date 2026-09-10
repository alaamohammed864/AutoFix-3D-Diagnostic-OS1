import React, { useState } from 'react';
import { Language, VehicleSpec } from '../../types';
import {
  DiagnosticTreeNode,
  DiagnosticConclusion,
  TestExecutionRecord,
  DiagnosticReportData,
  SYMPTOM_CATALOG,
  DIAGNOSTIC_TREE_NODES,
  DIAGNOSTIC_CONCLUSIONS,
  findOrCreateSymptomTree,
  get3DComponentIdForConclusion,
  PROFESSIONAL_DISCLAIMER,
  SymptomDefinition,
} from '../../db/diagnosticEngineData';
import { DiagnosticReportView } from './DiagnosticReportView';
import confetti from 'canvas-confetti';

interface DiagnosticEngineWizardProps {
  lang: Language;
  currentVehicle: VehicleSpec;
  isOpen: boolean;
  onClose: () => void;
  onInspectIn3D?: (componentId: string) => void;
  initialSymptom?: string;
}

export const DiagnosticEngineWizard: React.FC<DiagnosticEngineWizardProps> = ({
  lang,
  currentVehicle,
  isOpen,
  onClose,
  onInspectIn3D,
  initialSymptom,
}) => {
  const isAr = lang === 'ar';

  // Phase: 'symptom-input' | 'decision-tree' | 'conclusion-summary'
  const [phase, setPhase] = useState<'symptom-input' | 'decision-tree' | 'conclusion-summary'>(
    initialSymptom ? 'decision-tree' : 'symptom-input'
  );

  // Symptom input state
  const [symptomInput, setSymptomInput] = useState(initialSymptom || 'Engine cranks but doesn\'t start');
  const [activeSymptomDef, setActiveSymptomDef] = useState<SymptomDefinition>(
    findOrCreateSymptomTree(initialSymptom || 'Engine cranks but doesn\'t start', lang)
  );

  // Active Decision Tree State
  const [currentNodeId, setCurrentNodeId] = useState<string>('node-starter-crank');
  const [testHistory, setTestHistory] = useState<TestExecutionRecord[]>([]);
  const [nodeHistory, setNodeHistory] = useState<string[]>([]);
  const [finalConclusion, setFinalConclusion] = useState<DiagnosticConclusion | null>(null);

  // Full Report View state
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentNode: DiagnosticTreeNode | undefined = DIAGNOSTIC_TREE_NODES[currentNodeId];

  // Start diagnosis with selected symptom
  const handleStartDiagnosis = (symptomQuery: string) => {
    const symDef = findOrCreateSymptomTree(symptomQuery, lang);
    setActiveSymptomDef(symDef);
    setSymptomInput(symDef.title);
    setCurrentNodeId(symDef.rootNodeId);
    setTestHistory([]);
    setNodeHistory([]);
    setFinalConclusion(null);
    setPhase('decision-tree');
  };

  // Handle user decision on a tree node
  const handleSelectOption = (option: any) => {
    if (!currentNode) return;

    // Record test execution
    const record: TestExecutionRecord = {
      question: isAr ? currentNode.questionAr : currentNode.question,
      system: isAr ? currentNode.systemAr : currentNode.system,
      component: currentNode.targetComponent,
      expected: isAr ? currentNode.expectedResultAr : currentNode.expectedResult,
      actual: isAr ? option.labelAr : option.label,
      result: option.resultType,
      timestamp: new Date().toLocaleTimeString(),
    };

    const nextHistory = [...testHistory, record];
    setTestHistory(nextHistory);
    setNodeHistory([...nodeHistory, currentNodeId]);

    // If conclusion reached
    if (option.isConclusion && option.conclusionId) {
      const conclusion = DIAGNOSTIC_CONCLUSIONS[option.conclusionId] || DIAGNOSTIC_CONCLUSIONS['concl-dead-battery'];
      setFinalConclusion(conclusion);
      setPhase('conclusion-summary');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else if (option.nextNodeId && DIAGNOSTIC_TREE_NODES[option.nextNodeId]) {
      setCurrentNodeId(option.nextNodeId);
    } else {
      // Fallback conclusion
      const fallbackConcl = DIAGNOSTIC_CONCLUSIONS['concl-dead-battery'];
      setFinalConclusion(fallbackConcl);
      setPhase('conclusion-summary');
    }
  };

  // Step back / Undo last decision
  const handleStepBack = () => {
    if (nodeHistory.length === 0) {
      setPhase('symptom-input');
      return;
    }
    const previousNodeId = nodeHistory[nodeHistory.length - 1];
    setCurrentNodeId(previousNodeId);
    setNodeHistory(nodeHistory.slice(0, -1));
    setTestHistory(testHistory.slice(0, -1));
    setFinalConclusion(null);
    setPhase('decision-tree');
  };

  // Build Diagnostic Report Data
  const generateReportData = (): DiagnosticReportData => {
    const concl = finalConclusion || DIAGNOSTIC_CONCLUSIONS['concl-dead-battery'];
    return {
      reportId: `DIAG-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      vehicle: {
        make: currentVehicle.make,
        model: currentVehicle.model,
        year: currentVehicle.year,
        vin: currentVehicle.vin,
        engine: currentVehicle.powertrain,
        transmission: currentVehicle.gearbox,
      },
      symptom: isAr ? activeSymptomDef.titleAr : activeSymptomDef.title,
      possibleSystems: activeSymptomDef.possibleSystems,
      possibleComponents: activeSymptomDef.possibleComponents,
      testsPerformed: testHistory,
      conclusion: concl,
      confidence: concl.confidenceScore,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-container text-on-primary-container shadow-md">
              <span className="material-symbols-outlined text-xl">account_tree</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-surface-container text-primary-container font-code-sm text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  Diagnostic Engine v4.8
                </span>
                <span className="text-outline text-xs">•</span>
                <span className="text-outline font-code-sm text-xs">
                  {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
                </span>
              </div>
              <h2 className="font-headline-md text-base sm:text-lg text-on-surface font-bold mt-0.5">
                {isAr ? 'محرك التشخيص وشجرة القرارات الذكية' : 'Intelligent Diagnostic Decision Tree'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* DIAGNOSTIC FLOW BREADCRUMB BANNER */}
        <div className="px-4 py-2.5 bg-surface-container-low/60 border-b border-white/5 overflow-x-auto">
          <div className="flex items-center gap-2 text-[11px] font-code-sm text-outline whitespace-nowrap">
            <span className={phase === 'symptom-input' ? 'text-primary-container font-bold' : 'text-on-surface'}>
              Symptom
            </span>
            <span>↓</span>
            <span className="text-outline">Possible Systems</span>
            <span>↓</span>
            <span className="text-outline">Components</span>
            <span>↓</span>
            <span className={phase === 'decision-tree' ? 'text-primary-container font-bold' : 'text-outline'}>
              Tests
            </span>
            <span>↓</span>
            <span className="text-outline">Expected Result</span>
            <span>↓</span>
            <span className="text-outline">Actual Result</span>
            <span>↓</span>
            <span className={phase === 'conclusion-summary' ? 'text-primary-container font-bold' : 'text-outline'}>
              Likely Cause
            </span>
            <span>↓</span>
            <span className={phase === 'conclusion-summary' ? 'text-secondary font-bold' : 'text-outline'}>
              Repair Procedure
            </span>
          </div>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ============================================================ */}
          {/* PHASE 1: SYMPTOM ENTRY & CANDIDATE SYSTEM IDENTIFICATION */}
          {/* ============================================================ */}
          {phase === 'symptom-input' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-code-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">psychology</span>
                  <span>{isAr ? 'أدخل وصف العطل أو العَرَض الملاحظ' : 'Enter Observed Symptom'}</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      placeholder={
                        isAr
                          ? 'مثال: المحرك يدور بالمارش لكن لا يشتغل'
                          : 'e.g. Engine cranks but doesn\'t start'
                      }
                      className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary-container font-medium"
                    />
                    {symptomInput && (
                      <button
                        onClick={() => setSymptomInput('')}
                        className="absolute end-3 top-3 text-outline hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleStartDiagnosis(symptomInput)}
                    disabled={!symptomInput.trim()}
                    className="px-5 py-3 rounded-xl bg-primary-container hover:bg-primary-fixed-dim disabled:opacity-40 text-on-primary-container font-code-sm text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>{isAr ? 'بدء شجرة الفحص' : 'Start Diagnostic Tree'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* QUICK SELECT SYMPTOM CHIPS */}
              <div className="space-y-3">
                <span className="text-[11px] font-code-sm text-outline uppercase font-semibold">
                  {isAr ? 'أو اختر من الأعطال الشائعة' : 'Or Select Common Automotive Symptom'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SYMPTOM_CATALOG.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleStartDiagnosis(item.title)}
                      className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-white/5 hover:border-primary-container/40 text-start transition-all cursor-pointer flex items-center gap-3 group"
                    >
                      <div className="p-2 rounded-lg bg-surface-container group-hover:bg-primary-container/10 group-hover:text-primary-container text-outline transition-colors">
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-on-surface group-hover:text-primary-container truncate">
                          {isAr ? item.titleAr : item.title}
                        </div>
                        <div className="text-[11px] text-outline truncate mt-0.5">
                          {isAr ? item.descriptionAr : item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PRE-DIAGNOSTIC SYSTEM MAPPING CARD */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-white/5 space-y-3">
                <span className="text-xs font-code-sm font-bold text-outline uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-secondary text-base">hub</span>
                  <span>Decision Tree Mapping Framework</span>
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  The AutoFix Diagnostic Engine dynamically synthesizes guided decision trees with pass/fail criteria,
                  expected laboratory measurements, and component isolation routines.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* PHASE 2: INTERACTIVE DECISION TREE STEPPER */}
          {/* ============================================================ */}
          {phase === 'decision-tree' && currentNode && (
            <div className="space-y-5">
              {/* Symptom Context Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-low rounded-xl border border-white/5 text-xs font-code-sm">
                <div className="flex items-center gap-2">
                  <span className="text-outline uppercase text-[10px] font-telemetry-label">
                    Active Symptom:
                  </span>
                  <span className="text-on-surface font-bold truncate">
                    "{isAr ? activeSymptomDef.titleAr : activeSymptomDef.title}"
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-outline text-[11px]">Step {testHistory.length + 1}</span>
                  {nodeHistory.length > 0 && (
                    <button
                      onClick={handleStepBack}
                      className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">arrow_back</span>
                      <span>{isAr ? 'تراجع' : 'Step Back'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ACTIVE TEST CARD */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-primary-container/30 shadow-lg space-y-4">
                {/* System & Component Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-primary-container/15 text-primary-container font-code-sm text-xs font-bold uppercase">
                      {isAr ? currentNode.systemAr : currentNode.system}
                    </span>
                    <span className="text-outline text-xs">•</span>
                    <span className="font-code-sm text-xs text-outline font-semibold">
                      Target: {currentNode.targetComponent}
                    </span>
                  </div>
                  <span className="text-[10px] font-code-sm uppercase tracking-wider text-secondary font-bold">
                    Test #{testHistory.length + 1}
                  </span>
                </div>

                {/* Question */}
                <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-bold leading-snug">
                  {isAr ? currentNode.questionAr : currentNode.question}
                </h3>

                {/* Test Description */}
                <div className="space-y-1.5 bg-surface-container-lowest/70 p-3.5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-telemetry-label text-outline uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-primary">play_arrow</span>
                    <span>Test Procedure</span>
                  </span>
                  <p className="font-body-md text-xs text-on-surface leading-relaxed">
                    {isAr ? currentNode.testDescriptionAr : currentNode.testDescription}
                  </p>
                </div>

                {/* Expected Result */}
                <div className="space-y-1.5 bg-secondary/10 p-3.5 rounded-xl border border-secondary/20">
                  <span className="text-[10px] font-telemetry-label text-secondary uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    <span>Expected Result (Pass Criteria)</span>
                  </span>
                  <p className="font-body-md text-xs text-on-surface font-semibold leading-relaxed">
                    {isAr ? currentNode.expectedResultAr : currentNode.expectedResult}
                  </p>
                </div>

                {/* Safety Warning if present */}
                {currentNode.safetyWarning && (
                  <div className="flex items-center gap-2 text-xs font-code-sm text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    <span className="material-symbols-outlined text-base shrink-0">warning</span>
                    <span>{isAr ? currentNode.safetyWarningAr : currentNode.safetyWarning}</span>
                  </div>
                )}

                {/* DYNAMIC DECISION BUTTONS (YES / NO / MEASUREMENT CHOICES) */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-code-sm text-outline uppercase font-bold">
                    {isAr ? 'حدد النتيجة الفعلية للمعاينة / الفحص:' : 'Select Actual Workshop Observation:'}
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentNode.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(opt)}
                        className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between group ${
                          opt.resultType === 'passed'
                            ? 'bg-secondary/10 hover:bg-secondary/20 border-secondary/30 text-on-surface'
                            : opt.resultType === 'failed'
                            ? 'bg-error/10 hover:bg-error/20 border-error/30 text-on-surface'
                            : 'bg-surface-container hover:bg-surface-container-high border-white/10 text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`p-1.5 rounded-lg text-sm font-bold font-code-sm ${
                              opt.resultType === 'passed'
                                ? 'bg-secondary/20 text-secondary'
                                : opt.resultType === 'failed'
                                ? 'bg-error/20 text-error'
                                : 'bg-surface-container-high text-outline'
                            }`}
                          >
                            {opt.value.toUpperCase()}
                          </span>
                          <span className="font-headline-md text-xs sm:text-sm font-semibold">
                            {isAr ? opt.labelAr : opt.label}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors">
                          arrow_forward
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AUDIT TRAIL / TESTS PERFORMED SO FAR */}
              {testHistory.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-code-sm text-outline uppercase font-bold">
                    Audit Trail ({testHistory.length} Recorded Tests)
                  </span>
                  <div className="space-y-1.5">
                    {testHistory.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-2.5 rounded-lg bg-surface-container-low border border-white/5 flex items-center justify-between text-xs font-code-sm"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-outline font-bold">0{rIdx + 1}.</span>
                          <span className="text-on-surface font-medium truncate">{rec.question}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            rec.result === 'passed'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-error/20 text-error'
                          }`}
                        >
                          {rec.actual.split(' - ')[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* PHASE 3: CONCLUSION SUMMARY & ACTION GATEWAY */}
          {/* ============================================================ */}
          {phase === 'conclusion-summary' && finalConclusion && (
            <div className="space-y-5">
              {/* Diagnosis Banner */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-primary-container/40 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                      <span className="text-[10px] font-telemetry-label text-outline uppercase">
                        Diagnostic Resolution Reached
                      </span>
                    </div>
                    <h3 className="font-headline-md text-lg text-on-surface font-bold mt-1">
                      {isAr ? finalConclusion.titleAr : finalConclusion.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg border text-xs font-code-sm font-bold uppercase ${
                        finalConclusion.status === 'Likely Cause'
                          ? 'bg-error-container text-on-error-container border-error/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {finalConclusion.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container text-primary-container font-code-sm text-xs font-bold">
                      {finalConclusion.confidenceScore}% Confidence
                    </span>
                  </div>
                </div>

                {/* Root Cause Analysis */}
                <div className="space-y-1">
                  <span className="text-[10px] font-code-sm text-outline uppercase font-bold">Root Cause:</span>
                  <p className="font-body-md text-xs sm:text-sm text-on-surface leading-relaxed">
                    {isAr ? finalConclusion.rootCauseAr : finalConclusion.rootCause}
                  </p>
                </div>

                {/* Key Parts Needed */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-code-sm text-outline uppercase font-bold">
                    Identified Fault Components:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {finalConclusion.partsInvolved.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-surface-container flex items-center justify-between text-xs font-code-sm"
                      >
                        <span className="text-on-surface font-medium truncate">{p.name}</span>
                        <span className="text-primary-container font-bold shrink-0">{p.estCost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Generate Report, Inspect in 3D, Restart */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.35)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">description</span>
                  <span>{isAr ? 'عرض تقرير التشخيص الفني الشامل' : 'View Full Diagnostic Report'}</span>
                </button>

                {onInspectIn3D && (
                  <button
                    onClick={() => {
                      onInspectIn3D(get3DComponentIdForConclusion(finalConclusion.id));
                      onClose();
                    }}
                    className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">view_in_ar</span>
                    <span>{isAr ? 'معاينة في 3D' : 'Inspect in 3D'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setPhase('symptom-input');
                    setTestHistory([]);
                    setNodeHistory([]);
                    setFinalConclusion(null);
                  }}
                  className="py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-code-sm text-xs font-medium cursor-pointer transition-colors"
                >
                  {isAr ? 'تشخيص عطل آخر' : 'Start Over'}
                </button>
              </div>
            </div>
          )}

          {/* PROFESSIONAL DISCLAIMER CALLOUT (MANDATED BY PROMPT) */}
          <div className="p-3.5 rounded-xl bg-surface-container/60 border border-white/5 text-[11px] font-code-sm text-outline leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-base text-amber-400 shrink-0 mt-0.5">verified_user</span>
            <div>
              <span className="font-bold text-on-surface-variant">Notice: </span>
              {isAr ? PROFESSIONAL_DISCLAIMER.ar : PROFESSIONAL_DISCLAIMER.en}
            </div>
          </div>
        </div>
      </div>

      {/* FULL PRINTABLE & EXPORTABLE REPORT MODAL */}
      {isReportOpen && (
        <DiagnosticReportView
          report={generateReportData()}
          lang={lang}
          onClose={() => setIsReportOpen(false)}
          onInspectIn3D={onInspectIn3D}
          onRestartWizard={() => {
            setIsReportOpen(false);
            setPhase('symptom-input');
            setTestHistory([]);
            setNodeHistory([]);
            setFinalConclusion(null);
          }}
        />
      )}
    </div>
  );
};
