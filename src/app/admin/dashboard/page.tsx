"use client";

import { 
  MoreVertical, 
  ChevronDown,
  IndianRupee,
  ShoppingBag,
  Package,
  Users
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DashboardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("This Month");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial mount skeleton loader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleTimeRange = () => {
    setIsLoading(true);
    setTimeRange(prev => prev === "This Month" ? "Last Month" : "This Month");
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 w-full min-w-0 no-scrollbar animate-fade-in">
      
      {/* =========================================================
          1. TOP ROW: 4 E-COMMERCE 3D CLAY STAT CARDS
          - Total Revenue
          - Total Orders
          - Total Products
          - Total Customers
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
        
        {/* Card 1: Total Revenue */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          {/* Top Row: Title & Action button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500">Total Revenue</span>
            <button className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Main Row: Full Value & 3D Clay Rupee Icon */}
          <div className="flex items-center justify-between gap-2 pt-3 z-10">
            <div className="space-y-1 min-w-0">
              <div className="text-xl sm:text-2xl xl:text-[25px] font-black tracking-tight text-[#2A241E] whitespace-nowrap">
                ₹14,85,680
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span>↑ 14.2%</span>
                <span className="text-[10.5px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* Proper 3D Purple Clay Revenue Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B72F0] via-[#635BFF] to-[#4F46E5] text-white shadow-[0_6px_16px_rgba(99,91,255,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <IndianRupee className="h-6 w-6 stroke-[2.4]" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          {/* Top Row: Title & Action button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500">Total Orders</span>
            <button className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Main Row: Full Value & 3D Clay Shopping Bag Icon */}
          <div className="flex items-center justify-between gap-2 pt-3 z-10">
            <div className="space-y-1 min-w-0">
              <div className="text-xl sm:text-2xl xl:text-[25px] font-black tracking-tight text-[#2A241E] whitespace-nowrap">
                3,842
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span>↑ 8.3%</span>
                <span className="text-[10.5px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* Proper 3D Orange Clay Orders Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-[0_6px_16px_rgba(249,115,22,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <ShoppingBag className="h-6 w-6 stroke-[2.3]" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Products */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          {/* Top Row: Title & Action button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500">Total Products</span>
            <button className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Main Row: Full Value & 3D Clay Products Icon */}
          <div className="flex items-center justify-between gap-2 pt-3 z-10">
            <div className="space-y-1 min-w-0">
              <div className="text-xl sm:text-2xl xl:text-[25px] font-black tracking-tight text-[#2A241E] whitespace-nowrap">
                248
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span>↑ 5.2%</span>
                <span className="text-[10.5px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* Proper 3D Blue Clay Products Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#38BDF8] via-[#0EA5E9] to-[#0284C7] text-white shadow-[0_6px_16px_rgba(14,165,233,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <Package className="h-6 w-6 stroke-[2.3]" />
            </div>
          </div>
        </div>

        {/* Card 4: Total Customers */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          {/* Top Row: Title & Action button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500">Total Customers</span>
            <button className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Main Row: Full Value & 3D Clay Customers Icon */}
          <div className="flex items-center justify-between gap-2 pt-3 z-10">
            <div className="space-y-1 min-w-0">
              <div className="text-xl sm:text-2xl xl:text-[25px] font-black tracking-tight text-[#2A241E] whitespace-nowrap">
                8,920
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span>↑ 15.8%</span>
                <span className="text-[10.5px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* Proper 3D Emerald Clay Customers Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34D399] via-[#10B981] to-[#059669] text-white shadow-[0_6px_16px_rgba(16,185,129,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <Users className="h-6 w-6 stroke-[2.3]" />
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================
          2. MIDDLE ROW: Category Sales Breakdown + Recent Store Orders
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full min-w-0">
        
        {/* LEFT: Category Sales Breakdown (6 Cols) */}
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-6 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                Category Sales Breakdown
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Revenue distribution across pet catalog</p>
            </div>
            <div 
              onClick={handleToggleTimeRange}
              className="clay-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none hover:bg-slate-50 transition active:scale-95"
            >
              <span>{timeRange}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-5">
            
            {/* 3D Multi-Color Tactile Clay Donut Chart */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90 drop-shadow-[0_10px_20px_rgba(195,180,165,0.3)]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="#EAE4DC" strokeWidth="15" fill="none" />
                
                {/* Purple segment: Dog Nutrition (33%) */}
                <circle cx="50" cy="50" r="38" stroke="#6D62FE" strokeWidth="15" fill="none"
                  strokeDasharray="79 160" strokeDashoffset="0" strokeLinecap="round" />
                
                {/* Green segment: Cat Food & Treats (26%) */}
                <circle cx="50" cy="50" r="38" stroke="#4EBA79" strokeWidth="15" fill="none"
                  strokeDasharray="62 177" strokeDashoffset="-80" strokeLinecap="round" />
                
                {/* Amber segment: Health & Supplements (16%) */}
                <circle cx="50" cy="50" r="38" stroke="#F7B731" strokeWidth="15" fill="none"
                  strokeDasharray="38 201" strokeDashoffset="-144" strokeLinecap="round" />
                
                {/* Coral segment: Toys & Activity (13%) */}
                <circle cx="50" cy="50" r="38" stroke="#F26674" strokeWidth="15" fill="none"
                  strokeDasharray="31 208" strokeDashoffset="-184" strokeLinecap="round" />
                
                {/* Blue segment: Grooming & Accessories (12%) */}
                <circle cx="50" cy="50" r="38" stroke="#45AAF2" strokeWidth="15" fill="none"
                  strokeDasharray="28 211" strokeDashoffset="-217" strokeLinecap="round" />
              </svg>

              {/* Recessed Center Hub */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono-eyebrow">Gross Sales</span>
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#2A241E]">
                  ₹14.85L
                </span>
              </div>
            </div>

            {/* Category Breakdown Legend */}
            <div className="w-full sm:w-auto flex-1 space-y-2">
              {[
                { label: "Dog Nutrition", amount: "₹4,85,000", pct: "33%", color: "bg-[#6D62FE]" },
                { label: "Cat Food & Treats", amount: "₹3,85,000", pct: "26%", color: "bg-[#4EBA79]" },
                { label: "Health & Supplements", amount: "₹2,45,000", pct: "16%", color: "bg-[#F7B731]" },
                { label: "Toys & Activity", amount: "₹1,95,000", pct: "13%", color: "bg-[#F26674]" },
                { label: "Grooming & Care", amount: "₹1,75,680", pct: "12%", color: "bg-[#45AAF2]" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5 px-1 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-xs shrink-0`} />
                    <span className="font-semibold text-slate-600 truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-slate-800">{item.amount}</span>
                    <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{item.pct}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT: Recent Store Orders & 3D KickAt HQ Card (6 Cols) */}
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-6 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                Recent Store Orders
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Real-time pet parent checkout activity</p>
            </div>
            <Link 
              href="/admin/dashboard/orders" 
              className="clay-button px-3.5 py-1 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 pt-3.5 items-center">
            
            {/* Orders List (7 Cols) */}
            <div className="md:col-span-7 space-y-2">
              {[
                { name: "Rahul Sharma (#KO-8924)", item: "Royal Canin Maxi Puppy 10kg", amount: "₹4,250", time: "15m ago", icon: "🐕", badgeClass: "clay-badge-amber", status: "Paid" },
                { name: "Ananya Patel (#KO-8923)", item: "Whiskas Ocean Fish Feast 7kg", amount: "₹2,150", time: "42m ago", icon: "🐈", badgeClass: "clay-badge-purple", status: "Paid" },
                { name: "Vikram Malhotra (#KO-8922)", item: "Orthopedic Memory Pet Bed", amount: "₹5,800", time: "2h ago", icon: "🦴", badgeClass: "clay-badge-green", status: "Shipped" },
                { name: "Pooja Iyer (#KO-8921)", item: "Natural Yak Milk Chew Sticks", amount: "₹890", time: "3h ago", icon: "🐾", badgeClass: "clay-badge-coral", status: "Delivered" },
              ].map((ord, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-2xl hover:bg-[#F9F6F2] transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`${ord.badgeClass} flex h-9 w-9 shrink-0 items-center justify-center text-base text-white shadow-xs rounded-xl`}>
                      {ord.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-800 leading-tight truncate">{ord.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">{ord.item}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-slate-900">
                      {ord.amount}
                    </p>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${
                      ord.status === "Delivered" ? "bg-emerald-50 text-emerald-700" :
                      ord.status === "Shipped" ? "bg-indigo-50 text-indigo-700" : "bg-orange-50 text-orange-700"
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Clay Desk Scene (5 Cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-[#F5EFE9] border border-[#E8DFC0]/50 shadow-[inset_2px_2px_5px_rgba(195,180,165,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] text-center relative overflow-hidden">
              <div className="relative select-none transform hover:scale-105 transition-transform duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#FF7A00] via-[#F97316] to-[#EAA03B] flex items-center justify-center text-2xl sm:text-3xl shadow-[0_6px_14px_rgba(249,115,22,0.35),inset_0_2px_3px_rgba(255,255,255,0.5)]">
                  🐾
                </div>
              </div>
              
              <div className="w-full mt-2.5 pt-2 border-t-4 border-[#C7955F] rounded-t-xl bg-[#E8C296] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_3px_6px_rgba(0,0,0,0.08)] p-1.5">
                <div className="flex items-center justify-center gap-2.5 text-base">
                  <span className="drop-shadow-xs">🐶</span>
                  <span className="drop-shadow-xs">📦</span>
                  <span className="drop-shadow-xs">🐱</span>
                </div>
              </div>
              <p className="text-[10.5px] font-extrabold text-slate-700 mt-1.5">KickAt Pet Store HQ</p>
            </div>

          </div>
        </div>

      </div>

      {/* =========================================================
          3. BOTTOM ROW: Monthly Sales Targets + Store Growth Insight
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full min-w-0">
        
        {/* Monthly Sales Targets (7 Cols) */}
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-7 space-y-3.5 min-w-0">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                Monthly Sales Targets
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Progress against month-end ecommerce KPIs</p>
            </div>
            <button className="clay-button px-3.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition cursor-pointer">
              Target Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Goal 1: Monthly Revenue Target */}
            <div className="clay-inset p-3.5 space-y-2.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="clay-badge-purple flex h-10 w-10 shrink-0 items-center justify-center text-lg text-white shadow-xs">
                  💰
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 truncate">Monthly Revenue Goal</h3>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">₹14.85L / ₹20.00L</span>
                    <span className="font-extrabold text-indigo-700">74%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track */}
              <div className="h-3 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="clay-badge-purple h-full rounded-full transition-all duration-500" 
                  style={{ width: "74%" }} 
                />
              </div>
            </div>

            {/* Goal 2: Monthly Orders Target */}
            <div className="clay-inset p-3.5 space-y-2.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="clay-badge-green flex h-10 w-10 shrink-0 items-center justify-center text-lg text-white shadow-xs">
                  🛍️
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 truncate">Monthly Orders Goal</h3>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">3,842 / 4,500</span>
                    <span className="font-extrabold text-emerald-700">85%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track */}
              <div className="h-3 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="clay-badge-green h-full rounded-full transition-all duration-500" 
                  style={{ width: "85%" }} 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Store Growth Insight (5 Cols) */}
        <div className="clay-tip-card p-4 sm:p-5 lg:p-6 lg:col-span-5 flex flex-col justify-between relative overflow-hidden min-w-0">
          <div className="flex items-start gap-3.5 z-10">
            <div className="clay-badge-amber flex h-11 w-11 shrink-0 items-center justify-center text-xl text-white shadow-xs">
              💡
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#1E3B1B]">Store Growth Insight</h3>
              <p className="text-xs text-[#3E5C38] leading-relaxed font-semibold">
                Cat nutrition &amp; organic dental chews reorders increased by 28% this week.
              </p>
              <p className="text-xs font-bold text-[#1E3B1B] pt-0.5">
                Keep bestsellers stocked! 🚀
              </p>
            </div>
          </div>

          <div className="pt-3 flex justify-end z-10 select-none">
            <div className="clay-button flex h-9 w-9 rounded-full items-center justify-center text-lg">
              🐾
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
