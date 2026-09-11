import React, { useRef } from 'react';
import { JobCard, JOB_STATUS_CONFIG } from './workshopTypes';
import { Language } from '../types';

interface PrintableServiceReportProps {
  jobCard: JobCard;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PrintableServiceReport: React.FC<PrintableServiceReportProps> = ({
  jobCard,
  isOpen,
  onClose,
  lang,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Financial calculations
  const partsSubtotal = jobCard.parts.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );
  const laborSubtotal = jobCard.labor.reduce(
    (sum, l) => sum + l.hours * l.hourlyRate,
    0
  );
  const shopSupplies = Math.round((partsSubtotal + laborSubtotal) * 0.05 * 100) / 100; // 5% shop fee capped
  const taxRate = 0.0825; // 8.25% state/local tax
  const taxableAmount = partsSubtotal + shopSupplies;
  const tax = Math.round(taxableAmount * taxRate * 100) / 100;
  const grandTotal = Math.round((partsSubtotal + laborSubtotal + shopSupplies + tax) * 100) / 100;

  const statusInfo = JOB_STATUS_CONFIG[jobCard.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Container Dialog */}
      <div className="relative w-full max-w-4xl bg-surface-container rounded-2xl border border-white/10 shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Toolbar (hidden during actual window.print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container-high border-b border-white/10 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-container/20 text-primary-container">
              <span className="material-symbols-outlined text-2xl">print</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {lang === 'ar' ? 'تقرير الصيانة وأمر العمل المعتمد' : 'Printable Service Report & Work Order'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                {jobCard.id} • {jobCard.customer.name} • {jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>{lang === 'ar' ? 'طباعة التقرير / PDF' : 'Print / Export PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-bright text-outline hover:text-on-surface transition-colors cursor-pointer"
              type="button"
              title="Close Report"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Content */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-surface-container-lowest text-on-surface print:p-0 print:m-0 print:bg-white print:text-black">
          {/* Paper Canvas (White sheet feel for pristine printing) */}
          <div
            ref={printRef}
            id="printable-service-report"
            className="w-full max-w-3xl mx-auto bg-white text-neutral-900 rounded-xl p-6 sm:p-10 shadow-lg border border-neutral-200 print:shadow-none print:border-none print:p-0"
          >
            {/* Header: Workshop Branding */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-neutral-900 pb-6 mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-cyan-600 flex items-center justify-center text-white font-bold text-lg font-mono">
                    AF
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase">
                    AUTOFIX MASTER WORKSHOP
                  </h1>
                </div>
                <p className="text-xs text-neutral-600 font-medium">
                  Factory Authorized Precision Diagnostics & Powertrain Engineering
                </p>
                <p className="text-[11px] text-neutral-500">
                  8420 Motorsport Way, Service Bay Complex • Phone: (555) 019-2834 • License #ASE-99214
                </p>
              </div>

              <div className="text-left sm:text-right space-y-1 border-l sm:border-l-0 sm:border-r border-neutral-300 ps-4 sm:ps-0 sm:pe-4">
                <div className="inline-block px-3 py-1 bg-neutral-900 text-white font-mono text-xs font-bold rounded uppercase">
                  WORK ORDER: {jobCard.id}
                </div>
                <p className="text-xs text-neutral-600 font-mono">
                  Date: {new Date(jobCard.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-neutral-600 font-mono">
                  Bay: {jobCard.bay}
                </p>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border border-neutral-300 bg-neutral-100">
                  <span>Status:</span>
                  <span className="font-semibold">{statusInfo.labelEn}</span>
                </div>
              </div>
            </div>

            {/* 2-Column: Customer & Vehicle Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
              {/* Customer Box */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <h4 className="font-bold uppercase text-neutral-700 tracking-wider text-[11px] mb-2 border-b border-neutral-200 pb-1">
                  CUSTOMER INFORMATION
                </h4>
                <div className="space-y-1 text-neutral-800">
                  <p className="font-bold text-sm text-neutral-900">{jobCard.customer.name}</p>
                  <p>Phone: <span className="font-mono">{jobCard.customer.phone || 'N/A'}</span></p>
                  <p>Email: <span className="font-mono">{jobCard.customer.email || 'N/A'}</span></p>
                  {jobCard.customer.address && <p>Address: {jobCard.customer.address}</p>}
                  <p>Account: <span className="font-semibold">{jobCard.customer.accountType}</span></p>
                </div>
              </div>

              {/* Vehicle Box */}
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <h4 className="font-bold uppercase text-neutral-700 tracking-wider text-[11px] mb-2 border-b border-neutral-200 pb-1">
                  VEHICLE IDENTIFICATION
                </h4>
                <div className="space-y-1 text-neutral-800">
                  <p className="font-bold text-sm text-neutral-900">
                    {jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}
                  </p>
                  <p>Powertrain: <span className="font-medium">{jobCard.vehicle.engine}</span></p>
                  <p>VIN: <span className="font-mono font-bold">{jobCard.vin || 'Not Provided'}</span></p>
                  <div className="flex items-center justify-between pt-1">
                    <p>Odometer: <span className="font-mono font-bold text-neutral-900">{jobCard.mileage.toLocaleString()} {jobCard.mileageUnit}</span></p>
                    {jobCard.vehicle.licensePlate && (
                      <p className="bg-neutral-200 px-1.5 py-0.5 rounded font-mono font-bold">
                        Plate: {jobCard.vehicle.licensePlate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Complaint / Stated Problem */}
            <div className="mb-5 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <h4 className="font-bold uppercase text-neutral-700 tracking-wider text-[11px] mb-1">
                CUSTOMER COMPLAINT / STATED PROBLEM
              </h4>
              <p className="text-xs text-neutral-800 italic leading-relaxed">
                "{jobCard.complaint}"
              </p>
            </div>

            {/* Diagnostic Findings & DTC Codes */}
            <div className="mb-5 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <h4 className="font-bold uppercase text-neutral-700 tracking-wider text-[11px] mb-2">
                DIAGNOSTIC FINDINGS & CONFIRMED ROOT CAUSE
              </h4>
              <p className="text-xs text-neutral-900 font-semibold mb-2">
                {jobCard.diagnosis.rootCause}
              </p>
              {jobCard.diagnosis.dtcCodes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-neutral-600">Active DTC Codes:</span>
                  {jobCard.diagnosis.dtcCodes.map((dtc) => (
                    <span
                      key={dtc}
                      className="px-2 py-0.5 bg-red-100 border border-red-300 text-red-800 font-mono font-bold text-xs rounded"
                    >
                      {dtc}
                    </span>
                  ))}
                </div>
              )}
              {jobCard.diagnosis.freezeFrameSummary && (
                <p className="text-[11px] font-mono bg-neutral-100 p-2 rounded border border-neutral-200 text-neutral-700">
                  Freeze Frame Telemetry: {jobCard.diagnosis.freezeFrameSummary}
                </p>
              )}
            </div>

            {/* Performed Services & Steps Checklist */}
            <div className="mb-5">
              <h4 className="font-bold uppercase text-neutral-800 tracking-wider text-xs mb-2 border-b border-neutral-300 pb-1">
                SERVICE PROCEDURES & REPAIR EXECUTION
              </h4>
              <p className="text-xs font-semibold text-neutral-900 mb-2">
                {jobCard.repair.procedureTitle}
              </p>
              <div className="space-y-1.5 text-xs">
                {jobCard.repair.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-start gap-2">
                    <span className="font-mono text-neutral-500 font-bold w-5">{idx + 1}.</span>
                    <div className="flex-1 text-neutral-800">
                      <span>{step.text}</span>
                      {step.torque && (
                        <span className="ms-2 font-mono font-bold text-[11px] bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
                          Torque: {step.torque}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {step.completed ? '[COMPLETED]' : '[IN PROGRESS]'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Inspection & Measurements Matrix */}
            <div className="mb-6">
              <h4 className="font-bold uppercase text-neutral-800 tracking-wider text-xs mb-2 border-b border-neutral-300 pb-1">
                INSPECTION LOG & RECORDED MEASUREMENTS
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Front Brake Pads</span>
                  <span className="font-mono font-bold text-neutral-900">
                    L: {jobCard.measurements.frontLeftPadMm} mm | R: {jobCard.measurements.frontRightPadMm} mm
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Min: {jobCard.measurements.padMinThicknessMm} mm</span>
                </div>

                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Front Brake Rotors</span>
                  <span className="font-mono font-bold text-neutral-900">
                    L: {jobCard.measurements.frontLeftRotorMm} mm | R: {jobCard.measurements.frontRightRotorMm} mm
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Min: {jobCard.measurements.rotorMinThicknessMm} mm</span>
                </div>

                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Tire Tread Depth</span>
                  <span className="font-mono font-bold text-neutral-900">
                    FL: {jobCard.measurements.tireFL_mm}mm | RR: {jobCard.measurements.tireRR_mm}mm
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Min: {jobCard.measurements.tireMinTreadMm} mm</span>
                </div>

                <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">Battery Health</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {jobCard.measurements.batteryVoltage}V ({jobCard.measurements.batteryCcaActual} CCA)
                  </span>
                  <span className="text-[10px] text-neutral-500 block">SOH: {jobCard.measurements.batteryHealthPct}%</span>
                </div>
              </div>
            </div>

            {/* Itemized Parts Table */}
            <div className="mb-6">
              <h4 className="font-bold uppercase text-neutral-800 tracking-wider text-xs mb-2 border-b border-neutral-300 pb-1">
                ITEMIZED PARTS & MATERIALS
              </h4>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-300 bg-neutral-100 text-neutral-700 font-mono">
                    <th className="py-1.5 px-2">Part #</th>
                    <th className="py-1.5 px-2">Description</th>
                    <th className="py-1.5 px-2 text-center">Qty</th>
                    <th className="py-1.5 px-2 text-right">Unit Price</th>
                    <th className="py-1.5 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {jobCard.parts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-2 text-center text-neutral-500 italic">
                        No parts billed for this operation.
                      </td>
                    </tr>
                  ) : (
                    jobCard.parts.map((part) => (
                      <tr key={part.id}>
                        <td className="py-1.5 px-2 font-mono text-neutral-700">{part.partNumber}</td>
                        <td className="py-1.5 px-2 text-neutral-900 font-medium">{part.description}</td>
                        <td className="py-1.5 px-2 text-center font-mono">{part.quantity}</td>
                        <td className="py-1.5 px-2 text-right font-mono">${part.unitPrice.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right font-mono font-bold">
                          ${(part.quantity * part.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Itemized Labor Table */}
            <div className="mb-6">
              <h4 className="font-bold uppercase text-neutral-800 tracking-wider text-xs mb-2 border-b border-neutral-300 pb-1">
                LABOR & TECHNICAL OPERATIONS
              </h4>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-300 bg-neutral-100 text-neutral-700 font-mono">
                    <th className="py-1.5 px-2">Operation / Description</th>
                    <th className="py-1.5 px-2">Technician</th>
                    <th className="py-1.5 px-2 text-center">Hours</th>
                    <th className="py-1.5 px-2 text-right">Rate</th>
                    <th className="py-1.5 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {jobCard.labor.map((lbr) => (
                    <tr key={lbr.id}>
                      <td className="py-1.5 px-2 text-neutral-900 font-medium">{lbr.description}</td>
                      <td className="py-1.5 px-2 text-neutral-600">{lbr.technician}</td>
                      <td className="py-1.5 px-2 text-center font-mono">{lbr.hours.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-right font-mono">${lbr.hourlyRate.toFixed(2)}</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold">
                        ${(lbr.hours * lbr.hourlyRate).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 pt-2">
              <div className="w-full sm:max-w-xs space-y-1 text-[11px] text-neutral-600">
                <p className="font-bold uppercase text-neutral-800">WARRANTY & GUARANTEE:</p>
                <p>
                  All mechanical repairs and genuine OEM components installed are warranted for 12 months or 12,000 miles, whichever occurs first.
                </p>
                <p>Torque verified using ISO-calibrated click torque wrenches.</p>
              </div>

              <div className="w-full sm:max-w-xs bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Parts Subtotal:</span>
                  <span className="font-mono font-medium">${partsSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Labor Subtotal:</span>
                  <span className="font-mono font-medium">${laborSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Shop Supplies & Hazmat (5%):</span>
                  <span className="font-mono font-medium">${shopSupplies.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 border-b border-neutral-200 pb-1.5">
                  <span>Estimated Tax (8.25%):</span>
                  <span className="font-mono font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1">
                  <span>TOTAL AMOUNT DUE:</span>
                  <span className="font-mono text-base text-cyan-700">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-neutral-300 text-xs">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold mb-8">
                  LEAD TECHNICIAN CERTIFICATION & SIGN-OFF
                </p>
                <div className="border-b border-neutral-800 mb-1"></div>
                <p className="font-bold text-neutral-900">{jobCard.diagnosis.leadTechnician || 'Certified Master Technician'}</p>
                <p className="text-[11px] text-neutral-500">ASE Master Automotive Technician Stamp</p>
              </div>

              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold mb-8">
                  CUSTOMER ACCEPTANCE & AUTHORIZATION
                </p>
                <div className="border-b border-neutral-800 mb-1"></div>
                <p className="font-bold text-neutral-900">{jobCard.customer.name}</p>
                <p className="text-[11px] text-neutral-500">Signature / Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
