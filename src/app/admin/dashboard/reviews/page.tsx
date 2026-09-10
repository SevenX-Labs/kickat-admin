"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  Search,
  Star,
  ShieldCheck,
  ShieldAlert,
  MessageSquareQuote,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  RotateCcw,
  Package,
  Eye,
  Loader2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  X,
} from "lucide-react";

import {
  AdminReviewItem,
  AdminReviewsSummary,
  AdminReviewsPagination,
  ReviewStatus,
  AdminReviewSortEnum,
} from "@/types/admin-review";
import { AdminReviewService } from "@/services/adminReviewService";

import { ReviewFilterSheet } from "@/components/reviews/ReviewFilterSheet";
import { ReviewReplyModal } from "@/components/reviews/ReviewReplyModal";
import { ReviewRejectModal } from "@/components/reviews/ReviewRejectModal";
import { ReviewDetailModal } from "@/components/reviews/ReviewDetailModal";
import { ReviewRatingDropdown } from "@/components/reviews/ReviewRatingDropdown";
import { ReviewSortDropdown } from "@/components/reviews/ReviewSortDropdown";

export default function ReviewsPage() {
  // Data state
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [summary, setSummary] = useState<AdminReviewsSummary | null>(null);
  const [pagination, setPagination] = useState<AdminReviewsPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReviewStatus>("ALL");
  const [spamFilter, setSpamFilter] = useState<"ALL" | "SPAM" | "CLEAN">("ALL");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [sortOrder, setSortOrder] = useState<AdminReviewSortEnum>("createdAt_desc");
  const [page, setPage] = useState<number>(1);

  // Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [selectedReviewForDetail, setSelectedReviewForDetail] = useState<AdminReviewItem | null>(null);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<AdminReviewItem | null>(null);
  const [selectedReviewForReject, setSelectedReviewForReject] = useState<AdminReviewItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch reviews from live backend API
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params: any = {
        page,
        limit: 10,
        sort: sortOrder,
      };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (spamFilter === "SPAM") {
        params.isSpam = true;
      } else if (spamFilter === "CLEAN") {
        params.isSpam = false;
      }
      if (ratingFilter > 0) {
        params.rating = ratingFilter;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const response = await AdminReviewService.getReviews(params);

      if (response && response.success && response.data) {
        setReviews(response.data.reviews || []);
        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 1,
          }
        );
        if (response.data.summary) {
          setSummary(response.data.summary);
        }
      } else {
        setReviews([]);
      }
    } catch (err) {
      const msg = AdminReviewService.extractErrorMessage(
        err,
        "Unable to fetch customer reviews. Please check your network connection."
      );
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, spamFilter, ratingFilter, sortOrder, debouncedSearch]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Actions
  const handleApprove = async (review: AdminReviewItem) => {
    setActionLoadingId(review.id);
    try {
      await AdminReviewService.updateStatus(review.id, "APPROVED");
      setToastMessage({
        type: "success",
        text: `Review by ${review.user?.name || review.userName || "Customer"} approved!`,
      });
      // Refresh list
      await fetchReviews();
      if (selectedReviewForDetail?.id === review.id) {
        setSelectedReviewForDetail(null);
      }
    } catch (err) {
      const msg = AdminReviewService.extractErrorMessage(err, "Failed to approve review.");
      setToastMessage({ type: "error", text: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmReject = async (reviewId: string, reason: string) => {
    setActionLoadingId(reviewId);
    try {
      await AdminReviewService.updateStatus(reviewId, "REJECTED", reason || undefined);
      setToastMessage({
        type: "success",
        text: "Review has been rejected and hidden from storefront.",
      });
      await fetchReviews();
      if (selectedReviewForDetail?.id === reviewId) {
        setSelectedReviewForDetail(null);
      }
    } catch (err) {
      const msg = AdminReviewService.extractErrorMessage(err, "Failed to reject review.");
      setToastMessage({ type: "error", text: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePostReply = async (reviewId: string, replyText: string) => {
    setActionLoadingId(reviewId);
    try {
      await AdminReviewService.reply(reviewId, replyText);
      setToastMessage({
        type: "success",
        text: "Official store reply posted successfully!",
      });
      await fetchReviews();
      if (selectedReviewForDetail?.id === reviewId) {
        // Update detail review modal if currently open
        const updatedReview = await AdminReviewService.getReviewById(reviewId);
        if (updatedReview?.data) {
          setSelectedReviewForDetail(updatedReview.data);
        }
      }
    } catch (err) {
      const msg = AdminReviewService.extractErrorMessage(err, "Failed to post store reply.");
      setToastMessage({ type: "error", text: msg });
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSpam = async (review: AdminReviewItem) => {
    setActionLoadingId(review.id);
    const nextSpam = !review.isSpam;
    try {
      await AdminReviewService.toggleSpam(review.id, nextSpam);
      setToastMessage({
        type: "success",
        text: nextSpam
          ? "Review flagged as spam and hidden."
          : "Review unflagged from spam.",
      });
      await fetchReviews();
      if (selectedReviewForDetail?.id === review.id) {
        setSelectedReviewForDetail(null);
      }
    } catch (err) {
      const msg = AdminReviewService.extractErrorMessage(err, "Failed to update spam status.");
      setToastMessage({ type: "error", text: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Active filters count
  const activeFiltersCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (spamFilter !== "ALL" ? 1 : 0) +
    (ratingFilter !== 0 ? 1 : 0) +
    (sortOrder !== "createdAt_desc" ? 1 : 0);

  const handleClearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setSpamFilter("ALL");
    setRatingFilter(0);
    setSortOrder("createdAt_desc");
    setPage(1);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-12 w-full min-w-0 no-scrollbar">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-5 right-4 sm:right-6 z-50 max-w-sm rounded-2xl p-4 shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom duration-250 ${
            toastMessage.type === "success"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-rose-900 text-white border-rose-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-300 shrink-0" />
          )}
          <p className="text-xs font-semibold leading-snug flex-1">
            {toastMessage.text}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Customer Reviews & Moderation
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Moderate pet parent feedback, star ratings, official store replies, and spam queue.
          </p>
        </div>

        {/* Global Store Rating Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="clay-badge-amber px-3.5 py-1.5 text-xs font-black text-white flex items-center gap-1.5 shadow-sm">
            <span>{summary?.averageRating ? summary.averageRating.toFixed(1) : "4.8"}</span>
            <Star className="h-3.5 w-3.5 fill-white" />
            <span className="text-[10px] font-bold text-amber-100">
              ({summary?.totalReviews ?? 0} reviews)
            </span>
          </span>
        </div>
      </div>

      {/* 5 KPI Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5 w-full min-w-0">
        {/* Card 1: All Reviews */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("ALL");
            setSpamFilter("ALL");
            setPage(1);
          }}
          className={`clay-card p-3.5 sm:p-4 min-w-0 text-left transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "ALL" && spamFilter === "ALL"
              ? "ring-2 ring-slate-800 bg-white"
              : "hover:bg-[#FAF7F2]"
          }`}
        >
          <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">
            All Reviews
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">
            {summary?.totalReviews ?? 0}
          </p>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5 truncate">
            Total feedback logged
          </p>
        </button>

        {/* Card 2: Pending Moderation */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("PENDING");
            setSpamFilter("ALL");
            setPage(1);
          }}
          className={`clay-card p-3.5 sm:p-4 min-w-0 text-left transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "PENDING"
              ? "ring-2 ring-amber-500 bg-amber-50/40"
              : "hover:bg-amber-50/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-amber-700 font-mono-eyebrow truncate block">
              Pending
            </span>
            {(summary?.pendingCount ?? 0) > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {summary?.pendingCount ?? 0}
          </p>
          <p className="text-[10px] font-semibold text-amber-700 mt-0.5 truncate">
            Requires approval
          </p>
        </button>

        {/* Card 3: Approved Reviews */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("APPROVED");
            setSpamFilter("CLEAN");
            setPage(1);
          }}
          className={`clay-card p-3.5 sm:p-4 min-w-0 text-left transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "APPROVED" && spamFilter !== "SPAM"
              ? "ring-2 ring-emerald-600 bg-emerald-50/40"
              : "hover:bg-emerald-50/20"
          }`}
        >
          <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 font-mono-eyebrow truncate block">
            Approved
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {summary?.approvedCount ?? 0}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5 truncate">
            Published on storefront
          </p>
        </button>

        {/* Card 4: Rejected */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("REJECTED");
            setSpamFilter("ALL");
            setPage(1);
          }}
          className={`clay-card p-3.5 sm:p-4 min-w-0 text-left transition active:scale-[0.98] cursor-pointer ${
            statusFilter === "REJECTED" && spamFilter !== "SPAM"
              ? "ring-2 ring-rose-600 bg-rose-50/40"
              : "hover:bg-rose-50/20"
          }`}
        >
          <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-rose-700 font-mono-eyebrow truncate block">
            Rejected
          </span>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            {summary?.rejectedCount ?? 0}
          </p>
          <p className="text-[10px] font-semibold text-rose-600 mt-0.5 truncate">
            Hidden from store
          </p>
        </button>

        {/* Card 5: Spam Queue */}
        <button
          type="button"
          onClick={() => {
            setSpamFilter("SPAM");
            setPage(1);
          }}
          className={`clay-card p-3.5 sm:p-4 min-w-0 text-left transition active:scale-[0.98] cursor-pointer col-span-2 lg:col-span-1 ${
            spamFilter === "SPAM"
              ? "ring-2 ring-purple-600 bg-purple-50/40"
              : "hover:bg-purple-50/20"
          }`}
        >
          <span className="text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-purple-700 font-mono-eyebrow truncate block">
            Spam Queue
          </span>
          <p className="text-xl sm:text-2xl font-black text-purple-700 mt-1">
            {summary?.spamCount ?? 0}
          </p>
          <p className="text-[10px] font-semibold text-purple-600 mt-0.5 truncate">
            Auto-blocked reviews
          </p>
        </button>
      </div>

      {/* Main Filter & Search Toolbar */}
      <div className="clay-card p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, product, or review text..."
              className="w-full h-11 min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Desktop/Tablet Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Rating Dropdown */}
            <ReviewRatingDropdown
              value={ratingFilter}
              onChange={(val) => {
                setRatingFilter(val);
                setPage(1);
              }}
            />

            {/* Sort Dropdown */}
            <ReviewSortDropdown
              value={sortOrder}
              onChange={(val) => {
                setSortOrder(val);
                setPage(1);
              }}
            />

            {/* Mobile / Full Filter Sheet Button */}
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className={`h-11 min-h-[44px] px-3.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                activeFiltersCount > 0
                  ? "bg-orange-50 text-[#FF7A00] border-orange-300"
                  : "bg-white text-slate-700 hover:bg-[#FAF7F2] border-slate-200/80"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="h-5 w-5 rounded-full bg-[#FF7A00] text-white text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Reset all filters if active */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                title="Reset all filters"
                className="h-11 min-h-[44px] px-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-orange-600 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Moderation Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
          {[
            { label: "All Reviews", val: "ALL" as const, count: summary?.totalReviews },
            { label: "Pending", val: "PENDING" as const, count: summary?.pendingCount },
            { label: "Approved", val: "APPROVED" as const, count: summary?.approvedCount },
            { label: "Rejected", val: "REJECTED" as const, count: summary?.rejectedCount },
          ].map((tab) => {
            const isSelected = statusFilter === tab.val && spamFilter !== "SPAM";
            return (
              <button
                key={tab.val}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.val);
                  setSpamFilter("ALL");
                  setPage(1);
                }}
                className={`
                  min-h-[38px] px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5
                  ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-[#F8F5F1] text-slate-600 hover:bg-slate-200/70 border border-slate-200/50"
                  }
                `}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Spam tab pill */}
          <button
            type="button"
            onClick={() => {
              setSpamFilter(spamFilter === "SPAM" ? "ALL" : "SPAM");
              setPage(1);
            }}
            className={`
              min-h-[38px] px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5
              ${
                spamFilter === "SPAM"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
              }
            `}
          >
            <ShieldAlert className="h-3 w-3" />
            <span>Spam Queue</span>
            {summary?.spamCount !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  spamFilter === "SPAM"
                    ? "bg-white/20 text-white"
                    : "bg-rose-200 text-rose-800"
                }`}
              >
                {summary.spamCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Failed to load customer reviews</p>
              <p className="text-[11.5px] mt-0.5 text-rose-700">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchReviews}
            className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 w-full min-w-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="clay-card p-4 sm:p-5 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-slate-200 rounded" />
                    <div className="h-2.5 w-20 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
              <div className="h-12 w-full bg-slate-100 rounded-xl" />
              <div className="h-16 w-full bg-slate-100 rounded-2xl" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-8 w-24 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && reviews.length === 0 && (
        <div className="clay-card p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="h-14 w-14 rounded-3xl bg-orange-100 text-[#FF7A00] flex items-center justify-center">
            <Star className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No customer reviews found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {activeFiltersCount > 0 || search
              ? "No reviews match your active filters. Try clearing filters or searching for different terms."
              : "No customer reviews have been submitted yet. Once customers review purchased products, they will appear here for moderation."}
          </p>
          {(activeFiltersCount > 0 || search) && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="clay-btn-orange min-h-[44px] px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Reviews Cards Grid */}
      {!isLoading && !errorMessage && reviews.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
          {reviews.map((rev) => {
            const isProcessingThis = actionLoadingId === rev.id;

            return (
              <div
                key={rev.id}
                className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-3.5 relative overflow-hidden transition hover:shadow-md"
              >
                <div>
                  {/* Top Customer Info & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar initial */}
                      <div className="h-9 w-9 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold text-xs shrink-0">
                        {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {rev.user?.name || rev.userName || "Customer"}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          {rev.user?.email || formatDate(rev.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Star rating display */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < rev.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Status pill */}
                      <div className="mt-1">
                        {rev.isSpam ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <ShieldAlert className="h-2.5 w-2.5" />
                            Spam
                          </span>
                        ) : rev.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                            Approved
                          </span>
                        ) : rev.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="h-2.5 w-2.5 stroke-[2.5]" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="h-2.5 w-2.5" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attached Product Box */}
                  <div className="mt-2.5 p-2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {rev.product?.imageUrl ? (
                          <img
                            src={rev.product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {rev.product?.name || rev.productName || "Product"}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>

                  {/* Review Title if present */}
                  {rev.title && (
                    <p className="text-xs font-bold text-slate-900 mt-2.5 line-clamp-1">
                      {rev.title}
                    </p>
                  )}

                  {/* Review Comment Box */}
                  <div className="text-xs text-slate-700 mt-2 leading-relaxed bg-[#FAF7F3] p-3 rounded-2xl border border-slate-100 font-normal">
                    &ldquo;{rev.comment}&rdquo;
                  </div>

                  {/* Photos attachments if any */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                      {rev.photos.map((photoUrl, idx) => (
                        <a
                          key={idx}
                          href={photoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-11 w-11 rounded-lg overflow-hidden border border-slate-200 shrink-0 block"
                        >
                          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Official Store Admin Reply Bubble */}
                  {rev.adminReply && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-orange-950 flex items-center gap-1">
                          <MessageSquareQuote className="h-3 w-3 text-[#FF7A00]" />
                          Official Store Reply:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedReviewForReply(rev)}
                          className="text-[10px] font-bold text-[#FF7A00] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-[11px] text-orange-900 leading-snug font-normal">
                        &ldquo;{rev.adminReply}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Rejection Note */}
                  {rev.status === "REJECTED" && rev.rejectionReason && (
                    <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                      <span className="font-bold">Rejection note:</span> {rev.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Bottom Card Controls & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                  {/* Left: View Details button */}
                  <button
                    type="button"
                    onClick={() => setSelectedReviewForDetail(rev)}
                    className="min-h-[40px] px-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Details</span>
                  </button>

                  {/* Right: Moderation Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Approve button */}
                    {rev.status !== "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(rev)}
                        disabled={isProcessingThis}
                        className="clay-button min-h-[40px] px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessingThis ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        )}
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Reject button */}
                    {rev.status !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => setSelectedReviewForReject(rev)}
                        disabled={isProcessingThis}
                        className="clay-button min-h-[40px] px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <X className="h-3 w-3 stroke-[2.5]" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Reply button */}
                    <button
                      type="button"
                      onClick={() => setSelectedReviewForReply(rev)}
                      disabled={isProcessingThis}
                      className="clay-button min-h-[40px] px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <MessageSquareQuote className="h-3 w-3 text-orange-500" />
                      <span>{rev.adminReply ? "Edit Reply" : "Reply"}</span>
                    </button>

                    {/* Spam Flag button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSpam(rev)}
                      disabled={isProcessingThis}
                      title={rev.isSpam ? "Unflag spam" : "Flag as spam"}
                      className={`min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center transition cursor-pointer disabled:opacity-50 ${
                        rev.isSpam
                          ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !errorMessage && pagination.totalPages > 1 && (
        <div className="clay-card p-3 sm:p-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Page <span className="font-bold text-slate-800">{pagination.page}</span> of{" "}
            <span className="font-bold text-slate-800">{pagination.totalPages}</span>{" "}
            ({pagination.total} total)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReviewFilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        status={statusFilter}
        onStatusChange={(st) => setStatusFilter(st)}
        isSpamFilter={spamFilter}
        onSpamFilterChange={(val) => setSpamFilter(val)}
        rating={ratingFilter}
        onRatingChange={(r) => setRatingFilter(r)}
        sort={sortOrder}
        onSortChange={(so) => setSortOrder(so)}
        onApply={() => setPage(1)}
        onClearAll={handleClearAllFilters}
        activeCount={activeFiltersCount}
      />

      <ReviewReplyModal
        isOpen={Boolean(selectedReviewForReply)}
        onClose={() => setSelectedReviewForReply(null)}
        review={selectedReviewForReply}
        onSubmit={handlePostReply}
      />

      <ReviewRejectModal
        isOpen={Boolean(selectedReviewForReject)}
        onClose={() => setSelectedReviewForReject(null)}
        review={selectedReviewForReject}
        onConfirmReject={handleConfirmReject}
      />

      <ReviewDetailModal
        isOpen={Boolean(selectedReviewForDetail)}
        onClose={() => setSelectedReviewForDetail(null)}
        review={selectedReviewForDetail}
        onApprove={handleApprove}
        onOpenReject={(r) => {
          setSelectedReviewForDetail(null);
          setSelectedReviewForReject(r);
        }}
        onOpenReply={(r) => {
          setSelectedReviewForReply(r);
        }}
        onToggleSpam={handleToggleSpam}
        isActionLoading={Boolean(actionLoadingId)}
      />
    </div>
  );
}
