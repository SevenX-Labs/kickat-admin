"use client";

import {
  Globe,
  CreditCard,
  Receipt,
  Truck,
  Check,
  RefreshCw,
  ShieldAlert,
  Loader2,
  Save,
  Key,
  Lock,
  Building2,
  Clock,
  Wallet,
  Landmark,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  MessageSquare,
  Share2,
  Link as LinkIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  AdminSettingsService,
  AdminSettingsForm,
} from "@/services/adminSettingsService";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "general" | "payment" | "tax" | "delivery" | "security"
  >("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // CARD 1: General Settings
  const [storeName, setStoreName] = useState("Kickat");
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
  const [codMinOrderAmount, setCodMinOrderAmount] = useState<number>(0);
  const [codMaxOrderAmount, setCodMaxOrderAmount] = useState<number>(50000);
  const [codExtraFeeEnabled, setCodExtraFeeEnabled] = useState(false);
  const [codExtraFee, setCodExtraFee] = useState<number>(0);

  // Method Toggles
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [walletEnabled, setWalletEnabled] = useState(true);
  const [netbankingEnabled, setNetbankingEnabled] = useState(true);

  // CARD 3: Tax & GST Computation Rules
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstin, setGstin] = useState("");
  const [gstPercentage, setGstPercentage] = useState<number>(0);
  const [gstAppliesToDelivery, setGstAppliesToDelivery] = useState(false);
  const [taxInclusive, setTaxInclusive] = useState(false);

  // CARD 4: Delivery & Shipping Fee Rules
  const [deliveryFeeEnabled, setDeliveryFeeEnabled] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState<number>(50);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(499);
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [courierDefault, setCourierDefault] = useState("Delhivery");
  const [deliveryExtraFeeEnabled, setDeliveryExtraFeeEnabled] = useState(false);
  const [deliveryExtraFeeName, setDeliveryExtraFeeName] = useState("");
  const [deliveryExtraFeeAmount, setDeliveryExtraFeeAmount] = useState<number>(0);
  const [isExtraFeeCompulsory, setIsExtraFeeCompulsory] = useState(true);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminSettingsService.getAll();
      const data = res?.data || {};

      // General
      if (data.general) {
        setStoreName(data.general.storeName || "Kickat");
        setSupportEmail(data.general.supportEmail || "support@kickat.co.in");
        setSupportPhone(data.general.supportPhone || "+91 98765 43210");
        setMaintenanceMode(Boolean(data.general.maintenanceMode));
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
          setCodMinOrderAmount(data.payment.cod.minOrderAmount ?? 0);
          setCodMaxOrderAmount(data.payment.cod.maxOrderAmount ?? 50000);
          setCodExtraFeeEnabled(Boolean(data.payment.cod.extraFeeEnabled));
          setCodExtraFee(data.payment.cod.extraFee ?? 0);
        }

        if (data.payment.upi) setUpiEnabled(data.payment.upi.enabled ?? true);
        if (data.payment.card) setCardEnabled(data.payment.card.enabled ?? true);
        if (data.payment.wallet) setWalletEnabled(data.payment.wallet.enabled ?? true);
        if (data.payment.netbanking)
          setNetbankingEnabled(data.payment.netbanking.enabled ?? true);
      }

      // Tax
      if (data.tax) {
        setGstEnabled(Boolean(data.tax.gstEnabled));
        setGstPercentage(data.tax.gstPercentage ?? 0);
        setGstAppliesToDelivery(Boolean(data.tax.gstAppliesToDelivery));
        setTaxInclusive(Boolean(data.tax.taxInclusive));
        setGstin(data.tax.gstNumber || "");
      }

      // Delivery
      if (data.delivery) {
        setDeliveryFeeEnabled(data.delivery.deliveryFeeEnabled ?? true);
        setDeliveryFee(data.delivery.deliveryFee ?? 50);
        setFreeDeliveryThreshold(data.delivery.freeDeliveryThreshold ?? 499);
        setEstimatedDays(data.delivery.estimatedDays ?? 3);
        setCourierDefault(data.delivery.courierDefault || "Delhivery");
        setDeliveryExtraFeeEnabled(Boolean(data.delivery.extraFeeEnabled));
        setDeliveryExtraFeeName(data.delivery.extraFeeName || "");
        setDeliveryExtraFeeAmount(data.delivery.extraFeeAmount ?? 0);
        setIsExtraFeeCompulsory(data.delivery.isExtraFeeCompulsory ?? true);
      }
    } catch (err: any) {
      showToast(
        AdminSettingsService.extractErrorMessage(err, "Failed to load store settings"),
        "error"
      );
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
    if (
      deliveryFeeEnabled &&
      deliveryExtraFeeEnabled &&
      (!deliveryExtraFeeName || deliveryExtraFeeName.trim() === "")
    ) {
      showToast(
        "extraFeeName is required and cannot be empty when extra fee is enabled",
        "error"
      );
      return;
    }

    if (gstEnabled && (gstPercentage < 0 || gstPercentage > 100)) {
      showToast("GST percentage must be between 0 and 100.", "error");
      return;
    }

    setSaving(true);

    try {
      const payload: AdminSettingsForm = {
        general: {
          storeName: storeName.trim(),
          supportEmail: supportEmail.trim(),
          supportPhone: supportPhone.trim(),
          maintenanceMode,
          socialLinks: {
            instagram: instagramUrl.trim(),
            facebook: facebookUrl.trim(),
            youtube: youtubeUrl.trim(),
            twitter: twitterUrl.trim(),
            linkedin: linkedinUrl.trim(),
          },
        },
        payment: {
          razorpay: {
            enabled: razorpayEnabled,
            ...(razorpayKeyId && { keyId: razorpayKeyId.trim() }),
            ...(razorpayKeySecret && { keySecret: razorpayKeySecret.trim() }),
            ...(razorpayWebhookSecret && { webhookSecret: razorpayWebhookSecret.trim() }),
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
          gstNumber: gstin.trim() || null,
          gstPercentage: Number(gstPercentage) || 0,
          gstAppliesToDelivery,
          taxInclusive,
        },
        delivery: {
          deliveryFeeEnabled,
          deliveryFee: Number(deliveryFee) || 0,
          freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
          estimatedDays: Number(estimatedDays) || 0,
          courierDefault: courierDefault.trim(),
          extraFeeEnabled: deliveryExtraFeeEnabled,
          extraFeeName: deliveryExtraFeeEnabled ? deliveryExtraFeeName.trim() || null : null,
          extraFeeAmount: Number(deliveryExtraFeeAmount) || 0,
          isExtraFeeCompulsory,
        },
      };

      await AdminSettingsService.updateAll(payload);
      showToast("Store settings updated successfully!");
    } catch (err: any) {
      showToast(
        AdminSettingsService.extractErrorMessage(err, "Failed to save settings."),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }
    if (!newPassword) {
      showToast("Please enter a new password", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New password and confirm password do not match", "error");
      return;
    }
    if (currentPassword === newPassword) {
      showToast("New password must be different from current password", "error");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await AdminSettingsService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      showToast(res.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(
        AdminSettingsService.extractErrorMessage(err, "Failed to change password"),
        "error"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-bold shadow-2xl animate-fade-in ${
            toastMessage.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-[#2A241E] text-white"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="h-5 w-5 text-rose-200 shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
            Store & System Settings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Configure platform branding, payment gateways, GST tax computation, shipping fees, and security.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadAllSettings}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-orange-600" : ""}`} />
            <span>Reload</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAllSettings}
            disabled={saving || loading}
            className="clay-btn-orange inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer disabled:opacity-60"
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl overflow-x-auto text-xs font-bold no-scrollbar">
        {[
          { id: "all", label: "All Settings", icon: Globe },
          { id: "general", label: "General & Branding", icon: Building2 },
          { id: "payment", label: "Payments & Gateway", icon: CreditCard },
          { id: "tax", label: "Tax & GST", icon: Receipt },
          { id: "delivery", label: "Shipping & Handling", icon: Truck },
          { id: "security", label: "Security & Password", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          <p className="text-xs font-bold text-slate-600">Loading store settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveAllSettings} className="space-y-6 sm:space-y-8">
          {/* SECTION 1: GENERAL & BRANDING */}
          {(activeTab === "all" || activeTab === "general") && (
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
                    <p className="text-[11px] text-slate-500">
                      Store branding, customer support touchpoints & maintenance mode
                    </p>
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
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-amber-900 text-xs">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Maintenance Mode is active.</span> Enable to display maintenance banner to customers and pause customer checkouts.
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Store Name *</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Kickat"
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-hidden focus:bg-white focus:border-orange-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Support Email *</label>
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@kickat.co.in"
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-hidden focus:bg-white focus:border-orange-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Support Phone *</label>
                  <input
                    type="text"
                    required
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs text-slate-800 outline-hidden focus:bg-white focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Social Links Subsection */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono-eyebrow">
                  Social Media Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Share2 className="h-3.5 w-3.5 text-pink-600" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/kickat"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Share2 className="h-3.5 w-3.5 text-blue-600" />
                      <span>Facebook</span>
                    </label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/kickat"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Share2 className="h-3.5 w-3.5 text-rose-600" />
                      <span>YouTube</span>
                    </label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@kickat"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Share2 className="h-3.5 w-3.5 text-sky-500" />
                      <span>Twitter / X</span>
                    </label>
                    <input
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://x.com/kickat"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Share2 className="h-3.5 w-3.5 text-blue-700" />
                      <span>LinkedIn</span>
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/company/kickat"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2 text-xs text-slate-800 focus:bg-white focus:border-orange-500 transition"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: PAYMENT METHODS & GATEWAYS */}
          {(activeTab === "all" || activeTab === "payment") && (
            <section className="clay-card p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                      Payment Methods & Gateways
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Razorpay keys, Cash on Delivery (COD) limits & checkout payment options
                    </p>
                  </div>
                </div>
              </div>

              {/* Razorpay Subsection */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Key className="h-4 w-4 text-indigo-600" />
                    <span>Razorpay Integration</span>
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Enable Razorpay</span>
                    <input
                      type="checkbox"
                      checked={razorpayEnabled}
                      onChange={(e) => setRazorpayEnabled(e.target.checked)}
                      className="rounded text-indigo-600 h-4 w-4 cursor-pointer"
                    />
                  </label>
                </div>

                {razorpayEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Key ID</label>
                      <input
                        type="text"
                        value={razorpayKeyId}
                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                        placeholder="rzp_live_..."
                        className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-mono text-slate-800 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Key Secret</label>
                      <input
                        type="password"
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-mono text-slate-800 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">Webhook Secret</label>
                      <input
                        type="password"
                        value={razorpayWebhookSecret}
                        onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-mono text-slate-800 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* COD Subsection */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    <span>Cash on Delivery (COD) Rules</span>
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Enable COD</span>
                    <input
                      type="checkbox"
                      checked={codEnabled}
                      onChange={(e) => setCodEnabled(e.target.checked)}
                      className="rounded text-emerald-600 h-4 w-4 cursor-pointer"
                    />
                  </label>
                </div>

                {codEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Min Order Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={codMinOrderAmount}
                        onChange={(e) => setCodMinOrderAmount(Number(e.target.value) || 0)}
                        className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-medium text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Max Order Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={codMaxOrderAmount}
                        onChange={(e) => setCodMaxOrderAmount(Number(e.target.value) || 0)}
                        className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-medium text-slate-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-semibold text-slate-700">Extra Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        disabled={!codExtraFeeEnabled}
                        value={codExtraFee}
                        onChange={(e) => setCodExtraFee(Number(e.target.value) || 0)}
                        className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-medium text-slate-800 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={codExtraFeeEnabled}
                          onChange={(e) => setCodExtraFeeEnabled(e.target.checked)}
                          className="rounded text-emerald-600 h-4 w-4 cursor-pointer"
                        />
                        <span className="font-bold text-slate-700">Extra Fee Enabled</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Payment Toggles */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono-eyebrow mb-2.5">
                  Enabled Checkout Payment Methods
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { label: "UPI Payments", state: upiEnabled, setter: setUpiEnabled, icon: Smartphone },
                    { label: "Credit/Debit Cards", state: cardEnabled, setter: setCardEnabled, icon: CreditCard },
                    { label: "Mobile Wallets", state: walletEnabled, setter: setWalletEnabled, icon: Wallet },
                    { label: "Net Banking", state: netbankingEnabled, setter: setNetbankingEnabled, icon: Landmark },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <label
                        key={m.label}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                          m.state
                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-900 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{m.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={m.state}
                          onChange={(e) => m.setter(e.target.checked)}
                          className="rounded text-emerald-600 h-4 w-4"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: TAX & GST */}
          {(activeTab === "all" || activeTab === "tax") && (
            <section className="clay-card p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                      Tax & GST Computation Rules
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      GSTIN registration, percentage rates, inclusive tax & shipping GST rules
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <span className="text-xs font-bold text-slate-700">Enable GST Tax</span>
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                    className="rounded text-blue-600 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">GSTIN Registration Number</label>
                  <input
                    type="text"
                    disabled={!gstEnabled}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-2.5 font-mono text-slate-800 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Default GST Rate (%)</label>
                  <input
                    type="number"
                    disabled={!gstEnabled}
                    min="0"
                    max="100"
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(Number(e.target.value) || 0)}
                    placeholder="18"
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-2.5 font-medium text-slate-800 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!gstEnabled}
                    checked={taxInclusive}
                    onChange={(e) => setTaxInclusive(e.target.checked)}
                    className="rounded text-blue-600 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Tax Inclusive Prices</span>
                    <span className="text-[10px] text-slate-500">
                      Product catalog prices already include GST.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!gstEnabled}
                    checked={gstAppliesToDelivery}
                    onChange={(e) => setGstAppliesToDelivery(e.target.checked)}
                    className="rounded text-blue-600 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Apply GST to Shipping</span>
                    <span className="text-[10px] text-slate-500">
                      Apply tax calculation to delivery and handling charges.
                    </span>
                  </div>
                </label>
              </div>
            </section>
          )}

          {/* SECTION 4: SHIPPING & DELIVERY */}
          {(activeTab === "all" || activeTab === "delivery") && (
            <section className="clay-card p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                      Shipping & Delivery Rules
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Standard shipping fees, free delivery threshold & platform handling charges
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <span className="text-xs font-bold text-slate-700">Enable Shipping Fee</span>
                  <input
                    type="checkbox"
                    checked={deliveryFeeEnabled}
                    onChange={(e) => setDeliveryFeeEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Default Shipping Fee (₹)</label>
                  <input
                    type="number"
                    disabled={!deliveryFeeEnabled}
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-2.5 font-medium text-slate-800 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Free Delivery Threshold (₹)</label>
                  <input
                    type="number"
                    disabled={!deliveryFeeEnabled}
                    min="0"
                    value={freeDeliveryThreshold}
                    onChange={(e) => setFreeDeliveryThreshold(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-2.5 font-medium text-slate-800 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Estimated Days</label>
                  <input
                    type="number"
                    disabled={!deliveryFeeEnabled}
                    min="1"
                    max="30"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-2.5 font-medium text-slate-800 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Default Courier Partner</label>
                  <input
                    type="text"
                    disabled={!deliveryFeeEnabled}
                    value={courierDefault}
                    onChange={(e) => setCourierDefault(e.target.value)}
                    placeholder="Delhivery"
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-800 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Extra Handling Fee Subsection */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800">Extra Platform / Handling Charge</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700">Enable Extra Fee</span>
                    <input
                      type="checkbox"
                      disabled={!deliveryFeeEnabled}
                      checked={deliveryExtraFeeEnabled}
                      onChange={(e) => setDeliveryExtraFeeEnabled(e.target.checked)}
                      className="rounded text-orange-600 h-4 w-4 cursor-pointer disabled:opacity-50"
                    />
                  </label>
                </div>

                {deliveryExtraFeeEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Extra Fee Name *</label>
                      <input
                        type="text"
                        required
                        value={deliveryExtraFeeName}
                        onChange={(e) => setDeliveryExtraFeeName(e.target.value)}
                        placeholder="Platform Fee"
                        className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-medium text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">Extra Fee Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={deliveryExtraFeeAmount}
                        onChange={(e) => setDeliveryExtraFeeAmount(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full rounded-xl bg-white border border-slate-200 p-2 text-xs font-medium text-slate-800"
                      />
                    </div>

                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isExtraFeeCompulsory}
                          onChange={(e) => setIsExtraFeeCompulsory(e.target.checked)}
                          className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                        />
                        <span className="font-bold text-slate-700">Compulsory Charge</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Save Bar */}
          {(activeTab === "all" || activeTab !== "security") && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving || loading}
                className="clay-btn-orange inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition cursor-pointer disabled:opacity-60"
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
          )}
        </form>
      )}

      {/* SECTION 5: SECURITY & ADMIN PASSWORD CHANGE */}
      {(activeTab === "all" || activeTab === "security") && (
        <section className="clay-card p-5 sm:p-7 space-y-6 border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  Security & Admin Password Change
                </h2>
                <p className="text-[11px] text-slate-500">
                  Update your authenticated administrator account password
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono-eyebrow">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-rose-500 outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono-eyebrow">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-rose-500 outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-mono-eyebrow">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-rose-500 outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {newPassword && confirmPassword && (
                <p
                  className={`mt-1 text-[11px] font-bold ${
                    newPassword === confirmPassword
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {newPassword === confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  <span>Update Admin Password</span>
                </>
              )}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
