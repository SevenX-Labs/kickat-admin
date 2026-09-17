"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  MessageSquare,
  Smartphone,
  Mail,
  Send,
  BarChart2,
  Edit3,
  Trash2,
  XCircle,
  Users,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Tag,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import {
  AdminCampaignSortEnum,
  AdminCampaignsQuery,
  AdminCampaignSummary,
  Campaign,
  CampaignAudienceEnum,
  CampaignChannelEnum,
  CampaignStatusEnum,
  PaginationMeta,
} from "@/types/admin-campaign";
import AdminCampaignService from "@/services/adminCampaignService";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { UpdateCampaignModal } from "@/components/campaigns/UpdateCampaignModal";
import { CampaignStatsModal } from "@/components/campaigns/CampaignStatsModal";
import { SendCampaignModal } from "@/components/campaigns/SendCampaignModal";
import { CancelCampaignModal } from "@/components/campaigns/CancelCampaignModal";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<AdminCampaignSummary>({
    totalCampaigns: 0,
    draftCount: 0,
    scheduledCount: 0,
    processingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
  });
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedAudience, setSelectedAudience] = useState<string>("ALL");
  const [sort, setSort] = useState<AdminCampaignSortEnum>(
    AdminCampaignSortEnum.CREATED_AT_DESC
  );
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [statsCampaignId, setStatsCampaignId] = useState<string | null>(null);
  const [sendCampaign, setSendCampaign] = useState<Campaign | null>(null);
  const [cancelModalState, setCancelModalState] = useState<{
    campaign: Campaign | null;
    mode: "CANCEL" | "DELETE";
  }>({ campaign: null, mode: "CANCEL" });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: AdminCampaignsQuery = {
        page,
        limit: 10,
        sort,
        ...(search.trim() && { search: search.trim() }),
        ...(selectedChannel !== "ALL" && {
          channel: selectedChannel as CampaignChannelEnum,
        }),
        ...(selectedStatus !== "ALL" && {
          status: selectedStatus as CampaignStatusEnum,
        }),
        ...(selectedAudience !== "ALL" && {
          audienceType: selectedAudience as CampaignAudienceEnum,
        }),
      };

      const res = await AdminCampaignService.getCampaigns(query);
      setCampaigns(res.data.campaigns || []);
      setPagination(res.data.pagination);
      setSummary(res.data.summary);
    } catch (err) {
      setError(AdminCampaignService.extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, selectedChannel, selectedStatus, selectedAudience]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderChannelBadge = (ch: CampaignChannelEnum) => {
    switch (ch) {
      case CampaignChannelEnum.WHATSAPP:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <MessageSquare className="h-3 w-3" /> WhatsApp
          </span>
        );
      case CampaignChannelEnum.SMS:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Smartphone className="h-3 w-3" /> SMS
          </span>
        );
      case CampaignChannelEnum.EMAIL:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Mail className="h-3 w-3" /> Email
          </span>
        );
    }
  };

  const renderStatusBadge = (st: CampaignStatusEnum) => {
    switch (st) {
      case CampaignStatusEnum.DRAFT:
        return (
          <span className="px-2.5 py-0.5 text-[9.5px] font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            DRAFT
          </span>
        );
      case CampaignStatusEnum.SCHEDULED:
        return (
          <span className="px-2.5 py-0.5 text-[9.5px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            SCHEDULED
          </span>
        );
      case CampaignStatusEnum.PROCESSING:
      case CampaignStatusEnum.SENDING:
        return (
          <span className="px-2.5 py-0.5 text-[9.5px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            SENDING
          </span>
        );
      case CampaignStatusEnum.COMPLETED:
        return (
          <span className="px-2.5 py-0.5 text-[9.5px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            COMPLETED
          </span>
        );
      case CampaignStatusEnum.CANCELLED:
        return (
          <span className="px-2.5 py-0.5 text-[9.5px] font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200">
            CANCELLED
          </span>
        );
      case CampaignStatusEnum.FAILED:
        return (
          <span className="px-2.5 py-0.5 text-[9.5px] font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            FAILED
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      {/* Top Notification Toast */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate">
            Marketing Campaigns & Messaging
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
            Broadcast promotional notifications across WhatsApp, SMS, and Email via BullMQ worker queue.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Summary Stats Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 font-mono-eyebrow truncate block">
            Total Campaigns
          </span>
          <p className="text-xl sm:text-2xl font-black text-[#2A241E] mt-1">
            {summary.totalCampaigns}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">
            All broadcast records
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-600 font-mono-eyebrow truncate block">
            Drafts & Scheduled
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
            {summary.draftCount + summary.scheduledCount}
          </p>
          <p className="text-[10px] font-semibold text-amber-600/80 mt-0.5 truncate">
            {summary.scheduledCount} scheduled for future
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-600 font-mono-eyebrow truncate block">
            Completed Broadcasts
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {summary.completedCount}
          </p>
          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5 truncate">
            Successfully delivered
          </p>
        </div>

        <div className="clay-card p-3.5 sm:p-4 min-w-0">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-600 font-mono-eyebrow truncate block">
            In Flight / Processing
          </span>
          <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
            {summary.processingCount}
          </p>
          <p className="text-[10px] font-semibold text-blue-600 mt-0.5 truncate">
            BullMQ workers sending
          </p>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="clay-card p-4 space-y-3.5">
        {/* Top Channel Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Channel Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto text-xs font-bold shrink-0 no-scrollbar">
            {[
              { id: "ALL", label: "All Channels" },
              { id: CampaignChannelEnum.WHATSAPP, label: "WhatsApp" },
              { id: CampaignChannelEnum.SMS, label: "SMS" },
              { id: CampaignChannelEnum.EMAIL, label: "Email" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedChannel(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl transition ${
                  selectedChannel === tab.id
                    ? "bg-white text-slate-900 shadow-xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by campaign name, subject or message..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 transition"
            />
          </div>
        </div>

        {/* Bottom Secondary Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value={CampaignStatusEnum.DRAFT}>Draft</option>
              <option value={CampaignStatusEnum.SCHEDULED}>Scheduled</option>
              <option value={CampaignStatusEnum.PROCESSING}>Processing</option>
              <option value={CampaignStatusEnum.COMPLETED}>Completed</option>
              <option value={CampaignStatusEnum.CANCELLED}>Cancelled</option>
            </select>
          </div>

          {/* Audience Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Audience Segment
            </label>
            <select
              value={selectedAudience}
              onChange={(e) => {
                setSelectedAudience(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            >
              <option value="ALL">All Segments</option>
              <option value={CampaignAudienceEnum.ALL_CUSTOMERS}>All Customers</option>
              <option value={CampaignAudienceEnum.ACTIVE_CUSTOMERS}>Active Customers</option>
              <option value={CampaignAudienceEnum.INACTIVE_CUSTOMERS}>Inactive Customers</option>
              <option value={CampaignAudienceEnum.PET_OWNERS_DOG}>Dog Owners</option>
              <option value={CampaignAudienceEnum.PET_OWNERS_CAT}>Cat Owners</option>
              <option value={CampaignAudienceEnum.HIGH_SPENDERS}>High Spenders</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono-eyebrow">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as AdminCampaignSortEnum);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            >
              <option value={AdminCampaignSortEnum.CREATED_AT_DESC}>Newest First</option>
              <option value={AdminCampaignSortEnum.CREATED_AT_ASC}>Oldest First</option>
              <option value={AdminCampaignSortEnum.SCHEDULED_AT_DESC}>Scheduled Date</option>
              <option value={AdminCampaignSortEnum.NAME_ASC}>Name A-Z</option>
            </select>
          </div>

          {/* Refresh Action */}
          <div className="flex items-end">
            <button
              onClick={fetchCampaigns}
              disabled={loading}
              className="w-full py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center gap-1.5 transition text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-orange-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && campaigns.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="clay-card p-5 space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 rounded-md w-1/3" />
              <div className="h-6 bg-slate-200 rounded-md w-3/4" />
              <div className="h-12 bg-slate-100 rounded-2xl w-full" />
              <div className="h-4 bg-slate-200 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        /* Empty State */
        <div className="clay-card p-12 text-center space-y-3">
          <div className="inline-flex p-4 bg-orange-50 text-orange-600 rounded-full">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h3 className="font-fraunces text-lg font-bold text-[#2A241E]">
            No Campaigns Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No marketing campaigns match your filter criteria. Create a new campaign to get started!
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="clay-btn-orange inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      ) : (
        /* Campaigns Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-3.5 relative overflow-hidden group hover:border-orange-200/80 transition"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {renderChannelBadge(camp.channel)}
                      {renderStatusBadge(camp.status)}
                    </div>
                    <h3 className="font-fraunces text-base sm:text-lg font-bold text-[#2A241E] leading-tight truncate mt-1">
                      {camp.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => setStatsCampaignId(camp.id)}
                    className="p-2 text-slate-400 hover:text-orange-600 rounded-xl hover:bg-orange-50 transition"
                    title="View Analytics"
                  >
                    <BarChart2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Audience Tag */}
                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>Target: <strong className="text-slate-800">{camp.audienceType}</strong></span>
                  <span>({camp.totalTarget} recipients)</span>
                </div>

                {/* Message Box */}
                <div className="mt-2.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs text-slate-700 line-clamp-2 font-medium">
                  {camp.subject && (
                    <span className="font-bold block text-slate-900 mb-0.5">
                      Subject: {camp.subject}
                    </span>
                  )}
                  {camp.message}
                </div>

                {/* Delivery Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Delivered: <strong>{camp.deliveredCount}</strong> / {camp.totalTarget}
                    </span>
                    <span className="font-bold text-emerald-600">
                      {camp.totalTarget > 0
                        ? `${Math.round((camp.deliveredCount / camp.totalTarget) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${
                          camp.totalTarget > 0
                            ? Math.min(100, Math.round((camp.deliveredCount / camp.totalTarget) * 100))
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>
                    {camp.scheduledAt
                      ? `Scheduled: ${new Date(camp.scheduledAt).toLocaleDateString()}`
                      : `Created: ${new Date(camp.createdAt).toLocaleDateString()}`}
                  </span>
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Immediate Dispatch Button if DRAFT or SCHEDULED */}
                  {(camp.status === CampaignStatusEnum.DRAFT ||
                    camp.status === CampaignStatusEnum.SCHEDULED) && (
                    <button
                      onClick={() => setSendCampaign(camp)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 shadow-xs flex items-center gap-1 transition"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send</span>
                    </button>
                  )}

                  {/* Edit button if DRAFT or SCHEDULED */}
                  {(camp.status === CampaignStatusEnum.DRAFT ||
                    camp.status === CampaignStatusEnum.SCHEDULED) && (
                    <button
                      onClick={() => setEditCampaign(camp)}
                      className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-xl transition"
                      title="Edit Campaign"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Cancel button if SCHEDULED or PROCESSING */}
                  {(camp.status === CampaignStatusEnum.SCHEDULED ||
                    camp.status === CampaignStatusEnum.PROCESSING ||
                    camp.status === CampaignStatusEnum.SENDING) && (
                    <button
                      onClick={() =>
                        setCancelModalState({ campaign: camp, mode: "CANCEL" })
                      }
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-xl transition"
                      title="Cancel Broadcast"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  )}

                  {/* Delete button */}
                  {camp.status !== CampaignStatusEnum.PROCESSING &&
                    camp.status !== CampaignStatusEnum.SENDING && (
                      <button
                        onClick={() =>
                          setCancelModalState({ campaign: camp, mode: "DELETE" })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete Campaign"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="clay-card p-3.5 flex items-center justify-between text-xs font-medium text-slate-600">
          <span>
            Page <strong>{pagination.page}</strong> of{" "}
            <strong>{pagination.totalPages}</strong> ({pagination.total} total campaigns)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages || loading}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          showNotification("Campaign created successfully!");
          fetchCampaigns();
        }}
      />

      <UpdateCampaignModal
        campaign={editCampaign}
        isOpen={!!editCampaign}
        onClose={() => setEditCampaign(null)}
        onSuccess={() => {
          showNotification("Campaign updated successfully!");
          fetchCampaigns();
        }}
      />

      <CampaignStatsModal
        campaignId={statsCampaignId}
        isOpen={!!statsCampaignId}
        onClose={() => setStatsCampaignId(null)}
      />

      <SendCampaignModal
        campaign={sendCampaign}
        isOpen={!!sendCampaign}
        onClose={() => setSendCampaign(null)}
        onSuccess={() => {
          showNotification("Campaign broadcast queued successfully via BullMQ!");
          fetchCampaigns();
        }}
      />

      <CancelCampaignModal
        campaign={cancelModalState.campaign}
        mode={cancelModalState.mode}
        isOpen={!!cancelModalState.campaign}
        onClose={() => setCancelModalState({ campaign: null, mode: "CANCEL" })}
        onSuccess={() => {
          showNotification(
            cancelModalState.mode === "CANCEL"
              ? "Campaign broadcast cancelled."
              : "Campaign deleted."
          );
          fetchCampaigns();
        }}
      />
    </div>
  );
}
