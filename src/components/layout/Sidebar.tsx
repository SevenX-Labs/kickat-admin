"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  PieChart, 
  Settings,
  User,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight
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
  PieChart,
  Settings,
  User,
};

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  isCollapsed = false, 
  onToggleCollapse 
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (onClose) onClose();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Floating 3D Clay Sidebar (FinTrack Style) */}
      <aside 
        style={{
          width: isCollapsed ? "80px" : undefined,
          minWidth: isCollapsed ? "80px" : undefined,
        }}
        className={`
          clay-sidebar fixed top-2.5 bottom-2.5 left-2.5 sm:top-3 sm:bottom-3 sm:left-3 z-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out lg:static lg:h-full
          ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20 lg:w-20" : "w-[245px] xl:w-[260px]"}
        `}
      >
        {/* Brand Header */}
        <div className={`
          flex h-16 sm:h-18 shrink-0 items-center border-b border-slate-100/60 lg:border-none transition-all
          ${isCollapsed ? "justify-center px-1.5" : "justify-between px-4 sm:px-5"}
        `}>
          <Link 
            href="/admin/dashboard" 
            className="flex items-center gap-3 group min-w-0"
            title={isCollapsed ? "FinTrack Dashboard" : undefined}
          >
            {/* 3D Puffy Clay Logo Badge */}
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#7B72F0] text-white shadow-[0_6px_14px_rgba(99,91,255,0.35),inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-2px_3px_rgba(40,30,140,0.35)] transition-transform group-hover:scale-105">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-none stroke-white stroke-[2.5]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="font-fraunces text-2xl font-bold tracking-tight text-[#2A241E] truncate block">
                  FinTrack
                </span>
              </div>
            )}
          </Link>

          {/* Controls: Close on Mobile / Collapse on Desktop */}
          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="clay-button flex h-9 w-9 items-center justify-center text-slate-500 hover:text-slate-900 lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Desktop collapse toggle button */}
            {onToggleCollapse && !isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="clay-button hidden lg:flex h-8 w-8 rounded-xl items-center justify-center text-slate-400 hover:text-indigo-600 transition hover:bg-slate-50"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsed state expand toggle button */}
        {isCollapsed && onToggleCollapse && (
          <div className="hidden lg:flex justify-center pb-2 pt-0.5">
            <button
              onClick={onToggleCollapse}
              className="clay-button flex h-7 w-7 rounded-xl items-center justify-center text-slate-400 hover:text-indigo-600 transition hover:bg-slate-50"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Navigation List (Zero Visible Scrollbar) */}
        <div className={`
          flex-1 overflow-y-auto space-y-2.5 pb-8 pt-1 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          ${isCollapsed ? "px-2" : "px-3 sm:px-4"}
        `}>
          {SIDEBAR_NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {isCollapsed ? (
                <div className="my-2 h-[1px] w-6 mx-auto bg-slate-200/80 rounded-full" />
              ) : (
                <div className="px-3 pb-0.5 pt-1">
                  <span className="font-mono-eyebrow text-[9.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                    {section.title}
                  </span>
                </div>
              )}

              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = NAV_ICONS[item.icon] || LayoutDashboard;
                  const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      title={isCollapsed ? item.label : undefined}
                      className={`
                        group relative flex items-center transition-all duration-200
                        ${isCollapsed 
                          ? "justify-center h-10 w-10 mx-auto rounded-2xl" 
                          : "justify-between px-3 py-2 text-xs font-semibold rounded-2xl"
                        }
                        ${isActive 
                          ? "clay-pill-purple text-white shadow-md" 
                          : "text-slate-600 hover:bg-[#F7F3EE] hover:text-slate-900"
                        }
                      `}
                    >
                      <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5 min-w-0"}`}>
                        <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500"}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {/* Tooltip in Collapsed Mode */}
                      {isCollapsed && (
                        <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center z-50">
                          <div className="rounded-xl bg-[#2A241E] text-white px-3 py-1.5 text-xs font-medium shadow-xl whitespace-nowrap">
                            {item.label}
                          </div>
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2A241E]" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Account Profile Item */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            {isCollapsed ? (
              <div className="my-2 h-[1px] w-6 mx-auto bg-slate-200/80 rounded-full" />
            ) : (
              <div className="px-3 pb-0.5">
                <span className="font-mono-eyebrow text-[9.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                  Account
                </span>
              </div>
            )}
            <Link
              href="/admin/dashboard/profile"
              onClick={onClose}
              title={isCollapsed ? "Admin Profile" : undefined}
              className={`
                group relative flex items-center transition-all duration-200
                ${isCollapsed 
                  ? "justify-center h-10 w-10 mx-auto rounded-2xl" 
                  : "justify-between px-3 py-2 text-xs font-semibold rounded-2xl"
                }
                ${pathname === "/admin/dashboard/profile"
                  ? "clay-pill-purple text-white shadow-md"
                  : "text-slate-600 hover:bg-[#F7F3EE] hover:text-slate-900"
                }
              `}
            >
              <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5 min-w-0"}`}>
                <User className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${pathname === "/admin/dashboard/profile" ? "text-white" : "text-slate-500"}`} />
                {!isCollapsed && <span className="truncate">Admin Profile</span>}
              </div>

              {isCollapsed && (
                <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center z-50">
                  <div className="rounded-xl bg-[#2A241E] text-white px-3 py-1.5 text-xs font-medium shadow-xl whitespace-nowrap">
                    Admin Profile
                  </div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2A241E]" />
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Bottom User & Logout */}
        <div className="border-t border-slate-100/80 p-2.5 shrink-0">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link 
                href="/admin/dashboard/profile" 
                title="Admin User (admin@kickat.in)"
                className="group relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#635BFF] text-white text-xs font-bold shadow-[0_2px_6px_rgba(99,91,255,0.3)] hover:scale-105 transition-transform"
              >
                AD
                <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center z-50">
                  <div className="rounded-xl bg-[#2A241E] text-white px-3 py-1.5 text-xs font-medium shadow-xl whitespace-nowrap">
                    Admin User
                  </div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2A241E]" />
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout"
                className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 transition"
                aria-label="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-2xl bg-[#F7F3EE] p-2 border border-white/60">
              <Link href="/admin/dashboard/profile" className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#635BFF] text-white text-xs font-bold shadow-[0_2px_4px_rgba(99,91,255,0.25)]">
                  AD
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-xs font-bold text-slate-800 leading-tight">Admin User</p>
                  <p className="truncate text-[9.5px] font-medium text-slate-400">admin@kickat.in</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Logout"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition ml-1"
                aria-label="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
