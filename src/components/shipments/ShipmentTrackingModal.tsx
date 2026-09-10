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
} from "lucide-react";
import { AdminShipmentTrackingData } from "@/types/admin-shipping";
import { AdminShippingService } from "@/services/adminShippingService";

interface ShipmentTrackingModalProps {
  shipmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShipmentTrackingModal: React.FC<ShipmentTrackingModalProps> = ({
  shipmentId,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminShipmentTrackingData | null>(null);

  useEffect(() => {
    if (!isOpen || !shipmentId) {
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    AdminShippingService.getTracking(shipmentId)
      .then((res) => {
        if (isMounted) {
          if (res?.success && res.data) {
            setData(res.data);
          } else {
            setError("Failed to load tracking details.");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            AdminShippingService.extractErrorMessage(
              err,
              "Unable to fetch live tracking. Please try again."
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
  }, [isOpen, shipmentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
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
                  Live Shipment Tracking
                </h3>
              </div>
              <p className="text-xs font-mono text-slate-500">
                {data ? data.orderNumber : "Loading tracking..."}
              </p>
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="text-xs font-bold font-mono-eyebrow">Connecting to logistics API...</span>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Unable to fetch tracking</span>
              </div>
              <p className="text-xs text-rose-600">{error}</p>
            </div>
          )}

          {data && !loading && (
            <>
              {/* Courier & AWB Header Banner */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F5F1] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {data.courierPartner || "Unassigned Courier"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-orange-800">
                      {data.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-600 font-bold">
                    AWB: <span className="text-slate-900">{data.awbNumber || "Not Assigned"}</span>
                  </p>
                </div>

                {data.trackingUrl && (
                  <a
                    href={data.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn-orange inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl text-white font-bold text-xs shadow-xs transition hover:brightness-105 cursor-pointer shrink-0"
                  >
                    <span>Courier Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* Origin & Destination Route */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono-eyebrow text-[10px] font-bold uppercase tracking-wider">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>Origin Dispatch Hub</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {data.origin || "Kickat Central Warehouse, Mumbai"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono-eyebrow text-[10px] font-bold uppercase tracking-wider">
                    <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Destination</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    {data.destination || "Customer Delivery Address"}
                  </p>
                </div>
              </div>

              {/* Timeline Checkpoints */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow">
                  Checkpoint Milestone History
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(data.timeline && data.timeline.length > 0
                    ? data.timeline
                    : (data.checkpoints || []).map((cp) => ({
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
                        {/* Milestone bullet */}
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

                        {/* Details */}
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
                            <p className="text-[11px] text-slate-500 mt-1">
                              {checkpoint.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Delivery Footer Note */}
              {data.estimatedDelivery && (
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center gap-2 text-blue-900 text-xs">
                  <Calendar className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>
                    Estimated Delivery by:{" "}
                    <strong>
                      {new Date(data.estimatedDelivery).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </>
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
