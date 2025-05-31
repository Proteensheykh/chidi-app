'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { Icons } from '@/components/ui/icons';
import { OAuthButton } from '@/components/auth/oauth-button';
import { AuthTabs } from '@/components/auth/auth-tabs';
import { Checkbox } from '@/components/ui/checkbox';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signUp(data.email, data.password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      setIsSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-[#121212]">
        <Card className="w-full max-w-md border border-[#E2E8F0] shadow-md bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#1F2937]">Check your email</CardTitle>
            <CardDescription className="text-[#64748B]">
              We've sent you a confirmation email. Please check your inbox and follow the instructions to complete your registration.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full bg-[#1A4A3A] hover:bg-[#1A4A3A]/90 text-white rounded-full h-12">
              <Link href="/auth/login">Return to login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12 bg-[#121212] auth-container">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2 auth-heading">Go ahead and set up your account</h1>
        <p className="text-[#A1A1AA] auth-subtext">
          Sign in to enjoy the best managing experience
        </p>
      </div>
      <Card className="w-full max-w-md border border-[#E2E8F0] shadow-md bg-white">
        <CardHeader className="space-y-1">
          <AuthTabs defaultTab="register" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Icons.mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input 
                          placeholder="nico.ahmed@youremail.com" 
                          className="pl-10 bg-white border-[#E2E8F0] h-12" 
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Icons.lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10 bg-white border-[#E2E8F0] h-12" 
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <Icons.lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="pl-10 bg-white border-[#E2E8F0] h-12" 
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" className="border-[#E2E8F0] data-[state=checked]:bg-[#1A4A3A]" />
                <label htmlFor="terms" className="text-sm text-[#64748B] cursor-pointer">
                  I agree to the <Link href="/terms" className="text-[#1A4A3A] hover:underline">Terms of Service</Link>
                </label>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#1A4A3A] hover:bg-[#1A4A3A]/90 text-white rounded-full h-12" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
              
              <div className="text-center my-4 text-sm text-[#64748B]">
                Or register with
              </div>
              
              <div className="flex justify-center">
                <OAuthButton 
                  provider="google" 
                  label="Google"
                  className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1F2937] h-12 rounded-full" 
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pt-0 pb-6">
          <div className="text-sm text-center text-[#64748B]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#1A4A3A] hover:underline font-medium">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
