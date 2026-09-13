// AutoFix 3D - Multi-Mode OBD-II Professional Diagnostic Scanner
// Standardized Modes 01, 02, 03, 04, 06, 07, 08, 09, 0A with live PID decoders

import React, { useState } from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';
import { OBDMode } from '../../simulation/types';

interface ObdModesConsoleProps {
  lang: Language;
  onNavigateToActuators?: () => void;
}

export const ObdModesConsole: React.FC<ObdModesConsoleProps> = ({
  lang,
  onNavigateToActuators,
}) => {
  const { telemetry, activeDtcs, pendingDtcs, clearAllDtcs } = useSimulation();
  const [selectedMode, setSelectedMode] = useState<OBDMode>('01');
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);

  const isArabic = lang === 'ar';

  const handleClearCodes = () => {
    clearAllDtcs();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 4000);
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">troubleshoot</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'ماسح بروتوكول OBD-II القياسي (9 أوضاع كاملة)' : 'Standard OBD-II Multi-Mode Scanner'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                SAE J1979 / ISO 15031-5
              </span>
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'استعراض البيانات الحية، إطارات التجميد (Freeze Frame)، نتائج مراقبة Mode 06، وأرقام المعايرة Mode 09'
                : 'Browse Live PIDs, Freeze Frame telemetry, Mode 06 on-board monitors, and Mode 09 CVN/Cal-IDs'}
            </p>
          </div>
        </div>

        {/* OBD Protocol Spec */}
        <div className="px-3 py-1.5 rounded-xl bg-surface-container border border-white/5 text-xs font-code-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="text-outline">ECU Link:</span>
          <span className="font-bold text-on-surface">ISO 15765-4 (CAN 11/500)</span>
        </div>
      </div>

      {/* Mode Navigation Tabs Bar */}
      <div className="flex border-b border-white/10 gap-1 overflow-x-auto pb-1 text-xs font-code-sm">
        {[
          { id: '01', name: isArabic ? 'وضع 01: البيانات الحية (PIDs)' : 'Mode 01: Live PIDs' },
          { id: '02', name: isArabic ? 'وضع 02: إطار التجميد (Freeze Frame)' : 'Mode 02: Freeze Frame' },
          { id: '03', name: isArabic ? 'وضع 03: الأعطال المؤكدة' : 'Mode 03: Confirmed DTCs' },
          { id: '04', name: isArabic ? 'وضع 04: مسح الأعطال' : 'Mode 04: Clear DTCs' },
          { id: '06', name: isArabic ? 'وضع 06: اختبارات المراقبة' : 'Mode 06: Monitor Tests' },
          { id: '07', name: isArabic ? 'وضع 07: الأعطال المعلقة' : 'Mode 07: Pending DTCs' },
          { id: '08', name: isArabic ? 'وضع 08: التحكم ثنائي الاتجاه' : 'Mode 08: Actuator Control' },
          { id: '09', name: isArabic ? 'وضع 09: بيانات المركبة والـ VIN' : 'Mode 09: Vehicle Info' },
          { id: '0A', name: isArabic ? 'وضع 0A: الأعطال الدائمة' : 'Mode 0A: Permanent DTCs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMode(tab.id as OBDMode)}
            className={`px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedMode === tab.id
                ? 'bg-primary-container text-on-primary-container shadow-md'
                : 'bg-surface-container-low text-outline hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Mode Content Views */}
      <div className="space-y-4">
        {/* MODE 01: LIVE DIAGNOSTIC PIDS */}
        {selectedMode === '01' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { pid: 'PID 04', label: isArabic ? 'حمل المحرك المحسوب' : 'Calculated Engine Load', val: `${telemetry.engineLoadPct}%` },
              { pid: 'PID 05', label: isArabic ? 'حرارة سائل التبريد' : 'Coolant Temperature', val: `${telemetry.coolantTempC} °C` },
              { pid: 'PID 0C', label: isArabic ? 'سرعة دوران المحرك' : 'Engine RPM', val: `${telemetry.rpm} rpm` },
              { pid: 'PID 0D', label: isArabic ? 'سرعة المركبة' : 'Vehicle Speed', val: `${telemetry.speedKmH} km/h` },
              { pid: 'PID 0E', label: isArabic ? 'توقيت الإشعال' : 'Timing Advance', val: `${telemetry.ignitionTimingDeg}° BTDC` },
              { pid: 'PID 0F', label: isArabic ? 'حرارة هواء السحب' : 'Intake Air Temp', val: `${telemetry.intakeAirTempC} °C` },
              { pid: 'PID 10', label: isArabic ? 'تدفق كتلة الهواء (MAF)' : 'Mass Air Flow Rate', val: `${telemetry.mafGs} g/s` },
              { pid: 'PID 11', label: isArabic ? 'موضع الخانق المطلق' : 'Absolute Throttle Position', val: `${telemetry.throttlePosPct}%` },
            ].map((p, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-white/5 space-y-1">
                <span className="text-[10px] font-code-sm font-bold text-primary-container block uppercase">
                  {p.pid}
                </span>
                <span className="text-xs text-outline block">{p.label}</span>
                <span className="text-sm font-bold font-code text-on-surface">{p.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* MODE 02: FREEZE FRAME SNAPSHOT */}
        {selectedMode === '02' && (
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-base">ac_unit</span>
                <span>{isArabic ? 'لقطة إطار التجميد عند حدوث العطل (DTC: P0301)' : 'Freeze Frame Snapshot at Fault DTC: P0301'}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-code-sm text-outline">
                Frame #00 - Closed Loop
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-code-sm">
              <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
                <span className="text-outline block text-[10px]">RPM at Freeze</span>
                <span className="font-bold text-on-surface">2,420 rpm</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
                <span className="text-outline block text-[10px]">Vehicle Speed</span>
                <span className="font-bold text-on-surface">64 km/h</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
                <span className="text-outline block text-[10px]">Engine Load</span>
                <span className="font-bold text-on-surface">42.5%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
                <span className="text-outline block text-[10px]">Coolant Temp</span>
                <span className="font-bold text-on-surface">91 °C</span>
              </div>
            </div>
          </div>
        )}

        {/* MODE 03: CONFIRMED DTCS */}
        {selectedMode === '03' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-outline">
                {isArabic ? `الأعطال المخزنة المؤكدة (${activeDtcs.length}):` : `Confirmed Trouble Codes (${activeDtcs.length}):`}
              </span>
            </div>

            {activeDtcs.length === 0 ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-emerald-400 text-xs">
                {isArabic ? 'لا توجد أكواد أعطال مخزنة حالياً في ذاكرة الـ ECU.' : 'No confirmed diagnostic trouble codes stored in ECU memory.'}
              </div>
            ) : (
              <div className="space-y-2">
                {activeDtcs.map((c) => (
                  <div key={c} className="p-3 rounded-xl bg-surface-container-low border border-rose-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 font-bold font-code-sm">
                        {c}
                      </span>
                      <span className="font-semibold text-on-surface">
                        {c === 'P0301'
                          ? 'Cylinder 1 Misfire Detected'
                          : c === 'P0171'
                          ? 'System Too Lean (Bank 1)'
                          : c === 'P0102'
                          ? 'Mass Air Flow (MAF) Circuit Low'
                          : c === 'P0117'
                          ? 'Engine Coolant Temp Circuit Low'
                          : 'Powertrain System Component Malfunction'}
                      </span>
                    </div>
                    <span className="text-[10px] font-code-sm text-outline">MIL REQUESTED</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE 04: CLEAR DTCS */}
        {selectedMode === '04' && (
          <div className="p-5 rounded-xl bg-surface-container-low border border-white/10 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-on-surface">
                {isArabic ? 'مسح أكواد الأعطال وإعادة ضبط مراقبات الجاهزية (Mode 04 Clear)' : 'Clear Diagnostic Information & Reset Emission Monitors'}
              </h3>
              <p className="text-xs text-outline leading-relaxed">
                {isArabic
                  ? 'سيؤدي هذا الأمر إلى مسح جميع أكواد الأعطال المخزنة والمعلقة، إطفاء لمبة المحرك (MIL)، وإعادة ضبط جاهزية الفحص الدوري (I/M Readiness).'
                  : 'This command resets all confirmed/pending DTCs, turns off the Check Engine MIL lamp, and resets OBD I/M readiness flags to Not Ready.'}
              </p>
            </div>

            {clearedNotice && (
              <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{isArabic ? 'تم إرسال أمر Mode 04 ومسح جميع الأكواد بنجاح.' : 'Mode 04 command executed. ECU memory cleared successfully.'}</span>
              </div>
            )}

            <button
              onClick={handleClearCodes}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              <span>{isArabic ? 'تنفيذ مسح الأكواد (Mode 04)' : 'Execute Mode 04 Clear'}</span>
            </button>
          </div>
        )}

        {/* MODE 06: ON-BOARD MONITORING RESULTS */}
        {selectedMode === '06' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-outline uppercase block font-code-sm">
              {isArabic ? 'نتائج اختبارات المراقبة الذاتية للمكونات غير المستمرة:' : 'Non-Continuously Monitored Component Test Limits:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-code-sm">
              <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 space-y-1">
                <span className="text-primary-container font-bold block">TID $A2 CID $0B - Cylinder 1 Misfire Rate</span>
                <span className="text-outline block text-[11px]">Threshold: Max 45 counts / 1000 revs</span>
                <span className="text-rose-400 font-bold block">Measured: 182 counts (FAIL)</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 space-y-1">
                <span className="text-primary-container font-bold block">TID $01 CID $01 - O2 Sensor Rich-to-Lean Transition</span>
                <span className="text-outline block text-[11px]">Threshold: Min 80 ms - Max 250 ms</span>
                <span className="text-emerald-400 font-bold block">Measured: 120 ms (PASS)</span>
              </div>
            </div>
          </div>
        )}

        {/* MODE 07: PENDING DTCS */}
        {selectedMode === '07' && (
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-2">
            <span className="text-xs font-bold text-outline">
              {isArabic ? 'الأعطال المعلقة (دورة القيادة الحالية):' : 'Pending Trouble Codes (Current Drive Cycle):'}
            </span>
            {pendingDtcs.map((c) => (
              <div key={c} className="p-2.5 rounded-lg bg-surface-container border border-amber-500/30 text-xs flex items-center justify-between">
                <span className="font-bold text-amber-400 font-code-sm">{c} - Catalyst Efficiency Below Threshold (Bank 1)</span>
                <span className="text-[10px] text-outline">PENDING MATURATION</span>
              </div>
            ))}
          </div>
        )}

        {/* MODE 08: ACTUATOR CONTROL SHORTCUT */}
        {selectedMode === '08' && (
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-bold text-xs text-on-surface">Bi-directional Actuator Testing Center</span>
              <p className="text-xs text-outline">Direct hardware pulse commands for relays, fuel injectors, and pumps.</p>
            </div>
            {onNavigateToActuators && (
              <button
                onClick={onNavigateToActuators}
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs cursor-pointer"
              >
                Open Actuators Console
              </button>
            )}
          </div>
        )}

        {/* MODE 09: VEHICLE INFO */}
        {selectedMode === '09' && (
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-code-sm">
            <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
              <span className="text-outline block text-[10px]">VIN (Vehicle Identification)</span>
              <span className="font-bold text-on-surface">WP0AA2A92NS240192</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
              <span className="text-outline block text-[10px]">Calibration ID (CALID)</span>
              <span className="font-bold text-cyan-400">0000992906012F</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container border border-white/5">
              <span className="text-outline block text-[10px]">Verification Number (CVN)</span>
              <span className="font-bold text-emerald-400">7A84B91C</span>
            </div>
          </div>
        )}

        {/* MODE 0A: PERMANENT DTCS */}
        {selectedMode === '0A' && (
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-1">
            <span className="font-bold text-xs text-on-surface">Permanent Diagnostic Trouble Codes</span>
            <p className="text-xs text-outline">
              Permanent DTCs cannot be erased by any scan tool. They only clear automatically after the ECU monitors verify zero misfires across 3 complete drive cycles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
