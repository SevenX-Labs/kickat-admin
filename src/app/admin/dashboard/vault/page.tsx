"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  KeyRound,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Edit2,
  Trash2,
  Lock,
  ShieldCheck,
  Folder,
  Server,
  Database,
  Globe,
  Mail,
  X,
  AlertCircle,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  AdminVaultItem,
  CreateVaultCredentialInput,
  UpdateVaultCredentialInput,
  VaultCategorySummary,
} from "@/types/admin-vault";
import AdminVaultService from "@/services/adminVaultService";

const PRESET_CATEGORIES = [
  "Hosting & Server",
  "Database",
  "Email & Domain",
  "Payment Gateway",
  "Social & Marketing",
  "General",
];

export default function PasswordVaultPage() {
  const [credentials, setCredentials] = useState<AdminVaultItem[]>([]);
  const [categoriesSummary, setCategoriesSummary] = useState<VaultCategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Show/Hide Password state map (id -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Copy state tracker
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminVaultItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminVaultItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Hosting & Server");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminVaultService.getCredentials({
        search: search.trim() || undefined,
        category: selectedCategory !== "ALL" ? selectedCategory : undefined,
      });
      setCredentials(res.data.credentials || []);
      setCategoriesSummary(res.data.summary.categories || []);
    } catch (err) {
      setError(AdminVaultService.extractErrorMessage(err, "Failed to load password vault."));
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pass);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormCategory("Hosting & Server");
    setFormUsername("");
    setFormPassword("");
    setFormUrl("");
    setFormNotes("");
    setIsCreateOpen(true);
  };

  const openEditModal = (item: AdminVaultItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category || "General");
    setFormUsername(item.usernameOrEmail);
    setFormPassword(item.password);
    setFormUrl(item.url || "");
    setFormNotes(item.notes || "");
    setIsCreateOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUsername.trim() || !formPassword.trim()) {
      showToast("Title, Email/Username, and Password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const updatePayload: UpdateVaultCredentialInput = {
          title: formTitle.trim(),
          category: formCategory.trim(),
          usernameOrEmail: formUsername.trim(),
          password: formPassword,
          url: formUrl.trim() || undefined,
          notes: formNotes.trim() || undefined,
        };
        await AdminVaultService.updateCredential(editingItem.id, updatePayload);
        showToast("Credential updated successfully!");
      } else {
        const createPayload: CreateVaultCredentialInput = {
          title: formTitle.trim(),
          category: formCategory.trim(),
          usernameOrEmail: formUsername.trim(),
          password: formPassword,
          url: formUrl.trim() || undefined,
          notes: formNotes.trim() || undefined,
        };
        await AdminVaultService.createCredential(createPayload);
        showToast("New credential saved to vault!");
      }

      setIsCreateOpen(false);
      fetchCredentials();
    } catch (err) {
      showToast(AdminVaultService.extractErrorMessage(err, "Failed to save credential."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await AdminVaultService.deleteCredential(deleteTarget.id);
      showToast("Credential removed from vault.");
      setDeleteTarget(null);
      fetchCredentials();
    } catch (err) {
      showToast(AdminVaultService.extractErrorMessage(err, "Failed to delete credential."));
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("server") || c.includes("hosting") || c.includes("render")) {
      return <Server className="h-4 w-4 text-orange-600" />;
    }
    if (c.includes("database") || c.includes("mongo") || c.includes("sql")) {
      return <Database className="h-4 w-4 text-emerald-600" />;
    }
    if (c.includes("email") || c.includes("mail")) {
      return <Mail className="h-4 w-4 text-blue-600" />;
    }
    if (c.includes("web") || c.includes("domain") || c.includes("url")) {
      return <Globe className="h-4 w-4 text-indigo-600" />;
    }
    return <Lock className="h-4 w-4 text-amber-600" />;
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full min-w-0 no-scrollbar">
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 clay-card px-4 py-3 bg-slate-900 text-white font-bold text-xs shadow-2xl flex items-center gap-2 rounded-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="font-fraunces text-xl sm:text-2xl lg:text-[28px] font-bold tracking-tight text-[#2A241E] truncate flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center text-white shadow-xs rounded-xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C]">
              <KeyRound className="h-5 w-5 stroke-[2.3]" />
            </div>
            <span>Admin Password Vault</span>
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
            Store, retrieve, and manage confidential server logins, Render passwords, and admin access keys safely.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="clay-btn-orange inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add New Credential</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
        <div className="clay-card p-4 flex items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 text-orange-600">
            <KeyRound className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block font-mono-eyebrow">Total Vault Logins</span>
            <p className="text-xl font-black text-[#2A241E] mt-0.5">{credentials.length}</p>
          </div>
        </div>

        <div className="clay-card p-4 flex items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
            <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block font-mono-eyebrow">Encryption & Security</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">Scoped & Encrypted</p>
          </div>
        </div>

        <div className="clay-card p-4 flex items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
            <Folder className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block font-mono-eyebrow">Categories</span>
            <p className="text-xl font-black text-indigo-700 mt-0.5">{categoriesSummary.length || PRESET_CATEGORIES.length}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="clay-card p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by service title, username, email, notes or URL..."
              className="clay-inset w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[40px]"
            />
          </div>

          <button
            onClick={fetchCredentials}
            className="clay-button px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 min-h-[40px]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer min-h-[36px] ${
              selectedCategory === "ALL"
                ? "bg-[#EA580C] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Services ({credentials.length})
          </button>
          {PRESET_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer min-h-[36px] ${
                selectedCategory === cat
                  ? "bg-[#EA580C] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Credentials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="clay-card p-5 space-y-3 animate-pulse">
              <div className="h-5 bg-slate-200 rounded-lg w-2/3"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-full"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-4/5"></div>
            </div>
          ))}
        </div>
      ) : credentials.length === 0 ? (
        <div className="clay-card p-10 text-center space-y-3 min-w-0">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6 stroke-[2]" />
          </div>
          <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
            No Credentials Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            {search || selectedCategory !== "ALL"
              ? "No vault items match your search criteria."
              : "Your password vault is empty. Click \"Add New Credential\" to store your Render login or service passwords safely."}
          </p>
          <button
            onClick={openCreateModal}
            className="clay-btn-orange px-4 py-2 text-xs font-bold text-white rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Credential
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0">
          {credentials.map((item) => (
            <div
              key={item.id}
              className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-4 relative overflow-hidden group hover:border-orange-200 transition-all"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/80 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 text-[9.5px] font-extrabold rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider inline-block mb-1">
                        {item.category || "General"}
                      </span>
                      <h3 className="font-fraunces text-base font-bold text-[#2A241E] leading-tight truncate">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Actions dropdown/buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(item)}
                      className="clay-button p-1.5 text-slate-500 hover:text-orange-600 transition rounded-lg cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Edit credential"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="clay-button p-1.5 text-slate-500 hover:text-rose-600 transition rounded-lg cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete credential"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Email / Username Row */}
                <div className="mt-3.5 space-y-2">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">Username / Email</span>
                      <p className="text-xs font-mono font-bold text-slate-800 truncate mt-0.5">{item.usernameOrEmail}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.usernameOrEmail, `user-${item.id}`)}
                      className="clay-button px-2 py-1 text-[10.5px] font-extrabold text-slate-600 hover:text-orange-600 transition shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `user-${item.id}` ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Password Row */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">Password</span>
                      <p className="text-xs font-mono font-bold text-slate-900 truncate mt-0.5 tracking-wider">
                        {visiblePasswords[item.id] ? item.password : "••••••••••••"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => togglePasswordVisibility(item.id)}
                        className="clay-button p-1.5 text-slate-500 hover:text-slate-900 transition rounded-lg cursor-pointer"
                        title={visiblePasswords[item.id] ? "Hide password" : "Show password"}
                      >
                        {visiblePasswords[item.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => copyToClipboard(item.password, `pass-${item.id}`)}
                        className="clay-button px-2 py-1 text-[10.5px] font-extrabold text-slate-600 hover:text-orange-600 transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `pass-${item.id}` ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes & URL */}
                {(item.url || item.notes) && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    {item.url && (
                      <a
                        href={item.url.startsWith("http") ? item.url : `https://${item.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline truncate max-w-full"
                      >
                        <Globe className="h-3 w-3 text-orange-500 shrink-0" />
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 ml-0.5" />
                      </a>
                    )}

                    {item.notes && (
                      <p className="text-[11px] font-medium text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-100/80 line-clamp-2">
                        {item.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span>Updated: {new Date(item.updatedAt).toLocaleDateString("en-IN")}</span>
                <span className="font-mono">ID: {item.id.slice(0, 8)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-lg p-5 sm:p-6 space-y-4 relative bg-white shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center text-white shadow-xs rounded-xl bg-gradient-to-br from-[#FF8C38] via-[#F97316] to-[#EA580C]">
                  <KeyRound className="h-4.5 w-4.5 stroke-[2.3]" />
                </div>
                <div>
                  <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
                    {editingItem ? "Edit Vault Credential" : "Add Vault Credential"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Store logins, API keys, or admin access details safely.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="space-y-4">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Service Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    required
                    placeholder="e.g. Render Dashboard"
                    className="clay-inset w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[42px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="clay-inset w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[42px]"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Username / Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Username / Email / Login ID *</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  required
                  placeholder="e.g. admin@sevenx.io or user_123"
                  className="clay-inset w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[42px]"
                />
              </div>

              {/* Password & Generator */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Password / Secret Key *</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10.5px] font-extrabold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> Generate Strong Pass
                  </button>
                </div>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                  placeholder="Enter or generate password"
                  className="clay-inset w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[42px]"
                />
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Website / Console URL (Optional)</label>
                <input
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="e.g. https://dashboard.render.com"
                  className="clay-inset w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50 min-h-[42px]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notes / Instructions (Optional)</label>
                <textarea
                  rows={3}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. 2FA codes backup key, server IP: 192.168.1.1"
                  className="clay-inset w-full p-3 text-xs font-medium text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isSubmitting}
                  className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="clay-button px-5 py-2 text-xs font-extrabold bg-gradient-to-r from-[#FF8C38] via-[#F97316] to-[#EA580C] text-white hover:opacity-95 shadow-md cursor-pointer transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Credential</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="clay-card w-full max-w-sm p-5 space-y-4 bg-white shadow-2xl rounded-3xl text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-fraunces text-base font-bold text-[#2A241E]">
                Delete Credential?
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-900">\"{deleteTarget.title}\"</span> from your vault? This cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="clay-button px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer min-h-[40px]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="clay-button px-4 py-2 text-xs font-extrabold bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer flex items-center gap-1 min-h-[40px]"
              >
                {isDeleting ? "Deleting..." : "Delete Credential"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
