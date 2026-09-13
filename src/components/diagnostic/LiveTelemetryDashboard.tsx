// AutoFix 3D - Live Automotive Telemetry & Sensor Cluster Dashboard
// High-frequency animated digital & analog instrument gauges with real throttle actuator slider

import React, { useState } from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';

interface LiveTelemetryDashboardProps {
  lang: Language;
  onOpenFullScan?: () => void;
  onOpenFaultInjector?: () => void;
}

export const LiveTelemetryDashboard: React.FC<LiveTelemetryDashboardProps> = ({
  lang,
  onOpenFullScan,
  onOpenFaultInjector,
}) => {
  const {
    telemetry,
    setThrottle,
    setSpeed,
    isSimulating,
    togglePauseSimulation,
    activeDtcs,
  } = useSimulation();

  const isArabic = lang === 'ar';
  const [activeGear, setActiveGear] = useState<'P' | 'R' | 'N' | 'D' | 'M'>('P');

  const handleThrottleChange = (val: number) => {
    setThrottle(val);
    if (activeGear === 'D') {
      setSpeed(Math.round((val / 100) * 240));
    }
  };

  const handleGearSelect = (gear: 'P' | 'R' | 'N' | 'D' | 'M') => {
    setActiveGear(gear);
    if (gear === 'P' || gear === 'N') {
      setSpeed(0);
    } else if (gear === 'D') {
      setSpeed(Math.round((telemetry.throttlePosPct / 100) * 180));
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">speed</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'لوحة البيانات الحية للمركبة' : 'Live Vehicle Telemetry Cluster'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                16.6 Hz (60ms)
              </span>
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'إشارات فيزيائية مترابطة - دورات المحرك، السرعة، حرارة التبريد، الضغط، والأكسجين'
                : 'Correlated physical signals - RPM, Speed, Coolant Temp, Manifold Pressure, and Lambda'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenFullScan && (
            <button
              onClick={onOpenFullScan}
              className="px-3 py-1.5 rounded-xl text-xs font-bold font-code-sm flex items-center gap-1.5 bg-primary-container/20 text-primary-container border border-primary-container/40 hover:bg-primary-container/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">radar</span>
              <span>{isArabic ? 'بدء فحص كامل' : 'Run Full Scan'}</span>
            </button>
          )}

          {onOpenFaultInjector && (
            <button
              onClick={onOpenFaultInjector}
              className="px-3 py-1.5 rounded-xl text-xs font-bold font-code-sm flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">flash_on</span>
              <span>{isArabic ? 'حقن عطل' : 'Inject Fault'}</span>
            </button>
          )}

          {/* Pause / Resume Simulation */}
          <button
            onClick={togglePauseSimulation}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-code-sm flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulating
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isSimulating ? 'pause_circle' : 'play_circle'}
            </span>
            <span>{isSimulating ? (isArabic ? 'إيقاف مؤقت' : 'Pause Sim') : isArabic ? 'استئناف' : 'Resume'}</span>
          </button>

          {/* MIL Status Lamp */}
          <div
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-code-sm flex items-center gap-1.5 border transition-all ${
              activeDtcs.length > 0
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                : 'bg-surface-container text-outline border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-sm">engine</span>
            <span>{activeDtcs.length > 0 ? (isArabic ? 'لمبة العطل (MIL) نشطة' : 'CHECK ENGINE (MIL)') : 'MIL OFF'}</span>
          </div>
        </div>
      </div>

      {/* Primary Gauges Matrix: Tachometer (RPM) & Speedometer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tachometer (RPM) */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center space-y-1 z-10">
            <span className="text-xs font-code-sm text-outline font-bold uppercase tracking-wider block">
              {isArabic ? 'سرعة دوران المحرك' : 'Engine Tachometer'}
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl sm:text-4xl font-black font-code text-on-surface tracking-tight">
                {telemetry.rpm.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-outline">RPM</span>
            </div>
            {/* RPM Progress Bar with Redline at 6500+ */}
            <div className="w-48 h-2 rounded-full bg-surface-container-highest overflow-hidden mx-auto mt-2">
              <div
                className={`h-full transition-all duration-75 ${
                  telemetry.rpm > 6500
                    ? 'bg-rose-500'
                    : telemetry.rpm > 4500
                    ? 'bg-amber-400'
                    : 'bg-primary-container'
                }`}
                style={{ width: `${Math.min(100, (telemetry.rpm / 7500) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[10px] text-outline mt-3 flex items-center gap-2">
            <span>IDLE: 850</span>
            <span>•</span>
            <span className="text-rose-400">REDLINE: 7,200</span>
          </div>
        </div>

        {/* Speedometer (KM/H) */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-center space-y-1 z-10">
            <span className="text-xs font-code-sm text-outline font-bold uppercase tracking-wider block">
              {isArabic ? 'سرعة المركبة' : 'Vehicle Velocity'}
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl sm:text-4xl font-black font-code text-cyan-400 tracking-tight">
                {telemetry.speedKmH}
              </span>
              <span className="text-xs font-bold text-outline">KM/H</span>
            </div>
            <div className="w-48 h-2 rounded-full bg-surface-container-highest overflow-hidden mx-auto mt-2">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${Math.min(100, (telemetry.speedKmH / 300) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[10px] text-outline mt-3 flex items-center gap-2">
            <span>0 - 320 KM/H</span>
            <span>•</span>
            <span>PDK 8-SPEED</span>
          </div>
        </div>

        {/* Engine Load & Boost (MAP) */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between items-center text-xs font-code-sm mb-1">
              <span className="text-outline font-bold">{isArabic ? 'حمل المحرك' : 'Engine Load'}</span>
              <span className="font-bold text-on-surface">{telemetry.engineLoadPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-100"
                style={{ width: `${telemetry.engineLoadPct}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-code-sm mb-1">
              <span className="text-outline font-bold">{isArabic ? 'ضغط السحب (MAP)' : 'Manifold Abs. Press.'}</span>
              <span className="font-bold text-on-surface">{telemetry.mapKpa} kPa</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-primary-container transition-all duration-100"
                style={{ width: `${Math.min(100, (telemetry.mapKpa / 250) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-code-sm pt-1 border-t border-white/5">
            <span className="text-outline">MAF: {telemetry.mafGs} g/s</span>
            <span className="text-outline">Timing: {telemetry.ignitionTimingDeg}° BTDC</span>
          </div>
        </div>

        {/* Thermal & Battery Stack */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between items-center text-xs font-code-sm mb-1">
              <span className="text-outline font-bold">{isArabic ? 'حرارة المحرك (ECT)' : 'Coolant Temp'}</span>
              <span
                className={`font-bold ${
                  telemetry.coolantTempC > 105
                    ? 'text-rose-400'
                    : telemetry.coolantTempC < 60
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
                }`}
              >
                {telemetry.coolantTempC}°C
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  telemetry.coolantTempC > 105
                    ? 'bg-rose-500'
                    : telemetry.coolantTempC < 60
                    ? 'bg-cyan-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (telemetry.coolantTempC / 120) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-code-sm mb-1">
              <span className="text-outline font-bold">{isArabic ? 'جهد البطارية' : 'Battery Bus'}</span>
              <span className="font-bold text-emerald-400">{telemetry.batteryVoltageV} V</span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-100"
                style={{ width: `${Math.min(100, ((telemetry.batteryVoltageV - 10) / 5) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-code-sm pt-1 border-t border-white/5">
            <span className="text-outline">Oil Press: {telemetry.oilPressureBar} bar</span>
            <span className="text-outline">Trans: {telemetry.transmissionTempC}°C</span>
          </div>
        </div>
      </div>

      {/* Fuel Trim & Oxygen Sensor Closed-Loop Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Short Term Fuel Trim (STFT) */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-code-sm">
            <span className="text-outline font-bold">STFT Bank 1</span>
            <span
              className={`font-bold ${
                Math.abs(telemetry.stftBank1Pct) > 15
                  ? 'text-rose-400'
                  : Math.abs(telemetry.stftBank1Pct) > 8
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {telemetry.stftBank1Pct > 0 ? `+${telemetry.stftBank1Pct}` : telemetry.stftBank1Pct}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20"></div>
            <div
              className={`h-full transition-all duration-100 ${
                telemetry.stftBank1Pct >= 0 ? 'bg-primary-container' : 'bg-secondary'
              }`}
              style={{
                width: `${Math.min(50, Math.abs(telemetry.stftBank1Pct) * 2)}%`,
                marginLeft: telemetry.stftBank1Pct >= 0 ? '50%' : `${50 - Math.min(50, Math.abs(telemetry.stftBank1Pct) * 2)}%`,
              }}
            ></div>
          </div>
          <p className="text-[10px] text-outline">
            {Math.abs(telemetry.stftBank1Pct) > 20
              ? 'Extreme trim adjustment: ECU compensating for vacuum leak or lean fault.'
              : 'Stoichiometric closed-loop active.'}
          </p>
        </div>

        {/* Oxygen Sensor Upstream O2 B1S1 */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-code-sm">
            <span className="text-outline font-bold">O2 Sensor B1S1</span>
            <span className="font-bold text-cyan-400">{telemetry.o2VoltageB1S1} V</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-primary-container transition-all duration-75"
              style={{ width: `${Math.min(100, (telemetry.o2VoltageB1S1 / 1.0) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-outline">
            {telemetry.o2VoltageB1S1 < 0.1
              ? 'Low Voltage (Lean Mixture / Open Circuit)'
              : telemetry.o2VoltageB1S1 > 0.8
              ? 'High Voltage (Rich Mixture)'
              : 'Lambda switching cycle normal (0.1V - 0.9V)'}
          </p>
        </div>

        {/* High-Pressure Fuel Rail (FRP) */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-code-sm">
            <span className="text-outline font-bold">Fuel Rail High-Pressure</span>
            <span className="font-bold text-emerald-400">{telemetry.fuelRailBar} bar</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-100"
              style={{ width: `${Math.min(100, (telemetry.fuelRailBar / 220) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-outline">Direct Injection GDI Rail: 50 bar idle - 200 bar WOT.</p>
        </div>
      </div>

      {/* Interactive Throttle Actuator & Gear Selector Console */}
      <div className="p-4 rounded-xl bg-surface-container border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5 font-code-sm">
              <span className="material-symbols-outlined text-primary-container text-base">tune</span>
              <span>{isArabic ? 'التحكم التفاعلي في دواسة الوقود (Throttle Pedal)' : 'Interactive Throttle Actuator'}</span>
            </h3>
            <p className="text-[11px] text-outline mt-0.5">
              {isArabic
                ? 'حرك مؤشر الدواسة لمشاهدة استجابة دورات المحرك، تدفق الهواء، ضغط الوقود، والشحن التوربيني فورياً'
                : 'Drag pedal slider to rev the engine and observe correlated RPM, MAF, and fuel pressures react in real-time'}
            </p>
          </div>

          {/* PDK Transmission Selector */}
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-white/10 text-xs font-code-sm font-bold">
            {(['P', 'R', 'N', 'D', 'M'] as const).map((gear) => (
              <button
                key={gear}
                onClick={() => handleGearSelect(gear)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeGear === gear
                    ? 'bg-primary-container text-on-primary-container shadow'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {gear}
              </button>
            ))}
          </div>
        </div>

        {/* Throttle Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-code-sm">
            <span className="text-outline">{isArabic ? 'فتحة الخانق:' : 'Throttle Opening:'}</span>
            <span className="font-bold text-primary-container">{telemetry.throttlePosPct}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={telemetry.throttlePosPct}
            onChange={(e) => handleThrottleChange(Number(e.target.value))}
            className="w-full h-3 rounded-lg bg-surface-container-highest accent-primary-container cursor-pointer"
          />

          {/* Preset Buttons for Quick Throttle Revs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-code-sm text-outline font-bold">
              {isArabic ? 'نقاط تثبيت سريعة:' : 'Quick Rev Presets:'}
            </span>
            {[
              { label: 'Idle (12%)', val: 12 },
              { label: 'Cruise (25%)', val: 25 },
              { label: 'Overtake (50%)', val: 50 },
              { label: 'Wide Open Throttle (100%)', val: 100 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => handleThrottleChange(p.val)}
                className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest border border-white/5 text-[11px] font-code-sm font-bold text-on-surface transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
