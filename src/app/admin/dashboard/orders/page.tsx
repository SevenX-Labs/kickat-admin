"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  MoreVertical,
  RotateCcw,
  PackageCheck,
  Calendar,
  IndianRupee,
  Package,
  XCircle,
  Check,
  SlidersHorizontal,
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
import { TableListSkeleton, StatCardsSkeleton } from "@/components/ui/Skeleton";
import UpdateOrderStatusModal from "@/components/orders/UpdateOrderStatusModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import ProcessRefundModal from "@/components/orders/ProcessRefundModal";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";
import PackingSlipModal from "@/components/orders/PackingSlipModal";

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
  const [activeStatusOrder, setActiveStatusOrder] = useState<AdminOrderItem | null>(null);
  const [activeCancelOrder, setActiveCancelOrder] = useState<AdminOrderItem | null>(null);
  const [activeRefundOrder, setActiveRefundOrder] = useState<AdminOrderItem | null>(null);
  const [activeInvoiceOrderId, setActiveInvoiceOrderId] = useState<string | null>(null);
  const [activeSlipOrderId, setActiveSlipOrderId] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

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

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => setActiveActionMenuId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PROCESSING":
      case "PACKED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PLACED":
      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";
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
    <div className="space-y-4 sm:space-y-5 pb-12 w-full min-w-0 no-scrollbar">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
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
            className="clay-button inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Orders */}
          <div className="clay-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-bold text-[11px] uppercase tracking-wider font-mono-eyebrow">Orders</span>
              <ShoppingBag className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-lg sm:text-xl font-black text-[#2A241E]">
              {summary.totalOrders}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">All lifecycle orders</p>
          </div>

          {/* Total Revenue */}
          <div className="clay-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-600 text-xs">
              <span className="font-bold text-[11px] uppercase tracking-wider font-mono-eyebrow">Revenue</span>
              <IndianRupee className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-lg sm:text-xl font-black text-emerald-700 truncate">
              ₹{summary.totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Net non-cancelled</p>
          </div>

          {/* Processing / Placed */}
          <div className="clay-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-amber-600 text-xs">
              <span className="font-bold text-[11px] uppercase tracking-wider font-mono-eyebrow">In Progress</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-lg sm:text-xl font-black text-[#2A241E]">
              {(summary.processingCount || 0) + (summary.placedCount || 0) + (summary.pendingCount || 0)}
            </p>
            <p className="text-[10px] text-amber-600 font-medium">Picking & packing</p>
          </div>

          {/* Shipped */}
          <div className="clay-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-indigo-600 text-xs">
              <span className="font-bold text-[11px] uppercase tracking-wider font-mono-eyebrow">In Transit</span>
              <Truck className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-lg sm:text-xl font-black text-[#2A241E]">
              {(summary.shippedCount || 0) + (summary.packedCount || 0)}
            </p>
            <p className="text-[10px] text-indigo-600 font-medium">With couriers</p>
          </div>

          {/* Delivered */}
          <div className="clay-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-600 text-xs">
              <span className="font-bold text-[11px] uppercase tracking-wider font-mono-eyebrow">Delivered</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-lg sm:text-xl font-black text-[#2A241E]">
              {summary.deliveredCount}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium">Successfully fulfilled</p>
          </div>

          {/* Cancelled */}
          <div className="clay-card p-3.5 sm:p-4 space-y-1">
            <div className="flex items-center justify-between text-rose-600 text-xs">
              <span className="font-bold text-[11px] uppercase tracking-wider font-mono-eyebrow">Cancelled</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <p className="text-lg sm:text-xl font-black text-[#2A241E]">
              {summary.cancelledCount}
            </p>
            <p className="text-[10px] text-rose-500 font-medium">Restocked inventory</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="clay-card p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, customer name, email, or phone..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Payment Status Dropdown */}
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value as any);
                setPage(1);
              }}
              className="rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="ALL">All Payments</option>
              <option value="COMPLETED">Paid (Completed)</option>
              <option value="PENDING">Pending Payment</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as AdminOrderSortEnum);
                setPage(1);
              }}
              className="rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="createdAt_desc">Latest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="grandTotal_desc">Highest Value</option>
              <option value="grandTotal_asc">Lowest Value</option>
            </select>
          </div>
        </div>

        {/* Status Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 border-t border-slate-100 pt-2.5">
          {[
            { label: "All Orders", value: "ALL" },
            { label: "Placed", value: "PLACED" },
            { label: "Processing", value: "PROCESSING" },
            { label: "Packed", value: "PACKED" },
            { label: "Shipped", value: "SHIPPED" },
            { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
            { label: "Delivered", value: "DELIVERED" },
            { label: "Cancelled", value: "CANCELLED" },
            { label: "Returns", value: "RETURNED" },
          ].map((st) => (
            <button
              key={st.value}
              onClick={() => {
                setSelectedStatus(st.value as any);
                setPage(1);
              }}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition active:scale-95
                ${selectedStatus === st.value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }
              `}
            >
              {st.label}
            </button>
          ))}
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
            className="font-bold underline hover:text-rose-900"
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
        <div className="clay-card p-12 text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 mx-auto">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h3 className="font-fraunces text-base sm:text-lg font-bold text-slate-800">
            No orders found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No orders match your current filters. Try changing your search query, status tabs, or clearing filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedStatus("ALL");
              setPaymentStatus("ALL");
              setPage(1);
            }}
            className="clay-button px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Order Cards (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {orders.map((ord) => (
              <div key={ord.id} className="clay-card p-4 space-y-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-black font-mono-eyebrow text-slate-900">
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

                  <span
                    className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${getStatusBadge(
                      ord.orderStatus
                    )}`}
                  >
                    {ord.orderStatus}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    {ord.customer?.name || "Customer"}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {ord.itemsSummary || `${ord.itemsCount} item(s)`}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${getPaymentBadge(
                        ord.paymentStatus
                      )}`}
                    >
                      {ord.paymentStatus} • {ord.paymentMethod || "COD"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">
                      ₹{ord.grandTotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Mobile Quick Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <Link
                    href={`/admin/dashboard/orders/${ord.id}`}
                    className="clay-button flex items-center justify-center gap-1 py-1.5 text-slate-700 font-bold hover:text-indigo-600"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View</span>
                  </Link>

                  <button
                    onClick={() => setActiveStatusOrder(ord)}
                    className="clay-button flex items-center justify-center gap-1 py-1.5 text-slate-700 font-bold hover:text-orange-600"
                  >
                    <Truck className="h-3 w-3" />
                    <span>Status</span>
                  </button>

                  <button
                    onClick={() => setActiveInvoiceOrderId(ord.id)}
                    className="clay-button flex items-center justify-center gap-1 py-1.5 text-slate-700 font-bold hover:text-emerald-600"
                  >
                    <FileText className="h-3 w-3" />
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
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(
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
                            className="clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:text-indigo-600 transition"
                            title="View Full Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          {/* Quick Status Update */}
                          <button
                            onClick={() => setActiveStatusOrder(ord)}
                            className="clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:text-orange-600 transition"
                            title="Update Status / Tracking"
                          >
                            <Truck className="h-3.5 w-3.5" />
                          </button>

                          {/* Print Invoice */}
                          <button
                            onClick={() => setActiveInvoiceOrderId(ord.id)}
                            className="clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:text-emerald-600 transition"
                            title="GST Tax Invoice"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>

                          {/* Packing Slip */}
                          <button
                            onClick={() => setActiveSlipOrderId(ord.id)}
                            className="clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:text-purple-600 transition"
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="clay-card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 text-[11px] font-medium">
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

              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-2 py-1 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="clay-button h-8 w-8 inline-flex items-center justify-center text-slate-600 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="px-3 py-1 font-bold text-slate-800 text-xs">
                    {pagination.page} / {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="clay-button h-8 w-8 inline-flex items-center justify-center text-slate-600 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

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
