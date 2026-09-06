"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#ECE6DE] font-sans antialiased text-[#2E2822] selection:bg-orange-500 selection:text-white p-3 sm:p-4 lg:p-4 xl:p-5 flex gap-4 lg:gap-5">
      {/* 3D Clay Floating Sidebar: Fixed & stationary */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Canvas Area: Only Right Side Scrolls */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300/80 pr-0.5">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 pt-4 sm:pt-5 w-full max-w-[1600px] mx-auto min-w-0 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
