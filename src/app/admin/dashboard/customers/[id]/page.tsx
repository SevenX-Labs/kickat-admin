"use client";

import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Award, 
  Heart, 
  Calendar, 
  DollarSign, 
  Check, 
  Plus, 
  Clock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useState, use } from "react";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [note, setNote] = useState("Customer Bruno has sensitive digestion; frequently orders gluten-free formulas and bio-groom hypoallergenic shampoos.");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 pb-16">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <Link
            href="/admin/dashboard/customers"
            className="clay-button flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 transition shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-fraunces text-xl sm:text-2xl font-bold tracking-tight text-[#2A241E] truncate">
                Priya Sharma
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0 uppercase">
                VIP Gold Tier
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Customer ID: {resolvedParams.id || "c-101"} • Member since Jan 2024
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <a
            href="mailto:priya.sharma@gmail.com"
            className="clay-button inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Send Email</span>
          </a>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">Lifetime Spend</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">₹42,850</p>
          <p className="text-[10.5px] text-emerald-600 font-semibold mt-0.5">Top 3% customer</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">Total Orders</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">14</p>
          <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">Last order 2 days ago</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">Avg Order Value</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">₹3,060</p>
          <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">2.4 items per cart</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow">Kickat Points</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5">1,240 pts</p>
          <p className="text-[10.5px] text-slate-500 font-semibold mt-0.5">Worth ₹1,240 in store</p>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left 8 Cols: Registered Pets & Order History */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Registered Pets Card */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                  Registered Pets (2)
                </h2>
              </div>
              <span className="text-xs text-slate-400">Personalized Profiles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="clay-inset p-3.5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-xs shrink-0">
                  🐕
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-slate-800">Bruno</h3>
                    <span className="text-[9.5px] font-bold text-slate-400">2 yrs</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Golden Retriever • Male</p>
                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5">Kibble: Royal Canin Maxi</p>
                </div>
              </div>

              <div className="clay-inset p-3.5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl shadow-xs shrink-0">
                  🐱
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-slate-800">Luna</h3>
                    <span className="text-[9.5px] font-bold text-slate-400">1 yr</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Persian Longhair • Female</p>
                  <p className="text-[10px] text-violet-700 font-semibold mt-0.5">Fav: Temptations Treats</p>
                </div>
              </div>
            </div>
          </div>

          {/* Past Orders History */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                Order History
              </h2>
              <span className="text-xs text-slate-400 font-medium">Showing recent 3 orders</span>
            </div>

            <div className="space-y-3">
              {[
                { id: "ORD-9842", date: "Sep 7, 2026", items: 3, total: "₹8,729", status: "SHIPPED", statusColor: "bg-blue-50 text-blue-700 border-blue-200" },
                { id: "ORD-9421", date: "Aug 14, 2026", items: 2, total: "₹3,450", status: "DELIVERED", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { id: "ORD-8910", date: "Jul 22, 2026", items: 4, total: "₹9,120", status: "DELIVERED", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              ].map((ord) => (
                <div key={ord.id} className="clay-inset p-3 sm:p-3.5 flex items-center justify-between min-w-0">
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600">{ord.id}</span>
                      <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded-full border ${ord.statusColor}`}>
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {ord.date} • {ord.items} pet items
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-xs sm:text-sm font-extrabold text-[#2A241E]">{ord.total}</span>
                    <Link
                      href={`/admin/dashboard/orders/${ord.id}`}
                      className="clay-button p-1.5 text-slate-500 hover:text-orange-600 rounded-lg"
                      title="View order"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Contact Details & Internal Notes */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          
          {/* Customer Details */}
          <div className="clay-card p-4 sm:p-5 space-y-3.5">
            <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E] pb-2 border-b border-slate-100">
              Contact & Address
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">priya.sharma@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>+91 98201 45892</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Flat 402, Oakwood Heights, Hiranandani Estate, Ghodbunder Rd, Thane West, Mumbai, MH - 400607
                </p>
              </div>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="clay-card p-4 sm:p-5 space-y-3">
            <h3 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E] pb-2 border-b border-slate-100">
              Admin & Pet Notes
            </h3>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              type="button"
              onClick={() => showToast("Admin note saved successfully!")}
              className="clay-button w-full py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
            >
              Save Internal Note
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
