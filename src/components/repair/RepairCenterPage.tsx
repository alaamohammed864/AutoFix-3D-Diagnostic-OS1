import React, { useState, useMemo } from 'react';
import { REPAIR_PROCEDURES } from '../../db/repairDatabase';
import { RepairProcedure } from '../../db/repairTypes';
import { RepairProcedureDetails } from './RepairProcedureDetails';
import { Language } from '../../types';

interface RepairCenterPageProps {
  lang: Language;
  initialProcedureId?: string;
}

export const RepairCenterPage: React.FC<RepairCenterPageProps> = ({
  lang,
  initialProcedureId,
}) => {
  const isAr = lang === 'ar';
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(
    initialProcedureId || null
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const currentProcedure = useMemo(() => {
    if (!selectedProcedureId) return null;
    return REPAIR_PROCEDURES.find((p) => p.id === selectedProcedureId) || null;
  }, [selectedProcedureId]);

  // Extract unique systems for filter
  const systems = useMemo(() => {
    return Array.from(new Set(REPAIR_PROCEDURES.map((p) => p.system)));
  }, []);

  // Filtered Procedures
  const filteredProcedures = useMemo(() => {
    return REPAIR_PROCEDURES.filter((proc) => {
      if (onlyBookmarked && !bookmarkedIds.includes(proc.id)) return false;
      if (selectedSystem !== 'all' && proc.system !== selectedSystem) return false;
      if (selectedDifficulty !== 'all' && proc.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle =
          proc.titleEn.toLowerCase().includes(q) || proc.titleAr.includes(q);
        const matchVeh = proc.vehicle.toLowerCase().includes(q);
        const matchComp = proc.component.toLowerCase().includes(q);
        const matchEng = proc.engine.toLowerCase().includes(q);
        const matchTags = proc.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchVeh && !matchComp && !matchEng && !matchTags) return false;
      }
      return true;
    });
  }, [searchQuery, selectedSystem, selectedDifficulty, onlyBookmarked, bookmarkedIds]);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

  if (currentProcedure) {
    return (
      <RepairProcedureDetails
        procedure={currentProcedure}
        lang={lang}
        onBack={() => setSelectedProcedureId(null)}
        onSelectRelatedProcedure={(procId) => setSelectedProcedureId(procId)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <section className="p-6 rounded-2xl bg-surface-container-low border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-secondary/15 text-secondary text-[11px] font-code-sm font-bold tracking-wider uppercase border border-secondary/25 mb-2">
              <span className="material-symbols-outlined text-sm">menu_book</span>
              <span>{isAr ? 'مركز الإصلاح المعتمد' : 'OEM Certified Repair Center'}</span>
            </div>
            <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              {isAr
                ? 'أدلة وإجراءات الإصلاح الميكانيكية التفاعلية'
                : 'Interactive Step-by-Step Automotive Repair Procedures'}
            </h1>
            <p className="text-xs sm:text-sm text-outline font-body-sm mt-1 max-w-3xl leading-relaxed">
              {isAr
                ? 'إجراءات مصنع معتمدة مقسمة إلى 6 خطوات نموذجية (التحضير، تحديد الموضع، فك القطع، تنفيذ الإصلاح، إعادة التركيب، والاختبار) مع متطلبات العدد، تحذيرات الأمان، وفيديوهات موثقة.'
                : 'Verified factory repair protocols structured into standardized 6-step sequences (Preparation, Locate, Remove, Perform Repair, Reinstall, Test) with tool specs, safety warnings, and authorized video references.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 text-center min-w-[95px]">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'إجمالي الإجراءات' : 'Procedures'}
              </span>
              <span className="font-headline-sm font-bold text-lg text-primary-container font-code-sm">
                {REPAIR_PROCEDURES.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 text-center min-w-[95px]">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'المحفوظة' : 'Bookmarked'}
              </span>
              <span className="font-headline-sm font-bold text-lg text-amber-300 font-code-sm">
                {bookmarkedIds.length}
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={
                isAr
                  ? 'ابحث بالإجراء، المركبة، المحرك، أو الكود...'
                  : 'Search procedures, vehicle, engine, DTC code...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl ps-9 pe-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
            />
            <span className="material-symbols-outlined absolute start-2.5 top-2 text-outline text-lg pointer-events-none">
              search
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* System Dropdown */}
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface font-code-sm cursor-pointer"
            >
              <option value="all">{isAr ? 'كافة الأنظمة' : 'All Systems'}</option>
              {systems.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Difficulty Dropdown */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface font-code-sm cursor-pointer"
            >
              <option value="all">{isAr ? 'كافة الصعوبات' : 'All Difficulties'}</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Master Tech">Master Tech</option>
            </select>

            {/* Bookmarked Filter Pill */}
            <button
              type="button"
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`px-3 py-2 rounded-xl border font-code-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                onlyBookmarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-surface-container-high border-white/5 text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {onlyBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
              <span>{isAr ? 'المفضلة فقط' : 'Bookmarked'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Procedures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProcedures.map((proc) => {
          const isSaved = bookmarkedIds.includes(proc.id);

          return (
            <div
              key={proc.id}
              onClick={() => setSelectedProcedureId(proc.id)}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between space-y-4 group hover:bg-surface-container-low/70 shadow-lg"
            >
              <div>
                {/* Header with Difficulty, System, Bookmark Button */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-code-sm uppercase border ${getDifficultyBadge(
                        proc.difficulty
                      )}`}
                    >
                      {proc.difficulty}
                    </span>
                    <span className="text-[10px] font-code-sm text-outline">
                      {proc.estimatedTime}
                    </span>
                  </div>

                  <button
                    onClick={(e) => toggleBookmark(proc.id, e)}
                    type="button"
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-surface-container-high border-white/5 text-outline hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isSaved ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>
                </div>

                {/* Procedure Title */}
                <h3 className="font-headline-sm font-bold text-base text-on-surface group-hover:text-primary-container transition-colors leading-snug">
                  {isAr ? proc.titleAr : proc.titleEn}
                </h3>

                {/* Vehicle & Engine */}
                <p className="text-xs text-primary-container font-code-sm mt-1">
                  {proc.year} {proc.vehicle}
                </p>
                <p className="text-[11px] text-outline font-code-sm">{proc.engine}</p>

                {/* Thumbnail Preview with 6-Step Tag */}
                <div className="relative rounded-xl overflow-hidden mt-3 h-36 bg-black/60 border border-white/5">
                  <img
                    src={proc.steps[0]?.imageUrl}
                    alt={proc.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-code-sm text-white border border-white/10 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-primary-container">
                      format_list_numbered
                    </span>
                    <span>6 Steps Complete</span>
                  </div>
                  {proc.videoReference && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-code-sm text-secondary border border-secondary/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">play_circle</span>
                      <span>{proc.videoReference.duration}</span>
                    </div>
                  )}
                </div>

                {/* Component focus */}
                <div className="mt-3 p-2.5 rounded-xl bg-surface-container-low border border-white/5 text-[11px]">
                  <span className="text-outline uppercase text-[9px] block">
                    {isAr ? 'القطعة المستهدفة:' : 'Target Component:'}
                  </span>
                  <span className="text-on-surface font-semibold font-code-sm">
                    {proc.component}
                  </span>
                </div>
              </div>

              {/* Footer specs counts */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-outline font-code-sm">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-primary-container">
                      build
                    </span>
                    <span>{proc.requiredTools.length} tools</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-secondary">
                      inventory_2
                    </span>
                    <span>{proc.requiredParts.length} parts</span>
                  </span>
                </div>

                <span className="text-primary-container font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>{isAr ? 'بدء الدليل' : 'Start'}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
