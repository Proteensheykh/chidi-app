"use client";

import { OnboardingForm } from "@/components/workspace/OnboardingForm";

export default function OnboardingPage() {
  // Handle onboarding completion
  const handleOnboardingComplete = (businessData: any) => {
    // In a real implementation, this would save the data to the backend
    // and redirect the user to the workspace dashboard
    console.log("Onboarding complete with data:", businessData);
    // Example: router.push('/workspace/dashboard');
  };

  return (
    <div className="flex flex-col h-screen bg-tech-gray">
      <header className="bg-white border-b border-light-border p-4">
        <h1 className="text-xl font-semibold text-charcoal">Business Onboarding</h1>
      </header>
      
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <div className="h-full max-w-3xl mx-auto">
          <OnboardingForm onComplete={handleOnboardingComplete} />
        </div>
      </main>
    </div>
  );
}
