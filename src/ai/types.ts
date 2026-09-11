export type AiIntent =
  | 'EXPLAIN_SYMPTOMS'
  | 'EXPLAIN_COMPONENTS'
  | 'GUIDE_DIAGNOSTIC_WORKFLOW'
  | 'SUMMARIZE_REPAIR_PROCEDURES'
  | 'EXPLAIN_DTC_CODES'
  | 'EXPLAIN_MAINTENANCE_SCHEDULES'
  | 'COMPARE_POSSIBLE_CAUSES'
  | 'GENERATE_DIAGNOSTIC_CHECKLIST'
  | 'GENERATE_MECHANIC_REPORT'
  | 'GENERAL_INQUIRY';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low' | 'Insufficient';

export type SourceType =
  | 'Vehicle database'
  | 'Repair reference'
  | 'Manufacturer documentation'
  | 'External video reference';

export interface SourceCitation {
  id: string;
  type: SourceType;
  title: string;
  detail: string;
  verified: boolean;
  url?: string;
  partNumber?: string;
  code?: string;
}

export interface DiagnosticChecklistItem {
  id: string;
  stepNumber: number;
  task: string;
  system: string;
  tool: string;
  spec: string;
  critical: boolean;
  checked: boolean;
}

export interface DiagnosticChecklist {
  id: string;
  title: string;
  symptomOrDtc: string;
  vehicle: string;
  items: DiagnosticChecklistItem[];
}

export interface MechanicReport {
  reportId: string;
  date: string;
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim?: string;
    engine: string;
    transmission?: string;
    vin: string;
    mileage: string;
  };
  customerConcern: string;
  scannedDtcs: {
    code: string;
    title: string;
    severity: string;
    milStatus?: string;
  }[];
  telemetryFindings: {
    parameter: string;
    measured: string;
    expected: string;
    status: 'Normal' | 'Abnormal' | 'Critical';
  }[];
  verifiedRootCause: string;
  recommendedProcedure: string;
  requiredParts: {
    name: string;
    partNumber: string;
    qty: number;
    estCost: string;
  }[];
  torqueSpecs: {
    fastener: string;
    torque: string;
    notes?: string;
  }[];
  estimatedLaborHours: string;
  technicianNotes: string;
  certifyingTechnician: string;
}

export interface CauseComparison {
  symptom: string;
  vehicle: string;
  causes: {
    id: string;
    name: string;
    probability: number;
    system: string;
    keyIndicators: string;
    verificationTest: string;
    estCost: string;
  }[];
}

export interface RetrievedVehicleContext {
  id: string;
  year: number;
  make: string;
  model: string;
  engine: string;
  transmission: string;
  trim: string;
  vin: string;
  isExactMatch: boolean;
  sourceDoc: string;
}

export interface RetrievedDataContext {
  query: string;
  detectedIntent: AiIntent;
  vehicleContext: RetrievedVehicleContext;
  matchedDtcs: any[];
  matchedComponents: any[];
  matchedProcedures: any[];
  matchedMaintenance: any[];
  matchedVideos: any[];
  matchedSpecs: Record<string, string>;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  sources: SourceCitation[];
  insufficientData: boolean;
  insufficientReason?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  text: string;
  intent: AiIntent;
  confidence: ConfidenceLevel;
  sources: SourceCitation[];
  insufficientData: boolean;
  checklist?: DiagnosticChecklist;
  mechanicReport?: MechanicReport;
  causeComparison?: CauseComparison;
  retrievedStats?: {
    dtcCount: number;
    procCount: number;
    compCount: number;
    videoCount: number;
  };
}
