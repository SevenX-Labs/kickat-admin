"use client";

import React from "react";
import { Package, Layers, Check } from "lucide-react";

export type SellingMode = "single" | "options";

export interface ProductSellingModeProps {
  mode: SellingMode;
  onChange: (mode: SellingMode) => void;
}

export function ProductSellingMode({ mode, onChange }: ProductSellingModeProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          How is this product sold? *
        </label>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose whether this product has a single price and inventory, or multiple options with different prices and stock.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: Single Product */}
        <button
          type="button"
          onClick={() => onChange("single")}
          className={`relative flex items-start p-4 rounded-2xl border text-left transition cursor-pointer select-none ${
            mode === "single"
              ? "bg-[#FFF8F2] border-[#FF7A00] ring-2 ring-[#FF7A00]/20 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 mr-3.5 transition ${
              mode === "single"
                ? "bg-[#FF7A00] text-white shadow-xs"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Package className="h-5 w-5" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Single Product</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              One price and one stock quantity. Best for standalone items with no variation.
            </p>
          </div>

          {mode === "single" && (
            <div className="absolute top-4 right-4 h-5 w-5 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-xs">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          )}
        </button>

        {/* Card 2: Product with Options */}
        <button
          type="button"
          onClick={() => onChange("options")}
          className={`relative flex items-start p-4 rounded-2xl border text-left transition cursor-pointer select-none ${
            mode === "options"
              ? "bg-[#FFF8F2] border-[#FF7A00] ring-2 ring-[#FF7A00]/20 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 mr-3.5 transition ${
              mode === "options"
                ? "bg-[#FF7A00] text-white shadow-xs"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Layers className="h-5 w-5" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Product with Options</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Different colors, sizes, weights or packs can have different prices and stock.
            </p>
          </div>

          {mode === "options" && (
            <div className="absolute top-4 right-4 h-5 w-5 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-xs">
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
