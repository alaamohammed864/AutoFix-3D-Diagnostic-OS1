import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserAccount } from './authTypes';
import { setApiAuthToken, fetchCsrfToken } from './apiClient';

interface AuthContextValue {
  user: UserAccount;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  loginWithCredentials: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  allRoles: UserRole[];
}

const DEFAULT_USER: UserAccount = {
  id: 'usr_tech_003',
  email: 'tech.aala@autofix.internal',
  name: 'Eng. Aala Mohammed',
  role: 'Mechanic',
  certifications: ['ASE Master Automobile Tech', 'Porsche High-Voltage Level 3', 'Lead Software Architect'],
  workshopId: 'ws_riyadh_01',
  permissions: [
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
};

const ALL_ROLES: UserRole[] = [
  'Guest',
  'User',
  'Mechanic',
  'Workshop Manager',
  'Administrator',
];

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('autofix_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_USER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('autofix_token');
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync token with API client
  useEffect(() => {
    setApiAuthToken(token);
    if (token) {
      localStorage.setItem('autofix_token', token);
    } else {
      localStorage.removeItem('autofix_token');
    }
  }, [token]);

  // Sync user with local storage
  useEffect(() => {
    localStorage.setItem('autofix_user', JSON.stringify(user));
  }, [user]);

  // Initial bootstrap: get a live signed JWT and CSRF token from the server
  useEffect(() => {
    fetchCsrfToken();
    // Auto acquire valid JWT for initial role
    switchRole(user.role).catch(() => {});
  }, []);

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedRole: targetRole }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          setToken(data.token);
          setApiAuthToken(data.token);
          setUser(data.user);
        }
      } else {
        // Local simulation fallback if server is booting
        setUser((prev) => ({
          ...prev,
          role: targetRole,
          name:
            targetRole === 'Guest'
              ? 'Anonymous Guest'
              : targetRole === 'User'
              ? 'Tariq Al-Mansoor (Owner)'
              : targetRole === 'Mechanic'
              ? 'Eng. Aala Mohammed (Lead Developer)'
              : targetRole === 'Workshop Manager'
              ? 'Sarah Jenkins (Supervisor)'
              : 'Eng. Aala Mohammed (System Architect)',
          email: `${targetRole.toLowerCase().replace(/\s+/g, '')}@autofix.internal`,
        }));
      }
    } catch {
      // Offline fallback
      setUser((prev) => ({ ...prev, role: targetRole }));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithCredentials = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Login failed');
      }

      setToken(data.token);
      setApiAuthToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    switchRole('Guest');
  };

  const hasPermission = (permission: string): boolean => {
    if (user.role === 'Administrator') return true;
    if (!user.permissions) return false;
    return user.permissions.includes(permission) || user.permissions.includes('*');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        token,
        isLoading,
        switchRole,
        loginWithCredentials,
        logout,
        hasPermission,
        allRoles: ALL_ROLES,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
