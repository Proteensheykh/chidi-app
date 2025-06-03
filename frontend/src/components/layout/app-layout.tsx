'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageSquare, Package, BarChart, ShoppingCart,
  Bell, Search, Filter, ArrowRight, LayoutDashboard,
  UserCircle
} from 'lucide-react';
import { MobileResponsiveLayout } from './mobile-responsive-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  href: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  read: boolean;
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showFeatureCards?: boolean;
  showAlerts?: boolean;
  showTabs?: boolean;
  showSearch?: boolean;
}

const featureCards: FeatureCard[] = [
  {
    title: 'Conversations',
    description: 'Manage customer interactions',
    icon: <MessageSquare className="h-5 w-5" />,
    color: '#1A4A3A',
    count: 12,
    href: '/dashboard/conversations',
  },
  {
    title: 'Products',
    description: 'View and edit your catalog',
    icon: <Package className="h-5 w-5" />,
    color: '#3B82F6',
    count: 24,
    href: '/dashboard/products',
  },
  {
    title: 'Workspace',
    description: 'Manage your workspace',
    icon: <UserCircle className="h-5 w-5" />,
    color: '#F472B6',
    count: 0,
    href: '/dashboard/workspace',
  },
  {
    title: 'Context Workspace',
    description: 'Context-aware workspace',
    icon: <MessageSquare className="h-5 w-5" />,
    color: '#10B981',
    count: 0,
    href: '/dashboard/workspace/context',
  },
  {
    title: 'Dashboard',
    description: 'View key metrics',
    icon: <LayoutDashboard className="h-5 w-5" />,
    color: '#F59E0B',
    count: 3,
    href: '/dashboard',
  },
];

const recentAlerts: Alert[] = [
  {
    id: '1',
    title: 'New conversation',
    description: 'Customer inquiry about product availability',
    timestamp: '10 min ago',
    icon: <MessageSquare className="h-4 w-4" />,
    read: false,
  },
  {
    id: '2',
    title: 'Order placed',
    description: 'New order #1234 has been placed',
    timestamp: '1 hour ago',
    icon: <ShoppingCart className="h-4 w-4" />,
    read: true,
  },
  {
    id: '3',
    title: 'Product update',
    description: 'Inventory updated for 3 products',
    timestamp: '2 hours ago',
    icon: <Package className="h-4 w-4" />,
    read: true,
  },
];

export function AppLayout({ 
  children, 
  title = 'Dashboard',
  showFeatureCards = true,
  showAlerts = true,
  showTabs = true,
  showSearch = true
}: AppLayoutProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('overview');

  // Determine active tab based on pathname
  const getActiveTabFromPathname = () => {
    if (pathname?.includes('/products')) return 'products';
    if (pathname?.includes('/conversations')) return 'conversations';
    if (pathname?.includes('/settings')) return 'settings';
    return 'overview';
  };

  return (
    <MobileResponsiveLayout title={title}>
      <div className="space-y-6">
        {/* Feature Cards */}
        {showFeatureCards && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <Link href={card.href} key={card.title} className="block transition-transform hover:scale-[1.02]">
                <Card className="border border-[#E2E8F0] h-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <div 
                      className="rounded-full p-2" 
                      style={{ backgroundColor: `${card.color}20` }}
                    >
                      <div className="text-white" style={{ color: card.color }}>
                        {card.icon}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.count}</div>
                    <p className="text-xs text-[#64748B]">{card.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="text-xs text-[#1A4A3A] font-medium flex items-center">
                      View details
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Recent Alerts */}
        {showAlerts && (
          <Card className="border border-[#E2E8F0]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
                <Button variant="ghost" size="icon" className="text-[#64748B]">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
              <CardDescription>Stay updated with the latest activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 rounded-lg border border-[#E2E8F0] p-3">
                      <div 
                        className="rounded-full p-2 mt-1" 
                        style={{ 
                          backgroundColor: alert.read ? '#F1F5F9' : '#E8F2ED',
                          color: alert.read ? '#64748B' : '#1A4A3A'
                        }}
                      >
                        {alert.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{alert.title}</h4>
                          <span className="text-xs text-[#64748B]">{alert.timestamp}</span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-1">{alert.description}</p>
                      </div>
                      {!alert.read && (
                        <Badge className="bg-[#F472B6] hover:bg-[#F472B6] text-white text-[10px] h-5">
                          New
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-[#64748B]">No recent alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Different Sections */}
        {showTabs && (
          <Tabs 
            defaultValue="overview" 
            value={activeTab || getActiveTabFromPathname()} 
            onValueChange={setActiveTab}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <TabsList className="bg-[#F1F5F9]">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-[#1A4A3A]">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:text-[#1A4A3A]">
                  Products
                </TabsTrigger>
                <TabsTrigger value="conversations" className="data-[state=active]:bg-white data-[state=active]:text-[#1A4A3A]">
                  Conversations
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-[#1A4A3A]">
                  Settings
                </TabsTrigger>
              </TabsList>

              {showSearch && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#64748B]" />
                    <Input 
                      type="search" 
                      placeholder="Search..." 
                      className="pl-8 h-9 w-full sm:w-[180px] bg-[#F8F9FA] border-[#E2E8F0]"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="h-9 border-[#E2E8F0]">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="overview" className="mt-0">
              {children}
            </TabsContent>
            
            <TabsContent value="products" className="mt-0">
              {pathname?.includes('/products') ? children : (
                <div className="rounded-lg border border-[#E2E8F0] p-4">
                  <h3 className="text-lg font-semibold mb-4">Products</h3>
                  <p className="text-[#64748B]">Your product catalog will appear here.</p>
                  <Button asChild className="mt-4 bg-[#1A4A3A] hover:bg-[#143C2E]">
                    <Link href="/dashboard/products">View Products</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="conversations" className="mt-0">
              {pathname?.includes('/conversations') ? children : (
                <div className="rounded-lg border border-[#E2E8F0] p-4">
                  <h3 className="text-lg font-semibold mb-4">Conversations</h3>
                  <p className="text-[#64748B]">Your customer conversations will appear here.</p>
                  <Button asChild className="mt-4 bg-[#1A4A3A] hover:bg-[#143C2E]">
                    <Link href="/dashboard/conversations">View Conversations</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              {pathname?.includes('/settings') ? children : (
                <div className="rounded-lg border border-[#E2E8F0] p-4">
                  <h3 className="text-lg font-semibold mb-4">Settings</h3>
                  <p className="text-[#64748B]">Configure your dashboard settings here.</p>
                  <Button asChild className="mt-4 bg-[#1A4A3A] hover:bg-[#143C2E]">
                    <Link href="/dashboard/settings">View Settings</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* If not showing tabs, render children directly */}
        {!showTabs && children}
      </div>
    </MobileResponsiveLayout>
  );
}
