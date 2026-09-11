import React, { useState, useEffect } from 'react';
import {
  NetworkSyncState,
  subscribeToSyncState,
  triggerSyncProcessing,
  getSyncQueue,
  clearCompletedSyncQueue,
  isDeviceOnline,
  SyncQueueItem,
} from '../offline/offlineStorage';

interface NetworkSyncBadgeProps {
  lang: 'en' | 'ar';
}

export const NetworkSyncBadge: React.FC<NetworkSyncBadgeProps> = ({ lang }) => {
  const [syncState, setSyncState] = useState<NetworkSyncState>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'ONLINE' : 'OFFLINE'
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const isAr = lang === 'ar';

  useEffect(() => {
    const unsubscribe = subscribeToSyncState((state, count) => {
      setSyncState(state);
      setPendingCount(count);
      setQueue(getSyncQueue());
    });
    setQueue(getSyncQueue());
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    await triggerSyncProcessing();
    setQueue(getSyncQueue());
  };

  const handleClearCompleted = () => {
    clearCompletedSyncQueue();
    setQueue(getSyncQueue());
  };

  return (
    <>
      {/* Network Status Badge Button */}
      <button
        id="network-sync-status-badge"
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-code-sm border transition-all cursor-pointer ${
          syncState === 'ONLINE'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            : syncState === 'OFFLINE'
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-pulse'
            : 'bg-primary-container/15 border-primary-container/40 text-primary-container hover:bg-primary-container/25'
        }`}
        title={
          isAr
            ? syncState === 'ONLINE'
              ? 'متصل بالشبكة وسحاب التزامن نشط'
              : syncState === 'OFFLINE'
              ? 'وضع العمل دون اتصال (أوفلاين) - البيانات المخزنة محلياً مفعلة'
              : 'جاري مزامنة السجلات المعلقة مع السحابة'
            : syncState === 'ONLINE'
            ? 'Online - Live Cloud Sync Active'
            : syncState === 'OFFLINE'
            ? 'Offline Mode - Local Storage & Verified Cache Active'
            : 'Syncing pending records to cloud...'
        }
      >
        {/* Status Indicator Dot/Spinner */}
        {syncState === 'ONLINE' && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}

        {syncState === 'OFFLINE' && (
          <span className="flex h-2 w-2 rounded-full bg-amber-400"></span>
        )}

        {syncState === 'SYNCING' && (
          <span className="material-symbols-outlined text-xs animate-spin text-primary-container">
            sync
          </span>
        )}

        {/* State Label */}
        <span className="font-bold tracking-wider uppercase text-[11px]">
          {syncState === 'ONLINE' && (isAr ? 'متصل' : 'ONLINE')}
          {syncState === 'OFFLINE' && (isAr ? 'بدون اتصال' : 'OFFLINE')}
          {syncState === 'SYNCING' && (isAr ? 'مزامنة...' : 'SYNCING')}
        </span>

        {/* Pending Queue Count Pill */}
        {pendingCount > 0 && (
          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-400/30 text-amber-200 border border-amber-400/40">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Synchronization Queue & Offline Verification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface-container/50">
              <div className="flex items-center gap-2.5">
                <span
                  className={`material-symbols-outlined text-2xl ${
                    syncState === 'ONLINE'
                      ? 'text-emerald-400'
                      : syncState === 'OFFLINE'
                      ? 'text-amber-400'
                      : 'text-primary-container animate-spin'
                  }`}
                >
                  {syncState === 'ONLINE' ? 'cloud_done' : syncState === 'OFFLINE' ? 'cloud_off' : 'sync'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-code-sm font-bold text-on-surface uppercase">
                      {isAr ? 'إدارة المزامنة والعمل دون اتصال' : 'PWA Sync Queue & Offline Engine'}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        syncState === 'ONLINE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : syncState === 'OFFLINE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-primary-container/20 text-primary-container border border-primary-container/30'
                      }`}
                    >
                      {syncState}
                    </span>
                  </div>
                  <p className="text-[11px] font-code-sm text-outline">
                    {isAr
                      ? 'نظام التخزين المحلي الآمن وقائمة انتظار المزامنة التلقائية'
                      : 'Zero-loss offline queue with verified OEM local specifications'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Offline Strict Verification Policy Banner */}
            <div className="p-3 mx-4 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-code-sm text-amber-200/90 leading-relaxed flex items-start gap-2.5">
              <span className="material-symbols-outlined text-amber-400 text-lg shrink-0 mt-0.5">
                verified_user
              </span>
              <div>
                <strong className="text-amber-300 block mb-0.5">
                  {isAr ? 'سياسة النزاهة دون اتصال (Offline Integrity):' : 'Offline Data Verification Standard:'}
                </strong>
                {isAr
                  ? 'عند انقطاع الاتصال، يعرض النظام حصرياً المواصفات المعتمدة ودفاتر الصيانة المحفوظة محلياً. لا يتم محاكاة أو اختلاق أي بيانات سحابية خارجية أثناء انقطاع الإنترنت.'
                  : 'When offline, AutoFix strictly displays verified OEM specifications and locally committed logs. The OS will never simulate or pretend external cloud telemetry was retrieved while offline.'}
              </div>
            </div>

            {/* Queue List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-code-sm font-semibold text-outline uppercase">
                  {isAr ? 'طابور المزامنة المعلقة:' : 'Pending Synchronization Queue:'} ({queue.length})
                </span>
                <div className="flex items-center gap-2">
                  {queue.some(q => q.status === 'SYNCED') && (
                    <button
                      onClick={handleClearCompleted}
                      className="text-[11px] font-code-sm text-outline hover:text-on-surface px-2 py-1 rounded bg-surface-container cursor-pointer"
                    >
                      {isAr ? 'تنظيف المكتمل' : 'Clear Synced'}
                    </button>
                  )}
                  <button
                    onClick={handleManualSync}
                    disabled={!isDeviceOnline() || syncState === 'SYNCING'}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-container hover:bg-primary-container/80 text-on-primary-container text-xs font-code-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">sync</span>
                    <span>{isAr ? 'مزامنة فورية' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-surface-container/30 border border-white/5 space-y-1">
                  <span className="material-symbols-outlined text-3xl text-emerald-400">task_alt</span>
                  <p className="text-xs font-code-sm text-on-surface font-semibold">
                    {isAr ? 'جميع السجلات متزامنة بالكامل مع السحابة' : 'All local changes are fully synced'}
                  </p>
                  <p className="text-[11px] font-code-sm text-outline">
                    {isAr
                      ? 'أي تعديل جديد يتم حفظه فورياً في المتصفح حتى بدون شبكة'
                      : 'Any new offline notes or maintenance will be queued here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-surface-container border border-white/5 flex items-center justify-between text-xs font-code-sm"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.type === 'SAVE_VEHICLE'
                                ? 'bg-blue-500/20 text-blue-300'
                                : item.type === 'LOG_MAINTENANCE'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}
                          >
                            {item.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-outline">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-on-surface truncate">
                          {item.payload.taskTitle ||
                            item.payload.vehicleName ||
                            item.payload.make ||
                            item.payload.notes?.slice(0, 40) ||
                            JSON.stringify(item.payload).slice(0, 50)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ms-2">
                        {item.status === 'SYNCED' && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>{isAr ? 'تم' : 'SYNCED'}</span>
                          </span>
                        )}
                        {item.status === 'PENDING' && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                            <span className="material-symbols-outlined text-sm">hourglass_top</span>
                            <span>{isAr ? 'معلق' : 'PENDING'}</span>
                          </span>
                        )}
                        {item.status === 'SYNCING' && (
                          <span className="flex items-center gap-1 text-[11px] text-primary-container font-bold">
                            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                            <span>{isAr ? 'جاري' : 'SYNCING'}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-surface-container/50 flex items-center justify-between text-[11px] font-code-sm text-outline">
              <span>{isDeviceOnline() ? '● Network: Connected (Broadband)' : '○ Network: Disconnected (Offline Shell)'}</span>
              <span className="text-primary-container">AutoFix PWA v2.1</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
