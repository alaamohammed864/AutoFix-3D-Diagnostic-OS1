import React, { useState } from 'react';
import { Language } from '../types';
import { ElectricalCalculators } from './ElectricalCalculators';
import { UnitConverters } from './UnitConverters';
import { MechanicalCalculators } from './MechanicalCalculators';

interface AutomotiveCalculatorsPageProps {
  lang: Language;
}

export const AutomotiveCalculatorsPage: React.FC<AutomotiveCalculatorsPageProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'electrical' | 'converters' | 'powertrain' | 'chassis'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', labelEn: 'All Tools (13)', labelAr: 'جميع الأدوات (13)', icon: 'calculate' },
    { id: 'electrical', labelEn: 'Electrical & Battery', labelAr: 'الكهرباء والبطارية', icon: 'electric_bolt' },
    { id: 'converters', labelEn: 'Precision Converters', labelAr: 'محولات الوحدات الهندسية', icon: 'sync_alt' },
    { id: 'powertrain', labelEn: 'Powertrain & Fluids', labelAr: 'المحرك وسوائل التبريد', icon: 'settings_input_component' },
    { id: 'chassis', labelEn: 'Chassis & Brakes', labelAr: 'الشاسيه والفرامل والإطارات', icon: 'adjust' },
  ];

  const toolsList = [
    { id: 'battery', name: 'Battery Voltage Test', cat: 'electrical', icon: 'battery_charging_full' },
    { id: 'ohms', name: "Ohm's Law & Power", cat: 'electrical', icon: 'bolt' },
    { id: 'vdrop', name: 'Voltage Drop & Wire Gauge', cat: 'electrical', icon: 'cable' },
    { id: 'tire-pressure', name: 'Tire Pressure Converter', cat: 'converters', icon: 'tire_repair' },
    { id: 'torque', name: 'Torque Converter (Nm/lb-ft)', cat: 'converters', icon: 'build' },
    { id: 'temp', name: 'Temperature Converter', cat: 'converters', icon: 'device_thermostat' },
    { id: 'pressure', name: 'Pressure Converter', cat: 'converters', icon: 'speed' },
    { id: 'fluid', name: 'Fluid Volume Converter', cat: 'converters', icon: 'opacity' },
    { id: 'displacement', name: 'Engine Displacement', cat: 'powertrain', icon: 'precision_manufacturing' },
    { id: 'gear', name: 'Gear Ratio & Road Speed', cat: 'powertrain', icon: 'auto_mode' },
    { id: 'coolant', name: 'Coolant Mix Ratio', cat: 'powertrain', icon: 'ac_unit' },
    { id: 'wheel', name: 'Wheel/Tire Size Calculator', cat: 'chassis', icon: 'radio_button_checked' },
    { id: 'brake', name: 'Brake Rotor Measurement', cat: 'chassis', icon: 'adjust' },
  ];

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const showElectrical =
    (activeCategory === 'all' || activeCategory === 'electrical') &&
    (matchesSearch('battery') ||
      matchesSearch('voltage') ||
      matchesSearch('ohm') ||
      matchesSearch('power') ||
      matchesSearch('drop') ||
      matchesSearch('wire') ||
      matchesSearch('current'));

  const showConverters =
    (activeCategory === 'all' || activeCategory === 'converters') &&
    (matchesSearch('tire') ||
      matchesSearch('pressure') ||
      matchesSearch('torque') ||
      matchesSearch('temperature') ||
      matchesSearch('fluid') ||
      matchesSearch('volume') ||
      matchesSearch('kpa') ||
      matchesSearch('psi') ||
      matchesSearch('bar') ||
      matchesSearch('nm') ||
      matchesSearch('lb-ft') ||
      matchesSearch('gal') ||
      matchesSearch('liter'));

  const showPowertrain =
    (activeCategory === 'all' || activeCategory === 'powertrain') &&
    (matchesSearch('engine') ||
      matchesSearch('displacement') ||
      matchesSearch('bore') ||
      matchesSearch('stroke') ||
      matchesSearch('gear') ||
      matchesSearch('ratio') ||
      matchesSearch('rpm') ||
      matchesSearch('speed') ||
      matchesSearch('coolant') ||
      matchesSearch('antifreeze'));

  const showChassis =
    (activeCategory === 'all' || activeCategory === 'chassis') &&
    (matchesSearch('wheel') ||
      matchesSearch('tire') ||
      matchesSearch('size') ||
      matchesSearch('brake') ||
      matchesSearch('rotor') ||
      matchesSearch('runout') ||
      matchesSearch('disc'));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER SECTION */}
      <section className="relative bg-surface-container-low rounded-2xl p-6 lg:p-8 overflow-hidden border border-white/5 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-high text-primary-container font-code-sm text-[11px] tracking-widest uppercase border border-primary-container/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container animate-pulse"></span>
              {lang === 'ar' ? 'معمل الحسابات الهندسية للمركبات' : 'AUTOMOTIVE ENGINEERING WORKBENCH'}
            </div>

            <h1 className="font-display-lg text-2xl sm:text-3xl lg:text-4xl text-on-surface font-extrabold tracking-tight uppercase">
              {lang === 'ar' ? 'أدوات وحاسبات السيارات الهندسية' : 'Automotive Tools & Engineering Calculators'}
            </h1>

            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              {lang === 'ar'
                ? 'مجموعة متكاملة من 13 حاسبة ومحول وحدات هندسي بمعايير SAE و ISO تدعم الوحدات المترية (SI) والإمبراطورية (Imperial): الجهد، قانون أوم، هبوط الفولتية، ضغط الإطارات، عزم الربط، السعة، نسب التروس، وسماكة أقراص الفرامل.'
                : '13 high-precision engineering calculators and multi-unit converters supporting SI Metric and Imperial standards: Battery SOC, Ohm’s Law, Voltage Drop, Tire Pressure, Torque, Temperature, Engine Displacement, Gear Ratios, Brake Rotors, and Coolant Mix.'}
            </p>
          </div>

          {/* Unit Standards Pill Strip */}
          <div className="flex flex-col gap-2 p-3 bg-surface-container-lowest/80 rounded-xl border border-white/5 font-code-sm text-xs min-w-[280px]">
            <div className="flex items-center justify-between text-outline">
              <span>Supported Dimensionals:</span>
              <span className="text-primary-container font-bold">SI & Imperial</span>
            </div>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-mono">mm • cm • m • in • ft</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-secondary font-mono">kPa • bar • psi</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-amber-300 font-mono">Nm • lb-ft</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-red-400 font-mono">°C • °F</span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-blue-400 font-mono">L • qt • gal</span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS & SEARCH BAR */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 bg-surface-container-lowest rounded-xl border border-white/5">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-base">{cat.icon}</span>
              <span>{lang === 'ar' ? cat.labelAr : cat.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute start-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder={lang === 'ar' ? 'بحث في الحاسبات...' : 'Search calculators...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface text-xs font-code-sm ps-9 pe-3 py-2 rounded-lg border border-white/5 focus:border-primary-container focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs cursor-pointer"
            >
              clear
            </button>
          )}
        </div>
      </section>

      {/* RENDER CALCULATOR BLOCKS */}
      <div className="space-y-8">
        {/* ELECTRICAL TOOLS (1, 2, 3) */}
        {showElectrical && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-primary-container text-xl">
                electric_bolt
              </span>
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبات الأنظمة الكهربائية والبطارية' : 'Electrical, Battery & Circuit Engineering'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary-container/20 text-primary-container font-bold">
                SAE J1128 / J537
              </span>
            </div>
            <ElectricalCalculators lang={lang} />
          </section>
        )}

        {/* UNIT CONVERTERS (4, 5, 6, 7, 8) */}
        {showConverters && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-secondary text-xl">
                sync_alt
              </span>
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'محولات الوحدات الهندسية الدقيقة' : 'Precision Automotive Unit Converters'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-secondary/20 text-secondary font-bold">
                SI Metric & Imperial Dual Support
              </span>
            </div>
            <UnitConverters lang={lang} />
          </section>
        )}

        {/* POWERTRAIN, CHASSIS & BRAKES (9, 10, 11, 12, 13) */}
        {(showPowertrain || showChassis) && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="material-symbols-outlined text-orange-400 text-xl">
                settings_input_component
              </span>
              <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'حاسبات المحرك والشاسيه والفرامل' : 'Powertrain, Gearing, Chassis & Brake Calibrations'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/20 text-orange-400 font-bold">
                Mechanical & Fluids
              </span>
            </div>
            <MechanicalCalculators lang={lang} />
          </section>
        )}
      </div>
    </div>
  );
};
