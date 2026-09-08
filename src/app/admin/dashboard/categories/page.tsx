"use client";

import { 
  FolderTree, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Package, 
  TrendingUp, 
  AlertCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  status: "ACTIVE" | "DRAFT";
  icon: string;
  badgeColor: string;
  description: string;
  popularItem: string;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Dog Food & Nutrition",
    slug: "dog-food-nutrition",
    itemCount: 342,
    status: "ACTIVE",
    icon: "🐕",
    badgeColor: "clay-badge-purple",
    description: "Premium dry kibble, grain-free formulas, natural raw blends & puppy chow.",
    popularItem: "Royal Canin Maxi Puppy (15kg)"
  },
  {
    id: "cat-2",
    name: "Cat Care & Gourmet",
    slug: "cat-care-gourmet",
    itemCount: 285,
    status: "ACTIVE",
    icon: "🐈",
    badgeColor: "clay-badge-coral",
    description: "Wet gravy pouches, salmon mousse, hairball prevention & organic catnip.",
    popularItem: "Sheba Fine Flakes Salmon (85g)"
  },
  {
    id: "cat-3",
    name: "Veterinary Supplements",
    slug: "veterinary-supplements",
    itemCount: 168,
    status: "ACTIVE",
    icon: "💊",
    badgeColor: "clay-badge-green",
    description: "Joint mobility chews, skin & coat omega oils, probiotic gut pastes.",
    popularItem: "Nutri-Plus High Calorie Gel"
  },
  {
    id: "cat-4",
    name: "Toys & Interactive Play",
    slug: "toys-interactive-play",
    itemCount: 210,
    status: "ACTIVE",
    icon: "🎾",
    badgeColor: "clay-badge-amber",
    description: "Ultra-durable rubber chews, puzzle treat dispensers, teaser wands.",
    popularItem: "Kong Classic Dog Chew Toy"
  },
  {
    id: "cat-5",
    name: "Grooming & Coat Care",
    slug: "grooming-coat-care",
    itemCount: 145,
    status: "ACTIVE",
    icon: "🛁",
    badgeColor: "clay-badge-blue",
    description: "Hypoallergenic oatmeal shampoos, de-shedding slicker brushes & paw balms.",
    popularItem: "Bio-Groom Herbal Groom Shampoo"
  },
  {
    id: "cat-6",
    name: "Beds, Crates & Travel",
    slug: "beds-crates-travel",
    itemCount: 120,
    status: "DRAFT",
    icon: "🛋️",
    badgeColor: "clay-badge-purple",
    description: "Orthopedic memory foam pet loungers, airline approved soft carriers.",
    popularItem: "SleepyPaws Memory Foam Lounge"
  },
];

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRAFT">("ALL");

  const filtered = INITIAL_CATEGORIES.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Product Categories
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Organize pet store catalog collections, hierarchy, and navigation tags.
          </p>
        </div>

        <button className="clay-button inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all shrink-0">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Total Categories</span>
            <FolderTree className="h-4 w-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">18</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Across 4 pet species</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Catalog Items</span>
            <Package className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">1,480</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">↑ 14 added this week</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Top Selling</span>
            <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-base sm:text-lg font-black text-[#2A241E] mt-1.5 truncate">Dog Nutrition</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">38% store volume</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Low Stock Alert</span>
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1.5">12</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Requires re-order</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="clay-card p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          {(["ALL", "ACTIVE", "DRAFT"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-xl transition active:scale-95
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

      {/* Responsive Categories Grid */}
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
                  <span className={`
                    px-2.5 py-0.5 text-[10px] font-bold rounded-full
                    ${cat.status === "ACTIVE" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70" 
                      : "bg-amber-50 text-amber-700 border border-amber-200/70"
                    }
                  `}>
                    {cat.status}
                  </span>

                  <button className="text-slate-300 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
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
                  className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-orange-600 transition"
                  title="Edit category"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
