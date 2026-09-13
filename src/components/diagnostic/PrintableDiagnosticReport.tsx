// AutoFix 3D - Formal Printable Diagnostic Report & Certificate
// Print-optimized layout, JSON download, and OEM vehicle inspection summary

import React from 'react';
import { Language } from '../../types';
import { DiagnosticSessionReport } from '../../simulation/types';

interface PrintableDiagnosticReportProps {
  report: DiagnosticSessionReport;
  onClose: () => void;
  lang: Language;
}

export const PrintableDiagnosticReport: React.FC<PrintableDiagnosticReportProps> = ({
  report,
  onClose,
  lang,
}) => {
  const isArabic = lang === 'ar';

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${report.id}-diagnostic-report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        dir={isArabic ? 'rtl' : 'ltr'}
        className="relative w-full max-w-4xl rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl overflow-hidden flex flex-col text-on-surface my-6 print:m-0 print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Top Action Toolbar (Hidden in Print) */}
        <div className="p-4 border-b border-white/10 bg-surface-container-low/80 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-xl">description</span>
            <span className="font-bold text-sm text-on-surface">
              {isArabic ? 'تقرير الفحص التشخيصي المعتمد' : 'Verified Automotive Diagnostic Report'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs font-bold text-on-surface transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>{isArabic ? 'تصدير JSON' : 'Export JSON'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-bold shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>{isArabic ? 'طباعة التقرير / PDF' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 print:p-4 text-xs font-sans">
          {/* Header Certificate Banner */}
          <div className="border-b-2 border-primary-container/40 pb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-primary-container font-headline">
                  AutoFix 3D Diagnostic OS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                  OEM CERTIFIED
                </span>
              </div>
              <p className="text-xs text-outline mt-1">
                {isArabic
                  ? 'منصة الفحص والتشخيص الهندسي للمركبات الذكية - تقرير الفحص الشامل'
                  : 'Automotive Diagnostic Platform & System Telemetry Suite'}
              </p>
            </div>

            <div className="text-end font-code-sm text-[11px] space-y-0.5">
              <div className="font-bold text-on-surface">{report.id}</div>
              <div className="text-outline">{report.date}</div>
              <div className="text-emerald-400 font-semibold">ISO 15765-4 VERIFIED</div>
            </div>
          </div>

          {/* Vehicle Metadata Box */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-code-sm">
            <div>
              <span className="text-outline block text-[10px] uppercase">
                {isArabic ? 'المركبة' : 'Vehicle'}
              </span>
              <span className="font-bold text-on-surface">
                {report.vehicleMake} {report.vehicleModel}
              </span>
            </div>
            <div>
              <span className="text-outline block text-[10px] uppercase">
                {isArabic ? 'سنة الصنع' : 'Model Year'}
              </span>
              <span className="font-bold text-on-surface">{report.vehicleYear}</span>
            </div>
            <div>
              <span className="text-outline block text-[10px] uppercase">
                {isArabic ? 'رقم الهيكل (VIN)' : 'VIN Number'}
              </span>
              <span className="font-bold text-cyan-400">{report.vin}</span>
            </div>
            <div>
              <span className="text-outline block text-[10px] uppercase">
                {isArabic ? 'المسافة المقطوعة' : 'Odometer'}
              </span>
              <span className="font-bold text-on-surface">
                {report.mileageKm.toLocaleString()} KM
              </span>
            </div>
          </div>

          {/* Health Score Summary Card */}
          <div className="p-5 rounded-xl bg-surface-container-low border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-outline uppercase font-code-sm">
                {isArabic ? 'مؤشر الكفاءة التشخيصي الإجمالي' : 'Overall Diagnostic Health Score'}
              </span>
              <h3 className="text-base font-bold text-on-surface">
                {report.overallHealthScore >= 80
                  ? isArabic
                    ? 'الحالة العامة ممتازة - اجتياز الفحص'
                    : 'System Status: Prime OEM Condition'
                  : isArabic
                  ? 'تم رصد أعطال نشطة تتطلب الصيانة'
                  : 'Action Required: Active Faults Stored'}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center font-code ${
                  report.overallHealthScore >= 80
                    ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                    : 'border-rose-400 text-rose-400 bg-rose-500/10'
                }`}
              >
                <span className="text-xl font-bold">{report.overallHealthScore}</span>
                <span className="text-[9px] uppercase">/ 100</span>
              </div>
            </div>
          </div>

          {/* Active DTCs Table */}
          <div className="space-y-2">
            <span className="font-bold text-xs text-outline uppercase tracking-wider font-code-sm block">
              {isArabic
                ? `أكواد الأعطال المسجلة في وحدات التحكم (${report.activeDtcs.length}):`
                : `Active Diagnostic Trouble Codes Stored (${report.activeDtcs.length}):`}
            </span>

            {report.activeDtcs.length === 0 ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                {isArabic ? 'لا توجد أكواد أعطال نشطة.' : 'Zero active trouble codes.'}
              </div>
            ) : (
              <table className="w-full text-start text-xs border-collapse border border-white/10 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-surface-container text-outline font-bold text-[10px] uppercase">
                    <th className="p-2.5 text-start">{isArabic ? 'كود العطل' : 'DTC Code'}</th>
                    <th className="p-2.5 text-start">{isArabic ? 'الوصف الفني للعطل' : 'Technical Description'}</th>
                    <th className="p-2.5 text-start">{isArabic ? 'الحالة' : 'Severity'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-code-sm">
                  {report.activeDtcs.map((code) => (
                    <tr key={code} className="hover:bg-surface-container/40">
                      <td className="p-2.5 font-bold text-rose-400">{code}</td>
                      <td className="p-2.5 text-on-surface">
                        {code === 'P0301'
                          ? 'Cylinder 1 Misfire Detected (Ignition/Fuel)'
                          : code === 'P0171'
                          ? 'System Too Lean Bank 1 (Fuel Trim Lean Limit Exceeded)'
                          : code === 'P0102'
                          ? 'Mass Air Flow (MAF) Circuit Low Input'
                          : code === 'C0035'
                          ? 'Left Front Wheel Speed Sensor Malfunction'
                          : 'Manufacturer Controlled Powertrain Diagnostic Fault'}
                      </td>
                      <td className="p-2.5 text-rose-400 font-bold uppercase text-[10px]">
                        MIL ON / CRITICAL
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recommendations & Notes */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-2">
            <span className="font-bold text-xs text-outline uppercase font-code-sm block">
              {isArabic ? 'توصيات وملاحظات المهندس الفاحص:' : 'Technician Action Recommendations:'}
            </span>
            <ul className="list-disc list-inside space-y-1 text-on-surface-variant text-xs leading-relaxed">
              {report.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* Sign-off Footer */}
          <div className="border-t border-white/10 pt-5 flex items-center justify-between text-xs font-code-sm">
            <div>
              <span className="text-outline block text-[10px]">
                {isArabic ? 'المهندس المعتمد:' : 'Certified Technician:'}
              </span>
              <span className="font-bold text-on-surface">{report.technicianName}</span>
            </div>

            <div className="text-end">
              <span className="text-outline block text-[10px]">
                {isArabic ? 'التوقيع والختم الإلكتروني:' : 'Electronic Verification Sign-off:'}
              </span>
              <span className="font-bold text-primary-container font-mono">
                [SIGNED-AALA-MOHAMMED-MD1CS]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
