export interface FluidSpec {
  name: string;
  spec: string;
  capacity: string;
  serviceInterval: string;
  notes?: string;
}

export interface BatterySpec {
  groupSize: string;
  cca: number; // Cold Cranking Amps
  chemistry: 'AGM' | 'Enhanced Flooded (EFB)' | 'Standard Flooded' | 'Lithium-Ion';
  voltage: string;
  reserveCapacityMinutes: number;
  terminalLocation: 'Top Post' | 'Side Post' | 'Top Post (Reversed Terminals)';
  partNumberOEM: string;
  recommendedReplacementYears: number;
}

export interface TireSpec {
  standardFront: string;
  standardRear: string;
  pressureColdFrontPsi: number;
  pressureColdRearPsi: number;
  boltPattern: string; // e.g. 5x114.3mm, 5x130mm, 6x135mm
  wheelLugTorque: string; // e.g. "103 lb-ft (140 Nm)"
  speedRating: string;
}

export interface MaintenanceInterval {
  mileage: number;
  months: number;
  title: string;
  description: string;
  severity: 'standard' | 'critical';
  serviceCategory: 'Engine' | 'Brakes' | 'Transmission' | 'Cooling' | 'Fluids' | 'Filters';
}

export interface KnownMaintenanceTask {
  id: string;
  title: string;
  component: string;
  system: string;
  estimatedLaborHours: number;
  difficulty: 'Easy' | 'Moderate' | 'Advanced' | 'Master Tech';
  commonSymptoms: string[];
  recommendedParts: { name: string; oemNumber: string; avgCost: string }[];
  factoryProcedureSummary: string;
  torqueSpecs?: { part: string; spec: string }[];
}

export interface ServiceHistoryRecord {
  id: string;
  date: string;
  odometer: number;
  title: string;
  category: string;
  technician: string;
  notes: string;
  status: 'Completed' | 'Pending' | 'Flagged';
}

export interface VehicleProfileData {
  id: string; // e.g. "toyota-camry-2018-xv70-2.5l-se-auto"
  make: string;
  model: string;
  year: number;
  generation: string; // e.g. "XV70 (8th Gen)"
  engine: string; // e.g. "2.5L I4 Dynamic Force (A25A-FKS)"
  displacement: string; // e.g. "2,487 cc (2.5L)"
  cylinderCount: number;
  cylinderLayout: 'Inline-4' | 'V6' | 'V8' | 'Boxer-6' | 'Inline-6';
  horsepower: number;
  torqueLbFt: number;
  trim: string; // e.g. "SE / XSE"
  transmission: string; // e.g. "8-speed Direct Shift Automatic (UB80E)"
  fuelType: 'Gasoline 87 Octane' | 'Gasoline 91+ Premium' | 'Flex Fuel E85' | 'Diesel' | 'Hybrid';
  driveType: 'FWD' | 'RWD' | 'AWD' | '4WD';
  vinExample: string;
  image: string;
  model3DAsset?: string;
  curbWeightLbs: number;
  fluids: FluidSpec[];
  battery: BatterySpec;
  tires: TireSpec;
  serviceIntervals: MaintenanceInterval[];
  knownMaintenanceTasks: KnownMaintenanceTask[];
  history: ServiceHistoryRecord[];
}

export interface TaxonomyStepOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
}

export interface NaturalSearchParsedResult {
  rawQuery: string;
  detected: {
    make?: string;
    model?: string;
    year?: number;
    system?: string;
    component?: string;
    repairAction?: string;
  };
  matchedVehicle?: VehicleProfileData;
  matchedTasks: KnownMaintenanceTask[];
  matchedFluids: { vehicle: VehicleProfileData; fluid: FluidSpec }[];
  matchedBattery?: { vehicle: VehicleProfileData; battery: BatterySpec };
  confidence: number;
}
