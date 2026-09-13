// AutoFix 3D - Real-time CAN Bus Traffic Analyzer & Protocol Sniffer
// Frame decoding, bus load calculation, and ECU message filtering

import React, { useState } from 'react';
import { Language } from '../../types';
import { useSimulation } from '../../simulation/SimulationContext';

interface CanBusAnalyzerProps {
  lang: Language;
}

export const CanBusAnalyzer: React.FC<CanBusAnalyzerProps> = ({ lang }) => {
  const { canMessages } = useSimulation();
  const [selectedEcuFilter, setSelectedEcuFilter] = useState<string>('ALL');
  const [searchId, setSearchId] = useState<string>('');
  const [isTrafficPaused, setIsTrafficPaused] = useState<boolean>(false);

  const isArabic = lang === 'ar';

  const filteredMessages = canMessages.filter((msg) => {
    if (selectedEcuFilter !== 'ALL' && msg.ecu !== selectedEcuFilter) return false;
    if (searchId && !msg.id.toLowerCase().includes(searchId.toLowerCase()) && !msg.name.toLowerCase().includes(searchId.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalFrames = canMessages.reduce((acc, m) => acc + m.count, 0);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="p-5 rounded-2xl bg-surface-container-lowest border border-white/10 shadow-2xl space-y-6 text-on-surface"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
            <span className="material-symbols-outlined text-2xl">cable</span>
          </div>
          <div>
            <h2 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{isArabic ? 'محلل حركة شبكة CAN Bus المباشر' : 'Live CAN Bus Traffic Analyzer'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-code-sm font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                500 kbps HS-CAN
              </span>
            </h2>
            <p className="text-xs text-outline">
              {isArabic
                ? 'مراقبة حزم البيانات المتبادلة بين وحدات التحكم بصيغة Hexadecimal وفك شفرة البايتات هندسياً'
                : 'Sniff inter-ECU CAN arbitration IDs, hex payloads, cycle rates, and decoded physical parameters'}
            </p>
          </div>
        </div>

        {/* Bus Stats & Pause Controls */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-surface-container border border-white/5 text-xs font-code-sm flex items-center gap-2">
            <span className="text-outline">{isArabic ? 'حمل الناقل:' : 'Bus Load:'}</span>
            <span className="font-bold text-emerald-400">32.8%</span>
            <span className="text-outline">|</span>
            <span className="text-outline">{isArabic ? 'إجمالي الحزم:' : 'Total Frames:'}</span>
            <span className="font-bold text-on-surface">{totalFrames.toLocaleString()}</span>
          </div>

          <button
            onClick={() => setIsTrafficPaused(!isTrafficPaused)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-code-sm flex items-center gap-1.5 cursor-pointer transition-colors ${
              isTrafficPaused
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface border border-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isTrafficPaused ? 'play_arrow' : 'pause'}
            </span>
            <span>{isTrafficPaused ? (isArabic ? 'استئناف' : 'Resume') : isArabic ? 'إيقاف مؤقت' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar: ECU pills + ID search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* ECU Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-code-sm">
          {['ALL', 'ECM', 'TCM', 'ABS', 'BCM', 'SRS', 'HVAC', 'ADAS'].map((ecu) => (
            <button
              key={ecu}
              onClick={() => setSelectedEcuFilter(ecu)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                selectedEcuFilter === ecu
                  ? 'bg-primary-container text-on-primary-container shadow'
                  : 'bg-surface-container text-outline hover:text-on-surface'
              }`}
            >
              {ecu}
            </button>
          ))}
        </div>

        {/* Search by ID */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute top-2.5 left-3 text-outline text-sm">
            search
          </span>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder={isArabic ? 'بحث بالمعرف (0x0C4)...' : 'Search CAN ID / Name...'}
            className="w-full bg-surface-container rounded-xl pl-9 pr-3 py-2 text-xs border border-white/5 focus:border-primary-container outline-none text-on-surface font-code-sm"
          />
        </div>
      </div>

      {/* CAN Stream Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-surface-container-low">
        <table className="w-full text-start text-xs font-code-sm border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-surface-container text-outline font-bold text-[11px] uppercase tracking-wider">
              <th className="p-3 text-start">{isArabic ? 'المعرف (ID)' : 'CAN ID'}</th>
              <th className="p-3 text-start">{isArabic ? 'الوحدة' : 'Source ECU'}</th>
              <th className="p-3 text-start">{isArabic ? 'اسم الرسالة' : 'Message Name'}</th>
              <th className="p-3 text-start">DLC</th>
              <th className="p-3 text-start">{isArabic ? 'بيانات البايتات (Hex Payload)' : 'Payload (Bytes 0-7)'}</th>
              <th className="p-3 text-start">{isArabic ? 'الدورة' : 'Cycle'}</th>
              <th className="p-3 text-start">{isArabic ? 'العدد' : 'Count'}</th>
              <th className="p-3 text-start">{isArabic ? 'المعنى الهندسي' : 'Decoded Parameters'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredMessages.map((msg) => (
              <tr key={msg.id} className="hover:bg-surface-container/60 transition-colors">
                <td className="p-3 font-bold text-primary-container whitespace-nowrap">{msg.id}</td>
                <td className="p-3">
                  <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-bold text-[10px]">
                    {msg.ecu}
                  </span>
                </td>
                <td className="p-3 font-semibold text-on-surface whitespace-nowrap">{msg.name}</td>
                <td className="p-3 text-outline">{msg.dlc}</td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1 font-mono text-cyan-300">
                    {msg.bytes.map((b, i) => (
                      <span
                        key={i}
                        className="px-1 py-0.5 rounded bg-surface-container text-[11px] border border-white/5"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-outline whitespace-nowrap">{msg.cycleTimeMs} ms</td>
                <td className="p-3 text-on-surface font-bold whitespace-nowrap">
                  {msg.count.toLocaleString()}
                </td>
                <td className="p-3 text-emerald-400 font-sans text-xs whitespace-nowrap">
                  {msg.decodedSummary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
