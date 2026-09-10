"use client";

import React, { useEffect, useState } from "react";
import { X, Printer, PackageCheck, Loader2, AlertCircle, CheckSquare, Square, Barcode } from "lucide-react";
import { OrderPackingSlipData, formatAddress } from "@/types/admin-order";
import { AdminOrderService } from "@/services/adminOrderService";

interface PackingSlipModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const [slip, setSlip] = useState<OrderPackingSlipData | null>(null);
  const [pickedMap, setPickedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchPackingSlip();
    } else {
      setSlip(null);
      setError(null);
      setPickedMap({});
    }
  }, [isOpen, orderId]);

  const fetchPackingSlip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminOrderService.getPackingSlip(orderId);
      setSlip(res.data);
      const initialMap: Record<number, boolean> = {};
      res.data.packageItems.forEach((item, idx) => {
        initialMap[item.itemNumber || idx] = item.picked || false;
      });
      setPickedMap(initialMap);
    } catch (err) {
      setError(AdminOrderService.extractErrorMessage(err, "Failed to load packing slip"));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const togglePicked = (itemNum: number) => {
    setPickedMap((prev) => ({ ...prev, [itemNum]: !prev[itemNum] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white animate-fade-in">
      <div 
        className="clay-modal w-full max-w-2xl bg-white overflow-hidden my-auto print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header (Hidden on Print) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                Warehouse Fulfillment Packing Slip
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Picking checklist & dispatch packaging slip
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || !slip}
              className="clay-button inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition disabled:opacity-40"
            >
              <Printer className="h-4 w-4" />
              <span>Print Slip</span>
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
        <div className="p-5 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-xs font-semibold">Preparing warehouse picking list...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Failed to load slip</p>
                <p>{error}</p>
              </div>
              <button
                onClick={fetchPackingSlip}
                className="ml-auto underline font-bold hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          ) : slip ? (
            <div className="space-y-5 text-slate-800 text-xs leading-relaxed" id="printable-slip">
              {/* Slip Header & Barcode */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-900">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-fraunces text-xl font-black text-slate-900">
                      KICKAT FULFILLMENT
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                      PACKING SLIP
                    </span>
                  </div>
                  <p className="font-mono text-xs font-bold text-slate-700 mt-1">
                    {slip.slipNumber}
                  </p>
                  <p className="text-[10.5px] text-slate-400">
                    Generated: {new Date(slip.generatedAt).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Barcode Mock Visual */}
                <div className="text-center sm:text-right">
                  <div className="inline-block p-1 bg-white border border-slate-300 rounded font-mono text-center">
                    <div className="tracking-[4px] font-black text-xs text-slate-900 py-1">
                      ||| | |||| | ||| |||| |
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                      *{slip.barcode}*
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Meta & Dispatch Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                    Shipping Details:
                  </p>
                  <p className="font-bold text-slate-900 text-sm">{slip.customer.name}</p>
                  {slip.customer.phone && <p className="text-slate-600">Tel: {slip.customer.phone}</p>}
                  {slip.shippingAddress && (
                    <p className="text-slate-600 leading-snug">
                      {formatAddress(slip.shippingAddress)}
                    </p>
                  )}
                  {slip.deliveryInstructions && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg mt-1 border border-amber-200 italic">
                      Note: {slip.deliveryInstructions}
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:text-right">
                  <p className="text-[10px] font-bold uppercase text-slate-400 font-mono-eyebrow">
                    Courier Logistics:
                  </p>
                  <p className="font-bold text-slate-900 text-sm">
                    {slip.courierPartner || "Standard Delivery"}
                  </p>
                  <p className="font-mono text-slate-600 text-[11px]">
                    AWB: {slip.trackingNumber || "To be generated at dispatch"}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Order Number: <span className="font-mono font-bold text-slate-800">{slip.orderNumber}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Order Date: {new Date(slip.orderDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Picking Items Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>Items to Pick & Pack ({slip.totalItemsCount} line items, {slip.totalUnitsCount} units total)</span>
                  <span className="text-[10px] text-slate-400 print:hidden">Click checkbox when picked</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-mono-eyebrow text-slate-500">
                        <th className="py-2 px-3 text-center w-12">Pick</th>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3">Variant / Spec</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {slip.packageItems.map((item, idx) => {
                        const itemNum = item.itemNumber || idx;
                        const isPicked = pickedMap[itemNum] || false;

                        return (
                          <tr 
                            key={idx}
                            onClick={() => togglePicked(itemNum)}
                            className={`cursor-pointer transition-colors ${
                              isPicked ? "bg-emerald-50/50" : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              {isPicked ? (
                                <CheckSquare className="h-4 w-4 text-emerald-600 inline" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400 inline" />
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <p className={`font-bold ${isPicked ? "line-through text-slate-400" : "text-slate-900"}`}>
                                {item.productName}
                              </p>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">
                              {item.variantName || "Standard"}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black text-slate-900 text-sm">
                              {item.quantity}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Warehouse Verification Footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[10.5px] text-slate-500">
                <div className="space-y-1">
                  <p>Quality Checked by: _______________________</p>
                  <p>Packed by: _______________________________</p>
                </div>
                <div className="sm:text-right space-y-1">
                  <p className="font-bold text-slate-700">Total Units Packed: {slip.totalUnitsCount}</p>
                  <p className="text-[9.5px]">Package Seal & Security Tape Verified</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PackingSlipModal;
