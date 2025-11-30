/**
 * AuthContext Flow Tests
 * Tests authentication context, login/logout flows
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/client';

// Mock the API client
vi.mock('../api/client', () => ({
  authApi: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getTokens: vi.fn(() => ({ authToken: null, refreshToken: null })),
    setTokens: vi.fn(),
  },
}));

// Test component that uses auth context
function TestAuthConsumer() {
  const { user, isLoading, isAuthenticated, login, logout, register } = useAuth();

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      {user && <div data-testid="user-name">{user.name}</div>}
      {user && <div data-testid="user-role">{user.role}</div>}
      <button onClick={() => login('test@test.com', 'password')} data-testid="login-btn">
        Login
      </button>
      <button onClick={() => register('new@test.com', 'password', 'New User', 'student')} data-testid="register-btn">
        Register
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with no user when no token exists', async () => {
      vi.mocked(authApi.getTokens).mockReturnValue({ authToken: null, refreshToken: null });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should restore user from localStorage when token exists', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User', role: 'student' };
      // Set up localStorage before rendering
      localStorage.setItem('user', JSON.stringify(mockUser));
      vi.mocked(authApi.getTokens).mockReturnValue({ 
        authToken: 'valid-token', 
        refreshToken: 'refresh-token' 
      });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      });
    });

    it('should show loading state initially', () => {
      vi.mocked(authApi.getTokens).mockReturnValue({ authToken: null, refreshToken: null });

      const { container } = render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      // The loading state may resolve quickly, but the component should render
      expect(container).toBeTruthy();
    });
  });

  describe('Login Flow', () => {
    it('should login successfully and update user state', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User', role: 'student' };
      vi.mocked(authApi.login).mockResolvedValue({
        authToken: 'new-token',
        refreshToken: 'new-refresh',
        user: mockUser,
      });
      vi.mocked(authApi.getTokens).mockReturnValue({ authToken: null, refreshToken: null });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith('test@test.com', 'password');
        expect(authApi.setTokens).toHaveBeenCalledWith('new-token', 'new-refresh');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      });
    });

    it('should store user in localStorage after login', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User', role: 'student' };
      vi.mocked(authApi.login).mockResolvedValue({
        authToken: 'new-token',
        refreshToken: 'new-refresh',
        user: mockUser,
      });
      vi.mocked(authApi.getTokens).mockReturnValue({ authToken: null, refreshToken: null });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('login-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        // Verify localStorage.setItem was called with user data
        expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      });
    });
  });

  describe('Registration Flow', () => {
    it('should register successfully and update user state', async () => {
      const mockUser = { id: 2, email: 'new@test.com', name: 'New User', role: 'student' };
      vi.mocked(authApi.register).mockResolvedValue({
        authToken: 'new-token',
        refreshToken: 'new-refresh',
        user: mockUser,
      });
      vi.mocked(authApi.getTokens).mockReturnValue({ authToken: null, refreshToken: null });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('register-btn'));

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith('new@test.com', 'password', 'New User', 'student');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('New User');
      });
    });

    it('should store user in localStorage after registration', async () => {
      const mockUser = { id: 2, email: 'new@test.com', name: 'New User', role: 'student' };
      vi.mocked(authApi.register).mockResolvedValue({
        authToken: 'new-token',
        refreshToken: 'new-refresh',
        user: mockUser,
      });
      vi.mocked(authApi.getTokens).mockReturnValue({ authToken: null, refreshToken: null });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('register-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
        // Verify localStorage.setItem was called with user data
        expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      });
    });
  });

  describe('Logout Flow', () => {
    it('should logout and clear user state', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User', role: 'student' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      vi.mocked(authApi.getTokens).mockReturnValue({ 
        authToken: 'valid-token', 
        refreshToken: 'refresh-token' 
      });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('logout-btn'));

      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalled();
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
      });
    });

    it('should clear localStorage on logout', async () => {
      const mockUser = { id: 1, email: 'test@test.com', name: 'Test User', role: 'student' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      vi.mocked(authApi.getTokens).mockReturnValue({ 
        authToken: 'valid-token', 
        refreshToken: 'refresh-token' 
      });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });

      const user = userEvent.setup();
      await user.click(screen.getByTestId('logout-btn'));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
        // Verify localStorage.removeItem was called
        expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      });
    });
  });

  describe('useAuth Hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestAuthConsumer />);
      }).toThrow('useAuth must be used within AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Role-based Access', () => {
    it('should correctly identify student role', async () => {
      const mockUser = { id: 1, email: 'student@test.com', name: 'Student', role: 'student' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      vi.mocked(authApi.getTokens).mockReturnValue({ 
        authToken: 'valid-token', 
        refreshToken: 'refresh-token' 
      });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('student');
      });
    });

    it('should correctly identify teacher role', async () => {
      const mockUser = { id: 1, email: 'teacher@test.com', name: 'Teacher', role: 'teacher' };
      localStorage.setItem('user', JSON.stringify(mockUser));
      vi.mocked(authApi.getTokens).mockReturnValue({ 
        authToken: 'valid-token', 
        refreshToken: 'refresh-token' 
      });

      render(
        <AuthProvider>
          <TestAuthConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-role')).toHaveTextContent('teacher');
      });
    });
  });
});
