"use client";

import { 
  Store, 
  CreditCard, 
  Truck, 
  Receipt, 
  Globe, 
  Check, 
  Save, 
  Eye, 
  EyeOff,
  Mail,
  RefreshCw,
  ShieldAlert
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { 
  AdminSettingsService, 
  ConsolidatedSettings 
} from "@/services/adminSettingsService";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  // Group 1: Store Settings (UpdateStoreSettingsDto)
  const [storeName, setStoreName] = useState("");
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [country, setCountry] = useState("India");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [orderPrefix, setOrderPrefix] = useState("ORD-");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [maxOrderValue, setMaxOrderValue] = useState<number>(100000);
  const [autoCancelUnpaidMinutes, setAutoCancelUnpaidMinutes] = useState<number>(60);

  // Group 2: Payment Settings (UpdatePaymentSettingsDto)
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");

  const [codEnabled, setCodEnabled] = useState(true);
  const [codMaxAmount, setCodMaxAmount] = useState<number>(5000);
  const [codExtraFee, setCodExtraFee] = useState<number>(0);

  const [upiEnabled, setUpiEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [netbankingEnabled, setNetbankingEnabled] = useState(true);

  // Group 3: Delivery Settings (UpdateDeliverySettingsDto)
  const [standardDeliveryFee, setStandardDeliveryFee] = useState<number>(50);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(999);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState<number>(3);
  const [defaultCourier, setDefaultCourier] = useState("Delhivery");
  const [supportedCouriers, setSupportedCouriers] = useState("Delhivery, Bluedart, EcomExpress");
  const [deliverySlots, setDeliverySlots] = useState("Morning (9 AM - 1 PM), Evening (4 PM - 8 PM)");
  const [enableRtoTracking, setEnableRtoTracking] = useState(true);

  // Group 4: Tax Settings (UpdateTaxSettingsDto)
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [gstNumber, setGstNumber] = useState("");
  const [standardGstRate, setStandardGstRate] = useState<number>(18);
  const [cgstRate, setCgstRate] = useState<number>(9);
  const [sgstRate, setSgstRate] = useState<number>(9);
  const [igstRate, setIgstRate] = useState<number>(18);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);

  // Group 5: General & SMTP Settings (UpdateGeneralSettingsDto)
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState<number>(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpIsSecure, setSmtpIsSecure] = useState(false);
  const [smtpFromEmail, setSmtpFromEmail] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminSettingsService.getAll();
      const data: ConsolidatedSettings = res?.data || {};

      // 1. Store
      if (data.store) {
        setStoreName(data.store.storeName || "");
        setLegalBusinessName(data.store.legalBusinessName || "");
        setCurrency(data.store.currency || "INR");
        setCurrencySymbol(data.store.currencySymbol || "₹");
        setCountry(data.store.country || "India");
        setTimezone(data.store.timezone || "Asia/Kolkata");
        setOrderPrefix(data.store.orderPrefix || "ORD-");
        setInvoicePrefix(data.store.invoicePrefix || "INV-");
        setMinOrderValue(data.store.minOrderValue ?? 0);
        setMaxOrderValue(data.store.maxOrderValue ?? 100000);
        setAutoCancelUnpaidMinutes(data.store.autoCancelUnpaidMinutes ?? 60);
      }

      // 2. Payment
      if (data.payment) {
        if (data.payment.razorpay) {
          setRazorpayEnabled(data.payment.razorpay.enabled ?? true);
          setRazorpayKeyId(data.payment.razorpay.keyId || "");
          setRazorpayKeySecret(data.payment.razorpay.keySecret || "");
          setRazorpayWebhookSecret(data.payment.razorpay.webhookSecret || "");
        }
        if (data.payment.cod) {
          setCodEnabled(data.payment.cod.enabled ?? true);
          setCodMaxAmount(data.payment.cod.maxAmount ?? 5000);
          setCodExtraFee(data.payment.cod.extraFee ?? 0);
        }
        if (data.payment.upi) setUpiEnabled(!!data.payment.upi.enabled);
        if (data.payment.wallet) setWalletEnabled(!!data.payment.wallet.enabled);
        if (data.payment.card) setCardEnabled(!!data.payment.card.enabled);
        if (data.payment.netbanking) setNetbankingEnabled(!!data.payment.netbanking.enabled);
      }

      // 3. Delivery
      if (data.delivery) {
        setStandardDeliveryFee(data.delivery.standardDeliveryFee ?? 50);
        setFreeDeliveryThreshold(data.delivery.freeDeliveryThreshold ?? 999);
        setEstimatedDeliveryDays(data.delivery.estimatedDeliveryDays ?? 3);
        setDefaultCourier(data.delivery.defaultCourier || "Delhivery");
        if (data.delivery.supportedCouriers) {
          setSupportedCouriers(data.delivery.supportedCouriers.join(", "));
        }
        if (data.delivery.deliverySlots) {
          setDeliverySlots(data.delivery.deliverySlots.join(", "));
        }
        setEnableRtoTracking(!!data.delivery.enableRtoTracking);
      }

      // 4. Tax
      if (data.tax) {
        setTaxEnabled(data.tax.taxEnabled ?? true);
        setGstNumber(data.tax.gstNumber || "");
        setStandardGstRate(data.tax.standardGstRate ?? 18);
        setCgstRate(data.tax.cgstRate ?? 9);
        setSgstRate(data.tax.sgstRate ?? 9);
        setIgstRate(data.tax.igstRate ?? 18);
        setPricesIncludeTax(data.tax.pricesIncludeTax ?? true);
      }

      // 5. General & SMTP
      if (data.general) {
        setSiteName(data.general.siteName || "");
        setSiteDescription(data.general.siteDescription || "");
        setSupportEmail(data.general.supportEmail || "");
        setSupportPhone(data.general.supportPhone || "");
        setLogoUrl(data.general.logoUrl || "");
        setFaviconUrl(data.general.faviconUrl || "");
        setMaintenanceMode(!!data.general.maintenanceMode);
        if (data.general.smtp) {
          setSmtpHost(data.general.smtp.host || "");
          setSmtpPort(data.general.smtp.port ?? 587);
          setSmtpUser(data.general.smtp.user || "");
          setSmtpPassword(data.general.smtp.password || "");
          setSmtpIsSecure(!!data.general.smtp.isSecure);
          setSmtpFromEmail(data.general.smtp.fromEmail || "");
        }
      }
    } catch (err: any) {
      console.error("Failed to load settings:", err);
      showToast("Failed to load configuration settings from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: ConsolidatedSettings = {
      store: {
        storeName,
        legalBusinessName,
        currency,
        currencySymbol,
        country,
        timezone,
        orderPrefix,
        invoicePrefix,
        minOrderValue,
        maxOrderValue,
        autoCancelUnpaidMinutes,
      },
      payment: {
        razorpay: {
          enabled: razorpayEnabled,
          keyId: razorpayKeyId,
          ...(razorpayKeySecret !== "••••••••" && { keySecret: razorpayKeySecret }),
          ...(razorpayWebhookSecret !== "••••••••" && { webhookSecret: razorpayWebhookSecret }),
        },
        cod: {
          enabled: codEnabled,
          maxAmount: codMaxAmount,
          extraFee: codExtraFee,
        },
        upi: { enabled: upiEnabled },
        wallet: { enabled: walletEnabled },
        card: { enabled: cardEnabled },
        netbanking: { enabled: netbankingEnabled },
      },
      delivery: {
        standardDeliveryFee,
        freeDeliveryThreshold,
        estimatedDeliveryDays,
        defaultCourier,
        supportedCouriers: supportedCouriers.split(",").map((s) => s.trim()).filter(Boolean),
        deliverySlots: deliverySlots.split(",").map((s) => s.trim()).filter(Boolean),
        enableRtoTracking,
      },
      tax: {
        taxEnabled,
        gstNumber,
        standardGstRate,
        cgstRate,
        sgstRate,
        igstRate,
        pricesIncludeTax,
      },
      general: {
        siteName,
        siteDescription,
        supportEmail,
        supportPhone,
        logoUrl,
        faviconUrl,
        maintenanceMode,
        smtp: {
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          ...(smtpPassword !== "••••••••" && { password: smtpPassword }),
          isSecure: smtpIsSecure,
          fromEmail: smtpFromEmail || supportEmail,
        },
      },
    };

    try {
      await AdminSettingsService.updateAll(payload);
      showToast("Store configurations updated successfully!");
      await loadSettings();
    } catch (err: any) {
      console.error("Error saving settings:", err);
      const msg = err?.response?.data?.message || "Failed to save settings.";
      showToast(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 pb-20">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 sticky top-0 bg-[#F4EFE6]/90 backdrop-blur-md z-30 pt-2">
        <div>
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
            Store & System Settings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Single scrollable view for store identity, payment gateways, logistics, GST, and SMTP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSettings}
            disabled={loading}
            className="clay-button p-2.5 text-slate-600 hover:text-orange-600 transition rounded-2xl cursor-pointer"
            title="Refresh Settings"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="clay-btn-orange inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving All..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-xs font-bold text-slate-500">Loading store configuration from server...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* SECTION 1: Store Identity & Order Rules */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Store className="h-5 w-5 text-orange-500" />
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                1. Store Identity & Order Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Display Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Kickat Pet Care"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Legal Business Name</label>
                <input
                  type="text"
                  value={legalBusinessName}
                  onChange={(e) => setLegalBusinessName(e.target.value)}
                  placeholder="SevenX Labs Private Limited"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Currency Code & Symbol</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="INR"
                    className="w-1/2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="₹"
                    className="w-1/2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Country & Timezone</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-1/2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                  <input
                    type="text"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="Asia/Kolkata"
                    className="w-1/2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Order & Invoice Prefix</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={orderPrefix}
                    onChange={(e) => setOrderPrefix(e.target.value)}
                    placeholder="ORD-"
                    className="w-1/2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                  />
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    placeholder="INV-"
                    className="w-1/2 rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Unpaid Auto-Cancel (Minutes)</label>
                <input
                  type="number"
                  value={autoCancelUnpaidMinutes}
                  onChange={(e) => setAutoCancelUnpaidMinutes(Number(e.target.value) || 60)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Maximum Order Limit (₹)</label>
                <input
                  type="number"
                  value={maxOrderValue}
                  onChange={(e) => setMaxOrderValue(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Payment Gateways */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  2. Payment Gateway Integration
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-600">Razorpay Active</span>
                <input
                  type="checkbox"
                  checked={razorpayEnabled}
                  onChange={(e) => setRazorpayEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder="rzp_live_..."
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Razorpay Key Secret</label>
                <div className="relative">
                  <input
                    type={showRazorpaySecret ? "text" : "password"}
                    value={razorpayKeySecret}
                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showRazorpaySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Razorpay Webhook Secret</label>
                <input
                  type="password"
                  value={razorpayWebhookSecret}
                  onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                />
              </div>
            </div>

            {/* COD Sub-Rules */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow">
                  Cash On Delivery (COD) Rules
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-600">COD Active</span>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Maximum COD Limit (₹)</label>
                  <input
                    type="number"
                    value={codMaxAmount}
                    onChange={(e) => setCodMaxAmount(Number(e.target.value) || 0)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Extra COD Processing Fee (₹)</label>
                  <input
                    type="number"
                    value={codExtraFee}
                    onChange={(e) => setCodExtraFee(Number(e.target.value) || 0)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Other Payment Options */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow">
                Supported Checkout Methods
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">UPI Instant</span>
                  <input
                    type="checkbox"
                    checked={upiEnabled}
                    onChange={(e) => setUpiEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4"
                  />
                </label>
                <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Wallets</span>
                  <input
                    type="checkbox"
                    checked={walletEnabled}
                    onChange={(e) => setWalletEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4"
                  />
                </label>
                <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Cards</span>
                  <input
                    type="checkbox"
                    checked={cardEnabled}
                    onChange={(e) => setCardEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4"
                  />
                </label>
                <label className="clay-inset p-3 flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-slate-800">Net Banking</span>
                  <input
                    type="checkbox"
                    checked={netbankingEnabled}
                    onChange={(e) => setNetbankingEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 3: Shipping & Logistics */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Truck className="h-5 w-5 text-emerald-500" />
              <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                3. Shipping & Delivery Rules
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  value={standardDeliveryFee}
                  onChange={(e) => setStandardDeliveryFee(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Free Shipping Minimum Cart (₹)</label>
                <input
                  type="number"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Estimated Delivery Days</label>
                <input
                  type="number"
                  value={estimatedDeliveryDays}
                  onChange={(e) => setEstimatedDeliveryDays(Number(e.target.value) || 1)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Default Courier Partner</label>
                <input
                  type="text"
                  value={defaultCourier}
                  onChange={(e) => setDefaultCourier(e.target.value)}
                  placeholder="Delhivery"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Supported Couriers (Comma separated)</label>
                <input
                  type="text"
                  value={supportedCouriers}
                  onChange={(e) => setSupportedCouriers(e.target.value)}
                  placeholder="Delhivery, Bluedart, EcomExpress"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Delivery Time Slots (Comma separated)</label>
                <input
                  type="text"
                  value={deliverySlots}
                  onChange={(e) => setDeliverySlots(e.target.value)}
                  placeholder="Morning (9 AM - 1 PM), Evening (4 PM - 8 PM)"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="clay-inset p-3.5 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Enable Automated RTO Tracking</p>
                  <p className="text-[11px] text-slate-500 font-medium">Track return-to-origin packages automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableRtoTracking}
                  onChange={(e) => setEnableRtoTracking(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* SECTION 4: Taxes & GST */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-500" />
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  4. GST Compliance & Tax Rules
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-600">Tax Enabled</span>
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">GSTIN Registration Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="27AABCK9842P1Z9"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Standard GST Rate (%)</label>
                <input
                  type="number"
                  value={standardGstRate}
                  onChange={(e) => setStandardGstRate(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">CGST Rate (%)</label>
                <input
                  type="number"
                  value={cgstRate}
                  onChange={(e) => setCgstRate(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">SGST Rate (%)</label>
                <input
                  type="number"
                  value={sgstRate}
                  onChange={(e) => setSgstRate(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">IGST Rate (%) (Inter-State)</label>
                <input
                  type="number"
                  value={igstRate}
                  onChange={(e) => setIgstRate(Number(e.target.value) || 0)}
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="clay-inset p-3.5 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Catalog Prices Include Tax</p>
                  <p className="text-[11px] text-slate-500 font-medium">Calculate GST backwards from displayed store price</p>
                </div>
                <input
                  type="checkbox"
                  checked={pricesIncludeTax}
                  onChange={(e) => setPricesIncludeTax(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* SECTION 5: General & SMTP Settings */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-500" />
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  5. General & SMTP Platform Settings
                </h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <span className="text-xs font-bold text-[#2A241E]">Maintenance Mode</span>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded text-red-600 h-4 w-4"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Site Title Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Kickat Pet Superstore"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@kickat.co.in"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Support Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+91 80000 54228"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Logo CDN URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://cdn.kickat.co.in/logo.png"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Site Description / Tagline</label>
                <textarea
                  rows={2}
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Premier pet food & supplies store"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            {/* SMTP Config */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow">
                    SMTP Mail Configurations
                  </h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-600">SSL/TLS Secure</span>
                  <input
                    type="checkbox"
                    checked={smtpIsSecure}
                    onChange={(e) => setSmtpIsSecure(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">SMTP Port</label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value) || 587)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">SMTP Username</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="notifications@kickat.co.in"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">SMTP Password</label>
                  <input
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">From Email Address</label>
                  <input
                    type="email"
                    value={smtpFromEmail}
                    onChange={(e) => setSmtpFromEmail(e.target.value)}
                    placeholder="noreply@kickat.co.in"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Save Action Bar */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="clay-btn-orange inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-extrabold text-white shadow-xl hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving All Configurations..." : "Save All Configurations"}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
