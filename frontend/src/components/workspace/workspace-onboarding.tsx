'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { ConversationalUI } from '@/components/ui/conversational-ui';
import { useRouter } from 'next/navigation';

// Define the steps in the onboarding process
type OnboardingStep = 
  | 'welcome'
  | 'business-info'
  | 'product-categories'
  | 'social-accounts'
  | 'ai-preferences'
  | 'complete';

// Define the workspace data structure
interface WorkspaceData {
  name: string;
  industry: string;
  description: string;
  size: string;
  productCategories: string[];
  socialAccounts: {
    platform: string;
    handle: string;
  }[];
  aiPreferences: {
    tone: string;
    responseStyle: string;
    autoRespond: boolean;
  };
}

// Sample conversation messages for the onboarding process
const getInitialMessages = (step: OnboardingStep, data: WorkspaceData) => {
  switch (step) {
    case 'welcome':
      return [
        {
          role: 'assistant',
          content: 'Welcome to CHIDI! I\'m here to help you set up your workspace. Let\'s get started with some basic information about your business.',
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: 'What\'s the name of your business?',
          timestamp: new Date().toISOString(),
        }
      ];
    case 'business-info':
      return [
        {
          role: 'assistant',
          content: `Great! Now tell me a bit more about ${data.name}. What industry are you in?`,
          timestamp: new Date().toISOString(),
        }
      ];
    case 'product-categories':
      return [
        {
          role: 'assistant',
          content: 'Now, let\'s set up your product categories. What types of products or services do you offer?',
          timestamp: new Date().toISOString(),
          options: [
            'Physical Products',
            'Digital Products',
            'Services',
            'Subscriptions',
            'Custom...'
          ]
        }
      ];
    case 'social-accounts':
      return [
        {
          role: 'assistant',
          content: 'Let\'s connect your social media accounts. Which platforms do you use for your business?',
          timestamp: new Date().toISOString(),
          options: [
            'Instagram',
            'Facebook',
            'Twitter',
            'TikTok',
            'LinkedIn',
            'Other'
          ]
        }
      ];
    case 'ai-preferences':
      return [
        {
          role: 'assistant',
          content: 'Almost done! Let\'s set up how you want CHIDI to respond to your customers.',
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: 'What tone would you like CHIDI to use when responding to customers?',
          timestamp: new Date().toISOString(),
          options: [
            'Professional',
            'Friendly',
            'Casual',
            'Enthusiastic',
            'Formal'
          ]
        }
      ];
    case 'complete':
      return [
        {
          role: 'assistant',
          content: `Congratulations! Your ${data.name} workspace is now set up and ready to go.`,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: 'You can now start adding products, connecting more social accounts, and customizing your settings further from the dashboard.',
          timestamp: new Date().toISOString(),
        }
      ];
    default:
      return [];
  }
};

