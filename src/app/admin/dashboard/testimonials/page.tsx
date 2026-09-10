"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  MessageSquareQuote,
  Star,
  Plus,
  Search,
  Filter,
  Check,
  Trash2,
  Edit2,
  Sparkles,
  Eye,
  EyeOff,
  X,
  UploadCloud,
  CheckCircle2,
  Image as ImageIcon,
  ImageOff,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";
import {
  Testimonial,
  AdminTestimonialsSummary,
  AdminTestimonialsPagination,
  AdminTestimonialsQueryParams,
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from "@/types/admin-testimonial";
import AdminTestimonialService from "@/services/adminTestimonialService";
import AdminUploadService from "@/services/adminUploadService";

type FormImageAction =
  | { kind: "none" }
  | { kind: "existing"; url: string }
  | { kind: "new_file"; file: File; previewUrl: string; previousUrl?: string | null }
  | { kind: "new_url"; url: string; previousUrl?: string | null }
  | { kind: "removed" };

const AVATAR_GRADIENTS = [
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-emerald-400 to-teal-600",
  "bg-gradient-to-br from-blue-400 to-indigo-600",
  "bg-gradient-to-br from-rose-400 to-pink-600",
  "bg-gradient-to-br from-teal-400 to-cyan-600",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function getInitials(name: string): string {
  if (!name) return "P";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateStr: string): string {
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

export default function TestimonialsPage() {
  // Data State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [summary, setSummary] = useState<AdminTestimonialsSummary>({
    totalTestimonials: 0,
    activeCount: 0,
    featuredCount: 0,
    avgRating: 5.0,
  });
  const [pagination, setPagination] = useState<AdminTestimonialsPagination>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  // Loading / Feedback States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Filters & Query Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "FEATURED" | "ACTIVE" | "INACTIVE">("ALL");
  const [speciesFilter, setSpeciesFilter] = useState<string>("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<
    "order_asc" | "order_desc" | "createdAt_desc" | "createdAt_asc" | "rating_desc" | "rating_asc"
  >("order_asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState("");
  const [formPetName, setFormPetName] = useState("");
  const [formPetType, setFormPetType] = useState("Dogs");
  const [formCustomPetType, setFormCustomPetType] = useState("");
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);
  const [formAvatarUrl, setFormAvatarUrl] = useState("");

  // Image Upload State for Modal
  const [formImageState, setFormImageState] = useState<FormImageAction>({ kind: "none" });
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [modalPreviewError, setModalPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Fetch Testimonials
  const fetchTestimonials = useCallback(
    async (isBackground = false) => {
      if (isBackground) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const queryParams: AdminTestimonialsQueryParams = {
          page: currentPage,
          limit: 9,
          sort: sortBy,
        };

        if (debouncedSearch) {
          queryParams.search = debouncedSearch;
        }

        if (statusFilter === "FEATURED") {
          queryParams.isFeatured = true;
        } else if (statusFilter === "ACTIVE") {
          queryParams.isActive = true;
        } else if (statusFilter === "INACTIVE") {
          queryParams.isActive = false;
        }

        if (ratingFilter) {
          queryParams.rating = ratingFilter;
        }

        const res = await AdminTestimonialService.getTestimonials(queryParams);
        if (res.success && res.data) {
          setTestimonials(res.data.testimonials || []);
          if (res.data.summary) {
            setSummary(res.data.summary);
          }
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      } catch (err: unknown) {
        const msg = AdminTestimonialService.extractErrorMessage(err, "Failed to load testimonials.");
        showToast(msg, "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, sortBy, debouncedSearch, statusFilter, ratingFilter, showToast]
  );

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Client-side species filtering if active
  const displayedTestimonials = useMemo(() => {
    if (speciesFilter === "ALL") return testimonials;
    return testimonials.filter((t) => {
      const pType = (t.petType || "").toLowerCase();
      if (speciesFilter === "Dogs") return pType.includes("dog");
      if (speciesFilter === "Cats") return pType.includes("cat");
      if (speciesFilter === "Birds") return pType.includes("bird") || pType.includes("parrot");
      if (speciesFilter === "Other") {
        return !pType.includes("dog") && !pType.includes("cat") && !pType.includes("bird");
      }
      return pType.includes(speciesFilter.toLowerCase());
    });
  }, [testimonials, speciesFilter]);

  // Modal Open Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormRole("");
    setFormRating(5);
    setFormContent("");
    setFormPetName("");
    setFormPetType("Dogs");
    setFormCustomPetType("");
    setFormOrder(0);
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormAvatarUrl("");
    setFormImageState({ kind: "none" });
    setUploadMode("file");
    setModalError(null);
    setImageUploadError(null);
    setModalPreviewError(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormName(item.name || "");
    setFormRole(item.role || "");
    setFormRating(item.rating || 5);
    setFormContent(item.content || "");
    setFormPetName(item.petName || "");

    const knownSpecies = ["Dogs", "Cats", "Birds"];
    if (item.petType && knownSpecies.includes(item.petType)) {
      setFormPetType(item.petType);
      setFormCustomPetType("");
    } else if (item.petType) {
      setFormPetType("Other");
      setFormCustomPetType(item.petType);
    } else {
      setFormPetType("Dogs");
      setFormCustomPetType("");
    }

    setFormOrder(item.order || 0);
    setFormIsActive(item.isActive ?? true);
    setFormIsFeatured(item.isFeatured ?? false);
    setFormAvatarUrl(item.avatarUrl || "");

    if (item.imageUrl) {
      setFormImageState({ kind: "existing", url: item.imageUrl });
    } else {
      setFormImageState({ kind: "none" });
    }

    setUploadMode("file");
    setModalError(null);
    setImageUploadError(null);
    setModalPreviewError(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isUploadingImage || submitting) return;
    if (formImageState.kind === "new_file" && formImageState.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formImageState.previewUrl);
    }
    setIsModalOpen(false);
  };

  // Image Upload Handlers
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError("Image size must be 10MB or less.");
      return;
    }
    setImageUploadError(null);
    setModalPreviewError(false);
    const previewUrl = URL.createObjectURL(file);
    setFormImageState({
      kind: "new_file",
      file,
      previewUrl,
      previousUrl: formImageState.kind === "existing" ? formImageState.url : null,
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (formImageState.kind === "new_file" && formImageState.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(formImageState.previewUrl);
    }
    setFormImageState({ kind: "removed" });
    setImageUploadError(null);
    setModalPreviewError(false);
  };

  // Toggle Featured (Pin to Homepage Hero Carousel)
  const handleToggleFeatured = async (item: Testimonial) => {
    const nextFeatured = !item.isFeatured;
    try {
      // Optimistic update
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isFeatured: nextFeatured } : t))
      );
      setSummary((prev) => ({
        ...prev,
        featuredCount: nextFeatured ? prev.featuredCount + 1 : Math.max(0, prev.featuredCount - 1),
      }));

      await AdminTestimonialService.updateTestimonial(item.id, {
        isFeatured: nextFeatured,
      });

      showToast(
        nextFeatured ? `Pinned "${item.name}" to Homepage!` : `Removed "${item.name}" from Homepage.`,
        "success"
      );
    } catch (err) {
      // Revert on failure
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isFeatured: item.isFeatured } : t))
      );
      const msg = AdminTestimonialService.extractErrorMessage(err, "Failed to update featured status.");
      showToast(msg, "error");
    }
  };

  // Toggle Live / Active Status
  const handleToggleActive = async (item: Testimonial) => {
    const nextActive = !item.isActive;
    try {
      // Optimistic update
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isActive: nextActive } : t))
      );
      setSummary((prev) => ({
        ...prev,
        activeCount: nextActive ? prev.activeCount + 1 : Math.max(0, prev.activeCount - 1),
      }));

      await AdminTestimonialService.toggleStatus(item.id, nextActive);

      showToast(
        nextActive ? `Testimonial "${item.name}" is now Live.` : `Testimonial "${item.name}" hidden.`,
        "success"
      );
    } catch (err) {
      // Revert on failure
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isActive: item.isActive } : t))
      );
      const msg = AdminTestimonialService.extractErrorMessage(err, "Failed to toggle status.");
      showToast(msg, "error");
    }
  };

  // Confirm and Execute Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await AdminTestimonialService.deleteTestimonial(deleteTarget.id, deletePermanent);
      showToast(`Testimonial from "${deleteTarget.name}" deleted.`, "success");
      setDeleteTarget(null);
      fetchTestimonials(true);
    } catch (err) {
      const msg = AdminTestimonialService.extractErrorMessage(err, "Failed to delete testimonial.");
      showToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  // Submit Add / Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError("Pet parent name is required.");
      return;
    }
    if (!formContent.trim()) {
      setModalError("Testimonial story content is required.");
      return;
    }

    setSubmitting(true);
    setModalError(null);
    setImageUploadError(null);

    let finalImageUrl: string | undefined = undefined;

    // Handle Image upload or URL
    if (formImageState.kind === "new_file") {
      setIsUploadingImage(true);
      try {
        const uploadRes = await AdminUploadService.uploadImage(formImageState.file, "testimonials");
        finalImageUrl = uploadRes.url;
      } catch (uploadErr) {
        setIsUploadingImage(false);
        setSubmitting(false);
        setImageUploadError("Failed to upload image. Please try again.");
        return;
      }
      setIsUploadingImage(false);
    } else if (formImageState.kind === "new_url") {
      finalImageUrl = formImageState.url.trim() || undefined;
    } else if (formImageState.kind === "existing") {
      finalImageUrl = formImageState.url;
    } else if (formImageState.kind === "removed") {
      finalImageUrl = "";
    }

    const finalPetType =
      formPetType === "Other"
        ? formCustomPetType.trim() || "Pet"
        : formPetType;

    try {
      if (editingItem) {
        // UPDATE
        const updatePayload: UpdateTestimonialInput = {
          name: formName.trim(),
          role: formRole.trim() || undefined,
          rating: formRating,
          content: formContent.trim(),
          petName: formPetName.trim() || undefined,
          petType: finalPetType,
          imageUrl: finalImageUrl,
          avatarUrl: formAvatarUrl.trim() || undefined,
          isActive: formIsActive,
          isFeatured: formIsFeatured,
          order: Number(formOrder) || 0,
        };

        const res = await AdminTestimonialService.updateTestimonial(editingItem.id, updatePayload);
        if (res.success) {
          showToast(`Updated testimonial from "${formName.trim()}"!`, "success");
          handleCloseModal();
          fetchTestimonials(true);
        }
      } else {
        // CREATE
        const createPayload: CreateTestimonialInput = {
          name: formName.trim(),
          role: formRole.trim() || undefined,
          rating: formRating,
          content: formContent.trim(),
          petName: formPetName.trim() || undefined,
          petType: finalPetType,
          imageUrl: finalImageUrl,
          avatarUrl: formAvatarUrl.trim() || undefined,
          isActive: formIsActive,
          isFeatured: formIsFeatured,
          order: Number(formOrder) || 0,
        };

        const res = await AdminTestimonialService.createTestimonial(createPayload);
        if (res.success) {
          showToast(`Created testimonial for "${formName.trim()}"!`, "success");
          handleCloseModal();
          fetchTestimonials(true);
        }
      }
    } catch (err) {
      const msg = AdminTestimonialService.extractErrorMessage(err, "Failed to save testimonial.");
      setModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
              Customer Testimonials
            </h1>
            {refreshing && (
              <RefreshCw className="h-4 w-4 text-[#FF7A00] animate-spin shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Curate, feature, and showcase verified pet parent stories on the homepage and catalog pages.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchTestimonials(true)}
            disabled={refreshing || loading}
            className="clay-button h-9 w-9 sm:w-auto p-2 sm:px-3 sm:py-2 text-xs font-bold text-slate-700 hover:text-[#FF7A00] transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            title="Refresh testimonials"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#FF7A00]" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Total Stories
            </span>
            <MessageSquareQuote className="h-4 w-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">
            {summary.totalTestimonials}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
            {summary.activeCount} verified active
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Homepage Hero
            </span>
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">
            {summary.featuredCount}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
            Pinned to homepage carousel
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Average Rating
            </span>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">
            {summary.avgRating ? summary.avgRating.toFixed(1) : "5.0"}{" "}
            <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 mt-0.5 truncate">
            Verified parent feedback
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
              Photo Attached
            </span>
            <ImageIcon className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">
            {testimonials.filter((t) => Boolean(t.imageUrl)).length}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
            Real pet photography
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="clay-card p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parent name, role, pet, or story content..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F8F5F1] border border-slate-200/70 text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
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

          {/* Status Filter Segmented Control */}
          <div className="flex items-center rounded-xl bg-[#F8F5F1] p-1 border border-slate-200/70 overflow-x-auto no-scrollbar">
            {(
              [
                { key: "ALL", label: "All" },
                { key: "FEATURED", label: "⭐ Featured" },
                { key: "ACTIVE", label: "Live" },
                { key: "INACTIVE", label: "Draft" },
              ] as const
            ).map((st) => (
              <button
                key={st.key}
                onClick={() => {
                  setStatusFilter(st.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition active:scale-95 cursor-pointer shrink-0 ${
                  statusFilter === st.key
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono-eyebrow shrink-0">
              <ArrowUpDown className="h-3 w-3 inline mr-1" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="rounded-xl bg-[#F8F5F1] border border-slate-200/70 py-1.5 px-2.5 text-xs text-slate-800 font-bold outline-none cursor-pointer"
            >
              <option value="order_asc">Display Order (Asc)</option>
              <option value="order_desc">Display Order (Desc)</option>
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="rating_desc">Highest Rating</option>
              <option value="rating_asc">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Pet Species Filter Tags & Rating Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100/90 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono-eyebrow shrink-0 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Species:
            </span>
            {["ALL", "Dogs", "Cats", "Birds", "Other"].map((sp) => (
              <button
                key={sp}
                onClick={() => setSpeciesFilter(sp)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition cursor-pointer ${
                  speciesFilter === sp
                    ? "bg-orange-500 text-white shadow-xs font-bold"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {sp === "Dogs" ? "🐕 Dogs" : sp === "Cats" ? "🐱 Cats" : sp === "Birds" ? "🦜 Birds" : sp}
              </button>
            ))}
          </div>

          {/* Star Rating Quick Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono-eyebrow mr-1">
              Rating:
            </span>
            <button
              onClick={() => {
                setRatingFilter(undefined);
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md transition cursor-pointer ${
                ratingFilter === undefined
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {[5, 4, 3].map((stars) => (
              <button
                key={stars}
                onClick={() => {
                  setRatingFilter(stars === ratingFilter ? undefined : stars);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 text-[10.5px] font-bold rounded-md flex items-center gap-0.5 transition cursor-pointer ${
                  ratingFilter === stars
                    ? "bg-amber-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{stars}</span>
                <Star className="h-2.5 w-2.5 fill-current" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="clay-card p-5 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-4/5 bg-slate-200 rounded" />
                <div className="h-3 w-2/3 bg-slate-200 rounded" />
              </div>
              <div className="h-32 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : displayedTestimonials.length === 0 ? (
        /* Empty State */
        <div className="clay-card p-12 text-center space-y-3">
          <div className="text-4xl">💬</div>
          <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
            No testimonials found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL" || speciesFilter !== "ALL" || ratingFilter
              ? "Try adjusting your search or filters to see more results."
              : "No customer stories published yet. Add your first testimonial to showcase on the homepage."}
          </p>
          <div className="pt-2">
            <button
              onClick={handleOpenAdd}
              className="clay-btn-orange inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Testimonial</span>
            </button>
          </div>
        </div>
      ) : (
        /* Testimonials Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
          {displayedTestimonials.map((item) => (
            <div
              key={item.id}
              className={`clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 transition-all relative group ${
                item.isFeatured ? "ring-2 ring-amber-400/90 shadow-md" : ""
              }`}
            >
              {/* Card Body */}
              <div className="space-y-3">
                {/* Author row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl ${getAvatarGradient(
                          item.name
                        )} text-white text-xs font-black shadow-xs`}
                      >
                        {getInitials(item.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </h3>
                        <span title="Verified Pet Parent">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 truncate">
                        {item.role || "Verified Pet Parent"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-black rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0 uppercase">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>Featured</span>
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[9.5px] font-bold rounded-md ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {item.isActive ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Pet Pill & Star Rating */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/90 text-xs">
                  <span className="px-2 py-0.5 text-[10.5px] font-bold rounded-lg bg-[#F8F4EF] text-slate-700 border border-slate-200/60 truncate max-w-[200px]">
                    🐾 {item.petName || "Beloved Pet"} {item.petType ? `(${item.petType})` : ""}
                  </span>

                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < item.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Testimonial Story */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs text-slate-700 leading-relaxed font-normal line-clamp-4 italic">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>

                {/* Pet Photo preview if available */}
                {item.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200/80 aspect-[16/9] bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={`${item.petName || item.name} photo`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9.5px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      <span>{item.petName || "Pet Story"}</span>
                    </div>
                  </div>
                )}

                {/* Metadata tag: display order & date */}
                <div className="clay-inset p-2.5 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-mono text-[10.5px] text-slate-500 font-bold">
                    Order: #{item.order}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100/90 flex items-center justify-between gap-2">
                {/* Pin to Home button */}
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(item)}
                  className={`clay-button flex-1 py-1.5 px-2 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    item.isFeatured
                      ? "text-amber-700 hover:text-amber-800 bg-amber-50/70"
                      : "text-slate-600 hover:text-amber-600"
                  }`}
                  title={item.isFeatured ? "Unpin from Homepage Hero" : "Pin to Homepage Hero Carousel"}
                >
                  <Star className={`h-3.5 w-3.5 ${item.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span>{item.isFeatured ? "Pinned Hero" : "Pin to Home"}</span>
                </button>

                {/* Live toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(item)}
                  className={`clay-button flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer ${
                    item.isActive ? "text-emerald-600 hover:text-slate-500" : "text-slate-400 hover:text-emerald-600"
                  }`}
                  title={item.isActive ? "Hide testimonial (Draft)" : "Publish live on website"}
                >
                  {item.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-orange-600 transition cursor-pointer"
                  title="Edit testimonial"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(item);
                    setDeletePermanent(false);
                  }}
                  className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="Delete testimonial"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="clay-card p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</strong> to{" "}
            <strong className="text-slate-800">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{" "}
            of <strong className="text-slate-800">{pagination.total}</strong> testimonials
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="clay-button px-3 py-1.5 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1 text-slate-700 font-bold bg-[#F8F5F1] rounded-lg border border-slate-200/60 font-mono">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="clay-button px-3 py-1.5 font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          Add / Edit Testimonial Clay Modal
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="clay-modal w-full max-w-xl p-5 sm:p-6 bg-white space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-base">
                  💬
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    {editingItem ? "Edit Testimonial" : "New Customer Story"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Publish pet parent social proof to web store
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={submitting || isUploadingImage}
                className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Error Banner */}
            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs font-medium">
              {/* Pet Parent & Role / Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">
                    Pet Parent Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ananya Deshmukh"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">
                    City / Role / Location
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* Pet Name & Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Pet Name</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formPetName}
                    onChange={(e) => setFormPetName(e.target.value)}
                    placeholder="e.g. Bruno or Milo & Luna"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Pet Species / Breed</label>
                  <div className="flex gap-2">
                    <select
                      value={formPetType}
                      onChange={(e) => setFormPetType(e.target.value)}
                      className="rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none cursor-pointer flex-1"
                    >
                      <option value="Dogs">🐕 Dog</option>
                      <option value="Cats">🐱 Cat</option>
                      <option value="Birds">🦜 Bird</option>
                      <option value="Other">🐾 Other</option>
                    </select>
                    {formPetType === "Other" && (
                      <input
                        type="text"
                        placeholder="e.g. Rabbit, Hamster"
                        maxLength={50}
                        value={formCustomPetType}
                        onChange={(e) => setFormCustomPetType(e.target.value)}
                        className="w-1/2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Rating Score</label>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setFormRating(s)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          s <= formRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-black text-slate-800 font-mono">
                    {formRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Testimonial Story Content */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-700 font-bold">
                    Testimonial Story &amp; Feedback <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10.5px] text-slate-400 font-mono">
                    {formContent.length}/1500
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  maxLength={1500}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Share the customer's detailed feedback, observed pet health benefits, and experience..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Pet Photo / Testimonial Image Section */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-slate-700 font-bold">
                      Pet Photo or Review Image
                    </label>
                    <p className="text-[10.5px] text-slate-400">
                      Upload pet photo or enter direct public image URL
                    </p>
                  </div>

                  {/* Mode switcher */}
                  <div className="flex items-center rounded-lg bg-[#F8F5F1] p-0.5 border border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setUploadMode("file")}
                      className={`px-2 py-0.5 text-[10.5px] font-bold rounded transition cursor-pointer ${
                        uploadMode === "file"
                          ? "bg-white text-orange-600 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("url")}
                      className={`px-2 py-0.5 text-[10.5px] font-bold rounded transition cursor-pointer ${
                        uploadMode === "url"
                          ? "bg-white text-orange-600 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {uploadMode === "file" ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />

                    {/* Image Preview if present */}
                    {(formImageState.kind === "existing" || formImageState.kind === "new_file") && (
                      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-orange-50/40 border border-orange-200/80">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center">
                            {modalPreviewError ? (
                              <ImageOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={
                                  formImageState.kind === "new_file"
                                    ? formImageState.previewUrl
                                    : formImageState.url
                                }
                                alt="Pet Preview"
                                className="h-full w-full object-cover"
                                onError={() => setModalPreviewError(true)}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {formImageState.kind === "new_file"
                                ? formImageState.file.name
                                : "Current Attached Photo"}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formImageState.kind === "new_file"
                                ? `${(formImageState.file.size / 1024).toFixed(0)} KB ready to upload`
                                : "Saved in Cloud Storage"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2 py-1 text-[11px] font-bold text-orange-600 hover:bg-orange-100 rounded-lg transition cursor-pointer"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dropzone if no image */}
                    {(formImageState.kind === "none" || formImageState.kind === "removed") && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative rounded-2xl border-2 border-dashed p-4 text-center transition-all select-none cursor-pointer group ${
                          dragOver
                            ? "!border-[#FF7A00] !bg-orange-50/60"
                            : "border-slate-200 bg-[#F8F5F1] hover:border-[#FF7A00] hover:bg-orange-50/30"
                        }`}
                      >
                        <div className="py-2 space-y-1 pointer-events-none">
                          <div className="flex justify-center">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF7A00]">
                              <UploadCloud className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="text-xs font-bold text-slate-800">
                            Upload pet or customer photo
                          </div>
                          <p className="text-[10.5px] text-slate-400">
                            PNG, JPG, WebP up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Direct URL Input */
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={
                        formImageState.kind === "new_url"
                          ? formImageState.url
                          : formImageState.kind === "existing"
                          ? formImageState.url
                          : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.trim()) {
                          setFormImageState({ kind: "new_url", url: val.trim() });
                        } else {
                          setFormImageState({ kind: "none" });
                        }
                      }}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                    />
                  </div>
                )}

                {imageUploadError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{imageUploadError}</p>
                )}
              </div>

              {/* Order & Avatar URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={formOrder}
                    onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                    placeholder="0 = auto append at end"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Avatar URL (Optional)</label>
                  <input
                    type="url"
                    value={formAvatarUrl}
                    onChange={(e) => setFormAvatarUrl(e.target.value)}
                    placeholder="https://... (or leave blank for initials)"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Homepage Pin & Active Toggle */}
              <div className="space-y-2 pt-1">
                {/* Pin to Homepage */}
                <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Pin to Homepage Hero Carousel
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      Showcase this story prominently in the homepage testimonials slider
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer accent-orange-600"
                  />
                </label>

                {/* Published / Active Toggle */}
                <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-emerald-500" />
                      Publish Live on Storefront
                    </p>
                    <p className="text-[10.5px] text-slate-500">
                      Visible to pet parents across the storefront
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer accent-orange-600"
                  />
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting || isUploadingImage}
                  className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploadingImage}
                  className="clay-btn-orange inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting || isUploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isUploadingImage ? "Uploading Image..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      <span>{editingItem ? "Save Changes" : "Publish Story"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          Delete Confirmation Dialog
          ========================================================= */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="clay-modal w-full max-w-md p-5 bg-white space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-base font-bold text-slate-900">
                  Delete Testimonial?
                </h3>
                <p className="text-xs text-slate-500">
                  Customer story from <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove this testimonial? It will no longer be visible to customers on the homepage.
            </p>

            <label className="clay-inset p-2.5 flex items-center justify-between cursor-pointer">
              <span className="text-[11px] font-bold text-slate-700">Permanent Delete from DB</span>
              <input
                type="checkbox"
                checked={deletePermanent}
                onChange={(e) => setDeletePermanent(e.target.checked)}
                className="rounded h-4 w-4 accent-rose-600 cursor-pointer"
              />
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-600 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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
