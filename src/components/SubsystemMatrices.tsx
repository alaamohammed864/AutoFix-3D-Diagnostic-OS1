import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface SubsystemMatricesProps {
  lang: Language;
}

export const SubsystemMatrices: React.FC<SubsystemMatricesProps> = ({ lang }) => {
  const t = translations[lang];
  const [relearningPdk, setRelearningPdk] = useState(false);
  const [relearnProgress, setRelearnProgress] = useState(0);

  const startPdkRelearn = () => {
    if (relearningPdk) return;
    setRelearningPdk(true);
    setRelearnProgress(10);

    const interval = setInterval(() => {
      setRelearnProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setRelearningPdk(false), 1200);
          return 100;
        }
        return prev + 20;
      });
    }, 450);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold">
            {t.subsystemMatrices}
          </h2>
          <p className="font-code-sm text-code-sm text-outline">{t.subsystemsSub}</p>
        </div>
        <span className="font-code-sm text-xs text-secondary hidden sm:inline">
          {t.allProbesConnected}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Subsystem 1: Braking System */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-lg space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">adjust</span>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {t.brakingAbs}
              </h3>
            </div>
            <span className="font-code-sm text-xs text-primary-container">CAN ID: 0x1A0</span>
          </div>

          {/* Brake Pad Thickness Gauges */}
          <div className="space-y-2">
            <span className="font-telemetry-label text-telemetry-label text-outline uppercase">
              {t.frictionPadLife}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-code-sm">
              <div className="bg-surface-container-low p-2 rounded border border-white/5">
                <div className="flex justify-between text-outline text-[10px]">
                  <span>{t.frontLeft}</span>
                  <span className="text-on-surface font-bold">72%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-2 rounded border border-white/5">
                <div className="flex justify-between text-outline text-[10px]">
                  <span>{t.frontRight}</span>
                  <span className="text-on-surface font-bold">70%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-2 rounded border border-white/5">
                <div className="flex justify-between text-outline text-[10px]">
                  <span>{t.rearLeft}</span>
                  <span className="text-tertiary-fixed-dim font-bold">45%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-tertiary-container h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="bg-surface-container-low p-2 rounded border border-white/5">
                <div className="flex justify-between text-outline text-[10px]">
                  <span>{t.rearRight}</span>
                  <span className="text-tertiary-fixed-dim font-bold">44%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-tertiary-container h-full rounded-full" style={{ width: '44%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-surface-container pt-2 text-xs font-code-sm space-y-1 text-outline">
            <div className="flex justify-between">
              <span>{t.rotorThickness}</span>
              <span className="text-on-surface">33.8 mm (Min: 32mm)</span>
            </div>
            <div className="flex justify-between">
              <span>{t.absValves}</span>
              <span className="text-primary-container">Nominal / Ready</span>
            </div>
          </div>
        </div>

        {/* Subsystem 2: Thermal & Cooling */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-lg space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">device_thermostat</span>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {t.thermalCooling}
              </h3>
            </div>
            <span className="font-code-sm text-xs text-primary-container">CAN ID: 0x228</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-code-sm">
            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col border border-white/5">
              <span className="text-[10px] text-outline font-telemetry-label">{t.coolantTemp}</span>
              <span className="font-telemetry-value-md text-telemetry-value-md text-on-surface mt-1">
                92°C
              </span>
              <span className="text-[10px] text-secondary">Target: 90-105°C</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-lg flex flex-col border border-white/5">
              <span className="text-[10px] text-outline font-telemetry-label">{t.fanDutyCycle}</span>
              <span className="font-telemetry-value-md text-telemetry-value-md text-primary-container mt-1">
                28%
              </span>
              <span className="text-[10px] text-outline">PWM Modulated</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-2.5 rounded-lg space-y-1.5 text-xs font-code-sm border border-white/5">
            <div className="flex justify-between">
              <span className="text-outline">{t.thermostatPos}</span>
              <span className="text-on-surface font-medium">Mapped Open (42%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">{t.auxPump}</span>
              <span className="text-secondary font-medium">Active (Stage 1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">{t.radiatorShutter}</span>
              <span className="text-on-surface font-medium">Auto Regulating</span>
            </div>
          </div>
        </div>

        {/* Subsystem 3: Electrical & Battery */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-lg space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">bolt</span>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {t.electricalWiring}
              </h3>
            </div>
            <span className="font-code-sm text-xs text-primary-container">CAN ID: 0x3C4</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-code-sm">
              <span className="text-outline font-telemetry-label">{t.batteryCharge}</span>
              <span className="text-primary-container font-bold">94%</span>
            </div>
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-code-sm">
            <div className="bg-surface-container-low p-2 rounded border border-white/5">
              <span className="text-outline text-[10px]">{t.alternator}</span>
              <div className="text-on-surface font-bold text-sm">14.4 V</div>
              <span className="text-[10px] text-secondary">Peak Output</span>
            </div>
            <div className="bg-surface-container-low p-2 rounded border border-white/5">
              <span className="text-outline text-[10px]">{t.drainCurrent}</span>
              <div className="text-on-surface font-bold text-sm">0.02 A</div>
              <span className="text-[10px] text-outline">Quiescent OK</span>
            </div>
          </div>

          <div className="border-t border-surface-container pt-2 text-xs font-code-sm space-y-1 text-outline">
            <div className="flex justify-between">
              <span>{t.batteryHealth}</span>
              <span className="text-secondary font-medium">98% (Original)</span>
            </div>
            <div className="flex justify-between">
              <span>{t.internalResistance}</span>
              <span className="text-on-surface">3.8 mΩ</span>
            </div>
          </div>
        </div>

        {/* Subsystem 4: Transmission & PDK */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-lg space-y-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">auto_mode</span>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {t.transmissionPdk}
              </h3>
            </div>
            <span className="font-code-sm text-xs text-primary-container">CAN ID: 0x488</span>
          </div>

          <div className="bg-surface-container-low p-3 rounded-lg flex items-center justify-between border border-white/5">
            <div>
              <span className="font-telemetry-label text-telemetry-label text-outline">
                {t.clutchFluid}
              </span>
              <div className="font-telemetry-value-md text-telemetry-value-md text-secondary mt-0.5">
                88% <span className="text-xs text-outline font-normal">Health</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
          </div>

          <div className="space-y-1.5 text-xs font-code-sm text-outline">
            <div className="flex justify-between">
              <span>{t.clutch1}</span>
              <span className="text-on-surface font-medium">0.82 mm wear</span>
            </div>
            <div className="flex justify-between">
              <span>{t.clutch2}</span>
              <span className="text-on-surface font-medium">0.79 mm wear</span>
            </div>
            <div className="flex justify-between">
              <span>{t.shiftAdaptation}</span>
              <span className="text-primary-container font-medium">Calibrated (12ms)</span>
            </div>
            <div className="flex justify-between">
              <span>{t.differentialLock}</span>
              <span className="text-on-surface font-medium">PTM Torque Vector OK</span>
            </div>
          </div>

          {relearningPdk ? (
            <div className="space-y-1.5 bg-surface-container-low p-2 rounded-lg border border-primary-container/30">
              <div className="flex justify-between text-xs font-code-sm text-primary-container font-semibold">
                <span>Learning Clutches...</span>
                <span>{relearnProgress}%</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary-container h-full transition-all duration-300"
                  style={{ width: `${relearnProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              onClick={startPdkRelearn}
              className="w-full bg-surface-container-high hover:bg-surface-bright text-on-surface py-2 rounded-lg font-code-sm text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer border border-white/5"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>{t.relearnPdk}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
