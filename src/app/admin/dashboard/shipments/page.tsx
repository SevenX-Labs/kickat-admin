"use client";

import { 
  Truck, 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  PackageCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ShipmentItem {
  id: string;
  trackingNumber: string;
  orderNumber: string;
  courier: string;
  destination: string;
  customerName: string;
  dispatchDate: string;
  estDelivery: string;
  status: "OUT_FOR_DELIVERY" | "IN_TRANSIT" | "DELIVERED" | "EXCEPTION";
}

const SHIPMENTS_DATA: ShipmentItem[] = [
  {
    id: "shp-1",
    trackingNumber: "BD-889410291",
    orderNumber: "ORD-94820",
    courier: "Blue Dart Air",
    destination: "Mumbai, Maharashtra",
    customerName: "Rahul Verma",
    dispatchDate: "Today, 08:30 AM",
    estDelivery: "Tomorrow, by 2 PM",
    status: "IN_TRANSIT"
  },
  {
    id: "shp-2",
    trackingNumber: "DEL-441209581",
    orderNumber: "ORD-94819",
    courier: "Delhivery Surface",
    destination: "Bengaluru, Karnataka",
    customerName: "Ananya Desai",
    dispatchDate: "16 May 2026",
    estDelivery: "Today, by 6 PM",
    status: "OUT_FOR_DELIVERY"
  },
  {
    id: "shp-3",
    trackingNumber: "SHD-190284712",
    orderNumber: "ORD-94816",
    courier: "Shadowfax Express",
    destination: "Delhi NCR",
    customerName: "Rohan Khanna",
    dispatchDate: "15 May 2026",
    estDelivery: "Delivered at 11:30 AM",
    status: "DELIVERED"
  },
  {
    id: "shp-4",
    trackingNumber: "DTDC-992014728",
    orderNumber: "ORD-94814",
    courier: "DTDC Prime",
    destination: "Pune, Maharashtra",
    customerName: "Deepak Joshi",
    dispatchDate: "14 May 2026",
    estDelivery: "Address Verification Needed",
    status: "EXCEPTION"
  },
];

export default function ShipmentsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const filtered = SHIPMENTS_DATA.filter((s) => {
    const matchesSearch = s.trackingNumber.toLowerCase().includes(search.toLowerCase()) || 
                          s.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          s.destination.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Shipments & Logistics
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Monitor pet supplies fulfillment, courier partner API handoffs, and live dispatch tracking.
          </p>
        </div>

        <button className="clay-button inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition self-start sm:self-auto">
          <Truck className="h-3.5 w-3.5 text-indigo-600" />
          <span>Dispatch Waybills</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Active Dispatches</span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">64</p>
          <p className="text-[10px] font-semibold text-[#20BF6B] mt-0.5 truncate">Across 14 cities</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Out for Delivery</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">22</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Reaching today</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Delivered Today</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">45</p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5 truncate">99.4% SLA</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">Transit Issues</span>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-1">2</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">Requires support</p>
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
            placeholder="Search tracking number, order ID, city..."
            className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 py-2 pl-10 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {["ALL", "OUT_FOR_DELIVERY", "IN_TRANSIT", "DELIVERED", "EXCEPTION"].map((st) => (
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
              {st === "OUT_FOR_DELIVERY" ? "Out for Delivery" : st === "IN_TRANSIT" ? "In Transit" : st === "EXCEPTION" ? "Alerts" : st === "DELIVERED" ? "Delivered" : "All Shipments"}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Shipment Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((shp) => (
          <div key={shp.id} className="clay-card p-4 space-y-3 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-black font-mono-eyebrow text-slate-900">{shp.trackingNumber}</span>
                <p className="text-[11px] text-indigo-600 font-bold mt-0.5">{shp.courier}</p>
              </div>

              <span className={`
                px-2.5 py-0.5 text-[9.5px] font-bold rounded-full
                ${shp.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : ""}
                ${shp.status === "OUT_FOR_DELIVERY" ? "bg-amber-50 text-amber-700 border border-amber-200" : ""}
                ${shp.status === "IN_TRANSIT" ? "bg-blue-50 text-blue-700 border border-blue-200" : ""}
                ${shp.status === "EXCEPTION" ? "bg-rose-50 text-rose-700 border border-rose-200" : ""}
              `}>
                {shp.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="text-xs pt-1 border-t border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{shp.destination}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>{shp.orderNumber} ({shp.customerName})</span>
                <span className="font-bold text-slate-700">{shp.estDelivery}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Responsive Table */}
      <div className="clay-card overflow-hidden hidden md:block">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF7F3] text-slate-400 font-mono-eyebrow text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Tracking #</th>
                <th className="py-3 px-4 font-bold">Courier & Order</th>
                <th className="py-3 px-4 font-bold">Destination</th>
                <th className="py-3 px-4 font-bold">Dispatch Date</th>
                <th className="py-3 px-4 font-bold">Est. Delivery</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((shp) => (
                <tr key={shp.id} className="hover:bg-[#FAF7F3]/70 transition-colors">
                  <td className="py-3 px-4 font-bold font-mono-eyebrow text-slate-900">
                    {shp.trackingNumber}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{shp.courier}</p>
                    <p className="text-[10.5px] text-slate-400">{shp.orderNumber} • {shp.customerName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{shp.destination}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{shp.dispatchDate}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{shp.estDelivery}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`
                      inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full
                      ${shp.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : ""}
                      ${shp.status === "OUT_FOR_DELIVERY" ? "bg-amber-50 text-amber-700 border border-amber-200" : ""}
                      ${shp.status === "IN_TRANSIT" ? "bg-blue-50 text-blue-700 border border-blue-200" : ""}
                      ${shp.status === "EXCEPTION" ? "bg-rose-50 text-rose-700 border border-rose-200" : ""}
                    `}>
                      {shp.status.replace(/_/g, " ")}
                    </span>
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
