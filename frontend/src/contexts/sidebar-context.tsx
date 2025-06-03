'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for our context
interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'document' | 'link' | 'note';
}

interface Message {
  id: string;
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

interface SidebarContextType {
  // Sidebar state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  addConversation: (conversation: Omit<Conversation, 'id'>) => string;
  updateConversation: (id: string, data: Partial<Conversation>) => void;
  
  // Knowledge items
  knowledgeItems: KnowledgeItem[];
  addKnowledgeItem: (item: Omit<KnowledgeItem, 'id'>) => string;
  updateKnowledgeItem: (id: string, data: Partial<KnowledgeItem>) => void;
  removeKnowledgeItem: (id: string) => void;
  
  // Messages
  messages: Message[];
  addMessage: (message: Omit<Message, 'id'>) => string;
  clearMessages: () => void;
  
  // Typing indicator
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
}

// Create the context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Sample data
const sampleConversations: Conversation[] = [
  {
    id: '1',
    title: 'Product Inquiry',
    lastMessage: 'Do you have this in blue?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    unread: true,
  },
  {
    id: '2',
    title: 'Order Status',
    lastMessage: 'When will my order arrive?',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    unread: false,
  },
  {
    id: '3',
    title: 'Return Request',
    lastMessage: 'I need to return an item',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    unread: false,
  },
];

const sampleKnowledgeItems: KnowledgeItem[] = [
  {
    id: '1',
    title: 'Return Policy',
    content: 'Items can be returned within 30 days of purchase with receipt.',
    type: 'document',
  },
  {
    id: '2',
    title: 'Shipping Information',
    content: 'Standard shipping takes 3-5 business days.',
    type: 'note',
  },
  {
    id: '3',
    title: 'Product Catalog',
    content: 'https://example.com/catalog',
    type: 'link',
  },
];

const sampleMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    role: 'user',
    content: 'I have a question about my order',
    timestamp: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: '3',
    role: 'assistant',
    content: 'I\'d be happy to help with your order. Could you please provide your order number?',
    timestamp: new Date(Date.now() - 3400000).toISOString(),
  },
];

// Provider component
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>(sampleKnowledgeItems);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [isTyping, setIsTyping] = useState(false);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Add a new conversation
  const addConversation = (conversation: Omit<Conversation, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newConversation = { ...conversation, id };
    setConversations(prev => [newConversation, ...prev]);
    return id;
  };

  // Update an existing conversation
  const updateConversation = (id: string, data: Partial<Conversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, ...data } : conv
      )
    );
  };

  // Add a new knowledge item
  const addKnowledgeItem = (item: Omit<KnowledgeItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newItem = { ...item, id };
    setKnowledgeItems(prev => [...prev, newItem]);
    return id;
  };

  // Update an existing knowledge item
  const updateKnowledgeItem = (id: string, data: Partial<KnowledgeItem>) => {
    setKnowledgeItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...data } : item
      )
    );
  };

  // Remove a knowledge item
  const removeKnowledgeItem = (id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
  };

  // Add a new message
  const addMessage = (message: Omit<Message, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newMessage = { ...message, id };
    setMessages(prev => [...prev, newMessage]);
    
    // If there's an active conversation, update its last message
    if (activeConversationId) {
      updateConversation(activeConversationId, {
        lastMessage: message.content,
        timestamp: message.timestamp,
      });
    }
    
    return id;
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      // In a real app, we would fetch messages for the active conversation
      // For now, we'll just use our sample messages
      // This would be replaced with an API call
      console.log(`Loading messages for conversation ${activeConversationId}`);
    }
  }, [activeConversationId]);

  // Context value
  const value: SidebarContextType = {
    isSidebarOpen,
    toggleSidebar,
    conversations,
    activeConversationId,
    setActiveConversationId,
    addConversation,
    updateConversation,
    knowledgeItems,
    addKnowledgeItem,
    updateKnowledgeItem,
    removeKnowledgeItem,
    messages,
    addMessage,
    clearMessages,
    isTyping,
    setIsTyping,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}

// Custom hook to use the sidebar context
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
