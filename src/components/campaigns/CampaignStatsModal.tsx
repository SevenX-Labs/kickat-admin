"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart2,
  MessageSquare,
  Mail,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import {
  Campaign,
  CampaignChannelEnum,
  CampaignStats,
} from "@/types/admin-campaign";
import AdminCampaignService from "@/services/adminCampaignService";

interface CampaignStatsModalProps {
  campaignId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignStatsModal: React.FC<CampaignStatsModalProps> = ({
  campaignId,
  isOpen,
  onClose,
}) => {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [campaignDetail, setCampaignDetail] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    setError(null);
    try {
      const [statsRes, detailRes] = await Promise.all([
        AdminCampaignService.getStats(campaignId),
        AdminCampaignService.getCampaignById(campaignId),
      ]);
      setStats(statsRes.data);
      setCampaignDetail(detailRes.data);
    } catch (err) {
      setError(AdminCampaignService.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (isOpen && campaignId) {
      fetchStats();
    }
  }, [isOpen, campaignId, fetchStats]);

  if (!isOpen || !campaignId) return null;

  const renderChannelIcon = (ch?: CampaignChannelEnum) => {
    switch (ch) {
      case CampaignChannelEnum.WHATSAPP:
        return <MessageSquare className="h-4 w-4 text-emerald-600" />;
      case CampaignChannelEnum.SMS:
        return <Smartphone className="h-4 w-4 text-blue-600" />;
      case CampaignChannelEnum.EMAIL:
        return <Mail className="h-4 w-4 text-indigo-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="clay-card relative w-full max-w-3xl bg-white p-6 shadow-2xl rounded-3xl my-8 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 border border-orange-200 text-orange-600 rounded-2xl">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-fraunces text-xl font-bold text-[#2A241E]">
                {campaignDetail?.name || "Campaign Analytics & Stats"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                {renderChannelIcon(campaignDetail?.channel)}
                <span className="font-semibold">{campaignDetail?.channel}</span>
                <span>•</span>
                <span className="font-medium">
                  Segment: {campaignDetail?.audienceType || "ALL_CUSTOMERS"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-orange-600 rounded-2xl border border-slate-200 hover:bg-slate-50 transition"
              title="Refresh Stats"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-orange-600" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Stat Overview Cards */}
        {stats && (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="clay-card p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow block">
                  Total Target
                </span>
                <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">
                  {stats.totalTarget}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Recipients calculated
                </p>
              </div>

              <div className="clay-card p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 font-mono-eyebrow block">
                  Delivered
                </span>
                <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                  {stats.deliveredCount}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  {stats.deliveryRatePercentage}% Delivery Rate
                </p>
              </div>

              <div className="clay-card p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono-eyebrow block">
                  Sent / In Flight
                </span>
                <p className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
                  {stats.sentCount}
                </p>
                <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                  Dispatched via BullMQ
                </p>
              </div>

              <div className="clay-card p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 font-mono-eyebrow block">
                  Failed
                </span>
                <p className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
                  {stats.failedCount}
                </p>
                <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                  Undelivered / Bounced
                </p>
              </div>
            </div>

            {/* Delivery Progress Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Broadcast Delivery Progress</span>
                <span className="font-bold text-orange-600">
                  {stats.totalTarget > 0
                    ? `${Math.round((stats.deliveredCount / stats.totalTarget) * 100)}%`
                    : "0%"}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      stats.totalTarget > 0
                        ? Math.min(100, Math.round((stats.deliveredCount / stats.totalTarget) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Campaign Body Preview */}
            {campaignDetail && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono-eyebrow">
                  Message Configuration & Content
                </label>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap font-medium">
                  {campaignDetail.subject && (
                    <p className="font-bold text-slate-900 mb-1">
                      Subject: {campaignDetail.subject}
                    </p>
                  )}
                  {campaignDetail.message}
                </div>
              </div>
            )}

            {/* Recent Delivery Logs */}
            {campaignDetail?.logs && campaignDetail.logs.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono-eyebrow">
                  Recent Dispatch Activity (Latest 10 Logs)
                </label>
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-2.5">Recipient</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {campaignDetail.logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono">{log.recipient}</td>
                          <td className="p-2.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.status === "SENT" || log.status === "DELIVERED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : log.status === "FAILED"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {log.status === "SENT" || log.status === "DELIVERED" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : log.status === "FAILED" ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              <span>{log.status}</span>
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-400 text-[11px]">
                            {new Date(log.sentAt || log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
