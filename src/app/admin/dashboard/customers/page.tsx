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
  ArrowUp,
  Filter,
  ShoppingBag,
  IndianRupee,
  Sparkles,
  CheckSquare
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

  // Bulk Selection & Mode State
  const [isSelectMode, setIsSelectMode] = useState(false);
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
    }, 350);
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

  // Helper for generating initial background colors
  const getAvatarBg = (name: string) => {
    const colors = [
      "bg-orange-500 text-white",
      "bg-indigo-500 text-white",
      "bg-emerald-500 text-white",
      "bg-blue-500 text-white",
      "bg-rose-500 text-white",
      "bg-purple-500 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 w-full min-w-0 no-scrollbar">
      {/* Top Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs sm:text-sm font-semibold shadow-2xl animate-fade-in border border-slate-700">
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

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Select Mode Toggle Button */}
          <button
            onClick={() => {
              if (isSelectMode) {
                setIsSelectMode(false);
                setSelectedIds(new Set());
              } else {
                setIsSelectMode(true);
              }
            }}
            className={`clay-button min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition cursor-pointer active:scale-95 ${
              isSelectMode
                ? "bg-orange-50 text-orange-600 border border-orange-200/80 shadow-xs"
                : "text-slate-700 hover:text-slate-900"
            }`}
            title="Toggle selection checkboxes mode"
          >
            {isSelectMode ? (
              <>
                <X className="h-4 w-4 text-orange-600" />
                <span>Done</span>
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 text-slate-500" />
                <span>Select</span>
              </>
            )}
          </button>

          <button
            onClick={() => fetchCustomers()}
            disabled={loading}
            className="clay-button min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer disabled:opacity-50 active:scale-95"
            title="Refresh customer directory"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#FF7A00]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button 
            onClick={handleExportAllCSV}
            className="clay-button min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer active:scale-95"
            title="Export full directory as CSV"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          1. STAT CARDS ROW (Responsive Grid)
          ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        {/* Metric 1: Total Customers */}
        <button
          type="button"
          onClick={() => {
            setFilterTab("ALL");
            setCurrentPage(1);
          }}
          className={`clay-card p-3.5 sm:p-4 min-h-[84px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer min-w-0 ${
            filterTab === "ALL" ? "ring-2 ring-slate-800/20 bg-slate-50/40" : ""
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 min-w-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Total Customers
            </span>
            <Users className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
          <p className="font-fraunces text-xl sm:text-2xl font-black text-[#2A241E] mt-1 truncate">
            {summary.totalCustomers.toLocaleString()}
          </p>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block mt-0.5">
            Registered directory
          </span>
        </button>

        {/* Metric 2: Active Accounts */}
        <button
          type="button"
          onClick={() => {
            setFilterTab("ACTIVE");
            setCurrentPage(1);
          }}
          className={`clay-card p-3.5 sm:p-4 min-h-[84px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer min-w-0 ${
            filterTab === "ACTIVE" ? "ring-2 ring-emerald-500 bg-emerald-50/20" : ""
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 min-w-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Active Accounts
            </span>
            <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="font-fraunces text-xl sm:text-2xl font-black text-emerald-600 mt-1 truncate">
            {summary.activeCustomersCount.toLocaleString()}
          </p>
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700/80 truncate block mt-0.5">
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
          className={`clay-card p-3.5 sm:p-4 min-h-[84px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer min-w-0 ${
            filterTab === "VERIFIED" ? "ring-2 ring-orange-500 bg-orange-50/20" : ""
          }`}
        >
          <div className="flex items-center justify-between text-orange-600 min-w-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Verified Profiles
            </span>
            <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
          </div>
          <p className="font-fraunces text-xl sm:text-2xl font-black text-orange-600 mt-1 truncate">
            {summary.verifiedCustomersCount.toLocaleString()}
          </p>
          <span className="text-[10px] sm:text-[11px] font-semibold text-orange-700/80 truncate block mt-0.5">
            Verified contact info
          </span>
        </button>

        {/* Metric 4: Blocked Accounts */}
        <button
          type="button"
          onClick={() => {
            setFilterTab("BLOCKED");
            setCurrentPage(1);
          }}
          className={`clay-card p-3.5 sm:p-4 min-h-[84px] flex flex-col justify-between text-left transition active:scale-95 cursor-pointer min-w-0 ${
            filterTab === "BLOCKED" ? "ring-2 ring-rose-500 bg-rose-50/20" : ""
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 min-w-0">
            <span className="text-[10.5px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Blocked Accounts
            </span>
            <UserX className="h-4 w-4 text-rose-500 shrink-0" />
          </div>
          <p className="font-fraunces text-xl sm:text-2xl font-black text-rose-600 mt-1 truncate">
            {summary.blockedCustomersCount.toLocaleString()}
          </p>
          <span className="text-[10px] sm:text-[11px] font-semibold text-rose-700/80 truncate block mt-0.5">
            Restricted access
          </span>
        </button>
      </div>

      {/* =========================================================
          2. PREMIUM SEARCH & FILTER TOOLBAR PANEL
          ========================================================= */}
      <div className="clay-card p-3.5 sm:p-4 space-y-3.5 min-w-0 border border-slate-200/80 shadow-xs">
        {/* Top Search Field */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name, email address, or phone number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "ALL", label: "All Customers", count: summary.totalCustomers },
              { id: "ACTIVE", label: "Active", count: summary.activeCustomersCount },
              { id: "VERIFIED", label: "Verified", count: summary.verifiedCustomersCount },
              { id: "BLOCKED", label: "Blocked", count: summary.blockedCustomersCount },
            ].map((tab) => {
              const isSelected = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterTab(tab.id as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[9.5px] font-mono rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white font-extrabold"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Filter Summary + Sort Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {/* Active Filter Info & Reset Button */}
            {(debouncedSearch || filterTab !== "ALL") ? (
              <button
                onClick={() => {
                  setSearchInput("");
                  setFilterTab("ALL");
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-500">
                {pagination.total} {pagination.total === 1 ? "customer" : "customers"}
              </span>
            )}

            {/* Sort Select Menu */}
            <div className="relative shrink-0">
              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value as AdminCustomerSortType);
                  setCurrentPage(1);
                }}
                className="pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer appearance-none"
              >
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. BULK SELECTION BAR (Active when items selected or select mode active with selection)
          ========================================================= */}
      {(isSelectMode || selectedIds.size > 0) && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#2A241E] text-white shadow-xl flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-fade-in border border-slate-700">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.size === customers.length && customers.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
            />
            <span>{selectedIds.size} of {customers.length} selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedIds(new Set());
                setIsSelectMode(false);
              }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleExportSelectedCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          4. CUSTOMERS DIRECTORY LIST (Table on Desktop, Cards on Mobile)
          ========================================================= */}
      {loading ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-xs font-bold text-slate-600">Loading customer directory...</p>
        </div>
      ) : error ? (
        <div className="clay-card p-8 flex flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-rose-500" />
          <p className="text-sm font-bold text-slate-800">{error}</p>
          <button
            onClick={() => fetchCustomers()}
            className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : customers.length === 0 ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center gap-3 text-center">
          <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="font-fraunces text-base font-bold text-slate-800">No Customers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm font-medium">
            {debouncedSearch
              ? `No customer matches "${debouncedSearch}". Try resetting your search query.`
              : "No customers match the selected filter category."}
          </p>
          {(debouncedSearch || filterTab !== "ALL") && (
            <button
              onClick={() => {
                setSearchInput("");
                setFilterTab("ALL");
                setCurrentPage(1);
              }}
              className="clay-btn-orange inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-xs mt-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW (hidden on mobile, block on md+) */}
          <div className="hidden md:block clay-card overflow-hidden border border-slate-200/80 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 border-b border-slate-200/80 text-slate-500 uppercase text-[10px] font-bold font-mono-eyebrow tracking-wider">
                  <tr>
                    {/* Checkbox column only shown when isSelectMode is active */}
                    {isSelectMode && (
                      <th className="p-3.5 w-10 text-center animate-fade-in">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === customers.length && customers.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="p-3.5">Customer Name & Contact</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Registered Pets</th>
                    <th className="p-3.5 text-center">Orders & Spend</th>
                    <th className="p-3.5 text-center">Joined Date</th>
                    <th className="p-3.5 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {customers.map((c) => {
                    const isSelected = selectedIds.has(c.id);
                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50/80 transition ${
                          isSelected ? "bg-orange-50/30" : ""
                        }`}
                      >
                        {/* Checkbox only shown when isSelectMode is active */}
                        {isSelectMode && (
                          <td className="p-3.5 text-center animate-fade-in">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(c.id)}
                              className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
                            />
                          </td>
                        )}

                        {/* Customer Info & Contact */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${getAvatarBg(
                                c.name
                              )}`}
                            >
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/admin/dashboard/customers/${c.id}`}
                                  className="font-bold text-slate-900 hover:text-orange-600 transition truncate"
                                >
                                  {c.name}
                                </Link>
                                {c.isEmailVerified && (
                                  <span title="Verified Account">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                                {c.email && (
                                  <span className="flex items-center gap-1 truncate">
                                    <Mail className="h-3 w-3 text-slate-400" />
                                    {c.email}
                                  </span>
                                )}
                                {c.phone && (
                                  <span className="flex items-center gap-1 truncate font-mono">
                                    <Phone className="h-3 w-3 text-slate-400" />
                                    {c.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {c.isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <UserX className="h-3 w-3" /> BLOCKED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <UserCheck className="h-3 w-3" /> ACTIVE
                            </span>
                          )}
                        </td>

                        {/* Pets Registered */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 text-orange-700 border border-orange-200/70 font-bold text-xs">
                            <PawPrint className="h-3.5 w-3.5" />
                            <span>{c.petsCount} {c.petsCount === 1 ? "Pet" : "Pets"}</span>
                          </span>
                        </td>

                        {/* Orders & Lifetime Spend */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-900 text-xs">
                              ₹{c.totalSpent.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {c.ordersCount} {c.ordersCount === 1 ? "order" : "orders"}
                            </span>
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="p-3.5 text-center whitespace-nowrap text-slate-500 text-[11px]">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* Quick Actions */}
                        <td className="p-3.5 text-right pr-4 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/dashboard/customers/${c.id}`}
                              className="p-1.5 text-slate-500 hover:text-orange-600 rounded-xl hover:bg-slate-100 transition"
                              title="View Customer Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className={`p-1.5 rounded-xl transition ${
                                c.isBlocked
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "text-rose-600 hover:bg-rose-50"
                              }`}
                              title={c.isBlocked ? "Unblock Account" : "Block Account"}
                            >
                              {c.isBlocked ? (
                                <ShieldCheck className="h-4 w-4" />
                              ) : (
                                <ShieldAlert className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS VIEW (md:hidden) */}
          <div className="space-y-3 md:hidden">
            {customers.map((c) => {
              const isSelected = selectedIds.has(c.id);
              return (
                <div
                  key={c.id}
                  className={`clay-card p-4 space-y-3 border transition ${
                    isSelected ? "border-orange-300 bg-orange-50/20" : "border-slate-200/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {isSelectMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(c.id)}
                          className="h-4 w-4 rounded accent-orange-500 cursor-pointer shrink-0"
                        />
                      )}
                      <div
                        className={`h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(
                          c.name
                        )}`}
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/dashboard/customers/${c.id}`}
                            className="font-bold text-slate-900 truncate text-sm"
                          >
                            {c.name}
                          </Link>
                          {c.isEmailVerified && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {c.email || c.phone || "No contact info"}
                        </p>
                      </div>
                    </div>

                    {c.isBlocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        BLOCKED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-2xl text-center text-xs">
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Spent</span>
                      <span className="font-bold text-slate-800 text-xs">₹{c.totalSpent.toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Orders</span>
                      <span className="font-bold text-slate-800 text-xs">{c.ordersCount}</span>
                    </div>
                    <div>
                      <span className="text-[9.5px] text-slate-400 font-bold uppercase block">Pets</span>
                      <span className="font-bold text-orange-600 text-xs">{c.petsCount}</span>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-[10.5px] text-slate-400 font-medium">
                      Joined {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          c.isBlocked
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {c.isBlocked ? "Unblock" : "Block"}
                      </button>

                      <Link
                        href={`/admin/dashboard/customers/${c.id}`}
                        className="px-3 py-1 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================
              5. PAGINATION FOOTER
              ========================================================= */}
          <div className="clay-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-600 border border-slate-200/80">
            <span>
              Showing{" "}
              <strong>
                {pagination.total === 0
                  ? 0
                  : (pagination.page - 1) * pagination.limit + 1}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </strong>{" "}
              of <strong>{pagination.total}</strong> customers
            </span>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
              {/* Page size selector */}
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="text-slate-600 font-medium text-xs">Per page:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="py-1 pl-2.5 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-hidden cursor-pointer appearance-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Prev / Next Page controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage || loading}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-2 text-xs font-bold text-slate-700">
                  {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floating Scroll to Top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-4 z-30 h-11 w-11 rounded-full bg-[#2A241E] text-white shadow-2xl flex items-center justify-center transition-all hover:bg-black active:scale-95 cursor-pointer"
          title="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* Block/Unblock Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="clay-card w-full max-w-md p-6 space-y-4 bg-white shadow-2xl rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {selectedCustomer.isBlocked ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                )}
                <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
                  {selectedCustomer.isBlocked ? "Unblock Account" : "Block Account"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setBlockReason("");
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {selectedCustomer.isBlocked ? (
                <>
                  Are you sure you want to unblock <strong>{selectedCustomer.name}</strong>? They will be permitted to log in and place orders again.
                </>
              ) : (
                <>
                  Blocking <strong>{selectedCustomer.name}</strong> will <strong>immediately terminate active sessions</strong> across web and mobile apps.
                </>
              )}
            </p>

            {!selectedCustomer.isBlocked && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow">
                  Reason for Blocking (Optional)
                </label>
                <textarea
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Fraudulent cancellations, abusive behavior..."
                  className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-800 outline-hidden focus:bg-white focus:border-rose-500 transition"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setBlockReason("");
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl border border-slate-200 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-2xl shadow-xs transition disabled:opacity-50 ${
                  selectedCustomer.isBlocked
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{selectedCustomer.isBlocked ? "Confirm Unblock" : "Confirm Block"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
