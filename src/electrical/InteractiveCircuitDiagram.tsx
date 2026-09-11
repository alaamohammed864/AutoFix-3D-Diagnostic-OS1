import React, { useState, useEffect } from 'react';
import { ElectricalComponentData, CircuitNodeCoord, WireConnection } from './types';

interface InteractiveCircuitDiagramProps {
  component: ElectricalComponentData;
  circuitState: 'off' | 'key_on' | 'active';
  onStateChange: (state: 'off' | 'key_on' | 'active') => void;
  lang?: 'en' | 'ar';
}

export const InteractiveCircuitDiagram: React.FC<InteractiveCircuitDiagramProps> = ({
  component,
  circuitState,
  onStateChange,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeMeterMode, setActiveMeterMode] = useState<'voltage' | 'resistance' | 'continuity' | 'voltage_drop'>('voltage');
  const [probeA, setProbeA] = useState<string | null>(null);
  const [probeB, setProbeB] = useState<string | null>(null);
  const [animationTick, setAnimationTick] = useState(0);

  // Animation cycle for electron current pulse
  useEffect(() => {
    if (circuitState === 'off') return;
    const interval = setInterval(() => {
      setAnimationTick((prev) => (prev + 1) % 60);
    }, 40);
    return () => clearInterval(interval);
  }, [circuitState]);

  // Handle probe assignment on node click
  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    if (!probeA || (probeA && probeB)) {
      setProbeA(nodeId);
      setProbeB(null);
    } else {
      setProbeB(nodeId);
    }
  };

  const { nodes, wires } = component.schematic;

  // Compute live readings based on state and selected probes
  const getNodeVoltage = (nodeId: string): number => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return 0;

    if (node.type === 'ground') return circuitState === 'active' ? 0.04 : 0.0;
    if (circuitState === 'off') {
      return node.type === 'battery' ? component.testValues.voltage.keyOffV : 0.0;
    }
    if (circuitState === 'key_on') {
      if (node.type === 'battery') return component.testValues.voltage.keyOnV;
      if (node.type === 'fuse') return component.testValues.voltage.keyOnV - 0.02;
      if (node.type === 'sensor' || node.type === 'bus') return component.testValues.voltage.vrefV || 5.0;
      return component.testValues.voltage.keyOnV;
    }
    // active / running
    if (node.type === 'battery') return component.testValues.voltage.runningV;
    if (node.type === 'fuse') return component.testValues.voltage.runningV - 0.03;
    if (node.type === 'component') return component.testValues.voltage.runningV - 0.12;
    if (node.type === 'sensor') return component.testValues.voltage.runningV;
    return component.testValues.voltage.runningV;
  };

  // Measured values for display
  const liveVoltage = probeA ? getNodeVoltage(probeA) : component.testValues.voltage[circuitState === 'off' ? 'keyOffV' : circuitState === 'key_on' ? 'keyOnV' : 'runningV'];
  const liveResistance = component.testValues.resistance.nominalOhms;
  const liveContinuity = component.testValues.continuity.status.includes('OK');
  const liveDrop = component.testValues.voltageDrop.measuredDropV;

  return (
    <div id="interactive-circuit-wrapper" className="bg-[#0b1320] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Circuit Header & Operating State Controller */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <span className="material-symbols-outlined text-xl">electric_meter</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-amber-400">
                {isAr ? 'مخطط الدائرة التفاعلي المتحرك' : 'DYNAMIC SCHEMATIC ENGINE'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isAr ? 'بيانات أصلية معتمدة' : 'OEM VERIFIED'}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100">
              {isAr ? component.nameAr : component.nameEn}
            </h3>
          </div>
        </div>

        {/* Operating State Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            id="state-off-btn"
            type="button"
            onClick={() => onStateChange('off')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              circuitState === 'off'
                ? 'bg-slate-800 text-slate-200 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            {isAr ? 'مطفأ (Key OFF)' : 'KEY OFF'}
          </button>
          <button
            id="state-keyon-btn"
            type="button"
            onClick={() => onStateChange('key_on')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              circuitState === 'key_on'
                ? 'bg-blue-600/30 text-blue-300 shadow-sm border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            {isAr ? 'مفتاح ON (Key ON)' : 'KEY ON (IGN)'}
          </button>
          <button
            id="state-active-btn"
            type="button"
            onClick={() => onStateChange('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              circuitState === 'active'
                ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            {isAr ? 'تدفق تيار نشط (Active Flow)' : 'ACTIVE LOAD (CRANK/RUN)'}
          </button>
        </div>
      </div>

      {/* SVG Canvas for Interactive Circuit */}
      <div className="relative w-full h-[360px] bg-[#070d18] overflow-hidden select-none">
        {/* Subtle grid pattern background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
            <pattern id="circuit-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-grid)" />
        </svg>

        <svg viewBox="0 0 650 340" className="w-full h-full">
          {/* Wires */}
          {wires.map((wire, idx) => {
            const from = nodes.find((n) => n.id === wire.fromNodeId);
            const to = nodes.find((n) => n.id === wire.toNodeId);
            if (!from || !to) return null;

            // Wire line path
            const isHorizontalFirst = Math.abs(to.x - from.x) > Math.abs(to.y - from.y);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const pathD = isHorizontalFirst
              ? `M ${from.x} ${from.y} L ${to.x} ${from.y} L ${to.x} ${to.y}`
              : `M ${from.x} ${from.y} L ${from.x} ${to.y} L ${to.x} ${to.y}`;

            const isFlowing = circuitState === 'active' || (circuitState === 'key_on' && wire.wireType !== 'ground');
            const dashOffset = (animationTick * 3) % 40;

            return (
              <g key={`wire-${idx}`} className="group">
                {/* Background Shadow / Glow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={wire.colorHex}
                  strokeWidth="8"
                  strokeOpacity={isFlowing ? '0.2' : '0.05'}
                  className={isFlowing ? 'filter blur-[3px]' : ''}
                />
                {/* Base Wire */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={wire.colorHex}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Animated Electron Flow Particles */}
                {isFlowing && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="6 14"
                    strokeDashoffset={-dashOffset}
                    strokeLinecap="round"
                    strokeOpacity="0.85"
                  />
                )}
                {/* Wire color code label badge */}
                <rect
                  x={midX - 26}
                  y={midY - 10}
                  width="52"
                  height="20"
                  rx="4"
                  fill="#0f172a"
                  stroke={wire.colorHex}
                  strokeWidth="1"
                  className="opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {wire.colorCode.split(' ')[0]}
                </text>
              </g>
            );
          })}

          {/* Schematic Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode === node.id;
            const isProbeA = probeA === node.id;
            const isProbeB = probeB === node.id;
            const isGnd = node.type === 'ground';
            const isBat = node.type === 'battery';
            const isFuse = node.type === 'fuse';
            const isRelay = node.type === 'relay';

            const badgeColor = isGnd ? '#94a3b8' : isBat ? '#ef4444' : isFuse ? '#f59e0b' : isRelay ? '#3b82f6' : '#10b981';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                {/* Outer Ring on Selection */}
                {isSelected && (
                  <circle r="34" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 4" className="animate-spin" />
                )}

                {/* Multimeter Probes Indicator */}
                {isProbeA && (
                  <g transform="translate(24, -24)">
                    <circle r="10" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">V+</text>
                  </g>
                )}
                {isProbeB && (
                  <g transform="translate(-24, -24)">
                    <circle r="10" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />
                    <text y="3.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">COM</text>
                  </g>
                )}

                {/* Node Box or Circle */}
                <rect
                  x="-55"
                  y="-22"
                  width="110"
                  height="44"
                  rx="8"
                  fill="#0f172a"
                  stroke={badgeColor}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                />

                {/* Node Icon / Status Dot */}
                <circle cx="-38" cy="0" r="5" fill={badgeColor} />

                {/* Node Label Text */}
                <text x="-26" y="-3" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                  {node.label.length > 15 ? `${node.label.slice(0, 14)}...` : node.label}
                </text>
                <text x="-26" y="11" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                  {node.sub || node.type.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Real-Time Schematic Legend & Flow Speed */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-red-500 rounded-sm"></span>
            <span>+12V B+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-sky-400 rounded-sm"></span>
            <span>Signal / LIN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-amber-400 rounded-sm"></span>
            <span>CAN Bus</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-slate-300 rounded-sm"></span>
            <span>Ground (W-B)</span>
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-xs text-amber-400">touch_app</span>
          <span>{isAr ? 'انقر على أي نقطة لوضع مجس الفحص (DMM)' : 'Click any node to place DMM Probe'}</span>
        </div>
      </div>

      {/* Embedded Multimeter Telemetry Station (Voltage, Resistance, Continuity, Voltage Drop) */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1. Voltage Meter */}
        <div
          onClick={() => setActiveMeterMode('voltage')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeMeterMode === 'voltage'
              ? 'bg-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-950/50'
              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-blue-400">speed</span>
              {isAr ? 'الجهد (VOLTAGE)' : 'DC VOLTAGE (V)'}
            </span>
            <span className="text-[10px] text-blue-400 font-mono">DMM Auto-Range</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-slate-100">
              {liveVoltage.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-400">V DC</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {component.testValues.voltage.nominalText}
          </p>
        </div>

        {/* 2. Resistance Meter */}
        <div
          onClick={() => setActiveMeterMode('resistance')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeMeterMode === 'resistance'
              ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/50'
              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-amber-400">tune</span>
              {isAr ? 'المقاومة (RESISTANCE)' : 'RESISTANCE (Ω)'}
            </span>
            <span className="text-[10px] text-amber-400 font-mono">200Ω Range</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-slate-100">
              {liveResistance}
            </span>
            <span className="text-xs font-mono text-slate-400">Ω</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {component.testValues.resistance.testCondition}
          </p>
        </div>

        {/* 3. Continuity Meter */}
        <div
          onClick={() => setActiveMeterMode('continuity')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeMeterMode === 'continuity'
              ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/50'
              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-emerald-400">volume_up</span>
              {isAr ? 'التوصيلية والصفير (CONTINUITY)' : 'CONTINUITY LOOP'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">&lt; 0.1Ω Tone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {component.testValues.continuity.status}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {component.testValues.continuity.testPinA} ↔ {component.testValues.continuity.testPinB}
          </p>
        </div>

        {/* 4. Voltage Drop Meter */}
        <div
          onClick={() => setActiveMeterMode('voltage_drop')}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            activeMeterMode === 'voltage_drop'
              ? 'bg-purple-950/40 border-purple-500/50 shadow-lg shadow-purple-950/50'
              : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-purple-400">trending_down</span>
              {isAr ? 'هبوط الجهد (VOLTAGE DROP)' : 'VOLTAGE DROP (ΔV)'}
            </span>
            <span className="text-[10px] text-purple-400 font-mono">{component.testValues.voltageDrop.standardRef.split(' ')[0]}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-bold text-emerald-400">
              {liveDrop.toFixed(3)}
            </span>
            <span className="text-xs font-mono text-slate-400">V (Max {component.testValues.voltageDrop.standardMaxV}V)</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 truncate">
            {component.testValues.voltageDrop.testCircuit}
          </p>
        </div>
      </div>
    </div>
  );
};
