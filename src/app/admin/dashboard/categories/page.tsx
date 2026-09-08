"use client";

import { 
  FolderTree, 
  Package, 
  TrendingUp, 
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
  Filter
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  species: "All Pets" | "Dogs" | "Cats" | "Birds" | "Small Animals";
  itemCount: number;
  popularItem: string;
  status: "ACTIVE" | "DRAFT";
  icon: string;
  badgeColor: string;
  monthlyGrowth: string;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Dog Nutrition & Kibble",
    slug: "dog-nutrition",
    description: "Grain-free kibble, raw dehydrated meat cuts, puppy growth formulas, and prescription diets.",
    species: "Dogs",
    itemCount: 420,
    popularItem: "Royal Canin Maxi Puppy (15kg)",
    status: "ACTIVE",
    icon: "🐕",
    badgeColor: "bg-gradient-to-br from-amber-400 to-orange-500",
    monthlyGrowth: "+18.4%",
  },
  {
    id: "cat-2",
    name: "Cat Treats & Catnip Delights",
    slug: "cat-treats",
    description: "Crunchy dental bites, purée lickable sticks, organic catnip toys, and freeze-dried salmon.",
    species: "Cats",
    itemCount: 310,
    popularItem: "Temptations Seafood Medley (85g)",
    status: "ACTIVE",
    icon: "🐱",
    badgeColor: "bg-gradient-to-br from-violet-500 to-purple-600",
    monthlyGrowth: "+24.1%",
  },
  {
    id: "cat-3",
    name: "Pet Grooming & Spa Hygiene",
    slug: "grooming-hygiene",
    description: "Hypoallergenic oatmeal shampoos, de-shedding combs, nail clippers, and ear cleaning drops.",
    species: "All Pets",
    itemCount: 195,
    popularItem: "Bio-Groom Herbal Shampoo (355ml)",
    status: "ACTIVE",
    icon: "🧼",
    badgeColor: "bg-gradient-to-br from-emerald-400 to-teal-600",
    monthlyGrowth: "+9.2%",
  },
  {
    id: "cat-4",
    name: "Veterinary Care & Supplements",
    slug: "vet-supplements",
    description: "Hip & joint glucosamine chews, skin omega-3 oils, calming hemp oils, and dental water additives.",
    species: "All Pets",
    itemCount: 145,
    popularItem: "VetriScience GlycoFlex III (90ct)",
    status: "ACTIVE",
    icon: "💊",
    badgeColor: "bg-gradient-to-br from-rose-400 to-pink-600",
    monthlyGrowth: "+14.8%",
  },
  {
    id: "cat-5",
    name: "Interactive Chew & Plush Toys",
    slug: "toys-accessories",
    description: "Tough rubber treat-dispensers, braided dental ropes, feather teaser wands, and agility tunnels.",
    species: "Dogs",
    itemCount: 260,
    popularItem: "KONG Classic Durable Toy (Large)",
    status: "ACTIVE",
    icon: "🎾",
    badgeColor: "bg-gradient-to-br from-blue-400 to-indigo-600",
    monthlyGrowth: "+12.0%",
  },
  {
    id: "cat-6",
    name: "Avian & Small Animal Habitat",
    slug: "birds-small-pets",
    description: "Fortified seed blends, timothy hay bales, calcium perches, hamster exercise wheels, and cage sanitizers.",
    species: "Birds",
    itemCount: 150,
    popularItem: "Kaytee Forti-Diet Pro Parakeet (2kg)",
    status: "DRAFT",
    icon: "🦜",
    badgeColor: "bg-gradient-to-br from-teal-400 to-cyan-600",
    monthlyGrowth: "+5.3%",
  },
];

