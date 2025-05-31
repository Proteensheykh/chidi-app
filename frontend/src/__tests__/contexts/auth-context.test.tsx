/**
 * @jest-environment jsdom
 */
'use client';

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}));

// Mock window.location.origin
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost',
  },
  writable: true,
});

// Test component to access auth context
const TestComponent = () => {
  const { user, session, isLoading, signIn, signUp, signOut, resetPassword } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="session">{session ? 'Has session' : 'No session'}</div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
      <button onClick={() => resetPassword('test@example.com')}>Reset Password</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  };

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    confirmation_sent_at: '2023-01-01T00:00:00Z',
    email_confirmed_at: '2023-01-01T00:00:00Z',
    last_sign_in_at: '2023-01-01T00:00:00Z',
    role: 'authenticated',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockSession: Session = {
    access_token: 'access_token',
    refresh_token: 'refresh_token',
    expires_in: 3600,
    expires_at: 1234567890,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Default mock implementations
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  describe('Provider Initialization', () => {
    test('initializes with loading state', async () => {
      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('session')).toHaveTextContent('No session');
    });

    test('loads initial session successfully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('session')).toHaveTextContent('Has session');
      });
    });

    test('handles initial session load error gracefully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session load failed'),
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
        expect(screen.getByTestId('user')).toHaveTextContent('No user');
        expect(screen.getByTestId('session')).toHaveTextContent('No session');
      });
    });
  });

  describe('Auth State Changes', () => {
    test('handles auth state change with new session', async () => {
      let authStateCallback: (event: string, session: Session | null) => void;
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      // Simulate auth state change
      await act(async () => {
        authStateCallback!('SIGNED_IN', mockSession);
      });

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('Has session');
    });

    test('handles auth state change with session removal', async () => {
      let authStateCallback: (event: string, session: Session | null) => void;
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      // Start with a session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      });

      // Simulate sign out
      await act(async () => {
        authStateCallback!('SIGNED_OUT', null);
      });

      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('session')).toHaveTextContent('No session');
    });
  });

  describe('Sign In', () => {
    test('successful sign in', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const signInButton = screen.getByText('Sign In');
      await act(async () => {
        signInButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        });
      });
    });

    test('sign in with error', async () => {
      const error = new Error('Invalid credentials');
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const signInButton = screen.getByText('Sign In');
      await act(async () => {
        signInButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        });
      });
    });

    test('sign in with remember me option', async () => {
      const TestComponentWithRememberMe = () => {
        const { signIn } = useAuth();
        
        return (
          <button onClick={() => signIn('test@example.com', 'password', true)}>
            Sign In with Remember Me
          </button>
        );
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponentWithRememberMe />
          </AuthProvider>
        );
      });

      const signInButton = screen.getByText('Sign In with Remember Me');
      await act(async () => {
        signInButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        });
      });
    });
  });

  describe('Sign Up', () => {
    test('successful sign up', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const signUpButton = screen.getByText('Sign Up');
      await act(async () => {
        signUpButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        });
      });
    });

    test('sign up with error', async () => {
      const error = new Error('Email already exists');
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const signUpButton = screen.getByText('Sign Up');
      await act(async () => {
        signUpButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        });
      });
    });
  });

  describe('Sign Out', () => {
    test('successful sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const signOutButton = screen.getByText('Sign Out');
      await act(async () => {
        signOutButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });
    });

    test('sign out with error', async () => {
      const error = new Error('Sign out failed');
      mockSupabase.auth.signOut.mockResolvedValue({ error });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const signOutButton = screen.getByText('Sign Out');
      await act(async () => {
        signOutButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });
    });
  });

  describe('Reset Password', () => {
    test('successful password reset', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const resetButton = screen.getByText('Reset Password');
      await act(async () => {
        resetButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          { redirectTo: 'http://localhost/auth/reset-password' }
        );
      });
    });

    test('password reset with error', async () => {
      const error = new Error('Email not found');
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const resetButton = screen.getByText('Reset Password');
      await act(async () => {
        resetButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          { redirectTo: 'http://localhost/auth/reset-password' }
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('handles useAuth outside of provider', () => {
      const TestComponentOutsideProvider = () => {
        try {
          useAuth();
          return <div>Should not reach here</div>;
        } catch (error) {
          return <div data-testid="error">Error caught</div>;
        }
      };

      render(<TestComponentOutsideProvider />);
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });

    test('handles Supabase client creation failure', async () => {
      (createClient as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to create client');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    test('unsubscribes from auth state changes on unmount', async () => {
      const unsubscribeMock = jest.fn();
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } },
      });

      const { unmount } = await act(async () => {
        return render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    test('handles multiple rapid auth operations', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const TestComponentRapidOps = () => {
        const { signIn, isLoading } = useAuth();
        
        return (
          <div>
            <div data-testid="loading">{isLoading ? 'Loading' : 'Not loading'}</div>
            <button 
              onClick={() => {
                signIn('test1@example.com', 'password1');
                signIn('test2@example.com', 'password2');
                signIn('test3@example.com', 'password3');
              }}
            >
              Rapid Sign Ins
            </button>
          </div>
        );
      };

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponentRapidOps />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });

      const rapidButton = screen.getByText('Rapid Sign Ins');
      await act(async () => {
        rapidButton.click();
      });

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledTimes(3);
      });
    });

    test('handles session with null user', async () => {
      const sessionWithoutUser = { ...mockSession, user: null as any };
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: sessionWithoutUser },
        error: null,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
        expect(screen.getByTestId('user')).toHaveTextContent('No user');
        expect(screen.getByTestId('session')).toHaveTextContent('Has session');
      });
    });

    test('handles malformed session data', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { invalid: 'session' } as any },
        error: null,
      });

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      });
    });
  });
});
