"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Folder,
  FolderTree,
  Tag,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  X,
  AlertCircle,
  RefreshCw,
  Info,
} from "lucide-react";
import { AdminCategoryItem } from "@/types/admin-category";
import { AdminCategoryService } from "@/services/adminCategoryService";
import { PetSpecies } from "@/types/admin-product";

/**
 * Returns the complete ancestor chain of a category starting from the root down to the target category.
 */
export function getCategoryAncestors(
  categoryId: string,
  categories: AdminCategoryItem[]
): AdminCategoryItem[] {
  if (!categoryId || !categories || categories.length === 0) return [];
  const chain: AdminCategoryItem[] = [];
  let curr = categories.find((c) => c.id === categoryId);
  const seen = new Set<string>();

  while (curr && !seen.has(curr.id)) {
    seen.add(curr.id);
    chain.unshift(curr);
    if (!curr.parentId) break;
    curr = categories.find((c) => c.id === curr!.parentId);
  }

  return chain;
}

/**
 * Formats a hierarchical category breadcrumb path string: "Parent / Subcategory".
 */
export function getCategoryBreadcrumb(
  categoryId: string,
  categories: AdminCategoryItem[]
): string {
  const ancestors = getCategoryAncestors(categoryId, categories);
  return ancestors.map((c) => c.name).join(" / ");
}

/**
 * Derives pet species from the category name, slug, and its entire ancestor hierarchy.
 * Returns null if the category does not identify a specific animal species.
 */
export function detectPetSpeciesFromCategory(
  category: AdminCategoryItem | undefined,
  categories: AdminCategoryItem[]
): PetSpecies | null {
  if (!category) return null;
  const ancestors = getCategoryAncestors(category.id, categories);
  const combined = ancestors
    .map((c) => `${c.name} ${c.slug}`)
    .join(" ")
    .toLowerCase();

  if (/\b(dog|dogs|puppy|puppies|canine)\b/i.test(combined)) return "DOG";
  if (/\b(cat|cats|kitten|kittens|feline)\b/i.test(combined)) return "CAT";
  if (/\b(bird|birds|parrot|parrots|avian)\b/i.test(combined)) return "BIRD";
  if (/\b(fish|fishes|aquarium|aquatic)\b/i.test(combined)) return "FISH";
  if (/\b(rabbit|rabbits|bunny|bunnies|hamster|guinea|rodent)\b/i.test(combined)) return "RABBIT";

  return null;
}

export interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string, category?: AdminCategoryItem, breadcrumb?: string) => void;
  categories?: AdminCategoryItem[];
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function CategorySelector({
  value,
  onChange,
  categories: externalCategories,
  error,
  disabled = false,
}: CategorySelectorProps) {
  const [internalCategories, setInternalCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(() => !externalCategories || externalCategories.length === 0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Two-tier selection state
  const [selectedRootId, setSelectedRootId] = useState<string>("");
  const [selectedSubId, setSelectedSubId] = useState<string>("");

  // Dropdown open states
  const [isRootOpen, setIsRootOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);

  // Search states
  const [rootSearchQuery, setRootSearchQuery] = useState("");
  const [subSearchQuery, setSubSearchQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const rootSearchInputRef = useRef<HTMLInputElement>(null);
  const subSearchInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories if not provided externally
  useEffect(() => {
    let ignore = false;
    if (externalCategories && externalCategories.length > 0) return;
    AdminCategoryService.getCategories()
      .then((res) => {
        if (!ignore && res?.data?.categories) {
          setInternalCategories(res.data.categories);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load category hierarchy:", err);
          setFetchError("Unable to load categories. Please try again.");
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [externalCategories]);

  const allCategories = useMemo(() => {
    if (externalCategories && externalCategories.length > 0) {
      return externalCategories;
    }
    return internalCategories;
  }, [externalCategories, internalCategories]);

  // All Root Categories (categories with no parentId)
  const rootCategories = useMemo(() => {
    return allCategories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.order - b.order);
  }, [allCategories]);

  // Selected Root Category Object
  const selectedRootCat = useMemo(() => {
    if (!selectedRootId) return undefined;
    return allCategories.find((c) => c.id === selectedRootId);
  }, [selectedRootId, allCategories]);

  // Subcategories belonging to the selected Root Category
  const subcategories = useMemo(() => {
    if (!selectedRootId) return [];
    return allCategories
      .filter((c) => c.parentId === selectedRootId)
      .sort((a, b) => a.order - b.order);
  }, [selectedRootId, allCategories]);

  // Selected Subcategory Object
  const selectedSubCat = useMemo(() => {
    if (!selectedSubId) return undefined;
    return allCategories.find((c) => c.id === selectedSubId);
  }, [selectedSubId, allCategories]);

  // Synchronize state from initial/external `value` prop without effect-based cascading render
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    if (!value) {
      if (!selectedRootId) {
        setSelectedSubId("");
      }
    } else if (allCategories.length > 0) {
      const matchedCat = allCategories.find((c) => c.id === value);
      if (matchedCat) {
        if (matchedCat.parentId) {
          setSelectedRootId(matchedCat.parentId);
          setSelectedSubId(matchedCat.id);
        } else {
          setSelectedRootId(matchedCat.id);
          setSelectedSubId("");
        }
      }
    }
  }

  // Handle click outside to close popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsRootOpen(false);
        setIsSubOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard navigation (Escape closes popovers)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsRootOpen(false);
      setIsSubOpen(false);
    }
  };

  // Filtered Root Categories for Search
  const filteredRoots = useMemo(() => {
    const q = rootSearchQuery.trim().toLowerCase();
    if (!q) return rootCategories;
    return rootCategories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [rootCategories, rootSearchQuery]);

  // Filtered Subcategories for Search
  const filteredSubs = useMemo(() => {
    const q = subSearchQuery.trim().toLowerCase();
    if (!q) return subcategories;
    return subcategories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [subcategories, subSearchQuery]);

  // Action: Select Root Category
  const handleSelectRoot = (rootCat: AdminCategoryItem) => {
    setSelectedRootId(rootCat.id);
    setIsRootOpen(false);
    setRootSearchQuery("");

    // Check if this root category has subcategories
    const childSubs = allCategories.filter((c) => c.parentId === rootCat.id);

    if (childSubs.length > 0) {
      // Must select a subcategory! Product will belong to subcategory only.
      setSelectedSubId("");
      onChange("", undefined, "");
      // Automatically open the subcategory selector
      setTimeout(() => {
        setIsSubOpen(true);
        subSearchInputRef.current?.focus();
      }, 60);
    } else {
      // Standalone root category with no subcategories
      setSelectedSubId("");
      onChange(rootCat.id, rootCat, rootCat.name);
      setIsSubOpen(false);
    }
  };

  // Action: Clear Root Category Selection
  const handleClearRoot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRootId("");
    setSelectedSubId("");
    setIsRootOpen(false);
    setIsSubOpen(false);
    onChange("", undefined, "");
  };

  // Action: Select Subcategory
  const handleSelectSub = (subCat: AdminCategoryItem) => {
    setSelectedSubId(subCat.id);
    setIsSubOpen(false);
    setSubSearchQuery("");

    const breadcrumb = getCategoryBreadcrumb(subCat.id, allCategories);
    onChange(subCat.id, subCat, breadcrumb);
  };

  // Action: Clear Subcategory Selection
  const handleClearSub = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSubId("");
    setIsSubOpen(false);

    if (subcategories.length > 0) {
      // Root requires subcategory, so clearing subcategory clears the assigned product category
      onChange("", undefined, "");
    } else if (selectedRootCat) {
      onChange(selectedRootCat.id, selectedRootCat, selectedRootCat.name);
    }
  };

  // Manual Retry Loading Categories
  const handleManualRetry = () => {
    setLoading(true);
    setFetchError(null);
    AdminCategoryService.getCategories()
      .then((res) => {
        if (res?.data?.categories) {
          setInternalCategories(res.data.categories);
        }
      })
      .catch((err) => {
        console.error("Failed to load category hierarchy:", err);
        setFetchError("Unable to load categories. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Determine specific contextual error message
  const displayError = useMemo(() => {
    if (!error) return null;
    if (!selectedRootId) {
      return "Please select a root category.";
    }
    if (subcategories.length > 0 && !selectedSubId) {
      return `Please select a subcategory under "${selectedRootCat?.name}".`;
    }
    return error;
  }, [error, selectedRootId, subcategories.length, selectedSubId, selectedRootCat]);

  return (
    <div className="w-full space-y-3.5" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* 1. ROOT CATEGORY SELECTOR */}
      <div className="space-y-1.5 relative">
        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Folder className="h-3.5 w-3.5 text-orange-500" />
            <span>Root Category *</span>
          </span>
          {selectedRootCat && (
            <span className="text-[10.5px] font-semibold text-slate-400">
              {subcategories.length > 0
                ? `${subcategories.length} subcategories available`
                : "Standalone Root (No subcategories)"}
            </span>
          )}
        </label>

        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => {
            if (!disabled) {
              setIsRootOpen((prev) => !prev);
              setIsSubOpen(false);
              if (!isRootOpen) {
                setTimeout(() => rootSearchInputRef.current?.focus(), 50);
              }
            }
          }}
          className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
            error && !selectedRootId
              ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 ring-2 ring-rose-400/20"
              : isRootOpen
              ? "border-[#FF7A00] bg-white ring-2 ring-[#FF7A00]/15"
              : "border-slate-200 bg-white hover:border-slate-300"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {selectedRootCat ? (
              <>
                <div className="h-7 w-7 rounded-lg bg-orange-100 text-[#FF7A00] flex items-center justify-center shrink-0">
                  <Folder className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#2A241E] truncate">
                    {selectedRootCat.name}
                  </div>
                  <div className="text-[10.5px] text-slate-400 font-mono">
                    /{selectedRootCat.slug}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Folder className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-400 font-normal">
                  {loading ? "Loading categories..." : "Select Root Category (e.g. Dogs, Cats)..."}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedRootCat && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClearRoot}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Clear root category"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            {loading ? (
              <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />
            ) : isRootOpen ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* Dropdown Popover */}
        {isRootOpen && (
          <div className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden animate-fade-in">
            <div className="p-2.5 border-b border-slate-100 bg-[#FAF7F2]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  ref={rootSearchInputRef}
                  type="text"
                  value={rootSearchQuery}
                  onChange={(e) => setRootSearchQuery(e.target.value)}
                  placeholder="Search root categories..."
                  className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15 transition"
                />
                {rootSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRootSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
              {loading && allCategories.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-orange-500" />
                  <p>Loading categories...</p>
                </div>
              ) : fetchError ? (
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-rose-500 font-medium">{fetchError}</p>
                  <button
                    type="button"
                    onClick={handleManualRetry}
                    className="text-xs font-bold text-orange-600 underline cursor-pointer"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : filteredRoots.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No root categories found matching &ldquo;{rootSearchQuery}&rdquo;
                </div>
              ) : (
                filteredRoots.map((root) => {
                  const isSelected = root.id === selectedRootId;
                  const childCount = allCategories.filter((c) => c.parentId === root.id).length;

                  return (
                    <button
                      key={root.id}
                      type="button"
                      onClick={() => handleSelectRoot(root)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition cursor-pointer ${
                        isSelected
                          ? "bg-orange-50 text-[#FF7A00] font-bold border border-orange-200 shadow-2xs"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                            isSelected
                              ? "bg-orange-500 text-white"
                              : "bg-amber-100 text-amber-800 font-bold"
                          }`}
                        >
                          <Folder className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-slate-800 text-xs truncate block">
                            {root.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            /{root.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {childCount > 0 ? `${childCount} subcategories` : "Direct (Root)"}
                        </span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-[#FF7A00] stroke-[3]" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. SUBCATEGORY SELECTOR (SHOWN DIRECTLY BELOW ROOT CATEGORY) */}
      <div className="space-y-1.5 relative">
        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-sky-600" />
            <span>Subcategory {subcategories.length > 0 ? "*" : ""}</span>
          </span>
          {selectedRootCat && subcategories.length > 0 && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/80">
              Required: Product will belong to subcategory only
            </span>
          )}
        </label>

        {!selectedRootCat ? (
          /* State 1: No root category selected yet */
          <div className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-400 flex items-center justify-between cursor-not-allowed select-none">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-slate-300" />
              <span>Select a root category above first...</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-300" />
          </div>
        ) : subcategories.length === 0 ? (
          /* State 2: Root category has NO subcategories */
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-800 flex items-start gap-2.5 animate-fade-in">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">
                No subcategories exist under &ldquo;{selectedRootCat.name}&rdquo;
              </p>
              <p className="text-[11px] text-amber-700/90 leading-relaxed">
                This root category has no subcategories. The product will be placed directly under &ldquo;{selectedRootCat.name}&rdquo;.
              </p>
            </div>
          </div>
        ) : (
          /* State 3: Root category HAS subcategories -> Select Subcategory */
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setIsSubOpen((prev) => !prev);
                  setIsRootOpen(false);
                  if (!isSubOpen) {
                    setTimeout(() => subSearchInputRef.current?.focus(), 50);
                  }
                }
              }}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
                error && !selectedSubId
                  ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 ring-2 ring-rose-400/20"
                  : isSubOpen
                  ? "border-[#FF7A00] bg-white ring-2 ring-[#FF7A00]/15"
                  : selectedSubCat
                  ? "border-slate-200 bg-white hover:border-slate-300"
                  : "border-orange-300 bg-orange-50/20 hover:border-[#FF7A00]"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {selectedSubCat ? (
                  <>
                    <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-bold">
                      <Tag className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-[#2A241E] truncate">
                        {selectedSubCat.name}
                      </div>
                      <div className="text-[10.5px] text-slate-400 font-mono">
                        under {selectedRootCat.name}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Tag className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="text-sm text-orange-600 font-medium">
                      Select a subcategory under &ldquo;{selectedRootCat.name}&rdquo;...
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {selectedSubCat && !disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleClearSub}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    title="Clear subcategory"
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
                {isSubOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* Subcategories Popover */}
            {isSubOpen && (
              <div className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden animate-fade-in">
                <div className="p-2.5 border-b border-slate-100 bg-[#FAF7F2]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      ref={subSearchInputRef}
                      type="text"
                      value={subSearchQuery}
                      onChange={(e) => setSubSearchQuery(e.target.value)}
                      placeholder={`Search subcategories in ${selectedRootCat.name}...`}
                      className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15 transition"
                    />
                    {subSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setSubSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                  {filteredSubs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No subcategory found matching &ldquo;{subSearchQuery}&rdquo;
                    </div>
                  ) : (
                    filteredSubs.map((sub) => {
                      const isSelected = sub.id === selectedSubId;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectSub(sub)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition cursor-pointer ${
                            isSelected
                              ? "bg-orange-50 text-[#FF7A00] font-bold border border-orange-200 shadow-2xs"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div
                              className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                                isSelected
                                  ? "bg-orange-500 text-white font-bold"
                                  : "bg-sky-100 text-sky-700"
                              }`}
                            >
                              <Tag className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-slate-800 text-xs truncate block">
                                {sub.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                /{sub.slug}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="h-4 w-4 text-[#FF7A00] stroke-[3] shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. CATEGORY HIERARCHY SUMMARY */}
      {(selectedSubCat || (selectedRootCat && subcategories.length === 0)) && (
        <div className="flex items-center flex-wrap gap-2 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-slate-200/70 text-xs animate-fade-in">
          <FolderTree className="h-3.5 w-3.5 text-[#FF7A00] shrink-0" />
          <span className="text-slate-400 font-medium">Assigned Category:</span>
          {selectedRootCat && (
            <span className="font-semibold text-slate-700">{selectedRootCat.name}</span>
          )}
          {selectedSubCat && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="text-[#FF7A00] font-bold bg-white px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
                {selectedSubCat.name}
              </span>
            </>
          )}
        </div>
      )}

      {/* 4. ERROR MESSAGE */}
      {displayError && (
        <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{displayError}</span>
        </p>
      )}
    </div>
  );
}

export default CategorySelector;
