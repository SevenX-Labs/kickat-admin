"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  RefreshCw,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { AdminShipmentItem, ShipmentStatus } from "@/types/admin-shipping";
import { AdminShippingService } from "@/services/adminShippingService";

interface UpdateShipmentStatusModalProps {
  shipment: AdminShipmentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_CHOICES: { value: ShipmentStatus; label: string; desc: string }[] = [
  { value: "PACKED", label: "Packed", desc: "Items packed and ready for pickup" },
  { value: "SHIPPED", label: "Shipped", desc: "Handed over to courier partner" },
  { value: "OUT_FOR_DELIVERY", label: "Out For Delivery", desc: "With local delivery driver" },
  { value: "DELIVERED", label: "Delivered", desc: "Successfully delivered to customer" },
  { value: "RETURN_INITIATED", label: "Return Initiated (RTO)", desc: "Customer requested return / RTO" },
  { value: "RETURNED", label: "Returned", desc: "Restocked at warehouse" },
];

export const UpdateShipmentStatusModal: React.FC<UpdateShipmentStatusModalProps> = ({
  shipment,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<ShipmentStatus>("SHIPPED");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && shipment) {
      setStatus(shipment.status);
      setLocation(shipment.destination?.city ? `${shipment.destination.city} Delivery Center` : "");
      setNotes("");
      setError(null);
    }
  }, [isOpen, shipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;

    try {
      setLoading(true);
      setError(null);

      await AdminShippingService.updateStatus(shipment.id, {
        status,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        AdminShippingService.extractErrorMessage(
          err,
          "Failed to update shipment status. Please try again."
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
        aria-labelledby="update-status-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-[#FAF7F2] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-xs">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="update-status-title"
                className="font-fraunces text-base font-bold text-slate-900"
              >
                Update Delivery Milestone
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
                <p className="font-bold">Status Update Failed</p>
                <p className="text-[11px] text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Milestone Selection Grid */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block">
              Delivery Milestone *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {STATUS_CHOICES.map((choice) => {
                const isSelected = status === choice.value;
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => setStatus(choice.value)}
                    className={`min-h-[44px] p-2.5 rounded-xl text-left transition border flex flex-col justify-between cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-orange-50 border-orange-300 text-orange-950 ring-1 ring-orange-200"
                        : "bg-[#F8F5F1] border-slate-200/70 text-slate-700 hover:bg-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">{choice.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-orange-600 stroke-[2.5]" />}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">{choice.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Location */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block">
              Checkpoint Location
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bandra Local Delivery Hub, Mumbai"
                className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block">
              Checkpoint Notes / Dispatch Log
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Driver assigned for delivery today"
              rows={2}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* Actions */}
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
                  <span>Updating Milestone...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Save Milestone</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateShipmentStatusModal;
