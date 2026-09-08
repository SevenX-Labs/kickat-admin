"use client";

import { 
  Megaphone, 
  Plus, 
  Tag, 
  Calendar, 
  TrendingUp, 
  Copy, 
  Check, 
  Clock, 
  Sparkles,
  Percent
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CampaignItem {
  id: string;
  title: string;
  code: string;
  discount: string;
  usedCount: number;
  totalLimit: number;
  expiry: string;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED";
  colorClass: string;
}

const CAMPAIGNS_DATA: CampaignItem[] = [
  {
    id: "camp-1",
    title: "Monsoon Pet Care Flash Sale",
    code: "MONSOON20",
    discount: "20% OFF",
    usedCount: 412,
    totalLimit: 500,
    expiry: "Ends in 2 days",
    status: "ACTIVE",
    colorClass: "clay-badge-purple"
  },
  {
    id: "camp-2",
    title: "New Puppy Starter Kit Special",
    code: "PUPPYLOVE",
    discount: "Flat ₹500 OFF",
    usedCount: 184,
    totalLimit: 300,
    expiry: "Valid till 30 May",
    status: "ACTIVE",
    colorClass: "clay-badge-coral"
  },
  {
    id: "camp-3",
    title: "Free Express Shipping Across India",
    code: "FREESHIP",
    discount: "Zero Delivery Fee",
    usedCount: 890,
    totalLimit: 1000,
    expiry: "Valid for orders > ₹999",
    status: "ACTIVE",
    colorClass: "clay-badge-green"
  },
  {
    id: "camp-4",
    title: "Summer Gourmet Cat Feast",
    code: "FEAST15",
    discount: "15% OFF",
    usedCount: 250,
    totalLimit: 250,
    expiry: "Expired yesterday",
    status: "EXPIRED",
    colorClass: "clay-badge-amber"
  }
];

export default function CampaignsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Marketing Campaigns & Coupons
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Drive conversions with promotional coupon codes, discounts, and flash sales.
          </p>
        </div>

        <button className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto">
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Active Promos</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">3</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">Live right now</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Coupons Redeemed</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">1,486</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Total customer uses</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Discount Given</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1 truncate">₹2.45 Lakh</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Generated ₹14.8L sales</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Conversion Lift</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">+24.8%</p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5 truncate">vs non-promo days</p>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
        {CAMPAIGNS_DATA.map((camp) => (
          <div key={camp.id} className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-3 relative overflow-hidden">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className={`
                    px-2.5 py-0.5 text-[9.5px] font-bold rounded-full inline-block mb-1.5
                    ${camp.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}
                  `}>
                    {camp.status}
                  </span>
                  <h3 className="font-fraunces text-base font-bold text-[#2A241E] leading-tight truncate">
                    {camp.title}
                  </h3>
                </div>

                <div className={`${camp.colorClass} px-3 py-1 text-xs font-black text-white rounded-xl shadow-xs shrink-0`}>
                  {camp.discount}
                </div>
              </div>

              {/* Coupon Code Pill */}
              <div className="mt-3 flex items-center justify-between bg-[#F8F5F1] p-2.5 rounded-2xl border border-dashed border-orange-200">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-orange-600" />
                  <span className="font-mono-eyebrow font-extrabold text-sm text-slate-900 tracking-wider">
                    {camp.code}
                  </span>
                </div>

                <button
                  onClick={() => copyToClipboard(camp.code)}
                  className="clay-button flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-orange-600 transition"
                >
                  {copiedCode === camp.code ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Usage Progress */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Usage: {camp.usedCount} / {camp.totalLimit} used</span>
                  <span className="font-bold text-slate-800">
                    {Math.round((camp.usedCount / camp.totalLimit) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                    style={{ width: `${(camp.usedCount / camp.totalLimit) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                <span>{camp.expiry}</span>
              </span>

              <button className="clay-button px-3 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 transition">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
