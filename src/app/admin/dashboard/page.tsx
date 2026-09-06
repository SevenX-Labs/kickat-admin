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
    <div className="space-y-5 sm:space-y-6 pb-6 w-full min-w-0">
      
      {/* =========================================================
          1. TOP ROW: 4 Tactile 3D Clay Stat Cards (FinTrack Reference)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 w-full min-w-0">
        
        {/* Card 1: Total Balance (3D Purple Clay Wallet) */}
        <div className="clay-card p-5 sm:p-6 flex justify-between items-center relative overflow-hidden min-w-0">
          <div className="space-y-1.5 sm:space-y-2 z-10 min-w-0 flex-1 pr-2">
            <span className="text-xs font-bold text-slate-500">Total Balance</span>
            <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#2A241E]">
              ₹2,45,680
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
              <span>↑ 12.5%</span>
              <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>

          <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition">
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* 3D Purple Clay Wallet */}
          <div className="relative shrink-0 flex items-center justify-center pl-2 select-none">
            {/* Gold Coin peaking from wallet top */}
            <div className="absolute -top-3.5 right-2.5 w-8 h-8 rounded-full bg-gradient-to-br from-[#FFDA79] via-[#F7B731] to-[#D98014] shadow-[0_4px_8px_rgba(247,183,49,0.45),inset_0_2px_2px_rgba(255,255,255,0.8),inset_0_-2px_3px_rgba(150,90,10,0.5)] flex items-center justify-center text-[10px] font-black text-[#5C3B00] z-0">
              ₹
            </div>
            {/* Wallet Body */}
            <div className="clay-badge-purple relative z-10 w-16 h-14 flex items-center justify-end pr-1.5">
              {/* Wallet Strap & Stud */}
              <div className="w-6 h-5 rounded-lg bg-[#5347DE] shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),inset_0_-2px_3px_rgba(35,28,120,0.5),2px_3px_6px_rgba(0,0,0,0.2)] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F7B731] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.3)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Total Income (3D Green Clay Money Sack) */}
        <div className="clay-card p-5 sm:p-6 flex justify-between items-center relative overflow-hidden min-w-0">
          <div className="space-y-1.5 sm:space-y-2 z-10 min-w-0 flex-1 pr-2">
            <span className="text-xs font-bold text-slate-500">Total Income</span>
            <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#2A241E]">
              ₹1,20,850
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
              <span>↑ 8.3%</span>
              <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>

          <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition">
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* 3D Green Clay Money Sack */}
          <div className="relative shrink-0 flex flex-col items-center justify-center pl-2 select-none">
            {/* Top Tied Collar */}
            <div className="w-7 h-3 rounded-t-full bg-[#2E8B50] shadow-[inset_0_2px_2px_rgba(255,255,255,0.4)] mb-[-2px] z-20" />
            {/* Tied Rope */}
            <div className="w-8 h-1.5 rounded-full bg-[#F5CD79] shadow-xs z-30 mb-[-3px]" />
            {/* Puffy Sack Body */}
            <div className="clay-badge-green relative z-10 w-16 h-14 flex items-center justify-center">
              <span className="text-white font-black text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">₹</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Expenses (3D Coral Red Clay Shopping Tote) */}
        <div className="clay-card p-5 sm:p-6 flex justify-between items-center relative overflow-hidden min-w-0">
          <div className="space-y-1.5 sm:space-y-2 z-10 min-w-0 flex-1 pr-2">
            <span className="text-xs font-bold text-slate-500">Total Expenses</span>
            <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#2A241E]">
              ₹78,900
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
              <span>↑ 5.2%</span>
              <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>

          <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition">
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* 3D Coral Clay Tote Bag */}
          <div className="relative shrink-0 flex flex-col items-center justify-center pl-2 select-none">
            {/* Arched Handles */}
            <div className="w-8 h-5 rounded-t-full border-[3.5px] border-[#C83848] bg-transparent mb-[-4px] z-0 shadow-xs" />
            {/* Tote Body */}
            <div className="clay-badge-coral relative z-10 w-16 h-13 flex items-center justify-center">
              <div className="w-6 h-5 rounded-lg bg-[#C83848] shadow-inner" />
            </div>
          </div>
        </div>

        {/* Card 4: Savings This Month (3D Stack of Gold Clay Coins) */}
        <div className="clay-card p-5 sm:p-6 flex justify-between items-center relative overflow-hidden min-w-0">
          <div className="space-y-1.5 sm:space-y-2 z-10 min-w-0 flex-1 pr-2">
            <span className="text-xs font-bold text-slate-500">Savings This Month</span>
            <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#2A241E]">
              ₹41,950
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
              <span>↑ 15.8%</span>
              <span className="text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>

          <button className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition">
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* 3D Stack of Gold Clay Coins (FinTrack twin stack) */}
          <div className="relative shrink-0 flex items-end justify-center pl-2 select-none h-14 w-16">
            {/* Left stack (2 coins) */}
            <div className="relative flex flex-col items-center -mr-1.5 z-10">
              <div className="w-7 h-4 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_3px_6px_rgba(212,136,16,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(150,85,10,0.5)] -mb-2 border border-[#FFF2B2]/60 z-20 flex items-center justify-center text-[7.5px] font-black text-[#663C00]">₹</div>
              <div className="w-7 h-4 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_3px_6px_rgba(212,136,16,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(150,85,10,0.5)] border border-[#FFF2B2]/60 z-10" />
            </div>
            {/* Right stack (3 coins, taller) */}
            <div className="relative flex flex-col items-center z-20">
              <div className="w-8 h-4.5 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_3px_6px_rgba(212,136,16,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(150,85,10,0.5)] -mb-2 border border-[#FFF2B2]/60 z-30 flex items-center justify-center text-[8px] font-black text-[#663C00]">₹</div>
              <div className="w-8 h-4.5 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_3px_6px_rgba(212,136,16,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(150,85,10,0.5)] -mb-2 border border-[#FFF2B2]/60 z-20" />
              <div className="w-8 h-4.5 rounded-full bg-gradient-to-br from-[#FFE894] via-[#F7B731] to-[#D48810] shadow-[0_3px_6px_rgba(212,136,16,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.8),inset_0_-1.5px_2px_rgba(150,85,10,0.5)] border border-[#FFF2B2]/60 z-10" />
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================
          2. MIDDLE ROW: Spending Overview (3D Donut Chart) + Recent Transactions
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full min-w-0">
        
        {/* LEFT: Spending Overview (6 Cols) */}
        <div className="clay-card p-5 sm:p-6 lg:col-span-6 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
              Spending Overview
            </h2>
            <div className="clay-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 cursor-pointer">
              <span>{timeRange}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6">
            
            {/* 3D Multi-Color Tactile Clay Donut Chart */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-48 h-48 sm:w-52 sm:h-52 transform -rotate-90 drop-shadow-[0_12px_24px_rgba(195,180,165,0.35)]" viewBox="0 0 100 100">
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
                <span className="text-[11px] font-bold text-slate-400">Total</span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2A241E]">
                  ₹78,900
                </span>
              </div>
            </div>

            {/* Category Breakdown Legend */}
            <div className="w-full sm:w-auto flex-1 space-y-2.5">
              {[
                { label: "Housing", amount: "₹25,000", pct: "31%", color: "bg-[#6D62FE]" },
                { label: "Food & Dining", amount: "₹18,600", pct: "24%", color: "bg-[#4EBA79]" },
                { label: "Transport", amount: "₹12,300", pct: "16%", color: "bg-[#F7B731]" },
                { label: "Shopping", amount: "₹10,500", pct: "13%", color: "bg-[#F26674]" },
                { label: "Entertainment", amount: "₹6,500", pct: "8%", color: "bg-[#A55EEA]" },
                { label: "Others", amount: "₹6,000", pct: "8%", color: "bg-[#45AAF2]" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-3 w-3 rounded-full ${item.color} shadow-xs`} />
                    <span className="font-semibold text-slate-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800">{item.amount}</span>
                    <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{item.pct}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT: Recent Transactions & 3D Character Desk (6 Cols) */}
        <div className="clay-card p-5 sm:p-6 lg:col-span-6 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 items-center">
            
            {/* Transactions List (7 Cols) */}
            <div className="md:col-span-7 space-y-3">
              {[
                { name: "Starbucks Coffee", category: "Food & Dining", amount: "-₹450", time: "Today", icon: "☕", badgeClass: "clay-badge-amber" },
                { name: "Uber Ride", category: "Transport", amount: "-₹320", time: "Today", icon: "🚙", badgeClass: "clay-badge-blue" },
                { name: "Salary from ABC Ltd.", category: "Income", amount: "+₹85,000", time: "Yesterday", isPositive: true, icon: "💳", badgeClass: "clay-badge-green" },
                { name: "Amazon Shopping", category: "Shopping", amount: "-₹1,250", time: "18 May 2026", icon: "🛍️", badgeClass: "clay-badge-coral" },
              ].map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-2xl hover:bg-[#F9F6F2] transition">
                  <div className="flex items-center gap-3">
                    <div className={`${tx.badgeClass} flex h-10 w-10 shrink-0 items-center justify-center text-lg text-white shadow-xs`}>
                      {tx.icon}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 leading-tight">{tx.name}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-extrabold ${tx.isPositive ? "text-[#20BF6B]" : "text-slate-800"}`}>
                      {tx.amount}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Clay Desk Scene (5 Cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-[#F5EFE9] border border-[#E8DFC0]/50 shadow-[inset_2px_2px_5px_rgba(195,180,165,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] text-center relative overflow-hidden">
              {/* 3D Boy in Purple Hoodie Avatar */}
              <div className="relative select-none transform hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#635BFF] via-[#7B72F0] to-[#A299FB] flex items-center justify-center text-3xl shadow-[0_6px_14px_rgba(99,91,255,0.35),inset_0_2px_3px_rgba(255,255,255,0.5)]">
                  👦
                </div>
              </div>
              
              {/* Clay Wooden Desk */}
              <div className="w-full mt-3 pt-2 border-t-4 border-[#C7955F] rounded-t-xl bg-[#E8C296] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_3px_6px_rgba(0,0,0,0.08)] p-2">
                <div className="flex items-center justify-center gap-3 text-base">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full min-w-0">
        
        {/* Goals Progress (7 Cols) */}
        <div className="clay-card p-5 sm:p-6 lg:col-span-7 space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
              Goals Progress
            </h2>
            <button className="clay-button px-3.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition">
              View All Goals
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Goal 1: Vacation in Bali (🏝️) */}
            <div className="clay-inset p-4 space-y-3 min-w-0">
              <div className="flex items-center gap-3">
                <div className="clay-badge-blue flex h-11 w-11 shrink-0 items-center justify-center text-xl text-white shadow-xs">
                  🏝️
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 truncate">Vacation in Bali</h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">₹60,000 / ₹1,00,000</span>
                    <span className="font-extrabold text-slate-900">60%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track */}
              <div className="h-3.5 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="clay-badge-purple h-full rounded-full transition-all duration-500" 
                  style={{ width: "60%" }} 
                />
              </div>
            </div>

            {/* Goal 2: Buy New Laptop (💻) */}
            <div className="clay-inset p-4 space-y-3 min-w-0">
              <div className="flex items-center gap-3">
                <div className="clay-badge-green flex h-11 w-11 shrink-0 items-center justify-center text-xl text-white shadow-xs">
                  💻
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 truncate">Buy New Laptop</h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">₹45,000 / ₹80,000</span>
                    <span className="font-extrabold text-slate-900">56%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track */}
              <div className="h-3.5 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="clay-badge-green h-full rounded-full transition-all duration-500" 
                  style={{ width: "56%" }} 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Smart Tip Card (5 Cols) - Exact Match to Reference */}
        <div className="clay-tip-card p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between relative overflow-hidden min-w-0">
          <div className="flex items-start gap-4 z-10">
            {/* 3D Yellow Clay Lightbulb */}
            <div className="clay-badge-amber flex h-12 w-12 shrink-0 items-center justify-center text-2xl text-white shadow-xs">
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

          {/* Plant Accent in bottom right corner */}
          <div className="pt-4 flex justify-end z-10 select-none">
            <div className="clay-button flex h-10 w-10 rounded-full items-center justify-center text-xl">
              🪴
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
