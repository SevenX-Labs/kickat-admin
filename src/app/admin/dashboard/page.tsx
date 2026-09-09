"use client";

import { 
  MoreVertical, 
  ChevronDown,
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  RotateCcw,
  AlertCircle,
  Sliders,
  X,
  Check,
  TrendingUp,
  TrendingDown,
  PieChart,
  Lightbulb,
  Target
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import AdminDashboardService from "@/services/adminDashboardService";
import {
  DashboardPeriod,
  UnifiedDashboardData,
  OrderStatus,
  SalesTargetsData,
} from "@/types/admin-dashboard";

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Today",
  this_week: "This Week",
  "7d": "Last 7 Days",
  this_month: "This Month",
  "30d": "Last 30 Days",
  this_year: "This Year",
  "12m": "Last 12 Months",
  all: "All Time",
  custom: "Custom Range",
};

// Curated brand color system for charts: Brand Orange gradient hues + Dark Navy for high-contrast category slices
const CATEGORY_COLORS = [
  { stroke: "#F97316", bg: "bg-[#F97316]" }, // Brand Orange Primary
  { stroke: "#1E293B", bg: "bg-[#1E293B]" }, // Dark Navy
  { stroke: "#EA580C", bg: "bg-[#EA580C]" }, // Deep Rust Orange
  { stroke: "#475569", bg: "bg-[#475569]" }, // Slate Navy
  { stroke: "#FB923C", bg: "bg-[#FB923C]" }, // Warm Amber Orange
  { stroke: "#94A3B8", bg: "bg-[#94A3B8]" }, // Neutral Slate
];

