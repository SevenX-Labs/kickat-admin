"use client";

import { 
  MoreVertical, 
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("This Month");

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 w-full min-w-0 no-scrollbar">
      
      {/* =========================================================
          1. TOP ROW: 4 Tactile 3D Clay Stat Cards (Zero Overlap Layout)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
        
        {/* Card 1: Total Balance (3D Purple Clay Wallet) */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden min-w-0 transition-all hover:scale-[1.01]">
          {/* Top Row: Title & Action button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 truncate">Total Balance</span>
            <button className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Main Row: Value & 3D Artwork */}
          <div className="flex items-end justify-between gap-2 pt-2.5 z-10 min-w-0">
            <div className="min-w-0 space-y-1">
              <div className="text-2xl sm:text-[26px] lg:text-2xl xl:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
                ₹2,45,680
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span>↑ 12.5%</span>
                <span className="text-[10.5px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* 3D Purple Clay Wallet */}
            <div className="relative shrink-0 flex items-center justify-center select-none pl-1">
              <div className="absolute -top-2.5 right-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-[#FFDA79] via-[#F7B731] to-[#D98014] shadow-[0_3px_6px_rgba(247,183,49,0.4),inset_0_1.5px_1.5px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(150,90,10,0.5)] flex items-center justify-center text-[9px] font-black text-[#5C3B00] z-0">
                ₹
              </div>
              <div className="clay-badge-purple relative z-10 w-14 h-12 rounded-2xl flex items-center justify-end pr-1 shadow-md">
                <div className="w-5 h-4 rounded-md bg-[#5347DE] shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.4),inset_0_-1.5px_2px_rgba(35,28,120,0.5),1px_2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#F7B731] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.3)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Income (3D Green Clay Money Sack) */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden min-w-0 transition-all hover:scale-[1.01]">
          {/* Top Row: Title & Action button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 truncate">Total Income</span>
            <button className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Main Row: Value & 3D Artwork */}
          <div className="flex items-end justify-between gap-2 pt-2.5 z-10 min-w-0">
            <div className="min-w-0 space-y-1">
              <div className="text-2xl sm:text-[26px] lg:text-2xl xl:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
                ₹1,20,850
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span>↑ 8.3%</span>
                <span className="text-[10.5px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* 3D Green Clay Money Sack */}
            <div className="relative shrink-0 flex flex-col items-center justify-center select-none pl-1">
              <div className="w-6 h-2.5 rounded-t-full bg-[#2E8B50] shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.4)] mb-[-2px] z-20" />
              <div className="w-7 h-1.5 rounded-full bg-[#F5CD79] shadow-xs z-30 mb-[-2px]" />
              <div className="clay-badge-green relative z-10 w-14 h-12 rounded-2xl flex items-center justify-center shadow-md">
                <span className="text-white font-black text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">₹</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Total Expenses (3D Coral Red Clay Shopping Tote) */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden min-w-0 transition-all hover:scale-[1.01]">
          {/* Top Row: Title & Action button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 truncate">Total Expenses</span>
            <button className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Main Row: Value & 3D Artwork */}
          <div className="flex items-end justify-between gap-2 pt-2.5 z-10 min-w-0">
            <div className="min-w-0 space-y-1">
              <div className="text-2xl sm:text-[26px] lg:text-2xl xl:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
                ₹78,900
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span>↑ 5.2%</span>
                <span className="text-[10.5px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* 3D Coral Clay Tote Bag */}
            <div className="relative shrink-0 flex flex-col items-center justify-center select-none pl-1">
              <div className="w-7 h-4 rounded-t-full border-[3px] border-[#C83848] bg-transparent mb-[-3px] z-0 shadow-xs" />
              <div className="clay-badge-coral relative z-10 w-14 h-11 rounded-2xl flex items-center justify-center shadow-md">
                <div className="w-5 h-4 rounded-md bg-[#C83848] shadow-inner" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Savings This Month (3D Stack of Gold Clay Coins) */}
        <div className="clay-card p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden min-w-0 transition-all hover:scale-[1.01]">
          {/* Top Row: Title & Action button */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 truncate">Savings This Month</span>
            <button className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Main Row: Value & 3D Artwork */}
          <div className="flex items-end justify-between gap-2 pt-2.5 z-10 min-w-0">
            <div className="min-w-0 space-y-1">
              <div className="text-2xl sm:text-[26px] lg:text-2xl xl:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
                ₹41,950
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span>↑ 15.8%</span>
                <span className="text-[10.5px] text-slate-400 font-medium">vs last month</span>
              </div>
            </div>

            {/* 3D Stack of Gold Clay Coins */}
            <div className="relative shrink-0 flex items-end justify-center select-none h-12 w-14 pl-1">
              {/* Left stack (2 coins) */}
              <div className="relative flex flex-col items-center -mr-1 z-10">
                <div className="w-6 h-3.5 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_2px_4px_rgba(212,136,16,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1px_1.5px_rgba(150,85,10,0.5)] -mb-1.5 border border-[#FFF2B2]/60 z-20 flex items-center justify-center text-[7px] font-black text-[#663C00]">₹</div>
                <div className="w-6 h-3.5 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_2px_4px_rgba(212,136,16,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1px_1.5px_rgba(150,85,10,0.5)] border border-[#FFF2B2]/60 z-10" />
              </div>
              {/* Right stack (3 coins) */}
              <div className="relative flex flex-col items-center z-20">
                <div className="w-7 h-4 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_2px_4px_rgba(212,136,16,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1px_1.5px_rgba(150,85,10,0.5)] -mb-1.5 border border-[#FFF2B2]/60 z-30 flex items-center justify-center text-[7.5px] font-black text-[#663C00]">₹</div>
                <div className="w-7 h-4 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_2px_4px_rgba(212,136,16,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1px_1.5px_rgba(150,85,10,0.5)] -mb-1.5 border border-[#FFF2B2]/60 z-20" />
                <div className="w-7 h-4 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_2px_4px_rgba(212,136,16,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.8),inset_0_-1px_1.5px_rgba(150,85,10,0.5)] border border-[#FFF2B2]/60 z-10" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================
          2. MIDDLE ROW: Spending Overview (3D Donut Chart) + Recent Transactions
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full min-w-0">
        
        {/* LEFT: Spending Overview (6 Cols) */}
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-6 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
              Spending Overview
            </h2>
            <div 
              onClick={() => setTimeRange(timeRange === "This Month" ? "Last Month" : "This Month")}
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
                
                {/* Purple segment: Housing (31%) */}
                <circle cx="50" cy="50" r="38" stroke="#6D62FE" strokeWidth="15" fill="none"
                  strokeDasharray="74 165" strokeDashoffset="0" strokeLinecap="round" />
                
                {/* Green segment: Food & Dining (24%) */}
                <circle cx="50" cy="50" r="38" stroke="#4EBA79" strokeWidth="15" fill="none"
                  strokeDasharray="57 182" strokeDashoffset="-76" strokeLinecap="round" />
                
                {/* Amber segment: Transport (16%) */}
                <circle cx="50" cy="50" r="38" stroke="#F7B731" strokeWidth="15" fill="none"
                  strokeDasharray="38 201" strokeDashoffset="-135" strokeLinecap="round" />
                
                {/* Coral segment: Shopping (13%) */}
                <circle cx="50" cy="50" r="38" stroke="#F26674" strokeWidth="15" fill="none"
                  strokeDasharray="31 208" strokeDashoffset="-175" strokeLinecap="round" />
                
                {/* Blue segment: Others (16%) */}
                <circle cx="50" cy="50" r="38" stroke="#45AAF2" strokeWidth="15" fill="none"
                  strokeDasharray="38 201" strokeDashoffset="-208" strokeLinecap="round" />
              </svg>

              {/* Recessed Center Hub */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono-eyebrow">Total</span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2A241E]">
                  ₹78,900
                </span>
              </div>
            </div>

            {/* Category Breakdown Legend */}
            <div className="w-full sm:w-auto flex-1 space-y-2">
              {[
                { label: "Housing", amount: "₹25,000", pct: "31%", color: "bg-[#6D62FE]" },
                { label: "Food & Dining", amount: "₹18,600", pct: "24%", color: "bg-[#4EBA79]" },
                { label: "Transport", amount: "₹12,300", pct: "16%", color: "bg-[#F7B731]" },
                { label: "Shopping", amount: "₹10,500", pct: "13%", color: "bg-[#F26674]" },
                { label: "Entertainment", amount: "₹6,500", pct: "8%", color: "bg-[#A55EEA]" },
                { label: "Others", amount: "₹6,000", pct: "8%", color: "bg-[#45AAF2]" },
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

        {/* RIGHT: Recent Transactions & 3D Character Desk (6 Cols) */}
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-6 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
              Recent Transactions
            </h2>
            <Link 
              href="/admin/dashboard/orders" 
              className="clay-button px-3.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 pt-3.5 items-center">
            
            {/* Transactions List (7 Cols) */}
            <div className="md:col-span-7 space-y-2">
              {[
                { name: "Starbucks Coffee", category: "Food & Dining", amount: "-₹450", time: "Today", icon: "☕", badgeClass: "clay-badge-amber" },
                { name: "Uber Ride", category: "Transport", amount: "-₹320", time: "Today", icon: "🚙", badgeClass: "clay-badge-blue" },
                { name: "Salary from ABC Ltd.", category: "Income", amount: "+₹85,000", time: "Yesterday", isPositive: true, icon: "💳", badgeClass: "clay-badge-green" },
                { name: "Amazon Shopping", category: "Shopping", amount: "-₹1,250", time: "18 May 2026", icon: "🛍️", badgeClass: "clay-badge-coral" },
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-2xl hover:bg-[#F9F6F2] transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`${tx.badgeClass} flex h-9 w-9 shrink-0 items-center justify-center text-base text-white shadow-xs rounded-xl`}>
                      {tx.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-800 leading-tight truncate">{tx.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-extrabold ${tx.isPositive ? "text-[#20BF6B]" : "text-slate-800"}`}>
                      {tx.amount}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Clay Desk Scene (5 Cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-[#F5EFE9] border border-[#E8DFC0]/50 shadow-[inset_2px_2px_5px_rgba(195,180,165,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] text-center relative overflow-hidden">
              <div className="relative select-none transform hover:scale-105 transition-transform duration-300">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#635BFF] via-[#7B72F0] to-[#A299FB] flex items-center justify-center text-2xl sm:text-3xl shadow-[0_6px_14px_rgba(99,91,255,0.35),inset_0_2px_3px_rgba(255,255,255,0.5)]">
                  👦
                </div>
              </div>
              
              <div className="w-full mt-2.5 pt-2 border-t-4 border-[#C7955F] rounded-t-xl bg-[#E8C296] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_3px_6px_rgba(0,0,0,0.08)] p-1.5">
                <div className="flex items-center justify-center gap-2.5 text-base">
                  <span className="drop-shadow-xs">☕</span>
                  <span className="drop-shadow-xs">💻</span>
                  <span className="drop-shadow-xs">🪴</span>
                </div>
              </div>
              <p className="text-[10.5px] font-extrabold text-slate-600 mt-1.5">FinTrack Workspace</p>
            </div>

          </div>
        </div>

      </div>

      {/* =========================================================
          3. BOTTOM ROW: Goals Progress + Smart Tip Card
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full min-w-0">
        
        {/* Goals Progress (7 Cols) */}
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-7 space-y-3.5 min-w-0">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
              Goals Progress
            </h2>
            <button className="clay-button px-3.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition">
              View All Goals
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Goal 1: Vacation in Bali (🏝️) */}
            <div className="clay-inset p-3.5 space-y-2.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="clay-badge-blue flex h-10 w-10 shrink-0 items-center justify-center text-lg text-white shadow-xs">
                  🏝️
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 truncate">Vacation in Bali</h3>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">₹60,000 / ₹1,00,000</span>
                    <span className="font-extrabold text-slate-900">60%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track */}
              <div className="h-3 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="clay-badge-purple h-full rounded-full transition-all duration-500" 
                  style={{ width: "60%" }} 
                />
              </div>
            </div>

            {/* Goal 2: Buy New Laptop (💻) */}
            <div className="clay-inset p-3.5 space-y-2.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="clay-badge-green flex h-10 w-10 shrink-0 items-center justify-center text-lg text-white shadow-xs">
                  💻
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 truncate">Buy New Laptop</h3>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">₹45,000 / ₹80,000</span>
                    <span className="font-extrabold text-slate-900">56%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track */}
              <div className="h-3 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="clay-badge-green h-full rounded-full transition-all duration-500" 
                  style={{ width: "56%" }} 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Smart Tip Card (5 Cols) */}
        <div className="clay-tip-card p-4 sm:p-5 lg:p-6 lg:col-span-5 flex flex-col justify-between relative overflow-hidden min-w-0">
          <div className="flex items-start gap-3.5 z-10">
            <div className="clay-badge-amber flex h-11 w-11 shrink-0 items-center justify-center text-xl text-white shadow-xs">
              💡
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#1E3B1B]">Smart Tip</h3>
              <p className="text-xs text-[#3E5C38] leading-relaxed font-semibold">
                You&apos;re saving 15% more this month.
              </p>
              <p className="text-xs font-bold text-[#1E3B1B] pt-0.5">
                Keep it up! 🎉
              </p>
            </div>
          </div>

          <div className="pt-3 flex justify-end z-10 select-none">
            <div className="clay-button flex h-9 w-9 rounded-full items-center justify-center text-lg">
              🪴
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
