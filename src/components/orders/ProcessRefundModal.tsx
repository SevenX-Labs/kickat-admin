"use client";

import React, { useState } from "react";
import { X, DollarSign, RotateCcw, Loader2, AlertCircle, CheckCircle2, IndianRupee } from "lucide-react";
import { AdminRefundOrderDto } from "@/types/admin-order";
import { AdminOrderService } from "@/services/adminOrderService";

interface ProcessRefundModalProps {
  orderId: string;
  orderNumber: string;
  grandTotal: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (refundedData: any) => void;
}

const REFUND_REASONS = [
  "Order cancelled by customer",
  "Product out of stock / unfulfillable",
  "Customer returned goods / damaged item",
  "Defective or expired product delivered",
  "Delayed shipment cancellation",
  "Overpayment / Goodwill gesture",
  "Other",
];

const REFUND_METHODS = [
  { label: "Original Payment Method (Razorpay Gateway)", value: "ORIGINAL_PAYMENT" },
  { label: "Direct Bank Transfer / NEFT / IMPS", value: "BANK_TRANSFER" },
  { label: "Store Credit / Pet Parent Wallet", value: "STORE_CREDIT" },
  { label: "Cash / Manual Adjustment", value: "MANUAL_CASH" },
];

export const ProcessRefundModal: React.FC<ProcessRefundModalProps> = ({
  orderId,
  orderNumber,
  grandTotal,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [refundType, setRefundType] = useState<"FULL" | "PARTIAL">("FULL");
  const [amount, setAmount] = useState<number>(grandTotal);
  const [reason, setReason] = useState(REFUND_REASONS[0]);
  const [refundMethod, setRefundMethod] = useState("ORIGINAL_PAYMENT");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefundTypeChange = (type: "FULL" | "PARTIAL") => {
    setRefundType(type);
    if (type === "FULL") {
      setAmount(grandTotal);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid refund amount greater than 0");
      setLoading(false);
      return;
    }

    if (numericAmount > grandTotal) {
      setError(`Refund amount cannot exceed total order value (₹${grandTotal.toLocaleString("en-IN")})`);
      setLoading(false);
      return;
    }

    try {
      const payload: AdminRefundOrderDto = {
        amount: numericAmount,
        reason,
        refundMethod,
        notes: notes.trim() || undefined,
      };

      const res = await AdminOrderService.processRefund(orderId, payload);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setError(AdminOrderService.extractErrorMessage(err, "Failed to process refund"));
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
                Process Order Refund
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Order #{orderNumber} • Order Total: ₹{grandTotal.toLocaleString("en-IN")}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Refund Type Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Refund Scope</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRefundTypeChange("FULL")}
                className={`
                  p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2
                  ${refundType === "FULL"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-[#F8F5F1] text-slate-700 border-slate-200/80 hover:bg-slate-200/60"
                  }
                `}
              >
                <span>Full Refund</span>
                <span className="text-[11px] opacity-80">(₹{grandTotal.toLocaleString("en-IN")})</span>
              </button>
              <button
                type="button"
                onClick={() => handleRefundTypeChange("PARTIAL")}
                className={`
                  p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2
                  ${refundType === "PARTIAL"
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-[#F8F5F1] text-slate-700 border-slate-200/80 hover:bg-slate-200/60"
                  }
                `}
              >
                <span>Partial Refund</span>
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Refund Amount (₹) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={grandTotal}
                disabled={refundType === "FULL"}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-8 pr-3 text-xs font-extrabold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            {refundType === "PARTIAL" && (
              <p className="text-[10.5px] text-slate-400">
                Max allowed: ₹{grandTotal.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          {/* Refund Method */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Refund Method *</label>
            <select
              value={refundMethod}
              onChange={(e) => setRefundMethod(e.target.value)}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {REFUND_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Reason for Refund *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {REFUND_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Internal Reference / Gateway Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Razorpay auto-refund initiated; ARN ref pending"
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
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
              Dismiss
            </button>
            <button
              type="submit"
              disabled={loading}
              className="clay-btn-purple px-5 py-2.5 text-xs font-bold text-white flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Issue ₹{amount.toLocaleString("en-IN")} Refund</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessRefundModal;
