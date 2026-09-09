"use client";

import { 
  Users, 
  Search, 
  Download, 
  Eye, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Loader2, 
  AlertCircle, 
  X, 
  Check, 
  RefreshCw, 
  UserCheck, 
  UserX,
  PawPrint,
  ArrowUp
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AdminCustomerService } from "@/services/adminCustomerService";
import { 
  AdminCustomerItem, 
  CustomerSummary, 
  PaginationMeta, 
  AdminCustomerSortType 
} from "@/types/admin-customer";

export default function CustomersPage() {
  // State for data
  const [customers, setCustomers] = useState<AdminCustomerItem[]>([]);
  const [summary, setSummary] = useState<CustomerSummary>({
    totalCustomers: 0,
    activeCustomersCount: 0,
    blockedCustomersCount: 0,
    verifiedCustomersCount: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Query / Filter state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "BLOCKED" | "VERIFIED">("ALL");
  const [sortOption, setSortOption] = useState<AdminCustomerSortType>("createdAt_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection State (uniform with Products page)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Status flags
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Floating scroll-to-top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Block/Unblock modal state
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerItem | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Scroll listener for floating "Scroll to top" button
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setShowScrollTop(window.scrollY > 280);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search input debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Clear selections when filters change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, filterTab, debouncedSearch, sortOption]);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
        sort: sortOption,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (filterTab === "ACTIVE") {
        params.isBlocked = false;
      } else if (filterTab === "BLOCKED") {
        params.isBlocked = true;
      } else if (filterTab === "VERIFIED") {
        params.isEmailVerified = true;
      }

      const res = await AdminCustomerService.getCustomers(params);
      if (res.success && res.data) {
        setCustomers(res.data.customers || []);
        if (res.data.pagination) setPagination(res.data.pagination);
        if (res.data.summary) setSummary(res.data.summary);
      } else {
        throw new Error("Failed to load customers");
      }
    } catch (err: any) {
      const msg = AdminCustomerService.extractErrorMessage(err, "Failed to load customers.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, filterTab, sortOption]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Bulk Selection Helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === customers.length && customers.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(customers.map((c) => c.id)));
    }
  };

  // Block / Unblock handler
  const handleStatusUpdate = async () => {
    if (!selectedCustomer) return;
    setActionLoading(true);
    try {
      const nextBlocked = !selectedCustomer.isBlocked;
      const res = await AdminCustomerService.updateCustomerStatus(
        selectedCustomer.id,
        nextBlocked,
        nextBlocked ? blockReason.trim() || undefined : undefined
      );

      showToast(
        res.message ||
        (nextBlocked
          ? `Customer "${selectedCustomer.name}" blocked and active sessions revoked.`
          : `Customer "${selectedCustomer.name}" unblocked successfully.`)
      );

      setSelectedCustomer(null);
      setBlockReason("");
      fetchCustomers();
    } catch (err: any) {
      const msg = AdminCustomerService.extractErrorMessage(err, "Failed to update customer status.");
      showToast(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export utility
  const exportCustomersToCSV = (items: AdminCustomerItem[], fileNameSuffix = "directory") => {
    if (items.length === 0) {
      showToast("No customers selected to export.");
      return;
    }

    const headers = [
      "ID", 
      "Name", 
      "Email", 
      "Phone", 
      "Status", 
      "Orders Count", 
      "Pets Count", 
      "Lifetime Spend (INR)", 
      "Joined Date"
    ];
    const rows = items.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email || ""}"`,
      `"${c.phone || ""}"`,
      c.isBlocked ? "BLOCKED" : "ACTIVE",
      c.ordersCount,
      c.petsCount,
      c.totalSpent,
      `"${new Date(c.createdAt).toLocaleDateString("en-IN")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(",")).join("\n")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kickat-customers-${fileNameSuffix}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${items.length} customer records successfully.`);
  };

  const handleExportAllCSV = () => {
    exportCustomersToCSV(customers, "all");
  };

  const handleExportSelectedCSV = () => {
    const selectedCustomers = customers.filter((c) => selectedIds.has(c.id));
    exportCustomersToCSV(selectedCustomers, "selected");
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-16 w-full min-w-0 no-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in border border-slate-700">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Pet Parents & Customers
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Manage customer directories, verified pet profiles, order histories, and lifetime spending.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchCustomers()}
            disabled={loading}
            className="clay-button min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer disabled:opacity-50 active:scale-95"
            title="Refresh customer list"
            aria-label="Refresh customer list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#FF7A00]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button 
            onClick={handleExportAllCSV}
            className="clay-button min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer active:scale-95"
            title="Export full directory as CSV"
            aria-label="Export CSV"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          1. STAT CARDS ROW (2x2 on mobile 375px, 4-col on desktop)
          Clean, brand-consistent palette: Slate, Emerald, Brand Orange, Red
          ========================================================= */}
      {loading ? (
        <>
          {/* Mobile 2x2 Metric Grid Skeleton (md:hidden) */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="clay-card p-3 space-y-2 min-h-[72px]">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-16 bg-slate-200/80 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-slate-200/80 rounded-md animate-pulse" />
                </div>
                <div className="h-6 w-12 bg-slate-200/80 rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* Desktop Metric Cards Skeleton */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="clay-card p-4 space-y-2 min-h-[84px]">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 bg-slate-200/80 rounded animate-pulse" />
                  <div className="h-4 w-4 bg-slate-200/80 rounded-md animate-pulse" />
                </div>
                <div className="h-7 w-16 bg-slate-200/80 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Mobile High-Density 2x2 Metric Grid (md:hidden, large tap targets, high contrast) */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            {/* Metric 1: Total Customers */}
            <button
              type="button"
              onClick={() => {
                setFilterTab("ALL");
                setCurrentPage(1);
              }}
              className={`clay-card p-3 min-h-[72px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer ${
                filterTab === "ALL" ? "ring-2 ring-slate-800/20 bg-slate-50/40" : ""
              }`}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Total
                </span>
                <Users className="h-4 w-4 text-slate-400 shrink-0" />
              </div>
              <p className="font-fraunces text-xl font-bold text-[#2A241E] mt-1">
                {summary.totalCustomers.toLocaleString()}
              </p>
              <span className="text-[10px] font-medium text-slate-500 truncate block">
                Registered
              </span>
            </button>

            {/* Metric 2: Active Accounts (Emerald) */}
            <button
              type="button"
              onClick={() => {
                setFilterTab("ACTIVE");
                setCurrentPage(1);
              }}
              className={`clay-card p-3 min-h-[72px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer ${
                filterTab === "ACTIVE" ? "ring-2 ring-emerald-500 bg-emerald-50/20" : ""
              }`}
            >
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Active
                </span>
                <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              </div>
              <p className="font-fraunces text-xl font-bold text-emerald-600 mt-1">
                {summary.activeCustomersCount.toLocaleString()}
              </p>
              <span className="text-[10px] font-medium text-emerald-700/80 truncate block">
                Good standing
              </span>
            </button>

            {/* Metric 3: Verified Profiles (Brand Orange) */}
            <button
              type="button"
              onClick={() => {
                setFilterTab("VERIFIED");
                setCurrentPage(1);
              }}
              className={`clay-card p-3 min-h-[72px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer ${
                filterTab === "VERIFIED" ? "ring-2 ring-[#FF7A00] bg-orange-50/20" : ""
              }`}
            >
              <div className="flex items-center justify-between text-[#EA580C]">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Verified
                </span>
                <CheckCircle2 className="h-4 w-4 text-[#FF7A00] shrink-0" />
              </div>
              <p className="font-fraunces text-xl font-bold text-[#EA580C] mt-1">
                {summary.verifiedCustomersCount.toLocaleString()}
              </p>
              <span className="text-[10px] font-medium text-orange-700/80 truncate block">
                Verified contact
              </span>
            </button>

            {/* Metric 4: Blocked Accounts (Standard Warning Red matching Products Out of Stock) */}
            <button
              type="button"
              onClick={() => {
                setFilterTab("BLOCKED");
                setCurrentPage(1);
              }}
              className={`clay-card p-3 min-h-[72px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer ${
                filterTab === "BLOCKED" ? "ring-2 ring-rose-500 bg-rose-50/20" : ""
              }`}
            >
              <div className="flex items-center justify-between text-rose-600">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Blocked
                </span>
                <UserX className="h-4 w-4 text-rose-500 shrink-0" />
              </div>
              <p className="font-fraunces text-xl font-bold text-rose-600 mt-1">
                {summary.blockedCustomersCount.toLocaleString()}
              </p>
              <span className="text-[10px] font-medium text-rose-700/80 truncate block">
                Restricted access
              </span>
            </button>
          </div>

          {/* Desktop Summary Cards (hidden md:grid) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Total Customers */}
            <button
              type="button"
              onClick={() => {
                setFilterTab("ALL");
                setCurrentPage(1);
              }}
              className={`clay-card p-3.5 sm:p-4 min-h-[84px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer ${
                filterTab === "ALL" ? "ring-2 ring-slate-800/20 bg-slate-50/40" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Total Customers
                </span>
                <Users className="h-4 w-4 text-slate-400 shrink-0" />
              </div>
              <p className="font-fraunces text-xl sm:text-2xl font-bold text-[#2A241E] mt-1">
                {summary.totalCustomers.toLocaleString()}
              </p>
              <span className="text-[10.5px] font-medium text-slate-500 truncate block mt-0.5">
                Registered accounts
              </span>
            </button>

            {/* Metric 2: Active Accounts */}
            <button
              type="button"
              onClick={() => {
                setFilterTab("ACTIVE");
                setCurrentPage(1);
              }}
              className={`clay-card p-3.5 sm:p-4 min-h-[84px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer ${
                filterTab === "ACTIVE" ? "ring-2 ring-emerald-500 bg-emerald-50/20" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-emerald-600">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Active Accounts
                </span>
                <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              </div>
              <p className="font-fraunces text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
                {summary.activeCustomersCount.toLocaleString()}
              </p>
              <span className="text-[10.5px] font-medium text-emerald-700/80 truncate block mt-0.5">
                In good standing
              </span>
            </button>

            {/* Metric 3: Verified Profiles */}
            <button
              type="button"
              onClick={() => {
                setFilterTab("VERIFIED");
                setCurrentPage(1);
              }}
              className={`clay-card p-3.5 sm:p-4 min-h-[84px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer ${
                filterTab === "VERIFIED" ? "ring-2 ring-[#FF7A00] bg-orange-50/20" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[#EA580C]">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Verified Profiles
                </span>
                <CheckCircle2 className="h-4 w-4 text-[#FF7A00] shrink-0" />
              </div>
              <p className="font-fraunces text-xl sm:text-2xl font-bold text-[#EA580C] mt-1">
                {summary.verifiedCustomersCount.toLocaleString()}
              </p>
              <span className="text-[10.5px] font-medium text-orange-700/80 truncate block mt-0.5">
                Verified email/phone
              </span>
            </button>

            {/* Metric 4: Blocked Accounts */}
            <button
              type="button"
              onClick={() => {
                setFilterTab("BLOCKED");
                setCurrentPage(1);
              }}
              className={`clay-card p-3.5 sm:p-4 min-h-[84px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer ${
                filterTab === "BLOCKED" ? "ring-2 ring-rose-500 bg-rose-50/20" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-rose-600">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Blocked Accounts
                </span>
                <UserX className="h-4 w-4 text-rose-500 shrink-0" />
              </div>
              <p className="font-fraunces text-xl sm:text-2xl font-bold text-rose-600 mt-1">
                {summary.blockedCustomersCount.toLocaleString()}
              </p>
              <span className="text-[10.5px] font-medium text-rose-700/80 truncate block mt-0.5">
                Restricted access
              </span>
            </button>
          </div>
        </>
      )}

      {/* =========================================================
          2. STICKY SEARCH, FILTER & SORT TOOLBAR
          3-row mobile layout: No horizontal overflow at 375px
          All interactive targets meet 44px min height
          ========================================================= */}
      <div className="sticky top-0 z-30 bg-[#FAF4EC]/95 backdrop-blur-md -mx-4 px-4 pt-1.5 pb-2.5 border-b border-orange-100/60 md:static md:bg-transparent md:p-0 md:border-0 md:m-0 space-y-2">
        <div className="clay-card p-2.5 sm:p-3.5 space-y-2.5 min-w-0">
          {/* Row 1: Search Bar with 44px min height & short placeholder to fit 375px without truncation */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email, phone..."
              className="w-full h-11 rounded-xl bg-[#F8F5F1] border border-slate-200/70 pl-9 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7A00] transition truncate"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-9 w-9 flex items-center justify-center cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Row 2: Filter Pills (4-column grid on mobile for 375px zero-overflow; 44px min touch target) */}
          <div className="grid grid-cols-4 gap-1.5 w-full sm:flex sm:items-center sm:w-auto">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "ACTIVE", label: "Active" },
                { id: "VERIFIED", label: "Verified" },
                { id: "BLOCKED", label: "Blocked" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`
                  min-h-[44px] px-1 sm:px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95 flex items-center justify-center border text-center select-none truncate
                  ${filterTab === tab.id 
                    ? "bg-[#FF7A00] text-white border-[#EA580C] shadow-xs" 
                    : "clay-button text-slate-600 hover:text-slate-900 border-slate-200/70"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row 3: Filter Summary / Reset + Sort Dropdown (Consistent with Categories and Products) */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80 text-xs">
            <div className="text-[11px] font-medium text-slate-500 truncate min-w-0">
              {debouncedSearch || filterTab !== "ALL" ? (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setFilterTab("ALL");
                    setCurrentPage(1);
                  }}
                  className="text-[#EA580C] hover:text-orange-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[44px]"
                  title="Reset active filters"
                >
                  <X className="h-3.5 w-3.5 shrink-0" />
                  <span>Reset filter</span>
                </button>
              ) : (
                <span className="text-slate-500 font-medium">
                  {pagination.total} {pagination.total === 1 ? "customer" : "customers"}
                </span>
              )}
            </div>

            {/* Sort Dropdown with 44px min height & consistent styling */}
            <div className="relative shrink-0">
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as AdminCustomerSortType);
                  setCurrentPage(1);
                }}
                className="min-h-[44px] h-11 w-auto max-w-[140px] sm:max-w-[160px] rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2 pl-2.5 pr-7 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7A00] transition cursor-pointer appearance-none truncate"
                title="Sort customers"
                aria-label="Sort customers"
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. BULK ACTIONS BAR (Fixed at bottom on mobile for thumb reach)
          Consistent with Products page pattern
          ========================================================= */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-3 right-3 z-40 sm:sticky sm:top-3 sm:bottom-auto flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#2A241E] text-white shadow-2xl animate-slide-in-down border border-slate-700">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <label className="min-h-[44px] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === customers.length && customers.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer shrink-0"
                aria-label="Select all customers on page"
              />
              <span className="text-xs sm:text-sm font-bold truncate">
                {selectedIds.size} <span className="hidden sm:inline">of {customers.length}</span> selected
              </span>
            </label>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="min-h-[44px] px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer flex items-center"
            >
              Clear
            </button>
            <button
              onClick={handleExportSelectedCSV}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Export selected customers as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          4. CUSTOMER DIRECTORY LIST / TABLE
          ========================================================= */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="clay-card p-4 rounded-2xl animate-pulse space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-slate-200/80 shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-32 rounded bg-slate-200/80" />
                    <div className="h-2.5 w-24 rounded bg-slate-100" />
                  </div>
                </div>
                <div className="h-5 w-14 rounded-full bg-slate-200/60" />
              </div>
              <div className="h-10 rounded-xl bg-slate-100/80" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-3 w-36 rounded bg-slate-200/60" />
                <div className="h-8 w-20 rounded-xl bg-slate-200/80" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="clay-card p-8 flex flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="text-sm font-bold text-slate-800">{error}</p>
          <button
            onClick={() => fetchCustomers()}
            className="clay-button min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center gap-3 text-center">
          <Users className="h-10 w-10 text-slate-300" />
          <h3 className="font-fraunces text-base font-bold text-slate-800">No customers found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {debouncedSearch
              ? `No customer matches "${debouncedSearch}". Try checking the spelling or resetting filters.`
              : "No customers match the current filter selection."}
          </p>
          {(debouncedSearch || filterTab !== "ALL") && (
            <button
              onClick={() => {
                setSearchInput("");
                setFilterTab("ALL");
                setCurrentPage(1);
              }}
              className="clay-button min-h-[44px] px-4 py-2 text-xs font-bold text-[#EA580C] hover:bg-orange-50 transition cursor-pointer mt-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* =========================================================
              MOBILE CUSTOMER CARDS (< md)
              Refined hierarchy: Top Identity -> Middle Bordered Metrics -> Bottom Contact & Actions
              Meets 44x44px touch targets on all interactive elements
              ========================================================= */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {customers.map((cust) => {
              const initials = cust.name
                ? cust.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join("")
                : "C";

              const isSelected = selectedIds.has(cust.id);

              return (
                <div
                  key={cust.id}
                  className={`clay-card p-3 space-y-2.5 min-w-0 transition-all ${
                    isSelected ? "ring-2 ring-[#FF7A00] bg-orange-50/20" : ""
                  }`}
                >
                  {/* Top Row: Bulk Select Checkbox + Brand Orange Avatar + Name/Pet Badges + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {/* Checkbox for Bulk Actions (44x44px touch area) */}
                      <label 
                        className="min-h-[44px] min-w-[32px] flex items-center justify-center cursor-pointer shrink-0 -ml-1 -my-1.5"
                        title={`Select ${cust.name}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(cust.id)}
                          className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer bg-white border border-slate-300"
                          aria-label={`Select ${cust.name}`}
                        />
                      </label>

                      {/* Brand Orange Avatar Placeholder */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#EA580C] text-white text-xs font-bold shadow-xs select-none">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {cust.name}
                          </h3>
                          {cust.isEmailVerified && (
                            <span title="Verified Account & Email" className="inline-flex items-center shrink-0">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            </span>
                          )}
                        </div>

                        {/* Pet Profile Badge with Paw Icon */}
                        <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-slate-500 truncate">
                          <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-800 border border-orange-100/80">
                            <PawPrint className="h-2.5 w-2.5 text-[#FF7A00] shrink-0" />
                            <span className="truncate">
                              {cust.petsCount > 0 
                                ? `${cust.petsCount} pet profile${cust.petsCount > 1 ? "s" : ""}` 
                                : "No pets"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge: Active (Green) or Blocked (Red) */}
                    <span
                      className={`
                        px-2 py-0.5 text-[9.5px] font-bold rounded-full shrink-0 uppercase tracking-wider border
                        ${cust.isBlocked 
                          ? "bg-rose-50 text-rose-700 border-rose-200" 
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }
                      `}
                    >
                      {cust.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>

                  {/* Middle Row: Key Business Metrics with Subtle Top & Bottom Dividers */}
                  <div className="py-2 px-3 rounded-xl bg-[#F8F5F1]/80 border-y border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-eyebrow block">
                        Total Orders
                      </span>
                      <span className="font-extrabold text-slate-800 text-xs sm:text-sm">
                        {cust.ordersCount} {cust.ordersCount === 1 ? "order" : "orders"}
                      </span>
                    </div>

                    <div className="h-6 w-px bg-slate-200/70" />

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-eyebrow block">
                        Lifetime Spend
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 font-fraunces">
                        ₹{cust.totalSpent.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Contact Info + Security Action + Primary Profile Button */}
                  <div className="flex items-center justify-between gap-1.5 pt-0.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 min-w-0 max-w-[130px] truncate text-[11px]">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600 font-medium" title={cust.email || cust.phone || "No contact info"}>
                        {cust.email || cust.phone || "No contact info"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Security Action Button with Clear Tooltip and Explicit Label */}
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 border cursor-pointer active:scale-95 ${
                          cust.isBlocked
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50/70 text-rose-700 border-rose-200/70 hover:bg-rose-100/70"
                        }`}
                        title={cust.isBlocked ? "Unblock customer account" : "Manage account access (Block / Revoke sessions)"}
                        aria-label={cust.isBlocked ? "Unblock customer account" : "Block customer account"}
                      >
                        {cust.isBlocked ? (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Unblock</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            <span>Block</span>
                          </>
                        )}
                      </button>

                      {/* Primary Profile Action Button */}
                      <Link
                        href={`/admin/dashboard/customers/${cust.id}`}
                        className="clay-button min-h-[44px] px-3.5 py-2 text-xs font-bold text-slate-800 hover:text-[#FF7A00] inline-flex items-center gap-1.5 shrink-0 rounded-xl transition active:scale-95 shadow-2xs"
                        title={`View full profile for ${cust.name}`}
                        aria-label={`View profile for ${cust.name}`}
                      >
                        <span>Profile</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================
              DESKTOP RESPONSIVE CUSTOMERS TABLE (hidden < md)
              ========================================================= */}
          <div className="clay-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-3.5 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === customers.length && customers.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer"
                        aria-label="Select all customers on page"
                      />
                    </th>
                    <th className="py-3 px-4 font-bold">Customer Name</th>
                    <th className="py-3 px-4 font-bold">Contact Info</th>
                    <th className="py-3 px-4 font-bold">Pets Registered</th>
                    <th className="py-3 px-4 font-bold text-center">Orders</th>
                    <th className="py-3 px-4 font-bold text-right">Lifetime Spend</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((cust) => {
                    const initials = cust.name
                      ? cust.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((n) => n[0].toUpperCase())
                          .join("")
                      : "C";

                    const isSelected = selectedIds.has(cust.id);

                    return (
                      <tr 
                        key={cust.id} 
                        className={`hover:bg-[#FAF7F3]/70 transition-colors ${
                          isSelected ? "bg-orange-50/20" : ""
                        }`}
                      >
                        <td className="py-3 px-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(cust.id)}
                            className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer"
                            aria-label={`Select ${cust.name}`}
                          />
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {/* Brand Orange Avatar Placeholder */}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7A00] to-[#EA580C] text-white text-xs font-bold shadow-xs select-none">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 truncate">{cust.name}</p>
                                {cust.isEmailVerified && (
                                  <span title="Email Verified" className="inline-flex items-center shrink-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Joined {new Date(cust.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <p className="text-slate-800 truncate font-medium">{cust.email || "No email"}</p>
                          <p className="text-[10.5px] text-slate-400">{cust.phone || "No phone"}</p>
                        </td>

                        <td className="py-3 px-4">
                          <span className="rounded-lg bg-orange-50 px-2 py-0.5 text-[10.5px] font-semibold text-orange-800 border border-orange-100 flex items-center gap-1 w-fit">
                            <PawPrint className="h-2.5 w-2.5 text-[#FF7A00]" />
                            {cust.petsCount > 0 ? `${cust.petsCount} pet${cust.petsCount > 1 ? "s" : ""}` : "0 pets"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-slate-700">
                          {cust.ordersCount}
                        </td>

                        <td className="py-3 px-4 text-right font-black font-fraunces text-slate-900">
                          ₹{cust.totalSpent.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`
                              px-2 py-0.5 text-[9.5px] font-bold rounded-full uppercase tracking-wider border
                              ${cust.isBlocked 
                                ? "bg-rose-50 text-rose-700 border-rose-200" 
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }
                            `}
                          >
                            {cust.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedCustomer(cust)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                cust.isBlocked 
                                  ? "text-emerald-700 hover:text-emerald-900" 
                                  : "text-slate-400 hover:text-rose-600"
                              }`}
                              title={cust.isBlocked ? "Unblock Account" : "Block Account"}
                            >
                              {cust.isBlocked ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
                            </button>

                            <Link
                              href={`/admin/dashboard/customers/${cust.id}`}
                              className="clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-[#FF7A00] transition"
                              title="View Customer Profile"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================
              5. PAGINATION FOOTER
              Scale-ready with 10/25/50/100 limit selector & 44px touch targets
              ========================================================= */}
          <div className="clay-card p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 text-center sm:text-left">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{pagination.total}</span> customers
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
              {/* Limit Selector */}
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="text-slate-600 font-medium text-[11px]">Per page:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="min-h-[44px] rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-1.5 pl-2.5 pr-7 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7A00] cursor-pointer appearance-none"
                    title="Customers per page"
                    aria-label="Customers per page"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Prev / Current / Next with 44px min tap targets */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage || loading}
                  className="clay-button min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-95"
                  title="Previous Page"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-2 text-xs font-bold text-slate-700 select-none">
                  {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="clay-button min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer active:scale-95"
                  title="Next Page"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Scroll-to-Top Button (Matches Products Page) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-4 z-30 h-11 w-11 rounded-full bg-[#2A241E] text-white shadow-2xl flex items-center justify-center transition-all hover:bg-black active:scale-95 cursor-pointer"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* =========================================================
          6. BLOCK / UNBLOCK MODAL
          ========================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4 bg-white shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {selectedCustomer.isBlocked ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                )}
                <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
                  {selectedCustomer.isBlocked ? "Unblock Customer Account" : "Block Customer Account"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setBlockReason("");
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Close modal"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedCustomer.isBlocked ? (
                <>
                  Are you sure you want to restore access for <strong>{selectedCustomer.name}</strong>? They will be allowed to log into the mobile and web storefronts again.
                </>
              ) : (
                <>
                  Blocking <strong>{selectedCustomer.name}</strong> will <strong>immediately revoke all active sessions</strong> across mobile and web apps, preventing further logins or checkouts.
                </>
              )}
            </p>

            {!selectedCustomer.isBlocked && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow">
                  Reason for Blocking (Optional)
                </label>
                <textarea
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Repeated fraudulent COD cancellations, abusive conduct..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setBlockReason("");
                }}
                disabled={actionLoading}
                className="clay-button min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className={`
                  min-h-[44px] flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50
                  ${selectedCustomer.isBlocked
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                  }
                `}
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{selectedCustomer.isBlocked ? "Confirm Unblock" : "Confirm Block & Revoke"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
