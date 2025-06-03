'use client';

import { useState } from 'react';
import { AppLayoutWithContext } from '@/components/layout/app-layout-with-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConversationalUIWithContext } from '@/components/ui/conversational-ui-with-context';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export default function WorkspaceChatPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <AppLayoutWithContext title="Workspace Chat">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1A4A3A]">Workspace Assistant</h1>
            <p className="text-[#64748B]">Ask questions about your business and get AI-powered assistance</p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden md:flex"
          >
            <Icons.maximize className="h-4 w-4" />
          </Button>
        </div>

        <Card className={`${isFullscreen ? 'h-[calc(100vh-12rem)]' : 'h-[600px]'} transition-all duration-300`}>
          <CardHeader className="border-b border-[#E2E8F0] pb-3">
            <CardTitle className="text-lg">Chat with CHIDI</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            <ConversationalUIWithContext
              placeholder="Ask anything about your business..."
              className="h-full"
            />
          </CardContent>
        </Card>
      </div>
    </AppLayoutWithContext>
  );
}
