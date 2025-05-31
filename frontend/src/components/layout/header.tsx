'use client';

import Link from 'next/link';
import { UserNav } from './user-nav';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, isLoading } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl text-[#1A4A3A]">CHIDI</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#1F2937]"
            >
              Dashboard
            </Link>
            {user && (
              <>
                <Link 
                  href="/products" 
                  className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#1F2937]"
                >
                  Products
                </Link>
                <Link 
                  href="/conversations" 
                  className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#1F2937]"
                >
                  Conversations
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user || isLoading ? (
            <UserNav />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#1A4A3A] hover:bg-[#1A4A3A]/90">
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
