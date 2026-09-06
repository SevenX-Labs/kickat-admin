import { Settings, Shield, Bell, Store, Key } from "lucide-react";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System & Store Settings</h1>
          <p className="text-sm text-slate-500">Configure store preferences, payment gateways, shipping rules, and API keys.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Store Profile", desc: "Brand identity, currency, timezone, and business details", icon: Store },
          { title: "Security & 2FA", desc: "Authentication policies, password controls, and session limits", icon: Shield },
          { title: "Notification Dispatch", desc: "Order confirmation emails, SMS gateway, and webhook triggers", icon: Bell },
          { title: "API Keys & Integrations", desc: "Razorpay/Stripe keys, Shiprocket, and Cloudinary credentials", icon: Key },
        ].map((cfg, i) => {
          const Icon = cfg.icon;
          return (
            <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md cursor-pointer">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{cfg.title}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{cfg.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
