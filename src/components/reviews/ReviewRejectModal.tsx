"use client";

import React, { useState, useEffect } from "react";
import { X, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { AdminReviewItem } from "@/types/admin-review";

interface ReviewRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: AdminReviewItem | null;
  onConfirmReject: (reviewId: string, reason: string) => Promise<void>;
}

const COMMON_REASONS = [
  "Inappropriate language or profanity",
  "Spam, advertising, or promotional link",
  "Courier delay / shipping feedback (not product quality)",
  "Irrelevant or incorrect product mentioned",
  "Unverified or fraudulent claim",
];

export const ReviewRejectModal: React.FC<ReviewRejectModalProps> = ({
  isOpen,
  onClose,
  review,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && review) {
      setReason(review.rejectionReason || "");
      setError(null);
    }
  }, [isOpen, review]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmReject(review.id, reason.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to reject review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between shrink-0 bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Reject Customer Review</h3>
              <p className="text-xs text-slate-500 font-medium">
                This will hide the review from the public storefront
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close rejection modal"
            className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {/* Warning banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              Rejecting will remove this review from the product page immediately. The user will not be notified, but an internal note will be saved.
            </p>
          </div>

          {/* Common Reasons */}
          <div>
            <label className="text-[10.5px] font-bold text-slate-600 uppercase font-mono-eyebrow tracking-wider block mb-2">
              Select Rejection Category
            </label>
            <div className="space-y-1.5">
              {COMMON_REASONS.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition border active:scale-[0.99] cursor-pointer ${
                    reason === r
                      ? "bg-rose-50 text-rose-800 border-rose-300 shadow-xs"
                      : "bg-[#F8F5F1] text-slate-700 hover:bg-slate-200/70 border-slate-200/70"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Note */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider">
              Internal Rejection Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context or explanation for why this review is being rejected..."
              rows={3}
              className="w-full rounded-xl bg-[#FDFCFB] border border-slate-200 p-3 text-base sm:text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 pb-2 sm:pb-0 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 min-h-[44px] px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 min-h-[44px] px-5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Confirm Rejection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewRejectModal;
