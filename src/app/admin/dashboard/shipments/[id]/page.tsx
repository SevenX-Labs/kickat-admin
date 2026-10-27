"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  Printer,
  Download,
  ExternalLink,
  Copy,
  Check,
  Package,
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  RefreshCw,
  Navigation,
  FileText,
  Sparkles,
  Send,
  Loader2,
  ChevronRight,
  PackageCheck,
  Building,
  HelpCircle,
} from "lucide-react";
import {
  AdminShipmentDetail,
  AdminShipmentTrackingData,
  ShipmentStatus,
  AssignCourierPayload,
  UpdateShipmentStatusPayload,
} from "@/types/admin-shipping";
import { AdminShippingService } from "@/services/adminShippingService";
import PackingSlipModal from "@/components/orders/PackingSlipModal";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";

const COURIER_PRESETS = [
  "Delhivery",
  "Shiprocket",
  "Blue Dart",
  "Shadowfax",
  "Xpressbees",
  "DTDC",
  "India Post",
];

const STATUS_CHOICES: { value: ShipmentStatus; label: string; desc: string }[] = [
  { value: "PACKED", label: "Packed", desc: "Warehouse pick & pack completed" },
  { value: "SHIPPED", label: "Shipped", desc: "Handed over to courier partner" },
  { value: "OUT_FOR_DELIVERY", label: "Out For Delivery", desc: "With local delivery driver" },
  { value: "DELIVERED", label: "Delivered", desc: "Successfully delivered to customer" },
  { value: "RETURN_INITIATED", label: "Return Initiated (RTO)", desc: "Return or RTO in progress" },
  { value: "RETURNED", label: "Returned", desc: "Restocked at warehouse" },
];

