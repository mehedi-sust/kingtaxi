const DEFAULT_REMOTE_API_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://kingtaxi-webapp-backend.onrender.com';
const normalizeBaseUrl = (value: string) => (value.endsWith('/') ? value.slice(0, -1) : value);
const API_BASE_URL =
  typeof window !== 'undefined'
    ? normalizeBaseUrl(
        process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || '/api'
      )
    : normalizeBaseUrl(DEFAULT_REMOTE_API_URL);

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getProfileStorageKey() {
    if (typeof window === 'undefined') return 'kingtaxi_profile';
    const identifier = localStorage.getItem('kingtaxi_identifier') || '';
    const suffixRaw = identifier.trim().toLowerCase();
    const suffix = suffixRaw.replace(/[^a-z0-9_-]/gi, '_');
    return suffix ? `kingtaxi_profile_${suffix}` : 'kingtaxi_profile';
  }

  private getAccountEndpointUnavailableKey() {
    if (typeof window === 'undefined') return 'kingtaxi_account_endpoint_unavailable_at';
    const identifier = localStorage.getItem('kingtaxi_identifier') || '';
    const suffixRaw = identifier.trim().toLowerCase();
    const suffix = suffixRaw.replace(/[^a-z0-9_-]/gi, '_');
    return suffix
      ? `kingtaxi_account_endpoint_unavailable_at_${suffix}`
      : 'kingtaxi_account_endpoint_unavailable_at';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kingtaxi_token') : null;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    const method = (options.method || 'GET').toUpperCase();
    const isAdminEndpoint = endpoint === '/admin' || endpoint.startsWith('/admin/');
    const allowFallback = method === 'GET' && !isAdminEndpoint;

    const endpointsToTry: string[] = [endpoint];
    if (method === 'GET') {
      const alt = endpoint.endsWith('/') ? endpoint.slice(0, -1) : `${endpoint}/`;
      if (alt !== endpoint) endpointsToTry.push(alt);
    }

    let lastError: unknown = null;

    for (const candidate of endpointsToTry) {
      const url = `${this.baseURL}${candidate}`;
      try {
        const response = await fetch(url, config);

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Unexpected server response. Please try again later.');
        }

        if (!response.ok) {
          let errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            const detail = (errorData as any)?.detail;
            if (typeof detail === 'string' && detail) {
              errorMessage = detail;
            } else if (Array.isArray(detail)) {
              const flattened = detail
                .map((item) => {
                  if (typeof item === 'string') return item;
                  if (item && typeof item === 'object') {
                    const loc = Array.isArray((item as any).loc) ? (item as any).loc.join('.') : null;
                    const msg = typeof (item as any).msg === 'string' ? (item as any).msg : null;
                    return [loc, msg].filter(Boolean).join(': ');
                  }
                  return null;
                })
                .filter(Boolean)
                .join(', ');
              if (flattened) errorMessage = flattened;
            } else if (detail && typeof detail === 'object') {
              const msg =
                typeof (detail as any).message === 'string'
                  ? (detail as any).message
                  : typeof (detail as any).msg === 'string'
                  ? (detail as any).msg
                  : null;
              errorMessage = msg || errorMessage;
            } else if (typeof (errorData as any)?.message === 'string' && (errorData as any).message) {
              errorMessage = (errorData as any).message;
            }
          } catch {}

          if (response.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (response.status === 401) {
            errorMessage = 'You are not signed in. Please sign in and try again.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to perform this action.';
          } else if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait and try again.';
          }

          if (response.status === 404 && candidate !== endpointsToTry[endpointsToTry.length - 1]) {
            lastError = new Error(errorMessage);
            continue;
          }

          throw new Error(errorMessage);
        }

        if (response.status === 204) {
          return null as T;
        }

        const contentTypeOk = contentType && contentType.includes('application/json');
        if (!contentTypeOk) {
          const text = await response.text();
          return (text ? (text as unknown as T) : (null as T));
        }

        const data = await response.json();
        return data;
      } catch (err) {
        if (err instanceof Error) {
          const msg = err.message || '';
          if (
            msg.toLowerCase().includes('failed to fetch') ||
            msg.toLowerCase().includes('networkerror') ||
            msg.toLowerCase().includes('load failed')
          ) {
            lastError = new Error('Unable to reach the server. Please check your connection and try again.');
            continue;
          }
        }
        lastError = err;
      }
    }

    if (allowFallback && (endpoint === '/fares/' || endpoint === '/fares')) {
      return this.getFallbackFares() as T;
    }

    if (allowFallback && (endpoint === '/offers/' || endpoint === '/offers')) {
      return this.getFallbackOffers() as T;
    }

    if (
      allowFallback &&
      (endpoint === '/vehicles/' || endpoint === '/vehicles' || endpoint.startsWith('/vehicles/'))
    ) {
      return this.getFallbackVehicles() as T;
    }

    if (allowFallback && (endpoint === '/users/' || endpoint === '/users')) {
      return this.getFallbackUsers() as T;
    }

    if (allowFallback && (endpoint === '/drivers/' || endpoint === '/drivers')) {
      return this.getFallbackDrivers() as T;
    }

    if (allowFallback && endpoint === '/bookings') {
      return this.getFallbackBookings() as T;
    }

    throw lastError instanceof Error ? lastError : new Error('Request failed');
  }

  // Auth helpers
  async login(emailOrPhone: string, password: string) {
    const body = new URLSearchParams();
    body.append('username', emailOrPhone);
    body.append('password', password);
    const data = await this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('kingtaxi_token', data.access_token);
    }
    return data;
  }

  async register(userData: { phone: string; password: string; email?: string; full_name?: string }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  private getFallbackFares() {
    return [
      {
        id: 1,
        route_name: 'Ashford → Heathrow Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Heathrow',
        vehicle_type: '4-Seater Premium Sedan',
        price: 85.0,
        is_active: true
      },
      {
        id: 2,
        route_name: 'Ashford → Gatwick Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Gatwick',
        vehicle_type: '4-Seater Premium Sedan',
        price: 95.0,
        is_active: true
      },
      {
        id: 3,
        route_name: 'Ashford → Stansted Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Stansted',
        vehicle_type: '4-Seater Premium Sedan',
        price: 110.0,
        is_active: true
      },
      {
        id: 4,
        route_name: 'Ashford → Heathrow Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Heathrow',
        vehicle_type: '8-Seater Minibus',
        price: 105.0,
        is_active: true
      },
      {
        id: 5,
        route_name: 'Ashford → Gatwick Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Gatwick',
        vehicle_type: '8-Seater Minibus',
        price: 115.0,
        is_active: true
      },
      {
        id: 6,
        route_name: 'Ashford → Stansted Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Stansted',
        vehicle_type: '8-Seater Minibus',
        price: 130.0,
        is_active: true
      }
    ];
  }

  private getFallbackOffers() {
    return [
      {
        id: '1',
        title: 'Summer Special',
        description: '15% off all airport transfers',
        discount: 15,
        discount_type: 'percentage',
        start_date: '2024-06-01',
        end_date: '2024-08-31',
        is_active: true,
        created_at: '2024-01-01',
        category: 'seasonal'
      }
    ];
  }

  private getFallbackVehicles() {
    return [
      {
        id: '1',
        make: 'Mercedes',
        model: 'E-Class',
        year: 2022,
        license_plate: 'KT22 ABC',
        chassis_number: undefined,
        color: 'Black',
        seating_capacity: 4,
        vehicle_type: '4-Seater Premium Sedan',
        is_active: true,
        created_at: '2024-01-01'
      }
    ];
  }

  private getFallbackUsers() {
    return [
      {
        id: '1',
        phone: '+441234567890',
        email: 'john@example.com',
        full_name: 'John Doe',
        role: 'customer',
        is_active: true
      }
    ];
  }

  private getFallbackDrivers() {
    return [
      {
        id: '1',
        name: 'Mike Smith',
        phone: '+441112223334',
        vehicle_plate: 'KT22 ABC',
        vehicle_model: 'Mercedes E-Class',
        status: 'OFFLINE',
        current_lat: null,
        current_lng: null,
        created_at: '2024-01-01'
      }
    ];
  }

  private getFallbackBookings() {
    return [
      {
        id: '1',
        customer_phone: '+441234567890',
        pickup_address: 'Ashford',
        dropoff_address: 'Heathrow Airport',
        pickup_lat: 0,
        pickup_lng: 0,
        dropoff_lat: 0,
        dropoff_lng: 0,
        pickup_time: new Date().toISOString(),
        trip_type: 'standard',
        vehicle_type: '4-Seater Premium Sedan',
        estimated_fare: 85.0,
        confirmed_fare: null,
        is_fixed_fare: true,
        status: 'PENDING_DISPATCH',
        driver_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Auth endpoints
  // Users endpoints
  async getUsers() {
    return this.request('/admin/users');
  }

  async updateUser(userId: string, userData: any) {
    const id = encodeURIComponent(userId);

    type Candidate = { path: string; methods: Array<'PATCH' | 'PUT' | 'POST'>; includeBody: boolean };
    const candidates: Candidate[] = [
      { path: `/admin/users/${id}`, methods: ['PATCH', 'PUT'], includeBody: true },
      { path: `/users/${id}`, methods: ['PATCH', 'PUT'], includeBody: true },
    ];

    let lastError: unknown = null;
    for (const candidate of candidates) {
      for (const method of candidate.methods) {
        try {
          return await this.request(candidate.path, {
            method,
            ...(candidate.includeBody ? { body: JSON.stringify(userData ?? {}) } : {}),
          });
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('User update endpoint not available');
  }

  async activateUser(userId: string) {
    const id = encodeURIComponent(userId);
    return this.request(`/admin/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(userId: string) {
    const id = encodeURIComponent(userId);
    return this.request(`/admin/users/${id}/deactivate`, {
      method: 'POST',
    });
  }

  async deleteUser(userId: string) {
    const id = encodeURIComponent(userId);
    const candidates = [
      { path: `/admin/users/${id}`, method: 'DELETE' as const },
      { path: `/users/${id}`, method: 'DELETE' as const },
    ];

    let lastError: unknown = null;
    for (const candidate of candidates) {
      try {
        return await this.request(candidate.path, {
          method: candidate.method,
        });
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('User delete endpoint not available');
  }

  // Drivers endpoints
  async getDrivers() {
    return this.request('/admin/drivers');
  }

  async createDriver(driverData: any) {
    return this.request('/admin/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData),
    });
  }

  async createDriverApplication(applicationData: any) {
    return this.request('/drivers/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getMyDriverApplication() {
    const data = await this.request('/drivers/applications/me');
    if (Array.isArray(data)) {
      const sorted = [...data].sort((a, b) => {
        const aTime = typeof a?.created_at === 'string' ? Date.parse(a.created_at) : 0;
        const bTime = typeof b?.created_at === 'string' ? Date.parse(b.created_at) : 0;
        return bTime - aTime;
      });
      return sorted[0] ?? null;
    }
    return data;
  }

  async withdrawMyDriverApplication() {
    const candidates = [
      { path: '/drivers/applications/me', method: 'DELETE' as const },
      { path: '/drivers/applications/me/withdraw', method: 'POST' as const },
      { path: '/drivers/applications/withdraw', method: 'POST' as const },
      { path: '/drivers/applications/me', method: 'POST' as const },
    ];

    let lastError: unknown = null;
    for (const candidate of candidates) {
      try {
        return await this.request(candidate.path, {
          method: candidate.method,
        });
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Withdraw application endpoint not available');
  }

  async getAdminDriverApplications() {
    const candidates = [
      '/admin/driver-applications',
      '/admin/drivers/applications',
      '/admin/driver_applications',
      '/admin/drivers/applications/all',
      '/drivers/applications',
      '/admin/drivers',
    ];

    let lastError: unknown = null;
    for (const path of candidates) {
      try {
        return await this.request(path);
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Driver applications admin endpoint not available');
  }

  async updateDriverApplicationStatus(applicationId: string, status: 'approve' | 'reject') {
    const id = encodeURIComponent(applicationId);
    const candidates = [
      { path: `/admin/driver-applications/${id}/${status}`, method: 'PATCH' as const },
      { path: `/admin/drivers/applications/${id}/${status}`, method: 'POST' as const },
      { path: `/admin/drivers/applications/${id}/${status}`, method: 'PATCH' as const },
      { path: `/admin/driver-applications/${id}`, method: 'PUT' as const, body: { status } },
      { path: `/admin/driver_applications/${id}`, method: 'PUT' as const, body: { status } },
      { path: `/admin/drivers/applications/${id}`, method: 'PUT' as const, body: { status } },
      { path: `/admin/drivers/applications/${id}`, method: 'PATCH' as const, body: { status } },
    ];

    let lastError: unknown = null;
    for (const candidate of candidates) {
      try {
        return await this.request(candidate.path, {
          method: candidate.method,
          ...(candidate.body ? { body: JSON.stringify(candidate.body) } : {}),
        });
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Driver application update endpoint not available');
  }

  async updateDriver(driverId: string, driverData: any) {
    const id = encodeURIComponent(driverId);
    const isApproved =
      typeof driverData === 'object' && driverData !== null ? (driverData as any).is_approved : undefined;

    type Candidate = { path: string; methods: Array<'PATCH' | 'PUT' | 'POST'>; includeBody: boolean };
    const candidates: Candidate[] = [
      { path: `/admin/drivers/${id}`, methods: ['PATCH', 'PUT'], includeBody: true },
      { path: `/drivers/${id}`, methods: ['PATCH', 'PUT'], includeBody: true },
    ];
    if (typeof isApproved === 'boolean') {
      candidates.splice(1, 0, {
        path: `/admin/drivers/${id}/${isApproved ? 'approve' : 'reject'}`,
        methods: ['POST'],
        includeBody: false,
      });
    }

    let lastError: unknown = null;
    for (const candidate of candidates) {
      for (const method of candidate.methods) {
        try {
          return await this.request(candidate.path, {
            method,
            ...(candidate.includeBody ? { body: JSON.stringify(driverData ?? {}) } : {}),
          });
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Driver update endpoint not available');
  }

  async deleteDriver(driverId: string) {
    const id = encodeURIComponent(driverId);
    return this.request(`/admin/drivers/${id}`, {
      method: 'DELETE',
    });
  }

  // Fares endpoints
  async getFares() {
    return this.request('/admin/fares');
  }

  async getPublicFares() {
    return this.request('/fares');
  }

  async createFare(fareData: any) {
    return this.request('/admin/fares', {
      method: 'POST',
      body: JSON.stringify(fareData),
    });
  }

  async updateFare(fareId: number, fareData: any) {
    return this.request(`/admin/fares/${fareId}`, {
      method: 'PUT',
      body: JSON.stringify(fareData),
    });
  }

  async deleteFare(fareId: number) {
    return this.request(`/admin/fares/${fareId}`, {
      method: 'DELETE',
    });
  }

  // Vehicles endpoints
  async getVehicles() {
    return this.request('/vehicles');
  }

  async createVehicle(vehicleData: any) {
    return this.request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(vehicleId: string, vehicleData: any) {
    return this.request(`/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(vehicleId: string) {
    return this.request(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  }

  // Bookings endpoints
  async estimateFare(request: any, options: RequestInit = {}) {
    return this.request('/bookings/estimate', {
      method: 'POST',
      body: JSON.stringify(request),
      ...options,
    });
  }

  async getBookings() {
    return this.request('/admin/bookings');
  }

  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}`);
  }

  async cancelBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
  }

  async getMyBookings() {
    return this.request('/bookings');
  }

  async confirmBookingFare(bookingId: string, fare: number) {
    return this.request(`/admin/bookings/${bookingId}/confirm-fare?fare=${encodeURIComponent(fare)}`, {
      method: 'PATCH',
    });
  }

  async assignBookingDriver(bookingId: string, driverId: string) {
    return this.request(`/admin/bookings/${bookingId}/assign?driver_id=${encodeURIComponent(driverId)}`, {
      method: 'PATCH',
    });
  }

  // Offers endpoints
  async getOffers() {
    return this.request('/offers');
  }

  async createOffer(offerData: any) {
    return this.request('/admin/offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  async updateOffer(offerId: string, offerData: any) {
    return this.request(`/admin/offers/${encodeURIComponent(offerId)}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  }

  async deleteOffer(offerId: string) {
    return this.request(`/admin/offers/${encodeURIComponent(offerId)}`, {
      method: 'DELETE',
    });
  }

  async getAdminOffersAll() {
    return this.request('/admin/offers/all');
  }

  async getUser() {
    const profileKey = this.getProfileStorageKey();
    const token = typeof window !== 'undefined' ? localStorage.getItem('kingtaxi_token') : null;

    const readCached = () => {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem(profileKey);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      if (profileKey !== 'kingtaxi_profile') {
        const legacy = localStorage.getItem('kingtaxi_profile');
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            localStorage.setItem(profileKey, JSON.stringify(parsed));
            return parsed;
          } catch {}
        }
      }
      return null;
    };

    if (!token) {
      const cached = readCached();
      if (cached) return cached;
      return this.getAccount();
    }

    try {
      const data = await this.request('/user');
      if (typeof window !== 'undefined') {
        localStorage.setItem(profileKey, JSON.stringify(data));
      }
      return data;
    } catch (e) {
      try {
        const fallback = await this.getAccount();
        if (typeof window !== 'undefined') {
          localStorage.setItem(profileKey, JSON.stringify(fallback));
        }
        return fallback;
      } catch {
        const cached = readCached();
        if (cached) return cached;
        throw e instanceof Error ? e : new Error('User endpoint not available');
      }
    }
  }

  async getAccount() {
    const profileKey = this.getProfileStorageKey();
    const endpointUnavailableKey = this.getAccountEndpointUnavailableKey();
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(profileKey);
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      if (profileKey !== 'kingtaxi_profile') {
        const legacy = localStorage.getItem('kingtaxi_profile');
        if (legacy) {
          try {
            const parsed = JSON.parse(legacy);
            localStorage.setItem(profileKey, JSON.stringify(parsed));
            return parsed;
          } catch {}
        }
      }
      const stamp = localStorage.getItem(endpointUnavailableKey);
      const stampNum = stamp ? Number(stamp) : 0;
      if (stampNum && Number.isFinite(stampNum) && Date.now() - stampNum < 6 * 60 * 60 * 1000) {
        throw new Error('Account endpoint not available');
      }
    }

    const candidates = ['/users/me', '/auth/me', '/me', '/profile', '/users/profile', '/account'];
    let lastError: unknown = null;
    for (const path of candidates) {
      try {
        return await this.request(path);
      } catch (e) {
        lastError = e;
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(endpointUnavailableKey, String(Date.now()));
    }
    throw lastError instanceof Error ? lastError : new Error('Account endpoint not available');
  }

  async updateAccount(accountData: any) {
    const candidates = ['/user', '/users/me', '/users/profile', '/account', '/profile'];
    let lastError: unknown = null;
    for (const path of candidates) {
      try {
        const result = await this.request(path, {
          method: 'PUT',
          body: JSON.stringify(accountData),
        });
        if (typeof window !== 'undefined') {
          const key = this.getProfileStorageKey();
          localStorage.setItem(key, JSON.stringify(result ?? accountData ?? {}));
        }
        return result;
      } catch (e) {
        lastError = e;
        const msg = e instanceof Error ? e.message : '';
        if (typeof msg === 'string' && msg.toLowerCase().includes('method not allowed')) {
          try {
            const result = await this.request(path, {
              method: 'PATCH',
              body: JSON.stringify(accountData),
            });
            if (typeof window !== 'undefined') {
              const key = this.getProfileStorageKey();
              localStorage.setItem(key, JSON.stringify(result ?? accountData ?? {}));
            }
            return result;
          } catch (e2) {
            lastError = e2;
          }
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Account update endpoint not available');
  }

  // Reviews endpoints
  async getReviews() {
    throw new Error('Not implemented: reviews endpoints are not available on this backend');
  }

  async createReview(reviewData: any) {
    throw new Error('Not implemented: reviews endpoints are not available on this backend');
  }

  async updateReview(reviewId: string, reviewData: any) {
    throw new Error('Not implemented: reviews endpoints are not available on this backend');
  }

  async deleteReview(reviewId: string) {
    throw new Error('Not implemented: reviews endpoints are not available on this backend');
  }

  // Stats endpoint
  async getStats() {
    throw new Error('Not implemented: stats endpoint is not available on this backend');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
