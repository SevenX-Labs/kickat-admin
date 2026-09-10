"use client";

import React, { useState, useEffect, useCallback } from "react";
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

const COURIER_FILTER_OPTIONS = [
  { value: "ALL", label: "All Couriers" },
  { value: "Delhivery", label: "Delhivery" },
  { value: "Blue Dart", label: "Blue Dart" },
  { value: "Shiprocket", label: "Shiprocket" },
  { value: "Shadowfax", label: "Shadowfax" },
  { value: "DTDC", label: "DTDC" },
  { value: "Xpressbees", label: "Xpressbees" },
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals
  const [selectedTrackingShipment, setSelectedTrackingShipment] = useState<AdminShipmentItem | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const [assignShipment, setAssignShipment] = useState<AdminShipmentItem | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [updateStatusShipment, setUpdateStatusShipment] = useState<AdminShipmentItem | null>(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
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
        search: debouncedSearch.trim() || undefined,
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
  }, [page, limit, statusFilter, courierFilter, debouncedSearch]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

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

  // Safe fallback counts so numbers NEVER render blank/undefined
  const pendingPickupCount =
    summary.pendingPickup ?? summary.pendingAssignmentCount ?? 0;
  const inTransitCount =
    summary.shippedCount ?? summary.inTransitCount ?? 0;
  const outForDeliveryCount = summary.outForDeliveryCount ?? 0;
  const deliveredCount = summary.deliveredCount ?? 0;
  const rtoCount = summary.rtoCount ?? 0;
  const totalCount =
    summary.totalShipments ??
    (pendingPickupCount + inTransitCount + outForDeliveryCount + deliveredCount + rtoCount);

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
    <div className="space-y-4 sm:space-y-6 pb-12 w-full min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-fraunces text-xl sm:text-2xl font-bold text-[#2A241E] tracking-tight">
              Shipping & Logistics
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 font-mono">
              Live Fulfillment
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time courier assignments, AWB tracking, delivery milestones & SLA tracking
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
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 6 Interactive Semantic Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 w-full min-w-0">
        {/* 1. All Shipments */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("ALL");
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-3.5 text-left min-h-[92px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "ALL" ? "ring-2 ring-slate-700 border-slate-700 shadow-md" : "hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs w-full">
            <span className="font-bold text-[10px] uppercase tracking-wider font-mono-eyebrow truncate">
              All Shipments
            </span>
            <Package className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
              {totalCount}
            </p>
            <p className="text-[10px] text-slate-500 font-medium truncate">Total recorded</p>
          </div>
        </button>

        {/* 2. Pending Pickup */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter((prev) => (prev === "PACKED" ? "ALL" : "PACKED"));
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-3.5 text-left min-h-[92px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "PACKED" ? "ring-2 ring-orange-500 border-orange-500 shadow-md" : "hover:border-orange-300"
          }`}
        >
          <div className="flex items-center justify-between text-orange-600 text-xs w-full">
            <span className="font-bold text-[10px] uppercase tracking-wider font-mono-eyebrow truncate">
              Pending Pickup
            </span>
            <Clock className="h-4 w-4 text-orange-500 shrink-0" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
              {pendingPickupCount}
            </p>
            <p className="text-[10px] text-orange-600 font-medium truncate">Ready for courier</p>
          </div>
        </button>

        {/* 3. In Transit */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter((prev) => (prev === "SHIPPED" ? "ALL" : "SHIPPED"));
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-3.5 text-left min-h-[92px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "SHIPPED" ? "ring-2 ring-indigo-500 border-indigo-500 shadow-md" : "hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600 text-xs w-full">
            <span className="font-bold text-[10px] uppercase tracking-wider font-mono-eyebrow truncate">
              In Transit
            </span>
            <Truck className="h-4 w-4 text-indigo-500 shrink-0" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
              {inTransitCount}
            </p>
            <p className="text-[10px] text-indigo-600 font-medium truncate">Handed to courier</p>
          </div>
        </button>

        {/* 4. Out for Delivery */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter((prev) => (prev === "OUT_FOR_DELIVERY" ? "ALL" : "OUT_FOR_DELIVERY"));
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-3.5 text-left min-h-[92px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "OUT_FOR_DELIVERY" ? "ring-2 ring-amber-500 border-amber-500 shadow-md" : "hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 text-xs w-full">
            <span className="font-bold text-[10px] uppercase tracking-wider font-mono-eyebrow truncate">
              Out for Delivery
            </span>
            <Navigation className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
              {outForDeliveryCount}
            </p>
            <p className="text-[10px] text-amber-600 font-medium truncate">Reaching today</p>
          </div>
        </button>

        {/* 5. Delivered */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter((prev) => (prev === "DELIVERED" ? "ALL" : "DELIVERED"));
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-3.5 text-left min-h-[92px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "DELIVERED" ? "ring-2 ring-emerald-500 border-emerald-500 shadow-md" : "hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 text-xs w-full">
            <span className="font-bold text-[10px] uppercase tracking-wider font-mono-eyebrow truncate">
              Delivered
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
              {deliveredCount}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium truncate">Fulfilled safely</p>
          </div>
        </button>

        {/* 6. Returns / RTO */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter((prev) => (prev === "RETURN_INITIATED" ? "ALL" : "RETURN_INITIATED"));
            setPage(1);
          }}
          className={`clay-card p-3 sm:p-3.5 text-left min-h-[92px] flex flex-col justify-between transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "RETURN_INITIATED" ? "ring-2 ring-rose-500 border-rose-500 shadow-md" : "hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 text-xs w-full">
            <span className="font-bold text-[10px] uppercase tracking-wider font-mono-eyebrow truncate">
              Returns / RTO
            </span>
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
              {rtoCount}
            </p>
            <p className="text-[10px] text-rose-500 font-medium truncate">Return requests</p>
          </div>
        </button>
      </div>

      {/* Sticky Search & Filter Toolbar */}
      <div className="clay-card p-2.5 sm:p-3.5 space-y-2.5 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search AWB, order #, customer, city..."
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Courier Filter Select */}
          <div className="w-36 sm:w-44 shrink-0">
            <select
              value={courierFilter}
              onChange={(e) => {
                setCourierFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-2.5 text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              {COURIER_FILTER_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button if filtered */}
          {(statusFilter !== "ALL" || courierFilter !== "ALL" || search) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setCourierFilter("ALL");
                setSearch("");
                setPage(1);
              }}
              className="h-11 min-h-[44px] px-3 rounded-xl border border-slate-200 text-slate-600 hover:text-orange-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Milestone Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          {[
            { value: "ALL", label: "All" },
            { value: "PACKED", label: "Pending Pickup" },
            { value: "SHIPPED", label: "Shipped" },
            { value: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
            { value: "DELIVERED", label: "Delivered" },
            { value: "RETURN_INITIATED", label: "Returns / RTO" },
          ].map((st) => {
            const isSelected = statusFilter === st.value;
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => {
                  setStatusFilter(st.value as any);
                  setPage(1);
                }}
                className={`h-8 min-h-[32px] px-3 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1 ${
                  isSelected
                    ? "bg-[#2A241E] text-white shadow-xs"
                    : "bg-[#F8F5F1] text-slate-600 hover:bg-slate-200/70 border border-slate-200/70"
                }`}
              >
                <span>{st.label}</span>
              </button>
            );
          })}
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
            onClick={() => fetchShipments()}
            className="font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && <TableListSkeleton rows={5} />}

      {/* Empty State */}
      {!loading && !error && shipments.length === 0 && (
        <div className="clay-card p-10 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="font-fraunces text-base font-bold text-slate-800">
            No Shipments Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No shipments match the selected filters or search keyword. Try resetting your search or filter parameters.
          </p>
        </div>
      )}

      {/* Mobile Card List (375px optimized with 44px min touch targets) */}
      {!loading && !error && shipments.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {shipments.map((shp) => {
            const hasAwb = !!shp.awbNumber;
            return (
              <div key={shp.id} className="clay-card p-3.5 space-y-3 min-w-0">
                {/* Card Header: AWB & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {hasAwb ? (
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {shp.awbNumber}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAssign(shp)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                        >
                          <span>Pending AWB</span>
                          <Sparkles className="h-3 w-3 text-amber-600" />
                        </button>
                      )}

                      {shp.trackingUrl && (
                        <a
                          href={shp.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-700 p-1"
                          title="Courier Portal"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-indigo-700 mt-0.5">
                      {shp.courierPartner || "Unassigned"}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-full border ${getStatusBadge(
                      shp.status
                    )}`}
                  >
                    {shp.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Destination & Customer Info */}
                <div className="text-xs pt-1 border-t border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {shp.destination?.city || shp.customer.city || "Destination"},{" "}
                      {shp.destination?.pincode || shp.customer.pincode || ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="font-mono text-slate-600 truncate mr-2">
                      {shp.orderNumber} • {shp.customer.name}
                    </span>
                    <span className="font-bold text-slate-700 shrink-0">
                      {shp.estimatedDelivery
                        ? new Date(shp.estimatedDelivery).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "Standard"}
                    </span>
                  </div>
                </div>

                {/* Mobile Touch Actions (44px min touch height) */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenTracking(shp)}
                    className="h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] hover:bg-orange-50 hover:text-orange-700 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Truck className="h-3.5 w-3.5 text-orange-600" />
                    <span>Track</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAssign(shp)}
                    className="h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <PackageCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>{hasAwb ? "Reassign" : "Assign"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenUpdateStatus(shp)}
                    className="h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer active:scale-95"
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

      {/* Desktop Responsive Table */}
      {!loading && !error && shipments.length > 0 && (
        <div className="clay-card overflow-hidden hidden md:block">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">AWB / Tracking #</th>
                  <th className="py-3 px-4 font-bold">Courier & Order</th>
                  <th className="py-3 px-4 font-bold">Customer & City</th>
                  <th className="py-3 px-4 font-bold">Dispatch Date</th>
                  <th className="py-3 px-4 font-bold">Est. Delivery</th>
                  <th className="py-3 px-4 font-bold text-center">Milestone</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shipments.map((shp) => {
                  const hasAwb = !!shp.awbNumber;
                  return (
                    <tr key={shp.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {hasAwb ? (
                            <span>{shp.awbNumber}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAssign(shp)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                              title="Click to assign AWB"
                            >
                              <span>Pending AWB</span>
                              <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                            </button>
                          )}

                          {shp.trackingUrl && (
                            <a
                              href={shp.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700"
                              title="Open courier portal"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {shp.courierPartner || "Unassigned"}
                        </p>
                        <p className="text-[10.5px] font-mono text-slate-500">
                          {shp.orderNumber}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{shp.customer.name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>
                            {shp.destination?.city || shp.customer.city || "Destination"},{" "}
                            {shp.destination?.pincode || shp.customer.pincode || ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(shp.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {shp.estimatedDelivery
                          ? new Date(shp.estimatedDelivery).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "Standard"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(
                            shp.status
                          )}`}
                        >
                          {shp.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenTracking(shp)}
                            className="h-8 px-2.5 rounded-lg bg-[#F8F5F1] hover:bg-orange-50 hover:text-orange-700 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Tracking Timeline"
                          >
                            <Truck className="h-3 w-3 text-orange-600" />
                            <span>Track</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenAssign(shp)}
                            className="h-8 px-2.5 rounded-lg bg-[#F8F5F1] hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Assign Courier & AWB"
                          >
                            <PackageCheck className="h-3 w-3 text-indigo-600" />
                            <span>{hasAwb ? "Reassign" : "Assign"}</span>
                          </button>

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

      {/* Modals */}
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
        onSuccess={() => fetchShipments()}
      />

      <UpdateShipmentStatusModal
        shipment={updateStatusShipment}
        isOpen={isUpdateStatusModalOpen}
        onClose={() => {
          setIsUpdateStatusModalOpen(false);
          setUpdateStatusShipment(null);
        }}
        onSuccess={() => fetchShipments()}
      />
    </div>
  );
}
