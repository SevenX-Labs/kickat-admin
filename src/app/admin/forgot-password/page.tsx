"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full bg-[radial-gradient(ellipse_at_top,_#FFFFFF_0%,_#FFFDF9_45%,_#FAF4EC_100%)] text-slate-900 overflow-y-auto flex flex-col justify-between selection:bg-orange-500 selection:text-white px-4 sm:px-8 lg:px-12 py-4 sm:py-6">
      
      {/* Background Texture */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='%23EA580C'%3E%3Cpath d='M12 8.5c1.38 0 2.5-1.12 2.5-2.5S13.38 3.5 12 3.5 9.5 4.62 9.5 6s1.12 2.5 2.5 2.5zm-5 2c1.38 0 2.5-1.12 2.5-2.5S8.38 5.5 7 5.5 4.5 6.62 4.5 8s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 5.5 17 5.5 14.5 6.62 14.5 8s1.12 2.5 2.5 2.5zm-12.5 4c1.38 0 2.5-1.12 2.5-2.5S5.88 9.5 4.5 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5zm15 0c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-7.5 6c3.04 0 5.5-1.57 5.5-3.5 0-.85-.48-1.63-1.28-2.22-.84-.63-2.02-1.03-3.37-1.03s-2.53.4-3.37 1.03c-.8.59-1.28 1.37-1.28 2.22 0 1.93 2.46 3.5 5.5 3.5z'/%3E%3C/svg%3E")`,
          backgroundSize: "64px 64px"
        }}
      />

      <div className="relative z-20 mx-auto w-full max-w-7xl h-1 sm:h-2 shrink-0" />

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-4">
        <div className="w-full rounded-[24px] border border-black/[0.04] bg-white px-5 py-6 sm:px-8 sm:py-8 shadow-[0_20px_60px_rgba(249,115,22,0.10),0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="relative flex items-center justify-center">
              <Image
                src="/logo-clean.png"
                alt="KickAt"
                width={200}
                height={80}
                className="h-12 sm:h-14 w-auto max-w-[160px] object-contain select-none mix-blend-multiply"
                priority
              />
            </div>

            <span className="mt-2 font-mono-eyebrow text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] text-[#E7A03B] uppercase">
              Password Recovery
            </span>

            <h2 className="mt-3 font-fraunces text-2xl sm:text-[26px] font-bold tracking-[-0.02em] text-[#211C15]">
              Forgot password?
            </h2>
            <p className="mt-1 text-xs sm:text-[13px] text-slate-500 max-w-[320px] leading-relaxed">
              No worries, enter your admin email address and we will send you instructions to reset it.
            </p>
          </div>

          {submitted ? (
            <div className="mt-6 space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600 border border-green-200/60 shadow-xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Reset link sent!</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
                  We have dispatched a secure recovery link to <span className="font-semibold text-slate-700">{email}</span>.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors w-full"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5 text-left">
                <label className="font-mono-eyebrow text-[10px] font-medium tracking-[0.14em] text-slate-700 uppercase">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kickat.in"
                    className="h-11 sm:h-12 w-full rounded-[12px] border border-slate-200/90 bg-[#FBFDFE] pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="group flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#F97316] to-[#EA580C] px-5 font-sans text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all duration-200 hover:brightness-105 active:scale-[0.99]"
                >
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>

              <div className="pt-2 text-center">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>
      </main>

      <footer className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-center sm:justify-start pt-3 pb-5 sm:pb-2 text-center sm:text-left text-[11px] sm:text-xs text-slate-400 border-t border-orange-100/70 shrink-0 select-none">
        <p>© {new Date().getFullYear()} KickAt Ecommerce Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
