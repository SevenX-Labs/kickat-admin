"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Truck,
  Sparkles,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { AdminShipmentItem } from "@/types/admin-shipping";
import { AdminShippingService } from "@/services/adminShippingService";

interface AssignCourierModalProps {
  shipment: AdminShipmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COURIER_PRESETS = [
  "Delhivery",
  "Shiprocket",
  "Blue Dart",
  "Shadowfax",
  "Xpressbees",
  "DTDC",
  "India Post",
];

export const AssignCourierModal: React.FC<AssignCourierModalProps> = ({
  shipment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [courierPartner, setCourierPartner] = useState("Delhivery");
  const [awbNumber, setAwbNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [pickupLocation, setPickupLocation] = useState(
    "Mumbai Central Fulfillment Warehouse"
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && shipment) {
      setCourierPartner(shipment.courierPartner && shipment.courierPartner !== "Unassigned" ? shipment.courierPartner : "Delhivery");
      setAwbNumber(shipment.awbNumber || "");
      if (shipment.estimatedDelivery) {
        setEstimatedDelivery(
          new Date(shipment.estimatedDelivery).toISOString().slice(0, 10)
        );
      } else {
        // Default 3 days from now
        const defaultDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        setEstimatedDelivery(defaultDate.toISOString().slice(0, 10));
      }
      setPickupLocation("Mumbai Central Fulfillment Warehouse");
      setNotes("");
      setError(null);
    }
  }, [isOpen, shipment]);

  const handleAutoGenerateAwb = () => {
    const courierCode = courierPartner.slice(0, 3).toUpperCase();
    const rand = Math.floor(1000000000 + Math.random() * 9000000000);
    setAwbNumber(`${courierCode}-${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;

    if (!courierPartner.trim()) {
      setError("Please select or specify a courier partner.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await AdminShippingService.assignCourier(shipment.id, {
        courierPartner: courierPartner.trim(),
        awbNumber: awbNumber.trim() || undefined,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : undefined,
        pickupLocation: pickupLocation.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        AdminShippingService.extractErrorMessage(
          err,
          "Failed to assign courier. Please verify details and try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !shipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className="clay-modal relative w-full sm:max-w-md max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-up sm:animate-scale-in z-10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-courier-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-[#FAF7F2] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-xs">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="assign-courier-title"
                className="font-fraunces text-base font-bold text-slate-900"
              >
                Assign Courier & AWB
              </h3>
              <p className="text-xs font-mono text-slate-500">{shipment.orderNumber}</p>
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold">Courier Assignment Failed</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Courier Partner Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block">
              Courier Partner *
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COURIER_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCourierPartner(preset)}
                  className={`h-8 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer active:scale-95 ${
                    courierPartner === preset
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-[#F8F5F1] text-slate-700 hover:bg-slate-200/60 border border-slate-200/70"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={courierPartner}
              onChange={(e) => setCourierPartner(e.target.value)}
              placeholder="Or enter custom courier partner..."
              required
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition mt-1.5"
            />
          </div>

          {/* AWB Tracking Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider">
                AWB / Tracking Number
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateAwb}
                className="text-[10.5px] font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                <span>Auto-Generate</span>
              </button>
            </div>
            <input
              type="text"
              value={awbNumber}
              onChange={(e) => setAwbNumber(e.target.value)}
              placeholder="e.g. DLH-9928172641 (leave blank to auto-generate)"
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 text-xs font-medium text-slate-800 font-mono outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Estimated Delivery Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block">
              Estimated Delivery Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Pickup Location */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block">
              Pickup Warehouse Hub
            </label>
            <input
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Fulfillment hub address"
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block">
              Dispatch Instructions / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Fragile pet treats package, handle with care"
              rows={2}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 min-h-[44px] px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="clay-btn-orange flex-1 h-11 min-h-[44px] rounded-xl text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Assigning Courier...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Confirm Courier Assignment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignCourierModal;
