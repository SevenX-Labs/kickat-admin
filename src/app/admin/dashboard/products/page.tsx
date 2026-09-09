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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
      )}

      {/* =========================================================
          3. SEARCH, FILTERS & VIEW MODE CONTROLS
          ========================================================= */}
      <div className="clay-card p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              placeholder="Search products by title, SKU, slug, or details..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  handleFilterChange();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {(["ALL", "ACTIVE", "DRAFT", "INACTIVE"] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  handleFilterChange();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#FF7A00] text-white shadow-xs"
                    : "clay-button text-slate-600 hover:text-slate-900"
                }`}
              >
                {st === "ALL" ? "All Status" : st}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-slate-200/80 p-1 rounded-xl bg-[#F8F5F1] shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "GRID" ? "bg-white text-orange-600 shadow-xs" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "TABLE" ? "bg-white text-orange-600 shadow-xs" : "text-slate-400 hover:text-slate-700"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2 px-2.5 text-xs text-slate-700 outline-none focus:bg-white cursor-pointer appearance-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parentId ? `└ ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Species Filter */}
          <div className="relative">
            <select
              value={speciesFilter}
              onChange={(e) => {
                setSpeciesFilter(e.target.value as any);
                handleFilterChange();
              }}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2 px-2.5 text-xs text-slate-700 outline-none focus:bg-white cursor-pointer appearance-none"
            >
              <option value="ALL">All Pet Species</option>
              <option value="DOG">Dog</option>
              <option value="CAT">Cat</option>
              <option value="BIRD">Bird</option>
              <option value="FISH">Fish</option>
              <option value="RABBIT">Rabbit</option>
              <option value="OTHER">Other Species</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Stock Filter */}
          <div className="relative">
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any);
                handleFilterChange();
              }}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2 px-2.5 text-xs text-slate-700 outline-none focus:bg-white cursor-pointer appearance-none"
            >
              <option value="ALL">All Stock States</option>
              <option value="IN_STOCK">In Stock (&gt; 0)</option>
              <option value="LOW_STOCK">Low Stock (&le; 10)</option>
              <option value="OUT_OF_STOCK">Out of Stock (0)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                handleFilterChange();
              }}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2 px-2.5 text-xs text-slate-700 outline-none focus:bg-white cursor-pointer appearance-none"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_asc">Stock: Low to High</option>
              <option value="stock_desc">Stock: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="rating_desc">Top Customer Rating</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* =========================================================
          4. BULK ACTIONS BAR (When items are selected)
          ========================================================= */}
      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-30 flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-[#2A241E] text-white shadow-xl animate-slide-in-down">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedIds.size === products.length}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-bold">
              {selectedIds.size} of {products.length} product(s) selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus("ACTIVE")}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkStatus("INACTIVE")}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition cursor-pointer"
            >
              Set Inactive
            </button>
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          5. PRODUCTS LISTING (GRID OR TABLE)
          ========================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="clay-card p-5 space-y-3">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        // Clean Empty State
        <div className="clay-card p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 text-white mx-auto shadow-md">
            <Package className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#2A241E]">
              {search || statusFilter !== "ALL" || categoryFilter !== "ALL"
                ? "No matching products found"
                : "No products in store yet"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {search || statusFilter !== "ALL" || categoryFilter !== "ALL"
                ? "Try resetting your search query or category filters to see more catalog items."
                : "KickAt is ready for your product catalog. Add your first product with rich photos, variants, and feeding guides."}
            </p>
          </div>

          {search || statusFilter !== "ALL" || categoryFilter !== "ALL" ? (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setCategoryFilter("ALL");
                setSpeciesFilter("ALL");
                setStockFilter("ALL");
                handleFilterChange();
              }}
              className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#FF7A00] transition"
            >
              Reset Filters
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
      ) : viewMode === "GRID" ? (
        /* =========================================================
            GRID CARDS VIEW
            ========================================================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                className={`clay-card p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-200 relative group ${
                  isSelected ? "ring-2 ring-[#FF7A00] bg-orange-50/20" : ""
                }`}
              >
                {/* Checkbox Selector */}
                <div className="absolute top-3.5 left-3.5 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(p.id)}
                    className="h-4 w-4 rounded accent-[#FF7A00] cursor-pointer bg-white/90 backdrop-blur-xs shadow-xs"
                  />
                </div>

                {/* Top Media & Badges */}
                <div>
                  <div className="relative h-44 w-full rounded-2xl bg-[#F8F5F1] overflow-hidden border border-slate-200/60 mb-3 flex items-center justify-center">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={p.name}
                        className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as any).src = "";
                          e.currentTarget.className = "hidden";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <div className="p-3 rounded-2xl bg-white/80 text-orange-500 mb-1 shadow-xs">
                          {renderSpeciesIcon(p.petSpecies, "h-8 w-8")}
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          KickAt Original
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs flex items-center gap-1 ${
                          p.status === "ACTIVE"
                            ? "bg-emerald-500/90 text-white"
                            : p.status === "DRAFT"
                            ? "bg-amber-500/90 text-white"
                            : "bg-slate-500/90 text-white"
                        }`}
                      >
                        {p.status === "ACTIVE" && <CheckCircle2 className="h-3 w-3" />}
                        {p.status === "DRAFT" && <Clock className="h-3 w-3" />}
                        {p.status === "INACTIVE" && <XCircle className="h-3 w-3" />}
                        <span>{p.status}</span>
                      </span>
                    </div>

                    {/* Stock Alert Badge */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs backdrop-blur-xs flex items-center gap-1 ${
                          p.stock === 0
                            ? "bg-rose-500 text-white"
                            : p.stock <= 10
                            ? "bg-amber-500 text-white"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {p.stock === 0 ? (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Out of Stock</span>
                          </>
                        ) : p.stock <= 10 ? (
                          <>
                            <AlertTriangle className="h-3 w-3" />
                            <span>{p.stock} low stock</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{p.stock} in stock</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Species Badge */}
                    {p.petSpecies && (
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="text-xs bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-lg font-bold text-slate-700 shadow-xs flex items-center gap-1">
                          {renderSpeciesIcon(p.petSpecies, "h-3.5 w-3.5 text-orange-600")}
                          <span>{p.petSpecies}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category & Tags */}
                  <div className="flex items-center gap-2 mb-1.5 text-[10.5px]">
                    <span className="font-bold text-[#FF7A00] truncate">
                      {p.category?.name || "Uncategorized"}
                    </span>
                    {hasVariants && (
                      <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                        {p.variants.length} variant{p.variants.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {p.isBestSeller && (
                      <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-600" /> Best Seller
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-fraunces text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-[#FF7A00] transition">
                    <Link href={`/admin/dashboard/products/${p.id}`}>{p.name}</Link>
                  </h3>
                  <p className="text-[10.5px] font-mono text-slate-400 mt-0.5 truncate">
                    /{p.slug}
                  </p>
                </div>

                {/* Price & Action Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100/80 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-fraunces text-lg font-bold text-[#2A241E]">
                          ₹{(p.discountPrice ?? p.price).toLocaleString("en-IN")}
                        </span>
                        {p.discountPrice && p.discountPrice < p.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{p.price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {discountPct && (
                        <span className="text-[10px] font-extrabold text-emerald-600">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>

                    {/* Quick Status Dropdown */}
                    <div className="relative">
                      <select
                        value={p.status}
                        disabled={statusUpdatingId === p.id}
                        onChange={(e) => handleStatusChange(p, e.target.value as ProductStatus)}
                        className="text-[11px] font-bold rounded-lg bg-[#F8F5F1] border border-slate-200 py-1 pl-2 pr-5 text-slate-700 outline-none cursor-pointer appearance-none disabled:opacity-50"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Button Toolbar */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleOpenStockModal(p)}
                      className="flex-1 clay-button py-1.5 px-2.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Boxes className="h-3.5 w-3.5" />
                      <span>Stock</span>
                    </button>

                    <Link
                      href={`/admin/dashboard/products/${p.id}`}
                      className="flex-1 clay-button py-1.5 px-2.5 text-xs font-bold text-slate-700 hover:text-[#FF7A00] transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => {
                        setDeleteProductTarget(p);
                        setDeletePermanent(false);
                      }}
                      className="clay-button p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* =========================================================
            TABLE VIEW
            ========================================================= */
        <div className="clay-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#F8F5F1] border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === products.length}
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
                          <div className="h-11 w-11 rounded-xl bg-white border border-slate-200/70 p-1 shrink-0 flex items-center justify-center overflow-hidden">
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
                          className={`font-bold px-2 py-0.5 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
                            p.stock === 0
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : p.stock <= 10
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <span>{p.stock} units</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <select
                          value={p.status}
                          disabled={statusUpdatingId === p.id}
                          onChange={(e) => handleStatusChange(p, e.target.value as ProductStatus)}
                          className={`text-[10.5px] font-extrabold rounded-lg px-2 py-1 outline-none cursor-pointer border ${
                            p.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : p.status === "DRAFT"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-1">
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
          <div className="clay-card w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-up">
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
          <div className="clay-card w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-up">
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
          <div className="clay-card w-full max-w-md p-6 space-y-4 shadow-2xl animate-scale-up">
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
