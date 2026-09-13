// AutoFix 3D - Simulation Engine Core Types
// High-fidelity automotive diagnostics, live telemetry signals, CAN-bus frames, and ECU network models

export interface LiveTelemetryData {
  rpm: number;
  speedKmH: number;
  engineLoadPct: number;
  coolantTempC: number;
  intakeAirTempC: number;
  throttlePosPct: number;
  mafGs: number;
  mapKpa: number;
  o2VoltageB1S1: number;
  o2VoltageB1S2: number;
  stftBank1Pct: number;
  ltftBank1Pct: number;
  fuelRailBar: number;
  batteryVoltageV: number;
  ignitionTimingDeg: number;
  transmissionTempC: number;
  wheelSpeedFL: number;
  wheelSpeedFR: number;
  wheelSpeedRL: number;
  wheelSpeedRR: number;
  brakePressureBar: number;
  steeringAngleDeg: number;
  ambientTempC: number;
  oilPressureBar: number;
  fuelLevelPct: number;
  timestamp: number;
}

export type SensorId =
  | 'maf'
  | 'o2_b1s1'
  | 'o2_b1s2'
  | 'ect'
  | 'tps'
  | 'ckp'
  | 'frp'
  | 'map'
  | 'iat'
  | 'wss_fl'
  | 'bap'
  | 'sas';

export type SensorFaultState =
  | 'NORMAL'
  | 'OPEN_CIRCUIT'
  | 'SHORT_TO_GROUND'
  | 'SHORT_TO_BATT'
  | 'HIGH_SIGNAL'
  | 'LOW_SIGNAL'
  | 'INTERMITTENT'
  | 'OUT_OF_RANGE';

export interface SensorDefinition {
  id: SensorId;
  name: string;
  arabicName: string;
  system: string;
  subsystem: string;
  ecu: 'ECM' | 'TCM' | 'ABS' | 'BCM';
  unit: string;
  normalMin: number;
  normalMax: number;
  currentValue: number;
  voltage: number;
  state: SensorFaultState;
  associatedDtcs: string[];
  description: string;
}

export type ActuatorId =
  | 'injector_1'
  | 'cooling_fan_low'
  | 'cooling_fan_high'
  | 'throttle_sweep'
  | 'fuel_pump_relay'
  | 'abs_pump_motor'
  | 'starter_relay'
  | 'horn_relay'
  | 'headlights_high'
  | 'ac_clutch';

export type ActuatorTestStatus = 'idle' | 'running' | 'passed' | 'warning' | 'failed';

export interface ActuatorTestResult {
  id: ActuatorId;
  name: string;
  arabicName: string;
  system: string;
  status: ActuatorTestStatus;
  progressPct: number;
  expectedCurrentA: number;
  measuredCurrentA: number;
  measuredResponse: string;
  notes: string;
  lastTestedAt?: string;
}

export interface CANMessage {
  id: string; // e.g. '0x0C4'
  name: string;
  ecu: 'ECM' | 'TCM' | 'ABS' | 'BCM' | 'SRS' | 'HVAC' | 'ADAS';
  dlc: number;
  bytes: string[]; // e.g. ['12', 'A4', '08', '00', '23', '88', '01', 'FF']
  timestamp: number;
  cycleTimeMs: number;
  count: number;
  decodedSummary: string;
}

export interface ECUNode {
  id: 'ECM' | 'TCM' | 'ABS' | 'BCM' | 'SRS' | 'HVAC' | 'ADAS';
  name: string;
  arabicName: string;
  description: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'DISCONNECTED';
  protocol: string;
  baudRate: string;
  busChannel: 'CAN-High' | 'CAN-Low' | 'CAN-FD';
  dtcCount: number;
  voltageV: number;
  latencyMs: number;
  hardwarePartNum: string;
  softwareVersion: string;
}

export interface VehicleHealthScore {
  overallScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'CRITICAL';
  statusArabic: string;
  engineScore: number;
  transmissionScore: number;
  electricalScore: number;
  absScore: number;
  srsScore: number;
  coolingScore: number;
  fuelEmissionScore: number;
  batteryScore: number;
  adasScore: number;
  activeFaultCount: number;
  pendingFaultCount: number;
  calculatedAt: string;
}

export interface DiagnosticSessionReport {
  id: string;
  title: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vin: string;
  mileageKm: number;
  technicianName: string;
  date: string;
  overallHealthScore: number;
  activeDtcs: string[];
  pendingDtcs: string[];
  sensorFaultsCount: number;
  actuatorTestsRunCount: number;
  telemetrySnapshot: Partial<LiveTelemetryData>;
  technicianNotes: string;
  recommendations: string[];
  isSimulated: boolean;
}

export type OBDMode = '01' | '02' | '03' | '04' | '06' | '07' | '08' | '09' | '0A';

export interface ScanStage {
  step: number;
  title: string;
  arabicTitle: string;
  status: 'pending' | 'in_progress' | 'completed' | 'warning' | 'error';
  details: string;
}
