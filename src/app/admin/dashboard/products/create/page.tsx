"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Check,
  Plus,
  Layers,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  X,
  Star,
  Tag,
  ShieldCheck,
  Boxes,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreateProductDto,
  PetSpecies,
  DietaryPreference,
  ProductStatus,
} from "@/types/admin-product";
import { AdminProductService } from "@/services/adminProductService";
import { AdminCategoryService } from "@/services/adminCategoryService";
import { AdminUploadService } from "@/services/adminUploadService";
import { AdminCategoryItem } from "@/types/admin-category";

export default function CreateProductPage() {
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "BASIC" | "MEDIA" | "PRICING_VARIANTS" | "ATTRIBUTES" | "GUIDES_SEO"
  >("BASIC");

  // Remote categories list
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form Fields - Basic Info
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [petSpecies, setPetSpecies] = useState<PetSpecies | "">("DOG");
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference | "">("NON_VEG");
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [isTrending, setIsTrending] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // Content Architecture (No hardcoded text)
  const [descriptionTitle, setDescriptionTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");

  // Pricing & Stock
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [standaloneStock, setStandaloneStock] = useState<number | "">(0);

  // Canonical Media Gallery (Max 9) - Upload only via AdminUploadService
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variants Builder
  const [variants, setVariants] = useState<
    Array<{
      name: string;
      sku: string;
      price: number | "";
      discountPrice: number | "";
      stock: number | "";
      imageUrl: string;
      weightAttr: string;
    }>
  >([]);

  // Flexible Attributes (Optional)
  const [lifeStage, setLifeStage] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");
  const [colorsText, setColorsText] = useState("");
  const [customSpecs, setCustomSpecs] = useState<Array<{ label: string; value: string }>>([]);

  // Structured Data (All Optional)
  const [highlights, setHighlights] = useState<
    Array<{ title: string; description: string; icon: string }>
  >([]);

  // Ingredients & Nutrition (Optional)
  const [ingredientsDesc, setIngredientsDesc] = useState("");
  const [ingredientsItemsText, setIngredientsItemsText] = useState("");
  const [nutritionItems, setNutritionItems] = useState<Array<{ label: string; value: string }>>([]);

  // Feeding Guide (Optional)
  const [feedingDesc, setFeedingDesc] = useState("");
  const [feedingRows, setFeedingRows] = useState<Array<{ petWeight: string; dailyAmount: string }>>([]);

  // Care Instructions & Size Guide (Optional)
  const [careInstructionsText, setCareInstructionsText] = useState("");
  const [sizeGuideEnabled, setSizeGuideEnabled] = useState(false);
  const [sizeGuideDesc, setSizeGuideDesc] = useState("");
  const [sizeGuideRows, setSizeGuideRows] = useState<Array<{ label: string; description: string }>>([]);

  // SEO Metadata (Optional)
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Submission & UI States
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Categories for dropdown
  useEffect(() => {
    AdminCategoryService.getCategories()
      .then((res) => {
        if (res?.success && res?.data?.categories) {
          setCategories(res.data.categories);
          if (res.data.categories.length > 0) {
            setCategoryId(res.data.categories[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, []);

  // Slug generator helper
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManuallyEdited) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  };

  // VARIANT STOCK AUTHORITY:
  // IF has variants: product stock is derived sum of active variant stocks (READ-ONLY).
  // IF no variants: standaloneStock is authoritative & editable.
  const hasVariants = variants.length > 0;
  const derivedVariantStock = variants.reduce(
    (acc, v) => acc + (Number(v.stock) || 0),
    0
  );
  const effectiveStock = hasVariants ? derivedVariantStock : Number(standaloneStock) || 0;

  // Image Upload via AdminUploadService
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > 9) {
      showToast("Maximum 9 product images allowed per product gallery", "error");
      return;
    }

    try {
      setIsUploading(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await AdminUploadService.uploadImage(file, "products");
        if (res?.url) {
          newUrls.push(res.url);
        }
      }
      setImages((prev) => [...prev, ...newUrls].slice(0, 9));
      showToast(`Uploaded ${newUrls.length} image(s) successfully`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to upload image", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag & Drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Image Reordering & Manipulation
  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSetPrimary = (idx: number) => {
    if (idx === 0) return;
    setImages((prev) => {
      const target = prev[idx];
      const remaining = prev.filter((_, i) => i !== idx);
      return [target, ...remaining];
    });
  };

  const handleMoveImage = (idx: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    setImages((prev) => {
      const arr = [...prev];
      const temp = arr[idx];
      arr[idx] = arr[targetIdx];
      arr[targetIdx] = temp;
      return arr;
    });
  };

  // Variants Builder
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: `Option ${prev.length + 1}`,
        sku: `KKT-${prev.length + 1}`,
        price: price || 0,
        discountPrice: discountPrice || 0,
        stock: 10,
        imageUrl: images[0] || "",
        weightAttr: "",
      },
    ]);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation (Only essential required fields)
    if (!name.trim()) {
      setFormError("Product title / name is required.");
      setActiveTab("BASIC");
      return;
    }
    if (!categoryId) {
      setFormError("Please select a valid category.");
      setActiveTab("BASIC");
      return;
    }
    if (price === "" || Number(price) < 0) {
      setFormError("Valid MRP Price is required (must be >= 0).");
      setActiveTab("PRICING_VARIANTS");
      return;
    }
    if (discountPrice !== "" && Number(discountPrice) >= Number(price)) {
      setFormError("Discount Selling Price must be less than the MRP Price.");
      setActiveTab("PRICING_VARIANTS");
      return;
    }
    if (images.length === 0) {
      setFormError("Please upload at least 1 product image.");
      setActiveTab("MEDIA");
      return;
    }

    try {
      setSubmitting(true);

      const careList = careInstructionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const ingItems = ingredientsItemsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const colors = colorsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const validCustomSpecs = customSpecs.filter(
        (c) => c.label.trim() && c.value.trim()
      );

      const validHighlights = highlights.filter((h) => h.title.trim());

      const validNutrition = nutritionItems.filter(
        (n) => n.label.trim() && n.value.trim()
      );

      const validFeedingRows = feedingRows.filter(
        (r) => r.petWeight.trim() && r.dailyAmount.trim()
      );

      const validSizeGuideRows = sizeGuideRows.filter(
        (s) => s.label.trim() && s.description.trim()
      );

      const payload: CreateProductDto = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        descriptionTitle: descriptionTitle.trim() || null,
        description: description.trim() || null,
        materials: materials.trim() || null,
        price: Number(price),
        discountPrice: discountPrice !== "" ? Number(discountPrice) : null,
        stock: effectiveStock,
        petSpecies: petSpecies ? (petSpecies as PetSpecies) : null,
        dietaryPreference: dietaryPreference ? (dietaryPreference as DietaryPreference) : null,
        categoryId,
        images,
        status,
        isTrending,
        isBestSeller,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        attributes:
          lifeStage.trim() ||
          weight.trim() ||
          dimensions.trim() ||
          countryOfOrigin.trim() ||
          colors.length > 0 ||
          validCustomSpecs.length > 0
            ? {
                lifeStage: lifeStage.trim() || undefined,
                weight: weight.trim() || undefined,
                dimensions: dimensions.trim() || undefined,
                countryOfOrigin: countryOfOrigin.trim() || undefined,
                colors: colors.length > 0 ? colors : undefined,
                custom: validCustomSpecs.length > 0 ? validCustomSpecs : undefined,
              }
            : null,
        highlights: validHighlights.length > 0 ? validHighlights : null,
        ingredients:
          ingredientsDesc.trim() || ingItems.length > 0 || validNutrition.length > 0
            ? {
                description: ingredientsDesc.trim() || undefined,
                items: ingItems.length > 0 ? ingItems : undefined,
                nutrition: validNutrition.length > 0 ? validNutrition : undefined,
              }
            : null,
        feedingGuide:
          feedingDesc.trim() || validFeedingRows.length > 0
            ? {
                description: feedingDesc.trim() || undefined,
                rows: validFeedingRows.length > 0 ? validFeedingRows : undefined,
              }
            : null,
        careInstructions: careList.length > 0 ? careList : undefined,
        sizeGuide: sizeGuideEnabled
          ? {
              enabled: true,
              description: sizeGuideDesc.trim() || undefined,
              sizes: validSizeGuideRows.length > 0 ? validSizeGuideRows : undefined,
            }
          : { enabled: false },
        variants:
          variants.length > 0
            ? variants.map((v) => ({
                name: v.name.trim(),
                sku: v.sku.trim() || null,
                price: Number(v.price) || Number(price),
                discountPrice: v.discountPrice !== "" ? Number(v.discountPrice) : null,
                stock: Number(v.stock) || 0,
                imageUrl: v.imageUrl || null,
                attributes: v.weightAttr.trim() ? { weight: v.weightAttr.trim() } : undefined,
              }))
            : undefined,
      };

      await AdminProductService.createProduct(payload);
      showToast("Product created successfully! Redirecting...", "success");

      setTimeout(() => {
        router.push("/admin/dashboard/products");
      }, 1200);
    } catch (err: unknown) {
      const msg = AdminProductService.extractErrorMessage(err, "Failed to create product");
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 w-full min-w-0 animate-fade-in text-[#2A241E]">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-slide-in-down ${
            toast.type === "success"
              ? "bg-emerald-500/90 text-white border-emerald-400"
              : "bg-rose-500/90 text-white border-rose-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/products"
            className="clay-button p-2 text-slate-600 hover:text-slate-900 rounded-xl transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#2A241E]">
              Add New Product
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              KickAt Store Catalog &bull; Single-Brand Platform
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/dashboard/products"
            className="clay-button px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="clay-btn-orange px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Publish Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Validation Error:</span>
            <span>{formError}</span>
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200/80">
        {[
          { id: "BASIC", label: "1. Basic Details & Content" },
          { id: "MEDIA", label: `2. Image Gallery (${images.length}/9)` },
          { id: "PRICING_VARIANTS", label: `3. Pricing & Variants (${variants.length})` },
          { id: "ATTRIBUTES", label: "4. Specs & Attributes" },
          { id: "GUIDES_SEO", label: "5. Structured Guides & SEO" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#FF7A00] text-white shadow-xs"
                : "clay-button text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================
          TAB 1: BASIC DETAILS & MODULAR CONTENT
          ========================================================= */}
      {activeTab === "BASIC" && (
        <div className="space-y-5 animate-fade-in">
          {/* Main Info Card */}
          <div className="clay-card p-5 sm:p-6 space-y-4">
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
              Product Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Product Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Kickat Natural Chicken & Brown Rice Puppy Dog Food"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  URL Slug (Auto-generated or custom)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                    /
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="kickat-chicken-puppy-food"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-6 pr-3 text-xs font-mono text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Catalog Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={loadingCategories}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 pr-8 text-xs text-slate-800 outline-none focus:bg-white cursor-pointer appearance-none"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.parentId ? `└─ ${cat.name}` : `📁 ${cat.name}`}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Pet Species */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Target Pet Species
                </label>
                <div className="relative">
                  <select
                    value={petSpecies}
                    onChange={(e) => setPetSpecies(e.target.value as any)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 pr-8 text-xs text-slate-800 outline-none focus:bg-white cursor-pointer appearance-none"
                  >
                    <option value="DOG">🐕 Dog</option>
                    <option value="CAT">🐈 Cat</option>
                    <option value="BIRD">🦜 Bird</option>
                    <option value="FISH">🐠 Fish</option>
                    <option value="SMALL_ANIMAL">🐹 Small Animal</option>
                    <option value="OTHER">✨ Other Species</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Dietary Preference */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Dietary / Formula Type
                </label>
                <div className="relative">
                  <select
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value as any)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 pr-8 text-xs text-slate-800 outline-none focus:bg-white cursor-pointer appearance-none"
                  >
                    <option value="NON_VEG">🍗 Non-Vegetarian (Real Meat)</option>
                    <option value="VEG">🥕 Vegetarian</option>
                    <option value="GRAIN_FREE">🌾 Grain Free Formula</option>
                    <option value="GLUTEN_FREE">🚫 Gluten Free</option>
                    <option value="ORGANIC">🌱 100% Organic</option>
                    <option value="RAW">🥩 Raw / Freeze Dried</option>
                    <option value="HYPOALLERGENIC">🛡️ Hypoallergenic Gentle</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Status Selector & Merchandising Flags */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Publishing Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProductStatus)}
                  className={`w-full rounded-xl border p-2 text-xs font-bold outline-none cursor-pointer ${
                    status === "ACTIVE"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : status === "DRAFT"
                      ? "bg-amber-50 text-amber-800 border-amber-300"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                >
                  <option value="ACTIVE">🟢 ACTIVE (Public in Storefront)</option>
                  <option value="DRAFT">🟡 DRAFT (Hidden In Progress)</option>
                  <option value="INACTIVE">🔴 INACTIVE (Archived)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F5F1] border border-slate-200/70 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#FF7A00]"
                />
                <span className="text-xs font-bold text-slate-800">🔥 Trending Item</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F5F1] border border-slate-200/70 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#FF7A00]"
                />
                <span className="text-xs font-bold text-slate-800">⭐ Best Seller Badge</span>
              </label>
            </div>
          </div>

          {/* Modular Content Architecture (No hardcoded section heading) */}
          <div className="clay-card p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                Modular Product Content
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize section headings and narrative body text for your product detail page.
              </p>
            </div>

            {/* Section Heading */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Section Heading (`descriptionTitle`)
                </label>
                <span className="text-[10px] text-slate-400">Optional &bull; Max 150 chars</span>
              </div>
              <input
                type="text"
                maxLength={150}
                value={descriptionTitle}
                onChange={(e) => setDescriptionTitle(e.target.value)}
                placeholder="e.g. Product Details, Why Your Pet Will Love It, Key Features, About This Food"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Primary Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Primary Product Description (`description`)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain key characteristics, ingredients overview, or design advantages..."
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {/* Materials & Safety Certifications */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Materials, Safety &amp; Quality (`materials`)
                </label>
                <span className="text-[10px] text-slate-400">Optional &bull; Max 2000 chars</span>
              </div>
              <textarea
                rows={3}
                maxLength={2000}
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="e.g. 100% natural food-grade rubber. Free from BPA, phthalates, and harsh chemical compounds."
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: CANONICAL IMAGE GALLERY (UPLOAD ONLY, MAX 9)
          ========================================================= */}
      {activeTab === "MEDIA" && (
        <div className="clay-card p-5 sm:p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                Canonical Product Images
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The first image (<code className="font-bold text-[#FF7A00]">images[0]</code>) is the primary store cover photo.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-[#FF7A00]">
              {images.length} / 9 Images
            </span>
          </div>

          {/* Upload Dropzone with Drag & Drop */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 sm:p-10 text-center cursor-pointer transition-all ${
              dragOver
                ? "border-orange-500 bg-orange-100/40 scale-[1.01]"
                : "border-slate-300 hover:border-orange-500 hover:bg-orange-50/20 bg-[#F8F5F1]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="clay-badge-orange p-3.5 text-white rounded-2xl shadow-md">
                <UploadCloud className={`h-7 w-7 ${isUploading ? "animate-bounce" : ""}`} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {isUploading
                  ? "Uploading photos to CDN storage..."
                  : "Drag & drop photos here, or click to browse files"}
              </p>
              <p className="text-[11px] text-slate-400">
                Upload up to 9 photos &bull; PNG, JPG, WEBP up to 10MB each
              </p>
            </div>
          </div>

          {/* Thumbnails Gallery with Reordering */}
          {images.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Gallery sequence (drag or use arrows to reorder):</span>
                <span className="text-[11px] font-bold text-[#FF7A00]">
                  ★ Cover: First image
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-2xl border p-1.5 bg-white flex flex-col justify-between group overflow-hidden transition-all ${
                      idx === 0
                        ? "ring-2 ring-[#FF7A00] border-transparent shadow-md"
                        : "border-slate-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="h-36 w-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="h-full w-full object-contain p-1"
                      />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-[#FF7A00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                          ★ Primary Cover
                        </span>
                      )}
                    </div>

                    {/* Controls Toolbar */}
                    <div className="flex items-center justify-between pt-2 px-1 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, "left")}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition"
                          title="Move Left"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => handleMoveImage(idx, "right")}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 transition"
                          title="Move Right"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="text-[10px] font-bold text-orange-600 hover:underline px-1"
                          >
                            Set Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 3: PRICING & VARIANTS (STRICT INVENTORY AUTHORITY)
          ========================================================= */}
      {activeTab === "PRICING_VARIANTS" && (
        <div className="space-y-5 animate-fade-in">
          {/* Master Pricing Card */}
          <div className="clay-card p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                Master Pricing &amp; Warehouse Inventory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasVariants
                  ? "Because variants exist below, variant pricing and variant stocks are authoritative."
                  : "Standalone product pricing and stock are authoritative."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* MRP Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  MRP Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    placeholder="2999"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-7 pr-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Discount / Selling Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Discount Selling Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) =>
                      setDiscountPrice(
                        e.target.value === "" ? "" : parseFloat(e.target.value)
                      )
                    }
                    placeholder="2499 (optional)"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-7 pr-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Warehouse Stock Authority Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Warehouse Stock Units
                  </label>
                  {hasVariants && (
                    <span className="text-[10px] font-extrabold text-[#FF7A00] bg-orange-100 px-2 py-0.5 rounded">
                      Derived from Variants (Read-Only)
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={hasVariants}
                  readOnly={hasVariants}
                  value={effectiveStock}
                  onChange={(e) =>
                    setStandaloneStock(
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                  placeholder="50"
                  className={`w-full rounded-xl border p-2.5 text-sm font-bold outline-none ${
                    hasVariants
                      ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-[#F8F5F1] border-slate-200/80 text-slate-900 focus:bg-white"
                  }`}
                />
                {hasVariants && (
                  <p className="text-[10.5px] text-slate-400">
                    Calculated automatically as the sum of all active variant stocks. Edit quantities inside each variant below.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Variants Builder Card */}
          <div className="clay-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                  Product Variants
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optional: Add size or pack variations. Variant stock quantities directly control total product inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="clay-btn-orange inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-xl shadow-xs self-start sm:self-auto cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Add Variant Option</span>
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#F8F5F1] border border-slate-200/70 text-center text-xs text-slate-500">
                No variants added. This product will be sold as a single standalone item using the master stock and price above.
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#F8F5F1] border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">
                        Variant #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-600">
                          Option Label / Weight
                        </label>
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                            );
                          }}
                          placeholder="e.g. 1.5 kg Pack"
                          className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-600">SKU Code</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                            );
                          }}
                          placeholder="KKT-1.5KG"
                          className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-600">MRP (₹)</label>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                            setVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                            );
                          }}
                          className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-600">Selling (₹)</label>
                        <input
                          type="number"
                          value={v.discountPrice}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                            setVariants((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, discountPrice: val } : item
                              )
                            );
                          }}
                          className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs font-bold"
                        />
                      </div>

                      {/* Authoritative Variant Stock */}
                      <div className="space-y-1">
                        <label className="text-[10.5px] font-bold text-emerald-700">
                          Stock (Authoritative)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => {
                            const val = e.target.value === "" ? "" : parseInt(e.target.value);
                            setVariants((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, stock: val } : item))
                            );
                          }}
                          className="w-full rounded-lg bg-white border-2 border-emerald-300 p-2 text-xs font-extrabold text-emerald-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: ATTRIBUTES & CUSTOM SPECIFICATIONS
          ========================================================= */}
      {activeTab === "ATTRIBUTES" && (
        <div className="clay-card p-5 sm:p-6 space-y-5 animate-fade-in">
          <div>
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
              Product Attributes &amp; Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard attributes and dynamic key-value specifications. All fields are optional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Life Stage</label>
              <input
                type="text"
                value={lifeStage}
                onChange={(e) => setLifeStage(e.target.value)}
                placeholder="e.g. Puppy, Adult, Senior, All Ages"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Net Weight</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 3 kg, 500 g"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Dimensions (L x W x H)</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 24 x 16 x 8 cm"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Country of Origin</label>
              <input
                type="text"
                value={countryOfOrigin}
                onChange={(e) => setCountryOfOrigin(e.target.value)}
                placeholder="India"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Colors (comma separated)</label>
              <input
                type="text"
                value={colorsText}
                onChange={(e) => setColorsText(e.target.value)}
                placeholder="e.g. Natural Tan, Orange"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Dynamic Custom Key-Value Specs */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-fraunces text-sm font-bold text-slate-900">
                  Custom Key-Value Specifications
                </h3>
                <p className="text-[11px] text-slate-400">
                  Optional: Add product-specific parameters like Kibble Size, Breed Size, Washable, etc.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCustomSpecs((prev) => [...prev, { label: "", value: "" }])}
                className="clay-button px-3 py-1.5 text-xs font-bold text-[#FF7A00] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Specification</span>
              </button>
            </div>

            {customSpecs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No custom specifications added.</p>
            ) : (
              <div className="space-y-2">
                {customSpecs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomSpecs((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, label: val } : item))
                        );
                      }}
                      placeholder="Specification Label (e.g. Breed Size)"
                      className="flex-1 rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2 text-xs text-slate-800 outline-none"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomSpecs((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, value: val } : item))
                        );
                      }}
                      placeholder="Value (e.g. All Breeds)"
                      className="flex-1 rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2 text-xs text-slate-800 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomSpecs((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: STRUCTURED GUIDES, INGREDIENTS & SEO (OPTIONAL)
          ========================================================= */}
      {activeTab === "GUIDES_SEO" && (
        <div className="space-y-5 animate-fade-in">
          {/* Key Highlights */}
          <div className="clay-card p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                  Key Highlights / Benefit Cards
                </h2>
                <p className="text-xs text-slate-500">
                  Optional benefit badges displayed on customer storefront product pages.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setHighlights((prev) => [
                    ...prev,
                    { title: "", description: "", icon: "🐾" },
                  ])
                }
                className="clay-button px-3 py-1.5 text-xs font-bold text-[#FF7A00] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Highlight</span>
              </button>
            </div>

            {highlights.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No highlights configured.</p>
            ) : (
              <div className="space-y-2">
                {highlights.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F8F5F1] border border-slate-200/80 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={h.icon}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHighlights((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, icon: val } : item))
                        );
                      }}
                      placeholder="🍗"
                      className="w-12 text-center rounded-lg bg-white border border-slate-200 p-1.5 text-lg"
                    />
                    <input
                      type="text"
                      value={h.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHighlights((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                        );
                      }}
                      placeholder="Title (e.g. Real Deboned Chicken)"
                      className="flex-1 rounded-lg bg-white border border-slate-200 p-1.5 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={h.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setHighlights((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, description: val } : item))
                        );
                      }}
                      placeholder="Description (e.g. Supports healthy muscle development)"
                      className="flex-1 rounded-lg bg-white border border-slate-200 p-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feeding Guide */}
          <div className="clay-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                  Feeding Guide &amp; Servings Table
                </h2>
                <p className="text-xs text-slate-500">
                  Optional: Serving recommendations for food or treats.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFeedingRows((prev) => [...prev, { petWeight: "", dailyAmount: "" }])
                }
                className="clay-button px-3 py-1.5 text-xs font-bold text-[#FF7A00] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Serving Row</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={feedingDesc}
              onChange={(e) => setFeedingDesc(e.target.value)}
              placeholder="Feeding instructions (e.g. Feed 2 to 3 times daily based on pet body weight)..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none"
            />

            {feedingRows.length > 0 && (
              <div className="space-y-2">
                {feedingRows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.petWeight}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFeedingRows((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, petWeight: val } : item))
                        );
                      }}
                      placeholder="Pet Weight (e.g. Up to 5 kg)"
                      className="flex-1 rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2 text-xs"
                    />
                    <input
                      type="text"
                      value={row.dailyAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFeedingRows((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, dailyAmount: val } : item
                          )
                        );
                      }}
                      placeholder="Daily Serving (e.g. 50–100 g)"
                      className="flex-1 rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setFeedingRows((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Care Instructions & SEO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="clay-card p-5 space-y-2">
              <h3 className="font-fraunces text-sm font-bold text-slate-900">
                Care Instructions
              </h3>
              <textarea
                rows={4}
                value={careInstructionsText}
                onChange={(e) => setCareInstructionsText(e.target.value)}
                placeholder="e.g. Store in a cool, dry place sealed inside an airtight container."
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="clay-card p-5 space-y-2">
              <h3 className="font-fraunces text-sm font-bold text-slate-900">
                SEO Search Engine Optimization
              </h3>
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Meta SEO Title"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2 text-xs text-slate-800 outline-none"
                />
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Meta SEO Description"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <span className="text-xs text-slate-400">
          KickAt Admin &bull; Single-Brand Platform
        </span>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/dashboard/products"
            className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="clay-btn-orange px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Publish Product</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
