'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { Icons } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import { OAuthButton } from '@/components/auth/oauth-button';
import { AuthTabs } from '@/components/auth/auth-tabs';
import { Checkbox } from '@/components/ui/checkbox';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(data.email, data.password, data.rememberMe);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      router.push(redirectTo);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12 bg-[#121212] auth-container">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-2 auth-heading">Welcome back</h1>
        <p className="text-[#A1A1AA] auth-subtext">
          Sign in to enjoy the best managing experience
        </p>
      </div>
      <Card className="w-full max-w-md border border-[#E2E8F0] shadow-md bg-white">
        <CardHeader className="space-y-1">
          <AuthTabs defaultTab="login" />
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
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="pl-10 pr-10 bg-white border-[#E2E8F0] h-12" 
                          {...field} 
                        />
                      </FormControl>
                      <button 
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          id="rememberMe" 
                          className="border-[#E2E8F0] data-[state=checked]:bg-[#1A4A3A]" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <label htmlFor="rememberMe" className="text-sm text-[#64748B] cursor-pointer">Remember me</label>
                    </div>
                  )}
                />
                <Link href="/auth/reset-password" className="text-sm text-[#1A4A3A] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#1A4A3A] hover:bg-[#1A4A3A]/90 text-white rounded-full h-12" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
              
              <div className="text-center my-4 text-sm text-[#64748B]">
                Or login with
              </div>
              
              <div className="flex justify-center">
                <OAuthButton 
                  provider="google" 
                  className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1F2937] h-12 rounded-full" 
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pt-0 pb-6">
          <div className="text-sm text-center text-[#64748B]">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-[#1A4A3A] hover:underline font-medium">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
