export type RepairDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Master Tech';

export type RepairStepName =
  | 'Preparation'
  | 'Locate component'
  | 'Remove required parts'
  | 'Perform repair'
  | 'Reinstall'
  | 'Test';

export interface RepairTool {
  name: string;
  spec?: string;
  icon?: string;
}

export interface RepairPart {
  name: string;
  partNumber: string;
  quantity: number;
  oemBrand?: string;
}

export interface RepairFluid {
  name: string;
  spec: string;
  capacity: string;
}

export interface RepairStep {
  stepNumber: 1 | 2 | 3 | 4 | 5 | 6;
  stepName: RepairStepName;
  titleEn: string;
  titleAr: string;
  instructionEn: string;
  instructionAr: string;
  toolRequirementEn: string;
  toolRequirementAr: string;
  safetyWarningEn?: string;
  safetyWarningAr?: string;
  imageUrl: string;
  imageCaptionEn: string;
  imageCaptionAr: string;
  torqueSpec?: string;
  keyActionPointersEn?: string[];
  keyActionPointersAr?: string[];
}

export interface RepairVideoReference {
  titleEn: string;
  titleAr: string;
  sourceAttribution: string;
  videoUrl?: string; // Authorized external public video source (e.g. Wikimedia Commons public domain automotive technical media)
  thumbnailUrl: string;
  duration: string;
  resolution: string;
  licenseInfo: string;
}

export interface RelatedProcedure {
  id: string;
  titleEn: string;
  titleAr: string;
  system: string;
  difficulty: RepairDifficulty;
  timeEstimate: string;
}

export interface RepairProcedure {
  id: string;
  titleEn: string;
  titleAr: string;
  vehicle: string;
  year: number;
  engine: string;
  system: string;
  component: string;
  difficulty: RepairDifficulty;
  estimatedTime: string;
  requiredTools: RepairTool[];
  requiredParts: RepairPart[];
  requiredFluids: RepairFluid[];
  safetyWarningsEn: string[];
  safetyWarningsAr: string[];
  preparationEn: string[];
  preparationAr: string[];
  steps: RepairStep[];
  videoReference?: RepairVideoReference;
  relatedProcedures: RelatedProcedure[];
  tags: string[];
  vehicleId?: string;
  applicableVehicleIds?: string[];
  category?: string;
}

export interface ProblemReport {
  id: string;
  procedureId: string;
  stepNumber?: number;
  reporterName: string;
  issueType: 'torque_error' | 'tool_mismatch' | 'step_unclear' | 'safety_hazard' | 'part_number_error' | 'other';
  description: string;
  timestamp: string;
}
