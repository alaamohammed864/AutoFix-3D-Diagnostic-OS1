import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface ObdLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface LogEntry {
  time: string;
  bus: string;
  canId: string;
  raw: string;
  parsed: string;
  type: 'rx' | 'tx' | 'warn';
}

export const ObdLogModal: React.FC<ObdLogModalProps> = ({ isOpen, onClose, lang }) => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '22:04:18.102', bus: 'CAN-1', canId: '0x7E0', raw: '02 01 00 55 55 55 55 55', parsed: 'QUERY: Supported PIDs [01-20]', type: 'tx' },
    { time: '22:04:18.106', bus: 'CAN-1', canId: '0x7E8', raw: '06 41 00 BE 3F B8 13 00', parsed: 'RESP: 01-20 Bitmask OK (DTC flag: 1)', type: 'rx' },
    { time: '22:04:18.140', bus: 'CAN-1', canId: '0x7E0', raw: '02 01 0C 55 55 55 55 55', parsed: 'QUERY: 0x0C Engine RPM', type: 'tx' },
    { time: '22:04:18.144', bus: 'CAN-1', canId: '0x7E8', raw: '04 41 0C 21 98 00 00 00', parsed: 'RESP: RPM = 2,150 RPM', type: 'rx' },
    { time: '22:04:18.180', bus: 'CAN-1', canId: '0x7E0', raw: '02 01 06 55 55 55 55 55', parsed: 'QUERY: 0x06 Short Term Fuel Trim Bank 1', type: 'tx' },
    { time: '22:04:18.185', bus: 'CAN-1', canId: '0x7E8', raw: '03 41 06 9F 00 00 00 00', parsed: 'RESP: STFT1 = +24.8% (EXCEEDS LIMIT)', type: 'warn' },
    { time: '22:04:18.220', bus: 'CAN-1', canId: '0x7E0', raw: '02 01 07 55 55 55 55 55', parsed: 'QUERY: 0x07 Long Term Fuel Trim Bank 1', type: 'tx' },
    { time: '22:04:18.225', bus: 'CAN-1', canId: '0x7E8', raw: '03 41 07 94 00 00 00 00', parsed: 'RESP: LTFT1 = +18.2%', type: 'rx' },
  ]);

  const [isPaused, setIsPaused] = useState(false);
  const [commandInput, setCommandInput] = useState('');

  const isAr = lang === 'ar';

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const randomRPM = 2140 + Math.floor(Math.random() * 25);
      const randomBoost = (1.10 + Math.random() * 0.05).toFixed(2);

      setLogs((prev) => [
        ...prev.slice(-40),
        {
          time: timeStr,
          bus: 'CAN-1',
          canId: '0x7E8',
          raw: `04 41 0C ${(randomRPM * 4).toString(16).toUpperCase().padStart(4, '0')} 00 00`,
          parsed: `STREAM: RPM=${randomRPM} | MAP=${randomBoost} Bar`,
          type: 'rx',
        },
      ]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, isPaused]);

  if (!isOpen) return null;

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;

    setLogs((prev) => [
      ...prev,
      {
        time: timeStr,
        bus: 'CAN-1',
        canId: '0x7E0',
        raw: commandInput.toUpperCase(),
        parsed: `USER CMD: ${commandInput}`,
        type: 'tx',
      },
      {
        time: timeStr,
        bus: 'CAN-1',
        canId: '0x7E8',
        raw: '03 7F 22 10 00 00 00 00',
        parsed: 'ECU POSITIVE ACK [NRC 0x00]',
        type: 'rx',
      },
    ]);
    setCommandInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container">
              <span className="material-symbols-outlined text-lg">terminal</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {isAr ? 'سجل ناقل البيانات المباشر OBD-II / CAN-FD' : 'Live OBD-II / CAN-FD Bus Monitor'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                ISO 15765-4 • 500 kbps • Porsche Motronic MG1 (0x7E0/0x7E8)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-2.5 py-1 rounded text-xs font-code-sm transition-colors cursor-pointer ${
                isPaused
                  ? 'bg-secondary text-surface font-semibold'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-bright'
              }`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={() => setLogs([])}
              className="px-2.5 py-1 rounded text-xs font-code-sm bg-surface-container-high text-outline hover:text-on-surface cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-surface-container text-outline hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Terminal logs list */}
        <div className="flex-1 p-4 overflow-y-auto font-code-sm text-xs space-y-1 bg-black/50 select-text">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 py-0.5 hover:bg-white/5 rounded px-1">
              <span className="text-outline text-[11px] select-none">{log.time}</span>
              <span className="text-outline-variant text-[11px]">[{log.bus}]</span>
              <span
                className={`font-semibold ${
                  log.type === 'warn'
                    ? 'text-error'
                    : log.type === 'tx'
                    ? 'text-primary-container'
                    : 'text-secondary'
                }`}
              >
                {log.canId}
              </span>
              <span className="text-on-surface-variant font-mono">{log.raw}</span>
              <span className="text-outline">→</span>
              <span
                className={
                  log.type === 'warn'
                    ? 'text-error font-semibold'
                    : log.type === 'tx'
                    ? 'text-primary'
                    : 'text-on-surface'
                }
              >
                {log.parsed}
              </span>
            </div>
          ))}
        </div>

        {/* Command injection bar */}
        <form
          onSubmit={handleSendCommand}
          className="p-3 bg-surface-container-low border-t border-white/5 flex items-center gap-2"
        >
          <span className="font-code-sm text-xs text-primary-container font-bold">0x7E0 &gt;</span>
          <input
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type hex payload (e.g. 02 01 05 for Coolant Temp) or 03 22 10 01"
            className="flex-1 bg-surface-container-lowest text-on-surface font-code-sm text-xs px-3 py-1.5 rounded border border-white/10 focus:outline-none focus:border-primary-container"
          />
          <button
            type="submit"
            className="bg-primary-container text-on-primary-container px-3 py-1.5 rounded font-code-sm text-xs font-bold hover:opacity-90 cursor-pointer"
          >
            Send Frame
          </button>
        </form>
      </div>
    </div>
  );
};
