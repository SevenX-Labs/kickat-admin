"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Calendar,
  Users,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  CampaignAudienceEnum,
  CampaignChannelEnum,
  CreateCampaignDto,
} from "@/types/admin-campaign";
import AdminCampaignService from "@/services/adminCampaignService";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<CampaignChannelEnum>(
    CampaignChannelEnum.WHATSAPP
  );
  const [audienceType, setAudienceType] = useState<CampaignAudienceEnum>(
    CampaignAudienceEnum.ALL_CUSTOMERS
  );
  const [subject, setSubject] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInsertVariable = (variable: string) => {
    setMessage((prev) => prev + variable);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a campaign name");
      return;
    }
    if (!message.trim()) {
      setError("Please write a campaign message");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dto: CreateCampaignDto = {
        name: name.trim(),
        channel,
        message: message.trim(),
        audienceType,
        ...(subject.trim() && { subject: subject.trim() }),
        ...(templateId.trim() && { templateId: templateId.trim() }),
        ...(scheduledAt ? { scheduledAt: new Date(scheduledAt).toISOString() } : { scheduledAt: null }),
      };

      await AdminCampaignService.createCampaign(dto);
      onSuccess();
      onClose();
      // Reset form
      setName("");
      setMessage("");
      setSubject("");
      setTemplateId("");
      setScheduledAt("");
    } catch (err) {
      setError(AdminCampaignService.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="clay-card relative w-full max-w-2xl bg-white p-6 shadow-2xl rounded-3xl my-8 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-fraunces text-xl font-bold text-[#2A241E]">
              Create Marketing Campaign
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Broadcast promotional notifications across WhatsApp, SMS, or Email
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Campaign Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Diwali Treats & Accessories 20% Sale"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
            />
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono-eyebrow">
              Channel *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: CampaignChannelEnum.WHATSAPP,
                  label: "WhatsApp",
                  icon: MessageSquare,
                  color: "border-emerald-500 bg-emerald-50/40 text-emerald-700",
                },
                {
                  id: CampaignChannelEnum.SMS,
                  label: "SMS",
                  icon: Smartphone,
                  color: "border-blue-500 bg-blue-50/40 text-blue-700",
                },
                {
                  id: CampaignChannelEnum.EMAIL,
                  label: "Email",
                  icon: Mail,
                  color: "border-indigo-500 bg-indigo-50/40 text-indigo-700",
                },
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = channel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id as CampaignChannelEnum)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-bold transition ${
                      isSelected
                        ? `${ch.color} ring-2 ring-orange-500/20 shadow-xs`
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Target Audience Segment
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <select
                value={audienceType}
                onChange={(e) =>
                  setAudienceType(e.target.value as CampaignAudienceEnum)
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
              >
                <option value={CampaignAudienceEnum.ALL_CUSTOMERS}>
                  All Registered Customers
                </option>
                <option value={CampaignAudienceEnum.ACTIVE_CUSTOMERS}>
                  Active Customers (Ordered in last 90 days)
                </option>
                <option value={CampaignAudienceEnum.INACTIVE_CUSTOMERS}>
                  Inactive Customers (No order in last 90 days)
                </option>
                <option value={CampaignAudienceEnum.PET_OWNERS_DOG}>
                  Dog Owners Segment
                </option>
                <option value={CampaignAudienceEnum.PET_OWNERS_CAT}>
                  Cat Owners Segment
                </option>
                <option value={CampaignAudienceEnum.HIGH_SPENDERS}>
                  High Spenders / VIP Segment
                </option>
              </select>
            </div>
          </div>

          {/* Email Subject line if EMAIL */}
          {channel === CampaignChannelEnum.EMAIL && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
                Email Subject Line *
              </label>
              <input
                type="text"
                placeholder="e.g. Monsoon Sale: Exclusive 15% off dog raincoats!"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
              />
            </div>
          )}

          {/* Template ID (Optional for WhatsApp DLT/Meta approval) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Approved Template ID / Meta HSM Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. monsoon_sale_v1 or DLT_SMS_98214"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
            />
          </div>

          {/* Message Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono-eyebrow">
                Campaign Message Body *
              </label>
              <div className="flex gap-1.5 text-[10px] font-semibold text-slate-500">
                <span>Variables:</span>
                {["{{name}}", "{{code}}", "{{link}}"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleInsertVariable(v)}
                    className="px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-md hover:bg-orange-100 transition"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Hi {{name}}, enjoy 15% off all monsoon gear with code {{code}} at kickat.co.in!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
            />
          </div>

          {/* Schedule Date & Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Schedule Broadcast (Optional - Leave blank for immediate draft)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="clay-btn-orange inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Creating...</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{scheduledAt ? "Schedule Campaign" : "Save Draft"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
