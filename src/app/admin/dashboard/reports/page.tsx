import { PieChart, Download } from "lucide-react";

export const metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Executive Reports</h1>
          <p className="text-sm text-slate-500">Download accounting, GST, inventory turnover, and reconciliation reports.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition">
          <Download className="h-4 w-4" /> Export CSV / PDF
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <PieChart className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Financial & Operations Reports</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">Generate tax reports, sales summaries, low-stock forecasts, and ledger balances.</p>
      </div>
    </div>
  );
}
