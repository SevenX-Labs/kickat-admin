"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  IndianRupee,
  XCircle,
  Check,
  X,
  ArrowUp,
  SlidersHorizontal,
  Copy,
  Package,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import {
  AdminOrderItem,
  AdminOrderSummary,
  AdminOrderPagination,
  OrderStatus,
  PaymentStatus,
  AdminOrderSortEnum,
} from "@/types/admin-order";
import { AdminOrderService } from "@/services/adminOrderService";
import { TableListSkeleton } from "@/components/ui/Skeleton";
import OrderFilterSheet from "@/components/orders/OrderFilterSheet";
import OrderSortDropdown from "@/components/orders/OrderSortDropdown";
import OrderPaymentDropdown from "@/components/orders/OrderPaymentDropdown";

export default function OrdersPage() {
  const router = useRouter();

  // Data States
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [summary, setSummary] = useState<AdminOrderSummary | null>(null);
  const [pagination, setPagination] = useState<AdminOrderPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>("");

  // Filter States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [paymentStatus, setPaymentStatus] = useState<"ALL" | PaymentStatus>("ALL");
  const [sortBy, setSortBy] = useState<AdminOrderSortEnum>("createdAt_desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Copied feedback
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Modals & Filter Sheet
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyOrderId = (orderNum: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderNum);
      setCopiedOrderId(orderNum);
      showToast(`Order #${orderNum} copied to clipboard`, "success");
      setTimeout(() => setCopiedOrderId(null), 2000);
    }
  };

  // Active filters count
  const activeFiltersCount =
    (selectedStatus !== "ALL" ? 1 : 0) +
    (paymentStatus !== "ALL" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Handle scroll for scroll-to-top floating button
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setShowScrollTop(window.scrollY > 280);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Fetch orders
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await AdminOrderService.getOrders({
        page,
        limit,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        paymentStatus: paymentStatus === "ALL" ? undefined : paymentStatus,
        search: debouncedSearch.trim() || undefined,
        sort: sortBy,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      if (res?.data) {
        setOrders(res.data.orders || []);
        setPagination(res.data.pagination);
        setSummary(res.data.summary);
        setLastRefreshedAt(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      }
    } catch (err) {
      setError(AdminOrderService.extractErrorMessage(err, "Failed to load orders"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, limit, selectedStatus, paymentStatus, debouncedSearch, sortBy, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleClearAllFilters = () => {
    setSearch("");
    setSelectedStatus("ALL");
    setPaymentStatus("ALL");
    setSortBy("createdAt_desc");
    setPage(1);
  };

  const getCustomerInitials = (name?: string) => {
    if (!name || !name.trim()) return "CU";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
          label: "Delivered",
        };
      case "SHIPPED":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200/80",
          dot: "bg-blue-500",
          label: "Shipped",
        };
      case "OUT_FOR_DELIVERY":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200/80",
          dot: "bg-sky-500",
          label: "Out for Delivery",
        };
      case "PROCESSING":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          dot: "bg-amber-500",
          label: "Processing",
        };
      case "PACKED":
        return {
          bg: "bg-orange-50 text-orange-700 border-orange-200/80",
          dot: "bg-orange-500",
          label: "Packed",
        };
      case "PLACED":
        return {
          bg: "bg-amber-50/90 text-amber-800 border-amber-300/80",
          dot: "bg-amber-500 animate-pulse",
          label: "Placed",
        };
      case "PENDING":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          dot: "bg-amber-400",
          label: "Pending",
        };
      case "CANCELLED":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200/80",
          dot: "bg-rose-500",
          label: "Cancelled",
        };
      case "RETURN_INITIATED":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200/80",
          dot: "bg-purple-500",
          label: "Return Req.",
        };
      case "RETURNED":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200/80",
          dot: "bg-purple-600",
          label: "Returned",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          label: status,
        };
    }
  };

  const getPaymentBadge = (pStatus: PaymentStatus) => {
    switch (pStatus) {
      case "COMPLETED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "COMPLETED",
        };
      case "PENDING":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "PENDING",
        };
      case "FAILED":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          label: "FAILED",
        };
      case "REFUNDED":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500",
          label: "REFUNDED",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          label: pStatus,
        };
    }
  };

  // Segmented Quick Filter Tabs
  const statusTabs: Array<{ label: string; value: "ALL" | OrderStatus; count?: number }> = [
    { label: "All Orders", value: "ALL", count: summary?.totalOrders },
    {
      label: "In Progress",
      value: "PROCESSING",
      count:
        (summary?.processingCount || 0) +
        (summary?.placedCount || 0) +
        (summary?.pendingCount || 0),
    },
    {
      label: "In Transit",
      value: "SHIPPED",
      count: (summary?.shippedCount || 0) + (summary?.packedCount || 0),
    },
    { label: "Delivered", value: "DELIVERED", count: summary?.deliveredCount },
    { label: "Cancelled", value: "CANCELLED", count: summary?.cancelledCount },
    { label: "Returns", value: "RETURNED", count: summary?.returnedCount },
  ];

  return (
    <div className="space-y-4 pb-16 w-full min-w-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 text-xs font-semibold shadow-2xl animate-fade-in border border-slate-700/60 transition-all">
          {toastMessage.type === "success" ? (
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="h-3.5 w-3.5" />
            </div>
          ) : (
            <div className="h-6 w-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
          )}
          <span className="text-slate-100">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-fraunces text-xl sm:text-2xl font-bold tracking-tight text-[#2A241E]">
              Orders &amp; Fulfillment
            </h1>
            {summary && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100/80 text-[#FF7A00] border border-orange-200/80 shadow-2xs">
                {summary.totalOrders} {summary.totalOrders === 1 ? "Order" : "Orders"}
              </span>
            )}
          </div>
          <p className="text-[11.5px] sm:text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
            <span>Click any order row to view full details, shipping milestones, packing slips &amp; invoices.</span>
            {lastRefreshedAt && (
              <span className="hidden md:inline text-slate-400 text-[10.5px] font-mono">
                • Updated at {lastRefreshedAt}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="clay-button inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-bold text-slate-700 hover:text-[#FF7A00] active:scale-95 transition cursor-pointer shadow-xs"
            title="Refresh Orders"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {/* Total Orders Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("ALL");
              setPage(1);
            }}
            className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[86px] cursor-pointer shadow-xs ${
              selectedStatus === "ALL"
                ? "bg-white border-orange-400/90 ring-2 ring-orange-500/20 shadow-sm"
                : "bg-white/95 hover:bg-white border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">
                Total Orders
              </span>
              <div className="h-6 w-6 rounded-lg bg-orange-50 text-[#FF7A00] flex items-center justify-center">
                <ShoppingBag className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {summary.totalOrders}
              </p>
              <p className="text-[9.5px] font-medium text-slate-400 mt-1">All lifecycle</p>
            </div>
          </button>

          {/* Revenue Card */}
          <div className="p-3 rounded-2xl border border-emerald-100 bg-linear-to-br from-white to-emerald-50/40 text-left flex flex-col justify-between min-h-[86px] shadow-xs">
            <div className="flex items-center justify-between w-full">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700/80 font-mono-eyebrow">
                Net Revenue
              </span>
              <div className="h-6 w-6 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                <IndianRupee className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-xl font-black text-emerald-800 tracking-tight leading-none truncate">
                ₹{summary.totalRevenue.toLocaleString("en-IN")}
              </p>
              <p className="text-[9.5px] font-medium text-emerald-600/80 mt-1">Non-cancelled</p>
            </div>
          </div>

          {/* In Progress Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "PROCESSING" ? "ALL" : "PROCESSING"));
              setPage(1);
            }}
            className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[86px] cursor-pointer shadow-xs ${
              selectedStatus === "PROCESSING" || selectedStatus === "PLACED"
                ? "bg-white border-amber-400/90 ring-2 ring-amber-500/20 shadow-sm"
                : "bg-white/95 hover:bg-white border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-600 font-mono-eyebrow">
                In Progress
              </span>
              <div className="h-6 w-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {(summary.processingCount || 0) + (summary.placedCount || 0) + (summary.pendingCount || 0)}
              </p>
              <p className="text-[9.5px] font-medium text-amber-600 mt-1">Picking &amp; packing</p>
            </div>
          </button>

          {/* In Transit Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "SHIPPED" ? "ALL" : "SHIPPED"));
              setPage(1);
            }}
            className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[86px] cursor-pointer shadow-xs ${
              selectedStatus === "SHIPPED" || selectedStatus === "OUT_FOR_DELIVERY"
                ? "bg-white border-blue-400/90 ring-2 ring-blue-500/20 shadow-sm"
                : "bg-white/95 hover:bg-white border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-blue-600 font-mono-eyebrow">
                In Transit
              </span>
              <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {(summary.shippedCount || 0) + (summary.packedCount || 0)}
              </p>
              <p className="text-[9.5px] font-medium text-blue-600 mt-1">With couriers</p>
            </div>
          </button>

          {/* Delivered Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "DELIVERED" ? "ALL" : "DELIVERED"));
              setPage(1);
            }}
            className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[86px] cursor-pointer shadow-xs ${
              selectedStatus === "DELIVERED"
                ? "bg-white border-emerald-400/90 ring-2 ring-emerald-500/20 shadow-sm"
                : "bg-white/95 hover:bg-white border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-600 font-mono-eyebrow">
                Delivered
              </span>
              <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {summary.deliveredCount}
              </p>
              <p className="text-[9.5px] font-medium text-emerald-600 mt-1">Fulfilled</p>
            </div>
          </button>

          {/* Cancelled Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "CANCELLED" ? "ALL" : "CANCELLED"));
              setPage(1);
            }}
            className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[86px] cursor-pointer shadow-xs ${
              selectedStatus === "CANCELLED"
                ? "bg-white border-rose-400/90 ring-2 ring-rose-500/20 shadow-sm"
                : "bg-white/95 hover:bg-white border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-600 font-mono-eyebrow">
                Cancelled
              </span>
              <div className="h-6 w-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="h-3 w-3" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                {summary.cancelledCount}
              </p>
              <p className="text-[9.5px] font-medium text-rose-500 mt-1">Restocked</p>
            </div>
          </button>
        </div>
      )}

      {/* Segmented Quick Status Tabs + Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3 space-y-3">
        {/* Horizontal Quick Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {statusTabs.map((tab) => {
            const isActive =
              tab.value === "ALL"
                ? selectedStatus === "ALL"
                : selectedStatus === tab.value ||
                  (tab.value === "PROCESSING" && selectedStatus === "PLACED") ||
                  (tab.value === "SHIPPED" && selectedStatus === "OUT_FOR_DELIVERY");

            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.value);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#2A241E] text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search, Filter & Sort Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 border-t border-slate-100 items-center">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer name, phone, email..."
              className="w-full h-10 rounded-xl bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200/80 py-2 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Payment Status Dropdown */}
          <div className="sm:col-span-3">
            <OrderPaymentDropdown
              value={paymentStatus}
              onChange={(val) => {
                setPaymentStatus(val);
                setPage(1);
              }}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="sm:col-span-2">
            <OrderSortDropdown
              value={sortBy}
              onChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
            />
          </div>

          {/* More Filters Button */}
          <div className="sm:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className={`h-10 w-full flex items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeFiltersCount > 0
                  ? "bg-orange-50 border-orange-300 text-orange-800 ring-1 ring-orange-300/60"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700"
              }`}
              title="Advanced Filters"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="sm:hidden">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="h-4 w-4 rounded-full bg-[#FF7A00] text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
              Active:
            </span>

            {selectedStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 font-bold text-[11px]">
                <span>Status: {selectedStatus}</span>
                <button
                  type="button"
                  onClick={() => setSelectedStatus("ALL")}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {paymentStatus !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px]">
                <span>Payment: {paymentStatus}</span>
                <button
                  type="button"
                  onClick={() => setPaymentStatus("ALL")}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {search.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
                <span>&ldquo;{search}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => fetchOrders()}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !refreshing ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <TableListSkeleton rows={5} />
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-2xs">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="font-fraunces text-lg font-bold text-slate-800">
            No orders found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            {activeFiltersCount > 0
              ? "No orders matched your current filters. Try changing search keywords or resetting status."
              : "No customer orders have been placed yet. When an order arrives, it will appear here instantly."}
          </p>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#2A241E] text-white text-xs font-bold hover:bg-black transition cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Orders List View (< md) - Whole Card Clickable */}
          <div className="space-y-3 md:hidden">
            {orders.map((ord) => {
              const statusInfo = getStatusBadge(ord.orderStatus);
              const paymentInfo = getPaymentBadge(ord.paymentStatus);

              return (
                <div
                  key={ord.id}
                  onClick={() => router.push(`/admin/dashboard/orders/${ord.id}`)}
                  className="bg-white hover:bg-[#FAF7F2] rounded-2xl border border-slate-200/90 hover:border-orange-200/80 p-4 shadow-xs space-y-3 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  {/* Top Row: Order ID & Status */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-xs text-slate-900 font-mono tracking-tight truncate">
                        {ord.orderNumber}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyOrderId(ord.orderNumber, e)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition cursor-pointer shrink-0"
                        title="Copy Order ID"
                      >
                        {copiedOrderId === ord.orderNumber ? (
                          <Check className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-70 hover:opacity-100" />
                        )}
                      </button>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusInfo.bg}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Customer & Item Line */}
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-linear-to-tr from-amber-100 to-orange-100 text-[#FF7A00] font-bold text-xs flex items-center justify-center shrink-0 border border-orange-200/60 shadow-2xs">
                      {getCustomerInitials(ord.customer?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {ord.customer?.name || "Guest Customer"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {ord.customer?.phone || ord.customer?.email || "No contact"}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 font-medium">
                        {ord.itemsSummary || `${ord.itemsCount} item(s)`}
                      </p>
                    </div>
                  </div>

                  {/* Price & Payment Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${paymentInfo.bg}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${paymentInfo.dot}`} />
                      <span>{paymentInfo.label}</span>
                    </span>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 font-mono tracking-tight">
                        ₹{ord.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Orders Table (>= md): Entire Row Clickable, No Horizontal Scrollbar, Clean 6-Column Layout */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-500 font-mono-eyebrow text-[10.5px] uppercase tracking-wider select-none">
                  <th className="py-3.5 px-4 font-bold w-[20%]">Order ID</th>
                  <th className="py-3.5 px-4 font-bold w-[22%]">Customer &amp; Contact</th>
                  <th className="py-3.5 px-4 font-bold w-[26%]">Items Summary</th>
                  <th className="py-3.5 px-4 font-bold w-[14%]">Date &amp; Time</th>
                  <th className="py-3.5 px-4 font-bold text-right w-[10%]">Grand Total</th>
                  <th className="py-3.5 px-4 font-bold text-center w-[12%]">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90 text-xs">
                {orders.map((ord) => {
                  const paymentInfo = getPaymentBadge(ord.paymentStatus);

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => router.push(`/admin/dashboard/orders/${ord.id}`)}
                      className="hover:bg-[#FAF7F2]/90 cursor-pointer transition-colors duration-150 select-none"
                    >
                      {/* Order ID: Single Line with Copy Button */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-bold text-slate-900 font-mono tracking-tight text-[11.5px]"
                            title={ord.orderNumber}
                          >
                            {ord.orderNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyOrderId(ord.orderNumber, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-all cursor-pointer shrink-0"
                            title="Copy Order ID"
                            aria-label="Copy Order ID"
                          >
                            {copiedOrderId === ord.orderNumber ? (
                              <Check className="h-3 w-3 text-emerald-600 stroke-[2.5]" />
                            ) : (
                              <Copy className="h-3 w-3 opacity-70 hover:opacity-100" />
                            )}
                          </button>
                        </div>
                        {ord.trackingNumber && (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-slate-400 mt-0.5 whitespace-nowrap truncate max-w-[160px]">
                            <Truck className="h-2.5 w-2.5 shrink-0" />
                            <span>AWB: {ord.trackingNumber}</span>
                          </span>
                        )}
                      </td>

                      {/* Customer & Contact */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-linear-to-tr from-orange-100 to-amber-100 text-[#FF7A00] font-bold text-[11px] flex items-center justify-center shrink-0 border border-orange-200/60 shadow-2xs">
                            {getCustomerInitials(ord.customer?.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate text-[11.5px]">
                              {ord.customer?.name || "Guest Customer"}
                            </p>
                            <p className="text-[10.5px] text-slate-400 truncate font-mono">
                              {ord.customer?.phone || ord.customer?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3.5 px-4 align-middle">
                        <p
                          className="font-medium text-slate-800 truncate text-[11.5px] max-w-[240px]"
                          title={ord.itemsSummary || `${ord.itemsCount} item(s)`}
                        >
                          {ord.itemsSummary || `${ord.itemsCount} item(s)`}
                        </p>
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mt-0.5 whitespace-nowrap">
                          <Package className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>{ord.itemsCount} {ord.itemsCount === 1 ? "unit" : "units"} total</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 align-middle text-slate-600 whitespace-nowrap">
                        <div className="font-medium text-slate-800 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {new Date(ord.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <span className="font-black text-slate-900 text-[13.5px] tracking-tight font-mono">
                          ₹{ord.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Payment Status: Clean Single Badge */}
                      <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border uppercase tracking-wider shadow-2xs ${paymentInfo.bg}`}
                          title={`Payment: ${paymentInfo.label} (${ord.paymentMethod || "N/A"})`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${paymentInfo.dot}`} />
                          <span>{paymentInfo.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.total > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs shadow-xs">
              <div className="text-slate-500 text-[11px] font-medium text-center sm:text-left">
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-800">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-bold text-slate-800">{pagination.total}</span> orders
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer transition-colors"
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="clay-button h-8 px-2.5 inline-flex items-center justify-center gap-1 text-slate-700 font-bold disabled:opacity-30 active:scale-95 transition cursor-pointer text-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
                    <span>Prev</span>
                  </button>

                  <span className="px-2 py-0.5 font-bold text-slate-800 text-xs whitespace-nowrap">
                    Page {pagination.page} of {pagination.totalPages || 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="clay-button h-8 px-2.5 inline-flex items-center justify-center gap-1 text-slate-700 font-bold disabled:opacity-30 active:scale-95 transition cursor-pointer text-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 h-10 w-10 rounded-full bg-[#2A241E] text-white shadow-2xl flex items-center justify-center transition-all hover:bg-black active:scale-95 cursor-pointer animate-fade-in"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
        </button>
      )}

      {/* Order Filter Bottom Sheet / Modal */}
      <OrderFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        status={selectedStatus}
        onStatusChange={(st) => {
          setSelectedStatus(st);
          setPage(1);
        }}
        paymentStatus={paymentStatus}
        onPaymentStatusChange={(ps) => {
          setPaymentStatus(ps);
          setPage(1);
        }}
        sort={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          setPage(1);
        }}
        onApply={() => {
          fetchOrders(true);
        }}
        onClearAll={handleClearAllFilters}
        activeCount={activeFiltersCount}
      />
    </div>
  );
}
