export type MaintenanceCategory =
  | 'Engine Oil'
  | 'Oil Filter'
  | 'Air Filter'
  | 'Cabin Filter'
  | 'Coolant'
  | 'Brake Fluid'
  | 'Transmission Fluid'
  | 'Power Steering Fluid'
  | 'Spark Plugs'
  | 'Battery'
  | 'Belts'
  | 'Wipers'
  | 'Tires'
  | 'Brakes'
  | 'Suspension'
  | 'Lights';

export type MaintenanceAlertStatus =
  | 'Overdue'
  | 'Due'
  | 'Upcoming'
  | 'Completed'
  | 'Healthy';

export interface MaintenanceCategorySpec {
  category: MaintenanceCategory;
  nameEn: string;
  nameAr: string;
  icon: string;
  intervalKm: number;
  intervalMonths: number;
  oemSpec: string;
  oemPartNumber?: string;
  capacityOrSpec?: string;
  inspectionChecklist: string[];
  estimatedLaborHours: number;
  averageCostRange: string;
  severity: 'critical' | 'standard' | 'recommended';
  systemNote?: string;
}

export interface TimelineInterval {
  km: number;
  miles: number;
  months: number;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  categoriesIncluded: MaintenanceCategory[];
  isMajorService: boolean;
  estimatedLaborHours: number;
  estimatedCostRange: string;
}

export interface ServiceInvoice {
  invoiceNumber: string;
  shopName: string;
  partsCost: number;
  laborCost: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'Cash' | 'Fleet Account' | 'Warranty';
  notes?: string;
  date: string;
}

export interface ServicePhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  category?: MaintenanceCategory;
}

export interface ComprehensiveServiceRecord {
  id: string;
  vehicleId: string;
  date: string;
  odometerKm: number;
  title: string;
  categories: MaintenanceCategory[];
  technician: string;
  notes: string;
  status: 'Completed' | 'Pending' | 'Flagged';
  invoice?: ServiceInvoice;
  photos?: ServicePhoto[];
  partsReplaced?: { name: string; partNumber: string; quantity: number; cost: number }[];
  intervalKmTriggered?: number;
}

export interface CategoryStatusResult {
  category: MaintenanceCategory;
  status: MaintenanceAlertStatus;
  lastServiceDate: string | null;
  lastServiceOdometer: number | null;
  nextServiceDate: string;
  nextServiceOdometer: number;
  kmRemaining: number;
  daysRemaining: number;
  progressPercent: number; // 0% to 100%+ (100% means due/overdue)
  spec: MaintenanceCategorySpec;
}

export interface TimelineIntervalStatusResult {
  interval: TimelineInterval;
  status: 'Completed' | 'Overdue' | 'Due' | 'Upcoming' | 'Future';
  completedDate?: string;
  completedOdometer?: number;
  categoriesStatus: { category: MaintenanceCategory; isCompleted: boolean }[];
}

export type MaintenanceTask = ComprehensiveServiceRecord;
export type MaintenanceSchedule = any;
