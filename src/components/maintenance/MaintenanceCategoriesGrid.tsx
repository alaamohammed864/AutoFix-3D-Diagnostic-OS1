import React, { useState } from 'react';
import {
  MaintenanceCategory,
  CategoryStatusResult,
  MaintenanceAlertStatus,
} from '../../db/maintenanceTypes';
import { Language } from '../../types';

interface MaintenanceCategoriesGridProps {
  lang: Language;
  categoryStatuses: CategoryStatusResult[];
  onMarkCategoryCompleted: (category: MaintenanceCategory) => void;
  onOpenSpecsModal?: (category: MaintenanceCategory) => void;
}

export const MaintenanceCategoriesGrid: React.FC<MaintenanceCategoriesGridProps> = ({
  lang,
  categoryStatuses,
  onMarkCategoryCompleted,
}) => {
  const isAr = lang === 'ar';
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'alert' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<CategoryStatusResult | null>(null);

  const filteredCategories = categoryStatuses.filter((item) => {
    if (selectedFilter === 'alert') {
      if (item.status !== 'Overdue' && item.status !== 'Due') return false;
    }
    if (selectedFilter === 'critical') {
      if (item.spec.severity !== 'critical') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName =
        item.category.toLowerCase().includes(q) ||
        item.spec.nameEn.toLowerCase().includes(q) ||
        item.spec.nameAr.includes(q) ||
        item.spec.oemSpec.toLowerCase().includes(q);
      if (!matchName) return false;
    }
    return true;
  });

  const getAlertBadge = (status: MaintenanceAlertStatus) => {
    switch (status) {
      case 'Overdue':
        return {
          bg: 'bg-error-container text-on-error-container border-error/50 animate-pulse',
          label: isAr ? 'متأخر (Overdue)' : 'Overdue',
          dot: 'bg-error',
          barColor: 'bg-error',
        };
      case 'Due':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: isAr ? 'مستحق الآن (Due)' : 'Due Now',
          dot: 'bg-amber-400',
          barColor: 'bg-amber-400',
        };
      case 'Upcoming':
        return {
          bg: 'bg-secondary/20 text-secondary border-secondary/30',
          label: isAr ? 'قادم قريباً' : 'Upcoming',
          dot: 'bg-secondary',
          barColor: 'bg-secondary',
        };
      default:
        return {
          bg: 'bg-primary-container/20 text-primary-container border-primary-container/40',
          label: isAr ? 'سليم ومنتظم' : 'Healthy',
          dot: 'bg-primary-container',
          barColor: 'bg-primary-container',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-low border border-white/10">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={isAr ? 'البحث في الأنظمة الـ 16 أو مواصفات OEM...' : 'Filter 16 categories or OEM specs...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high border border-white/10 rounded-xl ps-9 pe-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
          />
          <span className="material-symbols-outlined absolute start-2.5 top-2 text-outline text-lg pointer-events-none">
            search
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-code-sm transition-colors cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            {isAr ? 'الكل (16)' : 'All 16 Categories'}
          </button>
          <button
            onClick={() => setSelectedFilter('alert')}
            className={`px-3 py-1.5 rounded-lg text-xs font-code-sm transition-colors cursor-pointer ${
              selectedFilter === 'alert'
                ? 'bg-error-container text-on-error-container font-bold'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            {isAr ? 'تنبيهات عاجلة' : 'Action Required'}
          </button>
          <button
            onClick={() => setSelectedFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-code-sm transition-colors cursor-pointer ${
              selectedFilter === 'critical'
                ? 'bg-secondary text-on-secondary font-bold'
                : 'bg-surface-container-high text-outline hover:text-on-surface'
            }`}
          >
            {isAr ? 'الأنظمة الحرجة' : 'Critical Powertrain'}
          </button>
        </div>
      </div>

      {/* Grid of 16 Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCategories.map((item) => {
          const badge = getAlertBadge(item.status);
          const meta = item.spec;

          return (
            <div
              key={item.category}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between bg-surface-container-lowest/90 ${
                item.status === 'Overdue'
                  ? 'border-error/40 shadow-[0_0_15px_rgba(255,80,80,0.15)]'
                  : item.status === 'Due'
                  ? 'border-amber-500/30'
                  : 'border-white/5 hover:border-white/15'
              }`}
            >
              <div>
                {/* Header with Icon, Title, and Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-surface-container-high text-primary-container">
                      <span className="material-symbols-outlined text-lg">{meta.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm font-bold text-xs text-on-surface leading-tight">
                        {isAr ? meta.nameAr : item.category}
                      </h4>
                      <span className="text-[10px] text-outline font-code-sm block">
                        {meta.intervalKm.toLocaleString()} km / {meta.intervalMonths} mo
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-code-sm font-bold border shrink-0 ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Progress Bar of Distance Travelled in Interval */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[10px] font-code-sm">
                    <span className="text-outline">{isAr ? 'استهلاك الفترة:' : 'Lifecycle Progress:'}</span>
                    <span className="font-semibold text-on-surface">{item.progressPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full ${badge.barColor} transition-all duration-500`}
                      style={{ width: `${item.progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Odometer & Dates Meta Strip */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-surface-container-low/70 border border-white/5 text-[11px] font-code-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-outline">{isAr ? 'آخر صيانة:' : 'Last Service:'}</span>
                    <span className="text-on-surface font-semibold">
                      {item.lastServiceDate ? `${item.lastServiceDate}` : (isAr ? 'غير مسجل' : 'Factory PDI')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">{isAr ? 'الخدمة القادمة:' : 'Next Target:'}</span>
                    <span className="text-primary-container font-semibold">
                      {item.nextServiceOdometer.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1">
                    <span className="text-outline">{isAr ? 'المتبقي:' : 'Remaining:'}</span>
                    <span
                      className={`font-bold ${
                        item.kmRemaining <= 0 ? 'text-error' : item.kmRemaining <= 1000 ? 'text-amber-400' : 'text-secondary'
                      }`}
                    >
                      {item.kmRemaining <= 0
                        ? `${Math.abs(item.kmRemaining).toLocaleString()} km OVERDUE`
                        : `${item.kmRemaining.toLocaleString()} km (${item.daysRemaining} days)`}
                    </span>
                  </div>
                </div>

                {/* OEM Spec Preview */}
                <div className="mb-3 text-[10px] text-outline font-body-sm line-clamp-2">
                  <span className="text-on-surface font-semibold">{isAr ? 'معيار OEM:' : 'OEM Spec:'} </span>
                  {meta.oemSpec}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryDetail(item)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface text-[10px] font-code-sm transition-colors text-center cursor-pointer"
                >
                  {isAr ? 'المواصفات والفحص' : 'Checklist & Specs'}
                </button>
                <button
                  type="button"
                  onClick={() => onMarkCategoryCompleted(item.category)}
                  className="px-3 py-1.5 rounded-lg bg-primary-container/20 hover:bg-primary-container text-primary-container hover:text-on-primary-container text-[10px] font-code-sm font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">done</span>
                  <span>{isAr ? 'إنجاز' : 'Complete'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Detail Modal */}
      {selectedCategoryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-surface-container-lowest rounded-2xl border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container">
                  <span className="material-symbols-outlined text-2xl">
                    {selectedCategoryDetail.spec.icon}
                  </span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-base font-bold text-on-surface">
                    {isAr ? selectedCategoryDetail.spec.nameAr : selectedCategoryDetail.spec.nameEn}
                  </h4>
                  <span className="text-xs text-outline font-code-sm">
                    {selectedCategoryDetail.spec.intervalKm.toLocaleString()} km /{' '}
                    {selectedCategoryDetail.spec.intervalMonths} Months
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategoryDetail(null)}
                className="p-1.5 rounded-lg text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 space-y-1">
                <span className="text-[10px] text-outline uppercase block">
                  {isAr ? 'مواصفات الشركة الصانعة المعتمدة (OEM Spec)' : 'Verified Factory OEM Specification'}
                </span>
                <p className="font-code-sm text-on-surface font-semibold">
                  {selectedCategoryDetail.spec.oemSpec}
                </p>
                {selectedCategoryDetail.spec.oemPartNumber && (
                  <p className="font-code-sm text-primary-container text-[11px]">
                    {isAr ? 'رقم القطعة الأصلي:' : 'OEM Part Number:'}{' '}
                    {selectedCategoryDetail.spec.oemPartNumber}
                  </p>
                )}
                {selectedCategoryDetail.spec.capacityOrSpec && (
                  <p className="font-code-sm text-secondary text-[11px]">
                    {isAr ? 'السعة أو العزم المقنن:' : 'Capacity / Torque Spec:'}{' '}
                    {selectedCategoryDetail.spec.capacityOrSpec}
                  </p>
                )}
              </div>

              {/* Inspection Checklist */}
              <div className="space-y-2">
                <span className="font-telemetry-label uppercase tracking-wider text-outline block">
                  {isAr ? 'خطوات الفحص والتركيب الإلزامية' : 'Mandatory Service Checklist & Procedure'}
                </span>
                <ul className="space-y-1.5 font-body-sm">
                  {selectedCategoryDetail.spec.inspectionChecklist.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary-container text-sm mt-0.5">
                        check
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cost and Labor */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-lg bg-surface-container-high">
                  <span className="text-[10px] text-outline block">
                    {isAr ? 'ساعات العمل الفني' : 'Labor Hours'}
                  </span>
                  <span className="font-bold text-on-surface text-sm font-code-sm">
                    {selectedCategoryDetail.spec.estimatedLaborHours} Hrs
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-container-high">
                  <span className="text-[10px] text-outline block">
                    {isAr ? 'متوسط تكلفة الخدمة' : 'Avg Cost Range'}
                  </span>
                  <span className="font-bold text-primary-container text-sm font-code-sm">
                    {selectedCategoryDetail.spec.averageCostRange}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  const cat = selectedCategoryDetail.category;
                  setSelectedCategoryDetail(null);
                  onMarkCategoryCompleted(cat);
                }}
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs shadow cursor-pointer"
              >
                {isAr ? 'تسجيل صيانة لهذا النظام الآن' : 'Record Service For This Subsystem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
