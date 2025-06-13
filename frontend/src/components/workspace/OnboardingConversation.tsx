import React, { useEffect, useState } from 'react';
import { ConversationalUI } from './ConversationalUI';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { OnboardingMessage } from '@/types/onboarding';
import { Message } from '@/types/message';

export function OnboardingConversation() {
  const {
    isConnected,
    isConnecting,
    connectionError,
    messages,
    isTyping,
    onboardingState,
    connect,
    disconnect,
    sendMessage,
    selectOption,
    submitForm,
    triggerAction
  } = useOnboarding();

  // Convert onboarding messages to the format expected by ConversationalUI
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);

  // Map onboarding messages to ConversationalUI message format
  useEffect(() => {
    const mappedMessages = messages.map((msg: OnboardingMessage): Message => {
      return {
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp).toISOString(),
        options: msg.options,
        formInputs: msg.formInputs,
        richContent: msg.richContent,
        actionCard: msg.actionCard
      };
    });
    
    setConversationMessages(mappedMessages);
  }, [messages]);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connect();
    }

    // Disconnect when component unmounts
    return () => {
      disconnect();
    };
  }, [isConnected, isConnecting, connect, disconnect]);

  // Handle sending messages
  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string, optionValue: string) => {
    selectOption(optionId, optionValue);
  };

  // Handle form submission
  const handleFormSubmit = (formData: Record<string, any>) => {
    submitForm(formData);
  };

  // Handle action trigger
  const handleActionTrigger = (actionType: string, actionData?: any) => {
    triggerAction(actionType, actionData);
  };

  // Handle file upload (placeholder for now)
  const handleFileUpload = (file: File) => {
    console.log('File upload:', file);
    // This would typically upload the file to a server endpoint
    // and then trigger an action via WebSocket
    triggerAction('upload', { fileName: file.name, fileSize: file.size });
  };

  if (connectionError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
        <Button 
          onClick={connect} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isConnecting}
        >
          <RefreshCw className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
          {isConnecting ? 'Connecting...' : 'Reconnect'}
        </Button>
      </div>
    );
  }

  return (
    <ConversationalUI
      messages={conversationMessages}
      onSendMessage={handleSendMessage}
      onFileUpload={handleFileUpload}
      isTyping={isTyping}
      isOnboarding={true}
      onboardingProgress={onboardingState ? {
        currentStep: onboardingState.currentStep,
        totalSteps: onboardingState.totalSteps,
        stepTitle: onboardingState.stepTitle,
        percentage: onboardingState.percentage
      } : undefined}
      onOptionSelect={handleOptionSelect}
      onFormSubmit={handleFormSubmit}
      onActionTrigger={handleActionTrigger}
    />
  );
}
