'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FareManager from '@/components/FareManager';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminFares() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/signin');
      return;
    }
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router, user?.isAdmin]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  if (!user?.isAdmin) return null;

  return <FareManager />;
}
