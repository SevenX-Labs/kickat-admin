"use client";

import React, { useState } from "react";
import { X, Send, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Campaign } from "@/types/admin-campaign";
import AdminCampaignService from "@/services/adminCampaignService";

interface SendCampaignModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SendCampaignModal: React.FC<SendCampaignModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !campaign) return null;

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      await AdminCampaignService.sendCampaign(campaign.id);
      onSuccess();
      onClose();
    } catch (err) {
      setError(AdminCampaignService.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="clay-card relative w-full max-w-md bg-white p-6 shadow-2xl rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Send className="h-5 w-5" />
            </div>
            <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
              Dispatch Broadcast
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            Are you sure you want to trigger immediate message dispatch for{" "}
            <strong className="text-slate-900 font-bold">{campaign.name}</strong>?
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Channel:</span>
              <span className="font-bold text-slate-800">{campaign.channel}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Target Segment:</span>
              <span className="font-bold text-slate-800">{campaign.audienceType}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Estimated Target Count:</span>
              <span className="font-bold text-emerald-600">{campaign.totalTarget} recipients</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            This operation will queue message payloads to background BullMQ workers.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
          >
            {loading ? (
              <span>Dispatching...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Confirm & Send Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
