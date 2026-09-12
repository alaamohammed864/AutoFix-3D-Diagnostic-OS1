// AutoFix 3D - Offline Storage Engine & Synchronization Queue
// Robust local persistence for vehicles, maintenance history, and diagnostic notes

import { VehicleProfile } from '../db/vehicleTypes';
import { MaintenanceTask } from '../db/maintenanceTypes';
import { VEHICLE_PROFILES } from '../db/vehicleDatabase';

export type NetworkSyncState = 'ONLINE' | 'OFFLINE' | 'SYNCING';

export interface OfflineDiagnosticNote {
  id: string;
  vehicleId: string;
  vehicleName: string;
  timestamp: string;
  technician: string;
  componentTag?: string;
  dtcCode?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  verifiedOffline: boolean;
  synced: boolean;
}

export interface OfflineMaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  taskTitle: string;
  category: string;
  odometerKm: number;
  date: string;
  technician: string;
  costEstimatedUsd: number;
  laborHours: number;
  partsReplaced: string[];
  torqueChecked: boolean;
  verifiedOffline: boolean;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'SAVE_VEHICLE' | 'LOG_MAINTENANCE' | 'ADD_DIAGNOSTIC_NOTE' | 'CLEAR_DTC_SESSION';
  payload: any;
  createdAt: string;
  attempts: number;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
}

const STORAGE_KEYS = {
  SAVED_VEHICLES: 'autofix_saved_vehicles_v2',
  MAINTENANCE_LOGS: 'autofix_maintenance_logs_v2',
  DIAGNOSTIC_NOTES: 'autofix_diagnostic_notes_v2',
  SYNC_QUEUE: 'autofix_sync_queue_v2',
  VERIFIED_CACHE_TIMESTAMP: 'autofix_verified_cache_ts',
};

type SyncListener = (state: NetworkSyncState, pendingCount: number) => void;
const listeners = new Set<SyncListener>();

let currentSyncState: NetworkSyncState = typeof navigator !== 'undefined' && navigator.onLine ? 'ONLINE' : 'OFFLINE';

function notifyListeners() {
  const queue = getSyncQueue();
  const pendingCount = queue.filter(q => q.status === 'PENDING' || q.status === 'SYNCING').length;
  listeners.forEach((listener) => {
    try {
      listener(currentSyncState, pendingCount);
    } catch (err) {
      console.error('Error notifying sync listener:', err);
    }
  });
}

export function subscribeToSyncState(listener: SyncListener): () => void {
  listeners.add(listener);
  listener(currentSyncState, getSyncQueue().filter(q => q.status === 'PENDING' || q.status === 'SYNCING').length);
  return () => listeners.delete(listener);
}

export function getNetworkSyncState(): NetworkSyncState {
  return currentSyncState;
}

export function isDeviceOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Initial seed data so users immediately see verified offline data working
const DEFAULT_SAVED_VEHICLES: VehicleProfile[] = VEHICLE_PROFILES;

const DEFAULT_MAINTENANCE_LOGS: OfflineMaintenanceRecord[] = [
  {
    id: 'maint-001',
    vehicleId: 'toyota-camry-2018-xv70-2.5l-se-auto',
    vehicleName: '2018 Toyota Camry (XV70 2.5L SE)',
    taskTitle: '12V Battery Replacement & IBS Sensor Initialization',
    category: 'Electrical',
    odometerKm: 78500,
    date: '2026-03-02',
    technician: 'Senior Tech #42',
    costEstimatedUsd: 185,
    laborHours: 0.6,
    partsReplaced: ['Toyota TrueStart Group 35 Battery (OEM #00544-24F60-575)', 'Anti-corrosion terminal pads'],
    torqueChecked: true,
    verifiedOffline: true,
    synced: true,
  },
  {
    id: 'maint-002',
    vehicleId: 'toyota-camry-2018-xv70-2.5l-se-auto',
    vehicleName: '2018 Toyota Camry (XV70 2.5L SE)',
    taskTitle: 'Front Ceramic Brake Pads & Rotor Micrometer Inspection',
    category: 'Braking',
    odometerKm: 72000,
    date: '2025-11-14',
    technician: 'Lead Diagnostics #07',
    costEstimatedUsd: 260,
    laborHours: 1.2,
    partsReplaced: ['Akebono ProACT Ultra-Premium Ceramic Pads', 'Slide pin silicone lube'],
    torqueChecked: true,
    verifiedOffline: true,
    synced: true,
  }
];

