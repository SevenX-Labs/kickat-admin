"use client";

import Link from "next/link";
import { Menu, Bell, Search, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Header({ 
  onToggleSidebar, 
  onToggleMobileSidebar, 
  isCollapsed = false, 
  onToggleCollapse 
}: HeaderProps) {
  const router = useRouter();

  const handleMobileToggle = onToggleMobileSidebar || onToggleSidebar;

  const handleLogout = () => {
    router.push("/admin/login");
  };

  return (
    <header className="flex items-center justify-between gap-3 sm:gap-4 w-full min-w-0">
      {/* Left: Hamburger & Greeting */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {/* Mobile Toggle Button */}
        {handleMobileToggle && (
          <button
            onClick={handleMobileToggle}
            className="clay-button flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center text-slate-700 hover:text-indigo-600 lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Desktop Collapse/Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="clay-button hidden lg:flex h-11 w-11 shrink-0 items-center justify-center text-slate-700 hover:text-indigo-600 transition"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-5 w-5 text-indigo-600" />
            ) : (
              <PanelLeftClose className="h-5 w-5 text-slate-600" />
            )}
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold text-[#2A241E] flex items-center gap-1.5 sm:gap-2 tracking-tight truncate">
            <span>Good morning!</span>
            <span className="inline-block transform hover:rotate-12 transition-transform select-none shrink-0">👋</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate hidden xs:block">
            Here&apos;s what&apos;s happening with your finances today.
          </p>
        </div>
      </div>

      {/* Right Controls: Search Pill, Bell & Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Crisp Search Pill */}
        <div className="hidden md:flex items-center relative w-48 lg:w-60 xl:w-72">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full bg-white border border-slate-200/60 py-2 pl-10 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>

        {/* Circular Notification Bell with Red Dot */}
        <button 
          className="clay-button relative flex h-10 w-10 sm:h-11 sm:w-11 rounded-full items-center justify-center text-slate-700 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white shadow-xs" />
        </button>

        {/* Circular 3D Avatar */}
        <div className="flex items-center gap-2">
          <Link 
            href="/admin/dashboard/profile"
            className="relative flex h-10 w-10 sm:h-11 sm:w-11 rounded-full items-center justify-center bg-gradient-to-tr from-[#635BFF] via-[#7B72F0] to-[#9A91FB] text-white font-bold text-sm shadow-[0_4px_10px_rgba(99,91,255,0.30)] hover:scale-105 transition-transform overflow-hidden"
            title="Admin Profile"
          >
            <span className="select-none text-lg sm:text-xl">👦</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Logout"
            className="clay-button hidden sm:flex h-10 w-10 sm:h-11 sm:w-11 rounded-2xl items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