export default function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const shipmentId = resolvedParams.id;

  // Data States
  const [shipment, setShipment] = useState<AdminShipmentDetail | null>(null);
  const [tracking, setTracking] = useState<AdminShipmentTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals & Action States
  const [isPackingSlipOpen, setIsPackingSlipOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Fulfillment Form States
  const [assignForm, setAssignForm] = useState<AssignCourierPayload>({
    courierPartner: "Delhivery",
    awbNumber: "",
    estimatedDelivery: "",
    pickupLocation: "Kickat Central Warehouse, Mumbai",
    notes: "",
  });
  const [isAssigning, setIsAssigning] = useState(false);

  const [statusForm, setStatusForm] = useState<{
    status: ShipmentStatus;
    location: string;
    notes: string;
  }>({
    status: "SHIPPED",
    location: "",
    notes: "",
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
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

  // Load Data
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [detailRes, trackingRes] = await Promise.allSettled([
        AdminShippingService.getShipmentById(shipmentId),
        AdminShippingService.getTracking(shipmentId),
      ]);

      if (detailRes.status === "fulfilled" && detailRes.value?.data) {
        const shp = detailRes.value.data;
        setShipment(shp);

        // Prepopulate Assign Form
        setAssignForm({
          courierPartner: shp.courierPartner && shp.courierPartner !== "Unassigned" ? shp.courierPartner : "Delhivery",
          awbNumber: shp.awbNumber || "",
          estimatedDelivery: shp.estimatedDelivery ? new Date(shp.estimatedDelivery).toISOString().slice(0, 10) : new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
          pickupLocation: shp.pickupLocation || "Kickat Central Warehouse, Mumbai",
          notes: shp.notes || "",
        });

        // Prepopulate Status Form
        setStatusForm({
          status: shp.status,
          location: shp.destination?.city ? `${shp.destination.city} Delivery Hub` : "Local Logistics Hub",
          notes: "",
        });
      } else if (detailRes.status === "rejected") {
        throw detailRes.reason;
      }

      if (trackingRes.status === "fulfilled" && trackingRes.value?.data) {
        setTracking(trackingRes.value.data);
      }
    } catch (err) {
      setError(
        AdminShippingService.extractErrorMessage(
          err,
          "Failed to load shipment details. Please verify the shipment ID."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Invoice PDF Handler
  const handleDownloadInvoice = async () => {
    if (!shipment) return;
    const targetOrderId = shipment.orderId || shipment.id;
    try {
      setDownloadingPdf(true);
      await AdminShippingService.downloadInvoicePdf(targetOrderId, shipment.orderNumber);
      showToast("GST Invoice downloaded successfully!", "success");
    } catch {
      // Fallback to printable invoice modal
      setIsInvoiceModalOpen(true);
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Generate Dummy / Preset AWB
  const handleGenerateAwb = () => {
    const courierCode = (assignForm.courierPartner || "DLH").slice(0, 3).toUpperCase();
    const rand = Math.floor(1000000000 + Math.random() * 9000000000);
    setAssignForm((prev) => ({ ...prev, awbNumber: `${courierCode}-${rand}` }));
    showToast(`Generated tracking AWB for ${assignForm.courierPartner}`, "info");
  };

  // Submit Courier Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;

    if (!assignForm.courierPartner.trim()) {
      showToast("Please choose a courier partner", "error");
      return;
    }

    try {
      setIsAssigning(true);
      const res = await AdminShippingService.assignCourier(shipment.id, {
        courierPartner: assignForm.courierPartner.trim(),
        awbNumber: assignForm.awbNumber?.trim() || undefined,
        estimatedDelivery: assignForm.estimatedDelivery ? new Date(assignForm.estimatedDelivery).toISOString() : undefined,
        pickupLocation: assignForm.pickupLocation?.trim() || undefined,
        notes: assignForm.notes?.trim() || undefined,
      });

      showToast(res.message || `Courier assigned to ${assignForm.courierPartner}!`, "success");
      await fetchData(true);
    } catch (err) {
      showToast(AdminShippingService.extractErrorMessage(err, "Failed to assign courier"), "error");
    } finally {
      setIsAssigning(false);
    }
  };

  // Submit Status Update
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;

    try {
      setIsUpdatingStatus(true);
      const res = await AdminShippingService.updateStatus(shipment.id, {
        status: statusForm.status,
        location: statusForm.location.trim() || undefined,
        notes: statusForm.notes.trim() || undefined,
      });

      showToast(res.message || `Status updated to ${statusForm.status}`, "success");
      await fetchData(true);
    } catch (err) {
      showToast(AdminShippingService.extractErrorMessage(err, "Failed to update shipment status"), "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Badges
  const getStatusBadge = (st: ShipmentStatus) => {
    switch (st) {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-xs font-bold text-slate-500 font-mono-eyebrow uppercase tracking-wider">
          Loading Shipment & Logistics Data...
        </p>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="max-w-xl mx-auto my-12 clay-card p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-fraunces text-xl font-bold text-slate-900">Shipment Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "The requested shipment record could not be loaded."}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/admin/dashboard/shipments"
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Back to Shipments
          </Link>
          <button
            type="button"
            onClick={() => fetchData()}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold text-white transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasAwb = !!shipment.awbNumber;
  const trackingUrl =
    shipment.trackingUrl ||
    (shipment.awbNumber ? `https://www.delhivery.com/track/package/${shipment.awbNumber}` : "");

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pb-16 w-full min-w-0 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs min-w-0">
        <div className="flex items-center gap-2 text-slate-400">
          <Link
            href="/admin/dashboard"
            className="hover:text-slate-700 transition font-medium"
          >
            Dashboard
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href="/admin/dashboard/shipments"
            className="hover:text-slate-700 transition font-medium"
          >
            Shipments
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-mono font-bold text-slate-700 truncate">
            {shipment.shipmentNumber || shipment.orderNumber}
          </span>
        </div>

        <button
          type="button"
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="h-9 px-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          title="Refresh shipment & scans"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin text-orange-600" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Screen 2 Top Header & Actions Bar */}
      <div className="clay-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <Link
            href="/admin/dashboard/shipments"
            className="h-10 w-10 rounded-2xl bg-[#F8F5F1] hover:bg-slate-200/70 border border-slate-200 text-slate-700 flex items-center justify-center transition shrink-0 mt-0.5 sm:mt-0"
            title="Back to shipments list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-fraunces text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {shipment.shipmentNumber || `SHIP-${shipment.orderNumber}`}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-[10.5px] font-bold rounded-full border ${getStatusBadge(
                  shipment.status
                )}`}
              >
                {shipment.status.replace(/_/g, " ")}
              </span>
              {shipment.isRTO && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 uppercase font-mono">
                  RTO Return
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-mono">
              <span>
                Order: <span className="font-bold text-slate-700">{shipment.orderNumber}</span>
              </span>
              <span>•</span>
              <span>
                Date: {new Date(shipment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Print Invoice PDF */}
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={downloadingPdf}
            className="h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-800 hover:text-orange-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Download GST Tax Invoice PDF"
          >
            {downloadingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
            ) : (
              <Download className="h-4 w-4 text-orange-600" />
            )}
            <span>Print Invoice PDF</span>
          </button>

          {/* 2. Print Packing Slip */}
          <button
            type="button"
            onClick={() => setIsPackingSlipOpen(true)}
            className="h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-800 hover:text-indigo-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Print Warehouse Packing Slip"
          >
            <Printer className="h-4 w-4 text-indigo-600" />
            <span>Print Packing Slip</span>
          </button>

          {/* 3. Track on Delhivery (or courier portal) */}
          {trackingUrl ? (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-btn-orange h-11 min-h-[44px] px-4 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition active:scale-95"
              title="Open Official Courier Tracking Portal"
            >
              <span>Track on {shipment.courierPartner || "Courier"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("fulfillment-control-card");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-11 min-h-[44px] px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Assign Courier</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Fulfillment Card + Checkpoint Timeline), Right 1 Col (Customer & Destination) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 min-w-0">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0">
          {/* Fulfillment Control Card */}
          <div
            id="fulfillment-control-card"
            className="clay-card p-4 sm:p-5 bg-gradient-to-br from-white to-[#FAF8F5] border border-orange-100/90 rounded-2xl space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-bold text-slate-900">
                    Fulfillment Control Center
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {hasAwb
                      ? "Shipment is dispatched. Update transit milestones or reassign courier."
                      : "Pending courier assignment. Select partner and generate AWB tracking code."}
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                {shipment.courierPartner || "Unassigned"}
              </span>
            </div>

            {/* Courier & AWB Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                  Courier Partner
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {shipment.courierPartner || "None assigned"}
                </p>
                <p className="text-[10.5px] text-slate-500">
                  {shipment.pickupLocation || "Kickat Central Warehouse, Mumbai"}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                  AWB Tracking Number
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {shipment.awbNumber || "Pending"}
                  </span>
                  {shipment.awbNumber && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(shipment.awbNumber!, "awb")}
                      className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                      title="Copy AWB"
                    >
                      {copiedKey === "awb" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 mt-0.5"
                  >
                    <span>External Portal</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                  Estimated Delivery
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {shipment.estimatedDelivery
                    ? new Date(shipment.estimatedDelivery).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Standard Delivery (3-5 Days)"}
                </p>
                <p className="text-[10.5px] text-slate-500">
                  SLA Target: On Time
                </p>
              </div>
            </div>

            {/* In-Card Interactive Forms */}
            <div className="space-y-4 pt-1">
              {/* Form 1: Assign Courier (Shown if unassigned OR collapsible) */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-orange-600" />
                    <span>{hasAwb ? "Reassign Courier Partner & AWB" : "Assign Courier Partner & AWB"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateAwb}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Auto-generate AWB</span>
                  </button>
                </div>

                <form onSubmit={handleAssignSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase text-slate-500 font-mono-eyebrow mb-1">
                        Courier Partner *
                      </label>
                      <select
                        value={assignForm.courierPartner}
                        onChange={(e) => setAssignForm((prev) => ({ ...prev, courierPartner: e.target.value }))}
                        className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        required
                      >
                        {COURIER_PRESETS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase text-slate-500 font-mono-eyebrow mb-1">
                        AWB / Tracking Number
                      </label>
                      <input
                        type="text"
                        value={assignForm.awbNumber}
                        onChange={(e) => setAssignForm((prev) => ({ ...prev, awbNumber: e.target.value }))}
                        placeholder="e.g. DLH-9928172641"
                        className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 text-xs font-mono font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase text-slate-500 font-mono-eyebrow mb-1">
                        Estimated Delivery Date
                      </label>
                      <input
                        type="date"
                        value={assignForm.estimatedDelivery}
                        onChange={(e) => setAssignForm((prev) => ({ ...prev, estimatedDelivery: e.target.value }))}
                        className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase text-slate-500 font-mono-eyebrow mb-1">
                        Warehouse Pickup Location
                      </label>
                      <input
                        type="text"
                        value={assignForm.pickupLocation}
                        onChange={(e) => setAssignForm((prev) => ({ ...prev, pickupLocation: e.target.value }))}
                        placeholder="e.g. Kickat Central Warehouse, Mumbai"
                        className="w-full h-10 rounded-xl bg-white border border-slate-200 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isAssigning}
                      className="h-10 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isAssigning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>{hasAwb ? "Update Courier Assignment" : "Confirm Courier Assignment"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Form 2: Update Status Milestone */}
              {hasAwb && (
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Update Shipment Status & Milestone Location</span>
                  </span>

                  <form onSubmit={handleStatusSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10.5px] font-bold uppercase text-slate-500 font-mono-eyebrow mb-1">
                          Delivery Status *
                        </label>
                        <select
                          value={statusForm.status}
                          onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value as ShipmentStatus }))}
                          className="w-full h-10 rounded-xl bg-white border border-emerald-200 px-3 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          {STATUS_CHOICES.map((st) => (
                            <option key={st.value} value={st.value}>
                              {st.label} — {st.desc}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold uppercase text-slate-500 font-mono-eyebrow mb-1">
                          Current Hub / Location
                        </label>
                        <input
                          type="text"
                          value={statusForm.location}
                          onChange={(e) => setStatusForm((prev) => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. Andheri West Hub"
                          className="w-full h-10 rounded-xl bg-white border border-emerald-200 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase text-slate-500 font-mono-eyebrow mb-1">
                        Status Notes / Milestone Description
                      </label>
                      <input
                        type="text"
                        value={statusForm.notes}
                        onChange={(e) => setStatusForm((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="e.g. Dispatched with morning delivery van"
                        className="w-full h-10 rounded-xl bg-white border border-emerald-200 px-3 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="submit"
                        disabled={isUpdatingStatus}
                        className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingStatus ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Update Status Milestone</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Milestone Timeline */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-bold text-slate-900">
                    Live Tracking Checkpoints
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Real-time courier scan events & hub movements
                  </p>
                </div>
              </div>

              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                >
                  <span>Courier Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Checkpoints Timeline Display */}
            {tracking?.checkpoints && tracking.checkpoints.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {tracking.checkpoints.map((cp, idx) => {
                  const isLatest = idx === tracking.checkpoints.length - 1;
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLatest
                            ? "border-orange-500 bg-orange-500 text-white ring-4 ring-orange-100 shadow-xs"
                            : "border-slate-300 bg-white text-slate-400 group-hover:border-slate-400"
                        }`}
                      >
                        {isLatest ? (
                          <Truck className="h-2.5 w-2.5" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        )}
                      </div>

                      {/* Checkpoint Card */}
                      <div className="bg-slate-50/80 hover:bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/80 transition-colors space-y-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs">
                            {cp.status.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date(cp.timestamp).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{cp.location}</span>
                        </div>

                        {cp.description && (
                          <p className="text-[11px] text-slate-500 pt-0.5">
                            {cp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <Truck className="h-8 w-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-600">No Checkpoints Logged Yet</p>
                <p className="text-[11px]">
                  Scans will automatically appear once the courier scans the package at dispatch.
                </p>
              </div>
            )}
          </div>

          {/* Package & Products Table */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-bold text-slate-900">
                    Package Products & Quantities
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {shipment.items?.length || shipment.itemsCount} line items enclosed
                  </p>
                </div>
              </div>
            </div>

            {shipment.items && shipment.items.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAF7F3] text-slate-400 text-[10px] font-mono-eyebrow uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4 font-bold">Item & Description</th>
                      <th className="py-3 px-4 font-bold">Variant / Spec</th>
                      <th className="py-3 px-4 font-bold text-center">Qty</th>
                      <th className="py-3 px-4 font-bold text-right">Unit Price</th>
                      <th className="py-3 px-4 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shipment.items.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{it.productName}</p>
                          {it.sku && (
                            <span className="text-[10px] font-mono text-slate-400">
                              SKU: {it.sku}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {it.variantName || "Standard Spec"}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900 text-sm">
                          {it.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 font-mono">
                          ₹{it.price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                          ₹{(it.totalPrice || it.price * it.quantity).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs">
                <p className="font-bold text-slate-900">
                  {shipment.itemsSummary || "Consolidated package"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Encloses {shipment.itemsCount} total units.
                </p>
              </div>
            )}

            {/* Financial Breakdown */}
            {(shipment.grandTotal !== undefined || shipment.subtotal !== undefined) && (
              <div className="pt-2 flex justify-end">
                <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
                  {shipment.subtotal !== undefined && (
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-800">
                        ₹{shipment.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {shipment.deliveryFee !== undefined && (
                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="font-mono text-slate-800">
                        {shipment.deliveryFee === 0 ? "FREE" : `₹${shipment.deliveryFee}`}
                      </span>
                    </div>
                  )}
                  {shipment.gstAmount !== undefined && (
                    <div className="flex justify-between">
                      <span>GST Taxes:</span>
                      <span className="font-mono text-slate-800">
                        ₹{shipment.gstAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  {shipment.grandTotal !== undefined && (
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                      <span>Grand Total:</span>
                      <span className="font-mono text-orange-600">
                        ₹{shipment.grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Customer & Destination Cards */}
        <div className="space-y-5 sm:space-y-6 min-w-0">
          {/* Customer Information Card */}
          <div className="clay-card p-4 sm:p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="h-7 w-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <User className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-fraunces text-sm font-bold text-slate-900">
                Customer Information
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                  Customer Name
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {shipment.customer.name}
                </p>
              </div>

              {shipment.customer.email && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                    Email Address
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                    <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${shipment.customer.email}`}
                      className="hover:underline truncate"
                    >
                      {shipment.customer.email}
                    </a>
                  </div>
                </div>
              )}

              {shipment.customer.phone && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                    Contact Phone
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="font-mono font-bold text-slate-800">
                      {shipment.customer.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(shipment.customer.phone!, "cust_phone")}
                      className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                      title="Copy phone"
                    >
                      {copiedKey === "cust_phone" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Destination Address Card */}
          <div className="clay-card p-4 sm:p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="h-7 w-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <h3 className="font-fraunces text-sm font-bold text-slate-900">
                Destination Address
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                  Delivery Location
                </span>
                <p className="font-medium text-slate-800 leading-relaxed mt-1">
                  {shipment.destination.fullAddress ||
                    `${shipment.destination.city || shipment.customer.city || "Mumbai"}, ${shipment.destination.state || ""}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                    City
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {shipment.destination.city || shipment.customer.city || "—"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                    Pincode
                  </span>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">
                    {shipment.destination.pincode || shipment.customer.pincode || "—"}
                  </p>
                </div>
              </div>

              {shipment.notes && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] mt-2">
                  <span className="font-bold block">Delivery Instructions:</span>
                  <p className="mt-0.5 italic">{shipment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Help & SLA Box */}
          <div className="clay-card p-4 rounded-2xl bg-[#FAF8F5] border border-orange-100/90 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-orange-700 font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>KickAt Logistics Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All dispatches are insured with Delhivery and Shiprocket transit coverage. Tracking updates sync every 15 minutes.
            </p>
          </div>
        </div>
      </div>

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

      {/* Printable Modals */}
      <PackingSlipModal
        orderId={shipment.orderId || shipment.id}
        isOpen={isPackingSlipOpen}
        onClose={() => setIsPackingSlipOpen(false)}
      />

      <OrderInvoiceModal
        orderId={shipment.orderId || shipment.id}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
}
