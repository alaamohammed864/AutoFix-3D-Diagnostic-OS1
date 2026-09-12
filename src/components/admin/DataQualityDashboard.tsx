// AutoFix 3D - Data Quality Dashboard
// Monitors Verified, Unverified, Needs Review, Duplicate, and Missing Data states across all 16 sections

import React, { useState } from 'react';
import {
  AdminSection,
  BaseAdminRecord,
  DataQualitySummary,
  QualityStatus,
} from '../../admin/types';
import { adminStore } from '../../admin/adminStore';
import { Language } from '../../types';

interface DataQualityDashboardProps {
  summary: DataQualitySummary;
  onNavigateSection: (section: AdminSection) => void;
  onInspectProvenance: (record: BaseAdminRecord, section: string) => void;
  onEditRecord: (record: BaseAdminRecord, section: AdminSection) => void;
  onLaunchMerge: (candidateRecords: BaseAdminRecord[], section: AdminSection) => void;
  onRefresh: () => void;
  lang?: Language;
}

export const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({
  summary,
  onNavigateSection,
  onInspectProvenance,
  onEditRecord,
  onLaunchMerge,
  onRefresh,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<QualityStatus | 'ALL'>('ALL');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  const allRecords = adminStore.getAllRecordsAcrossSections();

  // Filter records based on selected status card
  const filteredRecords = allRecords.filter((rec) => {
    if (selectedStatusFilter === 'ALL') return true;
    return rec.provenance?.verificationStatus === selectedStatusFilter;
  });

  const handleRunFullAudit = () => {
    setIsAuditing(true);
    setAuditMessage(null);
    setTimeout(() => {
      adminStore.validateAllQuality('System Security Administrator');
      onRefresh();
      setIsAuditing(false);
      setAuditMessage(
        isAr
          ? 'تم اكتمال تدقيق جودة البيانات الشامل عبر كافة الأقسام بنجاح.'
          : 'Full data quality audit completed across all 16 repository sections.'
      );
      setTimeout(() => setAuditMessage(null), 4000);
    }, 600);
  };

  const handleExportQualityReport = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            governanceSummary: summary,
            flaggedRecords: allRecords
              .filter((r) => r.provenance?.verificationStatus !== 'Verified')
              .map((r) => ({
                id: r.id,
                title: r.title,
                status: r.provenance?.verificationStatus,
                source: r.provenance?.source,
                issues: r.provenance?.qualityIssues,
                checksum: r.provenance?.checksum,
              })),
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `AutoFix3D_DataQuality_Audit_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const sectionKeys: AdminSection[] = [
    'vehicles',
    'manufacturers',
    'models',
    'engines',
    'systems',
    'components',
    'repairs',
    'diagnostics',
    'dtc',
    'maintenance',
    'videos',
    'sources',
    'imports',
    'users',
    'reports',
    'system-health',
  ];

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Banner & Audit Controls */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center">
            {/* Health Score Gauge */}
            <div className="w-16 h-16 rounded-full bg-surface-container-high border-4 border-primary/40 flex items-center justify-center">
              <span className="font-code-sm text-lg font-bold text-primary">
                {summary.overallHealthScore}%
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-xl font-bold text-on-surface">
                {isAr ? 'لوحة جودة وحوكمة البيانات' : 'Data Quality & Governance Engine'}
              </h2>
              <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-bold font-code-sm border border-primary/30">
                PROVENANCE VERIFIED
              </span>
            </div>
            <p className="text-xs text-outline font-body-sm mt-0.5 max-w-xl">
              {isAr
                ? 'فحص شامل لسلامة السجلات، التحقق من المصادر الأصلية، رصد التكرار، واكتشاف الحقول المفقودة'
                : 'Automated lineage tracking, source provenance assurance, duplicate detection, and completeness auditing across all 16 automotive domains.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunFullAudit}
            disabled={isAuditing}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-sm ${isAuditing ? 'animate-spin' : ''}`}
            >
              {isAuditing ? 'sync' : 'verified'}
            </span>
            <span>{isAuditing ? (isAr ? 'جار التدقيق...' : 'Auditing...') : isAr ? 'تشغيل فحص الجودة الشامل' : 'Run Full Quality Audit'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportQualityReport}
            className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold cursor-pointer border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-secondary">download</span>
            <span>{isAr ? 'تصدير التقرير (JSON)' : 'Export Audit Report'}</span>
          </button>
        </div>
      </div>

      {auditMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-code-sm flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{auditMessage}</span>
        </div>
      )}

      {/* 5 Quality Status Indicator Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Verified */}
        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Verified' ? 'ALL' : 'Verified')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Verified'
              ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'bg-surface-container-low border-white/5 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-telemetry-label">
              Verified
            </span>
            <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
          </div>
          <div className="font-code-sm text-2xl font-bold text-on-surface">
            {summary.verifiedCount}
          </div>
          <div className="text-[10px] text-outline mt-1 font-body-sm">
            {isAr ? 'موثوق بالكامل ومطابق للمصنع' : 'Complete with verified OEM source'}
          </div>
        </div>

        {/* 2. Unverified */}
        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Unverified' ? 'ALL' : 'Unverified')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Unverified'
              ? 'bg-amber-950/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              : 'bg-surface-container-low border-white/5 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-telemetry-label">
              Unverified
            </span>
            <span className="material-symbols-outlined text-amber-400 text-lg">pending_actions</span>
          </div>
          <div className="font-code-sm text-2xl font-bold text-on-surface">
            {summary.unverifiedCount}
          </div>
          <div className="text-[10px] text-outline mt-1 font-body-sm">
            {isAr ? 'بيانات خارجية بانتظار الاعتماد' : 'External ingest pending audit review'}
          </div>
        </div>

        {/* 3. Needs Review */}
        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Needs Review' ? 'ALL' : 'Needs Review')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Needs Review'
              ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
              : 'bg-surface-container-low border-white/5 hover:border-amber-400/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 font-telemetry-label">
              Needs Review
            </span>
            <span className="material-symbols-outlined text-amber-300 text-lg">rule</span>
          </div>
          <div className="font-code-sm text-2xl font-bold text-on-surface">
            {summary.needsReviewCount}
          </div>
          <div className="text-[10px] text-outline mt-1 font-body-sm">
            {isAr ? 'تنبيهات جودة أو درجة ثقة منخفضة' : 'Minor schema discrepancy or low score'}
          </div>
        </div>

        {/* 4. Duplicate */}
        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Duplicate' ? 'ALL' : 'Duplicate')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Duplicate'
              ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
              : 'bg-surface-container-low border-white/5 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 font-telemetry-label">
              Duplicate
            </span>
            <span className="material-symbols-outlined text-rose-400 text-lg">content_copy</span>
          </div>
          <div className="font-code-sm text-2xl font-bold text-on-surface">
            {summary.duplicateCount}
          </div>
          <div className="text-[10px] text-outline mt-1 font-body-sm">
            {isAr ? 'تطابق في رقم الهيكل أو الرمز' : 'Candidate duplicate keys isolated'}
          </div>
        </div>

        {/* 5. Missing Data */}
        <div
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Missing Data' ? 'ALL' : 'Missing Data')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedStatusFilter === 'Missing Data'
              ? 'bg-red-950/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
              : 'bg-surface-container-low border-white/5 hover:border-red-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 font-telemetry-label">
              Missing Data
            </span>
            <span className="material-symbols-outlined text-red-400 text-lg">error_outline</span>
          </div>
          <div className="font-code-sm text-2xl font-bold text-on-surface">
            {summary.missingDataCount}
          </div>
          <div className="text-[10px] text-outline mt-1 font-body-sm">
            {isAr ? 'حقول إلزامية مفقودة تعيق التشغيل' : 'Critical fields / specifications absent'}
          </div>
        </div>
      </div>

      {/* Section-by-Section Quality Matrix */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface">
              {isAr ? 'توزيع جودة البيانات عبر الـ 16 قسماً' : 'Data Cleanliness Matrix Across All 16 Sections'}
            </h3>
            <span className="text-xs text-outline">
              Click any section to open its dedicated management table
            </span>
          </div>
          <span className="text-xs font-code-sm text-secondary font-semibold">
            {summary.totalRecords} Total Ingested Records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sectionKeys.map((sec) => {
            const stats = summary.sectionBreakdown[sec] || {
              total: 0,
              verified: 0,
              unverified: 0,
              needsReview: 0,
              duplicate: 0,
              missingData: 0,
            };
            const verifiedPercent = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 100;

            return (
              <div
                key={sec}
                onClick={() => onNavigateSection(sec)}
                className="p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-on-surface uppercase font-code-sm group-hover:text-primary transition-colors">
                    {sec}
                  </span>
                  <span className="text-[11px] font-code-sm text-outline font-semibold">
                    {stats.total} recs
                  </span>
                </div>

                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden flex mb-2">
                  <div className="bg-emerald-400 h-full" style={{ width: `${(stats.verified / (stats.total || 1)) * 100}%` }} />
                  <div className="bg-amber-400 h-full" style={{ width: `${(stats.unverified / (stats.total || 1)) * 100}%` }} />
                  <div className="bg-amber-500 h-full" style={{ width: `${(stats.needsReview / (stats.total || 1)) * 100}%` }} />
                  <div className="bg-rose-400 h-full" style={{ width: `${(stats.duplicate / (stats.total || 1)) * 100}%` }} />
                  <div className="bg-red-500 h-full" style={{ width: `${(stats.missingData / (stats.total || 1)) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between text-[10px] font-code-sm text-outline">
                  <span>{verifiedPercent}% Verified</span>
                  {(stats.duplicate > 0 || stats.missingData > 0) && (
                    <span className="text-rose-400 font-bold">
                      {stats.duplicate + stats.missingData} Issues
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtered Records / Issues Drilldown */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">manage_search</span>
            <h3 className="font-headline-md text-sm font-bold text-on-surface">
              {selectedStatusFilter === 'ALL'
                ? isAr
                  ? 'جميع السجلات في النظام مع رصد المصدر والتحقق'
                  : 'All Ingested Records (Lineage & Quality Inspector)'
                : `${isAr ? 'السجلات المصنفة كـ' : 'Records Filtered By:'} ${selectedStatusFilter}`}
            </h3>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-xs font-code-sm text-outline">
              {filteredRecords.length} records
            </span>
          </div>

          {selectedStatusFilter !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('ALL')}
              className="text-xs text-primary hover:underline font-code-sm cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-outline uppercase font-telemetry-label text-[10px]">
                <th className="py-2.5 px-3 text-start">Entity & ID</th>
                <th className="py-2.5 px-3 text-start">Quality State</th>
                <th className="py-2.5 px-3 text-start">Provenance Source</th>
                <th className="py-2.5 px-3 text-start">Confidence</th>
                <th className="py-2.5 px-3 text-start">Quality Issues / Flags</th>
                <th className="py-2.5 px-3 text-end">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.slice(0, 15).map((rec) => {
                const status = rec.provenance?.verificationStatus || 'Unverified';
                const statusStyle = {
                  Verified: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                  Unverified: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  'Needs Review': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                  Duplicate: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                  'Missing Data': 'bg-red-500/20 text-red-300 border-red-500/30',
                }[status];

                return (
                  <tr key={rec.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-on-surface font-body-sm">{rec.title}</div>
                      <div className="text-[10px] text-outline font-mono mt-0.5">
                        UUID: {rec.id} &bull; {rec.status}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-code-sm font-bold border ${statusStyle}`}>
                        {status}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-on-surface font-code-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-primary text-xs">verified_user</span>
                        <span>{rec.provenance?.source}</span>
                      </div>
                      <div className="text-[10px] text-outline font-mono truncate max-w-[180px]">
                        {rec.provenance?.checksum}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-code-sm">
                        <span className="font-bold text-on-surface">{rec.provenance?.confidenceScore}%</span>
                        <div className="w-12 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${rec.provenance?.confidenceScore || 70}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {rec.provenance?.qualityIssues && rec.provenance.qualityIssues.length > 0 ? (
                        <div className="space-y-0.5">
                          {rec.provenance.qualityIssues.map((issue, i) => (
                            <span
                              key={i}
                              className="inline-block bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] px-1.5 py-0.5 rounded me-1"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-400 text-[11px] font-code-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check</span>
                          <span>Passed schema checks</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-end whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onInspectProvenance(rec, 'entity')}
                          title="View Complete Provenance History"
                          className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-primary transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">history_edu</span>
                        </button>

                        {status === 'Duplicate' && (
                          <button
                            type="button"
                            onClick={() => onLaunchMerge([rec, ...filteredRecords.filter((r) => r.id !== rec.id)], 'vehicles')}
                            title="Merge with Canonical Record"
                            className="px-2 py-1 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-xs">call_merge</span>
                            <span>Merge</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onEditRecord(rec, 'vehicles')}
                          title="Edit Record"
                          className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
