"use client";

import React from "react";
import {
  X,
  Star,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  ThumbsUp,
  MessageSquareQuote,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import { AdminReviewItem, ReviewStatus } from "@/types/admin-review";

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: AdminReviewItem | null;
  onApprove: (review: AdminReviewItem) => void;
  onOpenReject: (review: AdminReviewItem) => void;
  onOpenReply: (review: AdminReviewItem) => void;
  onToggleSpam: (review: AdminReviewItem) => void;
  isActionLoading?: boolean;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  isOpen,
  onClose,
  review,
  onApprove,
  onOpenReject,
  onOpenReply,
  onToggleSpam,
  isActionLoading,
}) => {
  if (!isOpen || !review) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const statusBadge = (st: ReviewStatus) => {
    switch (st) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-250">
        {/* Header (375px responsive) */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-base font-bold text-slate-900 leading-tight truncate">
                  {review.user?.name || review.userName || "Customer Review"}
                </h3>
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] font-bold border border-emerald-200 shrink-0">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[10.5px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">
                {review.user?.email || "No email available"} • ID: {review.id.slice(0, 6)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {statusBadge(review.status)}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details modal"
              className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto no-scrollbar flex-1">
          {/* Spam Alert Banner */}
          {review.isSpam && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-slate-700 shrink-0" />
                <span>Flagged as spam — Hidden from customer storefront</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleSpam(review)}
                disabled={isActionLoading}
                className="self-start sm:self-auto px-3 py-1.5 min-h-[36px] text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer border border-slate-300"
              >
                Unflag Spam
              </button>
            </div>
          )}

          {/* Product Attached */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#F8F5F1] border border-slate-200/70 flex items-center justify-between gap-2.5 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {review.product?.imageUrl ? (
                  <img
                    src={review.product.imageUrl}
                    alt={review.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-5 w-5 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow block">
                  Product Reviewed
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {review.product?.name || review.productName || "Product"}
                </p>
                {review.order && (
                  <p className="text-[10.5px] text-slate-500 font-medium truncate">
                    Order #{review.order.orderNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-xl border border-slate-200">
              <span className="text-xs font-black text-slate-800">{review.rating}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            </div>
          </div>

          {/* Review Title and Comment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-1">
                  {review.rating}/5
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <ThumbsUp className="h-3 w-3 text-slate-400" />
                <span>{review.helpfulCount} helpful</span>
              </div>
            </div>

            {review.title && (
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {review.title}
              </h4>
            )}

            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF7F3] border border-slate-100 text-xs sm:text-[13px] leading-relaxed text-slate-700 font-normal whitespace-pre-wrap">
              {review.comment}
            </div>
          </div>

          {/* Photo attachments */}
          {review.photos && review.photos.length > 0 && (
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow block mb-1.5">
                Customer Photos ({review.photos.length})
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {review.photos.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90 transition block"
                  >
                    <img src={url} alt="Review attachment" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Official Store Admin Reply Section */}
          {review.adminReply ? (
            <div className="p-3 sm:p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                  <MessageSquareQuote className="h-4 w-4 text-[#FF7A00]" />
                  <span>Official Store Reply</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenReply(review)}
                  className="text-[11px] font-bold text-[#FF7A00] hover:underline cursor-pointer"
                >
                  Edit Reply
                </button>
              </div>
              <p className="text-xs text-orange-900 leading-relaxed font-normal">
                &ldquo;{review.adminReply}&rdquo;
              </p>
              {review.adminReplyAt && (
                <p className="text-[10px] text-orange-700/80 font-medium">
                  Replied on {formatDate(review.adminReplyAt)}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">
                No official response posted yet.
              </span>
              <button
                type="button"
                onClick={() => onOpenReply(review)}
                className="clay-btn-orange min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer shrink-0"
              >
                Add Reply
              </button>
            </div>
          )}

          {/* Rejection reason note if rejected */}
          {review.status === "REJECTED" && review.rejectionReason && (
            <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 space-y-1">
              <span className="font-bold text-rose-950 block">Rejection Note:</span>
              <p className="font-normal">{review.rejectionReason}</p>
            </div>
          )}

          {/* Review Timestamps */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[10.5px] sm:text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Submitted: {formatDate(review.createdAt)}
            </span>
            {review.updatedAt && (
              <span>Updated: {formatDate(review.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Footer Actions (Mobile Responsive 375px with safe-area bottom padding) */}
        <div className="p-3.5 sm:p-4 pb-6 sm:pb-4 bg-[#FAF7F2] border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onToggleSpam(review)}
              disabled={isActionLoading}
              className={`h-11 min-h-[44px] flex-1 sm:flex-initial px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 ${
                review.isSpam
                  ? "bg-slate-800 text-white hover:bg-slate-900 border-slate-800"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{review.isSpam ? "Unflag Spam" : "Mark as Spam"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {review.status !== "APPROVED" && (
              <button
                type="button"
                onClick={() => onApprove(review)}
                disabled={isActionLoading}
                className="h-11 min-h-[44px] flex-1 sm:flex-initial px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve</span>
              </button>
            )}

            {review.status !== "REJECTED" && (
              <button
                type="button"
                onClick={() => onOpenReject(review)}
                disabled={isActionLoading}
                className="h-11 min-h-[44px] flex-1 sm:flex-initial px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenReply(review)}
              disabled={isActionLoading}
              className="clay-btn-orange h-11 min-h-[44px] flex-1 sm:flex-initial px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <MessageSquareQuote className="h-3.5 w-3.5" />
              <span>{review.adminReply ? "Edit Reply" : "Reply"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal;
