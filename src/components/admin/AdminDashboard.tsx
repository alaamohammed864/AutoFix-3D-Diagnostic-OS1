// AutoFix 3D - Enterprise Automotive Admin & Data Governance Dashboard
// Full suite managing 16 Sections + Data Quality Dashboard with Provenance Retained

import React, { useState, useEffect } from 'react';
import { AdminSection, BaseAdminRecord } from '../../admin/types';
import { adminStore } from '../../admin/adminStore';
import { DataQualityDashboard } from './DataQualityDashboard';
import { AdminEntityTable } from './AdminEntityTable';
import { RecordProvenanceModal } from './RecordProvenanceModal';
import { CreateEditRecordModal } from './CreateEditRecordModal';
import { MergeDuplicatesModal } from './MergeDuplicatesModal';
import { ImportBatchModal } from './ImportBatchModal';
import { Language } from '../../types';

interface AdminDashboardProps {
  lang?: Language;
  onNavigateHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang = 'en',
  onNavigateHome,
}) => {
  const isAr = lang === 'ar';
  const [activeSection, setActiveSection] = useState<AdminSection>('data-quality');
  const [records, setRecords] = useState<BaseAdminRecord[]>([]);
  const [qualitySummary, setQualitySummary] = useState(adminStore.getQualitySummary());

  // Modal States
  const [inspectingRecord, setInspectingRecord] = useState<{
    record: BaseAdminRecord;
    section: string;
  } | null>(null);
  const [editingRecord, setEditingRecord] = useState<BaseAdminRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mergeCandidates, setMergeCandidates] = useState<BaseAdminRecord[] | null>(null);

  const refreshState = () => {
    setRecords(adminStore.getSectionRecords(activeSection));
    setQualitySummary(adminStore.getQualitySummary());
  };

  useEffect(() => {
    refreshState();
    const unsubscribe = adminStore.subscribe(() => {
      refreshState();
    });
    return () => unsubscribe();
  }, [activeSection]);

  const handleSaveRecord = (formData: Partial<BaseAdminRecord>) => {
    if (editingRecord) {
      adminStore.editRecord(
        activeSection,
        editingRecord.id,
        formData,
        'System Security Administrator'
      );
    } else {
      adminStore.createRecord(activeSection, formData, 'System Security Administrator');
    }
    refreshState();
  };

  const handleExecuteMerge = (
    masterId: string,
    duplicateId: string,
    mergedFields: Partial<BaseAdminRecord>
  ) => {
    adminStore.mergeDuplicates(
      activeSection,
      masterId,
      duplicateId,
      mergedFields,
      'System Security Administrator'
    );
    setMergeCandidates(null);
    refreshState();
  };

  const handleExecuteImport = (
    batchRecords: any[],
    sourceMetadata: {
      source: string;
      sourceUrl?: string;
      license?: string;
      importedBy: string;
    }
  ) => {
    adminStore.importBatch(activeSection, batchRecords, sourceMetadata);
    refreshState();
  };

  const handleVerifyRecord = (recordId: string) => {
    const rec = records.find((r) => r.id === recordId);
    if (rec) {
      adminStore.editRecord(
        activeSection,
        recordId,
        {
          provenance: {
            ...rec.provenance,
            verificationStatus: 'Verified',
            qualityIssues: [],
            confidenceScore: 99,
          },
        },
        'System Security Administrator'
      );
      refreshState();
    }
  };

  // Section categories for intuitive navigation
  const sectionGroups = [
    {
      groupTitle: isAr ? 'حوكمة الجودة' : 'Data Governance',
      items: [
        {
          id: 'data-quality' as AdminSection,
          label: isAr ? 'لوحة جودة البيانات' : 'Data Quality',
          icon: 'verified_user',
          badge: `${qualitySummary.overallHealthScore}%`,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        },
      ],
    },
    {
      groupTitle: isAr ? 'هندسة المركبات' : 'Vehicle Architecture',
      items: [
        { id: 'vehicles' as AdminSection, label: isAr ? 'المركبات' : 'Vehicles', icon: 'directions_car' },
        { id: 'manufacturers' as AdminSection, label: isAr ? 'المصنعون' : 'Manufacturers', icon: 'factory' },
        { id: 'models' as AdminSection, label: isAr ? 'الموديلات' : 'Models', icon: 'auto_stories' },
        { id: 'engines' as AdminSection, label: isAr ? 'المحركات' : 'Engines', icon: 'potted_plant' },
        { id: 'systems' as AdminSection, label: isAr ? 'الأنظمة' : 'Systems', icon: 'account_tree' },
        { id: 'components' as AdminSection, label: isAr ? 'المكونات' : 'Components', icon: 'memory' },
      ],
    },
    {
      groupTitle: isAr ? 'التشخيص والصيانة' : 'Service & Diagnostics',
      items: [
        { id: 'repairs' as AdminSection, label: isAr ? 'إجراءات الإصلاح' : 'Repairs', icon: 'build' },
        { id: 'diagnostics' as AdminSection, label: isAr ? 'شجرة التشخيص' : 'Diagnostics', icon: 'query_stats' },
        { id: 'dtc' as AdminSection, label: isAr ? 'أعطال DTC' : 'DTC Codes', icon: 'warning' },
        { id: 'maintenance' as AdminSection, label: isAr ? 'جداول الصيانة' : 'Maintenance', icon: 'event_note' },
        { id: 'videos' as AdminSection, label: isAr ? 'فيديوهات تقنية' : 'Videos', icon: 'smart_display' },
      ],
    },
    {
      groupTitle: isAr ? 'التشغيل والحوكمة' : 'Operations & Health',
      items: [
        { id: 'sources' as AdminSection, label: isAr ? 'المصادر المعتمدة' : 'Sources', icon: 'hub' },
        { id: 'imports' as AdminSection, label: isAr ? 'سجل الاستيراد' : 'Imports', icon: 'cloud_sync' },
        { id: 'users' as AdminSection, label: isAr ? 'المستخدمين والأدوار' : 'Users', icon: 'group' },
        { id: 'reports' as AdminSection, label: isAr ? 'التقارير التحليلية' : 'Reports', icon: 'analytics' },
        { id: 'system-health' as AdminSection, label: isAr ? 'صحة النظام' : 'System Health', icon: 'monitor_heart' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface p-4 lg:p-6 space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(0,240,255,0.25)]">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-md text-xl font-bold text-on-surface tracking-tight">
                  {isAr ? 'لوحة تحكم المشرف وحوكمة البيانات' : 'Enterprise Admin & Data Governance'}
                </h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-code-sm border border-emerald-500/40">
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-xs text-outline font-telemetry-label uppercase tracking-widest mt-0.5">
                {isAr
                  ? 'إدارة 16 قسماً مع ضمان تتبع المصدر وضمان جودة البيانات'
                  : '16 Mission-Critical Domains with Cryptographic Source Provenance'}
              </p>
            </div>
          </div>
        </div>

        {/* Top Summary Metric & Home Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-surface-container border border-white/5 text-xs font-code-sm">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{qualitySummary.verifiedCount} Verified</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{qualitySummary.unverifiedCount + qualitySummary.needsReviewCount} Review</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{qualitySummary.duplicateCount + qualitySummary.missingDataCount} Issues</span>
            </div>
          </div>

          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold cursor-pointer border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              <span>{isAr ? 'العودة للمنصة' : 'Exit to App'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Categorized Navigation Tabs */}
      <div className="overflow-x-auto pb-2">
        <div className="flex flex-nowrap items-center gap-5 min-w-max">
          {sectionGroups.map((grp, gIdx) => (
            <div key={gIdx} className="flex items-center gap-1 bg-surface-container-low/60 p-1 rounded-xl border border-white/5">
              <span className="text-[9px] uppercase tracking-wider text-outline font-telemetry-label px-2 hidden xl:inline">
                {grp.groupTitle}:
              </span>
              {grp.items.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,240,255,0.3)] font-bold'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`ms-1 px-1.5 py-0.2 rounded text-[9px] font-code-sm font-bold border ${item.badgeColor || 'bg-white/10'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main Section Content Area */}
      {activeSection === 'data-quality' ? (
        <DataQualityDashboard
          summary={qualitySummary}
          onNavigateSection={(sec) => setActiveSection(sec)}
          onInspectProvenance={(rec, sec) => setInspectingRecord({ record: rec, section: sec })}
          onEditRecord={(rec, sec) => {
            setActiveSection(sec);
            setEditingRecord(rec);
          }}
          onLaunchMerge={(candidates, sec) => {
            setActiveSection(sec);
            setMergeCandidates(candidates);
          }}
          onRefresh={refreshState}
          lang={lang}
        />
      ) : (
        <AdminEntityTable
          section={activeSection}
          records={records}
          onInspectProvenance={(rec, sec) => setInspectingRecord({ record: rec, section: sec })}
          onEditRecord={(rec) => setEditingRecord(rec)}
          onCreateRecord={() => setIsCreateModalOpen(true)}
          onImportBatch={() => setIsImportModalOpen(true)}
          onLaunchMerge={(candidates) => setMergeCandidates(candidates)}
          onRefresh={refreshState}
          lang={lang}
        />
      )}

      {/* 1. Modal: Record Provenance Inspector */}
      {inspectingRecord && (
        <RecordProvenanceModal
          isOpen={!!inspectingRecord}
          record={inspectingRecord.record}
          section={inspectingRecord.section}
          onClose={() => setInspectingRecord(null)}
          onVerifyRecord={handleVerifyRecord}
          lang={lang}
        />
      )}

      {/* 2. Modal: Create / Edit Record with Provenance Input */}
      {(isCreateModalOpen || editingRecord) && (
        <CreateEditRecordModal
          isOpen={isCreateModalOpen || !!editingRecord}
          section={activeSection}
          recordToEdit={editingRecord}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveRecord}
          lang={lang}
        />
      )}

      {/* 3. Modal: Merge Duplicates & Consolidate Lineage */}
      {mergeCandidates && mergeCandidates.length >= 2 && (
        <MergeDuplicatesModal
          isOpen={!!mergeCandidates}
          section={activeSection}
          candidateRecords={mergeCandidates}
          onClose={() => setMergeCandidates(null)}
          onMerge={handleExecuteMerge}
          lang={lang}
        />
      )}

      {/* 4. Modal: Batch Ingestion with Lineage Enforcement */}
      {isImportModalOpen && (
        <ImportBatchModal
          isOpen={isImportModalOpen}
          section={activeSection}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleExecuteImport}
          lang={lang}
        />
      )}
    </div>
  );
};
