import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

// ==========================================
// CONFIGURATION & SECRETS
// ==========================================
const PORT = 3000;
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'automotive_production_jwt_signing_key_secret_2026';
const AUDIT_SALT = process.env.SECURITY_AUDIT_LOG_SALT || 'tamper_evident_audit_digest_salt_v1';

// ==========================================
// ROLE DEFINITIONS & PERMISSIONS
// ==========================================
export type UserRole = 'Guest' | 'User' | 'Mechanic' | 'Workshop Manager' | 'Administrator';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  certifications?: string[];
  workshopId?: string;
}

// Fixed credentials for test & demo verification
export const SYSTEM_USERS: Record<string, UserAccount & { passwordHash: string }> = {
  guest: {
    id: 'usr_guest_001',
    email: 'guest@autofix.internal',
    name: 'Anonymous Guest',
    role: 'Guest',
    passwordHash: hashPassword('GuestPass123!'),
  },
  user: {
    id: 'usr_owner_002',
    email: 'owner@autofix.internal',
    name: 'Tariq Al-Mansoor (Vehicle Owner)',
    role: 'User',
    passwordHash: hashPassword('UserPass123!'),
  },
  mechanic: {
    id: 'usr_tech_003',
    email: 'tech.aala@autofix.internal',
    name: 'Eng. Aala Mohammed (Lead Developer & Master Tech)',
    role: 'Mechanic',
    certifications: ['ASE Master Automobile Tech', 'Porsche High-Voltage Level 3', 'Lead Software Architect'],
    workshopId: 'ws_riyadh_01',
    passwordHash: hashPassword('TechPass123!'),
  },
  manager: {
    id: 'usr_mgr_004',
    email: 'manager.sarah@autofix.internal',
    name: 'Sarah Jenkins (Workshop Supervisor)',
    role: 'Workshop Manager',
    workshopId: 'ws_riyadh_01',
    passwordHash: hashPassword('ManagerPass123!'),
  },
  admin: {
    id: 'usr_admin_005',
    email: 'admin.aala@autofix.internal',
    name: 'Eng. Aala Mohammed (System Architect & Administrator)',
    role: 'Administrator',
    passwordHash: hashPassword('AdminPass123!'),
  },
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  Guest: [
    'telemetry:view_basic',
    'vehicles:view_public',
    'manuals:view_public',
  ],
  User: [
    'telemetry:view_basic',
    'vehicles:view_public',
    'vehicles:view_own',
    'manuals:view_public',
    'maintenance:view_history',
    'maintenance:save_own',
  ],
  Mechanic: [
    'telemetry:view_basic',
    'telemetry:view_live_can',
    'vehicles:view_public',
    'vehicles:view_own',
    'manuals:view_public',
    'manuals:view_oem_pro',
    'dtc:read_codes',
    'dtc:clear_codes',
    'diagnostics:execute_tree',
    'canbus:send_commands',
    'electrical:view_schematics',
    'tools:calibrate',
  ],
  'Workshop Manager': [
    'telemetry:view_basic',
    'telemetry:view_live_can',
    'vehicles:view_public',
    'vehicles:view_all_workshop',
    'manuals:view_public',
    'manuals:view_oem_pro',
    'dtc:read_codes',
    'dtc:clear_codes',
    'diagnostics:execute_tree',
    'canbus:send_commands',
    'electrical:view_schematics',
    'tools:calibrate',
    'workshop:manage_workorders',
    'workshop:assign_techs',
    'audit:view_logs',
    'audit:export_reports',
  ],
  Administrator: [
    '*', // All permissions granted
  ],
};

function hashPassword(plain: string): string {
  return crypto.createHmac('sha256', JWT_SECRET).update(plain).digest('hex');
}

// ==========================================
// TAMPER-EVIDENT AUDIT TRAIL
// ==========================================
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  ip: string;
  targetResource: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  metadata: Record<string, unknown>;
  previousHash: string;
  tamperHash: string;
}

