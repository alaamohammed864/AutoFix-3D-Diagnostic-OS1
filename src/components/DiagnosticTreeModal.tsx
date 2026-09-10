import React, { useState } from 'react';
import { Language } from '../types';
import confetti from 'canvas-confetti';

interface DiagnosticTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onCodeCleared?: () => void;
}

export const DiagnosticTreeModal: React.FC<DiagnosticTreeModalProps> = ({
  isOpen,
  onClose,
  lang,
  onCodeCleared,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<('pending' | 'passed' | 'failed')[]>([
    'pending',
    'pending',
    'pending',
    'pending',
  ]);
  const [codeCleared, setCodeCleared] = useState(false);

  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const steps = [
    {
      title: isAr ? 'الخطوة 1: اختبار تسريب الدخان لمجمع السحب' : 'Step 1: Smoke Test Intake Manifold & Vacuum Lines',
      instruction: isAr
        ? 'قم بتوصيل جهاز الدخان عند فتحة السحب وضغط المنظومة عند 0.8 بار للتحقق من تسرب الهواء غير المقاس خلف حساس MAF.'
        : 'Connect smoke generator to intake throttle neck and pressurize system to 0.8 Bar. Inspect intake plenum seals and PCV hoses for visible smoke.',
      expected: isAr ? 'انعدام الدخان من الوصلات والحلقات المطاطية (O-Rings)' : 'Zero smoke leakage around plenum gaskets and vacuum fittings',
      component: 'Intake Plenum / PCV Line',
    },
    {
      title: isAr ? 'الخطوة 2: فحص جهد حساس تدفق الهواء MAF' : 'Step 2: Inspect MAF Sensor Signal Voltage & Clean Element',
      instruction: isAr
        ? 'تحقق من قراءة جهد الإشارة عند السرعة الخاملة (المتوقع 1.02 فولت) ونظف السلك الحساس بمنظف مخصص للحساسات.'
        : 'Measure MAF signal output on Pin 3. Expected 1.00V - 1.05V at idle (750 RPM). Spray with dedicated MAF cleaner to remove oil film.',
      expected: isAr ? '1.02V عند الخمول، و 4.15V عند الضغط الكامل WOT' : '1.02V at idle, rising linearly to 4.2V under WOT load',
      component: 'Bosch MAF Sensor 0x280',
    },
    {
      title: isAr ? 'الخطوة 3: فحص استجابة حساس الأكسجين الأول (Lambda)' : 'Step 3: Test Bank 1 Pre-Cat Oxygen Sensor (Lambda)',
      instruction: isAr
        ? 'راقب استجابة اللامدا اللحظية عند إدخال وقود إضافي. يجب أن يتغير معامل لامدا فوراً بين 0.97 و 1.03.'
        : 'Monitor Lambda equivalence ratio while introducing short burst of fuel enrichment. Sensor should immediately oscillate around 1.00 ± 0.03.',
      expected: isAr ? 'معامل اللامدا 1.00 ± 0.02 وسرعة استجابة أقل من 50 مللي ثانية' : 'Lambda 1.00 ± 0.02, response time < 50ms',
      component: 'Wideband O2 Sensor B1S1',
    },
    {
      title: isAr ? 'الخطوة 4: فحص ضغط مسطرة الوقود عالي الضغط HPFP' : 'Step 4: Verify High Pressure Fuel Rail Operating Pressure',
      instruction: isAr
        ? 'تحقق من ضغط الوقود في المسطرة عبر حساس السكة. يجب ألا يقل الضغط عن 140 بار أثناء القيادة تحت الحمل.'
        : 'Log High Pressure Fuel Rail PID. Minimum required pressure is 140 Bar under full boost to ensure adequate fuel atomization.',
      expected: isAr ? '140 - 150 بار عند التحميل الكامل' : '140 - 150 Bar under full boost',
      component: 'HPFP Dual Delivery Rail',
    },
  ];

  const handleSetStatus = (index: number, status: 'passed' | 'failed') => {
    const updated = [...stepStatuses];
    updated[index] = status;
    setStepStatuses(updated);
    if (index < steps.length - 1) {
      setCurrentStep(index + 1);
    }
  };

  const handleClearFault = () => {
    setCodeCleared(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onCodeCleared?.();
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container">
              <span className="material-symbols-outlined text-xl">account_tree</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-error font-code-sm font-bold text-sm">P0171</span>
                <span className="text-outline text-xs">•</span>
                <h3 className="font-headline-md text-base text-on-surface font-semibold">
                  {isAr ? 'شجرة التشخيص الموجهة خطوة بخطوة' : 'Guided Diagnostic Decision Tree'}
                </h3>
              </div>
              <p className="font-code-sm text-xs text-outline mt-0.5">
                {isAr ? 'بروتوكول فحص محرك بورش 992.1 التوربيني' : 'Porsche 992.1 Twin-Turbo CBS Diagnostic Protocol'}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {codeCleared ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-secondary/20 text-secondary mx-auto flex items-center justify-center animate-bounce">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h4 className="font-headline-md text-lg text-on-surface font-bold">
                {isAr ? 'تم مسح كود العطل P0171 بنجاح!' : 'DTC P0171 Cleared & Fuel Trims Reset!'}
              </h4>
              <p className="font-body-md text-xs text-on-surface-variant max-w-md mx-auto">
                {isAr
                  ? 'تمت إعادة ضبط معايير التعديل اللحظي STFT و LTFT إلى 0.0%، وتم إطفاء لمبة فحص المحرك MIL.'
                  : 'ECU closed-loop adaptations have been re-zeroed. MIL illumination cleared. Ready for verification drive cycle.'}
              </p>
            </div>
          ) : (
            <>
              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-4 gap-2">
                {steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`p-2 rounded-lg text-start transition-all border ${
                      currentStep === idx
                        ? 'bg-surface-container-high border-primary-container text-on-surface'
                        : 'bg-surface-container-low border-white/5 text-outline hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-code-sm text-[10px] font-bold">0{idx + 1}</span>
                      {stepStatuses[idx] === 'passed' && (
                        <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                      )}
                      {stepStatuses[idx] === 'failed' && (
                        <span className="material-symbols-outlined text-error text-sm">cancel</span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium truncate mt-1">{step.component}</div>
                  </button>
                ))}
              </div>

              {/* Active Step Card */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-white/5 space-y-4">
                <div>
                  <span className="text-[10px] font-code-sm uppercase tracking-wider text-primary-container font-semibold">
                    {isAr ? `المرحلة ${currentStep + 1} من ${steps.length}` : `Phase ${currentStep + 1} of ${steps.length}`}
                  </span>
                  <h4 className="font-headline-md text-base text-on-surface font-bold mt-1">
                    {steps[currentStep].title}
                  </h4>
                </div>

                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  {steps[currentStep].instruction}
                </p>

                <div className="bg-surface-container-lowest p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] font-telemetry-label text-outline uppercase">
                    {isAr ? 'القيمة المتوقعة / المعيار السليم' : 'Expected Pass Criteria'}
                  </span>
                  <div className="font-code-sm text-xs font-semibold text-secondary mt-1">
                    {steps[currentStep].expected}
                  </div>
                </div>

                {/* Step Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-outline font-code-sm">
                    {isAr ? 'سجل نتيجة الفحص:' : 'Record Step Result:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSetStatus(currentStep, 'failed')}
                      className="px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-code-sm text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      <span>{isAr ? 'فشل الاختبار' : 'Failed Test'}</span>
                    </button>
                    <button
                      onClick={() => handleSetStatus(currentStep, 'passed')}
                      className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-code-sm text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>{isAr ? 'اجتاز الاختبار' : 'Passed Test'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Overall Completion & Clear Code Option */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/5">
                <div className="text-xs font-code-sm text-outline">
                  {isAr ? 'الحالة:' : 'Status:'}{' '}
                  <span className="text-on-surface font-semibold">
                    {stepStatuses.filter((s) => s === 'passed').length} / {steps.length} {isAr ? 'فحوصات مكتملة' : 'Tests Verified'}
                  </span>
                </div>
                <button
                  onClick={handleClearFault}
                  className="w-full sm:w-auto bg-error hover:bg-error/90 text-on-error px-4 py-2 rounded-lg font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  <span>{isAr ? 'إصلاح ومسح كود العطل DTC P0171' : 'Clear Fault Code & Reset Adaptations'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
