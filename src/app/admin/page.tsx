'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Car, 
  FileText, 
  TrendingUp, 
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Save
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import OffersManager from '@/components/OffersManager';
import FareManager from '@/components/FareManager';
import VehicleManager from '@/components/VehicleManager';
import BookingManager from '@/components/BookingManager';
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === activeTab) return;
    params.set('tab', activeTab);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', nextUrl);
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
  }, [isAuthenticated, user?.isAdmin, hasFetchedData]);

  useEffect(() => {
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
      const [usersData, driversData, offersData] = await Promise.all([
        apiClient.getUsers().catch(() => []),
        apiClient.getDrivers().catch(() => []),
        apiClient.getAdminOffersAll().catch(() => apiClient.getOffers()).catch(() => []),
      ]);

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

      setUsers(usersData as User[]);
      setDrivers(driversData as Driver[]);
      setStats({
        totalUsers: (usersData as User[]).length,
        totalDrivers: (driversData as Driver[]).length,
        activeOffers,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set fallback data on error
      setUsers([]);
      setDrivers([]);
      setStats({
        totalUsers: 0,
        totalDrivers: 0,
        activeOffers: 0,
      });
    } finally {
      setLoading(false);
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
    { title: 'Total Users', value: (stats?.totalUsers || 0).toString(), change: '+12%', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Driver Applications', value: (stats?.totalDrivers || 0).toString(), change: '+8%', icon: Car, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Active Offers', value: (stats?.activeOffers || 0).toString(), change: '+5%', icon: FileText, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { title: 'Revenue (Month)', value: '£12,450', change: '+15%', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'drivers', name: 'Driver Applications', icon: Car },
    { id: 'vehicles', name: 'Vehicle Management', icon: Car },
    { id: 'fares', name: 'Fare Management', icon: MapPin },
    { id: 'bookings', name: 'Booking Management', icon: Calendar },
    { id: 'offers', name: 'Offers & Promotions', icon: Calendar },
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
      if (action === 'review') {
        const value = drivers.find((driver) => driver.id === driverId) || null;
        setSelectedDriver(value);
        setShowDriverModal(true);
        return;
      }
      if (action === 'approve' || action === 'reject') {
        const is_approved = action === 'approve';
        await apiClient.updateDriver(driverId, { is_approved });
        setDrivers(drivers.map(driver =>
          driver.id === driverId ? { ...driver, is_approved } : driver
        ));
      }
    } catch (error) {
      console.error('Error updating driver:', error);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage users, applications, and system settings</p>
        </motion.div>


        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                        <span className="ml-2 text-sm font-medium text-green-600">{stat.change}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent User Registrations</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {users.slice(0, 3).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{getUserDisplayName(user)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || user.phone || '-'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isUserApproved(user)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {getUserStatusLabel(user)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Driver Applications</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {drivers.slice(0, 3).map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{getDriverDisplayName(driver)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{getDriverExperience(driver)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          driver.is_approved 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {driver.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
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
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Driver Applications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Experience</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Availability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <button
                              onClick={() => handleDriverAction(driver.id, 'review')}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 text-left"
                            >
                              {getDriverDisplayName(driver)}
                            </button>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{driver.email || driver.phone || '-'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {getDriverExperience(driver)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          Full-time
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            driver.is_approved 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {driver.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!driver.is_approved && (
                              <>
                                <button 
                                  onClick={() => handleDriverAction(driver.id, 'approve')}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDriverAction(driver.id, 'review')}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDriverAction(driver.id, 'reject')}
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
              
              {/* Drivers Pagination */}
              {drivers.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    Showing {driversStartIndex + 1} to {Math.min(driversEndIndex, drivers.length)} of {drivers.length} drivers
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
              {!selectedDriver.is_approved && (
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
