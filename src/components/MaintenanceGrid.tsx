import React from 'react';
import { Language, MaintenanceItem } from '../types';
import { translations } from '../data/translations';

interface MaintenanceGridProps {
  lang: Language;
  items: MaintenanceItem[];
  onOpenProcedure: (item: MaintenanceItem) => void;
}

export const MaintenanceGrid: React.FC<MaintenanceGridProps> = ({
  lang,
  items,
  onOpenProcedure,
}) => {
  const t = translations[lang];

  return (
    <section className="bg-surface-container-lowest rounded-xl p-5 lg:p-6 shadow-xl space-y-6 border border-white/5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-surface-container text-tertiary-container">
              <span className="material-symbols-outlined text-lg">schedule</span>
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
              {t.maintenanceDue}
            </h2>
          </div>
          <p className="font-code-sm text-code-sm text-outline mt-1">{t.factoryInterval}</p>
        </div>

        {/* Mileage Progress Readout */}
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-3 rounded-xl border border-white/5">
          <div className="flex flex-col">
            <span className="font-telemetry-label text-telemetry-label text-outline uppercase">
              {t.currentOdometer}
            </span>
            <span className="font-telemetry-value-md text-telemetry-value-md text-on-surface">
              45,000 <span className="text-xs text-outline font-normal">mi</span>
            </span>
          </div>
          <div className="h-8 w-px bg-surface-container-highest"></div>
          <div className="flex flex-col">
            <span className="font-telemetry-label text-telemetry-label text-outline uppercase">
              {t.nextMajorInspection}
            </span>
            <span className="font-telemetry-value-md text-telemetry-value-md text-secondary">
              {t.inMiles}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Maintenance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-surface-container rounded-xl p-4 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all border border-white/5 group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-code-sm font-bold uppercase ${
                    item.badgeType === 'error'
                      ? 'bg-error-container text-on-error-container'
                      : item.badgeType === 'warning'
                      ? 'bg-tertiary-container/20 text-tertiary-container'
                      : item.badgeType === 'success'
                      ? 'bg-secondary/15 text-secondary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {item.badge}
                </span>
                <span
                  className={`material-symbols-outlined text-lg ${
                    item.badgeType === 'error'
                      ? 'text-error'
                      : item.badgeType === 'success'
                      ? 'text-secondary'
                      : 'text-outline'
                  }`}
                >
                  {item.icon}
                </span>
              </div>
              <h3 className="font-headline-md text-base text-on-surface font-semibold group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg space-y-1 text-xs font-code-sm text-outline border border-white/5">
              {item.specs.map((spec, sIdx) => (
                <div key={sIdx} className="flex justify-between">
                  <span>{spec.label}</span>
                  <span
                    className={`font-medium ${
                      spec.error
                        ? 'text-error'
                        : spec.highlight
                        ? 'text-primary-container'
                        : 'text-on-surface'
                    }`}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onOpenProcedure(item)}
              className={`w-full py-2 rounded-lg font-code-sm text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                item.actionType === 'error'
                  ? 'bg-error hover:bg-error/90 text-on-error font-semibold shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                  : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-sm">
                {item.actionType === 'error' ? 'play_arrow' : 'build'}
              </span>
              <span>{item.actionLabel}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
