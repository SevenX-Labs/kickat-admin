"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthService } from "@/services/adminAuthService";
import { 
  LayoutDashboard, 
  BarChart3,
  Users, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Truck, 
  Star, 
  Megaphone, 
  FileText, 
  MessageSquareQuote,
  PieChart, 
  Settings,
  User,
  KeyRound,
  LogOut,
  X
} from "lucide-react";
import { SIDEBAR_NAV_SECTIONS } from "@/constants";
import React from "react";

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  Truck,
  Star,
  Megaphone,
  FileText,
  MessageSquareQuote,
  PieChart,
  Settings,
  User,
  KeyRound
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onLogoutClick?: () => void;
  onOpenLogoutModal?: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed = false, onLogoutClick, onOpenLogoutModal }: SidebarProps) {
  const pathname = usePathname();
  const handleLogout = onLogoutClick || onOpenLogoutModal;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#2A241E]/30 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-[80px]" : "w-[260px]"}
        `}
      >
        {/* Top: Logo & Navigation */}
        <div className="flex flex-col min-h-0">
          
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 py-2 border-b border-slate-100">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform shrink-0">
                K
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-fraunces text-lg font-bold text-[#2A241E] leading-tight">
                    Kickat
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase font-mono-eyebrow">
                    Admin Hub
                  </span>
                </div>
              )}
            </Link>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Sections Scrollable */}
          <nav className="mt-4 flex-1 space-y-5 overflow-y-auto no-scrollbar pr-1">
            {SIDEBAR_NAV_SECTIONS.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {section.title && !isCollapsed && (
                  <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">
                    {section.title}
                  </h3>
                )}

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const IconComponent = NAV_ICONS[item.icon] || LayoutDashboard;
                    const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        title={isCollapsed ? item.label : undefined}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150
                          ${isActive 
                            ? "clay-nav-active text-orange-600 shadow-sm font-extrabold" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                          }
                          ${isCollapsed ? "justify-center px-0" : ""}
                        `}
                      >
                        <IconComponent className={`h-4 w-4 stroke-[2.2] shrink-0 ${isActive ? "text-orange-600" : "text-slate-400"}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                        {!isCollapsed && item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-[9.5px] font-black rounded-full bg-orange-100 text-orange-700 font-mono-eyebrow">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile / Logout Footer */}
        <div className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Log out" : undefined}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors group
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition-colors shrink-0" />
              {!isCollapsed && <span>Log out</span>}
            </div>
            {!isCollapsed && <span className="text-[10px] font-mono text-slate-400">Ctrl+Q</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
