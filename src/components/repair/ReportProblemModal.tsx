import React, { useState } from 'react';
import { ProblemReport } from '../../db/repairTypes';
import { Language } from '../../types';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedureId: string;
  procedureTitle: string;
  currentStepNumber: number;
  lang: Language;
}

export const ReportProblemModal: React.FC<ReportProblemModalProps> = ({
  isOpen,
  onClose,
  procedureId,
  procedureTitle,
  currentStepNumber,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [reporterName, setReporterName] = useState('alaa Mohammed (Lead Developer)');
  const [selectedStep, setSelectedStep] = useState<number>(currentStepNumber);
  const [issueType, setIssueType] = useState<ProblemReport['issueType']>('torque_error');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Simulate logging
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDescription('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-error-container/20 text-error border border-error/30">
              <span className="material-symbols-outlined text-xl">report_problem</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">
                {isAr ? 'إبلاغ عن مشكلة فنية في الإجراء' : 'Report Procedure Problem'}
              </h3>
              <p className="text-[11px] text-outline font-code-sm truncate max-w-xs">
                {procedureTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3 animate-fadeIn">
            <span className="material-symbols-outlined text-5xl text-primary-container">
              check_circle
            </span>
            <h4 className="font-headline-sm font-bold text-on-surface text-base">
              {isAr ? 'تم إرسال التقرير بنجاح' : 'Problem Report Submitted'}
            </h4>
            <p className="text-xs text-outline font-code-sm">
              {isAr
                ? 'تم تسجيل البلاغ تحت إشراف المطور alaa Mohammed وسيتم تدقيقه ومراجعته مع معايير الصانع.'
                : 'Report logged for review by alaa Mohammed (Lead Developer). OEM spec will be cross-referenced.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-outline uppercase font-telemetry-label block mb-1">
                  {isAr ? 'الخطوة المعنية' : 'Target Step'}
                </label>
                <select
                  value={selectedStep}
                  onChange={(e) => setSelectedStep(Number(e.target.value))}
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-on-surface font-code-sm"
                >
                  <option value={1}>{isAr ? 'الخطوة 1: التحضير' : 'Step 1: Preparation'}</option>
                  <option value={2}>{isAr ? 'الخطوة 2: تحديد الموضع' : 'Step 2: Locate component'}</option>
                  <option value={3}>{isAr ? 'الخطوة 3: فك القطع' : 'Step 3: Remove required parts'}</option>
                  <option value={4}>{isAr ? 'الخطوة 4: تنفيذ الإصلاح' : 'Step 4: Perform repair'}</option>
                  <option value={5}>{isAr ? 'الخطوة 5: إعادة التركيب' : 'Step 5: Reinstall'}</option>
                  <option value={6}>{isAr ? 'الخطوة 6: الاختبار' : 'Step 6: Test'}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-outline uppercase font-telemetry-label block mb-1">
                  {isAr ? 'نوع المشكلة' : 'Issue Category'}
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-on-surface font-code-sm"
                >
                  <option value="torque_error">{isAr ? 'خطأ في عزم الشد' : 'Torque spec discrepancy'}</option>
                  <option value="tool_mismatch">{isAr ? 'أداة أو لقمة غير مطابقة' : 'Tool / socket mismatch'}</option>
                  <option value="step_unclear">{isAr ? 'شرح الخطوة غير واضح' : 'Step unclear or ambiguous'}</option>
                  <option value="safety_hazard">{isAr ? 'تحذير أمان مفقود' : 'Missing safety warning'}</option>
                  <option value="part_number_error">{isAr ? 'رقم قطعة OEM غير مطابق' : 'Part number mismatch'}</option>
                  <option value="other">{isAr ? 'أمر آخر' : 'Other technical issue'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-outline uppercase font-telemetry-label block mb-1">
                {isAr ? 'اسم الفني / المبلّغ' : 'Technician / Reporter'}
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-on-surface font-code-sm"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-outline uppercase font-telemetry-label block mb-1">
                {isAr ? 'تفاصيل الملاحظة الفنية' : 'Detailed Technical Observation'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isAr
                    ? 'اكتب تفاصيل التعديل المطلوب أو القياس الصحيح المقترح وفق كتيب المصنع...'
                    : 'Describe the discrepancy, actual observed torque, or missing OEM prerequisite...'
                }
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-on-surface font-body-sm text-xs leading-relaxed focus:outline-none focus:border-primary-container"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface font-semibold text-xs cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-error hover:bg-error/90 text-on-error font-bold text-xs shadow-[0_0_15px_rgba(255,80,80,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                <span>{isAr ? 'إرسال التقرير الفني' : 'Submit Problem Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
