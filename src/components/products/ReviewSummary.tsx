"use client";

import React from "react";
import {
  Pencil,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  XCircle,
  Tag,
} from "lucide-react";
import { OptionItemData } from "./VariantOptionCard";
import {
  PetSpecies,
  ProductStatus,
  ProductHighlight,
} from "@/types/admin-product";

export interface ReviewSummaryProps {
  name: string;
  categoryName: string;
  petSpecies: PetSpecies | "";
  status: ProductStatus;
  isTrending: boolean;
  isBestSeller: boolean;
  slug: string;
  images: string[];
  sellingMode: "single" | "options";
  price: number | "";
  discountPrice: number | "" | null;
  stock: number | "";
  options: OptionItemData[];
  descriptionTitle: string;
  description: string;
  materials: string;
  highlights: ProductHighlight[];
  additionalInfoCount: number;
  onEditStep: (step: number) => void;
}

export function ReviewSummary({
  name,
  categoryName,
  petSpecies,
  status,
  isTrending,
  isBestSeller,
  slug,
  images,
  sellingMode,
  price,
  discountPrice,
  stock,
  options,
  descriptionTitle,
  description,
  materials,
  highlights,
  additionalInfoCount,
  onEditStep,
}: ReviewSummaryProps) {
  const totalOptionStock = options.reduce(
    (sum, o) => sum + (typeof o.stock === "number" ? o.stock : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="pb-3 border-b border-slate-100">
        <h2 className="font-fraunces text-xl font-bold text-slate-900">
          Review & Publish
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Please review all details before publishing your product to the store.
        </p>
      </div>

      {/* Section 1: Basic Information */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Basic Information
          </span>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:text-orange-700 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Product Name</span>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{name || "Untitled Product"}</p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Category</span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{categoryName || "Uncategorized"}</p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Pet Type</span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{petSpecies || "General"}</p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Catalog Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              {status === "ACTIVE" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              )}
              {status === "DRAFT" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  <Clock className="h-3 w-3" /> Draft
                </span>
              )}
              {status === "INACTIVE" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                  <XCircle className="h-3 w-3" /> Inactive
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Badges</span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {isTrending && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-100 text-orange-700">
                  <Flame className="h-3 w-3 text-orange-600" /> Trending
                </span>
              )}
              {isBestSeller && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                  <Sparkles className="h-3 w-3 text-amber-600" /> Best Seller
                </span>
              )}
              {!isTrending && !isBestSeller && (
                <span className="text-xs text-slate-400 italic">Standard Product</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Store Link</span>
            <p className="text-xs text-slate-600 truncate mt-0.5 font-mono">
              kickat.co.in/products/{slug || "pending"}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Product Photos */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            2. Product Photos ({images.length})
          </span>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:text-orange-700 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {images.length > 0 ? (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {images.map((url, i) => (
              <div
                key={url + i}
                className="relative h-16 w-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 flex items-center justify-center"
              >
                <img src={url} alt="Preview" className="h-full w-full object-contain" />
                {i === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-[#FF7A00] text-white text-[8px] font-bold text-center py-0.5">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-rose-500 font-medium">No photos added yet.</p>
        )}
      </div>

      {/* Section 3: Pricing & Options */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            3. Pricing & Options ({sellingMode === "single" ? "Single Product" : `${options.length} Options`})
          </span>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:text-orange-700 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {sellingMode === "single" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold block">Original Price</span>
              <p className="text-base font-bold text-slate-800 mt-0.5">
                ₹{price ? Number(price).toLocaleString("en-IN") : "0"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold block">Selling Price</span>
              <p className="text-base font-bold text-emerald-700 mt-0.5">
                {discountPrice
                  ? `₹${Number(discountPrice).toLocaleString("en-IN")}`
                  : `₹${price ? Number(price).toLocaleString("en-IN") : "0"} (No discount)`}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 font-semibold block">Stock Available</span>
              <p className="text-base font-bold text-slate-800 mt-0.5">
                {stock || 0} units
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/70 border border-orange-200/80">
              <span className="text-xs font-bold text-slate-800">Total Stock Across All Options</span>
              <span className="text-sm font-bold text-[#FF7A00]">{totalOptionStock} units</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-500 font-semibold">
                    <th className="pb-2 pr-3">Photo</th>
                    <th className="pb-2 pr-3">Option Name</th>
                    <th className="pb-2 pr-3">Attributes</th>
                    <th className="pb-2 pr-3">Original Price</th>
                    <th className="pb-2 pr-3">Selling Price</th>
                    <th className="pb-2">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {options.map((opt, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="py-2.5 pr-3">
                        {opt.imageUrl ? (
                          <img
                            src={opt.imageUrl}
                            alt=""
                            className="h-9 w-9 rounded-lg object-contain bg-white border border-slate-200"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                            <Tag className="h-4 w-4" />
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 font-bold text-slate-800">{opt.name || `Option ${i + 1}`}</td>
                      <td className="py-2.5 pr-3 text-slate-600">
                        {Object.entries(opt.attributes || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ") || "None"}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-700 font-medium">
                        ₹{opt.price ? Number(opt.price).toLocaleString("en-IN") : "0"}
                      </td>
                      <td className="py-2.5 pr-3 text-emerald-700 font-bold">
                        ₹{opt.discountPrice ? Number(opt.discountPrice).toLocaleString("en-IN") : opt.price ? Number(opt.price).toLocaleString("en-IN") : "0"}
                      </td>
                      <td className="py-2.5 font-bold text-slate-800">{opt.stock || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Product Information */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            4. Product Information
          </span>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:text-orange-700 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <div className="space-y-2.5 pt-1">
          {descriptionTitle && (
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Details Heading</span>
              <p className="text-xs font-bold text-slate-800">{descriptionTitle}</p>
            </div>
          )}

          {description && (
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Description Excerpt</span>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{description}</p>
            </div>
          )}

          {materials && (
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Materials & Safety</span>
              <p className="text-xs text-slate-600 line-clamp-1">{materials}</p>
            </div>
          )}

          {highlights.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">
                Highlights ({highlights.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {highlights.map((h, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200/60 text-xs font-bold text-slate-800"
                  >
                    <Sparkles className="h-3 w-3 text-orange-500" />
                    <span>{h.title}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Additional Information */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            5. Additional Information
          </span>
          <button
            type="button"
            onClick={() => onEditStep(5)}
            className="flex items-center gap-1 text-xs font-bold text-[#FF7A00] hover:text-orange-700 cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <p className="text-xs text-slate-600">
          {additionalInfoCount > 0
            ? `${additionalInfoCount} additional sections configured (e.g. Ingredients, Feeding Guide, Sizing, Care, or SEO).`
            : "No additional optional specifications added."}
        </p>
      </div>
    </div>
  );
}
