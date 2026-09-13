// AutoFix 3D - Comprehensive Sensor Fault Injection Simulator
// Real-time circuit faults, signal tampering, and DTC cascade evaluation

import React, { useState } from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';
import { SensorId, SensorFaultState } from '../../simulation/types';

interface SensorFaultSimulatorProps {
  lang: Language;
  onSelectComponentFor3D?: (componentId: string) => void;
}

const FAULT_OPTIONS: { id: SensorFaultState; label: string; arabicLabel: string; color: string }[] = [
  { id: 'NORMAL', label: 'Normal (OEM Spec)', arabicLabel: 'طبيعي (المصنع)', color: 'text-emerald-400' },
  { id: 'OPEN_CIRCUIT', label: 'Open Circuit (Cut Wire)', arabicLabel: 'دائرة مفتوحة (سلك مقطوع)', color: 'text-rose-400' },
  { id: 'SHORT_TO_GROUND', label: 'Short to Ground (0V)', arabicLabel: 'التماس مع الأرضي (0V)', color: 'text-rose-500' },
  { id: 'SHORT_TO_BATT', label: 'Short to +12V VBat', arabicLabel: 'التماس مع البطارية (12V)', color: 'text-amber-400' },
  { id: 'HIGH_SIGNAL', label: 'High Signal (+5.0V)', arabicLabel: 'إشارة مرتفعة جداً (5V)', color: 'text-amber-500' },
  { id: 'LOW_SIGNAL', label: 'Low Signal (<0.2V)', arabicLabel: 'إشارة منخفضة جداً (<0.2V)', color: 'text-blue-400' },
  { id: 'INTERMITTENT', label: 'Intermittent Jitter', arabicLabel: 'إشارة متقطعة غير مستقرة', color: 'text-purple-400' },
  { id: 'OUT_OF_RANGE', label: 'Rationality Out of Range', arabicLabel: 'قراءة غير منطقية', color: 'text-orange-400' },
];

