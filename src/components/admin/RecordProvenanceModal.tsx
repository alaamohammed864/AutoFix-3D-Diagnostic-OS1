// AutoFix 3D - Record Provenance Inspector Modal
// Visualizes source origin, license, cryptographic checksum, confidence score, and history trail

import React from 'react';
import { BaseAdminRecord } from '../../admin/types';
import { Language } from '../../types';

interface RecordProvenanceModalProps {
  record: BaseAdminRecord | null;
  section: string;
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onVerifyRecord?: (recordId: string) => void;
}

export const RecordProvenanceModal: React.FC<RecordProvenanceModalProps> = ({
  record,
  section,
  isOpen,
  onClose,
  lang = 'en',
  onVerifyRecord,
}) => {
  if (!isOpen || !record) return null;

  const prov = record.provenance;
  const isAr = lang === 'ar';

  const statusBadgeColors = {
    Verified: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Unverified: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'Needs Review': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Duplicate: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    'Missing Data': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }[prov.verificationStatus] || 'bg-surface-container text-outline';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-surface-container-lowest/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">history_edu</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-md text-base font-bold text-on-surface">
                  {isAr ? 'بيانات المصدر وسلسلة الثقة' : 'Data Provenance & Audit Trail'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-code-sm font-bold border ${statusBadgeColors}`}>
                  {prov.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-outline font-code-sm">
                {section.toUpperCase()} &bull; ID: {record.id}
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Target Title */}
          <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-white/5">
            <span className="text-[10px] font-telemetry-label uppercase tracking-widest text-secondary block mb-1">
              {isAr ? 'السجل المستهدف' : 'Target Entity'}
            </span>
            <span className="text-sm font-semibold text-on-surface font-headline-md">
              {record.title}
            </span>
          </div>

          {/* Key Provenance Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-container border border-white/5">
              <span className="text-[10px] font-telemetry-label text-outline uppercase block mb-1">
                {isAr ? 'المصدر الأصلي' : 'Origin Source'}
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                <span>{prov.source}</span>
              </div>
              {prov.sourceUrl && (
                <a
                  href={prov.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary hover:underline font-code-sm truncate block mt-1.5"
                >
                  {prov.sourceUrl}
                </a>
              )}
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-white/5">
              <span className="text-[10px] font-telemetry-label text-outline uppercase block mb-1">
                {isAr ? 'مستوى الثقة' : 'Confidence Score'}
              </span>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-on-surface font-code-sm">
                  {prov.confidenceScore}% Quality
                </span>
                <span className="text-[10px] text-outline font-code-sm">
                  {prov.confidenceScore > 85 ? 'High Assurance' : 'Moderate'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    prov.confidenceScore > 85
                      ? 'bg-emerald-400'
                      : prov.confidenceScore > 60
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                  style={{ width: `${prov.confidenceScore}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-white/5">
              <span className="text-[10px] font-telemetry-label text-outline uppercase block mb-1">
                {isAr ? 'وقت الإدخال والمسؤول' : 'Ingestion & Importer'}
              </span>
              <div className="text-xs text-on-surface font-code-sm">
                <div>{new Date(prov.importedAt).toLocaleString()}</div>
                <div className="text-outline text-[11px] mt-0.5">By: {prov.importedBy}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-white/5">
              <span className="text-[10px] font-telemetry-label text-outline uppercase block mb-1">
                {isAr ? 'البصمة المشفرة للبيانات' : 'Cryptographic Checksum'}
              </span>
              <div className="text-xs font-code-sm text-secondary truncate font-mono select-all">
                {prov.checksum}
              </div>
              <div className="text-[10px] text-outline mt-0.5">
                License: {prov.license || 'Standard Technical License'}
              </div>
            </div>
          </div>

          {/* Quality Issues if any */}
          {prov.qualityIssues && prov.qualityIssues.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-2">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>{isAr ? 'مشاكل جودة البيانات المكتشفة' : 'Flagged Data Quality Issues'}</span>
              </div>
              <ul className="space-y-1 text-xs text-rose-300 font-code-sm ps-5 list-disc">
                {prov.qualityIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Chronological Provenance History */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider font-telemetry-label">
                {isAr ? 'سجل التعديلات والتحقق (Audit Trail)' : 'Chronological Audit History'}
              </span>
              <span className="text-[11px] font-code-sm text-outline">
                {prov.history?.length || 0} events
              </span>
            </div>

            <div className="space-y-2.5 relative before:absolute before:top-2 before:bottom-2 before:start-3.5 before:w-0.5 before:bg-white/10 ps-8">
              {prov.history?.map((entry, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -start-[25px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-low" />
                  <div className="p-3 rounded-lg bg-surface-container-high/40 border border-white/5 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-primary font-code-sm">
                        {entry.action}
                      </span>
                      <span className="text-[10px] text-outline font-code-sm">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-on-surface-variant text-[11px] mb-0.5">
                      Actor: <strong className="text-on-surface">{entry.actor}</strong>
                    </div>
                    {entry.details && (
                      <div className="text-outline text-[11px] font-code-sm bg-black/20 p-1.5 rounded mt-1">
                        {entry.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surface-container-lowest/60 flex items-center justify-between">
          <div className="text-xs text-outline font-code-sm">
            Status: <strong className="text-on-surface">{record.status}</strong>
          </div>
          <div className="flex items-center gap-2">
            {onVerifyRecord && prov.verificationStatus !== 'Verified' && (
              <button
                type="button"
                onClick={() => {
                  onVerifyRecord(record.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>{isAr ? 'اعتماد وصلاحية السجل' : 'Approve & Mark Verified'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold cursor-pointer border border-white/10"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
