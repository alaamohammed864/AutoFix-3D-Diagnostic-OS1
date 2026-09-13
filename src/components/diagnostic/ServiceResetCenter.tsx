// AutoFix 3D - Service Mode & Special Functions Reset Center
// 8 Automated Dealer-level calibration and service adaptation procedures

import React, { useState } from 'react';
import { Language } from '../../types';

interface ServiceResetCenterProps {
  lang: Language;
}

interface ServiceProcedure {
  id: string;
  name: string;
  arabicName: string;
  system: string;
  icon: string;
  durationSec: number;
  preconditions: string[];
  arabicPreconditions: string[];
  description: string;
  arabicDescription: string;
}

const PROCEDURES: ServiceProcedure[] = [
  {
    id: 'oil_reset',
    name: 'Engine Oil Life & Inspection Interval Reset',
    arabicName: 'تصفير عداد فترات صيانة زيت المحرك',
    system: 'Cluster & Service',
    icon: 'oil_barrel',
    durationSec: 3,
    preconditions: ['Ignition ON, Engine OFF', 'Brake pedal released', 'Driver door closed'],
    arabicPreconditions: ['السويتش في وضع التشغيل (المحرك مطفأ)', 'عدم الضغط على الفرامل', 'إغلاق باب السائق'],
    description: 'Resets the instrument cluster maintenance reminder interval to 10,000 miles / 365 days.',
    arabicDescription: 'يقوم بإعادة ضبط مؤشر موعد الصيانة الدورية في لوحة العدادات إلى 10,000 ميل أو 365 يوماً.',
  },
  {
    id: 'battery_reg',
    name: '12V AGM / Lithium Battery Registration',
    arabicName: 'تسجيل وتعريف بطارية 12 فولت الجديدة',
    system: 'Charging & Power',
    icon: 'battery_charging_full',
    durationSec: 4,
    preconditions: ['Battery voltage > 12.4V', 'Alternator LIN communication OK', 'New battery Ah entered'],
    arabicPreconditions: ['جهد البطارية أكبر من 12.4 فولت', 'سلامة سلك بيانات الدينامو LIN', 'إدخال سعة البطارية بالأمبير'],
    description: 'Updates battery management control unit (BMS) with new battery capacity, age, and charging curve.',
    arabicDescription: 'يحدث خريطة شحن الدينامو داخل وحدة إدارة الطاقة (BMS) بناءً على عمر وسعة البطارية الجديدة.',
  },
  {
    id: 'throttle_adapt',
    name: 'Electronic Throttle Body (ETB) End-Stop Adaptation',
    arabicName: 'معايرة وبرمجة البوابة الإلكترونية (الثروتل)',
    system: 'Powertrain',
    icon: 'tune',
    durationSec: 5,
    preconditions: ['Coolant temp between 10°C - 95°C', 'Accelerator pedal not touched', 'No TPS DTCs present'],
    arabicPreconditions: ['حرارة سائل التبريد بين 10°م و 95°م', 'عدم لمس دواسة الوقود مطلقاً', 'خلو الحساس من الأكواد النشطة'],
    description: 'Commands throttle motor to sweep lower mechanical stop, upper WOT stop, and spring return rest point.',
    arabicDescription: 'يقوم بمطابقة أقصى فتحة وأقصى إغلاق ونقطة سكون الياي الميكانيكي للبوابة الإلكترونية.',
  },
  {
    id: 'sas_calib',
    name: 'Steering Angle Sensor (SAS) Zero-Point Calibration',
    arabicName: 'معايرة نقطة الصفر لحساس زاوية المقود (SAS)',
    system: 'Steering & ESP',
    icon: 'navigation',
    durationSec: 4,
    preconditions: ['Steering wheel perfectly centered', 'Vehicle on level surface', 'Front wheels straight ahead'],
    arabicPreconditions: ['توجيه عجلة القيادة للمركز بدقة', 'السيارة على أرضية مستوية', 'العجلات الأمامية مستقيمة تماماً'],
    description: 'Calibrates optical encoder offset to 0.0° for Electronic Stability Control and lane keeping.',
    arabicDescription: 'يبرمج نقطة المنتصف 0.0 درجة لحساس المقود لتشغيل نظام الثبات الإلكتروني ومساعد المسار.',
  },
  {
    id: 'abs_bleed',
    name: 'Automated ABS Hydraulic Bleeding Routine',
    arabicName: 'التنفيس الهيدروليكي الآلي لفرامل ABS',
    system: 'Brakes',
    icon: 'water_drop',
    durationSec: 6,
    preconditions: ['Brake fluid reservoir full', 'Pressure bleeder attached (2.0 bar)', 'Bleed screws opened sequentially'],
    arabicPreconditions: ['قربة زيت الفرامل ممتلئة للحد الأقصى', 'توصيل جهاز ضغط الزيت 2.0 بار', 'فتح مسامير التنفيس بالترتيب'],
    description: 'Cycles ABS pump motor and solenoid intake/exhaust valves to dislodge air bubbles from accumulator chambers.',
    arabicDescription: 'يشغل مضخة وصمامات ABS لدفع فقاعات الهواء المحتبسة داخل صمامات وحدة التحكم الهيدروليكية.',
  },
  {
    id: 'injector_coding',
    name: 'Fuel Injector Individual Calibration Coding (IMA)',
    arabicName: 'برمجة أكواد معايرة البخاخات الفردية (IMA)',
    system: 'Fuel System',
    icon: 'colorize',
    durationSec: 4,
    preconditions: ['Engine cold', '7-digit hex code read from injector body', 'Engine key on'],
    arabicPreconditions: ['المحرك بارد', 'قراءة الكود السداسي عشري من جسم البخاخ', 'السويتش مفتوح'],
    description: 'Writes precise manufacturing flow tolerance coefficients into ECM flash memory for smooth idling.',
    arabicDescription: 'يكتب معاملات تدفق الرش المصنعية الدقيقة في ذاكرة وحدة المحرك لتحقيق التوازن بين السلندرات.',
  },
  {
    id: 'dpf_regen',
    name: 'Particulate Filter (DPF/GPF) Service Regeneration',
    arabicName: 'دورة التجديد والحرق الذاتي لفلتر الدخان (DPF/GPF)',
    system: 'Exhaust & DPF',
    icon: 'local_fire_department',
    durationSec: 6,
    preconditions: ['Engine at operating temp (>70°C)', 'Fuel level > 50%', 'Vehicle parked in safe open area'],
    arabicPreconditions: ['وصول المحرك للحرارة التشغيلية (>70°م)', 'مستوى الوقود أكثر من النصف', 'إيقاف المركبة في مكان مفتوح وآمن'],
    description: 'Commands ECM to raise exhaust temperatures to 600°C to incinerate accumulated soot into ash.',
    arabicDescription: 'يرفع درجة حرارة العادم إلى 600 درجة مئوية لحرق جزيئات الكربون المتراكمة في الفلتر.',
  },
  {
    id: 'tpms_relearn',
    name: 'TPMS Tire Pressure Sensor ID Registration',
    arabicName: 'إعادة برمجة ومزامنة حساسات ضغط الإطارات (TPMS)',
    system: 'Chassis & Wheels',
    icon: 'tire_repair',
    durationSec: 4,
    preconditions: ['Tires inflated to placard spec', '433MHz transponders awake', 'Tool placed at valve stem'],
    arabicPreconditions: ['ضبط ضغط الإطارات حسب مواصفات الباب', 'إيقاظ حساسات 433 ميجاهرتز', 'تقريب الجهاز من بلف الإطار'],
    description: 'Registers 433MHz sensor RF IDs to corresponding wheel corners in the Central BCM.',
    arabicDescription: 'يربط المعرفات اللاسلكية الخاصة بحساسات ضغط الهواء بمواقع العجلات الأربع داخل وحدة BCM.',
  },
];

