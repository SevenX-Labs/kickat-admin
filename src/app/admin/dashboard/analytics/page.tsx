import { BarChart3, TrendingUp, Users, ShoppingBag, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics & Insights</h1>
          <p className="text-sm text-slate-500">Track key commerce metrics, conversion rates, and growth trajectory.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Conversion Rate", value: "3.42%", change: "+0.6%", icon: TrendingUp },
          { label: "Avg. Order Value", value: "₹1,840", change: "+12.4%", icon: ShoppingBag },
          { label: "Active Sessions", value: "1,420", change: "+8.1%", icon: Users },
          { label: "Monthly Growth", value: "22.8%", change: "+4.2%", icon: BarChart3 },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{item.value}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{item.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Interactive Analytics Graphs</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">Live sales funnel, regional demographics, and retention curves are currently compiling telemetry data.</p>
      </div>
    </div>
  );
}
