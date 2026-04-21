"use client";

import React from 'react';
import { DashboardHeader, DashboardSidebar, Footer } from '@/website/organisms';
import { DashboardHeaderProps } from '@/website/organisms/DashboardHeader/DashboardHeader.types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: DashboardHeaderProps['activeTab'];
  isAccountPage?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  activeTab,
  isAccountPage = false
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <DashboardHeader activeTab={activeTab} isAccountPage={isAccountPage} />
      
      <div className="flex flex-1 justify-center bg-white">
        <div className="max-w-[1440px] w-full flex relative">
          {/* Sidebar - Hidden on mobile, fixed width on desktop */}
          <div className="hidden lg:block sticky top-0 h-[calc(100vh-180px)] overflow-y-auto border-r border-gray-100 bg-white">
            <DashboardSidebar />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 min-h-[calc(100vh-180px)] bg-background-secondary overflow-x-hidden">
            <div className="p-4 sm:p-6 lg:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};
