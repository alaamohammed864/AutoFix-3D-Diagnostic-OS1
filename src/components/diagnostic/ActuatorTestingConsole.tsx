// AutoFix 3D - Bi-directional Mode 08 Actuator Testing Console
// High-voltage & electro-mechanical active component testing with real-time feedback

import React, { useState } from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';
import { ActuatorId } from '../../simulation/types';

interface ActuatorTestingConsoleProps {
  lang: Language;
}

export const ActuatorTestingConsole: React.FC<ActuatorTestingConsoleProps> = ({ lang }) => {
  const { actuatorTests, runActuatorTest, resetActuatorTest } = useSimulation();
  const [selectedActuatorId, setSelectedActuatorId] = useState<ActuatorId>('injector_1');

  const isArabic = lang === 'ar';
  const currentTest = actuatorTests[selectedActuatorId];

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">precision_manufacturing</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'وحدة التحكم ثنائية الاتجاه واختبار المشغلات' : 'Bi-directional Actuator Control (Mode 08)'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                ACTIVE
              </span>
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'إرسال أوامر إلكترونية مباشرة لاختبار مضخات الوقود، مراوح التبريد، البخاخات، وصمامات ABS'
                : 'Send direct commands to trigger fuel pumps, cooling fans, injectors, and ABS valves'}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container border border-white/5 text-xs font-code-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-outline">{isArabic ? 'حالة السلك التشخيصي:' : 'Diagnostic Link:'}</span>
          <span className="font-bold text-on-surface">ISO 14229 UDS</span>
        </div>
      </div>

      {/* Grid: Actuator List (Left) + Test Stage & Telemetry (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Actuator Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {Object.values(actuatorTests).map((test) => {
            const isSelected = selectedActuatorId === test.id;
            const isRunning = test.status === 'running';
            const isPassed = test.status === 'passed';
            const isFailed = test.status === 'failed';

            return (
              <div
                key={test.id}
                onClick={() => setSelectedActuatorId(test.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-primary-container/15 border-primary-container text-on-surface shadow-md'
                    : 'bg-surface-container-low border-white/5 hover:border-white/20 text-on-surface-variant'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[9px] font-code-sm font-bold text-outline">
                      {test.system}
                    </span>
                    <span className="font-bold text-xs truncate text-on-surface">
                      {isArabic ? test.arabicName : test.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-code-sm text-outline">
                    {test.lastTestedAt ? `Tested: ${test.lastTestedAt}` : 'Standby'}
                  </div>
                </div>

                {isRunning ? (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-code-sm font-bold animate-pulse">
                    RUNNING
                  </span>
                ) : isPassed ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-code-sm font-bold">
                    PASSED
                  </span>
                ) : isFailed ? (
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-code-sm font-bold">
                    FAILED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-surface-container text-outline border border-white/5 text-[10px] font-code-sm">
                    IDLE
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Test Console Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {currentTest && (
            <div className="p-5 rounded-xl bg-surface-container-low border border-white/10 space-y-5">
              {/* Test Header */}
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30 text-[10px] font-code-sm font-bold uppercase">
                  {currentTest.system}
                </span>
                <h3 className="font-headline-sm text-base font-bold text-on-surface">
                  {isArabic ? currentTest.arabicName : currentTest.name}
                </h3>
                <p className="text-xs text-outline">{currentTest.notes}</p>
              </div>

              {/* Progress & Current Draw Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-surface-container border border-white/5 space-y-1">
                  <span className="text-[10px] text-outline block font-code-sm">
                    {isArabic ? 'التيار المتوقع' : 'Expected Current'}
                  </span>
                  <span className="font-bold text-on-surface text-sm">
                    {currentTest.expectedCurrentA} A
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-white/5 space-y-1">
                  <span className="text-[10px] text-outline block font-code-sm">
                    {isArabic ? 'التيار المقاس' : 'Measured Current'}
                  </span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {currentTest.measuredCurrentA} A
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container border border-white/5 space-y-1">
                  <span className="text-[10px] text-outline block font-code-sm">
                    {isArabic ? 'حالة الاختبار' : 'Verdict'}
                  </span>
                  <span
                    className={`font-bold text-xs uppercase ${
                      currentTest.status === 'passed'
                        ? 'text-emerald-400'
                        : currentTest.status === 'failed'
                        ? 'text-rose-400'
                        : currentTest.status === 'running'
                        ? 'text-cyan-400'
                        : 'text-outline'
                    }`}
                  >
                    {currentTest.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {currentTest.status === 'running' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-code-sm text-outline">
                    <span>{isArabic ? 'جاري تشغيل المشغل...' : 'Actuating component...'}</span>
                    <span className="text-primary-container font-bold">{currentTest.progressPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full bg-primary-container transition-all duration-200"
                      style={{ width: `${currentTest.progressPct}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Response Log */}
              <div className="p-3.5 rounded-lg bg-surface-container border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-outline uppercase font-code-sm block">
                  {isArabic ? 'استجابة وحدة التحكم (ECU Response):' : 'ECU Response Log:'}
                </span>
                <p className="text-xs font-code-sm text-on-surface-variant font-medium">
                  {currentTest.measuredResponse}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => runActuatorTest(currentTest.id)}
                  disabled={currentTest.status === 'running'}
                  className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs shadow-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <span
                    className={`material-symbols-outlined text-sm ${
                      currentTest.status === 'running' ? 'animate-spin' : ''
                    }`}
                  >
                    play_arrow
                  </span>
                  <span>
                    {currentTest.status === 'running'
                      ? isArabic
                        ? 'جاري الاختبار...'
                        : 'Testing in Progress...'
                      : isArabic
                      ? 'بدء الاختبار التشخيصي'
                      : 'Execute Actuator Test'}
                  </span>
                </button>

                {currentTest.status !== 'idle' && (
                  <button
                    onClick={() => resetActuatorTest(currentTest.id)}
                    className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-outline hover:text-on-surface transition-colors cursor-pointer"
                  >
                    {isArabic ? 'إعادة ضبط' : 'Reset'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
