"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Truck,
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  PackageCheck,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Package,
  Navigation,
  RotateCcw,
  Sparkles,
  Printer,
  Eye,
  Copy,
  Check,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import {
  AdminShipmentItem,
  AdminShipmentSummary,
  AdminShipmentPagination,
  ShipmentStatus,
} from "@/types/admin-shipping";
import { AdminShippingService } from "@/services/adminShippingService";
import { TableListSkeleton } from "@/components/ui/Skeleton";
import ShipmentTrackingModal from "@/components/shipments/ShipmentTrackingModal";
import AssignCourierModal from "@/components/shipments/AssignCourierModal";
import UpdateShipmentStatusModal from "@/components/shipments/UpdateShipmentStatusModal";
import ShipmentFilterSheet from "@/components/shipments/ShipmentFilterSheet";
import ShipmentCourierDropdown from "@/components/shipments/ShipmentCourierDropdown";
import ShipmentDetailModal from "@/components/shipments/ShipmentDetailModal";
import PackingSlipModal from "@/components/orders/PackingSlipModal";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";

const COURIER_FILTER_OPTIONS = [
  { value: "ALL", label: "All Couriers" },
  { value: "Delhivery", label: "Delhivery" },
  { value: "Shiprocket", label: "Shiprocket" },
  { value: "Blue Dart", label: "Blue Dart" },
  { value: "Shadowfax", label: "Shadowfax" },
  { value: "DTDC", label: "DTDC" },
  { value: "Xpressbees", label: "Xpressbees" },
];

const STATUS_FILTER_OPTIONS: { value: "ALL" | ShipmentStatus; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PACKED", label: "Pending Pickup" },
  { value: "SHIPPED", label: "In Transit / Shipped" },
  { value: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "RETURN_INITIATED", label: "Returns / RTO" },
  { value: "CANCELLED", label: "Cancelled" },
];

const SORT_OPTIONS: { value: "createdAt_desc" | "createdAt_asc" | "estimatedDelivery_asc"; label: string }[] = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
  { value: "estimatedDelivery_asc", label: "Est. Delivery (Earliest)" },
];

