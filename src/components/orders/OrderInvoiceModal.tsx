"use client";

import React, { useEffect, useState } from "react";
import { X, Printer, Download, Loader2, AlertCircle, CheckCircle2, ShieldCheck, FileText } from "lucide-react";
import { OrderInvoiceData, formatAddress } from "@/types/admin-order";
import { AdminOrderService } from "@/services/adminOrderService";

interface OrderInvoiceModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const [invoice, setInvoice] = useState<OrderInvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchInvoice();
    } else {
      setInvoice(null);
      setError(null);
    }
  }, [isOpen, orderId]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminOrderService.getInvoice(orderId);
      setInvoice(res.data);
    } catch (err) {
      setError(AdminOrderService.extractErrorMessage(err, "Failed to load GST tax invoice"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-fade-in">
      {/* Container */}
      <div 
        className="clay-modal w-full max-w-3xl bg-white overflow-hidden my-auto print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Actions Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            <div>
              <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                GST Tax Invoice
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Official electronic tax invoice receipt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || !invoice}
              className="clay-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition disabled:opacity-40"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-xs font-semibold">Generating GST compliant tax invoice...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Failed to load invoice</p>
                <p>{error}</p>
              </div>
              <button
                onClick={fetchInvoice}
                className="ml-auto underline font-bold hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          ) : invoice ? (
            <div className="space-y-6 text-slate-800 text-xs leading-relaxed" id="printable-invoice">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-900">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-fraunces text-2xl font-black tracking-tight text-orange-600">
                      KICKAT
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-slate-900 text-white tracking-widest">
                      TAX INVOICE
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-700 mt-1">
                    Kickat Pet Care E-Commerce Private Limited
                  </p>
                  <p className="text-[10px] text-slate-500">
                    GSTIN: 27AAECK9928P1Z4 • CIN: U52100MH2024PTC98201
                  </p>
                  <p className="text-[10px] text-slate-500">
                    B-404, Tech Park, Andheri East, Mumbai, Maharashtra - 400069
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <p className="font-mono font-bold text-sm text-slate-900">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Date: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Order Ref: <span className="font-mono font-bold text-slate-800">{invoice.orderNumber}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Payment: <span className="font-bold text-slate-800">{invoice.payment.method} ({invoice.payment.status})</span>
                  </p>
                </div>
              </div>

              {/* Customer & Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">
                    Billed To (Customer):
                  </p>
                  <p className="font-bold text-slate-900 text-sm">{invoice.customer.name}</p>
                  {invoice.customer.phone && <p className="text-slate-600">Phone: {invoice.customer.phone}</p>}
                  {invoice.customer.email && <p className="text-slate-600">Email: {invoice.customer.email}</p>}
                  {invoice.billingAddress && (
                    <p className="text-slate-600 pt-0.5">
                      {formatAddress(invoice.billingAddress)}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">
                    Shipped To (Delivery Destination):
                  </p>
                  <p className="font-bold text-slate-900 text-sm">{invoice.customer.name}</p>
                  {invoice.shippingAddress ? (
                    <p className="text-slate-600">
                      {formatAddress(invoice.shippingAddress)}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">Same as billing address</p>
                  )}
                  <p className="text-[10px] text-slate-500 pt-1 font-mono">
                    Place of Supply: {invoice.shippingAddress?.state || "Maharashtra"} (Code: 27)
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 text-[10px] uppercase font-mono-eyebrow text-slate-500">
                      <th className="py-2 pr-2">#</th>
                      <th className="py-2 px-2">Item & Description</th>
                      <th className="py-2 px-2 text-center">HSN</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-right">Unit Price</th>
                      <th className="py-2 px-2 text-right">GST %</th>
                      <th className="py-2 px-2 text-right">GST Amt</th>
                      <th className="py-2 pl-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2.5 pr-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          {item.variantName && (
                            <p className="text-[10px] text-slate-500">{item.variantName}</p>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-[10px] text-slate-500">
                          230910
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-700">
                          ₹{item.unitPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-600">
                          {item.taxRate}
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-600">
                          ₹{item.taxAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 pl-2 text-right font-black text-slate-900">
                          ₹{item.totalPrice.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals & Tax Breakdown */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4 border-t-2 border-slate-200">
                <div className="space-y-2 max-w-sm">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      GST Compliance Declaration
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-500">
                      Invoice issued under Section 31 of CGST Act, 2017. Tax is payable on reverse charge: No.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-bold text-slate-800">₹{invoice.summary.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>CGST (9%):</span>
                    <span>₹{invoice.summary.taxBreakdown.cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>SGST (9%):</span>
                    <span>₹{invoice.summary.taxBreakdown.sgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charges:</span>
                    <span>{invoice.summary.deliveryFee > 0 ? `₹${invoice.summary.deliveryFee.toLocaleString("en-IN")}` : "FREE"}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-orange-600">₹{invoice.summary.grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Signature / Footer */}
              <div className="pt-6 border-t border-slate-100 flex items-end justify-between text-[10px] text-slate-400">
                <p>This is a computer-generated tax invoice requiring no physical signature.</p>
                <div className="text-right">
                  <p className="font-bold text-slate-700">Kickat Pet Care Pvt Ltd</p>
                  <p className="italic text-[9.5px]">Authorized Signatory</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderInvoiceModal;
