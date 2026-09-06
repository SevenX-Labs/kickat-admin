import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard Overview",
};

const STATS = [
  { label: "Total Revenue", value: "₹4,28,950", change: "+14.8%", isPositive: true, icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  { label: "Active Orders", value: "142", change: "+8.2%", isPositive: true, icon: ShoppingBag, color: "text-orange-600 bg-orange-50 border-orange-100" },
  { label: "Products in Stock", value: "1,248", change: "+24 new", isPositive: true, icon: Package, color: "text-blue-600 bg-blue-50 border-blue-100" },
  { label: "Registered Customers", value: "3,820", change: "+18.4%", isPositive: true, icon: Users, color: "text-purple-600 bg-purple-50 border-purple-100" },
];

const RECENT_ORDERS = [
  { id: "ORD-9481", customer: "Aarav Sharma", items: 3, total: "₹2,499", status: "PROCESSING", time: "10 mins ago" },
  { id: "ORD-9480", customer: "Priya Patel", items: 1, total: "₹899", status: "DELIVERED", time: "35 mins ago" },
  { id: "ORD-9479", customer: "Rohan Varma", items: 2, total: "₹1,750", status: "SHIPPED", time: "2 hours ago" },
  { id: "ORD-9478", customer: "Sneha Reddy", items: 4, total: "₹4,120", status: "PENDING", time: "4 hours ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">KickAt Commerce Dashboard</h1>
          <p className="text-sm text-slate-500">Monitor store sales, orders, deliveries, and catalog status in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products/create"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 transition"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</span>
                <span className="flex items-center text-xs font-semibold text-emerald-600">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
              View All Orders &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                <tr>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/80 transition">
                    <td className="py-3.5 font-semibold text-slate-900">
                      <Link href={`/dashboard/orders/${order.id}`} className="hover:text-orange-600">
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-3.5 text-slate-700">{order.customer}</td>
                    <td className="py-3.5 text-slate-500">{order.items}</td>
                    <td className="py-3.5 font-medium text-slate-900">{order.total}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" :
                        order.status === "PROCESSING" ? "bg-amber-50 text-amber-700 border border-amber-200/60" :
                        order.status === "SHIPPED" ? "bg-blue-50 text-blue-700 border border-blue-200/60" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-400">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Operational Status */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-800">Operational Health</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Payment Gateway Active</p>
                <p className="text-xs text-slate-500">Razorpay API online & webhook responding</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Courier Shipping API</p>
                <p className="text-xs text-slate-500">Automated AWB generation running</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/50">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-900">Low Stock Alert</p>
                <p className="text-xs text-amber-700">6 products below replenishment threshold</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
