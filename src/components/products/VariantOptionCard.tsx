"use client";

import React, { useState } from "react";
import {
  Copy,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Check,
  Tag,
  Sparkles,
} from "lucide-react";
import { generateProductSku } from "./slugUtils";
import { VariantAttributes } from "@/types/admin-product";

export interface OptionItemData {
  id?: string;
  name: string;
  sku?: string | null;
  price: number | "";
  discountPrice?: number | "" | null;
  stock: number | "";
  attributes: VariantAttributes;
  imageUrl?: string | null;
  images?: string[];
  isDefault?: boolean;
}

export interface VariantOptionCardProps {
  index: number;
  option: OptionItemData;
  availableImages: string[];
  productName?: string;
  onChange: (updated: OptionItemData) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onSetDefault?: () => void;
  canRemove: boolean;
  errors?: {
    name?: string;
    price?: string;
    discountPrice?: string;
    stock?: string;
  };
}

const COMMON_ATTRIBUTE_TYPES = [
  { key: "color", label: "Color" },
  { key: "size", label: "Size" },
  { key: "weight", label: "Weight" },
  { key: "packSize", label: "Pack Size" },
  { key: "material", label: "Material" },
  { key: "flavor", label: "Flavor" },
];

export function VariantOptionCard({
  index,
  option,
  availableImages,
  productName,
  onChange,
  onDuplicate,
  onRemove,
  onSetDefault,
  canRemove,
  errors,
}: VariantOptionCardProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isSkuCustomized, setIsSkuCustomized] = useState(false);

  const handleNameChange = (newName: string) => {
    let newSku = option.sku;
    if (!isSkuCustomized) {
      newSku = newName.trim() ? generateProductSku(productName || "", newName, index + 1) : "";
    }

    // Auto-detect and sync attribute if only 1 attribute exists
    let newAttributes = { ...option.attributes };
    const attrKeys = Object.keys(newAttributes);
    if (attrKeys.length <= 1) {
      let detectedKey = attrKeys[0] || "color";
      const trimmed = newName.trim();
      if (/\d+\s*(kg|g|gm|gms|lbs|oz|ml|l|ltr)\b/i.test(trimmed)) {
        detectedKey = "weight";
      } else if (/^(xs|s|m|l|xl|xxl|small|medium|large|extra\s*large)$/i.test(trimmed)) {
        detectedKey = "size";
      } else if (/\b(pack|pack\s*of\s*\d+|pcs|pieces|set)\b/i.test(trimmed)) {
        detectedKey = "packSize";
      } else if (/\b(chicken|beef|salmon|fish|lamb|tuna|turkey|duck|veg)\b/i.test(trimmed)) {
        detectedKey = "flavor";
      }
      newAttributes = { [detectedKey]: trimmed };
    }

    onChange({
      ...option,
      name: newName,
      sku: newSku,
      attributes: newAttributes,
    });
  };

  const handleRegenerateSku = () => {
    setIsSkuCustomized(false);
    const newSku = generateProductSku(productName || "", option.name, index + 1);
    onChange({
      ...option,
      sku: newSku,
    });
  };

  // Convert Record<string, string> attributes into an array of { key, value } for flexible editing
  const attrEntries = Object.entries(option.attributes || {});
  const effectiveAttrs =
    attrEntries.length > 0
      ? attrEntries.map(([k, v]) => ({ key: k, value: v }))
      : [{ key: "color", value: "" }];

  const updateAttributePair = (idx: number, newKey: string, newVal: string) => {
    const updatedPairs = [...effectiveAttrs];
    updatedPairs[idx] = { key: newKey, value: newVal };
    const newRecord: VariantAttributes = {};
    for (const p of updatedPairs) {
      if (p.key.trim()) {
        newRecord[p.key.trim().toLowerCase()] = p.value;
      }
    }
    onChange({
      ...option,
      attributes: newRecord,
    });
  };

  const addAttributePair = () => {
    const updatedPairs = [...effectiveAttrs, { key: "size", value: "" }];
    const newRecord: VariantAttributes = {};
    for (const p of updatedPairs) {
      if (p.key.trim()) {
        newRecord[p.key.trim().toLowerCase()] = p.value;
      }
    }
    onChange({
      ...option,
      attributes: newRecord,
    });
  };

  const removeAttributePair = (idx: number) => {
    if (effectiveAttrs.length <= 1) {
      // Clear value instead of deleting only pair
      updateAttributePair(0, effectiveAttrs[0].key, "");
      return;
    }
    const updatedPairs = effectiveAttrs.filter((_, i) => i !== idx);
    const newRecord: VariantAttributes = {};
    for (const p of updatedPairs) {
      if (p.key.trim()) {
        newRecord[p.key.trim().toLowerCase()] = p.value;
      }
    }
    onChange({
      ...option,
      attributes: newRecord,
    });
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition p-4 sm:p-5 space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-orange-100 text-[#FF7A00] text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <h4 className="text-sm font-bold text-slate-800">
            Product Option {index + 1}
            {option.name ? `: ${option.name}` : ""}
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          {onSetDefault && (
            <button
              type="button"
              onClick={onSetDefault}
              title="Make this variant default"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                option.isDefault
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                checked={!!option.isDefault}
                onChange={() => {}}
                className="h-3 w-3 text-[#FF7A00] focus:ring-[#FF7A00]"
              />
              <span>{option.isDefault ? "Default Variant" : "Make Default"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate this option"
            aria-label="Duplicate option"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold cursor-pointer transition"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Remove this option"
              aria-label="Remove option"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Option Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option Name */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Option Name (What customers choose) *
            </label>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              Backend field: name
            </span>
          </div>
          <input
            type="text"
            value={option.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., 1.5 kg, Large, or Pack of 2"
            className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
              errors?.name
                ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
            }`}
          />
          {errors?.name ? (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.name}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              Label customers click to select this version (e.g., 1.5 kg, Large, or Red).
            </p>
          )}
        </div>

        {/* Product Code / SKU */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Product Code / SKU (Optional)
            </label>
            <button
              type="button"
              onClick={handleRegenerateSku}
              title="Auto-generate clean SKU"
              className="text-[11px] font-semibold text-[#FF7A00] hover:underline cursor-pointer select-none flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Re-generate</span>
            </button>
          </div>
          <input
            type="text"
            value={option.sku || ""}
            onChange={(e) => {
              setIsSkuCustomized(true);
              onChange({ ...option, sku: e.target.value.toUpperCase() });
            }}
            placeholder={generateProductSku(productName || "", option.name, index + 1) || "e.g., KKT-RED-01"}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
          />
          <p className="text-[11px] text-slate-400">
            Auto-generated inventory code (sent as &quot;sku&quot; in backend). Optional to customize.
          </p>
        </div>
      </div>

      {/* Flexible Attributes Sub-card */}
      <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-orange-500" />
            Option Attributes
          </span>
          <button
            type="button"
            onClick={addAttributePair}
            className="text-xs font-bold text-[#FF7A00] hover:text-orange-700 flex items-center gap-1 cursor-pointer select-none"
          >
            <Plus className="h-3 w-3 stroke-[3]" />
            <span>Add another attribute</span>
          </button>
        </div>

        <div className="space-y-2">
          {effectiveAttrs.map((attr, aIdx) => (
            <div key={aIdx} className="flex items-center gap-2">
              {/* Attribute Type */}
              <div className="w-1/3 min-w-[110px]">
                <select
                  value={
                    COMMON_ATTRIBUTE_TYPES.some((t) => t.key === attr.key)
                      ? attr.key
                      : "other"
                  }
                  onChange={(e) => {
                    const selected = e.target.value;
                    updateAttributePair(aIdx, selected, attr.value);
                  }}
                  aria-label="Attribute Type"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#FF7A00] cursor-pointer"
                >
                  {COMMON_ATTRIBUTE_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Attribute Value */}
              <div className="flex-1">
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttributePair(aIdx, attr.key, e.target.value)}
                  placeholder="e.g., Red, Large, 1.5 kg"
                  aria-label="Attribute Value"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF7A00]"
                />
              </div>

              {/* Remove attribute pair button */}
              {effectiveAttrs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAttributePair(aIdx)}
                  title="Remove attribute"
                  aria-label="Remove attribute"
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-200/50 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing & Stock (Independent per variant) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Original Price */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Original Price (MRP) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={option.price}
              onChange={(e) =>
                onChange({
                  ...option,
                  price: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="e.g., 799"
              className={`w-full rounded-xl border pl-7 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
                errors?.price
                  ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                  : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
              }`}
            />
          </div>
          {errors?.price && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.price}
            </p>
          )}
        </div>

        {/* Selling Price */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Selling Price (Offer - Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={option.discountPrice ?? ""}
              onChange={(e) =>
                onChange({
                  ...option,
                  discountPrice: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              placeholder="e.g., 699"
              className={`w-full rounded-xl border pl-7 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
                errors?.discountPrice
                  ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                  : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
              }`}
            />
          </div>
          {errors?.discountPrice && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.discountPrice}
            </p>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            value={option.stock}
            onChange={(e) =>
              onChange({
                ...option,
                stock: e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            placeholder="e.g., 50"
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
              errors?.stock
                ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
            }`}
          />
          {errors?.stock && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.stock}
            </p>
          )}
        </div>
      </div>

      {/* Option Photos Selection */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Option Photos (Multiple)</span>
            <span className="text-[11px] text-slate-500 font-medium">
              ({(option.images && option.images.length > 0) ? option.images.length : (option.imageUrl ? 1 : 0)} selected)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowImagePicker(!showImagePicker)}
            className="text-xs font-semibold text-[#FF7A00] hover:text-orange-700 cursor-pointer select-none"
          >
            {showImagePicker ? "Done selecting" : ((option.images && option.images.length > 0) || option.imageUrl) ? "Manage Photos" : "Select Photos"}
          </button>
        </div>

        {/* Selected Images Thumbnails preview */}
        {((option.images && option.images.length > 0) || option.imageUrl) && !showImagePicker && (
          <div className="flex flex-wrap gap-2 mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            {(option.images && option.images.length > 0 ? option.images : [option.imageUrl!]).map((img, i) => (
              <div key={img + i} className="relative group flex items-center justify-center h-12 w-12 rounded-lg bg-white border border-slate-200 p-0.5">
                <img
                  src={img}
                  alt={`Option photo ${i + 1}`}
                  className="h-full w-full object-contain rounded-md"
                />
                {i === 0 && (
                  <span className="absolute -top-1.5 -left-1.5 px-1 py-0.2 bg-[#FF7A00] text-white text-[9px] font-bold rounded-md shadow-xs">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const currentImgs = option.images && option.images.length > 0 ? option.images : (option.imageUrl ? [option.imageUrl] : []);
                    const updated = currentImgs.filter((_, idx) => idx !== i);
                    onChange({
                      ...option,
                      images: updated,
                      imageUrl: updated[0] || null,
                    });
                  }}
                  className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-xs"
                  title="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Multi-Photo Picker Drawer */}
        {showImagePicker && (
          <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-[11px] text-slate-500 font-medium">
              Select multiple photos from Step 2 Product Photos for this option (First selected is Primary):
            </p>

            {availableImages.length > 0 ? (
              <div className="flex flex-wrap gap-2 items-center">
                {/* Clear all button */}
                <button
                  type="button"
                  onClick={() => {
                    onChange({ ...option, images: [], imageUrl: null });
                  }}
                  className={`h-12 px-3 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    (!option.images || option.images.length === 0) && !option.imageUrl
                      ? "border-[#FF7A00] bg-orange-50 text-[#FF7A00] font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Clear All
                </button>

                {availableImages.map((imgUrl, i) => {
                  const currentImgs = option.images && option.images.length > 0 ? option.images : (option.imageUrl ? [option.imageUrl] : []);
                  const isSelected = currentImgs.includes(imgUrl);
                  const selIndex = currentImgs.indexOf(imgUrl);

                  return (
                    <button
                      key={imgUrl + i}
                      type="button"
                      onClick={() => {
                        let updated: string[];
                        if (isSelected) {
                          updated = currentImgs.filter((url) => url !== imgUrl);
                        } else {
                          updated = [...currentImgs, imgUrl];
                        }
                        onChange({
                          ...option,
                          images: updated,
                          imageUrl: updated[0] || null,
                        });
                      }}
                      className={`relative h-12 w-12 rounded-lg border overflow-hidden p-0.5 transition cursor-pointer ${
                        isSelected
                          ? "border-[#FF7A00] ring-2 ring-[#FF7A00] shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Option photo ${i + 1}`}
                        className="h-full w-full object-contain"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#FF7A00]/20 flex items-center justify-center">
                          <span className="h-5 w-5 rounded-full bg-[#FF7A00] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                            {selIndex + 1}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No photos uploaded in Step 2 yet. Please add product photos first.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
