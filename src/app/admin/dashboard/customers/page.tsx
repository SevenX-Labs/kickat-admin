"use client";

import { 
  Users, 
  Search, 
  Download, 
  Eye, 
  Mail, 
  Phone, 
  Heart,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  petProfile: string;
  ordersCount: number;
  totalSpent: number;
  status: "ACTIVE" | "VIP" | "INACTIVE";
  joinedDate: string;
}

const CUSTOMERS_DATA: CustomerItem[] = [
  {
    id: "cust-1",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 98201 44521",
    petProfile: "Golden Retriever (Bruno 🐕)",
    ordersCount: 14,
    totalSpent: 48500,
    status: "VIP",
    joinedDate: "Jan 2025"
  },
  {
    id: "cust-2",
    name: "Rahul Verma",
    email: "rahul.v@outlook.com",
    phone: "+91 98450 12890",
    petProfile: "Persian Cat (Milo 🐈)",
    ordersCount: 8,
    totalSpent: 16200,
    status: "ACTIVE",
    joinedDate: "Mar 2025"
  },
  {
    id: "cust-3",
    name: "Ananya Desai",
    email: "ananya.d@gmail.com",
    phone: "+91 99304 88712",
    petProfile: "Beagle Puppy (Leo 🐕)",
    ordersCount: 6,
    totalSpent: 22400,
    status: "ACTIVE",
    joinedDate: "Feb 2025"
  },
  {
    id: "cust-4",
    name: "Vikram Malhotra",
    email: "vikram.m@gmail.com",
    phone: "+91 97110 54321",
    petProfile: "2 German Shepherds 🐕🐕",
    ordersCount: 19,
    totalSpent: 84900,
    status: "VIP",
    joinedDate: "Nov 2024"
  },
  {
    id: "cust-5",
    name: "Sneha Patil",
    email: "sneha.p@gmail.com",
    phone: "+91 98212 99801",
    petProfile: "Indie Cat (Luna 🐈)",
    ordersCount: 3,
    totalSpent: 4800,
    status: "ACTIVE",
    joinedDate: "Apr 2025"
  },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = CUSTOMERS_DATA.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase()) ||
                          c.petProfile.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Pet Parents & Customers
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Manage pet profiles, repeat buyer loyalty, order history, and customer lifetime value.
          </p>
        </div>

        <button className="clay-button inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto">
          <Download className="h-3.5 w-3.5" />
          <span>Export Customers</span>
        </button>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Total Customers</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">1,240</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">↑ 12% this month</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Repeat Rate</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">64.2%</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">High loyalty</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Avg Order Value</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1 truncate">₹3,420</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">↑ ₹240 vs last mo</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">VIP Pet Club</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">182</p>
          <p className="text-[10px] font-semibold text-amber-600 mt-0.5 truncate">Spend &gt; ₹25,000</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="clay-card p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, pet profile..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {["ALL", "VIP", "ACTIVE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition active:scale-95
                ${filterStatus === st 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }
              `}
            >
              {st === "ALL" ? "All Customers" : st === "VIP" ? "VIP Club" : "Active"}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Customer Cards (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((cust) => (
          <div key={cust.id} className="clay-card p-4 space-y-3 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#635BFF] to-[#8C83FF] text-white text-sm font-bold shadow-xs">
                  {cust.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{cust.name}</h3>
                  <p className="text-[10.5px] text-slate-500 truncate">{cust.petProfile}</p>
                </div>
              </div>

              <span className={`
                px-2 py-0.5 text-[9.5px] font-bold rounded-full shrink-0
                ${cust.status === "VIP" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}
              `}>
                {cust.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Total Orders</span>
                <span className="font-extrabold text-slate-800">{cust.ordersCount} orders</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-medium block">Lifetime Spend</span>
                <span className="text-sm font-black text-slate-900">₹{cust.totalSpent.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
              <div className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 text-slate-400" />
                <span className="truncate">{cust.email}</span>
              </div>
              <Link
                href={`/admin/dashboard/customers/${cust.id}`}
                className="clay-button px-3 py-1 font-bold text-slate-700 hover:text-indigo-600 transition shrink-0"
              >
                Profile
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Responsive Customers Table (>= md) */}
      <div className="clay-card overflow-hidden hidden md:block">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Customer Name</th>
                <th className="py-3 px-4 font-bold">Contact Info</th>
                <th className="py-3 px-4 font-bold">Pet Companions</th>
                <th className="py-3 px-4 font-bold text-center">Orders</th>
                <th className="py-3 px-4 font-bold text-right">Lifetime Spend</th>
                <th className="py-3 px-4 font-bold text-center">Tier</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#8C83FF] text-white text-xs font-bold shadow-xs">
                        {cust.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{cust.name}</p>
                        <p className="text-[10px] text-slate-400">Since {cust.joinedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-800">{cust.email}</p>
                    <p className="text-[10.5px] text-slate-400">{cust.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-lg bg-orange-50 px-2 py-0.5 text-[10.5px] font-semibold text-orange-800 border border-orange-100">
                      {cust.petProfile}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{cust.ordersCount}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ₹{cust.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`
                      inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full
                      ${cust.status === "VIP" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}
                    `}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/dashboard/customers/${cust.id}`}
                      className="clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 transition"
                      title="View Profile"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
