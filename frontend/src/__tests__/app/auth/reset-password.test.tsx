'use client';

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import ResetPasswordPage from '@/app/auth/reset-password/page';
import { AuthProvider } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import * as z from 'zod';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Auth Context
jest.mock('@/contexts/auth-context', () => {
  const originalModule = jest.requireActual('@/contexts/auth-context');
  return {
    ...originalModule,
    useAuth: jest.fn(),
  };
});

describe('ResetPasswordPage', () => {
  const mockResetPassword = jest.fn();
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock auth context
    const { useAuth } = require('@/contexts/auth-context');
    (useAuth as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
      user: null,
    });
  });
  
  test('renders reset password form correctly', () => {
    render(<ResetPasswordPage />);
    
    // Check for form elements
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  });
  
  test('validates email format', async () => {
    render(<ResetPasswordPage />);
    
    // Enter invalid email
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
      fireEvent.blur(screen.getByLabelText(/email/i)); // Move focus to trigger validation
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    });
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });
  
  test('submits form with valid email', async () => {
    // Mock successful reset password
    mockResetPassword.mockResolvedValue({ error: null, data: {} });
    
    render(<ResetPasswordPage />);
    
    // Fill form with valid email
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    });
    
    // Verify resetPassword was called with correct email
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
    
    // Verify success state is shown
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
  
  test('shows error message on failed reset password', async () => {
    // Mock failed reset password
    mockResetPassword.mockResolvedValue({ error: new Error('User not found'), data: null });
    
    render(<ResetPasswordPage />);
    
    // Fill form with valid email
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    });
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });
  
  test('navigates back to login page', async () => {
    render(<ResetPasswordPage />);
    
    // Click on back to login link
    await act(async () => {
      fireEvent.click(screen.getByText(/back to login/i));
    });
    
    // Verify navigation to login page
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
  
  test('shows loading state during form submission', async () => {
    // Mock reset password with delay
    mockResetPassword.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ error: null, data: {} });
        }, 100);
      });
    });
    
    render(<ResetPasswordPage />);
    
    // Fill form with valid email
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    });
    
    // Check loading state
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
});
