'use client';

import { ReactNode } from 'react';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { Header } from './header';
import { Sidebar } from '@/components/layout/sidebar';

interface AppLayoutWithContextProps {
  children: ReactNode;
  title?: string;
}

export function AppLayoutWithContext({ children, title }: AppLayoutWithContextProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar className="hidden lg:block w-64 border-r border-[#E2E8F0]" />
          <main className="flex-1 bg-[#F8F9FA]">
            <div className="container py-6">
              {title && <h1 className="text-2xl font-semibold mb-6">{title}</h1>}
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
