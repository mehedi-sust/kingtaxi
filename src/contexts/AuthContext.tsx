'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import apiClient from '@/lib/api';

interface User {
  token: string;
  isAdmin: boolean;
  identifier?: string;
}

const loginAtStorageKey = 'kingtaxi_login_at';

function profileStorageKey(identifier: string | undefined) {
  const raw = (identifier || '').trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9_-]/gi, '_');
  return safe ? `kingtaxi_profile_${safe}` : 'kingtaxi_profile';
}

function getAutoLogoutMs() {
  const raw = process.env.NEXT_PUBLIC_AUTH_TOKEN_TTL_MINUTES;
  const minutes = raw ? Number(raw) : 0;
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  return minutes * 60 * 1000;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('kingtaxi_token');
    localStorage.removeItem('kingtaxi_is_admin');
    localStorage.removeItem('kingtaxi_identifier');
    localStorage.removeItem(loginAtStorageKey);
    apiClient.logout().catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('kingtaxi_token');
    const identifier = localStorage.getItem('kingtaxi_identifier') || undefined;

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setUser({ token, isAdmin: false, identifier });

    const bootstrap = async () => {
      try {
        await apiClient.getUsers();
        localStorage.setItem('kingtaxi_is_admin', 'true');
        setUser({ token, isAdmin: true, identifier });
      } catch {
        localStorage.setItem('kingtaxi_is_admin', 'false');
        setUser({ token, isAdmin: false, identifier });
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!user?.token) return;

    const ttlMs = getAutoLogoutMs();
    if (!ttlMs) return;

    let loginAt = Number(localStorage.getItem(loginAtStorageKey) || 0);
    if (!loginAt || !Number.isFinite(loginAt)) {
      loginAt = Date.now();
      localStorage.setItem(loginAtStorageKey, String(loginAt));
    }

    const expiresAt = loginAt + ttlMs;
    const remainingMs = expiresAt - Date.now();

    if (remainingMs <= 0) {
      logout();
      return;
    }

    const timeoutId = window.setTimeout(() => logout(), remainingMs);
    return () => window.clearTimeout(timeoutId);
  }, [logout, user?.token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await apiClient.login(email, password);
      if (result?.access_token) {
        localStorage.setItem('kingtaxi_token', result.access_token);
        localStorage.setItem('kingtaxi_identifier', email);
        localStorage.setItem(loginAtStorageKey, String(Date.now()));
        try {
          const key = profileStorageKey(email);
          const raw = localStorage.getItem(key);
          const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          const legacyRaw = key !== 'kingtaxi_profile' ? localStorage.getItem('kingtaxi_profile') : null;
          const legacyParsed = legacyRaw ? (JSON.parse(legacyRaw) as Record<string, unknown>) : {};
          const looksLikeEmail = email.includes('@');
          const firstNonEmpty = (...values: unknown[]) => {
            for (const value of values) {
              if (typeof value === 'string' && value.trim()) return value;
            }
            return '';
          };
          const next = {
            ...legacyParsed,
            ...parsed,
            full_name: firstNonEmpty(
              parsed.full_name,
              legacyParsed.full_name,
              parsed.name,
              legacyParsed.name
            ),
            email: firstNonEmpty(parsed.email, legacyParsed.email, looksLikeEmail ? email : ''),
            phone: firstNonEmpty(parsed.phone, legacyParsed.phone, looksLikeEmail ? '' : email),
          };
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        let isAdmin = false;
        try {
          await apiClient.getUsers();
          isAdmin = true;
        } catch {
          isAdmin = false;
        }
        localStorage.setItem('kingtaxi_is_admin', String(isAdmin));
        setUser({ token: result.access_token, isAdmin, identifier: email });
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
