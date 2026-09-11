import React, { useState, useEffect, useMemo } from 'react';
import { Language, NavPath } from '../types';
import { executeGlobalSearch, GlobalSearchResultItem } from '../db/fuzzySearch';
import { VehicleProfileData } from '../db/vehicleTypes';
import { getVehicleProfileById } from '../db/vehicleDatabase';
import {
  isArabicText,
  analyzeMultilingualAutomotiveQuery,
} from '../search/terminologyMap';
import { useVoiceSearch } from '../search/useVoiceSearch';
import { VoiceSearchButton } from '../search/VoiceSearchButton';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (path: NavPath) => void;
  onOpenDiagnosticTree: () => void;
  onOpenObdLog: () => void;
  onSelectVehicleProfile?: (profile: VehicleProfileData) => void;
}

type CategoryFilter =
  | 'all'
  | 'vehicles'
  | 'repairs'
  | 'parts'
  | 'systems'
  | 'diagnostics'
  | 'maintenance'
  | 'DTC codes'
  | 'tools';

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigate,
  onOpenDiagnosticTree,
  onOpenObdLog,
  onSelectVehicleProfile,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchLang, setSearchLang] = useState<Language>(lang);

  // Sync search language with app language when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchLang(lang);
    }
  }, [isOpen, lang]);

  const isQueryArabic = useMemo(() => isArabicText(query), [query]);
  const isArMode = searchLang === 'ar' || isQueryArabic;

  // Voice Search Hook with language toggle
  const voice = useVoiceSearch({
    lang: searchLang,
    onResult: (transcript, isFinal) => {
      setQuery(transcript);
    },
  });

  // Global keydown listener for CTRL + K & CMD + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          voice.stopListening();
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        voice.stopListening();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, voice]);

  // Multilingual Query Entity Analysis
  const entityAnalysis = useMemo(() => {
    if (!query || query.trim().length === 0) return null;
    return analyzeMultilingualAutomotiveQuery(query);
  }, [query]);

  // Execute search across entire database with bilingual ranking
  const searchResults = useMemo(() => {
    return executeGlobalSearch(query, searchLang);
  }, [query, searchLang]);

  // Filter by category
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return searchResults;
    return searchResults.filter((item) => item.category === activeCategory);
  }, [searchResults, activeCategory]);

  if (!isOpen) return null;

  const categories: { key: CategoryFilter; labelEn: string; labelAr: string; icon: string }[] = [
    { key: 'all', labelEn: 'All', labelAr: 'الكل', icon: 'apps' },
    { key: 'vehicles', labelEn: 'Vehicles', labelAr: 'مركبات', icon: 'directions_car' },
    { key: 'repairs', labelEn: 'Repairs', labelAr: 'إصلاحات', icon: 'build_circle' },
    { key: 'parts', labelEn: 'Parts', labelAr: 'قطع غيار', icon: 'inventory_2' },
    { key: 'systems', labelEn: 'Systems', labelAr: 'أنظمة', icon: 'settings_input_component' },
    { key: 'diagnostics', labelEn: 'Diagnostics', labelAr: 'تشخيص', icon: 'query_stats' },
    { key: 'maintenance', labelEn: 'Maintenance', labelAr: 'صيانة', icon: 'schedule' },
    { key: 'DTC codes', labelEn: 'DTC Codes', labelAr: 'أكواد DTC', icon: 'warning' },
    { key: 'tools', labelEn: 'Tools', labelAr: 'أدوات', icon: 'handyman' },
  ];

  const handleItemClick = (item: GlobalSearchResultItem) => {
    voice.stopListening();
    onClose();

    // Auto-load profile if present
    if (item.metadata?.vehicleId && onSelectVehicleProfile) {
      const profile = getVehicleProfileById(item.metadata.vehicleId);
      if (profile) {
        onSelectVehicleProfile(profile);
      }
    }

    if (item.category === 'vehicles') {
      onNavigate('vehicle-explorer');
      return;
    }

    if (item.category === 'repairs') {
      onNavigate('repair-guides');
      return;
    }

    if (item.category === 'DTC codes') {
      onNavigate('live-dtc-scanner');
      return;
    }

    if (item.category === 'diagnostics') {
      onOpenObdLog();
      return;
    }

    if (item.category === 'maintenance') {
      onNavigate('service-schedules');
      return;
    }

    if (item.category === 'tools') {
      onNavigate('tools-torque');
      return;
    }

    if (item.category === 'systems' || item.id?.includes('comp-')) {
      if (
        item.id === 'comp-battery' ||
        item.id === 'comp-alternator' ||
        item.id === 'comp-starter' ||
        item.id === 'sys-elec' ||
        item.id === 'def-comp-alt'
      ) {
        onNavigate('electrical-wiring');
      } else if (item.id === 'sys-brake') {
        onNavigate('braking-abs');
      } else if (item.id === 'sys-trans') {
        onNavigate('transmission-pdk');
      } else if (item.id === 'sys-cool' || item.id === 'comp-radiator' || item.id === 'comp-water-pump') {
        onNavigate('thermal-cooling');
      } else {
        onNavigate('powertrain-engine');
      }
      return;
    }

    onNavigate('vehicle-explorer');
  };

  const getCategoryIcon = (cat: GlobalSearchResultItem['category']) => {
    switch (cat) {
      case 'vehicles':
        return 'directions_car';
      case 'repairs':
        return 'build_circle';
      case 'parts':
        return 'inventory_2';
      case 'systems':
        return 'settings_input_component';
      case 'diagnostics':
        return 'query_stats';
      case 'maintenance':
        return 'schedule';
      case 'DTC codes':
        return 'warning';
      case 'tools':
        return 'handyman';
      default:
        return 'search';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        dir={isArMode ? 'rtl' : 'ltr'}
        className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col transition-all max-h-[90vh]"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-surface-container-low">
          <span className="material-symbols-outlined text-outline text-xl shrink-0">search</span>

          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isArMode
                ? 'ابحث باللغة العربية أو الإنجليزية (مثال: تغيير بطارية تويوتا كامري 2018)...'
                : 'Search in English or Arabic (e.g. Toyota Camry 2018 battery replacement)...'
            }
            className="flex-1 bg-transparent text-on-surface font-code-sm text-xs sm:text-sm focus:outline-none placeholder:text-outline-variant min-w-0"
          />

          {/* Voice Search Button */}
          <VoiceSearchButton
            isListening={voice.isListening}
            isSupported={voice.isSupported}
            lang={searchLang}
            onClick={() => voice.toggleListening()}
            size="sm"
          />

          {/* Language selector chip inside search */}
          <div className="flex items-center gap-1 bg-surface-container px-1 py-0.5 rounded-lg border border-white/5 text-[10px] font-code-sm shrink-0">
            <button
              type="button"
              onClick={() => setSearchLang('en')}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                searchLang === 'en'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setSearchLang('ar')}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                searchLang === 'ar'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              عربي
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <kbd className="px-1.5 py-0.5 bg-surface-container text-outline rounded text-[10px] font-code-sm font-bold">
              ESC
            </kbd>
          </div>
        </div>

        {/* Live Voice Recording Status Banner */}
        {voice.isListening && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 flex items-center justify-between text-xs font-code-sm text-rose-300 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span>
                {isArMode
                  ? 'جاري الاستماع لصوتك (عربي/إنجليزي)... تحدث الآن'
                  : 'Listening to your voice (Arabic/English)... Speak now'}
              </span>
            </div>
            {voice.interimTranscript && (
              <span className="italic text-on-surface max-w-[200px] truncate">
                "{voice.interimTranscript}"
              </span>
            )}
            <button
              type="button"
              onClick={() => voice.stopListening()}
              className="text-[11px] underline hover:text-white cursor-pointer"
            >
              {isArMode ? 'إنهاء' : 'Stop'}
            </button>
          </div>
        )}

        {/* Voice Error Notice if blocked */}
        {voice.errorMessage && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-[11px] font-code-sm text-amber-300 flex items-center justify-between">
            <span>{voice.errorMessage}</span>
            <button
              type="button"
              onClick={() => voice.clearTranscript()}
              className="text-amber-200 hover:underline cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Multilingual Detected Entities Bar */}
        {entityAnalysis && (entityAnalysis.makeEn || entityAnalysis.componentEn || entityAnalysis.actionEn || entityAnalysis.year || entityAnalysis.dtcCode) && (
          <div className="bg-surface-container px-3.5 py-2 border-b border-white/5 flex items-center gap-2 flex-wrap text-[11px] font-code-sm">
            <span className="text-outline text-[10px] uppercase font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary-container">psychology</span>
              <span>{isArMode ? 'الكيانات المستخرجة:' : 'Detected Entities:'}</span>
            </span>

            {entityAnalysis.year && (
              <span className="bg-primary-container/20 text-primary-container border border-primary-container/30 px-2 py-0.5 rounded font-bold">
                {entityAnalysis.year}
              </span>
            )}

            {entityAnalysis.makeEn && (
              <span className="bg-secondary/20 text-secondary border border-secondary/30 px-2 py-0.5 rounded font-bold">
                {isArMode ? entityAnalysis.makeAr || entityAnalysis.makeEn : entityAnalysis.makeEn}
              </span>
            )}

            {entityAnalysis.modelEn && (
              <span className="bg-secondary/20 text-secondary border border-secondary/30 px-2 py-0.5 rounded font-bold">
                {isArMode ? entityAnalysis.modelAr || entityAnalysis.modelEn : entityAnalysis.modelEn}
              </span>
            )}

            {entityAnalysis.componentEn && (
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded font-bold">
                {isArMode ? entityAnalysis.componentAr || entityAnalysis.componentEn : entityAnalysis.componentEn}
              </span>
            )}

            {entityAnalysis.actionEn && (
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                {isArMode ? entityAnalysis.actionAr || entityAnalysis.actionEn : entityAnalysis.actionEn}
              </span>
            )}

            {entityAnalysis.dtcCode && (
              <span className="bg-error-container/20 text-error border border-error/30 px-2 py-0.5 rounded font-bold">
                {entityAnalysis.dtcCode}
              </span>
            )}
          </div>
        )}

        {/* Quick Clickable Query Presets for testing & discovery */}
        {(!query || query.length < 3) && (
          <div className="px-3.5 py-2 bg-surface-container-low border-b border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-code-sm">
            <span className="text-[10px] text-outline uppercase font-bold shrink-0 me-1">
              {isArMode ? 'أمثلة مطابقة:' : 'Sample Queries:'}
            </span>

            <button
              type="button"
              onClick={() => setQuery('تغيير بطارية تويوتا كامري 2018')}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-amber-300 border border-amber-400/20 shrink-0 cursor-pointer transition-colors"
            >
              "تغيير بطارية تويوتا كامري 2018"
            </button>

            <button
              type="button"
              onClick={() => setQuery('Toyota Camry 2018 battery replacement')}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-primary-container border border-primary-container/20 shrink-0 cursor-pointer transition-colors"
            >
              "Toyota Camry 2018 battery replacement"
            </button>

            <button
              type="button"
              onClick={() => setQuery('مضخة الوقود')}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface border border-white/10 shrink-0 cursor-pointer transition-colors"
            >
              "مضخة الوقود"
            </button>

            <button
              type="button"
              onClick={() => setQuery('مولد دينامو')}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface border border-white/10 shrink-0 cursor-pointer transition-colors"
            >
              "مولد دينامو"
            </button>

            <button
              type="button"
              onClick={() => setQuery('DTC P0171')}
              className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-error border border-error/20 shrink-0 cursor-pointer transition-colors"
            >
              "DTC P0171"
            </button>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container overflow-x-auto no-scrollbar border-b border-white/5 text-[11px] font-code-sm shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{cat.icon}</span>
              <span>{isArMode ? cat.labelAr : cat.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1 flex-1 min-h-[220px]">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-outline font-code-sm space-y-2">
              <span className="material-symbols-outlined text-3xl text-outline-variant">search_off</span>
              <p>
                {isArMode
                  ? 'لم يتم العثور على نتائج مطابقة. جرب البحث عن: تغيير بطارية كامري أو فورد تبريد أو كود P0171 أو مضخة الوقود'
                  : 'No matching items found. Try: "Toyota Camry 2018 battery replacement" or "Ford F-150 coolant" or "P0171"'}
              </p>
            </div>
          ) : (
            filteredResults.map((item) => {
              const displayTitle = isArMode && item.titleAr ? item.titleAr : item.title;
              const displaySubtitle = isArMode && item.subtitleAr ? item.subtitleAr : item.subtitle;
              const displayBadge = isArMode && item.badgeAr ? item.badgeAr : item.badge;
              const secondaryTitle = isArMode ? item.title : item.titleAr;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full text-start p-2.5 rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        item.category === 'DTC codes'
                          ? 'bg-error-container/20 text-error'
                          : item.category === 'vehicles'
                          ? 'bg-primary-container/15 text-primary-container'
                          : item.category === 'repairs'
                          ? 'bg-secondary/15 text-secondary'
                          : item.category === 'systems'
                          ? 'bg-amber-400/15 text-amber-300'
                          : 'bg-surface-container-low text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {getCategoryIcon(item.category)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-code-sm font-semibold text-on-surface group-hover:text-primary-container transition-colors truncate">
                        {displayTitle}
                      </div>

                      {secondaryTitle && secondaryTitle !== displayTitle && (
                        <div className="text-[10px] font-code-sm text-outline-variant truncate">
                          {secondaryTitle}
                        </div>
                      )}

                      <div className="text-[11px] font-body-sm text-outline mt-0.5 truncate">
                        {displaySubtitle}
                      </div>
                    </div>
                  </div>

                  {displayBadge && (
                    <span
                      className={`text-[10px] font-code-sm uppercase px-2 py-0.5 rounded shrink-0 ms-2 ${
                        item.category === 'DTC codes'
                          ? 'bg-error-container text-on-error-container font-bold'
                          : item.category === 'systems'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold'
                          : 'bg-surface-container-low text-outline-variant'
                      }`}
                    >
                      {displayBadge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2.5 bg-surface-container-low border-t border-white/5 flex items-center justify-between text-[11px] font-code-sm text-outline shrink-0">
          <span>
            {isArMode
              ? `${filteredResults.length} نتيجة مطابقة (عربي / إنجليزي)`
              : `${filteredResults.length} matching entities indexed (Bilingual AR/EN)`}
          </span>
          <div className="flex items-center gap-2">
            <span>{isArMode ? 'اضغط ↵ للاختيار' : 'Press ↵ to select'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
