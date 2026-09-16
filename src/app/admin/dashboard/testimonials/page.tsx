"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  CheckCircle2,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  Testimonial,
  TestimonialsMeta,
  TestimonialsStats,
  AdminTestimonialsQueryParams,
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from "@/types/admin-testimonial";
import AdminTestimonialService from "@/services/adminTestimonialService";

const PROJECT_OPTIONS = [
  "KickAt Food & Nutrition",
  "KickAt Harness & Accessories",
  "KickAt Grooming & Care",
  "KickAt Mobile App",
  "KickAt Web Store",
  "General Store",
];

const AVATAR_GRADIENTS = [
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-emerald-400 to-teal-600",
  "bg-gradient-to-br from-blue-400 to-indigo-600",
  "bg-gradient-to-br from-rose-400 to-pink-600",
  "bg-gradient-to-br from-teal-400 to-cyan-600",
];

function getAvatarGradient(name?: string): string {
  const safeName = name || "Parent";
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function getInitials(name?: string): string {
  if (!name || !name.trim()) return "P";
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
  const [stats, setStats] = useState<TestimonialsStats>({
    total: 0,
    active: 0,
    featured: 0,
    averageRating: 0,
  });
  const [meta, setMeta] = useState<TestimonialsMeta>({
    page: 1,
    limit: 10,
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
  const [projectFilter, setProjectFilter] = useState<string>("ALL");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<
    "order_asc" | "order_desc" | "createdAt_desc" | "createdAt_asc" | "rating_desc"
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
  const [formProject, setFormProject] = useState("KickAt Food & Nutrition");
  const [formAvatar, setFormAvatar] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formContent, setFormContent] = useState("");
  const [formPetName, setFormPetName] = useState("");
  const [formPetType, setFormPetType] = useState("Dogs");
  const [formCustomPetType, setFormCustomPetType] = useState("");
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formIsFeatured, setFormIsFeatured] = useState<boolean>(false);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [deletePermanent, setDeletePermanent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset scroll container to top on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      const scrollParent = document.querySelector(".overflow-y-auto");
      if (scrollParent) {
        scrollParent.scrollTop = 0;
      }
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
          limit: 10,
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

        if (projectFilter !== "ALL") {
          queryParams.project = projectFilter;
        }

        if (ratingFilter) {
          queryParams.rating = ratingFilter;
        }

        const res = await AdminTestimonialService.getTestimonials(queryParams);
        setTestimonials(res.testimonials || []);
        if (res.stats) {
          setStats(res.stats);
        }
        if (res.meta) {
          setMeta(res.meta);
        }
      } catch (err: unknown) {
        const msg = AdminTestimonialService.extractErrorMessage(err, "Failed to load testimonials.");
        showToast(msg, "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, sortBy, debouncedSearch, statusFilter, ratingFilter, projectFilter, showToast]
  );

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Reset all filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setSpeciesFilter("ALL");
    setProjectFilter("ALL");
    setRatingFilter(undefined);
    setSortBy("order_asc");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    debouncedSearch !== "" ||
    statusFilter !== "ALL" ||
    speciesFilter !== "ALL" ||
    projectFilter !== "ALL" ||
    ratingFilter !== undefined;

  // Client-side species filtering if active
  const displayedTestimonials = useMemo(() => {
    let items = testimonials;
    if (speciesFilter !== "ALL") {
      items = items.filter((t) => {
        const pType = (t.petType || "").toLowerCase();
        if (speciesFilter === "Dogs") return pType.includes("dog");
        if (speciesFilter === "Cats") return pType.includes("cat");
        if (speciesFilter === "Birds") return pType.includes("bird") || pType.includes("parrot");
        if (speciesFilter === "Other") {
          return !pType.includes("dog") && !pType.includes("cat") && !pType.includes("bird");
        }
        return pType.includes(speciesFilter.toLowerCase());
      });
    }
    if (projectFilter !== "ALL") {
      items = items.filter((t) => {
        const proj = (t.project || t.role || "").toLowerCase();
        return proj.includes(projectFilter.toLowerCase());
      });
    }
    return items;
  }, [testimonials, speciesFilter, projectFilter]);

  // Modal Open Handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormRole("");
    setFormProject("KickAt Food & Nutrition");
    setFormAvatar("");
    setFormRating(5);
    setFormContent("");
    setFormPetName("");
    setFormPetType("Dogs");
    setFormCustomPetType("");
    setFormOrder(0);
    setFormIsActive(true);
    setFormIsFeatured(false);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormName(item.name || item.authorName || "");
    setFormRole(item.role || item.authorTitle || "");
    setFormProject(item.project || item.role || item.authorTitle || "KickAt Food & Nutrition");
    setFormAvatar(item.authorAvatar || "");
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
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
  };

  // Toggle Featured (Pin to Homepage Hero Carousel)
  const handleToggleFeatured = async (item: Testimonial) => {
    const nextFeatured = !item.isFeatured;
    const authorDisplayName = item.name || item.authorName || "Testimonial";

    try {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isFeatured: nextFeatured } : t))
      );
      setStats((prev) => ({
        ...prev,
        featured: nextFeatured ? (prev.featured ?? 0) + 1 : Math.max(0, (prev.featured ?? 0) - 1),
      }));

      await AdminTestimonialService.updateTestimonial(item.id, {
        isFeatured: nextFeatured,
      });

      showToast(
        nextFeatured ? `Pinned "${authorDisplayName}" to Homepage!` : `Removed "${authorDisplayName}" from Homepage.`,
        "success"
      );
    } catch (err) {
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
    const authorDisplayName = item.name || item.authorName || "Testimonial";

    try {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, isActive: nextActive } : t))
      );
      setStats((prev) => ({
        ...prev,
        active: nextActive ? prev.active + 1 : Math.max(0, prev.active - 1),
      }));

      await AdminTestimonialService.toggleStatus(item.id, nextActive);

      showToast(
        nextActive ? `Testimonial "${authorDisplayName}" is now Live.` : `Testimonial "${authorDisplayName}" hidden.`,
        "success"
      );
    } catch (err) {
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
      showToast(
        deletePermanent
          ? `Permanently deleted testimonial.`
          : `Removed testimonial from storefront.`,
        "success"
      );
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

    const finalPetType =
      formPetType === "Other"
        ? formCustomPetType.trim() || undefined
        : formPetType;

    try {
      if (editingItem) {
        const updatePayload: UpdateTestimonialInput = {
          name: formName.trim(),
          authorName: formName.trim(),
          role: formRole.trim() || formProject,
          project: formProject,
          authorTitle: formRole.trim() || undefined,
          authorAvatar: formAvatar.trim() || null,
          rating: formRating,
          content: formContent.trim(),
          petName: formPetName.trim() || undefined,
          petType: finalPetType,
          isActive: formIsActive,
          isFeatured: formIsFeatured,
          order: Number(formOrder) || 0,
        };

        const res = await AdminTestimonialService.updateTestimonial(editingItem.id, updatePayload);
        if (res.data || res.success) {
          showToast(`Updated testimonial from "${formName.trim()}"!`, "success");
          handleCloseModal();
          fetchTestimonials(true);
        }
      } else {
        const createPayload: CreateTestimonialInput = {
          name: formName.trim(),
          authorName: formName.trim(),
          role: formRole.trim() || formProject,
          project: formProject,
          authorTitle: formRole.trim() || undefined,
          authorAvatar: formAvatar.trim() || null,
          rating: formRating,
          content: formContent.trim(),
          petName: formPetName.trim() || undefined,
          petType: finalPetType,
          isActive: formIsActive,
          isFeatured: formIsFeatured,
          order: Number(formOrder) || 0,
        };

        const res = await AdminTestimonialService.createTestimonial(createPayload);
        if (res.data || res.success) {
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

  const isStoreCompletelyEmpty =
    !loading &&
    stats.total === 0 &&
    !hasActiveFilters;

  return (
    <div className="space-y-5 sm:space-y-6 w-full min-w-0 pb-16 animate-fade-in">
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
                {/* Project Filter */}
                <select
                  value={projectFilter}
                  onChange={(e) => {
                    setProjectFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl bg-[#F8F5F1] border border-slate-200/60 px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:border-orange-400 transition cursor-pointer"
                >
                  <option value="ALL">All Projects</option>
                  {PROJECT_OPTIONS.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
            <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
              Homepage Testimonials
            </h1>
            {refreshing && (
              <RefreshCw className="h-4 w-4 text-[#FF7A00] animate-spin shrink-0" />
            )}
          </div>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Curate and feature verified pet parent text reviews on the homepage carousel.
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

      {/* When total testimonials is 0 and no filters active: Show Clean Empty Slate */}
      {isStoreCompletelyEmpty ? (
        <div className="clay-card p-10 sm:p-16 text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-6 animate-fade-in">
          <div className="h-16 w-16 rounded-3xl bg-orange-50 text-[#FF7A00] flex items-center justify-center shadow-xs">
            <MessageSquareQuote className="h-8 w-8 stroke-[1.75]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-fraunces text-lg sm:text-xl font-bold text-[#2A241E]">
              No Customer Testimonials Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Curate and publish genuine pet parent feedback, health transformations, and verified stories to display on your homepage carousel.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleOpenAdd}
              className="clay-btn-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Your First Testimonial</span>
            </button>
          </div>
        </div>
      ) : (
        <>
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
                {stats.total}
              </p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                {stats.active} active on storefront
              </p>
            </div>

            <div className="clay-card p-3.5 sm:p-4 min-w-0">
              <div className="flex items-center justify-between gap-1 text-slate-500">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Homepage Featured
                </span>
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">
                {stats.featured ?? 0}
              </p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                Pinned to homepage slider
              </p>
            </div>

            <div className="clay-card p-3.5 sm:p-4 min-w-0">
              <div className="flex items-center justify-between gap-1 text-slate-500">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Avg Rating
                </span>
                <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
              </div>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <p className="text-xl sm:text-2xl font-black text-[#2A241E]">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : "5.0"}
                </p>
                <span className="text-xs font-bold text-amber-600">★ Stars</span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                From verified customers
              </p>
            </div>

            <div className="clay-card p-3.5 sm:p-4 min-w-0">
              <div className="flex items-center justify-between gap-1 text-slate-500">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">
                  Live Status
                </span>
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">
                {stats.active}
              </p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                Publicly visible reviews
              </p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="clay-card p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by parent name, pet name, or story content..."
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

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#F8F5F1] p-1 rounded-xl shrink-0 overflow-x-auto">
                {(["ALL", "FEATURED", "ACTIVE", "INACTIVE"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setStatusFilter(tab);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                      statusFilter === tab
                        ? "bg-white text-[#2A241E] shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab === "ALL"
                      ? "All"
                      : tab === "FEATURED"
                      ? "Featured ★"
                      : tab === "ACTIVE"
                      ? "Active"
                      : "Hidden"}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters: Rating & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 font-mono-eyebrow">
                  RATING:
                </span>
                <button
                  onClick={() => setRatingFilter(undefined)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    ratingFilter === undefined
                      ? "bg-slate-800 text-white"
                      : "bg-[#F8F5F1] text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  All Stars
                </button>
                {[5, 4, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(star)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                      ratingFilter === star
                        ? "bg-amber-500 text-white"
                        : "bg-[#F8F5F1] text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    <span>{star}</span>
                    <Star className="h-3 w-3 fill-current" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Testimonials List */}
          {loading ? (
            <div className="clay-card p-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00]" />
              <p className="text-xs font-bold text-slate-600">Loading customer testimonials...</p>
            </div>
          ) : displayedTestimonials.length === 0 ? (
            <div className="clay-card p-8 sm:p-12 text-center space-y-3">
              <p className="text-xs sm:text-sm font-bold text-slate-700">No testimonials match your filters.</p>
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-[#FF7A00] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedTestimonials.map((item) => {
                const displayName = item.name || item.authorName || "Verified Parent";
                const displayRole = item.role || item.authorTitle || "Pet Parent";

                return (
                  <div
                    key={item.id}
                    className={`clay-card p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 relative ${
                      item.isFeatured ? "ring-2 ring-amber-400/90 shadow-md" : ""
                    }`}
                  >
                    {/* Card Header */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.authorAvatar ? (
                            <img
                              src={item.authorAvatar}
                              alt={displayName}
                              className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl object-cover shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div
                              className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl ${getAvatarGradient(
                                displayName
                              )} text-white text-xs font-black shadow-xs`}
                            >
                              {getInitials(displayName)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {displayName}
                              </h3>
                              <span title="Verified Pet Parent">
                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-500 truncate">
                              {displayRole}
                            </p>
                          </div>
                        </div>

                        {/* Order & Rating */}
                        <div className="flex flex-col items-end shrink-0">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${
                                  s <= item.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 mt-1">
                            Seq #{item.order}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="relative pt-1">
                        <p className="text-xs text-slate-700 italic leading-relaxed line-clamp-3">
                          "{item.content}"
                        </p>
                      </div>

                      {/* Pet Tag */}
{/* Project & Pet Badge */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.project && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/60">
                            📁 {item.project}
                          </span>
                        )}
                        {(item.petName || item.petType) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-[#FF7A00] text-[10px] font-bold">
                            🐾 {item.petName ? item.petName : ""} {item.petType ? `(${item.petType})` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* Toggle Active Switch */}
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            item.isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {item.isActive ? (
                            <>
                              <Eye className="h-3 w-3 text-emerald-600" />
                              <span>Live</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 text-slate-400" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>

                        {/* Toggle Featured */}
                        <button
                          onClick={() => handleToggleFeatured(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            item.isFeatured
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>{item.isFeatured ? "Featured ★" : "Feature"}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                          title="Edit Testimonial"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Testimonial"
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

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium">
                Page <span className="font-bold text-slate-800">{meta.page}</span> of{" "}
                <span className="font-bold text-slate-800">{meta.totalPages}</span> ({meta.total} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={currentPage >= meta.totalPages || loading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                {editingItem ? "Edit Customer Testimonial" : "Add Customer Testimonial"}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={submitting}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Pet Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Project / Product Line</label>
                  <select
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition font-medium"
                  >
                    {PROJECT_OPTIONS.map((proj) => (
                      <option key={proj} value={proj}>
                        {proj}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Role / Parent Title</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Dog Parent to Bruno"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>
              </div>

              {/* Avatar Image URL */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  value={formAvatar}
                  onChange={(e) => setFormAvatar(e.target.value)}
                  placeholder="https://cdn.kickat.co.in/avatars/priya.png"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Pet Name</label>
                  <input
                    type="text"
                    value={formPetName}
                    onChange={(e) => setFormPetName(e.target.value)}
                    placeholder="Bruno"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Pet Species</label>
                  <select
                    value={formPetType}
                    onChange={(e) => setFormPetType(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition cursor-pointer"
                  >
                    <option value="Dogs">Dog</option>
                    <option value="Cats">Cat</option>
                    <option value="Birds">Bird</option>
                    <option value="Other">Other Species</option>
                  </select>
                </div>
              </div>

              {formPetType === "Other" && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Custom Species Name</label>
                  <input
                    type="text"
                    value={formCustomPetType}
                    onChange={(e) => setFormCustomPetType(e.target.value)}
                    placeholder="Rabbit, Hamster, etc."
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>
              )}

              {/* Rating Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormRating(star)}
                      className="p-1 cursor-pointer transition hover:scale-110"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= formRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {formRating} Star{formRating > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Review Story Content *</label>
                <textarea
                  required
                  rows={3}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Share the pet parent's feedback..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Display Order #</label>
                  <input
                    type="number"
                    min="0"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value) || 0)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
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

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700">Homepage Featured</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="clay-btn-orange inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Update Testimonial" : "Create Testimonial"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-md p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-50">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
                  Delete Testimonial?
                </h3>
                <p className="text-xs text-slate-500">
                  {deleteTarget.name || deleteTarget.authorName || "This testimonial"}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-2">
              <p>Are you sure you want to remove this testimonial from the storefront?</p>
              <label className="flex items-center gap-2 pt-2 cursor-pointer font-bold text-rose-700">
                <input
                  type="checkbox"
                  checked={deletePermanent}
                  onChange={(e) => setDeletePermanent(e.target.checked)}
                  className="rounded text-rose-600 h-4 w-4 cursor-pointer"
                />
                <span>Permanently Purge from Database</span>
              </label>
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
                  <span>Delete Testimonial</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
