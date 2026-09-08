"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { LogoutModal } from "./LogoutModal";
import { AdminAuthService } from "@/services/adminAuthService";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Logout Confirmation Dialog State
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AdminAuthService.logout();
    } finally {
      setShowLogoutModal(false);
      setIsLoggingOut(false);
      router.push("/admin/login");
    }
  };

  return (
    <div className="h-[100dvh] w-full max-w-full overflow-hidden bg-[#ECE6DE] font-sans antialiased text-[#2E2822] selection:bg-orange-500 selection:text-white p-2.5 sm:p-3.5 lg:p-4 xl:p-5 flex gap-3 sm:gap-4 lg:gap-5">
      {/* 3D Clay Floating Sidebar: Collapsible on desktop, drawer on mobile */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* Main Canvas Area: Only Right Side Scrolls, zero visible scrollbars */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ">
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onLogoutClick={() => setShowLogoutModal(true)}
        />
        <main className="flex-1 pt-3 sm:pt-4 lg:pt-5 w-full max-w-[1600px] mx-auto min-w-0 pb-12">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => {
          if (!isLoggingOut) setShowLogoutModal(false);
        }}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
