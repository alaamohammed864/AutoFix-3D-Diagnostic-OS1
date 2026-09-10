import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  AutomotiveSystem,
  ComponentDetail,
  AUTOMOTIVE_COMPONENTS,
} from '../../db/componentDatabase';
import { Language } from '../../types';
import { RealisticVehicleModel } from './RealisticVehicleModel';
import { SystemExplorerBar, ALL_SYSTEMS } from './SystemExplorerBar';
import { ComponentInspectionDrawer } from './ComponentInspectionDrawer';

interface Vehicle3DVisualizationProps {
  lang: Language;
  onSelectDtc?: () => void;
  onOpenSensor?: (sensorName: string) => void;
  initialSelectedComponentId?: string | null;
}

export const Vehicle3DVisualization: React.FC<Vehicle3DVisualizationProps> = ({
  lang,
  initialSelectedComponentId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);

  // Active state
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    initialSelectedComponentId || null
  );
  const [visibleSystems, setVisibleSystems] = useState<AutomotiveSystem[]>(ALL_SYSTEMS);
  const [explodedLevel, setExplodedLevel] = useState<number>(0);
  const [xrayMode, setXrayMode] = useState<boolean>(false);
  const [transparentMode, setTransparentMode] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync if initialSelectedComponentId changes
  useEffect(() => {
    if (initialSelectedComponentId) {
      setSelectedComponentId(initialSelectedComponentId);
    }
  }, [initialSelectedComponentId]);

  const selectedComponent = selectedComponentId
    ? AUTOMOTIVE_COMPONENTS[selectedComponentId] || null
    : null;

  // Toggle single system
  const handleToggleSystem = (system: AutomotiveSystem) => {
    setVisibleSystems((prev) => {
      if (prev.includes(system)) {
        // don't allow hiding everything
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== system);
      } else {
        return [...prev, system];
      }
    });
  };

  // Solo/Isolate single system
  const handleIsolateSystem = (system: AutomotiveSystem) => {
    setVisibleSystems([system]);
  };

  // Select all 8 systems
  const handleSelectAllSystems = () => {
    setVisibleSystems(ALL_SYSTEMS);
  };

  // Reset camera view
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-surface-container-lowest border border-white/10 shadow-2xl flex flex-col ${
        isFullscreen ? 'h-screen fixed inset-0 z-50 rounded-none' : 'h-[580px] lg:h-[640px]'
      }`}
    >
      {/* 3D System Explorer Toolbar */}
      <SystemExplorerBar
        visibleSystems={visibleSystems}
        onToggleSystem={handleToggleSystem}
        onSelectAllSystems={handleSelectAllSystems}
        onIsolateSystem={handleIsolateSystem}
        explodedLevel={explodedLevel}
        onChangeExplodedLevel={setExplodedLevel}
        xrayMode={xrayMode}
        onToggleXrayMode={() => setXrayMode(!xrayMode)}
        transparentMode={transparentMode}
        onToggleTransparentMode={() => setTransparentMode(!transparentMode)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        measureMode={measureMode}
        onToggleMeasureMode={() => setMeasureMode(!measureMode)}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={() => setIsAutoRotating(!isAutoRotating)}
        onResetCamera={handleResetCamera}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        lang={lang}
      />

      {/* Main 3D Canvas Area */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        {/* Subtle Ambient HUD Overlays */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1.5 font-code-sm text-xs">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-container-lowest/80 backdrop-blur-md border border-white/10 text-primary-container">
            <span className="h-2 w-2 rounded-full bg-primary-container animate-ping"></span>
            <span className="font-bold tracking-wider">
              {visibleSystems.length < ALL_SYSTEMS.length
                ? `ISOLATION: ${visibleSystems.join(' + ')}`
                : 'REAL-TIME 3D TELEMETRY RIG'}
            </span>
          </div>

          {selectedComponent && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-bold shadow-lg">
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              <span>Selected: {selectedComponent.name}</span>
            </div>
          )}
        </div>

        {/* Interaction Gesture Guide Pill (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-container-lowest/70 backdrop-blur-md border border-white/5 text-[11px] font-code-sm text-outline">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-container text-on-surface font-bold">L-Click</kbd>{' '}
            Rotate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-container text-on-surface font-bold">R-Click</kbd>{' '}
            Pan
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-container text-on-surface font-bold">Scroll</kbd>{' '}
            Zoom
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-surface-container text-on-surface font-bold">Tap Part</kbd>{' '}
            Inspect
          </span>
        </div>

        {/* Active Mode Indicators (Top Right) */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none flex items-center gap-1.5 flex-wrap">
          {explodedLevel > 0 && (
            <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30 text-[10px] font-code-sm font-bold uppercase">
              Exploded {Math.round(explodedLevel * 100)}%
            </span>
          )}
          {xrayMode && (
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-code-sm font-bold uppercase">
              X-Ray Active
            </span>
          )}
          {transparentMode && (
            <span className="px-2 py-0.5 rounded bg-secondary/20 text-secondary border border-secondary/30 text-[10px] font-code-sm font-bold uppercase">
              Transparent Shell
            </span>
          )}
          {measureMode && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-code-sm font-bold uppercase">
              Measurement Active
            </span>
          )}
        </div>

        {/* 3D WebGL Canvas */}
        <Canvas
          camera={{ position: [5.5, 3.2, 5.5], fov: 42 }}
          dpr={[1, 1.5]} // Mobile GPU optimization
          gl={{
            powerPreference: 'high-performance',
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          onPointerMissed={() => {
            // Unselect on empty background click
            setSelectedComponentId(null);
          }}
        >
          {/* Lighting Rig */}
          <ambientLight intensity={1.8} color="#1e293b" />
          <directionalLight
            position={[10, 15, 10]}
            intensity={2.8}
            color="#ffffff"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-10, 8, -10]} intensity={1.5} color="#00f0ff" />
          <directionalLight position={[0, -5, 0]} intensity={0.6} color="#38bdf8" />

          {/* Holographic Ground Grid */}
          <gridHelper
            args={[18, 36, 0x00f0ff, 0x1e293b]}
            position={[0, -0.5, 0]}
          />

          {/* Interactive Vehicle Rig */}
          <RealisticVehicleModel
            selectedComponentId={selectedComponentId}
            onSelectComponent={(comp) => setSelectedComponentId(comp.id)}
            visibleSystems={visibleSystems}
            explodedLevel={explodedLevel}
            xrayMode={xrayMode}
            transparentMode={transparentMode}
            showLabels={showLabels}
            measureMode={measureMode}
          />

          {/* Camera Orbit Controls */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            minDistance={2.5}
            maxDistance={14.0}
            maxPolarAngle={Math.PI / 2 + 0.05}
            autoRotate={isAutoRotating}
            autoRotateSpeed={1.2}
          />
        </Canvas>

        {/* Detailed Component Inspection Slide-out Drawer */}
        <ComponentInspectionDrawer
          component={selectedComponent}
          onClose={() => setSelectedComponentId(null)}
          onSelectRelated={(relId) => setSelectedComponentId(relId)}
          lang={lang}
        />
      </div>
    </div>
  );
};
