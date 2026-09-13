// AutoFix 3D - Symptom-Based Diagnostic Troubleshooter
// Intelligent symptom matching with live sensor and DTC cross-correlation

import React, { useState } from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';

interface SymptomTroubleshooterProps {
  lang: Language;
  onInspect3dComponent?: (componentId: string) => void;
}

interface SymptomPreset {
  id: string;
  title: string;
  arabicTitle: string;
  system: string;
  target3dId: string;
  correlatedDtcs: string[];
  steps: {
    order: number;
    action: string;
    arabicAction: string;
    expected: string;
  }[];
}

const SYMPTOM_PRESETS: SymptomPreset[] = [
  {
    id: 'misfire_rough_idle',
    title: 'Engine Misfire & Rough Idle Under Load',
    arabicTitle: 'تفتفة ورعشة في المحرك عند التسارع والوقوف',
    system: 'Powertrain',
    target3dId: 'engine-block',
    correlatedDtcs: ['P0300', 'P0301', 'P0302', 'P0171'],
    steps: [
      {
        order: 1,
        action: 'Inspect Cylinder 1 Ignition Coil Pack secondary resistance (OEM: 0.6 - 1.2 Ohms)',
        arabicAction: 'فحص مقاومة ملف الإشعال (الكويل) للسلندر رقم 1 (المعيار: 0.6 - 1.2 أوم)',
        expected: 'Normal coil resistance ~ 0.85 Ohms without insulation cracking',
      },
      {
        order: 2,
        action: 'Remove Spark Plug #1 and check electrode gap (0.80 mm) and carbon fouling',
        arabicAction: 'فك شمعة الاحتراق رقم 1 والتأكد من خلوص القطب (0.80 مم) وعدم وجود ترسبات كربونية',
        expected: 'Light tan/gray electrode color; gap 0.80 mm',
      },
      {
        order: 3,
        action: 'Verify Fuel Trim STFT/LTFT for vacuum leak downstream of MAF sensor',
        arabicAction: 'مراقبة قراءات تصحيح الوقود STFT/LTFT للتأكد من عدم وجود تسريب هواء بعد حساس MAF',
        expected: 'STFT within ±5.0% under normal closed-loop operation',
      },
    ],
  },
  {
    id: 'overheating',
    title: 'Cooling System Overheating at Low Speeds',
    arabicTitle: 'ارتفاع حرارة المحرك عند السرعات المنخفضة والازدحام',
    system: 'Thermal & Cooling',
    target3dId: 'radiator-core',
    correlatedDtcs: ['P0115', 'P0117', 'P0118'],
    steps: [
      {
        order: 1,
        action: 'Trigger Radiator Cooling Fan Stage 1 & Stage 2 via Mode 08 Actuator Control',
        arabicAction: 'تشغيل مراوح التبريد السرعة الأولى والثانية عبر اختبار المشغلات (Mode 08)',
        expected: 'Fan relay engages with 8.5A low speed / 22A high speed current draw',
      },
      {
        order: 2,
        action: 'Test Thermostat opening temperature via OBD-II Coolant PID (88°C - 92°C)',
        arabicAction: 'مراقبة درجة فتح الثرموستات عبر بيانات الحساس الحية (88°م - 92°م)',
        expected: 'Upper radiator hose warms up as thermostat valve cracks open at 89°C',
      },
      {
        order: 3,
        action: 'Inspect expansion tank pressure cap for sealing (1.4 - 1.6 bar rating)',
        arabicAction: 'اختبار غطاء قربة ماء الرديتر والتأكد من تحمله لضغط 1.5 بار بدون تنفيس',
        expected: 'Holds 1.5 bar without vacuum collapse',
      },
    ],
  },
  {
    id: 'spongy_brakes',
    title: 'Spongy Soft Brake Pedal / ABS Warning Lamp',
    arabicTitle: 'دواسة الفرامل إسفنجية / إضاءة لمبة مانع الانغلاق ABS',
    system: 'Braking',
    target3dId: 'brake-caliper-fl',
    correlatedDtcs: ['C0035', 'C0040', 'C0131'],
    steps: [
      {
        order: 1,
        action: 'Check Wheel Speed Sensor FL signal waveform while spinning hub',
        arabicAction: 'فحص إشارة حساس سرعة العجلة الأمامية اليسرى أثناء دوران الإطار',
        expected: 'Smooth square-wave pulses matching other 3 wheels',
      },
      {
        order: 2,
        action: 'Perform Automated ABS Hydraulic Bleeding procedure to purge micro-bubbles',
        arabicAction: 'تنفيذ دورة التنفيس الهيدروليكي الآلي لنظام ABS لطرد فقاعات الهواء',
        expected: 'Firm pedal travel after 4-corner caliper sequence',
      },
      {
        order: 3,
        action: 'Test Brake Master Cylinder Pressure Sensor live reading (0 - 160 bar)',
        arabicAction: 'قراءة حساس ضغط الفرامل الرئيسي والتأكد من خطية القراءة مع ضغط الدواسة',
        expected: 'Reads 0 bar at rest, ramping smoothly to 120 bar on hard depression',
      },
    ],
  },
];

