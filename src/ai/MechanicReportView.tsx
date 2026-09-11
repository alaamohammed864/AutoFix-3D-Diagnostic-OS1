import React from 'react';
import { MechanicReport } from './types';

interface MechanicReportViewProps {
  report: MechanicReport;
}

export const MechanicReportView: React.FC<MechanicReportViewProps> = ({ report }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleCopyReport = () => {
    const text = `====================================================\n` +
      `OFFICIAL WORKSHOP MECHANIC DIAGNOSTIC REPORT\n` +
      `Work Order: ${report.reportId} | Date: ${report.date}\n` +
      `Vehicle: ${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model} (${report.vehicle.engine})\n` +
      `VIN: ${report.vehicle.vin} | Mileage: ${report.vehicle.mileage}\n` +
      `====================================================\n\n` +
      `CUSTOMER CONCERN:\n${report.customerConcern}\n\n` +
      `CONFIRMED DTCs:\n` +
      report.scannedDtcs.map((d) => `- ${d.code}: ${d.title} (Severity: ${d.severity})`).join('\n') +
      `\n\nTELEMETRY FINDINGS:\n` +
      report.telemetryFindings.map((f) => `- ${f.parameter}: Measured ${f.measured} (Expected: ${f.expected}) [${f.status}]`).join('\n') +
      `\n\nVERIFIED ROOT CAUSE:\n${report.verifiedRootCause}\n\n` +
      `RECOMMENDED ACTION:\n${report.recommendedProcedure}\nLabor: ${report.estimatedLaborHours}\n\n` +
      `PARTS BOM:\n` +
      report.requiredParts.map((p) => `- ${p.name} | Part #: ${p.partNumber} | Qty: ${p.qty} | Est: ${p.estCost}`).join('\n') +
      `\n\nTORQUE SPECS:\n` +
      report.torqueSpecs.map((t) => `- ${t.fastener}: ${t.torque} (${t.notes || ''})`).join('\n') +
      `\n\nCERTIFICATION:\n${report.technicianNotes}\nCertified By: ${report.certifyingTechnician}\n`;

    navigator.clipboard.writeText(text);
  };

  return (
    <div className="mt-3 p-5 rounded-xl bg-surface-container-low border border-secondary-container/30 shadow-lg text-xs font-body-md text-on-surface">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-secondary-container/20 border border-secondary-container/40 text-secondary">
            <span className="material-symbols-outlined text-[24px]">description</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-telemetry-label text-[10px] text-secondary uppercase font-bold tracking-widest">
                Official Work Order
              </span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-outline font-code-sm text-[10px]">
                RO #{report.reportId}
              </span>
            </div>
            <h3 className="font-headline-md text-base font-bold text-on-surface">
              Mechanic Diagnostic & Repair Order
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-xs font-code-sm text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            <span>Copy Text</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim text-xs font-code-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">print</span>
            <span>Print RO</span>
          </button>
        </div>
      </div>

      {/* Vehicle Info Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3 rounded-lg bg-surface-container-lowest/80 border border-white/5 font-code-sm text-xs">
        <div>
          <span className="text-[10px] text-outline uppercase block">Vehicle</span>
          <span className="font-semibold text-on-surface">
            {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-outline uppercase block">Engine & Transmission</span>
          <span className="text-on-surface-variant">
            {report.vehicle.engine}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-outline uppercase block">VIN Identification</span>
          <span className="font-mono text-secondary font-semibold">
            {report.vehicle.vin}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-outline uppercase block">Current Odometer</span>
          <span className="text-on-surface font-semibold">{report.vehicle.mileage}</span>
        </div>
      </div>

      {/* Customer Concern */}
      <div className="mb-4 p-3 rounded-lg bg-surface-container/60 border border-white/5">
        <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider block mb-1">
          Customer Stated Concern
        </span>
        <p className="text-xs italic text-on-surface-variant font-serif leading-relaxed">
          &ldquo;{report.customerConcern}&rdquo;
        </p>
      </div>

      {/* Telemetry Findings Table */}
      <div className="mb-4">
        <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider block mb-2">
          Diagnostic Telemetry & Bench Test Findings
        </span>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-start text-xs font-code-sm">
            <thead className="bg-surface-container-high text-outline uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3 text-start">Test Parameter</th>
                <th className="py-2 px-3 text-start">Measured Value</th>
                <th className="py-2 px-3 text-start">Expected Spec</th>
                <th className="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-surface-container">
              {report.telemetryFindings.map((f, i) => (
                <tr key={i} className="hover:bg-surface-container-high/50">
                  <td className="py-2 px-3 font-medium text-on-surface">{f.parameter}</td>
                  <td className="py-2 px-3 text-on-surface-variant">{f.measured}</td>
                  <td className="py-2 px-3 text-outline">{f.expected}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.status === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : f.status === 'Abnormal'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Root Cause & Corrective Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20">
          <span className="font-telemetry-label text-[10px] text-rose-400 uppercase tracking-wider block mb-1">
            Confirmed Root Cause
          </span>
          <p className="text-xs text-on-surface font-medium leading-relaxed">
            {report.verifiedRootCause}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-primary-container/10 border border-primary-container/20">
          <div className="flex items-center justify-between mb-1">
            <span className="font-telemetry-label text-[10px] text-primary-container uppercase tracking-wider">
              Recommended Corrective Action
            </span>
            <span className="text-[10px] font-code-sm text-outline font-bold">
              Labor: {report.estimatedLaborHours}
            </span>
          </div>
          <p className="text-xs text-on-surface font-medium leading-relaxed">
            {report.recommendedProcedure}
          </p>
        </div>
      </div>

      {/* Required Parts BOM */}
      <div className="mb-4">
        <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider block mb-2">
          Required OEM Replacement Parts (BOM)
        </span>
        <div className="space-y-1.5">
          {report.requiredParts.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded bg-surface-container text-xs font-code-sm border border-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary-container font-bold">•</span>
                <span className="text-on-surface font-medium">{p.name}</span>
                <span className="text-outline">Part #:</span>
                <span className="font-mono text-secondary">{p.partNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-outline">Qty: {p.qty}</span>
                <span className="text-emerald-400 font-semibold">{p.estCost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Torque Specs */}
      <div className="mb-4 p-3 rounded-lg bg-surface-container-lowest border border-white/5">
        <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider block mb-2">
          Critical Factory Fastener Torque Specs
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-code-sm text-xs">
          {report.torqueSpecs.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-1.5 rounded bg-surface-container">
              <span className="text-on-surface-variant">{t.fastener}</span>
              <span className="text-primary-container font-bold">{t.torque}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technician Sign-Off */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-code-sm">
        <div>
          <span className="text-outline block text-[10px] uppercase">Master Technician Notes:</span>
          <span className="text-on-surface-variant italic">{report.technicianNotes}</span>
        </div>
        <div className="text-right sm:text-end shrink-0">
          <span className="text-outline block text-[10px] uppercase">Certified Workshop Technician:</span>
          <span className="text-secondary font-semibold font-mono">
            {report.certifyingTechnician}
          </span>
        </div>
      </div>
    </div>
  );
};
