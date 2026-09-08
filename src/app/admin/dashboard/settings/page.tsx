"use client";

import { 
  Settings, 
  Store, 
  CreditCard, 
  Truck, 
  Receipt, 
  Bell, 
  Shield, 
  Check, 
  Save, 
  Eye, 
  EyeOff,
  RefreshCw,
  Key
} from "lucide-react";
import { useState } from "react";

type SettingsTab = "store" | "payments" | "shipping" | "taxes" | "notifications";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("store");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Store Settings state
  const [storeName, setStoreName] = useState("Kickat Pet Superstore");
  const [storeEmail, setStoreEmail] = useState("care@kickat.in");
  const [storePhone, setStorePhone] = useState("+91 80000 54228");
  const [currency, setCurrency] = useState("INR (₹)");
  const [gstin, setGstin] = useState("27AABCK9842P1Z9");

  // Payment settings
  const [razorpayKey, setRazorpayKey] = useState("rzp_live_K8942910JkX");
  const [razorpaySecret, setRazorpaySecret] = useState("w89Xjklm904281");
  const [showSecret, setShowSecret] = useState(false);
  const [enableUpi, setEnableUpi] = useState(true);
  const [enableCod, setEnableCod] = useState(true);
  const [maxCodLimit, setMaxCodLimit] = useState(5000);

  // Shipping
  const [shiprocketToken, setShiprocketToken] = useState("sr_auth_901840283921");
  const [warehousePin, setWarehousePin] = useState("400607");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [standardShipFee, setStandardShipFee] = useState(79);

  // Notifications
  const [orderEmail, setOrderEmail] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast("Configuration settings updated successfully!");
    }, 600);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
            Store & System Settings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Manage pet store identity, payment integrations, shipping rules, and notifications.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="clay-btn-orange inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "store", label: "Store Profile", icon: Store },
          { id: "payments", label: "Payment Gateways", icon: CreditCard },
          { id: "shipping", label: "Shipping & Logistics", icon: Truck },
          { id: "taxes", label: "Taxes & Invoices", icon: Receipt },
          { id: "notifications", label: "Alerts & Notifications", icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`
                inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0
                ${isActive 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
        
        {/* TAB 1: Store Profile */}
        {activeTab === "store" && (
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Store className="h-4 w-4 text-orange-500" />
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                General Store Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Helpline Phone</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Currency</label>
                <input
                  type="text"
                  disabled
                  value={currency}
                  className="w-full rounded-xl bg-slate-100 border border-slate-200/60 p-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <label className="block text-xs font-bold text-slate-700">Registered Business Address</label>
              <textarea
                rows={3}
                defaultValue="Unit 14B, Tech Park One, Baner Road, Pune, Maharashtra 411045, India"
                className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Payment Gateways */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <div className="clay-card p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                    Razorpay India Integration
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  CONNECTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={razorpayKey}
                    onChange={(e) => setRazorpayKey(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Razorpay Key Secret</label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={razorpaySecret}
                      onChange={(e) => setRazorpaySecret(e.target.value)}
                      className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast("Razorpay webhook verified successfully!")}
                  className="clay-button px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
                >
                  Verify Webhook
                </button>
              </div>
            </div>

            {/* UPI & COD Options */}
            <div className="clay-card p-4 sm:p-6 space-y-3">
              <h3 className="font-fraunces text-sm font-bold text-[#2A241E]">
                Payment Methods Offered
              </h3>

              <div className="space-y-3 pt-1">
                <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Direct UPI (Google Pay, PhonePe, Paytm)</p>
                    <p className="text-[11px] text-slate-500">Instant zero-fee QR payment checkout</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableUpi}
                    onChange={(e) => setEnableUpi(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4"
                  />
                </label>

                <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-slate-500">Collect payment at pet parent's doorstep</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCod}
                    onChange={(e) => setEnableCod(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4"
                  />
                </label>
              </div>

              <div className="space-y-1 pt-2">
                <label className="block text-xs font-bold text-slate-700">Maximum COD Order Value (₹)</label>
                <input
                  type="number"
                  value={maxCodLimit}
                  onChange={(e) => setMaxCodLimit(Number(e.target.value) || 0)}
                  className="w-full sm:w-64 rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Shipping */}
        {activeTab === "shipping" && (
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Truck className="h-4 w-4 text-emerald-500" />
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                Logistics & Warehouse
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Shiprocket API Token</label>
                <input
                  type="password"
                  value={shiprocketToken}
                  onChange={(e) => setShiprocketToken(e.target.value)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Primary Dispatch Warehouse PIN</label>
                <input
                  type="text"
                  value={warehousePin}
                  onChange={(e) => setWarehousePin(e.target.value)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Free Shipping Minimum Cart (₹)</label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  value={standardShipFee}
                  onChange={(e) => setStandardShipFee(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Taxes & Invoicing */}
        {activeTab === "taxes" && (
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Receipt className="h-4 w-4 text-indigo-500" />
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                GST Compliance & Tax Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">GSTIN Registration Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Default Pet Food HSN Code</label>
                <input
                  type="text"
                  defaultValue="23091000"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Tax Invoice Prefix</label>
                <input
                  type="text"
                  defaultValue="KIK-2026-"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Place of Supply State</label>
                <input
                  type="text"
                  defaultValue="27 - Maharashtra"
                  disabled
                  className="w-full rounded-xl bg-slate-100 border border-slate-200/60 p-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Notifications */}
        {activeTab === "notifications" && (
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Bell className="h-4 w-4 text-amber-500" />
              <h2 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                Automated Alerts & Dispatch Notifications
              </h2>
            </div>

            <div className="space-y-3">
              <label className="clay-inset p-3.5 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Order Confirmation Emails</p>
                  <p className="text-[11px] text-slate-500">Send instant branded PDF invoice email to customer</p>
                </div>
                <input
                  type="checkbox"
                  checked={orderEmail}
                  onChange={(e) => setOrderEmail(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4"
                />
              </label>

              <label className="clay-inset p-3.5 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">WhatsApp Dispatch & Tracking Updates</p>
                  <p className="text-[11px] text-slate-500">Notify pet parents via WhatsApp when package is out for delivery</p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4"
                />
              </label>

              <label className="clay-inset p-3.5 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Low Stock Warehouse Alerts</p>
                  <p className="text-[11px] text-slate-500">Email admin team when product inventory drops below threshold</p>
                </div>
                <input
                  type="checkbox"
                  checked={lowStockAlerts}
                  onChange={(e) => setLowStockAlerts(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4"
                />
              </label>
            </div>
          </div>
        )}

      </form>

    </div>
  );
}
