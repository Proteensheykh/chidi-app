import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { WebSocketService, WebSocketEvent } from '@/services/websocket';
import { OnboardingMessage, OnboardingState, MessageOption, FormInput } from '@/types/onboarding';

interface OnboardingContextType {
  // WebSocket connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Onboarding state
  onboardingState: OnboardingState | null;
  messages: OnboardingMessage[];
  isTyping: boolean;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  sendMessage: (content: string) => void;
  selectOption: (optionId: string, optionValue: string) => void;
  submitForm: (formData: Record<string, any>) => void;
  triggerAction: (actionType: string, actionData?: any) => void;
}

const defaultOnboardingState: OnboardingState = {
  currentStep: 1,
  totalSteps: 5,
  stepTitle: 'Welcome',
  percentage: 0,
  businessData: {},
  conversationHistory: []
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = useSupabaseClient();
  const user = useUser();
  
  // WebSocket connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Onboarding state
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // WebSocket service reference
  const wsServiceRef = useRef<WebSocketService | null>(null);
  
  // Initialize WebSocket service when user is authenticated
  useEffect(() => {
    if (!user) return;
    
    const initWebSocket = async () => {
      try {
        // Get session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No access token available');
        }
        
        // Create WebSocket service
        wsServiceRef.current = new WebSocketService(session.access_token);
        
        return true;
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        setConnectionError('Failed to initialize WebSocket connection');
        return false;
      }
    };
    
    initWebSocket();
    
    return () => {
      // Clean up WebSocket connection on unmount
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    };
  }, [user, supabase]);
  
  // WebSocket event handler
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    switch (event.type) {
      case 'connected':
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        break;
        
      case 'disconnected':
        setIsConnected(false);
        break;
        
      case 'error':
        setConnectionError(event.error || 'Unknown WebSocket error');
        break;
        
      case 'message':
        if (event.message) {
          setMessages(prev => [...prev, event.message!]);
        }
        break;
        
      case 'typing_indicator':
        setIsTyping(!!event.isTyping);
        break;
        
      case 'onboarding_state':
        if (event.onboardingState) {
          setOnboardingState(event.onboardingState);
          // Update messages from conversation history if available
          if (event.onboardingState.conversationHistory?.length) {
            setMessages(event.onboardingState.conversationHistory);
          }
        }
        break;
        
      default:
        break;
    }
  }, []);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!wsServiceRef.current) {
      setConnectionError('WebSocket service not initialized');
      return;
    }
    
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    
    // Add event listener
    const removeListener = wsServiceRef.current.addListener(handleWebSocketEvent);
    
    // Connect to WebSocket
    wsServiceRef.current.connect();
    
    // Clean up listener on unmount
    return () => {
      removeListener();
    };
  }, [isConnected, isConnecting, handleWebSocketEvent]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (!wsServiceRef.current) return;
    
    wsServiceRef.current.disconnect();
    setIsConnected(false);
  }, []);
  
  // Send message
  const sendMessage = useCallback((content: string) => {
    if (!wsServiceRef.current || !isConnected) {
      setConnectionError('WebSocket not connected');
      return;
    }
    
    // Add user message to local state immediately for UI responsiveness
    const userMessage: OnboardingMessage = {
      id: `local-${Date.now()}`,
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageType: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send message through WebSocket
    wsServiceRef.current.sendMessage(content);
  }, [isConnected]);
  
  // Select option
  const selectOption = useCallback((optionId: string, optionValue: string) => {
    if (!wsServiceRef.current || !isConnected) {
      setConnectionError('WebSocket not connected');
      return;
    }
    
    // Add user selection to local state immediately
    const userSelection: OnboardingMessage = {
      id: `local-${Date.now()}`,
      content: optionValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageType: 'option_selection'
    };
    
    setMessages(prev => [...prev, userSelection]);
    
    // Send option selection through WebSocket
    wsServiceRef.current.sendOptionSelection(optionId, optionValue);
  }, [isConnected]);
  
  // Submit form
  const submitForm = useCallback((formData: Record<string, any>) => {
    if (!wsServiceRef.current || !isConnected) {
      setConnectionError('WebSocket not connected');
      return;
    }
    
    // Add form submission to local state immediately
    const formSubmission: OnboardingMessage = {
      id: `local-${Date.now()}`,
      content: 'Form submitted',
      sender: 'user',
      timestamp: new Date().toISOString(),
      messageType: 'form_submission'
    };
    
    setMessages(prev => [...prev, formSubmission]);
    
    // Send form submission through WebSocket
    wsServiceRef.current.sendFormSubmission(formData);
  }, [isConnected]);
  
  // Trigger action
  const triggerAction = useCallback((actionType: string, actionData?: any) => {
    if (!wsServiceRef.current || !isConnected) {
      setConnectionError('WebSocket not connected');
      return;
    }
    
    // Send action trigger through WebSocket
    wsServiceRef.current.sendActionTrigger(actionType, actionData);
  }, [isConnected]);
  
  // Initialize onboarding state when connected
  useEffect(() => {
    if (isConnected && !onboardingState) {
      setOnboardingState(defaultOnboardingState);
    }
  }, [isConnected, onboardingState]);
  
  const contextValue: OnboardingContextType = {
    isConnected,
    isConnecting,
    connectionError,
    onboardingState,
    messages,
    isTyping,
    connect,
    disconnect,
    sendMessage,
    selectOption,
    submitForm,
    triggerAction
  };
  
  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
