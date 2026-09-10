"use client";

import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, Check, RotateCcw, Star, ShieldAlert } from "lucide-react";
import { ReviewStatus, AdminReviewSortEnum } from "@/types/admin-review";

interface ReviewFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  status: "ALL" | ReviewStatus;
  onStatusChange: (st: "ALL" | ReviewStatus) => void;
  isSpamFilter: "ALL" | "SPAM" | "CLEAN";
  onSpamFilterChange: (val: "ALL" | "SPAM" | "CLEAN") => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  sort: AdminReviewSortEnum;
  onSortChange: (sort: AdminReviewSortEnum) => void;
  onApply: () => void;
  onClearAll: () => void;
  activeCount: number;
}

const STATUS_OPTIONS: { label: string; value: "ALL" | ReviewStatus; color?: string }[] = [
  { label: "All Reviews", value: "ALL" },
  { label: "Pending Moderation", value: "PENDING", color: "text-amber-700 bg-amber-50" },
  { label: "Approved (Public)", value: "APPROVED", color: "text-emerald-700 bg-emerald-50" },
  { label: "Rejected", value: "REJECTED", color: "text-rose-700 bg-rose-50" },
];

const SPAM_OPTIONS: { label: string; value: "ALL" | "SPAM" | "CLEAN" }[] = [
  { label: "All Reviews", value: "ALL" },
  { label: "Spam Queue Only", value: "SPAM" },
  { label: "Clean (Non-Spam)", value: "CLEAN" },
];

const RATING_OPTIONS: { label: string; value: number; stars?: number }[] = [
  { label: "All Star Ratings", value: 0 },
  { label: "5 Stars Only", value: 5, stars: 5 },
  { label: "4 Stars", value: 4, stars: 4 },
  { label: "3 Stars", value: 3, stars: 3 },
  { label: "2 Stars", value: 2, stars: 2 },
  { label: "1 Star", value: 1, stars: 1 },
];

const SORT_OPTIONS: { label: string; value: AdminReviewSortEnum }[] = [
  { label: "Newest First", value: "createdAt_desc" },
  { label: "Oldest First", value: "createdAt_asc" },
  { label: "Highest Stars", value: "rating_desc" },
  { label: "Lowest Stars", value: "rating_asc" },
  { label: "Most Helpful Upvotes", value: "helpfulCount_desc" },
];

export const ReviewFilterSheet: React.FC<ReviewFilterSheetProps> = ({
  isOpen,
  onClose,
  status,
  onStatusChange,
  isSpamFilter,
  onSpamFilterChange,
  rating,
  onRatingChange,
  sort,
  onSortChange,
  onApply,
  onClearAll,
}) => {
  const [localStatus, setLocalStatus] = useState<"ALL" | ReviewStatus>(status);
  const [localSpam, setLocalSpam] = useState<"ALL" | "SPAM" | "CLEAN">(isSpamFilter);
  const [localRating, setLocalRating] = useState<number>(rating);
  const [localSort, setLocalSort] = useState<AdminReviewSortEnum>(sort);

  // Sync state whenever opened
  useEffect(() => {
    if (isOpen) {
      setLocalStatus(status);
      setLocalSpam(isSpamFilter);
      setLocalRating(rating);
      setLocalSort(sort);
    }
  }, [isOpen, status, isSpamFilter, rating, sort]);

  if (!isOpen) return null;

  const currentActiveCount =
    (localStatus !== "ALL" ? 1 : 0) +
    (localSpam !== "ALL" ? 1 : 0) +
    (localRating !== 0 ? 1 : 0) +
    (localSort !== "createdAt_desc" ? 1 : 0);

  const handleApply = () => {
    onStatusChange(localStatus);
    onSpamFilterChange(localSpam);
    onRatingChange(localRating);
    onSortChange(localSort);
    onApply();
    onClose();
  };

  const handleReset = () => {
    setLocalStatus("ALL");
    setLocalSpam("ALL");
    setLocalRating(0);
    setLocalSort("createdAt_desc");
    onClearAll();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-in slide-in-from-bottom duration-250">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-orange-100/80 text-[#FF7A00] flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Filter Reviews</h3>
              <p className="text-xs text-slate-500 font-medium">Refine by moderation status, rating, or spam</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="h-9 w-9 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto no-scrollbar flex-1">
          {/* Section 1: Moderation Status */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider">
                Moderation Status
              </label>
              {localStatus !== "ALL" && (
                <span className="text-[11px] font-bold text-[#FF7A00]">Active</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {STATUS_OPTIONS.map((st) => {
                const isSelected = localStatus === st.value;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setLocalStatus(st.value)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between text-left cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-[#FF7A00] text-white shadow-xs"
                        : "bg-[#F8F5F1] text-slate-700 hover:bg-slate-200/60 border border-slate-200/70"
                    }`}
                  >
                    <span className="truncate">{st.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Star Rating */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider">
                Star Rating
              </label>
              {localRating > 0 && (
                <span className="text-[11px] font-bold text-[#FF7A00] flex items-center gap-1">
                  <span>{localRating}</span>
                  <Star className="h-3 w-3 fill-[#FF7A00]" />
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {RATING_OPTIONS.map((rt) => {
                const isSelected = localRating === rt.value;
                return (
                  <button
                    key={rt.value}
                    type="button"
                    onClick={() => setLocalRating(rt.value)}
                    className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center text-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-[#F8F5F1] text-slate-700 hover:bg-slate-200/60 border border-slate-200/70"
                    }`}
                  >
                    {rt.stars ? (
                      <span className="flex items-center gap-1">
                        <span>{rt.stars}</span>
                        <Star className={`h-3.5 w-3.5 ${isSelected ? "fill-white text-white" : "fill-amber-400 text-amber-400"}`} />
                      </span>
                    ) : (
                      <span>All Stars</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Spam Flag Queue */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block mb-2">
              Spam Queue Filter
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              {SPAM_OPTIONS.map((sp) => {
                const isSelected = localSpam === sp.value;
                return (
                  <button
                    key={sp.value}
                    type="button"
                    onClick={() => setLocalSpam(sp.value)}
                    className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center text-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? sp.value === "SPAM"
                          ? "bg-slate-800 text-white shadow-xs"
                          : "bg-[#FF7A00] text-white shadow-xs"
                        : "bg-[#F8F5F1] text-slate-700 hover:bg-slate-200/60 border border-slate-200/70"
                    }`}
                  >
                    <span className="truncate">{sp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Sort Sequence */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider block mb-2">
              Sort Sequence
            </label>

            <div className="grid grid-cols-2 gap-1.5">
              {SORT_OPTIONS.map((so) => {
                const isSelected = localSort === so.value;
                return (
                  <button
                    key={so.value}
                    type="button"
                    onClick={() => setLocalSort(so.value)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between text-left cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-[#FF7A00] text-white shadow-xs"
                        : "bg-[#F8F5F1] text-slate-700 hover:bg-slate-200/60 border border-slate-200/70"
                    }`}
                  >
                    <span className="truncate">{so.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 pb-6 sm:pb-4 bg-[#FAF7F2] border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="h-11 min-h-[44px] px-3 text-xs font-bold text-slate-600 hover:text-orange-600 transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear All</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="clay-btn-orange flex-1 h-11 min-h-[44px] rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
            <span>Apply Filters {currentActiveCount > 0 ? `(${currentActiveCount})` : ""}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilterSheet;