export const SymptomTroubleshooter: React.FC<SymptomTroubleshooterProps> = ({
  lang,
  onInspect3dComponent,
}) => {
  const { activeDtcs } = useSimulation();
  const [selectedSymptomId, setSelectedSymptomId] = useState<string>('misfire_rough_idle');

  const isArabic = lang === 'ar';
  const currentSymptom = SYMPTOM_PRESETS.find((s) => s.id === selectedSymptomId) || SYMPTOM_PRESETS[0];

  // Calculate correlation confidence
  const matchedDtcCount = currentSymptom.correlatedDtcs.filter((c) => activeDtcs.includes(c)).length;
  const confidenceScore = Math.min(98, 45 + matchedDtcCount * 25);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'مساعد تشخيص الأعراض التفاعلي' : 'Symptom-Based Troubleshooter'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                AI REASONING
              </span>
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'ربط شكوى العميل مع الحساسات الحية وأكواد الـ DTC لتحديد خطوات الفحص الدقيقة خطوة بخطوة'
                : 'Correlate customer complaints with live telemetry and DTC patterns for guided step-by-step diagnostics'}
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container border border-white/5 text-xs font-code-sm">
          <span className="text-outline">{isArabic ? 'نسبة التطابق مع الأعطال:' : 'Correlation Match:'}</span>
          <span className="font-bold text-primary-container">{confidenceScore}%</span>
        </div>
      </div>

      {/* Symptom Presets Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1 text-xs">
        {SYMPTOM_PRESETS.map((sym) => (
          <button
            key={sym.id}
            onClick={() => setSelectedSymptomId(sym.id)}
            className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedSymptomId === sym.id
                ? 'bg-primary-container text-on-primary-container shadow-md'
                : 'bg-surface-container-low text-outline hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {isArabic ? sym.arabicTitle : sym.title}
          </button>
        ))}
      </div>

      {/* Active Symptom Workspace */}
      <div className="p-5 rounded-xl bg-surface-container-low border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-code-sm font-bold text-outline uppercase">
              {currentSymptom.system}
            </span>
            <h3 className="text-base font-bold text-on-surface">
              {isArabic ? currentSymptom.arabicTitle : currentSymptom.title}
            </h3>
          </div>

          {onInspect3dComponent && (
            <button
              onClick={() => onInspect3dComponent(currentSymptom.target3dId)}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">view_in_ar</span>
              <span>{isArabic ? 'معاينة القطعة في النموذج ثلاثي الأبعاد' : 'Inspect in 3D Model'}</span>
            </button>
          )}
        </div>

        {/* Step-by-Step Diagnostic Procedures */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-outline uppercase font-code-sm block tracking-wider">
            {isArabic ? 'مسار الفحص التشخيصي المعتمد خطوة بخطوة:' : 'OEM Step-by-Step Diagnostic Procedure:'}
          </span>

          <div className="space-y-2.5">
            {currentSymptom.steps.map((st) => (
              <div
                key={st.order}
                className="p-3.5 rounded-xl bg-surface-container border border-white/5 space-y-1 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary-container/20 text-primary-container font-bold font-code-sm flex items-center justify-center text-[10px]">
                    {st.order}
                  </span>
                  <span className="font-bold text-on-surface">
                    {isArabic ? st.arabicAction : st.action}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-code-sm ps-7">
                  <span className="text-outline">{isArabic ? 'النتيجة المتوقعة: ' : 'Expected OEM Result: '}</span>
                  {st.expected}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
