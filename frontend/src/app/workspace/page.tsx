'use client';

import { useState } from 'react';
import { AppLayoutWithContext } from '@/components/layout/app-layout-with-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock workspace data
  const workspaceData = {
    name: 'My Business',
    type: 'E-commerce',
    createdAt: new Date().toLocaleDateString(),
    description: 'Online store selling handmade products',
    products: 24,
    conversations: 12,
    insights: [
      { title: 'Top Product', value: 'Handmade Soap', change: '+12%' },
      { title: 'Customer Satisfaction', value: '4.8/5', change: '+0.2' },
      { title: 'Response Time', value: '2.4h', change: '-15%' }
    ]
  };

  return (
    <AppLayoutWithContext title="Workspace">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A4A3A]">{workspaceData.name}</h1>
            <p className="text-[#64748B]">{workspaceData.type} • Created {workspaceData.createdAt}</p>
          </div>
          <Button asChild className="bg-[#1A4A3A] hover:bg-[#0D3625]">
            <Link href="/workspace/chat">
              <Icons.messageSquare className="mr-2 h-4 w-4" />
              Chat with Assistant
            </Link>
          </Button>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Overview</CardTitle>
                <CardDescription>
                  Key information about your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#64748B]">Description</h3>
                    <p className="mt-1">{workspaceData.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {workspaceData.insights.map((insight, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-[#64748B]">{insight.title}</span>
                            <div className="flex items-end justify-between mt-1">
                              <span className="text-2xl font-bold">{insight.value}</span>
                              <span className={`text-sm ${insight.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {insight.change}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Export Data</Button>
                <Button className="bg-[#1A4A3A] hover:bg-[#0D3625]">Update Information</Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    You have {workspaceData.products} products in your catalog
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border border-dashed border-[#E2E8F0] rounded-md">
                    <div className="flex flex-col items-center text-[#64748B]">
                      <Icons.package className="h-8 w-8 mb-2" />
                      <p>Product distribution chart</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/workspace/products">
                      <Icons.plus className="mr-2 h-4 w-4" />
                      Manage Products
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                  <CardDescription>
                    You have {workspaceData.conversations} recent conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border border-dashed border-[#E2E8F0] rounded-md">
                    <div className="flex flex-col items-center text-[#64748B]">
                      <Icons.messageSquare className="h-8 w-8 mb-2" />
                      <p>Conversation analytics</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/workspace/conversations">
                      <Icons.messageSquare className="mr-2 h-4 w-4" />
                      View Conversations
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Manage your product catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[400px] border border-dashed border-[#E2E8F0] rounded-md">
                  <div className="flex flex-col items-center text-[#64748B]">
                    <Icons.package className="h-12 w-12 mb-4" />
                    <p className="text-lg mb-2">No products to display</p>
                    <p>Add products to your workspace to see them here</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-[#1A4A3A] hover:bg-[#0D3625]">
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Settings</CardTitle>
                <CardDescription>
                  Manage your workspace preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#64748B]">Workspace Name</h3>
                    <p className="mt-1">{workspaceData.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#64748B]">Business Type</h3>
                    <p className="mt-1">{workspaceData.type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#64748B]">Description</h3>
                    <p className="mt-1">{workspaceData.description}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="bg-[#1A4A3A] hover:bg-[#0D3625]">
                  <Icons.settings className="mr-2 h-4 w-4" />
                  Edit Workspace
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayoutWithContext>
  );
}
