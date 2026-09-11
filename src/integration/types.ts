export type SourceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'RATE_LIMITED' | 'UNAVAILABLE';

export interface ExternalRawRecord {
  url: string;
  rawTitle: string;
  rawVehicleStr: string;
  rawYear: number;
  category: string;
  component: string;
  videoDuration?: string;
  videoThumbnail?: string;
  videoUrl?: string;
  resolution?: string;
  pageAccessible: boolean;
  robotsCompliant: boolean;
  simulatedLatencyMs?: number;
}

export interface ImportedDatabaseRecord {
  id: string;
  source: string; // 'carcarekiosk'
  source_url: string;
  source_type: 'public_video_guide' | 'public_procedure_metadata';
  source_title: string;
  source_vehicle: string;
  source_year: number;
  source_system: string;
  source_component: string;
  retrieved_at: string; // ISO 8601
  license: string;
  attribution_required: boolean;

  // Normalized application extensions
  normalized_vehicle_id: string;
  canonical_system_id: string;
  steps_count?: number;
  video_metadata?: {
    duration: string;
    resolution: string;
    thumbnailUrl: string;
    videoUrl?: string;
  };
  validation_status: 'valid' | 'rejected' | 'duplicate';
  validation_errors: string[];
  sync_batch_id: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SourceHealthMetrics {
  status: SourceHealthStatus;
  lastChecked: string;
  latencyMs: number;
  uptimePct: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  robotsTxtCompliant: boolean;
  allowedPaths: string[];
  disallowedPaths: string[];
  activeTokens: number;
  maxTokens: number;
  isSimulatedOffline: boolean;
}

export interface SyncJobSummary {
  jobId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  recordsDiscovered: number;
  recordsImported: number;
  recordsRejected: number;
  duplicateRecords: number;
  validationErrors: Array<{
    recordTitle: string;
    url: string;
    errors: string[];
  }>;
  sourceStatus: SourceHealthStatus;
}

export interface IntegrationLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  event:
    | 'fetch_attempt'
    | 'rate_limit_throttle'
    | 'cache_hit'
    | 'cache_miss'
    | 'retry_backoff'
    | 'validation_pass'
    | 'validation_fail'
    | 'db_upsert'
    | 'health_check'
    | 'sync_completed'
    | 'error';
  message: string;
  details?: Record<string, unknown>;
}

export interface RateLimiterConfig {
  maxTokens: number;
  refillRatePerSec: number;
}