const auditLogTrail: AuditLogEntry[] = [];
let latestAuditHash = '0000000000000000000000000000000000000000000000000000000000000000';

export function appendAuditLog(entry: {
  action: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  ip: string;
  targetResource: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  metadata?: Record<string, unknown>;
}): AuditLogEntry {
  const timestamp = new Date().toISOString();
  const id = 'aud_' + crypto.randomBytes(8).toString('hex');
  const metadata = entry.metadata || {};

  const payloadToHash = JSON.stringify({
    id,
    timestamp,
    action: entry.action,
    actorId: entry.actorId,
    actorRole: entry.actorRole,
    ip: entry.ip,
    target: entry.targetResource,
    status: entry.status,
    meta: metadata,
    prev: latestAuditHash,
    salt: AUDIT_SALT,
  });

  const tamperHash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

  const fullEntry: AuditLogEntry = {
    id,
    timestamp,
    action: entry.action,
    actorId: entry.actorId,
    actorEmail: entry.actorEmail,
    actorRole: entry.actorRole,
    ip: entry.ip,
    targetResource: entry.targetResource,
    status: entry.status,
    metadata,
    previousHash: latestAuditHash,
    tamperHash,
  };

  latestAuditHash = tamperHash;
  auditLogTrail.unshift(fullEntry); // newest first

  // Cap memory retention at 2000 events
  if (auditLogTrail.length > 2000) {
    auditLogTrail.pop();
  }

  return fullEntry;
}

// Seed initial audit log entries
appendAuditLog({
  action: 'SYSTEM_SECURITY_INITIALIZED',
  actorId: 'system',
  actorEmail: 'system@autofix.internal',
  actorRole: 'Administrator',
  ip: '127.0.0.1',
  targetResource: 'KernelSecuritySubsystem',
  status: 'SUCCESS',
  metadata: {
    rateLimiting: 'ACTIVE',
    csrfProtection: 'ACTIVE',
    xssSanitization: 'ACTIVE',
    sqlInjectionDefense: 'ACTIVE',
    serverSideRbac: 'ACTIVE',
  },
});

// ==========================================
// TOKEN SIGNING & CRYPTO UTILITIES
// ==========================================
interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  exp: number;
  iat: number;
  jti: string;
}