const DEFAULT_DIAGNOSTIC_NOTES: OfflineDiagnosticNote[] = [
  {
    id: 'note-001',
    vehicleId: 'toyota-camry-2018-xv70-2.5l-se-auto',
    vehicleName: '2018 Toyota Camry',
    timestamp: '2026-09-08 14:32',
    technician: 'Master Diagnostic Tech',
    componentTag: 'Fuel / Air Induction',
    dtcCode: 'P0171',
    severity: 'medium',
    notes: 'Long Term Fuel Trim reached +22% at warm idle. Performed smoke test on intake boot: no vacuum tear. Inspected MAF sensor hot wire—minor particulate buildup cleaned with CRC MAF spray. STFT normalized within +/- 3%.',
    verifiedOffline: true,
    synced: true,
  }
];

// --- OFFLINE VEHICLE REPOSITORY ---

export function getSavedVehiclesOffline(): VehicleProfile[] {
  if (typeof window === 'undefined') return DEFAULT_SAVED_VEHICLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_VEHICLES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SAVED_VEHICLES, JSON.stringify(DEFAULT_SAVED_VEHICLES));
      return DEFAULT_SAVED_VEHICLES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SAVED_VEHICLES;
  }
}

export function saveVehicleOffline(vehicle: VehicleProfile): { success: boolean; queued: boolean } {
  try {
    const current = getSavedVehiclesOffline();
    const existingIdx = current.findIndex(v => v.id === vehicle.id);
    let updated: VehicleProfile[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = vehicle;
    } else {
      updated = [vehicle, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.SAVED_VEHICLES, JSON.stringify(updated));

    // Enqueue sync item
    enqueueSyncItem('SAVE_VEHICLE', { vehicleId: vehicle.id, make: vehicle.make, model: vehicle.model, year: vehicle.year });
    return { success: true, queued: !isDeviceOnline() };
  } catch (err) {
    console.error('Failed to save vehicle offline:', err);
    return { success: false, queued: false };
  }
}

export function removeSavedVehicleOffline(id: string): boolean {
  try {
    const current = getSavedVehiclesOffline();
    const filtered = current.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_VEHICLES, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

// --- OFFLINE MAINTENANCE HISTORY ---

export function getMaintenanceHistoryOffline(vehicleId?: string): OfflineMaintenanceRecord[] {
  if (typeof window === 'undefined') return DEFAULT_MAINTENANCE_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_LOGS);
    let logs: OfflineMaintenanceRecord[] = raw ? JSON.parse(raw) : DEFAULT_MAINTENANCE_LOGS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE_LOGS, JSON.stringify(DEFAULT_MAINTENANCE_LOGS));
    }
    if (vehicleId) {
      logs = logs.filter(l => l.vehicleId === vehicleId);
    }
    return logs;
  } catch {
    return DEFAULT_MAINTENANCE_LOGS;
  }
}

