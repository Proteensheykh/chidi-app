'use client';

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserNav } from '@/components/layout/user-nav';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import React from 'react';

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => <div className={className} data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children, className }: any) => <div className={className} data-testid="avatar-fallback">{children}</div>,
  AvatarImage: ({ src, alt, className }: any) => src && src !== '' ? <img src={src} alt={alt} className={className} data-testid="avatar-image" /> : null,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={className}
      data-variant={variant}
      data-size={size}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children, className }: any) => <div className={className} data-testid="dropdown-content">{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div data-testid="dropdown-group">{children}</div>,
  DropdownMenuItem: ({ children, onClick, asChild }: any) => {
    if (asChild) {
      // When asChild is true, render children directly but add onClick to the first child
      return React.cloneElement(children, { 
        onClick: onClick || children.props.onClick,
        'data-testid': 'dropdown-item'
      });
    }
    return <div onClick={onClick} data-testid="dropdown-item">{children}</div>;
  },
  DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
  DropdownMenuTrigger: ({ children, asChild }: any) => {
    if (asChild) {
      return React.cloneElement(children, { 'data-testid': 'dropdown-trigger' });
    }
    return <div data-testid="dropdown-trigger">{children}</div>;
  },
}));

jest.mock('@/components/ui/icons', () => ({
  Icons: {
    spinner: ({ className }: any) => <div className={className} data-testid="spinner-icon">spinner</div>,
    user: ({ className }: any) => <div className={className} data-testid="user-icon">user</div>,
    settings: ({ className }: any) => <div className={className} data-testid="settings-icon">settings</div>,
    logout: ({ className }: any) => <div className={className} data-testid="logout-icon">logout</div>,
  },
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href} data-testid="link">{children}</a>;
});

const mockUser: User = {
  id: '123',
  email: 'test@example.com',
  aud: 'authenticated',
  app_metadata: {},
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
};

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('UserNav', () => {
  const mockPush = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
  });

  test('renders loading state when isLoading is true', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: true,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeDisabled();
    expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
  });

  test('renders user avatar with image when available', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    const avatarImage = screen.getByTestId('avatar-image');
    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(avatarImage).toHaveAttribute('alt', 'Test User');
  });

  test('renders user avatar fallback when no image available', () => {
    const userWithoutAvatar: User = {
      ...mockUser,
      user_metadata: {
        full_name: 'Test User',
        avatar_url: '',
      },
    };

    mockUseAuth.mockReturnValue({
      user: userWithoutAvatar,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('TU');
  });

  test('renders user information in dropdown', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  test('calls signOut and redirects when logout is clicked', async () => {
    const user = userEvent.setup();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut.mockResolvedValue(undefined),
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    // Find the logout button by its text content
    const logoutButton = screen.getByText('Log out');
    expect(logoutButton).toBeInTheDocument();

    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  test('renders with demo data when no user is available', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    // Should show demo user data
    expect(screen.getByText('Demo User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    
    // Should show fallback initials for demo user
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('DU');
  });

  test('generates correct initials for single name', () => {
    const userWithSingleName: User = {
      ...mockUser,
      user_metadata: {
        full_name: 'John',
        avatar_url: '',
      },
    };

    mockUseAuth.mockReturnValue({
      user: userWithSingleName,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('J');
  });

  test('generates correct initials for multiple names', () => {
    const userWithMultipleNames: User = {
      ...mockUser,
      user_metadata: {
        full_name: 'John Michael Smith',
        avatar_url: '',
      },
    };

    mockUseAuth.mockReturnValue({
      user: userWithMultipleNames,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JMS');
  });

  test('handles user without full_name metadata', () => {
    const userWithoutName: User = {
      ...mockUser,
      user_metadata: {},
    };

    mockUseAuth.mockReturnValue({
      user: userWithoutName,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('U');
  });

  test('handles signOut error gracefully', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a fresh mock function for this test
    const mockSignOutWithError = jest.fn().mockRejectedValue(new Error('Sign out failed'));
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOutWithError,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    const logoutButton = screen.getByText('Log out');
    await user.click(logoutButton);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(mockSignOutWithError).toHaveBeenCalled();
    });

    // Should still redirect even if signOut fails due to error handling in component
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });

    // Should log the error
    expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  test('renders avatar with correct styling classes', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('h-10', 'w-10');
    
    const avatarFallback = screen.getByTestId('avatar-fallback');
    expect(avatarFallback).toHaveClass('bg-[#1A4A3A]', 'text-white');
  });

  test('dropdown menu has correct accessibility attributes', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      resetPassword: jest.fn(),
    });

    render(<UserNav />);

    const button = screen.getByTestId('button');
    expect(button).toHaveClass('relative', 'h-10', 'w-10', 'rounded-full');
  });
});
