'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    conversations: 0,
    pendingResponses: 0,
  });

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setStats({
          products: 12,
          conversations: 5,
          pendingResponses: 2,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <CardDescription>Your inventory items</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 w-12 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.products}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <CardDescription>Across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 w-12 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.conversations}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
            <CardDescription>Messages needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-6 w-12 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.pendingResponses}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border p-3">
                  <div className="flex justify-between">
                    <div className="font-medium">New message from customer</div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Facebook: John D. asked about product availability</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex justify-between">
                    <div className="font-medium">Inventory update</div>
                    <div className="text-sm text-muted-foreground">Yesterday</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Product "Premium Widget" is low in stock (2 remaining)</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <button className="flex items-center justify-center rounded-lg border border-dashed p-4 transition-colors hover:bg-accent">
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="i-lucide-package h-6 w-6" />
                  <span className="text-sm font-medium">Add Product</span>
                </div>
              </button>
              <button className="flex items-center justify-center rounded-lg border border-dashed p-4 transition-colors hover:bg-accent">
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="i-lucide-message-square h-6 w-6" />
                  <span className="text-sm font-medium">View Messages</span>
                </div>
              </button>
              <button className="flex items-center justify-center rounded-lg border border-dashed p-4 transition-colors hover:bg-accent">
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="i-lucide-users h-6 w-6" />
                  <span className="text-sm font-medium">Customer List</span>
                </div>
              </button>
              <button className="flex items-center justify-center rounded-lg border border-dashed p-4 transition-colors hover:bg-accent">
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="i-lucide-bar-chart h-6 w-6" />
                  <span className="text-sm font-medium">View Reports</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
