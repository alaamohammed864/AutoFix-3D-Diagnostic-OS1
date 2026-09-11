import React, { useState } from 'react';
import { Language } from '../types';

interface MechanicalCalculatorsProps {
  lang: Language;
}

export const MechanicalCalculators: React.FC<MechanicalCalculatorsProps> = ({ lang }) => {
  // 9. Engine Displacement State
  const [dispUnit, setDispUnit] = useState<'mm' | 'in'>('mm');
  const [bore, setBore] = useState<number>(91.0); // mm
  const [stroke, setStroke] = useState<number>(76.4); // mm
  const [cylinders, setCylinders] = useState<number>(6);
  const [chamberCc, setChamberCc] = useState<number>(55.0);

  // 10. Gear Ratio State
  const [gearRatio, setGearRatio] = useState<number>(1.0); // e.g. 4th or 5th direct
  const [finalDrive, setFinalDrive] = useState<number>(3.44);
  const [tireDiamInches, setTireDiamInches] = useState<number>(26.5);
  const [engineRpm, setEngineRpm] = useState<number>(3000);

  // 11. Wheel/Tire Comparison State
  const [tire1Width, setTire1Width] = useState<number>(235);
  const [tire1Aspect, setTire1Aspect] = useState<number>(45);
  const [tire1Rim, setTire1Rim] = useState<number>(18);

  const [tire2Width, setTire2Width] = useState<number>(245);
  const [tire2Aspect, setTire2Aspect] = useState<number>(40);
  const [tire2Rim, setTire2Rim] = useState<number>(19);

  // 12. Brake Rotor State
  const [rotorUnit, setRotorUnit] = useState<'mm' | 'in'>('mm');
  const [nominalThick, setNominalThick] = useState<number>(32.0); // mm
  const [currentThick, setCurrentThick] = useState<number>(30.8); // mm
  const [discardThick, setDiscardThick] = useState<number>(30.0); // mm
  const [runoutDtv, setRunoutDtv] = useState<number>(0.03); // mm

  // 13. Coolant Ratio State
  const [coolantCap, setCoolantCap] = useState<number>(8.5); // Liters
  const [coolantCapUnit, setCoolantCapUnit] = useState<'L' | 'gal' | 'qt'>('L');
  const [antifreezePct, setAntifreezePct] = useState<number>(50); // 50%

  // 9. Engine Displacement Calculation
  const calculateDisplacement = () => {
    // Convert to cm for calculation
    const boreCm = dispUnit === 'mm' ? bore / 10 : bore * 2.54;
    const strokeCm = dispUnit === 'mm' ? stroke / 10 : stroke * 2.54;

    const singleCylinderCc = (Math.PI / 4) * Math.pow(boreCm, 2) * strokeCm;
    const totalCc = singleCylinderCc * cylinders;
    const totalLiters = totalCc / 1000;
    const totalCubicInches = totalCc * 0.0610237;

    // Bore / Stroke Ratio
    const bsRatio = (boreCm / strokeCm);
    let engineType = 'Square (Bore = Stroke)';
    if (bsRatio > 1.05) engineType = 'Over-square / Short Stroke (High-revving sportscar)';
    if (bsRatio < 0.95) engineType = 'Under-square / Long Stroke (High low-end torque)';

    // Compression Ratio = (Displacement + Chamber) / Chamber
    const compressionRatio = (singleCylinderCc + chamberCc) / chamberCc;

    return {
      totalCc: Math.round(totalCc),
      totalLiters: Math.round(totalLiters * 100) / 100,
      totalCi: Math.round(totalCubicInches * 10) / 10,
      singleCc: Math.round(singleCylinderCc * 10) / 10,
      bsRatio: Math.round(bsRatio * 100) / 100,
      engineType,
      compressionRatio: Math.round(compressionRatio * 10) / 10,
    };
  };

  const dispResult = calculateDisplacement();

  // Presets for Engine Displacement
  const applyEnginePreset = (b: number, s: number, cyl: number, name: string) => {
    setDispUnit('mm');
    setBore(b);
    setStroke(s);
    setCylinders(cyl);
  };

  // 10. Gear Ratio Calculation
  const calculateGearSpeed = () => {
    const totalReduction = gearRatio * finalDrive;
    if (totalReduction <= 0) return { speedMph: 0, speedKmh: 0, wheelRpm: 0 };

    const wheelRpm = engineRpm / totalReduction;
    const tireCircumferenceMiles = (Math.PI * tireDiamInches) / (12 * 5280);
    const speedMph = wheelRpm * tireCircumferenceMiles * 60;
    const speedKmh = speedMph * 1.60934;

    // Highway cruise RPM at 65 mph (104.6 km/h)
    const cruiseRpmAt65Mph = Math.round((65 / (tireCircumferenceMiles * 60)) * totalReduction);

    return {
      totalReduction: Math.round(totalReduction * 100) / 100,
      speedMph: Math.round(speedMph * 10) / 10,
      speedKmh: Math.round(speedKmh * 10) / 10,
      wheelRpm: Math.round(wheelRpm),
      cruiseRpmAt65Mph,
    };
  };

  const gearResult = calculateGearSpeed();

  // 11. Tire Size Comparison Calculations
  const calculateTireSpecs = (width: number, aspect: number, rim: number) => {
    const sidewallMm = width * (aspect / 100);
    const sidewallIn = sidewallMm / 25.4;
    const overallDiamIn = rim + (2 * sidewallIn);
    const overallDiamMm = overallDiamIn * 25.4;
    const circumferenceMm = Math.PI * overallDiamMm;
    const revsPerKm = 1000000 / circumferenceMm;
    const revsPerMile = revsPerKm * 1.60934;

    return {
      sidewallMm: Math.round(sidewallMm * 10) / 10,
      sidewallIn: Math.round(sidewallIn * 100) / 100,
      overallDiamMm: Math.round(overallDiamMm * 10) / 10,
      overallDiamIn: Math.round(overallDiamIn * 100) / 100,
      circumferenceMm: Math.round(circumferenceMm),
      revsPerMile: Math.round(revsPerMile),
    };
  };

  const tire1 = calculateTireSpecs(tire1Width, tire1Aspect, tire1Rim);
  const tire2 = calculateTireSpecs(tire2Width, tire2Aspect, tire2Rim);

  const diamDeltaMm = Math.round((tire2.overallDiamMm - tire1.overallDiamMm) * 10) / 10;
  const diamDeltaPct = Math.round(((tire2.overallDiamMm - tire1.overallDiamMm) / tire1.overallDiamMm) * 1000) / 10;
  const speedAt60Mph = Math.round((60 * (tire2.overallDiamMm / tire1.overallDiamMm)) * 10) / 10;
  const isTireFitSafe = Math.abs(diamDeltaPct) <= 2.5;

  // 12. Brake Rotor Wear Calculation
  const calculateRotorSafety = () => {
    const wearAvailable = nominalThick - discardThick;
    const currentWear = nominalThick - currentThick;
    const remainingMm = currentThick - discardThick;
    const lifePct = wearAvailable > 0 ? Math.max(0, Math.min(100, Math.round((remainingMm / wearAvailable) * 100))) : 0;

    let status = 'PASS (Normal Service Life)';
    let badgeBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    let rec = 'Rotor thickness is well within factory safety margins. Clean pad surface contact area.';

    if (currentThick <= discardThick) {
      status = 'DANGER: SCRAP LIMIT EXCEEDED';
      badgeBg = 'bg-error-container text-on-error-container border border-error/50';
      rec = 'Rotor is at or below the legal minimum discard thickness. Extreme risk of heat-cracking and brake fade. Replace immediately.';
    } else if (runoutDtv > 0.05) {
      status = 'HIGH RUNOUT (Brake Pulsation Risk)';
      badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      rec = 'Lateral runout / disc thickness variation (DTV) exceeds 0.05mm (0.002 in), causing pedal vibration during high-speed braking. Machine or replace.';
    } else if (lifePct < 25) {
      status = 'MARGINAL (Replacement Due Soon)';
      badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      rec = 'Remaining usable material is below 25%. Do not machine on brake lathe as it will breach discard spec.';
    }

    return {
      wearAvailable: Math.round(wearAvailable * 100) / 100,
      currentWear: Math.round(currentWear * 100) / 100,
      remainingMm: Math.round(remainingMm * 100) / 100,
      lifePct,
      status,
      badgeBg,
      rec,
    };
  };

  const rotorResult = calculateRotorSafety();

  // 13. Coolant Ratio Calculation
  const calculateCoolantMix = () => {
    const antifreezeFraction = antifreezePct / 100;
    const waterFraction = (100 - antifreezePct) / 100;

    const coolantVolume = Math.round(coolantCap * antifreezeFraction * 100) / 100;
    const waterVolume = Math.round(coolantCap * waterFraction * 100) / 100;

    // Freeze & Boil points lookup based on typical ethylene glycol curves
    let freezeC = -37;
    let boilC = 129; // with 15 psi cap
    if (antifreezePct <= 35) {
      freezeC = -20;
      boilC = 123;
    } else if (antifreezePct <= 45) {
      freezeC = -30;
      boilC = 126;
    } else if (antifreezePct === 50) {
      freezeC = -37;
      boilC = 129;
    } else if (antifreezePct <= 60) {
      freezeC = -52;
      boilC = 132;
    } else {
      freezeC = -45; // pure coolant actually freezes warmer than 68% eutectic mix
      boilC = 135;
    }

    const freezeF = Math.round((freezeC * 9) / 5 + 32);
    const boilF = Math.round((boilC * 9) / 5 + 32);

    return {
      coolantVolume,
      waterVolume,
      freezeC,
      freezeF,
      boilC,
      boilF,
    };
  };

  const coolantResult = calculateCoolantMix();

  return (
    <div className="space-y-6">
      {/* 9. ENGINE DISPLACEMENT CALCULATOR */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <span className="material-symbols-outlined text-2xl">settings_input_component</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبة سعة المحرك ونسبة الانضغاط' : 'Engine Displacement & Compression Ratio Calculator'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Bore × Stroke • Cylinder Geometry • cc • Liters • Cubic Inches (ci) • Bore/Stroke Ratio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-white/5 text-xs font-code-sm">
            <button
              type="button"
              onClick={() => setDispUnit('mm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                dispUnit === 'mm' ? 'bg-primary-container text-on-primary-container shadow-md' : 'text-outline'
              }`}
            >
              Metric (mm)
            </button>
            <button
              type="button"
              onClick={() => setDispUnit('in')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                dispUnit === 'in' ? 'bg-primary-container text-on-primary-container shadow-md' : 'text-outline'
              }`}
            >
              Imperial (in)
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bore */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Cylinder Bore Diameter</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={dispUnit === 'mm' ? '0.5' : '0.01'}
                value={bore}
                onChange={(e) => setBore(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">{dispUnit}</span>
            </div>
          </div>

          {/* Stroke */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Piston Stroke Length</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step={dispUnit === 'mm' ? '0.5' : '0.01'}
                value={stroke}
                onChange={(e) => setStroke(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">{dispUnit}</span>
            </div>
          </div>

          {/* Cylinders */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Cylinder Count</label>
            <select
              value={cylinders}
              onChange={(e) => setCylinders(parseInt(e.target.value))}
              className="w-full bg-surface-container-lowest text-primary-container font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((num) => (
                <option key={num} value={num}>
                  {num} Cylinders ({num === 4 ? 'Inline-4' : num === 6 ? 'V6 / Flat-6' : num === 8 ? 'V8' : `${num}-cyl`})
                </option>
              ))}
            </select>
          </div>

          {/* Chamber Volume */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Chamber Head Volume (cc)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                value={chamberCc}
                onChange={(e) => setChamberCc(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">cc</span>
            </div>
          </div>
        </div>

        {/* Results Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-code-sm">
          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-0.5">
            <span className="text-[10px] text-outline uppercase font-bold">Total Displacement</span>
            <p className="font-mono text-2xl font-black text-orange-400">
              {dispResult.totalLiters} <span className="text-xs text-outline">Liters</span>
            </p>
            <p className="text-[10px] text-outline font-mono">{dispResult.totalCc} cc / {dispResult.totalCi} ci</p>
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-0.5">
            <span className="text-[10px] text-outline uppercase font-bold">Per Cylinder</span>
            <p className="font-mono text-2xl font-black text-primary-container">
              {dispResult.singleCc} <span className="text-xs text-outline">cc</span>
            </p>
            <p className="text-[10px] text-outline font-mono">Swept Volume</p>
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-0.5">
            <span className="text-[10px] text-outline uppercase font-bold">Bore / Stroke Ratio</span>
            <p className="font-mono text-2xl font-black text-secondary">
              {dispResult.bsRatio}
            </p>
            <p className="text-[10px] text-outline font-mono truncate">{dispResult.engineType.split(' ')[0]}</p>
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-0.5">
            <span className="text-[10px] text-outline uppercase font-bold">Static Compression</span>
            <p className="font-mono text-2xl font-black text-cyan-300">
              {dispResult.compressionRatio}:1
            </p>
            <p className="text-[10px] text-outline font-mono">Calculated Ratio</p>
          </div>

          <div className="col-span-2 lg:col-span-1 p-3.5 bg-surface-container-low rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] text-outline uppercase font-bold">Geometry Class</span>
            <p className="text-xs text-on-surface font-semibold leading-tight">
              {dispResult.engineType}
            </p>
          </div>
        </div>

        {/* Engine Benchmark Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-code-sm text-xs">
          <span className="text-outline">Load Production Engine:</span>
          {[
            { name: 'Porsche 911 3.0L Flat-6', b: 91.0, s: 76.4, c: 6 },
            { name: 'Toyota 2.5L Dynamic Force I4', b: 87.5, s: 103.4, c: 4 },
            { name: 'Chevy Small Block 350 V8', b: 101.6, s: 88.4, c: 8 },
            { name: 'Ford 5.0L Coyote V8', b: 93.0, s: 92.7, c: 8 },
            { name: 'Honda K20 2.0L I4', b: 86.0, s: 86.0, c: 4 },
          ].map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => applyEnginePreset(item.b, item.s, item.c, item.name)}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono transition-colors cursor-pointer border border-white/5"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* 10. GEAR RATIO & VEHICLE ROAD SPEED CALCULATOR */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <span className="material-symbols-outlined text-2xl">auto_mode</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبة نسب التروس وسرعة المركبة' : 'Transmission Gear Ratio & Vehicle Speed Calculator'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Gear Ratio × Final Drive Diff Ratio • Tire Outer Diameter • Engine RPM to Road Speed (km/h & mph)
              </p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Transmission Gear Ratio */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Transmission Gear Ratio</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                value={gearRatio}
                onChange={(e) => setGearRatio(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-teal-300 font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">:1</span>
            </div>
          </div>

          {/* Final Drive Differential Ratio */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Final Drive Axle Ratio</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                value={finalDrive}
                onChange={(e) => setFinalDrive(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">:1</span>
            </div>
          </div>

          {/* Tire Diameter */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Tire Outer Diameter</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={tireDiamInches}
                onChange={(e) => setTireDiamInches(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">inches</span>
            </div>
          </div>

          {/* Engine RPM */}
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Engine Tachometer RPM</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="100"
                value={engineRpm}
                onChange={(e) => setEngineRpm(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-primary-container font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">RPM</span>
            </div>
          </div>
        </div>

        {/* Sliders and Visual Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-2">
            <div className="flex justify-between text-xs font-code-sm text-outline">
              <span>Interactive Engine Tachometer Sweep</span>
              <span className="font-mono font-bold text-primary-container">{engineRpm} RPM</span>
            </div>
            <input
              type="range"
              min="1000"
              max="8000"
              step="50"
              value={engineRpm}
              onChange={(e) => setEngineRpm(parseInt(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-outline">
              <span>Idle 1,000</span>
              <span>3,000</span>
              <span>5,000</span>
              <span>Redline 8,000 RPM</span>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-3 gap-3">
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1 text-center">
              <span className="text-[10px] font-mono text-outline uppercase font-bold">Road Speed (km/h)</span>
              <p className="font-mono text-2xl font-black text-teal-400">
                {gearResult.speedKmh}
              </p>
              <p className="text-[10px] text-outline font-mono">km/h</p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1 text-center">
              <span className="text-[10px] font-mono text-outline uppercase font-bold">Road Speed (mph)</span>
              <p className="font-mono text-2xl font-black text-primary-container">
                {gearResult.speedMph}
              </p>
              <p className="text-[10px] text-outline font-mono">mph</p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1 text-center">
              <span className="text-[10px] font-mono text-outline uppercase font-bold">Cruise at 65 mph</span>
              <p className="font-mono text-2xl font-black text-secondary">
                {gearResult.cruiseRpmAt65Mph}
              </p>
              <p className="text-[10px] text-outline font-mono">RPM</p>
            </div>
          </div>
        </div>
      </div>

      {/* 11. WHEEL & TIRE SIZE COMPARISON CALCULATOR */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <span className="material-symbols-outlined text-2xl">tire_repair</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبة مقارنة مقاسات الإطارات والجنوط' : 'Wheel & Tire Size Comparison & Speedo Error Calculator'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Original vs Upgrade Comparison • Sidewall Height • Overall Diameter • Circumference • Speedometer Error %
              </p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded text-xs font-code-sm font-bold ${
            isTireFitSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-error-container text-on-error-container'
          }`}>
            {isTireFitSafe ? 'Safe Size Difference (< 2.5%)' : 'Caution: High Diameter Variance (> 2.5%)'}
          </span>
        </div>

        {/* Dual Tire Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tire 1 (OEM Standard) */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center font-code-sm">
              <span className="font-bold text-xs text-primary-container">ORIGINAL OEM TIRE</span>
              <span className="font-mono text-sm font-bold text-on-surface">
                {tire1Width}/{tire1Aspect} R{tire1Rim}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-outline font-code-sm">Width (mm)</label>
                <input
                  type="number"
                  step="5"
                  value={tire1Width}
                  onChange={(e) => setTire1Width(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-outline font-code-sm">Aspect Ratio (%)</label>
                <input
                  type="number"
                  step="5"
                  value={tire1Aspect}
                  onChange={(e) => setTire1Aspect(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-outline font-code-sm">Rim Diam (in)</label>
                <input
                  type="number"
                  step="1"
                  value={tire1Rim}
                  onChange={(e) => setTire1Rim(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-outline pt-2 border-t border-white/5">
              <div>Diam: <span className="text-on-surface font-bold">{tire1.overallDiamMm} mm</span></div>
              <div>Sidewall: <span className="text-on-surface font-bold">{tire1.sidewallMm} mm</span></div>
              <div>Revs/km: <span className="text-on-surface font-bold">{Math.round(tire1.revsPerMile / 1.60934)}</span></div>
            </div>
          </div>

          {/* Tire 2 (New / Upgrade) */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center font-code-sm">
              <span className="font-bold text-xs text-secondary">NEW / PROPOSED TIRE</span>
              <span className="font-mono text-sm font-bold text-on-surface">
                {tire2Width}/{tire2Aspect} R{tire2Rim}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-outline font-code-sm">Width (mm)</label>
                <input
                  type="number"
                  step="5"
                  value={tire2Width}
                  onChange={(e) => setTire2Width(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-outline font-code-sm">Aspect Ratio (%)</label>
                <input
                  type="number"
                  step="5"
                  value={tire2Aspect}
                  onChange={(e) => setTire2Aspect(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/10"
                />
              </div>
              <div>
                <label className="text-[10px] text-outline font-code-sm">Rim Diam (in)</label>
                <input
                  type="number"
                  step="1"
                  value={tire2Rim}
                  onChange={(e) => setTire2Rim(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-2.5 py-1.5 rounded-lg border border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-outline pt-2 border-t border-white/5">
              <div>Diam: <span className="text-on-surface font-bold">{tire2.overallDiamMm} mm</span></div>
              <div>Sidewall: <span className="text-on-surface font-bold">{tire2.sidewallMm} mm</span></div>
              <div>Revs/km: <span className="text-on-surface font-bold">{Math.round(tire2.revsPerMile / 1.60934)}</span></div>
            </div>
          </div>
        </div>

        {/* Comparison Comparison Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-code-sm">
          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] text-outline uppercase font-bold">Diameter Delta</span>
            <p className="font-mono text-xl font-black text-on-surface">
              {diamDeltaMm > 0 ? `+${diamDeltaMm}` : diamDeltaMm} mm
            </p>
            <p className="text-[10px] text-outline font-mono">Variance: {diamDeltaPct > 0 ? `+${diamDeltaPct}` : diamDeltaPct}%</p>
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] text-outline uppercase font-bold">Speedo Error at 60 mph</span>
            <p className="font-mono text-xl font-black text-primary-container">
              {speedAt60Mph} mph
            </p>
            <p className="text-[10px] text-outline font-mono">Actual road speed</p>
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] text-outline uppercase font-bold">Speedo Error at 100 km/h</span>
            <p className="font-mono text-xl font-black text-secondary">
              {Math.round(100 * (tire2.overallDiamMm / tire1.overallDiamMm) * 10) / 10} km/h
            </p>
            <p className="text-[10px] text-outline font-mono">Cluster calibration delta</p>
          </div>

          <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] text-outline uppercase font-bold">Ride Height Delta</span>
            <p className="font-mono text-xl font-black text-cyan-300">
              {Math.round((diamDeltaMm / 2) * 10) / 10} mm
            </p>
            <p className="text-[10px] text-outline font-mono">Axle ground clearance</p>
          </div>
        </div>
      </div>

      {/* 12. BRAKE ROTOR MEASUREMENT & WEAR LIMITS */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="material-symbols-outlined text-2xl">adjust</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبة فحص سماكة أقراص الفرامل (الهوبات)' : 'Brake Rotor Thickness & Lateral Runout (DTV) Gauge'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Micrometer Thickness • Minimum Discard Scrap Limit • Lateral Runout DTV • Resurface vs Replace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-white/5 text-xs font-code-sm">
            <button
              type="button"
              onClick={() => setRotorUnit('mm')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                rotorUnit === 'mm' ? 'bg-primary-container text-on-primary-container shadow-md' : 'text-outline'
              }`}
            >
              mm
            </button>
            <button
              type="button"
              onClick={() => setRotorUnit('in')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                rotorUnit === 'in' ? 'bg-primary-container text-on-primary-container shadow-md' : 'text-outline'
              }`}
            >
              in
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Nominal New Thickness</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={nominalThick}
                onChange={(e) => setNominalThick(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">{rotorUnit}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Current Measured Thickness</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={currentThick}
                onChange={(e) => setCurrentThick(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-primary-container font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">{rotorUnit}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Discard / Minimum Scrap Limit</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={discardThick}
                onChange={(e) => setDiscardThick(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-error font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">{rotorUnit}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-code-sm text-xs text-outline">Dial Indicator Runout (DTV)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={runoutDtv}
                onChange={(e) => setRunoutDtv(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-amber-300 font-mono font-bold text-sm px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-xs text-outline font-bold">{rotorUnit}</span>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold">
                SAFETY INSPECTION DECISION:
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-code-sm ${rotorResult.badgeBg}`}>
                {rotorResult.status}
              </span>
            </div>

            <span className="font-mono text-xs text-outline">
              Remaining Wear Margin: <strong className="text-on-surface">{rotorResult.remainingMm} {rotorUnit}</strong> ({rotorResult.lifePct}%)
            </span>
          </div>

          {/* Wear Bar */}
          <div className="space-y-1 font-code-sm">
            <div className="w-full bg-surface-container-lowest h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rotorResult.lifePct > 50
                    ? 'bg-emerald-400'
                    : rotorResult.lifePct > 20
                    ? 'bg-amber-400'
                    : 'bg-error'
                }`}
                style={{ width: `${rotorResult.lifePct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-outline">
              <span>Discard {discardThick} {rotorUnit} (0%)</span>
              <span>Nominal New {nominalThick} {rotorUnit} (100%)</span>
            </div>
          </div>

          <div className="p-3 bg-surface-container rounded-lg border border-white/5 text-xs text-on-surface-variant leading-relaxed">
            <span className="font-bold text-primary-container block mb-1">
              SAE J431 Brake Lathe Protocol:
            </span>
            {rotorResult.rec}
          </div>
        </div>
      </div>

      {/* 13. COOLANT RATIO & CONCENTRATE CALCULATOR */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <span className="material-symbols-outlined text-2xl">ac_unit</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبة نسبة خلط سائل التبريد وماء الرديتر' : 'Coolant / Antifreeze Mix Ratio & Freeze/Boil Protection'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Concentrate vs Distilled Water • System Capacity • Freeze Rating (°C/°F) • 15 PSI Pressurized Boiling Point
              </p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            {/* System Capacity */}
            <div className="space-y-1">
              <div className="flex justify-between items-center font-code-sm">
                <label className="text-xs text-outline">Total System Capacity</label>
                <div className="flex gap-1 text-[10px]">
                  {['L', 'gal', 'qt'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setCoolantCapUnit(u as any)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        coolantCapUnit === u ? 'bg-primary-container text-on-primary-container font-bold' : 'text-outline'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                step="0.5"
                value={coolantCap}
                onChange={(e) => setCoolantCap(parseFloat(e.target.value) || 0)}
                className="w-full bg-surface-container-lowest text-blue-400 font-mono font-bold text-base px-3 py-2 rounded-lg border border-white/10"
              />
            </div>

            {/* Antifreeze Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-code-sm">
                <span className="text-outline">Antifreeze Concentrate Proportion</span>
                <span className="font-mono font-bold text-blue-300">
                  {antifreezePct}% Antifreeze / {100 - antifreezePct}% Water
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="70"
                step="5"
                value={antifreezePct}
                onChange={(e) => setAntifreezePct(parseInt(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-outline">
                <span>30% (Mild)</span>
                <span>50% (Standard OEM)</span>
                <span>60% (Arctic Sub-Zero)</span>
                <span>70% (Max Allowed)</span>
              </div>
            </div>
          </div>

          {/* Results outputs */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 font-code-sm">
            <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Pure Antifreeze Required</span>
              <p className="font-mono text-xl font-black text-blue-300">
                {coolantResult.coolantVolume} <span className="text-xs text-outline">{coolantCapUnit}</span>
              </p>
              <p className="text-[10px] text-outline font-mono">100% Concentrate</p>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Distilled Water Required</span>
              <p className="font-mono text-xl font-black text-cyan-300">
                {coolantResult.waterVolume} <span className="text-xs text-outline">{coolantCapUnit}</span>
              </p>
              <p className="text-[10px] text-outline font-mono">Deionized / Distilled</p>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Freeze Protection</span>
              <p className="font-mono text-xl font-black text-emerald-400">
                {coolantResult.freezeC}°C / {coolantResult.freezeF}°F
              </p>
              <p className="text-[10px] text-outline font-mono">Sub-zero safety margin</p>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Boiling Protection</span>
              <p className="font-mono text-xl font-black text-red-400">
                {coolantResult.boilC}°C / {coolantResult.boilF}°F
              </p>
              <p className="text-[10px] text-outline font-mono">With 1.0 bar (15 psi) cap</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
