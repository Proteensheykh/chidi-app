import React from 'react';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { OnboardingConversation } from '@/components/workspace/OnboardingConversation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingPage() {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Workspace Onboarding</CardTitle>
          <CardDescription>
            Complete the onboarding process to set up your workspace
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="h-[calc(100vh-200px)]">
        <OnboardingProvider>
          <OnboardingConversation />
        </OnboardingProvider>
      </div>
    </div>
  );
}
