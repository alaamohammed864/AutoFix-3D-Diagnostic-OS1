import React, { useState } from 'react';
import { AUTOMOTIVE_WIRE_GAUGES } from './calculatorTypes';
import { Language } from '../types';

interface ElectricalCalculatorsProps {
  lang: Language;
}

export const ElectricalCalculators: React.FC<ElectricalCalculatorsProps> = ({ lang }) => {
  // 1. Battery Voltage Test State
  const [batteryVoltage, setBatteryVoltage] = useState<number>(12.6);
  const [batteryType, setBatteryType] = useState<'lead-acid' | 'agm' | 'lithium'>('lead-acid');
  const [testMode, setTestMode] = useState<'resting' | 'cranking' | 'charging'>('resting');

  // 2. Ohm's Law State
  const [knownPair, setKnownPair] = useState<'VI' | 'VR' | 'IR' | 'VP' | 'IP'>('VI');
  const [valV, setValV] = useState<number>(12.0);
  const [valI, setValI] = useState<number>(5.0);
  const [valR, setValR] = useState<number>(2.4);
  const [valP, setValP] = useState<number>(60.0);

  // 3. Voltage Drop State
  const [sourceVoltage, setSourceVoltage] = useState<number>(12.6);
  const [loadAmps, setLoadAmps] = useState<number>(15.0);
  const [wireLength, setWireLength] = useState<number>(4.5); // meters
  const [lengthUnit, setLengthUnit] = useState<'m' | 'ft'>('m');
  const [selectedGaugeIdx, setSelectedGaugeIdx] = useState<number>(9); // 14 AWG default
  const [circuitType, setCircuitType] = useState<'critical' | 'standard'>('critical'); // 3% vs 10%

  // Calculations for Battery Voltage Test
  const calculateBatteryHealth = () => {
    if (testMode === 'charging') {
      if (batteryVoltage > 15.2) {
        return {
          soc: 100,
          status: 'Overcharging (Regulator / Alternator Fault)',
          color: 'text-error',
          badgeBg: 'bg-error-container text-on-error-container',
          rec: 'Voltage exceeds 15.0V! High risk of boiling electrolyte and damaging vehicle ECUs. Inspect alternator diode bridge and internal regulator immediately.',
        };
      } else if (batteryVoltage >= 13.8 && batteryVoltage <= 14.8) {
        return {
          soc: 100,
          status: 'Optimal Alternator Charging',
          color: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-400',
          rec: 'Alternator charging circuit is operating at factory nominal output (13.8V - 14.8V). Diodes and field coil healthy.',
        };
      } else if (batteryVoltage >= 13.0 && batteryVoltage < 13.8) {
        return {
          soc: 90,
          status: 'Weak / Float Charging Output',
          color: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300',
          rec: 'Charging voltage is lower than ideal under load. Check serpentine belt tension and alternator ground strap.',
        };
      } else {
        return {
          soc: 20,
          status: 'No Alternator Output (Running on Battery)',
          color: 'text-error',
          badgeBg: 'bg-error-container text-on-error-container',
          rec: 'Alternator is not providing adequate charging current. Vehicle is depleting battery reserve. Replace alternator.',
        };
      }
    }

    if (testMode === 'cranking') {
      if (batteryVoltage >= 10.2) {
        return {
          soc: 100,
          status: 'Excellent Cranking Health',
          color: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-400',
          rec: 'Minimal internal resistance drop under heavy starter draw (>10.0V). Cold cranking amps (CCA) fully verified.',
        };
      } else if (batteryVoltage >= 9.6) {
        return {
          soc: 75,
          status: 'Marginal Cranking Health (Acceptable)',
          color: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300',
          rec: 'Meets minimum SAE J537 threshold (9.6V at 20°C). May struggle in sub-zero winter temperatures.',
        };
      } else {
        return {
          soc: 30,
          status: 'Excessive Cranking Drop (Failing Battery / Starter)',
          color: 'text-error',
          badgeBg: 'bg-error-container text-on-error-container',
          rec: 'Voltage collapsed below 9.6V during engine crank. High internal cell resistance or worn starter motor dragging excessive current.',
        };
      }
    }

    // Resting Mode
    let full = 12.65;
    let empty = 11.9;
    if (batteryType === 'agm') {
      full = 12.85;
      empty = 12.0;
    } else if (batteryType === 'lithium') {
      full = 13.4;
      empty = 12.8;
    }

    const socPct = Math.max(0, Math.min(100, Math.round(((batteryVoltage - empty) / (full - empty)) * 100)));

    if (socPct >= 90) {
      return {
        soc: socPct,
        status: '100% Fully Charged (Optimal)',
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-400',
        rec: 'Battery is at full chemical charge with negligible surface charge. Ideal for key-off parasitic drain testing.',
      };
    } else if (socPct >= 65) {
      return {
        soc: socPct,
        status: '75% Nominal State of Charge',
        color: 'text-cyan-300',
        badgeBg: 'bg-cyan-500/20 text-cyan-300',
        rec: 'Adequate charge for engine startup, but recharge recommended before prolonged accessory use.',
      };
    } else if (socPct >= 40) {
      return {
        soc: socPct,
        status: '50% Discharged (Requires Charging)',
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-300',
        rec: 'Battery is significantly discharged. Extended storage at this voltage causes plate sulfation.',
      };
    } else {
      return {
        soc: socPct,
        status: 'Critically Discharged / Depleted',
        color: 'text-error',
        badgeBg: 'bg-error-container text-on-error-container',
        rec: 'Severe sulfation risk. Fast charge or perform desulfation reconditioning pulse charge.',
      };
    }
  };

  const batteryResult = calculateBatteryHealth();

  // Ohm's Law Solver
  const solveOhmsLaw = () => {
    let v = valV;
    let i = valI;
    let r = valR;
    let p = valP;

    if (knownPair === 'VI') {
      r = i !== 0 ? v / i : 0;
      p = v * i;
    } else if (knownPair === 'VR') {
      i = r !== 0 ? v / r : 0;
      p = r !== 0 ? (v * v) / r : 0;
    } else if (knownPair === 'IR') {
      v = i * r;
      p = i * i * r;
    } else if (knownPair === 'VP') {
      i = v !== 0 ? p / v : 0;
      r = p !== 0 ? (v * v) / p : 0;
    } else if (knownPair === 'IP') {
      v = i !== 0 ? p / i : 0;
      r = i !== 0 ? p / (i * i) : 0;
    }

    const recommendedFuse = Math.ceil((i * 1.25) / 5) * 5; // standard automotive blade fuse sizes (5, 10, 15, 20, 25, 30)

    return {
      v: Math.round(v * 100) / 100,
      i: Math.round(i * 100) / 100,
      r: Math.round(r * 1000) / 1000,
      p: Math.round(p * 10) / 10,
      fuse: Math.max(5, recommendedFuse),
    };
  };

  const ohmsResult = solveOhmsLaw();

  // Preset circuits for Ohm's Law
  const applyOhmsPreset = (name: string, v: number, i?: number, r?: number, p?: number) => {
    if (v && i) {
      setKnownPair('VI');
      setValV(v);
      setValI(i);
    } else if (v && r) {
      setKnownPair('VR');
      setValV(v);
      setValR(r);
    } else if (v && p) {
      setKnownPair('VP');
      setValV(v);
      setValP(p);
    }
  };

  // Voltage Drop Solver (SAE J1128)
  const calculateVoltageDrop = () => {
    const gauge = AUTOMOTIVE_WIRE_GAUGES[selectedGaugeIdx];
    // Convert wire length to meters for loop (supply + ground return = 2x length)
    const lengthMeters = lengthUnit === 'm' ? wireLength : wireLength * 0.3048;
    const totalConductorLengthKm = (lengthMeters * 2) / 1000;

    const totalResistanceOhms = totalConductorLengthKm * gauge.resistancePer1000m;
    const vDrop = loadAmps * totalResistanceOhms;
    const vLoad = Math.max(0, sourceVoltage - vDrop);
    const dropPct = (vDrop / sourceVoltage) * 100;

    const maxAllowedPct = circuitType === 'critical' ? 3.0 : 10.0;
    const isPassing = dropPct <= maxAllowedPct;

    return {
      gauge,
      totalResistanceOhms: Math.round(totalResistanceOhms * 1000) / 1000,
      vDrop: Math.round(vDrop * 1000) / 1000,
      vLoad: Math.round(vLoad * 100) / 100,
      dropPct: Math.round(dropPct * 10) / 10,
      maxAllowedPct,
      isPassing,
    };
  };

  const dropResult = calculateVoltageDrop();

  return (
    <div className="space-y-6">
      {/* 1. BATTERY VOLTAGE TEST CALCULATOR */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
              <span className="material-symbols-outlined text-2xl">battery_charging_full</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'فاحص جهد البطارية وحالة الشحن (SOC)' : 'Battery Voltage & State of Charge (SOC) Analyzer'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                {lang === 'ar'
                  ? 'تحليل جهد السكون، وهبوط الجهد أثناء التدوير، ونظام الشحن بالدينامو'
                  : 'Resting Open-Circuit Voltage (OCV), Starter Cranking Load & Alternator Charging'}
              </p>
            </div>
          </div>

          {/* Test Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-white/5">
            {[
              { id: 'resting', label: 'Resting OCV' },
              { id: 'cranking', label: 'Cranking Load' },
              { id: 'charging', label: 'Alternator Charging' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setTestMode(m.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-code-sm font-semibold transition-all cursor-pointer ${
                  testMode === m.id
                    ? 'bg-primary-container text-on-primary-container shadow-md'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls and Gauge Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-code-sm text-xs text-outline uppercase font-semibold">
                Battery Chemistry
              </span>
              <div className="flex gap-1.5">
                {[
                  { id: 'lead-acid', label: 'Flooded (Standard)' },
                  { id: 'agm', label: 'AGM / EFB' },
                  { id: 'lithium', label: 'Lithium (LiFePO4)' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBatteryType(b.id as any)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-code-sm font-bold transition-colors cursor-pointer ${
                      batteryType === b.id
                        ? 'bg-secondary-container text-on-secondary-container border border-secondary/40'
                        : 'bg-surface-container-high text-outline hover:text-on-surface'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voltage Input Slider & Direct Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-code-sm">
                <label className="text-xs text-outline">
                  Measured Multimeter / Scan Tool Voltage
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    min="9.0"
                    max="16.5"
                    value={batteryVoltage}
                    onChange={(e) => setBatteryVoltage(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-surface-container-lowest text-primary-container font-mono font-bold text-base px-2.5 py-1 rounded-lg border border-white/10 text-right focus:border-primary-container focus:outline-none"
                  />
                  <span className="font-mono text-sm text-outline font-bold">V</span>
                </div>
              </div>

              <input
                type="range"
                min="9.0"
                max="16.5"
                step="0.05"
                value={batteryVoltage}
                onChange={(e) => setBatteryVoltage(parseFloat(e.target.value))}
                className="w-full accent-primary-container cursor-pointer"
              />

              <div className="flex justify-between text-[10px] font-mono text-outline">
                <span>9.0V (Critical)</span>
                <span>12.0V (50% SOC)</span>
                <span>12.6V (100% OCV)</span>
                <span>14.4V (Charging)</span>
                <span>16.5V (Overcharge)</span>
              </div>
            </div>

            {/* Quick Benchmark Presets */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[11px] text-outline self-center font-code-sm">Presets:</span>
              {[
                { v: 12.65, label: '100% Full' },
                { v: 12.24, label: '50% Depleted' },
                { v: 11.9, label: '0% Dead' },
                { v: 10.4, label: 'Crank Pass' },
                { v: 8.8, label: 'Crank Fail' },
                { v: 14.4, label: 'Alternator OK' },
              ].map((p) => (
                <button
                  key={p.v}
                  type="button"
                  onClick={() => setBatteryVoltage(p.v)}
                  className="px-2 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface text-[11px] font-mono transition-colors cursor-pointer border border-white/5"
                >
                  {p.label} ({p.v}V)
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostic Result Card */}
          <div className="lg:col-span-5 bg-surface-container-low p-5 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold">
                DIAGNOSTIC STATUS
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-code-sm ${batteryResult.badgeBg}`}>
                {batteryResult.status}
              </span>
            </div>

            {/* State of Charge Bar */}
            <div className="space-y-1.5 font-code-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-outline">Estimated State of Charge (SOC)</span>
                <span className="font-mono text-xl font-black text-on-surface">
                  {batteryResult.soc}%
                </span>
              </div>
              <div className="w-full bg-surface-container-lowest h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    batteryResult.soc > 70
                      ? 'bg-emerald-400 shadow-[0_0_10px_#4ade80]'
                      : batteryResult.soc > 30
                      ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                      : 'bg-error shadow-[0_0_10px_#ef4444]'
                  }`}
                  style={{ width: `${batteryResult.soc}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-surface-container rounded-lg border border-white/5 text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-primary-container block mb-1">
                Technician Recommendation:
              </span>
              {batteryResult.rec}
            </div>
          </div>
        </div>
      </div>

      {/* 2. OHM'S LAW CALCULATOR */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary-container/20 text-secondary border border-secondary/30">
              <span className="material-symbols-outlined text-2xl">electric_bolt</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبة قانون أوم والقدرة الكهربائية' : "Ohm's Law & Circuit Power Calculator"}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Automotive Circuit Diagnostics: V = I × R • P = V × I • Fuse Sizing
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-white/5 text-xs font-code-sm">
            {[
              { id: 'VI', label: 'V & I Known' },
              { id: 'VR', label: 'V & R Known' },
              { id: 'IR', label: 'I & R Known' },
              { id: 'VP', label: 'V & P Known' },
            ].map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => setKnownPair(pair.id as any)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  knownPair === pair.id
                    ? 'bg-secondary text-on-secondary shadow-md'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                {pair.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs and Output Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-6 space-y-4">
            <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold block">
              ENTER KNOWN CIRCUIT VALUES
            </span>

            {/* Input 1 */}
            {(knownPair === 'VI' || knownPair === 'VR' || knownPair === 'VP') && (
              <div className="space-y-1">
                <label className="font-code-sm text-xs text-outline">Voltage (V)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={valV}
                    onChange={(e) => setValV(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-secondary focus:outline-none"
                  />
                  <span className="font-mono text-xs text-outline font-bold">Volts (V)</span>
                </div>
              </div>
            )}

            {/* Input 2 */}
            {(knownPair === 'VI' || knownPair === 'IR') && (
              <div className="space-y-1">
                <label className="font-code-sm text-xs text-outline">Current Draw (I)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={valI}
                    onChange={(e) => setValI(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-secondary focus:outline-none"
                  />
                  <span className="font-mono text-xs text-outline font-bold">Amps (A)</span>
                </div>
              </div>
            )}

            {/* Input 3 (Resistance) */}
            {(knownPair === 'VR' || knownPair === 'IR') && (
              <div className="space-y-1">
                <label className="font-code-sm text-xs text-outline">Resistance (R)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={valR}
                    onChange={(e) => setValR(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-secondary focus:outline-none"
                  />
                  <span className="font-mono text-xs text-outline font-bold">Ohms (Ω)</span>
                </div>
              </div>
            )}

            {/* Input 4 (Power) */}
            {knownPair === 'VP' && (
              <div className="space-y-1">
                <label className="font-code-sm text-xs text-outline">Power Rating (P)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    value={valP}
                    onChange={(e) => setValP(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:border-secondary focus:outline-none"
                  />
                  <span className="font-mono text-xs text-outline font-bold">Watts (W)</span>
                </div>
              </div>
            )}

            {/* Presets */}
            <div className="pt-2">
              <span className="text-[11px] text-outline font-code-sm block mb-1.5">
                Automotive Component Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyOhmsPreset('headlight', 12.0, undefined, undefined, 55)}
                  className="px-2.5 py-1 rounded bg-surface-container-high text-xs font-code-sm hover:bg-surface-bright text-on-surface cursor-pointer border border-white/5"
                >
                  Headlight (55W)
                </button>
                <button
                  type="button"
                  onClick={() => applyOhmsPreset('injector', 12.0, undefined, 12.0)}
                  className="px-2.5 py-1 rounded bg-surface-container-high text-xs font-code-sm hover:bg-surface-bright text-on-surface cursor-pointer border border-white/5"
                >
                  Fuel Injector (12Ω)
                </button>
                <button
                  type="button"
                  onClick={() => applyOhmsPreset('defroster', 12.0, 20.0)}
                  className="px-2.5 py-1 rounded bg-surface-container-high text-xs font-code-sm hover:bg-surface-bright text-on-surface cursor-pointer border border-white/5"
                >
                  Rear Defogger (20A)
                </button>
                <button
                  type="button"
                  onClick={() => applyOhmsPreset('starter', 10.5, undefined, undefined, 1400)}
                  className="px-2.5 py-1 rounded bg-surface-container-high text-xs font-code-sm hover:bg-surface-bright text-on-surface cursor-pointer border border-white/5"
                >
                  Starter Motor (1.4kW)
                </button>
              </div>
            </div>
          </div>

          {/* Outputs 4-Quadrant Matrix */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3">
            <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-outline uppercase">Voltage (V)</span>
              <p className="font-mono text-2xl font-black text-primary-container">
                {ohmsResult.v} <span className="text-xs font-bold text-outline">V</span>
              </p>
              <p className="text-[10px] text-outline font-mono">Formula: V = I × R</p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-outline uppercase">Current (I)</span>
              <p className="font-mono text-2xl font-black text-secondary">
                {ohmsResult.i} <span className="text-xs font-bold text-outline">A</span>
              </p>
              <p className="text-[10px] text-outline font-mono">Formula: I = V / R</p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-outline uppercase">Resistance (R)</span>
              <p className="font-mono text-2xl font-black text-cyan-300">
                {ohmsResult.r} <span className="text-xs font-bold text-outline">Ω</span>
              </p>
              <p className="text-[10px] text-outline font-mono">Formula: R = V / I</p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-mono text-outline uppercase">Power Dissipation (P)</span>
              <p className="font-mono text-2xl font-black text-amber-400">
                {ohmsResult.p} <span className="text-xs font-bold text-outline">W</span>
              </p>
              <p className="text-[10px] text-outline font-mono">Formula: P = V × I</p>
            </div>

            <div className="col-span-2 p-3 bg-surface-container-lowest rounded-lg border border-white/5 flex items-center justify-between text-xs font-code-sm">
              <span className="text-outline flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary-container">verified</span>
                <span>Recommended SAE Blade Fuse:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded bg-primary-container/20 text-primary-container font-mono font-bold">
                {ohmsResult.fuse}A Fuse (125% Headroom)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VOLTAGE DROP CALCULATOR */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <span className="material-symbols-outlined text-2xl">cable</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبة هبوط الجهد ومعيار الأسلاك (SAE J1128)' : 'Automotive Wire Sizing & Voltage Drop Calculator'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Loop Resistance • 3% Critical Limit vs 10% Non-Critical Limit • Copper Wire Resistivity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-white/5 text-xs font-code-sm">
            <button
              type="button"
              onClick={() => setCircuitType('critical')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                circuitType === 'critical'
                  ? 'bg-cyan-500 text-neutral-950 shadow-md'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Critical (&le; 3% Drop)
            </button>
            <button
              type="button"
              onClick={() => setCircuitType('standard')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                circuitType === 'standard'
                  ? 'bg-cyan-500 text-neutral-950 shadow-md'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Accessory (&le; 10% Drop)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Source Voltage */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Supply Voltage</label>
            <div className="flex gap-1.5">
              {[12.6, 14.0, 24.0].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSourceVoltage(v)}
                  className={`flex-1 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer ${
                    sourceVoltage === v
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-high text-outline hover:text-on-surface'
                  }`}
                >
                  {v}V
                </button>
              ))}
            </div>
          </div>

          {/* Current */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Circuit Current</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={loadAmps}
                onChange={(e) => setLoadAmps(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">Amps</span>
            </div>
          </div>

          {/* Wire Length */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-code-sm text-xs text-outline">One-Way Run Length</label>
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setLengthUnit('m')}
                  className={`px-1 rounded cursor-pointer ${lengthUnit === 'm' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-outline'}`}
                >
                  Meters (m)
                </button>
                <button
                  type="button"
                  onClick={() => setLengthUnit('ft')}
                  className={`px-1 rounded cursor-pointer ${lengthUnit === 'ft' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-outline'}`}
                >
                  Feet (ft)
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={wireLength}
                onChange={(e) => setWireLength(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">{lengthUnit}</span>
            </div>
          </div>

          {/* Wire Gauge */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Conductor Wire Gauge</label>
            <select
              value={selectedGaugeIdx}
              onChange={(e) => setSelectedGaugeIdx(parseInt(e.target.value))}
              className="w-full bg-surface-container-lowest text-cyan-300 font-mono font-bold text-xs px-2.5 py-2 rounded-lg border border-white/10 focus:outline-none cursor-pointer"
            >
              {AUTOMOTIVE_WIRE_GAUGES.map((g, idx) => (
                <option key={g.awg} value={idx}>
                  {g.awg} ({g.mm2} mm²)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-outline uppercase">Voltage Drop</span>
            <p className="font-mono text-xl font-bold text-on-surface">
              {dropResult.vDrop} <span className="text-xs text-outline font-normal">V</span>
            </p>
            <p className="text-[11px] font-mono text-outline">
              Loop Drop: {dropResult.dropPct}%
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-outline uppercase">Voltage At Load Terminal</span>
            <p className="font-mono text-xl font-bold text-primary-container">
              {dropResult.vLoad} <span className="text-xs text-outline font-normal">V</span>
            </p>
            <p className="text-[11px] font-mono text-outline">
              Target: &gt; {(sourceVoltage * (1 - dropResult.maxAllowedPct / 100)).toFixed(2)}V
            </p>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-outline uppercase">Total Loop Resistance</span>
            <p className="font-mono text-xl font-bold text-secondary">
              {dropResult.totalResistanceOhms} <span className="text-xs text-outline font-normal">Ω</span>
            </p>
            <p className="text-[11px] font-mono text-outline">
              Conductor: {dropResult.gauge.mm2} mm²
            </p>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            dropResult.isPassing
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-error-container/30 border-error/40 text-error'
          }`}>
            <span className="text-[10px] font-mono uppercase font-bold">COMPLIANCE RESULT</span>
            <p className="font-code-sm text-base font-black uppercase">
              {dropResult.isPassing ? 'PASSED (SAFE)' : 'FAIL: EXCESSIVE DROP'}
            </p>
            <p className="text-[10px] text-outline">
              {dropResult.isPassing
                ? 'Within acceptable SAE limits'
                : 'Upgrade to heavier wire gauge!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