export function logMaintenanceOffline(record: Omit<OfflineMaintenanceRecord, 'id' | 'synced'>): OfflineMaintenanceRecord {
  const newRecord: OfflineMaintenanceRecord = {
    ...record,
    id: `maint-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    synced: isDeviceOnline(),
  };

  const logs = getMaintenanceHistoryOffline();
  const updated = [newRecord, ...logs];
  try {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to store maintenance log offline:', err);
  }

  enqueueSyncItem('LOG_MAINTENANCE', newRecord);
  return newRecord;
}

// --- OFFLINE DIAGNOSTIC NOTES ---

export function getDiagnosticNotesOffline(vehicleId?: string): OfflineDiagnosticNote[] {
  if (typeof window === 'undefined') return DEFAULT_DIAGNOSTIC_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIAGNOSTIC_NOTES);
    let notes: OfflineDiagnosticNote[] = raw ? JSON.parse(raw) : DEFAULT_DIAGNOSTIC_NOTES;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DIAGNOSTIC_NOTES, JSON.stringify(DEFAULT_DIAGNOSTIC_NOTES));
    }
    if (vehicleId) {
      notes = notes.filter(n => n.vehicleId === vehicleId);
    }
    return notes;
  } catch {
    return DEFAULT_DIAGNOSTIC_NOTES;
  }
}

export function addDiagnosticNoteOffline(note: Omit<OfflineDiagnosticNote, 'id' | 'synced'>): OfflineDiagnosticNote {
  const newNote: OfflineDiagnosticNote = {
    ...note,
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    synced: isDeviceOnline(),
  };

  const notes = getDiagnosticNotesOffline();
  const updated = [newNote, ...notes];
  try {
    localStorage.setItem(STORAGE_KEYS.DIAGNOSTIC_NOTES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save diagnostic note offline:', err);
  }

  enqueueSyncItem('ADD_DIAGNOSTIC_NOTE', newNote);
  return newNote;
}

// --- SYNCHRONIZATION QUEUE ---

export function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueSyncItem(type: SyncQueueItem['type'], payload: any): SyncQueueItem {
  const item: SyncQueueItem = {
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
    status: isDeviceOnline() ? 'SYNCED' : 'PENDING',
  };

  const queue = getSyncQueue();
  const updated = [item, ...queue];
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updated));
  } catch (err) {
    console.error('Error enqueuing sync item:', err);
  }

  if (isDeviceOnline()) {
    triggerSyncProcessing();
  } else {
    currentSyncState = 'OFFLINE';
    notifyListeners();
  }

  return item;
}

export function clearCompletedSyncQueue(): void {
  try {
    const queue = getSyncQueue();
    const remaining = queue.filter(q => q.status === 'PENDING' || q.status === 'FAILED');
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remaining));
    notifyListeners();
  } catch (err) {
    console.error('Error clearing sync queue:', err);
  }
}

// Simulated robust cloud synchronization
export async function triggerSyncProcessing(): Promise<{ syncedCount: number; errors: number }> {
  if (!isDeviceOnline()) {
    currentSyncState = 'OFFLINE';
    notifyListeners();
    return { syncedCount: 0, errors: 0 };
  }

  const queue = getSyncQueue();
  const pending = queue.filter(q => q.status === 'PENDING' || q.status === 'FAILED');

  if (pending.length === 0) {
    currentSyncState = 'ONLINE';
    notifyListeners();
    return { syncedCount: 0, errors: 0 };
  }

  currentSyncState = 'SYNCING';
  notifyListeners();

  let syncedCount = 0;
  let errorCount = 0;

  // Process items sequentially with simulated verified cloud confirmation
  for (const item of pending) {
    item.status = 'SYNCING';
    item.attempts += 1;
    notifyListeners();

    try {
      // Simulate real cloud handshake and latency
      await new Promise(res => setTimeout(res, 250));
      item.status = 'SYNCED';
      syncedCount++;
    } catch (err) {
      item.status = 'FAILED';
      item.errorMessage = 'Network connection interrupted during payload transmission';
      errorCount++;
    }
  }

  // Save updated queue status
  try {
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to update sync queue:', err);
  }

  currentSyncState = isDeviceOnline() ? 'ONLINE' : 'OFFLINE';
  notifyListeners();

  return { syncedCount, errors: errorCount };
}

// Setup network event listeners in browser
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    currentSyncState = 'ONLINE';
    notifyListeners();
    // Auto-trigger sync when transitioning to online
    triggerSyncProcessing();
  });

  window.addEventListener('offline', () => {
    currentSyncState = 'OFFLINE';
    notifyListeners();
  });
}