export const ServiceResetCenter: React.FC<ServiceResetCenterProps> = ({ lang }) => {
  const [selectedProcId, setSelectedProcId] = useState<string>('oil_reset');
  const [runningProcId, setRunningProcId] = useState<string | null>(null);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [completedProcId, setCompletedProcId] = useState<string | null>(null);

  const isArabic = lang === 'ar';
  const currentProc = PROCEDURES.find((p) => p.id === selectedProcId) || PROCEDURES[0];

  const handleStartReset = () => {
    setRunningProcId(currentProc.id);
    setProgressPct(0);
    setCompletedProcId(null);

    const totalSteps = 20;
    let step = 0;
    const intervalTime = (currentProc.durationSec * 1000) / totalSteps;

    const timer = setInterval(() => {
      step++;
      setProgressPct(Math.round((step / totalSteps) * 100));

      if (step >= totalSteps) {
        clearInterval(timer);
        setRunningProcId(null);
        setCompletedProcId(currentProc.id);
      }
    }, intervalTime);
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">build_circle</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'مركز المعايرات والتهيئة الخاصة (Service Mode)' : 'Dealer Special Functions & Service Resets'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                8 PROCEDURES
              </span>
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'إجراءات برمجة الوكالات المعتمدة: تصفير الزيت، برمجة البطارية، معايرة الثروتل، زاوية المقود، وتنفيس ABS'
                : 'Automated dealer service routines: Oil resets, Battery registration, ETB & SAS calibrations, and ABS bleeding'}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="px-3 py-1.5 rounded-xl bg-surface-container border border-white/5 text-xs font-code-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span className="text-outline">{isArabic ? 'حالة التشفير الأمني:' : 'Security Access:'}</span>
          <span className="font-bold text-emerald-400">Seed-Key Level 2 Unlocked</span>
        </div>
      </div>

      {/* Grid: Procedure List (5 cols) + Execution Workspace (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Procedure Selector List */}
        <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {PROCEDURES.map((proc) => {
            const isSelected = selectedProcId === proc.id;
            const isRunning = runningProcId === proc.id;
            const isDone = completedProcId === proc.id;

            return (
              <div
                key={proc.id}
                onClick={() => setSelectedProcId(proc.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-primary-container/15 border-primary-container text-on-surface shadow-md'
                    : isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-on-surface'
                    : 'bg-surface-container-low border-white/5 hover:border-white/20 text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-xl text-primary-container">
                    {proc.icon}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-xs truncate block text-on-surface">
                      {isArabic ? proc.arabicName : proc.name}
                    </span>
                    <span className="text-[10px] text-outline font-code-sm block">{proc.system}</span>
                  </div>
                </div>

                {isRunning ? (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-code-sm font-bold animate-pulse">
                    ACTIVE
                  </span>
                ) : isDone ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-code-sm font-bold">
                    DONE
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-sm text-outline">chevron_right</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Procedure Detail & Execution Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-surface-container-low border border-white/10 space-y-5">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30 text-[10px] font-code-sm font-bold uppercase">
                  {currentProc.system}
                </span>
                <span className="text-xs text-outline font-code-sm">
                  Est. {currentProc.durationSec}s
                </span>
              </div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {isArabic ? currentProc.arabicName : currentProc.name}
              </h3>
              <p className="text-xs text-outline leading-relaxed">
                {isArabic ? currentProc.arabicDescription : currentProc.description}
              </p>
            </div>

            {/* Preconditions Checklist */}
            <div className="p-3.5 rounded-xl bg-surface-container border border-white/5 space-y-2">
              <span className="text-xs font-bold text-outline uppercase font-code-sm block tracking-wider">
                {isArabic ? 'الشروط المسبقة لتنفيذ المعايرة بنجاح:' : 'Pre-requisite Conditions Checklist:'}
              </span>
              <div className="space-y-1.5 text-xs font-code-sm">
                {(isArabic ? currentProc.arabicPreconditions : currentProc.preconditions).map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                    <span>{cond}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar (When running) */}
            {runningProcId === currentProc.id && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-code-sm">
                  <span className="text-outline">{isArabic ? 'جاري تنفيذ المعايرة...' : 'Executing calibration routine...'}</span>
                  <span className="text-primary-container font-bold">{progressPct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full bg-primary-container transition-all duration-200 shadow"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Completed Success Box */}
            {completedProcId === currentProc.id && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">verified</span>
                <span>
                  {isArabic
                    ? 'اكتملت المعايرة بنجاح وحفظت الإعدادات الجديدة في ذاكرة الـ EEPROM.'
                    : 'Calibration completed successfully. Adaptation values committed to EEPROM.'}
                </span>
              </div>
            )}

            {/* Start Button */}
            <div className="pt-2">
              <button
                onClick={handleStartReset}
                disabled={runningProcId !== null}
                className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs shadow-lg hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <span className={`material-symbols-outlined text-sm ${runningProcId === currentProc.id ? 'animate-spin' : ''}`}>
                  play_arrow
                </span>
                <span>
                  {runningProcId === currentProc.id
                    ? isArabic
                      ? 'جاري البرمجة في وحدة التحكم...'
                      : 'Writing Adaptation to ECU...'
                    : isArabic
                    ? 'بدء المعايرة والتهيئة'
                    : 'Start Procedure Routine'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
