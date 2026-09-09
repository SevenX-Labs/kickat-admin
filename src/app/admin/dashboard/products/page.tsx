"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Boxes,
  Sparkles,
  Flame,
  Clock,
  Check,
  X,
  AlertCircle,
  LayoutGrid,
  List,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
  PawPrint,
  IndianRupee,
} from "lucide-react";
import Link from "next/link";
import {
  CategoryFilterDropdown,
  SpeciesFilterDropdown,
  StockFilterDropdown,
  SortDropdown,
} from "@/components/products/ProductFilterDropdowns";
import {
  AdminProductItem,
  ProductSummary,
  ProductPagination,
  ProductStatus,
  PetSpecies,
  DietaryPreference,
  AdminProductSortEnum,
} from "@/types/admin-product";
import { AdminProductService } from "@/services/adminProductService";
import { AdminCategoryService } from "@/services/adminCategoryService";
import { AdminCategoryItem } from "@/types/admin-category";
import { Skeleton, StatCardsSkeleton } from "@/components/ui/Skeleton";

export default function ProductsPage() {
  // Data States
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [summary, setSummary] = useState<ProductSummary | null>(null);
  const [pagination, setPagination] = useState<ProductPagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Categories list for filtering
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);

  // Filter & Search States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProductStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [speciesFilter, setSpeciesFilter] = useState<"ALL" | PetSpecies>("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [sortBy, setSortBy] = useState<AdminProductSortEnum>("createdAt_desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Selection for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Quick Stock Modal State
  const [stockModalProduct, setStockModalProduct] = useState<AdminProductItem | null>(null);
  const [stockInputValue, setStockInputValue] = useState<number>(0);
  const [variantStocks, setVariantStocks] = useState<{ variantId: string; name: string; sku: string; stock: number }[]>([]);
  const [updatingStock, setUpdatingStock] = useState(false);

  // Delete Modal State
  const [deleteProductTarget, setDeleteProductTarget] = useState<AdminProductItem | null>(null);
  const [deletePermanent, setDeletePermanent] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Bulk Delete Modal State
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [bulkDeletePermanent, setBulkDeletePermanent] = useState(true);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Mobile filters drawer bottom-sheet state
  const [mobileFilterDrawerOpen, setMobileFilterDrawerOpen] = useState(false);

  // Mobile overflow action menu product ID
  const [activeMenuProductId, setActiveMenuProductId] = useState<string | null>(null);

  // Active filter count
  const activeFiltersCount =
    (statusFilter !== "ALL" ? 1 : 0) +
    (categoryFilter !== "ALL" ? 1 : 0) +
    (speciesFilter !== "ALL" ? 1 : 0) +
    (stockFilter !== "ALL" ? 1 : 0);

  const handleClearAllFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSpeciesFilter("ALL");
    setStockFilter("ALL");
    setSearch("");
    setPage(1);
  };

  // In-flight status toggles
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Toast Feedback State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  }, []);

  // Read category query param from URL on initial client load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const catParam = urlParams.get("category") || urlParams.get("categoryId");
      if (catParam) {
        setCategoryFilter(catParam);
      }
    }
  }, []);

  // Fetch Categories once for filter dropdown
  useEffect(() => {
    AdminCategoryService.getCategories()
      .then((res) => {
        if (res?.success && res?.data?.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch(() => {
        // Optional
      });
  }, []);

  // Fetch Products from Remote API
  const fetchProducts = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const params: any = {
          page,
          limit: pageSize,
          sort: sortBy,
        };

        if (search.trim()) params.search = search.trim();
        if (statusFilter !== "ALL") params.status = statusFilter;
        if (categoryFilter !== "ALL") params.categoryId = categoryFilter;
        if (speciesFilter !== "ALL") params.petSpecies = speciesFilter;

        if (stockFilter === "IN_STOCK") {
          params.inStock = true;
        } else if (stockFilter === "OUT_OF_STOCK") {
          params.inStock = false;
        } else if (stockFilter === "LOW_STOCK") {
          params.isLowStock = true;
          params.lowStockThreshold = 10;
        }

        const res = await AdminProductService.getProducts(params);

        if (res?.success && res?.data) {
          setProducts(res.data.products || []);
          if (res.data.summary) setSummary(res.data.summary);
          if (res.data.pagination) setPagination(res.data.pagination);
        }
      } catch (err: unknown) {
        const msg = AdminProductService.extractErrorMessage(err, "Failed to load products.");
        showToast(msg, "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, pageSize, sortBy, search, statusFilter, categoryFilter, speciesFilter, stockFilter, showToast]
  );

  useEffect(() => {
    fetchProducts(true);
  }, [fetchProducts]);

  const handleFilterChange = () => {
    setPage(1);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (product: AdminProductItem, newStatus: ProductStatus) => {
    if (product.status === newStatus) return;
    try {
      setStatusUpdatingId(product.id);
      await AdminProductService.updateStatus(product.id, newStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      showToast(`Product status set to ${newStatus}`, "success");
    } catch (err) {
      showToast(AdminProductService.extractErrorMessage(err, "Failed to update status"), "error");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleOpenStockModal = (product: AdminProductItem) => {
    setStockModalProduct(product);
    setStockInputValue(product.stock || 0);
    if (product.variants && product.variants.length > 0) {
      setVariantStocks(
        product.variants.map((v) => ({
          variantId: v.id || "",
          name: v.name,
          sku: v.sku || "N/A",
          stock: v.stock || 0,
        }))
      );
    } else {
      setVariantStocks([]);
    }
  };

  const handleSaveStock = async () => {
    if (!stockModalProduct) return;
    try {
      setUpdatingStock(true);
      if (variantStocks.length > 0) {
        const payload = {
          variantStocks: variantStocks.map((v) => ({
            variantId: v.variantId,
            stock: Number(v.stock) || 0,
          })),
        };
        await AdminProductService.quickUpdateStock(stockModalProduct.id, payload);
      } else {
        await AdminProductService.quickUpdateStock(stockModalProduct.id, {
          stock: Number(stockInputValue) || 0,
        });
      }
      showToast("Inventory stock updated successfully", "success");
      setStockModalProduct(null);
      fetchProducts(false);
    } catch (err) {
      showToast(AdminProductService.extractErrorMessage(err, "Failed to update stock"), "error");
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteProductTarget) return;
    try {
      setDeleting(true);
      await AdminProductService.deleteProduct(deleteProductTarget.id, deletePermanent);
      showToast(
        deletePermanent ? "Product permanently removed" : "Product soft-deleted successfully",
        "success"
      );
      setDeleteProductTarget(null);
      fetchProducts(false);
    } catch (err) {
      showToast(AdminProductService.extractErrorMessage(err, "Failed to delete product"), "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkStatus = async (newStatus: ProductStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      const res = await AdminProductService.bulkUpdateStatus(ids, newStatus);
      showToast(`Updated ${res?.data?.updatedCount || ids.length} products to ${newStatus}`, "success");
      setSelectedIds(new Set());
      fetchProducts(false);
    } catch (err) {
      showToast(AdminProductService.extractErrorMessage(err, "Bulk status update failed"), "error");
    }
  };

  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      setBulkDeleting(true);
      const res = await AdminProductService.bulkDelete(ids, bulkDeletePermanent);
      showToast(
        bulkDeletePermanent
          ? `Permanently purged ${res?.data?.deletedCount || ids.length} products`
          : `Soft-deleted ${res?.data?.deletedCount || ids.length} products`,
        "success"
      );
      setIsBulkDeleteModalOpen(false);
      setSelectedIds(new Set());
      fetchProducts(false);
    } catch (err) {
      showToast(AdminProductService.extractErrorMessage(err, "Bulk delete failed"), "error");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Render React Icon for Species
  const renderSpeciesIcon = (species?: PetSpecies | null, size = "h-4 w-4") => {
    switch (species) {
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
    <div className="space-y-5 pb-12 w-full min-w-0 no-scrollbar animate-fade-in text-[#2A241E]">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-slide-in-down ${
            toast.type === "success"
              ? "bg-emerald-500/90 text-white border-emerald-400"
              : toast.type === "error"
              ? "bg-rose-500/90 text-white border-rose-400"
              : "bg-slate-800/90 text-white border-slate-700"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 shrink-0" />}
          {toast.type === "error" && <AlertTriangle className="h-5 w-5 shrink-0" />}
          {toast.type === "info" && <AlertCircle className="h-5 w-5 shrink-0" />}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* =========================================================
          1. HEADER & PRIMARY ACTIONS
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h1 className="font-fraunces text-2xl sm:text-3xl font-bold tracking-tight text-[#2A241E]">
            Products &amp; Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your store catalog, real-time stock levels, multi-variants, and image galleries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchProducts(false)}
            disabled={refreshing || loading}
            aria-label="Refresh catalog"
            className="clay-button p-2.5 rounded-xl text-slate-600 hover:text-[#FF7A00] transition flex items-center gap-2 text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <Link
            href="/admin/dashboard/products/create"
            className="clay-btn-orange inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* =========================================================
          2. LIVE SUMMARY METRIC CARDS (React Icons)
          ========================================================= */}
      {loading ? (
        <StatCardsSkeleton />
      ) : (
        <>
          {/* Mobile High-Density Metric Strip (md:hidden, saves ~130px vertical space) */}
          <div className="clay-card p-2.5 flex items-center justify-between divide-x divide-slate-100 text-center text-xs md:hidden shadow-xs">
            <div className="flex-1 px-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block truncate">Products</span>
              <span className="font-fraunces text-base font-bold text-slate-800 leading-tight mt-0.5 block">
                {summary?.totalProducts ?? products.length}
              </span>
            </div>
            <div className="flex-1 px-1">
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block truncate">Active</span>
              <span className="font-fraunces text-base font-bold text-emerald-600 leading-tight mt-0.5 block">
                {summary?.activeCount ?? 0}
              </span>
            </div>
            <div className="flex-1 px-1">
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block truncate">Low</span>
              <span className="font-fraunces text-base font-bold text-amber-600 leading-tight mt-0.5 block">
                {summary?.lowStockCount ?? 0}
              </span>
            </div>
            <div className="flex-1 px-1">
              <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider block truncate">Out</span>
              <span className="font-fraunces text-base font-bold text-rose-600 leading-tight mt-0.5 block">
                {summary?.outOfStockCount ?? 0}
              </span>
            </div>
          </div>

          {/* Desktop Summary Cards (hidden md:grid) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Products */}
            <div className="clay-card p-4 flex items-center gap-3.5 transition-all hover:scale-[1.01]">
              <div className="clay-badge-purple flex h-11 w-11 shrink-0 items-center justify-center text-white shadow-xs rounded-2xl">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  Total Products
                </span>
                <p className="font-fraunces text-xl sm:text-2xl font-bold text-slate-800 leading-tight mt-0.5">
                  {summary?.totalProducts ?? products.length}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Catalog items</span>
              </div>
            </div>

            {/* Active in Store */}
            <div className="clay-card p-4 flex items-center gap-3.5 transition-all hover:scale-[1.01]">
              <div className="clay-badge-green flex h-11 w-11 shrink-0 items-center justify-center text-white shadow-xs rounded-2xl">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block truncate">
                  Active in Store
                </span>
                <p className="font-fraunces text-xl sm:text-2xl font-bold text-slate-800 leading-tight mt-0.5">
                  {summary?.activeCount ?? products.filter((p) => p.status === "ACTIVE").length}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">
                  {summary?.draftCount ?? 0} draft &bull; {summary?.inactiveCount ?? 0} inactive
                </span>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="clay-card p-4 flex items-center gap-3.5 transition-all hover:scale-[1.01]">
              <div className="clay-badge-amber flex h-11 w-11 shrink-0 items-center justify-center text-white shadow-xs rounded-2xl">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block truncate">
                  Low Stock
                </span>
                <p className="font-fraunces text-xl sm:text-2xl font-bold text-slate-800 leading-tight mt-0.5">
                  {summary?.lowStockCount ?? 0}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">&le; 10 units left</span>
              </div>
            </div>

            {/* Out of Stock */}
            <div className="clay-card p-4 flex items-center gap-3.5 transition-all hover:scale-[1.01]">
              <div className="clay-badge-coral flex h-11 w-11 shrink-0 items-center justify-center text-white shadow-xs rounded-2xl">
                <XCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block truncate">
                  Out of Stock
                </span>
                <p className="font-fraunces text-xl sm:text-2xl font-bold text-slate-800 leading-tight mt-0.5">
                  {summary?.outOfStockCount ?? 0}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Needs restock</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          3. SEARCH, FILTERS & VIEW MODE CONTROLS
          ========================================================= */}
      
      {/* DESKTOP TOOLBAR (hidden md:block) */}
      <div className="hidden md:block clay-card p-3.5 sm:p-4 space-y-3 relative z-30">
        {/* Top Row: Dominant Search + Sort + View Mode */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              placeholder="Search products by title, SKU, slug, or details..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  handleFilterChange();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-44">
              <SortDropdown
                value={sortBy}
                onChange={(val) => {
                  setSortBy(val);
                  handleFilterChange();
                }}
              />
            </div>

            <div className="h-6 w-px bg-slate-200/80 mx-0.5" />

            <div className="flex items-center gap-1 border border-slate-200/80 p-1 rounded-xl bg-[#F8F5F1] shrink-0">
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "GRID" ? "bg-white text-orange-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "TABLE" ? "bg-white text-orange-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Status Buttons + Category + Species + Stock Filters + Clear */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {(["ALL", "ACTIVE", "DRAFT", "INACTIVE"] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  handleFilterChange();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? "bg-[#FF7A00] text-white shadow-xs"
                    : "clay-button text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "ALL" ? "All Status" : st}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 flex-1 max-w-2xl text-xs">
            <CategoryFilterDropdown
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                handleFilterChange();
              }}
              categories={categories}
              onClear={() => {
                setCategoryFilter("ALL");
                handleFilterChange();
              }}
            />

            <SpeciesFilterDropdown
              value={speciesFilter}
              onChange={(val) => {
                setSpeciesFilter(val);
                handleFilterChange();
              }}
              onClear={() => {
                setSpeciesFilter("ALL");
                handleFilterChange();
              }}
            />

            <StockFilterDropdown
              value={stockFilter}
              onChange={(val) => {
                setStockFilter(val);
                handleFilterChange();
              }}
              onClear={() => {
                setStockFilter("ALL");
                handleFilterChange();
              }}
            />
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-800 font-bold hover:underline cursor-pointer shrink-0 whitespace-nowrap"
            >
              <X className="h-3 w-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* MOBILE COMPACT TOOLBAR (md:hidden, highly optimized for vertical space) */}
      <div className="clay-card p-3 space-y-2.5 relative z-30 md:hidden">
        {/* Full-width Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              handleFilterChange();
            }}
            placeholder="Search products by title, SKU, slug..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                handleFilterChange();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Action Controls Strip: Filters Drawer Trigger + Sort + View */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5 text-xs">
          <div className="flex items-center gap-1.5">
            {/* Filters Bottom Sheet Trigger */}
            <button
              type="button"
              onClick={() => setMobileFilterDrawerOpen(true)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                activeFiltersCount > 0
                  ? "bg-orange-50 text-orange-950 border-orange-300 shadow-2xs"
                  : "clay-button text-slate-700"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-orange-600" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-[#FF7A00] text-white text-[10px] font-extrabold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear Filters Action */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-xs text-orange-600 hover:text-orange-800 font-bold hover:underline cursor-pointer px-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sort Dropdown */}
            <div className="w-32">
              <SortDropdown
                value={sortBy}
                onChange={(val) => {
                  setSortBy(val);
                  handleFilterChange();
                }}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-0.5 border border-slate-200/80 p-0.5 rounded-xl bg-[#F8F5F1] shrink-0">
              <button
                onClick={() => setViewMode("GRID")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "GRID" ? "bg-white text-orange-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("TABLE")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === "TABLE" ? "bg-white text-orange-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"
                }`}
                title="List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM SHEET DRAWER (md:hidden) */}
      {mobileFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in md:hidden">
          {/* Backdrop Tap-Outside Dismissal */}
          <div
            className="fixed inset-0"
            onClick={() => setMobileFilterDrawerOpen(false)}
          />

          <div
            className="clay-modal relative w-full sm:max-w-md max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-up z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-orange-600" />
                <h3 className="font-fraunces text-base font-bold text-slate-900">
                  Filter Products
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileFilterDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body - Scrollable */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Status Section */}
              <div>
                <label className="text-slate-700 font-bold block mb-1.5 uppercase text-[11px] tracking-wider">
                  Product Status
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#F8F5F1] rounded-xl border border-slate-200/70">
                  {(["ALL", "ACTIVE", "DRAFT", "INACTIVE"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        handleFilterChange();
                      }}
                      className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition text-center cursor-pointer ${
                        statusFilter === st
                          ? "bg-[#FF7A00] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {st === "ALL" ? "All" : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Section */}
              <div>
                <label className="text-slate-700 font-bold block mb-1.5 uppercase text-[11px] tracking-wider">
                  Category Hierarchy
                </label>
                <CategoryFilterDropdown
                  value={categoryFilter}
                  onChange={(val) => {
                    setCategoryFilter(val);
                    handleFilterChange();
                  }}
                  categories={categories}
                  onClear={() => {
                    setCategoryFilter("ALL");
                    handleFilterChange();
                  }}
                />
              </div>

              {/* Pet Species Section */}
              <div>
                <label className="text-slate-700 font-bold block mb-1.5 uppercase text-[11px] tracking-wider">
                  Pet Species Target
                </label>
                <SpeciesFilterDropdown
                  value={speciesFilter}
                  onChange={(val) => {
                    setSpeciesFilter(val);
                    handleFilterChange();
                  }}
                  onClear={() => {
                    setSpeciesFilter("ALL");
                    handleFilterChange();
                  }}
                />
              </div>

              {/* Stock Status Section */}
              <div>
                <label className="text-slate-700 font-bold block mb-1.5 uppercase text-[11px] tracking-wider">
                  Inventory & Stock State
                </label>
                <StockFilterDropdown
                  value={stockFilter}
                  onChange={(val) => {
                    setStockFilter(val);
                    handleFilterChange();
                  }}
                  onClear={() => {
                    setStockFilter("ALL");
                    handleFilterChange();
                  }}
                />
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3.5 bg-[#FAF7F2] border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleClearAllFilters();
                }}
                disabled={activeFiltersCount === 0}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-orange-600 disabled:opacity-40 transition cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterDrawerOpen(false)}
                className="clay-btn-orange px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          4. BULK ACTIONS BAR (When items are selected)
          ========================================================= */}
      {selectedIds.size > 0 && (
        <div className="sticky top-3 z-30 flex items-center justify-between p-2.5 sm:p-3.5 rounded-2xl bg-[#2A241E] text-white shadow-xl animate-slide-in-down">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <input
              type="checkbox"
              checked={selectedIds.size === products.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer shrink-0"
            />
            <span className="text-xs sm:text-sm font-bold truncate">
              {selectedIds.size} <span className="hidden sm:inline">of {products.length}</span> selected
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => handleBulkStatus("ACTIVE")}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold transition cursor-pointer"
            >
              Active
            </button>
            <button
              onClick={() => handleBulkStatus("INACTIVE")}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[11px] sm:text-xs font-bold transition cursor-pointer"
            >
              Draft
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="Deselect all"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          5. PRODUCTS LISTING (GRID OR TABLE OR MOBILE COMPACT ROW)
          ========================================================= */}
      {loading ? (
        <>
          {/* Mobile Loading Skeleton: 6 compact rows */}
          <div className="space-y-2.5 md:hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="clay-card p-3 rounded-2xl flex items-start gap-2.5">
                <Skeleton className="h-4 w-4 rounded mt-1 shrink-0" />
                <Skeleton className="h-14 w-14 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-2/3 rounded-md" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-6 w-14 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Loading Skeleton: Grid Cards */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 relative z-0">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="clay-card p-4 sm:p-4.5 flex flex-col justify-between space-y-3">
                <Skeleton className="aspect-square sm:h-52 w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-1/3 rounded-md" />
                  <Skeleton className="h-5 w-4/5 rounded-lg" />
                  <Skeleton className="h-3.5 w-1/2 rounded-md" />
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : products.length === 0 ? (
        // Clean Empty State
        <div className="clay-card p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 text-white mx-auto shadow-md">
            <Package className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#2A241E]">
              {search || activeFiltersCount > 0
                ? "No matching products found"
                : "No products in store yet"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {search || activeFiltersCount > 0
                ? "Try adjusting your search keywords or clearing active filters to view more items."
                : "KickAt is ready for your product catalog. Add your first product with rich photos, variants, and feeding guides."}
            </p>
          </div>

          {search || activeFiltersCount > 0 ? (
            <button
              onClick={handleClearAllFilters}
              className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#FF7A00] transition cursor-pointer"
            >
              Reset All Filters
            </button>
          ) : (
            <Link
              href="/admin/dashboard/products/create"
              className="clay-btn-orange inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add First Product</span>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* =========================================================
              MOBILE HIGH-DENSITY COMPACT PRODUCT ROWS (md:hidden)
              Optimized to comfortably scroll 200+ products (~90-110px per row)
              ========================================================= */}
          <div className="space-y-2.5 md:hidden">
            {products.map((p) => {
              const isSelected = selectedIds.has(p.id);
              const hasVariants = p.variants && p.variants.length > 0;
              const primaryImg = p.imageUrl || p.images?.[0];
              const discountPct =
                p.discountPrice && p.discountPrice < p.price
                  ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                  : null;

              return (
                <div
                  key={p.id}
                  className={`clay-card p-3 rounded-2xl flex items-start gap-2.5 relative transition hover:border-slate-300 ${
                    isSelected ? "ring-2 ring-[#FF7A00] bg-orange-50/20" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(p.id)}
                    className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer mt-1 shrink-0 bg-white border border-slate-300"
                  />

                  {/* Fixed 56px Thumbnail */}
                  <div className="h-14 w-14 rounded-xl bg-[#FAF7F2] border border-slate-200/80 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={p.name}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as any).src = "";
                          e.currentTarget.className = "hidden";
                        }}
                      />
                    ) : (
                      renderSpeciesIcon(p.petSpecies, "h-6 w-6 text-orange-500")
                    )}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="font-fraunces text-sm font-bold text-slate-900 leading-snug line-clamp-1 hover:text-[#FF7A00] transition">
                        <Link href={`/admin/dashboard/products/${p.id}`}>{p.name}</Link>
                      </h3>

                      {/* Compact Status Pill */}
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0 border ${
                          p.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.status === "DRAFT"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    {/* SKU & Slug Line */}
                    <div className="text-[10.5px] font-mono text-slate-400 truncate">
                      SKU: {p.variants?.[0]?.sku || p.id.slice(0, 8)} • /{p.slug}
                    </div>

                    {/* Metadata Line */}
                    <div className="flex items-center gap-1 text-[10.5px] text-slate-500 font-medium truncate">
                      <span className="font-semibold text-slate-700 truncate max-w-[100px]">
                        {p.category?.name || "Uncategorized"}
                      </span>
                      {p.petSpecies && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-0.5 text-slate-600">
                            {renderSpeciesIcon(p.petSpecies, "h-2.5 w-2.5 text-orange-600")}
                            <span>{p.petSpecies}</span>
                          </span>
                        </>
                      )}
                      {hasVariants && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{p.variants.length} variant{p.variants.length > 1 ? "s" : ""}</span>
                        </>
                      )}
                    </div>

                    {/* Bottom Line: Price + Stock + Actions */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                      {/* Price & Stock */}
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-baseline gap-1">
                          <span className="font-fraunces text-sm font-bold text-[#2A241E]">
                            ₹{(p.discountPrice ?? p.price).toLocaleString("en-IN")}
                          </span>
                          {p.discountPrice && p.discountPrice < p.price && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        <span className="text-slate-300">•</span>

                        {/* Stock Health */}
                        <div className="flex items-center gap-1 text-[11px] font-medium shrink-0">
                          <span
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                              p.stock === 0
                                ? "bg-rose-500"
                                : p.stock <= 10
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span
                            className={
                              p.stock === 0
                                ? "text-rose-700 font-semibold"
                                : p.stock <= 10
                                ? "text-amber-700 font-semibold"
                                : "text-emerald-700"
                            }
                          >
                            {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                          </span>
                        </div>
                      </div>

                      {/* Compact Action Cluster */}
                      <div className="flex items-center gap-1 shrink-0 relative">
                        {/* Edit Icon */}
                        <Link
                          href={`/admin/dashboard/products/${p.id}`}
                          className="clay-button p-1.5 text-slate-600 hover:text-[#FF7A00] rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>

                        {/* More Menu Toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuProductId(activeMenuProductId === p.id ? null : p.id)
                          }
                          className="clay-button p-1.5 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
                          title="More actions"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {/* More Menu Popover */}
                        {activeMenuProductId === p.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveMenuProductId(null)}
                            />
                            <div className="absolute right-0 bottom-full mb-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-200/90 z-50 p-1 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuProductId(null);
                                  handleOpenStockModal(p);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                              >
                                <Boxes className="h-3.5 w-3.5 text-indigo-500" />
                                <span>Update Stock</span>
                              </button>

                              <Link
                                href={`/admin/dashboard/products/${p.id}`}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-orange-500" />
                                <span>Edit Details</span>
                              </Link>

                              <div className="h-px bg-slate-100 my-0.5" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuProductId(null);
                                  setDeleteProductTarget(p);
                                  setDeletePermanent(false);
                                }}
                                className="w-full px-2.5 py-1.5 rounded-lg text-left font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================
              DESKTOP GRID CARDS VIEW (hidden md:grid)
              ========================================================= */}
          {viewMode === "GRID" && (
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 relative z-0">
              {products.map((p) => {
                const isSelected = selectedIds.has(p.id);
                const hasVariants = p.variants && p.variants.length > 0;
                const primaryImg = p.imageUrl || p.images?.[0];
                const discountPct =
                  p.discountPrice && p.discountPrice < p.price
                    ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                    : null;

                return (
                  <div
                    key={p.id}
                    className={`clay-card p-4 sm:p-4.5 flex flex-col justify-between h-full transition-all duration-200 relative group ${
                      isSelected ? "ring-2 ring-[#FF7A00] bg-orange-50/20" : "hover:border-slate-300"
                    }`}
                  >
                    {/* Top Media & Header Container */}
                    <div>
                      <div className="relative aspect-square sm:h-52 w-full rounded-2xl bg-[#FBF9F6] border border-slate-200/70 overflow-hidden flex items-center justify-center mb-3 group-hover:border-orange-200 transition-colors">
                        {/* Checkbox Selector */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(p.id)}
                            className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer bg-white shadow-xs border border-slate-300"
                          />
                        </div>

                        {/* Unified Status Selector: Status Display + Switcher in One */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <div className="relative">
                            <select
                              value={p.status}
                              disabled={statusUpdatingId === p.id}
                              onChange={(e) => handleStatusChange(p, e.target.value as ProductStatus)}
                              className={`text-[11px] font-bold rounded-lg py-1 pl-2 pr-5 cursor-pointer appearance-none border shadow-2xs backdrop-blur-xs transition ${
                                p.status === "ACTIVE"
                                ? "bg-emerald-50/95 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : p.status === "DRAFT"
                                ? "bg-amber-50/95 text-amber-700 border-amber-200 hover:bg-amber-100"
                                : "bg-slate-100/95 text-slate-600 border-slate-200 hover:bg-slate-200"
                              } disabled:opacity-50`}
                              title="Change product status"
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="DRAFT">Draft</option>
                              <option value="INACTIVE">Inactive</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                          </div>
                        </div>

                        {/* Product Image */}
                        {primaryImg ? (
                          <img
                            src={primaryImg}
                            alt={p.name}
                            className="h-full w-full object-contain p-3 group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              (e.currentTarget as any).src = "";
                              e.currentTarget.className = "hidden";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <div className="p-3 rounded-2xl bg-white text-orange-500 mb-1 shadow-xs border border-slate-100">
                              {renderSpeciesIcon(p.petSpecies, "h-7 w-7")}
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              KickAt Original
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Metadata & Title */}
                      <div className="space-y-1.5">
                        {/* Category & Species Meta Line */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                          <span className="font-semibold text-slate-700 hover:text-orange-600 transition truncate max-w-[130px]">
                            {p.category?.name || "Uncategorized"}
                          </span>

                          {p.petSpecies && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                {renderSpeciesIcon(p.petSpecies, "h-3 w-3 text-orange-600")}
                                <span>{p.petSpecies}</span>
                              </span>
                            </>
                          )}

                          {hasVariants && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 font-medium">
                                {p.variants.length} variant{p.variants.length > 1 ? "s" : ""}
                              </span>
                            </>
                          )}

                          {p.isBestSeller && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200/60 font-bold text-[10px] px-1.5 py-0.2 rounded flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5 text-amber-600" /> Best Seller
                            </span>
                          )}
                        </div>

                        {/* Product Name */}
                        <h3 className="font-fraunces text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-[#FF7A00] transition">
                          <Link href={`/admin/dashboard/products/${p.id}`}>{p.name}</Link>
                        </h3>

                        {/* SKU & Slug */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          <span>SKU: {p.variants?.[0]?.sku || p.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span className="truncate">/{p.slug}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Bottom: Stock, Price & Actions */}
                    <div className="pt-3 mt-3 border-t border-slate-100 space-y-2.5">
                      {/* Stock Status & Price Row */}
                      <div className="flex items-center justify-between gap-2">
                        {/* Stock Status */}
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          {p.stock === 0 ? (
                            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                              <span>Out of stock</span>
                            </span>
                          ) : p.stock <= 10 ? (
                            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                              <span>{p.stock} left (low)</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                              <span>{p.stock} in stock</span>
                            </span>
                          )}
                        </div>

                        {/* Price Hierarchy */}
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                            ₹{(p.discountPrice ?? p.price).toLocaleString("en-IN")}
                          </span>
                          {p.discountPrice && p.discountPrice < p.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                          )}
                          {discountPct && (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1 py-0.2 rounded">
                              {discountPct}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions Strip */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          onClick={() => handleOpenStockModal(p)}
                          className="clay-button h-9 px-3 text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center justify-center gap-1.5 rounded-xl transition cursor-pointer flex-1"
                          title="Quick Stock Update"
                        >
                          <Boxes className="h-3.5 w-3.5" />
                          <span>Stock</span>
                        </button>

                        <Link
                          href={`/admin/dashboard/products/${p.id}`}
                          className="clay-btn-orange h-9 px-3.5 text-xs font-bold text-white flex items-center justify-center gap-1.5 rounded-xl transition cursor-pointer flex-1 shadow-xs hover:brightness-105"
                          title="Edit Product Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Link>

                        <button
                          onClick={() => {
                            setDeleteProductTarget(p);
                            setDeletePermanent(false);
                          }}
                          className="clay-button h-9 w-9 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 rounded-xl transition cursor-pointer shrink-0"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================
              DESKTOP TABLE VIEW (hidden md:block when viewMode === "TABLE")
              ========================================================= */}
          {viewMode === "TABLE" && (
            <div className="hidden md:block clay-card overflow-hidden relative z-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-[#F8F5F1] border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === products.length && products.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Species</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => {
                      const isSelected = selectedIds.has(p.id);
                      const primaryImg = p.imageUrl || p.images?.[0];

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-[#FDFBF7] transition ${
                            isSelected ? "bg-orange-50/30" : ""
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(p.id)}
                              className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer"
                            />
                          </td>

                          {/* Name & Thumb */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 rounded-xl bg-[#FAF7F2] border border-slate-200/70 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                {primaryImg ? (
                                  <img
                                    src={primaryImg}
                                    alt=""
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  renderSpeciesIcon(p.petSpecies, "h-5 w-5 text-orange-500")
                                )}
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <Link
                                  href={`/admin/dashboard/products/${p.id}`}
                                  className="font-bold text-slate-800 hover:text-[#FF7A00] transition line-clamp-1"
                                >
                                  {p.name}
                                </Link>
                                <p className="text-[10px] font-mono text-slate-400 truncate">
                                  /{p.slug}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-3.5 font-semibold text-slate-600">
                            {p.category?.name || "—"}
                          </td>

                          {/* Species */}
                          <td className="p-3.5">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              {renderSpeciesIcon(p.petSpecies, "h-3.5 w-3.5 text-orange-600")}
                              <span>{p.petSpecies || "All"}</span>
                            </span>
                          </td>

                          {/* Price */}
                          <td className="p-3.5">
                            <div className="font-extrabold text-slate-900">
                              ₹{(p.discountPrice ?? p.price).toLocaleString("en-IN")}
                            </div>
                            {p.discountPrice && p.discountPrice < p.price && (
                              <div className="text-[10px] text-slate-400 line-through">
                                MRP ₹{p.price.toLocaleString("en-IN")}
                              </div>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="p-3.5">
                            <button
                              onClick={() => handleOpenStockModal(p)}
                              className={`font-bold px-2.5 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
                                p.stock === 0
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : p.stock <= 10
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  p.stock === 0
                                    ? "bg-rose-500"
                                    : p.stock <= 10
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                              <span>{p.stock} units</span>
                            </button>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            <div className="relative inline-block">
                              <select
                                value={p.status}
                                disabled={statusUpdatingId === p.id}
                                onChange={(e) => handleStatusChange(p, e.target.value as ProductStatus)}
                                className={`text-[11px] font-bold rounded-lg py-1 pl-2.5 pr-6 outline-none cursor-pointer appearance-none border transition ${
                                  p.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : p.status === "DRAFT"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="DRAFT">DRAFT</option>
                                <option value="INACTIVE">INACTIVE</option>
                              </select>
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right space-x-1.5">
                            <Link
                              href={`/admin/dashboard/products/${p.id}`}
                              className="clay-button p-1.5 text-slate-600 hover:text-[#FF7A00] inline-flex rounded-lg transition"
                              title="Edit Product"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => {
                                setDeleteProductTarget(p);
                                setDeletePermanent(false);
                              }}
                              className="clay-button p-1.5 text-slate-400 hover:text-rose-600 inline-flex rounded-lg transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================
          6. PAGINATION CONTROLS
          ========================================================= */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-800">{products.length}</span> of{" "}
            <span className="font-bold text-slate-800">{pagination.total}</span> products
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrevPage || loading}
              className="clay-button px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-bold text-slate-700 px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="clay-button px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          7. QUICK STOCK UPDATE MODAL
          ========================================================= */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="clay-badge-purple p-2 text-white rounded-xl">
                  <Boxes className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-bold text-slate-900">
                    Quick Stock Update
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                    {stockModalProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStockModalProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {variantStocks.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                <p className="text-xs text-slate-500 font-medium">
                  Update inventory count per variant SKU. Total master stock will automatically synchronize.
                </p>
                {variantStocks.map((v, idx) => (
                  <div
                    key={v.variantId || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F5F1] border border-slate-200/70 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{v.name}</span>
                      <span className="block text-[10px] font-mono text-slate-400">
                        SKU: {v.sku}
                      </span>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setVariantStocks((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, stock: val } : item))
                          );
                        }}
                        className="w-full text-center rounded-lg bg-white border border-slate-300 py-1 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-200 text-xs font-bold text-slate-800">
                  <span>Total Derived Product Stock:</span>
                  <span className="text-sm font-fraunces text-emerald-700">
                    {variantStocks.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)} units
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Total Units in Warehouse
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockInputValue}
                  onChange={(e) => setStockInputValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-300 p-2.5 text-base font-bold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
                <p className="text-[11px] text-slate-400">
                  Products with stock &le; 10 automatically trigger low-stock alerts.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setStockModalProduct(null)}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStock}
                disabled={updatingStock}
                className="clay-btn-orange px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {updatingStock ? "Saving..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          8. DELETE CONFIRMATION DIALOG
          ========================================================= */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="clay-badge-coral p-2.5 text-white rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
                  Delete Product?
                </h3>
                <p className="text-xs text-slate-500">This action impacts store catalog visibility.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F5F1] border border-slate-200/70 text-xs space-y-1">
              <p className="font-bold text-slate-900 truncate">{deleteProductTarget.name}</p>
              <p className="font-mono text-slate-400 text-[11px]">ID: {deleteProductTarget.id}</p>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deletePermanent}
                onChange={(e) => setDeletePermanent(e.target.checked)}
                className="h-4 w-4 rounded accent-rose-600 cursor-pointer"
              />
              <span className="font-semibold text-rose-700">
                Permanently purge from database (cannot be restored)
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteProductTarget(null)}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-700 shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting..." : deletePermanent ? "Permanently Delete" : "Soft Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          9. BULK DELETE CONFIRMATION DIALOG
          ========================================================= */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="clay-badge-coral p-2.5 text-white rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
                  Bulk Delete Products
                </h3>
                <p className="text-xs text-slate-500">
                  You are about to delete {selectedIds.size} selected products.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bulkDeletePermanent}
                onChange={(e) => setBulkDeletePermanent(e.target.checked)}
                className="h-4 w-4 rounded accent-rose-600 cursor-pointer"
              />
              <span className="font-semibold text-rose-700">
                Permanently purge all selected products from database
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                disabled={bulkDeleting}
                className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-rose-600 hover:bg-rose-700 shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {bulkDeleting ? "Deleting..." : "Confirm Bulk Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
