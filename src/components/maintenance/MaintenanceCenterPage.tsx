import React, { useState, useMemo } from 'react';
import { VEHICLE_PROFILES } from '../../db/vehicleDatabase';
import {
  MaintenanceCategory,
  TimelineInterval,
  ComprehensiveServiceRecord,
  CategoryStatusResult,
  TimelineIntervalStatusResult,
} from '../../db/maintenanceTypes';
import {
  getVehicleCategorySpecs,
  calculateCategoryStatus,
  calculateTimelineIntervalStatuses,
  INITIAL_SERVICE_RECORDS,
  ALL_MAINTENANCE_CATEGORIES,
} from '../../db/maintenanceDatabase';
import { MaintenanceTimeline } from './MaintenanceTimeline';
import { MaintenanceCategoriesGrid } from './MaintenanceCategoriesGrid';
import { MaintenanceHistoryView } from './MaintenanceHistoryView';
import { AddServiceRecordModal } from './AddServiceRecordModal';
import { ServiceRecordDetailsModal } from './ServiceRecordDetailsModal';
import { Language } from '../../types';

interface MaintenanceCenterPageProps {
  lang: Language;
  activeVehicleId?: string;
  onSetWorkshopVehicle?: (profile: any) => void;
}

export const MaintenanceCenterPage: React.FC<MaintenanceCenterPageProps> = ({
  lang,
  activeVehicleId,
}) => {
  const isAr = lang === 'ar';

  // Selected Vehicle State
  const initialVehicle =
    VEHICLE_PROFILES.find((v) => v.id === activeVehicleId) || VEHICLE_PROFILES[0];
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicle.id);

  const currentVehicle =
    VEHICLE_PROFILES.find((v) => v.id === selectedVehicleId) || VEHICLE_PROFILES[0];

  // Dynamic Odometer State (User can adjust to simulate different mileages)
  const [currentOdometerKm, setCurrentOdometerKm] = useState<number>(45500);
  const [odometerUnit, setOdometerUnit] = useState<'km' | 'mi'>('km');

  // Service Records State (in-memory per session, initialized from seeded records)
  const [serviceRecordsMap, setServiceRecordsMap] = useState<
    Record<string, ComprehensiveServiceRecord[]>
  >(INITIAL_SERVICE_RECORDS);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'timeline' | 'categories' | 'history' | 'specs'>('timeline');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefillCategory, setPrefillCategory] = useState<MaintenanceCategory | undefined>();
  const [prefillIntervalKm, setPrefillIntervalKm] = useState<number | undefined>();
  const [prefillTitle, setPrefillTitle] = useState<string | undefined>();

  const [selectedRecordForDetails, setSelectedRecordForDetails] =
    useState<ComprehensiveServiceRecord | null>(null);

  // Current Vehicle Records
  const vehicleRecords = useMemo(() => {
    return (serviceRecordsMap[selectedVehicleId] || []).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [serviceRecordsMap, selectedVehicleId]);

  // Vehicle Category Specs
  const categorySpecs = useMemo(() => {
    return getVehicleCategorySpecs(selectedVehicleId);
  }, [selectedVehicleId]);

  // Calculated Category Statuses (All 16 Categories)
  const categoryStatuses: CategoryStatusResult[] = useMemo(() => {
    return ALL_MAINTENANCE_CATEGORIES.map((cat) => {
      const spec = categorySpecs[cat];
      return calculateCategoryStatus(cat, spec, currentOdometerKm, vehicleRecords);
    });
  }, [categorySpecs, currentOdometerKm, vehicleRecords]);

  // Calculated Timeline Statuses (0 to 200k km)
  const timelineStatuses: TimelineIntervalStatusResult[] = useMemo(() => {
    return calculateTimelineIntervalStatuses(currentOdometerKm, vehicleRecords);
  }, [currentOdometerKm, vehicleRecords]);

  // Overall Alert Counters
  const alertStats = useMemo(() => {
    let overdue = 0;
    let due = 0;
    let upcoming = 0;
    let healthy = 0;

    categoryStatuses.forEach((c) => {
      if (c.status === 'Overdue') overdue++;
      else if (c.status === 'Due') due++;
      else if (c.status === 'Upcoming') upcoming++;
      else healthy++;
    });

    return { overdue, due, upcoming, healthy };
  }, [categoryStatuses]);

  // Handlers
  const handleSaveNewRecord = (newRecord: ComprehensiveServiceRecord) => {
    setServiceRecordsMap((prev) => {
      const existing = prev[selectedVehicleId] || [];
      return {
        ...prev,
        [selectedVehicleId]: [newRecord, ...existing],
      };
    });
  };

  const handleMarkIntervalCompleted = (interval: TimelineInterval) => {
    setPrefillIntervalKm(interval.km);
    setPrefillCategory(interval.categoriesIncluded[0]);
    setPrefillTitle(isAr ? interval.titleAr : interval.titleEn);
    setIsAddModalOpen(true);
  };

  const handleMarkCategoryCompleted = (cat: MaintenanceCategory) => {
    setPrefillCategory(cat);
    setPrefillIntervalKm(currentOdometerKm);
    setPrefillTitle(
      isAr ? `صيانة دورية: ${categorySpecs[cat]?.nameAr || cat}` : `Scheduled Service: ${cat}`
    );
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Vehicle Selector */}
      <section className="p-6 rounded-2xl bg-surface-container-low border border-white/10 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-primary-container/15 text-primary-container text-[11px] font-code-sm font-bold tracking-wider uppercase border border-primary-container/20 mb-2">
              <span className="material-symbols-outlined text-sm">construction</span>
              <span>{isAr ? 'مركز الصيانة المعتمد' : 'Verified Maintenance Center'}</span>
            </div>
            <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              {isAr
                ? 'حاسبة دورة حياة الصيانة وجداول المصنع الدورية'
                : 'Automotive Lifecycle & Maintenance Calculator'}
            </h1>
            <p className="text-xs sm:text-sm text-outline font-body-sm mt-1 max-w-3xl leading-relaxed">
              {isAr
                ? 'حساب جداول الصيانة التلقائية لكل مركبة، الفئات الـ 16 المعتمدة، تنبيهات الاستحقاق، وإدارة سجلات الفواتير والصور وفق توصيات المصنع.'
                : 'Dynamic lifecycle calculation, 16 verified maintenance subsystems, overdue alerts, and certified service history with invoice and photo attachments.'}
            </p>
          </div>

          {/* "+ Add Service Record" Primary Action */}
          <button
            onClick={() => {
              setPrefillCategory(undefined);
              setPrefillIntervalKm(undefined);
              setPrefillTitle(undefined);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-3 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>{isAr ? 'إضافة سجل صيانة وفاتورة' : 'Add Service Record'}</span>
          </button>
        </div>

        {/* Vehicle Selector & Live Odometer Simulator Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-white/10 items-center">
          {/* Select Vehicle */}
          <div className="md:col-span-5 flex items-center gap-2">
            <span className="text-[11px] text-outline uppercase font-code-sm whitespace-nowrap">
              {isAr ? 'المركبة:' : 'Vehicle:'}
            </span>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-primary-container focus:outline-none focus:border-primary-container cursor-pointer truncate"
            >
              {VEHICLE_PROFILES.map((veh) => (
                <option key={veh.id} value={veh.id}>
                  {veh.year} {veh.make} {veh.model} ({veh.engine})
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Odometer Controller */}
          <div className="md:col-span-7 flex flex-wrap items-center gap-2 justify-start md:justify-end">
            <span className="text-[11px] text-outline uppercase font-code-sm">
              {isAr ? 'قراءة العداد الحالية:' : 'Current Odometer:'}
            </span>
            <div className="inline-flex items-center gap-1 bg-surface-container-high border border-white/10 rounded-xl px-3 py-1.5">
              <input
                type="number"
                min="0"
                max="500000"
                step="500"
                value={currentOdometerKm}
                onChange={(e) => setCurrentOdometerKm(Math.max(0, Number(e.target.value)))}
                className="w-24 bg-transparent text-sm font-bold font-code-sm text-on-surface focus:outline-none text-end"
              />
              <span className="text-xs font-code-sm text-primary-container font-semibold">
                {odometerUnit}
              </span>
            </div>

            {/* Quick Mileage Adjustment Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentOdometerKm((prev) => Math.max(0, prev - 5000))}
                className="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface text-[10px] font-code-sm cursor-pointer"
                title="-5,000 km"
              >
                -5k
              </button>
              <button
                type="button"
                onClick={() => setCurrentOdometerKm((prev) => prev + 5000)}
                className="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface text-[10px] font-code-sm cursor-pointer"
                title="+5,000 km"
              >
                +5k
              </button>
              <button
                type="button"
                onClick={() => setCurrentOdometerKm((prev) => prev + 20000)}
                className="px-2 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface text-[10px] font-code-sm cursor-pointer"
                title="+20,000 km"
              >
                +20k
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time Health Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'متأخر (Overdue)' : 'Overdue Alerts'}
              </span>
              <span
                className={`font-headline-sm font-bold text-lg font-code-sm ${
                  alertStats.overdue > 0 ? 'text-error' : 'text-outline'
                }`}
              >
                {alertStats.overdue} {isAr ? 'أنظمة' : 'Items'}
              </span>
            </div>
            <div
              className={`p-2 rounded-lg ${
                alertStats.overdue > 0 ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-outline'
              }`}
            >
              <span className="material-symbols-outlined text-lg">error</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'مستحق الآن (Due)' : 'Due Now'}
              </span>
              <span
                className={`font-headline-sm font-bold text-lg font-code-sm ${
                  alertStats.due > 0 ? 'text-amber-400' : 'text-outline'
                }`}
              >
                {alertStats.due} {isAr ? 'أنظمة' : 'Items'}
              </span>
            </div>
            <div
              className={`p-2 rounded-lg ${
                alertStats.due > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-surface-container-high text-outline'
              }`}
            >
              <span className="material-symbols-outlined text-lg">warning</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'قادم قريباً' : 'Upcoming'}
              </span>
              <span className="font-headline-sm font-bold text-lg font-code-sm text-secondary">
                {alertStats.upcoming} {isAr ? 'أنظمة' : 'Items'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-secondary/20 text-secondary">
              <span className="material-symbols-outlined text-lg">schedule</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'سليم ومنتظم' : 'Healthy Status'}
              </span>
              <span className="font-headline-sm font-bold text-lg font-code-sm text-primary-container">
                {alertStats.healthy} {isAr ? 'أنظمة' : 'Items'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-primary-container/20 text-primary-container">
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main View Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
              : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-base">timeline</span>
          <span>{isAr ? 'المخطط الزمني (0 - 200k كم)' : 'Maintenance Timeline (0 - 200k km)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
              : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-base">category</span>
          <span>{isAr ? 'الأنظمة الـ 16 المعتمدة' : '16 Subsystems Matrix'}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
              : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-base">history_edu</span>
          <span>
            {isAr ? 'سجل الصيانة والفواتير' : 'Service History & Invoices'} ({vehicleRecords.length})
          </span>
        </button>
      </div>

      {/* Tab 1: Maintenance Timeline */}
      {activeTab === 'timeline' && (
        <MaintenanceTimeline
          lang={lang}
          currentOdometerKm={currentOdometerKm}
          timelineStatuses={timelineStatuses}
          onMarkIntervalCompleted={handleMarkIntervalCompleted}
          onOpenRecordDetails={(recordId) => {
            const r = vehicleRecords.find((x) => x.id === recordId);
            if (r) setSelectedRecordForDetails(r);
          }}
          serviceRecords={vehicleRecords}
        />
      )}

      {/* Tab 2: 16 Categories Grid */}
      {activeTab === 'categories' && (
        <MaintenanceCategoriesGrid
          lang={lang}
          categoryStatuses={categoryStatuses}
          onMarkCategoryCompleted={handleMarkCategoryCompleted}
        />
      )}

      {/* Tab 3: History & Invoices */}
      {activeTab === 'history' && (
        <MaintenanceHistoryView
          lang={lang}
          records={vehicleRecords}
          onOpenRecord={(rec) => setSelectedRecordForDetails(rec)}
          onAddNewRecord={() => setIsAddModalOpen(true)}
          vehicleName={`${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}`}
        />
      )}

      {/* Add / Complete Record Modal */}
      <AddServiceRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        lang={lang}
        vehicleId={selectedVehicleId}
        vehicleName={`${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}`}
        currentOdometerKm={currentOdometerKm}
        prefillCategory={prefillCategory}
        prefillIntervalKm={prefillIntervalKm}
        prefillTitle={prefillTitle}
        onSaveRecord={handleSaveNewRecord}
      />

      {/* Record Details / Receipt Modal */}
      <ServiceRecordDetailsModal
        record={selectedRecordForDetails}
        isOpen={!!selectedRecordForDetails}
        onClose={() => setSelectedRecordForDetails(null)}
        lang={lang}
      />
    </div>
  );
};
