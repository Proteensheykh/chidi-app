'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobileResponsiveLayout } from '@/components/layout/mobile-responsive-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversationalUI } from '@/components/ui/conversational-ui';
import { Icons } from '@/components/ui/icons';

// Mock workspace data
const mockWorkspaceData = {
  name: 'My Business',
  industry: 'E-commerce',
  description: 'Online store selling handmade products',
  createdAt: new Date().toISOString(),
  socialAccounts: [
    { platform: 'Instagram', handle: '@mybusiness' },
    { platform: 'Facebook', handle: 'My Business' }
  ],
  productCategories: ['Handmade Crafts', 'Home Decor', 'Gifts'],
  aiPreferences: {
    tone: 'friendly',
    responseStyle: 'conversational',
    autoRespond: true
  }
};

// Define the Message type to match the ConversationalUI component
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  options?: string[];
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
}

// Mock conversation history
const mockConversationHistory: Message[] = [
  {
    role: 'assistant',
    content: 'Welcome to your CHIDI workspace! How can I help you today?',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    role: 'user',
    content: 'I need to update my business description',
    timestamp: new Date(Date.now() - 3500000).toISOString()
  },
  {
    role: 'assistant',
    content: 'Sure, I can help with that. What would you like your new business description to be?',
    timestamp: new Date(Date.now() - 3400000).toISOString()
  }
];

export default function WorkspacePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [messages, setMessages] = useState(mockConversationHistory);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = (message: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: `I've received your message: "${message}". How else can I help with your workspace?`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleOptionSelect = (option: string) => {
    handleSendMessage(option);
  };
  
  return (
    <MobileResponsiveLayout>
      <div className="container py-6 px-4 md:px-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1A4A3A]">{mockWorkspaceData.name}</h1>
              <p className="text-[#64748B]">{mockWorkspaceData.industry} • Created {new Date(mockWorkspaceData.createdAt).toLocaleDateString()}</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/workspace/setup')}
              className="bg-[#1A4A3A] hover:bg-[#0D3625]"
            >
              <Icons.settings className="mr-2 h-4 w-4" />
              Update Workspace
            </Button>
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="assistant">Assistant</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-[#64748B]">Description</h3>
                        <p>{mockWorkspaceData.description}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[#64748B]">Product Categories</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {mockWorkspaceData.productCategories.map((category, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-1 bg-[#E8F2ED] text-[#1A4A3A] text-xs rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Social Accounts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockWorkspaceData.socialAccounts.map((account, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-md">
                          <div className="w-8 h-8 rounded-full bg-[#E8F2ED] flex items-center justify-center text-[#1A4A3A]">
                            {account.platform === 'Instagram' ? <Icons.messageSquare className="h-4 w-4" /> : <Icons.messageSquare className="h-4 w-4" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{account.platform}</h3>
                            <p className="text-sm text-[#64748B]">{account.handle}</p>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-2">
                        <Icons.plus className="mr-2 h-4 w-4" />
                        Add Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>AI Assistant Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#F8FAFC] rounded-md">
                        <h3 className="font-medium mb-1">Tone</h3>
                        <p className="text-sm text-[#64748B] capitalize">{mockWorkspaceData.aiPreferences.tone}</p>
                      </div>
                      <div className="p-4 bg-[#F8FAFC] rounded-md">
                        <h3 className="font-medium mb-1">Response Style</h3>
                        <p className="text-sm text-[#64748B] capitalize">{mockWorkspaceData.aiPreferences.responseStyle}</p>
                      </div>
                      <div className="p-4 bg-[#F8FAFC] rounded-md">
                        <h3 className="font-medium mb-1">Auto-Respond</h3>
                        <p className="text-sm text-[#64748B]">{mockWorkspaceData.aiPreferences.autoRespond ? 'Enabled' : 'Disabled'}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Icons.settings className="mr-2 h-4 w-4" />
                      Customize AI Settings
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="assistant" className="space-y-6">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Workspace Assistant</CardTitle>
                  <CardDescription>
                    Chat with your AI assistant to manage your workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ConversationalUI
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onOptionSelect={handleOptionSelect}
                    isLoading={isLoading}
                    placeholder="Ask your assistant something..."
                    className="h-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Settings</CardTitle>
                  <CardDescription>
                    Manage your workspace configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button 
                      onClick={() => router.push('/dashboard/workspace/setup')}
                      className="w-full"
                    >
                      <Icons.settings className="mr-2 h-4 w-4" />
                      Edit Workspace Information
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                    >
                      <Icons.messageSquare className="mr-2 h-4 w-4" />
                      Manage Social Accounts
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                    >
                      <Icons.package className="mr-2 h-4 w-4" />
                      Manage Product Categories
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                    >
                      <Icons.user className="mr-2 h-4 w-4" />
                      Team Members
                    </Button>
                    <Button 
                      variant="destructive"
                      className="w-full"
                    >
                      <Icons.trash className="mr-2 h-4 w-4" />
                      Delete Workspace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MobileResponsiveLayout>
  );
}