export const SensorFaultSimulator: React.FC<SensorFaultSimulatorProps> = ({
  lang,
  onSelectComponentFor3D,
}) => {
  const { sensors, injectSensorFault, clearAllSensorFaults, activeDtcs } = useSimulation();
  const [selectedSensorId, setSelectedSensorId] = useState<SensorId>('maf');
  const [filterQuery, setFilterQuery] = useState<string>('');

  const isArabic = lang === 'ar';
  const currentSensor = sensors[selectedSensorId];

  const sensorList = Object.values(sensors).filter((s) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.arabicName.toLowerCase().includes(q) ||
      s.system.toLowerCase().includes(q) ||
      s.ecu.toLowerCase().includes(q)
    );
  });

  const activeFaultCount = Object.values(sensors).filter((s) => s.state !== 'NORMAL').length;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">flash_on</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'محاكي أعطال المستشعرات التفاعلي' : 'Interactive Sensor Fault Injector'}</span>
              {activeFaultCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  {activeFaultCount} {isArabic ? 'أعطال نشطة' : 'Active Faults'}
                </span>
              )}
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'حقن انقطاع الدوائر، الالتماس الأرضي، والتشويش لمشاهدة تولد أكواد DTC واستجابة المحرك فورياً'
                : 'Inject open circuits, ground shorts, and signal tampering to evaluate DTC cascades & engine reactions'}
            </p>
          </div>
        </div>

        {/* Restore All Button */}
        {activeFaultCount > 0 && (
          <button
            onClick={clearAllSensorFaults}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs font-bold text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>{isArabic ? 'إعادة ضبط كل الحساسات للوضع الطبيعي' : 'Reset All to Normal'}</span>
          </button>
        )}
      </div>

      {/* Main Grid: Sensor List (Left) + Fault Control Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sensor Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute top-2.5 left-3 text-outline text-sm">
              search
            </span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={isArabic ? 'بحث في الحساسات أو الأنظمة...' : 'Filter sensors by name or ECU...'}
              className="w-full bg-surface-container rounded-xl pl-9 pr-3 py-2 text-xs border border-white/5 focus:border-primary-container outline-none text-on-surface"
            />
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {sensorList.map((sensor) => {
              const isSelected = selectedSensorId === sensor.id;
              const hasFault = sensor.state !== 'NORMAL';

              return (
                <div
                  key={sensor.id}
                  onClick={() => setSelectedSensorId(sensor.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-primary-container/15 border-primary-container text-on-surface shadow-md'
                      : hasFault
                      ? 'bg-rose-500/10 border-rose-500/30 text-on-surface'
                      : 'bg-surface-container-low border-white/5 hover:border-white/20 text-on-surface-variant'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[9px] font-code-sm font-bold text-outline">
                        {sensor.ecu}
                      </span>
                      <span className="font-bold text-xs truncate text-on-surface">
                        {isArabic ? sensor.arabicName : sensor.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-code-sm text-outline">
                      <span>
                        Val: {sensor.currentValue} {sensor.unit}
                      </span>
                      <span>•</span>
                      <span>{sensor.voltage.toFixed(2)} V</span>
                    </div>
                  </div>

                  {hasFault ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-code-sm font-bold whitespace-nowrap">
                      {sensor.state}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-code-sm font-bold whitespace-nowrap">
                      OEM OK
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Sensor Diagnostics & Fault Injector (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {currentSensor && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-4">
              {/* Sensor Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30 text-[10px] font-code-sm font-bold">
                      {currentSensor.ecu} / {currentSensor.system}
                    </span>
                    <span className="text-[10px] font-code-sm text-outline">
                      {currentSensor.subsystem}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">
                    {isArabic ? currentSensor.arabicName : currentSensor.name}
                  </h3>
                  <p className="text-xs text-outline leading-relaxed">{currentSensor.description}</p>
                </div>

                {onSelectComponentFor3D && (
                  <button
                    onClick={() => onSelectComponentFor3D(currentSensor.id)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-outline hover:text-on-surface transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-sm">view_in_ar</span>
                    <span>{isArabic ? 'معاينة 3D' : 'Inspect 3D'}</span>
                  </button>
                )}
              </div>

              {/* Real-time Electrical Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-code-sm">
                <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
                  <span className="text-outline block text-[10px]">
                    {isArabic ? 'القراءة الحية' : 'Live Value'}
                  </span>
                  <span className="font-bold text-on-surface text-sm">
                    {currentSensor.currentValue} {currentSensor.unit}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
                  <span className="text-outline block text-[10px]">
                    {isArabic ? 'جهد الإشارة' : 'Signal Voltage'}
                  </span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {currentSensor.voltage.toFixed(2)} V
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
                  <span className="text-outline block text-[10px]">
                    {isArabic ? 'النطاق الطبيعي' : 'OEM Range'}
                  </span>
                  <span className="font-bold text-outline text-xs">
                    {currentSensor.normalMin} - {currentSensor.normalMax}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
                  <span className="text-outline block text-[10px]">
                    {isArabic ? 'الحالة الحالية' : 'Current State'}
                  </span>
                  <span
                    className={`font-bold text-xs ${
                      currentSensor.state === 'NORMAL' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {currentSensor.state}
                  </span>
                </div>
              </div>

              {/* Fault Injection Buttons Matrix */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-xs font-bold text-outline uppercase tracking-wider block font-code-sm">
                  {isArabic ? 'اختر حالة العطل للحقن:' : 'Select Fault Injection State:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FAULT_OPTIONS.map((f) => {
                    const isCurrent = currentSensor.state === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => injectSensorFault(currentSensor.id, f.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-start flex items-center justify-between cursor-pointer ${
                          isCurrent
                            ? 'bg-primary-container text-on-primary-container border-primary-container shadow-md'
                            : 'bg-surface-container border-white/5 hover:border-white/20 text-on-surface'
                        }`}
                      >
                        <span className="truncate">{isArabic ? f.arabicLabel : f.label}</span>
                        {isCurrent && (
                          <span className="material-symbols-outlined text-sm">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Associated DTCs Triggered */}
              <div className="p-3 rounded-lg bg-surface-container border border-white/5 space-y-1.5">
                <span className="text-[11px] font-bold text-outline font-code-sm uppercase tracking-wider block">
                  {isArabic ? 'أكواد الأعطال المرتبطة بهذا الحساس (DTCs):' : 'Associated Diagnostic Trouble Codes:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSensor.associatedDtcs.map((code) => {
                    const isTriggered = activeDtcs.includes(code);
                    return (
                      <span
                        key={code}
                        className={`px-2 py-1 rounded text-xs font-code-sm font-bold flex items-center gap-1 ${
                          isTriggered
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                            : 'bg-surface-container-high text-outline border border-white/5'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {isTriggered ? 'warning' : 'circle'}
                        </span>
                        {code}
                        {isTriggered && (
                          <span className="text-[9px] bg-rose-500/40 px-1 rounded ml-1">ACTIVE</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
