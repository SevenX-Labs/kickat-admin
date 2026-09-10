"use client";

import React, { useState, useRef, useEffect } from "react";
import { Truck, ChevronDown, Check } from "lucide-react";

interface ShipmentCourierDropdownProps {
  value: string;
  onChange: (val: string) => void;
}

const COURIER_OPTIONS = [
  { value: "ALL", label: "All Couriers", shortLabel: "All Couriers" },
  { value: "Delhivery", label: "Delhivery", shortLabel: "Delhivery" },
  { value: "Blue Dart", label: "Blue Dart", shortLabel: "Blue Dart" },
  { value: "Shiprocket", label: "Shiprocket", shortLabel: "Shiprocket" },
  { value: "Shadowfax", label: "Shadowfax", shortLabel: "Shadowfax" },
  { value: "DTDC", label: "DTDC", shortLabel: "DTDC" },
  { value: "Xpressbees", label: "Xpressbees", shortLabel: "Xpressbees" },
];

export const ShipmentCourierDropdown: React.FC<ShipmentCourierDropdownProps> = ({
  value,
  onChange,
}) => {
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

  const currentOption =
    COURIER_OPTIONS.find((o) => o.value === value) || COURIER_OPTIONS[0];
  const isFiltered = value !== "ALL";

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Trigger Button (44px min touch target) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 min-h-[44px] rounded-xl border px-2.5 sm:px-3 text-xs text-left transition flex items-center justify-between gap-1.5 cursor-pointer font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
          isFiltered
            ? "bg-orange-50/90 border-orange-300 text-orange-950 ring-1 ring-orange-200/60 shadow-xs"
            : "bg-white hover:bg-[#FAF7F2] border-slate-200/80 text-slate-700"
        } ${isOpen ? "ring-2 ring-orange-500/20 border-orange-400" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <Truck
            className={`h-3.5 w-3.5 shrink-0 ${isFiltered ? "text-orange-600" : "text-slate-400"}`}
          />
          <span className="truncate hidden sm:inline">{currentOption.label}</span>
          <span className="truncate sm:hidden">{currentOption.shortLabel}</span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-orange-500" : isFiltered ? "text-orange-600" : "text-slate-400"
          }`}
        />
      </button>

      {/* Floating Menu Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile tap outside */}
          <div
            className="fixed inset-0 z-40 bg-transparent sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="listbox"
            className="absolute top-full right-0 mt-1.5 w-48 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden p-1.5 space-y-0.5 text-xs animate-fade-in"
          >
            {COURIER_OPTIONS.map((opt) => {
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
                  className={`w-full min-h-[42px] px-3 py-2 rounded-xl text-left font-medium flex items-center justify-between transition cursor-pointer ${
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

export default ShipmentCourierDropdown;
