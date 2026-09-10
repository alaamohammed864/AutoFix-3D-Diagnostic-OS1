import React from 'react';
import { Language, MaintenanceItem } from '../types';

interface TorqueProcedureModalProps {
  item: MaintenanceItem | null;
  onClose: () => void;
  lang: Language;
}

export const TorqueProcedureModal: React.FC<TorqueProcedureModalProps> = ({
  item,
  onClose,
  lang,
}) => {
  if (!item) return null;

  const isAr = lang === 'ar';

  const procedureData: Record<
    string,
    {
      titleAr: string;
      titleEn: string;
      stepsAr: string[];
      stepsEn: string[];
      torques: { part: string; spec: string }[];
      tools: string[];
    }
  > = {
    oil: {
      titleAr: 'إجراء تغيير زيت المحرك والفلتر المعتمد من بورش',
      titleEn: 'Porsche OEM Engine Oil & Filter Change Procedure',
      stepsAr: [
        'قم برفع السيارة على الرافعة وفك الغطاء السفلي الواقي (Undertray) باستخدام مفك توركس T25 و T30.',
        'ضع حوض التفريغ وفك طَبّة تفريغ الزيت (Drain Plug) بسداسي 8 مم، وتخلص من وردة الإحكام النحاسية القديمة.',
        'فك غطاء فلتر الزيت باستخدام لقمة سداسية 36 مم مع التأكد من تفريغ الزيت المتبقي داخل الحجرة.',
        'استبدل الحلقة المطاطية O-Ring على غطاء الفلتر وضع طبقة رقيقة من الزيت الجديد عليها لتفادي التمزق.',
        'شد غطاء الفلتر بعزم 25 نيوتن.متر بدقة، وركب صامولة الصرف بوردة جديدة مشدودة بعزم 50 نيوتن.متر.',
        'املأ 8.3 لتر من زيت بورش المعتمد Porsche A40 0W-40، ثم شغل المحرك وأعد التحقق من المستوى عبر شاشة العدادات.',
      ],
      stepsEn: [
        'Raise vehicle safely on hoist and remove rear aero underbody shield with Torx T25/T30 drivers.',
        'Position oil drain catcher and extract aluminum sump plug using 8mm hex. Discard one-time crush washer.',
        'Loosen upper oil canister housing using low-profile 36mm hex socket. Allow chamber to fully drain.',
        'Lubricate new rubber O-ring seal with fresh synthetic engine oil before sliding onto housing grooves.',
        'Torque oil filter canister to precisely 25 Nm (18.4 lb-ft). Reinstall drain plug with new washer to 50 Nm (37 lb-ft).',
        'Refill with 8.3 Liters of Porsche A40 approved 0W-40 synthetic oil. Start engine, cycle oil pump, and verify electronic oil level readout.',
      ],
      torques: [
        { part: 'Oil Filter Housing Cap', spec: '25 Nm (18.4 lb-ft)' },
        { part: 'Sump Drain Plug', spec: '50 Nm (36.8 lb-ft)' },
        { part: 'Undertray Fasteners (T30)', spec: '6.5 Nm (57 in-lb)' },
      ],
      tools: ['36mm Low-Profile Hex Socket', '8mm Hex Bit Driver', 'Calibrated Torque Wrench (10-60 Nm)', 'Oil Catch Basin 12L'],
    },
    brake_fluid: {
      titleAr: 'بروتوكول تفريغ وتجديد سائل الفرامل بالضغط',
      titleEn: 'Pressurized Brake System Flush & Bleed Protocol',
      stepsAr: [
        'تحقق من نسبة الرطوبة (تم رصد 3.4% - يتطلب تغييراً فورياً لخطورة تراجع نقطة الغليان).',
        'وصل جهاز الشفط/الضغط الهيدروليكي عند خزان الفرامل واضبط الضغط على 2.0 بار كحد أقصى.',
        'اتبع تسلسل النزف الرسمي للسيارة: خلفي أيمن (RR) -> خلفي أيسر (RL) -> أمامي أيمن (FR) -> أمامي أيسر (FL).',
        'افتح صمام النزف بلقمة 11 مم حتى يخرج السائل الصافي الخالي تماماً من فقاعات الهواء والشوائب.',
        'أعد ربط صمامات النزف بعزم 14 نيوتن.متر مع تنظيف أي رذاذ فوراً بالماء لتجنب تلف طلاء الكليبر.',
      ],
      stepsEn: [
        'Hygroscopic moisture content logged at 3.4% (degraded boiling point 162°C vs 265°C dry spec).',
        'Mount positive-pressure bleeder reservoir to master cylinder cap, setting regulated pressure to 2.0 Bar.',
        'Follow designated ABS hydraulic sequence: Rear Right (RR) -> Rear Left (RL) -> Front Right (FR) -> Front Left (FL).',
        'Connect clear silicone hose with collection bottle. Open bleeder valve with 11mm flare wrench until bubble-free crystal clear fluid emerges.',
        'Torque bleeder nipples to 14 Nm (10 lb-ft). Clean caliper surface with brake cleaner and water rinse.',
      ],
      torques: [
        { part: 'Brake Caliper Bleeder Screws', spec: '14 Nm (10.3 lb-ft)' },
        { part: 'Wheel Centerlock / Lugs', spec: '160 Nm (118 lb-ft)' },
      ],
      tools: ['Pneumatic Brake Bleeder Kit (2.0 Bar)', '11mm Brake Flare Wrench', 'Hydraulic Moisture Tester Pen', 'DOT 4 Plus Fluid'],
    },
    spark_plugs: {
      titleAr: 'إجراء استبدال شمعات الاحتراق (بواجي)',
      titleEn: 'Spark Plugs Replacement & Gap Calibration',
      stepsAr: [
        'فك بطانات الرفارف الخلفية وأنابيب مبرد الهواء (Intercooler) للوصول المباشر لرؤوس أسطوانات محرك البوكسر 6.',
        'افصل فيش كويلات الإشعال وفك مسامير التثبيت T30 بعناية دون إتلاف العوازل السيليكونية.',
        'استخرج الشمعات القديمة بلقمة بوجيهات مغناطيسية 14 مم رفيعة الجدار ذات مفصل مرن.',
        'تحقق من خلوص شمعة الاحتراق الجديدة (0.80 مم) وثبت الشمعات يدوياً أولاً لتفادي تلف السن (Cross-threading).',
        'شد الشمعات على السن الجاف بعزم 25 نيوتن.متر تماماً (ممنوع استخدام شحم مانع للقفش Anti-seize على شمعات بوش الجديدة).',
      ],
      stepsEn: [
        'Disassemble rear wheel liners and turbo intercooler hard piping to reach horizontally opposed Boxer cylinder heads.',
        'Unclip primary coil pack wiring harnesses and remove retaining T30 Torx bolts.',
        'Extract spark plugs using 14mm magnetic thin-wall swivel spark plug socket.',
        'Verify factory gap setting (0.80 mm preset) on Bosch Double Platinum plugs. Hand-thread 3 turns to prevent cross-threading in alloy head.',
        'Torque to 25 Nm (18.4 lb-ft) DRY threads. (Do NOT use anti-seize paste as nickel coating provides anti-corrosion protection).',
      ],
      torques: [
        { part: 'Spark Plug in Cylinder Head', spec: '25 Nm (18.4 lb-ft)' },
        { part: 'Ignition Coil Pack Retaining Bolt', spec: '8.5 Nm (75 in-lb)' },
      ],
      tools: ['14mm Thin-Wall Swivel Spark Plug Socket', '0.80mm Feeler Gauge', 'Torx T30 Bit', '3/8" Drive Torque Wrench'],
    },
    cabin_filter: {
      titleAr: 'دليل استبدال فلتر المقصورة المزدوج وحبوب اللقاح',
      titleEn: 'Dual Cabin & Pollen Microfilter Replacement',
      stepsAr: [
        'فك غطاء الحماية أسفل الزجاج الأمامي من جهة حوض المحرك/الشنطة الأمامية للوصول للفلتر الأولي.',
        'فك اللوح السفلي في مساحة أرجل الراكب الأمامي للوصول إلى عنصر الكربون النشط الداخلي.',
        'اسحب الفلتر القديم مع مراعاة اتجاه تدفق الهواء المطبوع على الإطار (Air Flow Direction).',
        'نظف مجرى الهواء بالمكنسة وركب الفلتر الجديد الأصلي برقم القطعة 992-819-439.',
      ],
      stepsEn: [
        'Access primary cowl pre-filter element beneath front luggage compartment bulkhead cover.',
        'Remove passenger footwell under-dash trim panel to access secondary active-carbon microfilter chamber.',
        'Slide out old element, noting direction of molded airflow arrows.',
        'Vacuum chamber housing and seat new OEM filter (Part # 992-819-439). Re-snap retaining latches.',
      ],
      torques: [{ part: 'Under-dash Trim Fasteners', spec: 'Hand Tight (Plastic Push Clips)' }],
      tools: ['T20 Torx Driver', 'Plastic Trim Pry Tool'],
    },
  };

  const data = procedureData[item.id] || procedureData['oil'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {isAr ? data.titleAr : data.titleEn}
              </h3>
              <p className="font-code-sm text-xs text-outline mt-0.5">
                {item.title} • {item.badge}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Torque Table */}
          <div>
            <h4 className="text-xs font-telemetry-label text-outline uppercase tracking-wider mb-2">
              {isAr ? 'عزوم الشد المعتمدة من المصنع (Torque Specifications)' : 'Factory Torque Specifications'}
            </h4>
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5 text-xs font-code-sm">
              {data.torques.map((tq, idx) => (
                <div key={idx} className="flex justify-between p-2.5">
                  <span className="text-on-surface-variant">{tq.part}</span>
                  <span className="text-primary-container font-bold">{tq.spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Procedure Steps */}
          <div>
            <h4 className="text-xs font-telemetry-label text-outline uppercase tracking-wider mb-2">
              {isAr ? 'خطوات العمل الفنية المعتمدة' : 'Step-by-Step Technical Instructions'}
            </h4>
            <div className="space-y-2">
              {(isAr ? data.stepsAr : data.stepsEn).map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-surface-container-low p-3 rounded-lg border border-white/5 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary-container font-code-sm font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="text-on-surface-variant leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Required Workshop Tools */}
          <div>
            <h4 className="text-xs font-telemetry-label text-outline uppercase tracking-wider mb-2">
              {isAr ? 'الأدوات والمعدات الخاصة المطلوبة' : 'Required Workshop Tools'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.tools.map((tl, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-code-sm text-xs border border-white/5"
                >
                  {tl}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-code-sm text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            {isAr ? 'إغلاق الدليل' : 'Close Procedure'}
          </button>
        </div>
      </div>
    </div>
  );
};
