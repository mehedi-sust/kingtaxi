'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Users,
  Car,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Save,
  BookOpen,
  MessageSquare,
  Tag,
  ArrowLeft,
  LayoutDashboard,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import OffersManager from '@/components/OffersManager';
import FareManager from '@/components/FareManager';
import VehicleManager from '@/components/VehicleManager';
import BookingManager from '@/components/BookingManager';
import BlogManager from '@/components/BlogManager';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  account_type?: string;
  role?: string;
  is_approved?: boolean;
  is_active?: boolean;
  created_at?: string;
  message?: string;
}

interface Driver {
  id: string;
  booking_id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  status?: string;
  is_approved?: boolean;
  created_at?: string;
  message?: string;
}

interface FeedbackItem {
  id: string;
  booking_id?: string;
  customer_name?: string;
  customer_identifier?: string;
  rating?: number;
  comment?: string;
  is_public?: boolean;
  created_at?: string;
}

export default function AdminDashboard() {
  // Initialize activeTab from URL if available, otherwise default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'overview';
    }
    return 'overview';
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [editingUser, setEditingUser] = useState(false);
  const [userEditForm, setUserEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    account_type: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userModalError, setUserModalError] = useState('');
  const [userModalSuccess, setUserModalSuccess] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [togglingFeedbackId, setTogglingFeedbackId] = useState<string | null>(null);
  const [driversError, setDriversError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    activeOffers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [driversPage, setDriversPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated)) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  // Sync activeTab with URL on mount and handle browser back/forward
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Handle popstate (browser back/forward)
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'overview';
      setActiveTab(tab);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when activeTab changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentParams = new URLSearchParams(window.location.search);
    const currentTab = currentParams.get('tab');
    
    // Only update URL if tab has changed
    if (currentTab !== activeTab) {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', activeTab);
      const nextUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ tab: activeTab }, '', nextUrl);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin && !hasFetchedData) {
      fetchData();
      setHasFetchedData(true);
      return;
    }
    if (isAuthenticated && !user?.isAdmin) {
      setLoading(false);
    }
  }, [isAuthenticated, user?.isAdmin, hasFetchedData]);  useEffect(() => {
    if (!showUserModal && !showDriverModal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showUserModal, showDriverModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, driversRaw, offersData] = await Promise.all([
        apiClient.getUsers().catch(() => []),
        apiClient.getDrivers().catch(() => []),
        apiClient.getAdminOffersAll().catch(() => apiClient.getOffers()).catch(() => []),
      ]);
      setFeedbackLoading(true);
      const feedbackRaw = await apiClient.getFeedbackManagementAll().catch(() => []);
      setFeedbackLoading(false);

      const toTimestamp = (value?: string | null) => {
        if (!value) return null;
        const parsed = new Date(String(value));
        if (Number.isNaN(parsed.getTime())) return null;
        return parsed.getTime();
      };
      const now = Date.now();
      const activeOffers = Array.isArray(offersData)
        ? offersData.filter((offer: any) => {
            const isActiveFlag = offer?.is_active !== false;
            const start = toTimestamp(offer?.valid_from ?? offer?.start_date ?? null);
            const end = toTimestamp(offer?.valid_until ?? offer?.end_date ?? null);
            const afterStart = start === null || start <= now;
            const beforeEnd = end === null || now <= end;
            return isActiveFlag && afterStart && beforeEnd;
          }).length
        : 0;

      const normalizeDrivers = (items: any[]): Driver[] => {
        return items
          .map((item: any) => ({
            id: String(item?.id || item?.application_id || item?.driver_application_id || item?.driver_id || ''),
            booking_id: item?.booking_id ? String(item.booking_id) : undefined,
            // DriverApplication uses `name` as a single field
            first_name: item?.first_name || item?.firstName || '',
            last_name: item?.last_name || item?.lastName || '',
            name: item?.name || item?.full_name || `${item?.first_name || ''} ${item?.last_name || ''}`.trim(),
            email: item?.email || '',
            phone: item?.phone || item?.phone_number || '',
            experience: item?.experience || item?.license_number || '',
            vehicle_model: item?.vehicle_model
              ? (item?.vehicle_make ? `${item.vehicle_make} ${item.vehicle_model}` : item.vehicle_model)
              : item?.vehicle_make || '',
            vehicle_plate: item?.vehicle_plate || '',
            // Normalize status: backend uses PENDING/APPROVED/REJECTED (uppercase)
            status: String(item?.status || 'PENDING').toLowerCase(),
            is_approved: typeof item?.is_approved === 'boolean'
              ? item.is_approved
              : String(item?.status || '').toUpperCase() === 'APPROVED',
            created_at: item?.created_at || item?.submitted_at || '',
            message: item?.message || item?.notes || '',
          }))
          .filter((item) => Boolean(item.id));
      };

      const normalizeFeedback = (items: any[]): FeedbackItem[] => {
        return items
          .map((item: any) => ({
            id: String(item?.id || item?.feedback_id || ''),
            booking_id: item?.booking_id ? String(item.booking_id) : undefined,
            customer_name: item?.customer_name || item?.name || '',
            customer_identifier: item?.customer_identifier || item?.customer_email || item?.customer_phone || '',
            rating: Number(item?.rating ?? NaN),
            comment: item?.comment || '',
            is_public: Boolean(item?.is_public),
            created_at: item?.created_at || '',
          }))
          .filter((item) => Boolean(item.id));
      };

      setUsers(usersData as User[]);
      setDrivers(normalizeDrivers(Array.isArray(driversRaw) ? driversRaw : []));
      setFeedbackItems(normalizeFeedback(Array.isArray(feedbackRaw) ? feedbackRaw : []));
      setFeedbackError('');
      setStats({
        totalUsers: (usersData as User[]).length,
        totalDrivers: Array.isArray(driversRaw) ? driversRaw.length : 0,
        activeOffers,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set fallback data on error
      setUsers([]);
      setDrivers([]);
      setFeedbackItems([]);
      setFeedbackError('Unable to load dashboard data.');
      setStats({
        totalUsers: 0,
        totalDrivers: 0,
        activeOffers: 0,
      });
    } finally {
      setLoading(false);
      setFeedbackLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">You need to sign in to access this page.</p>
          <button 
            onClick={() => router.push('/signin')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">You do not have permission to access the admin dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    { title: 'Total Users', value: (stats?.totalUsers || 0).toString(), icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', section: 'users', description: 'Manage registered users' },
    { title: 'Driver Applications', value: (stats?.totalDrivers || 0).toString(), icon: Car, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', section: 'drivers', description: 'Review driver applications' },
    { title: 'Active Offers', value: (stats?.activeOffers || 0).toString(), icon: Tag, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', section: 'offers', description: 'Manage promotions' },
    { title: 'Bookings', value: '—', icon: Calendar, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', section: 'bookings', description: 'View & manage bookings' },
    { title: 'Fares', value: '—', icon: MapPin, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', section: 'fares', description: 'Set route pricing' },
    { title: 'Vehicles', value: '—', icon: Car, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', section: 'vehicles', description: 'Fleet management' },
    { title: 'Blogs', value: '—', icon: BookOpen, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30', section: 'blogs', description: 'Approve blog posts' },
    { title: 'Feedback', value: '—', icon: MessageSquare, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30', section: 'feedback', description: 'Customer feedback' },
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'drivers', name: 'Drivers', icon: Car },
    { id: 'feedback', name: 'Feedback', icon: MessageSquare },
    { id: 'vehicles', name: 'Vehicles', icon: Car },
    { id: 'fares', name: 'Fares', icon: MapPin },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'offers', name: 'Offers', icon: Tag },
    { id: 'blogs', name: 'Blogs', icon: BookOpen },
  ];

  const handleUserAction = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const is_approved = action === 'approve';
      await apiClient.updateUser(userId, { is_approved });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_approved } : user
      ));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const openUserModal = (value: User) => {
    setSelectedUser(value);
    setUserEditForm({
      full_name: value.full_name || `${value.first_name || ''} ${value.last_name || ''}`.trim(),
      email: value.email || '',
      phone: value.phone || '',
      account_type: value.account_type || value.role || 'customer',
    });
    setEditingUser(false);
    setNewPassword('');
    setConfirmPassword('');
    setUserModalError('');
    setUserModalSuccess('');
    setShowUserModal(true);
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;
    try {
      setUserModalError('');
      setUserModalSuccess('');
      await apiClient.updateUser(selectedUser.id, {
        full_name: userEditForm.full_name || undefined,
        email: userEditForm.email || undefined,
        phone: userEditForm.phone || undefined,
        account_type: userEditForm.account_type || undefined,
      });
      await fetchData();
      setUserModalSuccess('User details updated successfully.');
    } catch (error) {
      console.error('Error saving user:', error);
      setUserModalError(error instanceof Error ? error.message : 'Failed to update user details.');
    }
  };

  const updateUserPassword = async () => {
    if (!selectedUser) return;
    setUserModalError('');
    setUserModalSuccess('');
    const password = newPassword.trim();
    const confirm = confirmPassword.trim();
    if (!password || !confirm) {
      setUserModalError('Please enter and confirm the new password.');
      return;
    }
    if (password.length < 8) {
      setUserModalError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setUserModalError('New password and confirm password do not match.');
      return;
    }
    try {
      await apiClient.updateUser(selectedUser.id, {
        password,
      });
      setNewPassword('');
      setConfirmPassword('');
      setUserModalSuccess('Password updated successfully for this user.');
    } catch (error) {
      console.error('Error updating user password:', error);
      setUserModalError(error instanceof Error ? error.message : 'Failed to update password.');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiClient.deleteUser(userId);
      setUsers((prev) => prev.filter((value) => value.id !== userId));
      if (selectedUser?.id === userId) {
        setShowUserModal(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleDriverAction = async (driverId: string, action: 'approve' | 'reject' | 'review') => {
    try {
      setDriversError('');
      if (action === 'review') {
        const value = drivers.find((driver) => driver.id === driverId) || null;
        setSelectedDriver(value);
        setShowDriverModal(true);
        return;
      }
      if (action === 'approve' || action === 'reject') {
        const is_approved = action === 'approve';
        await apiClient.updateDriver(driverId, { is_approved });
        // Refresh the full list so the new status is accurate
        const driversRaw = await apiClient.getDrivers().catch(() => []);
        const normalizeDrivers = (items: any[]): Driver[] =>
          items
            .map((item: any) => ({
              id: String(item?.id || ''),
              booking_id: item?.booking_id ? String(item.booking_id) : undefined,
              first_name: item?.first_name || '',
              last_name: item?.last_name || '',
              name: item?.name || item?.full_name || `${item?.first_name || ''} ${item?.last_name || ''}`.trim(),
              email: item?.email || '',
              phone: item?.phone || '',
              experience: item?.experience || item?.license_number || '',
              vehicle_model: item?.vehicle_model
                ? (item?.vehicle_make ? `${item.vehicle_make} ${item.vehicle_model}` : item.vehicle_model)
                : item?.vehicle_make || '',
              vehicle_plate: item?.vehicle_plate || '',
              status: String(item?.status || 'PENDING').toLowerCase(),
              is_approved: typeof item?.is_approved === 'boolean'
                ? item.is_approved
                : String(item?.status || '').toUpperCase() === 'APPROVED',
              created_at: item?.created_at || '',
              message: item?.message || '',
            }))
            .filter((item) => Boolean(item.id));
        setDrivers(normalizeDrivers(Array.isArray(driversRaw) ? driversRaw : []));
      }
    } catch (error) {
      console.error('Error updating driver:', error);
      setDriversError(error instanceof Error ? error.message : 'Failed to update driver application.');
    }
  };

  const isDriverApproved = (driver: Driver) => {
    const status = String(driver.status || '').toLowerCase();
    if (typeof driver.is_approved === 'boolean') return driver.is_approved;
    return status === 'approved' || status === 'accepted' || status === 'active';
  };

  const handleFeedbackVisibilityToggle = async (feedbackId: string, current: boolean) => {
    try {
      setTogglingFeedbackId(feedbackId);
      setFeedbackError('');
      await apiClient.setFeedbackVisibility(feedbackId, !current);
      setFeedbackItems((prev) =>
        prev.map((item) => (item.id === feedbackId ? { ...item, is_public: !current } : item))
      );
    } catch (error) {
      console.error('Error updating feedback visibility:', error);
      setFeedbackError(error instanceof Error ? error.message : 'Failed to update feedback visibility.');
    } finally {
      setTogglingFeedbackId(null);
    }
  };

  // Pagination logic
  const usersTotalPages = Math.ceil(users.length / itemsPerPage);
  const usersStartIndex = (usersPage - 1) * itemsPerPage;
  const usersEndIndex = usersStartIndex + itemsPerPage;
  const currentUsers = users.slice(usersStartIndex, usersEndIndex);

  const driversTotalPages = Math.ceil(drivers.length / itemsPerPage);
  const driversStartIndex = (driversPage - 1) * itemsPerPage;
  const driversEndIndex = driversStartIndex + itemsPerPage;
  const currentDrivers = drivers.slice(driversStartIndex, driversEndIndex);

  const goToUsersPage = (page: number) => {
    setUsersPage(Math.max(1, Math.min(page, usersTotalPages)));
  };

  const goToDriversPage = (page: number) => {
    setDriversPage(Math.max(1, Math.min(page, driversTotalPages)));
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (value: User) => {
    const fullName = value.full_name?.trim();
    if (fullName) return fullName;
    const firstName = value.first_name?.trim() || '';
    const lastName = value.last_name?.trim() || '';
    const combined = `${firstName} ${lastName}`.trim();
    if (combined) return combined;
    return value.phone || value.email || 'Unknown User';
  };

  const getDriverDisplayName = (value: Driver) => {
    const name = value.name?.trim();
    if (name) return name;
    const firstName = value.first_name?.trim() || '';
    const lastName = value.last_name?.trim() || '';
    const combined = `${firstName} ${lastName}`.trim();
    if (combined) return combined;
    return value.phone || value.email || 'Unknown Driver';
  };

  const getUserType = (value: User) => {
    return value.account_type || value.role || 'customer';
  };

  const getUserStatusLabel = (value: User) => {
    if (typeof value.is_approved === 'boolean') {
      return value.is_approved ? 'Approved' : 'Pending';
    }
    if (typeof value.is_active === 'boolean') {
      return value.is_active ? 'Active' : 'Inactive';
    }
    return 'Unknown';
  };

  const isUserApproved = (value: User) => {
    if (typeof value.is_approved === 'boolean') return value.is_approved;
    if (typeof value.is_active === 'boolean') return value.is_active;
    return false;
  };

  const getDriverExperience = (value: Driver) => {
    if (value.experience?.trim()) return value.experience;
    if (value.vehicle_model?.trim()) return `Vehicle: ${value.vehicle_model}`;
    if (value.status?.trim()) return `Status: ${value.status}`;
    return 'Not provided';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            {activeTab !== 'overview' && (
              <button
                onClick={() => setActiveTab('overview')}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'overview' ? 'Admin Dashboard' : tabs.find(t => t.id === activeTab)?.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                {activeTab === 'overview' ? 'Click any section to manage it' : 'Admin Dashboard › ' + tabs.find(t => t.id === activeTab)?.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Overview: Card Grid */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Quick Stats + Navigation Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {statsCards.map((card, index) => (
                <motion.button
                  key={card.section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setActiveTab(card.section)}
                  className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-left hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className={`inline-flex p-2.5 rounded-lg ${card.bgColor} mb-3`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{card.value}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{card.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {card.description} →
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Users</h3>
                  <button onClick={() => setActiveTab('users')} className="text-xs text-red-600 dark:text-red-400 hover:underline">View all</button>
                </div>
                <div className="p-5 space-y-3">
                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No users yet.</p>
                  ) : users.slice(0, 4).map((u) => (
                    <div key={u.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getUserDisplayName(u)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email || u.phone || '-'}</p>
                      </div>
                      <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${isUserApproved(u) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {getUserStatusLabel(u)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Driver Applications</h3>
                  <button onClick={() => setActiveTab('drivers')} className="text-xs text-red-600 dark:text-red-400 hover:underline">View all</button>
                </div>
                <div className="p-5 space-y-3">
                  {drivers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No applications yet.</p>
                  ) : drivers.slice(0, 4).map((d) => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getDriverDisplayName(d)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getDriverExperience(d)}</p>
                      </div>
                      <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${isDriverApproved(d) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                        {isDriverApproved(d) ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                    Export Users
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{getUserDisplayName(user)}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || user.phone || '-'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {getUserType(user)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isUserApproved(user)
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {getUserStatusLabel(user)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openUserModal(user)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {!isUserApproved(user) && (
                              <>
                                <button 
                                  onClick={() => handleUserAction(user.id, 'approve')}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleUserAction(user.id, 'reject')}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Users Pagination */}
              {users.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    Showing {usersStartIndex + 1} to {Math.min(usersEndIndex, users.length)} of {users.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToUsersPage(usersPage - 1)}
                      disabled={usersPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: usersTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToUsersPage(page)}
                        className={`px-3 py-1 text-sm rounded ${
                          usersPage === page
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => goToUsersPage(usersPage + 1)}
                      disabled={usersPage === usersTotalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Drivers Tab */}
        {activeTab === 'drivers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Driver Applications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{drivers.length} total applications</p>
                </div>
                <button
                  onClick={() => { setHasFetchedData(false); }}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Refresh
                </button>
              </div>
              {driversError && (
                <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
                  <span>{driversError}</span>
                  <button onClick={() => setDriversError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">Licence / Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentDrivers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                          No driver applications found.
                        </td>
                      </tr>
                    ) : currentDrivers.map((driver) => {
                      const approved = isDriverApproved(driver);
                      const statusStr = String(driver.status || '').toLowerCase();
                      const rejected = statusStr === 'rejected';
                      const pending = !approved && !rejected;
                      return (
                        <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDriverAction(driver.id, 'review')}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 text-left block"
                            >
                              {getDriverDisplayName(driver)}
                            </button>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{driver.email || driver.phone || '-'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white hidden sm:table-cell">
                            {getDriverExperience(driver)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white hidden md:table-cell">
                            {driver.vehicle_model || '-'}{driver.vehicle_plate ? ` · ${driver.vehicle_plate}` : ''}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              approved
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : rejected
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {approved ? 'Approved' : rejected ? 'Rejected' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDriverAction(driver.id, 'review')}
                                title="View details"
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {pending && (
                                <>
                                  <button
                                    onClick={() => handleDriverAction(driver.id, 'approve')}
                                    title="Approve"
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDriverAction(driver.id, 'reject')}
                                    title="Reject"
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {rejected && (
                                <button
                                  onClick={() => handleDriverAction(driver.id, 'approve')}
                                  title="Re-approve"
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Drivers Pagination */}
              {drivers.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    Showing {driversStartIndex + 1} to {Math.min(driversEndIndex, drivers.length)} of {drivers.length} applications
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToDriversPage(driversPage - 1)}
                      disabled={driversPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: driversTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToDriversPage(page)}
                        className={`px-3 py-1 text-sm rounded ${
                          driversPage === page
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => goToDriversPage(driversPage + 1)}
                      disabled={driversPage === driversTotalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Feedback Management</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Toggle public visibility for each rating/review. New feedback stays hidden by default.
                </p>
              </div>
              {feedbackError && (
                <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {feedbackError}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Booking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Public</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {feedbackLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          Loading feedback...
                        </td>
                      </tr>
                    ) : feedbackItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No feedback available.
                        </td>
                      </tr>
                    ) : (
                      feedbackItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {item.customer_name || item.customer_identifier || 'Customer'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {item.booking_id || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {Number.isFinite(item.rating) ? `${item.rating}/5` : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-md">
                            {item.comment || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(item.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleFeedbackVisibilityToggle(item.id, Boolean(item.is_public))}
                              disabled={togglingFeedbackId === item.id}
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.is_public
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              } disabled:opacity-60`}
                            >
                              {togglingFeedbackId === item.id
                                ? 'Updating...'
                                : item.is_public
                                ? 'ON'
                                : 'OFF'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BookingManager />
          </motion.div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VehicleManager />
          </motion.div>
        )}

        {/* Fares Tab */}
        {activeTab === 'fares' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FareManager />
          </motion.div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <OffersManager />
          </motion.div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BlogManager />
          </motion.div>
        )}

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h3>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                {userModalError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {userModalError}
                  </div>
                )}
                {userModalSuccess && (
                  <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                    {userModalSuccess}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  {editingUser ? (
                    <input
                      value={userEditForm.full_name}
                      onChange={(e) => setUserEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{getUserDisplayName(selectedUser)}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  {editingUser ? (
                    <input
                      value={userEditForm.email}
                      onChange={(e) => setUserEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{selectedUser.email || selectedUser.phone || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</label>
                  {editingUser ? (
                    <select
                      value={userEditForm.account_type}
                      onChange={(e) => setUserEditForm((prev) => ({ ...prev, account_type: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                    >
                      <option value="customer">customer</option>
                      <option value="business">business</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 dark:text-white">{getUserType(selectedUser)}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="text-gray-900 dark:text-white">{getUserStatusLabel(selectedUser)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.message || 'No message provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Registration Date</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Admin Password Reset</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Existing passwords cannot be viewed. Set a new password for this user below.
                  </p>
                  <div className="mt-3 space-y-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8 chars)"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={updateUserPassword}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
              {!isUserApproved(selectedUser) && (
                <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={() => {
                      handleUserAction(selectedUser.id, 'approve');
                      setShowUserModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => {
                      handleUserAction(selectedUser.id, 'reject');
                      setShowUserModal(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setEditingUser((prev) => !prev)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 inline-flex items-center justify-center"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {editingUser ? 'Cancel Edit' : 'Edit User'}
                </button>
                {editingUser && (
                  <button
                    onClick={saveUserChanges}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 inline-flex items-center justify-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                )}
                <button
                  onClick={() => deleteUser(selectedUser.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 inline-flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showDriverModal && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Driver Application</h3>
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white">{getDriverDisplayName(selectedDriver)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</label>
                  <p className="text-gray-900 dark:text-white">{selectedDriver.email || selectedDriver.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Experience</label>
                  <p className="text-gray-900 dark:text-white">{getDriverExperience(selectedDriver)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Plate</label>
                  <p className="text-gray-900 dark:text-white">{selectedDriver.vehicle_plate || '-'}</p>
                </div>
              </div>
              {!isDriverApproved(selectedDriver) && (
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      handleDriverAction(selectedDriver.id, 'approve');
                      setShowDriverModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleDriverAction(selectedDriver.id, 'reject');
                      setShowDriverModal(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Reject
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
