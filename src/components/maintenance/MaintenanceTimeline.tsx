import React, { useState } from 'react';
import {
  TimelineInterval,
  ComprehensiveServiceRecord,
  TimelineIntervalStatusResult,
} from '../../db/maintenanceTypes';
import { CATEGORY_META } from '../../db/maintenanceDatabase';
import { Language } from '../../types';

interface MaintenanceTimelineProps {
  lang: Language;
  currentOdometerKm: number;
  timelineStatuses: TimelineIntervalStatusResult[];
  onMarkIntervalCompleted: (interval: TimelineInterval) => void;
  onOpenRecordDetails: (recordId: string) => void;
  serviceRecords: ComprehensiveServiceRecord[];
}

export const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({
  lang,
  currentOdometerKm,
  timelineStatuses,
  onMarkIntervalCompleted,
  onOpenRecordDetails,
  serviceRecords,
}) => {
  const isAr = lang === 'ar';
  const [selectedKm, setSelectedKm] = useState<number>(10000);
  const [filterMode, setFilterMode] = useState<'all' | 'due-overdue' | 'completed'>('all');

  const filteredTimeline = timelineStatuses.filter((item) => {
    if (filterMode === 'due-overdue') return item.status === 'Overdue' || item.status === 'Due';
    if (filterMode === 'completed') return item.status === 'Completed';
    return true;
  });

  const selectedItem =
    timelineStatuses.find((t) => t.interval.km === selectedKm) || timelineStatuses[0];

  const getStatusBadge = (status: TimelineIntervalStatusResult['status']) => {
    switch (status) {
      case 'Completed':
        return {
          bg: 'bg-primary-container/20 text-primary-container border-primary-container/40',
          dot: 'bg-primary-container',
          icon: 'check_circle',
          label: isAr ? 'مكتمل' : 'Completed',
        };
      case 'Overdue':
        return {
          bg: 'bg-error-container text-on-error-container border-error/50 animate-pulse',
          dot: 'bg-error',
          icon: 'error',
          label: isAr ? 'متأخر (تجاوز الموعد)' : 'Overdue',
        };
      case 'Due':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          icon: 'warning',
          label: isAr ? 'حان الموعد الآن' : 'Due Now',
        };
      case 'Upcoming':
        return {
          bg: 'bg-secondary/20 text-secondary border-secondary/30',
          dot: 'bg-secondary',
          icon: 'schedule',
          label: isAr ? 'قادم قريباً' : 'Upcoming',
        };
      default:
        return {
          bg: 'bg-surface-container-high text-outline border-white/5',
          dot: 'bg-outline',
          icon: 'hourglass_empty',
          label: isAr ? 'مستقبلي' : 'Future Milestone',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Current Vehicle Progress Bar */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-container/20 text-primary-container">
              <span className="material-symbols-outlined text-xl">timeline</span>
            </div>
            <div>
              <h3 className="font-headline-sm font-bold text-on-surface text-base">
                {isAr ? 'المخطط الزمني لمسافات وفترات الصيانة المعتمدة' : 'Factory Maintenance Milestones Timeline'}
              </h3>
              <p className="text-xs text-outline font-code-sm">
                {isAr ? 'العداد النشط:' : 'Active Odometer:'} {currentOdometerKm.toLocaleString()} km
              </p>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-high border border-white/5 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-code-sm transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {isAr ? 'كافة المحطات' : 'All Milestones'}
            </button>
            <button
              onClick={() => setFilterMode('due-overdue')}
              className={`px-3 py-1.5 rounded-lg font-code-sm transition-colors cursor-pointer ${
                filterMode === 'due-overdue'
                  ? 'bg-error-container text-on-error-container font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {isAr ? 'المستحق والمتأخر' : 'Due / Overdue'}
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1.5 rounded-lg font-code-sm transition-colors cursor-pointer ${
                filterMode === 'completed'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {isAr ? 'المكتمل' : 'Completed'}
            </button>
          </div>
        </div>

        {/* Horizontal Milestone Tracker Strip */}
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max pt-2">
            {timelineStatuses.map((item) => {
              const badge = getStatusBadge(item.status);
              const isCurrentSelected = item.interval.km === selectedKm;
              const isMilestonePassed = currentOdometerKm >= item.interval.km;

              return (
                <button
                  key={item.interval.km}
                  type="button"
                  onClick={() => setSelectedKm(item.interval.km)}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer min-w-[110px] text-center ${
                    isCurrentSelected
                      ? 'bg-surface-container-high border-primary-container shadow-[0_0_15px_rgba(0,240,255,0.25)] scale-105'
                      : 'bg-surface-container-lowest/80 border-white/5 hover:border-white/20 hover:bg-surface-container-high/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`h-2 w-2 rounded-full ${badge.dot}`}></span>
                    <span className="font-code-sm font-bold text-xs text-on-surface">
                      {item.interval.km === 0 ? '0 km (PDI)' : `${(item.interval.km / 1000).toFixed(0)}k km`}
                    </span>
                  </div>

                  <span className="text-[10px] text-outline font-code-sm">
                    {item.interval.months === 0 ? 'Delivery' : `${item.interval.months} Mo`}
                  </span>

                  <span
                    className={`mt-2 px-2 py-0.5 rounded-md text-[9px] font-code-sm font-semibold border ${badge.bg}`}
                  >
                    {badge.label}
                  </span>

                  {item.interval.isMajorService && (
                    <span className="mt-1 text-[8px] tracking-wider uppercase font-bold text-secondary">
                      MAJOR
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Milestone Inspection Card */}
      {selectedItem && (
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-xl space-y-6">
          {/* Header of Selected Milestone */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-primary-container/20 text-primary-container border border-primary-container/30">
                <span className="material-symbols-outlined text-3xl">speed</span>
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h4 className="font-headline-sm text-xl font-bold text-on-surface">
                    {isAr ? selectedItem.interval.titleAr : selectedItem.interval.titleEn}
                  </h4>
                  {selectedItem.interval.isMajorService && (
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-secondary border border-secondary/40 text-[10px] font-bold uppercase tracking-wider">
                      {isAr ? 'صيانة كبرى رئيسية' : 'Major Milestone'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-outline font-body-sm mt-1 max-w-2xl leading-relaxed">
                  {isAr ? selectedItem.interval.descriptionAr : selectedItem.interval.descriptionEn}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3 shrink-0">
              {selectedItem.status === 'Completed' ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/40 text-xs font-bold font-code-sm">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>
                      {isAr ? 'تم الإنجاز في:' : 'Serviced:'} {selectedItem.completedDate || 'Recent'} (
                      {selectedItem.completedOdometer?.toLocaleString()} km)
                    </span>
                  </span>
                  <button
                    onClick={() => {
                      const matched = serviceRecords.find(
                        (r) =>
                          r.intervalKmTriggered === selectedItem.interval.km ||
                          Math.abs(r.odometerKm - selectedItem.interval.km) <= 2000
                      );
                      if (matched) onOpenRecordDetails(matched.id);
                    }}
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface transition-colors cursor-pointer"
                    title={isAr ? 'عرض تفاصيل الفاتورة والصور' : 'View Service Invoice'}
                  >
                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onMarkIntervalCompleted(selectedItem.interval)}
                  className="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-bold text-xs shadow-[0_0_18px_rgba(0,240,255,0.35)] transition-all cursor-pointer flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{isAr ? 'تأكيد إنجاز الصيانة' : 'Mark as Completed'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Milestone Specs & Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'المسافة المستهدفة' : 'Target Interval'}
              </span>
              <span className="font-bold text-on-surface text-sm font-code-sm mt-0.5 block">
                {selectedItem.interval.km.toLocaleString()} km ({selectedItem.interval.miles.toLocaleString()} mi)
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'المدة الزمنية المقدرة' : 'Time Interval'}
              </span>
              <span className="font-bold text-on-surface text-sm font-code-sm mt-0.5 block">
                {selectedItem.interval.months === 0 ? 'Pre-Delivery' : `${selectedItem.interval.months} Months`}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'ساعات العمل الفني' : 'Estimated Labor'}
              </span>
              <span className="font-bold text-secondary text-sm font-code-sm mt-0.5 block">
                {selectedItem.interval.estimatedLaborHours} Hours
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'التكلفة التقديرية' : 'Estimated Cost'}
              </span>
              <span className="font-bold text-primary-container text-sm font-code-sm mt-0.5 block">
                {selectedItem.interval.estimatedCostRange}
              </span>
            </div>
          </div>

          {/* Categories Treated in this Milestone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-headline-sm font-semibold text-on-surface text-sm">
                {isAr ? 'الأنظمة والبنود المشمولة بالفحص والاستبدال' : 'Subsystems & Inspection Checklist'}
              </h5>
              <span className="text-xs text-outline font-code-sm">
                {selectedItem.interval.categoriesIncluded.length} {isAr ? 'بنود' : 'Items'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedItem.interval.categoriesIncluded.map((cat) => {
                const meta = CATEGORY_META[cat];
                const catStatus = selectedItem.categoriesStatus.find((c) => c.category === cat);
                const isCatDone = catStatus?.isCompleted || selectedItem.status === 'Completed';

                return (
                  <div
                    key={cat}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      isCatDone
                        ? 'bg-primary-container/10 border-primary-container/30 text-on-surface'
                        : 'bg-surface-container-low border-white/5 text-on-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-lg ${
                          isCatDone ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-outline'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {meta?.icon || 'build'}
                        </span>
                      </div>
                      <div>
                        <div className="font-body-sm font-semibold text-xs text-on-surface">
                          {isAr ? meta?.nameAr : cat}
                        </div>
                        <div className="text-[10px] text-outline">
                          {isAr ? 'فحص واستبدال معتمد' : 'Inspect & Replace if worn'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`material-symbols-outlined text-base ${
                        isCatDone ? 'text-primary-container' : 'text-outline-variant'
                      }`}
                    >
                      {isCatDone ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
