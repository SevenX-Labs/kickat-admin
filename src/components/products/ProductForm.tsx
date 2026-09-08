"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Sparkles,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
  HelpCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
} from "lucide-react";

import {
  AdminProductItem,
  CreateProductDto,
  UpdateProductDto,
  PetSpecies,
  DietaryPreference,
  ProductStatus,
  ProductHighlight,
  NutritionItem,
  FeedingRow,
  SizeItem,
  VariantAttributes,
} from "@/types/admin-product";
import { AdminProductService } from "@/services/adminProductService";
import { AdminCategoryService } from "@/services/adminCategoryService";
import { AdminCategoryItem } from "@/types/admin-category";

import { StepNavigation } from "./StepNavigation";
import { PhotoGalleryUploader } from "./PhotoGalleryUploader";
import { ProductSellingMode, SellingMode } from "./ProductSellingMode";
import { VariantOptionCard, OptionItemData } from "./VariantOptionCard";
import {
  CategorySelector,
  detectPetSpeciesFromCategory,
  getCategoryBreadcrumb,
} from "./CategorySelector";
import { HighlightsEditor } from "./HighlightsEditor";
import { ReviewSummary } from "./ReviewSummary";
import { slugify, generateProductSku } from "./slugUtils";

export interface ProductFormProps {
  mode: "create" | "edit";
  initialProduct?: AdminProductItem | null;
}

const PET_SPECIES_OPTIONS: Array<{ id: PetSpecies; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "DOG", label: "Dog", icon: Dog },
  { id: "CAT", label: "Cat", icon: Cat },
  { id: "BIRD", label: "Bird", icon: Bird },
  { id: "FISH", label: "Fish", icon: Fish },
  { id: "RABBIT", label: "Rabbit", icon: Rabbit },
  { id: "OTHER", label: "Other", icon: HelpCircle },
];

