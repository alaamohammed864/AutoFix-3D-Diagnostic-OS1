import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { VehicleProfileData, KnownMaintenanceTask } from '../db/vehicleTypes';
import { TAXONOMY, VEHICLE_PROFILES, getVehicleProfileById } from '../db/vehicleDatabase';
import { parseAndExecuteNaturalSearch } from '../db/fuzzySearch';
import { isArabicText } from '../search/terminologyMap';
import { useVoiceSearch } from '../search/useVoiceSearch';
import { VoiceSearchButton } from '../search/VoiceSearchButton';
import { VehicleCompareModal } from './VehicleCompareModal';
import { VehicleHistoryModal } from './VehicleHistoryModal';
import { Vehicle3DVisualization } from './vehicle3d/Vehicle3DVisualization';
import confetti from 'canvas-confetti';

interface VehicleExplorerProps {
  lang: Language;
  onSetAppVehicle?: (profile: VehicleProfileData) => void;
  activeAppProfile?: VehicleProfileData;
}

export const VehicleExplorer: React.FC<VehicleExplorerProps> = ({
  lang,
  onSetAppVehicle,
  activeAppProfile,
}) => {
  const isAr = lang === 'ar';

  // 7-Step Selection State
  const [step, setStep] = useState<number>(1);
  const [selectedMake, setSelectedMake] = useState<string>('toyota');
  const [selectedModel, setSelectedModel] = useState<string>('camry');
  const [selectedYear, setSelectedYear] = useState<number>(2018);
  const [selectedGen, setSelectedGen] = useState<string>('xv70');
  const [selectedEngine, setSelectedEngine] = useState<string>('2.5l-i4');
  const [selectedTrim, setSelectedTrim] = useState<string>('se');
  const [selectedTrans, setSelectedTrans] = useState<string>('auto-8sp');

  // Active Vehicle Profile
  const [activeProfile, setActiveProfile] = useState<VehicleProfileData>(
    activeAppProfile || VEHICLE_PROFILES[0]
  );

  // Saved Garage (LocalStorage)
  const [savedVehicleIds, setSavedVehicleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('autofix_saved_vehicles');
      return stored ? JSON.parse(stored) : ['toyota-camry-2018-xv70-2.5l-se-auto'];
    } catch {
      return ['toyota-camry-2018-xv70-2.5l-se-auto'];
    }
  });

  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Modals
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedTaskModal, setSelectedTaskModal] = useState<KnownMaintenanceTask | null>(null);
  const [show3dModel, setShow3dModel] = useState<boolean>(true);

  // Natural Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState<'profile' | 'search'>('profile');

  // Resolve taxonomy entities
  const currentMakeObj = TAXONOMY.manufacturers.find((m) => m.id === selectedMake) || TAXONOMY.manufacturers[0];
  const currentModelObj = currentMakeObj.models.find((m) => m.id === selectedModel) || currentMakeObj.models[0];
  const currentYearObj = currentModelObj.years.find((y) => y.year === selectedYear) || currentModelObj.years[0];
  const currentGenObj = currentYearObj.generations.find((g) => g.id === selectedGen) || currentYearObj.generations[0];
  const currentEngineObj = currentGenObj.engines.find((e) => e.id === selectedEngine) || currentGenObj.engines[0];
  const currentTrimObj = currentEngineObj.trims.find((t) => t.id === selectedTrim) || currentEngineObj.trims[0];
  const currentTransObj = currentTrimObj.transmissions.find((tr) => tr.id === selectedTrans) || currentTrimObj.transmissions[0];

  // When step 7 completes or trans changes, set active profile
  const commitProfileSelection = (profileId: string) => {
    const profile = getVehicleProfileById(profileId);
    if (profile) {
      setActiveProfile(profile);
      setStep(8); // Step 8 represents the rendered profile view
      setActiveSearchTab('profile');
    }
  };

  // Natural Search Execution
  const searchResults = parseAndExecuteNaturalSearch(searchQuery);
  const isSearchArabic = isArabicText(searchQuery);
  const isSearchRtl = isAr || isSearchArabic;

  // Voice Search Hook
  const voice = useVoiceSearch({
    lang,
    onResult: (transcript) => {
      setSearchQuery(transcript);
      setActiveSearchTab('search');
    },
  });

  const handleSaveVehicle = () => {
    if (!savedVehicleIds.includes(activeProfile.id)) {
      const updated = [...savedVehicleIds, activeProfile.id];
      setSavedVehicleIds(updated);
      try {
        localStorage.setItem('autofix_saved_vehicles', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
    setSaveSuccessNotice(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handlePresetSearch = (query: string) => {
    setSearchQuery(query);
    setActiveSearchTab('search');
  };

  return (
    <div className="space-y-6">
      {/* 1. NATURAL SEARCH & QUERY DETECTION BAR */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 lg:p-6 shadow-xl border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary-container/10 text-primary-container">
                <span className="material-symbols-outlined text-lg">travel_explore</span>
              </span>
              <h2 className="font-headline-lg text-lg text-on-surface font-semibold">
                {isAr ? 'البحث الذكي في المركبات والصيانة' : 'Automotive Natural Language Search'}
              </h2>
            </div>
            <p className="font-code-sm text-xs text-outline mt-1">
              {isAr
                ? 'يتعرف المحرك على: الصانع، الموديل، السنة، النظام، القطعة، وإجراء الإصلاح مع مطابقة تقريبية (Fuzzy Matching)'
                : 'Fuzzy entity detector extracts Make, Model, Year, System, Component & Repair Action'}
            </p>
          </div>

          {/* Quick preset chips requested by prompt */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-telemetry-label text-outline uppercase me-1">
              {isAr ? 'أمثلة مطابقة:' : 'Query Presets:'}
            </span>
            <button
              onClick={() => handlePresetSearch('تغيير بطارية تويوتا كامري 2018')}
              className="text-[11px] font-code-sm px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-amber-300 border border-amber-400/20 transition-colors cursor-pointer"
            >
              "تغيير بطارية تويوتا كامري 2018"
            </button>
            <button
              onClick={() => handlePresetSearch('Toyota Camry 2018 battery replacement')}
              className="text-[11px] font-code-sm px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary-container border border-primary-container/20 transition-colors cursor-pointer"
            >
              "Toyota Camry 2018 battery replacement"
            </button>
            <button
              onClick={() => handlePresetSearch('مضخة الوقود')}
              className="text-[11px] font-code-sm px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary border border-secondary/20 transition-colors cursor-pointer"
            >
              "مضخة الوقود"
            </button>
            <button
              onClick={() => handlePresetSearch('Ford F-150 2019 coolant')}
              className="text-[11px] font-code-sm px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary-fixed border border-primary-fixed/20 transition-colors cursor-pointer"
            >
              "Ford F-150 2019 coolant"
            </button>
          </div>
        </div>

        {/* Input box with Voice Search and RTL support */}
        <div dir={isSearchRtl ? 'rtl' : 'ltr'} className="relative flex items-center">
          <span className="material-symbols-outlined absolute start-3.5 text-outline text-xl pointer-events-none">
            manage_search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length > 0) {
                setActiveSearchTab('search');
              }
            }}
            placeholder={
              isAr
                ? 'اكتب طلبك بالعربية أو الإنجليزية (مثال: تغيير بطارية تويوتا كامري 2018 أو Ford F-150 coolant)'
                : 'Enter natural language search (e.g. "Toyota Camry 2018 battery replacement", "تغيير بطارية تويوتا كامري 2018")'
            }
            className="w-full bg-surface-container-low text-on-surface text-sm font-code-sm ps-11 pe-24 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-primary-container transition-all"
          />

          <div className="absolute end-2 flex items-center gap-1.5">
            <VoiceSearchButton
              isListening={voice.isListening}
              isSupported={voice.isSupported}
              lang={lang}
              onClick={() => voice.toggleListening()}
              size="sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-code-sm text-outline hover:text-on-surface px-2 py-1 rounded bg-surface-container cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Voice Listening Notice */}
        {voice.isListening && (
          <div className="bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl flex items-center justify-between text-xs font-code-sm text-rose-300 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>
                {isAr
                  ? 'جاري الاستماع لصوتك باللغة العربية... تحدث الآن'
                  : 'Listening to your voice in automotive terms... Speak now'}
              </span>
            </div>
            {voice.interimTranscript && (
              <span className="italic text-white font-mono">"{voice.interimTranscript}"</span>
            )}
            <button
              onClick={() => voice.stopListening()}
              className="text-xs underline hover:text-white cursor-pointer"
            >
              {isAr ? 'إيقاف' : 'Stop'}
            </button>
          </div>
        )}

        {/* DETECTED SEMANTIC ENTITIES CHIPS (Make, Model, Year, System, Component, Repair Action) */}
        {searchQuery.trim().length > 0 && (
          <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-code-sm">
              <span className="text-outline uppercase font-telemetry-label">
                {isAr ? 'الكيانات المفحوصة والمكتشفة (Entity Detection):' : 'Detected Automotive Entities:'}
              </span>
              <span className="text-secondary font-bold">
                Fuzzy Confidence: {Math.round(searchResults.confidence * 100)}%
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-code-sm">
              {searchResults.detected.make && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-container/15 text-primary-container font-semibold border border-primary-container/30">
                  <span className="text-[10px] text-outline uppercase font-normal">Make:</span>
                  {searchResults.detectedAr?.make && isAr ? searchResults.detectedAr.make : searchResults.detected.make}
                </span>
              )}
              {searchResults.detected.model && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary/15 text-secondary font-semibold border border-secondary/30">
                  <span className="text-[10px] text-outline uppercase font-normal">Model:</span>
                  {searchResults.detectedAr?.model && isAr ? searchResults.detectedAr.model : searchResults.detected.model}
                </span>
              )}
              {searchResults.detected.year && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-fixed/15 text-primary-fixed font-semibold border border-primary-fixed/30">
                  <span className="text-[10px] text-outline uppercase font-normal">Year:</span>
                  {searchResults.detected.year}
                </span>
              )}
              {searchResults.detected.system && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-semibold border border-white/10">
                  <span className="text-[10px] text-outline uppercase font-normal">System:</span>
                  {searchResults.detectedAr?.system && isAr ? searchResults.detectedAr.system : searchResults.detected.system}
                </span>
              )}
              {searchResults.detected.component && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-tertiary-container/20 text-tertiary-container font-semibold border border-tertiary-container/30">
                  <span className="text-[10px] text-outline uppercase font-normal">Component:</span>
                  {searchResults.detectedAr?.component && isAr ? searchResults.detectedAr.component : searchResults.detected.component}
                </span>
              )}
              {searchResults.detected.repairAction && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-error-container/20 text-error font-semibold border border-error-container/30">
                  <span className="text-[10px] text-outline uppercase font-normal">Action:</span>
                  {searchResults.detectedAr?.repairAction && isAr ? searchResults.detectedAr.repairAction : searchResults.detected.repairAction}
                </span>
              )}
            </div>

            {/* Instant Search Results Card */}
            {searchResults.matchedVehicle && (
              <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs font-code-sm">
                  <span className="material-symbols-outlined text-secondary text-base">verified</span>
                  <span className="text-on-surface font-bold">
                    {searchResults.matchedVehicle.year} {searchResults.matchedVehicle.make} {searchResults.matchedVehicle.model} ({searchResults.matchedVehicle.engine})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveProfile(searchResults.matchedVehicle!);
                    setStep(8);
                    setActiveSearchTab('profile');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-code-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>{isAr ? 'فتح ملف هذه المركبة' : 'Open Vehicle Profile'}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}

            {/* Matched Battery Specification (e.g. for "تغيير بطارية تويوتا كامري 2018" or "Toyota Camry 2018 battery replacement") */}
            {searchResults.matchedBattery && (
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs font-code-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <span className="material-symbols-outlined text-base">battery_charging_full</span>
                    <span>{isAr ? 'مواصفات بطارية المصنع الأصلية (OEM Spec):' : 'OEM Verified Battery Specification:'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                    {searchResults.matchedBattery.battery.groupSize}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-on-surface">
                  <div className="bg-surface-container-high/60 p-2 rounded-lg">
                    <span className="text-[10px] text-outline block uppercase">{isAr ? 'المقاس (BCI):' : 'Group Size:'}</span>
                    <span className="font-bold text-amber-300">{searchResults.matchedBattery.battery.groupSize}</span>
                  </div>
                  <div className="bg-surface-container-high/60 p-2 rounded-lg">
                    <span className="text-[10px] text-outline block uppercase">{isAr ? 'تيار التدوير (CCA):' : 'Cold Cranking Amps:'}</span>
                    <span className="font-bold text-primary-container">{searchResults.matchedBattery.battery.cca} CCA</span>
                  </div>
                  <div className="bg-surface-container-high/60 p-2 rounded-lg">
                    <span className="text-[10px] text-outline block uppercase">{isAr ? 'الجهد / السعة:' : 'Voltage / Capacity:'}</span>
                    <span className="font-bold text-secondary">{searchResults.matchedBattery.battery.voltage} • {searchResults.matchedBattery.battery.reserveCapacityMinutes} Min RC</span>
                  </div>
                  <div className="bg-surface-container-high/60 p-2 rounded-lg">
                    <span className="text-[10px] text-outline block uppercase">{isAr ? 'نوع الكيمياء / OEM:' : 'Chemistry / OEM:'}</span>
                    <span className="font-bold text-on-surface">{searchResults.matchedBattery.battery.chemistry}</span>
                  </div>
                </div>
                <div className="text-[11px] text-outline flex items-center justify-between">
                  <span>OEM Part: <strong className="text-on-surface">{searchResults.matchedBattery.battery.partNumberOEM}</strong></span>
                  <span>{isAr ? 'استبدال موصى به:' : 'Rec. Replacement:'} {searchResults.matchedBattery.battery.recommendedReplacementYears} {isAr ? 'سنوات' : 'Years'}</span>
                </div>
              </div>
            )}

            {/* Matched Maintenance Procedures & Tasks */}
            {searchResults.matchedTasks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-[11px] font-code-sm text-outline uppercase font-telemetry-label">
                  {isAr ? 'إجراءات الصيانة المطابقة:' : 'Matching Maintenance Procedures:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.matchedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-surface-container-high border border-white/5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-code-sm font-semibold text-on-surface truncate block">
                          {t.title}
                        </span>
                        <span className="text-[10px] font-code-sm text-outline">
                          {t.component} • {t.estimatedLaborHours}h Labor • {t.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (searchResults.matchedVehicle) {
                            setActiveProfile(searchResults.matchedVehicle);
                          }
                          setSelectedTaskModal(t);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-code-sm text-primary-container border border-primary-container/30 shrink-0 cursor-pointer"
                      >
                        {isAr ? 'عرض الإجراء' : 'View Procedure'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. USER FLOW: 7-STEP CASCADING SELECTION WIZARD */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 lg:p-6 shadow-xl border border-white/5 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-surface-container text-secondary">
                <span className="material-symbols-outlined text-lg">alt_route</span>
              </span>
              <h2 className="font-headline-lg text-lg text-on-surface font-semibold">
                {isAr ? 'محدد تكوين المركبة (7 خطوات)' : 'Vehicle Configuration Wizard (7 Steps)'}
              </h2>
            </div>
            <p className="font-code-sm text-xs text-outline mt-1">
              Step {step <= 7 ? step : 7} of 7: Select Manufacturer → Model → Year → Generation → Engine → Trim → Transmission
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setStep(1);
                setActiveSearchTab('profile');
              }}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-code-sm text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              {isAr ? 'إعادة ضبط الخطوات' : 'Restart Wizard'}
            </button>
            {step === 8 && (
              <span className="text-xs font-code-sm text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Profile Active
              </span>
            )}
          </div>
        </div>

        {/* Visual Breadcrumb Steps Bar */}
        <div className="grid grid-cols-7 gap-1.5">
          {[
            { num: 1, label: isAr ? 'الصانع' : 'Manufacturer', val: currentMakeObj.name },
            { num: 2, label: isAr ? 'الموديل' : 'Model', val: currentModelObj.name },
            { num: 3, label: isAr ? 'السنة' : 'Year', val: currentYearObj.year },
            { num: 4, label: isAr ? 'الجيل' : 'Generation', val: currentGenObj.name.split(' ')[0] },
            { num: 5, label: isAr ? 'المحرك' : 'Engine', val: currentEngineObj.name.split(' ')[0] },
            { num: 6, label: isAr ? 'الفئة' : 'Trim', val: currentTrimObj.name.split(' ')[0] },
            { num: 7, label: isAr ? 'القير' : 'Transmission', val: currentTransObj.name.split(' ')[0] },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`p-2 rounded-lg text-start transition-all border ${
                step === s.num
                  ? 'bg-surface-container-high border-primary-container text-on-surface shadow-sm'
                  : step > s.num
                  ? 'bg-surface-container-low border-white/5 text-on-surface'
                  : 'bg-surface-container-lowest border-white/5 text-outline opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-code-sm font-bold">
                <span>0{s.num}</span>
                {step > s.num && (
                  <span className="material-symbols-outlined text-secondary text-xs">check</span>
                )}
              </div>
              <div className="text-[11px] font-medium truncate mt-0.5">{s.label}</div>
              <div className="text-[10px] text-outline truncate">{s.val}</div>
            </button>
          ))}
        </div>

        {/* Active Step Selection Grid */}
        <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
          {/* STEP 1: SELECT MANUFACTURER */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-on-surface font-code-sm uppercase tracking-wider">
                Step 1: Select Manufacturer
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {TAXONOMY.manufacturers.map((make) => (
                  <button
                    key={make.id}
                    onClick={() => {
                      setSelectedMake(make.id);
                      setSelectedModel(make.models[0].id);
                      setSelectedYear(make.models[0].years[0].year);
                      setSelectedGen(make.models[0].years[0].generations[0].id);
                      setSelectedEngine(make.models[0].years[0].generations[0].engines[0].id);
                      setSelectedTrim(make.models[0].years[0].generations[0].engines[0].trims[0].id);
                      setSelectedTrans(make.models[0].years[0].generations[0].engines[0].trims[0].transmissions[0].id);
                      setStep(2);
                    }}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedMake === make.id
                        ? 'bg-primary-container/10 border-primary-container text-on-surface'
                        : 'bg-surface-container border-white/5 hover:border-white/15 text-outline-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="font-headline-md text-sm font-bold text-on-surface">{make.name}</div>
                    <div className="text-[11px] font-code-sm text-outline mt-0.5">{make.country}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: SELECT MODEL */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-on-surface font-code-sm uppercase tracking-wider">
                Step 2: Select Model for {currentMakeObj.name}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentMakeObj.models.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setSelectedModel(mod.id);
                      setSelectedYear(mod.years[0].year);
                      setSelectedGen(mod.years[0].generations[0].id);
                      setSelectedEngine(mod.years[0].generations[0].engines[0].id);
                      setSelectedTrim(mod.years[0].generations[0].engines[0].trims[0].id);
                      setSelectedTrans(mod.years[0].generations[0].engines[0].trims[0].transmissions[0].id);
                      setStep(3);
                    }}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedModel === mod.id
                        ? 'bg-primary-container/10 border-primary-container text-on-surface'
                        : 'bg-surface-container border-white/5 hover:border-white/15 text-outline-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="font-headline-md text-sm font-bold text-on-surface">{mod.name}</div>
                    <div className="text-[11px] font-code-sm text-outline mt-0.5">{mod.years.length} Year Families</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT YEAR */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-on-surface font-code-sm uppercase tracking-wider">
                Step 3: Select Model Year for {currentMakeObj.name} {currentModelObj.name}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentModelObj.years.map((y) => (
                  <button
                    key={y.year}
                    onClick={() => {
                      setSelectedYear(y.year);
                      setSelectedGen(y.generations[0].id);
                      setSelectedEngine(y.generations[0].engines[0].id);
                      setSelectedTrim(y.generations[0].engines[0].trims[0].id);
                      setSelectedTrans(y.generations[0].engines[0].trims[0].transmissions[0].id);
                      setStep(4);
                    }}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedYear === y.year
                        ? 'bg-primary-container/10 border-primary-container text-on-surface'
                        : 'bg-surface-container border-white/5 hover:border-white/15 text-outline-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="font-telemetry-value-md text-base font-bold text-on-surface">{y.year}</div>
                    <div className="text-[11px] font-code-sm text-outline mt-0.5">
                      {y.generations.length} Generations
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: SELECT GENERATION */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-on-surface font-code-sm uppercase tracking-wider">
                Step 4: Select Platform Generation ({currentYearObj.year})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentYearObj.generations.map((gen) => (
                  <button
                    key={gen.id}
                    onClick={() => {
                      setSelectedGen(gen.id);
                      setSelectedEngine(gen.engines[0].id);
                      setSelectedTrim(gen.engines[0].trims[0].id);
                      setSelectedTrans(gen.engines[0].trims[0].transmissions[0].id);
                      setStep(5);
                    }}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedGen === gen.id
                        ? 'bg-primary-container/10 border-primary-container text-on-surface'
                        : 'bg-surface-container border-white/5 hover:border-white/15 text-outline-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="font-headline-md text-sm font-bold text-on-surface">{gen.name}</div>
                    <div className="text-[11px] font-code-sm text-outline mt-0.5">
                      {gen.engines.length} Engine variants available
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: SELECT ENGINE */}
          {step === 5 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-on-surface font-code-sm uppercase tracking-wider">
                Step 5: Select Engine & Displacement
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentGenObj.engines.map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => {
                      setSelectedEngine(eng.id);
                      setSelectedTrim(eng.trims[0].id);
                      setSelectedTrans(eng.trims[0].transmissions[0].id);
                      setStep(6);
                    }}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedEngine === eng.id
                        ? 'bg-primary-container/10 border-primary-container text-on-surface'
                        : 'bg-surface-container border-white/5 hover:border-white/15 text-outline-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="font-headline-md text-sm font-bold text-on-surface">{eng.name}</div>
                    <div className="text-[11px] font-code-sm text-outline mt-0.5">
                      {eng.trims.length} Trim specifications
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: SELECT TRIM */}
          {step === 6 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-on-surface font-code-sm uppercase tracking-wider">
                Step 6: Select Vehicle Trim Level
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentEngineObj.trims.map((trm) => (
                  <button
                    key={trm.id}
                    onClick={() => {
                      setSelectedTrim(trm.id);
                      setSelectedTrans(trm.transmissions[0].id);
                      setStep(7);
                    }}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      selectedTrim === trm.id
                        ? 'bg-primary-container/10 border-primary-container text-on-surface'
                        : 'bg-surface-container border-white/5 hover:border-white/15 text-outline-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="font-headline-md text-sm font-bold text-on-surface">{trm.name}</div>
                    <div className="text-[11px] font-code-sm text-outline mt-0.5">
                      {trm.transmissions.length} Transmission pairings
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: SELECT TRANSMISSION */}
          {step === 7 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-on-surface font-code-sm uppercase tracking-wider">
                Step 7: Select Transmission & Generate Profile
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTrimObj.transmissions.map((trn) => (
                  <button
                    key={trn.id}
                    onClick={() => {
                      setSelectedTrans(trn.id);
                      commitProfileSelection(trn.profileId);
                    }}
                    className="p-3 rounded-xl border border-primary-container/50 bg-primary-container/15 hover:bg-primary-container/25 text-start transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-headline-md text-sm font-bold text-on-surface">{trn.name}</div>
                      <div className="text-[11px] font-code-sm text-secondary mt-0.5">
                        Profile ID: {trn.profileId}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-primary-container">arrow_forward</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: COMPLETED NOTIFICATION */}
          {step === 8 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-code-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">check_circle</span>
                <span className="text-on-surface font-semibold">
                  {isAr
                    ? `تم تكوين ملف المركبة: ${activeProfile.year} ${activeProfile.make} ${activeProfile.model} (${activeProfile.generation})`
                    : `Active Configuration: ${activeProfile.year} ${activeProfile.make} ${activeProfile.model} (${activeProfile.generation})`}
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="px-3 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                {isAr ? 'تعديل الاختيارات (Change Vehicle)' : 'Change Vehicle (Wizard)'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. GENERATED VEHICLE PROFILE SECTION */}
      <section className="bg-surface-container-lowest rounded-2xl p-5 lg:p-7 shadow-xl border border-white/5 space-y-6">
        {/* Profile Hero Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Vehicle Image */}
            <div className="w-36 h-24 sm:w-44 sm:h-28 rounded-xl overflow-hidden bg-surface-container-low border border-white/10 shrink-0 relative group">
              <img
                src={activeProfile.image}
                alt={`${activeProfile.make} ${activeProfile.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1.5 start-1.5 bg-black/70 backdrop-blur-sm text-primary-container text-[10px] font-code-sm px-1.5 py-0.5 rounded">
                3D CAD Rig
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary-container text-[10px] font-code-sm font-bold uppercase">
                  {activeProfile.generation}
                </span>
                <span className="text-outline text-xs">•</span>
                <span className="text-outline font-code-sm text-xs">VIN: {activeProfile.vinExample}</span>
              </div>

              <h1 className="font-display-lg text-2xl sm:text-3xl text-on-surface font-extrabold tracking-tight">
                {activeProfile.year} {activeProfile.make} {activeProfile.model}
              </h1>

              <div className="text-xs font-code-sm text-secondary font-medium">
                {activeProfile.trim} • {activeProfile.driveType} • {activeProfile.fuelType}
              </div>
            </div>
          </div>

          {/* Profile Actions requested by prompt:
              "Save Vehicle", "Change Vehicle", "Compare Vehicles", "Vehicle History" */}
          <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto">
            {/* Save Vehicle */}
            <button
              onClick={handleSaveVehicle}
              className={`px-3.5 py-2 rounded-lg font-code-sm text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                savedVehicleIds.includes(activeProfile.id)
                  ? 'bg-secondary/15 text-secondary border border-secondary/30'
                  : 'bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container shadow-[0_0_15px_rgba(0,240,255,0.25)]'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {savedVehicleIds.includes(activeProfile.id) ? 'bookmark_added' : 'bookmark_add'}
              </span>
              <span>
                {savedVehicleIds.includes(activeProfile.id)
                  ? isAr
                    ? 'المركبة محفوظة'
                    : 'Vehicle Saved'
                  : isAr
                  ? 'حفظ المركبة (Save)'
                  : 'Save Vehicle'}
              </span>
            </button>

            {/* Change Vehicle */}
            <button
              onClick={() => {
                setStep(1);
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              <span>{isAr ? 'تغيير المركبة' : 'Change Vehicle'}</span>
            </button>

            {/* Compare Vehicles */}
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">compare_arrows</span>
              <span>{isAr ? 'مقارنة المركبات' : 'Compare Vehicles'}</span>
            </button>

            {/* Vehicle History */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-code-sm text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">history_edu</span>
              <span>{isAr ? 'سجل الصيانة' : 'Vehicle History'}</span>
            </button>

            {/* Toggle 3D Model View */}
            <button
              onClick={() => setShow3dModel(!show3dModel)}
              className={`px-3.5 py-2 rounded-lg font-code-sm text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                show3dModel
                  ? 'bg-primary-container text-on-primary-container border-primary-container shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                  : 'bg-surface-container-high hover:bg-surface-bright text-on-surface border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-base">view_in_ar</span>
              <span>{show3dModel ? (isAr ? 'إخفاء 3D' : 'Hide 3D Rig') : (isAr ? 'عرض 3D' : 'Interactive 3D')}</span>
            </button>

            {/* Load into Active 3D App Workspace */}
            {onSetAppVehicle && (
              <button
                onClick={() => onSetAppVehicle(activeProfile)}
                className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary-container font-code-sm text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-primary-container/20"
                title="Load into 3D Telemetry Dashboard"
              >
                <span className="material-symbols-outlined text-base">speed</span>
                <span>{isAr ? 'تحميل للورشة' : 'Load in Workshop'}</span>
              </button>
            )}
          </div>
        </div>

        {/* INTERACTIVE 3D VEHICLE VISUALIZATION SYSTEM */}
        {show3dModel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-code-sm text-xs font-bold text-primary-container uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">view_in_ar</span>
                <span>{isAr ? 'مجسم ثلاثي الأبعاد تفاعلي كامل' : 'Interactive 3D Vehicle & Systems Rig'}</span>
              </span>
              <span className="text-[11px] font-code-sm text-outline">
                {activeProfile.year} {activeProfile.make} {activeProfile.model} ({activeProfile.engine})
              </span>
            </div>
            <Vehicle3DVisualization lang={lang} />
          </div>
        )}

        {/* Save confirmation toast notice */}
        {saveSuccessNotice && (
          <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-xl flex items-center justify-between text-xs font-code-sm text-secondary animate-pulse">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              {isAr
                ? `تم حفظ ${activeProfile.year} ${activeProfile.make} ${activeProfile.model} بنجاح في كراجك المحلي!`
                : `Saved ${activeProfile.year} ${activeProfile.make} ${activeProfile.model} to your workshop garage!`}
            </span>
            <span className="text-[10px] text-outline">LocalStorage Synced</span>
          </div>
        )}

        {/* Key Powertrain & Performance Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase">{isAr ? 'المحرك' : 'Engine'}</span>
            <div className="text-xs font-bold text-on-surface truncate">{activeProfile.engine}</div>
            <div className="text-[10px] font-code-sm text-outline">{activeProfile.cylinderLayout}</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase">{isAr ? 'القوة' : 'Horsepower'}</span>
            <div className="text-sm font-bold text-primary-container">{activeProfile.horsepower} HP</div>
            <div className="text-[10px] font-code-sm text-outline">{activeProfile.torqueLbFt} lb-ft torque</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase">{isAr ? 'السعة اللترية' : 'Displacement'}</span>
            <div className="text-xs font-bold text-on-surface truncate">{activeProfile.displacement}</div>
            <div className="text-[10px] font-code-sm text-outline">{activeProfile.cylinderCount} Cylinders</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase">{isAr ? 'ناقل الحركة' : 'Transmission'}</span>
            <div className="text-xs font-bold text-on-surface truncate">{activeProfile.transmission}</div>
            <div className="text-[10px] font-code-sm text-secondary">{activeProfile.driveType}</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase">{isAr ? 'نوع الوقود' : 'Fuel Type'}</span>
            <div className="text-xs font-bold text-on-surface truncate">{activeProfile.fuelType}</div>
            <div className="text-[10px] font-code-sm text-outline">Direct Injection</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase">{isAr ? 'بطارية 12V' : 'Battery'}</span>
            <div className="text-xs font-bold text-primary truncate">{activeProfile.battery.groupSize}</div>
            <div className="text-[10px] font-code-sm text-outline">{activeProfile.battery.cca} CCA</div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1">
            <span className="text-[10px] font-telemetry-label text-outline uppercase">{isAr ? 'عزم المسامير' : 'Lug Torque'}</span>
            <div className="text-xs font-bold text-secondary truncate">{activeProfile.tires.wheelLugTorque}</div>
            <div className="text-[10px] font-code-sm text-outline">{activeProfile.tires.boltPattern}</div>
          </div>
        </div>

        {/* 4. TABS / SECTIONS FOR FLUIDS, BATTERY, TIRES, SERVICE INTERVALS & TASKS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FLUIDS & CAPACITIES */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">opacity</span>
                <h3 className="font-headline-md text-base text-on-surface font-semibold">
                  {isAr ? 'السوائل والسعات المعتمدة (Fluids)' : 'Factory Approved Fluids & Capacities'}
                </h3>
              </div>
              <span className="text-[10px] font-code-sm text-outline">OEM Approved</span>
            </div>

            <div className="space-y-3">
              {activeProfile.fluids.map((fl, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 space-y-1 text-xs font-code-sm"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-on-surface">{fl.name}</span>
                    <span className="text-primary-container">{fl.capacity}</span>
                  </div>
                  <div className="text-primary font-medium">{fl.spec}</div>
                  <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                    <span>Interval: {fl.serviceInterval}</span>
                  </div>
                  {fl.notes && (
                    <div className="text-[10px] text-outline-variant italic pt-0.5">Note: {fl.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* BATTERY & ELECTRICAL INFORMATION */}
          <div className="bg-surface-container-low p-5 rounded-xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">bolt</span>
                <h3 className="font-headline-md text-base text-on-surface font-semibold">
                  {isAr ? 'مواصفات البطارية والكهرباء (Battery Information)' : 'Battery & Electrical Specifications'}
                </h3>
              </div>
              <span className="text-[10px] font-code-sm text-secondary">
                {activeProfile.battery.chemistry}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-code-sm">
              <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5">
                <span className="text-[10px] text-outline uppercase font-telemetry-label">
                  {isAr ? 'حجم المجموعة BCI' : 'BCI Group Size'}
                </span>
                <div className="text-sm font-bold text-on-surface mt-0.5">
                  {activeProfile.battery.groupSize}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5">
                <span className="text-[10px] text-outline uppercase font-telemetry-label">
                  {isAr ? 'أمبير التدوير البارد CCA' : 'Cold Cranking Amps'}
                </span>
                <div className="text-sm font-bold text-primary-container mt-0.5">
                  {activeProfile.battery.cca} CCA
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5">
                <span className="text-[10px] text-outline uppercase font-telemetry-label">
                  {isAr ? 'سعة الاحتياطي (RC)' : 'Reserve Capacity'}
                </span>
                <div className="text-sm font-bold text-on-surface mt-0.5">
                  {activeProfile.battery.reserveCapacityMinutes} Minutes
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5">
                <span className="text-[10px] text-outline uppercase font-telemetry-label">
                  {isAr ? 'رقم القطعة OEM' : 'OEM Part Number'}
                </span>
                <div className="text-xs font-bold text-secondary mt-0.5 truncate">
                  {activeProfile.battery.partNumberOEM}
                </div>
              </div>
            </div>

            {/* Tires information */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-lg">tire_repair</span>
                <span className="text-xs font-bold text-on-surface">
                  {isAr ? 'مواصفات الإطارات والجنوط (Tire Information)' : 'Tire & Wheel Specifications'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-lowest border border-white/5 space-y-1.5 text-xs font-code-sm">
                <div className="flex justify-between">
                  <span className="text-outline">Tire Size (Front/Rear):</span>
                  <span className="text-on-surface font-semibold">{activeProfile.tires.standardFront}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Cold Pressure (F/R):</span>
                  <span className="text-secondary font-bold">
                    {activeProfile.tires.pressureColdFrontPsi} / {activeProfile.tires.pressureColdRearPsi} PSI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Wheel Lug Torque:</span>
                  <span className="text-primary-container font-bold">{activeProfile.tires.wheelLugTorque}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Bolt Pattern:</span>
                  <span className="text-on-surface">{activeProfile.tires.boltPattern}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SERVICE INTERVALS TABLE */}
        <div className="bg-surface-container-low p-5 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">event_repeat</span>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {isAr ? 'جداول الصيانة المعتمدة للمركبة (Service Intervals)' : 'Factory Service Intervals & Maintenance Schedule'}
              </h3>
            </div>
            <span className="text-[10px] font-code-sm text-outline">Factory CBS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {activeProfile.serviceIntervals.map((interval, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-surface-container-lowest border border-white/5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-code-sm uppercase px-2 py-0.5 rounded font-bold ${
                        interval.severity === 'critical'
                          ? 'bg-error-container/20 text-error'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {interval.mileage.toLocaleString()} mi / {interval.months} mo
                    </span>
                    <span className="text-[10px] font-code-sm text-secondary font-semibold">
                      {interval.serviceCategory}
                    </span>
                  </div>
                  <h4 className="font-headline-md text-xs font-bold text-on-surface mt-1.5">
                    {interval.title}
                  </h4>
                  <p className="text-[11px] font-body-sm text-outline mt-1 leading-relaxed">
                    {interval.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. KNOWN MAINTENANCE TASKS & TSBS */}
        <div className="bg-surface-container-low p-5 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">build_circle</span>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {isAr ? 'مهام الصيانة الشائعة ونشرات TSB (Known Maintenance Tasks)' : 'Known Maintenance Tasks, TSBs & Repair Procedures'}
              </h3>
            </div>
            <span className="text-[10px] font-code-sm text-primary-container">OEM Technical Bulletins</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProfile.knownMaintenanceTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-surface-container-lowest border border-white/5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-primary-container/15 text-primary-container text-[10px] font-code-sm font-bold">
                      {task.system}
                    </span>
                    <span className="text-xs font-code-sm text-outline">{task.estimatedLaborHours} hrs labor</span>
                  </div>

                  <h4 className="font-headline-md text-sm font-bold text-on-surface">{task.title}</h4>
                  <div className="text-xs font-code-sm text-secondary">Component: {task.component}</div>

                  {/* Symptoms */}
                  <div className="bg-surface-container-low p-2 rounded text-[11px] font-body-sm text-outline space-y-1">
                    <span className="text-[10px] font-telemetry-label uppercase text-on-surface-variant block">
                      Common Symptoms:
                    </span>
                    <ul className="list-disc ps-4 space-y-0.5">
                      {task.commonSymptoms.map((sym, sIdx) => (
                        <li key={sIdx}>{sym}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Parts */}
                  <div className="space-y-1 text-xs font-code-sm">
                    {task.recommendedParts.map((p, pIdx) => (
                      <div key={pIdx} className="flex justify-between text-outline">
                        <span>{p.name}</span>
                        <span className="text-on-surface font-semibold">{p.avgCost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="text-[11px] font-code-sm text-outline">
                    Difficulty: <span className="text-on-surface font-semibold">{task.difficulty}</span>
                  </div>
                  <button
                    onClick={() => setSelectedTaskModal(task)}
                    className="px-3 py-1.5 rounded bg-surface-container-high hover:bg-surface-bright text-primary-container text-xs font-code-sm font-bold transition-colors cursor-pointer"
                  >
                    View Procedure
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODALS */}
      <VehicleCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        lang={lang}
        currentVehicle={activeProfile}
        onSelectVehicle={(v) => {
          setActiveProfile(v);
          setStep(8);
        }}
      />

      <VehicleHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
        vehicle={activeProfile}
      />

      {/* Task Procedure View Modal */}
      {selectedTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container">
                  <span className="material-symbols-outlined text-lg">construction</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-base text-on-surface font-semibold">
                    {selectedTaskModal.title}
                  </h3>
                  <p className="font-code-sm text-xs text-outline">{selectedTaskModal.component}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskModal(null)}
                className="p-1 rounded-lg bg-surface-container text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <span className="text-[10px] font-telemetry-label text-outline uppercase">
                  Factory Procedure Summary:
                </span>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mt-1 p-3 bg-surface-container-low rounded-xl border border-white/5">
                  {selectedTaskModal.factoryProcedureSummary}
                </p>
              </div>

              {selectedTaskModal.torqueSpecs && selectedTaskModal.torqueSpecs.length > 0 && (
                <div>
                  <span className="text-[10px] font-telemetry-label text-outline uppercase">
                    Torque Specifications:
                  </span>
                  <div className="bg-surface-container-low rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5 text-xs font-code-sm mt-1">
                    {selectedTaskModal.torqueSpecs.map((tq, idx) => (
                      <div key={idx} className="flex justify-between p-2.5">
                        <span className="text-outline">{tq.part}</span>
                        <span className="text-primary-container font-bold">{tq.spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-surface-container-low border-t border-white/5 flex justify-end">
              <button
                onClick={() => setSelectedTaskModal(null)}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-code-sm text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
