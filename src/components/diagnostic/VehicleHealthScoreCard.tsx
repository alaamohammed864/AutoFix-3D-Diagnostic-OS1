// AutoFix 3D - Vehicle Health Score & Subsystem Risk Analysis
// Multi-subsystem score aggregation with real-time fault penalty calculations

import React from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';

interface VehicleHealthScoreCardProps {
  lang: Language;
}

export const VehicleHealthScoreCard: React.FC<VehicleHealthScoreCardProps> = ({ lang }) => {
  const { healthScore, activeDtcs } = useSimulation();
  const isArabic = lang === 'ar';

  const domains = [
    { name: isArabic ? 'المحرك وناقل الحركة' : 'Powertrain & Engine', score: healthScore.engineScore, weight: '25%' },
    { name: isArabic ? 'ناقل الحركة المزدوج (PDK)' : 'Transmission (PDK)', score: healthScore.transmissionScore, weight: '15%' },
    { name: isArabic ? 'الفرامل ومانع الانغلاق (ABS)' : 'ABS & Braking Systems', score: healthScore.absScore, weight: '15%' },
    { name: isArabic ? 'أنظمة الأمان والوسائد (SRS)' : 'SRS Airbags & Restraints', score: healthScore.srsScore, weight: '10%' },
    { name: isArabic ? 'الوقود والتحكم بالانبعاثات' : 'Fuel & Emissions', score: healthScore.fuelEmissionScore, weight: '10%' },
    { name: isArabic ? 'التبريد والإدارة الحرارية' : 'Thermal & Cooling', score: healthScore.coolingScore, weight: '10%' },
    { name: isArabic ? 'الشبكة الكهربائية والـ CAN' : 'Electrical Architecture', score: healthScore.electricalScore, weight: '5%' },
    { name: isArabic ? 'حالة بطارية الـ 12 فولت' : '12V Battery Health', score: healthScore.batteryScore, weight: '5%' },
    { name: isArabic ? 'أنظمة مساعدة السائق (ADAS)' : 'ADAS Radar & Cameras', score: healthScore.adasScore, weight: '5%' },
  ];

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">health_and_safety</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'مؤشر كفاءة وصحة المركبة العام' : 'Overall Vehicle Health & Risk Score'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                DYNAMIC
              </span>
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'تقييم شامل لحالة 9 أنظمة رئيسية محسوب ديناميكياً استناداً إلى الحساسات وأكواد الأعطال النشطة'
                : 'Weighted health score calculated across 9 primary automotive domains based on active faults'}
            </p>
          </div>
        </div>

        {/* Calculated Timestamp */}
        <div className="text-xs font-code-sm text-outline">
          {isArabic ? 'آخر تحديث:' : 'Evaluated:'} {healthScore.calculatedAt}
        </div>
      </div>

      {/* Main Score Hero Block */}
      <div className="p-6 rounded-xl bg-surface-container-low border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Big Score Circular Badge */}
          <div
            className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl ${
              healthScore.overallScore >= 85
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : healthScore.overallScore >= 65
                ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                : 'border-rose-500 bg-rose-500/10 text-rose-400'
            }`}
          >
            <span className="text-3xl font-black font-code">{healthScore.overallScore}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">/ 100</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold font-code-sm uppercase ${
                  healthScore.status === 'EXCELLENT'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : healthScore.status === 'GOOD'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : healthScore.status === 'FAIR'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isArabic ? healthScore.statusArabic : healthScore.status}
              </span>
              <span className="text-xs text-outline font-code-sm">
                {activeDtcs.length} {isArabic ? 'أعطال نشطة' : 'Active DTCs'}
              </span>
            </div>
            <h3 className="font-bold text-sm text-on-surface">
              {healthScore.overallScore >= 85
                ? isArabic
                  ? 'المركبة في حالة ممتازة ومطابقة لمواصفات المصنع'
                  : 'Vehicle in prime condition meeting OEM parameters'
                : isArabic
                ? 'تم رصد انحرافات في الأداء يلزم فحصها لتجنب الأعطال الثانوية'
                : 'Performance degradation detected requiring diagnostic verification'}
            </h3>
          </div>
        </div>
      </div>

      {/* 9 Subsystems Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {domains.map((dom, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-surface-container-low border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs font-code-sm">
              <span className="font-bold text-on-surface truncate">{dom.name}</span>
              <span
                className={`font-bold ${
                  dom.score >= 85
                    ? 'text-emerald-400'
                    : dom.score >= 65
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {dom.score}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  dom.score >= 85
                    ? 'bg-emerald-400'
                    : dom.score >= 65
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
                style={{ width: `${dom.score}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-outline">
              <span>{isArabic ? 'وزن التأثير:' : 'Weight:'} {dom.weight}</span>
              <span>{dom.score >= 85 ? 'Pass' : 'Fault Deductions'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
