import React, { useState } from 'react';
import { RepairProcedure } from '../../db/repairTypes';
import { RepairStepView } from './RepairStepView';
import { ControlledVideoPlayer } from './ControlledVideoPlayer';
import { ReportProblemModal } from './ReportProblemModal';
import { Language } from '../../types';

interface RepairProcedureDetailsProps {
  procedure: RepairProcedure;
  lang: Language;
  onBack: () => void;
  onSelectRelatedProcedure: (procId: string) => void;
}

export const RepairProcedureDetails: React.FC<RepairProcedureDetailsProps> = ({
  procedure,
  lang,
  onBack,
  onSelectRelatedProcedure,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'steps' | 'prerequisites' | 'video' | 'related'>('steps');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isReportProblemOpen, setIsReportProblemOpen] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-primary-container/20 text-primary-container border-primary-container/40';
      case 'Intermediate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Advanced':
        return 'bg-secondary/20 text-secondary border-secondary/40';
      case 'Master Tech':
        return 'bg-error-container/30 text-on-error-container border-error/50 font-bold';
      default:
        return 'bg-surface-container-high text-outline';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header & Breadcrumb Bar */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              type="button"
              className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-code-sm"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>{isAr ? 'العودة للإجراءات' : 'All Procedures'}</span>
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-outline font-code-sm">
              <span className="text-primary-container font-semibold">{procedure.system}</span>
              <span>•</span>
              <span className="text-on-surface font-semibold">
                {procedure.year} {procedure.vehicle}
              </span>
              <span>•</span>
              <span>{procedure.engine}</span>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              type="button"
              className={`px-3 py-2 rounded-xl border text-xs font-code-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-surface-container-high border-white/5 text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
              <span>{isBookmarked ? (isAr ? 'محفوظ' : 'Bookmarked') : isAr ? 'حفظ' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-white/5 text-outline hover:text-on-surface text-xs font-code-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>{isAr ? 'طباعة الدليل' : 'Print Procedure'}</span>
            </button>

            <button
              onClick={() => setIsReportProblemOpen(true)}
              type="button"
              className="px-3 py-2 rounded-xl bg-error-container/15 hover:bg-error-container/30 border border-error/30 text-on-error-container text-xs font-code-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base text-error">report_problem</span>
              <span>{isAr ? 'إبلاغ' : 'Report problem'}</span>
            </button>
          </div>
        </div>

        {/* Title and Metadata Badges */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-code-sm uppercase border ${getDifficultyBadge(
                procedure.difficulty
              )}`}
            >
              {procedure.difficulty}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface text-[10px] font-code-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">timer</span>
              <span>{procedure.estimatedTime}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary-container text-[10px] font-code-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">extension</span>
              <span>{procedure.component}</span>
            </span>
          </div>

          <h1 className="font-headline-lg text-xl sm:text-2xl font-bold text-on-surface">
            {isAr ? procedure.titleAr : procedure.titleEn}
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-white/10 pt-3 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('steps')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-code-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'steps'
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">format_list_numbered</span>
            <span>{isAr ? 'عرض الخطوات الـ 6 (Step View)' : 'Step View (1 to 6)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('prerequisites')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-code-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'prerequisites'
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">construction</span>
            <span>
              {isAr ? 'العدة، القطع، والسوائل' : 'Tools, Parts & Fluids'} (
              {procedure.requiredTools.length + procedure.requiredParts.length})
            </span>
          </button>

          {procedure.videoReference && (
            <button
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold font-code-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'video'
                  ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-surface-container-high text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              <span>{isAr ? 'الفيديو المعتمد' : 'Authorized Video Reference'}</span>
            </button>
          )}

          {procedure.relatedProcedures.length > 0 && (
            <button
              onClick={() => setActiveTab('related')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold font-code-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'related'
                  ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-surface-container-high text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">account_tree</span>
              <span>
                {isAr ? 'الإجراءات ذات الصلة' : 'Related Procedures'} (
                {procedure.relatedProcedures.length})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: STEP VIEW (1 TO 6) */}
      {activeTab === 'steps' && (
        <RepairStepView
          procedure={procedure}
          currentStepIndex={currentStepIndex}
          onStepChange={setCurrentStepIndex}
          lang={lang}
          onOpenReportProblem={() => setIsReportProblemOpen(true)}
          isBookmarked={isBookmarked}
          onToggleBookmark={() => setIsBookmarked(!isBookmarked)}
          onPrint={handlePrint}
        />
      )}

      {/* TAB 2: PREREQUISITES (TOOLS, PARTS, FLUIDS, SAFETY & PREPARATION) */}
      {activeTab === 'prerequisites' && (
        <div className="space-y-6">
          {/* Safety Warnings Banner */}
          <div className="p-5 rounded-2xl bg-error-container/15 border border-error/40 space-y-3">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="font-headline-sm font-bold text-sm uppercase tracking-wider text-on-surface">
                {isAr ? 'تحذيرات الأمان والسلامة المهنية الإلزامية' : 'Mandatory OEM Safety & Hazard Warnings'}
              </h3>
            </div>
            <div className="space-y-2 text-xs font-body-sm text-on-surface-variant">
              {(isAr ? procedure.safetyWarningsAr : procedure.safetyWarningsEn).map((warn, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-error text-base mt-0.5 shrink-0">
                    dangerous
                  </span>
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation Requirements */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-white/5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-xl">
                checklist
              </span>
              <h4 className="font-headline-sm font-bold text-sm text-on-surface">
                {isAr ? 'خطوات التحضير المسبق وتجهيز المركبة' : 'Vehicle Preparation & Bay Setup'}
              </h4>
            </div>
            <ul className="space-y-2 text-xs font-body-sm text-on-surface-variant">
              {(isAr ? procedure.preparationAr : procedure.preparationEn).map((prep, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary-container text-base mt-0.5 shrink-0">
                    check_box
                  </span>
                  <span>{prep}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools & Parts & Fluids Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Required Tools */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg">build</span>
                  <h5 className="font-headline-sm font-bold text-xs text-on-surface uppercase">
                    {isAr ? 'الأدوات والعدد المطلوبة' : 'Required Tools'}
                  </h5>
                </div>
                <span className="text-[10px] font-code-sm text-outline">
                  {procedure.requiredTools.length} {isAr ? 'أدوات' : 'Tools'}
                </span>
              </div>

              <div className="space-y-2">
                {procedure.requiredTools.map((tool, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-surface-container-low border border-white/5 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary-container">
                        {tool.icon || 'build'}
                      </span>
                      <span className="font-medium text-on-surface">{tool.name}</span>
                    </div>
                    {tool.spec && (
                      <span className="text-[10px] font-code-sm text-outline shrink-0">
                        {tool.spec}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Required Parts */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-lg">
                    inventory_2
                  </span>
                  <h5 className="font-headline-sm font-bold text-xs text-on-surface uppercase">
                    {isAr ? 'قطع الغيار الأصلية' : 'Required OEM Parts'}
                  </h5>
                </div>
                <span className="text-[10px] font-code-sm text-outline">
                  {procedure.requiredParts.length} {isAr ? 'قطع' : 'Parts'}
                </span>
              </div>

              <div className="space-y-2">
                {procedure.requiredParts.map((part, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-surface-container-low border border-white/5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-on-surface">{part.name}</span>
                      <span className="text-[10px] font-code-sm text-outline">
                        Qty: {part.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-code-sm">
                      <span className="text-primary-container font-semibold">
                        {part.partNumber}
                      </span>
                      {part.oemBrand && <span className="text-outline">{part.oemBrand}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Fluids */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-lg">opacity</span>
                  <h5 className="font-headline-sm font-bold text-xs text-on-surface uppercase">
                    {isAr ? 'السوائل والشحوم المعتمدة' : 'Required Fluids & Lubes'}
                  </h5>
                </div>
                <span className="text-[10px] font-code-sm text-outline">
                  {procedure.requiredFluids.length} {isAr ? 'سوائل' : 'Fluids'}
                </span>
              </div>

              <div className="space-y-2">
                {procedure.requiredFluids.map((fluid, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-surface-container-low border border-white/5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-on-surface">{fluid.name}</span>
                      <span className="text-[10px] font-code-sm text-secondary font-bold">
                        {fluid.capacity}
                      </span>
                    </div>
                    <div className="text-[10px] font-code-sm text-outline">{fluid.spec}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTHORIZED VIDEO REFERENCE */}
      {activeTab === 'video' && procedure.videoReference && (
        <ControlledVideoPlayer video={procedure.videoReference} lang={lang} />
      )}

      {/* TAB 4: RELATED PROCEDURES */}
      {activeTab === 'related' && (
        <div className="space-y-4">
          <h3 className="font-headline-sm font-bold text-sm text-on-surface">
            {isAr ? 'إجراءات فنية ذات صلة بنفس المنظومة' : 'Connected OEM Repair Procedures'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {procedure.relatedProcedures.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectRelatedProcedure(rel.id)}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-white/5 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-code-sm uppercase border ${getDifficultyBadge(
                        rel.difficulty
                      )}`}
                    >
                      {rel.difficulty}
                    </span>
                    <span className="text-[10px] font-code-sm text-outline">
                      {rel.timeEstimate}
                    </span>
                  </div>
                  <h4 className="font-headline-sm font-bold text-sm text-on-surface group-hover:text-primary-container transition-colors">
                    {isAr ? rel.titleAr : rel.titleEn}
                  </h4>
                  <p className="text-xs text-outline font-code-sm">{rel.system}</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors">
                  arrow_forward
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Problem Modal */}
      <ReportProblemModal
        isOpen={isReportProblemOpen}
        onClose={() => setIsReportProblemOpen(false)}
        procedureId={procedure.id}
        procedureTitle={isAr ? procedure.titleAr : procedure.titleEn}
        currentStepNumber={currentStepIndex + 1}
        lang={lang}
      />
    </div>
  );
};
