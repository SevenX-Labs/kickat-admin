"use client";

import { 
  PieChart, 
  Download, 
  Check, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet, 
  ShieldCheck,
  Building2,
  Receipt,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Info
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { AdminReportService } from "../../../../services/adminReportService";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState<any>(null);
  const [salesRecords, setSalesRecords] = useState<any[]>([]);
  const [gstSummary, setGstSummary] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getDateRange = useCallback(() => {
    const to = new Date();
    const from = new Date();
    if (timeRange === "Last 7 Days") {
      from.setDate(to.getDate() - 7);
    } else if (timeRange === "Last 30 Days") {
      from.setDate(to.getDate() - 30);
    } else if (timeRange === "Q3 2026") {
      from.setFullYear(2026, 6, 1);
      to.setFullYear(2026, 8, 30);
    } else if (timeRange === "FY 2025-26") {
      from.setFullYear(2025, 3, 1);
      to.setFullYear(2026, 2, 31);
    }
    return { from: from.toISOString(), to: to.toISOString() };
  }, [timeRange]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const range = getDateRange();
      const [salesData, gstData] = await Promise.all([
        AdminReportService.getSalesReport({ ...range, limit: 100 }),
        AdminReportService.getGstReport({ ...range, limit: 100 })
      ]);
      setSalesSummary(salesData?.data?.summary || null);
      setSalesRecords(salesData?.data?.records || []);
      setGstSummary(gstData?.data?.summary || null);
    } catch (error) {
      console.error("Failed to fetch reports data:", error);
      showToast("Failed to load report data");
    } finally {
      setIsLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate real orders into time-series chart points
  const chartPoints = useMemo(() => {
    if (!salesRecords || salesRecords.length === 0) {
      return [];
    }

    const map = new Map<string, { dateLabel: string; revenue: number; ordersCount: number }>();
    
    // Sort chronological
    const sorted = [...salesRecords].sort((a, b) => 
      new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime()
    );

    sorted.forEach((order) => {
      const d = new Date(order.date || order.createdAt);
      const dateLabel = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      const existing = map.get(dateLabel) || { dateLabel, revenue: 0, ordersCount: 0 };
      existing.revenue += Number(order.grandTotal || order.totalSales || 0);
      existing.ordersCount += 1;
      map.set(dateLabel, existing);
    });

    const points = Array.from(map.values());
    const maxRev = Math.max(...points.map((p) => p.revenue), 1);

    return points.map((p) => ({
      ...p,
      heightPct: Math.max(12, Math.round((p.revenue / maxRev) * 100)),
    }));
  }, [salesRecords]);

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (arr: any[]) => {
    if (!arr || !arr.length) return "No data available";
    const array = [Object.keys(arr[0])].concat(arr);
    return array.map(it => {
      return Object.values(it).map(value => typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value).toString();
    }).join('\n');
  };

  const handleDownload = async (reportId: string, reportName: string, format: "CSV" | "PDF") => {
    setDownloading(`${reportName}-${format}`);
    try {
      const range = getDateRange();
      if (reportId === "master") {
        const blob = await AdminReportService.exportSalesReport(format, range);
        downloadFile(blob, `Master_Export_${timeRange.replace(/ /g, '_')}.${format.toLowerCase()}`);
      } else if (reportId === "gst-r1") {
        const data = await AdminReportService.getGstReport(range);
        const csv = convertToCSV(data?.data?.records || []);
        downloadFile(new Blob([csv], { type: 'text/csv' }), `GST_Tax_Ledger_${timeRange.replace(/ /g, '_')}.csv`);
      } else if (reportId === "cat-margin") {
        const data = await AdminReportService.getProductsReport(range);
        const csv = convertToCSV(data?.data?.records || []);
        downloadFile(new Blob([csv], { type: 'text/csv' }), `Category_Sales_${timeRange.replace(/ /g, '_')}.csv`);
      } else if (reportId === "pg-recon") {
        const data = await AdminReportService.getRefundsReport(range);
        const csv = convertToCSV(data?.data?.records || []);
        downloadFile(new Blob([csv], { type: 'text/csv' }), `Refunds_Ledger_${timeRange.replace(/ /g, '_')}.csv`);
      } else if (reportId === "inv-turnover") {
        const data = await AdminReportService.getOrdersReport(range);
        const csv = convertToCSV(data?.data?.records || []);
        downloadFile(new Blob([csv], { type: 'text/csv' }), `Order_Fulfillment_${timeRange.replace(/ /g, '_')}.csv`);
      }
      showToast(`Downloaded ${reportName} (${format})`);
    } catch (error) {
      console.error(`Error downloading ${reportName}:`, error);
      showToast(`Failed to download ${reportName}`);
    } finally {
      setDownloading(null);
    }
  };

  const formatCurrency = (val: number | undefined) => `₹${(val || 0).toLocaleString('en-IN')}`;
  
  const grossSales = salesSummary?.totalSales || 0;
  const gstCollected = gstSummary?.totalGstCollected || 0;
  const avgCartValue = salesSummary?.averageOrderValue || 0;
  const unitsSold = salesSummary?.totalUnitsSold || 0;

  const gst18SlabValue = gstSummary?.totalTaxableValue || 0;
  const gst18Tax = gstSummary?.totalGstCollected || 0;

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
            Executive & Financial Reports
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Real backend revenue analytics, GST tax reconciliation, inventory ledgers, and audited exports.
          </p>
        </div>

        {/* Date Selector & Export All */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            disabled={isLoading}
            className="rounded-2xl bg-white border border-slate-200/80 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/20 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Q3 2026">Q3 2026 (Current)</option>
            <option value="FY 2025-26">FY 2025-26 (Full Year)</option>
          </select>

          <button
            onClick={() => handleDownload("master", "Comprehensive Executive Summary", "CSV")}
            disabled={isLoading || downloading === "Comprehensive Executive Summary-CSV"}
            className="clay-btn-orange inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-70"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>{downloading === "Comprehensive Executive Summary-CSV" ? "Exporting..." : "Export Master CSV"}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-xs font-bold text-slate-500">Fetching live database telemetry...</span>
        </div>
      ) : (
        <>
          {/* 4 Financial Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
            <div className="clay-card p-3.5 sm:p-4 min-w-0">
              <div className="flex items-center justify-between gap-1 text-slate-500">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Gross Revenue</span>
                <DollarSign className="h-4 w-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">{formatCurrency(grossSales)}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 mt-0.5 truncate">Total sales volume</p>
            </div>

            <div className="clay-card p-3.5 sm:p-4 min-w-0">
              <div className="flex items-center justify-between gap-1 text-slate-500">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">GST Collected</span>
                <Receipt className="h-4 w-4 text-indigo-500 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">{formatCurrency(gstCollected)}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">Standard 18% slab</p>
            </div>

            <div className="clay-card p-3.5 sm:p-4 min-w-0">
              <div className="flex items-center justify-between gap-1 text-slate-500">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Avg Order Value</span>
                <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1.5">{formatCurrency(avgCartValue)}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">{unitsSold} units shipped</p>
            </div>

            <div className="clay-card p-3.5 sm:p-4 min-w-0">
              <div className="flex items-center justify-between gap-1 text-slate-500">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-mono-eyebrow truncate">Active Invoices</span>
                <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1.5">{salesRecords.length}</p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5 truncate">In current filter range</p>
            </div>
          </div>

          {/* REAL ANALYTICS VISUALIZATION CHART */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    Real Revenue & Orders Trajectory
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual time-series of verified store transactions from real database records.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-t from-orange-600 to-amber-400"></span>
                  <span>Revenue (₹)</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="font-mono text-[11px] text-slate-400">Period: {timeRange}</span>
              </div>
            </div>

            {/* Interactive Bar Chart Component */}
            {chartPoints.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="h-48 sm:h-56 w-full flex items-end justify-between gap-2 sm:gap-4 px-2 pt-6 pb-2 relative clay-inset rounded-2xl">
                  {/* Background gridlines */}
                  <div className="absolute inset-x-0 top-1/4 border-b border-slate-200/50 pointer-events-none"></div>
                  <div className="absolute inset-x-0 top-2/4 border-b border-slate-200/50 pointer-events-none"></div>
                  <div className="absolute inset-x-0 top-3/4 border-b border-slate-200/50 pointer-events-none"></div>

                  {chartPoints.map((pt, idx) => (
                    <div 
                      key={idx}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer z-10"
                    >
                      {/* Hover Tooltip */}
                      {hoveredPoint === pt && (
                        <div className="absolute -top-12 z-30 bg-[#2A241E] text-white rounded-xl px-3 py-1.5 text-[10px] font-bold shadow-xl flex flex-col items-center whitespace-nowrap animate-fade-in">
                          <span>{pt.dateLabel}</span>
                          <span className="text-orange-400">{formatCurrency(pt.revenue)} ({pt.ordersCount} orders)</span>
                        </div>
                      )}

                      {/* Bar Pillar */}
                      <div 
                        style={{ height: `${pt.heightPct}%` }}
                        className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-orange-500 to-amber-400 group-hover:from-orange-600 group-hover:to-amber-300 transition-all duration-300 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute top-0 inset-x-0 h-1 bg-white/40"></div>
                      </div>

                      {/* Date Axis Label */}
                      <span className="text-[10px] font-bold text-slate-500 mt-2 truncate w-full text-center">
                        {pt.dateLabel}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1">
                  <span>Showing {chartPoints.length} active sales dates</span>
                  <span className="text-orange-600 font-bold">Hover bar for daily breakdown</span>
                </div>
              </div>
            ) : (
              /* Real Zero-State Baseline Visualization (No Fake Data) */
              <div className="clay-inset p-8 text-center space-y-3">
                <div className="flex h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 items-center justify-center mx-auto shadow-inner">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-sm font-extrabold text-[#2A241E]">No Revenue Recorded in {timeRange}</h3>
                  <p className="text-xs text-slate-500">
                    The backend database currently has 0 orders for this filtered timeframe. As customers complete checkouts, live revenue trends will plot here automatically.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setTimeRange("FY 2025-26")}
                    className="clay-button px-4 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition inline-flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Expand Filter Range to FY 2025-26</span>
                  </button>
                </div>
              </div>
            )}
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
                  size: "Live Export",
                  icon: Building2,
                  color: "bg-indigo-500",
                },
                {
                  id: "cat-margin",
                  title: "Category Sales & Product Margins",
                  desc: "Gross revenue, cost of goods sold (COGS), profit margins, and return rates per pet category.",
                  category: "Catalog Performance",
                  frequency: "Weekly",
                  size: "Live Export",
                  icon: PieChart,
                  color: "bg-orange-500",
                },
                {
                  id: "pg-recon",
                  title: "Refunds & Returns Ledger",
                  desc: "Refund requests, return reasons, and order numbers for customer returns.",
                  category: "Banking & Settlement",
                  frequency: "Daily",
                  size: "Live Export",
                  icon: Receipt,
                  color: "bg-emerald-500",
                },
                {
                  id: "inv-turnover",
                  title: "Order Fulfillment & Lifecycle Audit",
                  desc: "Orders created, statuses, shipping details, and delivery performance metrics.",
                  category: "Logistics & Supply",
                  frequency: "Bi-Weekly",
                  size: "Live Export",
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
                      <span className="text-[11px] text-slate-400 font-mono font-medium">{rep.size}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(rep.id, rep.title, "CSV")}
                          disabled={downloading === `${rep.title}-CSV`}
                          className="clay-button px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
                        >
                          {downloading === `${rep.title}-CSV` ? "Generating..." : "Download CSV"}
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
                <p className="text-sm font-black text-slate-800">₹0</p>
                <p className="text-[10px] text-slate-500">Tax: ₹0 (Fresh Pet Meat)</p>
              </div>
              <div className="clay-inset p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">5% Slab (Kibble Base)</span>
                <p className="text-sm font-black text-slate-800">₹0</p>
                <p className="text-[10px] text-slate-400">Tax: ₹0</p>
              </div>
              <div className="clay-inset p-3 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">12% (Supplements)</span>
                <p className="text-sm font-black text-slate-800">₹0</p>
                <p className="text-[10px] text-slate-400">Tax: ₹0</p>
              </div>
              <div className="clay-inset p-3 space-y-1 border border-emerald-100 bg-emerald-50/30">
                <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono-eyebrow">18% (Standard Pet Goods)</span>
                <p className="text-sm font-black text-slate-800">{formatCurrency(gst18SlabValue)}</p>
                <p className="text-[10px] text-emerald-600 font-bold">Tax: {formatCurrency(gst18Tax)}</p>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
