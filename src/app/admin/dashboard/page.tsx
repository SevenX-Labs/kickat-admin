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
  Check
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

const CATEGORY_COLORS = [
  { stroke: "#6D62FE", bg: "bg-[#6D62FE]" },
  { stroke: "#4EBA79", bg: "bg-[#4EBA79]" },
  { stroke: "#F7B731", bg: "bg-[#F7B731]" },
  { stroke: "#F26674", bg: "bg-[#F26674]" },
  { stroke: "#45AAF2", bg: "bg-[#45AAF2]" },
  { stroke: "#A55EEA", bg: "bg-[#A55EEA]" },
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
      return { label: "Shipped", className: "bg-indigo-50 text-indigo-700 border border-indigo-200/50" };
    case "OUT_FOR_DELIVERY":
      return { label: "Out for Delivery", className: "bg-purple-50 text-purple-700 border border-purple-200/50" };
    case "PROCESSING":
    case "PACKED":
      return { label: status === "PACKED" ? "Packed" : "Processing", className: "bg-sky-50 text-sky-700 border border-sky-200/50" };
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

  // Dynamic Insight Text
  const pendingCount = summary?.pendingOrders ?? 0;
  const stockAlertsCount = summary?.totalInventoryAlerts ?? 0;
  let insightHeadline = "Store Health Healthy";
  let insightDesc = "Cat nutrition & organic treats demand is trending upwards. Keep bestsellers stocked! 🚀";

  if (pendingCount > 0) {
    insightHeadline = `${pendingCount} Orders Awaiting Fulfillment`;
    insightDesc = "Pack and dispatch pending customer orders quickly to maintain high store satisfaction ratings.";
  } else if (stockAlertsCount > 0) {
    insightHeadline = `${stockAlertsCount} Inventory Alerts`;
    insightDesc = `${summary?.outOfStockProducts ?? 0} items are out of stock and ${summary?.lowStockProducts ?? 0} items are running low. Restock now!`;
  }

  // Circle circumference for r=38
  const CIRCUMFERENCE = 238.761;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 w-full min-w-0 no-scrollbar animate-fade-in">
      
      {/* =========================================================
          CONTROL BAR: Active Period Display & Quick Actions
          ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#E8DFC0]/60 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dashboard Filter:</span>
          <span className="text-xs font-extrabold text-[#2A241E] bg-[#F5EFE9] px-2.5 py-1 rounded-lg border border-[#E8DFC0]/60">
            {PERIOD_LABELS[period]}
          </span>
          {isRefreshing && (
            <span className="text-[11px] font-semibold text-orange-600 flex items-center gap-1">
              <RotateCcw className="h-3 w-3 animate-spin" />
              Updating...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="clay-button flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-700 hover:text-orange-600 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh dashboard metrics"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Period Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setPeriodDropdownOpen((prev) => !prev)}
              className="clay-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 select-none hover:bg-slate-50 transition active:scale-95 cursor-pointer"
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
                    className={`w-full text-left px-3.5 py-2 hover:bg-orange-50 hover:text-orange-600 transition flex items-center justify-between ${
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
            className="text-[11px] font-bold text-rose-800 underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* =========================================================
          1. TOP ROW: 4 E-COMMERCE 3D CLAY STAT CARDS
          - Total Revenue
          - Total Orders
          - Total Customers
          - Stock Alerts & Inventory Warnings
          ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
        
        {/* Card 1: Total / Period Revenue */}
        <div className="clay-card p-4 sm:p-4.5 xl:p-4 2xl:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {period === "all" ? "Total Revenue" : `${PERIOD_LABELS[period]} Revenue`}
            </span>
            <Link
              href="/admin/dashboard/analytics"
              className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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

            {/* Proper 3D Royal Purple Clay Rupee Icon */}
            <div className="flex h-11 w-11 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7B72F0] via-[#635BFF] to-[#4F46E5] text-white shadow-[0_6px_16px_rgba(99,91,255,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <IndianRupee className="h-5 w-5 xl:h-4.5 xl:w-4.5 2xl:h-6 2xl:w-6 stroke-[2.4]" />
            </div>
          </div>
        </div>

        {/* Card 2: Total / Period Orders */}
        <div className="clay-card p-4 sm:p-4.5 xl:p-4 2xl:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {period === "all" ? "Total Orders" : `${PERIOD_LABELS[period]} Orders`}
            </span>
            <Link
              href="/admin/dashboard/orders"
              className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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

            {/* Proper 3D Sunset Orange Clay Shopping Bag Icon */}
            <div className="flex h-11 w-11 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white shadow-[0_6px_16px_rgba(249,115,22,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <ShoppingBag className="h-5 w-5 xl:h-4.5 xl:w-4.5 2xl:h-6 2xl:w-6 stroke-[2.3]" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="clay-card p-4 sm:p-4.5 xl:p-4 2xl:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <Link
              href="/admin/dashboard/customers"
              className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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

            {/* Proper 3D Emerald Clay Customers Icon */}
            <div className="flex h-11 w-11 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34D399] via-[#10B981] to-[#059669] text-white shadow-[0_6px_16px_rgba(16,185,129,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
              <Users className="h-5 w-5 xl:h-4.5 xl:w-4.5 2xl:h-6 2xl:w-6 stroke-[2.3]" />
            </div>
          </div>
        </div>

        {/* Card 4: Inventory & Fulfillment Alerts */}
        <div className="clay-card p-4 sm:p-4.5 xl:p-4 2xl:p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:scale-[1.01] group">
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Alerts</span>
            <Link
              href="/admin/dashboard/products"
              className="text-slate-300 hover:text-slate-600 transition p-1 -mr-1 rounded-lg hover:bg-slate-100 cursor-pointer"
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
                  • {summary?.pendingOrders ?? 0} pending orders
                </span>
              </div>
            </div>

            {/* Proper 3D Cerulean Blue Clay Products Icon */}
            <div className="flex h-11 w-11 xl:h-10 xl:w-10 2xl:h-12 2xl:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#38BDF8] via-[#0EA5E9] to-[#0284C7] text-white shadow-[0_6px_16px_rgba(14,165,233,0.35),inset_0_1.5px_2px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105 select-none">
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
              className="clay-button px-3 py-1 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
            >
              Categories
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-5">
            
            {/* 3D Multi-Color Tactile Clay Donut Chart */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90 drop-shadow-[0_10px_20px_rgba(195,180,165,0.3)]" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle cx="50" cy="50" r="38" stroke="#EAE4DC" strokeWidth="15" fill="none" />
                
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
                        strokeWidth="15"
                        fill="none"
                        strokeDasharray={`${dashLength} ${spaceLength}`}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    );
                  })
                ) : (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#EAE4DC"
                    strokeWidth="15"
                    fill="none"
                    strokeDasharray="8 8"
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
                <div className="p-3 bg-[#F9F6F2] rounded-xl border border-[#E8DFC0]/40 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700">No Sales Recorded Yet</p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    When customers place orders, category volume and revenue percentages will be rendered automatically.
                  </p>
                  <div className="pt-1.5">
                    <Link
                      href="/admin/dashboard/products"
                      className="text-[11px] font-extrabold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-0.5"
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
              className="clay-button px-3.5 py-1 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
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
                  const badgeStyles = ["clay-badge-amber", "clay-badge-purple", "clay-badge-green", "clay-badge-coral"];
                  const iconEmoji = emojis[idx % emojis.length];
                  const badgeCls = badgeStyles[idx % badgeStyles.length];

                  return (
                    <div key={ord.id} className="flex items-center justify-between p-1.5 rounded-2xl hover:bg-[#F9F6F2] transition">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`${badgeCls} flex h-9 w-9 shrink-0 items-center justify-center text-base text-white shadow-xs rounded-xl`}>
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
                <div className="flex flex-col items-center justify-center p-4 text-center rounded-2xl bg-white/60 border border-[#E8DFC0]/40 space-y-1.5">
                  <span className="text-2xl select-none">🛍️</span>
                  <p className="text-xs font-bold text-slate-700">No Orders Placed Yet</p>
                  <p className="text-[10.5px] text-slate-400 max-w-[200px] leading-tight">
                    Customer checkouts will appear here instantly with live order details.
                  </p>
                  <Link
                    href="/admin/dashboard/orders"
                    className="mt-1 text-[11px] font-extrabold text-orange-600 hover:underline"
                  >
                    Open Orders Hub →
                  </Link>
                </div>
              )}
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
              <p className="text-[11px] text-slate-400 font-medium">
                Progress for {targets.month} {targets.year} against ecommerce KPIs
              </p>
            </div>
            <button
              onClick={handleOpenTargetModal}
              className="clay-button flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition cursor-pointer select-none"
              title="Configure Monthly Sales Targets"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-500" />
              <span>Target Settings</span>
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
                    <span className="font-bold text-slate-700">
                      ₹{formatIndianCurrency(currentMonthRevenue)} / ₹{formatIndianCurrency(monthlyRevenueGoal)}
                    </span>
                    <span className="font-extrabold text-indigo-700">{revenueGoalPct}%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track */}
              <div className="h-3 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="clay-badge-purple h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(4, revenueGoalPct)}%` }} 
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
                    <span className="font-bold text-slate-700">
                      {currentMonthOrders.toLocaleString("en-IN")} / {monthlyOrdersGoal.toLocaleString("en-IN")}
                    </span>
                    <span className="font-extrabold text-emerald-700">{ordersGoalPct}%</span>
                  </div>
                </div>
              </div>

              {/* Recessed Clay Progress Track */}
              <div className="h-3 w-full rounded-full bg-[#E4DCD3] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12)] overflow-hidden">
                <div 
                  className="clay-badge-green h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(4, ordersGoalPct)}%` }} 
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
              <h3 className="text-sm font-extrabold text-[#1E3B1B]">{insightHeadline}</h3>
              <p className="text-xs text-[#3E5C38] leading-relaxed font-semibold">
                {insightDesc}
              </p>
              <p className="text-xs font-bold text-[#1E3B1B] pt-0.5">
                Keep bestsellers stocked! 🚀
              </p>
            </div>
          </div>

          <div className="pt-3 flex justify-end z-10 select-none">
            <Link
              href="/admin/dashboard/products"
              className="clay-button flex h-9 w-9 rounded-full items-center justify-center text-lg hover:scale-105 transition"
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
                <div className="clay-badge-purple flex h-9 w-9 shrink-0 items-center justify-center text-base text-white shadow-xs rounded-xl">
                  🎯
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
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
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
                    className="clay-inset w-full pl-8 pr-3 py-2 text-sm font-extrabold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
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
                      className={`px-2 py-0.5 rounded-lg text-[10.5px] font-extrabold transition cursor-pointer ${
                        targetRevenueInput === p.val
                          ? "bg-indigo-600 text-white shadow-xs"
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
                  <span className="absolute left-3 text-slate-400 font-bold text-sm">🛍️</span>
                  <input
                    type="number"
                    min={1}
                    step={25}
                    value={targetOrdersInput}
                    onChange={(e) => setTargetOrdersInput(Number(e.target.value) || 0)}
                    required
                    className="clay-inset w-full pl-9 pr-3 py-2 text-sm font-extrabold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
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
                      className={`px-2 py-0.5 rounded-lg text-[10.5px] font-extrabold transition cursor-pointer ${
                        targetOrdersInput === p.val
                          ? "bg-emerald-600 text-white shadow-xs"
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
                  className="clay-button px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTargets}
                  className="clay-button px-4 py-1.5 text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 shadow-md cursor-pointer transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
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
