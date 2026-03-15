'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api';

interface User {
  token: string;
  identifier: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_EVENT = 'kingtaxi-auth-changed';
const TOKEN_KEY = 'kingtaxi_token';
const IDENTIFIER_KEY = 'kingtaxi_identifier';
const IS_ADMIN_KEY = 'kingtaxi_is_admin';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json =
      typeof window !== 'undefined'
        ? window.atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = typeof payload?.exp === 'number' ? payload.exp : null;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(IDENTIFIER_KEY);
  localStorage.removeItem(IS_ADMIN_KEY);
}

function dispatchAuthChanged() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const syncFromStorage = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token || isTokenExpired(token)) {
        clearStoredAuth();
        setUser(null);
        setIsLoading(false);
        return;
      }

      const storedIdentifier = localStorage.getItem(IDENTIFIER_KEY);
      const payload = decodeJwtPayload(token);
      const fallbackIdentifier = typeof payload?.sub === 'string' ? payload.sub : '';
      const identifier = storedIdentifier || fallbackIdentifier;
      const isAdmin = localStorage.getItem(IS_ADMIN_KEY) === 'true';
      setUser({ token, identifier, isAdmin });
      setIsLoading(false);

      if (!isAdmin) {
        apiClient.hasAdminAccess().then((hasAccess) => {
          if (!hasAccess || cancelled) return;
          localStorage.setItem(IS_ADMIN_KEY, 'true');
          setUser((prev) => {
            if (!prev) return prev;
            return { ...prev, isAdmin: true };
          });
        });
      }
    };

    syncFromStorage();

    const onStorage = (event: StorageEvent) => {
      if (!event.key || [TOKEN_KEY, IDENTIFIER_KEY, IS_ADMIN_KEY].includes(event.key)) {
        syncFromStorage();
      }
    };
    const onFocus = () => {
      syncFromStorage();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncFromStorage();
    };
    const onAuthChanged = () => {
      syncFromStorage();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener(AUTH_EVENT, onAuthChanged);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener(AUTH_EVENT, onAuthChanged);
    };
  }, []);

  const detectAdmin = async (identifier: string) => {
    const hasAccess = await apiClient.hasAdminAccess();
    if (hasAccess) return true;
    return identifier.toLowerCase().includes('admin');
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await apiClient.login(email, password);
      if (result?.access_token) {
        const isAdmin = await detectAdmin(email);
        localStorage.setItem(TOKEN_KEY, result.access_token);
        localStorage.setItem(IDENTIFIER_KEY, email);
        localStorage.setItem(IS_ADMIN_KEY, String(isAdmin));
        setUser({ token: result.access_token, identifier: email, isAdmin });
        dispatchAuthChanged();
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    apiClient.logout().catch(() => {});
    clearStoredAuth();
    setUser(null);
    dispatchAuthChanged();
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
