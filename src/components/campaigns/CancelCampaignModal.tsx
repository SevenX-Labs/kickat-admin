"use client";

import React, { useState } from "react";
import { X, AlertOctagon, Trash2 } from "lucide-react";
import { Campaign } from "@/types/admin-campaign";
import AdminCampaignService from "@/services/adminCampaignService";

interface CancelCampaignModalProps {
  campaign: Campaign | null;
  mode: "CANCEL" | "DELETE";
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelCampaignModal: React.FC<CancelCampaignModalProps> = ({
  campaign,
  mode,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !campaign) return null;

  const handleAction = async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "CANCEL") {
        await AdminCampaignService.cancelCampaign(campaign.id);
      } else {
        await AdminCampaignService.deleteCampaign(campaign.id);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(AdminCampaignService.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isCancel = mode === "CANCEL";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="clay-card relative w-full max-w-md bg-white p-6 shadow-2xl rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                isCancel
                  ? "bg-amber-50 text-amber-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {isCancel ? (
                <AlertOctagon className="h-5 w-5" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </div>
            <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
              {isCancel ? "Cancel Campaign" : "Delete Campaign"}
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
            <AlertOctagon className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600">
          <p>
            {isCancel
              ? `Are you sure you want to cancel the scheduled campaign broadcast for "${campaign.name}"?`
              : `Are you sure you want to permanently delete the campaign "${campaign.name}"?`}
          </p>

          <p className="text-[11px] text-slate-400">
            {isCancel
              ? "The campaign status will be updated to CANCELLED and no automated messages will be dispatched."
              : "This action soft-deletes the campaign configuration."}
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
            onClick={handleAction}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 ${
              isCancel
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <span>{isCancel ? "Confirm Cancel" : "Confirm Delete"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