export function ProductForm({ mode, initialProduct }: ProductFormProps) {
  const router = useRouter();

  // Navigation & Step Tracking
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() =>
    mode === "edit" ? [1, 2, 3, 4, 5] : []
  );

  // Categories
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);

  // Form State - Step 1: Basic Information
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [isSlugManual, setIsSlugManual] = useState(() => mode === "edit");
  const [showAdvancedSlug, setShowAdvancedSlug] = useState(false);
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || "");
  const [petSpecies, setPetSpecies] = useState<PetSpecies>(
    initialProduct?.petSpecies || "DOG"
  );
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(
    initialProduct?.dietaryPreference || "NON_VEG"
  );
  const [status, setStatus] = useState<ProductStatus>(
    initialProduct?.status || "ACTIVE"
  );
  const [isTrending, setIsTrending] = useState(Boolean(initialProduct?.isTrending));
  const [isBestSeller, setIsBestSeller] = useState(
    Boolean(initialProduct?.isBestSeller)
  );

  // Form State - Step 2: Photos
  const [images, setImages] = useState<string[]>(() =>
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images
      : []
  );

  // Form State - Step 3: Pricing & Options
  const [sellingMode, setSellingMode] = useState<SellingMode>(() =>
    initialProduct?.variants && initialProduct.variants.length > 0
      ? "options"
      : "single"
  );
  const [price, setPrice] = useState<number | "">(initialProduct?.price ?? "");
  const [discountPrice, setDiscountPrice] = useState<number | "" | null>(
    initialProduct?.discountPrice ?? ""
  );
  const [stock, setStock] = useState<number | "">(initialProduct?.stock ?? 0);
  const [options, setOptions] = useState<OptionItemData[]>(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants.map((v) => {
        const rawAttrs = v.attributes || {};
        const safeAttrs: VariantAttributes = {};
        for (const [k, val] of Object.entries(rawAttrs)) {
          if (val !== undefined && val !== null) {
            safeAttrs[k.toLowerCase()] = String(val);
          }
        }
        return {
          id: v.id,
          name: v.name || "",
          sku: v.sku || "",
          price: v.price ?? "",
          discountPrice: v.discountPrice ?? "",
          stock: v.stock ?? 0,
          attributes: safeAttrs,
          imageUrl: v.imageUrl || null,
        };
      });
    }
    return [];
  });

  // Form State - Step 4: Product Information
  const [descriptionTitle, setDescriptionTitle] = useState(
    initialProduct?.descriptionTitle || ""
  );
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [materials, setMaterials] = useState(initialProduct?.materials || "");
  const [highlights, setHighlights] = useState<ProductHighlight[]>(
    initialProduct?.highlights || []
  );

  // Form State - Step 5: Additional Information
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Specifications
  const [lifeStage, setLifeStage] = useState(
    initialProduct?.attributes?.lifeStage || ""
  );
  const [weight, setWeight] = useState(initialProduct?.attributes?.weight || "");
  const [dimensions, setDimensions] = useState(
    initialProduct?.attributes?.dimensions || ""
  );
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    initialProduct?.attributes?.countryOfOrigin || "India"
  );
  const [customSpecs, setCustomSpecs] = useState<Array<{ label: string; value: string }>>(
    initialProduct?.attributes?.custom || []
  );

  // Ingredients & Nutrition
  const [ingredientsDesc, setIngredientsDesc] = useState(
    initialProduct?.ingredients?.description || ""
  );
  const [ingredientItems] = useState<string[]>(
    initialProduct?.ingredients?.items || []
  );
  const [nutritionRows, setNutritionRows] = useState<NutritionItem[]>(
    initialProduct?.ingredients?.nutrition || []
  );

  // Feeding Guide
  const [feedingDesc, setFeedingDesc] = useState(
    initialProduct?.feedingGuide?.description || ""
  );
  const [feedingRows, setFeedingRows] = useState<FeedingRow[]>(
    initialProduct?.feedingGuide?.rows || []
  );

  // Care Instructions
  const [careInstructions, setCareInstructions] = useState<string[]>(
    initialProduct?.careInstructions || []
  );
  const [careInput, setCareInput] = useState("");

  // Size Guide
  const [sizeGuideEnabled, setSizeGuideEnabled] = useState(
    Boolean(initialProduct?.sizeGuide?.enabled)
  );
  const [sizeGuideDesc, setSizeGuideDesc] = useState(
    initialProduct?.sizeGuide?.description || ""
  );
  const [sizeGuideSizes, setSizeGuideSizes] = useState<SizeItem[]>(
    initialProduct?.sizeGuide?.sizes || []
  );
  const [sizeGuideNote] = useState(
    initialProduct?.sizeGuide?.note || ""
  );

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    initialProduct?.seoDescription || ""
  );

  // Validation & Submission States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePermanent, setDeletePermanent] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteProduct = async () => {
    if (!initialProduct?.id) return;
    try {
      setDeleting(true);
      await AdminProductService.deleteProduct(initialProduct.id, deletePermanent);
      router.push("/admin/dashboard/products");
    } catch (err: unknown) {
      const msg = AdminProductService.extractErrorMessage(
        err,
        "Failed to delete product."
      );
      setApiError(msg);
      setIsDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  // Load Categories on mount
  useEffect(() => {
    let mounted = true;
    async function loadCats() {
      try {
        const res = await AdminCategoryService.getCategories();
        if (mounted && res.data?.categories) {
          const loadedCats = res.data.categories;
          setCategories(loadedCats);
          if (categoryId) {
            const currentCat = loadedCats.find((c) => c.id === categoryId);
            if (currentCat) {
              const derived = detectPetSpeciesFromCategory(currentCat, loadedCats);
              if (derived) {
                setPetSpecies(derived);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCats();
    return () => {
      mounted = false;
    };
  }, [categoryId]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManual && mode === "create") {
      setSlug(slugify(val));
    }
  };

  const handleCategoryChange = (newCatId: string, newCat?: AdminCategoryItem) => {
    setCategoryId(newCatId);
    if (errors.categoryId) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.categoryId;
        return next;
      });
    }

    const cat = newCat || categories.find((c) => c.id === newCatId);
    if (cat) {
      const derived = detectPetSpeciesFromCategory(cat, categories);
      if (derived) {
        setPetSpecies(derived);
      }
    }
  };

  // Determine if category is food/nutrition related
  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === categoryId);
  }, [categories, categoryId]);

  const detectedSpecies = useMemo((): PetSpecies | null => {
    return detectPetSpeciesFromCategory(selectedCategory, categories);
  }, [selectedCategory, categories]);

  const isFoodCategory = useMemo(() => {
    if (!selectedCategory) return false;
    const combined = `${selectedCategory.name} ${selectedCategory.slug}`.toLowerCase();
    return /food|treat|nutrition|diet|edible|chew|snack|biscuit/i.test(combined);
  }, [selectedCategory]);

  // Calculate Total Stock when in options mode
  const calculatedTotalStock = useMemo(() => {
    if (sellingMode === "single") {
      return typeof stock === "number" ? stock : 0;
    }
    return options.reduce(
      (sum, opt) => sum + (typeof opt.stock === "number" ? opt.stock : 0),
      0
    );
  }, [sellingMode, stock, options]);

  // Count how many additional info sections have content
  const additionalInfoCount = useMemo(() => {
    let count = 0;
    if (lifeStage || weight || dimensions || customSpecs.length > 0) count++;
    if (ingredientsDesc || ingredientItems.length > 0 || nutritionRows.length > 0) count++;
    if (feedingDesc || feedingRows.length > 0) count++;
    if (careInstructions.length > 0) count++;
    if (sizeGuideEnabled && (sizeGuideDesc || sizeGuideSizes.length > 0)) count++;
    if (seoTitle || seoDescription) count++;
    return count;
  }, [
    lifeStage,
    weight,
    dimensions,
    customSpecs,
    ingredientsDesc,
    ingredientItems,
    nutritionRows,
    feedingDesc,
    feedingRows,
    careInstructions,
    sizeGuideEnabled,
    sizeGuideDesc,
    sizeGuideSizes,
    seoTitle,
    seoDescription,
  ]);

  // Option actions
  const handleAddOption = () => {
    const newOption: OptionItemData = {
      name: "",
      sku: "",
      price: price !== "" ? price : "",
      discountPrice:
        discountPrice !== "" && discountPrice !== null ? discountPrice : "",
      stock: "",
      attributes: {},
      imageUrl: images[0] || null,
    };
    setOptions([...options, newOption]);
  };

  const handleDuplicateOption = (index: number) => {
    const source = options[index];
    const newIndex = options.length + 1;
    const cleanName = `${source.name} (Copy)`;
    const newSku = source.sku
      ? `${source.sku.replace(/-(COPY|\d+)$/i, "")}-COPY`
      : generateProductSku(name, cleanName, newIndex);
    const duplicated: OptionItemData = {
      name: cleanName,
      sku: newSku,
      price: source.price,
      discountPrice: source.discountPrice,
      stock: source.stock,
      attributes: { ...source.attributes },
      imageUrl: source.imageUrl || null,
    };
    const updated = [...options];
    updated.splice(index + 1, 0, duplicated);
    setOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, updated: OptionItemData) => {
    const copy = [...options];
    copy[index] = updated;
    setOptions(copy);
  };

  // Step Validation Logic
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!name.trim()) {
        newErrors.name = "Please enter a product name.";
      }
      if (!categoryId) {
        newErrors.categoryId = "Please select a category.";
      }
    } else if (stepNumber === 2) {
      if (images.length === 0) {
        newErrors.images = "Please add at least one product photo.";
      }
    } else if (stepNumber === 3) {
      if (sellingMode === "single") {
        if (price === "" || Number(price) <= 0) {
          newErrors.price = "Please enter an original price greater than 0.";
        }
        if (stock === "" || Number(stock) < 0) {
          newErrors.stock = "Stock cannot be negative.";
        }
        if (
          discountPrice !== "" &&
          discountPrice !== null &&
          Number(discountPrice) >= Number(price)
        ) {
          newErrors.discountPrice =
            "Selling price must be lower than the original price.";
        }
      } else {
        // Options mode
        if (options.length === 0) {
          newErrors.options =
            "Please add at least one product option, or switch to Single Product mode.";
        } else {
          options.forEach((opt, idx) => {
            if (!opt.name.trim()) {
              newErrors[`option_${idx}_name`] = "Please enter an option name.";
            }
            if (opt.price === "" || Number(opt.price) <= 0) {
              newErrors[`option_${idx}_price`] = "Please enter an original price.";
            }
            if (opt.stock === "" || Number(opt.stock) < 0) {
              newErrors[`option_${idx}_stock`] = "Stock cannot be negative.";
            }
            if (
              opt.discountPrice !== "" &&
              opt.discountPrice !== null &&
              Number(opt.discountPrice) >= Number(opt.price)
            ) {
              newErrors[`option_${idx}_discountPrice`] =
                "Selling price must be lower than the original price.";
            }
          });
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    setApiError(null);
    if (!validateStep(currentStep)) {
      return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    setCurrentStep((prev) => Math.min(6, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setApiError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepClick = (stepId: number) => {
    setApiError(null);
    // If going forward, ensure current step validates
    if (stepId > currentStep && !validateStep(currentStep)) {
      return;
    }
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Full form submission
  const handleSubmit = async () => {
    setApiError(null);
    setSuccessMessage(null);

    // Validate all required steps: 1, 2, 3
    for (let s = 1; s <= 3; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setSubmitting(true);

    try {
      // Build Variants Payload if options mode
      const hasOptions = sellingMode === "options" && options.length > 0;

      let effectivePrice = price !== "" ? Number(price) : 0;
      let effectiveDiscountPrice =
        discountPrice !== "" && discountPrice !== null
          ? Number(discountPrice)
          : null;

      // If options exist, authoritative pricing is at variant level; product level takes first variant's values
      if (hasOptions) {
        effectivePrice = Number(options[0].price);
        effectiveDiscountPrice =
          options[0].discountPrice !== "" && options[0].discountPrice !== null
            ? Number(options[0].discountPrice)
            : null;
      }

      const variantsPayload = hasOptions
        ? options.map((opt) => {
            // Strictly preserve all existing key-value pairs in attributes
            const attrs = { ...opt.attributes };

            return {
              ...(opt.id ? { id: opt.id } : {}),
              name: opt.name.trim(),
              sku: opt.sku?.trim() || null,
              price: Number(opt.price),
              discountPrice:
                opt.discountPrice !== "" &&
                opt.discountPrice !== null &&
                opt.discountPrice !== undefined
                  ? Number(opt.discountPrice)
                  : null,
              stock: typeof opt.stock === "number" ? opt.stock : 0,
              attributes: attrs,
              imageUrl: opt.imageUrl || null,
            };
          })
        : [];

      // Build structured attributes
      const attributesPayload = {
        ...(lifeStage ? { lifeStage } : {}),
        ...(weight ? { weight } : {}),
        ...(dimensions ? { dimensions } : {}),
        ...(countryOfOrigin ? { countryOfOrigin } : {}),
        ...(customSpecs.length > 0 ? { custom: customSpecs } : {}),
      };

      // Build structured ingredients
      const ingredientsPayload =
        ingredientsDesc || ingredientItems.length > 0 || nutritionRows.length > 0
          ? {
              ...(ingredientsDesc ? { description: ingredientsDesc } : {}),
              ...(ingredientItems.length > 0 ? { items: ingredientItems } : {}),
              ...(nutritionRows.length > 0 ? { nutrition: nutritionRows } : {}),
            }
          : null;

      // Build structured feeding guide
      const feedingGuidePayload =
        feedingDesc || feedingRows.length > 0
          ? {
              ...(feedingDesc ? { description: feedingDesc } : {}),
              ...(feedingRows.length > 0 ? { rows: feedingRows } : {}),
            }
          : null;

      // Build structured size guide
      const sizeGuidePayload = sizeGuideEnabled
        ? {
            enabled: true,
            ...(sizeGuideDesc ? { description: sizeGuideDesc } : {}),
            ...(sizeGuideSizes.length > 0 ? { sizes: sizeGuideSizes } : {}),
            ...(sizeGuideNote ? { note: sizeGuideNote } : {}),
          }
        : null;

      if (mode === "create") {
        const createPayload: CreateProductDto = {
          name: name.trim(),
          ...(slug.trim() ? { slug: slug.trim() } : {}),
          categoryId,
          petSpecies: detectedSpecies || petSpecies || null,
          dietaryPreference: isFoodCategory ? dietaryPreference : null,
          status,
          isTrending,
          isBestSeller,
          price: effectivePrice,
          discountPrice: effectiveDiscountPrice,
          stock: calculatedTotalStock,
          images,
          descriptionTitle: descriptionTitle.trim() || null,
          description: description.trim() || null,
          materials: materials.trim() || null,
          highlights: highlights.filter((h) => h.title.trim()),
          attributes: Object.keys(attributesPayload).length > 0 ? attributesPayload : null,
          ingredients: ingredientsPayload,
          feedingGuide: feedingGuidePayload,
          careInstructions: careInstructions.filter((c) => c.trim()),
          sizeGuide: sizeGuidePayload,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
          ...(hasOptions ? { variants: variantsPayload } : { variants: [] }),
        };

        await AdminProductService.createProduct(createPayload);
        setSuccessMessage("Product created successfully!");
        setTimeout(() => {
          router.push("/admin/dashboard/products");
        }, 1200);
      } else if (mode === "edit" && initialProduct) {
        const updatePayload: UpdateProductDto = {
          name: name.trim(),
          slug: slug.trim() || undefined,
          categoryId,
          petSpecies: detectedSpecies || petSpecies || null,
          dietaryPreference: isFoodCategory ? dietaryPreference : null,
          status,
          isTrending,
          isBestSeller,
          price: effectivePrice,
          discountPrice: effectiveDiscountPrice,
          stock: calculatedTotalStock,
          images,
          descriptionTitle: descriptionTitle.trim() || null,
          description: description.trim() || null,
          materials: materials.trim() || null,
          highlights: highlights.filter((h) => h.title.trim()),
          attributes: Object.keys(attributesPayload).length > 0 ? attributesPayload : null,
          ingredients: ingredientsPayload,
          feedingGuide: feedingGuidePayload,
          careInstructions: careInstructions.filter((c) => c.trim()),
          sizeGuide: sizeGuidePayload,
          seoTitle: seoTitle.trim() || null,
          seoDescription: seoDescription.trim() || null,
          variants: variantsPayload,
        };

        await AdminProductService.updateProduct(initialProduct.id, updatePayload);
        setSuccessMessage("Product updated successfully!");
        setTimeout(() => {
          router.push("/admin/dashboard/products");
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = AdminProductService.extractErrorMessage(
        err,
        "Failed to save product. Please check all fields and try again."
      );
      setApiError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic label for primary publish button based on status
  const primaryButtonLabel = useMemo(() => {
    if (submitting) {
      return mode === "create" ? "Publishing..." : "Saving...";
    }
    if (mode === "edit") {
      return "Save Changes";
    }
    if (status === "DRAFT") {
      return "Save as Draft";
    }
    if (status === "INACTIVE") {
      return "Save as Inactive";
    }
    return "Publish Product";
  }, [submitting, mode, status]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/products"
            className="h-10 w-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs"
            title="Back to Products"
            aria-label="Back to Products"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-slate-900">
              {mode === "create" ? "Add New Product" : "Edit Product"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === "create"
                ? "Follow the 6 simple steps to configure and publish your product."
                : `Editing: ${name || initialProduct?.name || "Product"}`}
            </p>
          </div>
        </div>

        {/* Quick status pill & Delete button in header */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700"
                : status === "DRAFT"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {status === "ACTIVE" && <CheckCircle2 className="h-3 w-3" />}
            {status === "DRAFT" && <Clock className="h-3 w-3" />}
            {status === "INACTIVE" && <XCircle className="h-3 w-3" />}
            <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
          </span>

          {mode === "edit" && initialProduct && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="ml-2 px-3 py-1 rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Delete Product"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Step Navigation Bar */}
      <StepNavigation
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Feedback Banners */}
      {apiError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Submission Error</p>
            <p className="text-xs leading-relaxed">{apiError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="font-bold">{successMessage}</p>
        </div>
      )}

      {/* Main Step Container */}
      <div className="clay-card p-5 sm:p-7 bg-white">
        {/* ======================================================== */}
        {/* STEP 1: BASIC INFORMATION */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="font-fraunces text-xl font-bold text-slate-900">
                Basic Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Start with the basic details customers need to find your product.
              </p>
            </div>

            <div className="space-y-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter product name (e.g., Premium Dog Chew Stick)"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
                    errors.name
                      ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                      : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Category *
                </label>
                <CategorySelector
                  value={categoryId}
                  categories={categories}
                  error={errors.categoryId}
                  onChange={handleCategoryChange}
                />
              </div>

              {/* Pet Type */}
              {detectedSpecies ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Pet Type
                  </label>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-orange-100/80 text-[#FF7A00] flex items-center justify-center font-bold">
                        {(() => {
                          const opt = PET_SPECIES_OPTIONS.find((p) => p.id === detectedSpecies);
                          const IconComp = opt ? opt.icon : HelpCircle;
                          return <IconComp className="h-5 w-5" />;
                        })()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2A241E]">
                          {PET_SPECIES_OPTIONS.find((p) => p.id === detectedSpecies)?.label || detectedSpecies}
                        </div>
                        <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                          <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                          <span>Automatically selected from the product category.</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Derived
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Pet Type
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Select pet species for this category
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {PET_SPECIES_OPTIONS.map((item) => {
                      const isSelected = petSpecies === item.id;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPetSpecies(item.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition cursor-pointer select-none ${
                            isSelected
                              ? "bg-[#FFF5EB] border-[#FF7A00] text-[#FF7A00] shadow-xs"
                              : "bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <IconComp className="h-5 w-5 mb-1 text-inherit" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dietary / Formula (Category-Aware: Shown for food/treats) */}
              {isFoodCategory && (
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200/60 space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Dietary Preference
                  </label>
                  <p className="text-xs text-slate-500">
                    Since this category is food/nutrition related, specify the diet formula:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "VEG", label: "Vegetarian" },
                        { id: "NON_VEG", label: "Non-Vegetarian" },
                        { id: "BOTH", label: "All / Both" },
                      ] as const
                    ).map((diet) => (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => setDietaryPreference(diet.id)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center select-none ${
                          dietaryPreference === diet.id
                            ? "bg-[#FF7A00] text-white border-transparent shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {diet.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Catalog Status */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  Catalog Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "ACTIVE", label: "Active", icon: CheckCircle2, activeClass: "bg-emerald-600 text-white" },
                      { id: "DRAFT", label: "Draft", icon: Clock, activeClass: "bg-amber-500 text-white" },
                      { id: "INACTIVE", label: "Inactive", icon: XCircle, activeClass: "bg-slate-700 text-white" },
                    ] as const
                  ).map((st) => {
                    const isSelected = status === st.id;
                    const IconComp = st.icon;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatus(st.id)}
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer select-none ${
                          isSelected
                            ? `${st.activeClass} border-transparent shadow-xs`
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <IconComp className="h-4 w-4" />
                        <span>{st.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badges Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#FF7A00]"
                  />
                  <Flame className="h-4 w-4 text-orange-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Trending Item</span>
                    <span className="text-[11px] text-slate-400">Feature on trending section</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#FF7A00]"
                  />
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Best Seller Badge</span>
                    <span className="text-[11px] text-slate-400">Highlight with gold badge</span>
                  </div>
                </label>
              </div>

              {/* Advanced Settings: Store Link (URL Slug) */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSlug(!showAdvancedSlug)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Advanced Settings (Store Link)</span>
                  {showAdvancedSlug ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                {showAdvancedSlug && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Store Link
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSlugManual(true)}
                        className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                      >
                        Edit link
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-600">
                      <span className="text-slate-400 shrink-0">kickat.co.in/products/</span>
                      <input
                        type="text"
                        value={slug}
                        readOnly={!isSlugManual}
                        onChange={(e) => {
                          setIsSlugManual(true);
                          setSlug(e.target.value);
                        }}
                        placeholder="product-slug"
                        className="flex-1 bg-transparent outline-none font-mono text-slate-800 px-1"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      The URL link where customers view this product. Generated automatically from product name.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PRODUCT PHOTOS */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <PhotoGalleryUploader
            images={images}
            onChange={(newImgs) => {
              setImages(newImgs);
              if (errors.images) {
                setErrors({ ...errors, images: "" });
              }
            }}
            error={errors.images}
          />
        )}

        {/* ======================================================== */}
        {/* STEP 3: PRICING & OPTIONS */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Selling Mode Selector */}
            <ProductSellingMode
              mode={sellingMode}
              onChange={(m) => {
                setSellingMode(m);
                if (m === "options" && options.length === 0) {
                  // Initialize with a single blank option carrying over single-mode pricing/stock if entered, or empty
                  setOptions([
                    {
                      name: "",
                      sku: "",
                      price: price !== "" ? price : "",
                      discountPrice:
                        discountPrice !== "" && discountPrice !== null
                          ? discountPrice
                          : "",
                      stock: stock !== "" ? Number(stock) : "",
                      attributes: {},
                      imageUrl: images[0] || null,
                    },
                  ]);
                }
              }}
            />

            {/* SINGLE PRODUCT PRICING */}
            {sellingMode === "single" && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">
                    Single Product Pricing & Inventory
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customers will buy this product at this price.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Original Price */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Original Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={price}
                        onChange={(e) =>
                          setPrice(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="799"
                        className={`w-full rounded-xl border pl-7 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
                          errors.price
                            ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                            : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
                        }`}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.price}
                      </p>
                    )}
                  </div>

                  {/* Selling Price */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Selling Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={discountPrice ?? ""}
                        onChange={(e) =>
                          setDiscountPrice(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="699"
                        className={`w-full rounded-xl border pl-7 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
                          errors.discountPrice
                            ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                            : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
                        }`}
                      />
                    </div>
                    {errors.discountPrice ? (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.discountPrice}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Leave empty if selling at Original Price.
                      </p>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) =>
                        setStock(
                          e.target.value === ""
                            ? ""
                            : Math.max(0, parseInt(e.target.value, 10) || 0)
                        )
                      }
                      placeholder="50"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition ${
                        errors.stock
                          ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
                          : "border-slate-200 bg-white focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
                      }`}
                    />
                    {errors.stock && (
                      <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT WITH OPTIONS MODE */}
            {sellingMode === "options" && (
              <div className="space-y-4">
                {/* Total Stock Summary Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Total Stock
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Automatically calculated from all options.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="font-fraunces text-xl font-bold text-[#FF7A00]">
                      {calculatedTotalStock} units
                    </span>
                    {options.length > 0 && (
                      <span className="text-xs text-slate-500 hidden md:inline font-mono">
                        ({options.map((o) => o.stock || 0).join(" + ")} = {calculatedTotalStock})
                      </span>
                    )}
                  </div>
                </div>

                {/* Options Header & Count */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Product Options ({options.length} {options.length === 1 ? "option" : "options"})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add each version of this product. Each option can have its own price, stock and photo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF7A00] text-white hover:bg-orange-600 text-xs font-bold cursor-pointer shadow-xs transition select-none"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3] " />
                    <span>Add Option</span>
                  </button>
                </div>

                {errors.options && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{errors.options}</span>
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-4">
                  {options.map((opt, idx) => (
                    <VariantOptionCard
                      key={idx}
                      index={idx}
                      option={opt}
                      availableImages={images}
                      productName={name}
                      onChange={(updated) => handleUpdateOption(idx, updated)}
                      onDuplicate={() => handleDuplicateOption(idx)}
                      onRemove={() => handleRemoveOption(idx)}
                      canRemove={options.length > 1}
                      errors={{
                        name: errors[`option_${idx}_name`],
                        price: errors[`option_${idx}_price`],
                        discountPrice: errors[`option_${idx}_discountPrice`],
                        stock: errors[`option_${idx}_stock`],
                      }}
                    />
                  ))}
                </div>

                {/* Bottom Add Option Button */}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200/90 hover:border-orange-400 hover:bg-orange-50/20 text-slate-600 hover:text-[#FF7A00] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Add Another Option</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: PRODUCT INFORMATION */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="font-fraunces text-xl font-bold text-slate-900">
                Product Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Describe the product, materials, and key highlights for your customers.
              </p>
            </div>

            <div className="space-y-4">
              {/* Details Section Heading */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Details Section Heading
                </label>
                <input
                  type="text"
                  value={descriptionTitle}
                  onChange={(e) => setDescriptionTitle(e.target.value)}
                  placeholder="e.g., Why Your Pet Will Love It"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15"
                />
                <p className="text-[11px] text-slate-400">
                  This heading appears above the product details on the customer product page.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product, its benefits, features and important information for customers."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15 leading-relaxed"
                />
              </div>

              {/* Materials & Safety */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Materials & Safety
                </label>
                <textarea
                  rows={3}
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g., 100% natural food-grade rubber. Free from BPA, phthalates, and harsh chemical compounds."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15 leading-relaxed"
                />
              </div>

              {/* Highlights Editor */}
              <div className="pt-3 border-t border-slate-100">
                <HighlightsEditor
                  highlights={highlights}
                  onChange={(h) => setHighlights(h)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: ADDITIONAL INFORMATION (Collapsible Sections) */}
        {/* ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="font-fraunces text-xl font-bold text-slate-900">
                Additional Information
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Optional extra details. Fill in the sections relevant to your product.
              </p>
            </div>

            <div className="space-y-3">
              {/* SECTION 1: Ingredients & Nutrition */}
              <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "ingredients" ? null : "ingredients"
                    )
                  }
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Ingredients & Nutrition</span>
                    {(ingredientsDesc || nutritionRows.length > 0) && (
                      <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                    )}
                  </div>
                  {activeAccordion === "ingredients" ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {activeAccordion === "ingredients" && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Ingredients Description
                      </label>
                      <textarea
                        rows={3}
                        value={ingredientsDesc}
                        onChange={(e) => setIngredientsDesc(e.target.value)}
                        placeholder="e.g., Deboned chicken, brown rice, flaxseed, dried chicory root..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                      />
                    </div>

                    {/* Nutrition Rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Nutrition Facts Table
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setNutritionRows([
                              ...nutritionRows,
                              { label: "", value: "" },
                            ])
                          }
                          className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                        >
                          + Add Nutrition Row
                        </button>
                      </div>

                      {nutritionRows.map((n, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={n.label}
                            onChange={(e) => {
                              const copy = [...nutritionRows];
                              copy[idx].label = e.target.value;
                              setNutritionRows(copy);
                            }}
                            placeholder="e.g., Crude Protein (min)"
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                          />
                          <input
                            type="text"
                            value={n.value}
                            onChange={(e) => {
                              const copy = [...nutritionRows];
                              copy[idx].value = e.target.value;
                              setNutritionRows(copy);
                            }}
                            placeholder="e.g., 28.0%"
                            className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNutritionRows(
                                nutritionRows.filter((_, i) => i !== idx)
                              )
                            }
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Feeding Guide */}
              <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "feeding" ? null : "feeding"
                    )
                  }
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Feeding Guide</span>
                    {(feedingDesc || feedingRows.length > 0) && (
                      <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                    )}
                  </div>
                  {activeAccordion === "feeding" ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {activeAccordion === "feeding" && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Feeding Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={feedingDesc}
                        onChange={(e) => setFeedingDesc(e.target.value)}
                        placeholder="Feed your pet twice daily according to body weight."
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Weight & Amount Table
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFeedingRows([
                              ...feedingRows,
                              { petWeight: "", dailyAmount: "" },
                            ])
                          }
                          className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                        >
                          + Add Row
                        </button>
                      </div>

                      {feedingRows.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={r.petWeight}
                            onChange={(e) => {
                              const copy = [...feedingRows];
                              copy[idx].petWeight = e.target.value;
                              setFeedingRows(copy);
                            }}
                            placeholder="Pet Weight (e.g., Up to 5 kg)"
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                          />
                          <input
                            type="text"
                            value={r.dailyAmount}
                            onChange={(e) => {
                              const copy = [...feedingRows];
                              copy[idx].dailyAmount = e.target.value;
                              setFeedingRows(copy);
                            }}
                            placeholder="Amount (e.g., 50–100 g)"
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFeedingRows(
                                feedingRows.filter((_, i) => i !== idx)
                              )
                            }
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Care Instructions */}
              <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "care" ? null : "care"
                    )
                  }
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Care Instructions</span>
                    {careInstructions.length > 0 && (
                      <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                    )}
                  </div>
                  {activeAccordion === "care" ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {activeAccordion === "care" && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={careInput}
                        onChange={(e) => setCareInput(e.target.value)}
                        placeholder="e.g., Store in a cool, dry place inside an airtight container."
                        className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (careInput.trim()) {
                            setCareInstructions([
                              ...careInstructions,
                              careInput.trim(),
                            ]);
                            setCareInput("");
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-orange-50 text-[#FF7A00] font-bold text-xs hover:bg-orange-100 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {careInstructions.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700"
                      >
                        <span>• {c}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCareInstructions(
                              careInstructions.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: Size Guide */}
              <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "size" ? null : "size"
                    )
                  }
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Size Guide</span>
                    {sizeGuideEnabled && (
                      <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                    )}
                  </div>
                  {activeAccordion === "size" ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {activeAccordion === "size" && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sizeGuideEnabled}
                        onChange={(e) => setSizeGuideEnabled(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#FF7A00]"
                      />
                      <span>Enable Size Guide for this product</span>
                    </label>

                    {sizeGuideEnabled && (
                      <div className="space-y-3 pt-2">
                        <input
                          type="text"
                          value={sizeGuideDesc}
                          onChange={(e) => setSizeGuideDesc(e.target.value)}
                          placeholder="Size guide instructions (e.g., Measure your pet's chest and neck)"
                          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                        />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">
                              Sizes Table
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setSizeGuideSizes([
                                  ...sizeGuideSizes,
                                  { label: "", description: "" },
                                ])
                              }
                              className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                            >
                              + Add Size
                            </button>
                          </div>

                          {sizeGuideSizes.map((s, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={s.label}
                                onChange={(e) => {
                                  const copy = [...sizeGuideSizes];
                                  copy[idx].label = e.target.value;
                                  setSizeGuideSizes(copy);
                                }}
                                placeholder="e.g., Small"
                                className="w-28 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                              />
                              <input
                                type="text"
                                value={s.description}
                                onChange={(e) => {
                                  const copy = [...sizeGuideSizes];
                                  copy[idx].description = e.target.value;
                                  setSizeGuideSizes(copy);
                                }}
                                placeholder="e.g., Fits neck 20–30cm, chest 35–45cm"
                                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setSizeGuideSizes(
                                    sizeGuideSizes.filter((_, i) => i !== idx)
                                  )
                                }
                                className="p-1 text-slate-400 hover:text-rose-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 5: Specifications & Custom Details */}
              <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "specs" ? null : "specs"
                    )
                  }
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Specifications & Custom Details</span>
                    {(lifeStage || weight || dimensions || customSpecs.length > 0) && (
                      <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                    )}
                  </div>
                  {activeAccordion === "specs" ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {activeAccordion === "specs" && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Life Stage
                        </label>
                        <input
                          type="text"
                          value={lifeStage}
                          onChange={(e) => setLifeStage(e.target.value)}
                          placeholder="e.g., Puppy, Adult, Senior, All Ages"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Weight
                        </label>
                        <input
                          type="text"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="e.g., 1.5 kg, 500g"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Dimensions
                        </label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder="e.g., 25 x 10 x 5 cm"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Country of Origin
                        </label>
                        <input
                          type="text"
                          value={countryOfOrigin}
                          onChange={(e) => setCountryOfOrigin(e.target.value)}
                          placeholder="e.g., India"
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                        />
                      </div>
                    </div>

                    {/* Custom Specifications */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Custom Specifications
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomSpecs([
                              ...customSpecs,
                              { label: "", value: "" },
                            ])
                          }
                          className="text-xs font-bold text-[#FF7A00] hover:underline cursor-pointer"
                        >
                          + Add Specification
                        </button>
                      </div>

                      {customSpecs.map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={spec.label}
                            onChange={(e) => {
                              const copy = [...customSpecs];
                              copy[idx].label = e.target.value;
                              setCustomSpecs(copy);
                            }}
                            placeholder="Name (e.g., Breed Size)"
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => {
                              const copy = [...customSpecs];
                              copy[idx].value = e.target.value;
                              setCustomSpecs(copy);
                            }}
                            placeholder="Value (e.g., All Breeds)"
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setCustomSpecs(
                                customSpecs.filter((_, i) => i !== idx)
                              )
                            }
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 6: Google Search Preview (SEO) */}
              <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAccordion(
                      activeAccordion === "seo" ? null : "seo"
                    )
                  }
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>Google Search Preview (SEO)</span>
                    {(seoTitle || seoDescription) && (
                      <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                    )}
                  </div>
                  {activeAccordion === "seo" ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                {activeAccordion === "seo" && (
                  <div className="p-4 sm:p-5 border-t border-slate-100 space-y-4">
                    <p className="text-xs text-slate-500">
                      Optional. Helps your product appear better in Google search results.
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-slate-700">
                          Google Search Title
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {seoTitle.length} / 60
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={60}
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Title appearing in search engines"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-slate-700">
                          Google Search Description
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {seoDescription.length} / 160
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={160}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Short summary appearing below the title in search engines"
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                      />
                    </div>

                    {/* Google Search Result Preview */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Search Preview
                      </span>
                      <p className="text-xs font-semibold text-blue-700 truncate">
                        {seoTitle || name || "Product Title - KickAt Pet Store"}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-mono">
                        kickat.co.in › products › {slug || "product-name"}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {seoDescription ||
                          description ||
                          "Shop high-quality pet supplies online at KickAt. Premium food, accessories, and toys with quick delivery across India."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 6: REVIEW & PUBLISH */}
        {/* ======================================================== */}
        {currentStep === 6 && (
          <ReviewSummary
            name={name}
            categoryName={selectedCategory ? getCategoryBreadcrumb(selectedCategory.id, categories) : ""}
            petSpecies={petSpecies}
            status={status}
            isTrending={isTrending}
            isBestSeller={isBestSeller}
            slug={slug}
            images={images}
            sellingMode={sellingMode}
            price={price}
            discountPrice={discountPrice}
            stock={stock}
            options={options}
            descriptionTitle={descriptionTitle}
            description={description}
            materials={materials}
            highlights={highlights}
            additionalInfoCount={additionalInfoCount}
            onEditStep={(s) => setCurrentStep(s)}
          />
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <Link
              href="/admin/dashboard/products"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </Link>
          )}

          <div className="flex items-center gap-3">
            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF7A00] text-white hover:bg-orange-600 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF7A00] text-white hover:bg-orange-600 text-xs font-bold transition shadow-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{primaryButtonLabel}</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>{primaryButtonLabel}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="font-fraunces text-lg font-bold text-slate-900">
              Delete Product?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-700">
                {name || initialProduct?.name}
              </span>
              ? This action will remove the product and its variants from your store.
            </p>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={deletePermanent}
                onChange={(e) => setDeletePermanent(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <span>Permanently delete (cannot be undone)</span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
