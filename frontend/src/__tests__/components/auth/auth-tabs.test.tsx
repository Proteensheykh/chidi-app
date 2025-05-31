'use client';

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { AuthTabs } from '@/components/auth/auth-tabs';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('AuthTabs', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });
  
  test('renders login tab as active by default', () => {
    render(<AuthTabs />);
    
    const loginTab = screen.getByRole('tab', { name: /login/i });
    const registerTab = screen.getByRole('tab', { name: /register/i });
    
    expect(loginTab).toHaveAttribute('aria-selected', 'true');
    expect(registerTab).toHaveAttribute('aria-selected', 'false');
  });
  
  test('renders register tab as active when defaultTab is register', () => {
    render(<AuthTabs defaultTab="register" />);
    
    const loginTab = screen.getByRole('tab', { name: /login/i });
    const registerTab = screen.getByRole('tab', { name: /register/i });
    
    expect(loginTab).toHaveAttribute('aria-selected', 'false');
    expect(registerTab).toHaveAttribute('aria-selected', 'true');
  });
  
  test('navigates to login page when login tab is clicked', async () => {
    render(<AuthTabs defaultTab="register" />);
    
    // Click login tab
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: /login/i }));
    });
    
    // Should navigate to login page
    expect(mockPush).toHaveBeenCalledWith('/auth/login');
  });
  
  test('navigates to register page when register tab is clicked', async () => {
    render(<AuthTabs defaultTab="login" />);
    
    // Click register tab
    await act(async () => {
      fireEvent.click(screen.getByRole('tab', { name: /register/i }));
    });
    
    // Should navigate to signup page
    expect(mockPush).toHaveBeenCalledWith('/auth/signup');
  });
  
  // Note: Removed test for custom className as it's not supported in the component interface
});
