"use client";

import Link from "next/link";
import Image from "next/image";
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
  ChevronRight,
  ShieldCheck
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand / Logo Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-5 bg-white">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-28 items-center justify-start overflow-hidden">
              <Image 
                src="/logo-clean.png" 
                alt="KickAt Admin" 
                width={130} 
                height={40} 
                className="object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
                priority
              />
            </div>
            <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10.5px] font-bold tracking-wider text-orange-600 uppercase border border-orange-200/70 font-mono-eyebrow">
              <ShieldCheck className="h-3 w-3" />
              Admin
            </span>
          </Link>
        </div>

        {/* Structured Navigation Flow */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          {SIDEBAR_NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {/* Section Header */}
              <div className="px-3 pb-1">
                <span className="font-mono-eyebrow text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                  {section.title}
                </span>
              </div>

              {/* Section Items */}
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = NAV_ICONS[item.icon] || LayoutDashboard;
                  const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-[13px] font-medium transition-all duration-150
                        ${isActive 
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/25 font-semibold" 
                          : "text-slate-600 hover:bg-orange-50/60 hover:text-orange-950"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-orange-600"}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-orange-100 shrink-0" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Dedicated Admin Profile Link in Navigation */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <div className="px-3 pb-1">
              <span className="font-mono-eyebrow text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                Account
              </span>
            </div>
            <nav className="space-y-0.5">
              <Link
                href="/admin/dashboard/profile"
                onClick={onClose}
                className={`
                  group flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-[13px] font-medium transition-all duration-150
                  ${pathname === "/admin/dashboard/profile" 
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm shadow-orange-500/25 font-semibold" 
                    : "text-slate-600 hover:bg-orange-50/60 hover:text-orange-950"
                  }
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <User className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${pathname === "/admin/dashboard/profile" ? "text-white" : "text-slate-400 group-hover:text-orange-600"}`} />
                  <span className="truncate">Admin Profile</span>
                </div>
                {pathname === "/admin/dashboard/profile" && <ChevronRight className="h-3.5 w-3.5 text-orange-100 shrink-0" />}
              </Link>
            </nav>
          </div>
        </div>

        {/* Footer: Admin User Profile Card & Logout */}
        <div className="border-t border-slate-100 p-3 bg-slate-50/70 shrink-0">
          <div className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white p-2.5 shadow-xs">
            <Link 
              href="/admin/dashboard/profile" 
              onClick={onClose}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white text-xs font-bold shadow-xs">
                AD
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-xs font-bold text-slate-800 leading-tight">Admin User</p>
                <p className="truncate text-[10px] font-medium text-slate-400">admin@kickat.in</p>
              </div>
            </Link>

            {/* Logout CTA Button */}
            <button
              onClick={handleLogout}
              title="Logout from Admin Portal"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Status badge */}
          <div className="mt-2 flex items-center justify-between px-2 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>KickAt Core Engine</span>
            </div>
            <span className="font-mono text-[9px] text-slate-400">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
