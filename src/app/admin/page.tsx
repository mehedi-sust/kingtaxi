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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import OffersManager from '@/components/OffersManager';
import FareManager from '@/components/FareManager';
import VehicleManager from '@/components/VehicleManager';
import BookingManager from '@/components/BookingManager';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  phone: string;
  email?: string | null;
  full_name?: string | null;
  role: string;
  is_active: boolean;
}

interface Driver {
  id: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  license_number?: string;
  is_approved: boolean;
  status?: string;
  created_at: string;
  message?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showDriverMgmtModal, setShowDriverMgmtModal] = useState(false);
  const [driverMgmtMode, setDriverMgmtMode] = useState<'create' | 'edit'>('create');
  const [driverMgmtForm, setDriverMgmtForm] = useState({
    id: '',
    name: '',
    phone: '',
    vehicle_plate: '',
    vehicle_model: '',
    status: 'offline',
  });
  const [driverMgmtError, setDriverMgmtError] = useState<string | null>(null);
  const [driverMgmtSaving, setDriverMgmtSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [driverApplications, setDriverApplications] = useState<Driver[]>([]);
  const [drivers, setDrivers] = useState<Array<{
    id: string;
    name: string;
    phone: string;
    email?: string;
    vehicle_plate?: string;
    vehicle_model?: string;
    status?: string;
    created_at?: string;
  }>>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDriverApplications: 0,
    totalDrivers: 0,
    activeOffers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [driversPage, setDriversPage] = useState(1);
  const [driversMgmtPage, setDriversMgmtPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated)) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      setLoading(false);
      router.replace('/');
      return;
    }
    if (!isLoading && isAuthenticated && user?.isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, router, user]);

  useEffect(() => {
    const isModalOpen = showUserModal || showDriverModal || showDriverMgmtModal;
    if (!isModalOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showUserModal, showDriverModal, showDriverMgmtModal]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, driverApplicationsData, driversData, offersData] = await Promise.all([
        apiClient.getUsers().catch(() => []),
        apiClient.getAdminDriverApplications().catch(() => []),
        apiClient.getDrivers().catch(() => []),
        apiClient.getAdminOffersAll().catch(() => apiClient.getOffers().catch(() => [])),
      ]);

      const activeOffers = Array.isArray(offersData)
        ? (offersData as Array<{ is_active?: boolean }>).filter((o) => o?.is_active).length
        : 0;

      const rawDrivers = Array.isArray(driversData)
        ? driversData
        : Array.isArray((driversData as any)?.drivers)
        ? (driversData as any).drivers
        : Array.isArray((driversData as any)?.data)
        ? (driversData as any).data
        : [];

      const isDriverRecord = (input: any) =>
        typeof input?.vehicle_plate === 'string' ||
        typeof input?.vehicle_model === 'string' ||
        typeof input?.status === 'string' ||
        typeof input?.current_lat === 'number' ||
        typeof input?.current_lng === 'number' ||
        typeof input?.user_id === 'string' ||
        (typeof input?.name === 'string' && typeof input?.phone === 'string');

      const splitFullName = (fullName: string) => {
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        const first = parts[0] || '';
        const last = parts.slice(1).join(' ');
        return { first, last };
      };

      const normalizeDriverName = (input: any) =>
        (typeof input?.name === 'string' && input.name.trim()) ||
        [input?.first_name, input?.last_name].filter(Boolean).join(' ').trim() ||
        (typeof input?.full_name === 'string' && input.full_name.trim()) ||
        (typeof input?.email === 'string' && input.email.trim()) ||
        (typeof input?.phone === 'string' && input.phone.trim()) ||
        String(input?.id ?? '');

      const rawApplications = Array.isArray(driverApplicationsData)
        ? driverApplicationsData
        : Array.isArray((driverApplicationsData as any)?.applications)
        ? (driverApplicationsData as any).applications
        : Array.isArray((driverApplicationsData as any)?.data)
        ? (driverApplicationsData as any).data
        : driverApplicationsData
        ? [driverApplicationsData]
        : [];

      const nextDriverApplications = (rawApplications as any[])
        .filter((d) => d && typeof d === 'object')
        .map((d) => {
          const fullName =
            (typeof d.full_name === 'string' && d.full_name.trim()) ||
            (typeof d.fullName === 'string' && d.fullName.trim()) ||
            (typeof d.name === 'string' && d.name.trim()) ||
            [d.first_name, d.last_name].filter(Boolean).join(' ').trim();
          const names = fullName ? splitFullName(fullName) : { first: '', last: '' };
          const status = typeof d.status === 'string' ? d.status : undefined;
          const normalizedStatus = status ? status.trim().toLowerCase() : '';
          const isApproved =
            typeof d.is_approved === 'boolean'
              ? Boolean(d.is_approved)
              : normalizedStatus === 'approved' || normalizedStatus === 'accepted' || normalizedStatus === 'active';
          const licenseNumber =
            (typeof d.license_number === 'string' && d.license_number.trim()) ||
            (typeof d.licenseNumber === 'string' && d.licenseNumber.trim()) ||
            '';
          const phone =
            (typeof d.phone === 'string' && d.phone.trim()) ||
            (typeof d.mobile === 'string' && d.mobile.trim()) ||
            '';

          return {
            id: String(d.id ?? ''),
            full_name: fullName || undefined,
            first_name: String(d.first_name ?? names.first ?? ''),
            last_name: String(d.last_name ?? names.last ?? ''),
            email: typeof d.email === 'string' ? d.email : '',
            phone,
            license_number: licenseNumber,
            is_approved: isApproved,
            status,
            created_at: String(d.created_at ?? ''),
            message: typeof d.message === 'string' ? d.message : undefined,
          };
        });

      const nextDrivers = (rawDrivers as any[])
        .filter((d) => d && typeof d === 'object' && isDriverRecord(d))
        .map((d) => ({
          id: String(d.id ?? ''),
          name: normalizeDriverName(d),
          phone: String(d.phone ?? d.mobile ?? ''),
          email: typeof d.email === 'string' ? d.email : undefined,
          vehicle_plate: typeof d.vehicle_plate === 'string' ? d.vehicle_plate : undefined,
          vehicle_model: typeof d.vehicle_model === 'string' ? d.vehicle_model : undefined,
          status: typeof d.status === 'string' ? d.status : undefined,
          created_at: typeof d.created_at === 'string' ? d.created_at : undefined,
        }));

      const nextUsers = (Array.isArray(usersData) ? usersData : []).map((u: any) => ({
        id: String(u?.id ?? ''),
        phone: String(u?.phone ?? ''),
        email: typeof u?.email === 'string' ? u.email : null,
        full_name: typeof u?.full_name === 'string' ? u.full_name : null,
        role: String(u?.role ?? ''),
        is_active: Boolean(u?.is_active),
      }));

      setUsers(nextUsers);
      setDriverApplications(nextDriverApplications);
      setDrivers(nextDrivers);
      setStats({
        totalUsers: nextUsers.length,
        totalDriverApplications: nextDriverApplications.length,
        totalDrivers: nextDrivers.length,
        activeOffers,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set fallback data on error
      setUsers([]);
      setDriverApplications([]);
      setDrivers([]);
      setStats({
        totalUsers: 0,
        totalDriverApplications: 0,
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
          <p className="text-gray-600 dark:text-gray-300 mb-4">You do not have permission to view this page.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    { title: 'Total Users', value: (stats?.totalUsers || 0).toString(), change: '+12%', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { title: 'Total Drivers', value: (stats?.totalDrivers || 0).toString(), change: '+8%', icon: Car, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Driver Applications', value: (stats?.totalDriverApplications || 0).toString(), change: '+5%', icon: FileText, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { title: 'Active Offers', value: (stats?.activeOffers || 0).toString(), change: '+15%', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'drivers', name: 'Driver Applications', icon: Car },
    { id: 'driversManagement', name: 'Drivers', icon: Car },
    { id: 'vehicles', name: 'Vehicle Management', icon: Car },
    { id: 'fares', name: 'Fare Management', icon: MapPin },
    { id: 'bookings', name: 'Booking Management', icon: Calendar },
    { id: 'offers', name: 'Offers & Promotions', icon: Calendar },
  ];
  const driverStatusOptions = ['active', 'busy', 'offline', 'suspended', 'terminated', 'on_hold'];

  const handleUserActiveChange = async (userId: string, is_active: boolean) => {
    try {
      if (is_active) {
        await apiClient.activateUser(userId);
      } else {
        await apiClient.deactivateUser(userId);
      }
      
      // Update local state
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, is_active } : user)));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDriverAction = async (driverId: string, action: 'approve' | 'reject' | 'review') => {
    try {
      if (action === 'approve' || action === 'reject') {
        const is_approved = action === 'approve';
        await apiClient.updateDriverApplicationStatus(driverId, action);
        const nextStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
        
        // Update local state
        setDriverApplications((prev) =>
          prev.map((driver) =>
            driver.id === driverId
              ? { ...driver, is_approved, status: nextStatus }
              : driver
          )
        );
        setSelectedDriver((prev) =>
          prev && prev.id === driverId ? { ...prev, is_approved, status: nextStatus } : prev
        );
        if (action === 'approve') {
          fetchData();
        }
      }
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  };

  const openCreateDriver = () => {
    setDriverMgmtMode('create');
    setDriverMgmtForm({
      id: '',
      name: '',
      phone: '',
      vehicle_plate: '',
      vehicle_model: '',
      status: 'offline',
    });
    setDriverMgmtError(null);
    setShowDriverMgmtModal(true);
  };

  const openEditDriver = (driver: { id: string; name: string; phone: string; vehicle_plate?: string; vehicle_model?: string; status?: string }) => {
    setDriverMgmtMode('edit');
    setDriverMgmtForm({
      id: driver.id,
      name: driver.name || '',
      phone: driver.phone || '',
      vehicle_plate: driver.vehicle_plate || '',
      vehicle_model: driver.vehicle_model || '',
      status: driver.status || 'offline',
    });
    setDriverMgmtError(null);
    setShowDriverMgmtModal(true);
  };

  const handleDriverMgmtSave = async () => {
    try {
      setDriverMgmtSaving(true);
      setDriverMgmtError(null);
      const payload = {
        name: driverMgmtForm.name.trim(),
        phone: driverMgmtForm.phone.trim(),
        vehicle_plate: driverMgmtForm.vehicle_plate.trim(),
        vehicle_model: driverMgmtForm.vehicle_model.trim() || null,
        status: driverMgmtForm.status,
      };

      if (driverMgmtMode === 'create') {
        await apiClient.createDriver(payload);
      } else {
        await apiClient.updateDriver(driverMgmtForm.id, payload);
      }

      setShowDriverMgmtModal(false);
      fetchData();
    } catch (error) {
      setDriverMgmtError(error instanceof Error ? error.message : 'Failed to save driver');
    } finally {
      setDriverMgmtSaving(false);
    }
  };

  const handleDriverDelete = async (driverId: string) => {
    const confirmed = window.confirm('Delete this driver? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await apiClient.deleteDriver(driverId);
      setDrivers((prev) => prev.filter((driver) => driver.id !== driverId));
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  // Pagination logic
  const usersTotalPages = Math.ceil(users.length / itemsPerPage);
  const usersStartIndex = (usersPage - 1) * itemsPerPage;
  const usersEndIndex = usersStartIndex + itemsPerPage;
  const currentUsers = users.slice(usersStartIndex, usersEndIndex);

  const driverApplicationsTotalPages = Math.ceil(driverApplications.length / itemsPerPage);
  const driverApplicationsStartIndex = (driversPage - 1) * itemsPerPage;
  const driverApplicationsEndIndex = driverApplicationsStartIndex + itemsPerPage;
  const currentDriverApplications = driverApplications.slice(
    driverApplicationsStartIndex,
    driverApplicationsEndIndex
  );

  const driversTotalPages = Math.ceil(drivers.length / itemsPerPage);
  const driversStartIndex = (driversMgmtPage - 1) * itemsPerPage;
  const driversEndIndex = driversStartIndex + itemsPerPage;
  const currentDrivers = drivers.slice(driversStartIndex, driversEndIndex);

  const goToUsersPage = (page: number) => {
    setUsersPage(Math.max(1, Math.min(page, usersTotalPages)));
  };

  const goToDriversPage = (page: number) => {
    setDriversPage(Math.max(1, Math.min(page, driverApplicationsTotalPages)));
  };

  const goToDriversMgmtPage = (page: number) => {
    setDriversMgmtPage(Math.max(1, Math.min(page, driversTotalPages)));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 relative overflow-hidden isolate">
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
                      <div key={user.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.full_name || user.phone}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || user.phone}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
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
                    {driverApplications.slice(0, 3).map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {driver.license_number || driver.phone || '—'}
                          </p>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name || user.phone}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email || user.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {setSelectedUser(user); setShowUserModal(true);}}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {user.is_active ? (
                              <button
                                onClick={() => handleUserActiveChange(user.id, false)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserActiveChange(user.id, true)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">License</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentDriverApplications.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {driver.full_name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{driver.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {driver.phone || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {driver.license_number || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const statusValue = String(driver.status ?? (driver.is_approved ? 'APPROVED' : 'PENDING'));
                            const normalized = statusValue.trim().toLowerCase();
                            const isApproved = normalized === 'approved';
                            const isRejected = normalized === 'rejected';
                            const badgeClass = isApproved
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : isRejected
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                            return (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                                {statusValue}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {driver.created_at ? new Date(driver.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDriver(driver);
                                setShowDriverModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(() => {
                              const normalized = String(driver.status ?? '').trim().toLowerCase();
                              const isApproved = normalized === 'approved';
                              const isRejected = normalized === 'rejected';
                              if (isApproved || isRejected) return null;
                              return (
                                <>
                                  <button
                                    onClick={() => handleDriverAction(driver.id, 'approve')}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDriverAction(driver.id, 'reject')}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Drivers Pagination */}
              {driverApplications.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    Showing {driverApplicationsStartIndex + 1} to {Math.min(driverApplicationsEndIndex, driverApplications.length)} of {driverApplications.length} applications
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToDriversPage(driversPage - 1)}
                      disabled={driversPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    {Array.from({ length: driverApplicationsTotalPages }, (_, i) => i + 1).map((page) => (
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
                      disabled={driversPage === driverApplicationsTotalPages}
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

        {/* Drivers Management Tab */}
        {activeTab === 'driversManagement' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Drivers</h3>
                <button
                  onClick={openCreateDriver}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Add Driver
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Driver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currentDrivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{driver.name}</div>
                            {driver.email && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">{driver.email}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {driver.phone || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {[driver.vehicle_model, driver.vehicle_plate].filter(Boolean).join(' • ') || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const statusValue = String(driver.status ?? 'UNKNOWN');
                            const normalized = statusValue.trim().toLowerCase();
                            const badgeClass =
                              normalized === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : normalized === 'busy'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : normalized === 'offline'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                : normalized === 'suspended'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : normalized === 'terminated'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : normalized === 'on_hold'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
                            return (
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                                {statusValue}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {driver.created_at ? new Date(driver.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditDriver(driver)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDriverDelete(driver.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {drivers.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    Showing {driversStartIndex + 1} to {Math.min(driversEndIndex, drivers.length)} of {drivers.length} drivers
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => goToDriversMgmtPage(driversMgmtPage - 1)}
                      disabled={driversMgmtPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: driversTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToDriversMgmtPage(page)}
                        className={`px-3 py-1 text-sm rounded ${
                          driversMgmtPage === page
                            ? 'bg-red-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => goToDriversMgmtPage(driversMgmtPage + 1)}
                      disabled={driversMgmtPage === driversTotalPages}
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
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.full_name || selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.email || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.is_active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                {selectedUser.is_active ? (
                  <button
                    onClick={() => {
                      handleUserActiveChange(selectedUser.id, false);
                      setShowUserModal(false);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUserActiveChange(selectedUser.id, true);
                      setShowUserModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                  >
                    Activate
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
        {showDriverMgmtModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {driverMgmtMode === 'create' ? 'Add Driver' : 'Driver Details'}
                </h3>
                <button
                  onClick={() => setShowDriverMgmtModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <input
                    value={driverMgmtForm.name}
                    onChange={(e) => setDriverMgmtForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <input
                    value={driverMgmtForm.phone}
                    onChange={(e) => setDriverMgmtForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Plate</label>
                  <input
                    value={driverMgmtForm.vehicle_plate}
                    onChange={(e) => setDriverMgmtForm((prev) => ({ ...prev, vehicle_plate: e.target.value.toUpperCase() }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicle Model</label>
                  <input
                    value={driverMgmtForm.vehicle_model}
                    onChange={(e) => setDriverMgmtForm((prev) => ({ ...prev, vehicle_model: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <select
                    value={driverMgmtForm.status}
                    onChange={(e) => setDriverMgmtForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    {driverStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                {driverMgmtError && (
                  <div className="text-sm text-red-600 dark:text-red-400">{driverMgmtError}</div>
                )}
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleDriverMgmtSave}
                  disabled={driverMgmtSaving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {driverMgmtSaving ? 'Saving…' : 'Save'}
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
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6"
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
                  <p className="text-gray-900 dark:text-white">
                    {selectedDriver.full_name ||
                      `${selectedDriver.first_name || ''} ${selectedDriver.last_name || ''}`.trim() ||
                      '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-gray-900 dark:text-white">{selectedDriver.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-gray-900 dark:text-white">{selectedDriver.email || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">License Number</label>
                  <p className="text-gray-900 dark:text-white">{selectedDriver.license_number || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                  <p className="text-gray-900 dark:text-white">
                    {String(selectedDriver.status ?? (selectedDriver.is_approved ? 'APPROVED' : 'PENDING'))}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedDriver.created_at ? new Date(selectedDriver.created_at).toLocaleString() : '—'}
                  </p>
                </div>
                {selectedDriver.message && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</label>
                    <p className="text-gray-900 dark:text-white">{selectedDriver.message}</p>
                  </div>
                )}
              </div>
              {(() => {
                const normalized = String(selectedDriver.status ?? '').trim().toLowerCase();
                const isApproved = normalized === 'approved';
                const isRejected = normalized === 'rejected';
                if (isApproved || isRejected) return null;
                return (
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => handleDriverAction(selectedDriver.id, 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDriverAction(selectedDriver.id, 'reject')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      Reject
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
