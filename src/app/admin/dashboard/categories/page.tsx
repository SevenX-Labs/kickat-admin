"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  FolderTree,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Tag,
  ChevronDown,
  ChevronRight,
  GitFork,
  LayoutGrid,
  ListTree,
  RefreshCw,
  AlertTriangle,
  MoveUp,
  MoveDown,
  UploadCloud,
  Folder,
  FolderOpen,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import {
  AdminCategoryItem,
  CategorySummary,
  AdminCategorySortEnum,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/admin-category";
import { AdminCategoryService } from "@/services/adminCategoryService";
import { AdminUploadService } from "@/services/adminUploadService";
import { StatCardsSkeleton } from "@/components/ui/Skeleton";

// Helper to slugify category names
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoriesPage() {
  // Data States
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [summary, setSummary] = useState<CategorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "ROOT" | "SUB">("ALL");
  const [sortBy, setSortBy] = useState<AdminCategorySortEnum>("order_asc");
  const [viewMode, setViewMode] = useState<"TREE" | "GRID">("TREE");

  // Tree View Expand/Collapse State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [isSubcategoryMode, setIsSubcategoryMode] = useState(false);
  const [modalParentId, setModalParentId] = useState<string>("");
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [pendingCategoryFile, setPendingCategoryFile] = useState<File | null>(null);
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Image Upload States
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete & Integrity Protection Dialog States
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryItem | null>(null);
  const [deletePermanent, setDeletePermanent] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [integrityAlert, setIntegrityAlert] = useState<{ title: string; message: string } | null>(null);

  // Status toggle in-flight tracking
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  }, []);

  // Fetch Categories from Remote API
  const fetchCategories = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const res = await AdminCategoryService.getCategories({
        sort: sortBy,
      });

      if (res?.success && res?.data) {
        const fetchedCats = res.data.categories || [];
        setCategories(fetchedCats);
        setSummary(res.data.summary || null);

        // Auto-expand all root nodes in tree view
        const rootIds = fetchedCats.filter((c) => !c.parentId).map((c) => c.id);
        setExpandedNodes(new Set(rootIds));
      }
    } catch (err: unknown) {
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to load categories.");
      showToast(msg, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortBy, showToast]);

  useEffect(() => {
    fetchCategories(true);
  }, [fetchCategories]);

  // Derived Root Categories
  const rootCategories = useMemo(() => {
    return categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.order - b.order);
  }, [categories]);

  // Hierarchical Tree Structure
  const hierarchicalTree = useMemo(() => {
    return rootCategories.map((root) => {
      const children = categories
        .filter((c) => c.parentId === root.id)
        .sort((a, b) => a.order - b.order);
      return {
        ...root,
        subcategories: children,
      };
    });
  }, [categories, rootCategories]);

  // Filtered Categories for Grid & Tree Views
  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        // Status filter
        if (statusFilter === "ACTIVE" && !c.isActive) return false;
        if (statusFilter === "INACTIVE" && c.isActive) return false;

        // Level filter
        if (levelFilter === "ROOT" && c.parentId) return false;
        if (levelFilter === "SUB" && !c.parentId) return false;

        // Search Query filter (matches name, slug, or parent name)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = c.name.toLowerCase().includes(q);
          const slugMatch = c.slug.toLowerCase().includes(q);
          const parentName = c.parent?.name?.toLowerCase() || "";
          const parentMatch = parentName.includes(q);
          return nameMatch || slugMatch || parentMatch;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "order_asc") return a.order - b.order;
        if (sortBy === "order_desc") return b.order - a.order;
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "name_desc") return b.name.localeCompare(a.name);
        if (sortBy === "createdAt_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "createdAt_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return 0;
      });
  }, [categories, searchQuery, statusFilter, levelFilter, sortBy]);

  // Modal Open Handlers
  const handleOpenAdd = (defaultParentId: string = "") => {
    if (formImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formImageUrl);
    }
    setPendingCategoryFile(null);
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormImageUrl("");
    setFormOrder(categories.length > 0 ? Math.max(...categories.map((c) => c.order || 0)) + 1 : 1);
    setFormIsActive(true);
    setModalParentId(defaultParentId);
    setIsSubcategoryMode(Boolean(defaultParentId));
    setSlugManuallyEdited(false);
    setImageUploadError(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategoryItem) => {
    if (formImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formImageUrl);
    }
    setPendingCategoryFile(null);
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormImageUrl(cat.imageUrl || "");
    setFormOrder(cat.order);
    setFormIsActive(cat.isActive);
    setModalParentId(cat.parentId || "");
    setIsSubcategoryMode(Boolean(cat.parentId));
    setSlugManuallyEdited(true);
    setImageUploadError(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Name change automatically generates URL slug if not manually edited
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!slugManuallyEdited) {
      setFormSlug(slugify(val));
    }
  };

  // Image Upload Handlers: Instant local preview, upload deferred until submit
  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please choose a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image size must be under 5MB.");
      return;
    }

    if (formImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formImageUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setPendingCategoryFile(file);
    setFormImageUrl(previewUrl);
    setUploadMode("file");
    setImageUploadError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCloseModal = () => {
    if (formImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formImageUrl);
    }
    setPendingCategoryFile(null);
    setIsModalOpen(false);
  };

  // Submit Modal: Create or Update Category
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Category name is required.");
      return;
    }

    const finalSlug = formSlug.trim() || slugify(formName);
    const parentId = isSubcategoryMode && modalParentId ? modalParentId : null;

    setSubmitting(true);
    setModalError(null);

    try {
      let finalImageUrl: string | null = formImageUrl.trim() || null;

      // Deferred Upload: Only upload image file when clicking final submit
      if (pendingCategoryFile) {
        setIsUploadingImage(true);
        const res = await AdminUploadService.uploadImage(pendingCategoryFile, "categories");
        finalImageUrl = res.url;
        if (formImageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(formImageUrl);
        }
        setPendingCategoryFile(null);
      } else if (formImageUrl.startsWith("blob:")) {
        finalImageUrl = null;
      }

      if (editingCategory) {
        const updatePayload: UpdateCategoryDto = {
          name: formName.trim(),
          slug: finalSlug,
          imageUrl: finalImageUrl,
          parentId,
          order: Number(formOrder),
          isActive: formIsActive,
        };

        const updated = await AdminCategoryService.updateCategory(editingCategory.id, updatePayload);
        showToast(`Category "${updated.name}" updated successfully!`);
      } else {
        const createPayload: CreateCategoryDto = {
          name: formName.trim(),
          slug: finalSlug,
          imageUrl: finalImageUrl,
          parentId,
          order: Number(formOrder),
          isActive: formIsActive,
        };

        const created = await AdminCategoryService.createCategory(createPayload);
        showToast(`Category "${created.name}" created successfully!`);
      }

      setIsModalOpen(false);
      await fetchCategories(false);
    } catch (err: unknown) {
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to save category.");
      setModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (cat: AdminCategoryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setStatusTogglingId(cat.id);
    try {
      const newStatus = !cat.isActive;
      await AdminCategoryService.updateStatus(cat.id, newStatus);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: newStatus } : c))
      );
      showToast(`Category "${cat.name}" is now ${newStatus ? "Active" : "Draft"}.`);
    } catch (err: unknown) {
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to update category status.");
      showToast(msg, "error");
    } finally {
      setStatusTogglingId(null);
    }
  };

  // Reorder Item Display Sequence
  const handleMoveOrder = async (cat: AdminCategoryItem, direction: "UP" | "DOWN", e?: React.MouseEvent) => {
    e?.stopPropagation();
    setReorderingId(cat.id);

    const siblings = categories
      .filter((c) => c.parentId === cat.parentId)
      .sort((a, b) => a.order - b.order);

    const currentIndex = siblings.findIndex((c) => c.id === cat.id);
    if (currentIndex === -1) {
      setReorderingId(null);
      return;
    }

    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) {
      setReorderingId(null);
      return;
    }

    const targetCat = siblings[targetIndex];
    const newItems = [
      { id: cat.id, order: targetCat.order },
      { id: targetCat.id, order: cat.order },
    ];

    try {
      await AdminCategoryService.reorderCategories(newItems);
      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === cat.id) return { ...c, order: targetCat.order };
          if (c.id === targetCat.id) return { ...c, order: cat.order };
          return c;
        })
      );
      showToast(`Reordered "${cat.name}".`);
    } catch (err: unknown) {
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to reorder.");
      showToast(msg, "error");
    } finally {
      setReorderingId(null);
    }
  };

  // Confirm and Execute Delete with Hard-Delete Support
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await AdminCategoryService.deleteCategory(deleteTarget.id, deletePermanent);
      showToast(
        deletePermanent
          ? `Category "${deleteTarget.name}" permanently removed from database.`
          : `Category "${deleteTarget.name}" soft-deleted successfully.`
      );
      setDeleteTarget(null);
      await fetchCategories(false);
    } catch (err: unknown) {
      const msg = AdminCategoryService.extractErrorMessage(
        err,
        "Failed to delete category. Check if active products or child subcategories are linked."
      );

      if (
        msg.toLowerCase().includes("product") ||
        msg.toLowerCase().includes("subcategor") ||
        msg.toLowerCase().includes("child") ||
        msg.toLowerCase().includes("assign")
      ) {
        setIntegrityAlert({
          title: "Category Protected Against Deletion",
          message: msg,
        });
      } else {
        showToast(msg, "error");
      }
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Tree expand/collapse node toggle
  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Quick Starter Templates for Empty State
  const handleQuickTemplate = (name: string) => {
    handleOpenAdd();
    handleNameChange(name);
  };

  const selectedParentInfo = useMemo(() => {
    if (!modalParentId) return null;
    return rootCategories.find((r) => r.id === modalParentId) || null;
  }, [modalParentId, rootCategories]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 pb-16 animate-fade-in">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
              Categories & Hierarchy
            </h1>
            {refreshing && (
              <RefreshCw className="h-4 w-4 text-[#FF7A00] animate-spin shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Organize root collections and nested subcategories for intuitive storefront navigation.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchCategories(false)}
            disabled={refreshing}
            className="clay-button flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh categories"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {loading ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
          {/* Total Categories */}
          <div className="clay-card p-3.5 sm:p-4 flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF7A00]">
              <FolderTree className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E] leading-tight">
                {summary ? summary.totalCategories : categories.length}
              </p>
              <span className="text-[10px] text-slate-500 font-medium truncate block">
                Catalog index
              </span>
            </div>
          </div>

          {/* Root Collections */}
          <div className="clay-card p-3.5 sm:p-4 flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Layers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Root Collections
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E] leading-tight">
                {summary ? summary.rootCategoriesCount : rootCategories.length}
              </p>
              <span className="text-[10px] text-amber-700 font-medium truncate block">
                Top-level navigation
              </span>
            </div>
          </div>

          {/* Subcategories */}
          <div className="clay-card p-3.5 sm:p-4 flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
              <GitFork className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Subcategories
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E] leading-tight">
                {summary
                  ? summary.subcategoriesCount ??
                    summary.subCategoriesCount ??
                    summary.totalCategories - summary.rootCategoriesCount
                  : categories.filter((c) => c.parentId).length}
              </p>
              <span className="text-[10px] text-sky-700 font-medium truncate block">
                Product leaf targets
              </span>
            </div>
          </div>

          {/* Active Live */}
          <div className="clay-card p-3.5 sm:p-4 flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Live in Store
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 leading-tight">
                {summary ? summary.activeCount : categories.filter((c) => c.isActive).length}
              </p>
              <span className="text-[10px] text-slate-400 font-medium truncate block">
                {summary ? summary.inactiveCount : categories.filter((c) => !c.isActive).length} drafts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="clay-card p-3 sm:p-4 space-y-3 min-w-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name, slug, or parent..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7A00] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Controls Right: Status Tabs, View Switcher, Sort */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end shrink-0">
            {/* Status Segmented Pill */}
            <div className="flex items-center rounded-xl bg-[#F8F5F1] p-1 border border-slate-200/70">
              {(
                [
                  { key: "ALL", label: "All" },
                  { key: "ACTIVE", label: "Live" },
                  { key: "INACTIVE", label: "Draft" },
                ] as const
              ).map((st) => (
                <button
                  key={st.key}
                  onClick={() => setStatusFilter(st.key)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    statusFilter === st.key
                      ? "bg-white text-[#2A241E] shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-[#F8F5F1] p-1 border border-slate-200/70">
              <button
                onClick={() => setViewMode("TREE")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "TREE"
                    ? "bg-white text-[#2A241E] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Hierarchy Tree View"
              >
                <ListTree className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tree</span>
              </button>

              <button
                onClick={() => setViewMode("GRID")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "GRID"
                    ? "bg-white text-[#2A241E] shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as AdminCategorySortEnum)}
                className="rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-1.5 pl-3 pr-7 text-xs font-bold text-slate-700 outline-none focus:bg-white cursor-pointer appearance-none"
              >
                <option value="order_asc">Display Order (Asc)</option>
                <option value="order_desc">Display Order (Desc)</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="createdAt_desc">Newest First</option>
                <option value="createdAt_asc">Oldest First</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tree mode controls: Expand/Collapse All + Level filter */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Filter Level:
            </span>
            {(
              [
                { key: "ALL", label: "All Levels" },
                { key: "ROOT", label: "Roots Only" },
                { key: "SUB", label: "Subcategories Only" },
              ] as const
            ).map((lv) => (
              <button
                key={lv.key}
                onClick={() => setLevelFilter(lv.key)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  levelFilter === lv.key
                    ? "bg-[#2A241E] text-white"
                    : "bg-[#F8F5F1] text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {lv.label}
              </button>
            ))}
          </div>

          {viewMode === "TREE" && hierarchicalTree.length > 0 && (
            <button
              onClick={() => {
                if (expandedNodes.size > 0) {
                  setExpandedNodes(new Set());
                } else {
                  setExpandedNodes(new Set(categories.map((c) => c.id)));
                }
              }}
              className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
            >
              {expandedNodes.size > 0 ? "Collapse All Branches" : "Expand All Branches"}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {categories.length === 0 ? (
        /* Empty State */
        <div className="clay-card p-10 sm:p-14 text-center space-y-5 max-w-lg mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-[#FF7A00] mx-auto shadow-xs">
            <FolderTree className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-fraunces text-xl font-bold text-[#2A241E]">
              Build Your Product Category Tree
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
              Create root collections like <strong className="text-slate-700">Dog</strong> or{" "}
              <strong className="text-slate-700">Cat</strong>, then add nested subcategories like{" "}
              <strong className="text-slate-700">Dog Foods</strong> to organize your catalog.
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={() => handleOpenAdd()}
              className="clay-btn-orange inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Create First Category</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Or quick-start with a recommended collection:
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["Dog", "Cat", "Pet Accessories", "Healthcare"].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleQuickTemplate(name)}
                  className="px-3 py-1 rounded-lg bg-[#FAF7F2] border border-slate-200/80 text-xs font-bold text-slate-700 hover:border-[#FF7A00] hover:text-[#FF7A00] transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : filteredCategories.length === 0 ? (
        /* No Search / Filter Matches */
        <div className="clay-card p-10 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
            No matching categories found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No categories match your search &ldquo;{searchQuery}&rdquo; or filter selections.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
              setLevelFilter("ALL");
            }}
            className="clay-button px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "TREE" ? (
        /* HIERARCHY TREE VIEW */
        <div className="space-y-3.5">
          {hierarchicalTree.map((root) => {
            const isExpanded = expandedNodes.has(root.id);
            const hasSubs = root.subcategories && root.subcategories.length > 0;
            const isStatusToggling = statusTogglingId === root.id;
            const isReordering = reorderingId === root.id;

            return (
              <div
                key={root.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 space-y-3 shadow-xs transition-all hover:border-slate-300"
              >
                {/* Root Node Header Row */}
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  {/* Left: Expander + Root Info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      onClick={() => toggleNode(root.id)}
                      className="clay-button flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:text-orange-600 transition shrink-0 cursor-pointer"
                      title={isExpanded ? "Collapse branch" : "Expand branch"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Thumbnail or Initial Avatar */}
                    {root.imageUrl ? (
                      <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={root.imageUrl}
                          alt={root.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black text-sm shrink-0">
                        {isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[#2A241E] leading-tight truncate">
                          {root.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          /{root.slug}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 uppercase">
                          Root Collection
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                        <span>{root._count?.products ?? 0} products linked</span>
                        <span>•</span>
                        <span className="text-sky-700 font-semibold">
                          {root.subcategories?.length || 0} subcategories
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Toggle, Order, Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Live / Draft Toggle Switch */}
                    <button
                      onClick={(e) => handleToggleStatus(root, e)}
                      disabled={isStatusToggling}
                      className={`px-2.5 py-1 text-[10.5px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                        root.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      }`}
                      title="Click to toggle store visibility"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          root.isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{root.isActive ? "Live" : "Draft"}</span>
                    </button>

                    {/* Sequence Order */}
                    <div className="flex items-center gap-1 text-xs font-mono text-slate-500 bg-[#FAF7F2] px-2 py-1 rounded-lg border border-slate-200/70">
                      <span className="font-bold text-slate-700">#{root.order}</span>
                      <button
                        onClick={(e) => handleMoveOrder(root, "UP", e)}
                        disabled={isReordering}
                        className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleMoveOrder(root, "DOWN", e)}
                        disabled={isReordering}
                        className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Add Subcategory under this Root */}
                    <button
                      onClick={() => handleOpenAdd(root.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200/80 transition cursor-pointer"
                      title="Add child subcategory under this root"
                    >
                      <Plus className="h-3 w-3 stroke-[2.5]" />
                      <span className="hidden md:inline">Subcategory</span>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEdit(root)}
                      className="clay-button p-2 text-slate-600 hover:text-orange-600 rounded-lg transition cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(root)}
                      className="clay-button p-2 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subcategories Container */}
                {isExpanded && (
                  <div className="pl-4 sm:pl-7 pt-2 border-l-2 border-orange-200 ml-3.5 space-y-2">
                    {!hasSubs ? (
                      <div className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] border border-dashed border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                        <span>No subcategories created yet under &ldquo;{root.name}&rdquo;.</span>
                        <button
                          onClick={() => handleOpenAdd(root.id)}
                          className="text-orange-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add first subcategory</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        {root.subcategories.map((sub) => {
                          const isSubStatusToggling = statusTogglingId === sub.id;
                          const isSubReordering = reorderingId === sub.id;

                          return (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAF7F2] border border-slate-200/70 shadow-2xs hover:border-orange-300 transition-all"
                            >
                              {/* Sub Info */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="text-slate-300 text-xs select-none">↳</span>

                                {sub.imageUrl ? (
                                  <div className="h-7 w-7 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={sub.imageUrl}
                                      alt={sub.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs shrink-0">
                                    <Tag className="h-3 w-3" />
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-[#2A241E] truncate">
                                      {sub.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                      /{sub.slug}
                                    </span>
                                  </div>
                                  <span className="text-[10.5px] text-slate-400 font-medium block">
                                    {sub._count?.products ?? 0} products linked
                                  </span>
                                </div>
                              </div>

                              {/* Sub Actions */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Sub Live/Draft Toggle */}
                                <button
                                  onClick={(e) => handleToggleStatus(sub, e)}
                                  disabled={isSubStatusToggling}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition cursor-pointer flex items-center gap-1 ${
                                    sub.isActive
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-slate-200 text-slate-600 border border-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      sub.isActive ? "bg-emerald-500" : "bg-slate-400"
                                    }`}
                                  />
                                  <span>{sub.isActive ? "Live" : "Draft"}</span>
                                </button>

                                {/* Sequence */}
                                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  <span>#{sub.order}</span>
                                  <button
                                    onClick={(e) => handleMoveOrder(sub, "UP", e)}
                                    disabled={isSubReordering}
                                    className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <MoveUp className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleMoveOrder(sub, "DOWN", e)}
                                    disabled={isSubReordering}
                                    className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <MoveDown className="h-2.5 w-2.5" />
                                  </button>
                                </div>

                                {/* Edit */}
                                <button
                                  onClick={() => handleOpenEdit(sub)}
                                  className="p-1.5 text-slate-500 hover:text-orange-600 transition cursor-pointer"
                                  title="Edit Subcategory"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => setDeleteTarget(sub)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                  title="Delete Subcategory"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Dashed Add Subcategory shortcut card */}
                        <button
                          type="button"
                          onClick={() => handleOpenAdd(root.id)}
                          className="w-full py-2 px-3 rounded-xl border border-dashed border-orange-300/80 bg-orange-50/40 text-orange-700 hover:bg-orange-50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Subcategory under {root.name}</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
          {filteredCategories.map((cat) => {
            const isRoot = !cat.parentId;
            const isStatusToggling = statusTogglingId === cat.id;
            const isReordering = reorderingId === cat.id;

            return (
              <div
                key={cat.id}
                className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 hover:scale-[1.01] transition-all relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    {/* Visual */}
                    {cat.imageUrl ? (
                      <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white font-black text-base shadow-xs ${
                          isRoot
                            ? "bg-gradient-to-br from-amber-500 to-orange-600"
                            : "bg-gradient-to-br from-sky-500 to-indigo-600"
                        }`}
                      >
                        {isRoot ? <Folder className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {isRoot ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200/80 uppercase">
                            Root
                          </span>
                        ) : (
                          <span
                            className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 uppercase truncate max-w-[130px]"
                            title={`Parent: ${cat.parent?.name || ""}`}
                          >
                            ↳ {cat.parent?.name || "Subcategory"}
                          </span>
                        )}

                        <button
                          onClick={(e) => handleToggleStatus(cat, e)}
                          disabled={isStatusToggling}
                          className={`px-2 py-0.5 text-[10.5px] font-bold rounded-full transition cursor-pointer flex items-center gap-1 ${
                            cat.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              cat.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{cat.isActive ? "Live" : "Draft"}</span>
                        </button>
                      </div>

                      {/* Display Index */}
                      <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200/50">
                        <span className="font-bold text-slate-600">#{cat.order}</span>
                        <button
                          onClick={(e) => handleMoveOrder(cat, "UP", e)}
                          disabled={isReordering}
                          className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleMoveOrder(cat, "DOWN", e)}
                          disabled={isReordering}
                          className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Title & Slug */}
                  <div className="mt-3 space-y-1">
                    <h3 className="font-bold text-base text-[#2A241E] leading-tight truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate">
                      /{cat.slug}
                    </p>
                  </div>
                </div>

                {/* Card Bottom Meta & Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {cat._count?.products ?? 0} products
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isRoot && (
                      <button
                        onClick={() => handleOpenAdd(cat.id)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                        title="Add Subcategory"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-600 hover:text-orange-600 rounded-lg transition cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      title="Delete Category"
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

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div
            className="clay-card w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF7A00]">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
                    {editingCategory
                      ? "Edit Category"
                      : isSubcategoryMode && selectedParentInfo
                      ? `New Subcategory under ${selectedParentInfo.name}`
                      : "Create Category"}
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
                className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error banner */}
            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
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

              {/* Parent Category Dropdown (Shown when Subcategory mode is active) */}
              {isSubcategoryMode && (
                <div className="space-y-1.5 p-3 rounded-xl bg-sky-50/50 border border-sky-200/60 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-bold flex items-center gap-1.5">
                      <Folder className="h-3.5 w-3.5 text-sky-700" />
                      <span>Parent Root Collection *</span>
                    </label>
                    <span className="text-[10.5px] text-slate-500">
                      Product subcategory will belong here
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
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7A00] transition"
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
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2.5 pl-6 pr-3 text-xs font-mono text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF7A00]"
                  />
                </div>
              </div>

              {/* Category Image Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Category Image</label>
                  <div className="flex items-center gap-1.5 text-[11px] bg-slate-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode("file");
                        setImageUploadError(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                        uploadMode === "file"
                          ? "bg-white text-orange-600 shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMode("url");
                        setImageUploadError(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                        uploadMode === "url"
                          ? "bg-white text-orange-600 shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {uploadMode === "file" ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!formImageUrl && !isUploadingImage) {
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`relative rounded-2xl border-2 border-dashed p-4 text-center transition-all select-none group ${
                      !formImageUrl
                        ? "cursor-pointer hover:border-[#FF7A00] hover:bg-orange-50/30"
                        : "border-slate-200 bg-[#F8F5F1]"
                    } ${
                      dragOver
                        ? "!border-[#FF7A00] !bg-orange-50/60"
                        : ""
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {formImageUrl ? (
                      <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formImageUrl}
                              alt="Category Preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 text-left">
                            <span className="font-bold text-xs text-slate-800 truncate block">
                              Photo Attached
                            </span>
                            <span className="text-[10px] text-emerald-600 font-semibold block">
                              Ready for save
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (formImageUrl.startsWith("blob:")) {
                                URL.revokeObjectURL(formImageUrl);
                              }
                              setPendingCategoryFile(null);
                              setFormImageUrl("");
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 space-y-1.5 pointer-events-none">
                        <div className="flex justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-[#FF7A00] shadow-2xs group-hover:scale-105 transition-transform">
                            {isUploadingImage ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <UploadCloud className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-700">
                          <span className="font-bold text-[#FF7A00]">Click to upload</span>{" "}
                          <span className="text-slate-500">or drag and drop</span>
                        </div>
                        <p className="text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://example.com/category-image.jpg"
                      className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#FF7A00]"
                    />
                    {formImageUrl && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200">
                        <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formImageUrl}
                            alt="URL Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-xs text-slate-600 truncate flex-1 font-mono text-[11px]">
                          {formImageUrl}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormImageUrl("")}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {imageUploadError && (
                  <p className="text-[10.5px] font-medium text-rose-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{imageUploadError}</span>
                  </p>
                )}
              </div>

              {/* Order & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Display Order Sequence</label>
                  <input
                    type="number"
                    min={0}
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#FF7A00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Store Visibility</label>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formIsActive ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          formIsActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-700">
                      {formIsActive ? "Live in Store" : "Draft (Hidden)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting || isUploadingImage}
                  className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploadingImage}
                  className="clay-btn-orange inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {(submitting || isUploadingImage) && (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div
            className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shrink-0 shadow-xs">
                <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  Delete Category?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-800">&ldquo;{deleteTarget.name}&rdquo;</strong>?
                </p>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60 mt-2 font-medium">
                  Integrity note: The backend prevents deletion if active products or child subcategories are linked.
                </p>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none pt-2">
                  <input
                    type="checkbox"
                    checked={deletePermanent}
                    onChange={(e) => setDeletePermanent(e.target.checked)}
                    className="h-4 w-4 rounded accent-rose-600 cursor-pointer"
                  />
                  <span className="font-semibold text-rose-700">
                    Permanently delete from database (Hard Delete)
                  </span>
                </label>
                <p className="text-[10.5px] text-slate-400 pl-6">
                  Checked by default to completely purge the row from the database. Uncheck for soft-delete.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Yes, Delete Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTEGRITY ALERT DIALOG (400 PROTECTION MESSAGE) */}
      {integrityAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div
            className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shrink-0 shadow-xs">
                <AlertCircle className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  {integrityAlert.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {integrityAlert.message}
                </p>
                <p className="text-[11px] text-slate-400 pt-1">
                  Please reassign or remove existing products / subcategories before deleting this collection.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIntegrityAlert(null)}
                className="clay-btn-orange px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer hover:brightness-105 transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
