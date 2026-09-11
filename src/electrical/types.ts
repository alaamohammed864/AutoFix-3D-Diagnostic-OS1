export type ElectricalSystemId =
  | 'battery'
  | 'alternator'
  | 'starter'
  | 'fuses'
  | 'relays'
  | 'lighting'
  | 'ignition'
  | 'sensors'
  | 'ecu'
  | 'can-bus';

export interface ElectricalSystemMeta {
  id: ElectricalSystemId;
  nameEn: string;
  nameAr: string;
  icon: string;
  voltageClass: '12V Primary' | '5V Logic' | 'CAN Bus Differential' | 'High-Amperage (>50A)' | 'Pulsed High-Voltage';
  description: string;
}

export interface CircuitNodeCoord {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  type: 'battery' | 'fuse' | 'relay' | 'switch_ecu' | 'component' | 'ground' | 'sensor' | 'bus';
}

export interface WireConnection {
  fromNodeId: string;
  toNodeId: string;
  wireType: 'power' | 'ground' | 'signal' | 'can_high' | 'can_low';
  colorCode: string; // e.g. "W-B" (White with Black stripe)
  colorHex: string;
  gaugeAwg: string; // e.g. "14 AWG"
  voltageNominalV: number;
  expectedCurrentA: number;
}

export interface ElectricalComponentData {
  id: string;
  systemId: ElectricalSystemId;
  nameEn: string;
  nameAr: string;
  location: string;
  partNumberOEM: string;

  // 1. Power Path
  powerPath: {
    summary: string;
    sourceNode: string;
    fuseNode: string;
    relayNode?: string;
    wireColorCode: string;
    wireColorHex: string;
    wireGauge: string;
    connectorCode: string;
    terminalPin: string;
  };

  // 2. Ground
  ground: {
    summary: string;
    terminalPin: string;
    groundPointId: string;
    location: string;
    wireColorCode: string;
    wireColorHex: string;
    maxResistanceOhms: number;
  };

  // 3. Signal
  signal: {
    summary: string;
    signalType: '12V Switched' | '5V VREF / Analog' | 'PWM / Duty Cycle' | 'Differential CAN (2.5V/3.5V)' | 'LIN Single-Wire' | 'Ionization Feedback (IGF)';
    controller: string;
    controllerPin: string;
    wireColorCode: string;
    wireColorHex: string;
    operatingRange: string;
    waveformDesc: string;
  };

  // 4. Related Fuse
  relatedFuse: {
    id: string;
    name: string;
    ratingAmps: number;
    fuseType: 'Blade ATO/ATC' | 'Low-Profile Mini' | 'Micro2' | 'JCASE Cartridge' | 'Bolt-on Fusible Link';
    locationBox: string;
    colorHex: string;
  };

  // 5. Related Relay
  relatedRelay: {
    id: string;
    name: string;
    type: '4-Pin SPST' | '5-Pin SPDT' | 'Micro ISO' | 'Solid-State Smart Driver';
    location: string;
    coilTerminals: string; // e.g. "Pin 85 (GND) & Pin 86 (+12V)"
    contactTerminals: string; // e.g. "Pin 30 (Hot at all times) & Pin 87 (Load Feed)"
    nominalCoilOhms: number;
  };

  // 6. Related Sensor
  relatedSensor: {
    id: string;
    name: string;
    partNumberOEM: string;
    sensorTechnology:
      | 'Hall-Effect'
      | 'Active Shunt Resistor'
      | 'PZT Knock Sensor'
      | 'Hot-Wire Anemometer'
      | 'Dual Potentiometer'
      | 'NTC Thermistor'
      | 'Optical'
      | 'Piezoelectric';
    diagnosticRole: string;
    normalOperatingValue: string;
  };

  // Telemetry & Test Values
  testValues: {
    voltage: {
      keyOffV: number;
      keyOnV: number;
      runningV: number;
      vrefV?: number;
      nominalText: string;
    };
    resistance: {
      nominalOhms: number;
      minOhms: number;
      maxOhms: number;
      testCondition: string;
    };
    continuity: {
      testPinA: string;
      testPinB: string;
      expectedLoopOhms: number;
      status: 'CONTINUITY OK (< 0.1 Ω)' | 'HIGH RESISTANCE' | 'OPEN CIRCUIT';
    };
    voltageDrop: {
      testCircuit: string;
      standardMaxV: number;
      measuredDropV: number;
      standardRef: string; // e.g. "SAE J1114 / TMC RP 129"
      passStatus: boolean;
    };
  };

  // Schematic layout nodes & wires for animated visualization
  schematic: {
    nodes: CircuitNodeCoord[];
    wires: WireConnection[];
  };
}

export interface VerifiedVehicleElectricalProfile {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  generation: string;
  oemDiagramRef: string;
  wiringStandards: 'SAE J1128' | 'DIN 72551' | 'JIS C3406';
  isVerified: boolean;
  systems: Record<ElectricalSystemId, ElectricalComponentData[]>;
}
