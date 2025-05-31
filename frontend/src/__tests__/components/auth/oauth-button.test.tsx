'use client';

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { OAuthButton } from '@/components/auth/oauth-button';
import { useAuth } from '@/contexts/auth-context';
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

describe('OAuthButton', () => {
  const mockSignInWithOAuth = jest.fn();
  const mockSupabase = {
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase client
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });
  
  test('renders Google OAuth button correctly', () => {
    render(<OAuthButton provider="google" />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Google');
    expect(button).toHaveClass('bg-white');
  });
  
  test('renders custom label when provided', () => {
    render(<OAuthButton provider="google" label="Sign in with Google" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Sign in with Google');
  });
  
  test('applies custom className when provided', () => {
    render(<OAuthButton provider="google" className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
  
  test('calls Supabase signInWithOAuth when clicked', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    
    render(<OAuthButton provider="google" />);
    
    // Click the button
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    
    // Verify Supabase signInWithOAuth was called with correct params
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  });
  
  test('shows loading state during OAuth sign in', async () => {
    // Mock signInWithOAuth to not resolve immediately
    mockSignInWithOAuth.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ error: null }), 1000);
    }));
    
    render(<OAuthButton provider="google" />);
    
    // Click the button
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    
    // Check loading state
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument();
  });
  
  test('handles error during OAuth sign in', async () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock signInWithOAuth to return error
    mockSignInWithOAuth.mockResolvedValue({ 
      error: new Error('Failed to authenticate with Google') 
    });
    
    render(<OAuthButton provider="google" />);
    
    // Click the button
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
    
    // Button should not be in loading state anymore
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  test('supports OAuth provider', async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    
    render(<OAuthButton provider="google" />);
    
    // Click the button
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    
    // Verify Supabase signInWithOAuth was called with correct provider
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  });
});
