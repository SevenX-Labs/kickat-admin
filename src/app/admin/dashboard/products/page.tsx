"use client";

import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Download,
  Edit,
  Trash2,
  Eye,
  SlidersHorizontal
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "ACTIVE" | "LOW_STOCK" | "OUT_OF_STOCK";
  icon: string;
  badgeClass: string;
  rating: number;
}

const PRODUCTS_DATA: ProductItem[] = [
  {
    id: "prod-1",
    name: "Royal Canin Maxi Puppy Dry Food",
    sku: "RC-MAXI-15KG",
    category: "Dog Nutrition",
    price: 6850,
    stock: 42,
    status: "ACTIVE",
    icon: "🐕",
    badgeClass: "clay-badge-purple",
    rating: 4.9
  },
  {
    id: "prod-2",
    name: "Sheba Fine Flakes Salmon Pouch (Pack of 12)",
    sku: "SHB-SAL-12PK",
    category: "Cat Care",
    price: 960,
    stock: 120,
    status: "ACTIVE",
    icon: "🐈",
    badgeClass: "clay-badge-coral",
    rating: 4.8
  },
  {
    id: "prod-3",
    name: "Kong Classic Extreme Dog Chew Toy (Large)",
    sku: "KONG-EXT-LG",
    category: "Toys & Play",
    price: 1250,
    stock: 5,
    status: "LOW_STOCK",
    icon: "🎾",
    badgeClass: "clay-badge-amber",
    rating: 4.7
  },
  {
    id: "prod-4",
    name: "Nutri-Plus High Calorie Nutritional Gel",
    sku: "VIRB-NUTRI-120G",
    category: "Supplements",
    price: 890,
    stock: 28,
    status: "ACTIVE",
    icon: "💊",
    badgeClass: "clay-badge-green",
    rating: 4.9
  },
  {
    id: "prod-5",
    name: "Bio-Groom Natural Oatmeal Anti-Itch Shampoo",
    sku: "BIO-OAT-355ML",
    category: "Grooming",
    price: 1420,
    stock: 0,
    status: "OUT_OF_STOCK",
    icon: "🛁",
    badgeClass: "clay-badge-blue",
    rating: 4.6
  },
  {
    id: "prod-6",
    name: "SleepyPaws Memory Foam Orthopedic Pet Bed",
    sku: "SLP-BED-XL",
    category: "Beds & Travel",
    price: 4500,
    stock: 14,
    status: "ACTIVE",
    icon: "🛋️",
    badgeClass: "clay-badge-purple",
    rating: 5.0
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filtered = PRODUCTS_DATA.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Products Catalog
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Manage pet inventory, pricing, stock alerts, and catalog variants.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="clay-button hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>

          <Link
            href="/admin/dashboard/products/create"
            className="clay-button inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Total Products</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">1,480</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">↑ 24 this month</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Inventory Value</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1 truncate">₹18.4 Lakh</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Across 6 warehouses</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Low Stock Items</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">18</p>
          <p className="text-[10px] font-semibold text-amber-600 mt-0.5 truncate">Reorder threshold</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Out of Stock</span>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">6</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Needs restock</p>
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
            placeholder="Search by product name, SKU, category..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "ALL", label: "All Items" },
            { id: "ACTIVE", label: "In Stock" },
            { id: "LOW_STOCK", label: "Low Stock" },
            { id: "OUT_OF_STOCK", label: "Out of Stock" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`
                px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition active:scale-95
                ${filterStatus === item.id 
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

      {/* Desktop Table & Mobile Cards */}
      {/* Mobile Card List (< md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((prod) => (
          <div key={prod.id} className="clay-card p-4 space-y-3 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${prod.badgeClass} text-2xl text-white shadow-xs`}>
                  {prod.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">{prod.name}</h3>
                  <p className="text-[10px] font-mono-eyebrow text-slate-400 mt-0.5">{prod.sku}</p>
                </div>
              </div>

              <span className={`
                px-2 py-0.5 text-[9.5px] font-bold rounded-full shrink-0
                ${prod.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70" : ""}
                ${prod.status === "LOW_STOCK" ? "bg-amber-50 text-amber-700 border border-amber-200/70" : ""}
                ${prod.status === "OUT_OF_STOCK" ? "bg-rose-50 text-rose-700 border border-rose-200/70" : ""}
              `}>
                {prod.status === "ACTIVE" && "In Stock"}
                {prod.status === "LOW_STOCK" && "Low Stock"}
                {prod.status === "OUT_OF_STOCK" && "Out of Stock"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Price</span>
                <span className="text-sm font-black text-slate-900">₹{prod.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-medium block">Stock Qty</span>
                <span className="font-extrabold text-slate-700">{prod.stock} units</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Link
                href={`/admin/dashboard/products/${prod.id}`}
                className="clay-button flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Details</span>
              </Link>
              <button className="clay-button flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-orange-600 transition">
                <Edit className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Responsive Table (>= md) */}
      <div className="clay-card overflow-hidden hidden md:block">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Product</th>
                <th className="py-3 px-4 font-bold">SKU</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold text-right">Price</th>
                <th className="py-3 px-4 font-bold text-center">Stock</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${prod.badgeClass} text-base text-white shadow-xs`}>
                        {prod.icon}
                      </div>
                      <div className="min-w-0 max-w-[260px]">
                        <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-[10px] text-amber-500 font-bold">★ {prod.rating}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono-eyebrow text-slate-500">{prod.sku}</td>
                  <td className="py-3 px-4">
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    ₹{prod.price.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {prod.stock}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`
                      inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full
                      ${prod.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70" : ""}
                      ${prod.status === "LOW_STOCK" ? "bg-amber-50 text-amber-700 border border-amber-200/70" : ""}
                      ${prod.status === "OUT_OF_STOCK" ? "bg-rose-50 text-rose-700 border border-rose-200/70" : ""}
                    `}>
                      {prod.status === "ACTIVE" && "In Stock"}
                      {prod.status === "LOW_STOCK" && "Low Stock"}
                      {prod.status === "OUT_OF_STOCK" && "Out of Stock"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/dashboard/products/${prod.id}`}
                        className="clay-button flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-indigo-600 transition"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <button className="clay-button flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-orange-600 transition" title="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
