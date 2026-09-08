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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
  PawPrint,
  Beef,
  Carrot,
  Utensils,
  Clock,
  XCircle,
  Flame,
  Info,
  IndianRupee,
  FileText,
  Search,
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

  // Categories list
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // 1. Basic Details
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [petSpecies, setPetSpecies] = useState<PetSpecies>("DOG");
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>("NON_VEG");
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [isTrending, setIsTrending] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  // 2. Pricing & Stock
  const [price, setPrice] = useState<number | "">("");
  const [discountPrice, setDiscountPrice] = useState<number | "">("");
  const [standaloneStock, setStandaloneStock] = useState<number | "">(0);

  // 3. Media Gallery (Upload only, Max 9)
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 4. Content Architecture (No hardcoded text)
  const [descriptionTitle, setDescriptionTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState("");

  // 5. Variants (Optional)
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

  // 6. Optional Collapsible Sections
  const [showOptionalSections, setShowOptionalSections] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("highlights");

  // Optional Attributes
  const [lifeStage, setLifeStage] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("India");
  const [colorsText, setColorsText] = useState("");
  const [customSpecs, setCustomSpecs] = useState<Array<{ label: string; value: string }>>([]);

  // Optional Highlights
  const [highlights, setHighlights] = useState<
    Array<{ title: string; description: string; icon: string }>
  >([]);

  // Optional Feeding Guide
  const [feedingDesc, setFeedingDesc] = useState("");
  const [feedingRows, setFeedingRows] = useState<Array<{ petWeight: string; dailyAmount: string }>>([]);

  // Optional Care Instructions
  const [careInstructionsText, setCareInstructionsText] = useState("");

  // Optional SEO Metadata
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Submission & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Categories
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

  // Stock Calculation Rule:
  // If variants exist, derivedVariantStock is authoritative (Read-only on master).
  // If no variants, standaloneStock is authoritative.
  const hasVariants = variants.length > 0;
  const derivedVariantStock = variants.reduce(
    (acc, v) => acc + (Number(v.stock) || 0),
    0
  );
  const effectiveStock = hasVariants ? derivedVariantStock : Number(standaloneStock) || 0;

  // Multi-Image Upload via AdminUploadService
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > 9) {
      showToast("Maximum 9 images allowed per product gallery", "error");
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

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

  // Variants Helper
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Essential validation
    if (!name.trim()) {
      setFormError("Product title / name is required.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!categoryId) {
      setFormError("Please select a catalog category.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (price === "" || Number(price) < 0) {
      setFormError("Valid MRP Price is required (must be >= 0).");
      return;
    }
    if (discountPrice !== "" && Number(discountPrice) >= Number(price)) {
      setFormError("Discount Selling Price must be less than the MRP Price.");
      return;
    }
    if (images.length === 0) {
      setFormError("Please upload at least 1 product photo for the catalog cover.");
      return;
    }

    try {
      setSubmitting(true);

      const careList = careInstructionsText
        .split("\n")
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

      const validFeedingRows = feedingRows.filter(
        (r) => r.petWeight.trim() && r.dailyAmount.trim()
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
        petSpecies: petSpecies || null,
        dietaryPreference: dietaryPreference || null,
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
        feedingGuide:
          feedingDesc.trim() || validFeedingRows.length > 0
            ? {
                description: feedingDesc.trim() || undefined,
                rows: validFeedingRows.length > 0 ? validFeedingRows : undefined,
              }
            : null,
        careInstructions: careList.length > 0 ? careList : undefined,
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
      showToast("Product published successfully! Redirecting...", "success");

      setTimeout(() => {
        router.push("/admin/dashboard/products");
      }, 1100);
    } catch (err: unknown) {
      const msg = AdminProductService.extractErrorMessage(err, "Failed to create product");
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Species icon renderer
  const renderSpeciesIcon = (sp: PetSpecies, size = "h-4 w-4") => {
    switch (sp) {
      case "DOG":
        return <Dog className={size} />;
      case "CAT":
        return <Cat className={size} />;
      case "BIRD":
        return <Bird className={size} />;
      case "FISH":
        return <Fish className={size} />;
      case "RABBIT":
        return <Rabbit className={size} />;
      default:
        return <PawPrint className={size} />;
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full min-w-0 animate-fade-in text-[#2A241E]">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-slide-in-down ${
            toast.type === "success"
              ? "bg-emerald-500/95 text-white border-emerald-400"
              : "bg-rose-500/95 text-white border-rose-400"
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/products"
            className="clay-button p-2 text-slate-600 hover:text-slate-900 rounded-xl transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold text-[#2A241E]">
              Add New Product
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              KickAt Store Catalog &bull; Single-Brand Platform
            </p>
          </div>
        </div>

        {/* Top Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
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
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Please review the following:</span>
            <span>{formError}</span>
          </div>
        </div>
      )}

      {/* Main Form Grid (2 Columns on Desktop, 1 Column on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =========================================================
            LEFT COLUMN: ESSENTIALS & CONTENT (8 Cols)
            ========================================================= */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card 1: Basic Information */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="clay-badge-orange p-1.5 rounded-xl text-white">
                <Tag className="h-4 w-4" />
              </div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                1. Basic Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Product Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Organic Grain-Free Puppy Kibble"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
                {slug && (
                  <p className="text-[11px] font-mono text-slate-400 pl-1 truncate">
                    Store URL: /products/{slug}
                  </p>
                )}
              </div>

              {/* Category & Slug Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Category <span className="text-rose-500">*</span>
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
                            {cat.parentId ? `└─ ${cat.name}` : cat.name}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="organic-grain-free-puppy-kibble"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs font-mono text-slate-800 outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Target Pet Species (Visual Touch Pills) */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Target Pet Species
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(["DOG", "CAT", "BIRD", "FISH", "RABBIT", "OTHER"] as PetSpecies[]).map((sp) => {
                    const selected = petSpecies === sp;
                    return (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => setPetSpecies(sp)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition cursor-pointer select-none ${
                          selected
                            ? "bg-orange-50 border-[#FF7A00] text-[#FF7A00] shadow-xs ring-1 ring-[#FF7A00]"
                            : "bg-[#F8F5F1] border-slate-200/70 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="mb-1">{renderSpeciesIcon(sp, "h-5 w-5")}</div>
                        <span className="text-[11px] font-bold">
                          {sp === "DOG"
                            ? "Dog"
                            : sp === "CAT"
                            ? "Cat"
                            : sp === "BIRD"
                            ? "Bird"
                            : sp === "FISH"
                            ? "Fish"
                            : sp === "RABBIT"
                            ? "Rabbit"
                            : "Other"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Formula (Visual Touch Pills) */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Dietary Formula
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "NON_VEG", label: "Non-Vegetarian", icon: Beef },
                      { id: "VEG", label: "Vegetarian", icon: Carrot },
                      { id: "BOTH", label: "Mixed / Both", icon: Utensils },
                    ] as const
                  ).map((diet) => {
                    const selected = dietaryPreference === diet.id;
                    const IconComp = diet.icon;
                    return (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => setDietaryPreference(diet.id)}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border transition cursor-pointer select-none ${
                          selected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500 font-bold"
                            : "bg-[#F8F5F1] border-slate-200/70 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                        }`}
                      >
                        <IconComp className="h-4 w-4 shrink-0" />
                        <span className="text-xs truncate">{diet.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Product Photos (Drag & Drop, Reorder, Cover Badge) */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="clay-badge-purple p-1.5 rounded-xl text-white">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                  2. Product Photos
                </h2>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#FF7A00]">
                {images.length} / 9 Photos
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
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
                <div className="clay-badge-orange p-3 text-white rounded-2xl shadow-sm">
                  <UploadCloud className={`h-6 w-6 ${isUploading ? "animate-bounce" : ""}`} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800">
                  {isUploading
                    ? "Uploading photos to CDN storage..."
                    : "Tap to choose photos or drag & drop"}
                </p>
                <p className="text-[11px] text-slate-400">
                  PNG, JPG, WEBP up to 10MB each &bull; First photo becomes the cover
                </p>
              </div>
            </div>

            {/* Uploaded Gallery Grid */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative rounded-2xl border p-1 bg-white flex flex-col justify-between overflow-hidden transition-all ${
                        idx === 0
                          ? "ring-2 ring-[#FF7A00] border-transparent shadow-md"
                          : "border-slate-200"
                      }`}
                    >
                      <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-contain p-1"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-[#FF7A00] text-white text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-current" /> Cover
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 px-1 text-xs">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveImage(idx, "left")}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Move Left"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === images.length - 1}
                            onClick={() => handleMoveImage(idx, "right")}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Move Right"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              className="text-[10px] font-bold text-orange-600 hover:underline"
                            >
                              Make Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete"
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

          {/* Card 3: Pricing & Inventory */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="clay-badge-green p-1.5 rounded-xl text-white">
                <IndianRupee className="h-4 w-4" />
              </div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                3. Pricing &amp; Warehouse Stock
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Selling Price (₹)
                  </label>
                  {price && discountPrice && Number(discountPrice) < Number(price) && (
                    <span className="text-[10.5px] font-extrabold text-emerald-600">
                      {Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100)}% OFF
                    </span>
                  )}
                </div>
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
                      setDiscountPrice(e.target.value === "" ? "" : parseFloat(e.target.value))
                    }
                    placeholder="2499 (optional)"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-7 pr-3 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Stock Input (Strict Inventory Authority Rule) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Total Warehouse Units
                  </label>
                  {hasVariants && (
                    <span className="text-[10px] font-extrabold text-[#FF7A00] bg-orange-100 px-1.5 py-0.5 rounded">
                      Derived
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
                    setStandaloneStock(e.target.value === "" ? "" : parseInt(e.target.value))
                  }
                  placeholder="50"
                  className={`w-full rounded-xl border p-2.5 text-sm font-bold outline-none ${
                    hasVariants
                      ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-[#F8F5F1] border-slate-200/80 text-slate-900 focus:bg-white"
                  }`}
                />
                {hasVariants && (
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Calculated automatically from variant stocks below.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Variants Builder (Optional) */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="clay-badge-amber p-1.5 rounded-xl text-white">
                  <Boxes className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                    4. Product Variants (Optional)
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Add size or weight variations (e.g. 1.5kg, 3kg, 12kg) with separate stocks.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="clay-button px-3.5 py-1.5 text-xs font-bold text-[#FF7A00] hover:text-orange-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Add Variant</span>
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="p-5 rounded-xl bg-[#F8F5F1] text-center text-xs text-slate-500">
                No variants added. This product will be sold as a single standalone item.
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F8F5F1] border border-slate-200/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">
                        Variant Option #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10.5px] font-bold text-slate-600">
                          Option Label
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
                        <label className="text-[10.5px] font-bold text-slate-600">Price (₹)</label>
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
                        <label className="text-[10.5px] font-bold text-emerald-700">
                          Stock (Units)
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

          {/* Card 5: Product Story & Description */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="clay-badge-purple p-1.5 rounded-xl text-white">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-slate-900">
                5. Product Story &amp; Details
              </h2>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Custom Section Heading (`descriptionTitle`)
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={descriptionTitle}
                  onChange={(e) => setDescriptionTitle(e.target.value)}
                  placeholder="e.g. Product Details, Why Your Pet Will Love It, Key Features, About This Food"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Detailed Description (`description`)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a clear, helpful overview of the product for pet parents..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Materials, Ingredients &amp; Safety (`materials`)
                </label>
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. 100% natural sustainably sourced ingredients. Non-toxic, BPA-free safety standards."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Optional Structured Sections (Collapsible) */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <button
              type="button"
              onClick={() => setShowOptionalSections((prev) => !prev)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="clay-badge-orange p-1.5 rounded-xl text-white">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-bold text-slate-900">
                    Optional Guides &amp; Specifications
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Highlights, Feeding Table, Custom Specifications &amp; SEO metadata
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-slate-100 text-slate-600">
                {showOptionalSections ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {showOptionalSections && (
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-fade-in">
                {/* Accordion 1: Highlights */}
                <div className="p-3.5 rounded-xl bg-[#F8F5F1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Product Highlights / Feature Cards
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setHighlights((prev) => [
                          ...prev,
                          { title: "", description: "", icon: "Sparkles" },
                        ])
                      }
                      className="text-xs font-bold text-[#FF7A00] hover:underline"
                    >
                      + Add Highlight
                    </button>
                  </div>

                  {highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={h.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHighlights((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                          );
                        }}
                        placeholder="Highlight Title"
                        className="flex-1 rounded-lg bg-white border border-slate-200 p-2 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={h.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHighlights((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, description: val } : item
                            )
                          );
                        }}
                        placeholder="Short description"
                        className="flex-1 rounded-lg bg-white border border-slate-200 p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setHighlights((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Accordion 2: Feeding Guide */}
                <div className="p-3.5 rounded-xl bg-[#F8F5F1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Feeding Guide &amp; Daily Amount Table
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFeedingRows((prev) => [
                          ...prev,
                          { petWeight: "", dailyAmount: "" },
                        ])
                      }
                      className="text-xs font-bold text-[#FF7A00] hover:underline"
                    >
                      + Add Serving Row
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={feedingDesc}
                    onChange={(e) => setFeedingDesc(e.target.value)}
                    placeholder="Instructions: Feed 2-3 times daily based on weight..."
                    className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs"
                  />

                  {feedingRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.petWeight}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFeedingRows((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, petWeight: val } : item
                            )
                          );
                        }}
                        placeholder="Weight (e.g. Up to 5 kg)"
                        className="flex-1 rounded-lg bg-white border border-slate-200 p-2 text-xs"
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
                        placeholder="Daily Amount (e.g. 50-100 g)"
                        className="flex-1 rounded-lg bg-white border border-slate-200 p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFeedingRows((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Accordion 3: Custom Specs */}
                <div className="p-3.5 rounded-xl bg-[#F8F5F1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Custom Key-Value Specs (e.g. Kibble Size, Breed Size)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomSpecs((prev) => [...prev, { label: "", value: "" }])
                      }
                      className="text-xs font-bold text-[#FF7A00] hover:underline"
                    >
                      + Add Spec
                    </button>
                  </div>

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
                        placeholder="Label (e.g. Kibble Size)"
                        className="flex-1 rounded-lg bg-white border border-slate-200 p-2 text-xs"
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
                        placeholder="Value (e.g. Medium 10mm)"
                        className="flex-1 rounded-lg bg-white border border-slate-200 p-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCustomSpecs((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Accordion 4: SEO Metadata */}
                <div className="p-3.5 rounded-xl bg-[#F8F5F1] space-y-2">
                  <span className="text-xs font-bold text-slate-800">SEO Search Engine Preview</span>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Meta Title"
                    className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs"
                  />
                  <textarea
                    rows={2}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Meta Description"
                    className="w-full rounded-lg bg-white border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: STATUS, LIVE PREVIEW & PUBLISH (4 Cols)
            ========================================================= */}
        <div className="lg:col-span-4 space-y-5">
          {/* Card: Publishing Controls */}
          <div className="clay-card p-4 sm:p-5 space-y-4">
            <h3 className="font-fraunces text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Publishing Options
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Catalog Status</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: "ACTIVE", label: "Active", icon: CheckCircle2, activeClass: "bg-emerald-600 text-white" },
                      { id: "DRAFT", label: "Draft", icon: Clock, activeClass: "bg-amber-500 text-white" },
                      { id: "INACTIVE", label: "Archive", icon: XCircle, activeClass: "bg-slate-700 text-white" },
                    ] as const
                  ).map((st) => {
                    const selected = status === st.id;
                    const IconComp = st.icon;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(st.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition cursor-pointer select-none ${
                          selected
                            ? `${st.activeClass} shadow-xs border-transparent`
                            : "bg-[#F8F5F1] border-slate-200/70 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <IconComp className="h-4 w-4 mb-0.5" />
                        <span className="text-[11px]">{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badges Toggle */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F5F1] border border-slate-200/70 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#FF7A00]"
                  />
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-bold text-slate-800">Trending Item</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F8F5F1] border border-slate-200/70 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#FF7A00]"
                  />
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800">Best Seller Badge</span>
                </label>
              </div>
            </div>

            {/* Desktop Publish Button */}
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full clay-btn-orange py-3 text-sm font-bold text-white rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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

          {/* Live Storefront Preview Card */}
          <div className="clay-card p-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Live Customer Store Preview
            </span>

            <div className="rounded-2xl bg-[#F8F5F1] border border-slate-200/80 p-3 space-y-2">
              <div className="h-40 w-full rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden relative">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt=""
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <div className="p-2 rounded-xl bg-slate-50 text-orange-500 mb-1">
                      {renderSpeciesIcon(petSpecies, "h-6 w-6")}
                    </div>
                    <span className="text-[10px] text-slate-400">Photo will appear here</span>
                  </div>
                )}

                {isBestSeller && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                    <Sparkles className="h-3 w-3" /> Best Seller
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-[#FF7A00] font-bold truncate">
                    {categories.find((c) => c.id === categoryId)?.name || "Category"}
                  </span>
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    {renderSpeciesIcon(petSpecies, "h-3 w-3 text-orange-600")}
                    <span>{petSpecies}</span>
                  </span>
                </div>
                <p className="font-fraunces text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                  {name || "Untitled Product"}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-fraunces text-base font-bold text-slate-900">
                    ₹{discountPrice ? Number(discountPrice).toLocaleString("en-IN") : price ? Number(price).toLocaleString("en-IN") : "0"}
                  </span>
                  {discountPrice && price && Number(discountPrice) < Number(price) && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{Number(price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl flex items-center gap-2.5">
        <Link
          href="/admin/dashboard/products"
          className="clay-button flex-1 py-2.5 text-center text-xs font-bold text-slate-700 rounded-xl"
        >
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="clay-btn-orange flex-2 py-2.5 text-xs font-bold text-white rounded-xl shadow-md flex items-center justify-center gap-1.5"
        >
          {submitting ? (
            <span>Publishing...</span>
          ) : (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Publish Product</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
