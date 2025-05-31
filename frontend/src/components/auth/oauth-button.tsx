'use client';

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/ui/icons";

interface OAuthButtonProps {
  provider: 'google';
  label?: string;
  className?: string;
}

export function OAuthButton({ provider, label, className }: OAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleOAuthSignIn() {
    try {
      setIsLoading(true);
      
      // For now, we'll use a mock implementation that simulates success
      // In production, this would be replaced with the actual Supabase call
      if (process.env.NODE_ENV === 'development') {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to dashboard (simulating successful auth)
        router.push('/dashboard');
        return;
      }
      
      // This is the actual implementation that would be used in production
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('OAuth error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      className={className || "w-full bg-white text-slate-800 hover:bg-slate-50"}
      onClick={handleOAuthSignIn}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" />
      )}
      {label || `Sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
    </Button>
  );
}
