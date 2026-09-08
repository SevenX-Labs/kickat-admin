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
  Sparkles,
  HelpCircle,
  Activity
} from "lucide-react";
import { SIDEBAR_NAV_SECTIONS } from "@/constants";

const NAV_ICONS: Record<string, any> = {
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
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Floating 3D Clay Sidebar (FinTrack Style) */}
      <aside className={`
        clay-sidebar fixed top-3 bottom-3 left-3 z-50 flex w-[240px] xl:w-[260px] flex-col shrink-0 transition-transform duration-300 ease-in-out lg:static lg:h-full lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Brand Header: FinTrack 3D Clay Pulse Logo */}
        <div className="flex h-20 shrink-0 items-center px-6 pt-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            {/* 3D Puffy Clay Logo Badge */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#7B72F0] text-white shadow-[0_6px_14px_rgba(99,91,255,0.35),inset_0_2px_3px_rgba(255,255,255,0.45),inset_0_-2px_3px_rgba(40,30,140,0.35)]">
              <svg className="w-6 h-6 fill-none stroke-white stroke-[2.5]" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <span className="font-fraunces text-2xl font-bold tracking-tight text-[#2A241E]">FinTrack</span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SIDEBAR_NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-0.5">
                <span className="font-mono-eyebrow text-[9.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                  {section.title}
                </span>
              </div>

              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = NAV_ICONS[item.icon] || LayoutDashboard;
                  const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-all duration-200
                        ${isActive 
                          ? "clay-pill-purple text-white shadow-md" 
                          : "rounded-2xl text-slate-600 hover:bg-[#F7F3EE] hover:text-slate-900"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Account Profile Item */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="px-3 pb-0.5">
              <span className="font-mono-eyebrow text-[9.5px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                Account
              </span>
            </div>
            <Link
              href="/admin/dashboard/profile"
              onClick={onClose}
              className={`
                group flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-all duration-200
                ${pathname === "/admin/dashboard/profile"
                  ? "clay-pill-purple text-white shadow-md"
                  : "rounded-2xl text-slate-600 hover:bg-[#F7F3EE] hover:text-slate-900"
                }
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <User className={`h-4 w-4 shrink-0 ${pathname === "/admin/dashboard/profile" ? "text-white" : "text-slate-500"}`} />
                <span className="truncate">Admin Profile</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom User & Logout */}
        <div className="border-t border-slate-100/80 p-3 pt-2 shrink-0">
          <div className="flex items-center justify-between rounded-2xl bg-[#F7F3EE] p-2 border border-white/60">
            <Link href="/admin/dashboard/profile" className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#635BFF] text-white text-[11px] font-bold shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
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
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
