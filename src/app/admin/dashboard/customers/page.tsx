"use client";

import { 
  Users, 
  Search, 
  Download, 
  Eye, 
  Mail, 
  Phone, 
  Heart,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Check,
  RefreshCw,
  UserCheck,
  UserX
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

  // Status flags
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Block/Unblock modal state
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerItem | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Search input debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
  const handleExportCSV = () => {
    if (customers.length === 0) {
      showToast("No customers available to export.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Status", "Orders Count", "Pets Count", "Lifetime Spend (INR)", "Joined Date"];
    const rows = customers.map((c) => [
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

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kickat-customers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Customer directory exported successfully.");
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-12 w-full min-w-0 no-scrollbar">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
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
            className="clay-button inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-orange-600" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="clay-button inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="clay-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">
              Total Customers
            </span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">
            {summary.totalCustomers.toLocaleString()}
          </p>
          <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5 truncate">Registered on platform</p>
        </div>

        {/* Metric 2 */}
        <div className="clay-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 font-mono-eyebrow">
              Active Accounts
            </span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {summary.activeCustomersCount.toLocaleString()}
          </p>
          <p className="text-[10.5px] font-semibold text-emerald-600/80 mt-0.5 truncate">In good standing</p>
        </div>

        {/* Metric 3 */}
        <div className="clay-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 font-mono-eyebrow">
              Verified Profiles
            </span>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
            {summary.verifiedCustomersCount.toLocaleString()}
          </p>
          <p className="text-[10.5px] font-semibold text-indigo-600/80 mt-0.5 truncate">Verified email / phone</p>
        </div>

        {/* Metric 4 */}
        <div className="clay-card p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 font-mono-eyebrow">
              Blocked Accounts
            </span>
            <UserX className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
            {summary.blockedCustomersCount.toLocaleString()}
          </p>
          <p className="text-[10.5px] font-semibold text-rose-600/80 mt-0.5 truncate">Sessions revoked</p>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="clay-card p-3 sm:p-3.5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by customer name, email, or phone number..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Sort Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
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
                  px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer active:scale-95
                  ${filterTab === tab.id 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="shrink-0">
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as AdminCustomerSortType);
                setCurrentPage(1);
              }}
              className="rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-1.5 px-2.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-orange-500 transition cursor-pointer"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Customers List */}
      {loading ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-xs font-medium">Loading customers directory...</p>
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
              }}
              className="clay-button px-3.5 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-50 transition cursor-pointer mt-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Customer Cards (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {customers.map((cust) => {
              const initials = cust.name
                ? cust.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0].toUpperCase())
                    .join("")
                : "C";

              return (
                <div key={cust.id} className="clay-card p-4 space-y-3 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#8C83FF] text-white text-xs font-bold shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-900 truncate">{cust.name}</h3>
                          {cust.isEmailVerified && (
                            <span title="Email Verified" className="inline-flex items-center shrink-0"><CheckCircle2 className="h-3 w-3 text-emerald-500" /></span>
                          )}
                        </div>
                        <p className="text-[10.5px] text-slate-500 truncate">
                          {cust.petsCount > 0 ? `${cust.petsCount} pet profile${cust.petsCount > 1 ? "s" : ""} 🐾` : "No registered pets"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`
                        px-2 py-0.5 text-[9.5px] font-bold rounded-full shrink-0 uppercase
                        ${cust.isBlocked 
                          ? "bg-rose-50 text-rose-700 border border-rose-200" 
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }
                      `}
                    >
                      {cust.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Total Orders</span>
                      <span className="font-extrabold text-slate-800">{cust.ordersCount} orders</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium block">Lifetime Spend</span>
                      <span className="text-sm font-black text-slate-900">₹{cust.totalSpent.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{cust.email || cust.phone || "No contact info"}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          cust.isBlocked
                            ? "text-emerald-700 hover:bg-emerald-50"
                            : "text-rose-600 hover:bg-rose-50"
                        }`}
                        title={cust.isBlocked ? "Unblock Account" : "Block Account"}
                      >
                        {cust.isBlocked ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      </button>

                      <Link
                        href={`/admin/dashboard/customers/${cust.id}`}
                        className="clay-button px-3 py-1 font-bold text-slate-700 hover:text-indigo-600 transition shrink-0"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Responsive Customers Table (>= md) */}
          <div className="clay-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
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

                    return (
                      <tr key={cust.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#8C83FF] text-white text-xs font-bold shadow-xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 truncate">{cust.name}</p>
                                {cust.isEmailVerified && (
                                  <span title="Email Verified" className="inline-flex items-center shrink-0"><CheckCircle2 className="h-3 w-3 text-emerald-500" /></span>
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
                          <span className="rounded-lg bg-orange-50 px-2 py-0.5 text-[10.5px] font-semibold text-orange-800 border border-orange-100">
                            {cust.petsCount > 0 ? `${cust.petsCount} pet${cust.petsCount > 1 ? "s" : ""} 🐾` : "0 pets"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-slate-700">
                          {cust.ordersCount}
                        </td>

                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          ₹{cust.totalSpent.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`
                              inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase
                              ${cust.isBlocked
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
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
                              className={`clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg transition cursor-pointer ${
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
                              className="clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 transition"
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

          {/* Pagination Strip */}
          <div className="clay-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-800">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-800">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-bold text-slate-800">{pagination.total}</span> customers
            </div>

            <div className="flex items-center gap-3">
              {/* Limit Selector */}
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg bg-[#F8F5F1] border border-slate-200/60 py-1 px-2 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="clay-button flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-2 font-bold text-slate-700">
                  {pagination.page} / {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="clay-button flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Block / Unblock Modal */}
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
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={actionLoading}
                className={`
                  flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50
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
