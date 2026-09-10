import React, { useState } from 'react';
import { Language } from '../types';
import { VehicleProfileData } from '../db/vehicleTypes';
import { VEHICLE_PROFILES } from '../db/vehicleDatabase';

interface VehicleCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentVehicle: VehicleProfileData;
  onSelectVehicle?: (vehicle: VehicleProfileData) => void;
}

export const VehicleCompareModal: React.FC<VehicleCompareModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentVehicle,
  onSelectVehicle,
}) => {
  const [compareId, setCompareId] = useState<string>(
    VEHICLE_PROFILES.find((v) => v.id !== currentVehicle.id)?.id || VEHICLE_PROFILES[0].id
  );

  if (!isOpen) return null;

  const compareVehicle = VEHICLE_PROFILES.find((v) => v.id === compareId) || VEHICLE_PROFILES[0];
  const isAr = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container">
              <span className="material-symbols-outlined text-xl">compare_arrows</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {isAr ? 'مقارنة مواصفات المركبات وجداول الصيانة' : 'Side-by-Side Vehicle Technical Comparison'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                {isAr
                  ? 'مقارنة المحرك، القوة، السوائل، البطارية، ومواصفات الإطارات'
                  : 'Compare powertrain, fluids, battery, service intervals & chassis specs'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Vehicle Selection Header Bar */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container border-b border-white/5">
          {/* Active Vehicle */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-primary-container/30 space-y-1">
            <span className="text-[10px] font-code-sm text-primary-container uppercase font-bold tracking-wider">
              {isAr ? 'المركبة الحالية' : 'Current Active Vehicle'}
            </span>
            <div className="text-sm font-bold text-on-surface truncate">
              {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
            </div>
            <div className="text-xs font-code-sm text-outline truncate">{currentVehicle.trim}</div>
          </div>

          {/* Select Comparison Vehicle */}
          <div className="p-3 bg-surface-container-low rounded-xl border border-white/10 space-y-1">
            <span className="text-[10px] font-code-sm text-secondary uppercase font-bold tracking-wider">
              {isAr ? 'مركبة المقارنة' : 'Compare With'}
            </span>
            <select
              value={compareId}
              onChange={(e) => setCompareId(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface text-xs font-code-sm py-1 px-2 rounded border border-white/10 focus:outline-none focus:border-secondary cursor-pointer"
            >
              {VEHICLE_PROFILES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model} ({v.trim})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Tables Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Spec Section 1: Powertrain & Engine */}
          <div className="space-y-2">
            <h4 className="text-xs font-telemetry-label text-outline uppercase tracking-wider">
              {isAr ? 'المحرك ومنظومة الحركة' : 'Powertrain & Performance'}
            </h4>
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5 text-xs font-code-sm">
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'المحرك' : 'Engine'}</span>
                <span className="text-on-surface font-medium">{currentVehicle.engine}</span>
                <span className="text-on-surface font-medium">{compareVehicle.engine}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'القوة الحصانية' : 'Horsepower'}</span>
                <span className="text-primary-container font-bold">{currentVehicle.horsepower} HP</span>
                <span className="text-secondary font-bold">{compareVehicle.horsepower} HP</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'عزم الدوران' : 'Torque'}</span>
                <span className="text-on-surface font-bold">{currentVehicle.torqueLbFt} lb-ft</span>
                <span className="text-on-surface font-bold">{compareVehicle.torqueLbFt} lb-ft</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'السعة اللترية' : 'Displacement'}</span>
                <span className="text-on-surface">{currentVehicle.displacement}</span>
                <span className="text-on-surface">{compareVehicle.displacement}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'عدد الأسطوانات' : 'Cylinder Layout'}</span>
                <span className="text-on-surface">{currentVehicle.cylinderCount} ({currentVehicle.cylinderLayout})</span>
                <span className="text-on-surface">{compareVehicle.cylinderCount} ({compareVehicle.cylinderLayout})</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'ناقل الحركة' : 'Transmission'}</span>
                <span className="text-on-surface">{currentVehicle.transmission}</span>
                <span className="text-on-surface">{compareVehicle.transmission}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'نظام الدفع' : 'Drive Type'}</span>
                <span className="text-on-surface font-semibold">{currentVehicle.driveType}</span>
                <span className="text-on-surface font-semibold">{compareVehicle.driveType}</span>
              </div>
            </div>
          </div>

          {/* Spec Section 2: Fluids & Capacities */}
          <div className="space-y-2">
            <h4 className="text-xs font-telemetry-label text-outline uppercase tracking-wider">
              {isAr ? 'السوائل والسعات المعتمدة' : 'Fluids & Capacities'}
            </h4>
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5 text-xs font-code-sm">
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'زيت المحرك' : 'Engine Oil'}</span>
                <div className="text-on-surface pr-2">
                  <div className="font-semibold text-primary">{currentVehicle.fluids[0]?.spec}</div>
                  <div className="text-[11px] text-outline">{currentVehicle.fluids[0]?.capacity}</div>
                </div>
                <div className="text-on-surface">
                  <div className="font-semibold text-primary">{compareVehicle.fluids[0]?.spec}</div>
                  <div className="text-[11px] text-outline">{compareVehicle.fluids[0]?.capacity}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'سائل ناقل الحركة' : 'Transmission Fluid'}</span>
                <div className="text-on-surface pr-2">
                  <div className="font-medium">{currentVehicle.fluids[1]?.spec || 'OEM Spec'}</div>
                  <div className="text-[11px] text-outline">{currentVehicle.fluids[1]?.capacity}</div>
                </div>
                <div className="text-on-surface">
                  <div className="font-medium">{compareVehicle.fluids[1]?.spec || 'OEM Spec'}</div>
                  <div className="text-[11px] text-outline">{compareVehicle.fluids[1]?.capacity}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Spec Section 3: Battery & Electrical */}
          <div className="space-y-2">
            <h4 className="text-xs font-telemetry-label text-outline uppercase tracking-wider">
              {isAr ? 'مواصفات البطارية والكهرباء' : 'Battery & Electrical Specifications'}
            </h4>
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5 text-xs font-code-sm">
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'حجم المجموعة (Group Size)' : 'BCI Group Size'}</span>
                <span className="text-on-surface font-semibold">{currentVehicle.battery.groupSize}</span>
                <span className="text-on-surface font-semibold">{compareVehicle.battery.groupSize}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'أمبير التدوير على البارد (CCA)' : 'Cold Cranking Amps (CCA)'}</span>
                <span className="text-primary-container font-bold">{currentVehicle.battery.cca} CCA</span>
                <span className="text-secondary font-bold">{compareVehicle.battery.cca} CCA</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'نوع الكيمياء' : 'Chemistry'}</span>
                <span className="text-on-surface">{currentVehicle.battery.chemistry}</span>
                <span className="text-on-surface">{compareVehicle.battery.chemistry}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'رقم القطعة الأصلي OEM' : 'OEM Part Number'}</span>
                <span className="text-outline-variant">{currentVehicle.battery.partNumberOEM}</span>
                <span className="text-outline-variant">{compareVehicle.battery.partNumberOEM}</span>
              </div>
            </div>
          </div>

          {/* Spec Section 4: Tires & Wheels */}
          <div className="space-y-2">
            <h4 className="text-xs font-telemetry-label text-outline uppercase tracking-wider">
              {isAr ? 'الإطارات والجنوط وعزم المسامير' : 'Tires, Wheels & Fastener Torque'}
            </h4>
            <div className="bg-surface-container-low rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5 text-xs font-code-sm">
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'مقاس الإطارات الأمامية' : 'Front Tire Spec'}</span>
                <span className="text-on-surface">{currentVehicle.tires.standardFront}</span>
                <span className="text-on-surface">{compareVehicle.tires.standardFront}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'ضغط الهواء البارد (PSI)' : 'Cold Pressure (F / R)'}</span>
                <span className="text-on-surface font-medium">{currentVehicle.tires.pressureColdFrontPsi} / {currentVehicle.tires.pressureColdRearPsi} PSI</span>
                <span className="text-on-surface font-medium">{compareVehicle.tires.pressureColdFrontPsi} / {compareVehicle.tires.pressureColdRearPsi} PSI</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'عزم ربط مسامير الجنط' : 'Wheel Lug Torque'}</span>
                <span className="text-secondary font-bold">{currentVehicle.tires.wheelLugTorque}</span>
                <span className="text-secondary font-bold">{compareVehicle.tires.wheelLugTorque}</span>
              </div>
              <div className="grid grid-cols-3 p-2.5">
                <span className="text-outline">{isAr ? 'نمط المسامير (Bolt Pattern)' : 'Bolt Pattern'}</span>
                <span className="text-on-surface">{currentVehicle.tires.boltPattern}</span>
                <span className="text-on-surface">{compareVehicle.tires.boltPattern}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => {
              if (onSelectVehicle) {
                onSelectVehicle(compareVehicle);
                onClose();
              }
            }}
            className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs font-semibold transition-colors cursor-pointer"
          >
            {isAr ? `تبديل إلى ${compareVehicle.model}` : `Switch Profile to ${compareVehicle.model}`}
          </button>
          <button
            onClick={onClose}
            className="bg-primary-container text-on-primary-container px-5 py-2 rounded-lg font-code-sm text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            {isAr ? 'إغلاق المقارنة' : 'Close Comparison'}
          </button>
        </div>
      </div>
    </div>
  );
};
