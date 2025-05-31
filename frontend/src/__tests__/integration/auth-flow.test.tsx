'use client';

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { AuthProvider } from '@/contexts/auth-context';
import LoginPage from '@/app/auth/login/page';
import SignupPage from '@/app/auth/signup/page';
import { UserNav } from '@/components/layout/user-nav';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

// Mock Next.js router and search params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}));

describe('Auth Flow Integration', () => {
  // Mock Supabase auth methods
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockSignOut = jest.fn();
  const mockGetSession = jest.fn();
  const mockOnAuthStateChange = jest.fn();
  
  // Mock router methods
  const mockPush = jest.fn();
  
  // Mock user data
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock search params
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue('/dashboard'),
    });
    
    // Mock Supabase client
    const mockSupabase = {
      auth: {
        signInWithPassword: mockSignIn,
        signUp: mockSignUp,
        signOut: mockSignOut,
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Default mock responses
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
  });
  
  test('user can sign up, sign in, and sign out', async () => {
    // 1. Render signup page and create account
    mockSignUp.mockResolvedValue({ 
      data: { user: { id: '123' }, session: null },
      error: null 
    });
    
    const { unmount } = render(
      <AuthProvider>
        <SignupPage />
      </AuthProvider>
    );
    
    // Fill signup form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });
    
    // Verify signup was called
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Verify success message is shown
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
    
    unmount();
    
    // 2. Render login page and sign in
    mockSignIn.mockResolvedValue({ 
      data: { user: mockUser, session: { user: mockUser } },
      error: null 
    });
    
    // Update auth state change to simulate successful login
    mockOnAuthStateChange.mockImplementation((event, callback) => {
      // Simulate auth state change after login
      callback('SIGNED_IN', { user: mockUser });
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    
    // Fill login form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });
    
    // Verify login was called
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Verify redirect after successful login
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
    
    unmount();
    
    // 3. Render user nav and sign out
    mockGetSession.mockResolvedValue({ 
      data: { session: { user: mockUser } } 
    });
    
    render(
      <AuthProvider>
        <UserNav />
      </AuthProvider>
    );
    
    // Wait for user data to load
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /loading/i })).not.toBeInTheDocument();
    });
    
    // Open dropdown
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    
    // Verify user info is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Click logout button
    await act(async () => {
      fireEvent.click(screen.getByText('Log out'));
    });
    
    // Verify signOut was called
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
  
  test('handles login errors correctly', async () => {
    // Mock failed login
    mockSignIn.mockResolvedValue({ 
      data: { user: null, session: null },
      error: new Error('Invalid credentials') 
    });
    
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    
    // Fill login form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong-password' } });
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
    });
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    // Verify redirect did not happen
    expect(mockPush).not.toHaveBeenCalled();
  });
  
  test('handles signup errors correctly', async () => {
    // Mock failed signup
    mockSignUp.mockResolvedValue({ 
      data: { user: null, session: null },
      error: new Error('Email already in use') 
    });
    
    render(
      <AuthProvider>
        <SignupPage />
      </AuthProvider>
    );
    
    // Fill signup form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
    });
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
    });
    
    // Verify success message is not shown
    expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
  });
});
