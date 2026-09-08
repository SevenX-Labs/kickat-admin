"use client";

import { 
  Star, 
  Search, 
  ThumbsUp, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  ShieldCheck,
  MoreVertical,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ReviewItem {
  id: string;
  customerName: string;
  petTag: string;
  productName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  status: "APPROVED" | "PENDING";
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: "rev-1",
    customerName: "Dr. Meera Nambiar",
    petTag: "2 Golden Retrievers 🐕",
    productName: "Royal Canin Maxi Puppy (15kg)",
    rating: 5,
    date: "Today, 11:20 AM",
    comment: "My puppies thrive on this food! Noticeable difference in their coat shine and energy levels. Arrived in pristine condition in less than 24 hours.",
    verified: true,
    status: "APPROVED"
  },
  {
    id: "rev-2",
    customerName: "Kunal Singhania",
    petTag: "Beagle (Tyson 🐕)",
    productName: "Kong Classic Extreme Dog Chew Toy",
    rating: 5,
    date: "Yesterday",
    comment: "Indestructible! Tyson usually shreds chew toys within minutes, but the Kong has survived 3 weeks without a scratch. Highly recommended for heavy chewers.",
    verified: true,
    status: "APPROVED"
  },
  {
    id: "rev-3",
    customerName: "Tanvi Saxena",
    petTag: "Persian Kitten (Marshmallow 🐈)",
    productName: "Sheba Fine Flakes Salmon Gravy",
    rating: 4,
    date: "15 May 2026",
    comment: "Very palatable, she finished the entire pouch in one sitting. Smell is mild and gravy consistency is just right.",
    verified: true,
    status: "PENDING"
  },
  {
    id: "rev-4",
    customerName: "Aakash Mehta",
    petTag: "Indie Pup (Chintu 🐕)",
    productName: "Bio-Groom Natural Oatmeal Anti-Itch Shampoo",
    rating: 5,
    date: "14 May 2026",
    comment: "Immediate relief from monsoon itching and ticks. Clean fragrance that lasts for days without irritating his sensitive skin.",
    verified: true,
    status: "APPROVED"
  }
];

export default function ReviewsPage() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | 0>(0);

  const filtered = REVIEWS_DATA.filter((r) => {
    const matchesSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          r.productName.toLowerCase().includes(search.toLowerCase()) ||
                          r.comment.toLowerCase().includes(search.toLowerCase());
    const matchesRating = ratingFilter === 0 || r.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Customer Reviews & Ratings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Moderate pet parent testimonials, verified buyer feedback, and product ratings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="clay-badge-amber px-3.5 py-1.5 text-xs font-black text-white flex items-center gap-1.5 shadow-sm">
            <span>4.8</span>
            <Star className="h-3.5 w-3.5 fill-white" />
            <span className="text-[10px] font-bold text-amber-100">(2,840)</span>
          </span>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">5-Star Satisfaction</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">84.5%</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">↑ 3.2% this quarter</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Pending Review</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">8</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Needs moderation</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Verified Buyers</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">96.8%</p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5 truncate">OTP confirmed</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Photo Reviews</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">420</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">User photos attached</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="clay-card p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by product, customer, or feedback..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { label: "All Ratings", val: 0 },
            { label: "5 ★", val: 5 },
            { label: "4 ★", val: 4 },
            { label: "3 ★", val: 3 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setRatingFilter(item.val)}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition active:scale-95
                ${ratingFilter === item.val 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
        {filtered.map((rev) => (
          <div key={rev.id} className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-3">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{rev.customerName}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-orange-600 font-semibold mt-0.5">{rev.petTag}</p>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-1 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3.5 w-3.5 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} 
                    />
                  ))}
                </div>
              </div>

              {/* Product title */}
              <p className="text-xs font-bold text-slate-700 mt-2 truncate">
                Product: <span className="text-indigo-600 underline font-normal">{rev.productName}</span>
              </p>

              {/* Comment */}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-[#FAF7F3] p-3 rounded-2xl border border-slate-100 font-normal">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              <span>{rev.date}</span>

              <div className="flex items-center gap-1.5">
                <button className="clay-button px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition">
                  Feature
                </button>
                <button className="clay-button px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
