"use client";

import { 
  User, 
  Shield, 
  Mail, 
  Phone, 
  Calendar, 
  KeyRound, 
  Check, 
  Lock, 
  Smartphone, 
  Laptop, 
  Save, 
  LogOut,
  Camera,
  AlertCircle
} from "lucide-react";
import { useState } from "react";

export default function AdminProfilePage() {
  const [firstName, setFirstName] = useState("Sahil");
  const [lastName, setLastName] = useState("Hode");
  const [email, setEmail] = useState("admin@kickat.in");
  const [phone, setPhone] = useState("+91 98200 12345");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      showToast("Admin profile details updated!");
    }, 600);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("Please fill in current and new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    setChangingPass(true);
    setTimeout(() => {
      setChangingPass(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated securely!");
    }, 700);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 pb-16">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-[#2A241E] text-white px-5 py-3 text-xs font-semibold shadow-2xl animate-fade-in">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="font-fraunces text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#2A241E]">
          Admin Account & Profile
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5">
          Manage your administrative credentials, security keys, and access controls.
        </p>
      </div>

      {/* Profile Identity Card */}
      <div className="clay-card p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          {/* Avatar with badge */}
          <div className="relative">
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#635BFF] via-indigo-600 to-purple-600 text-3xl font-black text-white shadow-lg">
              SH
            </div>
            <button 
              onClick={() => showToast("Avatar upload feature ready")}
              className="clay-button absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:text-indigo-600 shadow-xs cursor-pointer"
              title="Upload new avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-fraunces text-lg sm:text-xl font-bold text-[#2A241E]">
                {firstName} {lastName}
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-orange-50 text-orange-700 border border-orange-200 uppercase font-mono-eyebrow">
                Super Admin
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-lg">
              Global administrator access with master permissions across product catalogs, financial reports, customer databases, and logistics routing.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-400 font-medium">
              <span>Location: Mumbai, India</span>
              <span>•</span>
              <span>Last active: Today at 09:12 AM</span>
            </div>
          </div>
        </div>

        {/* 4 Overview Quick Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          <div className="clay-inset p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">Role Scope</span>
            <p className="text-xs font-bold text-slate-800 truncate">Root Owner</p>
          </div>
          <div className="clay-inset p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">Joined Date</span>
            <p className="text-xs font-bold text-slate-800">Jan 12, 2024</p>
          </div>
          <div className="clay-inset p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">2-Step Auth</span>
            <p className="text-xs font-bold text-emerald-600">Enforced</p>
          </div>
          <div className="clay-inset p-3 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono-eyebrow">Active Logins</span>
            <p className="text-xs font-bold text-indigo-600">2 Devices</p>
          </div>
        </div>
      </div>

      {/* 2-Column Details & Security Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left 7 Cols: Personal Information Form */}
        <div className="lg:col-span-7">
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="h-4 w-4 text-orange-500" />
              <h3 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="clay-btn-orange inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{savingProfile ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right 5 Cols: Password & Two-Factor Security */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* Change Password Card */}
          <div className="clay-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Lock className="h-4 w-4 text-indigo-500" />
              <h3 className="font-fraunces text-sm sm:text-base font-bold text-[#2A241E]">
                Change Password
              </h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-[#F8F5F1] border border-slate-200/60 p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="clay-button w-full py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition cursor-pointer"
              >
                {changingPass ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Active Devices Card */}
          <div className="clay-card p-4 sm:p-5 space-y-3">
            <h4 className="font-fraunces text-xs sm:text-sm font-bold text-[#2A241E]">
              Active Devices
            </h4>

            <div className="space-y-2 text-xs">
              <div className="clay-inset p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Laptop className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">Linux Desktop (Chrome 128)</p>
                    <p className="text-[10px] text-slate-400">Current active session • Mumbai, IN</p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-emerald-600">Online</span>
              </div>

              <div className="clay-inset p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800">iPhone 15 Pro (Safari Mobile)</p>
                    <p className="text-[10px] text-slate-400">Last active 3 hours ago</p>
                  </div>
                </div>
                <button
                  onClick={() => showToast("Session revoked for iPhone 15 Pro")}
                  className="text-[10px] font-bold text-rose-600 hover:underline"
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
