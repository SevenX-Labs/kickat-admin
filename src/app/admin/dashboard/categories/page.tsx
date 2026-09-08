"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FolderTree,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Check,
  Tag,
  ArrowRight,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GitFork,
  LayoutGrid,
  ListTree,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  HelpCircle,
  AlertTriangle,
  MoveUp,
  MoveDown,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import {
  AdminCategoryItem,
  CategorySummary,
  AdminCategorySortEnum,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/admin-category";
import { AdminCategoryService } from "@/services/adminCategoryService";
import { AdminUploadService } from "@/services/adminUploadService";
import { StatCardsSkeleton, Skeleton } from "@/components/ui/Skeleton";

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
  const [viewMode, setViewMode] = useState<"GRID" | "TREE">("GRID");

  // Tree View Expand/Collapse State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [modalParentId, setModalParentId] = useState<string>("");
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
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
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Delete & Integrity Protection Dialog States
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryItem | null>(null);
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
        const rootIds = fetchedCats.filter(c => !c.parentId).map(c => c.id);
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

  // Root Categories list for parent selection in Create/Edit
  const rootCategories = useMemo(() => {
    return categories.filter(c => !c.parentId);
  }, [categories]);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!slugManuallyEdited) {
      setFormSlug(generateSlug(val));
    }
  };

  // Open Add Category Modal
  const handleOpenAdd = (defaultParentId: string = "") => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormImageUrl("");
    setImageUploadError(null);
    setIsUploadingImage(false);
    setUploadMode("file");
    // Next order index
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.order || 0), 0);
    setFormOrder(maxOrder + 1);
    setFormIsActive(true);
    setModalParentId(defaultParentId);
    setSlugManuallyEdited(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEdit = (cat: AdminCategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormImageUrl(cat.imageUrl || "");
    setImageUploadError(null);
    setIsUploadingImage(false);
    setUploadMode("file");
    setFormOrder(cat.order);
    setFormIsActive(cat.isActive);
    setModalParentId(cat.parentId || "");
    setSlugManuallyEdited(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Upload Category Image
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError("Image size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const res = await AdminUploadService.uploadImage(file, "categories");
      setFormImageUrl(res.url);
      showToast("Category image uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      setImageUploadError(err?.message || "Failed to upload image. Please try again or paste an Image URL.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Submit Create or Edit Form
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Category name is required.");
      return;
    }

    const finalSlug = formSlug.trim() || generateSlug(formName);
    const parentId = modalParentId ? modalParentId : null;

    setSubmitting(true);
    setModalError(null);

    try {
      if (editingCategory) {
        // Update Category Details
        const updatePayload: UpdateCategoryDto = {
          name: formName.trim(),
          slug: finalSlug,
          imageUrl: formImageUrl.trim() || null,
          parentId,
          order: Number(formOrder),
          isActive: formIsActive,
        };

        const updated = await AdminCategoryService.updateCategory(editingCategory.id, updatePayload);
        showToast(`Category "${updated.name}" updated successfully!`);
      } else {
        // Create Category
        const createPayload: CreateCategoryDto = {
          name: formName.trim(),
          slug: finalSlug,
          imageUrl: formImageUrl.trim() || null,
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
    if (e) e.stopPropagation();
    const nextStatus = !cat.isActive;
    setStatusTogglingId(cat.id);

    // Optimistic UI update
    setCategories(prev =>
      prev.map(c => (c.id === cat.id ? { ...c, isActive: nextStatus } : c))
    );

    try {
      await AdminCategoryService.updateStatus(cat.id, nextStatus);
      showToast(`"${cat.name}" ${nextStatus ? "activated" : "deactivated"}.`);
      if (summary) {
        setSummary({
          ...summary,
          activeCount: summary.activeCount + (nextStatus ? 1 : -1),
          inactiveCount: summary.inactiveCount + (nextStatus ? -1 : 1),
        });
      }
    } catch (err: unknown) {
      // Revert optimistic update
      setCategories(prev =>
        prev.map(c => (c.id === cat.id ? { ...c, isActive: cat.isActive } : c))
      );
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to update status.");
      showToast(msg, "error");
    } finally {
      setStatusTogglingId(null);
    }
  };

  // Quick Reorder (Move Up / Move Down within same parent level)
  const handleMoveOrder = async (cat: AdminCategoryItem, direction: "UP" | "DOWN", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Sibling categories sharing the same parent
    const siblings = categories
      .filter(c => (c.parentId || null) === (cat.parentId || null))
      .sort((a, b) => a.order - b.order);

    const currentIndex = siblings.findIndex(s => s.id === cat.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const otherCat = siblings[targetIndex];
    setReorderingId(cat.id);

    // Swap order values
    const newCatOrder = otherCat.order;
    const newOtherOrder = cat.order === otherCat.order 
      ? (direction === "UP" ? otherCat.order - 1 : otherCat.order + 1)
      : cat.order;

    const reorderPayload = [
      { id: cat.id, order: newCatOrder },
      { id: otherCat.id, order: newOtherOrder },
    ];

    // Optimistic update
    setCategories(prev =>
      prev.map(c => {
        if (c.id === cat.id) return { ...c, order: newCatOrder };
        if (c.id === otherCat.id) return { ...c, order: newOtherOrder };
        return c;
      })
    );

    try {
      await AdminCategoryService.reorderCategories(reorderPayload);
      showToast(`Updated display sequence.`);
    } catch (err: unknown) {
      const msg = AdminCategoryService.extractErrorMessage(err, "Failed to reorder categories.");
      showToast(msg, "error");
      fetchCategories(false);
    } finally {
      setReorderingId(null);
    }
  };

  // Confirm and Execute Delete with Integrity Protections
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await AdminCategoryService.deleteCategory(deleteTarget.id);
      showToast(`Category "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      await fetchCategories(false);
    } catch (err: unknown) {
      const msg = AdminCategoryService.extractErrorMessage(
        err,
        "Failed to delete category. Check if active products or child subcategories are linked."
      );

      // Check if it's an integrity violation (active products or child subcategories)
      if (
        msg.toLowerCase().includes("product") ||
        msg.toLowerCase().includes("subcategor") ||
        msg.toLowerCase().includes("child") ||
        msg.toLowerCase().includes("assign")
      ) {
        setDeleteTarget(null);
        setIntegrityAlert({
          title: "Cannot Delete Category",
          message: msg,
        });
      } else {
        showToast(msg, "error");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Node in Tree
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Filtered and Sorted Categories for Grid View
  const filteredCategories = useMemo(() => {
    return categories
      .filter(cat => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = cat.name.toLowerCase().includes(q);
          const matchesSlug = cat.slug.toLowerCase().includes(q);
          const matchesParent = cat.parent?.name.toLowerCase().includes(q);
          if (!matchesName && !matchesSlug && !matchesParent) return false;
        }

        // Status Filter
        if (statusFilter === "ACTIVE" && !cat.isActive) return false;
        if (statusFilter === "INACTIVE" && cat.isActive) return false;

        // Level Filter
        if (levelFilter === "ROOT" && cat.parentId !== null && cat.parentId !== undefined) return false;
        if (levelFilter === "SUB" && (!cat.parentId)) return false;

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

  // Hierarchical Tree Structure
  const hierarchicalTree = useMemo(() => {
    const rootNodes = categories.filter(c => !c.parentId).sort((a, b) => a.order - b.order);
    return rootNodes.map(root => {
      const children = categories
        .filter(c => c.parentId === root.id)
        .sort((a, b) => a.order - b.order);
      return {
        ...root,
        subcategories: children,
      };
    });
  }, [categories]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 pb-12 animate-fade-in">
      
      {/* =========================================================
          TOAST ALERT
          ========================================================= */}
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

      {/* =========================================================
          PAGE HEADER
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
              Category Management
            </h1>
            {refreshing && (
              <RefreshCw className="h-4 w-4 text-orange-500 animate-spin shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Manage e-commerce root collections, nested subcategories, display hierarchy &amp; store visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
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
            className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TOP STAT CARDS (REAL API DATA)
          ========================================================= */}
      {loading ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 w-full min-w-0">
          
          {/* Card 1: Total Categories */}
          <div className="clay-card p-3.5 sm:p-4.5 flex flex-col justify-between min-w-0 relative overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="flex items-center justify-between gap-1 text-slate-500">
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                Total Categories
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B72F0] to-[#4F46E5] text-white shadow-xs">
                <FolderTree className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-black text-[#2A241E] whitespace-nowrap overflow-visible">
                {summary ? summary.totalCategories : categories.length}
              </p>
              <p className="text-[10.5px] font-semibold text-indigo-600 mt-0.5 truncate">
                Full store catalog index
              </p>
            </div>
          </div>

          {/* Card 2: Root Categories */}
          <div className="clay-card p-3.5 sm:p-4.5 flex flex-col justify-between min-w-0 relative overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="flex items-center justify-between gap-1 text-slate-500">
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                Root Collections
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8C38] to-[#EA580C] text-white shadow-xs">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-black text-[#2A241E] whitespace-nowrap overflow-visible">
                {summary ? summary.rootCategoriesCount : rootCategories.length}
              </p>
              <p className="text-[10.5px] font-semibold text-orange-600 mt-0.5 truncate">
                Primary navigation hubs
              </p>
            </div>
          </div>

          {/* Card 3: Subcategories */}
          <div className="clay-card p-3.5 sm:p-4.5 flex flex-col justify-between min-w-0 relative overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="flex items-center justify-between gap-1 text-slate-500">
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                Subcategories
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white shadow-xs">
                <GitFork className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-black text-[#2A241E] whitespace-nowrap overflow-visible">
                {summary 
                  ? (summary.subcategoriesCount ?? summary.subCategoriesCount ?? (summary.totalCategories - summary.rootCategoriesCount))
                  : categories.filter(c => c.parentId).length}
              </p>
              <p className="text-[10.5px] font-semibold text-sky-600 mt-0.5 truncate">
                Targeted niche collections
              </p>
            </div>
          </div>

          {/* Card 4: Active Status */}
          <div className="clay-card p-3.5 sm:p-4.5 flex flex-col justify-between min-w-0 relative overflow-hidden group hover:scale-[1.01] transition-all">
            <div className="flex items-center justify-between gap-1 text-slate-500">
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                Active in Store
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#34D399] to-[#059669] text-white shadow-xs">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 whitespace-nowrap overflow-visible">
                {summary ? summary.activeCount : categories.filter(c => c.isActive).length}
              </p>
              <p className="text-[10.5px] font-semibold text-slate-400 mt-0.5 truncate">
                {summary ? summary.inactiveCount : categories.filter(c => !c.isActive).length} currently inactive
              </p>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================
          CONTROLS TOOLBAR & FILTERS
          ========================================================= */}
      <div className="clay-card p-3.5 sm:p-4 space-y-3.5 min-w-0">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name, slug, or parent..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* View Mode & Sort Row */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end shrink-0">
            
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl bg-[#EFE9E1] p-1 shadow-inner">
              <button
                onClick={() => setViewMode("GRID")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "GRID"
                    ? "bg-white text-[#2A241E] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Grid Cards</span>
              </button>

              <button
                onClick={() => setViewMode("TREE")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "TREE"
                    ? "bg-white text-[#2A241E] shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <ListTree className="h-3.5 w-3.5" />
                <span>Hierarchy Tree</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as AdminCategorySortEnum)}
                className="rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 cursor-pointer appearance-none"
              >
                <option value="order_asc">Sort: Display Order (Asc)</option>
                <option value="order_desc">Sort: Display Order (Desc)</option>
                <option value="name_asc">Sort: Name (A to Z)</option>
                <option value="name_desc">Sort: Name (Z to A)</option>
                <option value="createdAt_desc">Sort: Newest First</option>
                <option value="createdAt_asc">Sort: Oldest First</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-slate-100">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono-eyebrow shrink-0 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Status:
            </span>
            {(
              [
                { key: "ALL", label: "All Status" },
                { key: "ACTIVE", label: "Active Only" },
                { key: "INACTIVE", label: "Inactive Only" },
              ] as const
            ).map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition cursor-pointer ${
                  statusFilter === st.key
                    ? "bg-[#2A241E] text-white shadow-xs"
                    : "bg-[#F8F5F1] text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono-eyebrow shrink-0 mr-1">
              Level:
            </span>
            {(
              [
                { key: "ALL", label: "All Levels" },
                { key: "ROOT", label: "Root Collections Only" },
                { key: "SUB", label: "Subcategories Only" },
              ] as const
            ).map((lv) => (
              <button
                key={lv.key}
                onClick={() => setLevelFilter(lv.key)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shrink-0 transition cursor-pointer ${
                  levelFilter === lv.key
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-[#F8F5F1] text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {lv.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* =========================================================
          MAIN PRESENTATION: GRID VIEW OR TREE VIEW
          ========================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="clay-card p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-8 w-16 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        // Empty State: No categories in store
        <div className="clay-card p-10 sm:p-14 text-center space-y-4 max-w-lg mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 text-white text-3xl mx-auto shadow-md">
            🐾
          </div>
          <div className="space-y-1">
            <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#2A241E]">
              No categories created yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Create root collections like &ldquo;Dog Food&rdquo;, &ldquo;Cat Treats&rdquo; or subcategories to organize your store catalog.
            </p>
          </div>
          <button
            onClick={() => handleOpenAdd()}
            className="clay-btn-orange inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md cursor-pointer hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Create First Category</span>
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        // ==========================================
        // 1. GRID CARDS VIEW
        // ==========================================
        filteredCategories.length === 0 ? (
          <div className="clay-card p-10 text-center space-y-3">
            <div className="text-3xl">🔍</div>
            <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
              No matching categories
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
              className="clay-button px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
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
                    {/* Card Top: Image/Avatar, Badges, Order Controls */}
                    <div className="flex items-start justify-between gap-2.5">
                      
                      {/* Category Visual */}
                      <div className="relative shrink-0">
                        {cat.imageUrl ? (
                          <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback icon on broken image
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white font-black text-lg shadow-xs ${
                            isRoot 
                              ? "bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C]" 
                              : "bg-gradient-to-br from-[#38BDF8] via-[#0EA5E9] to-[#0284C7]"
                          }`}>
                            {cat.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Right Meta Badges */}
                      <div className="flex flex-col items-end gap-1.5">
                        
                        {/* Root vs Sub Badge */}
                        <div className="flex items-center gap-1.5">
                          {isRoot ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-orange-50 text-orange-700 border border-orange-200/80 uppercase font-mono-eyebrow">
                              Root
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-sky-50 text-sky-700 border border-sky-200/80 uppercase font-mono-eyebrow truncate max-w-[140px]" title={`Parent: ${cat.parent?.name || "Parent Category"}`}>
                              ↳ {cat.parent?.name || "Subcategory"}
                            </span>
                          )}

                          {/* Active / Inactive Pill */}
                          <button
                            onClick={(e) => handleToggleStatus(cat, e)}
                            disabled={isStatusToggling}
                            className={`px-2 py-0.5 text-[10.5px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                              cat.isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                            }`}
                            title="Click to toggle active status"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${cat.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                            <span>{cat.isActive ? "Active" : "Inactive"}</span>
                          </button>
                        </div>

                        {/* Display Sequence Index */}
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200/50">
                          <span className="font-bold text-slate-600">#{cat.order}</span>
                          <button
                            onClick={(e) => handleMoveOrder(cat, "UP", e)}
                            disabled={isReordering}
                            title="Move Up"
                            className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                          >
                            <MoveUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => handleMoveOrder(cat, "DOWN", e)}
                            disabled={isReordering}
                            title="Move Down"
                            className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                          >
                            <MoveDown className="h-3 w-3" />
                          </button>
                        </div>

                      </div>

                    </div>

                    {/* Title & Slug */}
                    <div className="mt-3.5 space-y-1">
                      <h3 className="font-fraunces text-base font-bold text-[#2A241E] leading-tight truncate" title={cat.name}>
                        {cat.name}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono font-medium truncate">
                        <Tag className="h-3 w-3 shrink-0" />
                        <span className="truncate">/{cat.slug}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Counts & Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100/90 space-y-3">
                    
                    {/* Metrics row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium">Assigned Products:</span>
                      </div>
                      <span className="font-extrabold text-slate-800">
                        {cat._count?.products ?? 0} items
                      </span>
                    </div>

                    {isRoot && (
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <GitFork className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium">Subcategories:</span>
                        </div>
                        <span className="font-bold text-sky-700">
                          {cat._count?.subcategories ?? 0} branches
                        </span>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      
                      {/* Add Subcategory shortcut (for root categories) */}
                      {isRoot ? (
                        <button
                          onClick={() => handleOpenAdd(cat.id)}
                          className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Subcategory</span>
                        </button>
                      ) : (
                        <span className="text-[10.5px] text-slate-400 font-medium">Sub-collection</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="clay-button p-2 text-slate-600 hover:text-indigo-600 transition rounded-xl cursor-pointer"
                          title="Edit Category Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="clay-button p-2 text-slate-400 hover:text-rose-600 transition rounded-xl cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )
      ) : (
        // ==========================================
        // 2. HIERARCHICAL TREE VIEW
        // ==========================================
        <div className="clay-card p-4 sm:p-6 space-y-3 min-w-0">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                Category Tree Hierarchy
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Explore parent-child relationships and nested navigation branches.
              </p>
            </div>
            <button
              onClick={() => {
                if (expandedNodes.size > 0) {
                  setExpandedNodes(new Set());
                } else {
                  setExpandedNodes(new Set(categories.map(c => c.id)));
                }
              }}
              className="clay-button px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
            >
              {expandedNodes.size > 0 ? "Collapse All" : "Expand All"}
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {hierarchicalTree.map((root) => {
              const isExpanded = expandedNodes.has(root.id);
              const hasSubs = root.subcategories && root.subcategories.length > 0;

              return (
                <div 
                  key={root.id}
                  className="rounded-2xl border border-slate-200/80 bg-[#FAF7F2] p-3.5 sm:p-4 space-y-3 transition-all"
                >
                  {/* Root Node Row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                    
                    {/* Left: Expander + Root Title */}
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleNode(root.id)}
                        className="clay-button flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:text-orange-600 transition shrink-0 cursor-pointer"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF8C38] to-[#EA580C] text-white font-black text-sm shrink-0 shadow-xs">
                        {root.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-[#2A241E] leading-tight truncate">
                            {root.name}
                          </h4>
                          <span className="text-[10px] font-mono font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            /{root.slug}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                          <span>{root._count?.products ?? 0} products</span>
                          <span>•</span>
                          <span className="text-sky-700 font-bold">{root.subcategories?.length || 0} subcategories</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Status */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Active Status Pill */}
                      <button
                        onClick={() => handleToggleStatus(root)}
                        className={`px-2.5 py-1 text-[10.5px] font-bold rounded-full transition-all cursor-pointer ${
                          root.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {root.isActive ? "Active" : "Inactive"}
                      </button>

                      {/* Order Index */}
                      <div className="flex items-center gap-1 text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-700">#{root.order}</span>
                        <button
                          onClick={() => handleMoveOrder(root, "UP")}
                          className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                          title="Move Up"
                        >
                          <MoveUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(root, "DOWN")}
                          className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                          title="Move Down"
                        >
                          <MoveDown className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Add Subcategory Shortcut */}
                      <button
                        onClick={() => handleOpenAdd(root.id)}
                        className="clay-button p-2 text-orange-600 hover:text-orange-700 rounded-xl transition cursor-pointer"
                        title="Add child subcategory under this root"
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(root)}
                        className="clay-button p-2 text-slate-600 hover:text-indigo-600 rounded-xl transition cursor-pointer"
                        title="Edit Root Category"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTarget(root)}
                        className="clay-button p-2 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Subcategories (Indented Tree Branches) */}
                  {isExpanded && (
                    <div className="pl-4 sm:pl-7 pt-2 border-l-2 border-orange-200/80 ml-3.5 space-y-2">
                      {!hasSubs ? (
                        <div className="py-2 text-xs text-slate-400 italic flex items-center gap-2">
                          <span>No subcategories created yet under this root collection.</span>
                          <button
                            onClick={() => handleOpenAdd(root.id)}
                            className="text-orange-600 font-bold hover:underline not-italic cursor-pointer"
                          >
                            + Add now
                          </button>
                        </div>
                      ) : (
                        root.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-xs hover:border-orange-300 transition-all"
                          >
                            {/* Sub Info */}
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-slate-300 text-sm">↳</span>
                              <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {sub.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h5 className="font-bold text-xs text-slate-800 truncate">
                                    {sub.name}
                                  </h5>
                                  <span className="text-[9.5px] font-mono text-slate-400 bg-slate-50 px-1 rounded border border-slate-200">
                                    /{sub.slug}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {sub._count?.products ?? 0} products
                                </span>
                              </div>
                            </div>

                            {/* Sub Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleToggleStatus(sub)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all cursor-pointer ${
                                  sub.isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-500 border border-slate-200"
                                }`}
                              >
                                {sub.isActive ? "Active" : "Inactive"}
                              </button>

                              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                <span className="font-bold text-slate-600">#{sub.order}</span>
                                <button
                                  onClick={() => handleMoveOrder(sub, "UP")}
                                  className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                                  title="Move Up"
                                >
                                  <MoveUp className="h-2.5 w-2.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveOrder(sub, "DOWN")}
                                  className="hover:text-orange-600 transition p-0.5 cursor-pointer"
                                  title="Move Down"
                                >
                                  <MoveDown className="h-2.5 w-2.5" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleOpenEdit(sub)}
                                className="clay-button p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg cursor-pointer"
                                title="Edit Subcategory"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>

                              <button
                                onClick={() => setDeleteTarget(sub)}
                                className="clay-button p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                                title="Delete Subcategory"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>

                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* =========================================================
          CREATE & EDIT CATEGORY MODAL
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div 
            className="clay-card w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-xs">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
                    {editingCategory ? "Edit Category" : "New Category"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {editingCategory ? "Update collection details and display hierarchy" : "Create a new top-level root or nested subcategory"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
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
                  placeholder="e.g. Dog Nutrition &amp; Supplements"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">URL Slug</label>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-generated from title</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">/</span>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => {
                      setFormSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="dog-nutrition-supplements"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-2.5 pl-6 pr-3 text-xs font-mono text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Parent Category Dropdown */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Parent Category Hierarchy</label>
                  <span className="text-[10.5px] text-slate-400">Leave empty for Root Collection</span>
                </div>
                <div className="relative">
                  <select
                    value={modalParentId}
                    onChange={(e) => setModalParentId(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 pr-8 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 cursor-pointer appearance-none"
                  >
                    <option value="">None (Top-Level Root Category)</option>
                    {rootCategories
                      .filter(r => editingCategory ? r.id !== editingCategory.id : true)
                      .map((root) => (
                        <option key={root.id} value={root.id}>
                          📁 {root.name} (Root Collection)
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Category Image Upload & Preview */}
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
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                        e.target.value = "";
                      }}
                    />

                    {formImageUrl ? (
                      <div className="rounded-2xl border border-slate-200/80 bg-[#F8F5F1] p-3 flex items-center gap-3">
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formImageUrl}
                            alt="Category Preview"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 truncate">Image Attached</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 truncate mt-0.5" title={formImageUrl}>
                            {formImageUrl}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition cursor-pointer disabled:opacity-50"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormImageUrl("")}
                            disabled={isUploadingImage}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                            title="Remove Image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                          dragOver
                            ? "border-orange-500 bg-orange-50/60"
                            : "border-slate-200/80 bg-[#F8F5F1] hover:border-orange-400 hover:bg-orange-50/20"
                        } ${isUploadingImage ? "pointer-events-none opacity-80" : ""}`}
                      >
                        {isUploadingImage ? (
                          <div className="py-2 flex flex-col items-center gap-2">
                            <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />
                            <span className="text-xs font-bold text-slate-700">Uploading to Storage...</span>
                            <span className="text-[10px] text-slate-400">Please wait while the image is being processed</span>
                          </div>
                        ) : (
                          <div className="py-1 flex flex-col items-center gap-1">
                            <div className="h-10 w-10 rounded-full bg-orange-100/80 flex items-center justify-center text-orange-600 mb-0.5">
                              <UploadCloud className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              Click to upload dog or category image
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              Drag & drop or browse (PNG, JPG, WEBP, SVG up to 10MB)
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://cdn.kickat.co.in/categories/dog-food.png"
                      className="flex-1 rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                    />
                    {formImageUrl && (
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formImageUrl}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
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
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/70 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
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
                      {formIsActive ? "Active (Live)" : "Inactive (Draft)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {(submitting || isUploadingImage) && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          DELETE CONFIRMATION DIALOG
          ========================================================= */}
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
                  Are you sure you want to delete <strong className="text-slate-800">&ldquo;{deleteTarget.name}&rdquo;</strong>?
                </p>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60 mt-2 font-medium">
                  Integrity note: The backend prevents deletion if active products or child subcategories are linked.
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

      {/* =========================================================
          INTEGRITY ALERT DIALOG (HANDLES 400 ERROR FROM SERVER)
          ========================================================= */}
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
