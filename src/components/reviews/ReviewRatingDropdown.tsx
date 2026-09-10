"use client";

import React, { useState, useRef, useEffect } from "react";
import { Star, ChevronDown, Check } from "lucide-react";

interface ReviewRatingDropdownProps {
  value: number;
  onChange: (val: number) => void;
}

const RATING_OPTIONS = [
  { value: 0, label: "All Ratings", shortLabel: "All ★" },
  { value: 5, label: "5 Stars Only", shortLabel: "5 ★" },
  { value: 4, label: "4 Stars", shortLabel: "4 ★" },
  { value: 3, label: "3 Stars", shortLabel: "3 ★" },
  { value: 2, label: "2 Stars", shortLabel: "2 ★" },
  { value: 1, label: "1 Star", shortLabel: "1 ★" },
];

export const ReviewRatingDropdown: React.FC<ReviewRatingDropdownProps> = ({
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

  const currentOption = RATING_OPTIONS.find((o) => o.value === value) || RATING_OPTIONS[0];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-10 min-h-[40px] rounded-xl border border-slate-200/80 bg-white hover:bg-[#FAF7F2] px-3 text-xs text-left transition flex items-center justify-between gap-1.5 cursor-pointer text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
          isOpen ? "ring-2 ring-orange-500/20 border-orange-400" : ""
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Star className={`h-3.5 w-3.5 shrink-0 ${value > 0 ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
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
          <div
            className="fixed inset-0 z-40 bg-transparent sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="listbox"
            className="absolute top-full left-0 sm:right-0 sm:left-auto mt-1.5 w-44 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden p-1.5 space-y-0.5 text-xs animate-in fade-in"
          >
            {RATING_OPTIONS.map((opt) => {
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
                  <div className="flex items-center gap-1.5">
                    {opt.value > 0 ? (
                      <span className="flex items-center gap-1">
                        <span>{opt.value}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </span>
                    ) : (
                      <span>All Ratings</span>
                    )}
                  </div>
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

export default ReviewRatingDropdown;
