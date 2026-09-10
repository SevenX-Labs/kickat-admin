"use client";

import React, { useState } from "react";
import { X, AlertTriangle, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { AdminCancelOrderDto } from "@/types/admin-order";
import { AdminOrderService } from "@/services/adminOrderService";

interface CancelOrderModalProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (cancelledData: any) => void;
}

const CANCEL_REASONS = [
  "Customer requested cancellation before dispatch",
  "Item out of stock / inventory discrepancy",
  "Customer placed duplicate order",
  "Fraudulent or suspicious activity suspected",
  "Incorrect delivery address / customer unreachable",
  "Payment verification failed",
  "Other",
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  orderId,
  orderNumber,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [reasonOther, setReasonOther] = useState("");
  const [restockItems, setRestockItems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: AdminCancelOrderDto = {
        reason,
        reasonOther: reasonOther.trim() || undefined,
        restockItems,
      };

      const res = await AdminOrderService.cancelOrder(orderId, payload);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(AdminOrderService.extractErrorMessage(err, "Failed to cancel order"));
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
                Cancel Order
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

        {/* Warning Banner */}
        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Important Notice:</span> Cancelling this order will permanently stop fulfillment. If the customer has already paid, you can process a full or partial refund subsequently.
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Cancellation Reason *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Detailed Reason / Internal Notes</label>
            <textarea
              rows={2}
              value={reasonOther}
              onChange={(e) => setReasonOther(e.target.value)}
              placeholder="e.g. Customer requested cancel via WhatsApp support; mistaken flavor chosen"
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
            />
          </div>

          {/* Restock Inventory Toggle */}
          <div className="clay-inset p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                <span>Restock Inventory</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Automatically increment stock counts for ordered products and variant SKUs back into database inventory.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={restockItems}
                onChange={(e) => setRestockItems(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="clay-button px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;
