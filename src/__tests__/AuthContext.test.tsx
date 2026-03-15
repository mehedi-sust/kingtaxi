import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';

// Mock the api client so we never call a real server
vi.mock('@/lib/api', () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  const mockGetUsers = vi.fn();
  const mockGetUser = vi.fn();

  return {
    default: {
      login: mockLogin,
      logout: mockLogout,
      getUsers: mockGetUsers,
      getUser: mockGetUser,
    },
    apiClient: {
      login: mockLogin,
      logout: mockLogout,
      getUsers: mockGetUsers,
      getUser: mockGetUser,
    },
  };
});

import { apiClient } from '@/lib/api';

// Helper: render a component that uses useAuth
function AuthConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="is-authenticated">{String(isAuthenticated)}</div>
      <div data-testid="is-loading">{String(isLoading)}</div>
      <div data-testid="user-identifier">{user?.identifier ?? 'none'}</div>
      <div data-testid="is-admin">{user ? String(user.isAdmin) : 'none'}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts unauthenticated when no token in localStorage', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-identifier')).toHaveTextContent('none');
  });

  it('resumes authenticated session from localStorage token', async () => {
    localStorage.setItem('kingtaxi_token', 'existing-token');
    localStorage.setItem('kingtaxi_identifier', 'admin@test.com');

    // getUsers succeeds → isAdmin = true
    vi.mocked(apiClient.getUsers).mockResolvedValue([]);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-identifier')).toHaveTextContent('admin@test.com');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
  });

  it('sets isAdmin=false when /admin/users returns 403', async () => {
    localStorage.setItem('kingtaxi_token', 'customer-token');
    localStorage.setItem('kingtaxi_identifier', 'user@test.com');

    vi.mocked(apiClient.getUsers).mockRejectedValue(new Error('Forbidden'));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
  });

  it('login() sets user, stores token, detects admin role', async () => {
    vi.mocked(apiClient.login).mockResolvedValue({
      access_token: 'new-token',
      token_type: 'bearer',
    });
    vi.mocked(apiClient.getUsers).mockResolvedValue([]); // admin

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    // Click login button
    await act(async () => {
      await userEvent.click(screen.getByTestId('login-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    expect(localStorage.getItem('kingtaxi_token')).toBe('new-token');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
  });

  it('login() sets isAdmin=false for non-admin user', async () => {
    vi.mocked(apiClient.login).mockResolvedValue({
      access_token: 'user-token',
      token_type: 'bearer',
    });
    vi.mocked(apiClient.getUsers).mockRejectedValue(new Error('Forbidden'));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('login-btn'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
  });

  it('logout() clears user state and removes localStorage keys', async () => {
    localStorage.setItem('kingtaxi_token', 'some-token');
    localStorage.setItem('kingtaxi_identifier', 'user@test.com');
    localStorage.setItem('kingtaxi_is_admin', 'false');

    vi.mocked(apiClient.getUsers).mockRejectedValue(new Error('Forbidden'));
    vi.mocked(apiClient.logout).mockResolvedValue({ message: 'ok' });

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId('logout-btn'));
    });

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('kingtaxi_token')).toBeNull();
    expect(localStorage.getItem('kingtaxi_identifier')).toBeNull();
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });
});
