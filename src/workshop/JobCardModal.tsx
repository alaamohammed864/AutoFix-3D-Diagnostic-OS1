import React, { useState, useEffect } from 'react';
import { JobCard, JobStatus, PartItem, LaborItem, WorkNote, JOB_STATUS_CONFIG } from './workshopTypes';
import { VehicleProfileData } from '../db/vehicleTypes';
import { Language } from '../types';

interface JobCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: JobCard) => void;
  initialCard?: JobCard | null;
  activeVehicleProfile?: VehicleProfileData | null;
  lang: Language;
}

const ALL_STATUSES: JobStatus[] = [
  'New',
  'Inspection',
  'Diagnosis',
  'Waiting Parts',
  'Repairing',
  'Testing',
  'Completed',
];

export const JobCardModal: React.FC<JobCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCard,
  activeVehicleProfile,
  lang,
}) => {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [accountType, setAccountType] = useState<'Private' | 'Fleet' | 'Commercial'>('Private');

  const [vehicleMake, setVehicleMake] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('Camry');
  const [vehicleYear, setVehicleYear] = useState<string | number>(2021);
  const [vehicleEngine, setVehicleEngine] = useState('2.5L Dynamic Force I4');
  const [vehicleTransmission, setVehicleTransmission] = useState('8-Speed Automatic');
  const [vehiclePlate, setVehiclePlate] = useState('7XYZ892');
  const [vin, setVin] = useState('');
  const [mileage, setMileage] = useState<number>(45000);
  const [mileageUnit, setMileageUnit] = useState<'km' | 'mi'>('km');

  const [complaint, setComplaint] = useState('');
  const [inspectionSummary, setInspectionSummary] = useState('');
  const [inspectionVisual, setInspectionVisual] = useState<'Good' | 'Fair' | 'Requires Attention' | 'Dangerous'>('Requires Attention');
  const [safetyPassed, setSafetyPassed] = useState(false);

  const [diagnosisRootCause, setDiagnosisRootCause] = useState('');
  const [diagnosisDtcs, setDiagnosisDtcs] = useState('P0301, P0171');
  const [leadTechnician, setLeadTechnician] = useState('Alex Thorne');

  const [repairTitle, setRepairTitle] = useState('');
  const [repairSummary, setRepairSummary] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(2.5);

  const [parts, setParts] = useState<PartItem[]>([]);
  const [labor, setLabor] = useState<LaborItem[]>([]);
  const [noteContent, setNoteContent] = useState('');

  const [status, setStatus] = useState<JobStatus>('New');
  const [priority, setPriority] = useState<'Standard' | 'Urgent' | 'Safety Critical'>('Standard');
  const [bay, setBay] = useState('Bay 2 - Lift 1');

  // Active Tab within the Form
  const [activeTab, setActiveTab] = useState<'overview' | 'diagnosis' | 'repair' | 'parts_labor'>('overview');

  useEffect(() => {
    if (initialCard) {
      // Edit mode: populate existing card
      setCustomerName(initialCard.customer.name);
      setCustomerPhone(initialCard.customer.phone);
      setCustomerEmail(initialCard.customer.email);
      setAccountType(initialCard.customer.accountType);

      setVehicleMake(initialCard.vehicle.make);
      setVehicleModel(initialCard.vehicle.model);
      setVehicleYear(initialCard.vehicle.year);
      setVehicleEngine(initialCard.vehicle.engine);
      setVehicleTransmission(initialCard.vehicle.transmission);
      setVehiclePlate(initialCard.vehicle.licensePlate || '');
      setVin(initialCard.vin || '');
      setMileage(initialCard.mileage);
      setMileageUnit(initialCard.mileageUnit);

      setComplaint(initialCard.complaint);
      setInspectionSummary(initialCard.inspection.summary);
      setInspectionVisual(initialCard.inspection.visualCondition);
      setSafetyPassed(initialCard.inspection.safetyPassed);

      setDiagnosisRootCause(initialCard.diagnosis.rootCause);
      setDiagnosisDtcs(initialCard.diagnosis.dtcCodes.join(', '));
      setLeadTechnician(initialCard.diagnosis.leadTechnician);

      setRepairTitle(initialCard.repair.procedureTitle);
      setRepairSummary(initialCard.repair.procedureSummary);
      setEstimatedHours(initialCard.repair.estimatedHours);

      setParts(initialCard.parts);
      setLabor(initialCard.labor);
      setStatus(initialCard.status);
      setPriority(initialCard.priority);
      setBay(initialCard.bay);
    } else if (activeVehicleProfile) {
      // New card creation from active vehicle
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setAccountType('Private');

      setVehicleMake(activeVehicleProfile.make);
      setVehicleModel(activeVehicleProfile.model);
      setVehicleYear(activeVehicleProfile.year);
      setVehicleEngine(activeVehicleProfile.engine);
      setVehicleTransmission(activeVehicleProfile.transmission);
      setVehiclePlate('');
      setVin(activeVehicleProfile.vinExample || '');
      setMileage(42000);
      setMileageUnit('km');

      setComplaint('Customer requests multi-point inspection and diagnostic verification.');
      setInspectionSummary('Vehicle intake logged. Staged for initial inspection.');
      setInspectionVisual('Good');
      setSafetyPassed(true);

      setDiagnosisRootCause('Pending diagnostic evaluation.');
      setDiagnosisDtcs('P0171');
      setLeadTechnician('Alex Thorne');

      setRepairTitle('Multi-Point Inspection & Fluid Verification');
      setRepairSummary('Perform visual inspection, check fluid specs, verify torque.');
      setEstimatedHours(1.5);

      setParts([]);
      setLabor([
        {
          id: 'lab-init-1',
          description: 'Multi-Point Vehicle Inspection & Diagnostic Scan',
          technician: 'Alex Thorne',
          hours: 1.0,
          hourlyRate: 140,
        },
      ]);
      setStatus('New');
      setPriority('Standard');
      setBay('Bay 1');
    }
  }, [initialCard, activeVehicleProfile, isOpen]);

  if (!isOpen) return null;

  // Add sample part
  const handleAddPart = () => {
    const newPart: PartItem = {
      id: `prt-${Date.now()}`,
      partNumber: 'OEM-PARTS-101',
      description: 'Replacement Filter Element',
      quantity: 1,
      unitPrice: 45.0,
      supplier: 'OEM Automotive Parts Direct',
      status: 'In Stock',
    };
    setParts([...parts, newPart]);
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleUpdatePart = (id: string, field: keyof PartItem, value: any) => {
    setParts(
      parts.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Add labor item
  const handleAddLabor = () => {
    const newLabor: LaborItem = {
      id: `lbr-${Date.now()}`,
      description: 'Mechanical R&I Operation',
      technician: leadTechnician || 'Master Tech',
      hours: 1.0,
      hourlyRate: 140,
    };
    setLabor([...labor, newLabor]);
  };

  const handleRemoveLabor = (id: string) => {
    setLabor(labor.filter((l) => l.id !== id));
  };

  const handleUpdateLabor = (id: string, field: keyof LaborItem, value: any) => {
    setLabor(
      labor.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dtcArray = diagnosisDtcs
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    const updatedNotes: WorkNote[] = initialCard?.notes ? [...initialCard.notes] : [];
    if (noteContent.trim()) {
      updatedNotes.push({
        id: `nt-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: leadTechnician || 'Technician',
        role: 'Lead Tech',
        content: noteContent.trim(),
        isCustomerVisible: true,
      });
    }

    const cardToSave: JobCard = {
      id: initialCard?.id || `JOB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: initialCard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        name: customerName || 'Valued Customer',
        phone: customerPhone,
        email: customerEmail,
        accountType,
      },
      vehicle: {
        make: vehicleMake,
        model: vehicleModel,
        year: vehicleYear,
        engine: vehicleEngine,
        transmission: vehicleTransmission,
        licensePlate: vehiclePlate,
      },
      vin: vin.trim() || undefined,
      mileage: Number(mileage) || 0,
      mileageUnit,
      complaint: complaint || 'Customer reported vehicle operation concern.',
      inspection: {
        summary: inspectionSummary || 'Visual and electronic inspection completed.',
        visualCondition: inspectionVisual,
        safetyPassed,
        batteryStatus: initialCard?.inspection.batteryStatus || '12.6V (Good)',
        tiresCondition: initialCard?.inspection.tiresCondition || '5.5mm (Good)',
        brakesCondition: initialCard?.inspection.brakesCondition || '6.0mm (Pass)',
        fluidLevels: initialCard?.inspection.fluidLevels || 'Nominal',
        leaksObserved: initialCard?.inspection.leaksObserved || 'None detected',
      },
      diagnosis: {
        rootCause: diagnosisRootCause || 'Under review.',
        dtcCodes: dtcArray,
        symptoms: initialCard?.diagnosis.symptoms || [complaint],
        leadTechnician,
        confirmedDate: new Date().toISOString(),
      },
      repair: {
        procedureTitle: repairTitle || 'Standard Repair Operation',
        procedureSummary: repairSummary || 'Execution per factory repair service manual.',
        steps: initialCard?.repair.steps || [
          { id: 's1', text: 'Safety intake inspection and lift positioning', completed: true },
          { id: 's2', text: 'Component renewal and torque verification', completed: false },
          { id: 's3', text: 'System bleed, road test, and code clearing', completed: false },
        ],
        estimatedHours: Number(estimatedHours) || 2.0,
        actualHours: initialCard?.repair.actualHours || 0,
        difficulty: initialCard?.repair.difficulty || 'Intermediate',
      },
      parts,
      labor,
      notes: updatedNotes,
      status,
      measurements: initialCard?.measurements || {
        frontLeftRotorMm: 26.2,
        frontRightRotorMm: 26.5,
        rearLeftRotorMm: 11.8,
        rearRightRotorMm: 11.9,
        rotorMinThicknessMm: 25.0,
        frontLeftPadMm: 4.5,
        frontRightPadMm: 4.8,
        rearLeftPadMm: 7.0,
        rearRightPadMm: 7.2,
        padMinThicknessMm: 3.0,
        tireFL_mm: 5.5,
        tireFR_mm: 5.6,
        tireRL_mm: 6.2,
        tireRR_mm: 6.3,
        tireMinTreadMm: 3.0,
        tirePressurePsi: { fl: 34, fr: 34, rl: 33, rr: 33 },
        batteryVoltage: 12.62,
        batteryCcaActual: 595,
        batteryCcaRated: 600,
        batteryHealthPct: 98,
        brakeFluidMoisturePct: 1.8,
        coolantFreezePointC: -37,
      },
      photos: initialCard?.photos || [],
      history: initialCard?.history || [],
      priority,
      bay,
      serviceAdvisor: initialCard?.serviceAdvisor || 'Service Advisor',
    };

    onSave(cardToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-surface-container rounded-2xl border border-white/10 shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container-high border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-container/20 text-primary-container">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                {initialCard
                  ? `${lang === 'ar' ? 'تعديل بطاقة العمل' : 'Edit Job Card'} #${initialCard.id}`
                  : lang === 'ar'
                  ? 'إنشاء بطاقة عمل جديدة'
                  : 'Create New Job Card'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                {lang === 'ar'
                  ? 'سجل العميل والمركبة والأعطال والفحص وقطع الغيار وساعات العمل'
                  : 'Customer, Vehicle, Complaint, Inspection, Diagnosis, Repair & Parts'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-bright text-outline hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Status Selector Bar (Immediate One-Click Switching) */}
        <div className="px-6 py-3 bg-surface-container-lowest border-b border-white/5 flex flex-wrap items-center gap-2">
          <span className="font-code-sm text-xs text-outline uppercase font-semibold pe-2">
            {lang === 'ar' ? 'حالة الطلب:' : 'Job Status:'}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {ALL_STATUSES.map((s) => {
              const cfg = JOB_STATUS_CONFIG[s];
              const isSelected = status === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-code-sm text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? `${cfg.bg} ${cfg.color} border ${cfg.border} shadow-[0_0_12px_rgba(0,240,255,0.25)] scale-105`
                      : 'bg-surface-container-low text-outline hover:text-on-surface hover:bg-surface-container-high border border-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                  <span>{lang === 'ar' ? cfg.labelAr : cfg.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Tabs inside Form */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-surface-container-low border-b border-white/5 overflow-x-auto text-xs font-code-sm">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">directions_car</span>
            <span>{lang === 'ar' ? 'العميل والمركبة' : 'Customer & Vehicle'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diagnosis')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'diagnosis'
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">account_tree</span>
            <span>{lang === 'ar' ? 'الشكوى والفحص والتشخيص' : 'Complaint & Diagnosis'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('repair')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'repair'
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">handyman</span>
            <span>{lang === 'ar' ? 'خطة الإصلاح والملاحظات' : 'Repair & Notes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parts_labor')}
            className={`pb-2.5 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'parts_labor'
                ? 'border-primary-container text-primary-container'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">inventory_2</span>
            <span>{lang === 'ar' ? 'قطع الغيار وساعات العمل' : 'Parts & Labor'}</span>
            <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-[10px]">
              {parts.length + labor.length}
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CUSTOMER & VEHICLE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Customer Section */}
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-code-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">person</span>
                    <span>{lang === 'ar' ? 'بيانات العميل' : 'Customer Details'}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    {(['Private', 'Fleet', 'Commercial'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAccountType(t)}
                        className={`px-2.5 py-1 rounded text-[11px] font-code-sm font-semibold transition-colors cursor-pointer ${
                          accountType === t
                            ? 'bg-primary-container text-on-primary-container'
                            : 'bg-surface-container text-outline hover:text-on-surface'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">
                      {lang === 'ar' ? 'اسم العميل *' : 'Customer Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Marcus Vance"
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">
                      {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Section */}
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-4">
                <h4 className="font-code-sm text-xs font-bold text-secondary-fixed uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">directions_car</span>
                  <span>{lang === 'ar' ? 'بيانات المركبة' : 'Vehicle Specifications'}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Make</label>
                    <input
                      type="text"
                      required
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Model</label>
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Year</label>
                    <input
                      type="text"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">License Plate</label>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      placeholder="e.g. 7XYZ892"
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Engine / Powertrain</label>
                    <input
                      type="text"
                      value={vehicleEngine}
                      onChange={(e) => setVehicleEngine(e.target.value)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Transmission</label>
                    <input
                      type="text"
                      value={vehicleTransmission}
                      onChange={(e) => setVehicleTransmission(e.target.value)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-code-sm text-xs text-outline">
                        VIN <span className="text-outline-variant font-normal">({lang === 'ar' ? 'اختياري' : 'Optional'})</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setVin('4T1B11HK5MU192834')}
                        className="text-[10px] text-primary-container hover:underline cursor-pointer"
                      >
                        Sample VIN
                      </button>
                    </div>
                    <input
                      type="text"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      placeholder="e.g. 4T1B11HK5MU192834 (17 characters)"
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm font-mono tracking-wider border border-white/10 focus:border-primary-container focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-code-sm text-xs text-outline">Mileage *</label>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setMileageUnit('km')}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            mileageUnit === 'km' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-outline'
                          }`}
                        >
                          KM
                        </button>
                        <button
                          type="button"
                          onClick={() => setMileageUnit('mi')}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            mileageUnit === 'mi' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-outline'
                          }`}
                        >
                          MI
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      required
                      value={mileage}
                      onChange={(e) => setMileage(Number(e.target.value))}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm font-mono border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                </div>

                {/* Priority & Bay */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:outline-none"
                    >
                      <option value="Standard">Standard Priority</option>
                      <option value="Urgent">Urgent Service</option>
                      <option value="Safety Critical">Safety Critical (Do Not Drive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Assigned Bay</label>
                    <input
                      type="text"
                      value={bay}
                      onChange={(e) => setBay(e.target.value)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLAINT, INSPECTION, DIAGNOSIS */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-6">
              {/* Complaint */}
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <h4 className="font-code-sm text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">report_problem</span>
                  <span>{lang === 'ar' ? 'شكوى العميل والأعراض' : 'Customer Complaint / Stated Symptoms'}</span>
                </h4>
                <textarea
                  rows={3}
                  required
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="Describe customer's stated symptoms, abnormal noises, warnings, or operating conditions..."
                  className="w-full bg-surface-container text-on-surface rounded-lg p-3 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none leading-relaxed"
                />
              </div>

              {/* Inspection */}
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-code-sm text-xs font-bold text-secondary-fixed uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">search_check</span>
                    <span>{lang === 'ar' ? 'الفحص البصري الأولي' : 'Intake & Visual Inspection'}</span>
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-code-sm">
                    <input
                      type="checkbox"
                      checked={safetyPassed}
                      onChange={(e) => setSafetyPassed(e.target.checked)}
                      className="accent-primary-container h-4 w-4"
                    />
                    <span className={safetyPassed ? 'text-emerald-400 font-bold' : 'text-error font-bold'}>
                      {safetyPassed ? 'Safety Inspection Passed' : 'Safety Attention Required'}
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Visual Condition Rating</label>
                    <select
                      value={inspectionVisual}
                      onChange={(e) => setInspectionVisual(e.target.value as any)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:outline-none"
                    >
                      <option value="Good">Good (No critical concerns)</option>
                      <option value="Fair">Fair (Wear within normal service limits)</option>
                      <option value="Requires Attention">Requires Attention (Repair recommended)</option>
                      <option value="Dangerous">Dangerous (Safety hazard)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Lead Diagnostic Tech</label>
                    <input
                      type="text"
                      value={leadTechnician}
                      onChange={(e) => setLeadTechnician(e.target.value)}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-code-sm text-xs text-outline mb-1">Inspection Findings Summary</label>
                  <textarea
                    rows={2}
                    value={inspectionSummary}
                    onChange={(e) => setInspectionSummary(e.target.value)}
                    placeholder="Enter technician notes on body, fluids, brakes, tires, and battery state..."
                    className="w-full bg-surface-container text-on-surface rounded-lg p-3 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                  />
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <h4 className="font-code-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">account_tree</span>
                  <span>{lang === 'ar' ? 'التشخيص وتحديد السبب الجذري' : 'Diagnosis & Root Cause Verification'}</span>
                </h4>

                <div>
                  <label className="block font-code-sm text-xs text-outline mb-1">
                    Confirmed Root Cause / Diagnosis
                  </label>
                  <textarea
                    rows={2}
                    value={diagnosisRootCause}
                    onChange={(e) => setDiagnosisRootCause(e.target.value)}
                    placeholder="Document exact component failure mode and testing method used to confirm..."
                    className="w-full bg-surface-container text-on-surface rounded-lg p-3 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-code-sm text-xs text-outline mb-1">
                    Active Diagnostic Trouble Codes (DTCs) <span className="text-outline-variant font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={diagnosisDtcs}
                    onChange={(e) => setDiagnosisDtcs(e.target.value)}
                    placeholder="e.g. P0301, P0171, P0420"
                    className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm font-mono uppercase tracking-wider border border-white/10 focus:border-primary-container focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REPAIR & NOTES */}
          {activeTab === 'repair' && (
            <div className="space-y-6">
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <h4 className="font-code-sm text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">handyman</span>
                  <span>{lang === 'ar' ? 'خطة وإجراءات الإصلاح' : 'Repair Procedure Scope'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-code-sm text-xs text-outline mb-1">Procedure Title</label>
                    <input
                      type="text"
                      value={repairTitle}
                      onChange={(e) => setRepairTitle(e.target.value)}
                      placeholder="e.g. Cylinder 1 Direct Fuel Injector Replacement"
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-code-sm text-xs text-outline mb-1">Estimated Labor Hours</label>
                    <input
                      type="number"
                      step="0.25"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(Number(e.target.value))}
                      className="w-full bg-surface-container text-on-surface rounded-lg px-3 py-2 text-xs font-code-sm font-mono border border-white/10 focus:border-primary-container focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-code-sm text-xs text-outline mb-1">Procedure Summary & Technical Steps</label>
                  <textarea
                    rows={3}
                    value={repairSummary}
                    onChange={(e) => setRepairSummary(e.target.value)}
                    placeholder="Outline step-by-step disassembly, torque specifications, and clearance verifications..."
                    className="w-full bg-surface-container text-on-surface rounded-lg p-3 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <h4 className="font-code-sm text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">notes</span>
                  <span>{lang === 'ar' ? 'ملاحظة فورية جديدة' : 'Add Work Note / Memo'}</span>
                </h4>
                <textarea
                  rows={2}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add internal technician remark, customer authorization note, or road test findings..."
                  className="w-full bg-surface-container text-on-surface rounded-lg p-3 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PARTS & LABOR */}
          {activeTab === 'parts_labor' && (
            <div className="space-y-6">
              {/* Parts */}
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-code-sm text-xs font-bold text-tertiary-container uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">inventory_2</span>
                    <span>{lang === 'ar' ? 'قطع الغيار والمواد المطلوبة' : 'Required Parts & Materials'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary-container font-code-sm text-xs font-bold border border-primary-container/30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>{lang === 'ar' ? 'إضافة قطعة' : 'Add Part'}</span>
                  </button>
                </div>

                {parts.length === 0 ? (
                  <p className="text-xs text-outline py-4 text-center italic bg-surface-container/50 rounded-lg">
                    No parts added yet. Click "+ Add Part" above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {parts.map((part) => (
                      <div
                        key={part.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-surface-container rounded-lg border border-white/5 items-center text-xs font-code-sm"
                      >
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={part.partNumber}
                            onChange={(e) => handleUpdatePart(part.id, 'partNumber', e.target.value)}
                            placeholder="Part SKU"
                            className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-white/10 font-mono text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={part.description}
                            onChange={(e) => handleUpdatePart(part.id, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-white/10 text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <input
                            type="number"
                            min="1"
                            value={part.quantity}
                            onChange={(e) => handleUpdatePart(part.id, 'quantity', Number(e.target.value))}
                            className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-white/10 font-mono text-center text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            step="0.5"
                            value={part.unitPrice}
                            onChange={(e) => handleUpdatePart(part.id, 'unitPrice', Number(e.target.value))}
                            placeholder="Price"
                            className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-white/10 font-mono text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-end gap-2">
                          <span className="font-mono text-cyan-300 font-bold text-[11px]">
                            ${(part.quantity * part.unitPrice).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(part.id)}
                            className="text-error hover:text-error-container p-1 cursor-pointer"
                            title="Remove Part"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Labor */}
              <div className="bg-surface-container-low p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-code-sm text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span>{lang === 'ar' ? 'ساعات العمل والفني المكلف' : 'Labor Operations & Tech Hours'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLabor}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary-container font-code-sm text-xs font-bold border border-primary-container/30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>{lang === 'ar' ? 'إضافة عملية' : 'Add Labor'}</span>
                  </button>
                </div>

                {labor.length === 0 ? (
                  <p className="text-xs text-outline py-4 text-center italic bg-surface-container/50 rounded-lg">
                    No labor operations recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {labor.map((lbr) => (
                      <div
                        key={lbr.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-surface-container rounded-lg border border-white/5 items-center text-xs font-code-sm"
                      >
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={lbr.description}
                            onChange={(e) => handleUpdateLabor(lbr.id, 'description', e.target.value)}
                            placeholder="Labor description"
                            className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-white/10 text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <input
                            type="text"
                            value={lbr.technician}
                            onChange={(e) => handleUpdateLabor(lbr.id, 'technician', e.target.value)}
                            placeholder="Technician"
                            className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-white/10 text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <input
                            type="number"
                            step="0.25"
                            value={lbr.hours}
                            onChange={(e) => handleUpdateLabor(lbr.id, 'hours', Number(e.target.value))}
                            className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-white/10 font-mono text-center text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <input
                            type="number"
                            step="5"
                            value={lbr.hourlyRate}
                            onChange={(e) => handleUpdateLabor(lbr.id, 'hourlyRate', Number(e.target.value))}
                            className="w-full bg-surface-container-lowest text-on-surface px-2 py-1 rounded border border-white/10 font-mono text-[11px]"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-end gap-2">
                          <span className="font-mono text-cyan-300 font-bold text-[11px]">
                            ${(lbr.hours * lbr.hourlyRate).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLabor(lbr.id)}
                            className="text-error hover:text-error-container p-1 cursor-pointer"
                            title="Remove Labor"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface font-code-sm text-xs transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>{initialCard ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (lang === 'ar' ? 'إنشاء بطاقة العمل' : 'Create Job Card')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
