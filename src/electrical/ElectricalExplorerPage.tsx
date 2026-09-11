import React, { useState } from 'react';
import { VehicleProfileData } from '../db/vehicleTypes';
import { VEHICLE_PROFILES } from '../db/vehicleDatabase';
import { ElectricalSystemId } from './types';
import { ELECTRICAL_SYSTEM_METAS } from './verifiedDataToyota';
import { getVerifiedElectricalData, isVehicleWiringVerified } from './verifiedRegistry';
import { InteractiveCircuitDiagram } from './InteractiveCircuitDiagram';

interface ElectricalExplorerPageProps {
  currentVehicle: VehicleProfileData;
  onSelectVehicle: (vehicle: VehicleProfileData) => void;
  lang?: 'en' | 'ar';
}

export const ElectricalExplorerPage: React.FC<ElectricalExplorerPageProps> = ({
  currentVehicle,
  onSelectVehicle,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';

  // System & Component state
  const [selectedSystemId, setSelectedSystemId] = useState<ElectricalSystemId>('battery');
  const [selectedComponentId, setSelectedComponentId] = useState<string>('toyota-battery-pack');
  const [circuitState, setCircuitState] = useState<'off' | 'key_on' | 'active'>('active');

  // Check if verified OEM wiring data is available for current vehicle
  const verifiedProfile = getVerifiedElectricalData(currentVehicle.id);
  const isVerified = isVehicleWiringVerified(currentVehicle.id);

  // If verified, extract components for current system
  const systemComponents = verifiedProfile ? verifiedProfile.systems[selectedSystemId] || [] : [];
  const activeComponent = systemComponents.find((c) => c.id === selectedComponentId) || systemComponents[0];

  // Quick switch to verified vehicle
  const handleLoadVerifiedVehicle = () => {
    const verifiedVehicle = VEHICLE_PROFILES.find((v) => v.id === 'toyota-camry-2018-xv70-2.5l-se-auto');
    if (verifiedVehicle) {
      onSelectVehicle(verifiedVehicle);
      setSelectedSystemId('battery');
      setSelectedComponentId('toyota-battery-pack');
    }
  };

  // Switch system handler
  const handleSystemChange = (sysId: ElectricalSystemId) => {
    setSelectedSystemId(sysId);
    if (verifiedProfile && verifiedProfile.systems[sysId]?.length > 0) {
      setSelectedComponentId(verifiedProfile.systems[sysId][0].id);
    }
  };

  return (
    <div id="electrical-explorer-page" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Vehicle Context & Verification Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-2xl">schema</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-slate-400">
                {isAr ? 'مستكشف الدوائر الكهربائية والأسلاك' : 'ELECTRICAL SYSTEM EXPLORER'}
              </span>
              {isVerified ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {isAr ? 'مخطط مصنعي معتمد (OEM Verified)' : 'OEM VERIFIED SCHEMATIC'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  {isAr ? 'غير متوفر' : 'UNVERIFIED'}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
              {currentVehicle.year} {currentVehicle.make} {currentVehicle.model} ({currentVehicle.trim || currentVehicle.generation})
            </h1>
            {isVerified && (
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {verifiedProfile?.oemDiagramRef} • Standard: {verifiedProfile?.wiringStandards}
              </p>
            )}
          </div>
        </div>

        {/* Vehicle Selection Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            {isAr ? 'تغيير المركبة:' : 'Vehicle:'}
          </label>
          <select
            id="vehicle-select-dropdown"
            value={currentVehicle.id}
            onChange={(e) => {
              const found = VEHICLE_PROFILES.find((v) => v.id === e.target.value);
              if (found) {
                onSelectVehicle(found);
                setSelectedSystemId('battery');
                setSelectedComponentId('toyota-battery-pack');
              }
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            {VEHICLE_PROFILES.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year} {v.make} {v.model} {isVehicleWiringVerified(v.id) ? '✓ [OEM Verified]' : '— [No Verified Wiring]'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STRICT VERIFICATION GUARD: If unavailable, display the exact mandated text */}
      {!isVerified || !verifiedProfile ? (
        <div id="unverified-wiring-notice" className="bg-slate-900 border-2 border-dashed border-amber-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {/* EXACT MANDATED STRING */}
            <h2 className="text-2xl font-bold text-slate-100">
              Verified wiring information is not available for this vehicle.
            </h2>
            {isAr && (
              <p className="text-sm font-semibold text-amber-400">
                معلومات الأسلاك المعتمدة غير متوفرة لهذه المركبة حالياً.
              </p>
            )}
            <p className="text-sm text-slate-400 leading-relaxed">
              Per strict automotive engineering safety standards, fabricated, interpolated, or generic non-OEM wiring schematics are strictly prohibited. Only factory-verified Electrical Wiring Diagrams (EWD) with certified pinouts, fuse ratings, and wire color codes are presented.
            </p>
          </div>

          <div className="pt-2">
            <button
              id="load-verified-vehicle-btn"
              type="button"
              onClick={handleLoadVerifiedVehicle}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">verified</span>
              <span>
                {isAr ? 'عرض مخططات 2018 Toyota Camry المعتمدة' : 'Load 2018 Toyota Camry (Verified OEM EWD)'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Verified Electrical Explorer Workspace */
        <div className="space-y-6">
          {/* 10 Systems Tab Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-lg">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
              {ELECTRICAL_SYSTEM_METAS.map((sys) => {
                const isActive = selectedSystemId === sys.id;
                return (
                  <button
                    key={sys.id}
                    id={`system-tab-${sys.id}`}
                    type="button"
                    onClick={() => handleSystemChange(sys.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{sys.icon}</span>
                    <span>{isAr ? sys.nameAr.split(' ')[0] : sys.nameEn.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Component Selection Bar within System */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {isAr ? 'العنصر المختار:' : 'Select Component:'}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {systemComponents.map((comp) => (
                  <button
                    key={comp.id}
                    id={`component-btn-${comp.id}`}
                    type="button"
                    onClick={() => setSelectedComponentId(comp.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      activeComponent?.id === comp.id
                        ? 'bg-slate-800 text-amber-300 border border-amber-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {isAr ? comp.nameAr : comp.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {activeComponent && (
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="text-slate-500">OEM P/N:</span>
                <span className="text-slate-200 font-bold">{activeComponent.partNumberOEM.split(' ')[0]}</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400 truncate max-w-xs">{activeComponent.location}</span>
              </div>
            )}
          </div>

          {/* Animated Current-Flow Visualization Diagram & Multimeter */}
          {activeComponent && (
            <InteractiveCircuitDiagram
              component={activeComponent}
              circuitState={circuitState}
              onStateChange={setCircuitState}
              lang={lang}
            />
          )}

          {/* 6 Required Detailed Specifications Cards */}
          {activeComponent && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Power Path */}
              <div id="card-power-path" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <span className="material-symbols-outlined text-xl">power</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">
                      CIRCUIT TRACE 1
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {isAr ? 'مسار القدرة الكهربائية' : 'Power Path'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  {activeComponent.powerPath.summary}
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'المصدر' : 'Source Node'}:</span>
                    <span className="text-slate-200 font-semibold">{activeComponent.powerPath.sourceNode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'الفيوز' : 'Fuse Node'}:</span>
                    <span className="text-amber-400 font-semibold">{activeComponent.powerPath.fuseNode}</span>
                  </div>
                  {activeComponent.powerPath.relayNode && (
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">{isAr ? 'المرحل' : 'Relay Node'}:</span>
                      <span className="text-blue-400 font-semibold">{activeComponent.powerPath.relayNode}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'لون السلك' : 'Wire Color'}:</span>
                    <span className="text-red-400 font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeComponent.powerPath.wireColorHex }}></span>
                      {activeComponent.powerPath.wireColorCode}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'الفيش والطرف' : 'Connector & Pin'}:</span>
                    <span className="text-slate-200">{activeComponent.powerPath.connectorCode} ({activeComponent.powerPath.terminalPin})</span>
                  </div>
                </div>
              </div>

              {/* 2. Ground */}
              <div id="card-ground" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-xl">vertical_align_bottom</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      CIRCUIT TRACE 2
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {isAr ? 'مسار التأريض' : 'Ground'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  {activeComponent.ground.summary}
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'نقطة التأريض' : 'Ground Point ID'}:</span>
                    <span className="text-emerald-400 font-semibold">{activeComponent.ground.groundPointId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'موقع الربط' : 'Location'}:</span>
                    <span className="text-slate-200">{activeComponent.ground.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'لون السلك' : 'Wire Color'}:</span>
                    <span className="text-slate-200 font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
                      {activeComponent.ground.wireColorCode}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'أقصى مقاومة للشاسيه' : 'Max Ground R'}:</span>
                    <span className="text-emerald-400 font-bold">&lt; {activeComponent.ground.maxResistanceOhms} Ω</span>
                  </div>
                </div>
              </div>

              {/* 3. Signal */}
              <div id="card-signal" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <span className="material-symbols-outlined text-xl">insights</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                      CIRCUIT TRACE 3
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {isAr ? 'خط الإشارة والتحكم' : 'Signal'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  {activeComponent.signal.summary}
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'نوع الإشارة' : 'Signal Type'}:</span>
                    <span className="text-sky-300 font-semibold">{activeComponent.signal.signalType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'المتحكم والطرف' : 'Controller Pin'}:</span>
                    <span className="text-slate-200">{activeComponent.signal.controller} ({activeComponent.signal.controllerPin})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'المجال الاسمي' : 'Operating Range'}:</span>
                    <span className="text-amber-300">{activeComponent.signal.operatingRange}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'شكل الموجة' : 'Waveform'}:</span>
                    <span className="text-slate-300 text-[11px] truncate max-w-[150px]">{activeComponent.signal.waveformDesc}</span>
                  </div>
                </div>
              </div>

              {/* 4. Related Fuse */}
              <div id="card-related-fuse" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <span className="material-symbols-outlined text-xl">safety_check</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      PROTECTION
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {isAr ? 'الفيوز المرتبط' : 'Related Fuse'}
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-100">{activeComponent.relatedFuse.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{activeComponent.relatedFuse.id}</div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-base">
                    {activeComponent.relatedFuse.ratingAmps}A
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'نوع الفيوز' : 'Fuse Type'}:</span>
                    <span className="text-slate-200">{activeComponent.relatedFuse.fuseType}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'موقع العلبة' : 'Location'}:</span>
                    <span className="text-slate-300 text-right max-w-[170px] truncate">{activeComponent.relatedFuse.locationBox}</span>
                  </div>
                </div>
              </div>

              {/* 5. Related Relay */}
              <div id="card-related-relay" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <span className="material-symbols-outlined text-xl">electrical_services</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                      POWER SWITCHING
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {isAr ? 'المرحل (الكتاوت) المرتبط' : 'Related Relay'}
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-sm font-bold text-slate-100">{activeComponent.relatedRelay.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{activeComponent.relatedRelay.location}</div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'نوع المرحل' : 'Relay Type'}:</span>
                    <span className="text-blue-300">{activeComponent.relatedRelay.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'أطراف الملف' : 'Coil Pins'}:</span>
                    <span className="text-slate-200">{activeComponent.relatedRelay.coilTerminals}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'أطراف التوصيل' : 'Contact Pins'}:</span>
                    <span className="text-slate-200">{activeComponent.relatedRelay.contactTerminals}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'مقاومة الملف الاسمية' : 'Coil Ohms'}:</span>
                    <span className="text-amber-400 font-bold">{activeComponent.relatedRelay.nominalCoilOhms} Ω</span>
                  </div>
                </div>
              </div>

              {/* 6. Related Sensor */}
              <div id="card-related-sensor" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <span className="material-symbols-outlined text-xl">sensors</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                      TELEMETRY
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      {isAr ? 'الحساس المرتبط' : 'Related Sensor'}
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-sm font-bold text-slate-100">{activeComponent.relatedSensor.name}</div>
                  <div className="text-[10px] font-mono text-purple-400 mt-0.5">OEM: {activeComponent.relatedSensor.partNumberOEM}</div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">{isAr ? 'تقنية الحساس' : 'Technology'}:</span>
                    <span className="text-slate-200">{activeComponent.relatedSensor.sensorTechnology}</span>
                  </div>
                  <div className="py-1 border-b border-slate-800">
                    <span className="text-slate-400 block mb-0.5">{isAr ? 'الدور التشخيصي' : 'Role'}:</span>
                    <span className="text-slate-300 text-[11px] leading-relaxed block">{activeComponent.relatedSensor.diagnosticRole}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">{isAr ? 'القيمة الاسمية' : 'Normal Spec'}:</span>
                    <span className="text-emerald-400 font-semibold text-[11px] truncate max-w-[150px]">{activeComponent.relatedSensor.normalOperatingValue}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Diagnostics & SAE Engineering Standards Footer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-400">verified_user</span>
              <span>
                {isAr
                  ? 'جميع المخططات مأخوذة من توثيق المصنع الأصلي لشركة تويوتا (EWD-CAM18) ومطابقة لمعايير SAE J1114 و ISO 11898-2.'
                  : 'All diagrams derived from authentic OEM Service Documentation (EWD-CAM18) adhering strictly to SAE J1114 & ISO 11898-2.'}
              </span>
            </div>
            <div className="text-slate-500 whitespace-nowrap">
              {currentVehicle.vinExample} • Rig ID: 0x7E0
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
