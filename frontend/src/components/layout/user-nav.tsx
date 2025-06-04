'use client';

import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UserNav() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();
  
  // Use mock data for development, real user data in production
  const userData = user ? {
    name: user.user_metadata?.full_name || 'User',
    email: user.email || '',
    avatarUrl: user.user_metadata?.avatar_url || '',
  } : {
    name: 'Demo User',
    email: 'user@example.com',
    avatarUrl: '',
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      router.push('/auth/login');
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Icons.spinner className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  const initials = userData.name
    .split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-[#E8F2ED]">
            <AvatarImage src={userData.avatarUrl} alt={userData.name} />
            <AvatarFallback className="bg-[#1A4A3A] text-white">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-10 w-10 border-2 border-[#E8F2ED]">
              <AvatarImage src={userData.avatarUrl} alt={userData.name} />
              <AvatarFallback className="bg-[#1A4A3A] text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userData.name}</p>
              <p className="text-xs leading-none text-[#64748B]">{userData.email}</p>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center">
              <Icons.user className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center">
              <Icons.settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/help" className="flex items-center">
              <Icons.helpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleSignOut}
        >
          <Icons.logout className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
