'use client';

import { useState } from 'react';
import { AppLayoutWithContext } from '@/components/layout/app-layout-with-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ConversationalUIWithContext } from '@/components/ui/conversational-ui-with-context';
import { useSidebar } from '@/contexts/sidebar-context';
import { Icons } from '@/components/ui/icons';

export default function WorkspaceContextPage() {
  const [activeTab, setActiveTab] = useState('assistant');
  const { 
    knowledgeItems, 
    addKnowledgeItem, 
    conversations, 
    activeConversationId, 
    setActiveConversationId 
  } = useSidebar();

  return (
    <AppLayoutWithContext title="Workspace">
      <div className="container py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1A4A3A]">Workspace Context</h1>
              <p className="text-[#64748B]">Manage your workspace with context-aware features</p>
            </div>
          </div>
          
          <Tabs defaultValue="assistant" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="assistant">Assistant</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assistant" className="space-y-6">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle>Context-Aware Assistant</CardTitle>
                  <CardDescription>
                    This assistant is connected to your knowledge base and conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ConversationalUIWithContext
                    placeholder="Ask your assistant something..."
                    className="h-full"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="knowledge" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>
                    Documents and information the assistant can reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {knowledgeItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 border border-[#E2E8F0] rounded-md bg-[#F8FAFC] hover:bg-[#E8F2ED] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E8F2ED] flex items-center justify-center text-[#1A4A3A]">
                              {item.type === 'document' ? (
                                <Icons.file className="h-4 w-4" />
                              ) : item.type === 'link' ? (
                                <Icons.link className="h-4 w-4" />
                              ) : (
                                <Icons.file className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{item.title}</h3>
                              <p className="text-sm text-[#64748B] truncate max-w-md">{item.content}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Icons.chevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      className="w-full mt-4 bg-[#1A4A3A] hover:bg-[#0D3625]"
                    >
                      <Icons.plus className="mr-2 h-4 w-4" />
                      Add Knowledge Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="conversations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversations</CardTitle>
                  <CardDescription>
                    Recent conversations with customers and team members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conversations.map((conversation) => (
                      <div 
                        key={conversation.id} 
                        className={`p-4 border rounded-md hover:bg-[#E8F2ED] transition-colors cursor-pointer ${
                          activeConversationId === conversation.id 
                            ? 'border-[#1A4A3A] bg-[#E8F2ED]' 
                            : 'border-[#E2E8F0] bg-[#F8FAFC]'
                        }`}
                        onClick={() => setActiveConversationId(conversation.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{conversation.title}</h3>
                              {conversation.unread && (
                                <span className="w-2 h-2 rounded-full bg-[#1A4A3A]"></span>
                              )}
                            </div>
                            <p className="text-sm text-[#64748B] truncate max-w-md">{conversation.lastMessage}</p>
                          </div>
                          <div className="text-xs text-[#64748B]">
                            {new Date(conversation.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      className="w-full mt-4 bg-[#1A4A3A] hover:bg-[#0D3625]"
                    >
                      <Icons.plus className="mr-2 h-4 w-4" />
                      New Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayoutWithContext>
  );
}
