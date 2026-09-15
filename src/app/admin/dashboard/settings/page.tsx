"use client";

import { 
  Globe, 
  CreditCard, 
  Receipt, 
  Truck, 
  Check, 
  RefreshCw,
  Share2,
  ShieldAlert,
  Loader2,
  Sparkles,
  Save,
  Key,
  Lock,
  Building2,
  Clock,
  Wallet,
  Landmark
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

  // SECTION 1: General Settings
  const [storeName, setStoreName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // SECTION 2: Payment Methods
  // Razorpay Gateway
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");
  
  // Cash on Delivery (COD)
  const [codEnabled, setCodEnabled] = useState(true);
  const [codMinOrderAmount, setCodMinOrderAmount] = useState<number>(200);
  const [codMaxOrderAmount, setCodMaxOrderAmount] = useState<number>(10000);
  const [codExtraFeeEnabled, setCodExtraFeeEnabled] = useState(false);
  const [codExtraFee, setCodExtraFee] = useState<number>(0);

  // Payment Method Toggles
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(true);
  const [netbankingEnabled, setNetbankingEnabled] = useState(true);

  // SECTION 3: Tax & GST
  const [gstEnabled, setGstEnabled] = useState(true);
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(18);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [gstin, setGstin] = useState("");
  const [gstAppliesToDelivery, setGstAppliesToDelivery] = useState(false);

  // SECTION 4: Delivery Settings
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [defaultShippingFee, setDefaultShippingFee] = useState<number>(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(499);
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [courierDefault, setCourierDefault] = useState("Delhivery");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAllSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminSettingsService.getAll();
      const data = res?.data || {};

      // General
      if (data.general) {
        setStoreName(data.general.storeName || "");
        setSupportEmail(data.general.supportEmail || "support@kickat.co.in");
        setSupportPhone(data.general.supportPhone || "+91 98765 43210");
        setMaintenanceMode(!!data.general.maintenanceMode);
        if (data.general.socialLinks) {
          setInstagramUrl(data.general.socialLinks.instagram || "");
          setFacebookUrl(data.general.socialLinks.facebook || "");
          setYoutubeUrl(data.general.socialLinks.youtube || "");
          setTwitterUrl(data.general.socialLinks.twitter || "");
          setLinkedinUrl(data.general.socialLinks.linkedin || "");
        }
      }

      // Payment
      if (data.payment) {
        if (data.payment.razorpay) {
          setRazorpayEnabled(data.payment.razorpay.enabled ?? true);
          setRazorpayKeyId(data.payment.razorpay.keyId || "");
          setRazorpayKeySecret(data.payment.razorpay.keySecret || "");
          setRazorpayWebhookSecret(data.payment.razorpay.webhookSecret || "");
        }

        if (data.payment.cod) {
          setCodEnabled(data.payment.cod.enabled ?? true);
          setCodMinOrderAmount(data.payment.cod.minOrderAmount ?? 200);
          setCodMaxOrderAmount(data.payment.cod.maxOrderAmount ?? 10000);
          setCodExtraFeeEnabled(!!data.payment.cod.extraFeeEnabled);
          setCodExtraFee(data.payment.cod.extraFee ?? 0);
        }

        if (data.payment.upi) setUpiEnabled(data.payment.upi.enabled ?? true);
        if (data.payment.card) setCardEnabled(data.payment.card.enabled ?? true);
        if (data.payment.wallet) setWalletEnabled(data.payment.wallet.enabled ?? true);
        if (data.payment.netbanking) setNetbankingEnabled(data.payment.netbanking.enabled ?? true);
      }

      // Tax
      if (data.tax) {
        setGstEnabled(data.tax.gstEnabled ?? true);
        setDefaultTaxRate(data.tax.defaultTaxRate ?? data.tax.gstPercentage ?? 18);
        setTaxInclusive(!!data.tax.taxInclusive);
        setGstin(data.tax.gstin || data.tax.gstNumber || "");
        setGstAppliesToDelivery(!!data.tax.gstAppliesToDelivery);
      }

      // Delivery
      if (data.delivery) {
        setDeliveryEnabled(data.delivery.deliveryEnabled ?? data.delivery.deliveryFeeEnabled ?? true);
        setDefaultShippingFee(data.delivery.defaultShippingFee ?? data.delivery.deliveryFee ?? 50);
        setFreeShippingThreshold(data.delivery.freeShippingThreshold ?? data.delivery.freeDeliveryThreshold ?? 499);
        setEstimatedDays(data.delivery.estimatedDays ?? 3);
        setCourierDefault(data.delivery.courierDefault || "Delhivery");
      }
    } catch (err: any) {
      console.error("Failed to load settings:", err);
      showToast("Failed to load store settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  // Manual Save Function for All Settings
  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: ConsolidatedSettings = {
        general: {
          storeName,
          supportEmail,
          supportPhone,
          maintenanceMode,
          socialLinks: {
            instagram: instagramUrl,
            facebook: facebookUrl,
            youtube: youtubeUrl,
            twitter: twitterUrl,
            linkedin: linkedinUrl,
          },
        },
        payment: {
          razorpay: {
            enabled: razorpayEnabled,
            keyId: razorpayKeyId,
            keySecret: razorpayKeySecret,
            webhookSecret: razorpayWebhookSecret,
          },
          cod: {
            enabled: codEnabled,
            minOrderAmount: Number(codMinOrderAmount) || 0,
            maxOrderAmount: Number(codMaxOrderAmount) || 0,
            extraFeeEnabled: codExtraFeeEnabled,
            extraFee: Number(codExtraFee) || 0,
          },
          upi: { enabled: upiEnabled },
          card: { enabled: cardEnabled },
          wallet: { enabled: walletEnabled },
          netbanking: { enabled: netbankingEnabled },
        },
        tax: {
          defaultTaxRate: Number(defaultTaxRate) || 0,
          taxInclusive,
          gstin,
          gstEnabled,
          gstNumber: gstin,
          gstPercentage: Number(defaultTaxRate) || 0,
          gstAppliesToDelivery,
        },
        delivery: {
          deliveryEnabled,
          deliveryFeeEnabled: deliveryEnabled,
          defaultShippingFee: Number(defaultShippingFee) || 0,
          deliveryFee: Number(defaultShippingFee) || 0,
          freeShippingThreshold: Number(freeShippingThreshold) || 0,
          freeDeliveryThreshold: Number(freeShippingThreshold) || 0,
          estimatedDays: Number(estimatedDays) || 0,
          courierDefault,
        },
      };

      await AdminSettingsService.updateAll(payload);
      showToast("Store settings saved successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      // Fallback attempt with individual group updates
      try {
        await Promise.all([
          AdminSettingsService.updateGeneral({
            storeName,
            supportEmail,
            supportPhone,
            maintenanceMode,
            socialLinks: {
              instagram: instagramUrl,
              facebook: facebookUrl,
              youtube: youtubeUrl,
              twitter: twitterUrl,
              linkedin: linkedinUrl,
            },
          }),
          AdminSettingsService.updatePayment({
            razorpay: {
              enabled: razorpayEnabled,
              keyId: razorpayKeyId,
              keySecret: razorpayKeySecret,
              webhookSecret: razorpayWebhookSecret,
            },
            cod: {
              enabled: codEnabled,
              minOrderAmount: Number(codMinOrderAmount) || 0,
              maxOrderAmount: Number(codMaxOrderAmount) || 0,
              extraFeeEnabled: codExtraFeeEnabled,
              extraFee: Number(codExtraFee) || 0,
            },
            upi: { enabled: upiEnabled },
            card: { enabled: cardEnabled },
            wallet: { enabled: walletEnabled },
            netbanking: { enabled: netbankingEnabled },
          }),
          AdminSettingsService.updateTax({
            defaultTaxRate: Number(defaultTaxRate) || 0,
            taxInclusive,
            gstin,
            gstEnabled,
            gstNumber: gstin,
            gstPercentage: Number(defaultTaxRate) || 0,
            gstAppliesToDelivery,
          }),
          AdminSettingsService.updateDelivery({
            deliveryEnabled,
            deliveryFeeEnabled: deliveryEnabled,
            defaultShippingFee: Number(defaultShippingFee) || 0,
            deliveryFee: Number(defaultShippingFee) || 0,
            freeShippingThreshold: Number(freeShippingThreshold) || 0,
            freeDeliveryThreshold: Number(freeShippingThreshold) || 0,
            estimatedDays: Number(estimatedDays) || 0,
            courierDefault,
          }),
        ]);
        showToast("Store settings saved successfully!");
      } catch (fallbackErr: any) {
        const msg = fallbackErr?.response?.data?.message || err?.response?.data?.message || "Failed to save settings.";
        showToast(Array.isArray(msg) ? msg[0] : msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveAllSettings} className="space-y-6 sm:space-y-8 w-full min-w-0 pb-24">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
            Store & System Settings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Configure platform identity, payment gateways & methods, GST computation, and shipping rules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAllSettings}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Reload</span>
          </button>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-xs font-bold text-slate-600">Loading store settings...</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          
          {/* SECTION 1: GENERAL & MAINTENANCE */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    General & Identity Settings
                  </h2>
                  <p className="text-[11px] text-slate-500">Store branding, customer support touchpoints & maintenance mode</p>
                </div>
              </div>
              
              {/* Maintenance Mode Toggle */}
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <span className="text-xs font-bold text-slate-700">Maintenance Mode</span>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>

            {maintenanceMode && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-amber-900 text-xs">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Maintenance Mode is active.</span> Public website access may be restricted to administrative users.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Kickat Pet Care"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@kickat.co.in"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Support Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                <span>Social Media Handles</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Instagram URL</label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/kickat_india"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Facebook URL</label>
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/kickatindia"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">YouTube URL</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/@kickat"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Twitter / X URL</label>
                  <input
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/kickat"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/company/kickat"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: PAYMENT GATEWAY & METHOD CONFIGURATION */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  Payment Gateway & Payment Methods
                </h2>
                <p className="text-[11px] text-slate-500">Configure Razorpay credentials, enabled payment methods & COD handling fees</p>
              </div>
            </div>

            {/* Payment Method Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="clay-inset p-4 flex items-center justify-between cursor-pointer gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">UPI Instant Payment</h3>
                  <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm & BHIM</p>
                </div>
                <input
                  type="checkbox"
                  checked={upiEnabled}
                  onChange={(e) => setUpiEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>

              <label className="clay-inset p-4 flex items-center justify-between cursor-pointer gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Card Payment (Credit/Debit)</h3>
                  <p className="text-[11px] text-slate-500">Visa, Mastercard, RuPay & Diners</p>
                </div>
                <input
                  type="checkbox"
                  checked={cardEnabled}
                  onChange={(e) => setCardEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>

              <label className="clay-inset p-4 flex items-center justify-between cursor-pointer gap-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-purple-600" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Digital Wallets</h3>
                    <p className="text-[11px] text-slate-500">Mobikwik, Freecharge, etc.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={walletEnabled}
                  onChange={(e) => setWalletEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>

              <label className="clay-inset p-4 flex items-center justify-between cursor-pointer gap-3">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-emerald-600" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Net Banking</h3>
                    <p className="text-[11px] text-slate-500">Major Indian banks online banking</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={netbankingEnabled}
                  onChange={(e) => setNetbankingEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Razorpay Gateway Box */}
            <div className="clay-inset p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Razorpay Integration Credentials</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Enable Razorpay</span>
                  <input
                    type="checkbox"
                    checked={razorpayEnabled}
                    onChange={(e) => setRazorpayEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>

              {razorpayEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Razorpay Key ID</label>
                    <input
                      type="text"
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyId(e.target.value)}
                      placeholder="rzp_live_..."
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:border-orange-400 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Key Secret</span>
                      <Lock className="h-3 w-3 text-slate-400" />
                    </label>
                    <input
                      type="password"
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:border-orange-400 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Webhook Secret</span>
                      <Lock className="h-3 w-3 text-slate-400" />
                    </label>
                    <input
                      type="password"
                      value={razorpayWebhookSecret}
                      onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:border-orange-400 transition"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cash On Delivery */}
            <div className="clay-inset p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Cash on Delivery (COD)</h3>
                  <p className="text-[11px] text-slate-500">Set min & max order thresholds eligible for cash payment & handling charges</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Enable COD</span>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>

              {codEnabled && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Minimum COD Order Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={codMinOrderAmount}
                        onChange={(e) => setCodMinOrderAmount(Math.max(0, Number(e.target.value) || 0))}
                        placeholder="200"
                        className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:border-orange-400 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Maximum COD Order Limit (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={codMaxOrderAmount}
                        onChange={(e) => setCodMaxOrderAmount(Math.max(0, Number(e.target.value) || 0))}
                        placeholder="10000"
                        className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:border-orange-400 transition"
                      />
                    </div>
                  </div>

                  {/* COD Extra Fee Options */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">COD Handling Fee</h4>
                        <p className="text-[11px] text-slate-500">Apply an extra fixed handling charge on Cash on Delivery orders</p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs font-bold text-slate-700">Enable Extra Fee</span>
                        <input
                          type="checkbox"
                          checked={codExtraFeeEnabled}
                          onChange={(e) => setCodExtraFeeEnabled(e.target.checked)}
                          className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">COD Extra Handling Fee (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={codExtraFee}
                          onChange={(e) => setCodExtraFee(Math.max(0, Number(e.target.value) || 0))}
                          placeholder="50"
                          className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:border-orange-400 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 3: TAX & GST COMPUTATION RULES */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    Tax & GST Computation Rules
                  </h2>
                  <p className="text-[11px] text-slate-500">Configure GSTIN identity, default tax percentage, and inclusive pricing</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Enable GST</span>
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Prices Tax Inclusive</span>
                  <input
                    type="checkbox"
                    checked={taxInclusive}
                    onChange={(e) => setTaxInclusive(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>GSTIN Number</span>
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27AAAAA0000A1Z5"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Default Tax Rate % (0 to 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  placeholder="18.0"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>
            </div>
          </section>

          {/* SECTION 4: DELIVERY & SHIPPING FEE RULES */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    Delivery & Shipping Fee Rules
                  </h2>
                  <p className="text-[11px] text-slate-500">Set shipping fees, free delivery threshold, default courier & estimated ETAs</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <span className="text-xs font-bold text-slate-700">Delivery Enabled</span>
                <input
                  type="checkbox"
                  checked={deliveryEnabled}
                  onChange={(e) => setDeliveryEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Default Shipping Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={defaultShippingFee}
                  onChange={(e) => setDefaultShippingFee(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="50"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="499"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Estimated Days</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(Math.max(1, Number(e.target.value) || 1))}
                  placeholder="3"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Default Courier</label>
                <input
                  type="text"
                  value={courierDefault}
                  onChange={(e) => setCourierDefault(e.target.value)}
                  placeholder="Delhivery"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>
            </div>

            {freeShippingThreshold === 0 ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fade-in">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>⚡ Free Delivery is enabled on ALL orders regardless of cart total!</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium">
                Orders with subtotal equal to or above ₹{freeShippingThreshold} qualify for free delivery.
              </p>
            )}
          </section>

          {/* Bottom Floating Save Button Bar */}
          <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </form>
  );
}
