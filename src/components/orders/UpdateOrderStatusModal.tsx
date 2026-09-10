"use client";

import React, { useState } from "react";
import { X, Truck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { OrderStatus, UpdateOrderStatusDto } from "@/types/admin-order";
import { AdminOrderService } from "@/services/adminOrderService";

interface UpdateOrderStatusModalProps {
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  currentCourier?: string | null;
  currentTracking?: string | null;
  currentEstimatedDelivery?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedData: any) => void;
}

const ORDER_STATUS_OPTIONS: { label: string; value: OrderStatus; desc: string }[] = [
  { label: "Placed", value: "PLACED", desc: "Customer placed the order; awaiting processing" },
  { label: "Processing", value: "PROCESSING", desc: "Order is verified and sent to warehouse picking" },
  { label: "Packed", value: "PACKED", desc: "Items packed in box with label attached" },
  { label: "Shipped", value: "SHIPPED", desc: "Handed over to courier logistics partner" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY", desc: "Package out with delivery agent" },
  { label: "Delivered", value: "DELIVERED", desc: "Successfully handed over to customer" },
  { label: "Pending", value: "PENDING", desc: "Order awaiting verification or payment confirmation" },
  { label: "Cancelled", value: "CANCELLED", desc: "Cancelled (prefer Cancel modal to restock items)" },
  { label: "Return Initiated", value: "RETURN_INITIATED", desc: "Customer requested return / exchange" },
  { label: "Returned", value: "RETURNED", desc: "Goods received back in warehouse" },
];

const COURIER_OPTIONS = [
  "Delhivery",
  "Shiprocket",
  "Blue Dart",
  "Xpressbees",
  "Shadowfax",
  "DTDC",
  "Ekart Logistics",
  "Ecom Express",
  "Internal Runner / Same-day",
  "Other",
];

export const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  orderId,
  orderNumber,
  currentStatus,
  currentCourier,
  currentTracking,
  currentEstimatedDelivery,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<OrderStatus>(currentStatus || "PROCESSING");
  const [courierPartner, setCourierPartner] = useState(currentCourier || "");
  const [trackingNumber, setTrackingNumber] = useState(currentTracking || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    currentEstimatedDelivery ? currentEstimatedDelivery.substring(0, 16) : ""
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: UpdateOrderStatusDto = {
        status,
        courierPartner: courierPartner.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : undefined,
        notes: notes.trim() || undefined,
      };

      const res = await AdminOrderService.updateStatus(orderId, payload);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(AdminOrderService.extractErrorMessage(err, "Failed to update order status"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="clay-modal w-full max-w-lg overflow-hidden bg-white p-6 sm:p-7 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
                Update Fulfillment Status
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Order #{orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Status */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Fulfillment Milestone *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Courier Logistics fields (highlighted especially for SHIPPED / OUT_FOR_DELIVERY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Courier Partner</label>
              <input
                type="text"
                list="courier-list"
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                placeholder="e.g. Delhivery, Shiprocket"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <datalist id="courier-list">
                {COURIER_OPTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Tracking / AWB Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DLH-9928172641"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 py-2.5 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Estimated Delivery Date & Time</label>
            <input
              type="datetime-local"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Internal Notes / Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Handed over to logistics hub, customer requested evening delivery"
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="clay-button px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="clay-btn-orange px-5 py-2.5 text-xs font-bold text-white flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
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

export default UpdateOrderStatusModal;