export default function ShipmentsPage() {
  // Data States
  const [shipments, setShipments] = useState<AdminShipmentItem[]>([]);
  const [summary, setSummary] = useState<AdminShipmentSummary>({
    totalShipments: 0,
    pendingPickup: 0,
    shippedCount: 0,
    outForDeliveryCount: 0,
    deliveredCount: 0,
    rtoCount: 0,
  });
  const [pagination, setPagination] = useState<AdminShipmentPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ShipmentStatus>("ALL");
  const [courierFilter, setCourierFilter] = useState("ALL");
  const [isRTOFilter, setIsRTOFilter] = useState<boolean | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"createdAt_desc" | "createdAt_asc" | "estimatedDelivery_asc">("createdAt_desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Quick UI States
  const [showDateRange, setShowDateRange] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Modals
  const [selectedDetailShipment, setSelectedDetailShipment] = useState<AdminShipmentItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedTrackingShipment, setSelectedTrackingShipment] = useState<AdminShipmentItem | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const [assignShipment, setAssignShipment] = useState<AdminShipmentItem | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [updateStatusShipment, setUpdateStatusShipment] = useState<AdminShipmentItem | null>(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);

  const [packingSlipOrderId, setPackingSlipOrderId] = useState<string | null>(null);
  const [invoiceModalOrderId, setInvoiceModalOrderId] = useState<string | null>(null);

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Copied to clipboard!", "info");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Shipments
  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AdminShippingService.getShipments({
        page,
        limit,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        courier: courierFilter !== "ALL" ? courierFilter : undefined,
        isRTO: isRTOFilter,
        search: debouncedSearch.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        sort: sortOrder,
      });

      if (res.success && res.data) {
        setShipments(res.data.shipments || []);
        setPagination(res.data.pagination);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      } else {
        setError("Failed to load shipments.");
      }
    } catch (err) {
      setError(
        AdminShippingService.extractErrorMessage(
          err,
          "Failed to fetch shipments. Please verify backend connection."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, courierFilter, isRTOFilter, debouncedSearch, dateFrom, dateTo, sortOrder]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Quick Action Handlers
  const handleOpenDetail = (shp: AdminShipmentItem) => {
    setSelectedDetailShipment(shp);
    setIsDetailModalOpen(true);
  };

  const handleOpenTracking = (shp: AdminShipmentItem) => {
    setSelectedTrackingShipment(shp);
    setIsTrackingModalOpen(true);
  };

  const handleOpenAssign = (shp: AdminShipmentItem) => {
    setAssignShipment(shp);
    setIsAssignModalOpen(true);
  };

  const handleOpenUpdateStatus = (shp: AdminShipmentItem) => {
    setUpdateStatusShipment(shp);
    setIsUpdateStatusModalOpen(true);
  };

  const handleOpenPackingSlip = (orderId: string) => {
    setPackingSlipOrderId(orderId);
  };

  const handleOpenInvoiceModal = (orderId: string) => {
    setInvoiceModalOrderId(orderId);
  };

  // KPI Calculations
  const pendingPickupCount =
    summary.pendingPickup ?? summary.pendingAssignmentCount ?? 0;
  const inTransitCount =
    summary.inTransitCount ?? ((summary.shippedCount || 0) + (summary.outForDeliveryCount || 0));
  const deliveredCount = summary.deliveredCount ?? 0;
  const rtoCount = summary.rtoCount ?? 0;
  const totalCount =
    summary.totalShipments ??
    (pendingPickupCount + inTransitCount + deliveredCount + rtoCount);

  // Active filter count
  const activeFiltersCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (courierFilter !== "ALL" ? 1 : 0) +
    (isRTOFilter !== undefined ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0);

  const resetAllFilters = () => {
    setStatusFilter("ALL");
    setCourierFilter("ALL");
    setIsRTOFilter(undefined);
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setSortOrder("createdAt_desc");
    setPage(1);
  };

  // Status Badges
  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "OUT_FOR_DELIVERY":
        return "bg-amber-50 text-amber-900 border-amber-200";
      case "SHIPPED":
        return "bg-indigo-50 text-indigo-900 border-indigo-200";
      case "PACKED":
        return "bg-blue-50 text-blue-900 border-blue-200";
      case "PROCESSING":
      case "PLACED":
        return "bg-orange-50 text-orange-900 border-orange-200";
      case "RETURN_INITIATED":
      case "RETURNED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 pb-16 w-full min-w-0 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-fraunces text-xl sm:text-2xl font-bold text-[#2A241E] tracking-tight">
              Shipping & Logistics Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 font-mono">
              Live Logistics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Delhivery & Shiprocket fulfillment portal, live AWB tracking, courier assignments & packing slips
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchShipments()}
            disabled={loading}
            className="h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-[#FAF7F2] text-xs font-bold text-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Refresh Shipments"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards (Clicking any card automatically filters the table below) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full min-w-0">
        {/* 1. Total Shipments */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("ALL");
            setIsRTOFilter(undefined);
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "ALL" && isRTOFilter === undefined
              ? "ring-2 ring-slate-800 border-slate-800 shadow-md bg-slate-50/50"
              : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs w-full">
            <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow truncate">
              Total Shipments
            </span>
            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
              {totalCount}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">All recorded dispatches</p>
          </div>
        </button>

        {/* 2. Pending Pickup / Unassigned (Amber badge — high priority) */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter((prev) => (prev === "PACKED" ? "ALL" : "PACKED"));
            setIsRTOFilter(undefined);
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "PACKED"
              ? "ring-2 ring-amber-500 border-amber-500 shadow-md bg-amber-50/30"
              : "hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs w-full">
            <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow truncate">
              Pending Pickup
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <p className="text-xl sm:text-2xl font-black text-amber-900">
                {pendingPickupCount}
              </p>
              <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 uppercase font-mono">
                Urgent
              </span>
            </div>
            <p className="text-[10px] text-amber-700 font-medium truncate">Awaiting courier pickup</p>
          </div>
        </button>

        {/* 3. In Transit (Blue badge — shippedCount + outForDeliveryCount) */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter((prev) => (prev === "SHIPPED" ? "ALL" : "SHIPPED"));
            setIsRTOFilter(undefined);
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "SHIPPED"
              ? "ring-2 ring-indigo-500 border-indigo-500 shadow-md bg-indigo-50/30"
              : "hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700 text-xs w-full">
            <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow truncate">
              In Transit
            </span>
            <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-indigo-900">
              {inTransitCount}
            </p>
            <p className="text-[10px] text-indigo-700 font-medium truncate">With courier & out for delivery</p>
          </div>
        </button>

        {/* 4. Delivered (Green badge) */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter((prev) => (prev === "DELIVERED" ? "ALL" : "DELIVERED"));
            setIsRTOFilter(undefined);
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "DELIVERED"
              ? "ring-2 ring-emerald-500 border-emerald-500 shadow-md bg-emerald-50/30"
              : "hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs w-full">
            <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow truncate">
              Delivered
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-emerald-900">
              {deliveredCount}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium truncate">Safely fulfilled</p>
          </div>
        </button>

        {/* 5. RTO / Returns (Red/Purple badge) */}
        <button
          type="button"
          onClick={() => {
            if (isRTOFilter) {
              setIsRTOFilter(undefined);
              setStatusFilter("ALL");
            } else {
              setIsRTOFilter(true);
              setStatusFilter("RETURN_INITIATED");
            }
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-4 text-left min-h-[96px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer col-span-2 sm:col-span-1 ${
            isRTOFilter || statusFilter === "RETURN_INITIATED"
              ? "ring-2 ring-rose-500 border-rose-500 shadow-md bg-rose-50/30"
              : "hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs w-full">
            <span className="font-bold text-[10.5px] uppercase tracking-wider font-mono-eyebrow truncate">
              RTO / Returns
            </span>
            <div className="h-7 w-7 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-rose-900">
              {rtoCount}
            </p>
            <p className="text-[10px] text-rose-700 font-medium truncate">Return & RTO requests</p>
          </div>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="clay-card p-3 sm:p-4 space-y-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
          {/* Universal Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order #, AWB, Customer name, Phone, City, Pincode..."
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="w-full sm:w-44 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "ALL" | ShipmentStatus);
                setPage(1);
              }}
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Courier Partner Dropdown */}
          <div className="w-full sm:w-40 shrink-0">
            <ShipmentCourierDropdown
              value={courierFilter}
              onChange={(val) => {
                setCourierFilter(val);
                setPage(1);
              }}
            />
          </div>

          {/* Date Range Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDateRange(!showDateRange)}
            className={`h-11 min-h-[44px] px-3.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition active:scale-95 cursor-pointer shrink-0 ${
              dateFrom || dateTo
                ? "bg-orange-50 border-orange-300 text-orange-900"
                : "bg-white border-slate-200/80 text-slate-700 hover:bg-[#FAF7F2]"
            }`}
            title="Filter by Date Range"
          >
            <Calendar className="h-4 w-4 text-orange-600" />
            <span className="hidden md:inline">Dates</span>
            {(dateFrom || dateTo) && (
              <span className="h-2 w-2 rounded-full bg-orange-600" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-44 shrink-0">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as any);
                setPage(1);
              }}
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
            >
              {SORT_OPTIONS.map((so) => (
                <option key={so.value} value={so.value}>
                  {so.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="sm:hidden h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>

        {/* Expandable Date Range Picker */}
        {showDateRange && (
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-orange-100/90 flex flex-col sm:flex-row items-center gap-3 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow shrink-0">
              Filter by Date Range:
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-slate-500 font-medium">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-slate-500 font-medium">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 ml-auto flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().slice(0, 10);
                  setDateFrom(today);
                  setDateTo(today);
                  setPage(1);
                }}
                className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-orange-50 text-[11px] font-bold text-slate-700"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 7);
                  setDateFrom(d.toISOString().slice(0, 10));
                  setDateTo(new Date().toISOString().slice(0, 10));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-orange-50 text-[11px] font-bold text-slate-700"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 30);
                  setDateFrom(d.toISOString().slice(0, 10));
                  setDateTo(new Date().toISOString().slice(0, 10));
                  setPage(1);
                }}
                className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-orange-50 text-[11px] font-bold text-slate-700"
              >
                Last 30 Days
              </button>
              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setPage(1);
                  }}
                  className="px-2 py-1 rounded-md text-orange-600 font-bold text-[11px] hover:underline"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Removable Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow mr-0.5">
              Active:
            </span>

            {statusFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-[11px] font-bold">
                <span>{statusFilter.replace(/_/g, " ")}</span>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setPage(1);
                  }}
                  className="hover:bg-orange-200 rounded p-0.5"
                >
                  <X className="h-2.5 w-2.5 text-orange-700" />
                </button>
              </span>
            )}

            {courierFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-[11px] font-bold">
                <span>Courier: {courierFilter}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCourierFilter("ALL");
                    setPage(1);
                  }}
                  className="hover:bg-orange-200 rounded p-0.5"
                >
                  <X className="h-2.5 w-2.5 text-orange-700" />
                </button>
              </span>
            )}

            {isRTOFilter !== undefined && (
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-bold">
                <span>Returns Only</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRTOFilter(undefined);
                    setPage(1);
                  }}
                  className="hover:bg-rose-200 rounded p-0.5"
                >
                  <X className="h-2.5 w-2.5 text-rose-700" />
                </button>
              </span>
            )}

            {(dateFrom || dateTo) && (
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-[11px] font-bold">
                <span>
                  {dateFrom || "Start"} → {dateTo || "End"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setPage(1);
                  }}
                  className="hover:bg-orange-200 rounded p-0.5"
                >
                  <X className="h-2.5 w-2.5 text-orange-700" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] font-bold text-slate-500 hover:text-orange-600 underline ml-1 cursor-pointer transition"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="clay-card p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchShipments()}
            className="font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && <TableListSkeleton rows={6} />}

      {/* Empty State */}
      {!loading && !error && shipments.length === 0 && (
        <div className="clay-card p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto w-full">
          <div className="h-14 w-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
            <Truck className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-fraunces text-lg sm:text-xl font-bold text-slate-800">
              {search || activeFiltersCount > 0
                ? "No Matching Shipments Found"
                : "No Shipments Recorded Yet"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {search || activeFiltersCount > 0
                ? "No shipments match the selected filters or search keyword. Try clearing your search or filter criteria."
                : "Active courier dispatches, manifests, and tracking records will appear here as soon as orders are processed."}
            </p>
          </div>
          {(search || activeFiltersCount > 0) && (
            <div className="pt-1">
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Card List (375px+ responsive with 44px touch targets) */}
      {!loading && !error && shipments.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {shipments.map((shp) => {
            const hasAwb = !!shp.awbNumber;
            const currentOrderId = shp.orderId || shp.id;
            const trackingUrl =
              shp.trackingUrl ||
              (shp.awbNumber ? `https://www.delhivery.com/track/package/${shp.awbNumber}` : "");

            return (
              <div key={shp.id} className="clay-card p-4 space-y-3 min-w-0">
                {/* Header: Shipment # & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/dashboard/shipments/${currentOrderId}`}
                        className="font-mono font-bold text-slate-900 text-xs hover:text-orange-600 underline"
                      >
                        {shp.shipmentNumber || `SHIP-${shp.orderNumber}`}
                      </Link>
                      {shp.isRTO && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 uppercase font-mono">
                          RTO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Order: <span className="font-bold text-slate-700">{shp.orderNumber}</span>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(
                      shp.status
                    )}`}
                  >
                    {shp.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Logistics & AWB Banner */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono-eyebrow uppercase">Courier</p>
                    <p className="font-bold text-slate-900">{shp.courierPartner || "Unassigned"}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-mono-eyebrow uppercase">AWB Tracking #</p>
                    {hasAwb ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="font-mono font-bold text-slate-900">{shp.awbNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(shp.awbNumber!, `mob_awb_${shp.id}`)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          {copiedKey === `mob_awb_${shp.id}` ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAssign(shp)}
                        className="text-[10.5px] font-bold text-amber-700 hover:underline"
                      >
                        + Assign AWB
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer & Items Summary */}
                <div className="text-xs space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{shp.customer.name}</span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {shp.estimatedDelivery
                        ? new Date(shp.estimatedDelivery).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Standard"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {shp.destination?.city || shp.customer.city || "Destination"},{" "}
                      {shp.destination?.pincode || shp.customer.pincode || ""}
                    </span>
                  </div>

                  {/* Items Summary with Count Tag */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 shrink-0">
                      {shp.itemsCount} {shp.itemsCount === 1 ? "item" : "items"}
                    </span>
                    <span className="text-[11px] text-slate-600 truncate">
                      {shp.itemsSummary || "Dispatched package"}
                    </span>
                  </div>
                </div>

                {/* Mobile Touch Action Buttons (44px min height) */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(shp)}
                    className="h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] hover:bg-slate-200/70 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    title="View Details"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-600" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenTracking(shp)}
                    className="h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] hover:bg-orange-50 hover:text-orange-700 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    title="Track Scans"
                  >
                    <Truck className="h-3.5 w-3.5 text-orange-600" />
                    <span>Track</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPackingSlip(currentOrderId)}
                    className="h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] hover:bg-indigo-50 hover:text-indigo-700 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    title="Packing Slip"
                  >
                    <Printer className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenUpdateStatus(shp)}
                    className="h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    title="Update Status"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Status</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop Responsive Data Table */}
      {!loading && !error && shipments.length > 0 && (
        <div className="clay-card overflow-hidden hidden md:block">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Order & Shipment #</th>
                  <th className="py-3 px-4 font-bold">Date & Time</th>
                  <th className="py-3 px-4 font-bold">Customer Info</th>
                  <th className="py-3 px-4 font-bold">Items Summary</th>
                  <th className="py-3 px-4 font-bold">Courier & AWB</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold">Est. Delivery</th>
                  <th className="py-3 px-4 font-bold text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((shp) => {
                  const hasAwb = !!shp.awbNumber;
                  const currentOrderId = shp.orderId || shp.id;
                  const currentTrackingUrl =
                    shp.trackingUrl ||
                    (shp.awbNumber ? `https://www.delhivery.com/track/package/${shp.awbNumber}` : "");

                  return (
                    <tr
                      key={shp.id}
                      className="hover:bg-[#FAF7F3]/70 transition-colors group"
                    >
                      {/* Column 1: Order & Shipment # */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/dashboard/shipments/${currentOrderId}`}
                            className="font-mono font-bold text-slate-900 hover:text-orange-600 transition"
                            title="Open shipment detail page"
                          >
                            {shp.shipmentNumber || `SHIP-${shp.orderNumber}`}
                          </Link>
                          {shp.isRTO && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 uppercase font-mono">
                              RTO
                            </span>
                          )}
                        </div>
                        <p className="text-[10.5px] font-mono text-slate-500 mt-0.5">
                          Order: <span className="text-slate-700 font-bold">{shp.orderNumber}</span>
                        </p>
                      </td>

                      {/* Column 2: Date & Time */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <p className="font-medium text-slate-700">
                          {new Date(shp.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(shp.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      {/* Column 3: Customer Info */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{shp.customer.name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]">
                            {shp.destination?.city || shp.customer.city || "Mumbai"},{" "}
                            {shp.destination?.pincode || shp.customer.pincode || ""}
                          </span>
                        </div>
                        {shp.customer.phone && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>{shp.customer.phone}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(shp.customer.phone!, `phone_${shp.id}`)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title="Copy phone"
                            >
                              {copiedKey === `phone_${shp.id}` ? (
                                <Check className="h-2.5 w-2.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-2.5 w-2.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Column 4: Items Summary with count tag */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 shrink-0">
                            {shp.itemsCount} {shp.itemsCount === 1 ? "item" : "items"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5" title={shp.itemsSummary}>
                          {shp.itemsSummary || "Dispatched shipment"}
                        </p>
                      </td>

                      {/* Column 5: Courier & AWB with copy & link */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {shp.courierPartner || "Unassigned"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {hasAwb ? (
                            <>
                              <span className="font-mono font-bold text-slate-800 text-[11px]">
                                {shp.awbNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(shp.awbNumber!, `awb_${shp.id}`)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Copy AWB number"
                              >
                                {copiedKey === `awb_${shp.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAssign(shp)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                              title="Click to assign AWB"
                            >
                              <span>Assign AWB</span>
                              <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                            </button>
                          )}

                          {currentTrackingUrl && (
                            <a
                              href={currentTrackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700 p-0.5"
                              title="Open live courier tracking portal"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Column 6: Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border whitespace-nowrap ${getStatusBadge(
                            shp.status
                          )}`}
                        >
                          {shp.status.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Column 7: Estimated Delivery Date */}
                      <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {shp.estimatedDelivery
                          ? new Date(shp.estimatedDelivery).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "Standard"}
                      </td>

                      {/* Column 8: Quick Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(shp)}
                            className="h-8 px-2 rounded-lg bg-[#F8F5F1] hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="View Shipment Details"
                          >
                            <Eye className="h-3 w-3 text-slate-600" />
                            <span className="hidden xl:inline">Details</span>
                          </button>

                          {/* Track */}
                          <button
                            type="button"
                            onClick={() => handleOpenTracking(shp)}
                            className="h-8 px-2 rounded-lg bg-[#F8F5F1] hover:bg-orange-50 hover:text-orange-700 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Track Scans & Milestones"
                          >
                            <Truck className="h-3 w-3 text-orange-600" />
                            <span className="hidden xl:inline">Track</span>
                          </button>

                          {/* Print Packing Slip */}
                          <button
                            type="button"
                            onClick={() => handleOpenPackingSlip(currentOrderId)}
                            className="h-8 px-2 rounded-lg bg-[#F8F5F1] hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Print Packing Slip"
                          >
                            <Printer className="h-3 w-3 text-indigo-600" />
                            <span className="hidden xl:inline">Slip</span>
                          </button>

                          {/* Update Status */}
                          <button
                            type="button"
                            onClick={() => handleOpenUpdateStatus(shp)}
                            className="h-8 px-2 rounded-lg bg-[#F8F5F1] hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Update Status Milestone"
                          >
                            <RefreshCw className="h-3 w-3 text-emerald-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && pagination.total > 0 && (
        <div className="clay-card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-800">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-800">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-bold text-slate-800">{pagination.total}</span> shipments
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
            </select>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-[#FAF7F2] font-bold text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <span className="px-2 text-xs font-bold text-slate-700 font-mono">
                {pagination.page} / {pagination.totalPages || 1}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-[#FAF7F2] font-bold text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Animated Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-bold text-white transition-all transform animate-bounce-in ${
            toastMessage.type === "error"
              ? "bg-rose-600 border-rose-700"
              : toastMessage.type === "info"
              ? "bg-slate-800 border-slate-900"
              : "bg-emerald-600 border-emerald-700"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Modals */}
      <ShipmentDetailModal
        shipment={selectedDetailShipment}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailShipment(null);
        }}
        onOpenTracking={(shp) => {
          setIsDetailModalOpen(false);
          handleOpenTracking(shp);
        }}
        onOpenAssign={(shp) => {
          setIsDetailModalOpen(false);
          handleOpenAssign(shp);
        }}
        onOpenUpdateStatus={(shp) => {
          setIsDetailModalOpen(false);
          handleOpenUpdateStatus(shp);
        }}
        onOpenPackingSlip={(oid) => {
          setIsDetailModalOpen(false);
          handleOpenPackingSlip(oid);
        }}
        onOpenInvoice={(oid) => {
          setIsDetailModalOpen(false);
          handleOpenInvoiceModal(oid);
        }}
      />

      <ShipmentTrackingModal
        shipment={selectedTrackingShipment}
        isOpen={isTrackingModalOpen}
        onClose={() => {
          setIsTrackingModalOpen(false);
          setSelectedTrackingShipment(null);
        }}
      />

      <AssignCourierModal
        shipment={assignShipment}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignShipment(null);
        }}
        onSuccess={() => {
          showToast("Courier assigned successfully!", "success");
          fetchShipments();
        }}
      />

      <UpdateShipmentStatusModal
        shipment={updateStatusShipment}
        isOpen={isUpdateStatusModalOpen}
        onClose={() => {
          setIsUpdateStatusModalOpen(false);
          setUpdateStatusShipment(null);
        }}
        onSuccess={() => {
          showToast("Status updated successfully!", "success");
          fetchShipments();
        }}
      />

      <PackingSlipModal
        orderId={packingSlipOrderId || ""}
        isOpen={!!packingSlipOrderId}
        onClose={() => setPackingSlipOrderId(null)}
      />

      <OrderInvoiceModal
        orderId={invoiceModalOrderId || ""}
        isOpen={!!invoiceModalOrderId}
        onClose={() => setInvoiceModalOrderId(null)}
      />

      <ShipmentFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        status={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
        courier={courierFilter}
        onCourierChange={(c) => {
          setCourierFilter(c);
          setPage(1);
        }}
        onApply={() => fetchShipments()}
        onClearAll={resetAllFilters}
        activeCount={activeFiltersCount}
      />
    </div>
  );
}
