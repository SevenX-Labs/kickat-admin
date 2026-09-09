"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  FolderTree,
  Layers,
  Tag,
  ChevronDown,
  Check,
  X,
  Search,
  PawPrint,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
  ArrowUpDown,
  Boxes,
} from "lucide-react";
import { AdminCategoryItem } from "@/types/admin-category";
import { PetSpecies, AdminProductSortEnum } from "@/types/admin-product";

// ==========================================
// 1. CATEGORY FILTER DROPDOWN (2-TIER HIERARCHY)
// ==========================================
interface CategoryFilterDropdownProps {
  value: string;
  onChange: (id: string) => void;
  categories: AdminCategoryItem[];
  onClear: () => void;
}

export function CategoryFilterDropdown({
  value,
  onChange,
  categories,
  onClear,
}: CategoryFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Selected category info
  const selectedCategory = useMemo(() => {
    if (value === "ALL") return null;
    return categories.find((c) => c.id === value) || null;
  }, [categories, value]);

  const parentCategory = useMemo(() => {
    if (!selectedCategory?.parentId) return null;
    return categories.find((c) => c.id === selectedCategory.parentId) || null;
  }, [categories, selectedCategory]);

  // Root categories
  const rootCategories = useMemo(() => {
    return categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.order - b.order);
  }, [categories]);

  // Filtered tree by search
  const filteredTree = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      return rootCategories.map((root) => ({
        ...root,
        subcategories: categories
          .filter((c) => c.parentId === root.id)
          .sort((a, b) => a.order - b.order),
      }));
    }

    return rootCategories
      .map((root) => {
        const rootMatches =
          root.name.toLowerCase().includes(q) || root.slug.toLowerCase().includes(q);
        const children = categories
          .filter((c) => c.parentId === root.id)
          .filter(
            (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
          )
          .sort((a, b) => a.order - b.order);

        if (rootMatches || children.length > 0) {
          return {
            ...root,
            subcategories: children,
          };
        }
        return null;
      })
      .filter((item) => item !== null);
  }, [categories, rootCategories, search]);

  return (
    <div ref={dropdownRef} className={`relative w-full ${isOpen ? "z-50" : "z-10"}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[38px] rounded-xl border px-3 text-xs text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
          value !== "ALL"
            ? "bg-orange-50/90 border-orange-300 text-orange-950 font-bold shadow-2xs ring-1 ring-orange-200/50"
            : "bg-white hover:bg-[#FAF7F2] border-slate-200/80 text-slate-700 font-medium"
        } focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {value === "ALL" ? (
            <>
              <FolderTree className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">All Categories</span>
            </>
          ) : selectedCategory?.parentId ? (
            <>
              <Tag className="h-3.5 w-3.5 text-[#FF7A00] shrink-0" />
              <div className="truncate flex items-center gap-1">
                {parentCategory && (
                  <span className="text-slate-400 font-normal text-[11px] truncate max-w-[70px] hidden sm:inline">
                    {parentCategory.name} /
                  </span>
                )}
                <span className="font-bold text-orange-900 truncate">
                  {selectedCategory.name}
                </span>
              </div>
            </>
          ) : (
            <>
              <Layers className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="font-bold text-amber-950 truncate">
                {selectedCategory?.name || "Category"}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {value !== "ALL" && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onClear();
                }
              }}
              className="p-0.5 rounded-full hover:bg-orange-200/70 text-orange-500 hover:text-orange-800 transition cursor-pointer"
              title="Clear category filter"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-orange-500" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <>
        <div className="fixed inset-0 z-40 bg-transparent sm:hidden" onClick={() => setIsOpen(false)} />
        <div className="absolute top-full left-0 mt-1.5 w-[calc(100vw-3rem)] sm:w-80 max-w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Search */}
          {categories.length > 4 && (
            <div className="p-2 border-b border-slate-100 bg-[#FAF7F2]">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white border border-slate-200/80 outline-none focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]/20 text-slate-800 placeholder-slate-400"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5 text-xs">
            {/* All Categories Option */}
            <button
              type="button"
              onClick={() => {
                onChange("ALL");
                setIsOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-xl text-left font-medium flex items-center justify-between transition cursor-pointer ${
                value === "ALL"
                  ? "bg-orange-50 text-orange-800 font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderTree className="h-3.5 w-3.5 text-slate-400" />
                <span>All Categories</span>
              </span>
              {value === "ALL" && (
                <Check className="h-3.5 w-3.5 text-orange-600 stroke-[2.5]" />
              )}
            </button>

            <div className="h-px bg-slate-100 my-1" />

            {/* Tree Items */}
            {filteredTree.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                No categories match &ldquo;{search}&rdquo;
              </div>
            ) : (
              filteredTree.map((root) => {
                const isRootSelected = value === root.id;
                const hasSubs = root.subcategories && root.subcategories.length > 0;
                const rootCount =
                  root.productsCount ?? root._count?.products ?? 0;

                return (
                  <div key={root.id} className="space-y-0.5">
                    {/* Root Item */}
                    <button
                      type="button"
                      onClick={() => {
                        onChange(root.id);
                        setIsOpen(false);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left font-medium flex items-center justify-between transition cursor-pointer ${
                        isRootSelected
                          ? "bg-amber-100/90 text-amber-950 font-bold"
                          : "text-slate-800 hover:bg-amber-50/60"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0 truncate">
                        <Layers className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span className="truncate font-semibold">{root.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wide">
                          Root
                        </span>
                      </span>

                      <span className="flex items-center gap-1.5 shrink-0 ml-1">
                        {rootCount > 0 && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {rootCount}
                          </span>
                        )}
                        {isRootSelected && (
                          <Check className="h-3.5 w-3.5 text-amber-700 stroke-[2.5]" />
                        )}
                      </span>
                    </button>

                    {/* Subcategories (Indented Tree) */}
                    {hasSubs && (
                      <div className="border-l-2 border-orange-200 ml-3.5 pl-2 space-y-0.5 my-0.5">
                        {root.subcategories.map((sub) => {
                          const isSubSelected = value === sub.id;
                          const subCount =
                            sub.productsCount ?? sub._count?.products ?? 0;

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                onChange(sub.id);
                                setIsOpen(false);
                              }}
                              className={`w-full px-2 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition cursor-pointer ${
                                isSubSelected
                                  ? "bg-orange-100 text-orange-900 font-bold"
                                  : "text-slate-600 hover:bg-orange-50/70 hover:text-orange-950"
                              }`}
                            >
                              <span className="flex items-center gap-1.5 min-w-0 truncate">
                                <span className="text-slate-300 select-none text-[11px]">↳</span>
                                <Tag className="h-3 w-3 text-[#FF7A00] shrink-0" />
                                <span className="truncate">{sub.name}</span>
                              </span>

                              <span className="flex items-center gap-1.5 shrink-0 ml-1">
                                {subCount > 0 && (
                                  <span className="text-[10px] font-mono font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/50">
                                    {subCount}
                                  </span>
                                )}
                                {isSubSelected && (
                                  <Check className="h-3.5 w-3.5 text-[#FF7A00] stroke-[2.5]" />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </>)}
    </div>
  );
}

// ==========================================
// 2. PET SPECIES FILTER DROPDOWN
// ==========================================
interface SpeciesFilterDropdownProps {
  value: "ALL" | PetSpecies;
  onChange: (val: "ALL" | PetSpecies) => void;
  onClear: () => void;
}

const SPECIES_OPTIONS: {
  value: "ALL" | PetSpecies;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "ALL", label: "All Pet Species", icon: PawPrint },
  { value: "DOG", label: "Dog", icon: Dog },
  { value: "CAT", label: "Cat", icon: Cat },
  { value: "BIRD", label: "Bird", icon: Bird },
  { value: "FISH", label: "Fish", icon: Fish },
  { value: "RABBIT", label: "Rabbit", icon: Rabbit },
  { value: "OTHER", label: "Other Species", icon: PawPrint },
];

export function SpeciesFilterDropdown({ value, onChange, onClear }: SpeciesFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const currentOption = SPECIES_OPTIONS.find((o) => o.value === value) || SPECIES_OPTIONS[0];
  const IconComponent = currentOption.icon;

  return (
    <div ref={dropdownRef} className={`relative w-full ${isOpen ? "z-50" : "z-10"}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[38px] rounded-xl border px-3 text-xs text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
          value !== "ALL"
            ? "bg-orange-50/90 border-orange-300 text-orange-950 font-bold shadow-2xs ring-1 ring-orange-200/50"
            : "bg-white hover:bg-[#FAF7F2] border-slate-200/80 text-slate-700 font-medium"
        } focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <IconComponent className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{currentOption.label}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {value !== "ALL" && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onClear();
                }
              }}
              className="p-0.5 rounded-full hover:bg-orange-200/70 text-orange-500 hover:text-orange-800 transition cursor-pointer"
              title="Clear species filter"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-orange-500" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent sm:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-1.5 w-[calc(100vw-3rem)] sm:w-64 max-w-[280px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-0.5 text-xs">
          {SPECIES_OPTIONS.map((opt) => {
            const isSelected = value === opt.value;
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left font-medium flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? "bg-orange-50 text-orange-800 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <OptIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-orange-600 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// 3. STOCK FILTER DROPDOWN
// ==========================================
interface StockFilterDropdownProps {
  value: "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  onChange: (val: "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK") => void;
  onClear: () => void;
}

const STOCK_OPTIONS: {
  value: "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  label: string;
  badgeDot?: string;
}[] = [
  { value: "ALL", label: "All Stock States" },
  { value: "IN_STOCK", label: "In Stock (> 0)", badgeDot: "bg-emerald-500" },
  { value: "LOW_STOCK", label: "Low Stock (≤ 10)", badgeDot: "bg-amber-500" },
  { value: "OUT_OF_STOCK", label: "Out of Stock (0)", badgeDot: "bg-rose-500" },
];

export function StockFilterDropdown({ value, onChange, onClear }: StockFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const currentOption = STOCK_OPTIONS.find((o) => o.value === value) || STOCK_OPTIONS[0];

  return (
    <div ref={dropdownRef} className={`relative w-full ${isOpen ? "z-50" : "z-10"}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[38px] rounded-xl border px-3 text-xs text-left transition flex items-center justify-between gap-1.5 cursor-pointer ${
          value !== "ALL"
            ? "bg-orange-50/90 border-orange-300 text-orange-950 font-bold shadow-2xs ring-1 ring-orange-200/50"
            : "bg-white hover:bg-[#FAF7F2] border-slate-200/80 text-slate-700 font-medium"
        } focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {currentOption.badgeDot ? (
            <span className={`h-2 w-2 rounded-full ${currentOption.badgeDot} shrink-0`} />
          ) : (
            <Boxes className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          )}
          <span className="truncate">{currentOption.label}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {value !== "ALL" && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onClear();
                }
              }}
              className="p-0.5 rounded-full hover:bg-orange-200/70 text-orange-500 hover:text-orange-800 transition cursor-pointer"
              title="Clear stock filter"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-orange-500" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent sm:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 w-[calc(100vw-3rem)] sm:w-60 max-w-[260px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-0.5 text-xs">
          {STOCK_OPTIONS.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left font-medium flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? "bg-orange-50 text-orange-800 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  {opt.badgeDot ? (
                    <span className={`h-2 w-2 rounded-full ${opt.badgeDot} shrink-0`} />
                  ) : (
                    <Boxes className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>{opt.label}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-orange-600 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// 4. SORT BY DROPDOWN
// ==========================================
interface SortDropdownProps {
  value: AdminProductSortEnum;
  onChange: (val: AdminProductSortEnum) => void;
}

const SORT_OPTIONS: { value: AdminProductSortEnum; label: string }[] = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "stock_asc", label: "Stock: Low to High" },
  { value: "stock_desc", label: "Stock: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "rating_desc", label: "Top Customer Rating" },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const currentOption = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  return (
    <div ref={dropdownRef} className={`relative w-full ${isOpen ? "z-50" : "z-10"}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full h-[38px] rounded-xl border border-slate-200/80 bg-white hover:bg-[#FAF7F2] px-3 text-xs text-left transition flex items-center justify-between gap-1.5 cursor-pointer text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{currentOption.label}</span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-orange-500" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent sm:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1.5 w-[calc(100vw-3rem)] sm:w-60 max-w-[260px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-0.5 text-xs">
          {SORT_OPTIONS.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-xl text-left font-medium flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? "bg-orange-50 text-orange-800 font-bold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-orange-600 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
