// AutoFix 3D - ECU Network Topology & Bus Disconnect Simulator
// Multi-node interactive vehicle network map with real-time fault generation

import React from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';

interface EcuTopologyMapProps {
  lang: Language;
}

export const EcuTopologyMap: React.FC<EcuTopologyMapProps> = ({ lang }) => {
  const { ecuNodes, toggleEcuConnection, activeDtcs } = useSimulation();
  const isArabic = lang === 'ar';

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">hub</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'طوبولوجيا شبكة وحدات التحكم (ECU Network Map)' : 'ECU Network Topology'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-primary-container/20 text-primary-container border border-primary-container/30">
                7 NODES ACTIVE
              </span>
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'فحص سلامة الاتصال بين وحدات التحكم ومحاكاة انقطاع خطوط CAN وتوليد أكواد U-Codes'
                : 'Inspect node health, firmware levels, and simulate physical bus severance (U-Code faults)'}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-code-sm">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            {isArabic ? 'متصل' : 'ONLINE'}
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-400"></span>
            {isArabic ? 'مقطوع' : 'DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* Network Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.values(ecuNodes).map((node) => {
          const isOnline = node.status === 'ONLINE';

          return (
            <div
              key={node.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isOnline
                  ? 'bg-surface-container-low border-white/10 hover:border-white/20'
                  : 'bg-rose-500/10 border-rose-500/40 shadow-lg'
              }`}
            >
              {/* Node Top Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-xs font-code-sm font-bold text-primary-container">
                    {node.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-code-sm font-bold uppercase ${
                      isOnline
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                    }`}
                  >
                    {isOnline ? (isArabic ? 'متصل' : 'ONLINE') : isArabic ? 'مفصول' : 'DISCONNECTED'}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-on-surface line-clamp-1">
                  {isArabic ? node.arabicName : node.name}
                </h3>
                <p className="text-[11px] text-outline line-clamp-2">{node.description}</p>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-code-sm border-t border-b border-white/5 py-2">
                <div>
                  <span className="text-outline block">{isArabic ? 'البروتوكول:' : 'Protocol:'}</span>
                  <span className="text-on-surface font-semibold">{node.protocol}</span>
                </div>
                <div>
                  <span className="text-outline block">{isArabic ? 'السرعة:' : 'Baud Rate:'}</span>
                  <span className="text-on-surface font-semibold">{node.baudRate}</span>
                </div>
                <div>
                  <span className="text-outline block">{isArabic ? 'زمن الاستجابة:' : 'Latency:'}</span>
                  <span className={isOnline ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                    {isOnline ? `${node.latencyMs} ms` : 'TIMEOUT'}
                  </span>
                </div>
                <div>
                  <span className="text-outline block">{isArabic ? 'الجهد:' : 'Supply V:'}</span>
                  <span className="text-cyan-400 font-semibold">{node.voltageV} V</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] font-code-sm text-outline truncate">
                  {node.softwareVersion}
                </span>

                <button
                  onClick={() => toggleEcuConnection(node.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-code-sm transition-colors cursor-pointer whitespace-nowrap ${
                    isOnline
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                >
                  {isOnline
                    ? isArabic
                      ? 'فصل الكيبل'
                      : 'Disconnect Wire'
                    : isArabic
                    ? 'إعادة التوصيل'
                    : 'Reconnect Wire'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network Trouble Codes Notice */}
      {activeDtcs.some((c) => c.startsWith('U01')) && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs">
          <span className="material-symbols-outlined text-rose-400 text-base mt-0.5">warning</span>
          <div className="space-y-1">
            <span className="font-bold text-rose-400">
              {isArabic ? 'تم اكتشاف فقدان اتصال في شبكة CAN Bus (U-Codes Active)' : 'CAN Bus Network Communication Loss Detected'}
            </span>
            <p className="text-on-surface-variant">
              {isArabic
                ? 'فصل أسلاك وحدات التحكم يؤدي لتسجيل أكواد U0100/U0101 في وحدة ECM نظراً لانقطاع الرسائل الدورية على خط CAN-High.'
                : 'Disconnecting nodes interrupts cyclic heartbeat frames, immediately triggering U0100/U0101 communication loss codes on ECM.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
