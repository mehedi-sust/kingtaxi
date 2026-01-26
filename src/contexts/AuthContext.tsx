'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import apiClient from '@/lib/api';

interface User {
  token: string;
  isAdmin: boolean;
  identifier?: string;
}

function profileStorageKey(identifier: string | undefined) {
  const raw = (identifier || '').trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9_-]/gi, '_');
  return safe ? `kingtaxi_profile_${safe}` : 'kingtaxi_profile';
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await apiClient.login(email, password);
      if (result?.access_token) {
        localStorage.setItem('kingtaxi_token', result.access_token);
        localStorage.setItem('kingtaxi_identifier', email);
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kingtaxi_token');
    localStorage.removeItem('kingtaxi_is_admin');
    localStorage.removeItem('kingtaxi_identifier');
    apiClient.logout().catch(() => {});
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
