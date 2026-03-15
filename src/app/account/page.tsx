'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';

type Account = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

function profileStorageKey(identifier: string | undefined) {
  const raw = (identifier || '').trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9_-]/gi, '_');
  return safe ? `kingtaxi_profile_${safe}` : 'kingtaxi_profile';
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [form, setForm] = useState<Account>({ full_name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const canEditEmail = Boolean(user?.isAdmin);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/signin');
  }, [isAuthenticated, isLoading, router]);

  const normalizeAccount = (raw: any): Account => {
    if (!raw || typeof raw !== 'object') return {};
    const obj = raw as Record<string, any>;

    const firstName = typeof obj.first_name === 'string' ? obj.first_name : '';
    const lastName = typeof obj.last_name === 'string' ? obj.last_name : '';
    const fullNameFromParts = [firstName, lastName].filter(Boolean).join(' ').trim();

    const full_name =
      (typeof obj.full_name === 'string' && obj.full_name) ||
      (typeof obj.fullName === 'string' && obj.fullName) ||
      (typeof obj.name === 'string' && obj.name) ||
      (fullNameFromParts || null);

    const phone =
      (typeof obj.phone === 'string' && obj.phone) ||
      (typeof obj.phone_number === 'string' && obj.phone_number) ||
      (typeof obj.mobile === 'string' && obj.mobile) ||
      (typeof obj.mobile_number === 'string' && obj.mobile_number) ||
      null;

    const email = (typeof obj.email === 'string' && obj.email) || null;

    return { full_name, email, phone };
  };

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const load = async () => {
      let fetchError: string | null = null;
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const identifier = user?.identifier ?? '';
        const looksLikeEmail = identifier.includes('@');
        const storageKey = profileStorageKey(identifier);

        try {
          const data = await apiClient.getUser();
          const next = normalizeAccount(data);
          setForm({
            full_name: next.full_name ?? '',
            email: next.email ?? (looksLikeEmail ? identifier : ''),
            phone: next.phone ?? (!looksLikeEmail ? identifier : ''),
          });
          localStorage.setItem(storageKey, JSON.stringify(next));
          return;
        } catch (e) {
          fetchError = e instanceof Error ? e.message : 'Failed to load account';
        }

        try {
          const raw = localStorage.getItem(storageKey) ?? localStorage.getItem('kingtaxi_profile');
          const parsed = raw ? (JSON.parse(raw) as Account) : null;
          if (parsed) {
            setForm({
              full_name: parsed.full_name ?? '',
              email: parsed.email ?? '',
              phone: parsed.phone ?? '',
            });
            if (storageKey !== 'kingtaxi_profile') {
              localStorage.setItem(storageKey, JSON.stringify(parsed));
            }
            if (fetchError) setError(fetchError);
            return;
          }
        } catch {}

        setForm({
          full_name: '',
          email: looksLikeEmail ? identifier : '',
          phone: !looksLikeEmail ? identifier : '',
        });
        if (fetchError) setError(fetchError);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, isLoading, user?.identifier]);

  const onChange = (key: keyof Account) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload = {
        full_name: form.full_name || undefined,
        phone: form.phone || undefined,
        ...(canEditEmail ? { email: form.email || undefined } : {}),
      };

      const updated = await apiClient.updateAccount(payload);
      const normalized = normalizeAccount(updated ?? payload);
      localStorage.setItem(profileStorageKey(user?.identifier), JSON.stringify(normalized));
      setForm({
        full_name: normalized.full_name ?? form.full_name ?? '',
        email: normalized.email ?? form.email ?? '',
        phone: normalized.phone ?? form.phone ?? '',
      });
      setSuccess('Saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || (!isAuthenticated && !isLoading)) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Update your personal details.</p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">Loading account...</span>
          </div>
        ) : (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
                <input
                  value={form.full_name ?? ''}
                  onChange={onChange('full_name')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  value={form.email ?? ''}
                  onChange={canEditEmail ? onChange('email') : undefined}
                  disabled={!canEditEmail}
                  className={`w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    canEditEmail ? '' : 'opacity-70 cursor-not-allowed'
                  }`}
                  placeholder="you@example.com"
                />
                {!canEditEmail && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Only admins can change email.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  value={form.phone ?? ''}
                  onChange={onChange('phone')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="+44..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={onSave}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
