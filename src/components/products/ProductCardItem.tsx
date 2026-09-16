"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { AdminProductItem, ProductStatus, PetSpecies } from "@/types/admin-product";

interface ProductCardItemProps {
  product: AdminProductItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onStatusChange: (newStatus: ProductStatus) => void;
  onViewDetails: () => void;
  onDelete: () => void;
  onUpdateStock: () => void;
  isStatusUpdating?: boolean;
  renderSpeciesIcon: (species?: PetSpecies | null, className?: string) => React.ReactNode;
}

export function ProductCardItem({
  product,
  isSelected,
  onToggleSelect,
  onStatusChange,
  onViewDetails,
  onDelete,
  isStatusUpdating,
  renderSpeciesIcon,
}: ProductCardItemProps) {
  const variants = product.variants || [];
  const hasVariants = variants.length > 0;

  // Find initial active variant index (default variant or index 0)
  const defaultIdx = hasVariants
    ? Math.max(0, variants.findIndex((v) => v.isDefault))
    : 0;

  const [activeVariantIdx, setActiveVariantIdx] = useState<number>(defaultIdx);

  const activeVariant = hasVariants ? variants[activeVariantIdx] || variants[0] : null;

  // Compute displayed image with proper priority (variant image -> product image)
  const activeVariantImgs = activeVariant
    ? (Array.isArray(activeVariant.images) && activeVariant.images.length > 0
        ? activeVariant.images
        : (activeVariant.imageUrl ? [activeVariant.imageUrl] : []))
    : [];

  const displayImage =
    activeVariant?.imageUrl ||
    activeVariantImgs[0] ||
    product.imageUrl ||
    product.images?.[0];

  // Compute displayed pricing
  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayDiscountPrice = activeVariant
    ? activeVariant.discountPrice
    : product.discountPrice;

  const hasDiscount = Boolean(
    displayDiscountPrice && displayDiscountPrice < displayPrice
  );
  const discountPct = hasDiscount
    ? Math.round(((displayPrice - Number(displayDiscountPrice)) / displayPrice) * 100)
    : null;

  const effectivePrice = hasDiscount ? Number(displayDiscountPrice) : displayPrice;

  // Compute displayed stock
  const displayStock = activeVariant ? activeVariant.stock : product.stock;

  // Compute displayed SKU
  const displaySku = activeVariant?.sku || product.slug || product.id.slice(0, 8);

  return (
    <div
      className={`clay-card p-3.5 sm:p-4 flex flex-col justify-between h-full transition-all duration-200 relative group ${
        isSelected ? "ring-2 ring-[#FF7A00] bg-orange-50/20" : "hover:border-slate-300"
      }`}
    >
      {/* Top Media & Header Container */}
      <div>
        {/* Product Image Box (Sleek Compact Height) */}
        <div className="relative h-36 sm:h-40 w-full rounded-2xl bg-[#FBF9F6] border border-slate-200/70 overflow-hidden flex items-center justify-center mb-2.5 group-hover:border-orange-200 transition-colors">
          {/* Checkbox Selector */}
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-3.5 w-3.5 rounded accent-[#FF7A00] cursor-pointer bg-white shadow-xs border border-slate-300"
            />
          </div>

          {/* Unified Status Selector */}
          <div className="absolute top-2 right-2 z-10">
            <div className="relative">
              <select
                value={product.status}
                disabled={isStatusUpdating}
                onChange={(e) => onStatusChange(e.target.value as ProductStatus)}
                className={`text-[10px] font-bold rounded-lg py-0.5 pl-2 pr-4 cursor-pointer appearance-none border shadow-2xs backdrop-blur-xs transition ${
                  product.status === "ACTIVE"
                    ? "bg-emerald-50/95 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : product.status === "DRAFT"
                    ? "bg-amber-50/95 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : "bg-slate-100/95 text-slate-600 border-slate-200 hover:bg-slate-200"
                } disabled:opacity-50`}
                title="Change product status"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Product / Variant Image */}
          {displayImage ? (
            <img
              src={displayImage}
              alt={activeVariant?.name || product.name}
              className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                if (product.imageUrl && e.currentTarget.src !== product.imageUrl) {
                  e.currentTarget.src = product.imageUrl;
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300">
              <div className="p-2.5 rounded-2xl bg-white text-orange-500 mb-0.5 shadow-xs border border-slate-100">
                {renderSpeciesIcon(product.petSpecies, "h-6 w-6")}
              </div>
              <span className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">
                KickAt Original
              </span>
            </div>
          )}
        </div>

        {/* Product Metadata & Title */}
        <div className="space-y-1">
          {/* Category & Species Meta Line */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700 hover:text-orange-600 transition truncate max-w-[110px]">
              {product.category?.name || "Uncategorized"}
            </span>

            {product.petSpecies && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-0.5 text-slate-600 font-medium">
                  {renderSpeciesIcon(product.petSpecies, "h-2.5 w-2.5 text-orange-600")}
                  <span>{product.petSpecies}</span>
                </span>
              </>
            )}

            {product.isBestSeller && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200/60 font-bold text-[9px] px-1 py-0.2 rounded flex items-center gap-0.5">
                <Sparkles className="h-2 w-2 text-amber-600" /> Best Seller
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-fraunces text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-1 hover:text-[#FF7A00] transition">
            <Link href={`/admin/dashboard/products/${product.id}`}>{product.name}</Link>
          </h3>

          {/* SKU Display */}
          <div className="flex items-center gap-1 text-[10.5px] font-mono text-slate-400 truncate">
            <span className="truncate">SKU: {displaySku}</span>
          </div>

          {/* Compact Variant Selector Pills (Single-Line Horizontal Scroll / Flex) */}
          {hasVariants && (
            <div className="pt-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase shrink-0 mr-0.5">
                {variants.length} Var:
              </span>
              {variants.map((v, vIdx) => {
                const isActive = vIdx === activeVariantIdx;
                return (
                  <button
                    key={v.id || vIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVariantIdx(vIdx);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer shrink-0 border whitespace-nowrap ${
                      isActive
                        ? "bg-[#FF7A00] text-white border-[#FF7A00] shadow-2xs"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-800"
                    }`}
                    title={`Switch to ${v.name || `Option ${vIdx + 1}`}`}
                  >
                    {v.name || `Opt ${vIdx + 1}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Card Bottom: Stock, Price & Actions */}
      <div className="pt-2 mt-2 border-t border-slate-100 space-y-2">
        {/* Stock Status & Price Row */}
        <div className="flex items-center justify-between gap-1.5">
          {/* Stock Status */}
          <div className="flex items-center gap-1 text-[11px] font-medium">
            {displayStock === 0 ? (
              <span className="flex items-center gap-1 text-rose-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Out of stock</span>
              </span>
            ) : displayStock <= 10 ? (
              <span className="flex items-center gap-1 text-amber-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                <span>{displayStock} left</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{displayStock} in stock</span>
              </span>
            )}
          </div>

          {/* Price Hierarchy */}
          <div className="flex items-baseline gap-1">
            <span className="font-fraunces text-base font-bold text-[#2A241E]">
              ₹{effectivePrice.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
            )}
            {discountPct && (
              <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1 py-0.2 rounded">
                {discountPct}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Actions Strip */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={onViewDetails}
            className="clay-button h-8 w-8 flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50/50 rounded-xl transition cursor-pointer shrink-0"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5 text-sky-600" />
          </button>

          <Link
            href={`/admin/dashboard/products/${product.id}`}
            className="clay-btn-orange h-8 px-3 text-xs font-bold text-white flex items-center justify-center gap-1 rounded-xl transition cursor-pointer flex-1 shadow-xs hover:brightness-105"
            title="Edit Product Details"
          >
            <Edit2 className="h-3 w-3" />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={onDelete}
            className="clay-button h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 rounded-xl transition cursor-pointer shrink-0"
            title="Delete Product"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
