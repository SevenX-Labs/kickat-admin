"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PackageCheck,
  Building,
  Navigation,
  Info,
} from "lucide-react";
import { AdminShipmentItem, AdminShipmentTrackingData } from "@/types/admin-shipping";
import { AdminShippingService } from "@/services/adminShippingService";

interface ShipmentTrackingModalProps {
  shipment: AdminShipmentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShipmentTrackingModal: React.FC<ShipmentTrackingModalProps> = ({
  shipment,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminShipmentTrackingData | null>(null);
  const [isSynthesized, setIsSynthesized] = useState(false);

  useEffect(() => {
    if (!isOpen || !shipment) {
      setData(null);
      setIsSynthesized(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    AdminShippingService.getTracking(shipment.id)
      .then((res) => {
        if (isMounted) {
          if (res?.success && res.data && res.data.checkpoints?.length > 0) {
            setData(res.data);
            setIsSynthesized(false);
          } else {
            fallbackToSynthesized(shipment);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          fallbackToSynthesized(shipment);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, shipment]);

  const fallbackToSynthesized = (shp: AdminShipmentItem) => {
    setIsSynthesized(true);
    const baseCreated = new Date(shp.createdAt || Date.now()).getTime();

    const statusMilestones = [
      "PLACED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];
    const currentIndex = statusMilestones.indexOf(shp.status);

    const checkpoints = [
      {
        status: "ORDER_PLACED",
        location: "Kickat Online Platform",
        timestamp: shp.createdAt,
      },
      ...(currentIndex >= 2 || shp.status === "PACKED"
        ? [
            {
              status: "PACKED",
              location: "Kickat Central Warehouse, Mumbai",
              timestamp: new Date(baseCreated + 3600000).toISOString(),
            },
          ]
        : []),
      ...(currentIndex >= 3 || shp.status === "SHIPPED"
        ? [
            {
              status: "SHIPPED",
              location: "Mumbai Logistics Hub",
              timestamp: new Date(baseCreated + 14400000).toISOString(),
            },
          ]
        : []),
      ...(currentIndex >= 4 || shp.status === "OUT_FOR_DELIVERY"
        ? [
            {
              status: "OUT_FOR_DELIVERY",
              location: `${shp.destination?.city || shp.customer.city || "Local"} Delivery Hub`,
              timestamp: new Date(baseCreated + 86400000).toISOString(),
            },
          ]
        : []),
      ...(currentIndex >= 5 || shp.status === "DELIVERED"
        ? [
            {
              status: "DELIVERED",
              location: shp.destination?.city || shp.customer.city || "Customer Address",
              timestamp: new Date(baseCreated + 172800000).toISOString(),
            },
          ]
        : []),
    ];

    setData({
      id: shp.id,
      orderId: shp.orderId || shp.id,
      orderNumber: shp.orderNumber,
      courierPartner: shp.courierPartner || "Unassigned",
      awbNumber: shp.awbNumber || "Pending Assignment",
      status: shp.status,
      trackingUrl: shp.trackingUrl || "",
      origin: "Kickat Central Warehouse, Mumbai",
      destination: shp.destination?.fullAddress || `${shp.customer.city || "Destination"}, ${shp.customer.pincode || ""}`,
      estimatedDelivery: shp.estimatedDelivery || undefined,
      checkpoints,
      timeline: [
        {
          stage: "PLACED",
          title: "Order Placed",
          location: "Kickat Online Platform",
          timestamp: shp.createdAt,
          isCompleted: true,
          description: "Order verified and sent to warehouse.",
        },
        {
          stage: "PACKED",
          title: "Packed at Warehouse",
          location: "Kickat Central Warehouse, Mumbai",
          timestamp: new Date(baseCreated + 3600000).toISOString(),
          isCompleted: currentIndex >= 2 || shp.status === "PACKED",
          description: "Items picked, verified, and safely packed.",
        },
        {
          stage: "SHIPPED",
          title: "Handed Over to Courier",
          location: "Mumbai Logistics Hub",
          timestamp: new Date(baseCreated + 14400000).toISOString(),
          isCompleted: currentIndex >= 3 || shp.status === "SHIPPED",
          description: shp.courierPartner ? `Dispatched via ${shp.courierPartner}.` : "Package in transit.",
        },
        {
          stage: "OUT_FOR_DELIVERY",
          title: "Out For Delivery",
          location: `${shp.destination?.city || shp.customer.city || "Destination"} Local Hub`,
          timestamp: new Date(baseCreated + 86400000).toISOString(),
          isCompleted: currentIndex >= 4 || shp.status === "OUT_FOR_DELIVERY",
          description: "Delivery executive out for final delivery.",
        },
        {
          stage: "DELIVERED",
          title: "Delivered to Recipient",
          location: shp.destination?.city || shp.customer.city || "Customer Address",
          timestamp: new Date(baseCreated + 172800000).toISOString(),
          isCompleted: currentIndex >= 5 || shp.status === "DELIVERED",
          description: "Package safely delivered to customer.",
        },
      ],
    });
  };

  if (!isOpen || !shipment) return null;

  const currentData = data || {
    orderNumber: shipment.orderNumber,
    courierPartner: shipment.courierPartner || "Unassigned",
    awbNumber: shipment.awbNumber || "Pending Assignment",
    status: shipment.status,
    origin: "Kickat Central Warehouse, Mumbai",
    destination: shipment.destination?.city || shipment.customer.city || "Customer Address",
    trackingUrl: shipment.trackingUrl || "",
    checkpoints: [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="clay-modal relative w-full sm:max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-up sm:animate-scale-in z-10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracking-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-[#FAF7F2] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="tracking-modal-title"
                  className="font-fraunces text-base font-bold text-slate-900"
                >
                  Shipment Tracking
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                  {currentData.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500">{currentData.orderNumber}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {isSynthesized && (
            <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200/80 text-blue-900 flex items-center gap-2 text-[11px] font-medium">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Milestone tracking based on order state. Live carrier API will sync once webhook is attached.</span>
            </div>
          )}

          {/* Courier & AWB Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F5F1] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {currentData.courierPartner || "Unassigned"}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-600 font-bold">
                AWB:{" "}
                <span className="text-slate-900">
                  {currentData.awbNumber && currentData.awbNumber !== "Pending Assignment" ? currentData.awbNumber : "Pending AWB"}
                </span>
              </p>
            </div>

            {currentData.trackingUrl && (
              <a
                href={currentData.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="clay-btn-orange inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-white font-bold text-xs shadow-xs transition hover:brightness-105 cursor-pointer shrink-0"
              >
                <span>Carrier Portal</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono-eyebrow text-[10px] font-bold uppercase tracking-wider">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>Origin Hub</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {currentData.origin || "Kickat Central Warehouse, Mumbai"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono-eyebrow text-[10px] font-bold uppercase tracking-wider">
                <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                <span>Destination</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {currentData.destination || "Customer Address"}
              </p>
            </div>
          </div>

          {/* Checkpoint Timeline */}
          <div className="space-y-3 pt-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow">
              Fulfillment Milestones
            </h4>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="text-xs font-mono font-medium">Checking live status...</span>
              </div>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(data?.timeline && data.timeline.length > 0
                  ? data.timeline
                  : (data?.checkpoints || []).map((cp) => ({
                      stage: cp.status,
                      title: cp.status.replace(/_/g, " "),
                      location: cp.location,
                      timestamp: cp.timestamp,
                      isCompleted: true,
                      description: "",
                    }))
                ).map((checkpoint, idx) => {
                  const isDone = checkpoint.isCompleted;
                  return (
                    <div key={idx} className="relative group">
                      <div
                        className={`absolute -left-6 top-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          isDone
                            ? "bg-emerald-500 border-white text-white shadow-xs"
                            : "bg-white border-slate-300 text-slate-400"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <span
                            className={`font-bold text-xs ${
                              isDone ? "text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {checkpoint.title || checkpoint.stage}
                          </span>
                          {checkpoint.timestamp && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(checkpoint.timestamp).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          )}
                        </div>

                        {checkpoint.location && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{checkpoint.location}</span>
                          </div>
                        )}

                        {checkpoint.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {checkpoint.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SLA banner */}
          {shipment.estimatedDelivery && (
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-2 text-blue-900 text-xs font-medium">
              <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
              <span>
                Expected delivery by:{" "}
                <strong>
                  {new Date(shipment.estimatedDelivery).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#FAF7F2] border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 min-h-[40px] px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentTrackingModal;
