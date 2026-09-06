"use client";

import { 
  Calendar, 
  ChevronDown, 
  MoreVertical,
  Target,
  ShoppingBag,
  Users,
  TrendingUp,
  Share2,
  Search,
  MessageCircle
} from "lucide-react";
import { useState } from "react";

type Timeframe = "Daily" | "Weekly" | "Monthly";

interface ChartPoint {
  label: string;
  revenue: number; // in thousands (₹k)
  orders: number;
  heightPct: number;
}

const CHART_DATA: Record<Timeframe, ChartPoint[]> = {
  Daily: [
    { label: "00:00", revenue: 8, orders: 12, heightPct: 18 },
    { label: "04:00", revenue: 4, orders: 6, heightPct: 10 },
    { label: "08:00", revenue: 19, orders: 28, heightPct: 42 },
    { label: "12:00", revenue: 38, orders: 54, heightPct: 82 },
    { label: "16:00", revenue: 46, orders: 68, heightPct: 95 },
    { label: "20:00", revenue: 34, orders: 49, heightPct: 74 },
    { label: "23:00", revenue: 16, orders: 22, heightPct: 35 },
  ],
  Weekly: [
    { label: "Mon", revenue: 24, orders: 42, heightPct: 50 },
    { label: "Tue", revenue: 38, orders: 64, heightPct: 75 },
    { label: "Wed", revenue: 19, orders: 31, heightPct: 38 },
    { label: "Thu", revenue: 48, orders: 82, heightPct: 92 },
    { label: "Fri", revenue: 32, orders: 55, heightPct: 62 },
    { label: "Sat", revenue: 56, orders: 96, heightPct: 100 },
    { label: "Sun", revenue: 44, orders: 76, heightPct: 85 },
  ],
  Monthly: [
    { label: "Week 1", revenue: 112, orders: 240, heightPct: 65 },
    { label: "Week 2", revenue: 145, orders: 310, heightPct: 84 },
    { label: "Week 3", revenue: 128, orders: 275, heightPct: 74 },
    { label: "Week 4", revenue: 172, orders: 368, heightPct: 100 },
  ],
};

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("Weekly");
  const currentData = CHART_DATA[timeframe];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 w-full min-w-0">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-fraunces text-2xl lg:text-[28px] font-bold text-[#2A241E] tracking-tight">
            Analytics & Insights
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track key commerce metrics, conversion rates, and revenue trajectory.
          </p>
        </div>

        {/* Date Selector & Live Stream Status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="clay-button flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-slate-700 cursor-pointer hover:border-slate-300 transition">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">Last 30 Days</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </div>

          <div className="clay-button flex items-center gap-2 px-3 py-1.5 sm:px-3 sm:py-2 text-xs font-bold text-emerald-700 bg-emerald-50/70 border border-emerald-200/50 shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="font-mono-eyebrow text-[10px] sm:text-[10.5px]">Live Stream</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          2. TOP ROW: 4 Stat Cards with Responsive Layout
          - 1 column on mobile
          - 2 columns on tablet / small laptops (up to 1279px)
          - 4 columns on desktop (1280px+)
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-4 2xl:gap-5 w-full min-w-0">
        
        {/* Card 1: Conversion Rate */}
        <div className="clay-card p-4 sm:p-5 2xl:p-6 flex justify-between items-center relative overflow-hidden min-w-0">
          <div className="space-y-1.5 sm:space-y-2 z-10 min-w-0 flex-1 pr-2">
            <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate block">
              Conversion Rate
            </span>
            <div className="text-xl sm:text-2xl 2xl:text-[28px] font-bold tracking-tight text-[#2A241E]">
              3.42%
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#10B981] whitespace-nowrap">
              <span>↑ 0.6%</span>
              <span className="text-[10.5px] sm:text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>

          {/* Minimal shadow icon container */}
          <div className="relative shrink-0 flex items-center justify-center select-none">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <Target className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* Card 2: Avg. Order Value */}
        <div className="clay-card p-4 sm:p-5 2xl:p-6 flex justify-between items-center relative overflow-hidden min-w-0">
          <div className="space-y-1.5 sm:space-y-2 z-10 min-w-0 flex-1 pr-2">
            <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate block">
              Avg. Order Value
            </span>
            <div className="text-xl sm:text-2xl 2xl:text-[28px] font-bold tracking-tight text-[#2A241E]">
              ₹1,840
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#10B981] whitespace-nowrap">
              <span>↑ 12.4%</span>
              <span className="text-[10.5px] sm:text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>

          <div className="relative shrink-0 flex items-center justify-center select-none">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* Card 3: Active Sessions */}
        <div className="clay-card p-4 sm:p-5 2xl:p-6 flex justify-between items-center relative overflow-hidden min-w-0">
          <div className="space-y-1.5 sm:space-y-2 z-10 min-w-0 flex-1 pr-2">
            <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate block">
              Active Sessions
            </span>
            <div className="text-xl sm:text-2xl 2xl:text-[28px] font-bold tracking-tight text-[#2A241E]">
              1,420
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#10B981] whitespace-nowrap">
              <span>↑ 8.1%</span>
              <span className="text-[10.5px] sm:text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>

          <div className="relative shrink-0 flex items-center justify-center select-none">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2]" />
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Growth */}
        <div className="clay-card p-4 sm:p-5 2xl:p-6 flex justify-between items-center relative overflow-hidden min-w-0">
          <div className="space-y-1.5 sm:space-y-2 z-10 min-w-0 flex-1 pr-2">
            <span className="text-[10.5px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate block">
              Monthly Growth
            </span>
            <div className="text-xl sm:text-2xl 2xl:text-[28px] font-bold tracking-tight text-[#2A241E]">
              22.8%
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#10B981] whitespace-nowrap">
              <span>↑ 4.2%</span>
              <span className="text-[10.5px] sm:text-[11px] text-slate-400 font-medium">vs last month</span>
            </div>
          </div>

          <div className="relative shrink-0 flex items-center justify-center select-none">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.4]" />
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================
          3. MIDDLE SECTION: Real Readable Chart & Conversion Funnel
          - Mathematically aligned grid system (No overflow)
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 w-full min-w-0">
        
        {/* Main Chart (8 Cols): Revenue & Sales Trajectory */}
        <div className="clay-card p-4 sm:p-6 lg:col-span-8 flex flex-col justify-between space-y-4 sm:space-y-5 min-w-0 overflow-hidden">
          
          {/* Chart Header & Toggle Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 min-w-0">
            <div className="min-w-0">
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E] truncate">
                Revenue & Sales Trajectory
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                Gross sales volume over time across all payment channels
              </p>
            </div>

            {/* Timeframe Pill Switcher */}
            <div className="flex items-center p-1 rounded-2xl bg-[#F7F4EF] border border-slate-200/50 gap-1 shrink-0 self-start sm:self-auto">
              {(["Daily", "Weekly", "Monthly"] as Timeframe[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeframe(tab)}
                  className={`px-2.5 sm:px-3 py-1 text-xs font-bold transition-all rounded-xl ${
                    timeframe === tab
                      ? "bg-orange-500 text-white shadow-[0_2px_4px_rgba(249,115,22,0.20)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Fully Responsive & Aligned Chart with Visible Y-Axis and X-Axis */}
          <div className="pt-2 pb-1 w-full min-w-0">
            <div className="flex gap-2 sm:gap-4 w-full min-w-0">
              
              {/* Visible Y-Axis Scale */}
              <div className="flex flex-col justify-between text-[10px] sm:text-[11px] font-bold text-slate-400 py-1 select-none w-8 sm:w-10 text-right shrink-0">
                <span>{timeframe === "Monthly" ? "₹200k" : "₹60k"}</span>
                <span>{timeframe === "Monthly" ? "₹150k" : "₹45k"}</span>
                <span>{timeframe === "Monthly" ? "₹100k" : "₹30k"}</span>
                <span>{timeframe === "Monthly" ? "₹50k" : "₹15k"}</span>
                <span>₹0</span>
              </div>

              {/* Chart Grid & Pillars Area */}
              <div className="flex-1 relative min-w-0">
                
                {/* Horizontal Reference Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                  <div className="border-b border-dashed border-slate-200/90 w-full" />
                  <div className="border-b border-dashed border-slate-200/90 w-full" />
                  <div className="border-b border-dashed border-slate-200/90 w-full" />
                  <div className="border-b border-dashed border-slate-200/90 w-full" />
                  <div className="border-b-2 border-slate-300 w-full" />
                </div>

                {/* Vertical Bar Columns: Mathematical CSS Grid perfectly matching data points */}
                <div 
                  className="h-48 sm:h-56 w-full relative z-10 grid items-end"
                  style={{ gridTemplateColumns: `repeat(${currentData.length}, minmax(0, 1fr))` }}
                >
                  {currentData.map((bar, idx) => (
                    <div key={idx} className="relative flex flex-col items-center justify-end h-full w-full group min-w-0 px-1 sm:px-2">
                      
                      {/* Interactive Hover Tooltip - Absolute positioned so it NEVER pushes column width */}
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 clay-button px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-slate-800 whitespace-nowrap pointer-events-none shadow-[0_4px_8px_rgba(0,0,0,0.08)] z-30">
                        ₹{bar.revenue}k • {bar.orders} orders
                      </div>

                      {/* Brand Orange Bar Pillar */}
                      <div 
                        className="w-full max-w-[28px] sm:max-w-[36px] xl:max-w-[40px] rounded-t-lg sm:rounded-t-xl bg-gradient-to-t from-orange-600 to-orange-400 shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-all duration-300 transform group-hover:brightness-105 origin-bottom"
                        style={{ height: `${bar.heightPct}%` }}
                      />
                    </div>
                  ))}
                </div>

                {/* Visible X-Axis Labels Grid - EXACT SAME column template as bars */}
                <div 
                  className="w-full pt-2.5 grid text-[10.5px] sm:text-xs font-bold text-slate-500"
                  style={{ gridTemplateColumns: `repeat(${currentData.length}, minmax(0, 1fr))` }}
                >
                  {currentData.map((bar, idx) => (
                    <span key={idx} className="text-center truncate px-0.5">
                      {bar.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Chart Footer Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F97316] shadow-xs" />
                <span className="font-bold text-slate-700">Gross Sales (₹)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1E293B] shadow-xs" />
                <span className="font-semibold text-slate-500">Order Benchmark</span>
              </div>
            </div>
            <span className="font-bold text-slate-700 text-[11px] sm:text-xs">Peak: Saturday (₹56,000)</span>
          </div>
        </div>

        {/* Conversion Funnel (4 Cols): Brand Orange Progress Fills */}
        <div className="clay-card p-4 sm:p-6 lg:col-span-4 flex flex-col justify-between space-y-4 min-w-0">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E] truncate">
              Conversion Funnel
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-full font-mono-eyebrow shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Live Flow</span>
            </span>
          </div>

          {/* Recessed Funnel Stage Cards */}
          <div className="space-y-2.5 sm:space-y-3">
            {[
              { stage: "Store Visitors", count: "42,850", rate: "100%", width: "100%" },
              { stage: "Product Views", count: "26,400", rate: "61.6%", width: "72%" },
              { stage: "Added to Cart", count: "9,120", rate: "21.2%", width: "48%" },
              { stage: "Completed Orders", count: "3,820", rate: "8.9%", width: "32%" },
            ].map((f, i) => (
              <div key={i} className="clay-inset p-3 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 truncate">{f.stage}</span>
                  <span className="font-extrabold text-[#2A241E] shrink-0 ml-2">{f.count}</span>
                </div>
                {/* Brand Orange Progress Fill with clean solid track */}
                <div className="h-2.5 w-full rounded-full bg-slate-200/80 p-0.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500" 
                    style={{ width: f.width }} 
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-[10px] font-bold text-slate-400">{f.rate} conversion</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 text-center">
            <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium">
              Overall Funnel Efficiency: <strong className="text-emerald-600 font-bold">+2.4% vs Industry</strong>
            </p>
          </div>
        </div>

      </div>

      {/* =========================================================
          4. BOTTOM ROW: Traffic Channels & Smart Growth Tip
          ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 w-full min-w-0">
        
        {/* Top Channels Breakdown (7 Cols) */}
        <div className="clay-card p-4 sm:p-6 lg:col-span-7 space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E] truncate">
              Traffic Acquisition Channels
            </h2>
            <button className="clay-button px-3 py-1 text-xs font-bold text-slate-700 hover:text-orange-600 transition shrink-0">
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { channel: "Direct Web Store", sessions: "18,400", pct: "43%", growth: "+14.2%", icon: ShoppingBag, bg: "bg-orange-500" },
              { channel: "Instagram & Socials", sessions: "12,250", pct: "28%", growth: "+22.5%", icon: Share2, bg: "bg-slate-800" },
              { channel: "Google Search (SEO)", sessions: "8,300", pct: "19%", growth: "+8.7%", icon: Search, bg: "bg-slate-600" },
              { channel: "Email & WhatsApp", sessions: "4,200", pct: "10%", growth: "+5.1%", icon: MessageCircle, bg: "bg-amber-500" },
            ].map((ch, idx) => {
              const Icon = ch.icon;
              return (
                <div key={idx} className="clay-inset p-3 sm:p-3.5 flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className={`${ch.bg} flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-extrabold text-slate-800 truncate">{ch.channel}</h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">{ch.sessions} sessions</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-extrabold text-[#2A241E]">{ch.pct}</span>
                    <p className="text-[10px] font-bold text-emerald-600">{ch.growth}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Tip Card for Analytics (5 Cols) */}
        <div className="clay-tip-card p-4 sm:p-6 lg:col-span-5 flex flex-col justify-between relative overflow-hidden min-w-0">
          <div className="flex items-start gap-3.5 sm:gap-4 z-10">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl sm:text-2xl text-white shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
              💡
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm font-extrabold text-[#1E3B1B]">Growth Tip</h3>
              <p className="text-xs text-[#3E5C38] leading-relaxed font-semibold">
                Weekend orders are peaking 34% higher than weekdays.
              </p>
              <p className="text-xs font-bold text-[#1E3B1B] pt-0.5">
                Consider launching weekend flash deals! 🚀
              </p>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 flex justify-end z-10 select-none">
            <div className="clay-button flex h-9 w-9 sm:h-10 sm:w-10 rounded-full items-center justify-center text-lg sm:text-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              📊
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
