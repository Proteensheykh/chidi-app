'use client';

import Link from 'next/link';
import { UserNav } from './user-nav';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Bell, Search, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, isLoading } = useAuth();
  const [notificationCount] = useState(5); // This would be fetched from an API in a real app
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white shadow-sm px-6">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A4A3A]">
              <span className="text-white font-bold text-lg">C</span>
            </div>
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
                <Link 
                  href="/workspace" 
                  className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#1F2937]"
                >
                  Workspace
                </Link>
              </>
            )}
          </nav>
        </div>
        
        {user && (
          <div className="hidden md:flex items-center relative mx-auto max-w-md flex-1 px-8">
            <Search className="absolute left-10 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 h-9 w-full bg-[#F8F9FA] border-[#E2E8F0] rounded-full"
            />
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-[#64748B]" />
                    {notificationCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#F472B6] hover:bg-[#F472B6] text-white"
                      >
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <Button variant="ghost" size="sm" className="text-xs text-[#0EA5E9]">
                      Mark all as read
                    </Button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">New conversation</p>
                          <span className="text-xs text-[#64748B]">10 min ago</span>
                        </div>
                        <p className="text-xs text-[#64748B]">Customer inquiry about product availability</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">Order placed</p>
                          <span className="text-xs text-[#64748B]">1 hour ago</span>
                        </div>
                        <p className="text-xs text-[#64748B]">New order #1234 has been placed</p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="justify-center">
                    <Link href="/dashboard/notifications" className="text-sm text-[#0EA5E9] w-full text-center">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <UserNav />
            </>
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
