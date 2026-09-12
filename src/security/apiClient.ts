import { ApiErrorResponse, ApiSuccessResponse } from './authTypes';

let currentAuthToken: string | null = null;
let currentCsrfToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  currentAuthToken = token;
}

export function getApiAuthToken(): string | null {
  return currentAuthToken;
}

export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/security/csrf-token');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.csrfToken) {
        currentCsrfToken = data.csrfToken;
        return data.csrfToken;
      }
    }
  } catch {
    // Offline or server start up
  }
  return null;
}

export interface RequestOptions extends RequestInit {
  skipCsrf?: boolean;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    // Strip stack trace in production client context to protect security
    this.stack = undefined;
  }
}

export async function secureFetch<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  // If mutating method and no CSRF token loaded yet, acquire one
  const method = (options.method || 'GET').toUpperCase();
  const isMutating = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

  if (isMutating && !currentCsrfToken && !options.skipCsrf) {
    await fetchCsrfToken();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }

  if (currentCsrfToken && isMutating) {
    headers['X-CSRF-Token'] = currentCsrfToken;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Try parsing JSON body
    let json: any = null;
    const text = await response.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // Not JSON
      }
    }

    if (!response.ok) {
      const errorCode = json?.error?.code || `HTTP_${response.status}`;
      const errorMessage =
        json?.error?.message ||
        (response.status === 401
          ? 'Authentication required or session expired.'
          : response.status === 403
          ? 'Access denied. Insufficient permissions for this action.'
          : response.status === 429
          ? 'Rate limit exceeded. Please slow down requests.'
          : response.status === 500
          ? 'Internal server error. Incident recorded in audit trail.'
          : 'Request could not be completed.');

      throw new ApiError(errorCode, errorMessage, response.status);
    }

    return json as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network / offline error
    const isOffline = !navigator.onLine;
    throw new ApiError(
      isOffline ? 'OFFLINE_NETWORK_ERROR' : 'NETWORK_ERROR',
      isOffline
        ? 'You are currently offline. Actions have been queued in local storage.'
        : 'Unable to connect to diagnostic server. Please verify network connectivity.',
      0
    );
  }
}

// ==========================================
// TYPED DIAGNOSTIC API METHODS
// ==========================================
export async function clearDtcOnServer(dtcCode?: string, ecuId = 'ECM_01', reason?: string) {
  return secureFetch<{ success: boolean; message: string; freezeFrameErased: boolean }>(
    '/api/dtc/clear',
    {
      method: 'POST',
      body: JSON.stringify({ dtcCode, ecuId, reason }),
    }
  );
}

export async function fetchAuditLogs(limit = 50) {
  return secureFetch<{ success: boolean; totalRecorded: number; logs: any[] }>(
    `/api/security/audit-logs?limit=${limit}`
  );
}

export async function verifyAuditLogIntegrity() {
  return secureFetch<{
    success: boolean;
    chainIntact: boolean;
    totalEntriesVerified: number;
    algorithm: string;
  }>('/api/security/audit-logs/verify', {
    method: 'POST',
  });
}

export async function fetchSecurityPosture() {
  return secureFetch<{ success: boolean; data: any }>('/api/security/status');
}

// Test trigger functions to verify defenses
export async function testSqlInjectionBlock() {
  return secureFetch('/api/dtc/clear', {
    method: 'POST',
    body: JSON.stringify({
      dtcCode: "P0300' OR '1'='1",
      reason: "Diagnostic probe; DROP TABLE audit_logs;--",
    }),
  });
}

export async function testSimulated500() {
  return secureFetch('/api/simulate-500');
}
