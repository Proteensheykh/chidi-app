'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // For development with mock data, just redirect to dashboard after a delay
    if (process.env.NODE_ENV === 'development') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // For production, exchange the code for a session
    const handleAuthCallback = async () => {
      const code = searchParams.get('code');
      
      if (code) {
        const supabase = createClient();
        
        // Exchange the code for a session
        await supabase.auth.exchangeCodeForSession(code);
        
        // Redirect to the dashboard or the original redirect URL
        router.push('/dashboard');
      }
    };
    
    handleAuthCallback();
  }, [router, searchParams]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA]">
      <Card className="w-full max-w-md border border-[#E2E8F0] shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Icons.spinner className="h-8 w-8 animate-spin text-[#1A4A3A]" />
          <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">Completing sign in...</h2>
          <p className="mt-2 text-[#64748B]">Please wait while we authenticate your account.</p>
        </CardContent>
      </Card>
    </div>
  );
}
