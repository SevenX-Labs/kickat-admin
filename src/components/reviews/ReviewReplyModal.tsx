"use client";

import React, { useState, useEffect } from "react";
import { X, MessageSquareQuote, Send, Star, Sparkles, Loader2 } from "lucide-react";
import { AdminReviewItem } from "@/types/admin-review";

interface ReviewReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: AdminReviewItem | null;
  onSubmit: (reviewId: string, replyText: string) => Promise<void>;
}

const TEMPLATES = [
  "Thank you for shopping with Kickat! We are thrilled to hear your pet loves it.",
  "Thank you for your valuable feedback! Our team is dedicated to providing only the best for your pet.",
  "We are truly sorry for the inconvenience caused. Our pet care support specialist has been notified and will reach out to make this right.",
];

export const ReviewReplyModal: React.FC<ReviewReplyModalProps> = ({
  isOpen,
  onClose,
  review,
  onSubmit,
}) => {
  const [reply, setReply] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && review) {
      setReply(review.adminReply || "");
      setError(null);
    }
  }, [isOpen, review]);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) {
      setError("Please type a response before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(review.id, reply.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to post reply. Please try again.");
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
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center">
              <MessageSquareQuote className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {review.adminReply ? "Edit Store Reply" : "Reply as Store Admin"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Visible publicly under customer review
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close reply modal"
            className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {/* Review Summary Card */}
          <div className="p-3 sm:p-3.5 bg-[#F8F5F1] rounded-2xl border border-slate-200/60 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {review.user?.name || review.userName || "Customer"}
                </p>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  Product: {review.product?.name || review.productName || "Product"}
                </p>
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-700 italic line-clamp-3 bg-white/70 p-2 rounded-xl border border-slate-200/40">
              &ldquo;{review.comment}&rdquo;
            </p>
          </div>

          {/* Quick Suggestions */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <label className="text-[10.5px] font-bold text-slate-500 uppercase font-mono-eyebrow tracking-wider">
                Quick Response Templates
              </label>
            </div>
            <div className="space-y-1.5">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReply(tmpl)}
                  className="w-full text-left p-2.5 min-h-[40px] rounded-xl text-xs sm:text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-orange-50/70 hover:text-orange-900 border border-slate-200/60 transition active:scale-[0.99] cursor-pointer flex items-center"
                >
                  &ldquo;{tmpl}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Response Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider">
                Your Official Response
              </label>
              <span className={`text-[11px] font-mono font-medium ${reply.length > 800 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                {reply.length}/1000
              </span>
            </div>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value.slice(0, 1000))}
              placeholder="Write a courteous and helpful store response to this pet parent..."
              rows={4}
              className="w-full rounded-xl bg-[#FDFCFB] border border-slate-200 p-3 text-base sm:text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none"
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
              disabled={isSubmitting || !reply.trim()}
              className="clay-btn-orange h-11 min-h-[44px] px-5 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Posting Reply...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>{review.adminReply ? "Update Reply" : "Post Official Reply"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewReplyModal;
