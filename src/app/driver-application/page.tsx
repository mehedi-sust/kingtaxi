'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle,
  Car,
  Clock,
  Shield,
  Award
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type AddressSuggestion = {
  label: string;
  lat: number;
  lon: number;
};

function profileStorageKey(identifier: string | undefined) {
  const raw = (identifier || '').trim().toLowerCase();
  const safe = raw.replace(/[^a-z0-9_-]/gi, '_');
  return safe ? `kingtaxi_profile_${safe}` : 'kingtaxi_profile';
}

export default function DriverApplication() {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    license_number: '',
    experience: '',
    availability: '',
    vehicle_owned: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_plate: '',
    vehicle_color: '',
    message: '',
  });

  const [application, setApplication] = useState<any | null>(null);
  const [applicationLoaded, setApplicationLoaded] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  const lookupAddressSuggestions = async (query: string) => {
    const value = query.trim();
    if (value.length < 3) return [];
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data
      .map((item: any) => ({
        label: String(item?.display_name || ''),
        lat: Number(item?.lat),
        lon: Number(item?.lon),
      }))
      .filter((item: AddressSuggestion) => item.label && Number.isFinite(item.lat) && Number.isFinite(item.lon))
      .slice(0, 6);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const identifier = user?.identifier ?? '';
    const looksLikeEmail = identifier.includes('@');

    const applyPrefill = (account: any) => {
      if (cancelled) return;

      const firstName = typeof account?.first_name === 'string' ? account.first_name : '';
      const lastName = typeof account?.last_name === 'string' ? account.last_name : '';
      const fullNameFromParts = [firstName, lastName].filter(Boolean).join(' ').trim();

      const fullName =
        (typeof account?.full_name === 'string' && account.full_name) ||
        (typeof account?.fullName === 'string' && account.fullName) ||
        (typeof account?.name === 'string' && account.name) ||
        (fullNameFromParts || '');
      const email =
        (typeof account?.email === 'string' && account.email) || (looksLikeEmail ? identifier : '');
      const phone =
        (typeof account?.phone === 'string' && account.phone) ||
        (typeof account?.phone_number === 'string' && account.phone_number) ||
        (typeof account?.mobile === 'string' && account.mobile) ||
        (typeof account?.mobile_number === 'string' && account.mobile_number) ||
        (!looksLikeEmail ? identifier : '');

      setFormData((prev) => ({
        ...prev,
        name: prev.name || (typeof fullName === 'string' ? fullName : ''),
        email: prev.email || email,
        phone: prev.phone || phone,
      }));
    };

    const load = async () => {
      try {
        const data = await apiClient.getUser();
        applyPrefill(data);
        return;
      } catch {}

      try {
        const key = profileStorageKey(identifier);
        const raw = localStorage.getItem(key) ?? localStorage.getItem('kingtaxi_profile');
        if (!raw) return;
        applyPrefill(JSON.parse(raw));
      } catch {}
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.identifier]);

  useEffect(() => {
    if (!isAuthenticated) {
      setApplication(null);
      setApplicationLoaded(true);
      return;
    }

    let cancelled = false;
    setApplicationLoaded(false);

    const load = async () => {
      try {
        const data = await apiClient.getMyDriverApplication();
        if (cancelled) return;
        if (data && typeof data === 'object') {
          setApplication(data);
        } else {
          setApplication(null);
        }
      } catch {
        if (cancelled) return;
        setApplication(null);
      } finally {
        if (cancelled) return;
        setApplicationLoaded(true);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const query = formData.address.trim();
      if (query.length < 3) {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
        return;
      }
      const items = await lookupAddressSuggestions(query);
      if (cancelled) return;
      setAddressSuggestions(items);
      setShowAddressSuggestions(items.length > 0);
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [formData.address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const hasVehicle =
        formData.vehicle_owned === 'Yes - suitable for taxi work' ||
        formData.vehicle_owned === 'Yes - but needs inspection';
      const payload = {
        name: String(formData.name || '').trim(),
        phone: String(formData.phone || '').trim(),
        email: String(formData.email || '').trim(),
        address: String(formData.address || '').trim(),
        date_of_birth: String(formData.date_of_birth || '').trim() || undefined,
        license_number: String(formData.license_number || '').trim(),
        experience: String(formData.experience || '').trim(),
        availability: String(formData.availability || '').trim(),
        message: String(formData.message || '').trim() || undefined,
        ...(hasVehicle
          ? {
              vehicle_make: String(formData.vehicle_make || '').trim(),
              vehicle_model: String(formData.vehicle_model || '').trim(),
              vehicle_year: formData.vehicle_year ? Number(formData.vehicle_year) : undefined,
              vehicle_plate: String(formData.vehicle_plate || '').trim(),
              vehicle_color: String(formData.vehicle_color || '').trim(),
            }
          : {}),
      };

      await apiClient.createDriverApplication(payload);
      try {
        const next = await apiClient.getMyDriverApplication();
        setApplication(next);
      } catch {
        setSubmitted(true);
      }
      setSubmitted(true);
    } catch (error) {
      console.error('Driver application error:', error);
      setStatusMessage({
        type: 'error',
        text: `Application failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setStatusMessage(null);
    try {
      await apiClient.withdrawMyDriverApplication();
      setApplication(null);
      setSubmitted(false);
      setStatusMessage({ type: 'success', text: 'Your application has been withdrawn.' });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: `Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const normalizeStatus = (input: any) => String(input ?? '').trim().toLowerCase();
  const applicationStatus = normalizeStatus(application?.status);
  const isAccepted =
    application?.is_approved === true ||
    applicationStatus === 'approved' ||
    applicationStatus === 'accepted' ||
    applicationStatus === 'active';

  const benefits = [
    {
      icon: Clock,
      title: 'Flexible Hours',
      description: 'Work when it suits you - full-time, part-time, or weekends only.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Award,
      title: 'Competitive Rates',
      description: 'Earn excellent rates with bonus opportunities and incentives.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Shield,
      title: 'Full Support',
      description: 'Comprehensive training, ongoing support, and insurance coverage.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Car,
      title: 'Modern Fleet',
      description: 'Drive well-maintained, modern vehicles with regular servicing.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const requirements = [
    'Valid UK driving license (minimum 3 years)',
    'Clean driving record with no major violations',
    'CRB/DBS check (we can arrange this)',
    'Good knowledge of local area',
    'Professional appearance and attitude',
    'Excellent customer service skills',
    'Reliable and punctual',
    'Basic English communication skills',
  ];

  if (isAuthenticated && !applicationLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your application status...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isAccepted ? 'bg-green-100' : 'bg-blue-100'}`}>
              <CheckCircle className={`w-8 h-8 ${isAccepted ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You already applied</h2>
            <p className="text-gray-600 dark:text-gray-300">
              This is your current driver application status.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border px-4 py-3 text-sm ${
                  statusMessage.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                }`}
              >
                {statusMessage.text}
              </motion.div>
            )}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-300">Status</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {String(application?.status ?? (application?.is_approved ? 'approved' : 'submitted'))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {isAccepted ? (
                <Link
                  href="/driver-dashboard"
                  className="flex-1 inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Go to Driver Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className="flex-1 inline-flex items-center justify-center border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {withdrawing ? 'Withdrawing…' : 'Withdraw Application'}
                  </button>
                  <Link
                    href="/"
                    className="flex-1 inline-flex items-center justify-center bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Return to Home
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Application Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for your interest in joining King Taxi! Your driver application has been submitted successfully. 
            Our recruitment team will review your application and contact you within 48 hours.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 text-left">
              <li>• Application review (1-2 days)</li>
              <li>• Phone interview</li>
              <li>• CRB/DBS check</li>
              <li>• Vehicle inspection (if applicable)</li>
              <li>• Training and onboarding</li>
            </ul>
          </div>
          <Link
            href="/"
            className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Return to Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-white dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join Our <span className="text-red-600">Driving Team</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Be part of a professional team that values quality, reliability, and excellent customer service. 
              Start your journey with King Taxi today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Why Drive with King Taxi?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join a company that cares about its drivers and provides excellent working conditions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${benefit.bgColor} rounded-full mb-6`}>
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Driver Application Form</h2>
                  <p className="text-gray-600 dark:text-gray-300">Fill out the form below to apply for a driving position with King Taxi.</p>
                </div>

                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                      statusMessage.type === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    }`}
                  >
                    {statusMessage.text}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter your mobile number"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        onFocus={() => setShowAddressSuggestions(addressSuggestions.length > 0)}
                        onBlur={() => {
                          window.setTimeout(() => setShowAddressSuggestions(false), 120);
                        }}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your full address"
                      />
                      {showAddressSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg max-h-56 overflow-y-auto">
                          {addressSuggestions.map((item, index) => (
                            <button
                              key={`${item.label}-${index}`}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, address: item.label }));
                                setShowAddressSuggestions(false);
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date of Birth *
                      </label>
                      <div className="relative grid grid-cols-3 gap-2">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                          value={dobDay}
                          onChange={(e) => {
                            const day = e.target.value;
                            setDobDay(day);
                            setFormData((prev) => ({
                              ...prev,
                              date_of_birth: dobYear && dobMonth && day ? `${dobYear}-${dobMonth}-${day}` : '',
                            }));
                          }}
                          required
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <option key={day} value={String(day).padStart(2, '0')}>
                              {day}
                            </option>
                          ))}
                        </select>
                        <select
                          value={dobMonth}
                          onChange={(e) => {
                            const month = e.target.value;
                            setDobMonth(month);
                            setFormData((prev) => ({
                              ...prev,
                              date_of_birth: dobYear && month && dobDay ? `${dobYear}-${month}-${dobDay}` : '',
                            }));
                          }}
                          required
                          className="w-full pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <option key={month} value={String(month).padStart(2, '0')}>
                              {new Date(2000, month - 1, 1).toLocaleString('en-GB', { month: 'short' })}
                            </option>
                          ))}
                        </select>
                        <select
                          value={dobYear}
                          onChange={(e) => {
                            const year = e.target.value;
                            setDobYear(year);
                            setFormData((prev) => ({
                              ...prev,
                              date_of_birth: year && dobMonth && dobDay ? `${year}-${dobMonth}-${dobDay}` : '',
                            }));
                          }}
                          required
                          className="w-full pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i).map((year) => (
                            <option key={year} value={String(year)}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use Day / Month / Year selectors for faster year selection.</p>
                    </div>

                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Driving License Number *
                      </label>
                      <input
                        type="text"
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.license_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your license number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Driving Experience *
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select experience</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5-10 years">5-10 years</option>
                        <option value="10+ years">10+ years</option>
                        <option value="Professional driver">Professional driver</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="availability" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Availability *
                      </label>
                      <select
                        id="availability"
                        name="availability"
                        value={formData.availability}
                        onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                        required
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select availability</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Weekends only">Weekends only</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="vehicleOwned" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Do you own a suitable vehicle?
                    </label>
                    <select
                      id="vehicleOwned"
                      name="vehicleOwned"
                      value={formData.vehicle_owned}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicle_owned: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select option</option>
                      <option value="Yes - suitable for taxi work">Yes - suitable for taxi work</option>
                      <option value="Yes - but needs inspection">Yes - but needs inspection</option>
                      <option value="No - need company vehicle">No - need company vehicle</option>
                    </select>
                  </div>

                  {(formData.vehicle_owned === 'Yes - suitable for taxi work' ||
                    formData.vehicle_owned === 'Yes - but needs inspection') && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50 dark:bg-gray-900/40">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="vehicleMake" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Vehicle Make *
                          </label>
                          <input
                            type="text"
                            id="vehicleMake"
                            name="vehicleMake"
                            value={formData.vehicle_make}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_make: e.target.value }))}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g. Toyota"
                          />
                        </div>
                        <div>
                          <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Vehicle Model *
                          </label>
                          <input
                            type="text"
                            id="vehicleModel"
                            name="vehicleModel"
                            value={formData.vehicle_model}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_model: e.target.value }))}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g. Camry"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Vehicle Year *
                          </label>
                          <input
                            type="number"
                            id="vehicleYear"
                            name="vehicleYear"
                            value={formData.vehicle_year}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_year: e.target.value }))}
                            required
                            min="1980"
                            max={new Date().getFullYear() + 1}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                            placeholder="2022"
                          />
                        </div>
                        <div>
                          <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Plate Number *
                          </label>
                          <input
                            type="text"
                            id="vehiclePlate"
                            name="vehiclePlate"
                            value={formData.vehicle_plate}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_plate: e.target.value }))}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                            placeholder="ABC-1234"
                          />
                        </div>
                        <div>
                          <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Vehicle Color *
                          </label>
                          <input
                            type="text"
                            id="vehicleColor"
                            name="vehicleColor"
                            value={formData.vehicle_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, vehicle_color: e.target.value }))}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 dark:bg-gray-700 dark:text-white"
                            placeholder="White"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Information
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200 resize-none dark:bg-gray-700 dark:text-white"
                        placeholder="Tell us about your previous driving experience, why you want to join King Taxi, or any other relevant information..."
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Submitting Application...
                      </div>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Requirements Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-8 sticky top-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Requirements</h3>
                  <div className="space-y-4">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300 ml-3 text-sm">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-xl p-8 text-white">
                  <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                  <p className="mb-6 opacity-90">
                    Have questions about the application process? Our recruitment team is here to help.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <a href="tel:+4401233367357" className="text-sm hover:underline">
                        +44 01233 367 357
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">recruitment@kingtaxi.co.uk</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
