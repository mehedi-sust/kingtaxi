import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for ApiClient — tests the request logic, error handling,
 * fallback data shapes, and key endpoint methods using fetch mocks.
 */

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// We import the module after setting up mocks
import apiClient from '@/lib/api';

function makeJsonResponse(body: unknown, status = 200, contentType = 'application/json') {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      get: (name: string) => (name === 'content-type' ? contentType : null),
    },
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe('ApiClient — error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('throws a user-friendly message on 401', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse({ detail: 'Unauthorized' }, 401));
    await expect(apiClient.getUsers()).rejects.toThrow(/not signed in/i);
  });

  it('throws a user-friendly message on 403', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse({ detail: 'Forbidden' }, 403));
    await expect(apiClient.getDrivers()).rejects.toThrow(/do not have permission/i);
  });

  it('throws a server error message on 500', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse({ detail: 'Internal Server Error' }, 500));
    // Use a POST endpoint (createDriver) — no fallback on POST requests
    await expect(
      apiClient.createDriver({ name: 'Test', phone: '+441234567890', vehicle_plate: 'T1 EST', vehicle_model: 'Toyota' })
    ).rejects.toThrow(/server error/i);
  });

  it('unwraps string detail from backend error', async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse({ detail: 'Driver with this phone already exists' }, 400)
    );
    await expect(apiClient.createDriver({ name: 'Test', phone: '+441234567890', vehicle_plate: 'T1 EST', vehicle_model: 'Toyota' })).rejects.toThrow(
      'Driver with this phone already exists'
    );
  });

  it('unwraps validation error array from backend', async () => {
    const detail = [
      { loc: ['body', 'customer_phone'], msg: 'value is not a valid phone number', type: 'value_error' },
    ];
    mockFetch.mockResolvedValue(makeJsonResponse({ detail }, 422));
    await expect(
      apiClient.createBooking({
        customer_phone: 'bad',
        pickup_address: 'A',
        dropoff_address: 'B',
        pickup_lat: 0,
        pickup_lng: 0,
        dropoff_lat: 0,
        dropoff_lng: 0,
        pickup_time: new Date().toISOString(),
        trip_type: 'standard',
      })
    ).rejects.toThrow(/value is not a valid phone number/i);
  });

  it('throws a network error message when fetch fails', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    // Use a POST endpoint that doesn't have a fallback
    await expect(
      apiClient.createBooking({
        customer_phone: '+447700900123',
        pickup_address: 'A', dropoff_address: 'B',
        pickup_lat: 0, pickup_lng: 0, dropoff_lat: 0, dropoff_lng: 0,
        pickup_time: new Date().toISOString(), trip_type: 'standard'
      })
    ).rejects.toThrow(/unable to reach the server/i);
  });

  it('throws a network error message on network error', async () => {
    mockFetch.mockRejectedValue(new TypeError('NetworkError when attempting to fetch resource'));
    await expect(
      apiClient.createBooking({
        customer_phone: '+447700900123',
        pickup_address: 'A', dropoff_address: 'B',
        pickup_lat: 0, pickup_lng: 0, dropoff_lat: 0, dropoff_lng: 0,
        pickup_time: new Date().toISOString(), trip_type: 'standard'
      })
    ).rejects.toThrow(/unable to reach the server/i);
  });
});

describe('ApiClient — successful responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('kingtaxi_token', 'test-token');
  });

  it('getUsers() fetches /admin/users and returns users', async () => {
    const users = [{ id: '1', phone: '+441234567890', role: 'admin', is_active: true }];
    mockFetch.mockResolvedValue(makeJsonResponse(users));
    const result = await apiClient.getUsers();
    expect(result).toEqual(users);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/users'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-token' }) })
    );
  });

  it('estimateFare() sends correct payload to /bookings/estimate', async () => {
    const response = {
      estimated_fare: 85.0,
      is_fixed_price: true,
      message: 'Fixed fare applied',
      distance_km: 90.5,
      duration_min: 75.0,
      currency: 'GBP',
    };
    mockFetch.mockResolvedValue(makeJsonResponse(response));
    const result = await apiClient.estimateFare({
      pickup_lat: 51.14,
      pickup_lng: 0.87,
      dropoff_lat: 51.47,
      dropoff_lng: -0.45,
      pickup_address: 'Ashford',
      dropoff_address: 'Heathrow Airport',
      trip_type: 'standard',
    });
    expect(result).toMatchObject({ estimated_fare: 85.0, is_fixed_price: true });
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/estimate');
    const body = JSON.parse(options.body as string);
    expect(body.pickup_lat).toBe(51.14);
    expect(body.trip_type).toBe('standard');
  });

  it('createBooking() sends correct payload to /bookings', async () => {
    const response = {
      id: 'abc-123',
      status: 'PENDING_DISPATCH',
      estimated_fare: 85.0,
      confirmed_fare: null,
      is_fixed_fare: true,
      driver: null,
      created_at: new Date().toISOString(),
    };
    mockFetch.mockResolvedValue(makeJsonResponse(response, 201));
    const booking = {
      customer_phone: '+447700900123',
      pickup_address: 'Ashford',
      dropoff_address: 'Heathrow Airport',
      pickup_lat: 51.14,
      pickup_lng: 0.87,
      dropoff_lat: 51.47,
      dropoff_lng: -0.45,
      pickup_time: new Date().toISOString(),
      trip_type: 'standard',
      vehicle_type: '4-Seater Premium Sedan',
    };
    const result = await apiClient.createBooking(booking);
    expect(result).toMatchObject({ id: 'abc-123', status: 'PENDING_DISPATCH' });
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings');
    expect(JSON.parse(options.body as string).customer_phone).toBe('+447700900123');
  });

  it('login() sends form-urlencoded with username+password fields', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse({ access_token: 'tok', token_type: 'bearer' }));
    await apiClient.login('+441234567890', 'Password1!');
    const [_, options] = mockFetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    const params = new URLSearchParams(options.body as string);
    expect(params.get('username')).toBe('+441234567890');
    expect(params.get('password')).toBe('Password1!');
  });

  it('getFares() fetches /admin/fares', async () => {
    const fares = [{ id: 1, route_name: 'Test', price: 85, is_active: true }];
    mockFetch.mockResolvedValue(makeJsonResponse(fares));
    const result = await apiClient.getFares();
    expect(result).toEqual(fares);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/fares'),
      expect.any(Object)
    );
  });
});

describe('ApiClient — fallback data shapes', () => {
  it('fallback offers match backend OfferResponse schema', async () => {
    // Simulate total fetch failure for /offers to trigger fallback
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const result = await apiClient.getOffers() as any[];
    // Should return fallback without throwing (because allows fallback for /offers)
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      const offer = result[0];
      // Must have backend-compatible fields
      expect(offer).toHaveProperty('name');
      expect(offer).toHaveProperty('discount_value');
      expect(offer).toHaveProperty('discount_type');
      expect(offer).toHaveProperty('is_active');
      expect(offer).toHaveProperty('created_at');
      // Must NOT have old mismatched fields
      expect(offer).not.toHaveProperty('title');
      expect(offer).not.toHaveProperty('discount');
      expect(offer).not.toHaveProperty('start_date');
      expect(offer).not.toHaveProperty('end_date');
    }
  });

  it('fallback fares match backend FixedFareResponse schema', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const result = await apiClient.getPublicFares() as any[];
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      const fare = result[0];
      expect(fare).toHaveProperty('route_name');
      expect(fare).toHaveProperty('price');
      expect(fare).toHaveProperty('vehicle_type');
      expect(fare).toHaveProperty('is_active');
    }
  });
});
