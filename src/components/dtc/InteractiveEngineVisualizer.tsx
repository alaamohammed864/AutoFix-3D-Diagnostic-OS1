import React, { useState, useEffect } from 'react';
import { Language } from '../../types';

interface InteractiveEngineVisualizerProps {
  lang: Language;
  highlightCylinder?: number;
  highlightBank?: number;
  dtcCode: string;
  onSelectComponentForDiagnosis?: (componentName: string) => void;
}

export const InteractiveEngineVisualizer: React.FC<InteractiveEngineVisualizerProps> = ({
  lang,
  highlightCylinder = 1,
  highlightBank = 1,
  dtcCode,
  onSelectComponentForDiagnosis,
}) => {
  const [selectedPart, setSelectedPart] = useState<'sparkPlug' | 'coil' | 'injector' | 'compression' | 'vacuum' | 'piston'>('coil');
  const [isCranking, setIsCranking] = useState<boolean>(true);
  const [crankPhase, setCrankPhase] = useState<number>(0);
  const [coilsSwapped, setCoilsSwapped] = useState<boolean>(false);

  // Engine animation loop for piston stroke cycles
  useEffect(() => {
    if (!isCranking) return;
    const interval = setInterval(() => {
      setCrankPhase((prev) => (prev + 1) % 4);
    }, 450);
    return () => clearInterval(interval);
  }, [isCranking]);

  const cylinders = [1, 2, 3, 4];

  return (
    <div className="bg-surface-container-low rounded-xl border border-white/10 p-5 overflow-hidden relative shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary-container/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-error-container/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar with controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-surface-container-high border border-primary-container/30 text-primary-container">
            <span className="material-symbols-outlined text-lg">view_in_ar</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                {lang === 'ar' ? 'المعاينة التفاعلية لمحرك الاحتراق والأسطوانات' : 'Interactive Engine & Cylinder Telemetry'}
              </h4>
              <span className="px-2 py-0.5 rounded bg-error-container/30 text-error border border-error/40 font-code-sm text-[11px] font-bold">
                {lang === 'ar' ? `الأسطوانة ${highlightCylinder} مستهدفة` : `Target: Cylinder ${highlightCylinder}`}
              </span>
            </div>
            <p className="font-body-sm text-xs text-outline">
              {lang === 'ar'
                ? 'نموذج مقطعي تفاعلي لعناصر الاحتراق، الحقن، ونظام الإشعال'
                : 'Cutaway powertrain visualization mapping ignition, direct injection, and manifold vacuum'}
            </p>
          </div>
        </div>

        {/* Engine cycle toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCranking(!isCranking)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-code-sm font-semibold transition-all border ${
              isCranking
                ? 'bg-primary-container/20 text-primary-container border-primary-container/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-surface-container-high text-outline border-white/10 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isCranking ? 'motion_photos_on' : 'play_arrow'}
            </span>
            <span>{isCranking ? (lang === 'ar' ? 'محرك قيد الدوران' : 'Engine Cranking') : (lang === 'ar' ? 'إيقاف الحركة' : 'Paused')}</span>
          </button>

          <button
            type="button"
            onClick={() => setCoilsSwapped(!coilsSwapped)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-code-sm font-semibold transition-all border ${
              coilsSwapped
                ? 'bg-secondary/20 text-secondary border-secondary/50'
                : 'bg-surface-container-high text-outline border-white/10 hover:text-on-surface'
            }`}
            title="Swap Cylinder 1 and Cylinder 2 ignition coils to verify if misfire migrates"
          >
            <span className="material-symbols-outlined text-sm">swap_horiz</span>
            <span>{coilsSwapped ? (lang === 'ar' ? 'تم تبديل الكويلات (1 ⇄ 2)' : 'Coils Swapped (1 ⇄ 2)') : (lang === 'ar' ? 'تبديل كويل 1 مع 2' : 'Swap Coil 1 ⇄ 2')}</span>
          </button>
        </div>
      </div>

      {/* Main Engine Visualizer Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4">
        {/* Visual Engine Block & Cylinders (8 cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest/80 rounded-xl p-4 border border-white/5 relative">
          {/* Top Intake Rail & Runners */}
          <div className="mb-3 px-4 py-2 rounded-lg bg-surface-container-high/60 border border-white/5 flex items-center justify-between text-xs font-code-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-secondary">air</span>
              <span className="text-secondary font-bold">{lang === 'ar' ? 'مجمع سحب الهواء (الثلاجة)' : 'Intake Manifold & Vacuum Runner'}</span>
            </div>
            <div className="flex items-center gap-4 text-outline">
              <span>MAP: 34.2 kPa</span>
              <span>MAF: 3.1 g/s</span>
              <button
                type="button"
                onClick={() => setSelectedPart('vacuum')}
                className="text-primary-container hover:underline cursor-pointer"
              >
                {lang === 'ar' ? 'فحص تسريب الفاكيوم' : 'Test Vacuum Leak'}
              </button>
            </div>
          </div>

          {/* 4-Cylinder Bank Display */}
          <div className="grid grid-cols-4 gap-3">
            {cylinders.map((cyl) => {
              const isTarget = cyl === highlightCylinder;
              const effectiveCoilNumber = coilsSwapped
                ? cyl === 1
                  ? 2
                  : cyl === 2
                  ? 1
                  : cyl
                : cyl;

              // Phase calculation for 4-stroke cycle
              // Firing order: 1 - 3 - 4 - 2
              const strokeOffset = cyl === 1 ? 0 : cyl === 3 ? 1 : cyl === 4 ? 2 : 3;
              const currentStrokeIndex = (crankPhase + strokeOffset) % 4;
              const strokes = ['Intake (سحب)', 'Compression (ضغط)', 'Power (اشتعال)', 'Exhaust (عادم)'];
              const isPowerStroke = currentStrokeIndex === 2;

              return (
                <div
                  key={cyl}
                  className={`relative rounded-xl p-3 flex flex-col items-center transition-all duration-300 border ${
                    isTarget
                      ? 'bg-error-container/15 border-error/50 shadow-[0_0_20px_rgba(255,84,73,0.25)] ring-2 ring-error/30'
                      : 'bg-surface-container-low/70 border-white/5 hover:border-white/20'
                  }`}
                >
                  {/* Cylinder Badge */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-code-sm font-bold ${
                        isTarget
                          ? 'bg-error text-on-error animate-pulse'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      CYL {cyl}
                    </span>
                    {isTarget && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                      </span>
                    )}
                  </div>

                  {/* 1. Ignition Coil Pack (Top) */}
                  <div
                    onClick={() => setSelectedPart('coil')}
                    className={`w-full py-1.5 px-2 rounded mb-1.5 cursor-pointer text-center text-[10px] font-code-sm font-semibold transition-all border ${
                      selectedPart === 'coil' && isTarget
                        ? 'bg-primary-container text-on-primary-container border-primary-container'
                        : isTarget
                        ? 'bg-error-container/30 text-error border-error/40 hover:bg-error-container/50'
                        : 'bg-surface-container-high text-outline hover:text-on-surface border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">bolt</span>
                      <span>Coil #{effectiveCoilNumber}</span>
                    </div>
                    {coilsSwapped && isTarget && (
                      <span className="text-[9px] text-secondary font-bold block">(Swapped #2)</span>
                    )}
                  </div>

                  {/* 2. Spark Plug & Electrode Chamber */}
                  <div
                    onClick={() => setSelectedPart('sparkPlug')}
                    className={`w-full py-1 px-2 rounded mb-1.5 cursor-pointer text-center text-[10px] font-code-sm transition-all border ${
                      selectedPart === 'sparkPlug' && isTarget
                        ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                        : isTarget
                        ? 'bg-error-container/20 text-error border-error/30'
                        : 'bg-surface-container-high/60 text-outline hover:text-on-surface border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">electric_bolt</span>
                      <span>Plug {cyl}</span>
                    </div>
                  </div>

                  {/* 3. Direct Fuel Injector Port */}
                  <div
                    onClick={() => setSelectedPart('injector')}
                    className={`w-full py-1 px-2 rounded mb-2 cursor-pointer text-center text-[10px] font-code-sm transition-all border ${
                      selectedPart === 'injector' && isTarget
                        ? 'bg-primary-container text-on-primary-container border-primary-container font-bold'
                        : 'bg-surface-container-high/40 text-outline hover:text-on-surface border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">water_drop</span>
                      <span>Injector {cyl}</span>
                    </div>
                  </div>

                  {/* 4. Piston Chamber Bore & Animated Motion */}
                  <div
                    onClick={() => setSelectedPart('compression')}
                    className={`w-full h-32 rounded-lg relative overflow-hidden flex flex-col justify-end p-1.5 cursor-pointer border ${
                      isTarget
                        ? 'bg-surface-container-highest/60 border-error/30'
                        : 'bg-surface-container-highest/30 border-white/5'
                    }`}
                  >
                    {/* Spark Flash during Power Stroke */}
                    {isPowerStroke && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary-container/60 rounded-full blur-sm animate-ping pointer-events-none" />
                    )}

                    {/* Compression Chamber Gas Glow */}
                    <div
                      className={`absolute top-0 inset-x-0 transition-all duration-300 ${
                        isPowerStroke
                          ? 'h-10 bg-gradient-to-b from-error/40 to-transparent'
                          : 'h-6 bg-gradient-to-b from-primary-container/20 to-transparent'
                      }`}
                    />

                    {/* Animated Piston Head */}
                    <div
                      className="w-full bg-outline-variant/60 rounded border border-white/20 p-1 flex flex-col items-center justify-center shadow-lg transition-all duration-300"
                      style={{
                        transform: `translateY(${
                          currentStrokeIndex === 0
                            ? '25px' // Intake down
                            : currentStrokeIndex === 1
                            ? '0px' // Compression up
                            : currentStrokeIndex === 2
                            ? '30px' // Power down
                            : '5px' // Exhaust up
                        })`,
                      }}
                    >
                      <div className="w-8 h-1 bg-white/30 rounded mb-0.5" />
                      <span className="text-[8px] font-code-sm font-bold text-on-surface">
                        {cyl}
                      </span>
                    </div>

                    {/* Connecting Rod */}
                    <div className="w-1 h-6 bg-white/20 mx-auto mt-0.5 rounded-full" />
                  </div>

                  {/* Cycle Status Subtitle */}
                  <div className="mt-2 text-center">
                    <span className="text-[9px] font-code-sm text-outline block">
                      {strokes[currentStrokeIndex]}
                    </span>
                    {isTarget && (
                      <span className="text-[9px] font-code-sm font-bold text-error block">
                        {lang === 'ar' ? 'ميس فاير نشط' : 'Misfire Active'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Crankcase & Fuel Pressure Rail */}
          <div className="mt-3 px-4 py-2 rounded-lg bg-surface-container-high/60 border border-white/5 flex items-center justify-between text-xs font-code-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary-container">speed</span>
              <span className="text-on-surface font-semibold">{lang === 'ar' ? 'مسطرة الوقود المباشر (GDI Rail)' : 'High Pressure GDI Fuel Rail'}</span>
            </div>
            <div className="flex items-center gap-3 text-outline">
              <span className="text-secondary font-bold">142 Bar (Target: 140 Bar)</span>
              <span>Crank RPM: {isCranking ? '2,150' : '0 (Stopped)'}</span>
            </div>
          </div>
        </div>

        {/* Component Detailed Inspector & Testing Panel (4 cols) */}
        <div className="lg:col-span-4 bg-surface-container rounded-xl p-4 border border-white/5 flex flex-col justify-between space-y-4">
          <div>
            {/* Component Tab Selector */}
            <div className="flex items-center gap-1 pb-3 border-b border-white/10 overflow-x-auto">
              {(['coil', 'sparkPlug', 'injector', 'compression', 'vacuum'] as const).map((part) => {
                const labels: Record<string, { en: string; ar: string }> = {
                  coil: { en: 'Coil', ar: 'الكويل' },
                  sparkPlug: { en: 'Plug', ar: 'البوجي' },
                  injector: { en: 'Injector', ar: 'البخاخ' },
                  compression: { en: 'Pressure', ar: 'الضغط' },
                  vacuum: { en: 'Vacuum', ar: 'الفاكيوم' },
                };
                return (
                  <button
                    key={part}
                    type="button"
                    onClick={() => setSelectedPart(part)}
                    className={`px-2.5 py-1 rounded text-xs font-code-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      selectedPart === part
                        ? 'bg-primary-container text-on-primary-container shadow-sm'
                        : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {lang === 'ar' ? labels[part].ar : labels[part].en}
                  </button>
                );
              })}
            </div>

            {/* Selected Component Detailed Diagnostics */}
            <div className="pt-3 space-y-3">
              {selectedPart === 'coil' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-code-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-error">bolt</span>
                      <span>{lang === 'ar' ? `كويل الإشعال - الأسطوانة ${highlightCylinder}` : `Ignition Coil Pack - Cylinder ${highlightCylinder}`}</span>
                    </h5>
                    <span className="px-2 py-0.5 rounded bg-error-container/30 text-error font-code-sm text-[10px] font-bold">
                      {lang === 'ar' ? 'احتمال العطل: 82%' : '82% Fault Probability'}
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest p-2.5 rounded-lg space-y-1.5 text-xs font-code-sm border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'المقاومة الأولية:' : 'Primary Resistance:'}</span>
                      <span className="text-on-surface font-semibold">0.85 Ω (Spec: 0.6 - 1.2 Ω)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'المقاومة الثانوية:' : 'Secondary Resistance:'}</span>
                      <span className="text-error font-bold">Open Circuit / High Leak</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'فولتية الإشارة (Terminal 15):' : 'Trigger Signal Pulse:'}</span>
                      <span className="text-secondary font-semibold">5V Square Wave Present</span>
                    </div>
                  </div>

                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                    {lang === 'ar'
                      ? 'عزل كويل الأسطوانة رقم 1 الداخلي ينهار تحت الحمل مما يسبب شرارة ضعيفة وميس فاير. ينصح بتبديله مع أسطوانة 2 لتأكيد العطل.'
                      : 'Internal dielectric breakdown causes secondary voltage arc-over under load. Coil swap confirms diagnosis.'}
                  </p>
                </div>
              )}

              {selectedPart === 'sparkPlug' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-code-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary">electric_bolt</span>
                      <span>{lang === 'ar' ? `شمعة الاحتراق - الأسطوانة ${highlightCylinder}` : `Spark Plug - Cylinder ${highlightCylinder}`}</span>
                    </h5>
                    <span className="px-2 py-0.5 rounded bg-error-container/30 text-error font-code-sm text-[10px] font-bold">
                      {lang === 'ar' ? 'احتمال العطل: 85%' : '85% Fault Probability'}
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest p-2.5 rounded-lg space-y-1.5 text-xs font-code-sm border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'خلوص القطب (Gap):' : 'Electrode Gap:'}</span>
                      <span className="text-error font-bold">1.15 mm (Spec: 0.80 mm)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'حالة السيراميك:' : 'Insulator Ceramic:'}</span>
                      <span className="text-on-surface font-semibold">Micro-carbon tracking line</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'عزم الشد المطلوب:' : 'OEM Torque Spec:'}</span>
                      <span className="text-secondary font-semibold">25 Nm (Dry Threads)</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPart === 'injector' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-code-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary-container">water_drop</span>
                      <span>{lang === 'ar' ? `بخاخ الوقود المباشر - أسطوانة ${highlightCylinder}` : `GDI Direct Injector - Cyl ${highlightCylinder}`}</span>
                    </h5>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline font-code-sm text-[10px] font-bold">
                      68% Prob
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest p-2.5 rounded-lg space-y-1.5 text-xs font-code-sm border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'مقاومة ملف البخاخ:' : 'Coil Resistance:'}</span>
                      <span className="text-on-surface font-semibold">12.8 Ω (Spec: 12 - 14 Ω)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'زمن النبضة (Pulse Width):' : 'Injection Duration:'}</span>
                      <span className="text-secondary font-semibold">2.4 ms @ Idle</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'نمط الرش:' : 'Spray Pattern:'}</span>
                      <span className="text-error font-bold">Partial carbon tip restriction</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPart === 'compression' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-code-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-tertiary">compress</span>
                      <span>{lang === 'ar' ? `فحص انضغاط الأسطوانة ${highlightCylinder}` : `Cylinder ${highlightCylinder} Compression`}</span>
                    </h5>
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline font-code-sm text-[10px] font-bold">
                      45% Prob
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest p-2.5 rounded-lg space-y-1.5 text-xs font-code-sm border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'الضغط المقاس:' : 'Cranking Pressure:'}</span>
                      <span className="text-on-surface font-semibold">172 PSI (Min: 145 PSI)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'نسبة تسريب الأسطوانة:' : 'Cylinder Leakdown:'}</span>
                      <span className="text-secondary font-semibold">6% (Within normal &lt; 15%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'حالة الصمامات والشنابر:' : 'Valve / Ring Seal:'}</span>
                      <span className="text-secondary font-semibold">Mechanically Sound</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPart === 'vacuum' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-code-sm text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary-container">air</span>
                      <span>{lang === 'ar' ? 'تسريب الفاكيوم (ممر الأسطوانة 1)' : 'Intake Runner Vacuum Seal'}</span>
                    </h5>
                    <span className="px-2 py-0.5 rounded bg-error-container/30 text-error font-code-sm text-[10px] font-bold">
                      55% Prob
                    </span>
                  </div>

                  <div className="bg-surface-container-lowest p-2.5 rounded-lg space-y-1.5 text-xs font-code-sm border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'فحص الدخان المضغوط:' : 'Pressurized Smoke Test:'}</span>
                      <span className="text-error font-bold">Vapor escaping at Cyl 1 gasket</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">{lang === 'ar' ? 'تأثير تصحيح الوقود:' : 'Fuel Trim Synergy:'}</span>
                      <span className="text-error font-bold">+24.5% STFT (Causes P0171)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Component Action Button */}
          <button
            type="button"
            onClick={() => onSelectComponentForDiagnosis && onSelectComponentForDiagnosis(selectedPart)}
            className="w-full bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-primary-container py-2 rounded-lg font-code-sm text-xs font-bold transition-all border border-primary-container/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">troubleshoot</span>
            <span>
              {lang === 'ar'
                ? `اختبار ${selectedPart} في شجرة التشخيص`
                : `Run Isolation Test on ${selectedPart.toUpperCase()}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
