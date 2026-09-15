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
  Landmark,
  Eye,
  EyeOff
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { 
  AdminSettingsService, 
  AdminSettingsForm
} from "@/services/adminSettingsService";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password visibility toggles
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // CARD 1: General Settings
  const [storeName, setStoreName] = useState("KickAt");
  const [supportEmail, setSupportEmail] = useState("support@kickat.co.in");
  const [supportPhone, setSupportPhone] = useState("+91 98765 43210");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // CARD 2: Payment Methods
  // Subsection 2A: Razorpay
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");
  
  // Subsection 2B: Cash on Delivery (COD)
  const [codEnabled, setCodEnabled] = useState(true);
  const [codMinOrderAmount, setCodMinOrderAmount] = useState<number>(200);
  const [codMaxOrderAmount, setCodMaxOrderAmount] = useState<number>(10000);
  const [codExtraFeeEnabled, setCodExtraFeeEnabled] = useState(true);
  const [codExtraFee, setCodExtraFee] = useState<number>(50);

  // Method Toggles
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(true);
  const [netbankingEnabled, setNetbankingEnabled] = useState(true);

  // CARD 3: Tax & GST Computation Rules
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstin, setGstin] = useState("");
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  const [gstAppliesToDelivery, setGstAppliesToDelivery] = useState(false);
  const [taxInclusive, setTaxInclusive] = useState(false);

  // CARD 4: Delivery & Shipping Fee Rules
  const [deliveryFeeEnabled, setDeliveryFeeEnabled] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState<number>(50);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(999);
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [courierDefault, setCourierDefault] = useState("Delhivery");
  const [deliveryExtraFeeEnabled, setDeliveryExtraFeeEnabled] = useState(false);
  const [deliveryExtraFeeName, setDeliveryExtraFeeName] = useState("Platform Fee");
  const [deliveryExtraFeeAmount, setDeliveryExtraFeeAmount] = useState<number>(10);
  const [isExtraFeeCompulsory, setIsExtraFeeCompulsory] = useState(true);

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
        setStoreName(data.general.storeName || "KickAt");
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
          setCodExtraFeeEnabled(data.payment.cod.extraFeeEnabled ?? true);
          setCodExtraFee(data.payment.cod.extraFee ?? 50);
        }

        if (data.payment.upi) setUpiEnabled(data.payment.upi.enabled ?? true);
        if (data.payment.card) setCardEnabled(data.payment.card.enabled ?? true);
        if (data.payment.wallet) setWalletEnabled(data.payment.wallet.enabled ?? true);
        if (data.payment.netbanking) setNetbankingEnabled(data.payment.netbanking.enabled ?? true);
      }

      // Tax
      if (data.tax) {
        setGstEnabled(data.tax.gstEnabled ?? true);
        setGstPercentage(data.tax.gstPercentage ?? 18);
        setGstAppliesToDelivery(!!data.tax.gstAppliesToDelivery);
        setTaxInclusive(!!data.tax.taxInclusive);
        setGstin(data.tax.gstNumber || "");
      }

      // Delivery
      if (data.delivery) {
        setDeliveryFeeEnabled(data.delivery.deliveryFeeEnabled ?? true);
        setDeliveryFee(data.delivery.deliveryFee ?? 50);
        setFreeDeliveryThreshold(data.delivery.freeDeliveryThreshold ?? 999);
        setEstimatedDays(data.delivery.estimatedDays ?? 3);
        setCourierDefault(data.delivery.courierDefault || "Delhivery");
        setDeliveryExtraFeeEnabled(!!data.delivery.extraFeeEnabled);
        setDeliveryExtraFeeName(data.delivery.extraFeeName || "Platform Fee");
        setDeliveryExtraFeeAmount(data.delivery.extraFeeAmount ?? 10);
        setIsExtraFeeCompulsory(data.delivery.isExtraFeeCompulsory ?? true);
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

    // Frontend validation
    if (deliveryFeeEnabled && deliveryExtraFeeEnabled && (!deliveryExtraFeeName || deliveryExtraFeeName.trim() === "")) {
      showToast("Extra Fee Name cannot be empty when extra fee is enabled.");
      return;
    }

    if (gstEnabled && (gstPercentage < 0 || gstPercentage > 100)) {
      showToast("GST percentage must be between 0 and 100.");
      return;
    }

    setSaving(true);

    try {
      const payload: AdminSettingsForm = {
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
          gstEnabled,
          gstNumber: gstin || null,
          gstPercentage: Number(gstPercentage) || 0,
          gstAppliesToDelivery,
          taxInclusive,
        },
        delivery: {
          deliveryFeeEnabled,
          deliveryFee: Number(deliveryFee) || 0,
          freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
          estimatedDays: Number(estimatedDays) || 0,
          courierDefault,
          extraFeeEnabled: deliveryExtraFeeEnabled,
          extraFeeName: deliveryExtraFeeName,
          extraFeeAmount: Number(deliveryExtraFeeAmount) || 0,
          isExtraFeeCompulsory,
        },
      };

      await AdminSettingsService.updateAll(payload);
      showToast("Store settings updated successfully!");
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
            gstEnabled,
            gstNumber: gstin || null,
            gstPercentage: Number(gstPercentage) || 0,
            gstAppliesToDelivery,
            taxInclusive,
          }),
          AdminSettingsService.updateDelivery({
            deliveryFeeEnabled,
            deliveryFee: Number(deliveryFee) || 0,
            freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
            estimatedDays: Number(estimatedDays) || 0,
            courierDefault,
            extraFeeEnabled: deliveryExtraFeeEnabled,
            extraFeeName: deliveryExtraFeeName,
            extraFeeAmount: Number(deliveryExtraFeeAmount) || 0,
            isExtraFeeCompulsory,
          }),
        ]);
        showToast("Store settings updated successfully!");
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
            Configure platform identity, payment gateways & methods, GST computation rules, and shipping fees.
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
          
          {/* CARD 1: GENERAL & IDENTITY SETTINGS */}
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
                  <span className="font-bold">Maintenance Mode is active.</span> Enable to display maintenance banner to customers and pause checkouts.
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
                  placeholder="KickAt"
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
                  placeholder="+91 98765 43210"
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

          {/* CARD 2: PAYMENT GATEWAY CONFIGURATION */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  Payment Gateway Configuration
                </h2>
                <p className="text-[11px] text-slate-500">Configure Razorpay credentials and Cash on Delivery order limits & handling fees</p>
              </div>
            </div>

            {/* Sub-toggles for methods */}
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

            {/* Subsection 2A: Razorpay Integration */}
            <div className="clay-inset p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800">Razorpay Integration</h3>
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

              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 transition-all duration-200 ${!razorpayEnabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Razorpay Key ID</label>
                  <input
                    type="text"
                    disabled={!razorpayEnabled}
                    value={razorpayKeyId}
                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                    placeholder="rzp_live_..."
                    className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Key Secret</span>
                    <Lock className="h-3 w-3 text-slate-400" />
                  </label>
                  <div className="relative">
                    <input
                      type={showKeySecret ? "text" : "password"}
                      disabled={!razorpayEnabled}
                      value={razorpayKeySecret}
                      onChange={(e) => setRazorpayKeySecret(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 pr-9 text-xs text-slate-800 font-mono outline-none focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={!razorpayEnabled}
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {showKeySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Webhook Secret</span>
                    <Lock className="h-3 w-3 text-slate-400" />
                  </label>
                  <div className="relative">
                    <input
                      type={showWebhookSecret ? "text" : "password"}
                      disabled={!razorpayEnabled}
                      value={razorpayWebhookSecret}
                      onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 pr-9 text-xs text-slate-800 font-mono outline-none focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={!razorpayEnabled}
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Subsection 2B: Cash on Delivery (COD) */}
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

              <div className={`space-y-4 pt-2 transition-all duration-200 ${!codEnabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Minimum COD Order Amount (₹)</label>
                    <input
                      type="number"
                      disabled={!codEnabled}
                      min="0"
                      value={codMinOrderAmount}
                      onChange={(e) => setCodMinOrderAmount(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="200"
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Maximum COD Order Limit (₹)</label>
                    <input
                      type="number"
                      disabled={!codEnabled}
                      min="0"
                      value={codMaxOrderAmount}
                      onChange={(e) => setCodMaxOrderAmount(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="10000"
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* COD Extra Fee Controls */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/60 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Enable Extra COD Handling Fee</h4>
                      <p className="text-[11px] text-slate-500">Charge an additional handling fee when customers select Cash on Delivery.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!codEnabled}
                        checked={codExtraFeeEnabled}
                        onChange={(e) => setCodExtraFeeEnabled(e.target.checked)}
                        className="rounded text-orange-600 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </label>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 transition-all duration-200 ${(!codEnabled || !codExtraFeeEnabled) ? "opacity-50 pointer-events-none" : ""}`}>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Extra COD Fee Amount (₹)</label>
                      <input
                        type="number"
                        disabled={!codEnabled || !codExtraFeeEnabled}
                        min="0"
                        value={codExtraFee}
                        onChange={(e) => setCodExtraFee(Math.max(0, Number(e.target.value) || 0))}
                        placeholder="50"
                        className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CARD 3: TAX & GST COMPUTATION RULES */}
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
                  <p className="text-[11px] text-slate-500">Configure GSTIN identity, default tax percentage, and tax inclusive pricing</p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Enable GST Calculation</span>
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Prices are Tax Inclusive</span>
                  <input
                    type="checkbox"
                    checked={taxInclusive}
                    onChange={(e) => setTaxInclusive(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className={`space-y-4 transition-all duration-200 ${!gstEnabled ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                    <span>GSTIN Number</span>
                  </label>
                  <input
                    type="text"
                    disabled={!gstEnabled}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:bg-white focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Default Tax Rate % (0 to 100)</label>
                  <input
                    type="number"
                    disabled={!gstEnabled}
                    min="0"
                    max="100"
                    step="0.1"
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    placeholder="18"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!gstEnabled}
                    checked={gstAppliesToDelivery}
                    onChange={(e) => setGstAppliesToDelivery(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">Apply GST to Delivery Charges</span>
                    <p className="text-[11px] text-slate-500">Calculate tax on shipping/delivery fees in addition to product subtotal.</p>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* CARD 4: DELIVERY & SHIPPING FEE RULES */}
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
                  checked={deliveryFeeEnabled}
                  onChange={(e) => setDeliveryFeeEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>

            <div className={`space-y-6 transition-all duration-200 ${!deliveryFeeEnabled ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Default Shipping Fee (₹)</label>
                  <input
                    type="number"
                    disabled={!deliveryFeeEnabled}
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="50"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Free Shipping Threshold (₹)</label>
                  <input
                    type="number"
                    disabled={!deliveryFeeEnabled}
                    min="0"
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(Math.max(0, Number(e.target.value) || 0))}
                    placeholder="999"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    Orders with subtotal equal to or above this amount qualify for free delivery.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Estimated Days</span>
                  </label>
                  <input
                    type="number"
                    disabled={!deliveryFeeEnabled}
                    min="1"
                    max="30"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Math.max(1, Number(e.target.value) || 1))}
                    placeholder="3"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Default Courier</label>
                  <input
                    type="text"
                    disabled={!deliveryFeeEnabled}
                    value={courierDefault}
                    onChange={(e) => setCourierDefault(e.target.value)}
                    placeholder="Delhivery"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Extra Platform / Handling Fee Subsection */}
              <div className="p-4 rounded-2xl bg-[#F8F5F1] border border-slate-200/60 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Extra Platform / Handling Fee</h3>
                    <p className="text-[11px] text-slate-500">Configure optional or compulsory platform handling charges per order</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Enable Extra Handling Fee</span>
                    <input
                      type="checkbox"
                      disabled={!deliveryFeeEnabled}
                      checked={deliveryExtraFeeEnabled}
                      onChange={(e) => setDeliveryExtraFeeEnabled(e.target.checked)}
                      className="rounded text-orange-600 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </label>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 transition-all duration-200 ${(!deliveryFeeEnabled || !deliveryExtraFeeEnabled) ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Extra Fee Name *</label>
                    <input
                      type="text"
                      disabled={!deliveryFeeEnabled || !deliveryExtraFeeEnabled}
                      value={deliveryExtraFeeName}
                      onChange={(e) => setDeliveryExtraFeeName(e.target.value)}
                      placeholder="Platform Fee"
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Extra Fee Amount (₹)</label>
                    <input
                      type="number"
                      disabled={!deliveryFeeEnabled || !deliveryExtraFeeEnabled}
                      min="0"
                      value={deliveryExtraFeeAmount}
                      onChange={(e) => setDeliveryExtraFeeAmount(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="10"
                      className="w-full rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:border-orange-400 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!deliveryFeeEnabled || !deliveryExtraFeeEnabled}
                        checked={isExtraFeeCompulsory}
                        onChange={(e) => setIsExtraFeeCompulsory(e.target.checked)}
                        className="rounded text-orange-600 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="text-xs font-bold text-slate-700">Is Extra Fee Compulsory</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
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
