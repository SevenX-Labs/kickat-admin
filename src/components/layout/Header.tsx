"use client";

import Link from "next/link";
import { Menu, Bell, Search, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/admin/login");
  };

  return (
    <header className="flex items-center justify-between gap-4 w-full">
      {/* Left: Greeting & Subtitle matching FinTrack */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="clay-button flex h-11 w-11 items-center justify-center text-slate-700 hover:text-indigo-600 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-fraunces text-2xl lg:text-[28px] font-bold text-[#2A241E] flex items-center gap-2 tracking-tight">
            Good morning! <span className="inline-block transform hover:rotate-12 transition-transform select-none">👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Here&apos;s what&apos;s happening with your finances today.
          </p>
        </div>
      </div>

      {/* Right Controls: FinTrack Search Pill, Bell & 3D Character Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Crisp Search Pill */}
        <div className="hidden sm:flex items-center relative w-64 md:w-72">
          <Search className="absolute left-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full bg-white border border-slate-200/60 py-2 pl-11 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>

        {/* Circular Notification Bell with Red Dot */}
        <button 
          className="clay-button relative flex h-11 w-11 rounded-full items-center justify-center text-slate-700 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white shadow-xs" />
        </button>

        {/* Circular 3D Avatar (FinTrack 3D Character Avatar in Purple) */}
        <div className="flex items-center gap-2.5">
          <Link 
            href="/admin/dashboard/profile"
            className="relative flex h-11 w-11 rounded-full items-center justify-center bg-gradient-to-tr from-[#635BFF] via-[#7B72F0] to-[#9A91FB] text-white font-bold text-sm shadow-[0_4px_10px_rgba(99,91,255,0.30)] hover:scale-105 transition-transform overflow-hidden"
          >
            <span className="select-none text-xl">👦</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Logout"
            className="clay-button hidden md:flex h-11 w-11 rounded-2xl items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
