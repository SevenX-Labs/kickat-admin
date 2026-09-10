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
  Mail,
  UserCheck,
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
            Pending Moderation
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
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold text-sm">
              {review.user?.name ? review.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {review.user?.name || review.userName || "Customer Review"}
                </h3>
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Buyer
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                <span>{review.user?.email || "No email available"}</span>
                <span>•</span>
                <span>ID: {review.id.slice(0, 8)}...</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto no-scrollbar flex-1">
          {/* Spam Alert Banner */}
          {review.isSpam && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Flagged as spam — Hidden from customer storefront</span>
              </div>
              <button
                type="button"
                onClick={() => onToggleSpam(review)}
                disabled={isActionLoading}
                className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 rounded-lg transition cursor-pointer"
              >
                Unflag Spam
              </button>
            </div>
          )}

          {/* Product Attached */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#F8F5F1] border border-slate-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {review.product?.imageUrl ? (
                  <img
                    src={review.product.imageUrl}
                    alt={review.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow block">
                  Product Reviewed
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {review.product?.name || review.productName || "Product"}
                </p>
                {review.order && (
                  <p className="text-[11px] text-slate-500 font-medium">
                    Order #{review.order.orderNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
              <span className="text-xs font-black text-slate-800">{review.rating}</span>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </div>
          </div>

          {/* Review Title and Comment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-1.5">
                  {review.rating} out of 5 stars
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <ThumbsUp className="h-3.5 w-3.5 text-slate-400" />
                <span>{review.helpfulCount} helpful votes</span>
              </div>
            </div>

            {review.title && (
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {review.title}
              </h4>
            )}

            <div className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-slate-100 text-xs sm:text-[13px] leading-relaxed text-slate-700 font-normal whitespace-pre-wrap">
              {review.comment}
            </div>
          </div>

          {/* Photo attachments */}
          {review.photos && review.photos.length > 0 && (
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow block mb-2">
                Customer Photos ({review.photos.length})
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {review.photos.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="h-20 w-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:opacity-90 transition block"
                  >
                    <img src={url} alt="Review attachment" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Official Store Admin Reply Section */}
          {review.adminReply ? (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
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
            <div className="p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                No official response posted yet.
              </span>
              <button
                type="button"
                onClick={() => onOpenReply(review)}
                className="clay-btn-orange px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
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
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Submitted: {formatDate(review.createdAt)}
            </span>
            {review.updatedAt && (
              <span>Last updated: {formatDate(review.updatedAt)}</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-[#FAF7F2] border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleSpam(review)}
              disabled={isActionLoading}
              className={`h-11 min-h-[44px] px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                review.isSpam
                  ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{review.isSpam ? "Unflag Spam" : "Mark as Spam"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {review.status !== "APPROVED" && (
              <button
                type="button"
                onClick={() => onApprove(review)}
                disabled={isActionLoading}
                className="h-11 min-h-[44px] px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Approve Review</span>
              </button>
            )}

            {review.status !== "REJECTED" && (
              <button
                type="button"
                onClick={() => onOpenReject(review)}
                disabled={isActionLoading}
                className="h-11 min-h-[44px] px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenReply(review)}
              disabled={isActionLoading}
              className="clay-btn-orange h-11 min-h-[44px] px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
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
