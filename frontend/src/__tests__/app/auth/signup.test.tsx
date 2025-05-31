import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import SignupPage from '@/app/auth/signup/page';
import { useAuth } from '@/contexts/auth-context';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Auth Context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

// Mock UI components to avoid complex rendering issues
jest.mock('@/components/auth/oauth-button', () => ({
  OAuthButton: ({ provider, label }: { provider: string; label: string }) => (
    <button data-testid={`oauth-${provider}`}>{label || `Sign up with ${provider}`}</button>
  ),
}));

jest.mock('@/components/auth/auth-tabs', () => ({
  AuthTabs: ({ defaultTab }: { defaultTab: string }) => (
    <div data-testid="auth-tabs" data-default-tab={defaultTab}>
      Auth Tabs
    </div>
  ),
}));

describe('SignupPage', () => {
  const mockSignUp = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
      user: null,
    });
  });

  describe('Rendering', () => {
    test('renders signup form with all required elements', () => {
      render(<SignupPage />);

      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByText('Join us to enjoy the best managing experience')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('nico.ahmed@youremail.com')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2); // Password and confirm password
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByTestId('auth-tabs')).toBeInTheDocument();
    });

    test('renders password toggle buttons', () => {
      render(<SignupPage />);

      const passwordToggles = screen.getAllByRole('button', { name: /toggle password visibility/i });
      expect(passwordToggles).toHaveLength(2); // One for password, one for confirm password
    });

    test('renders OAuth button', () => {
      render(<SignupPage />);

      expect(screen.getByTestId('oauth-google')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('shows validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    test('shows validation error for short password', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInputs[0], '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });

    test('shows validation error when passwords do not match', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'differentpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });
    });

    test('shows validation error for empty fields', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        expect(screen.getAllByText('Password must be at least 6 characters')).toHaveLength(2);
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    test('toggles password visibility for password field', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInputs = screen.getAllByPlaceholderText('••••••••') as HTMLInputElement[];
      const passwordToggles = screen.getAllByRole('button', { name: /toggle password visibility/i });

      // Initially passwords should be hidden
      expect(passwordInputs[0].type).toBe('password');
      expect(passwordInputs[1].type).toBe('password');

      // Click to show first password
      await user.click(passwordToggles[0]);
      expect(passwordInputs[0].type).toBe('text');

      // Click to show second password
      await user.click(passwordToggles[1]);
      expect(passwordInputs[1].type).toBe('text');

      // Click to hide passwords again
      await user.click(passwordToggles[0]);
      await user.click(passwordToggles[1]);
      expect(passwordInputs[0].type).toBe('password');
      expect(passwordInputs[1].type).toBe('password');
    });
  });

  describe('Form Submission - Success Cases', () => {
    test('submits form with valid credentials and shows success message', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
    });

    test('handles successful signup with confirmation email message', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInputs[0], 'securepassword');
      await user.type(passwordInputs[1], 'securepassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/we've sent you a confirmation email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Error Cases', () => {
    test('displays error message when signup fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already exists';
      mockSignUp.mockResolvedValue({ error: { message: errorMessage } });

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    test('displays generic error message when signup throws exception', async () => {
      const user = userEvent.setup();
      mockSignUp.mockRejectedValue(new Error('Network error'));

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    test('clears previous error when new submission starts', async () => {
      const user = userEvent.setup();
      mockSignUp
        .mockResolvedValueOnce({ error: { message: 'First error' } })
        .mockResolvedValueOnce({ error: null });

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // First submission with error
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second submission should clear the error
      await user.clear(emailInput);
      await user.type(emailInput, 'newemail@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    test('disables submit button during form submission', async () => {
      const user = userEvent.setup();
      let resolveSignUp: (value: any) => void;
      const signUpPromise = new Promise((resolve) => {
        resolveSignUp = resolve;
      });
      mockSignUp.mockReturnValue(signUpPromise);

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(submitButton);

      // Button should be disabled during loading
      expect(submitButton).toBeDisabled();

      // Resolve the promise
      resolveSignUp!({ error: null });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles whitespace in email input', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, '  test@example.com  ');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('  test@example.com  ', 'password123');
      });
    });

    test('handles special characters in password', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      const specialPassword = 'P@ssw0rd!#$%';
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInputs[0], specialPassword);
      await user.type(passwordInputs[1], specialPassword);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', specialPassword);
      });
    });

    test('handles multiple rapid form submissions', async () => {
      const user = userEvent.setup();
      mockSignUp.mockResolvedValue({ error: null });

      render(<SignupPage />);

      const emailInput = screen.getByPlaceholderText('nico.ahmed@youremail.com');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'password123');

      // Rapidly click submit multiple times
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      await waitFor(() => {
        // Should only call signUp once due to loading state
        expect(mockSignUp).toHaveBeenCalledTimes(1);
      });
    });

    test('validates password match in real-time', async () => {
      const user = userEvent.setup();
      render(<SignupPage />);

      const passwordInputs = screen.getAllByPlaceholderText('••••••••');

      await user.type(passwordInputs[0], 'password123');
      await user.type(passwordInputs[1], 'different');

      // Trigger validation by attempting to submit
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
      });
    });
  });
});
