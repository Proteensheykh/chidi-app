import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginPage from '@/app/auth/login/page';
import { useAuth } from '@/contexts/auth-context';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock Auth Context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

// Mock UI components to avoid complex rendering issues
jest.mock('@/components/auth/oauth-button', () => ({
  OAuthButton: ({ provider, label }: { provider: string; label: string }) => (
    <button data-testid={`oauth-${provider}`}>{label || `Sign in with ${provider}`}</button>
  ),
}));

jest.mock('@/components/auth/auth-tabs', () => ({
  AuthTabs: ({ defaultTab }: { defaultTab: string }) => (
    <div data-testid="auth-tabs" data-default-tab={defaultTab}>
      Auth Tabs
    </div>
  ),
}));

// Mock all shadcn/ui components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardFooter: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
}));

jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  FormControl: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormField: ({ render, ...props }: any) => {
    const field = { onChange: jest.fn(), onBlur: jest.fn(), value: '', name: props.name };
    return render({ field, fieldState: { error: null }, formState: { errors: {} } });
  },
  FormItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormLabel: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  FormMessage: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDescription: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/icons', () => ({
  Icons: {
    spinner: () => <div data-testid="spinner">Loading...</div>,
  },
}));

jest.mock('@/components/ui/separator', () => ({
  Separator: (props: any) => <hr {...props} />,
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e.preventDefault();
      fn({ email: 'test@example.com', password: 'password123', rememberMe: false });
    },
    formState: { errors: {}, isSubmitting: false },
    reset: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
  }),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  EyeIcon: () => <div data-testid="eye-icon">👁</div>,
  EyeOffIcon: () => <div data-testid="eye-off-icon">🙈</div>,
}));

describe('LoginPage', () => {
  const mockSignIn = jest.fn();
  const mockPush = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock search params
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      user: null,
    });

    // Default search params behavior
    mockGet.mockReturnValue(null);
  });

  describe('Rendering', () => {
    test('renders login form with all required elements', () => {
      render(<LoginPage />);

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to enjoy the best managing experience')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('nico.ahmed@youremail.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByTestId('auth-tabs')).toBeInTheDocument();
    });

    test('renders password toggle button', () => {
      render(<LoginPage />);

      const passwordToggle = screen.getByRole('button', { name: /toggle password visibility/i });
      expect(passwordToggle).toBeInTheDocument();
    });

    test('renders OAuth button', () => {
      render(<LoginPage />);

      expect(screen.getByTestId('oauth-google')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    test('shows validation error for short password', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    test('shows validation error for empty fields', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    test('toggles password visibility when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      // Initially password should be hidden
      expect(passwordInput.type).toBe('password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      // Click to hide password again
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });
  });

  describe('Form Submission - Success Cases', () => {
    test('submits form with valid credentials and redirects to default route', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123', false);
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    test('submits form with remember me checked', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const rememberMeCheckbox = screen.getByRole('checkbox');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(rememberMeCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123', true);
      });
    });

    test('redirects to specified redirectTo parameter', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });
      mockGet.mockReturnValue('/dashboard');

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Form Submission - Error Cases', () => {
    test('displays error message when sign in fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      mockSignIn.mockResolvedValue({ error: { message: errorMessage } });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    test('displays generic error message when sign in throws exception', async () => {
      const user = userEvent.setup();
      mockSignIn.mockRejectedValue(new Error('Network error'));

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    test('clears previous error when new submission starts', async () => {
      const user = userEvent.setup();
      mockSignIn
        .mockResolvedValueOnce({ error: { message: 'First error' } })
        .mockResolvedValueOnce({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First submission with error
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission should clear the error
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('disables submit button during form submission', async () => {
      const user = userEvent.setup();
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });
      mockSignIn.mockReturnValue(signInPromise);

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolveSignIn!({ error: null });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles whitespace in email input', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, '  test@example.com  ');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('  test@example.com  ', 'password123', false);
      });
    });

    test('handles special characters in password', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      const specialPassword = 'P@ssw0rd!#$%';
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, specialPassword);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', specialPassword, false);
      });
    });

    test('handles multiple rapid form submissions', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: null });

      render(<LoginPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Rapidly click submit multiple times
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        // Should only call signIn once due to loading state
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });
    });
  });
});
