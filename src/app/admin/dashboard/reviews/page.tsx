"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  ArrowUp,
  Check,
  X,
  ChevronDown,
  ChevronUp,
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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Expanded comment IDs state (mobile read more/less)
  const [expandedCommentIds, setExpandedCommentIds] = useState<Record<string, boolean>>({});

  // Scroll to top button state
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Scroll to top detector
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setShowScrollTop(window.scrollY > 280);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleExpandComment = (id: string) => {
    setExpandedCommentIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch reviews from live backend API
  const fetchReviews = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);
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
        setIsRefreshing(false);
      }
    },
    [page, statusFilter, spamFilter, ratingFilter, sortOrder, debouncedSearch]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Moderation Actions
  const handleApprove = async (review: AdminReviewItem) => {
    setActionLoadingId(review.id);
    try {
      await AdminReviewService.updateStatus(review.id, "APPROVED");
      setToastMessage({
        type: "success",
        text: `Review by ${review.user?.name || review.userName || "Customer"} approved!`,
      });
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
    <div className="space-y-3.5 sm:space-y-4 pb-14 w-full min-w-0 no-scrollbar">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed bottom-5 right-4 sm:right-6 z-50 max-w-sm rounded-2xl p-3 sm:p-3.5 shadow-2xl border flex items-center gap-2.5 animate-in slide-in-from-bottom duration-250 ${
            toastMessage.type === "success"
              ? "bg-[#1E2E20] text-emerald-100 border-emerald-700/60"
              : "bg-[#2E1E1E] text-rose-100 border-rose-700/60"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <p className="text-xs font-semibold leading-snug flex-1">
            {toastMessage.text}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white p-1 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Floating Scroll To Top Button for Mobile */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-5 left-4 sm:left-6 z-40 h-10 w-10 rounded-2xl bg-white/95 text-slate-700 shadow-xl border border-slate-200/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition cursor-pointer hover:bg-white hover:text-orange-600"
          title="Scroll to top"
          aria-label="Scroll back to top"
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
        </button>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight text-[#2A241E] truncate">
              Customer Reviews
            </h1>
            {isRefreshing && (
              <RefreshCw className="h-3.5 w-3.5 text-orange-500 animate-spin" />
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Moderate customer testimonials, star ratings & store replies.
          </p>
        </div>

        {/* Global Rating Pill + Refresh Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="clay-badge-amber px-3 py-1 text-xs font-black text-white flex items-center gap-1.5 shadow-xs">
            <span>{summary?.averageRating ? summary.averageRating.toFixed(1) : "5.0"}</span>
            <Star className="h-3.5 w-3.5 fill-white" />
            <span className="text-[10px] font-bold text-amber-100">
              ({summary?.totalReviews ?? 0})
            </span>
          </span>

          <button
            type="button"
            onClick={() => fetchReviews(true)}
            disabled={isRefreshing || isLoading}
            className="clay-button inline-flex items-center justify-center gap-1.5 h-9 min-h-[36px] px-3 text-xs font-bold text-slate-700 hover:text-orange-600 active:scale-95 transition cursor-pointer disabled:opacity-50"
            title="Refresh Reviews"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          5 KPI Stat Summary Cards
          - Mobile (375px): 3-2 balanced layout (3 cards row 1, 2 cards row 2)
          - Desktop: Single tight row (lg:grid-cols-5) with reduced vertical height
          ========================================================= */}
      <div className="grid grid-cols-6 lg:grid-cols-5 gap-2 sm:gap-2.5 w-full min-w-0">
        {/* Card 1: All Reviews (Mobile: col-span-2 -> 1/3 width, Desktop: 1 col) */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("ALL");
            setSpamFilter("ALL");
            setPage(1);
          }}
          className={`clay-card p-2.5 sm:p-3 lg:py-2.5 lg:px-3 text-left min-h-[74px] sm:min-h-[78px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer col-span-2 lg:col-span-1 ${
            statusFilter === "ALL" && spamFilter === "ALL"
              ? "ring-2 ring-slate-800 bg-white shadow-sm"
              : "hover:bg-[#FAF7F2]"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs w-full">
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              All
            </span>
            <Star className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          </div>
          <div>
            <p className="text-base sm:text-xl font-black text-[#2A241E] leading-none my-0.5">
              {summary?.totalReviews ?? 0}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate leading-none">
              All feedback
            </p>
          </div>
        </button>

        {/* Card 2: Pending Moderation (Mobile: col-span-2 -> 1/3 width, Desktop: 1 col) */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("PENDING");
            setSpamFilter("ALL");
            setPage(1);
          }}
          className={`clay-card p-2.5 sm:p-3 lg:py-2.5 lg:px-3 text-left min-h-[74px] sm:min-h-[78px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer col-span-2 lg:col-span-1 ${
            statusFilter === "PENDING"
              ? "ring-2 ring-amber-500 bg-amber-50/50 shadow-sm"
              : "hover:bg-amber-50/20"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 text-xs w-full">
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-700 font-mono-eyebrow truncate">
              Pending
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {(summary?.pendingCount ?? 0) > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
              <Clock className="h-3.5 w-3.5 text-amber-500" />
            </div>
          </div>
          <div>
            <p className="text-base sm:text-xl font-black text-amber-600 leading-none my-0.5">
              {summary?.pendingCount ?? 0}
            </p>
            <p className="text-[9px] sm:text-[10px] text-amber-700 font-medium truncate leading-none">
              Needs review
            </p>
          </div>
        </button>

        {/* Card 3: Approved (Mobile: col-span-2 -> 1/3 width, Desktop: 1 col) */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("APPROVED");
            setSpamFilter("CLEAN");
            setPage(1);
          }}
          className={`clay-card p-2.5 sm:p-3 lg:py-2.5 lg:px-3 text-left min-h-[74px] sm:min-h-[78px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer col-span-2 lg:col-span-1 ${
            statusFilter === "APPROVED" && spamFilter !== "SPAM"
              ? "ring-2 ring-emerald-500 bg-emerald-50/50 shadow-sm"
              : "hover:bg-emerald-50/20"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 text-xs w-full">
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono-eyebrow truncate">
              Approved
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          </div>
          <div>
            <p className="text-base sm:text-xl font-black text-emerald-600 leading-none my-0.5">
              {summary?.approvedCount ?? 0}
            </p>
            <p className="text-[9px] sm:text-[10px] text-emerald-600 font-medium truncate leading-none">
              Published
            </p>
          </div>
        </button>

        {/* Card 4: Rejected (Mobile: col-span-3 -> 1/2 width, Desktop: 1 col) */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("REJECTED");
            setSpamFilter("ALL");
            setPage(1);
          }}
          className={`clay-card p-2.5 sm:p-3 lg:py-2.5 lg:px-3 text-left min-h-[74px] sm:min-h-[78px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer col-span-3 lg:col-span-1 ${
            statusFilter === "REJECTED" && spamFilter !== "SPAM"
              ? "ring-2 ring-rose-500 bg-rose-50/50 shadow-sm"
              : "hover:bg-rose-50/20"
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 text-xs w-full">
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-700 font-mono-eyebrow truncate">
              Rejected
            </span>
            <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
          </div>
          <div>
            <p className="text-base sm:text-xl font-black text-rose-600 leading-none my-0.5">
              {summary?.rejectedCount ?? 0}
            </p>
            <p className="text-[9px] sm:text-[10px] text-rose-600 font-medium truncate leading-none">
              Hidden
            </p>
          </div>
        </button>

        {/* Card 5: Spam Queue (Mobile: col-span-3 -> 1/2 width, Desktop: 1 col)
            COLOR: Consistent muted dark slate (NOT purple) */}
        <button
          type="button"
          onClick={() => {
            setSpamFilter(spamFilter === "SPAM" ? "ALL" : "SPAM");
            setPage(1);
          }}
          className={`clay-card p-2.5 sm:p-3 lg:py-2.5 lg:px-3 text-left min-h-[74px] sm:min-h-[78px] flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer col-span-3 lg:col-span-1 ${
            spamFilter === "SPAM"
              ? "ring-2 ring-slate-800 bg-slate-100 shadow-sm"
              : "hover:bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between text-slate-600 text-xs w-full">
            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-700 font-mono-eyebrow truncate">
              Spam Queue
            </span>
            <ShieldAlert className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          </div>
          <div>
            <p className="text-base sm:text-xl font-black text-slate-800 leading-none my-0.5">
              {summary?.spamCount ?? 0}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate leading-none">
              Auto-blocked
            </p>
          </div>
        </button>
      </div>

      {/* =========================================================
          STICKY COMPACT SEARCH & FILTER TOOLBAR
          ========================================================= */}
      <div className="sticky top-0 z-20 bg-[#ECE6DE]/95 backdrop-blur-md -mx-3 px-3 sm:-mx-4 sm:px-4 pt-1 pb-2 md:static md:bg-transparent md:p-0 md:m-0 space-y-1.5">
        <div className="clay-card p-2 sm:p-2.5 space-y-2 min-w-0 shadow-sm md:shadow-none">
          {/* Main Controls Row: Search + Filters + Sort */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full">
            {/* Search Input (Consistent h-10) */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews..."
                className="w-full h-10 min-h-[40px] rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2 pl-8.5 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search query"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Rating Dropdown (h-10) */}
            <div className="hidden lg:block">
              <ReviewRatingDropdown
                value={ratingFilter}
                onChange={(val) => {
                  setRatingFilter(val);
                  setPage(1);
                }}
              />
            </div>

            {/* Custom Sort Dropdown (h-10) */}
            <div className="shrink-0 max-w-[125px] sm:max-w-[160px]">
              <ReviewSortDropdown
                value={sortOrder}
                onChange={(val) => {
                  setSortOrder(val);
                  setPage(1);
                }}
              />
            </div>

            {/* Filter Sheet Button (h-10) */}
            <button
              type="button"
              onClick={() => setIsFilterSheetOpen(true)}
              className={`h-10 min-h-[40px] px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
                activeFiltersCount > 0
                  ? "bg-orange-50 text-[#FF7A00] border-orange-300"
                  : "bg-white text-slate-700 hover:bg-[#FAF7F2] border-slate-200/80"
              }`}
              title="Open filters modal"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="h-4.5 w-4.5 rounded-full bg-[#FF7A00] text-white text-[9.5px] font-black flex items-center justify-center shrink-0">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Status Filter Tabs with smooth horizontal scroll + right-edge gradient fade mask */}
          <div className="relative w-full overflow-hidden">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pr-6 py-0.5">
              {[
                { label: "All", val: "ALL" as const, count: summary?.totalReviews },
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
                      min-h-[34px] px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0
                      ${
                        isSelected
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-[#F8F5F1] text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
                      }
                    `}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${
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

              {/* Spam Queue pill tab (Consistent slate, NOT purple) */}
              <button
                type="button"
                onClick={() => {
                  setSpamFilter(spamFilter === "SPAM" ? "ALL" : "SPAM");
                  setPage(1);
                }}
                className={`
                  min-h-[34px] px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0
                  ${
                    spamFilter === "SPAM"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/80"
                  }
                `}
              >
                <ShieldAlert className="h-3 w-3 text-slate-600" />
                <span>Spam</span>
                {summary?.spamCount !== undefined && (
                  <span
                    className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-bold ${
                      spamFilter === "SPAM"
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {summary.spamCount}
                  </span>
                )}
              </button>
            </div>

            {/* Right-edge gradient fade mask indicating more scrollable tabs */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/95 via-white/80 to-transparent sm:hidden" />
          </div>

          {/* Active Filter Removable Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow shrink-0">
                Filters:
              </span>

              {statusFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-[10.5px] font-semibold shrink-0">
                  Status: {statusFilter}
                  <button
                    type="button"
                    onClick={() => setStatusFilter("ALL")}
                    className="hover:text-orange-950 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {spamFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-[10.5px] font-semibold shrink-0">
                  Queue: {spamFilter}
                  <button
                    type="button"
                    onClick={() => setSpamFilter("ALL")}
                    className="hover:text-slate-950 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {ratingFilter > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10.5px] font-semibold shrink-0">
                  {ratingFilter}★ Only
                  <button
                    type="button"
                    onClick={() => setRatingFilter(0)}
                    className="hover:text-amber-950 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {sortOrder !== "createdAt_desc" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-semibold shrink-0">
                  Sort changed
                  <button
                    type="button"
                    onClick={() => setSortOrder("createdAt_desc")}
                    className="hover:text-slate-900 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-[10.5px] font-bold text-orange-600 hover:text-orange-800 shrink-0 ml-1 cursor-pointer flex items-center gap-0.5"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-bold">Failed to load customer reviews</p>
              <p className="text-[11px] mt-0.5 text-rose-700 truncate">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchReviews(true)}
            className="px-3 py-1.5 min-h-[32px] bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 w-full min-w-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="clay-card p-3.5 sm:p-4 space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-2 w-16 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-7 w-full bg-slate-100 rounded-xl" />
              <div className="h-12 w-full bg-slate-100 rounded-xl" />
              <div className="flex justify-between items-center pt-1.5">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-7 w-24 bg-slate-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !errorMessage && reviews.length === 0 && (
        <div className="clay-card p-6 sm:p-10 text-center flex flex-col items-center justify-center space-y-2.5">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 text-[#FF7A00] flex items-center justify-center">
            <Star className="h-6 w-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">No customer reviews found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {activeFiltersCount > 0 || search
              ? "No reviews match your active filters. Try clearing filters or searching for different terms."
              : "No customer reviews have been submitted yet."}
          </p>
          {(activeFiltersCount > 0 || search) && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="clay-btn-orange min-h-[38px] px-4 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* =========================================================
          REVIEWS CARDS GRID (Tightened Height ~25-30% Reduction)
          - Tightened vertical rhythm (8-10px gaps)
          - Compact inline product bar
          - Compact single-line rejection note
          - Single-row consolidated action bar (Details text link + compact buttons)
          ========================================================= */}
      {!isLoading && !errorMessage && reviews.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3.5 w-full min-w-0">
          {reviews.map((rev) => {
            const isProcessingThis = actionLoadingId === rev.id;
            const isExpanded = Boolean(expandedCommentIds[rev.id]);
            const isCommentLong = rev.comment.length > 120;

            return (
              <div
                key={rev.id}
                className="clay-card p-3 sm:p-4 flex flex-col justify-between min-w-0 space-y-2.5 relative overflow-hidden transition hover:shadow-md"
              >
                <div className="space-y-2">
                  {/* Top Header Row: Customer Info + Rating & Status Badge */}
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Avatar initial (h-8 w-8) */}
                      <div className="h-8 w-8 rounded-xl bg-orange-100 text-[#FF7A00] flex items-center justify-center font-bold text-xs shrink-0">
                        {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-xs sm:text-[13px] truncate max-w-[130px] sm:max-w-[200px]">
                            {rev.user?.name || rev.userName || "Customer"}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200/80 shrink-0">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {rev.user?.email || formatDate(rev.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Star rating display & status */}
                    <div className="flex flex-col items-end shrink-0">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < rev.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Status pill (Consistently styled: Approved=green, Pending=amber, Rejected=rose, Spam=slate) */}
                      <div className="mt-0.5">
                        {rev.isSpam ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            <ShieldAlert className="h-2.5 w-2.5 text-slate-600" />
                            Spam
                          </span>
                        ) : rev.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                            Approved
                          </span>
                        ) : rev.status === "REJECTED" ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="h-2.5 w-2.5 stroke-[2.5]" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="h-2.5 w-2.5" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Attached Product Box (Tightened padding & height) */}
                  <div className="p-1.5 sm:p-2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="h-6 w-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {rev.product?.imageUrl ? (
                          <img
                            src={rev.product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-3 w-3 text-slate-400" />
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
                    <p className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                      {rev.title}
                    </p>
                  )}

                  {/* Review Comment Box (Compact padding & line clamp) */}
                  <div className="text-xs text-slate-700 leading-snug bg-[#FAF7F3] p-2 sm:p-2.5 rounded-xl border border-slate-100 font-normal">
                    <p className={!isExpanded && isCommentLong ? "line-clamp-2" : ""}>
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                    {isCommentLong && (
                      <button
                        type="button"
                        onClick={() => toggleExpandComment(rev.id)}
                        className="text-[10.5px] font-bold text-[#FF7A00] hover:underline mt-0.5 cursor-pointer flex items-center gap-0.5"
                      >
                        <span>{isExpanded ? "Less" : "Read more"}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Photos strip (compact 32px height) */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {rev.photos.map((photoUrl, idx) => (
                        <a
                          key={idx}
                          href={photoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 w-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 block hover:opacity-90 transition"
                        >
                          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Official Store Admin Reply Bubble (Compact) */}
                  {rev.adminReply && (
                    <div className="p-2 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-orange-950 flex items-center gap-1">
                          <MessageSquareQuote className="h-3 w-3 text-[#FF7A00]" />
                          Store Reply:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedReviewForReply(rev)}
                          className="text-[10px] font-bold text-[#FF7A00] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-[11px] text-orange-900 leading-snug font-normal line-clamp-2">
                        &ldquo;{rev.adminReply}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Rejection Note (Compact single-line banner instead of bulky box) */}
                  {rev.status === "REJECTED" && rev.rejectionReason && (
                    <div className="px-2.5 py-1 rounded-lg bg-rose-50/80 border border-rose-200/70 text-[10.5px] text-rose-800 flex items-center gap-1.5 min-w-0">
                      <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
                      <span className="font-bold shrink-0">Rejected:</span>
                      <span className="truncate">{rev.rejectionReason}</span>
                    </div>
                  )}
                </div>

                {/* =========================================================
                    CARD ACTIONS BAR (Consolidated into single compact row)
                    - Left: "Details" text link (not a bulky button)
                    - Right: Compact actions (Approve, Reject, Reply, Spam)
                    ========================================================= */}
                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                  {/* Left: View Details text link */}
                  <button
                    type="button"
                    onClick={() => setSelectedReviewForDetail(rev)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 underline-offset-2 hover:underline cursor-pointer min-h-[34px] py-1"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>Details</span>
                  </button>

                  {/* Right: Primary Moderation Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Approve Button (when Pending or Rejected) */}
                    {rev.status !== "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => handleApprove(rev)}
                        disabled={isProcessingThis}
                        className="h-8 min-h-[32px] px-2.5 sm:px-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs active:scale-95 transition cursor-pointer disabled:opacity-50"
                      >
                        {isProcessingThis ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        )}
                        <span>{rev.status === "REJECTED" ? "Restore" : "Approve"}</span>
                      </button>
                    )}

                    {/* Reject Button (when Pending or Approved) */}
                    {rev.status !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => setSelectedReviewForReject(rev)}
                        disabled={isProcessingThis}
                        className="h-8 min-h-[32px] px-2.5 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1 active:scale-95 transition cursor-pointer disabled:opacity-50"
                      >
                        <X className="h-3 w-3 stroke-[2.5]" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Store Reply Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedReviewForReply(rev)}
                      disabled={isProcessingThis}
                      className={`h-8 min-h-[32px] px-2.5 text-xs font-bold rounded-lg flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                        rev.status === "APPROVED"
                          ? "clay-btn-orange text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <MessageSquareQuote className={`h-3 w-3 ${rev.status === "APPROVED" ? "text-white" : "text-orange-500"}`} />
                      <span>{rev.adminReply ? "Edit" : "Reply"}</span>
                    </button>

                    {/* Spam Flag Icon Button (Consistent slate color) */}
                    <button
                      type="button"
                      onClick={() => handleToggleSpam(rev)}
                      disabled={isProcessingThis}
                      title={rev.isSpam ? "Unflag spam" : "Flag as spam"}
                      className={`h-8 w-8 min-h-[32px] min-w-[32px] rounded-lg flex items-center justify-center transition active:scale-95 cursor-pointer disabled:opacity-50 border ${
                        rev.isSpam
                          ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-900"
                          : "bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
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
        <div className="clay-card p-2.5 sm:p-3 flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 font-medium truncate">
            Page <span className="font-bold text-slate-800">{pagination.page}</span> of{" "}
            <span className="font-bold text-slate-800">{pagination.totalPages}</span>{" "}
            <span className="hidden sm:inline">({pagination.total} total)</span>
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="h-9 min-h-[36px] px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="h-9 min-h-[36px] px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals & Filter Sheet */}
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
