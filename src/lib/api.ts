function normalizeBaseUrl(value: string | undefined): string {
  const normalized = (value || '').trim().replace(/\/+$/, '');
  return normalized;
}

function resolveApiBaseUrl(): string {
  const publicUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  if (publicUrl) return publicUrl;
  return '/api';
}

const API_BASE_URL = resolveApiBaseUrl();
const AUTH_EVENT = 'kingtaxi-auth-changed';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private clearAuthState() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('kingtaxi_token');
    localStorage.removeItem('kingtaxi_identifier');
    localStorage.removeItem('kingtaxi_is_admin');
    window.dispatchEvent(new Event(AUTH_EVENT));
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
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

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      // Check if response is HTML (likely an error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error(`API endpoint returned HTML instead of JSON. Check if the backend is running and the endpoint exists: ${endpoint}`);
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        if (response.status === 401) {
          this.clearAuthState();
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Provide fallback data for development
      if (endpoint === '/offers/') {
        console.warn('Using fallback offers data for development');
        return this.getFallbackOffers() as T;
      }
      
      if (endpoint === '/vehicles/') {
        console.warn('Using fallback vehicles data for development');
        return this.getFallbackVehicles() as T;
      }
      
      if (endpoint === '/users/') {
        console.warn('Using fallback users data for development');
        return this.getFallbackUsers() as T;
      }
      
      if (endpoint === '/drivers/') {
        console.warn('Using fallback drivers data for development');
        return this.getFallbackDrivers() as T;
      }
      
      if (endpoint === '/stats/') {
        console.warn('Using fallback stats data for development');
        return this.getFallbackStats() as T;
      }
      
      throw error;
    }
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
      window.dispatchEvent(new Event(AUTH_EVENT));
    }
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } catch {}
    this.clearAuthState();
    return { message: 'Logged out' };
  }

  async register(userData: { phone: string; password: string; email?: string; full_name?: string }) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async requestPasswordReset(emailOrPhone: string) {
    return this.request('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email_or_phone: emailOrPhone }),
    });
  }

  async verifyPasswordResetCode(emailOrPhone: string, code: string) {
    return this.request('/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email_or_phone: emailOrPhone, code }),
    });
  }

  async resetPassword(emailOrPhone: string, code: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email_or_phone: emailOrPhone,
        code,
        new_password: newPassword,
      }),
    });
  }

  async hasAdminAccess(): Promise<boolean> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('kingtaxi_token') : null;
    if (!token) return false;
    try {
      const response = await fetch(`${this.baseURL}/admin/users?limit=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getUser() {
    return this.request('/user');
  }

  async updateAccount(userData: { email?: string; full_name?: string; phone?: string }) {
    return this.request('/user', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async estimateFare(payload: {
    pickup_address?: string;
    dropoff_address?: string;
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    trip_type?: string;
    pickup_time?: string;
  }) {
    return this.request('/bookings/estimate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  private getFallbackFares() {
    return [
      {
        id: '1',
        from_location: 'Ashford',
        to_location: 'Heathrow Airport',
        vehicle_type: 'FOUR_SEATER',
        price: 85,
        is_active: true
      },
      {
        id: '2',
        from_location: 'Ashford',
        to_location: 'Gatwick Airport',
        vehicle_type: 'FOUR_SEATER',
        price: 95,
        is_active: true
      },
      {
        id: '3',
        from_location: 'Ashford',
        to_location: 'Stansted Airport',
        vehicle_type: 'FOUR_SEATER',
        price: 110,
        is_active: true
      },
      {
        id: '4',
        from_location: 'Ashford',
        to_location: 'Heathrow Airport',
        vehicle_type: 'EIGHT_SEATER',
        price: 105,
        is_active: true
      },
      {
        id: '5',
        from_location: 'Ashford',
        to_location: 'Gatwick Airport',
        vehicle_type: 'EIGHT_SEATER',
        price: 115,
        is_active: true
      },
      {
        id: '6',
        from_location: 'Ashford',
        to_location: 'Stansted Airport',
        vehicle_type: 'EIGHT_SEATER',
        price: 130,
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
        fuel_type: 'Petrol',
        color: 'Black',
        vehicle_type: 'FOUR_SEATER',
        is_active: true
      }
    ];
  }

  private getFallbackUsers() {
    return [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        account_type: 'customer',
        is_approved: true,
        created_at: '2024-01-01'
      }
    ];
  }

  private getFallbackDrivers() {
    return [
      {
        id: '1',
        first_name: 'Mike',
        last_name: 'Smith',
        email: 'mike@example.com',
        experience: '5 years',
        is_approved: false,
        created_at: '2024-01-01'
      }
    ];
  }

  private getFallbackStats() {
    return {
      totalUsers: 150,
      totalDrivers: 25,
      activeOffers: 3,
      totalBookings: 500
    };
  }

  // Auth endpoints
  // Users endpoints
  async getUsers() {
    return this.request('/admin/users');
  }

  async updateUser(userId: string, userData: any) {
    throw new Error('Not implemented: updateUser requires backend support');
  }

  async deleteUser(userId: string) {
    throw new Error('Not implemented: deleteUser requires backend support');
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

  async updateDriver(driverId: string, driverData: any) {
    throw new Error('Not implemented: updateDriver requires backend support');
  }

  async deleteDriver(driverId: string) {
    throw new Error('Not implemented: deleteDriver requires backend support');
  }

  // Fares endpoints
  async getFares() {
    return this.request('/admin/fares');
  }

  async getPublicFares() {
    return this.getFallbackPublicFares();
  }

  private getFallbackPublicFares() {
    return [
      {
        id: 1,
        route_name: 'Ashford → Heathrow Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Heathrow Airport',
        vehicle_type: '4-Seater Premium Sedan',
        price: 85,
        is_active: true,
      },
      {
        id: 2,
        route_name: 'Ashford → Gatwick Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Gatwick Airport',
        vehicle_type: '4-Seater Premium Sedan',
        price: 95,
        is_active: true,
      },
      {
        id: 3,
        route_name: 'Ashford → Stansted Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Stansted Airport',
        vehicle_type: '4-Seater Premium Sedan',
        price: 110,
        is_active: true,
      },
      {
        id: 4,
        route_name: 'Ashford → Heathrow Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Heathrow Airport',
        vehicle_type: '8-Seater MPV',
        price: 105,
        is_active: true,
      },
      {
        id: 5,
        route_name: 'Ashford → Gatwick Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Gatwick Airport',
        vehicle_type: '8-Seater MPV',
        price: 115,
        is_active: true,
      },
      {
        id: 6,
        route_name: 'Ashford → Stansted Airport',
        pickup_pattern: 'Ashford',
        dropoff_pattern: 'Stansted Airport',
        vehicle_type: '8-Seater MPV',
        price: 130,
        is_active: true,
      },
    ];
  }

  async createFare(fareData: any) {
    return this.request('/admin/fares', {
      method: 'POST',
      body: JSON.stringify(fareData),
    });
  }

  async updateFare(fareId: string | number, fareData: any) {
    return this.request(`/admin/fares/${String(fareId)}`, {
      method: 'PUT',
      body: JSON.stringify(fareData),
    });
  }

  async deleteFare(fareId: string | number) {
    return this.request(`/admin/fares/${String(fareId)}`, {
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
  async getBookings() {
    return this.request('/admin/bookings');
  }

  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getMyBookings() {
    try {
      return await this.request('/bookings/me');
    } catch (error) {
      if (error instanceof Error && /404/.test(error.message)) return [];
      throw error;
    }
  }

  async cancelBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
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
    return this.request('/offers/');
  }

  async getAdminOffersAll() {
    return this.request('/admin/offers/all');
  }

  async createDriverApplication(payload: any) {
    return this.request('/drivers/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMyDriverApplication() {
    const data = await this.request<any[]>('/drivers/applications/me');
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0];
  }

  async withdrawMyDriverApplication() {
    throw new Error('Withdrawal is currently unavailable. Please contact support.');
  }

  async createOffer(offerData: any) {
    return this.request('/offers/', {
      method: 'POST',
      body: JSON.stringify(offerData),
    });
  }

  async updateOffer(offerId: string, offerData: any) {
    return this.request(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    });
  }

  async deleteOffer(offerId: string) {
    return this.request(`/offers/${offerId}`, {
      method: 'DELETE',
    });
  }

  // Reviews endpoints
  async getReviews() {
    return this.request('/reviews/');
  }

  async createReview(reviewData: any) {
    return this.request('/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId: string, reviewData: any) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Stats endpoint
  async getStats() {
    return this.request('/stats/');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
