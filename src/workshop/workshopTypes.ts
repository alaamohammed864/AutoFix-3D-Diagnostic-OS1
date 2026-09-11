export type JobStatus =
  | 'New'
  | 'Inspection'
  | 'Diagnosis'
  | 'Waiting Parts'
  | 'Repairing'
  | 'Testing'
  | 'Completed';

export type WorkshopPanel =
  | 'vehicle'
  | 'diagnostics'
  | 'repair'
  | 'parts'
  | 'tools'
  | 'measurements'
  | 'notes'
  | 'photos'
  | 'history';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
  company?: string;
  accountType: 'Private' | 'Fleet' | 'Commercial';
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number | string;
  engine: string;
  transmission: string;
  trim?: string;
  licensePlate?: string;
  color?: string;
  driveType?: string;
  fuelType?: string;
}

export interface InspectionData {
  summary: string;
  visualCondition: 'Good' | 'Fair' | 'Requires Attention' | 'Dangerous';
  safetyPassed: boolean;
  batteryStatus: string;
  tiresCondition: string;
  brakesCondition: string;
  fluidLevels: string;
  leaksObserved: string;
}

export interface DiagnosisData {
  rootCause: string;
  dtcCodes: string[];
  symptoms: string[];
  freezeFrameSummary?: string;
  leadTechnician: string;
  confirmedDate: string;
}

export interface RepairStep {
  id: string;
  text: string;
  completed: boolean;
  torque?: string;
  specialTool?: string;
}

export interface RepairData {
  procedureTitle: string;
  procedureSummary: string;
  steps: RepairStep[];
  estimatedHours: number;
  actualHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master Tech';
  completionDate?: string;
}

export interface PartItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  status: 'In Stock' | 'Ordered' | 'Arrived' | 'Installed';
}

export interface LaborItem {
  id: string;
  description: string;
  technician: string;
  hours: number;
  hourlyRate: number;
}

export interface WorkNote {
  id: string;
  timestamp: string;
  author: string;
  role: string;
  content: string;
  isCustomerVisible: boolean;
}

export interface MeasurementRecord {
  // Brake Rotors & Pads
  frontLeftRotorMm: number;
  frontRightRotorMm: number;
  rearLeftRotorMm: number;
  rearRightRotorMm: number;
  rotorMinThicknessMm: number;
  frontLeftPadMm: number;
  frontRightPadMm: number;
  rearLeftPadMm: number;
  rearRightPadMm: number;
  padMinThicknessMm: number;

  // Tires Tread Depth (mm)
  tireFL_mm: number;
  tireFR_mm: number;
  tireRL_mm: number;
  tireRR_mm: number;
  tireMinTreadMm: number;
  tirePressurePsi: { fl: number; fr: number; rl: number; rr: number };

  // Battery & Electrical
  batteryVoltage: number;
  batteryCcaActual: number;
  batteryCcaRated: number;
  batteryHealthPct: number;

  // Fluids
  brakeFluidMoisturePct: number;
  coolantFreezePointC: number;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  caption: string;
  category: 'Intake' | 'Inspection' | 'Damaged Component' | 'Repair Progress' | 'Completed';
  timestamp: string;
}

export interface VehicleHistoryEntry {
  id: string;
  date: string;
  mileage: number;
  jobId: string;
  serviceSummary: string;
  technician: string;
  totalCost: number;
  status: 'Completed' | 'Warranty Claim' | 'Inspection Only';
}

export interface JobCard {
  id: string;
  createdAt: string;
  updatedAt: string;
  customer: CustomerInfo;
  vehicle: VehicleInfo;
  vin?: string;
  mileage: number;
  mileageUnit: 'km' | 'mi';
  complaint: string;
  inspection: InspectionData;
  diagnosis: DiagnosisData;
  repair: RepairData;
  parts: PartItem[];
  labor: LaborItem[];
  notes: WorkNote[];
  status: JobStatus;
  measurements: MeasurementRecord;
  photos: InspectionPhoto[];
  history: VehicleHistoryEntry[];
  priority: 'Standard' | 'Urgent' | 'Safety Critical';
  bay: string;
  serviceAdvisor: string;
}

export const JOB_STATUS_CONFIG: Record<
  JobStatus,
  {
    labelEn: string;
    labelAr: string;
    step: number;
    color: string;
    bg: string;
    border: string;
    icon: string;
    descEn: string;
    descAr: string;
  }
> = {
  New: {
    labelEn: 'New',
    labelAr: 'جديد',
    step: 1,
    color: 'text-primary-container',
    bg: 'bg-primary-container/15',
    border: 'border-primary-container/40',
    icon: 'note_add',
    descEn: 'Intake completed, awaiting bay assignment',
    descAr: 'تم استلام المركبة، بانتظار تعيين حارة العمل',
  },
  Inspection: {
    labelEn: 'Inspection',
    labelAr: 'الفحص',
    step: 2,
    color: 'text-secondary-fixed',
    bg: 'bg-secondary-container/20',
    border: 'border-secondary-container/40',
    icon: 'search_check',
    descEn: 'Initial safety and multi-point visual inspection',
    descAr: 'الفحص البصري الشامل وفحص السلامة الأولي',
  },
  Diagnosis: {
    labelEn: 'Diagnosis',
    labelAr: 'التشخيص',
    step: 3,
    color: 'text-primary-fixed',
    bg: 'bg-primary-fixed/20',
    border: 'border-primary-fixed/40',
    icon: 'account_tree',
    descEn: 'OBD-II scan, live PID evaluation & root-cause verification',
    descAr: 'فحص OBD-II وتحليل الحساسات المباشرة وتحديد السبب الجذري',
  },
  'Waiting Parts': {
    labelEn: 'Waiting Parts',
    labelAr: 'بانتظار القطع',
    step: 4,
    color: 'text-tertiary-container',
    bg: 'bg-tertiary-container/20',
    border: 'border-tertiary-container/40',
    icon: 'hourglass_top',
    descEn: 'Parts ordered from OEM supplier, delivery in progress',
    descAr: 'تم طلب قطع الغيار من المورّد المعتمد وهي قيد الشحن',
  },
  Repairing: {
    labelEn: 'Repairing',
    labelAr: 'قيد الإصلاح',
    step: 5,
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/40',
    icon: 'handyman',
    descEn: 'Mechanical teardown & procedure execution in service bay',
    descAr: 'إجراء الإصلاحات الميكانيكية وتطبيق عزم الشد في حارة الصيانة',
  },
  Testing: {
    labelEn: 'Testing',
    labelAr: 'الاختبار',
    step: 6,
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/40',
    icon: 'flaky',
    descEn: 'Post-repair road test, torque re-check, and code clearing',
    descAr: 'اختبار القيادة ومراجعة عزم الشد ومسح أكواد الأعطال',
  },
  Completed: {
    labelEn: 'Completed',
    labelAr: 'مكتمل',
    step: 7,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/40',
    icon: 'check_circle',
    descEn: 'Quality sign-off approved, ready for customer handover',
    descAr: 'تم اعتماد مراقبة الجودة والسيارة جاهزة للتسليم للعميل',
  },
};