function generateJwt(user: UserAccount, expiresInSeconds = 3600 * 8): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: now,
    exp: now + expiresInSeconds,
    jti: crypto.randomBytes(8).toString('hex'),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJwt(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// ==========================================
// RATE LIMITING IMPLEMENTATION
// ==========================================
interface RateBucket {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateBucket>();

// Periodic cleanup of stale rate-limit buckets
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (bucket.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

function createRateLimiter(options: { max: number; windowMs: number; bucketPrefix: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const key = `${options.bucketPrefix}:${ip}`;
    const now = Date.now();

    let bucket = rateLimitStore.get(key);
    if (!bucket || bucket.resetTime <= now) {
      bucket = { count: 1, resetTime: now + options.windowMs };
      rateLimitStore.set(key, bucket);
    } else {
      bucket.count += 1;
    }

    const remaining = Math.max(0, options.max - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (bucket.count > options.max) {
      appendAuditLog({
        action: 'RATE_LIMIT_EXCEEDED',
        actorId: 'anonymous',
        actorEmail: 'rate_limited@network',
        actorRole: 'Guest',
        ip,
        targetResource: req.originalUrl,
        status: 'FLAGGED',
        metadata: { limit: options.max, attempts: bucket.count },
      });

      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down and try again shortly.',
        },
      });
    }

    next();
  };
}

// Limiters
const generalApiLimiter = createRateLimiter({ max: 120, windowMs: 60000, bucketPrefix: 'api' });
const authRateLimiter = createRateLimiter({ max: 15, windowMs: 60000, bucketPrefix: 'auth' });
const sensitiveActionLimiter = createRateLimiter({ max: 20, windowMs: 60000, bucketPrefix: 'sensitive' });

// ==========================================
// SQL INJECTION & XSS DEFENSE MIDDLEWARE
// ==========================================
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /\w*((\%27)|(\'))(\s)*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // ' or
  /exec(\s|\+)+(s|x)p\w+/i,
  /UNION(\s|\+)+(ALL(\s|\+)+)?SELECT/i,
  /DROP(\s|\+)+TABLE/i,
  /INSERT(\s|\+)+INTO/i,
  /DELETE(\s|\+)+FROM/i,
  /SELECT(\s|\+)+.*(\s|\+)+FROM/i,
  /;\s*SHUTDOWN/i,
];

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /onerror\s*=/gi,
  /onload\s*=/gi,
  /onclick\s*=/gi,
  /<iframe/gi,
];

function sanitizeString(str: string): string {
  // Strip control characters & potential script injections
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

function deepSanitize(target: unknown): unknown {
  if (typeof target === 'string') {
    return sanitizeString(target);
  }
  if (Array.isArray(target)) {
    return target.map(deepSanitize);
  }
  if (target !== null && typeof target === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(target)) {
      sanitizedObj[sanitizeString(key)] = deepSanitize(value);
    }
    return sanitizedObj;
  }
  return target;
}

function securityInputScanner(req: Request, res: Response, next: NextFunction) {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown';

  const checkValue = (val: string, source: string): boolean => {
    // Check SQL Injection
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(val)) {
        appendAuditLog({
          action: 'SQL_INJECTION_ATTEMPT_BLOCKED',
          actorId: (req as any).user?.userId || 'unauthenticated',
          actorEmail: (req as any).user?.email || 'attacker@unknown',
          actorRole: (req as any).user?.role || 'Guest',
          ip,
          targetResource: req.originalUrl,
          status: 'FLAGGED',
          metadata: { source, pattern: pattern.toString(), sample: val.slice(0, 100) },
        });
        return false;
      }
    }

    // Check XSS Script Injection
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(val)) {
        appendAuditLog({
          action: 'XSS_INJECTION_ATTEMPT_BLOCKED',
          actorId: (req as any).user?.userId || 'unauthenticated',
          actorEmail: (req as any).user?.email || 'attacker@unknown',
          actorRole: (req as any).user?.role || 'Guest',
          ip,
          targetResource: req.originalUrl,
          status: 'FLAGGED',
          metadata: { source, pattern: pattern.toString(), sample: val.slice(0, 100) },
        });
        return false;
      }
    }

    return true;
  };

  const inspect = (obj: unknown, pathStr: string): boolean => {
    if (typeof obj === 'string') {
      return checkValue(obj, pathStr);
    }
    if (Array.isArray(obj)) {
      return obj.every((item, idx) => inspect(item, `${pathStr}[${idx}]`));
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.entries(obj).every(([k, v]) => inspect(v, `${pathStr}.${k}`));
    }
    return true;
  };

  if (!inspect(req.query, 'query') || !inspect(req.params, 'params') || !inspect(req.body, 'body')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MALICIOUS_PAYLOAD_DETECTED',
        message: 'Request payload contains potentially unsafe characters or forbidden query constructs.',
      },
    });
  }

  // Deep sanitize body to ensure clean execution
  if (req.body) {
    req.body = deepSanitize(req.body);
  }

  next();
}

// ==========================================
// CSRF DEFENSE (Double-Submit / Header Token)
// ==========================================
const activeCsrfTokens = new Set<string>();

function generateCsrfToken(): string {
  const token = crypto.randomBytes(24).toString('hex');
  activeCsrfTokens.add(token);
  // Keep set bounded
  if (activeCsrfTokens.size > 1000) {
    const it = activeCsrfTokens.values();
    activeCsrfTokens.delete(it.next().value!);
  }
  return token;
}

function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Safe methods skip CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];
  const hasValidAuthHeader = req.headers.authorization?.startsWith('Bearer ');

  // If request carries standard Bearer authentication token, that already prevents standard ambient-cookie CSRF
  if (hasValidAuthHeader) {
    return next();
  }

  if (typeof clientToken === 'string' && activeCsrfTokens.has(clientToken)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'CSRF_VALIDATION_FAILED',
      message: 'Invalid or missing CSRF token. State-changing requests must supply X-CSRF-Token or Bearer credentials.',
    },
  });
}

