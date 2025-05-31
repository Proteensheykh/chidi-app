'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AuthTabsProps {
  defaultTab?: 'login' | 'register';
}

export function AuthTabs({ defaultTab = 'login' }: AuthTabsProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const router = useRouter();

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    if (tab === 'login') {
      router.push('/auth/login');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <div className="w-full max-w-[280px] mx-auto bg-[#F1F5F9] rounded-full p-1 flex mb-6">
      <button
        onClick={() => handleTabChange('login')}
        className={cn(
          "flex-1 text-center py-2 rounded-full text-sm font-medium transition-all",
          activeTab === 'login' 
            ? "bg-[#1A4A3A] text-white" 
            : "text-[#64748B] hover:text-[#475569]"
        )}
      >
        Login
      </button>
      <button
        onClick={() => handleTabChange('register')}
        className={cn(
          "flex-1 text-center py-2 rounded-full text-sm font-medium transition-all",
          activeTab === 'register' 
            ? "bg-[#1A4A3A] text-white" 
            : "text-[#64748B] hover:text-[#475569]"
        )}
      >
        Register
      </button>
    </div>
  );
}
