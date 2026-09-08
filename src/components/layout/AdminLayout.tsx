"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-[100dvh] w-full max-w-full overflow-hidden bg-[#ECE6DE] font-sans antialiased text-[#2E2822] selection:bg-orange-500 selection:text-white p-2.5 sm:p-3.5 lg:p-4 xl:p-5 flex gap-3 sm:gap-4 lg:gap-5">
      {/* 3D Clay Floating Sidebar: Collapsible on desktop, drawer on mobile */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
        isCollapsed={isCollapsed}
      />

      {/* Main Canvas Area: Only Right Side Scrolls, zero visible scrollbars */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all duration-300">
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        <main className="flex-1 pt-3 sm:pt-4 lg:pt-5 w-full max-w-[1600px] mx-auto min-w-0 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
