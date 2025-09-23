'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountType: 'personal' | 'business';
  isAdmin: boolean;
  isVerified: boolean;
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
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('kingtaxi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Default admin credentials
    if (email === 'admin@kingtaxi.co.uk' && password === 'Admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@kingtaxi.co.uk',
        firstName: 'Admin',
        lastName: 'User',
        accountType: 'business',
        isAdmin: true,
        isVerified: true,
      };
      setUser(adminUser);
      localStorage.setItem('kingtaxi_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    }

    // For demo purposes, accept any other email/password combination
    const demoUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName: 'Demo',
      lastName: 'User',
      accountType: 'personal',
      isAdmin: false,
      isVerified: true,
    };
    setUser(demoUser);
    localStorage.setItem('kingtaxi_user', JSON.stringify(demoUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kingtaxi_user');
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
