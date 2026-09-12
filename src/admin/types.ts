// AutoFix 3D - Enterprise Admin & Data Governance Types
// Retains full source provenance, data quality states, and multi-entity schemas

export type AdminSection =
  | 'data-quality'
  | 'vehicles'
  | 'manufacturers'
  | 'models'
  | 'engines'
  | 'systems'
  | 'components'
  | 'repairs'
  | 'diagnostics'
  | 'dtc'
  | 'maintenance'
  | 'videos'
  | 'sources'
  | 'imports'
  | 'users'
  | 'reports'
  | 'system-health';

export type QualityStatus =
  | 'Verified'
  | 'Unverified'
  | 'Needs Review'
  | 'Duplicate'
  | 'Missing Data';

export type RecordStatus = 'Active' | 'Disabled';

export interface RecordProvenance {
  source: string; // e.g. "OEM Official", "NHTSA Recall DB", "CarCareKiosk", "OBD-II Standard", "Alldata Pro", "Haynes Tech"
  sourceUrl?: string;
  sourceId?: string;
  license?: string;
  importedAt: string;
  importedBy: string; // user ID or name
  checksum: string; // SHA-256 or MD5 signature
  confidenceScore: number; // 0-100%
  verificationStatus: QualityStatus;
  qualityIssues?: string[]; // E.g., "Missing torque spec", "No OEM part number"
  duplicateOf?: string; // ID of candidate master record
  history: {
    timestamp: string;
    action: 'INGESTED' | 'VALIDATED' | 'EDITED' | 'MERGED' | 'DISABLED' | 'VERIFIED';
    actor: string;
    details?: string;
  }[];
}

