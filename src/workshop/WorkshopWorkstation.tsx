import React, { useState, useEffect } from 'react';
import {
  JobCard,
  JobStatus,
  WorkshopPanel,
  JOB_STATUS_CONFIG,
  MeasurementRecord,
} from './workshopTypes';
import { WorkshopDatabase } from './workshopDatabase';
import { PrintableServiceReport } from './PrintableServiceReport';
import { JobCardModal } from './JobCardModal';
import { VehicleProfileData } from '../db/vehicleTypes';
import { Language } from '../types';

interface WorkshopWorkstationProps {
  lang: Language;
  activeVehicleProfile: VehicleProfileData;
  onSelectVehicleProfile: (profile: VehicleProfileData) => void;
  onNavigateTo3D?: () => void;
  onNavigateToRepair?: () => void;
  onNavigateToScanner?: () => void;
  onNavigateToTools?: () => void;
  onNavigateToElectrical?: () => void;
}

export const WorkshopWorkstation: React.FC<WorkshopWorkstationProps> = ({
  lang,
  activeVehicleProfile,
  onSelectVehicleProfile,
  onNavigateTo3D,
  onNavigateToRepair,
  onNavigateToScanner,
  onNavigateToTools,
  onNavigateToElectrical,
}) => {
  // Database state
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [activeJobId, setActiveJobId] = useState<string>('');
  const [activePanel, setActivePanel] = useState<WorkshopPanel>('vehicle');

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isJobCardModalOpen, setIsJobCardModalOpen] = useState(false);
  const [jobCardToEdit, setJobCardToEdit] = useState<JobCard | null>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

  // Workstation Live Labor Timer
  const [timerSeconds, setTimerSeconds] = useState(4820); // starts around 1h 20m for realism
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // New Note input state
  const [quickNoteText, setQuickNoteText] = useState('');

  // Editable measurements within panel
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [measurementsDraft, setMeasurementsDraft] = useState<MeasurementRecord | null>(null);

  // Load job cards on mount
  useEffect(() => {
    const loadedCards = WorkshopDatabase.getAllJobCards();
    setJobCards(loadedCards);
    const activeId = WorkshopDatabase.getActiveJobCardId();
    setActiveJobId(activeId);
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Current active job card
  const currentJob: JobCard =
    jobCards.find((c) => c.id === activeJobId) || jobCards[0] || WorkshopDatabase.getAllJobCards()[0];

  // Sync draft measurements when job card changes
  useEffect(() => {
    if (currentJob) {
      setMeasurementsDraft({ ...currentJob.measurements });
    }
  }, [currentJob?.id]);

  if (!currentJob) {
    return (
      <div className="p-8 text-center text-on-surface">
        <p>Loading Workshop Workstation...</p>
      </div>
    );
  }

  // Format timer
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Status progression
  const handleSetStatus = (newStatus: JobStatus) => {
    const updated = WorkshopDatabase.updateJobCardStatus(currentJob.id, newStatus);
    if (updated) {
      setJobCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
  };

  // Toggle step completion in repair panel
  const handleToggleStep = (stepId: string) => {
    const updatedSteps = currentJob.repair.steps.map((s) =>
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    const updatedCard: JobCard = {
      ...currentJob,
      repair: {
        ...currentJob.repair,
        steps: updatedSteps,
      },
    };
    WorkshopDatabase.saveJobCard(updatedCard);
    setJobCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  // Add work note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;

    const newNote = {
      id: `nt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: 'Lead Technician',
      role: 'Master Tech',
      content: quickNoteText.trim(),
      isCustomerVisible: true,
    };

    const updatedCard: JobCard = {
      ...currentJob,
      notes: [newNote, ...currentJob.notes],
    };
    WorkshopDatabase.saveJobCard(updatedCard);
    setJobCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    setQuickNoteText('');
  };

  // Save updated measurements
  const handleSaveMeasurements = () => {
    if (!measurementsDraft) return;
    const updatedCard: JobCard = {
      ...currentJob,
      measurements: measurementsDraft,
    };
    WorkshopDatabase.saveJobCard(updatedCard);
    setJobCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    setIsEditingMeasurements(false);
  };

  // Add sample photo
  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      {
        url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
        caption: 'Diagnostic Inspection: Fuel Rail and Spark Plug Well Bore',
        category: 'Inspection' as const,
      },
      {
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
        caption: 'New Component Verified: Precision Rotor Hub Surface Prep',
        category: 'Repair Progress' as const,
      },
      {
        url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        caption: 'Worn Friction Material Measuring Under Minimum Limit',
        category: 'Damaged Component' as const,
      },
    ];

    const pick = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    const newPhoto = {
      id: `pht-${Date.now()}`,
      url: pick.url,
      caption: pick.caption,
      category: pick.category,
      timestamp: new Date().toISOString(),
    };

    const updatedCard: JobCard = {
      ...currentJob,
      photos: [newPhoto, ...currentJob.photos],
    };
    WorkshopDatabase.saveJobCard(updatedCard);
    setJobCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  // Custom photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newPhoto = {
        id: `pht-up-${Date.now()}`,
        url: base64Url,
        caption: `Vehicle Intake Photo: ${file.name}`,
        category: 'Inspection' as const,
        timestamp: new Date().toISOString(),
      };
      const updatedCard: JobCard = {
        ...currentJob,
        photos: [newPhoto, ...currentJob.photos],
      };
      WorkshopDatabase.saveJobCard(updatedCard);
      setJobCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    };
    reader.readAsDataURL(file);
  };

  const statusConfig = JOB_STATUS_CONFIG[currentJob.status];
  const allStatuses: JobStatus[] = [
    'New',
    'Inspection',
    'Diagnosis',
    'Waiting Parts',
    'Repairing',
    'Testing',
    'Completed',
  ];

  const panelTabs: { id: WorkshopPanel; labelEn: string; labelAr: string; icon: string }[] = [
    { id: 'vehicle', labelEn: 'Vehicle', labelAr: 'المركبة', icon: 'directions_car' },
    { id: 'diagnostics', labelEn: 'Diagnostics', labelAr: 'التشخيص', icon: 'account_tree' },
    { id: 'repair', labelEn: 'Repair', labelAr: 'الإصلاح', icon: 'handyman' },
    { id: 'parts', labelEn: 'Parts', labelAr: 'قطع الغيار', icon: 'inventory_2' },
    { id: 'tools', labelEn: 'Tools', labelAr: 'العدد والأدوات', icon: 'build' },
    { id: 'measurements', labelEn: 'Measurements', labelAr: 'القياسات', icon: 'straighten' },
    { id: 'notes', labelEn: 'Notes', labelAr: 'الملاحظات', icon: 'notes' },
    { id: 'photos', labelEn: 'Photos', labelAr: 'الصور', icon: 'photo_camera' },
    { id: 'history', labelEn: 'History', labelAr: 'السجل', icon: 'history' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* WORKSTATION HUD HEADER BAR */}
      <section className="relative bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest rounded-2xl p-5 lg:p-6 border border-primary-container/30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 end-0 w-80 h-40 bg-primary-container/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 start-0 w-80 h-40 bg-secondary-container/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          {/* Workstation Title & Station Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-container/30 to-secondary-container/20 border border-primary-container/50 text-primary-container shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <span className="material-symbols-outlined text-3xl animate-pulse">precision_manufacturing</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded bg-primary-container/20 text-primary-container font-code-sm text-[11px] font-bold border border-primary-container/40 uppercase tracking-wider">
                  {lang === 'ar' ? 'وضع ورشة الصيانة المعتمدة' : 'MASTER WORKSHOP WORKSTATION'}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm text-[11px]">
                  {currentJob.bay}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-code-sm text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  CAN-BUS LIVE 500k
                </span>
              </div>

              <h1 className="font-headline-lg text-xl sm:text-2xl font-black text-on-surface tracking-tight uppercase flex items-center gap-2">
                <span>{currentJob.vehicle.year} {currentJob.vehicle.make} {currentJob.vehicle.model}</span>
                <span className="text-primary-container font-mono text-base font-normal">
                  [{currentJob.id}]
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Actions & Technician Work Timer */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
            {/* Live Labor Timer */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-container-high border border-white/10 shadow-inner">
              <span className="material-symbols-outlined text-primary-container text-lg">timer</span>
              <div className="flex flex-col">
                <span className="font-telemetry-label text-[9px] text-outline uppercase tracking-wider">
                  {lang === 'ar' ? 'عداد وقت العمل' : 'ACTIVE LABOR TIMER'}
                </span>
                <span className="font-mono text-sm font-bold text-on-surface tracking-wider">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isTimerRunning
                    ? 'text-amber-400 hover:bg-surface-bright'
                    : 'text-emerald-400 hover:bg-surface-bright'
                }`}
                title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
              >
                <span className="material-symbols-outlined text-base">
                  {isTimerRunning ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>

            {/* Switch Job Card Dropdown */}
            <div className="relative">
              <select
                value={activeJobId}
                onChange={(e) => {
                  setActiveJobId(e.target.value);
                  WorkshopDatabase.setActiveJobCardId(e.target.value);
                }}
                className="bg-surface-container text-primary-container font-code-sm text-xs rounded-xl px-3 py-2.5 pe-8 border border-white/10 appearance-none focus:outline-none focus:border-primary-container cursor-pointer font-bold"
              >
                {jobCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.vehicle.make} {c.vehicle.model} ({c.status})
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute end-2.5 top-2.5 text-primary-container pointer-events-none text-base">
                expand_more
              </span>
            </div>

            {/* Print Service Report CTA */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs font-bold transition-all border border-white/10 shadow-md cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base text-secondary">print</span>
              <span>{lang === 'ar' ? 'طباعة تقرير الصيانة' : 'Print Service Report'}</span>
            </button>

            {/* New Job Card CTA */}
            <button
              onClick={() => {
                setJobCardToEdit(null);
                setIsJobCardModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>{lang === 'ar' ? 'بطاقة عمل جديدة' : '+ New Job Card'}</span>
            </button>
          </div>
        </div>

        {/* INTERACTIVE WORKFLOW STATUS TIMELINE (ONE-CLICK STATUS SWITCHING) */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-code-sm text-xs text-outline uppercase font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary-container">alt_route</span>
              <span>{lang === 'ar' ? 'مراحل سير العمل' : 'WORKFLOW STATUS PIPELINE'}</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-code-sm text-outline">
                {lang === 'ar' ? 'المرحلة الحالية:' : 'Current Step:'}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                {lang === 'ar' ? statusConfig.labelAr : statusConfig.labelEn}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {allStatuses.map((s, idx) => {
              const cfg = JOB_STATUS_CONFIG[s];
              const isCurrent = currentJob.status === s;
              const isPast = cfg.step < statusConfig.step;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSetStatus(s)}
                  className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isCurrent
                      ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-primary-container/50 shadow-[0_0_15px_rgba(0,240,255,0.25)]`
                      : isPast
                      ? 'bg-surface-container/60 border-white/5 text-on-surface-variant hover:bg-surface-container-high'
                      : 'bg-surface-container-lowest/70 border-white/5 text-outline hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono text-[10px] font-bold text-outline">
                      0{idx + 1}
                    </span>
                    <span className="material-symbols-outlined text-base">
                      {isCurrent ? cfg.icon : isPast ? 'check_circle' : cfg.icon}
                    </span>
                  </div>
                  <span className="font-code-sm text-xs font-bold truncate">
                    {lang === 'ar' ? cfg.labelAr : cfg.labelEn}
                  </span>
                  <span className="text-[10px] text-outline truncate mt-0.5">
                    {lang === 'ar' ? cfg.descAr : cfg.descEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* DASHBOARD SECTION: (Active Vehicle, Current Job, Customer, Mileage, Symptoms, Diagnostic Status) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-md text-base sm:text-lg font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">dashboard</span>
            <span>{lang === 'ar' ? 'لوحة تحكم الورشة الميكانيكية' : 'Workstation Dashboard'}</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setJobCardToEdit(currentJob);
                setIsJobCardModalOpen(true);
              }}
              className="text-xs font-code-sm text-primary-container hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              <span>{lang === 'ar' ? 'تعديل بطاقة العمل' : 'Edit Active Job'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* CARD 1: ACTIVE VEHICLE */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 shadow-md flex flex-col justify-between space-y-2 hover:border-primary-container/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold tracking-wider">
                {lang === 'ar' ? 'المركبة النشطة' : 'ACTIVE VEHICLE'}
              </span>
              <span className="material-symbols-outlined text-primary-container text-base">directions_car</span>
            </div>
            <div>
              <h3 className="font-code-sm text-sm font-bold text-on-surface truncate">
                {currentJob.vehicle.year} {currentJob.vehicle.make}
              </h3>
              <p className="text-xs text-primary-container font-semibold truncate">
                {currentJob.vehicle.model} {currentJob.vehicle.trim || ''}
              </p>
            </div>
            <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-outline">
              <span>VIN:</span>
              <span className="font-bold text-on-surface truncate max-w-[120px]">
                {currentJob.vin ? currentJob.vin.slice(-8) : 'N/A'}
              </span>
            </div>
          </div>

          {/* CARD 2: CURRENT JOB */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 shadow-md flex flex-col justify-between space-y-2 hover:border-secondary/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold tracking-wider">
                {lang === 'ar' ? 'المهمة الحالية' : 'CURRENT JOB'}
              </span>
              <span className="material-symbols-outlined text-secondary text-base">receipt_long</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-bold text-secondary">
                  {currentJob.id}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  currentJob.priority === 'Urgent'
                    ? 'bg-amber-500/20 text-amber-300'
                    : currentJob.priority === 'Safety Critical'
                    ? 'bg-error-container text-on-error-container'
                    : 'bg-surface-container-high text-outline'
                }`}>
                  {currentJob.priority}
                </span>
              </div>
              <p className="text-xs text-on-surface font-medium truncate mt-0.5">
                {currentJob.repair.procedureTitle}
              </p>
            </div>
            <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-outline">
              <span>Bay:</span>
              <span className="text-on-surface font-semibold">{currentJob.bay}</span>
            </div>
          </div>

          {/* CARD 3: CUSTOMER */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 shadow-md flex flex-col justify-between space-y-2 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold tracking-wider">
                {lang === 'ar' ? 'العميل' : 'CUSTOMER'}
              </span>
              <span className="material-symbols-outlined text-on-surface text-base">person</span>
            </div>
            <div>
              <h3 className="font-code-sm text-sm font-bold text-on-surface truncate">
                {currentJob.customer.name}
              </h3>
              <p className="text-xs text-outline font-mono truncate">
                {currentJob.customer.phone || 'No phone'}
              </p>
            </div>
            <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-outline">
              <span>Type:</span>
              <span className="text-primary-container font-semibold">{currentJob.customer.accountType}</span>
            </div>
          </div>

          {/* CARD 4: MILEAGE */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 shadow-md flex flex-col justify-between space-y-2 hover:border-cyan-400/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold tracking-wider">
                {lang === 'ar' ? 'المسافة المقطوعة' : 'MILEAGE'}
              </span>
              <span className="material-symbols-outlined text-cyan-300 text-base">speed</span>
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-on-surface tracking-tight">
                  {currentJob.mileage.toLocaleString()}
                </span>
                <span className="text-xs text-cyan-300 font-bold uppercase">
                  {currentJob.mileageUnit}
                </span>
              </div>
              <p className="text-[11px] text-outline truncate">
                Next interval: {(currentJob.mileage + 10000).toLocaleString()} {currentJob.mileageUnit}
              </p>
            </div>
            <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-outline">
              <span>Delta:</span>
              <span className="text-emerald-400 font-semibold">+9,850 km</span>
            </div>
          </div>

          {/* CARD 5: SYMPTOMS */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 shadow-md flex flex-col justify-between space-y-2 hover:border-amber-400/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold tracking-wider">
                {lang === 'ar' ? 'الأعراض والشكوى' : 'SYMPTOMS'}
              </span>
              <span className="material-symbols-outlined text-amber-400 text-base">warning</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed italic">
                "{currentJob.complaint}"
              </p>
            </div>
            <div className="pt-1 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[10px] font-code-sm">
              <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                Misfire
              </span>
              <span className="bg-surface-container-high text-outline px-1.5 py-0.5 rounded">
                Brake Pulse
              </span>
            </div>
          </div>

          {/* CARD 6: DIAGNOSTIC STATUS */}
          <div className="bg-surface-container-low rounded-xl p-4 border border-white/5 shadow-md flex flex-col justify-between space-y-2 hover:border-error/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold tracking-wider">
                {lang === 'ar' ? 'حالة الفحص' : 'DIAGNOSTIC STATUS'}
              </span>
              <span className="material-symbols-outlined text-error text-base">troubleshoot</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                {currentJob.diagnosis.dtcCodes.length > 0 ? (
                  currentJob.diagnosis.dtcCodes.map((dtc) => (
                    <span
                      key={dtc}
                      className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-mono text-xs font-bold"
                    >
                      {dtc}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                    NO FAULTS
                  </span>
                )}
              </div>
              <p className="text-[11px] text-outline truncate mt-1">
                Monitors: 7/8 Ready
              </p>
            </div>
            <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-outline">
              <span>Health Score:</span>
              <span className="text-amber-400 font-bold">78% Nominal</span>
            </div>
          </div>
        </div>
      </section>

      {/* PANELS WORKBENCH NAVIGATION & CONTENT */}
      <section className="bg-surface-container-low rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        {/* Panel Tabs Header Bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-surface-container border-b border-white/5 overflow-x-auto">
          {panelTabs.map((tab) => {
            const isActive = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePanel(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-code-sm text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
                {tab.id === 'parts' && currentJob.parts.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isActive ? 'bg-black/20 text-on-primary-container' : 'bg-surface-container-high text-outline'
                  }`}>
                    {currentJob.parts.length}
                  </span>
                )}
                {tab.id === 'photos' && currentJob.photos.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isActive ? 'bg-black/20 text-on-primary-container' : 'bg-surface-container-high text-outline'
                  }`}>
                    {currentJob.photos.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* PANEL CONTENT BODY */}
        <div className="p-5 lg:p-6">
          {/* 1. VEHICLE PANEL */}
          {activePanel === 'vehicle' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {lang === 'ar' ? 'مواصفات المركبة وقدرات السوائل' : 'Vehicle Specifications & Factory Capacities'}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    VIN: {currentJob.vin || 'Not Provided'} • Plate: {currentJob.vehicle.licensePlate || 'N/A'} • Bay: {currentJob.bay}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onNavigateTo3D}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary-container font-code-sm text-xs font-semibold border border-primary-container/30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">view_in_ar</span>
                    <span>{lang === 'ar' ? 'فحص في 3D CAD' : 'View 3D Rig'}</span>
                  </button>
                </div>
              </div>

              {/* Spec Matrix Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Powertrain</span>
                  <p className="font-bold text-sm text-on-surface">{currentJob.vehicle.engine}</p>
                  <p className="text-xs text-primary-container font-mono">{currentJob.vehicle.transmission}</p>
                </div>

                <div className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Engine Oil Spec</span>
                  <p className="font-bold text-sm text-on-surface">SAE 0W-16 / 0W-20</p>
                  <p className="text-xs text-secondary font-mono">4.8 Liters (with filter)</p>
                </div>

                <div className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Wheel Lug Torque</span>
                  <p className="font-bold text-sm text-cyan-300 font-mono">103 Nm (76 lb-ft)</p>
                  <p className="text-xs text-outline">Star pattern / 21mm Socket</p>
                </div>

                <div className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-1">
                  <span className="font-telemetry-label text-[10px] text-outline uppercase">Tire Cold Pressure</span>
                  <p className="font-bold text-sm text-on-surface font-mono">Front: 35 PSI | Rear: 33 PSI</p>
                  <p className="text-xs text-outline">235/45R18 94V XL</p>
                </div>
              </div>

              {/* Fluids & Battery Deep Specs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-surface-container p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-code-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">opacity</span>
                    <span>Approved Factory Fluids</span>
                  </h4>
                  <ul className="space-y-2 text-xs divide-y divide-white/5">
                    <li className="flex justify-between pt-1.5">
                      <span className="text-outline">Engine Coolant:</span>
                      <span className="font-semibold text-on-surface">Toyota Super Long Life (Pink, 50/50 OAT) - 6.5L</span>
                    </li>
                    <li className="flex justify-between pt-1.5">
                      <span className="text-outline">Transmission Fluid:</span>
                      <span className="font-semibold text-on-surface">Toyota Genuine ATF WS (World Standard) - 7.5L</span>
                    </li>
                    <li className="flex justify-between pt-1.5">
                      <span className="text-outline">Brake Fluid:</span>
                      <span className="font-semibold text-on-surface">FMVSS No. 116 DOT 4 / DOT 5.1 Synthetic - 1.0L</span>
                    </li>
                    <li className="flex justify-between pt-1.5">
                      <span className="text-outline">Spark Plug Gap:</span>
                      <span className="font-mono font-bold text-primary-container">1.0 - 1.1 mm (Iridium Twin-Tip)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-surface-container p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-code-sm text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">battery_charging_full</span>
                    <span>Battery & Electrical Verification</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-outline uppercase block">Battery Group Size</span>
                      <span className="font-mono font-bold text-on-surface text-sm">Group 35 / LN2</span>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-outline uppercase block">Cold Cranking Amps</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">600 CCA Rated</span>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-outline uppercase block">Alternator Output</span>
                      <span className="font-mono font-bold text-on-surface text-sm">130 Amp Variable</span>
                    </div>
                    <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                      <span className="text-[10px] text-outline uppercase block">Resting Voltage</span>
                      <span className="font-mono font-bold text-primary-container text-sm">12.62 Volts (100%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DIAGNOSTICS PANEL */}
          {activePanel === 'diagnostics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {lang === 'ar' ? 'فحص الأعطال وترابط الأكواد وبيانات Freeze Frame' : 'Live DTC Scanner, Freeze Frame & Sensor PIDs'}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    ECU Protocol: ISO 15765-4 (CAN 11-bit 500kbps) • Active MIL: {currentJob.diagnosis.dtcCodes.length > 0 ? 'ON' : 'OFF'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onNavigateToScanner}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-error font-code-sm text-xs font-semibold border border-error/30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span>{lang === 'ar' ? 'فتح جناح OBD الكامل' : 'Open DTC Suite'}</span>
                  </button>
                </div>
              </div>

              {/* Active DTC Codes Card */}
              <div className="bg-surface-container p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                <h4 className="font-code-sm text-xs font-bold text-error uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>Active Stored Fault Codes</span>
                </h4>

                {currentJob.diagnosis.dtcCodes.length === 0 ? (
                  <p className="text-xs text-emerald-400 font-semibold py-2">
                    No active DTC codes recorded in powertrain ECU.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentJob.diagnosis.dtcCodes.map((dtc) => (
                      <div
                        key={dtc}
                        className="p-3 bg-surface-container-low rounded-lg border border-error/20 flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-base font-black text-error">{dtc}</span>
                          <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            CONFIRMED
                          </span>
                        </div>
                        <p className="text-xs text-on-surface font-medium">
                          {dtc === 'P0301'
                            ? 'Cylinder 1 Misfire Detected (Emission Failure)'
                            : dtc === 'P0171'
                            ? 'System Too Lean (Bank 1 Air-Fuel Ratio Imbalance)'
                            : 'Powertrain Calibration Fault'}
                        </p>
                        <p className="text-[11px] text-outline">
                          Confirmed cause: {currentJob.diagnosis.rootCause}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Freeze Frame & Live PIDs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-surface-container p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-code-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">terminal</span>
                    <span>Freeze Frame Snapshot Telemetry</span>
                  </h4>
                  <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-white/10 font-mono text-xs text-on-surface space-y-1.5">
                    <p className="text-primary-container font-bold">FRAME #01 - TRIGGERED BY {currentJob.diagnosis.dtcCodes[0] || 'MIL'}:</p>
                    <p className="text-outline">------------------------------------</p>
                    <p>ENGINE SPEED: <span className="text-emerald-400 font-bold">1,850 RPM</span></p>
                    <p>CALCULATED LOAD: <span className="text-amber-400 font-bold">44.2 %</span></p>
                    <p>SHORT TERM FUEL TRIM (B1): <span className="text-error font-bold">+18.4 %</span> (LEAN)</p>
                    <p>LONG TERM FUEL TRIM (B1): <span className="text-error font-bold">+12.1 %</span></p>
                    <p>FUEL RAIL PRESSURE: <span className="text-cyan-300 font-bold">14.5 MPa (145 Bar)</span></p>
                    <p>COOLANT TEMPERATURE: <span className="text-secondary font-bold">91 °C</span></p>
                    <p>VEHICLE SPEED: <span className="text-on-surface font-bold">64 km/h</span></p>
                  </div>
                </div>

                <div className="bg-surface-container p-4 sm:p-5 rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-code-sm text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">checklist</span>
                    <span>OBD-II Readiness Monitors (I/M Status)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-code-sm">
                    {[
                      { name: 'Misfire Monitor', status: 'Passed', ok: true },
                      { name: 'Fuel System', status: 'Passed', ok: true },
                      { name: 'Comprehensive Components', status: 'Passed', ok: true },
                      { name: 'Catalyst Monitor', status: 'Passed', ok: true },
                      { name: 'Evaporative System (EVAP)', status: 'Pending', ok: false },
                      { name: 'Oxygen Sensor Heater', status: 'Passed', ok: true },
                      { name: 'Oxygen Sensor Monitor', status: 'Passed', ok: true },
                      { name: 'EGR / VVT System', status: 'Passed', ok: true },
                    ].map((m) => (
                      <div
                        key={m.name}
                        className="p-2.5 bg-surface-container-low rounded-lg border border-white/5 flex items-center justify-between"
                      >
                        <span className="text-outline text-[11px] truncate">{m.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          m.ok ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. REPAIR PANEL */}
          {activePanel === 'repair' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {currentJob.repair.procedureTitle}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    Estimated Time: {currentJob.repair.estimatedHours}h • Actual Logged: {currentJob.repair.actualHours}h • Difficulty: {currentJob.repair.difficulty}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-code-sm text-outline">Progress:</span>
                  <span className="font-mono text-xs font-bold text-primary-container">
                    {Math.round(
                      (currentJob.repair.steps.filter((s) => s.completed).length /
                        Math.max(1, currentJob.repair.steps.length)) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>

              {/* Procedure Scope Summary */}
              <div className="p-4 bg-surface-container rounded-xl border border-white/5 space-y-1">
                <span className="font-telemetry-label text-[10px] text-outline uppercase font-bold">
                  PROCEDURE SUMMARY
                </span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {currentJob.repair.procedureSummary}
                </p>
              </div>

              {/* Interactive Step Checklist */}
              <div className="space-y-2">
                <h4 className="font-code-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-base">task_alt</span>
                  <span>Interactive Procedure Steps & Torque Specifications</span>
                </h4>

                {currentJob.repair.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    onClick={() => handleToggleStep(step.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      step.completed
                        ? 'bg-surface-container/60 border-emerald-500/20 text-on-surface'
                        : 'bg-surface-container border-white/5 hover:border-primary-container/30 text-on-surface'
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={step.completed}
                        onChange={() => {}} // handled by div click
                        className="h-4 w-4 accent-primary-container rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-outline">
                          STEP {idx + 1}
                        </span>
                        {step.completed && (
                          <span className="text-[10px] font-bold text-emerald-400 font-mono">
                            [DONE]
                          </span>
                        )}
                      </div>
                      <p className={`font-medium ${step.completed ? 'line-through text-outline' : 'text-on-surface'}`}>
                        {step.text}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {step.torque && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-container/10 border border-primary-container/30 text-primary-container font-mono text-[11px] font-bold">
                            <span className="material-symbols-outlined text-xs">build</span>
                            <span>{step.torque}</span>
                          </span>
                        )}
                        {step.specialTool && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container/20 border border-secondary-container/30 text-secondary-fixed font-code-sm text-[11px]">
                            <span className="material-symbols-outlined text-xs">construction</span>
                            <span>SST: {step.specialTool}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PARTS PANEL */}
          {activePanel === 'parts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {lang === 'ar' ? 'طلب وصرف قطع الغيار المعتمدة' : 'Parts Requisition & Inventory Tracking'}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    {currentJob.parts.length} item(s) staged for {currentJob.id}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setJobCardToEdit(currentJob);
                    setIsJobCardModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>{lang === 'ar' ? 'إضافة قطعة' : '+ Add / Manage Parts'}</span>
                </button>
              </div>

              {/* Parts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-surface-container font-code-sm text-outline">
                      <th className="py-2.5 px-3">Part SKU / Number</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Supplier</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-code-sm">
                    {currentJob.parts.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-container transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-primary-container">{p.partNumber}</td>
                        <td className="py-3 px-3 text-on-surface font-medium">{p.description}</td>
                        <td className="py-3 px-3 text-outline">{p.supplier}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'In Stock'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : p.status === 'Arrived'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-on-surface">{p.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono text-outline">${p.unitPrice.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-on-surface">
                          ${(p.quantity * p.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-white/10 font-code-sm font-bold">
                      <td colSpan={6} className="py-3 px-3 text-right text-outline uppercase">
                        Total Parts Cost:
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-primary-container text-sm">
                        $
                        {currentJob.parts
                          .reduce((s, p) => s + p.quantity * p.unitPrice, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 5. TOOLS PANEL */}
          {activePanel === 'tools' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {lang === 'ar' ? 'العدد المعتمدة ومواصفات عزم الشد' : 'Approved Shop Equipment & Precision Torque Reference'}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    ISO-6789 Calibration Verified • 3/8" & 1/2" Drive Calibrated Wrenches
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {onNavigateToTools && (
                    <button
                      type="button"
                      onClick={onNavigateToTools}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-code-sm text-xs font-bold border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">calculate</span>
                      <span>
                        {lang === 'ar' ? 'حاسبات السيارات (13 أداة)' : 'Calculators (13 Tools)'}
                      </span>
                    </button>
                  )}

                  {onNavigateToElectrical && (
                    <button
                      type="button"
                      onClick={onNavigateToElectrical}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-code-sm text-xs font-bold border border-amber-400/30 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">schema</span>
                      <span>
                        {lang === 'ar' ? 'مستكشف الدوائر الكهربائية (10 أنظمة)' : 'Electrical Wiring (10 Systems)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tools list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'Digital Torque Wrench (10-100 Nm)', spec: '3/8" Drive ±2% accuracy', cal: 'Calibrated: Sep 2026', icon: 'handyman' },
                  { name: 'Heavy Torque Wrench (50-250 Nm)', spec: '1/2" Drive for wheel lugs', cal: 'Calibrated: Aug 2026', icon: 'build' },
                  { name: 'Toyota SST Injector Puller (09268-31014)', spec: 'Direct injection extractor', cal: 'OEM Certified', icon: 'construction' },
                  { name: 'Fluke 87V Industrial Multimeter', spec: 'CAT III 1000V / True-RMS', cal: 'Calibrated: Jul 2026', icon: 'speed' },
                  { name: 'Brake Caliper Piston Compressor', spec: 'Universal quad-piston adapter', cal: 'Shop Standard', icon: 'tune' },
                  { name: 'Nitrile Heavy-Duty Safety Gloves & Eyewear', spec: 'ANSI Z87.1 Splash Protection', cal: 'OSHA / PPE', icon: 'security' },
                ].map((t) => (
                  <div key={t.name} className="p-3.5 bg-surface-container rounded-xl border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="material-symbols-outlined text-primary-container text-xl">{t.icon}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {t.cal}
                      </span>
                    </div>
                    <p className="font-code-sm text-xs font-bold text-on-surface">{t.name}</p>
                    <p className="text-[11px] text-outline font-mono">{t.spec}</p>
                  </div>
                ))}
              </div>

              {/* Fast Torque Table */}
              <div className="p-4 sm:p-5 bg-surface-container rounded-xl border border-white/5 space-y-3">
                <h4 className="font-code-sm text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">compress</span>
                  <span>Vehicle Torque Master Cheat-Sheet</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-code-sm">
                  <div className="p-2.5 bg-surface-container-low rounded-lg border border-white/5">
                    <span className="text-[10px] text-outline block">Wheel Lug Nuts</span>
                    <span className="font-mono font-bold text-primary-container text-sm">103 Nm (76 lb-ft)</span>
                  </div>
                  <div className="p-2.5 bg-surface-container-low rounded-lg border border-white/5">
                    <span className="text-[10px] text-outline block">Caliper Bracket Bolts</span>
                    <span className="font-mono font-bold text-on-surface text-sm">107 Nm (79 lb-ft)</span>
                  </div>
                  <div className="p-2.5 bg-surface-container-low rounded-lg border border-white/5">
                    <span className="text-[10px] text-outline block">Caliper Slide Pins</span>
                    <span className="font-mono font-bold text-on-surface text-sm">34 Nm (25 lb-ft)</span>
                  </div>
                  <div className="p-2.5 bg-surface-container-low rounded-lg border border-white/5">
                    <span className="text-[10px] text-outline block">Oil Drain Plug</span>
                    <span className="font-mono font-bold text-secondary text-sm">40 Nm (30 lb-ft)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. MEASUREMENTS PANEL */}
          {activePanel === 'measurements' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {lang === 'ar' ? 'سجل القياسات الميكانيكية والفنية' : 'Precision Mechanical & Wear Measurements'}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    Brake Rotor Thickness, Friction Pad Material, Tire Tread Depth & Battery Health
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isEditingMeasurements ? (
                    <>
                      <button
                        onClick={() => setIsEditingMeasurements(false)}
                        className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-outline text-xs font-code-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveMeasurements}
                        className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-code-sm font-bold shadow-md cursor-pointer"
                      >
                        Save Measurements
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingMeasurements(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary-container text-xs font-code-sm font-bold border border-primary-container/30 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">tune</span>
                      <span>Update Readings</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 4-Corner Brake Rotors & Pads Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    corner: 'Front Left',
                    rotor: currentJob.measurements.frontLeftRotorMm,
                    rotorMin: currentJob.measurements.rotorMinThicknessMm,
                    pad: currentJob.measurements.frontLeftPadMm,
                    padMin: currentJob.measurements.padMinThicknessMm,
                  },
                  {
                    corner: 'Front Right',
                    rotor: currentJob.measurements.frontRightRotorMm,
                    rotorMin: currentJob.measurements.rotorMinThicknessMm,
                    pad: currentJob.measurements.frontRightPadMm,
                    padMin: currentJob.measurements.padMinThicknessMm,
                  },
                  {
                    corner: 'Rear Left',
                    rotor: currentJob.measurements.rearLeftRotorMm,
                    rotorMin: 10.5,
                    pad: currentJob.measurements.rearLeftPadMm,
                    padMin: currentJob.measurements.padMinThicknessMm,
                  },
                  {
                    corner: 'Rear Right',
                    rotor: currentJob.measurements.rearRightRotorMm,
                    rotorMin: 10.5,
                    pad: currentJob.measurements.rearRightPadMm,
                    padMin: currentJob.measurements.padMinThicknessMm,
                  },
                ].map((b) => {
                  const isPadLow = b.pad <= b.padMin + 0.5;
                  return (
                    <div key={b.corner} className="p-4 bg-surface-container rounded-xl border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-code-sm text-xs font-bold text-on-surface uppercase">
                          {b.corner}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isPadLow ? 'bg-error-container text-on-error-container' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isPadLow ? 'REPLACE PAD' : 'PASS'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-code-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-outline">Rotor Thickness:</span>
                          <span className="font-mono font-bold text-on-surface">{b.rotor} mm</span>
                        </div>
                        <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary-container h-full rounded-full"
                            style={{ width: `${Math.min(100, (b.rotor / (b.rotorMin + 3)) * 100)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span className="text-outline">Brake Pad Lining:</span>
                          <span className={`font-mono font-bold ${isPadLow ? 'text-error' : 'text-emerald-400'}`}>
                            {b.pad} mm
                          </span>
                        </div>
                        <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPadLow ? 'bg-error' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(100, (b.pad / 10) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-outline block text-right">
                          Min Limit: {b.padMin} mm
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tires & Battery */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Tire Tread */}
                <div className="p-4 sm:p-5 bg-surface-container rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-code-sm text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">tire_repair</span>
                    <span>Tire Tread Depth & Pressure Log</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-code-sm">
                    {[
                      { pos: 'FL', tread: currentJob.measurements.tireFL_mm, psi: currentJob.measurements.tirePressurePsi.fl },
                      { pos: 'FR', tread: currentJob.measurements.tireFR_mm, psi: currentJob.measurements.tirePressurePsi.fr },
                      { pos: 'RL', tread: currentJob.measurements.tireRL_mm, psi: currentJob.measurements.tirePressurePsi.rl },
                      { pos: 'RR', tread: currentJob.measurements.tireRR_mm, psi: currentJob.measurements.tirePressurePsi.rr },
                    ].map((t) => (
                      <div key={t.pos} className="p-3 bg-surface-container-low rounded-lg border border-white/5 text-center space-y-1">
                        <span className="font-bold text-on-surface uppercase text-xs block">{t.pos}</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm block">{t.tread} mm</span>
                        <span className="text-[10px] font-mono text-outline block">{t.psi} PSI</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Battery & Fluids */}
                <div className="p-4 sm:p-5 bg-surface-container rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-code-sm text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">science</span>
                    <span>Battery Load Test & Fluid Test Strips</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs font-code-sm">
                    <div className="p-3 bg-surface-container-low rounded-lg border border-white/5">
                      <span className="text-[10px] text-outline uppercase block">Battery SOH</span>
                      <span className="font-mono font-bold text-emerald-400 text-base">
                        {currentJob.measurements.batteryHealthPct}% (Good)
                      </span>
                      <span className="text-[10px] text-outline block">
                        {currentJob.measurements.batteryCcaActual} CCA / {currentJob.measurements.batteryCcaRated} CCA
                      </span>
                    </div>

                    <div className="p-3 bg-surface-container-low rounded-lg border border-white/5">
                      <span className="text-[10px] text-outline uppercase block">Brake Fluid Moisture</span>
                      <span className="font-mono font-bold text-amber-400 text-base">
                        {currentJob.measurements.brakeFluidMoisturePct}%
                      </span>
                      <span className="text-[10px] text-outline block">Recommend Flush &gt; 3.0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. NOTES PANEL */}
          {activePanel === 'notes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {lang === 'ar' ? 'سجل ملاحظات الفنيين والمراسلات' : 'Technician Work Log & Service Notes'}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    Timestamped mechanic notes and customer communication records
                  </p>
                </div>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  placeholder="Type technician observation or note (e.g. 'Test drive verified no brake vibration')..."
                  className="flex-1 bg-surface-container text-on-surface rounded-xl px-4 py-2.5 text-xs font-code-sm border border-white/10 focus:border-primary-container focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-code-sm text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
                >
                  Add Note
                </button>
              </form>

              {/* Notes Timeline List */}
              <div className="space-y-3">
                {currentJob.notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-surface-container rounded-xl border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-code-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary-container">{note.author}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container-high text-outline">
                          {note.role}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-outline">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. PHOTOS PANEL */}
          {activePanel === 'photos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {lang === 'ar' ? 'معرض صور الفحص والأدلة البصرية' : 'Inspection Evidence & Repair Photo Gallery'}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    Intake photos, damaged component evidence, and completed work proof
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs font-semibold border border-white/10 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleAddSamplePhoto}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-code-sm text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                    <span>Add Preset Photo</span>
                  </button>
                </div>
              </div>

              {/* Photo Grid */}
              {currentJob.photos.length === 0 ? (
                <div className="p-12 text-center bg-surface-container/40 rounded-xl border border-dashed border-white/10 space-y-2">
                  <span className="material-symbols-outlined text-4xl text-outline">photo_camera</span>
                  <p className="text-xs text-outline">No photos attached yet. Click "Upload Photo" or "Add Preset Photo".</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentJob.photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedPhotoUrl(photo.url)}
                      className="group relative bg-surface-container rounded-xl overflow-hidden border border-white/5 shadow-md cursor-pointer hover:border-primary-container/40 transition-all"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-black">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-code-sm">
                          <span className="px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container font-bold uppercase">
                            {photo.category}
                          </span>
                          <span className="text-outline">
                            {new Date(photo.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface font-medium line-clamp-2">
                          {photo.caption}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 9. HISTORY PANEL */}
          {activePanel === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div>
                  <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface">
                    {lang === 'ar' ? 'سجل الصيانة والزيارات السابقة للمركبة' : 'Vehicle Service History & Warranty Records'}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">
                    Complete historical log of factory maintenance, diagnostics, and repairs
                  </p>
                </div>
              </div>

              {/* History Timeline */}
              <div className="space-y-3">
                {currentJob.history.length === 0 ? (
                  <p className="text-xs text-outline py-6 text-center italic">
                    No prior service records found for this VIN in the local workshop database.
                  </p>
                ) : (
                  currentJob.history.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-4 bg-surface-container rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary-container">
                            {hist.jobId}
                          </span>
                          <span className="text-outline text-xs">•</span>
                          <span className="font-mono text-xs text-outline">
                            {hist.date} ({hist.mileage.toLocaleString()} km)
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-surface-container-high text-on-surface">
                            {hist.status}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface font-medium">
                          {hist.serviceSummary}
                        </p>
                        <p className="text-[11px] text-outline">
                          Technician: {hist.technician}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-sm text-cyan-300">
                          ${hist.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PRINTABLE SERVICE REPORT MODAL */}
      <PrintableServiceReport
        jobCard={currentJob}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        lang={lang}
      />

      {/* JOB CARD CREATE / EDIT MODAL */}
      <JobCardModal
        isOpen={isJobCardModalOpen}
        onClose={() => setIsJobCardModalOpen(false)}
        initialCard={jobCardToEdit}
        activeVehicleProfile={activeVehicleProfile}
        lang={lang}
        onSave={(savedCard) => {
          WorkshopDatabase.saveJobCard(savedCard);
          const fresh = WorkshopDatabase.getAllJobCards();
          setJobCards(fresh);
          setActiveJobId(savedCard.id);
        }}
      />

      {/* PHOTO ZOOM MODAL */}
      {selectedPhotoUrl && (
        <div
          onClick={() => setSelectedPhotoUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20">
            <img
              src={selectedPhotoUrl}
              alt="Zoomed evidence"
              className="max-h-[85vh] w-auto object-contain"
            />
            <button
              onClick={() => setSelectedPhotoUrl(null)}
              className="absolute top-3 end-3 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
