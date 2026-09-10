"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  IndianRupee,
  XCircle,
  Check,
  X,
  ArrowUp,
  SlidersHorizontal,
  PackageCheck,
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
import UpdateOrderStatusModal from "@/components/orders/UpdateOrderStatusModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import ProcessRefundModal from "@/components/orders/ProcessRefundModal";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";
import PackingSlipModal from "@/components/orders/PackingSlipModal";
import OrderFilterSheet from "@/components/orders/OrderFilterSheet";
import OrderSortDropdown from "@/components/orders/OrderSortDropdown";
import OrderPaymentDropdown from "@/components/orders/OrderPaymentDropdown";

export default function OrdersPage() {
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

  // Modals & Action States
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [activeStatusOrder, setActiveStatusOrder] = useState<AdminOrderItem | null>(null);
  const [activeCancelOrder, setActiveCancelOrder] = useState<AdminOrderItem | null>(null);
  const [activeRefundOrder, setActiveRefundOrder] = useState<AdminOrderItem | null>(null);
  const [activeInvoiceOrderId, setActiveInvoiceOrderId] = useState<string | null>(null);
  const [activeSlipOrderId, setActiveSlipOrderId] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active filters count (excluding default values)
  const activeFiltersCount =
    (selectedStatus !== "ALL" ? 1 : 0) +
    (paymentStatus !== "ALL" ? 1 : 0);

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

  /**
   * Fully consistent semantic color mapping across stat cards & order list badges:
   * - In Progress / Processing / Picking / Placed: amber / orange
   * - In Transit / Shipped / Out for delivery: blue
   * - Delivered / Completed: green (emerald)
   * - Cancelled: red (rose)
   */
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING":
      case "PACKED":
      case "PLACED":
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "RETURN_INITIATED":
      case "RETURNED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getPaymentBadge = (pStatus: PaymentStatus) => {
    switch (pStatus) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "FAILED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "REFUNDED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-16 w-full min-w-0 no-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in border border-slate-700/50">
          {toastMessage.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
              Orders & Fulfillment
            </h1>
            {refreshing && (
              <RefreshCw className="h-4 w-4 text-orange-500 animate-spin" />
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Track customer orders, packing slips, logistics milestones, GST invoices, and refunds.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="clay-button inline-flex items-center justify-center gap-1.5 h-10 min-h-[40px] px-3.5 text-xs font-bold text-slate-700 hover:text-orange-600 active:scale-95 transition cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards (Consistent min-height across 2-column mobile grid, interactive filters) */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {/* Total Orders */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("ALL");
              setPage(1);
            }}
            className={`clay-card p-3.5 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer ${
              selectedStatus === "ALL"
                ? "ring-2 ring-slate-900/30 border-slate-900 shadow-md"
                : "hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between text-slate-500 text-xs w-full">
              <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow">Orders</span>
              <ShoppingBag className="h-4 w-4 text-orange-500 shrink-0" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
                {summary.totalOrders}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">All lifecycle orders</p>
            </div>
          </button>

          {/* Total Revenue */}
          <div className="clay-card p-3.5 sm:p-4 min-h-[96px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600 text-xs w-full">
              <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow">Revenue</span>
              <IndianRupee className="h-4 w-4 text-emerald-600 shrink-0" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 truncate">
                ₹{summary.totalRevenue.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Net non-cancelled</p>
            </div>
          </div>

          {/* Processing / Placed (In Progress) */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "PROCESSING" ? "ALL" : "PROCESSING"));
              setPage(1);
            }}
            className={`clay-card p-3.5 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer ${
              selectedStatus === "PROCESSING" || selectedStatus === "PLACED"
                ? "ring-2 ring-amber-500/40 border-amber-500 shadow-md"
                : "hover:border-amber-300"
            }`}
          >
            <div className="flex items-center justify-between text-amber-600 text-xs w-full">
              <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow">In Progress</span>
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
                {(summary.processingCount || 0) + (summary.placedCount || 0) + (summary.pendingCount || 0)}
              </p>
              <p className="text-[10px] text-amber-600 font-medium">Picking & packing</p>
            </div>
          </button>

          {/* Shipped (In Transit - Blue) */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "SHIPPED" ? "ALL" : "SHIPPED"));
              setPage(1);
            }}
            className={`clay-card p-3.5 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer ${
              selectedStatus === "SHIPPED" || selectedStatus === "OUT_FOR_DELIVERY"
                ? "ring-2 ring-blue-500/40 border-blue-500 shadow-md"
                : "hover:border-blue-300"
            }`}
          >
            <div className="flex items-center justify-between text-blue-600 text-xs w-full">
              <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow">In Transit</span>
              <Truck className="h-4 w-4 text-blue-500 shrink-0" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
                {(summary.shippedCount || 0) + (summary.packedCount || 0)}
              </p>
              <p className="text-[10px] text-blue-600 font-medium">With couriers</p>
            </div>
          </button>

          {/* Delivered */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "DELIVERED" ? "ALL" : "DELIVERED"));
              setPage(1);
            }}
            className={`clay-card p-3.5 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer ${
              selectedStatus === "DELIVERED"
                ? "ring-2 ring-emerald-500/40 border-emerald-500 shadow-md"
                : "hover:border-emerald-300"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-600 text-xs w-full">
              <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow">Delivered</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
                {summary.deliveredCount}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">Successfully fulfilled</p>
            </div>
          </button>

          {/* Cancelled */}
          <button
            type="button"
            onClick={() => {
              setSelectedStatus((prev) => (prev === "CANCELLED" ? "ALL" : "CANCELLED"));
              setPage(1);
            }}
            className={`clay-card p-3.5 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer ${
              selectedStatus === "CANCELLED"
                ? "ring-2 ring-rose-500/40 border-rose-500 shadow-md"
                : "hover:border-rose-300"
            }`}
          >
            <div className="flex items-center justify-between text-rose-600 text-xs w-full">
              <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow">Cancelled</span>
              <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
                {summary.cancelledCount}
              </p>
              <p className="text-[10px] text-rose-500 font-medium">Restocked inventory</p>
            </div>
          </button>
        </div>
      )}

      {/* =========================================================
          STICKY COMPACT SEARCH & FILTER TOOLBAR (375px Mobile Optimized)
          - Search bar (majority width)
          - Filter Icon Button (with active count badge, opens Filter Sheet)
          - Custom Sort Dropdown (custom styled, no native select)
          - Active Filter Removable Chips (compact, only when filters active)
          - NO permanent scrollable pill row taking up screen space!
          ========================================================= */}
      <div className="sticky top-0 z-20 bg-[#ECE6DE]/95 backdrop-blur-md -mx-3 px-3 sm:-mx-4 sm:px-4 pt-1.5 pb-2.5 md:static md:bg-transparent md:p-0 md:m-0 space-y-2">
        <div className="clay-card p-2.5 sm:p-3 space-y-2 min-w-0 shadow-sm md:shadow-none">
          {/* Main Controls Row: Search + Filter Button + Custom Sort */}
          <div className="flex items-center gap-2 w-full">
            {/* Search Input (44px min height & short placeholder) */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID, name, email..."
                className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search query"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Icon Button (Opens Filter Bottom Sheet) */}
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className={`h-11 min-h-[44px] px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer shrink-0 ${
                activeFiltersCount > 0
                  ? "bg-orange-50/90 border-orange-300 text-orange-950 ring-1 ring-orange-200/60 shadow-xs"
                  : "bg-white border-slate-200/80 text-slate-700 hover:bg-[#FAF7F2]"
              }`}
              title="Filter Orders"
              aria-label="Filter Orders"
            >
              <SlidersHorizontal
                className={`h-4 w-4 ${activeFiltersCount > 0 ? "text-orange-600" : "text-slate-500"}`}
              />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="h-5 min-w-[20px] px-1 rounded-full bg-orange-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Custom Payment Dropdown (Desktop fast filter, custom styled, 0 native select) */}
            <div className="hidden md:block shrink-0 w-44">
              <OrderPaymentDropdown
                value={paymentStatus}
                onChange={(val) => {
                  setPaymentStatus(val);
                  setPage(1);
                }}
              />
            </div>

            {/* Custom Sort Dropdown (Zero native select element) */}
            <div className="shrink-0 w-32 sm:w-40">
              <OrderSortDropdown
                value={sortBy}
                onChange={(val) => {
                  setSortBy(val);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Active Removable Filter Chips (Only rendered when filters are active) */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-slate-100/90">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow mr-0.5">
                Active:
              </span>

              {selectedStatus !== "ALL" && (
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-[11px] font-bold">
                  <span>{selectedStatus.replace("_", " ")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus("ALL");
                      setPage(1);
                    }}
                    className="hover:bg-orange-200/70 rounded p-0.5 transition cursor-pointer"
                    title="Remove status filter"
                  >
                    <X className="h-2.5 w-2.5 text-orange-700" />
                  </button>
                </span>
              )}

              {paymentStatus !== "ALL" && (
                <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-[11px] font-bold">
                  <span>{paymentStatus === "COMPLETED" ? "Paid" : paymentStatus}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStatus("ALL");
                      setPage(1);
                    }}
                    className="hover:bg-orange-200/70 rounded p-0.5 transition cursor-pointer"
                    title="Remove payment filter"
                  >
                    <X className="h-2.5 w-2.5 text-orange-700" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-[11px] font-bold text-slate-500 hover:text-orange-600 underline ml-1 cursor-pointer transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="clay-card p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchOrders()}
            className="font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading ? (
        <TableListSkeleton rows={8} />
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="clay-card p-8 sm:p-12 text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 mx-auto">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="font-fraunces text-base sm:text-lg font-bold text-slate-800">
            {selectedStatus !== "ALL"
              ? `No ${selectedStatus.replace("_", " ").toLowerCase()} orders`
              : debouncedSearch
              ? `No orders matching "${debouncedSearch}"`
              : "No orders found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {debouncedSearch
              ? `No orders match "${debouncedSearch}". Try checking the spelling, resetting search, or clearing status filters.`
              : selectedStatus !== "ALL"
              ? `There are currently no orders in "${selectedStatus.replace("_", " ").toLowerCase()}" milestone status.`
              : paymentStatus !== "ALL"
              ? `No orders found with payment status "${paymentStatus.toLowerCase()}".`
              : "No customer orders have been placed in this store yet."}
          </p>
          {(selectedStatus !== "ALL" || paymentStatus !== "ALL" || debouncedSearch) && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="clay-button h-11 min-h-[44px] px-5 text-xs font-bold text-orange-600 hover:bg-orange-50 active:scale-95 transition inline-flex items-center justify-center cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Order Cards (< md) — Full responsive at 375px with 44px tap targets */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {orders.map((ord) => (
              <div key={ord.id} className="clay-card p-4 space-y-2.5 min-w-0">
                {/* Top Row: Order ID, Date/Time, and Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-black font-mono-eyebrow text-slate-900 block truncate">
                      {ord.orderNumber}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Standardized Pill Sizing & Semantic Color */}
                  <span
                    className={`min-w-[84px] h-6 px-2.5 text-[10px] font-bold rounded-full border inline-flex items-center justify-center text-center uppercase tracking-wide shrink-0 ${getStatusBadge(
                      ord.orderStatus
                    )}`}
                  >
                    {ord.orderStatus}
                  </span>
                </div>

                {/* Customer Name & Product Line */}
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {ord.customer?.name || "Customer"}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {ord.itemsSummary || `${ord.itemsCount} item(s)`}
                  </p>
                </div>

                {/* Payment Pill & Grand Total Price Row */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span
                      className={`inline-flex items-center h-5 px-2 text-[9px] font-bold rounded border uppercase ${getPaymentBadge(
                        ord.paymentStatus
                      )}`}
                    >
                      {ord.paymentStatus} • {ord.paymentMethod || "UPI"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      ₹{ord.grandTotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Mobile Action Buttons (44px min touch target height) */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-xs">
                  <Link
                    href={`/admin/dashboard/orders/${ord.id}`}
                    className="clay-button h-11 min-h-[44px] flex items-center justify-center gap-1.5 text-slate-700 font-bold hover:text-indigo-600 active:scale-[0.98] transition cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                    <span>View</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveStatusOrder(ord)}
                    className="clay-button h-11 min-h-[44px] flex items-center justify-center gap-1.5 text-slate-700 font-bold hover:text-orange-600 active:scale-[0.98] transition cursor-pointer"
                  >
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    <span>Status</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveInvoiceOrderId(ord.id)}
                    className="clay-button h-11 min-h-[44px] flex items-center justify-center gap-1.5 text-slate-700 font-bold hover:text-emerald-600 active:scale-[0.98] transition cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span>Invoice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Responsive Orders Table (>= md) */}
          <div className="clay-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Order ID</th>
                    <th className="py-3 px-4 font-bold">Customer & Contact</th>
                    <th className="py-3 px-4 font-bold">Items Summary</th>
                    <th className="py-3 px-4 font-bold">Date & Time</th>
                    <th className="py-3 px-4 font-bold text-right">Grand Total</th>
                    <th className="py-3 px-4 font-bold text-center">Payment</th>
                    <th className="py-3 px-4 font-bold text-center">Fulfillment</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-bold font-mono-eyebrow text-slate-900">
                        <Link
                          href={`/admin/dashboard/orders/${ord.id}`}
                          className="hover:text-orange-600 transition"
                        >
                          {ord.orderNumber}
                        </Link>
                        {ord.trackingNumber && (
                          <span className="block text-[9.5px] font-mono text-slate-400 font-normal">
                            AWB: {ord.trackingNumber}
                          </span>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          {ord.customer?.name || "Guest Customer"}
                        </p>
                        <p className="text-[10.5px] text-slate-400">
                          {ord.customer?.phone || ord.customer?.email || "—"}
                        </p>
                      </td>

                      {/* Items Summary */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="font-medium text-slate-700 truncate" title={ord.itemsSummary}>
                          {ord.itemsSummary || `${ord.itemsCount} items`}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400">
                          {ord.itemsCount} unit(s) total
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        <p className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-[13px] whitespace-nowrap">
                        ₹{ord.grandTotal.toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9.5px] font-bold rounded-md uppercase border ${getPaymentBadge(
                            ord.paymentStatus
                          )}`}
                        >
                          {ord.paymentStatus}
                        </span>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                          {ord.paymentMethod || "UPI/COD"}
                        </p>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`min-w-[80px] inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border text-center uppercase ${getStatusBadge(
                            ord.orderStatus
                          )}`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail Link */}
                          <Link
                            href={`/admin/dashboard/orders/${ord.id}`}
                            className="clay-button inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:text-indigo-600 transition cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          {/* Quick Status Update */}
                          <button
                            type="button"
                            onClick={() => setActiveStatusOrder(ord)}
                            className="clay-button inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:text-orange-600 transition cursor-pointer"
                            title="Update Status / Tracking"
                          >
                            <Truck className="h-3.5 w-3.5" />
                          </button>

                          {/* Print Invoice */}
                          <button
                            type="button"
                            onClick={() => setActiveInvoiceOrderId(ord.id)}
                            className="clay-button inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:text-emerald-600 transition cursor-pointer"
                            title="GST Tax Invoice"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>

                          {/* Packing Slip */}
                          <button
                            type="button"
                            onClick={() => setActiveSlipOrderId(ord.id)}
                            className="clay-button inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:text-purple-600 transition cursor-pointer"
                            title="Warehouse Packing Slip"
                          >
                            <PackageCheck className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls (Optimized for Mobile 375px and Desktop) */}
          {pagination.total > 0 && (
            <div className="clay-card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
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
                  className="h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </select>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="clay-button h-11 min-h-[44px] px-3.5 inline-flex items-center justify-center gap-1 text-slate-700 font-bold disabled:opacity-30 active:scale-95 transition cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  <span className="px-2.5 py-1 font-bold text-slate-800 text-xs whitespace-nowrap">
                    Page {pagination.page} of {pagination.totalPages || 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="clay-button h-11 min-h-[44px] px-3.5 inline-flex items-center justify-center gap-1 text-slate-700 font-bold disabled:opacity-30 active:scale-95 transition cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Scroll to Top Button (Mobile + Desktop after scroll threshold) */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-5 right-4 z-30 h-11 w-11 rounded-full bg-[#2A241E] text-white shadow-2xl flex items-center justify-center transition-all hover:bg-black active:scale-95 cursor-pointer animate-fade-in"
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

      {/* Update Status Modal */}
      {activeStatusOrder && (
        <UpdateOrderStatusModal
          orderId={activeStatusOrder.id}
          orderNumber={activeStatusOrder.orderNumber}
          currentStatus={activeStatusOrder.orderStatus}
          currentCourier={activeStatusOrder.courierPartner}
          currentTracking={activeStatusOrder.trackingNumber}
          currentEstimatedDelivery={activeStatusOrder.estimatedDelivery}
          isOpen={!!activeStatusOrder}
          onClose={() => setActiveStatusOrder(null)}
          onSuccess={(updated) => {
            showToast(`Order #${activeStatusOrder.orderNumber} status updated to ${updated.orderStatus || "updated"}`);
            fetchOrders(true);
          }}
        />
      )}

      {/* GST Tax Invoice Modal */}
      {activeInvoiceOrderId && (
        <OrderInvoiceModal
          orderId={activeInvoiceOrderId}
          isOpen={!!activeInvoiceOrderId}
          onClose={() => setActiveInvoiceOrderId(null)}
        />
      )}

      {/* Warehouse Packing Slip Modal */}
      {activeSlipOrderId && (
        <PackingSlipModal
          orderId={activeSlipOrderId}
          isOpen={!!activeSlipOrderId}
          onClose={() => setActiveSlipOrderId(null)}
        />
      )}
    </div>
  );
}
