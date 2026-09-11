import React, { useState } from 'react';
import { ComprehensiveServiceRecord } from '../../db/maintenanceTypes';
import { CATEGORY_META } from '../../db/maintenanceDatabase';
import { Language } from '../../types';

interface ServiceRecordDetailsModalProps {
  record: ComprehensiveServiceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ServiceRecordDetailsModal: React.FC<ServiceRecordDetailsModalProps> = ({
  record,
  isOpen,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-surface-container-lowest rounded-2xl border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-container-low/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-secondary/20 text-secondary border border-secondary/30">
              <span className="material-symbols-outlined text-2xl">receipt</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                  {record.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-code-sm font-bold ${
                    record.status === 'Completed'
                      ? 'bg-primary-container/20 text-primary-container border border-primary-container/40'
                      : 'bg-error-container/20 text-on-error-container border border-error/30'
                  }`}
                >
                  {record.status}
                </span>
              </div>
              <p className="text-xs text-outline font-code-sm">
                {isAr ? 'تاريخ الإنجاز:' : 'Date:'} {record.date} • {isAr ? 'العداد:' : 'Odometer:'}{' '}
                {record.odometerKm.toLocaleString()} km
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title={isAr ? 'طباعة تقرير الفحص' : 'Print Service Certificate'}
              className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-container-low border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'الفني المسؤول' : 'Certified Technician'}
              </span>
              <span className="font-bold text-on-surface text-sm mt-0.5 block truncate">
                {record.technician}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'رقم الفاتورة' : 'Invoice Number'}
              </span>
              <span className="font-bold text-primary-container text-sm font-code-sm mt-0.5 block">
                {record.invoice?.invoiceNumber || 'N/A (Warranty)'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'إجمالي التكلفة' : 'Total Expense'}
              </span>
              <span className="font-bold text-secondary text-sm font-code-sm mt-0.5 block">
                {record.invoice ? `$${record.invoice.totalAmount.toFixed(2)}` : '$0.00'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-white/5">
              <span className="text-[10px] text-outline uppercase block">
                {isAr ? 'طريقة الدفع' : 'Payment Method'}
              </span>
              <span className="font-bold text-on-surface text-xs mt-0.5 block">
                {record.invoice?.paymentMethod || 'Warranty Service'}
              </span>
            </div>
          </div>

          {/* Categories Treated */}
          <div className="space-y-2">
            <label className="font-telemetry-label uppercase tracking-wider text-outline block">
              {isAr ? 'الأنظمة والقطع المشمولة في الصيانة' : 'Subsystems & Categories Serviced'}
            </label>
            <div className="flex flex-wrap gap-2">
              {record.categories.map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high border border-white/10 text-on-surface text-xs"
                  >
                    <span className="material-symbols-outlined text-sm text-primary-container">
                      {meta?.icon || 'build'}
                    </span>
                    <span>{isAr ? meta?.nameAr || cat : cat}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Inspection Notes */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-base">description</span>
              <span className="font-headline-sm font-semibold text-on-surface">
                {isAr ? 'تقرير وملاحظات الفحص الفنية' : 'Technician Diagnostic Log & Observations'}
              </span>
            </div>
            <p className="text-on-surface-variant font-body-sm leading-relaxed whitespace-pre-line bg-surface-container-high/40 p-3 rounded-lg border border-white/5">
              {record.notes}
            </p>
          </div>

          {/* Itemized Parts Replaced (if available) */}
          {record.partsReplaced && record.partsReplaced.length > 0 && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-3">
              <span className="font-headline-sm font-semibold text-on-surface block">
                {isAr ? 'قطع الغيار المستبدلة والأرقام الأصلية' : 'Replaced OEM Parts & Components'}
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-start">
                  <thead>
                    <tr className="text-[10px] text-outline uppercase border-b border-white/10 pb-1">
                      <th className="text-start py-1.5">{isAr ? 'اسم القطعة' : 'Part Name'}</th>
                      <th className="text-start py-1.5">{isAr ? 'رقم القطعة OEM' : 'OEM Part #'}</th>
                      <th className="text-center py-1.5">{isAr ? 'الكمية' : 'Qty'}</th>
                      <th className="text-end py-1.5">{isAr ? 'السعر' : 'Unit Price'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {record.partsReplaced.map((p, idx) => (
                      <tr key={idx} className="text-on-surface text-xs font-code-sm">
                        <td className="py-2">{p.name}</td>
                        <td className="py-2 text-primary-container">{p.partNumber}</td>
                        <td className="py-2 text-center">{p.quantity}</td>
                        <td className="py-2 text-end font-semibold">${p.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoice Statement Box */}
          {record.invoice && (
            <div className="p-5 rounded-xl bg-surface-container-high/50 border border-white/10 space-y-3 font-code-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="font-bold text-on-surface text-sm">{record.invoice.shopName}</div>
                  <div className="text-[10px] text-outline">
                    {isAr ? 'فاتورة خدمة رسمية معتمدة' : 'Official Verified Service Receipt'} • {record.invoice.invoiceNumber}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-secondary/20 text-secondary text-xs font-bold">
                  PAID - {record.invoice.paymentMethod}
                </span>
              </div>

              <div className="space-y-1.5 pt-1 text-xs">
                <div className="flex justify-between text-outline">
                  <span>{isAr ? 'تكلفة المواد والقطع:' : 'Materials & Parts Total:'}</span>
                  <span className="text-on-surface">${record.invoice.partsCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-outline">
                  <span>{isAr ? 'أجور اليد والتركيب الفني:' : 'Labor & Calibration Total:'}</span>
                  <span className="text-on-surface">${record.invoice.laborCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-outline">
                  <span>{isAr ? 'الضرائب المقررة:' : 'Government Tax:'}</span>
                  <span className="text-on-surface">${record.invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface font-bold text-sm border-t border-white/10 pt-2">
                  <span className="text-primary-container">{isAr ? 'الإجمالي المدفوع:' : 'Grand Total Paid:'}</span>
                  <span className="text-primary-container">${record.invoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Photos Gallery */}
          {record.photos && record.photos.length > 0 && (
            <div className="space-y-3">
              <span className="font-headline-sm font-semibold text-on-surface block">
                {isAr ? 'الصور الفوتوغرافية المرفقة' : 'Attached Photographic Evidence'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {record.photos.map((ph) => (
                  <div
                    key={ph.id}
                    onClick={() => setSelectedPhotoUrl(ph.url)}
                    className="group relative rounded-xl overflow-hidden border border-white/10 bg-surface-container-high cursor-pointer"
                  >
                    <img
                      src={ph.url}
                      alt={ph.caption}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                      <p className="text-[10px] text-on-surface font-medium truncate">{ph.caption}</p>
                      <p className="text-[9px] text-outline">{ph.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-surface-container-low/70">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-xs transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>

      {/* Lightbox / Zoom Photo Modal */}
      {selectedPhotoUrl && (
        <div
          onClick={() => setSelectedPhotoUrl(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20">
            <img src={selectedPhotoUrl} alt="Enlarged" className="w-full h-auto object-contain" />
            <button
              onClick={() => setSelectedPhotoUrl(null)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
