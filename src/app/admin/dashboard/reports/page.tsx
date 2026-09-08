"use client";

import { 
  PieChart, 
  Download, 
  Calendar, 
  FileText, 
  ArrowUpRight, 
  Check, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  Filter, 
  ShieldCheck,
  Building2,
  Receipt
} from "lucide-react";
import { useState } from "react";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownload = (reportName: string, format: "CSV" | "PDF") => {
    setDownloading(`${reportName}-${format}`);
    setTimeout(() => {
      setDownloading(null);
      showToast(`Downloaded ${reportName} (${format})`);
    }, 1000);
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
            Executive & Tax Reports
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Download accounting ledgers, GST tax reconciliation, inventory turnover, and sales audits.
          </p>
        </div>

        {/* Date Selector & Export All */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-2xl bg-white border border-slate-200/80 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 shadow-xs cursor-pointer"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Q3 2026">Q3 2026 (Current)</option>
            <option value="FY 2025-26">FY 2025-26 (Full Year)</option>
          </select>

          <button
            onClick={() => handleDownload("Comprehensive Executive Summary", "PDF")}
            className="clay-button inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>Export Master PDF</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Gross Sales</span>
            <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">₹42.85 L</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 mt-0.5 truncate">↑ 18.4% vs last period</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">GST Collected</span>
            <Receipt className="h-4 w-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">₹6.52 L</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Across 5%, 12% & 18% slabs</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Avg Cart Value</span>
            <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">₹2,840</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">2.6 items per checkout</p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-1 text-slate-500">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Net Margin</span>
            <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">23.4%</p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">After gateway & fulfillment</p>
        </div>
      </div>

      {/* Reports Catalog Grid */}
      <div className="clay-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
              Audited Financial & Operations Downloads
            </h2>
            <p className="text-xs text-slate-500">Ready-to-file spreadsheets and accounting exports</p>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400">
            Current Period: {timeRange}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {[
            {
              id: "gst-r1",
              title: "GST-R1 & GST-R3B Tax Ledger",
              desc: "B2C itemized sales invoices with state codes, HSN summaries, CGST, SGST, and IGST breakdowns.",
              category: "Compliance & Tax",
              frequency: "Monthly",
              size: "1.4 MB",
              icon: Building2,
              color: "bg-indigo-500",
            },
            {
              id: "cat-margin",
              title: "Category Sales & Product Margins",
              desc: "Gross revenue, cost of goods sold (COGS), profit margins, and return rates per pet category.",
              category: "Catalog Performance",
              frequency: "Weekly",
              size: "820 KB",
              icon: PieChart,
              color: "bg-orange-500",
            },
            {
              id: "pg-recon",
              title: "Payment Gateway Reconciliation",
              desc: "Razorpay, UPI and COD settlement ledger, MDR gateway processing deductions, and refund credits.",
              category: "Banking & Settlement",
              frequency: "Daily",
              size: "640 KB",
              icon: Receipt,
              color: "bg-emerald-500",
            },
            {
              id: "inv-turnover",
              title: "Inventory Turnover & Expiry Audit",
              desc: "Warehouse stock valuation, days of supply remaining, batch numbers, and upcoming food expiry alerts.",
              category: "Logistics & Supply",
              frequency: "Bi-Weekly",
              size: "1.1 MB",
              icon: FileSpreadsheet,
              color: "bg-amber-500",
            },
          ].map((rep) => {
            const Icon = rep.icon;
            return (
              <div key={rep.id} className="clay-inset p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-xl ${rep.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase font-mono-eyebrow">
                        {rep.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                      {rep.frequency}
                    </span>
                  </div>

                  <h3 className="font-fraunces text-sm font-bold text-[#2A241E]">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {rep.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono font-medium">Size: {rep.size}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(rep.title, "CSV")}
                      disabled={downloading === `${rep.title}-CSV`}
                      className="clay-button px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
                    >
                      {downloading === `${rep.title}-CSV` ? "Generating..." : "CSV"}
                    </button>
                    <button
                      onClick={() => handleDownload(rep.title, "PDF")}
                      disabled={downloading === `${rep.title}-PDF`}
                      className="clay-button px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
                    >
                      {downloading === `${rep.title}-PDF` ? "Generating..." : "PDF"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GST Slabs Breakdown Summary */}
      <div className="clay-card p-4 sm:p-6 space-y-4">
        <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
          GST Tax Slab Breakdown (Current Period)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="clay-inset p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">0% Exempt Goods</span>
            <p className="text-sm font-black text-slate-800">₹1,24,000</p>
            <p className="text-[10px] text-slate-500">Tax: ₹0 (Fresh Pet Meat)</p>
          </div>
          <div className="clay-inset p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">5% Slab (Kibble Base)</span>
            <p className="text-sm font-black text-slate-800">₹4,80,000</p>
            <p className="text-[10px] text-emerald-600 font-bold">Tax: ₹24,000</p>
          </div>
          <div className="clay-inset p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">12% (Supplements)</span>
            <p className="text-sm font-black text-slate-800">₹8,40,000</p>
            <p className="text-[10px] text-emerald-600 font-bold">Tax: ₹1,00,800</p>
          </div>
          <div className="clay-inset p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">18% (Standard Pet Goods)</span>
            <p className="text-sm font-black text-slate-800">₹28,41,000</p>
            <p className="text-[10px] text-emerald-600 font-bold">Tax: ₹5,11,380</p>
          </div>
        </div>
      </div>

    </div>
  );
}
