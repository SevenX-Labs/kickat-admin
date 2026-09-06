"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Users, 
  Truck, 
  Star, 
  Megaphone, 
  FileText, 
  Folder, 
  BarChart3, 
  PieChart, 
  UploadCloud, 
  Settings,
  ChevronRight
} from "lucide-react";
import { NAVIGATION_ITEMS } from "@/constants";

const NAV_ICONS: Record<string, any> = {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Truck,
  Star,
  Megaphone,
  FileText,
  Folder,
  BarChart3,
  PieChart,
  UploadCloud,
  Settings,
};

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand / Logo Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative flex h-10 w-28 items-center justify-start overflow-hidden">
              <Image 
                src="/logo-clean.png" 
                alt="KickAt Admin" 
                width={120} 
                height={36} 
                className="object-contain"
                priority
              />
            </div>
            <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-bold tracking-wider text-orange-600 uppercase border border-orange-200/60">
              Admin
            </span>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-slate-200">
          <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Navigation</p>
          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = NAV_ICONS[item.icon] || LayoutDashboard;
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all
                    ${isActive 
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25 font-semibold" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-orange-100" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
            <div className="text-xs">
              <p className="font-semibold text-slate-700">KickAt Core Engine</p>
              <p className="text-[11px] text-slate-400">v1.0.0 • Connected</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
