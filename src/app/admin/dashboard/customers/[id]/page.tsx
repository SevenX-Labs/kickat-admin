"use client";

import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Award, 
  Heart, 
  Calendar, 
  DollarSign, 
  Check, 
  Plus, 
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  ShoppingBasket,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use, useCallback } from "react";
import { AdminCustomerService } from "@/services/adminCustomerService";
import { 
  AdminCustomerDetail, 
  CustomerOrderHistoryItem,
  PaginationMeta 
} from "@/types/admin-customer";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const customerId = resolvedParams.id;

  // Profile data & loading
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [orders, setOrders] = useState<CustomerOrderHistoryItem[]>([]);
  const [ordersPagination, setOrdersPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Block modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Internal staff notes (persisted per customer in localStorage)
  const [note, setNote] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load profile details
  const fetchCustomerProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminCustomerService.getCustomerById(customerId);
      setCustomer(data);

      // Load saved admin notes for this customer
      if (typeof window !== "undefined") {
        const savedNote = localStorage.getItem(`ka_cust_note_${customerId}`);
        if (savedNote) setNote(savedNote);
      }
    } catch (err: any) {
      const msg = AdminCustomerService.extractErrorMessage(err, "Failed to load customer profile.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Load orders history
  const fetchCustomerOrders = useCallback(async (page = 1) => {
    setOrdersLoading(true);
    try {
      const res = await AdminCustomerService.getCustomerOrders(customerId, {
        page,
        limit: 5,
      });
      if (res) {
        setOrders(res.orders || []);
        if (res.pagination) setOrdersPagination(res.pagination);
      }
    } catch (err: any) {
      console.error("Failed to load customer orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerProfile();
    fetchCustomerOrders(1);
  }, [fetchCustomerProfile, fetchCustomerOrders]);

  // Save admin internal note
  const handleSaveNote = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`ka_cust_note_${customerId}`, note);
      showToast("Internal note saved successfully!");
    }
  };

  // Block / Unblock customer
  const handleStatusToggle = async () => {
    if (!customer) return;
    setActionLoading(true);
    try {
      const nextBlocked = !customer.isBlocked;
      const res = await AdminCustomerService.updateCustomerStatus(
        customer.id,
        nextBlocked,
        nextBlocked ? blockReason.trim() || undefined : undefined
      );

      setCustomer((prev) => (prev ? { ...prev, isBlocked: nextBlocked } : null));
      setIsBlockModalOpen(false);
      setBlockReason("");
      showToast(
        res.message ||
        (nextBlocked
          ? "Customer blocked and all active sessions revoked."
          : "Customer account unblocked successfully.")
      );
    } catch (err: any) {
      const msg = AdminCustomerService.extractErrorMessage(err, "Failed to update customer status.");
      showToast(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="clay-card p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-xs font-medium">Loading customer profile & stats...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="clay-card p-12 flex flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500" />
        <h2 className="font-fraunces text-base font-bold text-slate-800">
          {error || "Customer not found"}
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <Link
            href="/admin/dashboard/customers"
            className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Back to Directory
          </Link>
          <button
            onClick={() => fetchCustomerProfile()}
            className="clay-button px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, pets, addresses } = customer;
  const initials = customer.name
    ? customer.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "C";

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 pb-16 no-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <Link
            href="/admin/dashboard/customers"
            className="clay-button flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 transition shrink-0"
            title="Back to Customers"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#8C83FF] text-white text-xs sm:text-sm font-bold shadow-xs">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-fraunces text-xl sm:text-2xl font-bold tracking-tight text-[#2A241E] truncate">
                  {customer.name}
                </h1>

                <span
                  className={`
                    px-2.5 py-0.5 text-[10px] font-black rounded-full shrink-0 uppercase
                    ${customer.isBlocked 
                      ? "bg-rose-50 text-rose-700 border border-rose-200" 
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }
                  `}
                >
                  {customer.isBlocked ? "Account Blocked" : "Active Customer"}
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Customer ID: <span className="font-mono text-slate-700">{customer.id}</span> • Member since{" "}
                {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto pl-11 sm:pl-0">
          <button
            onClick={() => setIsBlockModalOpen(true)}
            className={`
              clay-button inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer
              ${customer.isBlocked
                ? "text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                : "text-rose-600 hover:bg-rose-50 border border-rose-200"
              }
            `}
          >
            {customer.isBlocked ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Unblock Account</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Block Account</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="clay-card p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">
            Lifetime Spend
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">
            ₹{stats.totalSpent.toLocaleString("en-IN")}
          </p>
          <p className="text-[10.5px] text-emerald-600 font-semibold mt-0.5">
            Excludes cancelled orders
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">
            Orders Placed
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">
            {stats.totalOrders} <span className="text-xs font-normal text-slate-400">({stats.validOrdersCount} valid)</span>
          </p>
          <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5 truncate">
            {stats.lastOrderDate
              ? `Last order: ${new Date(stats.lastOrderDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`
              : "No orders placed yet"}
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">
            Avg Order Value
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">
            ₹{Math.round(stats.averageOrderValue).toLocaleString("en-IN")}
          </p>
          <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">Per valid order</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 font-mono-eyebrow">
            Engagement
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">
            {stats.wishlistCount} <span className="text-xs font-medium text-slate-500">Wishlist •</span> {stats.cartCount} <span className="text-xs font-medium text-slate-500">Cart</span>
          </p>
          <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">
            {pets.length} registered pet{pets.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left 8 Cols: Registered Pets & Order History */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Registered Pets Card */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                  Registered Pets ({pets.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400">Nutritional & Care Profiles</span>
            </div>

            {pets.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No pet profiles registered by this customer yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {pets.map((pet) => {
                  const isDog = pet.species?.toUpperCase() === "DOG";
                  const isCat = pet.species?.toUpperCase() === "CAT";
                  const iconEmoji = isDog ? "🐕" : isCat ? "🐱" : "🐾";

                  return (
                    <div key={pet.id} className="clay-inset p-3.5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-xs shrink-0">
                        {iconEmoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-black text-slate-800 truncate">{pet.name}</h3>
                          {pet.age !== null && pet.age !== undefined && (
                            <span className="text-[9.5px] font-bold text-slate-400 shrink-0">
                              {pet.age} {pet.age === 1 ? "yr" : "yrs"}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {pet.breed || pet.species} {pet.gender ? `• ${pet.gender}` : ""}
                        </p>
                        {pet.weight && (
                          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                            Weight: {pet.weight} kg
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Orders History */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-indigo-500" />
                <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                  Order History ({ordersPagination.total})
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Page {ordersPagination.page} of {Math.max(1, ordersPagination.totalPages)}
              </span>
            </div>

            {ordersLoading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No orders placed by this customer yet.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => {
                  const status = ord.orderStatus?.toUpperCase() || "PENDING";
                  const isDelivered = status === "DELIVERED";
                  const isShipped = status === "SHIPPED";
                  const isCancelled = status === "CANCELLED";

                  const badgeColor = isDelivered
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isShipped
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : isCancelled
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200";

                  return (
                    <div key={ord.id} className="clay-inset p-3 sm:p-3.5 flex items-center justify-between min-w-0">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-600">
                            {ord.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded-full border ${badgeColor}`}>
                            {status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          • {ord.itemsCount} item{ord.itemsCount === 1 ? "" : "s"}{" "}
                          {ord.paymentMethod ? `via ${ord.paymentMethod}` : ""}
                        </p>
                        {ord.itemsSummary && (
                          <p className="text-[10px] text-slate-400 truncate max-w-md">
                            {ord.itemsSummary}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-xs sm:text-sm font-extrabold text-[#2A241E]">
                          ₹{ord.grandTotal.toLocaleString("en-IN")}
                        </span>
                        <Link
                          href={`/admin/dashboard/orders/${ord.id}`}
                          className="clay-button p-1.5 text-slate-500 hover:text-orange-600 rounded-lg"
                          title="View order details"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Orders Pagination */}
                {ordersPagination.totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => fetchCustomerOrders(ordersPagination.page - 1)}
                      disabled={!ordersPagination.hasPrevPage}
                      className="clay-button px-2.5 py-1 text-xs font-bold text-slate-600 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-600">
                      {ordersPagination.page} / {ordersPagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchCustomerOrders(ordersPagination.page + 1)}
                      disabled={!ordersPagination.hasNextPage}
                      className="clay-button px-2.5 py-1 text-xs font-bold text-slate-600 disabled:opacity-40"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right 4 Cols: Contact Details, Addresses & Internal Notes */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* Customer Details & Verification */}
          <div className="clay-card p-4 sm:p-5 space-y-3.5">
            <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E] pb-2 border-b border-slate-100">
              Account & Verification
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{customer.email || "No email"}</span>
                </div>
                {customer.isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Unverified</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{customer.phone || "No phone"}</span>
                </div>
                {customer.isPhoneVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 shrink-0">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Unverified</span>
                )}
              </div>

              {customer.gender && (
                <div className="flex items-center gap-2 text-slate-500">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Gender: {customer.gender}</span>
                </div>
              )}

              {customer.dob && (
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    DOB: {new Date(customer.dob).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Addresses */}
          <div className="clay-card p-4 sm:p-5 space-y-3.5">
            <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E] pb-2 border-b border-slate-100">
              Saved Delivery Addresses ({addresses.length})
            </h3>

            {addresses.length === 0 ? (
              <p className="text-xs text-slate-400">No saved addresses found.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="clay-inset p-3 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">
                        {addr.street}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-orange-100 text-orange-800 uppercase">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 leading-snug">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal Staff Notes */}
          <div className="clay-card p-4 sm:p-5 space-y-3">
            <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E] pb-2 border-b border-slate-100">
              Admin & Pet Notes
            </h3>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record customer preferences, pet dietary allergies, or internal flags..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              type="button"
              onClick={handleSaveNote}
              className="clay-button w-full py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition cursor-pointer"
            >
              Save Internal Note
            </button>
          </div>

        </div>

      </div>

      {/* Block / Unblock Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4 bg-white shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {customer.isBlocked ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                )}
                <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
                  {customer.isBlocked ? "Unblock Customer Account" : "Block Customer Account"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsBlockModalOpen(false);
                  setBlockReason("");
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {customer.isBlocked ? (
                <>
                  Are you sure you want to unblock <strong>{customer.name}</strong>? They will be allowed to log into mobile and web storefronts again.
                </>
              ) : (
                <>
                  Blocking <strong>{customer.name}</strong> will <strong>immediately revoke all active user refresh sessions</strong>, terminating logins across mobile and web apps.
                </>
              )}
            </p>

            {!customer.isBlocked && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow">
                  Reason for Blocking (Optional)
                </label>
                <textarea
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Fraudulent activity, chargebacks, policy violation..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsBlockModalOpen(false);
                  setBlockReason("");
                }}
                disabled={actionLoading}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={actionLoading}
                className={`
                  flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50
                  ${customer.isBlocked
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                  }
                `}
              >
                {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{customer.isBlocked ? "Confirm Unblock" : "Confirm Block & Revoke"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
