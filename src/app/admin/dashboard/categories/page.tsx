"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import {
  FolderTree,
  Folder,
  Plus,
  Search,
  Filter,
  Check,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  MoveUp,
  MoveDown,
  X,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  Grid,
  List,
  GitFork,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  AdminCategoryItem,
  CategorySummary,
  CreateCategoryDto,
  UpdateCategoryDto,
  AdminCategorySortEnum,
} from "@/types/admin-category";
import AdminCategoryService from "@/services/adminCategoryService";

/**
 * Category Thumbnail Renderer
 */
function CategoryThumbnail({
  src,
  alt,
  variant = "root",
  size = "md",
}: {
  src?: string | null;
  alt: string;
  variant?: "root" | "sub";
  size?: "sm" | "md" | "lg";
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const dimensionClasses =
    size === "sm"
      ? "h-8 w-8 text-xs rounded-lg"
      : size === "lg"
      ? "h-14 w-14 text-xl rounded-2xl"
      : "h-10 w-10 text-sm rounded-xl";

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        className={`${dimensionClasses} object-cover border border-slate-200/80 shadow-2xs shrink-0`}
      />
    );
  }

  if (variant === "root") {
    return (
      <div
        className={`${dimensionClasses} bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 text-amber-800 border border-amber-200/70 flex items-center justify-center shrink-0 shadow-2xs`}
      >
        <Folder className={`${iconSize} fill-amber-700/20 text-amber-800`} />
      </div>
    );
  }

  return (
    <div
      className={`${dimensionClasses} bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0`}
    >
      <GitFork className={`${iconSize} text-slate-500`} />
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryProductCount(cat: AdminCategoryItem, subcategories: AdminCategoryItem[] = []): number {
  if (typeof cat.productsCount === "number") {
    return cat.productsCount;
  }
  if (typeof cat._count?.products === "number") {
    return cat._count.products;
  }
  if (subcategories.length > 0) {
    return subcategories.reduce((acc, sub) => {
      const subProd = sub.productsCount ?? sub._count?.products ?? 0;
      return acc + subProd;
    }, 0);
  }
  return 0;
}

export default function CategoriesPage() {
  // Data State
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [summary, setSummary] = useState<CategorySummary>({
    totalCategories: 0,
    rootCategoriesCount: 0,
    subcategoriesCount: 0,
    activeCount: 0,
    inactiveCount: 0,
  });

  // UI / View State
  const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "ROOT_ONLY" | "SUB_ONLY">("ALL");
  const [sortBy, setSortBy] = useState<AdminCategorySortEnum>("order_asc");

  // Reordering & Status Toggling loading states per category
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [isSubcategoryMode, setIsSubcategoryMode] = useState(false);
  const [modalParentId, setModalParentId] = useState<string>("");
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Image Upload State in Modal
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const [formImageState, setFormImageState] = useState<
    | { kind: "none" }
    | { kind: "existing"; url: string }
    | { kind: "new_file"; file: File; previewUrl: string }
    | { kind: "new_url"; url: string }
    | { kind: "removed" }
  >({ kind: "none" });

  // Modal Submit / Delete Loading
  const [submittingModal, setSubmittingModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryItem | null>(null);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast Helper
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Categories from Backend
  const fetchCategoriesData = useCallback(
    async (isBackground = false) => {
      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const queryParams = {
          search: debouncedSearch || undefined,
          isActive:
            statusFilter === "ACTIVE"
              ? true
              : statusFilter === "INACTIVE"
              ? false
              : undefined,
          isRoot: levelFilter === "ROOT_ONLY" ? true : undefined,
          parentId: levelFilter === "SUB_ONLY" ? undefined : undefined,
          sort: sortBy,
        };

        const res = await AdminCategoryService.getCategories(queryParams);
        const fetchedList = res?.data?.categories || [];
        setCategories(fetchedList);

        if (res?.data?.summary) {
          setSummary({
            totalCategories: res.data.summary.totalCategories ?? fetchedList.length,
            rootCategoriesCount:
              res.data.summary.rootCategoriesCount ??
              fetchedList.filter((c) => !c.parentId).length,
            subcategoriesCount:
              res.data.summary.subcategoriesCount ??
              res.data.summary.subCategoriesCount ??
              fetchedList.filter((c) => c.parentId).length,
            activeCount:
              res.data.summary.activeCount ??
              fetchedList.filter((c) => c.isActive).length,
            inactiveCount:
              res.data.summary.inactiveCount ??
              fetchedList.filter((c) => !c.isActive).length,
          });
        }

        // Expand root categories by default on initial load
        setExpandedCategoryIds((prev) => {
          if (prev.size > 0) return prev;
          const rootIds = fetchedList.filter((c) => !c.parentId).map((c) => c.id);
          return new Set(rootIds);
        });
      } catch (err: unknown) {
        const msg = AdminCategoryService.extractErrorMessage(err, "Failed to load categories.");
        showToast(msg, "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, statusFilter, levelFilter, sortBy, showToast]
  );

  useEffect(() => {
    fetchCategoriesData();
  }, [fetchCategoriesData]);

  // Root Categories list for parent selection
  const rootCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  // Hierarchical Category Tree Construction
  const categoryTree = useMemo(() => {
    const roots = categories.filter((c) => !c.parentId);
    return roots.map((root) => {
      const subs = categories
        .filter((c) => c.parentId === root.id)
        .sort((a, b) => a.order - b.order);
      return {
        ...root,
        subcategories: subs,
      };
    });
  }, [categories]);

  // Flat Filtered Categories
  const filteredFlatCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (levelFilter === "ROOT_ONLY" && cat.parentId) return false;
      if (levelFilter === "SUB_ONLY" && !cat.parentId) return false;
      return true;
    });
  }, [categories, levelFilter]);

  // Modal Open Handlers
  const handleOpenAdd = (defaultParentId: string = "") => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormOrder(0);
    setFormIsActive(true);
    setModalParentId(defaultParentId);
    setIsSubcategoryMode(Boolean(defaultParentId));
    setSlugManuallyEdited(false);
    setFormImageUrl("");
    setFormImageState({ kind: "none" });
    setUploadMode("file");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (cat: AdminCategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormOrder(cat.order);
    setFormIsActive(cat.isActive);
    setModalParentId(cat.parentId || "");
    setIsSubcategoryMode(Boolean(cat.parentId));
    setSlugManuallyEdited(true);
    setModalError(null);

    if (cat.imageUrl && cat.imageUrl.trim() !== "") {
      setFormImageUrl(cat.imageUrl);
      setFormImageState({ kind: "existing", url: cat.imageUrl });
      setUploadMode("file");
    } else {
      setFormImageUrl("");
      setFormImageState({ kind: "none" });
      setUploadMode("file");
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submittingModal) return;
    setIsModalOpen(false);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!slugManuallyEdited) {
      setFormSlug(slugify(val));
    }
  };

  // Toggle Category Expand/Collapse in Tree Mode
  const toggleExpand = (id: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle Active Status
  const handleToggleStatus = async (cat: AdminCategoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStatusTogglingId(cat.id);

    const nextStatus = !cat.isActive;
    try {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextStatus } : c))
      );
      setSummary((prev) => ({
        ...prev,
        activeCount: nextStatus ? prev.activeCount + 1 : Math.max(0, prev.activeCount - 1),
        inactiveCount: nextStatus ? Math.max(0, prev.inactiveCount - 1) : prev.inactiveCount + 1,
      }));

      await AdminCategoryService.updateStatus(cat.id, nextStatus);
      showToast(
        `Category "${cat.name}" is now ${nextStatus ? "Live" : "Draft"}.`,
        "success"
      );
    } catch (err) {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: cat.isActive } : c))
      );
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to toggle status.");
      showToast(msg, "error");
    } finally {
      setStatusTogglingId(null);
    }
  };

  // Move Order Sequence Up or Down
  const handleMoveOrder = async (cat: AdminCategoryItem, direction: "UP" | "DOWN", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReorderingId(cat.id);

    const sameLevelSiblings = categories
      .filter((c) => c.parentId === cat.parentId)
      .sort((a, b) => a.order - b.order);

    const currentIndex = sameLevelSiblings.findIndex((c) => c.id === cat.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sameLevelSiblings.length) {
      setReorderingId(null);
      return;
    }

    const swapTarget = sameLevelSiblings[targetIndex];
    const itemsToReorder = [
      { id: cat.id, order: swapTarget.order },
      { id: swapTarget.id, order: cat.order },
    ];

    try {
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === cat.id) return { ...c, order: swapTarget.order };
          if (c.id === swapTarget.id) return { ...c, order: cat.order };
          return c;
        })
      );

      await AdminCategoryService.reorderCategories(itemsToReorder);
      showToast(`Reordered "${cat.name}" sequence.`, "success");
    } catch (err) {
      fetchCategoriesData(true);
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to reorder categories.");
      showToast(msg, "error");
    } finally {
      setReorderingId(null);
    }
  };

  // Delete Category
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await AdminCategoryService.deleteCategory(deleteTarget.id, deletePermanent);
      showToast(`Deleted category "${deleteTarget.name}".`, "success");
      setDeleteTarget(null);
      fetchCategoriesData(true);
    } catch (err) {
      const msg = AdminCategoryService.extractErrorMessage(err, "Cannot delete category.");
      showToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  // Submit Modal (Create or Edit)
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Category name is required.");
      return;
    }

    setSubmittingModal(true);
    setModalError(null);

    const finalSlug = formSlug.trim() || slugify(formName);
    const parentId = isSubcategoryMode && modalParentId ? modalParentId : null;

    try {
      let finalImageUrl: string | null = null;
      if (formImageState.kind === "existing") {
        finalImageUrl = formImageState.url;
      } else if (formImageState.kind === "new_url") {
        finalImageUrl = formImageState.url.trim();
      }

      if (editingCategory) {
        const payload: UpdateCategoryDto = {
          name: formName.trim(),
          slug: finalSlug,
          imageUrl: finalImageUrl,
          parentId,
          isActive: formIsActive,
          order: Number(formOrder) || 0,
        };

        await AdminCategoryService.updateCategory(editingCategory.id, payload);
        showToast(`Updated category "${formName.trim()}".`, "success");
      } else {
        const payload: CreateCategoryDto = {
          name: formName.trim(),
          slug: finalSlug,
          imageUrl: finalImageUrl,
          parentId,
          isActive: formIsActive,
          order: Number(formOrder) || 0,
        };

        await AdminCategoryService.createCategory(payload);
        showToast(
          parentId
            ? `Created new subcategory under root!`
            : `Created new root category "${formName.trim()}".`,
          "success"
        );
      }

      handleCloseModal();
      fetchCategoriesData(true);
    } catch (err) {
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to save category.");
      setModalError(msg);
    } finally {
      setSubmittingModal(false);
    }
  };

  const selectedParentInfo = useMemo(() => {
    if (!modalParentId) return null;
    return rootCategories.find((r) => r.id === modalParentId) || null;
  }, [modalParentId, rootCategories]);

  return (
    <div className="space-y-5 sm:space-y-6 w-full min-w-0 pb-20 animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold shadow-2xl animate-fade-in ${
            toast.type === "error"
              ? "bg-rose-600 text-white"
              : toast.type === "info"
              ? "bg-slate-800 text-white"
              : "bg-[#2A241E] text-white"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-rose-200 shrink-0" />
          ) : (
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
              Store Categories & Hierarchy
            </h1>
            {refreshing && (
              <RefreshCw className="h-4 w-4 text-[#FF7A00] animate-spin shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Organize root catalog collections, nested subcategories, and homepage sequence ordering.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchCategoriesData(true)}
            disabled={refreshing || loading}
            className="clay-button h-9 w-9 sm:w-auto p-2 sm:px-3 sm:py-2 text-xs font-bold text-slate-700 hover:text-[#FF7A00] transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            title="Refresh category hierarchy"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleOpenAdd("")}
            className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Create a new top-level parent category"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ New Root Category</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Total Categories
            </span>
            <FolderTree className="h-4 w-4 text-amber-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">
            {summary.totalCategories}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
            Entire catalog structure
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Root Collections
            </span>
            <Layers className="h-4 w-4 text-orange-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#FF7A00] mt-1.5">
            {summary.rootCategoriesCount}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
            Top-level parent categories
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Subcategories
            </span>
            <GitFork className="h-4 w-4 text-sky-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-sky-700 mt-1.5">
            {summary.subcategoriesCount ?? summary.subCategoriesCount ?? 0}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
            Child sub-collections
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Live Visibility
            </span>
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">
            {summary.activeCount}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
            {summary.inactiveCount} drafts hidden
          </p>
        </div>
      </div>

      {/* Control Bar: Search & View Toggle */}
      <div className="clay-card p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category title, slug..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 pl-9 pr-8 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle: Tree vs Flat List */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-[#F8F5F1] p-1 rounded-xl">
              <button
                onClick={() => setViewMode("tree")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "tree"
                    ? "bg-white text-[#2A241E] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FolderTree className="h-3.5 w-3.5 text-orange-600" />
                <span>Tree Hierarchy</span>
              </button>
              <button
                onClick={() => setViewMode("flat")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "flat"
                    ? "bg-white text-[#2A241E] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List className="h-3.5 w-3.5 text-slate-600" />
                <span>Flat List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Display */}
      {loading ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
          <p className="text-xs font-bold text-slate-600">Loading store categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="clay-card p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 text-[#FF7A00] flex items-center justify-center mx-auto">
            <FolderTree className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-fraunces text-base font-bold text-[#2A241E]">No categories found</h3>
            <p className="text-xs text-slate-500">
              Create your first root category to begin building your storefront catalog structure.
            </p>
          </div>
          <button
            onClick={() => handleOpenAdd("")}
            className="clay-btn-orange inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Root Category</span>
          </button>
        </div>
      ) : viewMode === "tree" ? (
        /* TREE HIERARCHY VIEW */
        <div className="space-y-4">
          {categoryTree.map((root) => {
            const isExpanded = expandedCategoryIds.has(root.id);
            const hasSubs = root.subcategories && root.subcategories.length > 0;
            const subCount = root.subcategories?.length || 0;
            const rootProducts = getCategoryProductCount(root, root.subcategories);
            const isStatusToggling = statusTogglingId === root.id;
            const isReordering = reorderingId === root.id;

            return (
              <div
                key={root.id}
                className={`clay-card p-3.5 sm:p-4 transition-all duration-200 space-y-3 ${
                  !root.isActive ? "bg-slate-50/70 opacity-80" : ""
                }`}
              >
                {/* ROOT CARD HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  {/* Left Info Cluster */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Expand/Collapse Chevron */}
                    <button
                      onClick={() => toggleExpand(root.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition shrink-0 cursor-pointer"
                      title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-orange-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Category Thumbnail */}
                    <CategoryThumbnail src={root.imageUrl} alt={root.name} variant="root" size="md" />

                    {/* Title & Metadata */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E] truncate">
                          {root.name}
                        </h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/60 uppercase shrink-0">
                          Root
                        </span>
                      </div>

                      {/* Slug & Counts */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="font-mono text-slate-400 truncate">/{root.slug}</span>
                        <span className="text-slate-300">•</span>
                        {rootProducts > 0 ? (
                          <Link
                            href={`/admin/dashboard/products?category=${root.subcategories?.[0]?.id || root.id}`}
                            className="text-[#FF7A00] hover:underline font-semibold"
                          >
                            {rootProducts} products
                          </Link>
                        ) : (
                          <span className="text-slate-400">0 products</span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-sky-700 font-semibold">
                          {subCount} {subCount === 1 ? "subcategory" : "subcategories"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Bar */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {/* Status Toggle Badge */}
                    <button
                      onClick={(e) => handleToggleStatus(root, e)}
                      disabled={isStatusToggling}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition cursor-pointer flex items-center gap-1.5 border ${
                        root.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                      title="Click to toggle active status"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${root.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      <span>{root.isActive ? "Live" : "Draft"}</span>
                    </button>

                    {/* Order Sequence Up/Down */}
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-600 bg-[#FAF7F2] px-2 py-1 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700">#{root.order}</span>
                      <button
                        onClick={(e) => handleMoveOrder(root, "UP", e)}
                        disabled={isReordering}
                        className="hover:text-orange-600 transition p-0.5 cursor-pointer disabled:opacity-30"
                        title="Move Order Up"
                      >
                        <MoveUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleMoveOrder(root, "DOWN", e)}
                        disabled={isReordering}
                        className="hover:text-orange-600 transition p-0.5 cursor-pointer disabled:opacity-30"
                        title="Move Order Down"
                      >
                        <MoveDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Add Subcategory Button */}
                    <button
                      onClick={() => handleOpenAdd(root.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition cursor-pointer"
                      title={`Add nested subcategory under ${root.name}`}
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>+ Add Subcategory</span>
                    </button>

                    {/* Edit Root */}
                    <button
                      onClick={() => handleOpenEdit(root)}
                      className="clay-button p-2 text-slate-600 hover:text-orange-600 rounded-xl transition cursor-pointer"
                      title="Edit Category Details"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Root */}
                    <button
                      onClick={() => {
                        setDeleteTarget(root);
                        setDeletePermanent(true);
                      }}
                      className="clay-button p-2 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* NESTED SUBCATEGORIES SECTION */}
                {isExpanded && (
                  <div className="ml-3 sm:ml-5 pl-3 sm:pl-4 border-l-2 border-orange-200/80 pt-1 space-y-2 relative">
                    {!hasSubs ? (
                      <div className="py-3 px-4 rounded-xl bg-[#FAF7F2] border border-dashed border-orange-200/80 text-xs text-slate-500 flex items-center justify-between">
                        <span className="font-medium">
                          No subcategories created yet under &ldquo;{root.name}&rdquo;.
                        </span>
                        <button
                          onClick={() => handleOpenAdd(root.id)}
                          className="text-orange-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>+ Add Subcategory</span>
                        </button>
                      </div>
                    ) : (
                      root.subcategories.map((sub) => {
                        const subProducts = sub.productsCount ?? sub._count?.products ?? 0;

                        return (
                          <div
                            key={sub.id}
                            className="p-2.5 rounded-xl bg-[#FAF7F2]/70 hover:bg-[#FAF7F2] border border-slate-200/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <CategoryThumbnail src={sub.imageUrl} alt={sub.name} variant="sub" size="sm" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs sm:text-sm text-[#2A241E] truncate">
                                    {sub.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 truncate">
                                    /{sub.slug}
                                  </span>
                                </div>
                                <div className="text-[10.5px] text-slate-500">
                                  {subProducts} {subProducts === 1 ? "product" : "products"} linked
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={(e) => handleToggleStatus(sub, e)}
                                className={`px-2 py-0.5 text-[9.5px] font-bold rounded-full transition cursor-pointer flex items-center gap-1 border ${
                                  sub.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}
                              >
                                <span>{sub.isActive ? "Live" : "Draft"}</span>
                              </button>

                              <button
                                onClick={() => handleOpenEdit(sub)}
                                className="p-1.5 text-slate-600 hover:text-orange-600 rounded-lg transition cursor-pointer"
                                title="Edit Subcategory"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setDeleteTarget(sub);
                                  setDeletePermanent(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                title="Delete Subcategory"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* FLAT LIST VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredFlatCategories.map((cat) => {
            const isRoot = !cat.parentId;
            return (
              <div key={cat.id} className="clay-card p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-3 min-w-0">
                  <CategoryThumbnail
                    src={cat.imageUrl}
                    alt={cat.name}
                    variant={isRoot ? "root" : "sub"}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-fraunces text-sm font-bold text-[#2A241E] truncate">
                        {cat.name}
                      </h3>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isRoot
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-sky-50 text-sky-700 border border-sky-200"
                        }`}
                      >
                        {isRoot ? "Root" : "Sub"}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 truncate">/{cat.slug}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">#{cat.order}</span>
                  <div className="flex items-center gap-1">
                    {isRoot && (
                      <button
                        onClick={() => handleOpenAdd(cat.id)}
                        className="px-2 py-1 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition cursor-pointer"
                        title="Add Subcategory under this root"
                      >
                        + Add Subcategory
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-600 hover:text-orange-600 rounded-lg transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(cat);
                        setDeletePermanent(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      title="Delete"
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF7A00]">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
                    {editingCategory
                      ? isSubcategoryMode
                        ? "Edit Subcategory"
                        : "Edit Root Category"
                      : isSubcategoryMode && selectedParentInfo
                      ? `New Subcategory under "${selectedParentInfo.name}"`
                      : isSubcategoryMode
                      ? "Create New Subcategory"
                      : "Create New Root Category"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {editingCategory
                      ? "Update collection details and display hierarchy"
                      : "Define title, hierarchy placement, photo, and store visibility."}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={submittingModal}
                className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="space-y-4 text-xs font-medium">
              {/* Category Level Segmented Switch (Root vs Subcategory) */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Category Level Placement</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F8F5F1] border border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubcategoryMode(false);
                      setModalParentId("");
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      !isSubcategoryMode
                        ? "bg-white text-[#2A241E] shadow-2xs border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5 text-amber-700" />
                    <span>Top-Level Root</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSubcategoryMode(true);
                      if (!modalParentId && rootCategories.length > 0) {
                        setModalParentId(rootCategories[0].id);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      isSubcategoryMode
                        ? "bg-white text-[#2A241E] shadow-2xs border border-slate-200/80"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <GitFork className="h-3.5 w-3.5 text-sky-700" />
                    <span>Nested Subcategory</span>
                  </button>
                </div>
              </div>

              {/* Parent Category Dropdown */}
              {isSubcategoryMode && (
                <div className="space-y-1.5 p-3 rounded-xl bg-sky-50/50 border border-sky-200/60 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-bold flex items-center gap-1.5">
                      <Folder className="h-3.5 w-3.5 text-sky-700" />
                      <span>Parent Root Collection *</span>
                    </label>
                    <span className="text-[10.5px] text-slate-500">
                      Subcategory will belong to this parent
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      value={modalParentId}
                      onChange={(e) => setModalParentId(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 p-2.5 pr-8 text-xs font-bold text-slate-800 outline-none focus:border-[#FF7A00] cursor-pointer appearance-none"
                    >
                      {rootCategories.length === 0 ? (
                        <option value="">No root categories exist yet</option>
                      ) : (
                        rootCategories
                          .filter((r) => (editingCategory ? r.id !== editingCategory.id : true))
                          .map((root) => (
                            <option key={root.id} value={root.id}>
                              {root.name}
                            </option>
                          ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Category Name */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Dog Foods, Cat Toys, or Healthcare"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF7A00] transition"
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">URL Slug</label>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Auto-generated from title
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => {
                      setFormSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="dog-foods"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2.5 pl-6 pr-3 text-xs font-mono text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              {/* Category Image */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Category Image URL (Optional)</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => {
                    setFormImageUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setFormImageState({ kind: "new_url", url: e.target.value.trim() });
                    } else {
                      setFormImageState({ kind: "none" });
                    }
                  }}
                  placeholder="https://cdn.kickat.co.in/categories/dog-food.png"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF7A00] transition"
                />
              </div>

              {/* Order Sequence & Status */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Display Order #</label>
                  <input
                    type="number"
                    min="0"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value) || 0)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#FF7A00] transition"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Live on Storefront</span>
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submittingModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="clay-btn-orange inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {submittingModal ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Update Category" : "Save Category"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-50">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
                  Delete Category?
                </h3>
                <p className="text-xs text-slate-500 font-medium">{deleteTarget.name}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-2">
              <p>
                Are you sure you want to delete &ldquo;{deleteTarget.name}&rdquo;? Categories with active products or child subcategories cannot be deleted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
