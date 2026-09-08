"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Folder,
  FolderOpen,
  FolderTree,
  Package,
  Tag,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  X,
  AlertCircle,
  RefreshCw,
  Layers,
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
 * Returns null if the category does not identify a specific animal species (generic multi-species category).
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
  placeholder = "Select a product category...",
}: CategorySelectorProps) {
  const [internalCategories, setInternalCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Track parents that have been manually collapsed by the user (default: all expanded)
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load categories if not provided externally
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
      });

    return () => {
      ignore = true;
    };
  }, [externalCategories]);

  // Active category list
  const allCategories = useMemo(() => {
    if (externalCategories && externalCategories.length > 0) {
      return externalCategories;
    }
    return internalCategories;
  }, [externalCategories, internalCategories]);

  // Find currently selected category item
  const selectedCategory = useMemo(() => {
    if (!value || allCategories.length === 0) return undefined;
    return allCategories.find((c) => c.id === value);
  }, [value, allCategories]);

  // Ancestor chain for the selected category
  const ancestors = useMemo(() => {
    if (!value || allCategories.length === 0) return [];
    return getCategoryAncestors(value, allCategories);
  }, [value, allCategories]);

  // Parent category if exists
  const parentCategory = useMemo(() => {
    if (ancestors.length > 1) {
      return ancestors[ancestors.length - 2];
    }
    return null;
  }, [ancestors]);

  // Build hierarchical root + subcategories tree
  const hierarchicalTree = useMemo(() => {
    // Root nodes have no parentId or their parentId is not present in allCategories
    const roots = allCategories
      .filter((c) => !c.parentId || !allCategories.some((p) => p.id === c.parentId))
      .sort((a, b) => a.order - b.order);

    return roots.map((root) => {
      const children = allCategories
        .filter((c) => c.parentId === root.id)
        .sort((a, b) => a.order - b.order);

      return {
        ...root,
        children,
        hasChildren: children.length > 0,
      };
    });
  }, [allCategories]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const toggleParent = (parentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }
      return next;
    });
  };

  const handleSelectCategory = (cat: AdminCategoryItem) => {
    const breadcrumb = getCategoryBreadcrumb(cat.id, allCategories);
    onChange(cat.id, cat, breadcrumb);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", undefined, "");
  };

  // Filtered search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return allCategories
      .filter((cat) => {
        const nameMatch = cat.name.toLowerCase().includes(q);
        const slugMatch = cat.slug.toLowerCase().includes(q);
        const parent = allCategories.find((p) => p.id === cat.parentId);
        const parentMatch = parent ? parent.name.toLowerCase().includes(q) : false;
        return nameMatch || slugMatch || parentMatch;
      })
      .map((cat) => {
        const catAncestors = getCategoryAncestors(cat.id, allCategories);
        const path = catAncestors.map((c) => c.name).join(" / ");
        const hasChildren = allCategories.some((c) => c.parentId === cat.id);
        return {
          category: cat,
          ancestors: catAncestors,
          path,
          hasChildren,
          parent: catAncestors.length > 1 ? catAncestors[catAncestors.length - 2] : null,
        };
      });
  }, [searchQuery, allCategories]);

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

  return (
    <div className="relative w-full space-y-2" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
          error
            ? "border-rose-400 bg-rose-50/20 focus:border-rose-500"
            : isOpen
            ? "border-[#FF7A00] bg-white ring-2 ring-[#FF7A00]/15"
            : "border-slate-200 bg-white hover:border-slate-300"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedCategory ? (
            <>
              <div className="h-7 w-7 rounded-lg bg-orange-100 text-[#FF7A00] flex items-center justify-center shrink-0">
                <Tag className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#2A241E] truncate">
                  {selectedCategory.name}
                </div>
                {parentCategory && (
                  <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 font-medium">
                    <span>{parentCategory.name}</span>
                    <ChevronRight className="h-2.5 w-2.5 text-slate-400" />
                    <span className="text-orange-600 font-semibold">{selectedCategory.name}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Folder className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-400 font-normal">
                {loading ? "Loading categories..." : placeholder}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedCategory && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          {loading ? (
            <RefreshCw className="h-4 w-4 text-slate-400 animate-spin" />
          ) : isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Sub-selector Breadcrumb Display */}
      {selectedCategory && (
        <div className="flex items-center flex-wrap gap-2 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-slate-200/70 text-xs animate-fade-in">
          <FolderTree className="h-3.5 w-3.5 text-orange-500 shrink-0" />
          <span className="text-slate-400 font-medium">Category Hierarchy:</span>
          <div className="flex items-center gap-1 font-semibold text-slate-700 flex-wrap">
            {ancestors.map((item, idx) => {
              const isLast = idx === ancestors.length - 1;
              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />}
                  <span
                    className={
                      isLast
                        ? "text-[#FF7A00] font-bold bg-white px-2 py-0.5 rounded-md border border-orange-200/80 shadow-2xs"
                        : "text-slate-600"
                    }
                  >
                    {item.name}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
          {parentCategory && (
            <div className="ml-auto text-[11px] text-slate-500 font-medium pl-2 border-l border-slate-200">
              Parent: <strong className="text-slate-800 font-semibold">{parentCategory.name}</strong>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-2xl border border-slate-200/90 bg-white shadow-xl overflow-hidden animate-fade-in">
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-100 bg-[#FAF7F2] space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories (e.g. Dog Foods, Cat Treats)..."
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/15 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
              <span>Select the most specific product category</span>
              {hierarchicalTree.length > 0 && !searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    if (collapsedParents.size > 0) {
                      setCollapsedParents(new Set());
                    } else {
                      setCollapsedParents(new Set(hierarchicalTree.map((r) => r.id)));
                    }
                  }}
                  className="text-orange-600 hover:underline font-semibold cursor-pointer"
                >
                  {collapsedParents.size > 0 ? "Expand all" : "Collapse all"}
                </button>
              )}
            </div>
          </div>

          {/* Body Container */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
            {loading && allCategories.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-orange-500" />
                <p>Loading category hierarchy...</p>
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
            ) : searchQuery.trim() ? (
              /* Search Filter Results */
              searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                  <Tag className="h-5 w-5 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No categories found</p>
                  <p className="text-[11px]">No category matches &ldquo;{searchQuery}&rdquo;</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map(({ category, path, hasChildren }) => {
                    const isSelected = category.id === value;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            // If user clicked a parent in search, switch to tree and make sure it is uncollapsed
                            setSearchQuery("");
                            setCollapsedParents((prev) => {
                              const next = new Set(prev);
                              next.delete(category.id);
                              return next;
                            });
                          } else {
                            handleSelectCategory(category);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition cursor-pointer ${
                          isSelected
                            ? "bg-orange-50 text-[#FF7A00] font-bold border border-orange-200"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={`h-6 w-6 rounded-md flex items-center justify-center text-xs shrink-0 ${
                              hasChildren
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {hasChildren ? (
                              <Folder className="h-3 w-3" />
                            ) : (
                              <Package className="h-3 w-3" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                              <span>{category.name}</span>
                              {hasChildren && (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  Parent Category
                                </span>
                              )}
                            </div>
                            <div className="text-[10.5px] text-slate-400 font-medium truncate">
                              Hierarchy: {path}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {isSelected ? (
                            <Check className="h-4 w-4 text-[#FF7A00] stroke-[3]" />
                          ) : hasChildren ? (
                            <span className="text-[10.5px] font-medium text-orange-600 hover:underline">
                              View subcategories
                            </span>
                          ) : (
                            <span className="text-[10.5px] font-medium text-slate-400">
                              Select
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : hierarchicalTree.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No categories available in the system.
              </div>
            ) : (
              /* Tree View Structure */
              <div className="space-y-1.5">
                {hierarchicalTree.map((root) => {
                  const isExpanded = !collapsedParents.has(root.id);
                  const isRootSelected = root.id === value;

                  return (
                    <div key={root.id} className="rounded-xl overflow-hidden border border-slate-100 bg-[#FDFBF7]">
                      {/* Root Category Row */}
                      <div
                        onClick={(e) => {
                          if (root.hasChildren) {
                            toggleParent(root.id, e);
                          } else {
                            handleSelectCategory(root);
                          }
                        }}
                        className={`flex items-center justify-between p-2.5 text-xs font-bold transition cursor-pointer select-none ${
                          isRootSelected
                            ? "bg-orange-50 text-[#FF7A00] border-l-3 border-[#FF7A00]"
                            : "hover:bg-slate-100/70 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {root.hasChildren ? (
                            <span className="text-slate-400 hover:text-slate-700">
                              {isExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                              )}
                            </span>
                          ) : (
                            <span className="w-3.5" />
                          )}

                          <div className="h-6 w-6 rounded-md bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
                            {root.hasChildren ? (
                              isExpanded ? (
                                <FolderOpen className="h-3.5 w-3.5" />
                              ) : (
                                <Folder className="h-3.5 w-3.5" />
                              )
                            ) : (
                              <Package className="h-3.5 w-3.5" />
                            )}
                          </div>

                          <span className="truncate">{root.name}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {root.hasChildren ? (
                            <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                              {root.children.length} subcategories
                            </span>
                          ) : isRootSelected ? (
                            <Check className="h-4 w-4 text-[#FF7A00] stroke-[3]" />
                          ) : (
                            <span className="text-[10.5px] font-medium text-slate-400">
                              Select
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Subcategories (Indented Leaf Categories) */}
                      {root.hasChildren && isExpanded && (
                        <div className="pl-6 pr-2 py-1.5 border-t border-slate-100/80 bg-white space-y-1">
                          {root.children.map((child) => {
                            const isChildSelected = child.id === value;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => handleSelectCategory(child)}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition cursor-pointer ${
                                  isChildSelected
                                    ? "bg-orange-50 text-[#FF7A00] font-bold border border-orange-200 shadow-2xs"
                                    : "hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-slate-300 text-xs select-none">↳</span>
                                  <div
                                    className={`h-5 w-5 rounded flex items-center justify-center text-[10px] shrink-0 font-bold ${
                                      isChildSelected
                                        ? "bg-orange-500 text-white"
                                        : "bg-sky-100 text-sky-700"
                                    }`}
                                  >
                                    <Tag className="h-2.5 w-2.5" />
                                  </div>
                                  <span className="truncate font-medium">{child.name}</span>
                                </div>

                                <div className="shrink-0 ml-2">
                                  {isChildSelected && (
                                    <Check className="h-3.5 w-3.5 text-[#FF7A00] stroke-[3]" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-slate-400" />
              <span>Selecting a subcategory automatically assigns parent hierarchy</span>
            </span>
            <span className="font-semibold text-slate-600">
              {allCategories.length} categories total
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategorySelector;