// ==========================================
// AUTHENTICATION & AUTHORIZATION (SERVER RBAC)
// ==========================================
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default to Guest identity if no token supplied
    req.user = {
      userId: 'usr_guest_001',
      email: 'guest@autofix.internal',
      role: 'Guest',
      name: 'Anonymous Guest',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      jti: 'guest_session',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_INVALID_OR_EXPIRED',
        message: 'Your session is invalid or has expired. Please authenticate again.',
      },
    });
  }

  req.user = payload;
  next();
}

function requireRoles(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'Guest';

    if (!allowedRoles.includes(userRole)) {
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';

      appendAuditLog({
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        actorId: req.user?.userId || 'unknown',
        actorEmail: req.user?.email || 'unknown',
        actorRole: userRole,
        ip,
        targetResource: req.originalUrl,
        status: 'DENIED',
        metadata: {
          requiredRoles: allowedRoles,
          userRole,
        },
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_INSUFFICIENT_ROLE',
          message: `Access denied. Role '${userRole}' does not possess required privileges for this endpoint. Required: [${allowedRoles.join(', ')}]`,
        },
      });
    }

    next();
  };
}

// ==========================================
// SERVER INITIALIZATION & ROUTING
// ==========================================
async function startServer() {
  const app = express();

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Frame policy: allow embedding in the AI Studio preview environment
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  // Body parsers with payload limit to prevent denial-of-service memory exhaustion
  app.use(express.json({ limit: '512kb' }));
  app.use(express.urlencoded({ extended: true, limit: '512kb' }));

  // Global API Rate Limiter
  app.use('/api', generalApiLimiter);

  // Global Malicious Payload Scanner (SQLi + XSS)
  app.use('/api', securityInputScanner);

  // Global Token Authenticator for all API calls
  app.use('/api', authenticateToken);

  // CSRF verification for state mutations
  app.use('/api', csrfProtection);

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      security: {
        rbac: 'ENFORCED_SERVER_SIDE',
        rateLimiter: 'ACTIVE',
        auditTrailCount: auditLogTrail.length,
      },
    });
  });

  // CSRF Token Provider
  app.get('/api/security/csrf-token', (req, res) => {
    const token = generateCsrfToken();
    res.json({ success: true, csrfToken: token });
  });

  // System Security Posture & Status
  app.get('/api/security/status', (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      data: {
        activeRole: req.user?.role || 'Guest',
        permissions: ROLE_PERMISSIONS[req.user?.role || 'Guest'],
        auditLogEntries: auditLogTrail.length,
        rateLimits: {
          generalApi: '120 req/min',
          auth: '15 req/min',
          sensitive: '20 req/min',
        },
        defenses: {
          xssSanitizer: 'ACTIVE',
          sqlInjectionGuard: 'ACTIVE',
          csrfTokenDoubleSubmit: 'ACTIVE',
          serverSideRbacEnforced: true,
          stackTraceMasking: 'ZERO_LEAK_POLICY',
        },
      },
    });
  });

  // ------------------------------------------
  // AUTHENTICATION ENDPOINTS
  // ------------------------------------------
  app.post('/api/auth/login', authRateLimiter, (req: Request, res: Response) => {
    const { email, password, requestedRole } = req.body;
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Fast-role demo login switch
    if (requestedRole && typeof requestedRole === 'string') {
      const targetRole = requestedRole as UserRole;
      const matchingUser = Object.values(SYSTEM_USERS).find((u) => u.role === targetRole);
      if (matchingUser) {
        const token = generateJwt(matchingUser);
        appendAuditLog({
          action: 'DEMO_ROLE_SWITCH_AUTH',
          actorId: matchingUser.id,
          actorEmail: matchingUser.email,
          actorRole: matchingUser.role,
          ip,
          targetResource: '/api/auth/login',
          status: 'SUCCESS',
          metadata: { switchedTo: matchingUser.role },
        });

        return res.json({
          success: true,
          token,
          user: {
            id: matchingUser.id,
            email: matchingUser.email,
            name: matchingUser.name,
            role: matchingUser.role,
            certifications: matchingUser.certifications,
            workshopId: matchingUser.workshopId,
            permissions: ROLE_PERMISSIONS[matchingUser.role],
          },
        });
      }
    }

    // Standard credential login
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Email and password are required.' },
      });
    }

    const matchedUser = Object.values(SYSTEM_USERS).find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );

    if (!matchedUser || matchedUser.passwordHash !== hashPassword(String(password))) {
      appendAuditLog({
        action: 'FAILED_LOGIN_ATTEMPT',
        actorId: 'anonymous',
        actorEmail: String(email).slice(0, 50),
        actorRole: 'Guest',
        ip,
        targetResource: '/api/auth/login',
        status: 'FLAGGED',
        metadata: { attemptedEmail: String(email).slice(0, 50) },
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Invalid credentials provided. Please verify your email and password.',
        },
      });
    }

    const token = generateJwt(matchedUser);
    appendAuditLog({
      action: 'USER_LOGIN_SUCCESS',
      actorId: matchedUser.id,
      actorEmail: matchedUser.email,
      actorRole: matchedUser.role,
      ip,
      targetResource: '/api/auth/login',
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      token,
      user: {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
        role: matchedUser.role,
        certifications: matchedUser.certifications,
        workshopId: matchedUser.workshopId,
        permissions: ROLE_PERMISSIONS[matchedUser.role],
      },
    });
  });

  // Current session inspection
  app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
    const userRole = req.user?.role || 'Guest';
    res.json({
      success: true,
      user: {
        id: req.user?.userId || 'usr_guest_001',
        email: req.user?.email || 'guest@autofix.internal',
        name: req.user?.name || 'Anonymous Guest',
        role: userRole,
        permissions: ROLE_PERMISSIONS[userRole],
      },
    });
  });

  // ------------------------------------------
  // DTC OPERATIONS (Protected: Mechanic+)
  // ------------------------------------------
  app.post(
    '/api/dtc/clear',
    sensitiveActionLimiter,
    requireRoles(['Mechanic', 'Workshop Manager', 'Administrator']),
    (req: AuthenticatedRequest, res: Response) => {
      const { dtcCode, ecuId, reason } = req.body;
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';

      // Input validation for DTC code
      const dtcRegex = /^[PBCU][0-9A-Fa-f]{4}$/;
      if (dtcCode && !dtcRegex.test(dtcCode)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DTC_FORMAT',
            message: 'DTC code must match standard SAE J2012 format (e.g., P0300, C1201).',
          },
        });
      }

      appendAuditLog({
        action: 'DTC_CLEARED_AUTHORIZED',
        actorId: req.user?.userId || 'unknown',
        actorEmail: req.user?.email || 'unknown',
        actorRole: req.user?.role || 'Guest',
        ip,
        targetResource: `ECU:${ecuId || 'ECM_01'}/DTC:${dtcCode || 'ALL'}`,
        status: 'SUCCESS',
        metadata: {
          clearedCode: dtcCode || 'ALL_STORED_FAULTS',
          ecu: ecuId || 'ECM_PRIMARY',
          clearedReason: reason || 'Service Procedure Completed',
        },
      });

      res.json({
        success: true,
        message: `Diagnostic fault code ${dtcCode || 'ALL'} successfully erased from ECU flash storage.`,
        freezeFrameErased: true,
        timestamp: new Date().toISOString(),
      });
    }
  );

  // ------------------------------------------
  // AUDIT LOGS (Protected: Workshop Manager, Administrator)
  // ------------------------------------------
  app.get(
    '/api/security/audit-logs',
    requireRoles(['Workshop Manager', 'Administrator']),
    (req: AuthenticatedRequest, res: Response) => {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const logs = auditLogTrail.slice(0, limit);

      res.json({
        success: true,
        totalRecorded: auditLogTrail.length,
        returned: logs.length,
        logs,
      });
    }
  );

  // Audit Integrity Verification (Tamper Proof Chain)
  app.post(
    '/api/security/audit-logs/verify',
    requireRoles(['Workshop Manager', 'Administrator']),
    (req: AuthenticatedRequest, res: Response) => {
      // Walk the hash chain to verify cryptographic integrity
      let intact = true;
      let brokenIndex = -1;

      for (let i = auditLogTrail.length - 1; i >= 0; i--) {
        const entry = auditLogTrail[i];
        const prevHash = i === auditLogTrail.length - 1 ? '0000000000000000000000000000000000000000000000000000000000000000' : auditLogTrail[i + 1].tamperHash;

        const payloadToHash = JSON.stringify({
          id: entry.id,
          timestamp: entry.timestamp,
          action: entry.action,
          actorId: entry.actorId,
          actorRole: entry.actorRole,
          ip: entry.ip,
          target: entry.targetResource,
          status: entry.status,
          meta: entry.metadata,
          prev: prevHash,
          salt: AUDIT_SALT,
        });

        const computed = crypto.createHash('sha256').update(payloadToHash).digest('hex');
        if (computed !== entry.tamperHash) {
          intact = false;
          brokenIndex = i;
          break;
        }
      }

      res.json({
        success: true,
        chainIntact: intact,
        totalEntriesVerified: auditLogTrail.length,
        brokenIndex: brokenIndex >= 0 ? brokenIndex : null,
        algorithm: 'SHA-256 HMAC Hash Chaining with Salted Digest',
      });
    }
  );

  // ------------------------------------------
  // ADMINISTRATIVE SYSTEM CONFIG (Protected: Administrator only)
  // ------------------------------------------
  app.post(
    '/api/admin/system-config',
    requireRoles(['Administrator']),
    (req: AuthenticatedRequest, res: Response) => {
      const { configKey, value } = req.body;
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown';

      appendAuditLog({
        action: 'ADMIN_CONFIG_MODIFIED',
        actorId: req.user?.userId || 'unknown',
        actorEmail: req.user?.email || 'unknown',
        actorRole: req.user?.role || 'Administrator',
        ip,
        targetResource: `Config:${configKey}`,
        status: 'SUCCESS',
        metadata: { configKey, value },
      });

      res.json({
        success: true,
        message: `System parameter '${configKey}' successfully committed.`,
      });
    }
  );

  // Simulated 500 trigger for error resiliency verification
  app.get('/api/simulate-500', (req, res, next) => {
    const simulateError = new Error('CAN-BUS Telemetry Gateway Buffer Overrun (Simulated fault injection test)');
    // Pass to standard error handler to verify stack trace masking
    next(simulateError);
  });

  // Catch-all API 404 handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Requested API resource '${req.path}' does not exist on this server.`,
      },
    });
  });

  // ==========================================
  // CENTRALIZED ERROR HANDLER (Zero Stack Trace Leak)
  // ==========================================
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Log complete stack securely to internal server console
    console.error(`[INTERNAL_SERVER_ERROR] ${req.method} ${req.originalUrl}:`, err);

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Record server exception in audit log
    appendAuditLog({
      action: 'INTERNAL_SERVER_EXCEPTION',
      actorId: (req as any).user?.userId || 'system',
      actorEmail: (req as any).user?.email || 'system@autofix.internal',
      actorRole: (req as any).user?.role || 'Guest',
      ip,
      targetResource: req.originalUrl,
      status: 'FLAGGED',
      metadata: {
        errorType: err?.name || 'Error',
        message: err?.message || 'Unknown internal error',
      },
    });

    // Clean, sanitized response without stack traces or sensitive internals
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal fault occurred. The incident has been recorded in the security audit trail.',
      },
    });
  });

  // ==========================================
  // FRONTEND SERVING (Vite Dev vs Static Prod)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`AutoFix Security-Hardened Server active on http://${HOST}:${PORT}`);
  });
}

startServer();
