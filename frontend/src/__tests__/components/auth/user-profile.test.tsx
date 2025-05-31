'use client';

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { UserProfile } from '@/components/auth/user-profile';
import { AuthProvider } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(),
}));

// Mock Auth Context
jest.mock('@/contexts/auth-context', () => {
  const originalModule = jest.requireActual('@/contexts/auth-context');
  return {
    ...originalModule,
    useAuth: jest.fn(),
  };
});

describe('UserProfile', () => {
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
    
    // Mock auth context
    const { useAuth } = require('@/contexts/auth-context');
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });
  
  test('renders user profile form with user data', () => {
    render(<UserProfile />);
    
    // Check for form elements
    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    
    // Check user data is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // Check form fields have correct values
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Test User');
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/avatar url/i)).toHaveValue('https://example.com/avatar.jpg');
    
    // Check avatar is displayed
    const avatar = screen.getByAltText('Test User');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });
  
  test('renders user profile with initials when no avatar', () => {
    // Mock user without avatar
    const { useAuth } = require('@/contexts/auth-context');
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        ...mockUser,
        user_metadata: {
          full_name: 'Test User',
          avatar_url: '',
        },
      },
    });
    
    render(<UserProfile />);
    
    // Check avatar fallback with initials
    expect(screen.getByText('TU')).toBeInTheDocument();
  });
  
  test('submits form with updated profile data', async () => {
    // Mock timer for simulated API call
    jest.useFakeTimers();
    
    render(<UserProfile />);
    
    // Update form fields
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: '' } });
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Updated Name' } });
      
      fireEvent.change(screen.getByLabelText(/avatar url/i), { target: { value: '' } });
      fireEvent.change(screen.getByLabelText(/avatar url/i), { target: { value: 'https://example.com/new-avatar.jpg' } });
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });
    
    // Fast-forward timer to complete the simulated API call
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Check success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
    
    // Restore real timers
    jest.useRealTimers();
  });
  
  test('shows loading state during form submission', async () => {
    // Mock timer for simulated API call
    jest.useFakeTimers();
    
    render(<UserProfile />);
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });
    
    // Check loading state
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    
    // Fast-forward timer to complete the simulated API call
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Check button is no longer in loading state
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    
    // Restore real timers
    jest.useRealTimers();
  });
  
  test('handles form validation errors', async () => {
    render(<UserProfile />);
    
    // Clear required field
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: '' } });
      fireEvent.blur(screen.getByLabelText(/full name/i)); // Move focus to trigger validation
    });
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });
    
    // Check validation error
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
  });
  
  test('handles API errors during submission', async () => {
    // Mock timer for simulated API call
    jest.useFakeTimers();
    
    // Override the setTimeout to throw an error
    const originalSetTimeout = window.setTimeout;
    const mockSetTimeout = jest.fn().mockImplementationOnce((callback) => {
      callback();
      throw new Error('API error');
    });
    window.setTimeout = mockSetTimeout as unknown as typeof setTimeout;
    
    render(<UserProfile />);
    
    // Submit form
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    });
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });
    
    // Restore setTimeout and timers
    window.setTimeout = originalSetTimeout;
    jest.useRealTimers();
  });
  
  test('renders with mock data when no user is available', () => {
    // Mock auth context with no user
    const { useAuth } = require('@/contexts/auth-context');
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });
    
    render(<UserProfile />);
    
    // Check mock data is used
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });
});
