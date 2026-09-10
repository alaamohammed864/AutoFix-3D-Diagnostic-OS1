import React, { useState, useEffect, useMemo } from 'react';
import { Language, NavPath } from '../types';
import { executeGlobalSearch, GlobalSearchResultItem } from '../db/fuzzySearch';
import { VehicleProfileData } from '../db/vehicleTypes';
import { getVehicleProfileById } from '../db/vehicleDatabase';

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
  const isAr = lang === 'ar';

  // Global keydown listener for CTRL + K & CMD + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Execute fuzzy search from independent database module
  const searchResults = useMemo(() => {
    return executeGlobalSearch(query);
  }, [query]);

  // Filter by category if selected
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return searchResults;
    return searchResults.filter((item) => item.category === activeCategory);
  }, [searchResults, activeCategory]);

  if (!isOpen) return null;

  const categories: { key: CategoryFilter; label: string; icon: string }[] = [
    { key: 'all', label: isAr ? 'الكل' : 'All', icon: 'apps' },
    { key: 'vehicles', label: isAr ? 'مركبات' : 'Vehicles', icon: 'directions_car' },
    { key: 'repairs', label: isAr ? 'إصلاحات' : 'Repairs', icon: 'build_circle' },
    { key: 'parts', label: isAr ? 'قطع غيار' : 'Parts', icon: 'inventory_2' },
    { key: 'systems', label: isAr ? 'أنظمة' : 'Systems', icon: 'settings_input_component' },
    { key: 'diagnostics', label: isAr ? 'تشخيص' : 'Diagnostics', icon: 'query_stats' },
    { key: 'maintenance', label: isAr ? 'صيانة' : 'Maintenance', icon: 'schedule' },
    { key: 'DTC codes', label: isAr ? 'أكواد DTC' : 'DTC Codes', icon: 'warning' },
    { key: 'tools', label: isAr ? 'أدوات' : 'Tools', icon: 'handyman' },
  ];

  const handleItemClick = (item: GlobalSearchResultItem) => {
    onClose();

    if (item.category === 'vehicles' && item.metadata?.vehicleId) {
      const profile = getVehicleProfileById(item.metadata.vehicleId);
      if (profile && onSelectVehicleProfile) {
        onSelectVehicleProfile(profile);
      }
      onNavigate('vehicle-explorer');
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

    if (item.category === 'repairs' || item.category === 'maintenance') {
      if (item.metadata?.vehicle && onSelectVehicleProfile) {
        onSelectVehicleProfile(item.metadata.vehicle);
      }
      onNavigate('vehicle-explorer');
      return;
    }

    if (item.category === 'systems') {
      if (item.id === 'sys-brake') onNavigate('braking-abs');
      else if (item.id === 'sys-trans') onNavigate('transmission-pdk');
      else if (item.id === 'sys-cool') onNavigate('thermal-cooling');
      else if (item.id === 'sys-elec') onNavigate('electrical-wiring');
      else onNavigate('powertrain-engine');
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-16 p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-white/10 flex items-center gap-3 bg-surface-container-low">
          <span className="material-symbols-outlined text-outline text-xl">search</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث عبر المركبات، الإصلاحات، القطع، الأنظمة، الأكواد، أو الأدوات... (مثال: Toyota Camry 2018 battery)'
                : 'Search vehicles, repairs, parts, systems, DTC codes, maintenance, tools... (e.g. Ford F-150 coolant)'
            }
            className="flex-1 bg-transparent text-on-surface font-code-sm text-xs sm:text-sm focus:outline-none placeholder:text-outline-variant"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-surface-container text-outline rounded text-[10px] font-code-sm font-bold">
              CTRL + K
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-surface-container text-outline rounded text-[10px] font-code-sm">
              ESC
            </kbd>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-surface-container overflow-x-auto no-scrollbar border-b border-white/5 text-[11px] font-code-sm">
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
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-2 max-h-[440px] overflow-y-auto space-y-1">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-outline font-code-sm space-y-2">
              <span className="material-symbols-outlined text-3xl text-outline-variant">search_off</span>
              <p>
                {isAr
                  ? 'لم يتم العثور على نتائج مطابقة. جرب البحث عن: Toyota Camry battery أو Ford F-150 coolant أو P0171'
                  : 'No matching items found. Try: "Toyota Camry 2018 battery replacement" or "Ford F-150 2019 coolant"'}
              </p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full text-start p-2.5 rounded-xl hover:bg-surface-container-high transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      item.category === 'DTC codes'
                        ? 'bg-error-container/20 text-error'
                        : item.category === 'vehicles'
                        ? 'bg-primary-container/15 text-primary-container'
                        : item.category === 'repairs'
                        ? 'bg-secondary/15 text-secondary'
                        : 'bg-surface-container-low text-outline'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {getCategoryIcon(item.category)}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-code-sm font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-body-sm text-outline mt-0.5 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-code-sm uppercase px-2 py-0.5 rounded shrink-0 ms-2 ${
                      item.category === 'DTC codes'
                        ? 'bg-error-container text-on-error-container font-bold'
                        : 'bg-surface-container-low text-outline-variant'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2.5 bg-surface-container-low border-t border-white/5 flex items-center justify-between text-[11px] font-code-sm text-outline">
          <span>{filteredResults.length} matching entities indexed</span>
          <span>Use ↑ ↓ to navigate, ↵ to select</span>
        </div>
      </div>
    </div>
  );
};
