export type CalculatorCategory =
  | 'all'
  | 'electrical'
  | 'converters'
  | 'powertrain'
  | 'chassis'
  | 'fluids';

export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft';
export type PressureUnit = 'kPa' | 'bar' | 'psi';
export type TorqueUnit = 'Nm' | 'lb-ft' | 'in-lb' | 'kg-m';
export type TemperatureUnit = '°C' | '°F';
export type VolumeUnit = 'L' | 'qt' | 'gal' | 'mL';

export interface BatteryTestResult {
  voltage: number;
  chemistry: 'lead-acid' | 'agm' | 'lithium';
  stateOfChargePct: number;
  status: 'Critical / Discharged' | 'Low Charge' | 'Good Charge' | 'Fully Charged' | 'Overcharging (Alternator Fault)';
  healthColor: string;
  recommendation: string;
}

export interface WireGaugeOption {
  awg: string;
  mm2: number;
  resistancePer1000m: number; // ohms at 20°C
}

export const AUTOMOTIVE_WIRE_GAUGES: WireGaugeOption[] = [
  { awg: '4/0 AWG', mm2: 107.2, resistancePer1000m: 0.161 },
  { awg: '2/0 AWG', mm2: 67.4, resistancePer1000m: 0.256 },
  { awg: '1/0 AWG', mm2: 53.5, resistancePer1000m: 0.322 },
  { awg: '2 AWG (Starter / Battery)', mm2: 33.6, resistancePer1000m: 0.513 },
  { awg: '4 AWG (High Amp Alternator)', mm2: 21.2, resistancePer1000m: 0.815 },
  { awg: '6 AWG (Glow Plug / Fan)', mm2: 13.3, resistancePer1000m: 1.296 },
  { awg: '8 AWG (Amplifier / Fuel Pump)', mm2: 8.37, resistancePer1000m: 2.061 },
  { awg: '10 AWG (Headlights / Blower)', mm2: 5.26, resistancePer1000m: 3.277 },
  { awg: '12 AWG (Ignition / Accessory)', mm2: 3.31, resistancePer1000m: 5.211 },
  { awg: '14 AWG (Lighting / Relays)', mm2: 2.08, resistancePer1000m: 8.286 },
  { awg: '16 AWG (Sensors / Injectors)', mm2: 1.31, resistancePer1000m: 13.17 },
  { awg: '18 AWG (CAN-BUS / Signals)', mm2: 0.823, resistancePer1000m: 20.95 },
  { awg: '20 AWG (ECU Logic / Low V)', mm2: 0.518, resistancePer1000m: 33.31 },
];
