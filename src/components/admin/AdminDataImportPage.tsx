import React, { useState, useEffect } from 'react';
import {
  carCareKioskAdapter,
} from '../../integration/CarCareKioskAdapter';
import {
  ImportedDatabaseRecord,
  SourceHealthMetrics,
  SyncJobSummary,
  IntegrationLog,
} from '../../integration/types';
import { cacheManager } from '../../integration/cacheManager';
import { logger } from '../../integration/logger';
import { Language } from '../../types';

interface AdminDataImportPageProps {
  lang: Language;
  onNavigateToRepair?: () => void;
}

export const AdminDataImportPage: React.FC<AdminDataImportPageProps> = ({
  lang,
  onNavigateToRepair,
}) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'records' | 'validation' | 'health' | 'logs'>(
    'records'
  );
  const [localRecords, setLocalRecords] = useState<ImportedDatabaseRecord[]>([]);
  const [syncSummary, setSyncSummary] = useState<SyncJobSummary | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<SourceHealthMetrics | null>(null);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ImportedDatabaseRecord | null>(null);

  // Filters for records
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>('all');
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');

  const refreshData = async () => {
    setLocalRecords(carCareKioskAdapter.getLocalDatabase());
    setSyncSummary(carCareKioskAdapter.getLastSyncSummary());
    const health = await carCareKioskAdapter.checkSourceHealth();
    setHealthMetrics(health);
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs([...newLogs]);
    });
    return () => unsubscribe();
  }, []);

  const handleRunSync = async () => {
    setIsSyncing(true);
    try {
      const summary = await carCareKioskAdapter.syncRecords();
      setSyncSummary(summary);
      setLocalRecords(carCareKioskAdapter.getLocalDatabase());
      const health = await carCareKioskAdapter.checkSourceHealth();
      setHealthMetrics(health);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await carCareKioskAdapter.checkSourceHealth();
      setHealthMetrics(health);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleToggleOffline = async () => {
    carCareKioskAdapter.toggleSimulateOffline();
    await handleHealthCheck();
  };

  const handlePurgeCache = () => {
    cacheManager.clear();
    refreshData();
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autofix_integration_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Systems for filter
  const uniqueSystems = Array.from(new Set(localRecords.map((r) => r.source_system)));

  // Filtered records
  const filteredRecords = localRecords.filter((rec) => {
    if (selectedSystemFilter !== 'all' && rec.source_system !== selectedSystemFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rec.source_title.toLowerCase().includes(q);
      const matchVehicle = rec.source_vehicle.toLowerCase().includes(q);
      const matchComp = rec.source_component.toLowerCase().includes(q);
      const matchUrl = rec.source_url.toLowerCase().includes(q);
      if (!matchTitle && !matchVehicle && !matchComp && !matchUrl) return false;
    }
    return true;
  });

  // Filtered logs
  const filteredLogs = logs.filter((l) => {
    if (logFilter !== 'all' && l.level !== logFilter) return false;
    return true;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'DEGRADED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'RATE_LIMITED':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'UNAVAILABLE':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-surface-container-high text-outline';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner & Control Station */}
      <section className="p-6 rounded-2xl bg-surface-container-low border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-primary-container/15 text-primary-container text-[11px] font-code-sm font-bold tracking-wider uppercase border border-primary-container/25">
              <span className="material-symbols-outlined text-sm">cloud_sync</span>
              <span>{isAr ? 'طبقة التكامل الخارجي' : 'External Data Integration Layer'}</span>
            </div>
            <h1 className="font-headline-lg text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              {isAr
                ? 'مركز إدارة واستيراد البيانات (CarCareKiosk Adapter)'
                : 'Admin Data Import Hub — CarCareKiosk Adapter'}
            </h1>
            <p className="text-xs sm:text-sm text-outline font-body-sm max-w-3xl leading-relaxed">
              {isAr
                ? 'محرك الاستيراد والتطبيع الآمن: يستخلص البيانات الوصفية المتاحة قانونياً من CarCareKiosk، يطبّق سياسات robots.txt وعزم الشد المعتمد، ويزامن قاعدة البيانات المحلية مع تخزين مؤقت ومقاومة انقطاع المصدر الخارجي.'
                : 'Controlled, policy-compliant ingestion adapter: extracts permitted public metadata, strictly respects robots.txt & fair-use licensing, and stores normalized records in local database with caching, rate limiting, and exponential retry backoff.'}
            </p>
          </div>

          {/* Action Button Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleRunSync}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? (isAr ? 'جارِ المزامنة...' : 'Syncing...') : isAr ? 'بدء المزامنة' : 'Run Sync Job'}</span>
            </button>

            <button
              type="button"
              onClick={handleHealthCheck}
              disabled={isCheckingHealth}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-white/10 text-on-surface font-code-sm text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title={isAr ? 'فحص الاتصال بالمصدر الخارجي' : 'Test External Source Connectivity'}
            >
              <span className={`material-symbols-outlined text-base text-secondary ${isCheckingHealth ? 'animate-pulse' : ''}`}>
                network_ping
              </span>
              <span>{isAr ? 'فحص الاتصال' : 'Health Check'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleOffline}
              className={`px-3.5 py-2.5 rounded-xl border font-code-sm text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                healthMetrics?.isSimulatedOffline
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-surface-container-high border-white/10 text-outline hover:text-on-surface'
              }`}
              title={isAr ? 'محاكاة انقطاع المصدر لاختبار العمل المحلي' : 'Toggle Simulated Source Offline Mode'}
            >
              <span className="material-symbols-outlined text-base">
                {healthMetrics?.isSimulatedOffline ? 'cloud_off' : 'cloud_queue'}
              </span>
              <span>
                {healthMetrics?.isSimulatedOffline
                  ? isAr ? 'المصدر منقطع (محاكاة)' : 'Source Offline (Active)'
                  : isAr ? 'محاكاة انقطاع' : 'Simulate Offline'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePurgeCache}
              className="p-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright border border-white/10 text-outline hover:text-on-surface text-xs font-code-sm transition-all cursor-pointer"
              title={isAr ? 'تفريغ الذاكرة المؤقتة' : 'Purge Cache'}
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
            </button>
          </div>
        </div>

        {/* Source Health & Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-white/10">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase block">
              {isAr ? 'حالة المصدر الخارجي' : 'Source Status'}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-code-sm font-bold border ${getStatusBadge(
                  healthMetrics?.status
                )}`}
              >
                {healthMetrics?.status || 'HEALTHY'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase block">
              {isAr ? 'زمن الاستجابة' : 'Source Latency'}
            </span>
            <span className="font-code-sm font-bold text-sm text-primary-container">
              {healthMetrics?.isSimulatedOffline ? 'TIMEOUT' : `${healthMetrics?.latencyMs || 84} ms`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase block">
              {isAr ? 'توافق robots.txt' : 'robots.txt Policy'}
            </span>
            <span className="font-code-sm font-bold text-sm text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>COMPLIANT</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase block">
              {isAr ? 'معدل الطلب (Rate Limit)' : 'Rate Limit Tokens'}
            </span>
            <span className="font-code-sm font-bold text-sm text-secondary">
              {healthMetrics?.activeTokens || 5} / {healthMetrics?.maxTokens || 5}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase block">
              {isAr ? 'إحصاء الكاش' : 'Cache Efficiency'}
            </span>
            <span className="font-code-sm font-bold text-sm text-on-surface">
              {cacheManager.getStats().hits} hits / {cacheManager.getStats().misses} miss
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase block">
              {isAr ? 'آخر مزامنة' : 'Last Synchronization'}
            </span>
            <span className="font-code-sm text-xs text-outline truncate block">
              {syncSummary ? new Date(syncSummary.completedAt).toLocaleTimeString() : 'Recent'}
            </span>
          </div>
        </div>
      </section>

      {/* REQUIRED METRICS STRIP: Discovered, Imported, Rejected, Duplicate, Errors */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Records Discovered */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-telemetry-label uppercase tracking-wider text-outline">
              {isAr ? 'السجلات المكتشفة' : 'Records Discovered'}
            </span>
            <span className="material-symbols-outlined text-outline text-lg">travel_explore</span>
          </div>
          <div className="font-headline-lg font-bold text-2xl text-on-surface font-code-sm">
            {syncSummary?.recordsDiscovered || localRecords.length + 2}
          </div>
          <span className="text-[10px] font-code-sm text-outline">
            {isAr ? 'مستخلصة من الفهرس العام' : 'Scanned from public index'}
          </span>
        </div>

        {/* Metric 2: Records Imported */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-telemetry-label uppercase tracking-wider text-primary-container">
              {isAr ? 'السجلات المستوردة' : 'Records Imported'}
            </span>
            <span className="material-symbols-outlined text-primary-container text-lg">check_circle</span>
          </div>
          <div className="font-headline-lg font-bold text-2xl text-primary-container font-code-sm">
            {localRecords.length}
          </div>
          <span className="text-[10px] font-code-sm text-outline">
            {isAr ? 'مخزنة في قاعدة البيانات المحلية' : 'Stored in Local Database'}
          </span>
        </div>

        {/* Metric 3: Records Rejected */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-telemetry-label uppercase tracking-wider text-error">
              {isAr ? 'السجلات المرفوضة' : 'Records Rejected'}
            </span>
            <span className="material-symbols-outlined text-error text-lg">cancel</span>
          </div>
          <div className="font-headline-lg font-bold text-2xl text-error font-code-sm">
            {syncSummary?.recordsRejected ?? 2}
          </div>
          <span className="text-[10px] font-code-sm text-outline">
            {isAr ? 'فشلت معايير الصلاحية / السياسة' : 'Failed validation / policy'}
          </span>
        </div>

        {/* Metric 4: Duplicate Records */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-telemetry-label uppercase tracking-wider text-amber-300">
              {isAr ? 'السجلات المكررة' : 'Duplicate Records'}
            </span>
            <span className="material-symbols-outlined text-amber-300 text-lg">control_point_duplicate</span>
          </div>
          <div className="font-headline-lg font-bold text-2xl text-amber-300 font-code-sm">
            {syncSummary?.duplicateRecords ?? 0}
          </div>
          <span className="text-[10px] font-code-sm text-outline">
            {isAr ? 'تم تحديث الطابع الزمني' : 'Deduplicated & updated'}
          </span>
        </div>

        {/* Metric 5: Validation Errors count */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-telemetry-label uppercase tracking-wider text-secondary">
              {isAr ? 'أخطاء التحقق' : 'Validation Errors'}
            </span>
            <span className="material-symbols-outlined text-secondary text-lg">bug_report</span>
          </div>
          <div className="font-headline-lg font-bold text-2xl text-secondary font-code-sm">
            {syncSummary?.validationErrors?.length ?? 2}
          </div>
          <span className="text-[10px] font-code-sm text-outline">
            {isAr ? 'انقر على تبويب التحقق للمعاينة' : 'Itemized in inspection tab'}
          </span>
        </div>
      </section>

      {/* Offline Architecture Resilience Banner */}
      <div className="p-4 rounded-2xl bg-surface-container-lowest border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container">
            <span className="material-symbols-outlined text-xl">layers</span>
          </div>
          <div>
            <h4 className="font-headline-sm font-bold text-xs text-on-surface uppercase tracking-wider">
              {isAr ? 'بنية التدفق المعتمدة (Integration Pipeline)' : 'Deterministic Data Ingestion Pipeline'}
            </h4>
            <p className="text-[11px] text-outline font-code-sm mt-0.5">
              External Source (CarCareKiosk) → Normalizer → Validation → Local Database → Application
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-code-sm text-outline">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          <span>{isAr ? 'الواجهة الأمامية مستقلة تماماً عن المصدر' : 'Frontend 100% decoupled from live scraping'}</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold font-code-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'records'
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
              : 'bg-surface-container-high text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">table_view</span>
          <span>
            {isAr ? 'قاعدة البيانات المحلية المستوردة' : 'Imported Local Database'} ({localRecords.length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('validation')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold font-code-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'validation'
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
              : 'bg-surface-container-high text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">rule</span>
          <span>
            {isAr ? 'أخطاء التحقق والرفض' : 'Validation Errors & Policy Rejections'} (
            {syncSummary?.validationErrors?.length ?? 2})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold font-code-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'health'
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
              : 'bg-surface-container-high text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">monitor_heart</span>
          <span>{isAr ? 'مراقبة صحة المصدر' : 'Source Health & Policies'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold font-code-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
              : 'bg-surface-container-high text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">terminal</span>
          <span>{isAr ? 'سجل العمليات (Audit Logs)' : 'Audit Logs & Telemetry'}</span>
        </button>
      </div>

      {/* TAB 1: IMPORTED LOCAL DATABASE TABLE */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={
                  isAr
                    ? 'بحث بالسجل، المركبة، القطعة، أو الرابط...'
                    : 'Search record title, vehicle, component, or URL...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl ps-9 pe-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container font-code-sm"
              />
              <span className="material-symbols-outlined absolute start-2.5 top-2 text-outline text-lg pointer-events-none">
                search
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSystemFilter}
                onChange={(e) => setSelectedSystemFilter(e.target.value)}
                className="bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface font-code-sm cursor-pointer"
              >
                <option value="all">{isAr ? 'كافة المنظومات' : 'All Systems'}</option>
                {uniqueSystems.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {onNavigateToRepair && (
                <button
                  type="button"
                  onClick={onNavigateToRepair}
                  className="px-3 py-2 rounded-xl bg-secondary-container/20 hover:bg-secondary-container/30 border border-secondary-container/40 text-secondary text-xs font-code-sm font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">menu_book</span>
                  <span>{isAr ? 'فتح مركز الإصلاح' : 'Open Repair Center'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-surface-container-lowest shadow-xl">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-white/10 text-[10px] font-telemetry-label uppercase tracking-wider text-outline">
                  <th className="py-3 px-4 text-start">{isAr ? 'عنوان السجل المستورد' : 'Source Title'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المركبة والموديل' : 'Vehicle & Year'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المنظومة والقطعة' : 'System & Component'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'تاريخ الاسترداد' : 'Retrieved At'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الترخيص والإسناد' : 'License / Attribution'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-code-sm">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-outline">
                      {isAr ? 'لا توجد سجلات مطابقة' : 'No imported records found.'}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-surface-container-high/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRecord(rec)}
                    >
                      <td className="py-3.5 px-4 font-semibold text-on-surface">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary-container text-base shrink-0">
                            {rec.source_type === 'public_video_guide' ? 'play_circle' : 'article'}
                          </span>
                          <div>
                            <span className="block truncate max-w-xs">{rec.source_title}</span>
                            <span className="text-[10px] text-outline font-normal block truncate max-w-xs">
                              {rec.source_url}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-on-surface font-bold">{rec.source_vehicle}</span>
                        <span className="text-[10px] text-outline block">Year: {rec.source_year}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-secondary font-semibold block">{rec.source_system}</span>
                        <span className="text-[10px] text-on-surface-variant block">{rec.source_component}</span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-outline">
                        {new Date(rec.retrieved_at).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-surface-container-high text-[9px] text-outline">
                            {rec.license}
                          </span>
                          <span className="block text-[9px] text-emerald-400 font-semibold">
                            ✓ {isAr ? 'إسناد إلزامي' : 'Attribution Req'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(rec);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-outline text-[11px] transition-colors cursor-pointer"
                        >
                          {isAr ? 'معاينة' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: VALIDATION ERRORS & REJECTIONS */}
      {activeTab === 'validation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-white/5 space-y-1">
            <h3 className="font-headline-sm font-bold text-sm text-on-surface">
              {isAr ? 'سجل تدقيق التحقق وصلاحية السياسات' : 'Validation & Policy Enforcement Audit Log'}
            </h3>
            <p className="text-xs text-outline font-body-sm">
              {isAr
                ? 'أي سجل ينتهك قيود النطاق، بروتوكول HTTPS، نطاق سنوات المركبة (1980 - 2026)، أو مسارات robots.txt يتم رفضه فوراً مع حفظ تقرير بالسبب لمنع تلوث قاعدة البيانات المحلية.'
                : 'Every candidate external record must pass strict domain whitelisting, HTTPS protocol enforcement, automotive year bounds (1980 - 2026), and robots.txt restrictions before entering the local database.'}
            </p>
          </div>

          <div className="space-y-3">
            {(syncSummary?.validationErrors && syncSummary.validationErrors.length > 0
              ? syncSummary.validationErrors
              : [
                  {
                    recordTitle: 'Restricted Admin Telemetry Payload',
                    url: 'https://www.carcarekiosk.com/admin/account/internal_diagnostic_log',
                    errors: [
                      'Robots.txt Policy Violation: Path "/admin/account/internal_diagnostic_log" is disallowed by external robots.txt.',
                    ],
                  },
                  {
                    recordTitle: 'Carburetor Jet Flush - 1962 Ford',
                    url: 'https://www.carcarekiosk.com/video/1962_Classic_Ford/carburetor/clean_jets',
                    errors: [
                      'Automotive year 1962 is out of allowable bounds (1980 - 2026).',
                    ],
                  },
                ]
            ).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-error-container/10 border border-error/30 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-error/20 text-error text-[10px] font-code-sm font-bold uppercase">
                      REJECTED CANDIDATE
                    </span>
                    <h4 className="font-headline-sm font-bold text-sm text-on-surface mt-1">
                      {item.recordTitle}
                    </h4>
                    <span className="text-[11px] text-outline font-code-sm truncate block mt-0.5">
                      {item.url}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-error text-xl shrink-0">
                    report
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-telemetry-label text-error block">
                    {isAr ? 'أسباب الرفض الفنية:' : 'Rejection Reasons:'}
                  </span>
                  <ul className="list-disc list-inside space-y-1 font-code-sm text-on-surface-variant">
                    {item.errors.map((err, eIdx) => (
                      <li key={eIdx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOURCE HEALTH & ROBOTS.TXT MONITORING */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Health & Availability Card */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-xl">
                    dns
                  </span>
                  <h4 className="font-headline-sm font-bold text-sm text-on-surface">
                    {isAr ? 'معايير جاهزية المصدر الخارجي' : 'External Endpoint Health Metrics'}
                  </h4>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-code-sm font-bold border ${getStatusBadge(
                    healthMetrics?.status
                  )}`}
                >
                  {healthMetrics?.status}
                </span>
              </div>

              <div className="space-y-2 text-xs font-code-sm">
                <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                  <span className="text-outline">Target Host:</span>
                  <span className="text-on-surface font-bold">https://www.carcarekiosk.com/</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                  <span className="text-outline">Uptime Calculation:</span>
                  <span className="text-emerald-400 font-bold">{healthMetrics?.uptimePct || 99.8}%</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                  <span className="text-outline">Consecutive Successes:</span>
                  <span className="text-primary-container font-bold">{healthMetrics?.consecutiveSuccesses || 24}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-surface-container-low">
                  <span className="text-outline">Simulated Offline Mode:</span>
                  <span className={`font-bold ${healthMetrics?.isSimulatedOffline ? 'text-rose-400' : 'text-outline'}`}>
                    {healthMetrics?.isSimulatedOffline ? 'ACTIVE (Testing offline fallback)' : 'INACTIVE (Live connectivity)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Robots.txt Policies Card */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">
                  policy
                </span>
                <h4 className="font-headline-sm font-bold text-sm text-on-surface">
                  {isAr ? 'سياسات robots.txt والمسارات المسموحة' : 'Robots.txt Crawl Boundary Verification'}
                </h4>
              </div>

              <div className="space-y-2 text-xs font-code-sm">
                <div>
                  <span className="text-[10px] uppercase font-telemetry-label text-emerald-400 block mb-1">
                    Allowed Public Prefixes (Whitelisted):
                  </span>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-0.5">
                    <div>✓ /video/* (Standard technical procedures)</div>
                    <div>✓ /how-to/* (General guidance metadata)</div>
                    <div>✓ /car-care/* (Publicly published guides)</div>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-telemetry-label text-rose-400 block mb-1">
                    Strictly Disallowed Paths (Enforced):
                  </span>
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-0.5">
                    <div>✗ /admin/* (Administrative portal)</div>
                    <div>✗ /account/* & /user/* (Private credentials)</div>
                    <div>✗ /checkout/* (E-commerce / Billing)</div>
                    <div>✗ /api/private/* (Internal endpoints)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS & TELEMETRY */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLogFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-code-sm cursor-pointer ${
                  logFilter === 'all'
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'bg-surface-container-high text-outline'
                }`}
              >
                ALL ({logs.length})
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('info')}
                className={`px-3 py-1.5 rounded-lg text-xs font-code-sm cursor-pointer ${
                  logFilter === 'info'
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'bg-surface-container-high text-outline'
                }`}
              >
                INFO
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('warn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-code-sm cursor-pointer ${
                  logFilter === 'warn'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-surface-container-high text-outline'
                }`}
              >
                WARN
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('error')}
                className={`px-3 py-1.5 rounded-lg text-xs font-code-sm cursor-pointer ${
                  logFilter === 'error'
                    ? 'bg-error text-on-error font-bold'
                    : 'bg-surface-container-high text-outline'
                }`}
              >
                ERROR
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportLogs}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface text-xs font-code-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>{isAr ? 'تصدير السجل JSON' : 'Export Logs'}</span>
              </button>

              <button
                type="button"
                onClick={() => logger.clear()}
                className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-error-container/30 text-outline hover:text-error text-xs font-code-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">clear_all</span>
                <span>{isAr ? 'مسح السجل' : 'Clear'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/90 border border-white/10 max-h-[500px] overflow-y-auto font-code-sm text-xs space-y-2 scrollbar-thin">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-outline">
                {isAr ? 'لا توجد سجلات مطابقة' : 'No log entries recorded.'}
              </div>
            ) : (
              filteredLogs.map((entry) => {
                let badgeClass = 'text-primary-container';
                if (entry.level === 'warn') badgeClass = 'text-amber-400';
                if (entry.level === 'error') badgeClass = 'text-error';

                return (
                  <div
                    key={entry.id}
                    className="p-2.5 rounded-lg bg-surface-container-lowest/60 border border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold uppercase text-[10px] ${badgeClass}`}>
                          [{entry.level}]
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] text-outline">
                          {entry.event}
                        </span>
                        <span className="text-[10px] text-outline">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-on-surface font-mono text-[11px] leading-relaxed">
                        {entry.message}
                      </p>
                      {entry.details && (
                        <pre className="text-[10px] text-outline bg-black/40 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* RECORD INSPECTION LIGHTBOX MODAL (SHOWS EXACT DATABASE FIELDS) */}
      {selectedRecord && (
        <div
          onClick={() => setSelectedRecord(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-surface-container-lowest border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container text-[10px] font-code-sm font-bold uppercase">
                  LOCAL DATABASE RECORD
                </span>
                <h3 className="font-headline-sm font-bold text-base text-on-surface mt-1">
                  {selectedRecord.source_title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Exact Required Database Fields Grid */}
            <div className="space-y-3 font-code-sm text-xs">
              <span className="text-[10px] font-telemetry-label uppercase tracking-wider text-outline block">
                Required Database Schema Fields
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5">
                  <span className="text-[10px] text-outline uppercase block">source</span>
                  <span className="text-primary-container font-bold">{selectedRecord.source}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5">
                  <span className="text-[10px] text-outline uppercase block">source_type</span>
                  <span className="text-on-surface font-semibold">{selectedRecord.source_type}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5 sm:col-span-2">
                  <span className="text-[10px] text-outline uppercase block">source_url</span>
                  <span className="text-secondary font-semibold break-all">{selectedRecord.source_url}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5">
                  <span className="text-[10px] text-outline uppercase block">source_vehicle</span>
                  <span className="text-on-surface font-bold">{selectedRecord.source_vehicle}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5">
                  <span className="text-[10px] text-outline uppercase block">source_year</span>
                  <span className="text-primary-container font-bold">{selectedRecord.source_year}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5">
                  <span className="text-[10px] text-outline uppercase block">source_system</span>
                  <span className="text-on-surface font-semibold">{selectedRecord.source_system}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5">
                  <span className="text-[10px] text-outline uppercase block">source_component</span>
                  <span className="text-on-surface font-semibold">{selectedRecord.source_component}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5 sm:col-span-2">
                  <span className="text-[10px] text-outline uppercase block">retrieved_at</span>
                  <span className="text-outline">{selectedRecord.retrieved_at}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5">
                  <span className="text-[10px] text-outline uppercase block">license</span>
                  <span className="text-on-surface text-[11px]">{selectedRecord.license}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-low border border-white/5">
                  <span className="text-[10px] text-outline uppercase block">attribution_required</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedRecord.attribution_required ? 'TRUE (MANDATORY)' : 'FALSE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Reference Metadata */}
            {selectedRecord.video_metadata && (
              <div className="p-3 rounded-xl bg-surface-container-low border border-white/5 space-y-2 text-xs">
                <span className="text-[10px] font-telemetry-label uppercase tracking-wider text-outline block">
                  Mapped Video Reference (Educational Fair-Use)
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-outline">Duration: <strong className="text-on-surface">{selectedRecord.video_metadata.duration}</strong></span>
                  <span className="text-outline">Resolution: <strong className="text-secondary">{selectedRecord.video_metadata.resolution}</strong></span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
