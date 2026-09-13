// AutoFix 3D - Simulation Context Provider & React Hook

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  LiveTelemetryData,
  SensorId,
  SensorFaultState,
  SensorDefinition,
  ActuatorId,
  ActuatorTestResult,
  CANMessage,
  ECUNode,
  VehicleHealthScore,
  DiagnosticSessionReport,
} from './types';
import { simulationEngine } from './simulationEngine';

interface SimulationContextValue {
  telemetry: LiveTelemetryData;
  sensors: Record<SensorId, SensorDefinition>;
  actuatorTests: Record<ActuatorId, ActuatorTestResult>;
  ecuNodes: Record<string, ECUNode>;
  activeDtcs: string[];
  pendingDtcs: string[];
  canMessages: CANMessage[];
  healthScore: VehicleHealthScore;
  isSimulating: boolean;
  savedSessions: DiagnosticSessionReport[];
  // Actions
  setThrottle: (pos: number) => void;
  setSpeed: (kmh: number) => void;
  togglePauseSimulation: () => boolean;
  injectSensorFault: (sensorId: SensorId, state: SensorFaultState) => void;
  clearAllSensorFaults: () => void;
  clearAllDtcs: () => void;
  addDtc: (code: string) => void;
  removeDtc: (code: string) => void;
  toggleEcuConnection: (ecuId: string) => void;
  runActuatorTest: (actuatorId: ActuatorId, onComplete?: (res: ActuatorTestResult) => void) => void;
  resetActuatorTest: (actuatorId: ActuatorId) => void;
  executeFullVehicleScan: (
    onProgress: (step: number, stageName: string, pct: number) => void,
    onComplete: (report: DiagnosticSessionReport) => void
  ) => void;
  saveSessionReport: (report: DiagnosticSessionReport) => void;
  deleteSession: (id: string) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Subscribe to engine state transitions
    const unsubscribe = simulationEngine.subscribe(() => {
      setTick((t) => (t + 1) % 1000000);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<SimulationContextValue>(() => {
    return {
      telemetry: simulationEngine.getTelemetry(),
      sensors: simulationEngine.getSensors(),
      actuatorTests: simulationEngine.getActuatorTests(),
      ecuNodes: simulationEngine.getEcuNodes(),
      activeDtcs: simulationEngine.getActiveDtcs(),
      pendingDtcs: simulationEngine.getPendingDtcs(),
      canMessages: simulationEngine.getCanMessages(),
      healthScore: simulationEngine.calculateHealthScore(),
      isSimulating: simulationEngine.isEngineSimulating(),
      savedSessions: simulationEngine.getSavedSessions(),

      setThrottle: (pos: number) => simulationEngine.setThrottle(pos),
      setSpeed: (kmh: number) => simulationEngine.setTargetSpeed(kmh),
      togglePauseSimulation: () => simulationEngine.togglePauseSimulation(),
      injectSensorFault: (sensorId: SensorId, state: SensorFaultState) =>
        simulationEngine.injectSensorFault(sensorId, state),
      clearAllSensorFaults: () => simulationEngine.clearAllSensorFaults(),
      clearAllDtcs: () => simulationEngine.clearAllDtcs(),
      addDtc: (code: string) => simulationEngine.addDtc(code),
      removeDtc: (code: string) => simulationEngine.removeDtc(code),
      toggleEcuConnection: (ecuId: string) => simulationEngine.toggleEcuConnection(ecuId),
      runActuatorTest: (actuatorId: ActuatorId, onComplete?: (res: ActuatorTestResult) => void) =>
        simulationEngine.runActuatorTest(actuatorId, onComplete),
      resetActuatorTest: (actuatorId: ActuatorId) => simulationEngine.resetActuatorTest(actuatorId),
      executeFullVehicleScan: (onProgress, onComplete) =>
        simulationEngine.executeFullVehicleScan(onProgress, onComplete),
      saveSessionReport: (rep) => simulationEngine.saveSessionReport(rep),
      deleteSession: (id) => simulationEngine.deleteSession(id),
    };
  }, [tick]);

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

export const useSimulation = (): SimulationContextValue => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
