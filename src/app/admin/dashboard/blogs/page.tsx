"use client";

import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Calendar, 
  Clock, 
  BookOpen, 
  Share2 
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  author: string;
  readTime: string;
  views: number;
  publishedDate: string;
  snippet: string;
  icon: string;
  badgeColor: string;
}

const BLOGS_DATA: BlogPost[] = [
  {
    id: "blog-1",
    title: "The Complete Guide to Canine Raw & Kibble Nutrition",
    category: "Dog Nutrition",
    author: "Dr. Rohini Sen (BVSc)",
    readTime: "5 min read",
    views: 4280,
    publishedDate: "12 May 2026",
    snippet: "Understanding biologically appropriate diets for large breed dogs and optimal calcium-phosphorus ratios.",
    icon: "🐕",
    badgeColor: "clay-badge-purple"
  },
  {
    id: "blog-2",
    title: "Preventing Monsoon Tick & Flea Infestations in Cats",
    category: "Cat Health",
    author: "Veterinary Team",
    readTime: "4 min read",
    views: 3120,
    publishedDate: "08 May 2026",
    snippet: "Why indoor cats are still at risk during high humidity and how safe topical spot-on treatments work.",
    icon: "🐈",
    badgeColor: "clay-badge-coral"
  },
  {
    id: "blog-3",
    title: "10 Essential Commands Every Puppy Needs to Learn",
    category: "Training & Behavior",
    author: "Anand Menon (Certified Trainer)",
    readTime: "7 min read",
    views: 5890,
    publishedDate: "01 May 2026",
    snippet: "Positive reinforcement techniques for crate training, leash manners, and stopping destructive chewing.",
    icon: "🎾",
    badgeColor: "clay-badge-green"
  },
];

export default function BlogsPage() {
  const [search, setSearch] = useState("");

  const filtered = BLOGS_DATA.filter((b) => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Pet Health & Editorial Articles
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Publish veterinary-approved nutrition guides, care tips, and store news.
          </p>
        </div>

        <button className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Article</span>
        </button>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Published Articles</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">24</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">All verified by vets</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Total Reader Views</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">48.6K</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Organic store traffic</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Draft Articles</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">3</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Under review</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="clay-card p-3 sm:p-3.5">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title, topic, or keyword..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
        {filtered.map((blog) => (
          <div key={blog.id} className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-3 relative">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${blog.badgeColor} text-2xl text-white shadow-xs`}>
                  {blog.icon}
                </div>

                <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-600">
                  {blog.category}
                </span>
              </div>

              <h3 className="font-fraunces text-base font-bold text-[#2A241E] mt-3 leading-snug">
                {blog.title}
              </h3>

              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                {blog.snippet}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>By {blog.author}</span>
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <Eye className="h-3 w-3 text-slate-400" />
                  {blog.views.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10.5px] text-slate-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {blog.readTime}
                </span>

                <div className="flex items-center gap-1.5">
                  <button className="clay-button px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition">
                    Edit
                  </button>
                  <button className="clay-button px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
