"use client";

import { useState, useEffect, useRef } from "react";
import { ConversationalUI } from "./ConversationalUI";
import { MessageType, OnboardingProgressType } from "@/types/message";
import { Card } from "@/components/ui/card";
import { WebSocketService, WebSocketEvent } from "@/services/websocket";
import { useAuth } from "@/contexts/auth-context";

// Define the onboarding steps
const ONBOARDING_STEPS = [
  { id: 1, title: "Business Information" },
  { id: 2, title: "Target Audience" },
  { id: 3, title: "Business Goals" },
  { id: 4, title: "Product Information" },
  { id: 5, title: "Complete" }
];

// Sample initial messages to start the conversation
const INITIAL_MESSAGES: MessageType[] = [
  {
    id: "welcome-1",
    content: "Welcome to CHIDI! I'm here to help you set up your business profile. This will help me assist you better later.",
    sender: "assistant",
    timestamp: new Date()
  },
  {
    id: "welcome-2",
    content: "Let's start with some basic info. What's your business name?",
    sender: "assistant",
    timestamp: new Date()
  }
];

interface OnboardingFormProps {
  onComplete?: (businessData: Record<string, string>) => void;
  initialBusinessData?: Record<string, string>;
}

export function OnboardingForm({ onComplete, initialBusinessData = {} }: OnboardingFormProps) {
  const [messages, setMessages] = useState<MessageType[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [businessData, setBusinessData] = useState<Record<string, string>>(initialBusinessData);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState<OnboardingProgressType>({
    percentage: 0,
    currentStep: 1,
    totalSteps: ONBOARDING_STEPS.length,
    stepTitle: ONBOARDING_STEPS[0].title
  });
  
  const { session } = useAuth();
  const websocketRef = useRef<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  // Initialize WebSocket when component mounts
  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const initializeWebSocket = () => {
      try {
        // Check if we have a valid session with a token
        if (!session || !session.access_token) {
          console.warn("No authenticated session found - enabling fallback mode");
          if (isMounted) {
            setConnectionError("No authenticated session found");
            setFallbackMode(true);
          }
          return;
        }
        
        // For development, use the dev token that bypasses backend auth
        // In production, this would be removed and only the real token would be used
        const isDev = process.env.NODE_ENV === "development";
        const wsToken = isDev ? "dev-token-123" : session.access_token;
        
        console.log(`Using ${isDev ? "development" : "production"} token for WebSocket`);
        
        // Prevent multiple WebSocket connections
        if (websocketRef.current) {
          console.log("WebSocket already initialized, skipping");
          return;
        }
        
        // Create WebSocket service with auth token
        const ws = new WebSocketService(wsToken);
        websocketRef.current = ws;
        
        // Add event listener
        const removeListener = ws.addListener(handleWebSocketEvent);
        
        // Connect to WebSocket
        ws.connect();
        
        // Set a timeout to enable fallback mode if connection fails
        const connectionTimeout = setTimeout(() => {
          if (isMounted && !isConnected) {
            console.warn("WebSocket connection timeout - enabling fallback mode");
            setConnectionError("Connection timeout - using local responses");
            setFallbackMode(true);
          }
        }, 5000);
        
        // Clean up WebSocket connection when component unmounts
        return () => {
          isMounted = false;
          clearTimeout(connectionTimeout);
          removeListener();
          websocketRef.current?.disconnect();
          websocketRef.current = null;
        };
      } catch (error) {
        console.error("Error initializing WebSocket:", error);
        if (isMounted) {
          setConnectionError("Failed to connect to the server");
          setFallbackMode(true);
        }
      }
    };
    
    initializeWebSocket();
    
    return () => {
      isMounted = false;
    };
  }, [session]); // Remove isConnected from dependencies to prevent reconnection loops
  
  // Handle WebSocket events
  const handleWebSocketEvent = (event: WebSocketEvent) => {
    switch (event.type) {
      case 'connected':
        setIsConnected(true);
        setConnectionError(null);
        break;
        
      case 'disconnected':
        setIsConnected(false);
        break;
        
      case 'message':
        if (event.message) {
          const newMessage: MessageType = {
            id: event.message.id || `assistant-${Date.now()}`,
            content: event.message.content,
            sender: event.message.sender,
            timestamp: event.message.timestamp ? new Date(event.message.timestamp) : new Date()
          };
          
          setMessages(prev => [...prev, newMessage]);
        }
        break;
        
      case 'typing_indicator':
        setIsTyping(!!event.isTyping);
        break;
        
      case 'onboarding_state':
        if (event.onboardingState) {
          // Update business data
          setBusinessData(event.onboardingState.businessData || {});
          
          // Update step if available in the state
          const currentStepNumber = event.onboardingState.currentStep || currentStep;
          setCurrentStep(currentStepNumber);
          
          // Update progress
          const percentage = ((currentStepNumber - 1) / (ONBOARDING_STEPS.length - 1)) * 100;
          setProgress({
            percentage,
            currentStep: currentStepNumber,
            totalSteps: ONBOARDING_STEPS.length,
            stepTitle: ONBOARDING_STEPS[currentStepNumber - 1]?.title || ""
          });
        }
        break;
        
      case 'error':
        console.error("WebSocket error:", event.error);
        setConnectionError(event.error || "An unknown error occurred");
        break;
    }
  };
  
  // Function to simulate AI responses (fallback when WebSocket is unavailable)
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Only used when WebSocket connection fails
    setIsTyping(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = "";
    
    switch(currentStep) {
      case 1: // Business Information
        if (!businessData.name) {
          // First question - business name
          setBusinessData((prev: Record<string, string>) => ({ ...prev, name: userMessage }));
          response = `Great! "${userMessage}" is a nice business name. What industry or sector does your business operate in?`;
        } else if (!businessData.industry) {
          // Second question - industry
          setBusinessData((prev: Record<string, string>) => ({ ...prev, industry: userMessage }));
          response = "Thank you! Now, could you give me a brief description of what your business does?";
        } else if (!businessData.description) {
          // Third question - description
          setBusinessData((prev: Record<string, string>) => ({ ...prev, description: userMessage }));
          response = "That's helpful! Let's move on to understanding your target audience.";
          
          // Move to next step
          moveToNextStep();
        }
        break;
        
      case 2: // Target Audience
        if (!businessData.targetAudience) {
          // First question about target audience
          setBusinessData((prev: Record<string, string>) => ({ ...prev, targetAudience: userMessage }));
          response = "Great! What are the key demographics of your customers (age range, location, etc.)?";
        } else if (!businessData.demographics) {
          // Second question about demographics
          setBusinessData((prev: Record<string, string>) => ({ ...prev, demographics: userMessage }));
          response = "Thank you for sharing that. Now, let's talk about your business goals.";
          
          // Move to next step
          moveToNextStep();
        }
        break;
        
      case 3: // Business Goals
        if (!businessData.goals) {
          // Business goals
          setBusinessData((prev: Record<string, string>) => ({ ...prev, goals: userMessage }));
          response = "Those are great goals! What are your key performance indicators or metrics for success?";
        } else if (!businessData.kpis) {
          // KPIs
          setBusinessData((prev: Record<string, string>) => ({ ...prev, kpis: userMessage }));
          response = "Perfect! Now let's talk about your products or services.";
          
          // Move to next step
          moveToNextStep();
        }
        break;
        
      case 4: // Product Information
        if (!businessData.products) {
          // Products/services
          setBusinessData((prev: Record<string, string>) => ({ ...prev, products: userMessage }));
          response = "Thank you for sharing that information. Is there anything specific about your pricing or product strategy you'd like me to know?";
        } else if (!businessData.pricing) {
          // Pricing strategy
          setBusinessData((prev: Record<string, string>) => ({ ...prev, pricing: userMessage }));
          
          // Final summary
          response = `Great! I've collected all the essential information about ${businessData.name}. Here's a summary:\n\n` +
            `Business: ${businessData.name} (${businessData.industry})\n` +
            `Description: ${businessData.description}\n` +
            `Target Audience: ${businessData.targetAudience}\n` +
            `Demographics: ${businessData.demographics}\n` +
            `Goals: ${businessData.goals}\n` +
            `KPIs: ${businessData.kpis}\n` +
            `Products/Services: ${businessData.products}\n` +
            `Pricing: ${userMessage}\n\n` +
            `Is this information correct? If so, we can complete your profile setup.`;
          
          // Move to final step
          moveToNextStep();
        }
        break;
        
      case 5: // Confirmation
        // Check if the user confirmed the information
        if (userMessage.toLowerCase().includes("yes") || 
            userMessage.toLowerCase().includes("correct") || 
            userMessage.toLowerCase().includes("right")) {
          response = "Excellent! Your business profile is now complete. You can now start using CHIDI to manage your business communications and inventory.";
          
          // Call onComplete callback with the collected business data
          if (onComplete) {
            onComplete(businessData);
          }
        } else {
          response = "I understand you want to make some changes. Let's go back and review your information. What would you like to modify?";
          // In a real implementation, we would handle edits to specific fields
        }
        break;
        
      default:
        response = "I'm not sure how to respond to that. Could you please clarify?";
    }
    
    setIsTyping(false);
    return response;
  };

  // Function to move to the next step
  const moveToNextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Update progress
      setProgress({
        percentage: (nextStep - 1) / (ONBOARDING_STEPS.length - 1) * 100,
        currentStep: nextStep,
        totalSteps: ONBOARDING_STEPS.length,
        stepTitle: ONBOARDING_STEPS[nextStep - 1].title
      });
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message to the chat
    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      sender: "user",
      timestamp: new Date()
    };
    
    // Log to ensure content is being set correctly
    console.log("User message:", userMessage);
    
    setMessages((prev: MessageType[]) => [...prev, userMessage]);
    
    // Check if we're in fallback mode (no WebSocket connection)
    if (fallbackMode || !isConnected || !websocketRef.current) {
      // Use fallback local response generation
      const aiResponse = await generateAIResponse(content.trim());
      
      // Add AI response to the chat
      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        content: aiResponse,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages((prev: MessageType[]) => [...prev, assistantMessage]);
    } else {
      // Send message via WebSocket
      websocketRef.current.sendMessage(content.trim());
      // Response will come through the WebSocket event handler
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    console.log("File uploaded:", file.name);
    
    // Create a message with the file attachment
    const userMessage: MessageType = {
      id: `file-${Date.now()}`,
      content: `Uploaded file: ${file.name}`,
      sender: "user",
      timestamp: new Date(),
      attachments: [
        {
          id: `attachment-${Date.now()}`,
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type
        }
      ]
    };
    
    setMessages((prev: MessageType[]) => [...prev, userMessage]);
    
    if (fallbackMode || !isConnected || !websocketRef.current) {
      // Generate fallback AI response acknowledging the file
      const aiResponse = "Thanks for sharing that file. I'll analyze it and incorporate the information.";
      
      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        content: aiResponse,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages((prev: MessageType[]) => [...prev, assistantMessage]);
    } else {
      // In a real implementation, we would upload the file to a server
      // For now, we'll just trigger an action to notify the backend about the file
      websocketRef.current.sendActionTrigger('file_upload', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      // Response will come through the WebSocket event handler
    }
  };

  // Display connection status or error
  useEffect(() => {
    if (connectionError) {
      console.warn("Connection Status:", connectionError);
    }
  }, [connectionError]);

  return (
    <Card className="flex flex-col h-full overflow-hidden border-light-border">
      {connectionError && (
        <div className="p-2 bg-red-50 text-red-800 text-sm">
          <p>Connection error: {connectionError}</p>
          <p>Using fallback local responses.</p>
        </div>
      )}
      {isConnected && (
        <div className="p-2 bg-green-50 text-green-800 text-sm">
          <p>Connected to backend WebSocket server</p>
        </div>
      )}
      <ConversationalUI
        messages={messages}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        isTyping={isTyping}
        isOnboarding={true}
        onboardingProgress={progress}
      />
    </Card>
  );
}
