// AutoFix 3D - Reactive Automotive Simulation Engine
// Real-time correlated vehicle signals, sensor fault injection, CAN-bus traffic generation, and diagnostic logic

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
import { INITIAL_SENSOR_DEFINITIONS } from './sensorDefinitions';
import { INITIAL_ACTUATOR_TESTS } from './actuatorDefinitions';
import { INITIAL_ECU_NODES } from './ecuDefinitions';

type Listener = () => void;

class SimulationEngine {
  private static instance: SimulationEngine;

  // Real-time telemetry state
  private telemetry: LiveTelemetryData = {
    rpm: 850,
    speedKmH: 0,
    engineLoadPct: 18.5,
    coolantTempC: 92,
    intakeAirTempC: 32,
    throttlePosPct: 12.0,
    mafGs: 4.8,
    mapKpa: 34,
    o2VoltageB1S1: 0.45,
    o2VoltageB1S2: 0.65,
    stftBank1Pct: 1.5,
    ltftBank1Pct: 0.8,
    fuelRailBar: 52,
    batteryVoltageV: 14.2,
    ignitionTimingDeg: 10.5,
    transmissionTempC: 84,
    wheelSpeedFL: 0,
    wheelSpeedFR: 0,
    wheelSpeedRL: 0,
    wheelSpeedRR: 0,
    brakePressureBar: 0,
    steeringAngleDeg: 0,
    ambientTempC: 24,
    oilPressureBar: 3.2,
    fuelLevelPct: 78,
    timestamp: Date.now(),
  };

  // Target values controlled by user inputs
  private targetThrottle: number = 12.0;
  private targetSpeed: number = 0;
  private isRunning: boolean = true;
  private isPaused: boolean = false;
  private intervalId: any = null;

  // Sensor states
  private sensors: Record<SensorId, SensorDefinition> = { ...INITIAL_SENSOR_DEFINITIONS };

  // Actuator test states
  private actuatorTests: Record<ActuatorId, ActuatorTestResult> = { ...INITIAL_ACTUATOR_TESTS };

  // ECU nodes states
  private ecuNodes: Record<string, ECUNode> = { ...INITIAL_ECU_NODES };

  // Active & Pending DTCs
  private activeDtcs: Set<string> = new Set(['P0301', 'P0171']);
  private pendingDtcs: Set<string> = new Set(['P0420']);

  // CAN-Bus traffic frames
  private canMessages: CANMessage[] = [];
  private canFrameCounter: number = 0;

  // Listeners for UI state syncing
  private listeners: Set<Listener> = new Set();

  private constructor() {
    this.initCanBusTemplates();
    this.startLoop();
  }

  public static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Initialize CAN ID templates
  private initCanBusTemplates() {
    this.canMessages = [
      {
        id: '0x0C4',
        name: 'ECM_Engine_RPM_Torque',
        ecu: 'ECM',
        dlc: 8,
        bytes: ['12', 'A4', '08', '00', '23', '88', '01', 'FF'],
        timestamp: Date.now(),
        cycleTimeMs: 10,
        count: 1042,
        decodedSummary: 'RPM: 850, Torque: 42 Nm, Throttle: 12.0%',
      },
      {
        id: '0x1A0',
        name: 'TCM_Gear_Clutch_State',
        ecu: 'TCM',
        dlc: 8,
        bytes: ['01', '08', '40', '1F', '00', 'D2', '00', '00'],
        timestamp: Date.now(),
        cycleTimeMs: 20,
        count: 521,
        decodedSummary: 'Gear: P (Park), Clutch 1: Open, Clutch 2: Open',
      },
      {
        id: '0x280',
        name: 'ABS_Wheel_Speeds',
        ecu: 'ABS',
        dlc: 8,
        bytes: ['00', '00', '00', '00', '00', '00', '00', '00'],
        timestamp: Date.now(),
        cycleTimeMs: 10,
        count: 1040,
        decodedSummary: 'FL: 0.0, FR: 0.0, RL: 0.0, RR: 0.0 km/h',
      },
      {
        id: '0x350',
        name: 'BCM_Lighting_Doors',
        ecu: 'BCM',
        dlc: 8,
        bytes: ['04', '00', '80', '12', '00', '00', 'AA', '01'],
        timestamp: Date.now(),
        cycleTimeMs: 50,
        count: 208,
        decodedSummary: 'Ignition: ON, Low Beams: ON, Doors: Closed',
      },
      {
        id: '0x4B0',
        name: 'ADAS_Radar_Target_Distance',
        ecu: 'ADAS',
        dlc: 8,
        bytes: ['00', 'C8', '00', '00', '05', '12', '00', '00'],
        timestamp: Date.now(),
        cycleTimeMs: 20,
        count: 519,
        decodedSummary: 'Front Object: 42.5m, Rel Speed: 0.0 m/s',
      },
      {
        id: '0x520',
        name: 'HVAC_Cabin_Thermal',
        ecu: 'HVAC',
        dlc: 6,
        bytes: ['16', '16', '03', '80', '00', '00'],
        timestamp: Date.now(),
        cycleTimeMs: 100,
        count: 104,
        decodedSummary: 'Driver Set: 22°C, Passenger Set: 22°C, Blower: 3',
      },
      {
        id: '0x050',
        name: 'SRS_Airbag_Health_Status',
        ecu: 'SRS',
        dlc: 4,
        bytes: ['00', '00', 'FF', '00'],
        timestamp: Date.now(),
        cycleTimeMs: 100,
        count: 103,
        decodedSummary: 'All 8 Squibs Armed, Belt Tensioners OK',
      },
    ];
  }

