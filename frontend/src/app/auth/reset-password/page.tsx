'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { Icons } from '@/components/ui/icons';

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ResetFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(data.email);
      
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
      <div className="flex flex-col min-h-screen items-center justify-center px-4 py-12 bg-[#121212]">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2 auth-heading">Check your email</h1>
          <p className="text-[#A1A1AA] auth-subtext">
            We've sent you a password reset link. Please check your email and follow the instructions to reset your password.
          </p>
        </div>
        <Card className="w-full max-w-md border border-[#E2E8F0] shadow-md bg-white">
          <CardHeader className="space-y-1">
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
        <h1 className="text-2xl font-bold text-white mb-2 auth-heading">Reset your password</h1>
        <p className="text-[#A1A1AA] auth-subtext">
          Enter your email address and we will send you a link to reset your password
        </p>
      </div>
      <Card className="w-full max-w-md border border-[#E2E8F0] shadow-md bg-white">
        <CardHeader className="space-y-1">
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
              <Button 
                type="submit" 
                className="w-full bg-[#1A4A3A] hover:bg-[#1A4A3A]/90 text-white rounded-full h-12" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pt-0 pb-6">
          <div className="text-sm text-center">
            <Link href="/auth/login" className="text-[#1A4A3A] hover:underline font-medium">
              Back to login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
