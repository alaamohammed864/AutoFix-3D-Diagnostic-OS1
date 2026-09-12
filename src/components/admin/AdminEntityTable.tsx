// AutoFix 3D - Multi-Section Admin Entity Table
// Supports Create, Edit, Delete, Disable, Validate, Merge Duplicates, and Source Lineage Tracking

import React, { useState } from 'react';
import { AdminSection, BaseAdminRecord, QualityStatus } from '../../admin/types';
import { adminStore } from '../../admin/adminStore';
import { Language } from '../../types';

interface AdminEntityTableProps {
  section: AdminSection;
  records: BaseAdminRecord[];
  onInspectProvenance: (record: BaseAdminRecord, section: string) => void;
  onEditRecord: (record: BaseAdminRecord) => void;
  onCreateRecord: () => void;
  onImportBatch: () => void;
  onLaunchMerge: (candidates: BaseAdminRecord[]) => void;
  onRefresh: () => void;
  lang?: Language;
}

export const AdminEntityTable: React.FC<AdminEntityTableProps> = ({
  section,
  records,
  onInspectProvenance,
  onEditRecord,
  onCreateRecord,
  onImportBatch,
  onLaunchMerge,
  onRefresh,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState<QualityStatus | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Disabled'>('ALL');
  const [selectedRecordForDelete, setSelectedRecordForDelete] = useState<BaseAdminRecord | null>(null);

  // Filter records
  const filtered = records.filter((r) => {
    // Quality status filter
    if (qualityFilter !== 'ALL' && r.provenance?.verificationStatus !== qualityFilter) {
      return false;
    }
    // Operational status filter (Active/Disabled)
    if (statusFilter !== 'ALL' && r.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchId = r.id?.toLowerCase().includes(q);
      const matchSource = r.provenance?.source?.toLowerCase().includes(q);
      const matchVin = r.vin?.toLowerCase().includes(q);
      const matchCode = (r.code || r.engineCode || r.systemCode || r.oemPartNumber || '')
        .toLowerCase()
        .includes(q);
      return matchTitle || matchId || matchSource || matchVin || matchCode;
    }
    return true;
  });

  const handleToggleStatus = (record: BaseAdminRecord) => {
    adminStore.toggleRecordStatus(section, record.id, 'System Security Administrator');
    onRefresh();
  };

  const handleValidateRecord = (record: BaseAdminRecord) => {
    adminStore.validateRecord(section, record.id, 'System Security Administrator');
    onRefresh();
  };

  const handleDeleteConfirm = () => {
    if (selectedRecordForDelete) {
      adminStore.deleteRecord(section, selectedRecordForDelete.id);
      setSelectedRecordForDelete(null);
      onRefresh();
    }
  };

  // Find candidate duplicates in this section if any
  const duplicateRecords = records.filter((r) => r.provenance?.verificationStatus === 'Duplicate');

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Section Toolbar */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 max-w-md relative">
          <span className="material-symbols-outlined absolute start-3 top-2.5 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? `بحث في ${section} بالاسم، الرمز، المصدر...`
                : `Search ${section} by title, code, part #, source...`
            }
            className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        {/* Action Buttons: Create, Import, Merge Duplicates */}
        <div className="flex flex-wrap items-center gap-2">
          {duplicateRecords.length >= 1 && (
            <button
              type="button"
              onClick={() => onLaunchMerge(records)}
              className="px-3.5 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">call_merge</span>
              <span>
                {isAr ? 'دمج السجلات المتطابقة' : `Merge Duplicates (${duplicateRecords.length})`}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onImportBatch}
            className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold cursor-pointer border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-secondary">file_download</span>
            <span>{isAr ? 'استيراد دفعة' : 'Import Batch'}</span>
          </button>

          <button
            type="button"
            onClick={onCreateRecord}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            <span>{isAr ? 'إنشاء سجل جديد' : 'Create Record'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs: Quality Status and Operational Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-telemetry-label text-outline uppercase me-1">
            Quality:
          </span>
          {(['ALL', 'Verified', 'Unverified', 'Needs Review', 'Duplicate', 'Missing Data'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setQualityFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-code-sm cursor-pointer transition-colors ${
                  qualityFilter === status
                    ? 'bg-primary-container text-on-primary-container font-bold border border-primary/40'
                    : 'bg-surface-container-low text-outline hover:text-on-surface border border-white/5'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-telemetry-label text-outline uppercase me-1">
            Status:
          </span>
          {(['ALL', 'Active', 'Disabled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-code-sm cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-secondary-container/30 text-secondary font-bold border border-secondary/40'
                  : 'bg-surface-container-low text-outline hover:text-on-surface border border-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-white/10 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-outline uppercase font-telemetry-label text-[10px]">
                <th className="py-2.5 px-3 text-start">Entity & Details</th>
                <th className="py-2.5 px-3 text-start">Quality State</th>
                <th className="py-2.5 px-3 text-start">Source Provenance</th>
                <th className="py-2.5 px-3 text-start">Operational Status</th>
                <th className="py-2.5 px-3 text-start">Checksum / Hash</th>
                <th className="py-2.5 px-3 text-end">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-outline">
                    <span className="material-symbols-outlined text-3xl block mb-2 opacity-50">
                      folder_off
                    </span>
                    <span>No records match the current filter criteria</span>
                  </td>
                </tr>
              ) : (
                filtered.map((record) => {
                  const qStatus = record.provenance?.verificationStatus || 'Unverified';
                  const qStyle = {
                    Verified: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                    Unverified: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    'Needs Review': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                    Duplicate: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                    'Missing Data': 'bg-red-500/20 text-red-300 border-red-500/30',
                  }[qStatus];

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-surface-container/50 transition-colors ${
                        record.status === 'Disabled' ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Title & Key details */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-on-surface font-body-sm">
                          {record.title}
                        </div>
                        <div className="text-[10px] text-outline font-mono mt-0.5 flex flex-wrap gap-2">
                          <span>UUID: {record.id}</span>
                          {record.vin && <span>VIN: {record.vin}</span>}
                          {record.oemPartNumber && <span>OEM Part: {record.oemPartNumber}</span>}
                          {record.code && <span>DTC: {record.code}</span>}
                          {record.engineCode && <span>Engine: {record.engineCode}</span>}
                        </div>
                      </td>

                      {/* Quality State */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-code-sm font-bold border ${qStyle}`}>
                          {qStatus}
                        </span>
                        <div className="text-[10px] text-outline font-code-sm mt-0.5">
                          {record.provenance?.confidenceScore}% confidence
                        </div>
                      </td>

                      {/* Source Provenance */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onInspectProvenance(record, section)}
                          className="text-start hover:text-primary transition-colors cursor-pointer group"
                        >
                          <div className="text-on-surface text-xs font-semibold flex items-center gap-1 group-hover:text-primary">
                            <span className="material-symbols-outlined text-primary text-xs">
                              verified_user
                            </span>
                            <span className="truncate max-w-[170px]">
                              {record.provenance?.source || 'OEM Data'}
                            </span>
                          </div>
                          <div className="text-[10px] text-outline font-code-sm">
                            {new Date(record.provenance?.importedAt || record.createdAt).toLocaleDateString()}
                          </div>
                        </button>
                      </td>

                      {/* Operational Status (Active / Disabled) with Toggle */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(record)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-code-sm font-bold border cursor-pointer transition-colors flex items-center gap-1 ${
                            record.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              record.status === 'Active' ? 'bg-emerald-400' : 'bg-zinc-500'
                            }`}
                          />
                          <span>{record.status}</span>
                        </button>
                      </td>

                      {/* Checksum */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-mono text-outline truncate block max-w-[120px] select-all">
                          {record.provenance?.checksum || 'N/A'}
                        </span>
                      </td>

                      {/* Admin Controls */}
                      <td className="py-3 px-3 text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. Track Source / Provenance */}
                          <button
                            type="button"
                            onClick={() => onInspectProvenance(record, section)}
                            title="Inspect Source Provenance"
                            className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-primary transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">history_edu</span>
                          </button>

                          {/* 2. Validate */}
                          <button
                            type="button"
                            onClick={() => handleValidateRecord(record)}
                            title="Validate Schema & Rules"
                            className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-emerald-400 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">rule</span>
                          </button>

                          {/* 3. Edit */}
                          <button
                            type="button"
                            onClick={() => onEditRecord(record)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>

                          {/* 4. Delete */}
                          <button
                            type="button"
                            onClick={() => setSelectedRecordForDelete(record)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg bg-surface-container-high hover:bg-rose-950 text-outline hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedRecordForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-low border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface font-headline-md">
                  {isAr ? 'تأكيد حذف السجل' : 'Confirm Record Deletion'}
                </h4>
                <p className="text-xs text-outline font-code-sm">
                  ID: {selectedRecordForDelete.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isAr
                ? `هل أنت متأكد من رغبتك في حذف السجل "${selectedRecordForDelete.title}" نهائياً من قاعدة البيانات؟ لن يمكن استرجاع هذا السجل إلا بإعادة الاستيراد.`
                : `Are you sure you want to permanently delete "${selectedRecordForDelete.title}" from the database? This action will purge all associated telemetry.`}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRecordForDelete(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold cursor-pointer border border-white/10"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-rose-600/30 transition-colors"
              >
                {isAr ? 'حذف نهائي' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
