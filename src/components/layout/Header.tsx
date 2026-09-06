"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Bell, Search, LogOut, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { removeStoredToken } from "@/lib/auth";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    removeStoredToken();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile KickAt Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <Image src="/logo-clean.png" alt="KickAt" width={90} height={28} className="object-contain" />
        </div>

        {/* Global Search */}
        <div className="hidden sm:flex items-center relative w-72 md:w-96">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        <button 
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>

        <div className="h-5 w-px bg-slate-200 mx-1" />

        {/* Admin Profile */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-sm shadow-xs">
            K
          </div>
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold text-slate-800">Admin User</p>
            <p className="text-[10px] font-medium text-slate-400">admin@kickat.in</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
