import React, { useState } from 'react';
import { RepairProcedure, RepairStep } from '../../db/repairTypes';
import { Language } from '../../types';

interface RepairStepViewProps {
  procedure: RepairProcedure;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  lang: Language;
  onOpenReportProblem: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onPrint: () => void;
}

export const RepairStepView: React.FC<RepairStepViewProps> = ({
  procedure,
  currentStepIndex,
  onStepChange,
  lang,
  onOpenReportProblem,
  isBookmarked,
  onToggleBookmark,
  onPrint,
}) => {
  const isAr = lang === 'ar';
  const steps = procedure.steps;
  const currentStep: RepairStep = steps[currentStepIndex] || steps[0];

  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStepIndex - 1);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      onStepChange(currentStepIndex + 1);
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const stepNameTranslations: Record<string, string> = {
    'Preparation': isAr ? 'التحضير' : 'Preparation',
    'Locate component': isAr ? 'تحديد موضع القطعة' : 'Locate component',
    'Remove required parts': isAr ? 'فك القطع المطلوبة' : 'Remove required parts',
    'Perform repair': isAr ? 'تنفيذ الإصلاح' : 'Perform repair',
    'Reinstall': isAr ? 'إعادة التركيب' : 'Reinstall',
    'Test': isAr ? 'الاختبار والفحص' : 'Test',
  };

  return (
    <div className="space-y-6">
      {/* Top Step Breadcrumbs / Progress Stepper */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary-container/20 text-primary-container font-code-sm font-bold text-xs">
              STEP {currentStep.stepNumber} OF 6
            </span>
            <span className="font-headline-sm font-bold text-sm text-on-surface">
              {stepNameTranslations[currentStep.stepName] || currentStep.stepName}
            </span>
          </div>

          {/* Persistent Action Toolbar: Previous, Next, Bookmark, Print, Report Problem */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleBookmark}
              type="button"
              className={`p-2 rounded-xl border text-xs font-code-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-surface-container-high border-white/5 text-outline hover:text-on-surface'
              }`}
              title={isAr ? 'حفظ في المفضلة' : 'Bookmark Procedure'}
            >
              <span className="material-symbols-outlined text-base">
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
              <span className="hidden sm:inline">
                {isBookmarked ? (isAr ? 'محفوظ' : 'Bookmarked') : isAr ? 'حفظ' : 'Bookmark'}
              </span>
            </button>

            <button
              onClick={onPrint}
              type="button"
              className="p-2 rounded-xl bg-surface-container-high border border-white/5 text-outline hover:text-on-surface text-xs font-code-sm transition-all cursor-pointer flex items-center gap-1.5"
              title={isAr ? 'طباعة بطاقة الخطوة' : 'Print Step Card'}
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span className="hidden sm:inline">{isAr ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={onOpenReportProblem}
              type="button"
              className="p-2 rounded-xl bg-error-container/15 hover:bg-error-container/30 border border-error/30 text-on-error-container text-xs font-code-sm transition-all cursor-pointer flex items-center gap-1.5"
              title={isAr ? 'إبلاغ عن مشكلة فنية' : 'Report Technical Problem'}
            >
              <span className="material-symbols-outlined text-base text-error">report_problem</span>
              <span className="hidden sm:inline">{isAr ? 'إبلاغ' : 'Report problem'}</span>
            </button>
          </div>
        </div>

        {/* 6 Step Progress Tabs */}
        <div className="grid grid-cols-6 gap-2">
          {steps.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => onStepChange(idx)}
                className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isCurrent
                    ? 'bg-primary-container text-on-primary-container font-bold border-primary-container shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                    : isCompleted
                    ? 'bg-primary-container/15 border-primary-container/30 text-primary-container'
                    : 'bg-surface-container-lowest/80 border-white/5 text-outline hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] font-code-sm">
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-xs">check</span>
                  ) : (
                    <span>#{s.stepNumber}</span>
                  )}
                </div>
                <span className="text-[9px] truncate max-w-full font-body-sm hidden md:inline">
                  {stepNameTranslations[s.stepName] || s.stepName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Canvas Card */}
      <div className="p-6 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6">
        {/* Step Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary border border-secondary/30 text-[10px] font-code-sm font-bold uppercase">
                {stepNameTranslations[currentStep.stepName] || currentStep.stepName}
              </span>
              {currentStep.torqueSpec && (
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container border border-primary-container/40 text-[10px] font-code-sm font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">tune</span>
                  <span>{currentStep.torqueSpec}</span>
                </span>
              )}
            </div>
            <h3 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface mt-1.5">
              {isAr ? currentStep.titleAr : currentStep.titleEn}
            </h3>
          </div>

          <div className="text-outline font-code-sm text-xs">
            {isAr ? 'المركبة:' : 'Vehicle:'}{' '}
            <span className="text-on-surface font-semibold">
              {procedure.year} {procedure.vehicle}
            </span>
          </div>
        </div>

        {/* Large Visual Area */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black group max-h-[480px] flex items-center justify-center">
          <img
            src={currentStep.imageUrl}
            alt={currentStep.imageCaptionEn}
            className="w-full h-auto max-h-[480px] object-cover group-hover:scale-102 transition-transform duration-500"
          />

          {/* Expand / Zoom Button */}
          <button
            onClick={() => setIsImageZoomed(true)}
            type="button"
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            title={isAr ? 'تكبير الصورة بدقة عالية' : 'Enlarge High-Res Photo'}
          >
            <span className="material-symbols-outlined text-lg">zoom_in</span>
          </button>

          {/* Technical Image Caption Overlay Bar */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-on-surface">
              <span className="material-symbols-outlined text-primary-container text-base">
                photo_camera
              </span>
              <span className="font-code-sm text-[11px]">
                {isAr ? currentStep.imageCaptionAr : currentStep.imageCaptionEn}
              </span>
            </div>
            <span className="text-[10px] text-outline font-code-sm shrink-0">
              OEM TECHNICAL WORKBENCH CAPTURE
            </span>
          </div>
        </div>

        {/* Safety Warning Callout (Highlighted prominently) */}
        {currentStep.safetyWarningEn && (
          <div className="p-4 rounded-xl bg-error-container/15 border border-error/40 flex items-start gap-3 animate-fadeIn">
            <div className="p-2 rounded-lg bg-error-container text-on-error-container shrink-0">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
            <div className="space-y-0.5">
              <h4 className="font-headline-sm font-bold text-xs text-on-surface uppercase tracking-wider">
                {isAr ? 'تحذير أمان إلزامي' : 'Mandatory Safety Warning'}
              </h4>
              <p className="text-xs text-on-surface-variant font-body-sm leading-relaxed">
                {isAr ? currentStep.safetyWarningAr : currentStep.safetyWarningEn}
              </p>
            </div>
          </div>
        )}

        {/* Step Detailed Instruction & Tool Requirement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Step Instruction */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-2">
              <label className="font-telemetry-label uppercase tracking-wider text-outline text-[11px] block">
                {isAr ? 'التعليمات الفنية التفصيلية' : 'Step-by-Step Technical Instruction'}
              </label>
              <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 font-body-sm text-sm text-on-surface leading-relaxed whitespace-pre-line">
                {isAr ? currentStep.instructionAr : currentStep.instructionEn}
              </div>
            </div>

            {/* Key Action Checklist / Pointers */}
            {currentStep.keyActionPointersEn && currentStep.keyActionPointersEn.length > 0 && (
              <div className="space-y-2">
                <span className="font-telemetry-label uppercase tracking-wider text-outline text-[11px] block">
                  {isAr ? 'نقاط التدقيق والمعايرة' : 'Critical Inspection Checkpoints'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(isAr ? currentStep.keyActionPointersAr : currentStep.keyActionPointersEn)?.map(
                    (point, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-surface-container-high/60 border border-white/5 flex items-start gap-2 text-xs"
                      >
                        <span className="material-symbols-outlined text-primary-container text-base shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span className="text-on-surface-variant font-code-sm">{point}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tool Requirement & Specifications Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-surface-container-high text-primary-container">
                  <span className="material-symbols-outlined text-lg">build</span>
                </div>
                <div>
                  <h5 className="font-headline-sm font-bold text-xs text-on-surface">
                    {isAr ? 'متطلبات العدة والأدوات' : 'Tool Requirement'}
                  </h5>
                  <span className="text-[10px] text-outline font-code-sm">
                    {isAr ? 'لهذه الخطوة المحددة' : 'Mandatory for this step'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-high/80 border border-white/5 font-code-sm text-xs font-semibold text-primary-container">
                {isAr ? currentStep.toolRequirementAr : currentStep.toolRequirementEn}
              </div>

              {currentStep.torqueSpec && (
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20 font-code-sm text-xs space-y-0.5">
                  <span className="text-[10px] text-outline uppercase block">
                    {isAr ? 'عزم الشد المقنن:' : 'OEM Torque Spec:'}
                  </span>
                  <span className="font-bold text-secondary text-sm">
                    {currentStep.torqueSpec}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Helper Tip Box */}
            <div className="p-3.5 rounded-xl bg-surface-container-low/60 border border-white/5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-outline">
                <span className="material-symbols-outlined text-sm">lightbulb</span>
                <span className="font-bold uppercase text-[10px]">
                  {isAr ? 'نصيحة المطور الفنية' : 'Tech Pro Tip'}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant font-body-sm">
                {isAr
                  ? 'قم دائماً بتنظيف المسامير وتزييت السنون بزيت المحرك النظيف لضمان تطبيق عزم الشد الصحيح دون احتكاك ميكانيكي مضلل.'
                  : 'Ensure fastener threads are degreased and free of grit to avoid false torque wrench clicks from thread friction.'}
              </p>
            </div>
          </div>
        </div>

        {/* Step Navigation Bar: Previous & Next Buttons */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={`px-5 py-2.5 rounded-xl border font-code-sm text-xs transition-all flex items-center gap-2 cursor-pointer ${
              isFirstStep
                ? 'opacity-30 cursor-not-allowed border-white/5 text-outline'
                : 'bg-surface-container-high hover:bg-surface-bright border-white/10 text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>{isAr ? 'الخطوة السابقة' : 'Previous Step'}</span>
          </button>

          <span className="text-xs text-outline font-code-sm hidden sm:inline">
            {isAr ? 'الخطوة' : 'Step'} {currentStep.stepNumber} / 6
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={isLastStep}
            className={`px-6 py-2.5 rounded-xl font-bold font-code-sm text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isLastStep
                ? 'opacity-40 cursor-not-allowed bg-surface-container-high text-outline'
                : 'bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container shadow-[0_0_18px_rgba(0,240,255,0.35)]'
            }`}
          >
            <span>{isAr ? 'الخطوة التالية' : 'Next Step'}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isImageZoomed && (
        <div
          onClick={() => setIsImageZoomed(false)}
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img
              src={currentStep.imageUrl}
              alt={currentStep.imageCaptionEn}
              className="w-full h-auto object-contain max-h-[85vh]"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/80 p-3 text-center text-xs text-on-surface font-code-sm">
              {isAr ? currentStep.imageCaptionAr : currentStep.imageCaptionEn}
            </div>
            <button
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
