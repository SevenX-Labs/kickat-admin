"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { AdminOrderSortEnum } from "@/types/admin-order";

interface OrderSortDropdownProps {
  value: AdminOrderSortEnum;
  onChange: (val: AdminOrderSortEnum) => void;
}

const SORT_OPTIONS: { value: AdminOrderSortEnum; label: string; shortLabel: string }[] = [
  { value: "createdAt_desc", label: "Latest First", shortLabel: "Latest" },
  { value: "createdAt_asc", label: "Oldest First", shortLabel: "Oldest" },
  { value: "grandTotal_desc", label: "Highest Value", shortLabel: "Highest ₹" },
  { value: "grandTotal_asc", label: "Lowest Value", shortLabel: "Lowest ₹" },
];

export const OrderSortDropdown: React.FC<OrderSortDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const currentOption = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger Button (44px min touch target) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 min-h-[44px] rounded-xl border border-slate-200/80 bg-white hover:bg-[#FAF7F2] px-2.5 sm:px-3 text-xs text-left transition flex items-center justify-between gap-1.5 cursor-pointer text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
          isOpen ? "ring-2 ring-orange-500/20 border-orange-400" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate hidden sm:inline">{currentOption.label}</span>
          <span className="truncate sm:hidden">{currentOption.shortLabel}</span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-orange-500" : ""
          }`}
        />
      </button>

      {/* Floating Menu Panel */}
      {isOpen && (
        <>
          {/* Mobile Backdrop to catch tap outside */}
          <div
            className="fixed inset-0 z-40 bg-transparent sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="listbox"
            className="absolute top-full right-0 mt-1.5 w-48 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden p-1.5 space-y-0.5 text-xs animate-fade-in"
          >
            {SORT_OPTIONS.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-xl text-left font-medium flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? "bg-orange-50 text-orange-800 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-orange-600 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderSortDropdown;
