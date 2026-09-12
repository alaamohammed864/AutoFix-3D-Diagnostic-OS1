// AutoFix 3D - Duplicate Record Merger Modal
// Unifies disparate duplicate records into a single verified canonical record with consolidated provenance

import React, { useState } from 'react';
import { AdminSection, BaseAdminRecord } from '../../admin/types';
import { Language } from '../../types';

interface MergeDuplicatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: AdminSection;
  candidateRecords: BaseAdminRecord[];
  onMerge: (masterId: string, duplicateId: string, mergedFields: Partial<BaseAdminRecord>) => void;
  lang?: Language;
}

export const MergeDuplicatesModal: React.FC<MergeDuplicatesModalProps> = ({
  isOpen,
  onClose,
  section,
  candidateRecords,
  onMerge,
  lang = 'en',
}) => {
  if (!isOpen || candidateRecords.length < 2) return null;

  const isAr = lang === 'ar';
  const [masterId, setMasterId] = useState<string>(candidateRecords[0].id);
  const [duplicateId, setDuplicateId] = useState<string>(candidateRecords[1].id);

  const master = candidateRecords.find((r) => r.id === masterId) || candidateRecords[0];
  const duplicate = candidateRecords.find((r) => r.id === duplicateId) || candidateRecords[1];

  const [chosenTitle, setChosenTitle] = useState<string>(master.title);

  const handleExecuteMerge = () => {
    onMerge(master.id, duplicate.id, {
      title: chosenTitle,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-surface-container-lowest/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-2xl">call_merge</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">
                {isAr ? 'دمج السجلات المتكررة وتوحيد المصادر' : 'Merge Duplicate Records & Consolidate Provenance'}
              </h3>
              <p className="text-xs text-outline font-code-sm">
                {isAr
                  ? 'اختر السجل الرئيسي لدمج البيانات وسلسلة المصادر فيه'
                  : 'Select canonical record to retain and inherit combined lineage'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instructions banner */}
          <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-white/5 text-xs text-on-surface-variant flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-lg shrink-0 mt-0.5">
              merge_type
            </span>
            <div>
              <strong className="text-on-surface block mb-0.5">
                {isAr ? 'آلية الدمج التلقائي:' : 'Canonical Merge Protocol:'}
              </strong>
              {isAr
                ? 'سيتم الاحتفاظ بالسجل الرئيسي المختار، ودمج توثيقات المصادر والأرشيف من كلا السجلين فيه. سيتم إزالة السجل المكرر لمنع التشتت وتصنيف السجل الناتج كسجل معتمد (Verified).'
                : 'The chosen master record will be retained, inheriting complete audit history and sources from the duplicate record. The duplicate record will be purged, and the merged entity marked Verified.'}
            </div>
          </div>

          {/* Record Selector and Side-by-Side Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Master Record Candidate */}
            <div className="p-4 rounded-xl bg-surface-container border-2 border-emerald-500/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold font-code-sm border border-emerald-500/30">
                    CANONICAL MASTER
                  </span>
                  <select
                    value={master.id}
                    onChange={(e) => {
                      setMasterId(e.target.value);
                      const m = candidateRecords.find((r) => r.id === e.target.value);
                      if (m) setChosenTitle(m.title);
                    }}
                    className="bg-surface-container-high px-2 py-1 rounded border border-white/10 text-xs font-code-sm text-on-surface"
                  >
                    {candidateRecords.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.id === duplicate.id}>
                        {r.id}: {r.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Title</span>
                    <strong className="text-on-surface">{master.title}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Source</span>
                    <span className="text-primary font-code-sm">{master.provenance?.source}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Checksum</span>
                    <span className="text-outline font-mono text-[10px] truncate block">
                      {master.provenance?.checksum}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Status</span>
                    <span className="text-xs text-on-surface font-code-sm">
                      {master.provenance?.verificationStatus} ({master.provenance?.confidenceScore}% confidence)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Retains Master UUID: {master.id}</span>
              </div>
            </div>

            {/* Right: Duplicate Record Candidate */}
            <div className="p-4 rounded-xl bg-surface-container border-2 border-rose-500/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold font-code-sm border border-rose-500/30">
                    DUPLICATE TO ABSORB
                  </span>
                  <select
                    value={duplicate.id}
                    onChange={(e) => setDuplicateId(e.target.value)}
                    className="bg-surface-container-high px-2 py-1 rounded border border-white/10 text-xs font-code-sm text-on-surface"
                  >
                    {candidateRecords.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.id === master.id}>
                        {r.id}: {r.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Title</span>
                    <strong className="text-on-surface">{duplicate.title}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Source</span>
                    <span className="text-primary font-code-sm">{duplicate.provenance?.source}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Checksum</span>
                    <span className="text-outline font-mono text-[10px] truncate block">
                      {duplicate.provenance?.checksum}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block">Status</span>
                    <span className="text-xs text-on-surface font-code-sm">
                      {duplicate.provenance?.verificationStatus} ({duplicate.provenance?.confidenceScore}% confidence)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">remove_circle</span>
                <span>Will be purged after audit transfer</span>
              </div>
            </div>
          </div>

          {/* Unified Title Customizer */}
          <div className="p-4 rounded-xl bg-surface-container border border-white/5 space-y-2">
            <label className="block text-xs font-semibold text-on-surface">
              {isAr ? 'العنوان المعتمد النهائي للسجل المدمج:' : 'Approved Final Canonical Title:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={chosenTitle}
                onChange={(e) => setChosenTitle(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-surface-container-high border border-white/10 text-xs font-code-sm text-on-surface focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setChosenTitle(master.title)}
                className="px-3 py-2 rounded-xl bg-surface-container-highest text-xs text-outline hover:text-on-surface cursor-pointer"
              >
                Use Left
              </button>
              <button
                type="button"
                onClick={() => setChosenTitle(duplicate.title)}
                className="px-3 py-2 rounded-xl bg-surface-container-highest text-xs text-outline hover:text-on-surface cursor-pointer"
              >
                Use Right
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surface-container-lowest/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold cursor-pointer border border-white/10"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleExecuteMerge}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">merge</span>
            <span>{isAr ? 'تأكيد وتنفيذ الدمج' : 'Confirm & Execute Merge'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
