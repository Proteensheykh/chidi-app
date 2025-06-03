'use client';

import { useState, useEffect } from 'react';
import { Header } from './header';
import { Sidebar } from '@/components/layout/sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MobileResponsiveLayout({ children, title }: MobileResponsiveLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize to determine if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (
        isMobile && 
        isSidebarOpen && 
        sidebar && 
        !sidebar.contains(event.target as Node) && 
        toggleButton && 
        !toggleButton.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header is now expected to be rendered by the parent component */}
      
      <div className="flex flex-1">
        {/* Sidebar for desktop (always visible) */}
        {!isMobile && (
          <Sidebar className="hidden lg:block w-64 border-r border-[#E2E8F0]" />
        )}
        
        {/* Mobile sidebar (conditionally visible) */}
        {isMobile && isSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div 
              id="sidebar"
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg animate-in slide-in-from-left"
            >
              <Sidebar />
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="fixed top-4 right-4 z-50 rounded-full bg-white p-2 text-[#1A4A3A] shadow-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        {/* Main content */}
        <main className="flex-1 bg-[#F8F9FA]">
          <div className="container py-6">
            {/* Mobile sidebar toggle */}
            {isMobile && (
              <div className="flex items-center mb-4">
                <Button
                  id="sidebar-toggle"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="mr-2 text-[#1A4A3A]"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            {/* Desktop title removed as requested */}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
