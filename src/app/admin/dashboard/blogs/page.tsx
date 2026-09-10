"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Upload,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  BlogPost,
  BlogCategory,
  BlogPagination,
  BlogSummary,
  AdminBlogsQueryParams,
  CreateBlogPostInput,
  UpdateBlogPostInput,
} from "@/types/admin-blog";
import AdminBlogService from "@/services/adminBlogService";
import AdminUploadService from "@/services/adminUploadService";

const CATEGORY_GRADIENTS = [
  "from-amber-400 to-orange-500",
  "from-violet-500 to-purple-600",
  "from-emerald-400 to-teal-600",
  "from-blue-400 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-cyan-400 to-blue-500",
];

function getCategoryGradient(categoryName?: string | null): string {
  if (!categoryName) return CATEGORY_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CATEGORY_GRADIENTS.length;
  return CATEGORY_GRADIENTS[index];
}

function getCategoryIcon(categoryName?: string | null): string {
  if (!categoryName) return "📝";
  const name = categoryName.toLowerCase();
  if (name.includes("dog") || name.includes("canine") || name.includes("puppy")) return "🐕";
  if (name.includes("cat") || name.includes("feline") || name.includes("kitten")) return "🐈";
  if (name.includes("nutrit") || name.includes("food") || name.includes("diet")) return "🥩";
  if (name.includes("health") || name.includes("vet") || name.includes("care")) return "🩺";
  if (name.includes("train") || name.includes("behavior")) return "🎾";
  if (name.includes("groom") || name.includes("hygiene")) return "✨";
  if (name.includes("news") || name.includes("store")) return "📰";
  return "🐾";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Recent";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recent";
  }
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return views.toLocaleString();
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogsPage() {
  // Data State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [summary, setSummary] = useState<BlogSummary>({
    totalPosts: 0,
    publishedCount: 0,
    draftCount: 0,
    totalViews: 0,
  });
  const [pagination, setPagination] = useState<BlogPagination>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Loading / Feedback States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "createdAt_desc" | "createdAt_asc" | "title_asc" | "viewCount_desc"
  >("createdAt_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [formContent, setFormContent] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formCategoryName, setFormCategoryName] = useState("");
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formAuthorName, setFormAuthorName] = useState("Kickat Editorial Team");
  const [formTagsInput, setFormTagsInput] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<BlogPost | null>(null);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset scroll to top on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const scrollParent = document.querySelector(".overflow-y-auto");
      if (scrollParent) scrollParent.scrollTop = 0;
    }
  }, []);

  // Toast Helper
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await AdminBlogService.getCategories();
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error("Failed to load blog categories:", err);
    }
  }, []);

  useEffect(() => {
    let active = true;
    AdminBlogService.getCategories()
      .then((res) => {
        if (active && res.data?.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch((err) => {
        console.error("Failed to load blog categories:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Fetch Blog Posts
  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      try {
        const queryParams: AdminBlogsQueryParams = {
          page: currentPage,
          limit: 9,
          sort: sortBy,
        };

        if (debouncedSearch) {
          queryParams.search = debouncedSearch;
        }

        if (statusFilter === "PUBLISHED") {
          queryParams.isPublished = true;
        } else if (statusFilter === "DRAFT") {
          queryParams.isPublished = false;
        }

        if (categoryFilter !== "ALL") {
          queryParams.categoryId = categoryFilter;
        }

        const res = await AdminBlogService.getPosts(queryParams);

        if (!isMounted) return;

        const fetchedPosts = res.data?.posts || [];
        setPosts(fetchedPosts);

        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }

        if (res.data?.summary) {
          const rawSummary = res.data.summary;
          const totalViews =
            rawSummary.totalViews !== undefined
              ? rawSummary.totalViews
              : fetchedPosts.reduce((acc, p) => acc + (p.viewCount || 0), 0);

          setSummary({
            totalPosts: rawSummary.totalPosts ?? fetchedPosts.length,
            publishedCount: rawSummary.publishedCount ?? fetchedPosts.filter((p) => p.isPublished).length,
            draftCount: rawSummary.draftCount ?? fetchedPosts.filter((p) => !p.isPublished).length,
            totalViews,
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = AdminBlogService.extractErrorMessage(err, "Failed to load blog articles.");
          showToast(msg, "error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    runFetch();

    return () => {
      isMounted = false;
    };
  }, [currentPage, sortBy, debouncedSearch, statusFilter, categoryFilter, reloadTrigger, showToast]);

  const triggerRefresh = () => {
    setRefreshing(true);
    setReloadTrigger((prev) => prev + 1);
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setSortBy("createdAt_desc");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    debouncedSearch !== "" || statusFilter !== "ALL" || categoryFilter !== "ALL";

  // Slug auto-generation when title changes
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!isSlugManuallyEdited) {
      setFormSlug(generateSlug(val));
    }
  };

  // Tag chip handlers
  const handleAddTag = () => {
    const trimmed = formTagsInput.trim().replace(/^#/, "");
    if (trimmed && !formTags.includes(trimmed)) {
      setFormTags([...formTags, trimmed]);
      setFormTagsInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormTags(formTags.filter((t) => t !== tagToRemove));
  };

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await AdminUploadService.uploadImage(file, "blogs");
      if (res.url) {
        setFormCoverImage(res.url);
        showToast("Cover image uploaded successfully!", "success");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload cover image.";
      showToast(msg, "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Modal Open Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormSlug("");
    setIsSlugManuallyEdited(false);
    setFormContent("");
    setFormSummary("");
    setFormCategoryId(categories[0]?.id || "");
    setFormCategoryName(categories[0]?.name || "");
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setFormAuthorName("Kickat Editorial Team");
    setFormTagsInput("");
    setFormTags([]);
    setFormCoverImage("");
    setFormIsPublished(true);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BlogPost) => {
    setEditingItem(item);
    setFormTitle(item.title || "");
    setFormSlug(item.slug || "");
    setIsSlugManuallyEdited(true);
    setFormContent(item.content || "");
    setFormSummary(item.summary || "");
    setFormCategoryId(item.categoryId || "");
    setFormCategoryName(item.blogCategory?.name || item.category || "");
    setIsCreatingNewCategory(false);
    setNewCategoryName("");
    setFormAuthorName(item.authorName || "Kickat Editorial Team");
    setFormTagsInput("");
    setFormTags(item.tags || []);
    setFormCoverImage(item.coverImage || "");
    setFormIsPublished(item.isPublished);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
  };

  // Toggle Publish Status Quick Action
  const handleTogglePublish = async (item: BlogPost) => {
    const nextPublished = !item.isPublished;
    try {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, isPublished: nextPublished } : p))
      );
      setSummary((prev) => ({
        ...prev,
        publishedCount: nextPublished ? prev.publishedCount + 1 : Math.max(0, prev.publishedCount - 1),
        draftCount: nextPublished ? Math.max(0, prev.draftCount - 1) : prev.draftCount + 1,
      }));

      await AdminBlogService.updatePost(item.id, { isPublished: nextPublished });

      showToast(
        nextPublished
          ? `Article "${item.title}" is now Live!`
          : `Article "${item.title}" moved to Drafts.`,
        "success"
      );
    } catch (err: unknown) {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, isPublished: item.isPublished } : p))
      );
      const msg = AdminBlogService.extractErrorMessage(err, "Failed to update publish status.");
      showToast(msg, "error");
    }
  };

  // Delete Article
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await AdminBlogService.deletePost(deleteTarget.id, deletePermanent);
      showToast(`Article "${deleteTarget.title}" has been deleted.`, "success");
      setDeleteTarget(null);
      setReloadTrigger((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = AdminBlogService.extractErrorMessage(err, "Failed to delete article.");
      showToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setModalError("Article title is required.");
      return;
    }
    if (!formContent.trim()) {
      setModalError("Article content body is required.");
      return;
    }

    setSubmitting(true);
    setModalError(null);

    try {
      let resolvedCategoryId: string | undefined = formCategoryId || undefined;
      let resolvedCategoryName: string | undefined = formCategoryName || undefined;

      // Handle new category creation on the fly
      if (isCreatingNewCategory && newCategoryName.trim()) {
        try {
          const catRes = await AdminBlogService.createCategory({
            name: newCategoryName.trim(),
            slug: generateSlug(newCategoryName.trim()),
          });
          if (catRes.data?.id) {
            resolvedCategoryId = catRes.data.id;
            resolvedCategoryName = catRes.data.name;
            await fetchCategories();
          }
        } catch (catErr: unknown) {
          console.warn("Could not create category on backend, saving category name as fallback:", catErr);
          resolvedCategoryName = newCategoryName.trim();
        }
      }

      if (editingItem) {
        const updatePayload: UpdateBlogPostInput = {
          title: formTitle.trim(),
          slug: formSlug.trim() || generateSlug(formTitle.trim()),
          content: formContent.trim(),
          summary: formSummary.trim() || undefined,
          categoryId: resolvedCategoryId,
          category: resolvedCategoryName,
          authorName: formAuthorName.trim() || undefined,
          tags: formTags,
          coverImage: formCoverImage.trim() || undefined,
          isPublished: formIsPublished,
        };

        const res = await AdminBlogService.updatePost(editingItem.id, updatePayload);
        if (res.data || res.success) {
          showToast(`Article "${formTitle.trim()}" updated successfully!`, "success");
          handleCloseModal();
          setReloadTrigger((prev) => prev + 1);
        }
      } else {
        const createPayload: CreateBlogPostInput = {
          title: formTitle.trim(),
          slug: formSlug.trim() || generateSlug(formTitle.trim()),
          content: formContent.trim(),
          summary: formSummary.trim() || undefined,
          categoryId: resolvedCategoryId,
          category: resolvedCategoryName,
          authorName: formAuthorName.trim() || "Kickat Editorial Team",
          tags: formTags,
          coverImage: formCoverImage.trim() || undefined,
          isPublished: formIsPublished,
        };

        const res = await AdminBlogService.createPost(createPayload);
        if (res.data || res.success) {
          showToast(`Article "${formTitle.trim()}" published successfully!`, "success");
          handleCloseModal();
          setReloadTrigger((prev) => prev + 1);
        }
      }
    } catch (err: unknown) {
      const msg = AdminBlogService.extractErrorMessage(err, "Failed to save article.");
      setModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isStoreCompletelyEmpty = !loading && summary.totalPosts === 0 && !hasActiveFilters;

  return (
    <div className="space-y-4 sm:space-y-5 pb-12 w-full min-w-0 no-scrollbar animate-fade-in">
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

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
              Pet Health & Editorial Articles
            </h1>
            {refreshing && <RefreshCw className="h-4 w-4 text-[#FF7A00] animate-spin shrink-0" />}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Publish veterinary-approved nutrition guides, care tips, and store news.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={triggerRefresh}
            disabled={refreshing || loading}
            className="clay-button h-9 w-9 sm:w-auto p-2 sm:px-3 sm:py-2 text-xs font-bold text-slate-700 hover:text-[#FF7A00] transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            title="Refresh articles"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">
              Published Articles
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">
            {loading ? "..." : summary.publishedCount}
          </p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">
            All verified and live on store
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">
              Total Reader Views
            </span>
            <Eye className="h-4 w-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
            {loading ? "..." : formatViews(summary.totalViews || 0)}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
            Organic store traffic
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">
              Draft Articles
            </span>
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {loading ? "..." : summary.draftCount}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
            Under review / unlisted
          </p>
        </div>
      </div>

      {/* When store is completely empty: Show Clean Empty Slate */}
      {isStoreCompletelyEmpty ? (
        <div className="clay-card p-10 sm:p-16 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-6 animate-fade-in">
          <div className="h-16 w-16 rounded-3xl bg-orange-50 text-[#FF7A00] flex items-center justify-center shadow-xs">
            <BookOpen className="h-8 w-8 stroke-[1.75]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#2A241E]">
              No Pet Health & Editorial Articles Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Create and publish veterinary-verified wellness guides, nutrition plans, training articles, and store updates to engage your pet parents.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleOpenAdd}
              className="clay-btn-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Publish Your First Article</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filters Bar */}
          <div className="clay-card p-3 sm:p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by title, topic, or keyword..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-[#F8F5F1] p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto shrink-0">
                <button
                  onClick={() => {
                    setStatusFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === "ALL"
                      ? "bg-white text-[#2A241E] shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("PUBLISHED");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === "PUBLISHED"
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Published
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("DRAFT");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === "DRAFT"
                      ? "bg-white text-amber-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Drafts
                </button>
              </div>

              {/* Category Dropdown */}
              {categories.length > 0 && (
                <div className="shrink-0">
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-9 rounded-xl bg-[#F8F5F1] border border-slate-200/60 px-3 text-xs font-bold text-slate-700 outline-none focus:border-orange-500 focus:bg-white transition cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.postsCount ?? 0})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort Order Dropdown */}
              <div className="shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as "createdAt_desc" | "createdAt_asc" | "title_asc" | "viewCount_desc");
                    setCurrentPage(1);
                  }}
                  className="h-9 rounded-xl bg-[#F8F5F1] border border-slate-200/60 px-3 text-xs font-bold text-slate-700 outline-none focus:border-orange-500 focus:bg-white transition cursor-pointer"
                >
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="viewCount_desc">Most Views</option>
                  <option value="title_asc">Title (A-Z)</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                <span>
                  Found <strong className="text-slate-700">{pagination.total}</strong> matching articles
                </span>
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-3 animate-pulse">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-2xl bg-slate-200" />
                      <div className="h-5 w-20 rounded-lg bg-slate-200" />
                    </div>
                    <div className="h-5 w-4/5 rounded bg-slate-200 mt-4" />
                    <div className="h-3 w-full rounded bg-slate-100 mt-2.5" />
                    <div className="h-3 w-3/4 rounded bg-slate-100 mt-1.5" />
                  </div>
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 w-20 rounded bg-slate-100" />
                      <div className="h-3 w-12 rounded bg-slate-100" />
                    </div>
                    <div className="flex justify-between pt-1">
                      <div className="h-4 w-16 rounded bg-slate-100" />
                      <div className="h-6 w-24 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filtered Empty State */}
          {!loading && posts.length === 0 && (
            <div className="clay-card p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto my-4 animate-fade-in">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Search className="h-6 w-6" />
              </div>
              <h4 className="font-fraunces text-base font-bold text-[#2A241E]">
                No Articles Found
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                We couldn&apos;t find any articles matching your search query or active filter tags.
              </p>
              <button
                onClick={handleClearFilters}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition mt-1 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Blog Cards Grid */}
          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
              {posts.map((blog) => {
                const categoryLabel = blog.blogCategory?.name || blog.category || "General";
                const gradientClass = getCategoryGradient(categoryLabel);
                const iconEmoji = getCategoryIcon(categoryLabel);

                return (
                  <div
                    key={blog.id}
                    className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-3 relative group"
                  >
                    <div>
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-2">
                        {blog.coverImage ? (
                          <div className="relative h-12 w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} text-2xl text-white shadow-xs`}
                          >
                            {iconEmoji}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                              blog.isPublished
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : "bg-amber-50 text-amber-700 border border-amber-200/60"
                            }`}
                          >
                            {blog.isPublished ? "Published" : "Draft"}
                          </span>

                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-600 truncate max-w-[120px]">
                            {categoryLabel}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="font-fraunces text-base font-bold text-[#2A241E] mt-3 leading-snug line-clamp-2 hover:text-orange-600 transition cursor-pointer"
                        onClick={() => setPreviewItem(blog)}
                        title={blog.title}
                      >
                        {blog.title}
                      </h3>

                      {/* Summary / Snippet */}
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                        {blog.summary || blog.content || "No summary provided for this article."}
                      </p>

                      {/* Tags chips if available */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2.5 flex-wrap">
                          {blog.tags.slice(0, 3).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[9.5px] font-semibold text-slate-500 bg-[#F8F5F1] px-1.5 py-0.5 rounded-md"
                            >
                              #{t}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-[9.5px] font-semibold text-slate-400">
                              +{blog.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[140px]">
                          By {blog.authorName || "Kickat Team"}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-slate-700 shrink-0">
                          <Eye className="h-3 w-3 text-slate-400" />
                          {(blog.viewCount || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {blog.readTimeMinutes || 1} min read
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle Publish Quick Action */}
                          <button
                            onClick={() => handleTogglePublish(blog)}
                            className="clay-button p-1.5 text-xs text-slate-500 hover:text-[#FF7A00] transition cursor-pointer"
                            title={blog.isPublished ? "Unpublish to Draft" : "Publish Live"}
                          >
                            {blog.isPublished ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(blog)}
                            className="clay-button px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition cursor-pointer"
                          >
                            Edit
                          </button>

                          {/* Preview Button */}
                          <button
                            onClick={() => setPreviewItem(blog)}
                            className="clay-button px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
                          >
                            Preview
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              setDeleteTarget(blog);
                              setDeletePermanent(false);
                            }}
                            className="clay-button p-1.5 text-xs text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete article"
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
          )}

          {/* Pagination Controls */}
          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 text-xs">
              <span className="text-slate-500 font-medium">
                Showing page <strong>{pagination.page}</strong> of{" "}
                <strong>{pagination.totalPages}</strong> ({pagination.total} articles)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="clay-button px-3 py-1.5 font-bold text-slate-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="clay-button px-3 py-1.5 font-bold text-slate-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================
          CREATE / EDIT ARTICLE MODAL
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="clay-modal w-full max-w-2xl bg-white p-5 sm:p-7 space-y-5 my-auto animate-scale-up max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#2A241E]">
                  {editingItem ? "Edit Editorial Article" : "Create New Editorial Article"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Veterinary guides, pet health transformations, and store stories.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error banner */}
            {modalError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Title & Slug */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Article Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Complete Guide to Canine Raw & Kibble Nutrition"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  required
                />
              </div>

              {/* Slug Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-600 text-[11px]">URL Slug</label>
                  <span className="text-[10.5px] text-slate-400">
                    Auto-generated from title
                  </span>
                </div>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => {
                    setFormSlug(e.target.value);
                    setIsSlugManuallyEdited(true);
                  }}
                  placeholder="e.g. complete-guide-canine-raw-kibble"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 px-2.5 py-1.5 text-xs font-mono text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              {/* Category & Author Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Category</label>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewCategory(!isCreatingNewCategory)}
                      className="text-[10.5px] font-bold text-orange-600 hover:underline cursor-pointer"
                    >
                      {isCreatingNewCategory ? "Choose existing" : "+ New Category"}
                    </button>
                  </div>

                  {isCreatingNewCategory ? (
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Dog Nutrition"
                      className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  ) : (
                    <select
                      value={formCategoryId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setFormCategoryId(selectedId);
                        const found = categories.find((c) => c.id === selectedId);
                        if (found) setFormCategoryName(found.name);
                      }}
                      className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition cursor-pointer"
                    >
                      <option value="">Select a Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Author Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Author Name</label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    placeholder="e.g. Dr. Rohini Sen (BVSc)"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Excerpt / Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Summary / Excerpt</label>
                  <span className="text-[10px] text-slate-400">
                    {formSummary.length}/500 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Short engaging snippet describing what the reader will learn..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Article Content *</label>
                <textarea
                  rows={7}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Write the complete article content here (supports Markdown and paragraph breaks)..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Cover Image Upload & Preview */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Cover Image</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="Paste image CDN URL or upload below..."
                    className="flex-1 rounded-xl bg-[#F8F5F1] border border-slate-200/80 p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="clay-button px-3.5 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-600" />
                    ) : (
                      <Upload className="h-3.5 w-3.5 text-orange-600" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                  </button>
                </div>

                {formCoverImage && (
                  <div className="relative mt-2 h-24 w-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formCoverImage}
                      alt="Cover Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormCoverImage("")}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tags / Keywords</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={formTagsInput}
                      onChange={(e) => setFormTagsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Type tag (e.g. nutrition, puppy, raw food) and press Add"
                      className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/80 py-2 pl-8 pr-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="clay-button px-3 py-2 text-xs font-bold text-slate-700 shrink-0 cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                {formTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {formTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-lg bg-orange-50 border border-orange-200/80 px-2 py-0.5 text-[11px] font-bold text-orange-800"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-600 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Status Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-xs block">
                    Publication Status
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {formIsPublished
                      ? "Article will be visible immediately to all pet parents on storefront."
                      : "Article will be saved as an unlisted draft for editorial review."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormIsPublished(!formIsPublished)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formIsPublished ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formIsPublished ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCloseModal}
                  className="clay-button px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="clay-btn-orange inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>{editingItem ? "Update Article" : "Publish Article"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          ARTICLE PREVIEW MODAL
          ========================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="clay-modal w-full max-w-2xl bg-white p-5 sm:p-7 space-y-4 my-auto animate-scale-up max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                    previewItem.isPublished
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      : "bg-amber-50 text-amber-700 border border-amber-200/60"
                  }`}
                >
                  {previewItem.isPublished ? "Live Published" : "Draft Article"}
                </span>

                <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                  {previewItem.blogCategory?.name || previewItem.category || "General"}
                </span>
              </div>

              <button
                onClick={() => setPreviewItem(null)}
                className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cover Image */}
            {previewItem.coverImage && (
              <div className="relative h-48 sm:h-64 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewItem.coverImage}
                  alt={previewItem.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h2 className="font-fraunces text-xl sm:text-2xl font-bold text-[#2A241E] leading-tight">
              {previewItem.title}
            </h2>

            {/* Metadata Bar */}
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap py-2 border-y border-slate-100">
              <span>
                By <strong className="text-slate-700">{previewItem.authorName || "Kickat Team"}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(previewItem.publishedAt || previewItem.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {previewItem.readTimeMinutes || 1} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                {(previewItem.viewCount || 0).toLocaleString()} views
              </span>
            </div>

            {/* Summary Box */}
            {previewItem.summary && (
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/60 text-xs text-orange-950 leading-relaxed font-medium">
                <p className="font-bold text-orange-800 mb-0.5">Summary</p>
                {previewItem.summary}
              </div>
            )}

            {/* Full Body Content */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
              {previewItem.content}
            </div>

            {/* Tags */}
            {previewItem.tags && previewItem.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 mr-1">Tags:</span>
                {previewItem.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  const target = previewItem;
                  setPreviewItem(null);
                  handleOpenEdit(target);
                }}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Article</span>
              </button>

              <button
                onClick={() => setPreviewItem(null)}
                className="clay-btn-orange rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DELETE CONFIRMATION MODAL
          ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="clay-modal w-full max-w-md bg-white p-5 sm:p-6 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-fraunces text-base font-bold text-[#2A241E]">
                  Delete Editorial Article
                </h4>
                <p className="text-[11.5px] text-slate-500">
                  Are you sure you want to remove this article?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700">
              <p className="font-bold text-slate-800 line-clamp-1">{deleteTarget.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                By {deleteTarget.authorName || "Kickat Team"} • {deleteTarget.viewCount || 0} views
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={deletePermanent}
                onChange={(e) => setDeletePermanent(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <span className="font-medium">Permanently remove from database (cannot be restored)</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="clay-button px-3.5 py-2 font-bold text-slate-700 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-rose-600 px-4 py-2 font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete</span>
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
