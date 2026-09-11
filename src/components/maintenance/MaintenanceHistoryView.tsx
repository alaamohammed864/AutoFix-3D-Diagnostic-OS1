import React, { useState } from 'react';
import { ComprehensiveServiceRecord, MaintenanceCategory } from '../../db/maintenanceTypes';
import { ALL_MAINTENANCE_CATEGORIES, CATEGORY_META } from '../../db/maintenanceDatabase';
import { Language } from '../../types';

interface MaintenanceHistoryViewProps {
  lang: Language;
  records: ComprehensiveServiceRecord[];
  onOpenRecord: (record: ComprehensiveServiceRecord) => void;
  onAddNewRecord: () => void;
  vehicleName: string;
}

export const MaintenanceHistoryView: React.FC<MaintenanceHistoryViewProps> = ({
  lang,
  records,
  onOpenRecord,
  onAddNewRecord,
  vehicleName,
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredRecords = records.filter((rec) => {
    if (selectedCategory !== 'all') {
      if (!rec.categories.includes(selectedCategory as MaintenanceCategory)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rec.title.toLowerCase().includes(q);
      const matchNotes = rec.notes.toLowerCase().includes(q);
      const matchTech = rec.technician.toLowerCase().includes(q);
      const matchInv = rec.invoice?.invoiceNumber.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchTech && !matchInv) return false;
    }
    return true;
  });

  const totalSpent = records.reduce((acc, curr) => acc + (curr.invoice?.totalAmount || 0), 0);
  const totalServices = records.length;
  const latestService = records[0];

  return (
    <div className="space-y-6">
      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1">
          <span className="text-[10px] text-outline uppercase block">
            {isAr ? 'إجمالي السجلات المعتمدة' : 'Total Service Records'}
          </span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-xl">fact_check</span>
            <span className="font-headline-sm font-bold text-lg text-on-surface font-code-sm">
              {totalServices} {isAr ? 'سجلات' : 'Events'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1">
          <span className="text-[10px] text-outline uppercase block">
            {isAr ? 'إجمالي الإنفاق المفوتر' : 'Cumulative Maintenance Spend'}
          </span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">attach_money</span>
            <span className="font-headline-sm font-bold text-lg text-secondary font-code-sm">
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1">
          <span className="text-[10px] text-outline uppercase block">
            {isAr ? 'آخر صيانة مسجلة' : 'Last Logged Service'}
          </span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-xl">event_available</span>
            <span className="font-headline-sm font-bold text-sm text-on-surface font-code-sm truncate">
              {latestService ? `${latestService.date}` : (isAr ? 'لا يوجد' : 'None')}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1">
          <span className="text-[10px] text-outline uppercase block">
            {isAr ? 'حالة السجل والصيانة' : 'Fleet Compliance Status'}
          </span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-xl">verified_user</span>
            <span className="font-headline-sm font-bold text-xs text-primary-container font-code-sm">
              {isAr ? 'سجل معتمد 100%' : '100% Verified OEM Log'}
            </span>
          </div>
        </div>
      </div>

      {/* Action and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-low border border-white/10">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={isAr ? 'البحث بالاسم، الملاحظات، الفني، أو الفاتورة...' : 'Search by title, notes, technician, invoice...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high border border-white/10 rounded-xl ps-9 pe-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container"
          />
          <span className="material-symbols-outlined absolute start-2.5 top-2 text-outline text-lg pointer-events-none">
            search
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface font-code-sm cursor-pointer"
          >
            <option value="all">{isAr ? 'كافة الفئات' : 'All Categories'}</option>
            {ALL_MAINTENANCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {isAr ? CATEGORY_META[cat]?.nameAr : cat}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onAddNewRecord}
            className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>{isAr ? 'إضافة سجل صيانة' : 'Add Service Record'}</span>
          </button>
        </div>
      </div>

      {/* History Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-12 rounded-2xl bg-surface-container-lowest border border-white/5 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
            <p className="text-on-surface font-semibold text-sm">
              {isAr ? 'لم يتم العثور على سجلات تطابق الفلتر' : 'No service records match your criteria'}
            </p>
            <button
              onClick={onAddNewRecord}
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-xs font-bold"
            >
              {isAr ? 'إنشاء أول سجل صيانة' : 'Create First Service Record'}
            </button>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onOpenRecord(rec)}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-surface-container-low/70"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-surface-container-high text-primary-container group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">build_circle</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-headline-sm font-bold text-sm text-on-surface group-hover:text-primary-container transition-colors">
                      {rec.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-code-sm font-semibold ${
                        rec.status === 'Completed'
                          ? 'bg-primary-container/20 text-primary-container'
                          : 'bg-error-container/20 text-on-error-container'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>

                  <p className="text-xs text-outline font-code-sm mt-1">
                    {isAr ? 'التاريخ:' : 'Date:'} {rec.date} • {isAr ? 'العداد:' : 'Odometer:'}{' '}
                    {rec.odometerKm.toLocaleString()} km • {isAr ? 'الفني:' : 'Tech:'} {rec.technician}
                  </p>

                  <p className="text-xs text-on-surface-variant font-body-sm line-clamp-1 mt-1 max-w-2xl">
                    {rec.notes}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {rec.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] text-outline font-code-sm"
                      >
                        {isAr ? CATEGORY_META[cat]?.nameAr || cat : cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Cost, Photos Badge, Arrow */}
              <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="text-end">
                  <span className="text-[10px] text-outline uppercase block">
                    {isAr ? 'المبلغ الإجمالي' : 'Total Billed'}
                  </span>
                  <span className="font-bold text-sm text-primary-container font-code-sm">
                    {rec.invoice ? `$${rec.invoice.totalAmount.toFixed(2)}` : '$0.00'}
                  </span>
                </div>

                {rec.photos && rec.photos.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary/20 text-secondary text-[10px] font-code-sm">
                    <span className="material-symbols-outlined text-xs">photo_camera</span>
                    <span>{rec.photos.length}</span>
                  </span>
                )}

                <span className="material-symbols-outlined text-outline group-hover:text-primary-container transition-colors">
                  chevron_right
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