export function WorkspaceOnboarding() {
  const router = useRouter();
  
  // Default workspace data
  const defaultWorkspaceData: WorkspaceData = {
    name: '',
    industry: '',
    description: '',
    size: 'small',
    productCategories: [],
    socialAccounts: [],
    aiPreferences: {
      tone: 'professional',
      responseStyle: 'concise',
      autoRespond: true
    }
  };
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [messages, setMessages] = useState<any[]>(getInitialMessages('welcome', defaultWorkspaceData));
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>(defaultWorkspaceData);
  const [lastUserInput, setLastUserInput] = useState<string>('');

  // Handle user message submission
  const handleSendMessage = async (message: string) => {
    // Add user message to the conversation
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }]);
    
    setLastUserInput(message);
    setIsLoading(true);

    // Process the message based on the current step
    setTimeout(() => {
      processUserInput(message, currentStep);
      setIsLoading(false);
    }, 1000);
  };

  const processUserInput = (message: string, step: OnboardingStep) => {
    switch (step) {
      case 'welcome':
        // Save business name
        const updatedData = { ...workspaceData, name: message };
        setWorkspaceData(updatedData);
        
        // Move to next step
        setCurrentStep('business-info');
        setMessages(prev => [
          ...prev,
          ...getInitialMessages('business-info', updatedData)
        ]);
        break;
        
      case 'business-info':
        if (!workspaceData.industry) {
          // Save industry
          const updatedData = { ...workspaceData, industry: message };
          setWorkspaceData(updatedData);
          
          // Ask for description
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'Great! Now please provide a brief description of your business:',
              timestamp: new Date().toISOString()
            }
          ]);
        } else {
          // Save description and move to next step
          const updatedData = { ...workspaceData, description: message };
          setWorkspaceData(updatedData);
          
          setCurrentStep('product-categories');
          setMessages(prev => [
            ...prev,
            ...getInitialMessages('product-categories', updatedData)
          ]);
        }
        break;
        
      case 'product-categories':
        if (message.toLowerCase() === 'custom...') {
          // Ask for custom category
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'Please specify your custom product category:',
              timestamp: new Date().toISOString()
            }
          ]);
        } else if (message.toLowerCase() === 'no, continue' || message.toLowerCase() === 'continue') {
          // Move to next step
          setCurrentStep('social-accounts');
          setMessages(prev => [
            ...prev,
            ...getInitialMessages('social-accounts', workspaceData)
          ]);
        } else {
          // Add product category
          const updatedData = {
            ...workspaceData,
            productCategories: [...workspaceData.productCategories, message]
          };
          setWorkspaceData(updatedData);
          
          // Ask if they want to add more categories
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: `Added "${message}" to your product categories. Would you like to add another category?`,
              timestamp: new Date().toISOString(),
              options: ['Yes', 'No, continue']
            }
          ]);
        }
        break;
        
      case 'social-accounts':
        if (message.toLowerCase() === 'no, continue' || message.toLowerCase() === 'continue' || message.toLowerCase() === 'done') {
          // Move to next step
          setCurrentStep('ai-preferences');
          setMessages(prev => [
            ...prev,
            ...getInitialMessages('ai-preferences', workspaceData)
          ]);
        } else if (workspaceData.socialAccounts.some(account => account.platform && !account.handle)) {
          // Save handle for the last added platform
          const updatedAccounts = [...workspaceData.socialAccounts];
          const lastIndex = updatedAccounts.length - 1;
          updatedAccounts[lastIndex] = {
            ...updatedAccounts[lastIndex],
            handle: message
          };
          
          const updatedData = {
            ...workspaceData,
            socialAccounts: updatedAccounts
          };
          setWorkspaceData(updatedData);
          
          // Ask if they want to add more accounts
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'Would you like to connect another social account?',
              timestamp: new Date().toISOString(),
              options: ['Yes', 'No, continue']
            }
          ]);
        } else {
          // Add new platform
          const updatedData = {
            ...workspaceData,
            socialAccounts: [
              ...workspaceData.socialAccounts,
              { platform: message, handle: '' }
            ]
          };
          setWorkspaceData(updatedData);
          
          // Ask for handle
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: `What's your handle on ${message}?`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
        break;
        
      case 'ai-preferences':
        if (!workspaceData.aiPreferences.tone || workspaceData.aiPreferences.tone === 'professional') {
          // Save tone
          const updatedData = {
            ...workspaceData,
            aiPreferences: {
              ...workspaceData.aiPreferences,
              tone: message.toLowerCase()
            }
          };
          setWorkspaceData(updatedData);
          
          // Ask about response style
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'How would you like CHIDI to respond to customers?',
              timestamp: new Date().toISOString(),
              options: [
                'Concise and to-the-point',
                'Detailed and thorough',
                'Conversational and engaging'
              ]
            }
          ]);
        } else if (workspaceData.aiPreferences.responseStyle === 'concise') {
          // Save response style
          let style = 'concise';
          if (message.includes('Detailed')) style = 'detailed';
          if (message.includes('Conversational')) style = 'conversational';
          
          const updatedData = {
            ...workspaceData,
            aiPreferences: {
              ...workspaceData.aiPreferences,
              responseStyle: style
            }
          };
          setWorkspaceData(updatedData);
          
          // Ask about auto-respond
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: 'Would you like CHIDI to automatically respond to common customer questions?',
              timestamp: new Date().toISOString(),
              options: ['Yes', 'No']
            }
          ]);
        } else {
          // Save auto-respond preference and complete
          const updatedData = {
            ...workspaceData,
            aiPreferences: {
              ...workspaceData.aiPreferences,
              autoRespond: message.toLowerCase() === 'yes'
            }
          };
          setWorkspaceData(updatedData);
          
          // Complete the onboarding
          setCurrentStep('complete');
          setMessages(prev => [
            ...prev,
            ...getInitialMessages('complete', updatedData)
          ]);
        }
        break;
        
      case 'complete':
        // Redirect to dashboard
        router.push('/dashboard');
        break;
    }
  };

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    handleSendMessage(option);
  };

  // Skip onboarding and go to dashboard
  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-[#E2E8F0] bg-white p-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#1A4A3A] flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-bold text-[#1A4A3A]">CHIDI</span>
          </div>
          <Button variant="ghost" onClick={handleSkip}>
            Skip Setup
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-md border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1A4A3A]">Workspace Setup</CardTitle>
              <CardDescription>
                Let's set up your CHIDI workspace to help you manage your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] overflow-y-auto p-4 bg-[#F8FAFC] rounded-md border border-[#E2E8F0]">
                <ConversationalUI
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onOptionSelect={handleOptionSelect}
                  isLoading={isLoading}
                  placeholder="Type your response..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-[#E2E8F0] pt-4">
              <div className="text-sm text-[#64748B]">
                Step {getStepNumber(currentStep)} of 5
              </div>
              {currentStep === 'complete' && (
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#1A4A3A] hover:bg-[#0D3625] text-white"
                >
                  Go to Dashboard
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Helper function to get the step number
function getStepNumber(step: OnboardingStep): number {
  const steps: OnboardingStep[] = [
    'welcome',
    'business-info',
    'product-categories',
    'social-accounts',
    'ai-preferences'
  ];
  
  const index = steps.indexOf(step);
  return index === -1 ? 1 : index + 1;
}
