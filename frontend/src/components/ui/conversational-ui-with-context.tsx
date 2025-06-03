'use client';

import { useState, useRef, useEffect } from 'react';
import { ConversationalUI } from './conversational-ui';
import { useSidebar } from '@/contexts/sidebar-context';

interface ConversationalUIWithContextProps {
  placeholder?: string;
  className?: string;
  conversationId?: string;
}

export function ConversationalUIWithContext({
  placeholder = 'Type a message...',
  className,
  conversationId
}: ConversationalUIWithContextProps) {
  const { 
    messages, 
    addMessage, 
    isTyping, 
    setIsTyping,
    activeConversationId,
    setActiveConversationId
  } = useSidebar();

  useEffect(() => {
    // Set the active conversation if conversationId is provided
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, activeConversationId, setActiveConversationId]);

  const handleSendMessage = (content: string) => {
    // Add user message to context
    addMessage({
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    });

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `I've received your message: "${content}". How else can I help you?`,
        timestamp: new Date().toISOString()
      });
      setIsTyping(false);
    }, 1500);
  };

  const handleOptionSelect = (option: string) => {
    handleSendMessage(option);
  };

  const handleFileUpload = (files: File[]) => {
    // Process uploaded files
    const fileList = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));

    // Add message with files
    addMessage({
      role: 'user',
      content: `Uploaded ${files.length} file${files.length > 1 ? 's' : ''}`,
      timestamp: new Date().toISOString(),
      files: fileList
    });

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `I've received your file${files.length > 1 ? 's' : ''}. Is there anything specific you'd like me to do with ${files.length > 1 ? 'them' : 'it'}?`,
        timestamp: new Date().toISOString()
      });
      setIsTyping(false);
    }, 1500);
  };

  return (
    <ConversationalUI
      messages={messages}
      onSendMessage={handleSendMessage}
      onOptionSelect={handleOptionSelect}
      onFileUpload={handleFileUpload}
      isLoading={isTyping}
      placeholder={placeholder}
      className={className}
    />
  );
}
