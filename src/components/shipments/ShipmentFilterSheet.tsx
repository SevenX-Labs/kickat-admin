"use client";

import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, Check, RotateCcw, Truck, Package } from "lucide-react";
import { ShipmentStatus } from "@/types/admin-shipping";

interface ShipmentFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  status: "ALL" | ShipmentStatus;
  onStatusChange: (st: "ALL" | ShipmentStatus) => void;
  courier: string;
  onCourierChange: (c: string) => void;
  onApply: () => void;
  onClearAll: () => void;
  activeCount: number;
}

const STATUS_OPTIONS: { label: string; value: "ALL" | ShipmentStatus }[] = [
  { label: "All Shipments", value: "ALL" },
  { label: "Pending Pickup", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Returns / RTO", value: "RETURN_INITIATED" },
];

const COURIER_OPTIONS: { label: string; value: string }[] = [
  { label: "All Couriers", value: "ALL" },
  { label: "Delhivery", value: "Delhivery" },
  { label: "Blue Dart", value: "Blue Dart" },
  { label: "Shiprocket", value: "Shiprocket" },
  { label: "Shadowfax", value: "Shadowfax" },
  { label: "DTDC", value: "DTDC" },
  { label: "Xpressbees", value: "Xpressbees" },
];

export const ShipmentFilterSheet: React.FC<ShipmentFilterSheetProps> = ({
  isOpen,
  onClose,
  status,
  onStatusChange,
  courier,
  onCourierChange,
  onApply,
  onClearAll,
  activeCount,
}) => {
  // Temporary local state while sheet is open
  const [localStatus, setLocalStatus] = useState<"ALL" | ShipmentStatus>(status);
  const [localCourier, setLocalCourier] = useState<string>(courier);

  useEffect(() => {
    if (isOpen) {
      setLocalStatus(status);
      setLocalCourier(courier);
    }
  }, [isOpen, status, courier]);

  if (!isOpen) return null;

  const handleApply = () => {
    onStatusChange(localStatus);
    onCourierChange(localCourier);
    onApply();
    onClose();
  };

  const handleReset = () => {
    setLocalStatus("ALL");
    setLocalCourier("ALL");
    onClearAll();
    onClose();
  };

  const currentActiveCount =
    (localStatus !== "ALL" ? 1 : 0) +
    (localCourier !== "ALL" ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs animate-fade-in">
      {/* Backdrop tap to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Sheet Container */}
      <div
        className="clay-modal relative w-full sm:max-w-md max-h-[88vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-up z-10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipment-filter-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 id="shipment-filter-title" className="font-fraunces text-base font-bold text-slate-900">
                Filter Shipments
              </h3>
              {currentActiveCount > 0 && (
                <p className="text-[10.5px] text-orange-600 font-bold">
                  {currentActiveCount} active filter{currentActiveCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Delivery Milestone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-slate-400" />
                <span>Delivery Milestone</span>
              </label>
              {localStatus !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setLocalStatus("ALL")}
                  className="text-[10.5px] font-bold text-orange-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {STATUS_OPTIONS.map((st) => {
                const isSelected = localStatus === st.value;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setLocalStatus(st.value)}
                    className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center text-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-[#FF7A00] text-white shadow-xs"
                        : "bg-[#F8F5F1] text-slate-700 hover:bg-slate-200/60 border border-slate-200/70"
                    }`}
                  >
                    <span className="truncate">{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Courier Partner */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase font-mono-eyebrow tracking-wider flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-slate-400" />
                <span>Courier Partner</span>
              </label>
              {localCourier !== "ALL" && (
                <button
                  type="button"
                  onClick={() => setLocalCourier("ALL")}
                  className="text-[10.5px] font-bold text-orange-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {COURIER_OPTIONS.map((c) => {
                const isSelected = localCourier === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setLocalCourier(c.value)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center text-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? "bg-[#FF7A00] text-white shadow-xs"
                        : "bg-[#F8F5F1] text-slate-700 hover:bg-slate-200/60 border border-slate-200/70"
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#FAF7F2] border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
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

export default ShipmentFilterSheet;
