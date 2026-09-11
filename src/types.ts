export type Language = 'en' | 'ar';

export type NavPath =
  | 'dashboard'
  | 'workshop-mode'
  | 'vehicle-explorer'
  | 'autofix-ai'
  | 'diagnostic-engine'
  | '3d-telemetry-cad'
  | 'live-dtc-scanner'
  | 'powertrain-engine'
  | 'transmission-pdk'
  | 'braking-abs'
  | 'thermal-cooling'
  | 'electrical-wiring'
  | 'suspension-steering'
  | 'service-schedules'
  | 'repair-guides'
  | 'fluid-specs'
  | 'tools-torque'
  | 'parts-catalog'
  | 'system-settings'
  | 'data-import';

export interface VehicleSpec {
  make: string;
  model: string;
  year: string;
  powertrain: string;
  drivetrain: string;
  gearbox: string;
  displacement: string;
  engineOil: string;
  sparkGap: string;
  wheelBoltTorque: string;
  vin: string;
}

export interface FreezeFrameData {
  rpm: number;
  engineLoad: number;
  stftBank1: number;
  ltftBank1: number;
  speed: number;
  fuelRailBar: number;
  frameNumber: number;
}

export interface ProbableCause {
  title: string;
  confidence: number;
  severity: 'high' | 'medium' | 'low';
}

export interface MaintenanceItem {
  id: string;
  title: string;
  desc: string;
  badge: string;
  badgeType: 'warning' | 'error' | 'neutral' | 'success';
  icon: string;
  specs: { label: string; value: string; highlight?: boolean; error?: boolean }[];
  actionLabel: string;
  actionType: 'primary' | 'error' | 'secondary';
}

export interface DiagnosticStep {
  id: number;
  title: string;
  instruction: string;
  expectedValue: string;
  system: string;
  status?: 'passed' | 'failed' | 'pending';
}
