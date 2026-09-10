import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  AUTOMOTIVE_COMPONENTS,
  AutomotiveSystem,
  ComponentDetail,
} from '../../db/componentDatabase';

interface RealisticVehicleModelProps {
  selectedComponentId: string | null;
  onSelectComponent: (component: ComponentDetail) => void;
  visibleSystems: AutomotiveSystem[];
  explodedLevel: number;
  xrayMode: boolean;
  transparentMode: boolean;
  showLabels: boolean;
  measureMode: boolean;
}

export const RealisticVehicleModel: React.FC<RealisticVehicleModelProps> = ({
  selectedComponentId,
  onSelectComponent,
  visibleSystems,
  explodedLevel,
  xrayMode,
  transparentMode,
  showLabels,
  measureMode,
}) => {
  const pulseRef = useRef<number>(0);
  const selectedComponent = selectedComponentId
    ? AUTOMOTIVE_COMPONENTS[selectedComponentId]
    : null;
  const relatedIds = selectedComponent ? selectedComponent.relatedComponentIds : [];

  useFrame((_, delta) => {
    pulseRef.current += delta * 4;
  });

  // Material and highlight calculator
  const getHighlightProps = (compId: string, defaultColor: string, defaultOpacity = 1.0) => {
    const isSelected = selectedComponentId === compId;
    const isRelated = relatedIds.includes(compId);
    const hasSelection = !!selectedComponentId;

    if (isSelected) {
      const pulse = 0.7 + 0.3 * Math.sin(pulseRef.current);
      return {
        color: '#00f0ff',
        emissive: '#00f0ff',
        emissiveIntensity: pulse * 1.5,
        transparent: false,
        opacity: 1.0,
        wireframe: false,
        roughness: 0.1,
        metalness: 0.9,
      };
    }

    if (isRelated) {
      return {
        color: '#a855f7',
        emissive: '#7e22ce',
        emissiveIntensity: 0.8,
        transparent: false,
        opacity: 1.0,
        wireframe: false,
        roughness: 0.2,
        metalness: 0.8,
      };
    }

    if (hasSelection) {
      return {
        color: defaultColor,
        emissive: '#000000',
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0.18,
        wireframe: xrayMode,
        roughness: 0.8,
        metalness: 0.1,
      };
    }

    if (xrayMode) {
      return {
        color: '#00f0ff',
        emissive: '#00363a',
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
        roughness: 0.2,
        metalness: 0.9,
      };
    }

    if (transparentMode) {
      return {
        color: defaultColor,
        emissive: '#000000',
        emissiveIntensity: 0,
        transparent: true,
        opacity: defaultOpacity * 0.3,
        wireframe: false,
        roughness: 0.3,
        metalness: 0.5,
      };
    }

    return {
      color: defaultColor,
      emissive: '#000000',
      emissiveIntensity: 0,
      transparent: defaultOpacity < 1.0,
      opacity: defaultOpacity,
      wireframe: false,
      roughness: 0.3,
      metalness: 0.7,
    };
  };

  // Compute 3D position with exploded view offset
  const getComponentPos = (
    basePos: [number, number, number],
    offset: [number, number, number]
  ): [number, number, number] => {
    return [
      basePos[0] + offset[0] * explodedLevel,
      basePos[1] + offset[1] * explodedLevel,
      basePos[2] + offset[2] * explodedLevel,
    ];
  };

  const isSystemVisible = (sys: AutomotiveSystem) => visibleSystems.includes(sys);

  return (
    <group position={[0, 0, 0]}>
      {/* 1. EXTERIOR BODY SHELL */}
      {isSystemVisible('Exterior') && (
        <group
          position={getComponentPos([0, 0.35, 0], [0, 1.8, 0])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.exterior);
          }}
        >
          {/* Main Aerodynamic Monocoque Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.75, 0.45, 4.2]} />
            <meshStandardMaterial
              {...getHighlightProps(
                'exterior',
                transparentMode ? '#1e293b' : '#0f172a',
                transparentMode ? 0.35 : 0.95
              )}
            />
          </mesh>

          {/* Cabin Roof Bubble */}
          <mesh position={[0, 0.42, -0.2]} castShadow>
            <boxGeometry args={[1.4, 0.4, 2.0]} />
            <meshStandardMaterial
              {...getHighlightProps(
                'exterior',
                transparentMode ? '#0284c7' : '#091e36',
                transparentMode ? 0.25 : 0.85
              )}
            />
          </mesh>

          {/* Front Slanted Hood */}
          <mesh position={[0, 0.12, 1.5]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[1.65, 0.15, 1.2]} />
            <meshStandardMaterial
              {...getHighlightProps(
                'exterior',
                transparentMode ? '#1e293b' : '#0c1a2e',
                transparentMode ? 0.3 : 0.95
              )}
            />
          </mesh>

          {/* Rear Fastback Tail / Spoiler */}
          <mesh position={[0, 0.35, -1.95]}>
            <boxGeometry args={[1.68, 0.08, 0.35]} />
            <meshStandardMaterial {...getHighlightProps('exterior', '#00f0ff', 0.9)} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.75, 0]} center distanceFactor={10}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.exterior);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                Aerodynamic Unibody
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 2. ENGINE BAY & ENGINE */}
      {isSystemVisible('Engine') && (
        <group
          position={getComponentPos([0, 0.25, 0.95], [0, 1.4, 0.95])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.engine);
          }}
        >
          {/* Engine Cylinder Block */}
          <mesh castShadow>
            <boxGeometry args={[0.75, 0.55, 0.75]} />
            <meshStandardMaterial {...getHighlightProps('engine', '#334155')} />
          </mesh>

          {/* Cylinder Head / Cam Covers */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.68, 0.16, 0.7]} />
            <meshStandardMaterial {...getHighlightProps('engine', '#dc2626')} />
          </mesh>

          {/* Intake Plenum Runners */}
          <mesh position={[0, 0.44, -0.1]}>
            <cylinderGeometry args={[0.22, 0.22, 0.55, 12]} />
            <meshStandardMaterial {...getHighlightProps('engine', '#1e293b')} />
          </mesh>

          {/* Crankshaft Pulley */}
          <mesh position={[0, -0.15, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 16]} />
            <meshStandardMaterial {...getHighlightProps('engine', '#94a3b8')} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.6, 0]} center distanceFactor={10}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.engine);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                VVT Twin-Cam Engine Block
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 3. BATTERY (12V AGM) */}
      {isSystemVisible('Electrical') && (
        <group
          position={getComponentPos([0.65, 0.42, 1.25], [1.2, 1.2, 0.8])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.battery);
          }}
        >
          {/* Battery Casing */}
          <mesh castShadow>
            <boxGeometry args={[0.32, 0.24, 0.22]} />
            <meshStandardMaterial {...getHighlightProps('battery', '#0f172a')} />
          </mesh>

          {/* Positive Terminal (+) */}
          <mesh position={[0.1, 0.14, 0.06]}>
            <cylinderGeometry args={[0.025, 0.025, 0.05, 12]} />
            <meshStandardMaterial {...getHighlightProps('battery', '#ef4444')} />
          </mesh>

          {/* Negative Terminal (-) */}
          <mesh position={[-0.1, 0.14, 0.06]}>
            <cylinderGeometry args={[0.025, 0.025, 0.05, 12]} />
            <meshStandardMaterial {...getHighlightProps('battery', '#3b82f6')} />
          </mesh>

          {/* Hold-down Bracket */}
          <mesh position={[0, -0.11, 0]}>
            <boxGeometry args={[0.36, 0.03, 0.24]} />
            <meshStandardMaterial {...getHighlightProps('battery', '#64748b')} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.35, 0]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.battery);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[10px]">battery_charging_full</span>
                12V AGM Battery
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 4. ALTERNATOR */}
      {isSystemVisible('Electrical') && (
        <group
          position={getComponentPos([0.5, 0.15, 1.45], [1.4, 0.5, 1.2])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.alternator);
          }}
        >
          {/* Alternator Cylindrical Housing */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.22, 16]} />
            <meshStandardMaterial {...getHighlightProps('alternator', '#64748b')} />
          </mesh>

          {/* Vented Stator Slots */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.145, 0.145, 0.12, 16]} />
            <meshStandardMaterial {...getHighlightProps('alternator', '#b45309')} />
          </mesh>

          {/* Decoupler Pulley */}
          <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
            <meshStandardMaterial {...getHighlightProps('alternator', '#0f172a')} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.28, 0]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.alternator);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                14V Alternator
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 5. STARTER MOTOR */}
      {isSystemVisible('Electrical') && (
        <group
          position={getComponentPos([-0.42, -0.15, 0.45], [-1.2, -0.6, 0.4])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.starter);
          }}
        >
          {/* Main Motor Body */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.28, 16]} />
            <meshStandardMaterial {...getHighlightProps('starter', '#1e293b')} />
          </mesh>

          {/* Upper Solenoid Cylinder */}
          <mesh position={[0, 0.11, 0.04]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.2, 16]} />
            <meshStandardMaterial {...getHighlightProps('starter', '#d97706')} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.25, 0]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.starter);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                Reduction Starter
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 6. TRANSMISSION */}
      {isSystemVisible('Transmission') && (
        <group
          position={getComponentPos([0, 0.1, -0.2], [0, 0.8, -1.2])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.transmission);
          }}
        >
          {/* Bellhousing Casing */}
          <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.28, 0.35, 16]} />
            <meshStandardMaterial {...getHighlightProps('transmission', '#475569')} />
          </mesh>

          {/* Main Gearbox Housing */}
          <mesh castShadow>
            <boxGeometry args={[0.48, 0.42, 0.7]} />
            <meshStandardMaterial {...getHighlightProps('transmission', '#334155')} />
          </mesh>

          {/* Output Drive Flanges Left & Right */}
          <mesh position={[0.3, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
            <meshStandardMaterial {...getHighlightProps('transmission', '#94a3b8')} />
          </mesh>
          <mesh position={[-0.3, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
            <meshStandardMaterial {...getHighlightProps('transmission', '#94a3b8')} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.4, 0]} center distanceFactor={10}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.transmission);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                8-Speed DCT Transmission
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 7. COOLING SYSTEM (RADIATOR & DUAL FANS) */}
      {isSystemVisible('Cooling') && (
        <group
          position={getComponentPos([0, 0.22, 2.05], [0, 0.3, 1.8])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.cooling);
          }}
        >
          {/* Aluminum Radiator Core Plate */}
          <mesh castShadow>
            <boxGeometry args={[1.35, 0.48, 0.1]} />
            <meshStandardMaterial {...getHighlightProps('cooling', '#38bdf8', 0.9)} />
          </mesh>

          {/* Twin Electric Cooling Fans */}
          <mesh position={[-0.35, 0, -0.08]}>
            <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
            <meshStandardMaterial {...getHighlightProps('cooling', '#0f172a')} />
          </mesh>
          <mesh position={[0.35, 0, -0.08]}>
            <cylinderGeometry args={[0.2, 0.2, 0.06, 16]} />
            <meshStandardMaterial {...getHighlightProps('cooling', '#0f172a')} />
          </mesh>

          {/* Translucent Coolant Expansion Tank */}
          <mesh position={[0.6, 0.25, -0.3]}>
            <cylinderGeometry args={[0.12, 0.12, 0.25, 14]} />
            <meshStandardMaterial
              {...getHighlightProps('cooling', '#ec4899', transparentMode ? 0.4 : 0.7)}
            />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.45, 0]} center distanceFactor={10}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.cooling);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                Radiator & Thermal Management
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 8. BRAKES & ABS */}
      {isSystemVisible('Brakes') && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.brakes);
          }}
        >
          {/* 4 Brake Rotors and Calipers */}
          {[
            { pos: [0.82, -0.15, 1.35] as [number, number, number], offset: [1.3, -0.1, 1.35] as [number, number, number] },
            { pos: [-0.82, -0.15, 1.35] as [number, number, number], offset: [-1.3, -0.1, 1.35] as [number, number, number] },
            { pos: [0.82, -0.15, -1.35] as [number, number, number], offset: [1.3, -0.1, -1.35] as [number, number, number] },
            { pos: [-0.82, -0.15, -1.35] as [number, number, number], offset: [-1.3, -0.1, -1.35] as [number, number, number] },
          ].map((corner, i) => (
            <group key={i} position={getComponentPos(corner.pos, corner.offset)}>
              {/* Drilled Rotor Disc */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.22, 0.22, 0.03, 24]} />
                <meshStandardMaterial {...getHighlightProps('brakes', '#e2e8f0')} />
              </mesh>

              {/* 6-Piston Monobloc Brake Caliper (Bright Racing Red/Yellow) */}
              <mesh position={[0, 0.14, 0.08]}>
                <boxGeometry args={[0.08, 0.14, 0.24]} />
                <meshStandardMaterial {...getHighlightProps('brakes', '#ef4444')} />
              </mesh>
            </group>
          ))}

          {showLabels && (
            <Html position={[0.82, 0.2, 1.35]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.brakes);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                Monobloc 6-Piston Brakes
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 9. SUSPENSION (STRUTS & SPRINGS) */}
      {isSystemVisible('Suspension') && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.suspension);
          }}
        >
          {/* Front Struts */}
          {[
            { pos: [0.65, 0.1, 1.35] as [number, number, number], offset: [1.1, 0.4, 1.35] as [number, number, number] },
            { pos: [-0.65, 0.1, 1.35] as [number, number, number], offset: [-1.1, 0.4, 1.35] as [number, number, number] },
            { pos: [0.65, 0.1, -1.35] as [number, number, number], offset: [1.1, 0.4, -1.35] as [number, number, number] },
            { pos: [-0.65, 0.1, -1.35] as [number, number, number], offset: [-1.1, 0.4, -1.35] as [number, number, number] },
          ].map((corner, i) => (
            <group key={i} position={getComponentPos(corner.pos, corner.offset)}>
              {/* Damper Cylinder */}
              <mesh>
                <cylinderGeometry args={[0.045, 0.045, 0.5, 12]} />
                <meshStandardMaterial {...getHighlightProps('suspension', '#0284c7')} />
              </mesh>
              {/* Coil Spring Wrapping */}
              <mesh>
                <cylinderGeometry args={[0.08, 0.08, 0.38, 12, 1, true]} />
                <meshStandardMaterial {...getHighlightProps('suspension', '#f59e0b')} />
              </mesh>
            </group>
          ))}

          {showLabels && (
            <Html position={[0.65, 0.45, 1.35]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.suspension);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                Adaptive Damper & Strut
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 10. FUEL SYSTEM (HIGH-PRESSURE RAIL & TANK) */}
      {isSystemVisible('Fuel') && (
        <group
          position={getComponentPos([0, 0.35, 0.7], [0, 1.1, 0.7])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.fuel);
          }}
        >
          {/* Fuel Rail Distribution Pipe */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.65, 12]} />
            <meshStandardMaterial {...getHighlightProps('fuel', '#eab308')} />
          </mesh>

          {/* Direct Fuel Injectors (4x) */}
          {[-0.22, -0.07, 0.07, 0.22].map((x, idx) => (
            <mesh key={idx} position={[x, -0.08, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
              <meshStandardMaterial {...getHighlightProps('fuel', '#64748b')} />
            </mesh>
          ))}

          {/* Underbody Saddle Fuel Cell */}
          <mesh position={[0, -0.4, -0.9]}>
            <boxGeometry args={[1.1, 0.25, 0.75]} />
            <meshStandardMaterial {...getHighlightProps('fuel', '#1e293b')} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.25, 0]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.fuel);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                250-Bar Direct Fuel Rail
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 11. HVAC & A/C COMPRESSOR */}
      {isSystemVisible('HVAC') && (
        <group
          position={getComponentPos([0.38, 0.08, 1.55], [1.1, 0.2, 1.6])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.hvac);
          }}
        >
          {/* Variable A/C Compressor Cylinder */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.26, 16]} />
            <meshStandardMaterial {...getHighlightProps('hvac', '#0ea5e9')} />
          </mesh>

          {/* Compressor Clutch Pulley */}
          <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
            <meshStandardMaterial {...getHighlightProps('hvac', '#0f172a')} />
          </mesh>

          {/* Aluminum Refrigerant Tubing */}
          <mesh position={[-0.1, 0.15, -0.1]}>
            <boxGeometry args={[0.04, 0.2, 0.3]} />
            <meshStandardMaterial {...getHighlightProps('hvac', '#94a3b8')} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.28, 0]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.hvac);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                HVAC Compressor (R1234yf)
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 12. EXHAUST & CATALYTIC CONVERTERS */}
      {isSystemVisible('Engine') && (
        <group
          position={getComponentPos([0, -0.15, -1.0], [0, -0.6, -1.8])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.exhaust);
          }}
        >
          {/* Dual Catalytic Converter Canisters */}
          <mesh position={[-0.22, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.45, 14]} />
            <meshStandardMaterial {...getHighlightProps('exhaust', '#b45309')} />
          </mesh>
          <mesh position={[0.22, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.11, 0.45, 14]} />
            <meshStandardMaterial {...getHighlightProps('exhaust', '#b45309')} />
          </mesh>

          {/* Stainless Mid Resonator Box */}
          <mesh position={[0, 0, -0.2]}>
            <boxGeometry args={[0.65, 0.18, 0.5]} />
            <meshStandardMaterial {...getHighlightProps('exhaust', '#64748b')} />
          </mesh>

          {/* Rear Quad Exhaust Tips */}
          {[-0.45, -0.32, 0.32, 0.45].map((x, idx) => (
            <mesh key={idx} position={[x, -0.05, -1.05]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.15, 16]} />
              <meshStandardMaterial {...getHighlightProps('exhaust', '#e2e8f0')} />
            </mesh>
          ))}

          {showLabels && (
            <Html position={[0, 0.25, 0]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.exhaust);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                Stainless Valved Exhaust
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 13. WHEELS & TIRES */}
      {isSystemVisible('Exterior') && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.wheels);
          }}
        >
          {[
            { pos: [0.92, -0.15, 1.35] as [number, number, number], offset: [1.7, -0.15, 1.35] as [number, number, number] },
            { pos: [-0.92, -0.15, 1.35] as [number, number, number], offset: [-1.7, -0.15, 1.35] as [number, number, number] },
            { pos: [0.92, -0.15, -1.35] as [number, number, number], offset: [1.7, -0.15, -1.35] as [number, number, number] },
            { pos: [-0.92, -0.15, -1.35] as [number, number, number], offset: [-1.7, -0.15, -1.35] as [number, number, number] },
          ].map((corner, i) => (
            <group key={i} position={getComponentPos(corner.pos, corner.offset)}>
              {/* Outer Rubber Tire */}
              <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.34, 0.34, 0.24, 28]} />
                <meshStandardMaterial {...getHighlightProps('wheels', '#090d16', 0.98)} />
              </mesh>

              {/* Inner Forged Alloy Rim */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.26, 0.26, 0.25, 24]} />
                <meshStandardMaterial {...getHighlightProps('wheels', '#cbd5e1')} />
              </mesh>

              {/* Center Lock Nut */}
              <mesh position={[corner.pos[0] > 0 ? 0.13 : -0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
                <meshStandardMaterial {...getHighlightProps('wheels', '#ef4444')} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* 14. INTERIOR COCKPIT */}
      {isSystemVisible('Interior') && (
        <group
          position={getComponentPos([0, 0.35, -0.3], [0, 1.4, -0.3])}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent(AUTOMOTIVE_COMPONENTS.interior);
          }}
        >
          {/* Dashboard Arch */}
          <mesh castShadow>
            <boxGeometry args={[1.35, 0.25, 0.4]} />
            <meshStandardMaterial {...getHighlightProps('interior', '#1e293b')} />
          </mesh>

          {/* Steering Wheel */}
          <mesh position={[-0.38, 0.12, 0.22]} rotation={[Math.PI / 6, 0, 0]}>
            <torusGeometry args={[0.14, 0.025, 8, 20]} />
            <meshStandardMaterial {...getHighlightProps('interior', '#0f172a')} />
          </mesh>

          {/* Digital Instrument Screen (Cyan Glow) */}
          <mesh position={[-0.38, 0.12, 0.05]}>
            <boxGeometry args={[0.26, 0.12, 0.02]} />
            <meshStandardMaterial {...getHighlightProps('interior', '#00f0ff')} />
          </mesh>

          {/* Twin Sport Bucket Seats */}
          <mesh position={[-0.38, -0.05, -0.35]}>
            <boxGeometry args={[0.42, 0.5, 0.42]} />
            <meshStandardMaterial {...getHighlightProps('interior', '#0b1120')} />
          </mesh>
          <mesh position={[0.38, -0.05, -0.35]}>
            <boxGeometry args={[0.42, 0.5, 0.42]} />
            <meshStandardMaterial {...getHighlightProps('interior', '#0b1120')} />
          </mesh>

          {showLabels && (
            <Html position={[0, 0.35, 0]} center distanceFactor={9}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(AUTOMOTIVE_COMPONENTS.interior);
                }}
                className="px-2 py-0.5 rounded bg-surface-container-highest/90 text-primary-container text-[10px] font-code-sm font-bold whitespace-nowrap cursor-pointer shadow-lg border border-primary-container/30 hover:scale-110 transition-transform"
              >
                Digital Cockpit & HMI
              </div>
            </Html>
          )}
        </group>
      )}

      {/* 15. MEASUREMENT MODE CALLOUTS & DIMENSIONS */}
      {measureMode && (
        <group>
          {/* Wheelbase Dimension Line (Front to Rear Axle: 2,450 mm) */}
          <Line
            points={[
              [1.15, -0.15, 1.35],
              [1.15, -0.15, -1.35],
            ]}
            color="#38bdf8"
            lineWidth={2.5}
          />
          <Html position={[1.35, -0.15, 0]} center distanceFactor={8}>
            <div className="px-2 py-1 rounded bg-surface-container-lowest/90 border border-primary-container text-primary-container text-[11px] font-code-sm font-bold whitespace-nowrap shadow-xl">
              Wheelbase: 2,450 mm
            </div>
          </Html>

          {/* Front Track Width Dimension Line (1,580 mm) */}
          <Line
            points={[
              [-0.92, -0.45, 1.35],
              [0.92, -0.45, 1.35],
            ]}
            color="#a855f7"
            lineWidth={2.5}
          />
          <Html position={[0, -0.45, 1.55]} center distanceFactor={8}>
            <div className="px-2 py-1 rounded bg-surface-container-lowest/90 border border-secondary text-secondary text-[11px] font-code-sm font-bold whitespace-nowrap shadow-xl">
              Track Width: 1,580 mm
            </div>
          </Html>

          {/* Overall Vehicle Length (4,519 mm) */}
          <Line
            points={[
              [-1.15, 0.4, 2.1],
              [-1.15, 0.4, -2.1],
            ]}
            color="#10b981"
            lineWidth={2.5}
          />
          <Html position={[-1.35, 0.4, 0]} center distanceFactor={8}>
            <div className="px-2 py-1 rounded bg-surface-container-lowest/90 border border-emerald-400 text-emerald-400 text-[11px] font-code-sm font-bold whitespace-nowrap shadow-xl">
              Length: 4,519 mm
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};
