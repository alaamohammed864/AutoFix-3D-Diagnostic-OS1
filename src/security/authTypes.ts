export type UserRole = 'Guest' | 'User' | 'Mechanic' | 'Workshop Manager' | 'Administrator';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  certifications?: string[];
  workshopId?: string;
  permissions?: string[];
}

export interface AuthState {
  user: UserAccount;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  [key: string]: any;
}

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

export const ROLE_BADGE_STYLES: Record<UserRole, { bg: string; text: string; border: string; icon: string }> = {
  Guest: {
    bg: 'bg-neutral-800/80',
    text: 'text-neutral-300',
    border: 'border-neutral-700',
    icon: 'visibility',
  },
  User: {
    bg: 'bg-cyan-950/80',
    text: 'text-cyan-300',
    border: 'border-cyan-500/40',
    icon: 'person',
  },
  Mechanic: {
    bg: 'bg-amber-950/80',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
    icon: 'build',
  },
  'Workshop Manager': {
    bg: 'bg-emerald-950/80',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
    icon: 'engineering',
  },
  Administrator: {
    bg: 'bg-rose-950/80',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
    icon: 'shield_person',
  },
};
