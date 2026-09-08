"use client";

import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  petType: string;
  itemCount: number;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PAID" | "COD" | "FAILED";
  date: string;
}

const ORDERS_DATA: OrderItem[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-94821",
    customerName: "Priya Sharma",
    customerEmail: "priya.s@gmail.com",
    petType: "Golden Retriever 🐕",
    itemCount: 3,
    totalAmount: 7850,
    status: "PROCESSING",
    paymentStatus: "PAID",
    date: "Today, 10:45 AM"
  },
  {
    id: "ord-2",
    orderNumber: "ORD-94820",
    customerName: "Rahul Verma",
    customerEmail: "rahul.v@outlook.com",
    petType: "Persian Cat 🐈",
    itemCount: 2,
    totalAmount: 1920,
    status: "SHIPPED",
    paymentStatus: "PAID",
    date: "Today, 09:12 AM"
  },
  {
    id: "ord-3",
    orderNumber: "ORD-94819",
    customerName: "Ananya Desai",
    customerEmail: "ananya.d@gmail.com",
    petType: "Beagle Puppy 🐕",
    itemCount: 1,
    totalAmount: 6850,
    status: "DELIVERED",
    paymentStatus: "PAID",
    date: "Yesterday"
  },
  {
    id: "ord-4",
    orderNumber: "ORD-94818",
    customerName: "Vikram Malhotra",
    customerEmail: "vikram.m@gmail.com",
    petType: "Labrador 🐕",
    itemCount: 4,
    totalAmount: 3450,
    status: "PENDING",
    paymentStatus: "COD",
    date: "Yesterday"
  },
  {
    id: "ord-5",
    orderNumber: "ORD-94817",
    customerName: "Sneha Patil",
    customerEmail: "sneha.p@gmail.com",
    petType: "Indie Cat 🐈",
    itemCount: 2,
    totalAmount: 1450,
    status: "CANCELLED",
    paymentStatus: "FAILED",
    date: "16 May 2026"
  },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const filtered = ORDERS_DATA.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          o.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Orders & Fulfillment
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Track customer orders, packing slips, dispatch logistics, and payment receipts.
          </p>
        </div>

        <button className="clay-button inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto">
          <Download className="h-3.5 w-3.5" />
          <span>Export Orders</span>
        </button>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Total Orders</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">842</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">↑ 18.4% this month</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Pending Dispatch</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">38</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Awaiting warehouse</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">In Transit</span>
          <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">64</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Couriers on road</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Delivered</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">712</p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5 truncate">98.2% on-time</p>
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
            placeholder="Search by order ID, customer name, email..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition active:scale-95
                ${selectedStatus === st 
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

      {/* Mobile Order Cards (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((ord) => (
          <div key={ord.id} className="clay-card p-4 space-y-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-black font-mono-eyebrow text-slate-900">{ord.orderNumber}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{ord.date}</p>
              </div>

              <span className={`
                px-2.5 py-0.5 text-[9.5px] font-bold rounded-full
                ${ord.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : ""}
                ${ord.status === "SHIPPED" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : ""}
                ${ord.status === "PROCESSING" ? "bg-amber-50 text-amber-700 border border-amber-200" : ""}
                ${ord.status === "PENDING" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}
                ${ord.status === "CANCELLED" ? "bg-rose-50 text-rose-700 border border-rose-200" : ""}
              `}>
                {ord.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div>
                <p className="font-bold text-slate-800">{ord.customerName}</p>
                <p className="text-[10px] text-slate-400">{ord.petType}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">₹{ord.totalAmount.toLocaleString("en-IN")}</p>
                <span className="text-[9.5px] font-bold text-slate-500 uppercase">{ord.paymentStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Link
                href={`/admin/dashboard/orders/${ord.id}`}
                className="clay-button flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>View Order</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Responsive Orders Table (>= md) */}
      <div className="clay-card overflow-hidden hidden md:block">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Order ID</th>
                <th className="py-3 px-4 font-bold">Customer & Pet</th>
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold text-center">Items</th>
                <th className="py-3 px-4 font-bold text-right">Total</th>
                <th className="py-3 px-4 font-bold text-center">Payment</th>
                <th className="py-3 px-4 font-bold text-center">Fulfillment</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                  <td className="py-3 px-4 font-bold font-mono-eyebrow text-slate-900">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{ord.customerName}</p>
                    <p className="text-[10.5px] text-slate-400">{ord.petType}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{ord.date}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">{ord.itemCount}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ₹{ord.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`
                      inline-block px-2 py-0.5 text-[9.5px] font-bold rounded-md uppercase
                      ${ord.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700" : ""}
                      ${ord.paymentStatus === "COD" ? "bg-amber-50 text-amber-700" : ""}
                      ${ord.paymentStatus === "FAILED" ? "bg-rose-50 text-rose-700" : ""}
                    `}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`
                      inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full
                      ${ord.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : ""}
                      ${ord.status === "SHIPPED" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : ""}
                      ${ord.status === "PROCESSING" ? "bg-amber-50 text-amber-700 border border-amber-200" : ""}
                      ${ord.status === "PENDING" ? "bg-orange-50 text-orange-700 border border-orange-200" : ""}
                      ${ord.status === "CANCELLED" ? "bg-rose-50 text-rose-700 border border-rose-200" : ""}
                    `}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/dashboard/orders/${ord.id}`}
                      className="clay-button inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 transition"
                      title="View Details"
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
