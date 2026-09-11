import React, { useState } from 'react';
import { Language } from '../types';

interface UnitConvertersProps {
  lang: Language;
}

export const UnitConverters: React.FC<UnitConvertersProps> = ({ lang }) => {
  // 4. Tire Pressure State (Base value in PSI)
  const [tirePsi, setTirePsi] = useState<number>(33.0);

  // 5. Torque State (Base value in Nm)
  const [torqueNm, setTorqueNm] = useState<number>(120.0);

  // 6. Temperature State (Base value in °C)
  const [tempC, setTempC] = useState<number>(90.0);

  // 7. General Pressure State (Base value in bar)
  const [pressureBar, setPressureBar] = useState<number>(2.0);

  // 8. Fluid Volume State (Base value in Liters)
  const [volumeLiters, setVolumeLiters] = useState<number>(4.8);

  // Tire Pressure Conversions
  const tireKpa = Math.round(tirePsi * 6.89476);
  const tireBar = Math.round(tirePsi * 0.0689476 * 100) / 100;

  const handleTireChange = (val: number, unit: 'psi' | 'kpa' | 'bar') => {
    if (unit === 'psi') setTirePsi(val);
    if (unit === 'kpa') setTirePsi(Math.round((val / 6.89476) * 10) / 10);
    if (unit === 'bar') setTirePsi(Math.round((val / 0.0689476) * 10) / 10);
  };

  // Torque Conversions (from Nm)
  const torqueLbFt = Math.round(torqueNm * 0.737562 * 10) / 10;
  const torqueInLb = Math.round(torqueNm * 8.85075);
  const torqueKgM = Math.round(torqueNm * 0.101972 * 100) / 100;

  const handleTorqueChange = (val: number, unit: 'Nm' | 'lb-ft' | 'in-lb' | 'kg-m') => {
    if (unit === 'Nm') setTorqueNm(val);
    if (unit === 'lb-ft') setTorqueNm(Math.round((val / 0.737562) * 10) / 10);
    if (unit === 'in-lb') setTorqueNm(Math.round((val / 8.85075) * 10) / 10);
    if (unit === 'kg-m') setTorqueNm(Math.round((val / 0.101972) * 10) / 10);
  };

  // Temperature Conversions (from °C)
  const tempF = Math.round((tempC * 9) / 5 + 32);
  const tempK = Math.round((tempC + 273.15) * 10) / 10;

  const handleTempChange = (val: number, unit: 'C' | 'F') => {
    if (unit === 'C') setTempC(val);
    if (unit === 'F') setTempC(Math.round((((val - 32) * 5) / 9) * 10) / 10);
  };

  // General Pressure Conversions (from Bar)
  const pKpa = Math.round(pressureBar * 100);
  const pPsi = Math.round(pressureBar * 14.5038 * 10) / 10;
  const pInHg = Math.round(pressureBar * 29.53 * 10) / 10;
  const pAtm = Math.round(pressureBar * 0.986923 * 100) / 100;

  const handlePressureChange = (val: number, unit: 'bar' | 'kpa' | 'psi' | 'inhg') => {
    if (unit === 'bar') setPressureBar(val);
    if (unit === 'kpa') setPressureBar(val / 100);
    if (unit === 'psi') setPressureBar(Math.round((val / 14.5038) * 100) / 100);
    if (unit === 'inhg') setPressureBar(Math.round((val / 29.53) * 100) / 100);
  };

  // Fluid Volume Conversions (from Liters)
  const volQt = Math.round(volumeLiters * 1.05669 * 100) / 100;
  const volGalUs = Math.round(volumeLiters * 0.264172 * 100) / 100;
  const volGalImp = Math.round(volumeLiters * 0.219969 * 100) / 100;
  const volMl = Math.round(volumeLiters * 1000);
  const volFlOz = Math.round(volumeLiters * 33.814 * 10) / 10;

  const handleVolumeChange = (val: number, unit: 'L' | 'qt' | 'gal' | 'ml') => {
    if (unit === 'L') setVolumeLiters(val);
    if (unit === 'qt') setVolumeLiters(Math.round((val / 1.05669) * 100) / 100);
    if (unit === 'gal') setVolumeLiters(Math.round((val / 0.264172) * 100) / 100);
    if (unit === 'ml') setVolumeLiters(val / 1000);
  };

  return (
    <div className="space-y-6">
      {/* 4. TIRE PRESSURE CONVERTER */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <span className="material-symbols-outlined text-2xl">tire_repair</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'محول ضغط الإطارات الدقيق' : 'Tire Pressure Converter (TPMS Calibration)'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Synchronized Multi-Unit PSI • kPa • BAR • Cold vs Operating Warm Delta
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded bg-surface-container-high text-xs font-code-sm text-outline border border-white/5">
            SAE J2657 TPMS Compatible
          </span>
        </div>

        {/* 3 Synchronized Unit Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* PSI */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center font-code-sm">
              <span className="text-xs text-outline uppercase font-bold">Imperial (US)</span>
              <span className="font-mono text-xs font-bold text-primary-container">PSI</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={tirePsi}
                onChange={(e) => handleTireChange(parseFloat(e.target.value) || 0, 'psi')}
                className="w-full bg-surface-container-lowest text-primary-container font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:border-primary-container focus:outline-none"
              />
              <span className="font-mono text-sm text-outline font-bold">psi</span>
            </div>
            <p className="text-[11px] text-outline font-mono">Pounds per square inch</p>
          </div>

          {/* BAR */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center font-code-sm">
              <span className="text-xs text-outline uppercase font-bold">European Standard</span>
              <span className="font-mono text-xs font-bold text-secondary">BAR</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.05"
                value={tireBar}
                onChange={(e) => handleTireChange(parseFloat(e.target.value) || 0, 'bar')}
                className="w-full bg-surface-container-lowest text-secondary font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:border-secondary focus:outline-none"
              />
              <span className="font-mono text-sm text-outline font-bold">bar</span>
            </div>
            <p className="text-[11px] text-outline font-mono">1 bar = 100,000 Pa (100 kPa)</p>
          </div>

          {/* KPA */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center font-code-sm">
              <span className="text-xs text-outline uppercase font-bold">SI Metric Unit</span>
              <span className="font-mono text-xs font-bold text-cyan-300">KPA</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                value={tireKpa}
                onChange={(e) => handleTireChange(parseFloat(e.target.value) || 0, 'kpa')}
                className="w-full bg-surface-container-lowest text-cyan-300 font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:border-cyan-300 focus:outline-none"
              />
              <span className="font-mono text-sm text-outline font-bold">kPa</span>
            </div>
            <p className="text-[11px] text-outline font-mono">Kilopascals</p>
          </div>
        </div>

        {/* Quick Automotive Benchmark Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-code-sm text-xs">
          <span className="text-outline">Common Vehicle Standards:</span>
          {[
            { label: 'Passenger Sedan Cold', psi: 32.0 },
            { label: 'Crossover / SUV', psi: 35.0 },
            { label: 'Rear Load / Towing', psi: 42.0 },
            { label: 'Compact Spare / Donut', psi: 60.0 },
            { label: 'Heavy Duty Truck (Load E)', psi: 80.0 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleTireChange(item.psi, 'psi')}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono transition-colors cursor-pointer border border-white/5"
            >
              {item.label} ({item.psi} psi)
            </button>
          ))}
        </div>
      </div>

      {/* 5. TORQUE CONVERTER */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span className="material-symbols-outlined text-2xl">build</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'محول عزم الربط الدقيق' : 'Fastener Torque Converter (ISO 6789)'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Bi-directional Newton-Meters (Nm) • Foot-Pounds (lb-ft) • Inch-Pounds (in-lb) • kg-m
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded bg-surface-container-high text-xs font-code-sm text-outline border border-white/5">
            Torque Wrench Calibration
          </span>
        </div>

        {/* 4 Synchronized Torque Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Nm */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center font-code-sm">
              <span className="text-xs text-outline uppercase font-bold">Metric (SI)</span>
              <span className="font-mono text-xs font-bold text-amber-300">Nm</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                value={torqueNm}
                onChange={(e) => handleTorqueChange(parseFloat(e.target.value) || 0, 'Nm')}
                className="w-full bg-surface-container-lowest text-amber-300 font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-sm text-outline font-bold">Nm</span>
            </div>
            <p className="text-[11px] text-outline font-mono">Newton-Meters</p>
          </div>

          {/* lb-ft */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center font-code-sm">
              <span className="text-xs text-outline uppercase font-bold">Imperial (US)</span>
              <span className="font-mono text-xs font-bold text-primary-container">lb-ft</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={torqueLbFt}
                onChange={(e) => handleTorqueChange(parseFloat(e.target.value) || 0, 'lb-ft')}
                className="w-full bg-surface-container-lowest text-primary-container font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-sm text-outline font-bold">lb-ft</span>
            </div>
            <p className="text-[11px] text-outline font-mono">Foot-Pounds</p>
          </div>

          {/* in-lb */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center font-code-sm">
              <span className="text-xs text-outline uppercase font-bold">Light Fasteners</span>
              <span className="font-mono text-xs font-bold text-secondary">in-lb</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="5"
                value={torqueInLb}
                onChange={(e) => handleTorqueChange(parseFloat(e.target.value) || 0, 'in-lb')}
                className="w-full bg-surface-container-lowest text-secondary font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-sm text-outline font-bold">in-lb</span>
            </div>
            <p className="text-[11px] text-outline font-mono">Inch-Pounds (1/12 lb-ft)</p>
          </div>

          {/* kg-m */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-center font-code-sm">
              <span className="text-xs text-outline uppercase font-bold">JDM / Asian Standard</span>
              <span className="font-mono text-xs font-bold text-cyan-300">kg-m</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={torqueKgM}
                onChange={(e) => handleTorqueChange(parseFloat(e.target.value) || 0, 'kg-m')}
                className="w-full bg-surface-container-lowest text-cyan-300 font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-sm text-outline font-bold">kg-m</span>
            </div>
            <p className="text-[11px] text-outline font-mono">Kilogram-Force Meters</p>
          </div>
        </div>

        {/* Fastener Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 font-code-sm text-xs">
          <span className="text-outline">Standard Torque Specs:</span>
          {[
            { label: 'Oil Drain Plug', nm: 35 },
            { label: 'Spark Plugs (M14)', nm: 28 },
            { label: 'Passenger Lug Nuts', nm: 120 },
            { label: 'Porsche Centerlock', nm: 600 },
            { label: 'Brake Caliper Bracket', nm: 115 },
            { label: 'Valve Cover (in-lb)', nm: 9 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleTorqueChange(item.nm, 'Nm')}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono transition-colors cursor-pointer border border-white/5"
            >
              {item.label} ({item.nm} Nm / {Math.round(item.nm * 0.737562)} lb-ft)
            </button>
          ))}
        </div>
      </div>

      {/* 6. TEMPERATURE CONVERTER & AUTOMOTIVE THERMAL MILESTONES */}
      <div className="bg-surface-container rounded-2xl border border-white/5 p-5 lg:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="material-symbols-outlined text-2xl">device_thermostat</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'محول درجات الحرارة ونطاقات التبريد والزيت' : 'Temperature Converter & Powertrain Thermal Ranges'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Celsius (°C) • Fahrenheit (°F) • Kelvin (K) • Engine Cooling & Oil Operating Milestones
              </p>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Celsius */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <span className="text-xs text-outline font-code-sm uppercase font-bold">Celsius (SI)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                value={tempC}
                onChange={(e) => handleTempChange(parseFloat(e.target.value) || 0, 'C')}
                className="w-full bg-surface-container-lowest text-red-400 font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-base text-outline font-bold">°C</span>
            </div>
          </div>

          {/* Fahrenheit */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <span className="text-xs text-outline font-code-sm uppercase font-bold">Fahrenheit (US)</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1"
                value={tempF}
                onChange={(e) => handleTempChange(parseFloat(e.target.value) || 0, 'F')}
                className="w-full bg-surface-container-lowest text-amber-300 font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10 focus:outline-none"
              />
              <span className="font-mono text-base text-outline font-bold">°F</span>
            </div>
          </div>

          {/* Kelvin */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <span className="text-xs text-outline font-code-sm uppercase font-bold">Kelvin (Thermodynamic)</span>
            <div className="flex items-center gap-2">
              <div className="w-full bg-surface-container-lowest text-cyan-300 font-mono text-2xl font-black px-3 py-2 rounded-lg border border-white/10">
                {tempK}
              </div>
              <span className="font-mono text-base text-outline font-bold">K</span>
            </div>
          </div>
        </div>

        {/* Thermal Milestones Interactive Guide */}
        <div className="space-y-2 pt-1">
          <span className="text-xs text-outline font-code-sm uppercase font-bold block">
            Critical Automotive Thermal Benchmarks:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { label: '50/50 Antifreeze Freeze', c: -37, desc: 'Maximum winter freeze protection' },
              { label: 'Thermostat Crack Open', c: 84, desc: 'Initial cooling flow begins' },
              { label: 'Radiator Fan High Speed', c: 98, desc: 'Electric ECM fan trigger point' },
              { label: 'Pressurized Coolant Boiling', c: 128, desc: '1.1 bar (16 psi) radiator cap limit' },
            ].map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => handleTempChange(m.c, 'C')}
                className="p-2.5 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-start transition-colors cursor-pointer border border-white/5 space-y-0.5"
              >
                <div className="flex justify-between items-baseline font-mono text-xs">
                  <span className="font-bold text-on-surface">{m.label}</span>
                  <span className="text-primary-container font-black">{m.c}°C / {Math.round((m.c * 9) / 5 + 32)}°F</span>
                </div>
                <p className="text-[10px] text-outline">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 7 & 8. GENERAL PRESSURE & FLUID VOLUME CONVERTERS IN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7. GENERAL PRESSURE CONVERTER */}
        <div className="bg-surface-container rounded-2xl border border-white/5 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <span className="material-symbols-outlined text-xl">speed</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">
                {lang === 'ar' ? 'محول الضغط الهندسي العام' : 'General Pressure Converter (Boost / Vacuum)'}
              </h3>
              <p className="font-code-sm text-[11px] text-outline">
                kPa • bar • psi • inHg (Manifold Vacuum) • atm
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-code-sm">
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Bar</span>
              <input
                type="number"
                step="0.1"
                value={pressureBar}
                onChange={(e) => handlePressureChange(parseFloat(e.target.value) || 0, 'bar')}
                className="w-full bg-surface-container-lowest text-primary-container font-mono text-lg font-bold px-2.5 py-1.5 rounded-lg border border-white/10"
              />
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Kilopascals (kPa)</span>
              <input
                type="number"
                step="10"
                value={pKpa}
                onChange={(e) => handlePressureChange(parseFloat(e.target.value) || 0, 'kpa')}
                className="w-full bg-surface-container-lowest text-secondary font-mono text-lg font-bold px-2.5 py-1.5 rounded-lg border border-white/10"
              />
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">PSI (Boost / Oil)</span>
              <input
                type="number"
                step="1"
                value={pPsi}
                onChange={(e) => handlePressureChange(parseFloat(e.target.value) || 0, 'psi')}
                className="w-full bg-surface-container-lowest text-cyan-300 font-mono text-lg font-bold px-2.5 py-1.5 rounded-lg border border-white/10"
              />
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Inches Mercury (inHg)</span>
              <input
                type="number"
                step="1"
                value={pInHg}
                onChange={(e) => handlePressureChange(parseFloat(e.target.value) || 0, 'inhg')}
                className="w-full bg-surface-container-lowest text-amber-300 font-mono text-lg font-bold px-2.5 py-1.5 rounded-lg border border-white/10"
              />
            </div>
          </div>
        </div>

        {/* 8. FLUID VOLUME CONVERTER */}
        <div className="bg-surface-container rounded-2xl border border-white/5 p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <span className="material-symbols-outlined text-xl">opacity</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">
                {lang === 'ar' ? 'محول سعة السوائل والزيوت' : 'Fluid Volume & Sump Capacity Converter'}
              </h3>
              <p className="font-code-sm text-[11px] text-outline">
                Liters (L) • US Quarts (qt) • Gallons (gal) • Milliliters (mL) • Fl Oz
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-code-sm">
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Liters (L)</span>
              <input
                type="number"
                step="0.1"
                value={volumeLiters}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value) || 0, 'L')}
                className="w-full bg-surface-container-lowest text-blue-400 font-mono text-lg font-bold px-2.5 py-1.5 rounded-lg border border-white/10"
              />
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">US Quarts (qt)</span>
              <input
                type="number"
                step="0.1"
                value={volQt}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value) || 0, 'qt')}
                className="w-full bg-surface-container-lowest text-primary-container font-mono text-lg font-bold px-2.5 py-1.5 rounded-lg border border-white/10"
              />
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">US Gallons (gal)</span>
              <input
                type="number"
                step="0.1"
                value={volGalUs}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value) || 0, 'gal')}
                className="w-full bg-surface-container-lowest text-secondary font-mono text-lg font-bold px-2.5 py-1.5 rounded-lg border border-white/10"
              />
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-outline uppercase font-bold">Milliliters (mL)</span>
              <input
                type="number"
                step="100"
                value={volMl}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value) || 0, 'ml')}
                className="w-full bg-surface-container-lowest text-cyan-300 font-mono text-lg font-bold px-2.5 py-1.5 rounded-lg border border-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
