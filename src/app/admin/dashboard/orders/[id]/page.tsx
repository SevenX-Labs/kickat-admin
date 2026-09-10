"use client";

import React, { useState, useEffect, use } from "react";
import {
  ArrowLeft,
  Printer,
  Download,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  FileText,
  PackageCheck,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  AdminOrderDetail,
  OrderStatus,
  PaymentStatus,
  formatAddress,
} from "@/types/admin-order";
import { AdminOrderService } from "@/services/adminOrderService";
import UpdateOrderStatusModal from "@/components/orders/UpdateOrderStatusModal";
import CancelOrderModal from "@/components/orders/CancelOrderModal";
import ProcessRefundModal from "@/components/orders/ProcessRefundModal";
import OrderInvoiceModal from "@/components/orders/OrderInvoiceModal";
import PackingSlipModal from "@/components/orders/PackingSlipModal";

const TIMELINE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "PLACED", label: "Placed", desc: "Order received" },
  { status: "PROCESSING", label: "Processing", desc: "Warehouse picking" },
  { status: "PACKED", label: "Packed", desc: "Boxed & labelled" },
  { status: "SHIPPED", label: "Shipped", desc: "With courier partner" },
  { status: "OUT_FOR_DELIVERY", label: "Out For Delivery", desc: "Agent out" },
  { status: "DELIVERED", label: "Delivered", desc: "Handed to customer" },
];

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderIdOrNumber = resolvedParams.id;

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminOrderService.getOrderById(orderIdOrNumber);
      if (res?.data) {
        setOrder(res.data);
      }
    } catch (err) {
      setError(AdminOrderService.extractErrorMessage(err, "Failed to load order details"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdOrNumber) {
      fetchOrder();
    }
  }, [orderIdOrNumber]);

  const copyToClipboard = (text: string, type: "awb" | "txn") => {
    navigator.clipboard?.writeText(text);
    if (type === "awb") {
      setCopiedAwb(true);
      showToast("AWB tracking code copied to clipboard!");
      setTimeout(() => setCopiedAwb(false), 2000);
    } else {
      setCopiedTxn(true);
      showToast("Transaction ID copied to clipboard!");
      setTimeout(() => setCopiedTxn(false), 2000);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "PROCESSING":
      case "PACKED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PLACED":
      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "RETURN_INITIATED":
      case "RETURNED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStepIndex = (currentStatus: OrderStatus) => {
    const map: Record<string, number> = {
      PENDING: 0,
      PLACED: 0,
      PROCESSING: 1,
      PACKED: 2,
      SHIPPED: 3,
      OUT_FOR_DELIVERY: 4,
      DELIVERED: 5,
    };
    return map[currentStatus] ?? -1;
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full min-w-0 pb-16">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/orders"
            className="clay-button flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="space-y-1">
            <div className="h-6 w-48 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-3 w-32 bg-slate-100 animate-pulse rounded" />
          </div>
        </div>
        <div className="clay-card p-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-xs font-semibold">Loading complete order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6 w-full min-w-0 pb-16">
        <Link
          href="/admin/dashboard/orders"
          className="clay-button inline-flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Orders</span>
        </Link>
        <div className="clay-card p-8 bg-rose-50 border border-rose-200 rounded-3xl space-y-3 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h3 className="font-fraunces text-lg font-bold text-rose-900">
            Order Not Found
          </h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            {error || `Unable to locate order #${orderIdOrNumber}. Please check the Order ID or UUID.`}
          </p>
          <button
            onClick={fetchOrder}
            className="clay-btn-orange px-5 py-2 text-xs font-bold text-white inline-flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Loading</span>
          </button>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus === "CANCELLED";
  const isDelivered = order.orderStatus === "DELIVERED";
  const isReturned = order.orderStatus === "RETURNED" || order.orderStatus === "RETURN_INITIATED";
  const customer = order.user || order.customer;
  const address = order.address || order.shippingAddress;
  const latestPayment = order.payments && order.payments.length > 0 ? order.payments[0] : null;

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in border border-slate-700/50">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <Link
            href="/admin/dashboard/orders"
            className="clay-button flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 transition shrink-0"
            title="Back to Orders"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-fraunces text-xl sm:text-2xl font-bold tracking-tight text-[#2A241E] truncate">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase border shrink-0 ${getStatusBadge(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap shrink-0">
          {/* Packing Slip */}
          <button
            onClick={() => setIsSlipModalOpen(true)}
            className="clay-button inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
            title="Print Warehouse Packing Slip"
          >
            <PackageCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Packing Slip</span>
          </button>

          {/* GST Invoice */}
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="clay-button inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-emerald-600 transition"
            title="View GST Tax Invoice"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Tax Invoice</span>
          </button>

          {/* Update Status */}
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="clay-btn-orange inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white transition"
          >
            <Truck className="h-3.5 w-3.5" />
            <span>Update Status</span>
          </button>

          {/* Cancel Order (if not already cancelled or delivered) */}
          {!isCancelled && !isDelivered && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="clay-button inline-flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
              title="Cancel Order & Restock Inventory"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Cancel</span>
            </button>
          )}

          {/* Refund Button (if cancelled or paid) */}
          {(isCancelled || order.paymentStatus === "COMPLETED") && (
            <button
              onClick={() => setIsRefundModalOpen(true)}
              className="clay-button inline-flex items-center gap-1 px-2.5 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
              title="Process Full or Partial Refund"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Refund</span>
            </button>
          )}
        </div>
      </div>

      {/* Cancellation Banner (if cancelled) */}
      {isCancelled && (
        <div className="clay-card p-4 bg-rose-50/80 border border-rose-200/90 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-rose-900">
              Order Cancelled
              {order.cancelledAt && (
                <span className="font-normal text-xs text-rose-700 ml-2">
                  on {new Date(order.cancelledAt).toLocaleString("en-IN")}
                </span>
              )}
            </p>
            <p className="text-slate-700">
              <span className="font-bold">Reason:</span> {order.cancelReason || "Cancelled by admin"}
            </p>
            {order.cancelReasonOther && (
              <p className="text-slate-600 italic">“{order.cancelReasonOther}”</p>
            )}
            <p className="text-[11px] text-emerald-700 font-bold pt-0.5 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Item inventory stock restored to warehouse database.
            </p>
          </div>
        </div>
      )}

      {/* Fulfillment Stepper Tracker */}
      <div className="clay-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
            Fulfillment Lifecycle Timeline
          </h2>
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
          >
            <span>Change Milestone</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Stepper Progress Visual */}
        {isCancelled ? (
          <div className="py-2 text-center text-xs font-semibold text-rose-600">
            Lifecycle terminated due to cancellation.
          </div>
        ) : (
          <div className="relative pt-2 pb-1">
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex items-center justify-between min-w-[580px] relative">
                {/* Connecting background track */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
                {/* Active progress fill */}
                <div
                  className="absolute top-4 left-6 h-1 bg-orange-500 transition-all duration-500 -z-0"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (currentStepIdx / (TIMELINE_STEPS.length - 1)) * 100)
                    )}%`,
                  }}
                />

                {TIMELINE_STEPS.map((step, idx) => {
                  const isDone = currentStepIdx > idx || (currentStepIdx === idx && idx === TIMELINE_STEPS.length - 1);
                  const isCurrent = currentStepIdx === idx && idx !== TIMELINE_STEPS.length - 1;

                  return (
                    <div
                      key={step.status}
                      className="flex flex-col items-center relative z-10 space-y-1.5"
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition shadow-sm ${
                          isDone
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-orange-500 text-white ring-4 ring-orange-100"
                            : "bg-white text-slate-400 border border-slate-300"
                        }`}
                      >
                        {isDone ? (
                          <Check className="h-4 w-4 stroke-[3]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <div className="text-center">
                        <p
                          className={`text-xs font-bold ${
                            isCurrent || isDone ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] text-slate-400">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left 8 Cols: Ordered Items & Invoicing */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Ordered Line Items Card */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-500" />
                <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                  Ordered Items ({order.items?.length || 0})
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {order.itemsCount || order.items?.reduce((s, i) => s + i.quantity, 0) || 0} Total Units
              </span>
            </div>

            {/* Line items list */}
            <div className="divide-y divide-slate-100">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-3 min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover border border-slate-200/80 shrink-0 bg-slate-50"
                        />
                      ) : (
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl border border-slate-200/80 shrink-0 bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                          <Package className="h-6 w-6" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {item.productName}
                        </h3>
                        {item.variantName && (
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            Variant: {item.variantName}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {item.productId.substring(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-extrabold text-[#2A241E]">
                        ₹{item.totalPrice.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10.5px] text-slate-400 font-medium">
                        ₹{item.price.toLocaleString("en-IN")} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No line items found.
                </div>
              )}
            </div>

            {/* Financial Breakdown Card */}
            <div className="clay-inset p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">
                  ₹{order.subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {order.discount !== undefined && order.discount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Promo / Coupon Discount</span>
                  <span className="font-bold">-₹{order.discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Delivery & Shipping Fee</span>
                <span className="font-semibold text-slate-800">
                  {order.deliveryFee > 0 ? `₹${order.deliveryFee.toLocaleString("en-IN")}` : "FREE"}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Applicable GST (CGST + SGST 18% included)</span>
                <span>₹{(order.subtotal * 0.18).toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm sm:text-base font-black text-[#2A241E]">
                <span>Grand Total Amount</span>
                <span className="text-orange-600 font-fraunces">
                  ₹{order.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Customer Notes / Delivery Instructions */}
            {order.notes && (
              <div className="clay-inset p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">
                  Customer Delivery Instructions / Order Notes
                </span>
                <p className="text-xs text-slate-700 italic">“{order.notes}”</p>
              </div>
            )}
          </div>

          {/* Courier & Shipping Logistics Card */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-500" />
                <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                  Courier & Dispatch Logistics
                </h2>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Edit Tracking
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase font-mono-eyebrow">
                  Courier Partner
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {order.courierPartner || "Not Assigned"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase font-mono-eyebrow">
                  Tracking Number / AWB
                </span>
                {order.trackingNumber ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {order.trackingNumber}
                    </span>
                    <button
                      onClick={() => copyToClipboard(order.trackingNumber!, "awb")}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Copy AWB code"
                    >
                      {copiedAwb ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Pending dispatch</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase font-mono-eyebrow">
                  Estimated Delivery
                </span>
                <p className="font-bold text-slate-800">
                  {order.estimatedDelivery
                    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Standard 2-4 business days"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Customer, Address, Payment */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Pet Parent / Customer Details */}
          <div className="clay-card p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-orange-500" />
                <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
                  Customer Details
                </h3>
              </div>
              {customer?.id && (
                <Link
                  href={`/admin/dashboard/customers/${customer.id}`}
                  className="text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  View Profile
                </Link>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 font-black text-sm uppercase">
                  {customer?.name ? customer.name.substring(0, 2) : "CU"}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {customer?.name || "Guest Customer"}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400">
                    ID: {customer?.id ? customer.id.substring(0, 10) + "..." : "Guest"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                {customer?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="clay-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
                Delivery Address
              </h3>
            </div>

            {address ? (
              <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                {address.name && <p className="font-bold text-slate-800">{address.name}</p>}
                <p>{formatAddress(address)}</p>
                {address.phone && (
                  <p className="pt-1 text-[11px] font-bold text-slate-500 font-mono">
                    Contact: {address.phone}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No address provided</p>
            )}
          </div>

          {/* Payment Card */}
          <div className="clay-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
                  Payment Status
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 text-[9.5px] font-black rounded-md border uppercase ${
                  order.paymentStatus === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : order.paymentStatus === "REFUNDED"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : order.paymentStatus === "FAILED"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Method:</span>
                <span className="font-bold text-slate-800">
                  {order.paymentMethod || "UPI / Online"}
                </span>
              </div>

              {latestPayment?.transactionId && (
                <div className="flex items-center justify-between font-mono text-[10.5px]">
                  <span>Txn ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-800 font-bold truncate max-w-[140px]">
                      {latestPayment.transactionId}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(latestPayment.transactionId!, "txn")
                      }
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Copy transaction ID"
                    >
                      {copiedTxn ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Total Paid:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{order.grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isStatusModalOpen && (
        <UpdateOrderStatusModal
          orderId={order.id}
          orderNumber={order.orderNumber}
          currentStatus={order.orderStatus}
          currentCourier={order.courierPartner}
          currentTracking={order.trackingNumber}
          currentEstimatedDelivery={order.estimatedDelivery}
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          onSuccess={(updated) => {
            showToast(`Order status updated to ${updated.orderStatus}`);
            fetchOrder();
          }}
        />
      )}

      {isCancelModalOpen && (
        <CancelOrderModal
          orderId={order.id}
          orderNumber={order.orderNumber}
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onSuccess={() => {
            showToast("Order cancelled and inventory restocked.");
            fetchOrder();
          }}
        />
      )}

      {isRefundModalOpen && (
        <ProcessRefundModal
          orderId={order.id}
          orderNumber={order.orderNumber}
          grandTotal={order.grandTotal}
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          onSuccess={(data) => {
            showToast(`Refund of ₹${data.refundAmount} processed successfully.`);
            fetchOrder();
          }}
        />
      )}

      {isInvoiceModalOpen && (
        <OrderInvoiceModal
          orderId={order.id}
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      )}

      {isSlipModalOpen && (
        <PackingSlipModal
          orderId={order.id}
          isOpen={isSlipModalOpen}
          onClose={() => setIsSlipModalOpen(false)}
        />
      )}
    </div>
  );
}
