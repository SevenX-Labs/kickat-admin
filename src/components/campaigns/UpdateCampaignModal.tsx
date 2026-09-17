"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MessageSquare,
  Mail,
  Smartphone,
  Calendar,
  Users,
  AlertCircle,
  Save,
} from "lucide-react";
import {
  Campaign,
  CampaignAudienceEnum,
  CampaignChannelEnum,
  UpdateCampaignDto,
} from "@/types/admin-campaign";
import AdminCampaignService from "@/services/adminCampaignService";

interface UpdateCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdateCampaignModal: React.FC<UpdateCampaignModalProps> = ({
  campaign,
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

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || "");
      setChannel(campaign.channel || CampaignChannelEnum.WHATSAPP);
      setAudienceType(campaign.audienceType || CampaignAudienceEnum.ALL_CUSTOMERS);
      setSubject(campaign.subject || "");
      setTemplateId(campaign.templateId || "");
      setMessage(campaign.message || "");
      if (campaign.scheduledAt) {
        const d = new Date(campaign.scheduledAt);
        // Format for datetime-local input YYYY-MM-DDTHH:mm
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
        setScheduledAt(localISOTime);
      } else {
        setScheduledAt("");
      }
    }
  }, [campaign]);

  if (!isOpen || !campaign) return null;

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
      const dto: UpdateCampaignDto = {
        name: name.trim(),
        channel,
        message: message.trim(),
        audienceType,
        subject: subject.trim() || null,
        templateId: templateId.trim() || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      };

      await AdminCampaignService.updateCampaign(campaign.id, dto);
      onSuccess();
      onClose();
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
              Edit Campaign details
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Update configuration for campaign "{campaign.name}"
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

          {/* Subject Line for Email */}
          {channel === CampaignChannelEnum.EMAIL && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
              />
            </div>
          )}

          {/* Template ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Approved Template ID / Meta HSM Name
            </label>
            <input
              type="text"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
            />
          </div>

          {/* Message Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Campaign Message Body *
            </label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
            />
          </div>

          {/* Schedule Date & Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Schedule Date & Time
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
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Campaign</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
