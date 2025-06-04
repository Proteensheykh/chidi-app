'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Package, 
  Settings, 
  Bell, 
  UserCircle,
  ShoppingCart,
  BarChart,
  HelpCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  variant: 'default' | 'ghost';
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const mainNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      variant: 'default',
    },
    {
      title: 'Conversations',
      href: '/conversations',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: 12, // Example badge count
      variant: 'default',
    },
    {
      title: 'Products',
      href: '/products',
      icon: <Package className="h-5 w-5" />,
      variant: 'default',
    },
    {
      title: 'Orders',
      href: '/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      badge: 3, // Example badge count
      variant: 'default',
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: <BarChart className="h-5 w-5" />,
      variant: 'default',
    },
  ];

  const utilityNavItems: NavItem[] = [
    {
      title: 'Workspace',
      href: '/workspace',
      icon: <UserCircle className="h-5 w-5" />,
      variant: 'ghost',
    },
    {
      title: 'Notifications',
      href: '/notifications',
      icon: <Bell className="h-5 w-5" />,
      badge: 5, // Example badge count
      variant: 'ghost',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      variant: 'ghost',
    },
    {
      title: 'Help',
      href: '/help',
      icon: <HelpCircle className="h-5 w-5" />,
      variant: 'ghost',
    },
  ];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <div className="px-3 py-2">
            <h3 className="text-xs font-medium text-[#64748B]">Main</h3>
          </div>
          
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#E8F2ED] text-[#1A4A3A]"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1F2937]"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <Badge className="ml-auto bg-[#F472B6] hover:bg-[#F472B6] text-white">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
          
          <div className="mt-4 px-3 py-2">
            <h3 className="text-xs font-medium text-[#64748B]">Utilities</h3>
          </div>
          
          {utilityNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#E8F2ED] text-[#1A4A3A]"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1F2937]"
                )}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.badge && (
                  <Badge className="ml-auto bg-[#F472B6] hover:bg-[#F472B6] text-white">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {user && (
        <div className="mt-auto border-t border-[#E2E8F0] p-4">
          <div className="flex items-center gap-3 rounded-lg bg-[#F8F9FA] p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A4A3A] text-white">
              {user.user_metadata?.full_name ? 
                user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
                'U'
              }
            </div>
            <div className="flex-1 truncate">
              <div className="text-sm font-medium">
                {user.user_metadata?.full_name || 'User'}
              </div>
              <div className="truncate text-xs text-[#64748B]">
                {user.email || 'user@example.com'}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-[#64748B]">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