  // Main physics loop (runs every 60ms)
  private startLoop() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (this.isPaused || !this.isRunning) return;

      this.updatePhysics();
      this.updateCanBus();
      this.notify();
    }, 60);
  }

  // Correlated vehicle physics calculation
  private updatePhysics() {
    const prev = { ...this.telemetry };

    // 1. Throttle smoothing (moves towards targetThrottle)
    const throttleStep = (this.targetThrottle - prev.throttlePosPct) * 0.15;
    const newThrottle = Math.max(0, Math.min(100, prev.throttlePosPct + throttleStep));

    // 2. Base RPM calculation from Throttle
    // Idle RPM ~ 800-850 RPM; Full throttle ~ 7000 RPM
    let targetRpm = 820 + (newThrottle / 100) * 6180;

    // Add tiny random engine vibration (±15 RPM)
    const jitter = (Math.random() - 0.5) * 25;
    targetRpm += jitter;

    // Check if Crankshaft sensor is faulted
    if (this.sensors.ckp.state === 'OPEN_CIRCUIT') {
      targetRpm = 0; // Engine stall
    }

    // Check if Throttle sensor has limp mode fault
    if (this.sensors.tps.state !== 'NORMAL') {
      targetRpm = Math.min(targetRpm, 2200); // Limp Home mode restricted
    }

    const rpmStep = (targetRpm - prev.rpm) * 0.12;
    const newRpm = Math.max(0, prev.rpm + rpmStep);

    // 3. Engine Load % (correlated with Throttle & RPM)
    let engineLoad = 15.0 + (newThrottle / 100) * 75.0 + (newRpm / 7000) * 10.0;
    engineLoad = Math.max(10, Math.min(100, engineLoad));

    // 4. Vehicle Speed Km/h (if speed target set)
    const speedStep = (this.targetSpeed - prev.speedKmH) * 0.08;
    const newSpeed = Math.max(0, prev.speedKmH + speedStep);

    // 5. MAF (Mass Air Flow in g/s): approximately (RPM * 3.0L * VE) / 120
    let calculatedMaf = (newRpm * 3.0 * (engineLoad / 100)) / 45;
    calculatedMaf = Math.max(2.0, calculatedMaf);

    // Inject sensor fault on MAF if set
    if (this.sensors.maf.state === 'OPEN_CIRCUIT' || this.sensors.maf.state === 'SHORT_TO_GROUND') {
      calculatedMaf = 0.2;
      this.sensors.maf.voltage = 0.02;
    } else if (this.sensors.maf.state === 'HIGH_SIGNAL') {
      calculatedMaf = 195.0;
      this.sensors.maf.voltage = 4.95;
    } else {
      this.sensors.maf.voltage = 0.8 + (calculatedMaf / 180) * 3.8;
    }
    this.sensors.maf.currentValue = Number(calculatedMaf.toFixed(1));

    // 6. MAP (Manifold Absolute Pressure in kPa): idle ~34 kPa (vacuum), boost ~220 kPa
    let calculatedMap = 30 + (engineLoad / 100) * 180;
    if (this.sensors.map.state === 'SHORT_TO_GROUND') {
      calculatedMap = 10;
      this.sensors.map.voltage = 0.05;
    } else {
      this.sensors.map.voltage = 0.5 + (calculatedMap / 250) * 4.0;
    }
    this.sensors.map.currentValue = Math.round(calculatedMap);

    // 7. Oxygen Sensors (O2 B1S1 wideband oscillation)
    let o2v1 = 0.45 + Math.sin(Date.now() / 400) * 0.38;
    let stft = (Math.sin(Date.now() / 600) * 3.0);

    if (this.sensors.o2_b1s1.state === 'SHORT_TO_GROUND' || this.sensors.o2_b1s1.state === 'OPEN_CIRCUIT') {
      o2v1 = 0.02; // false lean
      stft = 25.0; // ECM maxes out fuel enrichment trim!
      this.sensors.o2_b1s1.voltage = 0.02;
    } else if (this.sensors.o2_b1s1.state === 'HIGH_SIGNAL') {
      o2v1 = 0.98; // false rich
      stft = -25.0;
      this.sensors.o2_b1s1.voltage = 0.98;
    } else {
      this.sensors.o2_b1s1.voltage = Number(o2v1.toFixed(3));
    }
    this.sensors.o2_b1s1.currentValue = Number(o2v1.toFixed(3));

    // 8. Coolant Temp (°C)
    let coolant = prev.coolantTempC;
    if (this.sensors.ect.state === 'SHORT_TO_GROUND') {
      coolant = -40; // open thermistor reads extreme cold
      this.sensors.ect.voltage = 0.05;
    } else if (this.sensors.ect.state === 'HIGH_SIGNAL') {
      coolant = 135; // extreme overheat
      this.sensors.ect.voltage = 4.95;
    } else {
      // Gentle thermal cycle around 92°C
      coolant = 90 + Math.sin(Date.now() / 30000) * 4;
      this.sensors.ect.voltage = 0.85;
    }
    this.sensors.ect.currentValue = Math.round(coolant);

    // 9. Fuel Rail Pressure (bar): 40 bar at idle, ramps up to 210 bar under boost
    let fuelRail = 45 + (newRpm / 7000) * 155;
    if (this.sensors.frp.state === 'SHORT_TO_GROUND') {
      fuelRail = 5;
      this.sensors.frp.voltage = 0.1;
    } else {
      this.sensors.frp.voltage = 0.5 + (fuelRail / 220) * 4.0;
    }
    this.sensors.frp.currentValue = Math.round(fuelRail);

    // 10. Battery Voltage: Alternator maintains ~14.2V when running, dips on high electrical load
    const batteryV = newRpm > 400 ? 14.2 - (engineLoad > 70 ? 0.4 : 0.0) : 12.4;

    // 11. Wheel Speeds (km/h)
    let wsFL = newSpeed;
    if (this.sensors.wss_fl.state !== 'NORMAL') {
      wsFL = 0; // Faulted wheel speed sensor
    }
    this.sensors.wss_fl.currentValue = Number(wsFL.toFixed(1));

    // 12. Brake Master Cylinder Pressure (bar)
    const brakeP = this.sensors.bap.state !== 'NORMAL' ? 0 : prev.brakePressureBar;
    this.sensors.bap.currentValue = brakeP;

    // 13. Steering Angle
    const steerAngle = this.sensors.sas.state !== 'NORMAL' ? 0 : prev.steeringAngleDeg;
    this.sensors.sas.currentValue = steerAngle;

    // Update internal telemetry
    this.telemetry = {
      rpm: Math.round(newRpm),
      speedKmH: Number(newSpeed.toFixed(1)),
      engineLoadPct: Number(engineLoad.toFixed(1)),
      coolantTempC: Math.round(coolant),
      intakeAirTempC: 32 + Math.round((newRpm / 7000) * 12),
      throttlePosPct: Number(newThrottle.toFixed(1)),
      mafGs: Number(calculatedMaf.toFixed(1)),
      mapKpa: Math.round(calculatedMap),
      o2VoltageB1S1: Number(o2v1.toFixed(3)),
      o2VoltageB1S2: Number((0.65 + Math.sin(Date.now() / 1500) * 0.05).toFixed(3)),
      stftBank1Pct: Number(stft.toFixed(1)),
      ltftBank1Pct: 1.2,
      fuelRailBar: Math.round(fuelRail),
      batteryVoltageV: Number(batteryV.toFixed(2)),
      ignitionTimingDeg: Number((8.0 + (newRpm / 7000) * 26.0 - (engineLoad / 100) * 10.0).toFixed(1)),
      transmissionTempC: 84 + Math.round((newSpeed / 120) * 12),
      wheelSpeedFL: Number(wsFL.toFixed(1)),
      wheelSpeedFR: Number(newSpeed.toFixed(1)),
      wheelSpeedRL: Number(newSpeed.toFixed(1)),
      wheelSpeedRR: Number(newSpeed.toFixed(1)),
      brakePressureBar: brakeP,
      steeringAngleDeg: steerAngle,
      ambientTempC: 24,
      oilPressureBar: Number((1.8 + (newRpm / 7000) * 3.5).toFixed(1)),
      fuelLevelPct: prev.fuelLevelPct,
      timestamp: Date.now(),
    };

    // Update ECU voltage & latency
    Object.values(this.ecuNodes).forEach((ecu) => {
      ecu.voltageV = Number(batteryV.toFixed(1));
    });
  }

  // Update live CAN bus byte streams
  private updateCanBus() {
    this.canFrameCounter++;

    // Update 0x0C4 (Engine RPM & Throttle)
    const msgRpm = this.canMessages.find((m) => m.id === '0x0C4');
    if (msgRpm) {
      const rpmRaw = Math.round(this.telemetry.rpm * 4); // standard 0.25 rpm resolution
      const b0 = ((rpmRaw >> 8) & 0xff).toString(16).padStart(2, '0').toUpperCase();
      const b1 = (rpmRaw & 0xff).toString(16).padStart(2, '0').toUpperCase();
      const b2 = Math.round(this.telemetry.throttlePosPct * 2.5)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
      msgRpm.bytes[0] = b0;
      msgRpm.bytes[1] = b1;
      msgRpm.bytes[2] = b2;
      msgRpm.timestamp = Date.now();
      msgRpm.count++;
      msgRpm.decodedSummary = `RPM: ${this.telemetry.rpm}, Throttle: ${this.telemetry.throttlePosPct}%, Load: ${this.telemetry.engineLoadPct}%`;
    }

    // Update 0x280 (Wheel speeds)
    const msgAbs = this.canMessages.find((m) => m.id === '0x280');
    if (msgAbs) {
      const spdRaw = Math.round(this.telemetry.speedKmH * 16);
      const b0 = ((spdRaw >> 8) & 0xff).toString(16).padStart(2, '0').toUpperCase();
      const b1 = (spdRaw & 0xff).toString(16).padStart(2, '0').toUpperCase();
      msgAbs.bytes[0] = b0;
      msgAbs.bytes[1] = b1;
      msgAbs.timestamp = Date.now();
      msgAbs.count++;
      msgAbs.decodedSummary = `FL: ${this.telemetry.wheelSpeedFL}, FR: ${this.telemetry.wheelSpeedFR} km/h`;
    }
  }

  // Public Accessors & Controls
  public getTelemetry(): LiveTelemetryData {
    return { ...this.telemetry };
  }

  public getSensors(): Record<SensorId, SensorDefinition> {
    return { ...this.sensors };
  }

  public getActuatorTests(): Record<ActuatorId, ActuatorTestResult> {
    return { ...this.actuatorTests };
  }

  public getEcuNodes(): Record<string, ECUNode> {
    return { ...this.ecuNodes };
  }

  public getActiveDtcs(): string[] {
    return Array.from(this.activeDtcs);
  }

  public getPendingDtcs(): string[] {
    return Array.from(this.pendingDtcs);
  }

  public getCanMessages(): CANMessage[] {
    return [...this.canMessages];
  }

  public isEngineSimulating(): boolean {
    return this.isRunning && !this.isPaused;
  }

  public togglePauseSimulation(): boolean {
    this.isPaused = !this.isPaused;
    this.notify();
    return this.isPaused;
  }

  public setThrottle(pos: number) {
    this.targetThrottle = Math.max(0, Math.min(100, pos));
    this.notify();
  }

  public setTargetSpeed(kmh: number) {
    this.targetSpeed = Math.max(0, Math.min(320, kmh));
    this.notify();
  }

  // Fault Injection Mechanism
  public injectSensorFault(sensorId: SensorId, state: SensorFaultState) {
    if (!this.sensors[sensorId]) return;

    this.sensors[sensorId].state = state;

    // Automatic cascade onto DTCs
    const dtcs = this.sensors[sensorId].associatedDtcs;
    if (state === 'NORMAL') {
      dtcs.forEach((code) => {
        this.activeDtcs.delete(code);
      });
    } else {
      // Add primary fault code
      if (dtcs.length > 0) {
        this.activeDtcs.add(dtcs[0]);
      }
      if (dtcs.length > 1 && (state === 'SHORT_TO_GROUND' || state === 'OPEN_CIRCUIT')) {
        this.activeDtcs.add(dtcs[1]);
      }
    }

    // Update ECU DTC counters
    const ecuId = this.sensors[sensorId].ecu;
    if (this.ecuNodes[ecuId]) {
      this.ecuNodes[ecuId].dtcCount = Array.from(this.activeDtcs).filter((code) => {
        if (ecuId === 'ECM') return code.startsWith('P');
        if (ecuId === 'ABS') return code.startsWith('C');
        if (ecuId === 'BCM') return code.startsWith('B');
        return code.startsWith('U');
      }).length;
    }

    this.notify();
  }

  // Reset all sensors to normal
  public clearAllSensorFaults() {
    Object.keys(this.sensors).forEach((key) => {
      this.sensors[key as SensorId].state = 'NORMAL';
    });
    this.notify();
  }

  // Clear all DTCs (OBD Mode 04)
  public clearAllDtcs() {
    this.activeDtcs.clear();
    this.pendingDtcs.clear();
    Object.values(this.ecuNodes).forEach((ecu) => {
      ecu.dtcCount = 0;
    });
    this.notify();
  }

  // Add DTC manually
  public addDtc(code: string) {
    const formatted = code.trim().toUpperCase();
    if (formatted) {
      this.activeDtcs.add(formatted);
      this.notify();
    }
  }

  // Remove single DTC
  public removeDtc(code: string) {
    this.activeDtcs.delete(code.trim().toUpperCase());
    this.notify();
  }

  // ECU Network Disconnect simulation
  public toggleEcuConnection(ecuId: string) {
    const node = this.ecuNodes[ecuId];
    if (!node) return;

    if (node.status === 'ONLINE') {
      node.status = 'DISCONNECTED';
      // Trigger U0100 / U0101 network DTCs
      if (ecuId === 'TCM') this.activeDtcs.add('U0101');
      else if (ecuId === 'ABS') this.activeDtcs.add('U0121');
      else if (ecuId === 'BCM') this.activeDtcs.add('U0140');
      else this.activeDtcs.add('U0100');
    } else {
      node.status = 'ONLINE';
      if (ecuId === 'TCM') this.activeDtcs.delete('U0101');
      else if (ecuId === 'ABS') this.activeDtcs.delete('U0121');
      else if (ecuId === 'BCM') this.activeDtcs.delete('U0140');
      else this.activeDtcs.delete('U0100');
    }

    this.notify();
  }

  // Actuator Test Execution (Bi-directional Mode 08)
  public runActuatorTest(actuatorId: ActuatorId, onComplete?: (res: ActuatorTestResult) => void) {
    const test = this.actuatorTests[actuatorId];
    if (!test || test.status === 'running') return;

    test.status = 'running';
    test.progressPct = 0;
    test.measuredCurrentA = 0.2;
    test.measuredResponse = 'Starting test sequence...';
    this.notify();

    let step = 0;
    const testTimer = setInterval(() => {
      step += 25;
      test.progressPct = Math.min(100, step);

      if (step === 50) {
        test.measuredCurrentA = Number((test.expectedCurrentA * (0.95 + Math.random() * 0.1)).toFixed(2));
        test.measuredResponse = `Current draw stable at ${test.measuredCurrentA}A. Valve/Motor active.`;
        this.notify();
      }

      if (step >= 100) {
        clearInterval(testTimer);

        // Check if related sensor or ECU has fault
        const isFaulted =
          (actuatorId === 'throttle_sweep' && this.sensors.tps.state !== 'NORMAL') ||
          (actuatorId === 'abs_pump_motor' && this.sensors.wss_fl.state !== 'NORMAL');

        if (isFaulted) {
          test.status = 'failed';
          test.measuredResponse = 'TEST FAILED: Coil current out of range / Plausibility error.';
        } else {
          test.status = 'passed';
          test.measuredResponse = `TEST PASSED: Actuator responded within OEM tolerance (${test.measuredCurrentA}A).`;
        }

        test.lastTestedAt = new Date().toLocaleTimeString();
        this.notify();
        if (onComplete) onComplete(test);
      }
    }, 400);
  }

  // Reset single actuator test
  public resetActuatorTest(actuatorId: ActuatorId) {
    if (this.actuatorTests[actuatorId]) {
      this.actuatorTests[actuatorId].status = 'idle';
      this.actuatorTests[actuatorId].progressPct = 0;
      this.actuatorTests[actuatorId].measuredCurrentA = 0.0;
      this.notify();
    }
  }

  // Compute realistic Vehicle Health Score (0 - 100)
  public calculateHealthScore(): VehicleHealthScore {
    let engine = 98;
    let transmission = 99;
    let electrical = 97;
    let abs = 99;
    let srs = 100;
    let cooling = 98;
    let fuelEmission = 96;
    let battery = 98;
    let adas = 98;

    // Deductions based on active DTCs
    this.activeDtcs.forEach((code) => {
      if (code.startsWith('P03')) engine -= 25; // Misfire
      else if (code.startsWith('P017') || code.startsWith('P013')) fuelEmission -= 20; // Fuel Trim / O2
      else if (code.startsWith('P010')) engine -= 15; // MAF
      else if (code.startsWith('P011')) cooling -= 15; // ECT
      else if (code.startsWith('P07')) transmission -= 30; // Transmission
      else if (code.startsWith('C00')) abs -= 35; // ABS Wheel speed
      else if (code.startsWith('B00')) srs -= 40; // Airbag
      else if (code.startsWith('U01')) {
        electrical -= 25;
        adas -= 20;
      }
    });

    // Deductions based on sensor faults
    Object.values(this.sensors).forEach((s) => {
      if (s.state !== 'NORMAL') {
        if (s.system.includes('Engine')) engine -= 15;
        if (s.system.includes('Emission')) fuelEmission -= 15;
        if (s.system.includes('Braking')) abs -= 20;
        if (s.system.includes('Cooling')) cooling -= 20;
      }
    });

    // Clamp scores
    engine = Math.max(10, Math.min(100, engine));
    transmission = Math.max(10, Math.min(100, transmission));
    electrical = Math.max(10, Math.min(100, electrical));
    abs = Math.max(10, Math.min(100, abs));
    srs = Math.max(10, Math.min(100, srs));
    cooling = Math.max(10, Math.min(100, cooling));
    fuelEmission = Math.max(10, Math.min(100, fuelEmission));
    battery = Math.max(10, Math.min(100, battery));
    adas = Math.max(10, Math.min(100, adas));

    const overall = Math.round(
      (engine * 0.25 +
        transmission * 0.15 +
        abs * 0.15 +
        srs * 0.1 +
        fuelEmission * 0.1 +
        cooling * 0.1 +
        electrical * 0.05 +
        battery * 0.05 +
        adas * 0.05)
    );

    let status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'CRITICAL' = 'EXCELLENT';
    let statusArabic = 'ممتازة';
    if (overall < 50 || this.activeDtcs.size >= 4) {
      status = 'CRITICAL';
      statusArabic = 'حرجة - يلزم صيانة فورية';
    } else if (overall < 75 || this.activeDtcs.size >= 2) {
      status = 'FAIR';
      statusArabic = 'متوسطة - توجد أعطال مخزنة';
    } else if (overall < 90 || this.activeDtcs.size === 1) {
      status = 'GOOD';
      statusArabic = 'جيدة - تنبيهات طفيفة';
    }

    return {
      overallScore: overall,
      status,
      statusArabic,
      engineScore: engine,
      transmissionScore: transmission,
      electricalScore: electrical,
      absScore: abs,
      srsScore: srs,
      coolingScore: cooling,
      fuelEmissionScore: fuelEmission,
      batteryScore: battery,
      adasScore: adas,
      activeFaultCount: this.activeDtcs.size,
      pendingFaultCount: this.pendingDtcs.size,
      calculatedAt: new Date().toLocaleTimeString(),
    };
  }

  // Progressive 9-Stage Scan Engine
  public executeFullVehicleScan(
    onProgress: (step: number, stageName: string, pct: number) => void,
    onComplete: (report: DiagnosticSessionReport) => void
  ) {
    const stages = [
      { name: 'CONNECTING', ar: 'جاري الاتصال بناقل البيانات OBD-II', ms: 500 },
      { name: 'INITIALIZING', ar: 'تهيئة بروتوكول ISO 15765-4 CAN (CAN-FD)', ms: 600 },
      { name: 'ECU DISCOVERY', ar: 'اكتشاف وحدات التحكم (ECM, TCM, ABS, BCM, SRS, HVAC, ADAS)', ms: 700 },
      { name: 'CAN BUS CHECK', ar: 'فحص خطوط CAN-High / CAN-Low وسلامة الجهد الكهربائي', ms: 600 },
      { name: 'MODULE DISCOVERY', ar: 'قراءة أرقام القطع وإصدارات البرامج الثابتة', ms: 600 },
      { name: 'DTC SCAN', ar: 'مسح شامل لأكواد الأعطال (P, C, B, U)', ms: 800 },
      { name: 'LIVE DATA INITIALIZATION', ar: 'قراءة الإشارات الحية ومستويات المستشعرات', ms: 600 },
      { name: 'HEALTH ANALYSIS', ar: 'تحليل المؤشرات وحساب مؤشر كفاءة المركبة', ms: 700 },
      { name: 'FINAL REPORT', ar: 'توليد تقرير الفحص التشخيصي المعتمد', ms: 500 },
    ];

    let currentIdx = 0;

    const runNext = () => {
      if (currentIdx >= stages.length) {
        // Complete scan and generate report
        const health = this.calculateHealthScore();
        const report: DiagnosticSessionReport = {
          id: `SCAN-${Date.now()}`,
          title: `Full System Diagnostic Scan - ${new Date().toLocaleDateString()}`,
          vehicleMake: 'Porsche',
          vehicleModel: '911 Carrera (992.1)',
          vehicleYear: '2022',
          vin: 'WP0AA2A92NS240192',
          mileageKm: 18450,
          technicianName: 'Eng. Aala Mohammed',
          date: new Date().toLocaleString(),
          overallHealthScore: health.overallScore,
          activeDtcs: Array.from(this.activeDtcs),
          pendingDtcs: Array.from(this.pendingDtcs),
          sensorFaultsCount: Object.values(this.sensors).filter((s) => s.state !== 'NORMAL').length,
          actuatorTestsRunCount: Object.values(this.actuatorTests).filter((a) => a.status !== 'idle').length,
          telemetrySnapshot: { ...this.telemetry },
          technicianNotes: 'Comprehensive automated diagnostic sweep performed via ISO 15765-4 CAN interface.',
          recommendations: [
            'Inspect ignition coil packs and spark plug gap on Cylinder 1 (P0301).',
            'Perform smoke test on intake manifold gaskets and vacuum lines to verify fuel trim correlation (P0171).',
            'Verify oxygen sensor heater circuit resistance before catalytic converter.',
          ],
          isSimulated: true,
        };

        this.saveSessionReport(report);
        onComplete(report);
        return;
      }

      const stg = stages[currentIdx];
      const pct = Math.round(((currentIdx + 1) / stages.length) * 100);
      onProgress(currentIdx + 1, stg.ar, pct);

      setTimeout(() => {
        currentIdx++;
        runNext();
      }, stg.ms);
    };

    runNext();
  }

  // Diagnostic Session History Persistence (LocalStorage with IndexedDB fallback)
  public saveSessionReport(report: DiagnosticSessionReport) {
    try {
      const existing = this.getSavedSessions();
      const filtered = existing.filter((s) => s.id !== report.id);
      filtered.unshift(report);
      // Keep up to 20 past sessions
      const trimmed = filtered.slice(0, 20);
      localStorage.setItem('autofix_diagnostic_sessions', JSON.stringify(trimmed));
    } catch (e) {
      console.warn('LocalStorage save session error:', e);
    }
  }

  public getSavedSessions(): DiagnosticSessionReport[] {
    try {
      const raw = localStorage.getItem('autofix_diagnostic_sessions');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('LocalStorage load session error:', e);
    }
    return [];
  }

  public deleteSession(id: string) {
    try {
      const existing = this.getSavedSessions();
      const updated = existing.filter((s) => s.id !== id);
      localStorage.setItem('autofix_diagnostic_sessions', JSON.stringify(updated));
      this.notify();
    } catch (e) {
      console.warn('Delete session error:', e);
    }
  }
}

export const simulationEngine = SimulationEngine.getInstance();
