import { User, Shield, Mail, Phone, Calendar, KeyRound } from "lucide-react";

export const metadata = {
  title: "Admin Profile",
};

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Profile</h1>
        <p className="text-sm text-slate-500">Manage your administrative credentials, personal details, and security access.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-2xl font-bold text-white shadow-md">
            AD
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900">Super Administrator</h2>
              <span className="rounded-md bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-600 uppercase font-mono-eyebrow">
                Super Admin
              </span>
            </div>
            <p className="text-sm text-slate-500">Full system privileges across catalog, orders, finance, and settings.</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <Mail className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase font-mono-eyebrow">Email Address</p>
              <p className="text-sm font-semibold text-slate-800">admin@kickat.in</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <Shield className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase font-mono-eyebrow">Role & Scope</p>
              <p className="text-sm font-semibold text-slate-800">Root / Global Administrator</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase font-mono-eyebrow">Member Since</p>
              <p className="text-sm font-semibold text-slate-800">September 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
            <KeyRound className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase font-mono-eyebrow">Two-Factor Auth</p>
              <p className="text-sm font-semibold text-emerald-600">Active (Enforced)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
