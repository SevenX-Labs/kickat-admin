"use client";

import React, { useState, useRef } from "react";
import {
  Copy,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Check,
  Tag,
  Sparkles,
  UploadCloud,
  Star,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  ImagePlus,
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
  availableImages?: string[];
  productName?: string;
  onChange: (updated: OptionItemData) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onSetDefault?: () => void;
  onAddFiles?: (files: FileList | File[]) => void;
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
  availableImages = [],
  productName,
  onChange,
  onDuplicate,
  onRemove,
  onSetDefault,
  onAddFiles,
  canRemove,
  errors,
}: VariantOptionCardProps) {
  const [isSkuCustomized, setIsSkuCustomized] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showGalleryImport, setShowGalleryImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentImgs = Array.isArray(option.images) && option.images.length > 0
    ? option.images
    : (option.imageUrl ? [option.imageUrl] : []);

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
      : [{ key: "color", value: option.name }];

  const handleAttributeChange = (attrIndex: number, key: string, value: string) => {
    const updatedEntries = [...effectiveAttrs];
    updatedEntries[attrIndex] = { key: key.toLowerCase().trim(), value: value.trim() };

    const newAttrObj: Record<string, string> = {};
    for (const item of updatedEntries) {
      if (item.key && item.value) {
        newAttrObj[item.key] = item.value;
      }
    }

    onChange({
      ...option,
      attributes: newAttrObj,
    });
  };

  const handleAddAttribute = () => {
    const existingKeys = effectiveAttrs.map((a) => a.key);
    const nextUnused = COMMON_ATTRIBUTE_TYPES.find((t) => !existingKeys.includes(t.key))?.key || "custom";
    const updatedEntries = [...effectiveAttrs, { key: nextUnused, value: "" }];

    const newAttrObj: Record<string, string> = {};
    for (const item of updatedEntries) {
      if (item.key) {
        newAttrObj[item.key] = item.value;
      }
    }

    onChange({
      ...option,
      attributes: newAttrObj,
    });
  };

  const handleRemoveAttribute = (attrIndex: number) => {
    const updatedEntries = effectiveAttrs.filter((_, i) => i !== attrIndex);
    const newAttrObj: Record<string, string> = {};
    for (const item of updatedEntries) {
      if (item.key) {
        newAttrObj[item.key] = item.value;
      }
    }

    onChange({
      ...option,
      attributes: newAttrObj,
    });
  };

  // Variant Image Management Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onAddFiles) {
      onAddFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onAddFiles) {
      onAddFiles(e.dataTransfer.files);
    }
  };

  const handleMoveImage = (imgIdx: number, direction: "left" | "right") => {
    const newImgs = [...currentImgs];
    const targetIdx = direction === "left" ? imgIdx - 1 : imgIdx + 1;
    if (targetIdx < 0 || targetIdx >= newImgs.length) return;

    const temp = newImgs[imgIdx];
    newImgs[imgIdx] = newImgs[targetIdx];
    newImgs[targetIdx] = temp;

    onChange({
      ...option,
      images: newImgs,
      imageUrl: newImgs[0] || null,
    });
  };

  const handleSetCover = (imgIdx: number) => {
    if (imgIdx === 0) return;
    const newImgs = [...currentImgs];
    const [selected] = newImgs.splice(imgIdx, 1);
    newImgs.unshift(selected);

    onChange({
      ...option,
      images: newImgs,
      imageUrl: newImgs[0] || null,
    });
  };

  const handleRemoveImage = (imgIdx: number) => {
    const newImgs = currentImgs.filter((_, i) => i !== imgIdx);
    onChange({
      ...option,
      images: newImgs,
      imageUrl: newImgs[0] || null,
    });
  };

  const handleImportGalleryImage = (imgUrl: string) => {
    if (currentImgs.includes(imgUrl)) return;
    if (currentImgs.length >= 5) return;
    const updated = [...currentImgs, imgUrl];
    onChange({
      ...option,
      images: updated,
      imageUrl: updated[0] || null,
    });
  };

  return (
    <div
      className={`rounded-2xl border bg-white p-4 sm:p-5 transition shadow-xs space-y-4 ${
        option.isDefault
          ? "border-[#FF7A00]/80 ring-2 ring-[#FF7A00]/10"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-lg bg-orange-100 text-[#FF7A00] font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <h4 className="font-fraunces text-base font-bold text-slate-900">
            {option.name.trim() || `Option ${index + 1}`}
          </h4>

          {option.isDefault ? (
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF7A00] text-white text-[10px] font-bold shadow-xs">
              Default Option
            </span>
          ) : (
            onSetDefault && (
              <button
                type="button"
                onClick={onSetDefault}
                className="text-[11px] font-semibold text-slate-400 hover:text-[#FF7A00] transition cursor-pointer"
              >
                Set as default
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate option"
            aria-label="Duplicate option"
            className="p-1.5 rounded-xl border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              title="Remove option"
              aria-label="Remove option"
              className="p-1.5 rounded-xl border border-rose-200/80 text-rose-600 hover:bg-rose-50 transition text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Option Core Fields: Name & SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Option Name * (e.g., Red, 500g, Pack of 2)
          </label>
          <input
            type="text"
            value={option.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Small / 1kg / Red"
            className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
              errors?.name
                ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
            }`}
          />
          {errors?.name && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Option SKU */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Option SKU (Unique ID)
            </label>
            {isSkuCustomized && (
              <button
                type="button"
                onClick={handleRegenerateSku}
                className="text-[10px] font-bold text-[#FF7A00] hover:underline cursor-pointer"
              >
                Auto-generate
              </button>
            )}
          </div>
          <input
            type="text"
            value={option.sku || ""}
            onChange={(e) => {
              setIsSkuCustomized(true);
              onChange({
                ...option,
                sku: e.target.value,
              });
            }}
            placeholder="Auto-generated if empty"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15 transition"
          />
        </div>
      </div>

      {/* Dynamic Option Attributes */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-[#FF7A00]" />
            Variant Attributes (Key-Value)
          </span>
          <button
            type="button"
            onClick={handleAddAttribute}
            className="text-[11px] font-bold text-[#FF7A00] hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Add Attribute</span>
          </button>
        </div>

        <div className="space-y-2">
          {effectiveAttrs.map((attr, aIdx) => (
            <div key={aIdx} className="flex items-center gap-2">
              <select
                value={COMMON_ATTRIBUTE_TYPES.some((t) => t.key === attr.key) ? attr.key : "custom"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "custom") {
                    handleAttributeChange(aIdx, val, attr.value);
                  }
                }}
                className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-[#FF7A00]"
              >
                {COMMON_ATTRIBUTE_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>

              {!COMMON_ATTRIBUTE_TYPES.some((t) => t.key === attr.key) && (
                <input
                  type="text"
                  value={attr.key}
                  onChange={(e) => handleAttributeChange(aIdx, e.target.value, attr.value)}
                  placeholder="Key (e.g. flavor)"
                  className="w-28 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                />
              )}

              <input
                type="text"
                value={attr.value}
                onChange={(e) => handleAttributeChange(aIdx, attr.key, e.target.value)}
                placeholder="Value (e.g. Chicken & Rice)"
                className="flex-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
              />

              {effectiveAttrs.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(aIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Remove attribute"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Option Pricing & Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
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

      {/* Dedicated Variant Photos Manager */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5 text-[#FF7A00]" />
              Variant Photos (Option-Specific)
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                currentImgs.length > 0
                  ? "bg-orange-50 text-[#FF7A00] border-orange-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {currentImgs.length}/5 photos
            </span>
          </div>

          <div className="flex items-center gap-2">
            {availableImages.length > 0 && currentImgs.length < 5 && (
              <button
                type="button"
                onClick={() => setShowGalleryImport(!showGalleryImport)}
                className="text-[11px] font-bold text-[#FF7A00] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ImagePlus className="h-3 w-3" />
                <span>{showGalleryImport ? "Hide Gallery Import" : "Import from Gallery"}</span>
              </button>
            )}

            {currentImgs.length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ ...option, images: [], imageUrl: null })}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-500 transition cursor-pointer"
              >
                Clear Photos
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-normal">
          Upload images unique to this variant option (e.g. Red harness photo). The first photo (<span className="font-bold text-[#FF7A00]">#1</span>) is used as the cover image.
        </p>

        {/* Gallery Import Drawer (Optional Helper) */}
        {showGalleryImport && availableImages.length > 0 && (
          <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              Click a photo from the Product Gallery to add a copy to this variant:
            </span>
            <div className="flex flex-wrap gap-2">
              {availableImages.map((gUrl, gIdx) => {
                const isAlreadyIn = currentImgs.includes(gUrl);
                return (
                  <button
                    key={gIdx}
                    type="button"
                    disabled={isAlreadyIn || currentImgs.length >= 5}
                    onClick={() => handleImportGalleryImage(gUrl)}
                    className={`relative h-12 w-12 rounded-lg border overflow-hidden p-0.5 transition ${
                      isAlreadyIn
                        ? "border-emerald-500 ring-1 ring-emerald-400 opacity-60"
                        : "border-slate-200 hover:border-[#FF7A00] bg-white cursor-pointer"
                    }`}
                  >
                    <img src={gUrl} alt="" className="h-full w-full object-contain" />
                    {isAlreadyIn && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-emerald-700 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Variant Photo Upload / Drop Zone */}
        {currentImgs.length < 5 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed p-3 sm:p-4 text-center transition cursor-pointer select-none ${
              dragOver
                ? "border-[#FF7A00] bg-orange-50/60"
                : "border-slate-200 bg-[#FDFBF7] hover:border-orange-300 hover:bg-orange-50/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-100 text-[#FF7A00] flex items-center justify-center shrink-0">
                <UploadCloud className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">
                  Upload photo for {option.name || `Option ${index + 1}`}
                </p>
                <p className="text-[10.5px] text-slate-400">
                  PNG, JPG, WEBP, GIF, SVG (Up to 10MB)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Variant Photos Grid */}
        {currentImgs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
            {currentImgs.map((url, imgIdx) => {
              const isCover = imgIdx === 0;
              return (
                <div
                  key={url + imgIdx}
                  className={`group relative rounded-xl overflow-hidden bg-white border transition flex flex-col ${
                    isCover
                      ? "border-[#FF7A00] ring-2 ring-[#FF7A00]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="aspect-square w-full bg-slate-50 relative flex items-center justify-center p-1.5 overflow-hidden">
                    <img
                      src={url}
                      alt={`Variant photo ${imgIdx + 1}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                    {isCover && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#FF7A00] text-white text-[9px] font-bold shadow-xs flex items-center gap-0.5">
                        <Star className="h-2 w-2 fill-white" />
                        <span>Cover</span>
                      </div>
                    )}
                  </div>

                  <div className="p-1 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-0.5">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(imgIdx, "left")}
                        disabled={imgIdx === 0}
                        title="Move left"
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(imgIdx, "right")}
                        disabled={imgIdx === currentImgs.length - 1}
                        title="Move right"
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(imgIdx)}
                        title="Make cover photo"
                        className="text-[9.5px] font-bold text-slate-600 hover:text-[#FF7A00] px-1 py-0.5 rounded hover:bg-orange-50 cursor-pointer"
                      >
                        Set Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(imgIdx)}
                      title="Remove photo"
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-center rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[11px] text-slate-400 font-medium block">
              No variant photos added yet for {option.name || `Option ${index + 1}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
