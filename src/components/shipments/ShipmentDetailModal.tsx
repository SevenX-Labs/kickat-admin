"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Truck,
  Package,
  MapPin,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Printer,
  Download,
  RotateCcw,
  RefreshCw,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  PackageCheck,
} from "lucide-react";
import {
  AdminShipmentItem,
  AdminShipmentDetail,
  ShipmentStatus,
} from "@/types/admin-shipping";
import { AdminShippingService } from "@/services/adminShippingService";

interface ShipmentDetailModalProps {
  shipment: AdminShipmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTracking: (shp: AdminShipmentItem) => void;
  onOpenAssign: (shp: AdminShipmentItem) => void;
  onOpenUpdateStatus: (shp: AdminShipmentItem) => void;
  onOpenPackingSlip: (orderId: string) => void;
  onOpenInvoice: (orderId: string) => void;
}

export const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  shipment,
  isOpen,
  onClose,
  onOpenTracking,
  onOpenAssign,
  onOpenUpdateStatus,
  onOpenPackingSlip,
  onOpenInvoice,
}) => {
  const [detail, setDetail] = useState<AdminShipmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!isOpen || !shipment) {
      setDetail(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    AdminShippingService.getShipmentById(shipment.id)
      .then((res) => {
        if (isMounted && res?.data) {
          setDetail(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            AdminShippingService.extractErrorMessage(
              err,
              "Could not load full shipment details."
            )
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, shipment]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadInvoice = async () => {
    if (!shipment) return;
    const orderId = shipment.orderId || shipment.id;
    try {
      setDownloadingPdf(true);
      await AdminShippingService.downloadInvoicePdf(orderId, shipment.orderNumber);
    } catch {
      // Fallback to opening printable invoice modal
      onOpenInvoice(orderId);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!isOpen || !shipment) return null;

  const currentShipmentNumber =
    detail?.shipmentNumber || shipment.shipmentNumber || `SHIP-${shipment.orderNumber}`;
  const orderId = shipment.orderId || shipment.id;
  const courier = detail?.courierPartner || shipment.courierPartner;
  const awb = detail?.awbNumber || shipment.awbNumber;
  const trackingUrl =
    detail?.trackingUrl ||
    shipment.trackingUrl ||
    (awb ? `https://www.delhivery.com/track/package/${awb}` : "");

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="clay-modal relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto animate-scale-in z-10 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-fraunces text-base sm:text-lg font-bold text-slate-900 truncate">
                  {currentShipmentNumber}
                </h3>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(
                    detail?.status || shipment.status
                  )}`}
                >
                  {(detail?.status || shipment.status).replace(/_/g, " ")}
                </span>
                {(detail?.isRTO || shipment.isRTO) && (
                  <span className="px-2 py-0.5 text-[9.5px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200 uppercase font-mono">
                    RTO Return
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Order: <span className="font-bold text-slate-700">{shipment.orderNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href={`/admin/dashboard/shipments/${orderId}`}
              className="hidden sm:inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 text-xs font-bold transition"
            >
              <span>Full Page</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs text-slate-700">
          {/* Quick Action Buttons Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={downloadingPdf}
              className="h-10 px-3 rounded-xl border border-slate-200/90 bg-[#F8F5F1] hover:bg-white text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {downloadingPdf ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-600" />
              ) : (
                <Download className="h-3.5 w-3.5 text-orange-600" />
              )}
              <span>Invoice PDF</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPackingSlip(orderId)}
              className="h-10 px-3 rounded-xl border border-slate-200/90 bg-[#F8F5F1] hover:bg-white text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-indigo-600" />
              <span>Packing Slip</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenTracking(shipment)}
              className="h-10 px-3 rounded-xl border border-slate-200/90 bg-[#F8F5F1] hover:bg-white text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Truck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Live Scans</span>
            </button>

            {trackingUrl ? (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <ExternalLink className="h-3.5 w-3.5 text-orange-700" />
                <span>Delhivery Portal</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAssign(shipment)}
                className="h-10 px-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <PackageCheck className="h-3.5 w-3.5 text-indigo-700" />
                <span>Assign Courier</span>
              </button>
            )}
          </div>

          {/* Courier & AWB Logistics Information */}
          <div className="clay-card p-4 rounded-2xl bg-[#FAF8F5] border border-orange-100 space-y-3">
            <div className="flex items-center justify-between border-b border-orange-100/80 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow">
                Logistics & Dispatch Routing
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onOpenAssign(shipment)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  {awb ? "Change Courier" : "Assign Courier"}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => onOpenUpdateStatus(shipment)}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 underline cursor-pointer"
                >
                  Update Status
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10.5px] text-slate-400">Courier Partner</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {courier || "Pending Assignment"}
                </p>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Hub: {detail?.pickupLocation || "Kickat Central Warehouse, Mumbai"}
                </p>
              </div>

              <div>
                <p className="text-[10.5px] text-slate-400">AWB Tracking #</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {awb || "Pending generation"}
                  </span>
                  {awb && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(awb, "awb")}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title="Copy AWB"
                    >
                      {copiedField === "awb" ? (
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
                    <span>Track on Portal</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>

              <div>
                <p className="text-[10.5px] text-slate-400">Estimated Delivery</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {detail?.estimatedDelivery || shipment.estimatedDelivery
                    ? new Date(detail?.estimatedDelivery || shipment.estimatedDelivery!).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )
                    : "Standard 3-5 Business Days"}
                </p>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Created: {new Date(shipment.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Customer Details */}
            <div className="clay-card p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase font-mono-eyebrow">
                <User className="h-3.5 w-3.5" />
                <span>Customer Information</span>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  {detail?.customer.name || shipment.customer.name}
                </p>
                {(detail?.customer.email || shipment.customer.email) && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${detail?.customer.email || shipment.customer.email}`}
                      className="hover:underline text-slate-700"
                    >
                      {detail?.customer.email || shipment.customer.email}
                    </a>
                  </div>
                )}
                {(detail?.customer.phone || shipment.customer.phone) && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="font-mono">
                      {detail?.customer.phone || shipment.customer.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          detail?.customer.phone || shipment.customer.phone || "",
                          "phone"
                        )
                      }
                      className="text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      {copiedField === "phone" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Destination Address */}
            <div className="clay-card p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase font-mono-eyebrow">
                <MapPin className="h-3.5 w-3.5" />
                <span>Destination Address</span>
              </div>
              <p className="font-medium text-slate-800 leading-relaxed">
                {detail?.destination.fullAddress ||
                  shipment.destination?.fullAddress ||
                  `${shipment.customer.city || "Mumbai"} - ${shipment.customer.pincode || ""}`}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
                <span>City: {detail?.destination.city || shipment.destination?.city || shipment.customer.city || "—"}</span>
                <span>•</span>
                <span>Pincode: {detail?.destination.pincode || shipment.destination?.pincode || shipment.customer.pincode || "—"}</span>
              </div>
            </div>
          </div>

          {/* Package Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow">
                Package Contents ({detail?.items?.length || shipment.itemsCount} items)
              </span>
              {detail?.grandTotal && (
                <span className="font-mono text-xs font-bold text-slate-800">
                  Total Value: ₹{detail.grandTotal.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-orange-500" />
                <p className="mt-2 text-xs">Loading item specifics...</p>
              </div>
            ) : detail?.items && detail.items.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAF7F3] text-slate-400 text-[10px] font-mono-eyebrow uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Variant / SKU</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {item.productName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {item.variantName || "Standard"}
                          {item.sku && (
                            <span className="block text-[10px] font-mono text-slate-400">
                              SKU: {item.sku}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                          ₹{item.price.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                          ₹{(item.totalPrice || item.price * item.quantity).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed">
                <p className="font-bold text-slate-800">
                  {shipment.itemsSummary || "Fulfillment shipment package"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Count: {shipment.itemsCount} package units enclosed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#FAF7F2] border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <Link
            href={`/admin/dashboard/shipments/${orderId}`}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
          >
            <span>View Complete Detail Page</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailModal;