function formatIndianCurrency(amount: number): string {
  if (isNaN(amount) || amount === 0) return "0";
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)}L`;
  }
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount);
}

function formatFullRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount ?? 0);
}

function getStatusBadgeStyle(status: OrderStatus): { label: string; className: string } {
  switch (status) {
    case "DELIVERED":
      return { label: "Delivered", className: "bg-emerald-50 text-emerald-700 border border-emerald-200/50" };
    case "SHIPPED":
      return { label: "Shipped", className: "bg-slate-100 text-slate-800 border border-slate-200/60" };
    case "OUT_FOR_DELIVERY":
      return { label: "Out for Delivery", className: "bg-orange-50 text-orange-800 border border-orange-200/50" };
    case "PROCESSING":
    case "PACKED":
      return { label: status === "PACKED" ? "Packed" : "Processing", className: "bg-amber-50 text-amber-800 border border-amber-200/50" };
    case "PLACED":
    case "PENDING":
      return { label: status === "PLACED" ? "Placed" : "Pending", className: "bg-orange-50 text-orange-700 border border-orange-200/50" };
    case "CANCELLED":
    case "RETURNED":
      return { label: status === "CANCELLED" ? "Cancelled" : "Returned", className: "bg-rose-50 text-rose-700 border border-rose-200/50" };
    case "RETURN_INITIATED":
      return { label: "Return Initiated", className: "bg-amber-50 text-amber-700 border border-amber-200/50" };
    default:
      return { label: status, className: "bg-slate-50 text-slate-700 border border-slate-200/50" };
  }
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("this_month");
  const [data, setData] = useState<UnifiedDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sales Target Settings Modal state
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetRevenueInput, setTargetRevenueInput] = useState<number>(2000000);
  const [targetOrdersInput, setTargetOrdersInput] = useState<number>(500);
  const [isSavingTargets, setIsSavingTargets] = useState(false);
  const [targetSaveSuccess, setTargetSaveSuccess] = useState(false);

  const fetchDashboardData = useCallback(async (selectedPeriod: DashboardPeriod, showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      const res = await AdminDashboardService.getUnifiedDashboard({
        period: selectedPeriod,
        recentOrdersLimit: 5,
        topCategoriesLimit: 5,
        lowStockThreshold: 10,
      });

      if (res.data) {
        setData(res.data);
        if (res.data.salesTargets) {
          setTargetRevenueInput(res.data.salesTargets.monthlyRevenueTarget);
          setTargetOrdersInput(res.data.salesTargets.monthlyOrdersTarget);
        }
      }
    } catch (err: unknown) {
      console.error("Failed to load dashboard metrics:", err);
      const msg = AdminDashboardService.extractErrorMessage(
        err,
        "Failed to load dashboard metrics. Please check network connection."
      );
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(period, true);
  }, [fetchDashboardData, period]);

  // Close period dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPeriodDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(period, false);
  };

  const handleSelectPeriod = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
    setPeriodDropdownOpen(false);
  };

  // Target Settings Handlers
  const handleOpenTargetModal = () => {
    if (data?.salesTargets) {
      setTargetRevenueInput(data.salesTargets.monthlyRevenueTarget);
      setTargetOrdersInput(data.salesTargets.monthlyOrdersTarget);
    }
    setTargetSaveSuccess(false);
    setIsTargetModalOpen(true);
  };

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTargets(true);
    try {
      const res = await AdminDashboardService.updateSalesTargets({
        monthlyRevenueTarget: Number(targetRevenueInput) || 2000000,
        monthlyOrdersTarget: Number(targetOrdersInput) || 500,
      });

      if (res.data) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            salesTargets: res.data,
          };
        });
      }

      setTargetSaveSuccess(true);
      setTimeout(() => {
        setIsTargetModalOpen(false);
        setTargetSaveSuccess(false);
      }, 1200);
    } catch (err) {
      console.error("Failed to update sales targets:", err);
    } finally {
      setIsSavingTargets(false);
    }
  };

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  const summary = data?.summary;
  const growth = summary?.periodMetrics?.growth;
  const topCategories = data?.topCategories?.categories ?? [];
  const totalCategoryRevenue = data?.topCategories?.totalRevenue ?? 0;
  const recentOrders = data?.recentOrders?.orders ?? [];

  // Monthly Sales Targets from Backend
  const targets: SalesTargetsData = data?.salesTargets ?? {
    monthlyRevenueTarget: 2000000,
    monthlyOrdersTarget: 500,
    currentRevenue: summary?.periodMetrics?.revenue ?? 0,
    currentOrders: summary?.periodMetrics?.orders ?? 0,
    revenueProgressPercentage: 0,
    ordersProgressPercentage: 0,
    month: new Date().toLocaleDateString("en-US", { month: "long" }),
    year: new Date().getFullYear(),
  };

  const currentMonthRevenue = targets.currentRevenue ?? summary?.periodMetrics?.revenue ?? summary?.todayRevenue ?? 0;
  const monthlyRevenueGoal = targets.monthlyRevenueTarget || 2000000;
  const revenueGoalPct = Math.min(100, Math.round((currentMonthRevenue / monthlyRevenueGoal) * 100));

  const currentMonthOrders = targets.currentOrders ?? summary?.periodMetrics?.orders ?? summary?.totalOrders ?? 0;
  const monthlyOrdersGoal = targets.monthlyOrdersTarget || 500;
  const ordersGoalPct = Math.min(100, Math.round((currentMonthOrders / monthlyOrdersGoal) * 100));

  // Dynamic Insight Text (Single-line sentence without duplicate tagline)
  const pendingCount = summary?.pendingOrders ?? 0;
  const stockAlertsCount = summary?.totalInventoryAlerts ?? 0;
  let insightHeadline = "Store Health Healthy";
  let insightDesc = "All systems running smoothly. Cat nutrition & organic treats demand is trending upwards. Keep bestsellers stocked! 🚀";

  if (pendingCount > 0) {
    insightHeadline = `${pendingCount} Orders Awaiting Fulfillment`;
    insightDesc = "Pack and dispatch pending customer orders promptly to maintain high customer satisfaction.";
  } else if (stockAlertsCount > 0) {
    insightHeadline = `${stockAlertsCount} Inventory Warnings`;
    insightDesc = `${summary?.outOfStockProducts ?? 0} items are out of stock and ${summary?.lowStockProducts ?? 0} items are running low. Replenish inventory now to avoid missed sales.`;
  }

  // Circle circumference for r=38
  const CIRCUMFERENCE = 238.761;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 w-full min-w-0 max-w-full overflow-hidden no-scrollbar animate-fade-in">
      
      {/* =========================================================
          CONTROL BAR: Active Period Display & Quick Actions (Tight mobile grouping)
          ========================================================= */}
      <div className="flex flex-row items-center justify-between gap-2.5 bg-white/80 backdrop-blur-md px-3.5 sm:px-4 py-2.5 rounded-2xl border border-[#E8DFC0]/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        {/* Left: Filter label + active pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Filter:</span>
          <span className="text-xs font-extrabold text-[#2A241E] bg-[#F5EFE9] px-2.5 py-1 rounded-lg border border-[#E8DFC0]/60 truncate">
            {PERIOD_LABELS[period]}
          </span>
          {isRefreshing && (
            <span className="text-[11px] font-semibold text-orange-600 flex items-center gap-1 shrink-0 ml-1">
              <RotateCcw className="h-3 w-3 animate-spin" />
              <span className="hidden sm:inline">Updating...</span>
            </span>
          )}
        </div>

        {/* Right: Controls (Refresh + Dropdown, 44px min tap targets) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="clay-button flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition active:scale-95 disabled:opacity-50 cursor-pointer min-h-[44px]"
            aria-label="Refresh dashboard metrics"
            title="Refresh dashboard metrics"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden xs:inline">Refresh</span>
          </button>

          {/* Period Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setPeriodDropdownOpen((prev) => !prev)}
              className="clay-button flex items-center justify-between gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 select-none hover:bg-slate-50 transition active:scale-95 cursor-pointer min-h-[44px]"
              aria-label="Select dashboard time period"
            >
              <span>{PERIOD_LABELS[period]}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {periodDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in text-xs font-semibold">
                {(["today", "7d", "this_week", "this_month", "30d", "this_year", "all"] as DashboardPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSelectPeriod(p)}
                    className={`w-full text-left px-3.5 py-2.5 min-h-[40px] hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between cursor-pointer ${
                      period === p ? "bg-orange-50/70 text-orange-600 font-bold" : "text-slate-700"
                    }`}
                  >
                    <span>{PERIOD_LABELS[p]}</span>
                    {period === p && <span className="text-orange-600 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Non-blocking Error Toast if present */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="truncate">{error}</span>
          </div>
          <button
            onClick={() => fetchDashboardData(period, true)}
            className="text-[11px] font-bold text-rose-800 underline hover:no-underline shrink-0 p-2 min-h-[44px] flex items-center"
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================================================
          1. TOP ROW: 4 E-COMMERCE STAT CARDS
          - Mobile (375px): High-Density 2x2 Grid (md:hidden)
          - Desktop: 4-Column Row (hidden md:grid)
          - Color System: All decorative icon circles unified to BRAND ORANGE & DARK NAVY.
            Green and Red are reserved EXCLUSIVELY for status indicators.
          ========================================================= */}

      {/* MOBILE 2x2 HIGH-DENSITY METRIC GRID (md:hidden) */}
      <div className="grid grid-cols-2 gap-2.5 md:hidden w-full min-w-0">
        
        {/* Mobile Card 1: Revenue (Brand Orange Icon) */}
        <div className="clay-card p-3 min-h-[96px] flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              {period === "all" ? "Total Revenue" : "Revenue"}
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-[0_3px_8px_rgba(249,115,22,0.30)]">
              <IndianRupee className="h-3.5 w-3.5 stroke-[2.4]" />
            </div>
          </div>
          <div className="my-1">
            <p className="font-fraunces text-base font-black text-[#2A241E] truncate">
              ₹{formatIndianCurrency(summary?.periodMetrics?.revenue ?? summary?.totalRevenue ?? 0)}
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold truncate">
            {(growth?.revenuePercentage ?? 0) >= 0 ? (
              <span className="text-[#20BF6B] flex items-center gap-0.5 font-extrabold">
                <TrendingUp className="h-3 w-3 inline" /> +{growth?.revenuePercentage ?? 0}%
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-0.5 font-extrabold">
                <TrendingDown className="h-3 w-3 inline" /> {growth?.revenuePercentage ?? 0}%
              </span>
            )}
            <span className="text-slate-400 font-medium ml-1 text-[9.5px]">vs prev</span>
          </div>
        </div>

        {/* Mobile Card 2: Orders (Brand Orange Icon) */}
        <div className="clay-card p-3 min-h-[96px] flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              {period === "all" ? "Total Orders" : "Orders"}
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-[0_3px_8px_rgba(249,115,22,0.30)]">
              <ShoppingBag className="h-3.5 w-3.5 stroke-[2.3]" />
            </div>
          </div>
          <div className="my-1">
            <p className="font-fraunces text-base font-black text-[#2A241E] truncate">
              {(summary?.periodMetrics?.orders ?? summary?.totalOrders ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold truncate">
            {(growth?.ordersPercentage ?? 0) >= 0 ? (
              <span className="text-[#20BF6B] flex items-center gap-0.5 font-extrabold">
                <TrendingUp className="h-3 w-3 inline" /> +{growth?.ordersPercentage ?? 0}%
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-0.5 font-extrabold">
                <TrendingDown className="h-3 w-3 inline" /> {growth?.ordersPercentage ?? 0}%
              </span>
            )}
            <span className="text-slate-400 font-medium ml-1 text-[9.5px]">vs prev</span>
          </div>
        </div>

        {/* Mobile Card 3: Customers (Dark Navy Icon, Status Green Text) */}
        <div className="clay-card p-3 min-h-[96px] flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Customers
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#334155] via-[#1E293B] to-[#0F172A] text-white shadow-[0_3px_8px_rgba(30,41,59,0.30)]">
              <Users className="h-3.5 w-3.5 stroke-[2.3]" />
            </div>
          </div>
          <div className="my-1">
            <p className="font-fraunces text-base font-black text-[#2A241E] truncate">
              {(summary?.totalCustomers ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold text-[#20BF6B] truncate">
            <span className="bg-[#20BF6B]/10 px-1 py-0.5 rounded font-extrabold">
              +{summary?.periodMetrics?.newCustomers ?? 0} new
            </span>
            <span className="text-slate-400 font-medium ml-1 text-[9.5px]">this period</span>
          </div>
        </div>

        {/* Mobile Card 4: Inventory Alerts (Brand Orange Icon, Status Red Badge) */}
        <div className="clay-card p-3 min-h-[96px] flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Stock Alerts
            </span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-[0_3px_8px_rgba(249,115,22,0.30)]">
              <Package className="h-3.5 w-3.5 stroke-[2.3]" />
            </div>
          </div>
          <div className="my-1">
            <p className="font-fraunces text-base font-black text-[#2A241E] truncate">
              {(summary?.totalInventoryAlerts ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="flex items-center text-[10px] font-bold truncate">
            {(summary?.outOfStockProducts ?? 0) > 0 ? (
              <span className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-extrabold truncate">
                {summary?.outOfStockProducts ?? 0} out of stock
              </span>
            ) : (
              <span className="text-[#20BF6B] bg-[#20BF6B]/10 px-1 py-0.5 rounded font-extrabold truncate">
                Healthy stock
              </span>
            )}
          </div>
        </div>

      </div>

      {/* DESKTOP 4-COLUMN METRIC GRID (hidden md:grid) */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
        
        {/* Desktop Card 1: Total / Period Revenue (Brand Orange Icon) */}
        <div className="clay-card p-4 sm:p-4.5 xl:p-4 2xl:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {period === "all" ? "Total Revenue" : `${PERIOD_LABELS[period]} Revenue`}
            </span>
            <Link
              href="/admin/dashboard/analytics"
              className="text-slate-300 hover:text-slate-600 transition p-1.5 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="View Revenue Analytics"
            >
              <MoreVertical className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2.5 z-10">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="text-xl sm:text-2xl lg:text-[22px] xl:text-[21px] 2xl:text-[25px] font-black tracking-tight text-[#2A241E] whitespace-nowrap overflow-visible">
                ₹{formatFullRupees(summary?.periodMetrics?.revenue ?? summary?.totalRevenue ?? 0)}
              </div>
              
              <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
                {(growth?.revenuePercentage ?? 0) >= 0 ? (
                  <span className="bg-[#20BF6B]/10 text-[#20BF6B] px-1.5 py-0.5 rounded-md font-extrabold">
                    ↑ {growth?.revenuePercentage ?? 0}%
                  </span>
                ) : (
                  <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md font-extrabold">
                    ↓ {Math.abs(growth?.revenuePercentage ?? 0)}%
                  </span>
                )}
                <span className="text-[10.5px] text-slate-400 font-medium">vs prev period</span>
              </div>
            </div>

            {/* Proper 3D Brand Orange Clay Rupee Icon */}
            <div className="flex h-11 w-11 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-[0_6px_16px_rgba(249,115,22,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <IndianRupee className="h-5 w-5 xl:h-4.5 xl:w-4.5 2xl:h-6 2xl:w-6 stroke-[2.4]" />
            </div>
          </div>
        </div>

        {/* Desktop Card 2: Total / Period Orders (Brand Orange Icon) */}
        <div className="clay-card p-4 sm:p-4.5 xl:p-4 2xl:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {period === "all" ? "Total Orders" : `${PERIOD_LABELS[period]} Orders`}
            </span>
            <Link
              href="/admin/dashboard/orders"
              className="text-slate-300 hover:text-slate-600 transition p-1.5 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="View Orders"
            >
              <MoreVertical className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2.5 z-10">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="text-xl sm:text-2xl lg:text-[22px] xl:text-[21px] 2xl:text-[25px] font-black tracking-tight text-[#2A241E] whitespace-nowrap overflow-visible">
                {(summary?.periodMetrics?.orders ?? summary?.totalOrders ?? 0).toLocaleString("en-IN")}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
                {(growth?.ordersPercentage ?? 0) >= 0 ? (
                  <span className="bg-[#20BF6B]/10 text-[#20BF6B] px-1.5 py-0.5 rounded-md font-extrabold">
                    ↑ {growth?.ordersPercentage ?? 0}%
                  </span>
                ) : (
                  <span className="bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md font-extrabold">
                    ↓ {Math.abs(growth?.ordersPercentage ?? 0)}%
                  </span>
                )}
                <span className="text-[10.5px] text-slate-400 font-medium">vs prev period</span>
              </div>
            </div>

            {/* Proper 3D Brand Orange Clay Shopping Bag Icon */}
            <div className="flex h-11 w-11 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-[0_6px_16px_rgba(249,115,22,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <ShoppingBag className="h-5 w-5 xl:h-4.5 xl:w-4.5 2xl:h-6 2xl:w-6 stroke-[2.3]" />
            </div>
          </div>
        </div>

        {/* Desktop Card 3: Total Customers (Dark Navy Icon, Status Green Text) */}
        <div className="clay-card p-4 sm:p-4.5 xl:p-4 2xl:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <Link
              href="/admin/dashboard/customers"
              className="text-slate-300 hover:text-slate-600 transition p-1.5 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="View Customers"
            >
              <MoreVertical className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2.5 z-10">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="text-xl sm:text-2xl lg:text-[22px] xl:text-[21px] 2xl:text-[25px] font-black tracking-tight text-[#2A241E] whitespace-nowrap overflow-visible">
                {(summary?.totalCustomers ?? 0).toLocaleString("en-IN")}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#20BF6B] whitespace-nowrap">
                <span className="bg-[#20BF6B]/10 px-1.5 py-0.5 rounded-md font-extrabold">
                  +{summary?.periodMetrics?.newCustomers ?? 0}
                </span>
                <span className="text-[10.5px] text-slate-400 font-medium">new this period</span>
              </div>
            </div>

            {/* Proper 3D Dark Navy Clay Customers Icon */}
            <div className="flex h-11 w-11 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#334155] via-[#1E293B] to-[#0F172A] text-white shadow-[0_6px_16px_rgba(30,41,59,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <Users className="h-5 w-5 xl:h-4.5 xl:w-4.5 2xl:h-6 2xl:w-6 stroke-[2.3]" />
            </div>
          </div>
        </div>

        {/* Desktop Card 4: Inventory & Fulfillment Alerts (Brand Orange Icon) */}
        <div className="clay-card p-4 sm:p-4.5 xl:p-4 2xl:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Alerts</span>
            <Link
              href="/admin/dashboard/products"
              className="text-slate-300 hover:text-slate-600 transition p-1.5 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Manage Products"
            >
              <MoreVertical className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2.5 z-10">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="text-xl sm:text-2xl lg:text-[22px] xl:text-[21px] 2xl:text-[25px] font-black tracking-tight text-[#2A241E] whitespace-nowrap overflow-visible">
                {(summary?.totalInventoryAlerts ?? 0).toLocaleString("en-IN")}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
                {(summary?.outOfStockProducts ?? 0) > 0 ? (
                  <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md font-extrabold">
                    {summary?.outOfStockProducts ?? 0} out of stock
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-extrabold">
                    Healthy Stock
                  </span>
                )}
                <span className="text-[10.5px] text-slate-400 font-medium">
                  • {summary?.pendingOrders ?? 0} pending
                </span>
              </div>
            </div>

            {/* Proper 3D Brand Orange Clay Products Icon */}
            <div className="flex h-11 w-11 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-[0_6px_16px_rgba(249,115,22,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <Package className="h-5 w-5 xl:h-4.5 xl:w-4.5 2xl:h-6 2xl:w-6 stroke-[2.3]" />
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
              <p className="text-[11px] text-slate-400 font-medium">Revenue contribution across catalog categories</p>
            </div>
            <Link
              href="/admin/dashboard/categories"
              className="clay-button px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer min-h-[40px] flex items-center"
            >
              Categories
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-5">
            
            {/* 3D Multi-Color Tactile Clay Donut Chart (Brand Palette) */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-40 h-40 sm:w-48 sm:h-48 transform -rotate-90 drop-shadow-[0_8px_16px_rgba(195,180,165,0.25)]" viewBox="0 0 100 100">
                {/* Background base track */}
                <circle cx="50" cy="50" r="38" stroke="#E5E7EB" strokeWidth="14" fill="none" />
                
                {/* Dynamic Category Slices */}
                {topCategories.length > 0 ? (
                  topCategories.map((cat, idx) => {
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    const pct = Math.max(1, cat.percentageOfTotal);
                    const dashLength = (pct / 100) * CIRCUMFERENCE;
                    const spaceLength = CIRCUMFERENCE - dashLength;
                    const strokeOffset = -accumulatedPercent;
                    accumulatedPercent += dashLength;

                    return (
                      <circle
                        key={cat.categoryId}
                        cx="50"
                        cy="50"
                        r="38"
                        stroke={color.stroke}
                        strokeWidth="14"
                        fill="none"
                        strokeDasharray={`${dashLength} ${spaceLength}`}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    );
                  })
                ) : (
                  /* Intentional, muted empty-state ring */
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#D6D3CD"
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray="6 6"
                  />
                )}
              </svg>

              {/* Recessed Center Hub */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono-eyebrow">
                  Gross Sales
                </span>
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#2A241E]">
                  ₹{formatIndianCurrency(totalCategoryRevenue)}
                </span>
              </div>
            </div>

            {/* Category Breakdown Legend */}
            <div className="w-full sm:w-auto flex-1 space-y-2">
              {topCategories.length > 0 ? (
                topCategories.map((cat, idx) => {
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div key={cat.categoryId} className="flex items-center justify-between text-xs py-0.5 px-1 rounded-lg hover:bg-slate-50 transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2.5 w-2.5 rounded-full ${color.bg} shadow-xs shrink-0`} />
                        <span className="font-semibold text-slate-600 truncate max-w-[120px] sm:max-w-[150px]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-slate-800">
                          ₹{formatFullRupees(cat.totalRevenue)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 w-9 text-right">
                          {cat.percentageOfTotal}%
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3.5 bg-[#FBF9F6] rounded-2xl border border-[#E8DFC0]/40 text-center space-y-2 flex flex-col items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#EA580C] border border-orange-200/60 shadow-[0_2px_6px_rgba(249,115,22,0.12)]">
                    <PieChart className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">No Sales Recorded Yet</p>
                    <p className="text-[10.5px] text-slate-500 leading-tight max-w-[200px] mt-0.5">
                      When customers place orders, category contribution shares will appear automatically.
                    </p>
                  </div>
                  <div className="pt-0.5">
                    <Link
                      href="/admin/dashboard/products"
                      className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] inline-flex items-center gap-1 min-h-[44px]"
                    >
                      View Catalog Products →
                    </Link>
                  </div>
                </div>
              )}
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
              className="clay-button px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer min-h-[40px] flex items-center"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 pt-3.5 items-center">
            
            {/* Orders Stream (7 Cols) */}
            <div className="md:col-span-7 space-y-2">
              {recentOrders.length > 0 ? (
                recentOrders.map((ord, idx) => {
                  const badge = getStatusBadgeStyle(ord.orderStatus);
                  const emojis = ["🐕", "🐈", "🦴", "🐾"];
                  const iconEmoji = emojis[idx % emojis.length];

                  return (
                    <div key={ord.id} className="flex items-center justify-between p-1.5 rounded-2xl hover:bg-[#F9F6F2] transition">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Unified Brand Orange Mini Clay Badge */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center text-base text-white shadow-xs rounded-xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C]">
                          {iconEmoji}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/dashboard/orders`}
                            className="text-xs font-extrabold text-slate-800 leading-tight truncate hover:text-orange-600 block"
                          >
                            {ord.customer.name} (#{ord.orderNumber})
                          </Link>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate max-w-[170px]">
                            {ord.itemsSummary || `${ord.itemsCount} item(s)`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-slate-900">
                          ₹{formatFullRupees(ord.grandTotal)}
                        </p>
                        <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3.5 bg-[#FBF9F6] rounded-2xl border border-[#E8DFC0]/40 text-center space-y-2 flex flex-col items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#EA580C] border border-orange-200/60 shadow-[0_2px_6px_rgba(249,115,22,0.12)]">
                    <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">No Orders Placed Yet</p>
                    <p className="text-[10.5px] text-slate-500 max-w-[220px] leading-tight mt-0.5">
                      Customer checkouts will stream here instantly with live fulfillment data.
                    </p>
                  </div>
                  <div className="pt-0.5">
                    <Link
                      href="/admin/dashboard/orders"
                      className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C] inline-flex items-center gap-1 min-h-[44px]"
                    >
                      Open Orders Hub →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Store Identity Badge (5 Cols) with clear header label */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-3xl bg-[#F5EFE9] border border-[#E8DFC0]/50 shadow-[inset_2px_2px_5px_rgba(195,180,165,0.2),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] text-center relative overflow-hidden">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider font-mono-eyebrow mb-1">
                Store Identity
              </span>
              <div className="relative select-none transform hover:scale-105 transition-transform duration-300">
                <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-[#FF7A00] via-[#F97316] to-[#EAA03B] flex items-center justify-center text-2xl shadow-[0_6px_14px_rgba(249,115,22,0.35),inset_0_2px_3px_rgba(255,255,255,0.5)]">
                  🐾
                </div>
              </div>
              
              <div className="w-full mt-2 pt-1.5 border-t-4 border-[#C7955F] rounded-t-xl bg-[#E8C296] shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_3px_6px_rgba(0,0,0,0.08)] p-1">
                <div className="flex items-center justify-center gap-2.5 text-sm">
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
              <p className="text-[11px] text-slate-400 font-medium">
                Progress for {targets.month} {targets.year} against ecommerce KPIs
              </p>
            </div>
            {/* Target Settings Button with Brand Orange Icon and min 44px touch target */}
            <button
              onClick={handleOpenTargetModal}
              className="clay-button flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer select-none min-h-[44px]"
              title="Configure Monthly Sales Targets"
            >
              <Sliders className="h-3.5 w-3.5 text-[#EA580C]" />
              <span>Target Settings</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Goal 1: Monthly Revenue Target (Unified Brand Orange Icon & Progress Fill) */}
            <div className="clay-inset p-3.5 space-y-2.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white rounded-2xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] shadow-[0_4px_10px_rgba(249,115,22,0.30)]">
                  <IndianRupee className="h-5 w-5 stroke-[2.4]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 truncate">Monthly Revenue Goal</h3>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">
                      ₹{formatIndianCurrency(currentMonthRevenue)} / ₹{formatIndianCurrency(monthlyRevenueGoal)}
                    </span>
                    <span className="font-extrabold text-[#EA580C]">{revenueGoalPct}%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track with Unified Orange Fill */}
              <div className="h-3 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#FF8C38] via-[#F97316] to-[#EA580C] h-full rounded-full transition-all duration-500 shadow-[0_2px_6px_rgba(249,115,22,0.4)]" 
                  style={{ width: `${Math.max(4, revenueGoalPct)}%` }} 
                />
              </div>
            </div>

            {/* Goal 2: Monthly Orders Target (Unified Dark Navy Icon & Brand Orange Progress Fill) */}
            <div className="clay-inset p-3.5 space-y-2.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center text-white rounded-2xl bg-gradient-to-br from-[#334155] via-[#1E293B] to-[#0F172A] shadow-[0_4px_10px_rgba(30,41,59,0.30)]">
                  <ShoppingBag className="h-5 w-5 stroke-[2.3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-extrabold text-slate-800 truncate">Monthly Orders Goal</h3>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">
                      {currentMonthOrders.toLocaleString("en-IN")} / {monthlyOrdersGoal.toLocaleString("en-IN")}
                    </span>
                    <span className="font-extrabold text-[#EA580C]">{ordersGoalPct}%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track with Unified Orange Fill */}
              <div className="h-3 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#FF8C38] via-[#F97316] to-[#EA580C] h-full rounded-full transition-all duration-500 shadow-[0_2px_6px_rgba(249,115,22,0.4)]" 
                  style={{ width: `${Math.max(4, ordersGoalPct)}%` }} 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Store Growth Insight (5 Cols)
            - Background: green-tinted clay-tip-card (reserved for healthy status)
            - Icon: Brand Orange lightbulb (no competing yellow)
            - Paw Badge: Brand Orange (no competing blue)
            - Bug Fix: Message appears exactly ONCE (duplicate line removed)
        */}
        <div className="clay-tip-card p-4 sm:p-5 lg:p-6 lg:col-span-5 flex flex-col justify-between relative overflow-hidden min-w-0">
          <div className="flex items-start gap-3.5 z-10">
            {/* Brand Orange Lightbulb Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center text-white rounded-2xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] shadow-[0_4px_10px_rgba(249,115,22,0.30)]">
              <Lightbulb className="h-5 w-5 stroke-[2.3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#1E3B1B]">{insightHeadline}</h3>
              <p className="text-xs text-[#3E5C38] leading-relaxed font-semibold">
                {insightDesc}
              </p>
            </div>
          </div>

          {/* Unified Brand Orange Paw Badge */}
          <div className="pt-3 flex justify-end z-10 select-none">
            <Link
              href="/admin/dashboard/products"
              className="clay-button flex h-9 w-9 rounded-full items-center justify-center text-base bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-xs hover:scale-105 transition min-h-[36px] min-w-[36px]"
              title="Manage Products & Inventory"
            >
              🐾
            </Link>
          </div>
        </div>

      </div>

      {/* =========================================================
          4. MODAL: Monthly Sales Target Settings (3D Tactile Clay)
          ========================================================= */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="clay-card p-5 sm:p-6 w-full max-w-md space-y-4 relative bg-white shadow-2xl rounded-3xl border border-[#E8DFC0]/80">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center text-white shadow-xs rounded-xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C]">
                  <Target className="h-4.5 w-4.5 stroke-[2.3]" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
                    Sales Target Settings
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Store-wide monthly goals for {targets.month} {targets.year}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Form */}
            <form onSubmit={handleSaveTargets} className="space-y-4">
              
              {/* Revenue Target Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Monthly Revenue Target (₹)</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Current: ₹{formatIndianCurrency(currentMonthRevenue)}
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min={1000}
                    step={10000}
                    value={targetRevenueInput}
                    onChange={(e) => setTargetRevenueInput(Number(e.target.value) || 0)}
                    required
                    className="clay-inset w-full pl-8 pr-3 py-2.5 text-sm font-extrabold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[44px]"
                    placeholder="e.g. 2000000"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10.5px] text-slate-400 font-semibold">Presets:</span>
                  {[
                    { label: "₹10L", val: 1000000 },
                    { label: "₹20L", val: 2000000 },
                    { label: "₹50L", val: 5000000 },
                    { label: "₹1Cr", val: 10000000 },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.val}
                      onClick={() => setTargetRevenueInput(p.val)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition cursor-pointer min-h-[36px] flex items-center ${
                        targetRevenueInput === p.val
                          ? "bg-[#EA580C] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Target Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Monthly Orders Target</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Current: {currentMonthOrders.toLocaleString("en-IN")} orders
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-bold text-sm flex items-center pointer-events-none">
                    <ShoppingBag className="h-3.5 w-3.5 text-slate-400 stroke-[2.3]" />
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={25}
                    value={targetOrdersInput}
                    onChange={(e) => setTargetOrdersInput(Number(e.target.value) || 0)}
                    required
                    className="clay-inset w-full pl-9 pr-3 py-2.5 text-sm font-extrabold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[44px]"
                    placeholder="e.g. 500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10.5px] text-slate-400 font-semibold">Presets:</span>
                  {[
                    { label: "250", val: 250 },
                    { label: "500", val: 500 },
                    { label: "1,000", val: 1000 },
                    { label: "2,500", val: 2500 },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.val}
                      onClick={() => setTargetOrdersInput(p.val)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition cursor-pointer min-h-[36px] flex items-center ${
                        targetOrdersInput === p.val
                          ? "bg-[#EA580C] text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Success Badge */}
              {targetSaveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Target settings saved to backend successfully!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTargetModalOpen(false)}
                  disabled={isSavingTargets}
                  className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer transition disabled:opacity-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTargets}
                  className="clay-button px-4 py-2 text-xs font-extrabold bg-gradient-to-r from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white hover:opacity-95 shadow-md cursor-pointer transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 min-h-[44px]"
                >
                  {isSavingTargets ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Targets</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