const EMOJI_OPTIONS = ["🐕", "🐱", "🦜", "🐰", "🐠", "🧼", "💊", "🎾", "🦴", "🥫", "🎀", "🏕️"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRAFT">("ALL");
  const [speciesFilter, setSpeciesFilter] = useState<string>("ALL");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    species: "Dogs" as Category["species"],
    status: "ACTIVE" as "ACTIVE" | "DRAFT",
    icon: "🐕",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      species: "Dogs",
      status: "ACTIVE",
      icon: "🐕",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      species: cat.species,
      status: cat.status,
      icon: cat.icon,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      setCategories(categories.filter(c => c.id !== id));
      showToast(`Category "${name}" deleted.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, ...formData, slug }
          : c
      ));
      showToast(`Updated "${formData.name}" successfully!`);
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: formData.name,
        slug,
        description: formData.description || "Collection of premium pet essentials.",
        species: formData.species,
        itemCount: 0,
        popularItem: "New Collection",
        status: formData.status,
        icon: formData.icon,
        badgeColor: "bg-gradient-to-br from-amber-400 to-orange-500",
        monthlyGrowth: "+0.0%",
      };
      setCategories([newCategory, ...categories]);
      showToast(`Created category "${formData.name}"!`);
    }

    setIsModalOpen(false);
  };

  const filtered = categories.filter((cat) => {
    const matchesSearch = 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || cat.status === statusFilter;
    const matchesSpecies = speciesFilter === "ALL" || cat.species === speciesFilter;

    return matchesSearch && matchesStatus && matchesSpecies;
  });

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-4 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
            Product Categories
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Organize pet store catalog collections, hierarchy, and navigation tags.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Total Categories</span>
            <FolderTree className="h-4 w-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">{categories.length}</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Across all pet species</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Catalog Items</span>
            <Package className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">
            {categories.reduce((sum, c) => sum + c.itemCount, 0).toLocaleString()}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-[#20BF6B] mt-0.5 truncate">↑ 14 added this week</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Top Selling</span>
            <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-base sm:text-lg font-black text-[#2A241E] mt-1.5 truncate">Dog Nutrition</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">38% store volume</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Active Status</span>
            <AlertCircle className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">
            {categories.filter(c => c.status === "ACTIVE").length}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Live in customer store</p>
        </div>
      </div>

      {/* Search & Species Filter Bar */}
      <div className="clay-card p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories by name, slug or description..."
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
            {(["ALL", "ACTIVE", "DRAFT"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`
                  px-3 py-1.5 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer
                  ${statusFilter === st 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }
                `}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Species Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono-eyebrow shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Species:
          </span>
          {["ALL", "Dogs", "Cats", "Birds", "All Pets"].map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeciesFilter(sp)}
              className={`
                px-2.5 py-1 text-[11px] font-semibold rounded-lg shrink-0 transition cursor-pointer
                ${speciesFilter === sp
                  ? "bg-orange-500 text-white shadow-xs font-bold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }
              `}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Categories Grid */}
      {filtered.length === 0 ? (
        <div className="clay-card p-10 text-center space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="font-fraunces text-base font-bold text-[#2A241E]">No categories found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or filter criteria to find the right collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
          {filtered.map((cat) => (
            <div 
              key={cat.id} 
              className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 hover:scale-[1.01] transition-all relative group"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  {/* 3D Emoji Avatar Badge */}
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${cat.badgeColor} text-2xl text-white shadow-xs`}>
                    {cat.icon}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-[#F3EFEA] text-slate-600 border border-slate-200/60 font-mono-eyebrow">
                      {cat.species}
                    </span>

                    <span className={`
                      px-2.5 py-0.5 text-[10px] font-bold rounded-full
                      ${cat.status === "ACTIVE" 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70" 
                        : "bg-amber-50 text-amber-700 border border-amber-200/70"
                      }
                    `}>
                      {cat.status}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="mt-3.5 space-y-1">
                  <h3 className="font-fraunces text-base font-bold text-[#2A241E] leading-tight truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Card Footer info */}
              <div className="mt-4 pt-3 border-t border-slate-100/90 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Catalog Size:</span>
                  <span className="font-extrabold text-slate-800">{cat.itemCount} items</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Best Seller:</span>
                  <span className="font-bold text-slate-700 truncate max-w-[170px]">{cat.popularItem}</span>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <Link
                    href="/admin/dashboard/products"
                    className="clay-button flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>View Items</span>
                  </Link>

                  <button 
                    onClick={() => handleOpenEdit(cat)}
                    className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-orange-600 transition cursor-pointer"
                    title="Edit category"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button 
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          Add / Edit Category Clay Modal
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="clay-card w-full max-w-lg p-5 sm:p-6 bg-white space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-lg">
                  {formData.icon}
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    {editingCategory ? "Edit Category" : "New Category"}
                  </h2>
                  <p className="text-[11px] text-slate-500">Configure catalog hierarchy & visibility</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              
              {/* Category Name */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Category Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Grain-Free Dog Kibble"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Slug & Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. grain-free-dog-kibble"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Species Segment</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value as Category["species"] })}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="Dogs">🐕 Dogs</option>
                    <option value="Cats">🐱 Cats</option>
                    <option value="Birds">🦜 Birds</option>
                    <option value="Small Animals">🐰 Small Animals</option>
                    <option value="All Pets">🐾 All Pets</option>
                  </select>
                </div>
              </div>

              {/* Emoji Icon Picker */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Category Icon Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emo) => (
                    <button
                      type="button"
                      key={emo}
                      onClick={() => setFormData({ ...formData, icon: emo })}
                      className={`
                        h-9 w-9 rounded-xl flex items-center justify-center text-lg transition cursor-pointer
                        ${formData.icon === emo
                          ? "bg-orange-500 text-white shadow-md scale-110 ring-2 ring-orange-400"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }
                      `}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of products and benefits for pet owners..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Status Radio */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Visibility Status</label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={formData.status === "ACTIVE"}
                      onChange={() => setFormData({ ...formData, status: "ACTIVE" })}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="font-bold text-slate-700">Active (Live in Store)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="DRAFT"
                      checked={formData.status === "DRAFT"}
                      onChange={() => setFormData({ ...formData, status: "DRAFT" })}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="font-bold text-slate-500">Draft (Hidden)</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="clay-btn-orange inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
