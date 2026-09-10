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
  Sparkles
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  AdminSettingsService, 
  GeneralSettings, 
  PaymentSettings, 
  TaxSettings, 
  DeliverySettings 
} from "@/services/adminSettingsService";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // TAB 1: General Settings
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // TAB 2: Payment Methods
  const [codEnabled, setCodEnabled] = useState(true);
  const [codExtraFee, setCodExtraFee] = useState<number>(0);
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);

  // TAB 3: Tax & GST
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstNumber, setGstNumber] = useState("");
  const [gstPercentage, setGstPercentage] = useState<number>(18);

  // TAB 4: Delivery Settings
  const [deliveryFeeEnabled, setDeliveryFeeEnabled] = useState(true);
  const [deliveryFee, setDeliveryFee] = useState<number>(50);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDone = useRef(false);

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
        setSupportEmail(data.general.supportEmail || "");
        setSupportPhone(data.general.supportPhone || "");
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
        if (data.payment.cod) {
          setCodEnabled(data.payment.cod.enabled ?? true);
          setCodExtraFee(data.payment.cod.extraFee ?? 0);
        }
        if (data.payment.upi) setUpiEnabled(data.payment.upi.enabled ?? true);
        if (data.payment.card) setCardEnabled(data.payment.card.enabled ?? true);
      }

      // Tax
      if (data.tax) {
        setGstEnabled(data.tax.gstEnabled ?? true);
        setGstNumber(data.tax.gstNumber || "");
        setGstPercentage(data.tax.gstPercentage ?? 18);
      }

      // Delivery
      if (data.delivery) {
        setDeliveryFeeEnabled(data.delivery.deliveryFeeEnabled ?? true);
        setDeliveryFee(data.delivery.deliveryFee ?? 50);
        setFreeDeliveryThreshold(data.delivery.freeDeliveryThreshold ?? 0);
      }
      setSaveStatus("saved");
      initialLoadDone.current = true;
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

  // Auto-Save Function
  const saveSectionSettings = useCallback(async (section: "general" | "payment" | "tax" | "delivery", overrideData?: any) => {
    if (!initialLoadDone.current) return;
    setAutoSaving(true);
    setSaveStatus("saving");

    try {
      if (section === "general") {
        const payload: GeneralSettings = {
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
          ...overrideData,
        };
        await AdminSettingsService.updateGeneral(payload);
      } else if (section === "payment") {
        const payload: PaymentSettings = {
          cod: {
            enabled: codEnabled,
            extraFee: Number(codExtraFee) || 0,
          },
          upi: {
            enabled: upiEnabled,
          },
          card: {
            enabled: cardEnabled,
          },
          ...overrideData,
        };
        await AdminSettingsService.updatePayment(payload);
      } else if (section === "tax") {
        const payload: TaxSettings = {
          gstEnabled,
          gstNumber,
          gstPercentage: Number(gstPercentage) || 0,
          ...overrideData,
        };
        await AdminSettingsService.updateTax(payload);
      } else if (section === "delivery") {
        const payload: DeliverySettings = {
          deliveryFeeEnabled,
          deliveryFee: Number(deliveryFee) || 0,
          freeDeliveryThreshold: Number(freeDeliveryThreshold) || 0,
          ...overrideData,
        };
        await AdminSettingsService.updateDelivery(payload);
      }

      setSaveStatus("saved");
      showToast("Auto-saved changes!");
    } catch (err: any) {
      console.error("Auto-save error:", err);
      setSaveStatus("idle");
      const msg = err?.response?.data?.message || "Failed to auto-save settings.";
      showToast(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setAutoSaving(false);
    }
  }, [
    supportEmail, supportPhone, maintenanceMode, instagramUrl, facebookUrl, youtubeUrl, twitterUrl, linkedinUrl,
    codEnabled, codExtraFee, upiEnabled, cardEnabled,
    gstEnabled, gstNumber, gstPercentage,
    deliveryFeeEnabled, deliveryFee, freeDeliveryThreshold
  ]);

  // Trigger Debounced Auto-Save on text/number changes
  const triggerDebouncedAutoSave = (section: "general" | "payment" | "tax" | "delivery") => {
    setSaveStatus("saving");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveSectionSettings(section);
    }, 700);
  };

  // Instant Auto-Save for toggle switches
  const toggleGeneralMaintenance = (val: boolean) => {
    setMaintenanceMode(val);
    saveSectionSettings("general", { maintenanceMode: val });
  };

  const toggleCodEnabled = (val: boolean) => {
    setCodEnabled(val);
    saveSectionSettings("payment", { cod: { enabled: val, extraFee: Number(codExtraFee) || 0 } });
  };

  const toggleUpiEnabled = (val: boolean) => {
    setUpiEnabled(val);
    saveSectionSettings("payment", { upi: { enabled: val } });
  };

  const toggleCardEnabled = (val: boolean) => {
    setCardEnabled(val);
    saveSectionSettings("payment", { card: { enabled: val } });
  };

  const toggleGstEnabled = (val: boolean) => {
    setGstEnabled(val);
    saveSectionSettings("tax", { gstEnabled: val });
  };

  const toggleDeliveryFeeEnabled = (val: boolean) => {
    setDeliveryFeeEnabled(val);
    saveSectionSettings("delivery", { deliveryFeeEnabled: val });
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 pb-20">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
            Store & System Settings
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Automatic live synchronization for platform support, payments, GST rates, and delivery fees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-Save Indicator Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-semibold">
            {autoSaving || saveStatus === "saving" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 text-orange-500 animate-spin" />
                <span className="text-orange-600">Auto-saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-700">All changes saved</span>
              </>
            ) : (
              <span className="text-slate-400">Auto-save enabled</span>
            )}
          </div>

          <button
            type="button"
            onClick={loadAllSettings}
            disabled={loading}
            className="clay-button p-2 text-slate-600 hover:text-orange-600 transition rounded-2xl cursor-pointer"
            title="Refresh Settings"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content Sections Form - Single Scrollable Layout */}
      {loading ? (
        <div className="clay-card p-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <span className="text-xs font-bold text-slate-500">Loading settings...</span>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          
          {/* SECTION 1: GENERAL SETTINGS */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    General Platform Settings
                  </h2>
                  <p className="text-[11px] text-slate-500">Support contact details, social channels & maintenance control</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-red-50 hover:bg-red-100/70 border border-red-200/60 px-3 py-1.5 rounded-xl transition">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <span className="text-xs font-bold text-red-900">Maintenance Mode</span>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => toggleGeneralMaintenance(e.target.checked)}
                  className="rounded text-red-600 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Support Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => {
                    setSupportEmail(e.target.value);
                    triggerDebouncedAutoSave("general");
                  }}
                  placeholder="support@kickat.co.in"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Support Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => {
                    setSupportPhone(e.target.value);
                    triggerDebouncedAutoSave("general");
                  }}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono-eyebrow flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                <span>Social Media Links</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Instagram URL</label>
                  <input
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => {
                      setInstagramUrl(e.target.value);
                      triggerDebouncedAutoSave("general");
                    }}
                    placeholder="https://instagram.com/kickat"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Facebook URL</label>
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => {
                      setFacebookUrl(e.target.value);
                      triggerDebouncedAutoSave("general");
                    }}
                    placeholder="https://facebook.com/kickat"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">YouTube URL</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      triggerDebouncedAutoSave("general");
                    }}
                    placeholder="https://youtube.com/@kickat"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">Twitter / X URL</label>
                  <input
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => {
                      setTwitterUrl(e.target.value);
                      triggerDebouncedAutoSave("general");
                    }}
                    placeholder="https://x.com/kickat"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => {
                      setLinkedinUrl(e.target.value);
                      triggerDebouncedAutoSave("general");
                    }}
                    placeholder="https://linkedin.com/company/kickat"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: PAYMENT METHODS */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                  Payment Methods & Gateways
                </h2>
                <p className="text-[11px] text-slate-500">Configure enabled payment methods and COD charges</p>
              </div>
            </div>

            {/* Cash On Delivery */}
            <div className="clay-inset p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Cash on Delivery (COD)</h3>
                  <p className="text-[11px] text-slate-500">Allow customers to pay via cash upon delivery</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-slate-700">Enable COD</span>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => toggleCodEnabled(e.target.checked)}
                    className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                  />
                </label>
              </div>

              {codEnabled && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700">COD Extra Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={codExtraFee}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      setCodExtraFee(val);
                      triggerDebouncedAutoSave("payment");
                    }}
                    placeholder="40"
                    className="w-full sm:w-64 rounded-xl bg-white border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none mt-1"
                  />
                </div>
              )}
            </div>

            {/* UPI */}
            <label className="clay-inset p-4 sm:p-5 flex items-center justify-between cursor-pointer gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800">UPI Instant Payment</h3>
                <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm & BHIM UPI checkout</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-700">Enable UPI</span>
                <input
                  type="checkbox"
                  checked={upiEnabled}
                  onChange={(e) => toggleUpiEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </div>
            </label>

            {/* Credit/Debit Cards */}
            <label className="clay-inset p-4 sm:p-5 flex items-center justify-between cursor-pointer gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Card Payment (Credit/Debit)</h3>
                <p className="text-[11px] text-slate-500">Visa, Mastercard, RuPay & Diners Club cards</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-700">Enable Card Payment</span>
                <input
                  type="checkbox"
                  checked={cardEnabled}
                  onChange={(e) => toggleCardEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </div>
            </label>
          </section>

          {/* SECTION 3: TAX & GST */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    Tax & GST Rules
                  </h2>
                  <p className="text-[11px] text-slate-500">Manage store GSTIN and baseline tax calculation percentage</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <span className="text-xs font-bold text-slate-700">Enable GST</span>
                <input
                  type="checkbox"
                  checked={gstEnabled}
                  onChange={(e) => toggleGstEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>

            {gstEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">GST Number (GSTIN)</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => {
                      setGstNumber(e.target.value);
                      triggerDebouncedAutoSave("tax");
                    }}
                    placeholder="27AABCU9603R1ZM"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 font-mono outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Global GST Rate % (0 to 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gstPercentage}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                      setGstPercentage(val);
                      triggerDebouncedAutoSave("tax");
                    }}
                    placeholder="18"
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                  />
                </div>
              </div>
            )}
          </section>

          {/* SECTION 4: DELIVERY SETTINGS */}
          <section className="clay-card p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E]">
                    Delivery Settings
                  </h2>
                  <p className="text-[11px] text-slate-500">Set standard delivery charges & free shipping thresholds</p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <span className="text-xs font-bold text-slate-700">Enable Delivery Charges</span>
                <input
                  type="checkbox"
                  checked={deliveryFeeEnabled}
                  onChange={(e) => toggleDeliveryFeeEnabled(e.target.checked)}
                  className="rounded text-orange-600 h-4 w-4 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Standard Delivery Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    setDeliveryFee(val);
                    triggerDebouncedAutoSave("delivery");
                  }}
                  placeholder="50"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Free Delivery Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={freeDeliveryThreshold}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    setFreeDeliveryThreshold(val);
                    triggerDebouncedAutoSave("delivery");
                  }}
                  placeholder="499"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-orange-400 transition"
                />

                {/* Customer Side Free Delivery Banner Helper */}
                {freeDeliveryThreshold === 0 ? (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fade-in">
                    <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>⚡ Free Delivery is enabled on ALL orders for customer checkout!</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium pt-0.5">
                    Set to 0 to grant Free Delivery on all customer orders regardless of cart total.
                  </p>
                )}
              </div>
            </div>
          </section>

        </div>
      )}

    </div>
  );
}