export interface BaseAdminRecord {
  id: string;
  title: string;
  status: RecordStatus;
  provenance: RecordProvenance;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// 1. Vehicles
export interface AdminVehicleRecord extends BaseAdminRecord {
  make: string;
  model: string;
  year: number;
  vin?: string;
  generation?: string;
  trim?: string;
  bodyStyle?: string;
  engineCode?: string;
  powertrain?: string;
  drivetrain?: string;
  transmission?: string;
  curbWeightLbs?: number;
}

// 2. Manufacturers
export interface AdminManufacturerRecord extends BaseAdminRecord {
  name: string;
  country: string;
  foundedYear: number;
  headquarters: string;
  parentCompany?: string;
  oemPortalUrl?: string;
  apiSupportStatus: 'Active' | 'Restricted' | 'Manual-Only' | 'Offline';
  vehiclesCount: number;
}

// 3. Models
export interface AdminModelRecord extends BaseAdminRecord {
  manufacturer: string;
  modelName: string;
  chassisCode: string; // e.g. "992", "XV70", "G30"
  marketSegment: string;
  productionStartYear: number;
  productionEndYear?: number | 'Present';
  supportedGenerations: string[];
}

// 4. Engines
export interface AdminEngineRecord extends BaseAdminRecord {
  engineCode: string; // e.g. "A25A-FKS", "B58B30O1", "MDG.GA"
  manufacturer: string;
  displacementLiters: number;
  cylinderConfig: string; // e.g. "Inline-4", "Flat-6", "V8"
  aspiration: 'Naturally Aspirated' | 'Single Turbo' | 'Twin Turbo' | 'Supercharged' | 'Hybrid Assisted';
  horsepower: number;
  torqueLbFt: number;
  fuelSystem: string;
  compressionRatio?: string;
  oilViscositySpec?: string;
}

// 5. Systems
export interface AdminSystemRecord extends BaseAdminRecord {
  systemCode: string; // "POWERTRAIN", "ELECTRICAL", "BRAKING", etc.
  name: string;
  criticalityLevel: 'Safety Critical' | 'High' | 'Medium' | 'Low';
  subsystemsCount: number;
  ecuNetworkBus: 'CAN-High' | 'CAN-FD' | 'FlexRay' | 'LIN' | 'Ethernet BroadR-Reach';
  leadSensorType?: string;
}

// 6. Components
export interface AdminComponentRecord extends BaseAdminRecord {
  componentName: string;
  system: string;
  subsystem: string;
  oemPartNumber: string;
  alternatePartNumbers?: string[];
  voltageRating?: string;
  pinCount?: number;
  operatingTempRange?: string;
  failureRateCategory: 'Common' | 'Moderate' | 'Rare';
}

// 7. Repairs
export interface AdminRepairRecord extends BaseAdminRecord {
  procedureCode: string;
  category: string;
  applicableVehicle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master Tech';
  estimatedMinutes: number;
  requiredTools: string[];
  torqueSpecsSummary?: string;
  stepsCount: number;
}

// 8. Diagnostics
export interface AdminDiagnosticRecord extends BaseAdminRecord {
  testId: string;
  symptom: string;
  targetSystem: string;
  testProtocol: 'OBD-II Mode 06' | 'CAN Live PID' | 'Multimeter Pinout' | 'Oscilloscope Waveform';
  expectedParameters: string;
  failureThreshold: string;
  nextStepsIfFault: string;
}

// 9. DTC (Diagnostic Trouble Codes)
export interface AdminDtcRecord extends BaseAdminRecord {
  code: string; // "P0300", "P0171", etc.
  standard: 'SAE J2012' | 'ISO 14229' | 'OEM Manufacturer Proprietary';
  system: string;
  subsystem: string;
  severity: 'CRITICAL' | 'MODERATE' | 'INFO';
  milStatus: 'Active Immediate' | 'Pending 2-Trip' | 'Stored Historical';
  recommendedAction: string;
  freezeFrameRequired: boolean;
}

// 10. Maintenance
export interface AdminMaintenanceRecord extends BaseAdminRecord {
  scheduleCode: string;
  applicableModel: string;
  mileageInterval: number; // e.g. 10000, 30000, 60000
  monthInterval: number; // e.g. 12, 36, 72
  serviceCategory: 'Engine Lubrication' | 'Transmission' | 'Brake Hydraulics' | 'Thermal Coolant' | 'Ignition';
  inspectOrReplace: 'Replace' | 'Inspect' | 'Flush & Bleed';
  fluidSpecification?: string;
}

// 11. Videos
export interface AdminVideoRecord extends BaseAdminRecord {
  videoTitle: string;
  provider: 'CarCareKiosk' | 'YouTube OEM Tech' | 'AutoFix Internal Studio';
  videoUrl: string;
  durationSeconds: number;
  associatedProcedureId?: string;
  vehicleApplicability: string;
  resolution: '4K' | '1080p' | '720p';
  hasSubtitles: boolean;
}

// 12. Sources
export interface AdminSourceRecord extends BaseAdminRecord {
  sourceName: string;
  category: 'Government Safety' | 'OEM Technical Data' | 'Third-Party Aftermarket' | 'Open Source Community';
  endpointUrl: string;
  syncFrequency: 'Realtime' | 'Hourly' | 'Daily' | 'Weekly' | 'Manual Batch';
  recordsSuppliedCount: number;
  apiHealthStatus: 'Healthy' | 'Degraded' | 'Auth Required' | 'Offline';
  confidenceRating: number; // 0-100
}

// 13. Imports
export interface AdminImportRecord extends BaseAdminRecord {
  jobId: string;
  sourceProvider: string;
  importedEntityType: string;
  recordsCount: number;
  validCount: number;
  errorsCount: number;
  duplicatesCount: number;
  executionDurationMs: number;
  statusText: 'Completed' | 'Partially Ingested' | 'Failed' | 'In Progress';
}

// 14. Users
export interface AdminUserRecord extends BaseAdminRecord {
  fullName: string;
  email: string;
  role: 'Guest' | 'User' | 'Mechanic' | 'Workshop Manager' | 'Administrator';
  workshopAffiliation?: string;
  activeSessions: number;
  lastLoginAt: string;
  permissionsList: string[];
}

// 15. Reports
export interface AdminReportRecord extends BaseAdminRecord {
  reportTitle: string;
  reportType: 'Data Quality Audit' | 'DTC Incidence Heatmap' | 'Workshop Utilization' | 'Source Sync Health';
  generatedBy: string;
  format: 'PDF' | 'JSON' | 'CSV';
  metricsSummary: string;
  downloadUrl?: string;
}

// 16. System Health
export interface AdminSystemHealthMetric extends BaseAdminRecord {
  serviceName: string;
  subsystemNode: string;
  uptimePercentage: number;
  latencyMs: number;
  statusIndicator: 'Healthy' | 'Warning' | 'Critical';
  lastHealthCheck: string;
  details: string;
}

export interface DataQualitySummary {
  totalRecords: number;
  verifiedCount: number;
  unverifiedCount: number;
  needsReviewCount: number;
  duplicateCount: number;
  missingDataCount: number;
  overallHealthScore: number; // 0 - 100
  sectionBreakdown: Record<
    AdminSection,
    {
      total: number;
      verified: number;
      unverified: number;
      needsReview: number;
      duplicate: number;
      missingData: number;
    }
  >;
}
