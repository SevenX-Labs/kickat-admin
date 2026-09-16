"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Tag } from "lucide-react";
import { ProductVariant } from "@/types/admin-product";

interface ProductCardVariantsProps {
  variants: ProductVariant[];
  productFallbackImage?: string | null;
  productName: string;
}

export function ProductCardVariants({
  variants,
  productFallbackImage,
  productName,
}: ProductCardVariantsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!variants || variants.length === 0) {
    return null;
  }

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="mt-2.5 space-y-2 border-t border-slate-100/90 pt-2">
      {/* Interactive Toggle Control */}
      <button
        type="button"
        onClick={toggleExpand}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Hide" : "Show"} ${variants.length} variants for ${productName}`}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-orange-50/70 hover:bg-orange-100/80 border border-orange-200/70 text-slate-800 text-xs font-bold transition cursor-pointer group"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A00] shrink-0" />
          <span className="truncate">
            {variants.length} {variants.length === 1 ? "Variant" : "Variants"}
          </span>
          <span className="text-[10.5px] text-[#FF7A00] font-semibold hidden sm:inline">
            ({isExpanded ? "Hide" : "View breakdown"})
          </span>
        </div>
        <div className="flex items-center gap-1 text-[#FF7A00] shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 transition-transform" />
          ) : (
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          )}
        </div>
      </button>

      {/* Expanded Variants List */}
      {isExpanded && (
        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {variants.map((v, i) => {
            const vImages = Array.isArray(v.images) && v.images.length > 0
              ? v.images
              : (v.imageUrl ? [v.imageUrl] : []);

            const variantImage = v.imageUrl || vImages[0] || productFallbackImage;
            const extraCount = vImages.length > 1 ? vImages.length - 1 : 0;
            const isDiscounted = Boolean(v.discountPrice && v.discountPrice < v.price);

            const attrEntries = Object.entries(v.attributes || {});

            return (
              <div
                key={v.id || `var-${i}`}
                className={`p-2.5 rounded-xl border text-xs transition bg-white space-y-1.5 ${
                  v.isDefault
                    ? "border-orange-300 ring-1 ring-orange-200/60 shadow-2xs"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Variant Thumbnail */}
                    <div className="relative h-10 w-10 rounded-lg bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                      {variantImage ? (
                        <img
                          src={variantImage}
                          alt={v.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            if (productFallbackImage && e.currentTarget.src !== productFallbackImage) {
                              e.currentTarget.src = productFallbackImage;
                            }
                          }}
                        />
                      ) : (
                        <Tag className="h-4 w-4 text-slate-300" />
                      )}

                      {/* Multi-image indicator badge */}
                      {extraCount > 0 && (
                        <span className="absolute bottom-0 right-0 bg-slate-900/80 text-white font-mono font-extrabold text-[8px] px-1 rounded-tl shadow-2xs">
                          +{extraCount}
                        </span>
                      )}
                    </div>

                    {/* Variant Title & SKU */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
                          {v.name || `Option ${i + 1}`}
                        </span>

                        {v.isDefault && (
                          <span className="px-1.5 py-0.2 rounded bg-[#FF7A00] text-white text-[9px] font-extrabold uppercase tracking-wider shadow-2xs">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-mono truncate mt-0.5">
                        {v.sku ? (
                          <span className="truncate">SKU: {v.sku}</span>
                        ) : (
                          <span className="italic text-slate-300">No SKU</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing & Stock */}
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="font-fraunces font-bold text-slate-900">
                        ₹{(v.discountPrice ?? v.price).toLocaleString("en-IN")}
                      </span>
                      {isDiscounted && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{v.price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5">
                      {v.stock === 0 ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.2 rounded inline-block">
                          Out of stock
                        </span>
                      ) : v.stock <= 10 ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded inline-block">
                          {v.stock} left (low)
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-semibold text-emerald-700">
                          {v.stock} in stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attributes Pills (if present) */}
                {attrEntries.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                    {attrEntries.map(([k, val], aIdx) => (
                      <span
                        key={aIdx}
                        className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                      >
                        <span className="font-semibold text-slate-500 capitalize">{k}:</span> {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
