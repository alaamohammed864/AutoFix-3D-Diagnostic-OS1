import React, { useState, useEffect } from 'react';
import { Language, NavPath, VehicleSpec, MaintenanceItem } from './types';
import { translations } from './data/translations';
import { mockVehicles, maintenanceItems } from './data/mockVehicles';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ThreeCanvas } from './components/ThreeCanvas';
import { DtcInspector } from './components/DtcInspector';
import { MaintenanceGrid } from './components/MaintenanceGrid';
import { SubsystemMatrices } from './components/SubsystemMatrices';
import { DiagnosticTreeModal } from './components/DiagnosticTreeModal';
import { ObdLogModal } from './components/ObdLogModal';
import { TorqueProcedureModal } from './components/TorqueProcedureModal';
import { CommandPalette } from './components/CommandPalette';
import { VideoGuideModal } from './components/VideoGuideModal';
import { VinScannerModal } from './components/VinScannerModal';
import { VehicleExplorer } from './components/VehicleExplorer';
import { DiagnosticEngineWizard } from './components/diagnostic/DiagnosticEngineWizard';
import { DtcModulePage } from './components/dtc/DtcModulePage';
import { MaintenanceCenterPage } from './components/maintenance/MaintenanceCenterPage';
import { RepairCenterPage } from './components/repair/RepairCenterPage';
import { AdminDataImportPage } from './components/admin/AdminDataImportPage';
import { VehicleProfileData } from './db/vehicleTypes';
import { VEHICLE_PROFILES } from './db/vehicleDatabase';
import { AutoFixAiView } from './ai/AutoFixAiView';
import { AutoFixAiModal } from './ai/AutoFixAiModal';
import { AutoFixAiFloatingButton } from './ai/AutoFixAiFloatingButton';
import { WorkshopWorkstation } from './workshop/WorkshopWorkstation';
import { AutomotiveCalculatorsPage } from './tools/AutomotiveCalculatorsPage';
import { ElectricalExplorerPage } from './electrical/ElectricalExplorerPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SecurityHubModal } from './components/security/SecurityHubModal';
import { NotFoundView } from './components/common/NotFoundView';
import { InternalServerErrorView } from './components/common/InternalServerErrorView';
import { OfflineState } from './components/common/OfflineState';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentPath, setCurrentPath] = useState<NavPath>('dashboard');
  const [currentVehicle, setCurrentVehicle] = useState<VehicleSpec>(mockVehicles.porsche992);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSecurityHubOpen, setIsSecurityHubOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Modals state
  const [isDiagnosticTreeOpen, setIsDiagnosticTreeOpen] = useState(false);
  const [isDiagnosticEngineOpen, setIsDiagnosticEngineOpen] = useState(false);
  const [diagnosticInitialSymptom, setDiagnosticInitialSymptom] = useState<string | undefined>(undefined);
  const [target3DComponentId, setTarget3DComponentId] = useState<string | null>(null);
  const [isObdLogOpen, setIsObdLogOpen] = useState(false);
  const [isTorqueModalOpen, setIsTorqueModalOpen] = useState(false);
  const [selectedMaintenanceItem, setSelectedMaintenanceItem] = useState<MaintenanceItem | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isVideoGuideOpen, setIsVideoGuideOpen] = useState(false);
  const [isVinScannerOpen, setIsVinScannerOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Live telemetry stream rate simulation
  const [streamRate, setStreamRate] = useState(20);
  const [activeFaultCount, setActiveFaultCount] = useState(1);
  const [activeVehicleProfile, setActiveVehicleProfile] = useState<VehicleProfileData>(VEHICLE_PROFILES[0]);

  const t = translations[lang];

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Small natural fluctuation on stream rate (19-21 Hz)
    const interval = setInterval(() => {
      setStreamRate(19 + Math.floor(Math.random() * 3));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleOpenProcedure = (item: MaintenanceItem) => {
    setSelectedMaintenanceItem(item);
    setIsTorqueModalOpen(true);
  };

  const handleCodeCleared = () => {
    setActiveFaultCount(0);
  };

  const handleVehicleChange = (key: string) => {
    if (mockVehicles[key]) {
      setCurrentVehicle(mockVehicles[key]);
    }
  };

  const handleLoadProfileToWorkshop = (profile: VehicleProfileData) => {
    setActiveVehicleProfile(profile);
    const spec: VehicleSpec = {
      make: profile.make,
      model: profile.model,
      year: String(profile.year),
      powertrain: profile.engine,
      drivetrain: profile.driveType,
      gearbox: profile.transmission,
      displacement: profile.displacement,
      engineOil: profile.fluids.find((f) => f.name.toLowerCase().includes('oil'))?.spec || '0W-16 / 0W-20',
      sparkGap: '0.040 in (1.0 mm)',
      wheelBoltTorque: profile.tires.wheelLugTorque,
      vin: profile.vinExample,
    };
    setCurrentVehicle(spec);
  };

  const handleNavigate = (path: NavPath) => {
    if (path === 'security-hub') {
      setIsSecurityHubOpen(true);
      return;
    }
    if (path === 'diagnostic-engine') {
      setIsDiagnosticEngineOpen(true);
      return;
    }
    if (path === 'powertrain-engine') {
      setTarget3DComponentId('engine-block');
      setCurrentPath('dashboard');
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
      return;
    }
    if (path === 'transmission-pdk') {
      setTarget3DComponentId('transmission-pdk');
      setCurrentPath('dashboard');
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
      return;
    }
    if (path === 'braking-abs') {
      setTarget3DComponentId('brake-caliper-fl');
      setCurrentPath('dashboard');
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
      return;
    }
    if (path === 'thermal-cooling') {
      setTarget3DComponentId('radiator-core');
      setCurrentPath('dashboard');
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
      return;
    }
    if (path === 'suspension-steering') {
      setTarget3DComponentId('strut-fl');
      setCurrentPath('dashboard');
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
      return;
    }
    if (path === 'fluid-specs') {
      setCurrentPath('service-schedules');
      return;
    }
    if (path === 'parts-catalog') {
      setCurrentPath('repair-guides');
      return;
    }
    if (path === '3d-telemetry-cad') {
      setCurrentPath('dashboard');
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }, 100);
      return;
    }
    setCurrentPath(path);
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container"
    >
      {/* Fixed Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        lang={lang}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenSecurityHub={() => setIsSecurityHubOpen(true)}
      />

      {/* Main App Container */}
      <div className="lg:ps-72 transition-all">
        {/* Top App Header */}
        <Header
          lang={lang}
          currentVehicle={currentVehicle}
          onToggleLang={setLang}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSwapVehicle={() => setIsVinScannerOpen(true)}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
          onOpenSecurityHub={() => setIsSecurityHubOpen(true)}
        />

        {/* Main Content Body */}
        <main className="w-full pt-20 px-4 sm:px-6 pb-16 space-y-8 max-w-[1600px] mx-auto">
          {/* TOP STATUS & STREAM TELEMETRY BAR */}
          <section className="w-full flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-lg relative overflow-hidden border border-white/5">
            <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-primary-container via-secondary to-primary-fixed"></div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 ps-2 min-w-0">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-container shadow-[0_0_8px_#00f0ff]"></span>
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-telemetry-label text-telemetry-label text-outline uppercase tracking-wider leading-tight">
                    {t.interfaceBus}
                  </span>
                  <span className="font-code-sm text-xs text-on-surface font-semibold truncate max-w-[180px]">
                    ISO 15765-4 CAN (CAN-FD)
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-white/10 hidden md:block shrink-0"></div>

              <div className="flex flex-col shrink-0 min-w-0">
                <span className="font-telemetry-label text-telemetry-label text-outline uppercase tracking-wider leading-tight">
                  {t.baudRate}
                </span>
                <span className="font-code-sm text-xs text-secondary font-medium">
                  500 kbps • 8.2 MB/s
                </span>
              </div>

              <div className="h-6 w-px bg-white/10 hidden md:block shrink-0"></div>

              <div className="flex flex-col shrink-0 min-w-0">
                <span className="font-telemetry-label text-telemetry-label text-outline uppercase tracking-wider leading-tight">
                  {t.ecuPolling}
                </span>
                <span className="font-code-sm text-xs text-on-surface">{t.allOk}</span>
              </div>

              <div className="h-6 w-px bg-white/10 hidden md:block shrink-0"></div>

              <div className="flex flex-col shrink-0 min-w-0">
                <span className="font-telemetry-label text-telemetry-label text-outline uppercase tracking-wider leading-tight">
                  {t.streamRate}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-telemetry-value-md text-telemetry-value-md text-primary-container leading-none">
                    {streamRate}
                  </span>
                  <span className="font-code-sm text-[10px] text-outline">Hz</span>
                </div>
              </div>
            </div>

            {/* Quick Tool Actions (Zero clutter, clean response) */}
            <div className="flex items-center gap-2.5 self-start xl:self-auto shrink-0 flex-wrap">
              <button
                onClick={() => setIsObdLogOpen(true)}
                className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-primary-container px-3 py-1.5 rounded-lg font-code-sm text-xs transition-colors shadow-sm border border-white/5 cursor-pointer whitespace-nowrap"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span>{t.obdLog}</span>
              </button>

              <button
                onClick={() => setIsVinScannerOpen(true)}
                className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-bright text-on-surface px-3 py-1.5 rounded-lg font-code-sm text-xs transition-colors border border-white/5 cursor-pointer whitespace-nowrap"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>{t.vinScan}</span>
              </button>
            </div>
          </section>

          {/* TOP PRIMARY NAVIGATION TABS (Dashboard vs. Vehicle Explorer vs. Diagnostic Engine) */}
          <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 p-2 bg-surface-container-lowest rounded-xl border border-white/5 overflow-hidden">
            {/* Scrollable / Flexible Navigation Items (Zero Collision) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none min-w-0 flex-1">
              <button
                onClick={() => setCurrentPath('dashboard')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                  currentPath === 'dashboard'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">speed</span>
                <span>{lang === 'ar' ? 'لوحة القياس 3D' : '3D Telemetry'}</span>
              </button>

              <button
                onClick={() => setCurrentPath('admin-dashboard')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                  currentPath === 'admin-dashboard'
                    ? 'bg-primary text-on-primary font-bold shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                    : 'bg-surface-container-high text-primary hover:text-on-surface hover:bg-surface-bright border border-primary/30'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">admin_panel_settings</span>
                <span>{lang === 'ar' ? 'لوحة المشرف' : 'Admin & Governance'}</span>
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase leading-none shrink-0">
                  16 SEC
                </span>
              </button>

              <button
                onClick={() => setCurrentPath('workshop-mode')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                  currentPath === 'workshop-mode'
                    ? 'bg-cyan-500 text-neutral-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-surface-container-high text-cyan-300 hover:text-on-surface hover:bg-surface-bright border border-cyan-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">precision_manufacturing</span>
                <span>{lang === 'ar' ? 'وضع ورشة الصيانة' : 'Workshop Mode'}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase leading-none shrink-0 ${
                  currentPath === 'workshop-mode' ? 'bg-black/20 text-neutral-950' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  STATION
                </span>
              </button>

              <button
                onClick={() => setCurrentPath('live-dtc-scanner')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                  currentPath === 'live-dtc-scanner'
                    ? 'bg-error-container text-on-error-container font-bold shadow-[0_0_12px_rgba(255,84,73,0.3)]'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">warning</span>
                <span>{lang === 'ar' ? 'فاحص الأعطال' : 'OBD-II / DTC'}</span>
                <span className="bg-error-container/50 text-on-error-container px-1.5 py-0.5 rounded text-[10px] font-bold leading-none shrink-0">
                  DTC
                </span>
              </button>

              <button
                onClick={() => setCurrentPath('vehicle-explorer')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                  currentPath === 'vehicle-explorer'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">directions_car</span>
                <span>{lang === 'ar' ? 'مستكشف المركبات' : 'Vehicle Explorer'}</span>
                <span className="bg-surface-container-high text-secondary px-1.5 py-0.5 rounded text-[10px] font-bold leading-none shrink-0">
                  7 Steps
                </span>
              </button>

              <button
                onClick={() => {
                  setDiagnosticInitialSymptom("Engine cranks but doesn't start");
                  setIsDiagnosticEngineOpen(true);
                }}
                className="shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container text-primary-container font-bold border border-primary-container/30 shadow-sm"
              >
                <span className="material-symbols-outlined text-base shrink-0">account_tree</span>
                <span>{lang === 'ar' ? 'محرك التشخيص' : 'Diagnostic Flow'}</span>
                <span className="bg-primary-container/20 text-primary-container px-1.5 py-0.5 rounded text-[10px] font-bold uppercase leading-none shrink-0">
                  Flow
                </span>
              </button>

              <button
                onClick={() => setCurrentPath('autofix-ai')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                  currentPath === 'autofix-ai'
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'text-primary-container hover:text-on-surface hover:bg-surface-container-high border border-primary-container/30'
                }`}
              >
                <span className="material-symbols-outlined text-base animate-pulse shrink-0">auto_awesome</span>
                <span>AutoFix AI</span>
                <span className="bg-primary-container/20 text-primary-container px-1.5 py-0.5 rounded text-[10px] font-bold uppercase leading-none shrink-0">
                  COPILOT
                </span>
              </button>

              <button
                onClick={() => setCurrentPath('tools-torque')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                  currentPath === 'tools-torque'
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                    : 'text-amber-300 hover:text-on-surface hover:bg-surface-container-high border border-amber-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">calculate</span>
                <span>{lang === 'ar' ? 'الحاسبات' : 'Calculators'}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase leading-none shrink-0 ${
                  currentPath === 'tools-torque' ? 'bg-black/20 text-neutral-950' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  13
                </span>
              </button>

              <button
                onClick={() => setCurrentPath('electrical-wiring')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer ${
                  currentPath === 'electrical-wiring'
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    : 'text-amber-300 hover:text-on-surface hover:bg-surface-container-high border border-amber-400/30'
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">schema</span>
                <span>{lang === 'ar' ? 'الأسلاك' : 'Wiring'}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase leading-none shrink-0 ${
                  currentPath === 'electrical-wiring' ? 'bg-black/20 text-neutral-950' : 'bg-amber-400/20 text-amber-300'
                }`}>
                  10 SYS
                </span>
              </button>

              <button
                onClick={() => setIsSecurityHubOpen(true)}
                className="shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-code-sm text-xs transition-all cursor-pointer bg-surface-container-high hover:bg-surface-bright text-emerald-300 border border-emerald-500/40 shadow-sm"
                type="button"
                title="Open Production Security, RBAC & Audit Trail Center"
              >
                <span className="material-symbols-outlined text-base text-emerald-400 shrink-0">shield</span>
                <span className="font-bold">{lang === 'ar' ? 'الأمان' : 'Security'}</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border border-emerald-500/30 leading-none shrink-0">
                  DEFENSES
                </span>
              </button>

              {/* State Simulators Quick Dropdown / Buttons for QA */}
              <button
                onClick={() => setCurrentPath('404')}
                className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded-lg font-code-sm text-[11px] text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer border border-white/5"
                type="button"
                title="Test 404 Not Found Page"
              >
                <span className="material-symbols-outlined text-xs shrink-0">find_in_page</span>
                <span>404</span>
              </button>

              <button
                onClick={() => setCurrentPath('500')}
                className="shrink-0 whitespace-nowrap flex items-center gap-1 px-2 py-1.5 rounded-lg font-code-sm text-[11px] text-outline hover:text-rose-400 hover:bg-surface-container transition-colors cursor-pointer border border-white/5"
                type="button"
                title="Test 500 Server Error Page (Masked Stack Trace)"
              >
                <span className="material-symbols-outlined text-xs shrink-0">gpp_maybe</span>
                <span>500</span>
              </button>
            </div>

            {/* Active Vehicle Status Badge - Non-Colliding, Truncated */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-code-sm bg-surface-container-low px-3 py-1.5 rounded-lg border border-white/5 shrink-0 min-w-0 max-w-[280px]">
              <span className="material-symbols-outlined text-sm text-secondary shrink-0">verified</span>
              <span
                className="text-on-surface font-medium truncate"
                title={`Active: ${activeVehicleProfile.year} ${activeVehicleProfile.make} ${activeVehicleProfile.model}`}
              >
                {activeVehicleProfile.year} {activeVehicleProfile.make} {activeVehicleProfile.model}
              </span>
            </div>
          </section>

          {/* Offline Banner if disconnected */}
          {!isOnline && (
            <div className="mb-6">
              <OfflineState
                cachedVehiclesCount={VEHICLE_PROFILES.length}
                onRetryConnection={() => setIsOnline(navigator.onLine)}
              />
            </div>
          )}

          {/* VIEW ROUTING */}
          {currentPath === 'admin-dashboard' ? (
            <AdminDashboard
              lang={lang}
              onNavigateHome={() => setCurrentPath('dashboard')}
            />
          ) : currentPath === '404' ? (
            <NotFoundView
              missingPath="/ecu/powertrain/gateway/unmapped-subsystem"
              onReturnHome={() => setCurrentPath('dashboard')}
            />
          ) : currentPath === '500' ? (
            <InternalServerErrorView
              errorCode="POWERTRAIN_CAN_BUS_TIMEOUT_500"
              onRetry={() => setCurrentPath('dashboard')}
              onReturnDashboard={() => setCurrentPath('dashboard')}
            />
          ) : currentPath === 'electrical-wiring' ? (
            <ElectricalExplorerPage
              currentVehicle={activeVehicleProfile}
              onSelectVehicle={(prof) => handleLoadProfileToWorkshop(prof)}
              lang={lang}
            />
          ) : currentPath === 'workshop-mode' ? (
            <WorkshopWorkstation
              lang={lang}
              activeVehicleProfile={activeVehicleProfile}
              onSelectVehicleProfile={(prof) => handleLoadProfileToWorkshop(prof)}
              onNavigateTo3D={() => setCurrentPath('dashboard')}
              onNavigateToRepair={() => setCurrentPath('repair-guides')}
              onNavigateToScanner={() => setCurrentPath('live-dtc-scanner')}
              onNavigateToTools={() => setCurrentPath('tools-torque')}
              onNavigateToElectrical={() => setCurrentPath('electrical-wiring')}
            />
          ) : currentPath === 'autofix-ai' ? (
            <AutoFixAiView
              lang={lang}
              activeVehicle={activeVehicleProfile}
              onSelectVehicleProfile={(prof) => handleLoadProfileToWorkshop(prof)}
              onNavigateToProcedure={() => setCurrentPath('repair-guides')}
            />
          ) : currentPath === 'tools-torque' ? (
            <AutomotiveCalculatorsPage lang={lang} />
          ) : currentPath === 'data-import' || currentPath === 'system-settings' ? (
            <AdminDataImportPage
              lang={lang}
              onNavigateToRepair={() => setCurrentPath('repair-guides')}
            />
          ) : currentPath === 'repair-guides' ? (
            <RepairCenterPage lang={lang} />
          ) : currentPath === 'service-schedules' ? (
            <MaintenanceCenterPage
              lang={lang}
              activeVehicleId={activeVehicleProfile.id}
              onSetWorkshopVehicle={handleLoadProfileToWorkshop}
            />
          ) : currentPath === 'live-dtc-scanner' ? (
            <DtcModulePage
              lang={lang}
              onStartDiagnosis={(symptom, targetCompId) => {
                setDiagnosticInitialSymptom(symptom);
                if (targetCompId) setTarget3DComponentId(targetCompId);
                setIsDiagnosticEngineOpen(true);
              }}
              onInspectIn3D={(componentId) => {
                setTarget3DComponentId(componentId);
                setCurrentPath('dashboard');
                setTimeout(() => {
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }, 100);
              }}
              onNavigateToRepair={() => setCurrentPath('repair-guides')}
            />
          ) : currentPath === 'vehicle-explorer' ? (
            <VehicleExplorer
              lang={lang}
              onSetAppVehicle={handleLoadProfileToWorkshop}
              activeAppProfile={activeVehicleProfile}
            />
          ) : (
            <>
              {/* HERO SECTION */}
              <section className="relative bg-surface-container-low rounded-xl p-6 lg:p-8 overflow-hidden shadow-xl border border-white/5">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary-container/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container-high text-primary-container font-code-sm text-[11px] tracking-widest uppercase border border-primary-container/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-container animate-pulse"></span>
                  {t.telemetryHeroTag}
                </div>

                <h1 className="font-display-lg text-headline-xl lg:text-display-lg text-on-surface font-extrabold tracking-tight uppercase">
                  {t.sloganPart1}
                  <span className="text-primary-container">.</span> {t.sloganPart2}
                  <span className="text-secondary">.</span> {t.sloganPart3}
                  <span className="text-primary-fixed">.</span>
                </h1>

                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  {t.heroDescription}
                </p>
              </div>

              {/* Quick Session Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface-container-lowest/80 backdrop-blur-md p-4 rounded-xl min-w-[280px] border border-white/5">
                <div className="flex flex-col">
                  <span className="font-telemetry-label text-telemetry-label text-outline uppercase">
                    {t.dtcAlert}
                  </span>
                  <span
                    className={`font-telemetry-value-md text-telemetry-value-md flex items-center gap-1 ${
                      activeFaultCount > 0 ? 'text-error' : 'text-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {activeFaultCount > 0 ? 'warning' : 'check_circle'}
                    </span>
                    {activeFaultCount > 0 ? t.faultCount : lang === 'ar' ? 'لا توجد أعطال' : '0 Faults'}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="font-telemetry-label text-telemetry-label text-outline uppercase">
                    {t.battery}
                  </span>
                  <span className="font-telemetry-value-md text-telemetry-value-md text-primary-container">
                    14.4 V
                  </span>
                </div>

                <div className="flex flex-col col-span-2 sm:col-span-1">
                  <span className="font-telemetry-label text-telemetry-label text-outline uppercase">
                    {t.coolant}
                  </span>
                  <span className="font-telemetry-value-md text-telemetry-value-md text-secondary">
                    92°C
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* DYNAMIC VEHICLE SELECTOR CARD (CASCADE FILTERS) */}
          <section className="bg-surface-container-lowest rounded-xl p-5 lg:p-6 shadow-xl space-y-6 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-container-high text-primary-container">
                  <span className="material-symbols-outlined text-xl">tune</span>
                </div>
                <div>
                  <h2 className="font-headline-lg text-headline-md sm:text-headline-lg text-on-surface font-semibold">
                    {t.activeVehicleRig}
                  </h2>
                  <p className="font-code-sm text-code-sm text-outline">
                    {t.gatewayCanId} • VIN: {currentVehicle.vin}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsVinScannerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">history</span> {t.recallSaved}
                </button>
                <button
                  onClick={() => setCurrentVehicle(mockVehicles.porsche992)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface font-code-sm text-xs transition-colors cursor-pointer"
                  type="button"
                >
                  {t.resetFilter}
                </button>
              </div>
            </div>

            {/* Cascade Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {/* Make Pill Filter */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="font-telemetry-label text-telemetry-label text-outline uppercase truncate">
                  {t.make}
                </label>
                <div className="relative min-w-0">
                  <select
                    value={
                      currentVehicle.make.includes('Porsche')
                        ? 'porsche992'
                        : currentVehicle.make.includes('BMW')
                        ? 'bmwM3'
                        : currentVehicle.make.includes('Audi')
                        ? 'audiRs'
                        : currentVehicle.make.includes('Toyota')
                        ? 'toyotaCamry'
                        : currentVehicle.make.includes('Ford')
                        ? 'fordF150'
                        : 'porsche992'
                    }
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full bg-surface-container-low text-primary-container font-code-sm text-xs rounded-lg px-3 py-2.5 pe-8 appearance-none focus:outline-none focus:bg-surface-container-high cursor-pointer font-semibold border border-white/5 truncate"
                  >
                    <option value="porsche992">Porsche (992)</option>
                    <option value="bmwM3">BMW (G80/G82)</option>
                    <option value="audiRs">Audi (B9 RS)</option>
                    <option value="toyotaCamry">Toyota (XV70)</option>
                    <option value="fordF150">Ford (13th Gen)</option>
                  </select>
                  <span className="material-symbols-outlined absolute end-2.5 top-2.5 text-primary-container pointer-events-none text-sm">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Model */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="font-telemetry-label text-telemetry-label text-outline uppercase truncate">
                  {t.model}
                </label>
                <div className="relative min-w-0">
                  <select className="w-full bg-surface-container-low text-on-surface font-code-sm text-xs rounded-lg px-3 py-2.5 pe-8 appearance-none focus:outline-none focus:bg-surface-container-high cursor-pointer border border-white/5 truncate">
                    <option>{currentVehicle.model}</option>
                  </select>
                  <span className="material-symbols-outlined absolute end-2.5 top-2.5 text-outline pointer-events-none text-sm">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="font-telemetry-label text-telemetry-label text-outline uppercase truncate">
                  {t.modelYear}
                </label>
                <div className="relative min-w-0">
                  <select className="w-full bg-surface-container-low text-on-surface font-code-sm text-xs rounded-lg px-3 py-2.5 pe-8 appearance-none focus:outline-none focus:bg-surface-container-high cursor-pointer border border-white/5 truncate">
                    <option>{currentVehicle.year}</option>
                  </select>
                  <span className="material-symbols-outlined absolute end-2.5 top-2.5 text-outline pointer-events-none text-sm">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Engine */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="font-telemetry-label text-telemetry-label text-outline uppercase truncate">
                  {t.powertrain}
                </label>
                <div className="relative min-w-0">
                  <select className="w-full bg-surface-container-low text-on-surface font-code-sm text-xs rounded-lg px-3 py-2.5 pe-8 appearance-none focus:outline-none focus:bg-surface-container-high cursor-pointer border border-white/5 truncate">
                    <option>{currentVehicle.powertrain}</option>
                  </select>
                  <span className="material-symbols-outlined absolute end-2.5 top-2.5 text-outline pointer-events-none text-sm">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Trim / Drivetrain */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="font-telemetry-label text-telemetry-label text-outline uppercase truncate">
                  {t.drivetrain}
                </label>
                <div className="relative min-w-0">
                  <select className="w-full bg-surface-container-low text-on-surface font-code-sm text-xs rounded-lg px-3 py-2.5 pe-8 appearance-none focus:outline-none focus:bg-surface-container-high cursor-pointer border border-white/5 truncate">
                    <option>{currentVehicle.drivetrain}</option>
                  </select>
                  <span className="material-symbols-outlined absolute end-2.5 top-2.5 text-outline pointer-events-none text-sm">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Transmission */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="font-telemetry-label text-telemetry-label text-outline uppercase truncate">
                  {t.gearbox}
                </label>
                <div className="relative min-w-0">
                  <select className="w-full bg-surface-container-low text-on-surface font-code-sm text-xs rounded-lg px-3 py-2.5 pe-8 appearance-none focus:outline-none focus:bg-surface-container-high cursor-pointer border border-white/5 truncate">
                    <option>{currentVehicle.gearbox}</option>
                  </select>
                  <span className="material-symbols-outlined absolute end-2.5 top-2.5 text-outline pointer-events-none text-sm">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Spec Tag Strip & Workspace CTA (Zero Collision, Discrete Unit Badges) */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-3 bg-surface-container-low/60 p-3 sm:p-4 rounded-lg border border-white/5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 font-code-sm text-xs text-on-surface-variant">
                <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 px-2.5 py-1.5 rounded-lg border border-white/5 shrink-0">
                  <span className="text-outline">Displacement:</span>
                  <span className="text-on-surface font-semibold">{currentVehicle.displacement}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 px-2.5 py-1.5 rounded-lg border border-white/5 shrink-0">
                  <span className="text-outline">Engine Oil:</span>
                  <span className="text-primary font-semibold">{currentVehicle.engineOil}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 px-2.5 py-1.5 rounded-lg border border-white/5 shrink-0">
                  <span className="text-outline">Spark Gap:</span>
                  <span className="text-on-surface font-semibold">{currentVehicle.sparkGap}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 px-2.5 py-1.5 rounded-lg border border-white/5 shrink-0">
                  <span className="text-outline">Wheel Bolt Torque:</span>
                  <span className="text-secondary-fixed-dim font-semibold">
                    {currentVehicle.wheelBoltTorque}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentPath('3d-telemetry-cad');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-code-sm text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,240,255,0.35)] flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base">rocket_launch</span>
                <span>{t.openWorkspace}</span>
              </button>
            </div>
          </section>

          {/* 3D VEHICLE INTERACTIVE CAD WORKSPACE & LIVE TELEMETRY STACK */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3D CAD Center Viewport (8 Columns) */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <ThreeCanvas
                lang={lang}
                initialSelectedComponentId={target3DComponentId}
                onSelectDtc={() => {
                  setDiagnosticInitialSymptom("Engine cranks but doesn't start");
                  setIsDiagnosticEngineOpen(true);
                }}
                onOpenSensor={(name) => {
                  setSelectedMaintenanceItem(maintenanceItems[1]);
                  setIsTorqueModalOpen(true);
                }}
              />
            </div>

            {/* Active DTC Inspector & Freeze Frame (4 Columns) */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              <DtcInspector
                lang={lang}
                onOpenDtcSuite={() => setCurrentPath('live-dtc-scanner')}
                onLaunchTree={() => {
                  setDiagnosticInitialSymptom("Engine cranks but doesn't start");
                  setIsDiagnosticEngineOpen(true);
                }}
                onInspect3d={() => {
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                onSyncVideo={() => setIsVideoGuideOpen(true)}
              />
            </div>
          </section>

          {/* MAINTENANCE DUE & FACTORY SCHEDULES GRID */}
          <MaintenanceGrid
            lang={lang}
            items={maintenanceItems}
            onOpenProcedure={handleOpenProcedure}
            onOpenMaintenanceCenter={() => setCurrentPath('service-schedules')}
          />

          {/* INTERACTIVE SUBSYSTEMS OVERVIEW & COMPONENT DEEP-DIVES */}
          <SubsystemMatrices lang={lang} />

          {/* COMMAND PALETTE SHORTCUT & QUICK FOOTER BAR */}
          <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-surface-container-low text-xs font-code-sm text-outline border border-white/5">
            <div
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 cursor-pointer hover:text-on-surface transition-colors"
            >
              <kbd className="px-2 py-1 bg-surface-container-high text-on-surface rounded font-bold shadow-sm">
                ⌘K
              </kbd>
              <span>{t.commandPaletteNotice}</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
                {t.cloudTelemetryLive}
              </span>
              <span>{t.sessionId}</span>
            </div>
          </section>
            </>
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <DiagnosticEngineWizard
        lang={lang}
        currentVehicle={currentVehicle}
        isOpen={isDiagnosticEngineOpen}
        onClose={() => setIsDiagnosticEngineOpen(false)}
        initialSymptom={diagnosticInitialSymptom}
        onInspectIn3D={(componentId) => {
          setTarget3DComponentId(componentId);
          setIsDiagnosticEngineOpen(false);
          setCurrentPath('dashboard');
          setTimeout(() => {
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }, 100);
        }}
      />

      <DiagnosticTreeModal
        isOpen={isDiagnosticTreeOpen}
        onClose={() => setIsDiagnosticTreeOpen(false)}
        lang={lang}
        onCodeCleared={handleCodeCleared}
      />

      <ObdLogModal
        isOpen={isObdLogOpen}
        onClose={() => setIsObdLogOpen(false)}
        lang={lang}
      />

      <TorqueProcedureModal
        item={selectedMaintenanceItem}
        onClose={() => setIsTorqueModalOpen(false)}
        lang={lang}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        lang={lang}
        onNavigate={handleNavigate}
        onOpenDiagnosticTree={() => {
          setDiagnosticInitialSymptom("Engine cranks but doesn't start");
          setIsDiagnosticEngineOpen(true);
        }}
        onOpenObdLog={() => setIsObdLogOpen(true)}
        onSelectVehicleProfile={(profile) => {
          handleLoadProfileToWorkshop(profile);
          setCurrentPath('vehicle-explorer');
        }}
      />

      <VideoGuideModal
        isOpen={isVideoGuideOpen}
        onClose={() => setIsVideoGuideOpen(false)}
        lang={lang}
      />

      <VinScannerModal
        isOpen={isVinScannerOpen}
        onClose={() => setIsVinScannerOpen(false)}
        lang={lang}
        onSelectVehicle={(veh) => setCurrentVehicle(veh)}
      />

      {/* AutoFix AI Floating Quick-Launcher Button */}
      <AutoFixAiFloatingButton
        isOpen={isAiModalOpen || currentPath === 'autofix-ai'}
        onClick={() => setIsAiModalOpen(true)}
        lang={lang}
      />

      {/* AutoFix AI Modal Assistant */}
      <AutoFixAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        lang={lang}
        activeVehicle={activeVehicleProfile}
        onSelectVehicleProfile={(profile) => handleLoadProfileToWorkshop(profile)}
        onNavigateToProcedure={() => setCurrentPath('repair-guides')}
      />

      {/* Production Security, RBAC & Audit Hub Modal */}
      <SecurityHubModal
        isOpen={isSecurityHubOpen}
        onClose={() => setIsSecurityHubOpen(false)}
        lang={lang}
      />
    </div>
  );
}
