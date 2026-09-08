"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Check
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@kickat.in");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <div className="relative min-h-screen lg:h-screen w-screen bg-[radial-gradient(ellipse_at_top,_#FFFFFF_0%,_#FFFDF9_45%,_#FAF4EC_100%)] text-slate-900 overflow-y-auto lg:overflow-hidden flex flex-col justify-between selection:bg-orange-500 selection:text-white px-6 sm:px-12 lg:px-16 py-4 sm:py-6">
      
      {/* Background Texture */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='%23EA580C'%3E%3Cpath d='M12 8.5c1.38 0 2.5-1.12 2.5-2.5S13.38 3.5 12 3.5 9.5 4.62 9.5 6s1.12 2.5 2.5 2.5zm-5 2c1.38 0 2.5-1.12 2.5-2.5S8.38 5.5 7 5.5 4.5 6.62 4.5 8s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 5.5 17 5.5 14.5 6.62 14.5 8s1.12 2.5 2.5 2.5zm-12.5 4c1.38 0 2.5-1.12 2.5-2.5S5.88 9.5 4.5 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5zm15 0c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-7.5 6c3.04 0 5.5-1.57 5.5-3.5 0-.85-.48-1.63-1.28-2.22-.84-.63-2.02-1.03-3.37-1.03s-2.53.4-3.37 1.03c-.8.59-1.28 1.37-1.28 2.22 0 1.93 2.46 3.5 5.5 3.5z'/%3E%3C/svg%3E")`,
          backgroundSize: "64px 64px"
        }}
      />

      {/* Ambient Glows */}
      <div className="pointer-events-none fixed -top-28 -left-24 z-0 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-orange-200/35 to-amber-100/10 blur-[110px]" />
      <div className="pointer-events-none fixed top-1/2 right-8 z-0 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gradient-to-bl from-orange-200/25 via-amber-100/10 to-transparent blur-[120px]" />

      {/* Top Spacer */}
      <div className="relative z-20 mx-auto w-full max-w-7xl h-2 shrink-0" />

      {/* Main Split-Screen Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center lg:flex-row lg:items-center lg:justify-between lg:gap-14 min-h-0 py-2">
        
        {/* LEFT COLUMN: Premium SaaS Login Card */}
        <div className="relative w-full max-w-[428px] shrink-0">
          
          <div className="rounded-[24px] border border-black/[0.04] bg-white px-7 py-7 sm:px-9 sm:py-8 shadow-[0_20px_60px_rgba(249,115,22,0.10),0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all">
            
            {/* Header: Logo and Subtitle with clear vertical stack */}
            <div className="flex flex-col items-center text-center">
              
              {/* Logo block */}
              <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <Image
                    src="/logo-clean.png"
                    alt="KickAt"
                    width={240}
                    height={100}
                    className="h-14 sm:h-16 md:h-18 w-auto max-w-[190px] sm:max-w-[230px] object-contain select-none mix-blend-multiply transition-all duration-200"
                    priority
                  />
                </div>
                
                {/* Clear separation to prevent collision */}
                <span className="mt-2.5 sm:mt-3 font-mono-eyebrow text-[10.5px] sm:text-[11px] font-semibold tracking-[0.22em] text-[#E7A03B] uppercase">
                  Admin Portal Access
                </span>
              </div>
              
              {/* Welcome back heading */}
              <h2 className="mt-3.5 sm:mt-4 font-fraunces text-2xl sm:text-[28px] font-bold tracking-[-0.02em] text-[#211C15]">
                Welcome back
              </h2>
              <p className="mt-1 max-w-[290px] font-sans text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed">
                Enter your credentials to access the store management system.
              </p>
            </div>

            {/* Form */}
            <form className="mt-5 sm:mt-6 space-y-3.5 sm:space-y-4" onSubmit={(e) => e.preventDefault()}>
              
              {/* Email Address */}
              <div className="space-y-1.5 text-left">
                <label className="font-mono-eyebrow text-[10px] font-medium tracking-[0.14em] text-slate-700 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kickat.in"
                    className="h-11 sm:h-12 w-full rounded-[12px] border border-slate-200/90 bg-[#FBFDFE] pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="font-mono-eyebrow text-[10px] font-medium tracking-[0.14em] text-slate-700 uppercase">
                    Password
                  </label>
                  <Link
                    href="/admin/forgot-password"
                    className="font-sans text-[11px] font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 sm:h-12 w-full rounded-[12px] border border-slate-200/90 bg-[#FBFDFE] pl-10 pr-10 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.12)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    <span className="cursor-pointer">
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-0.5">
                <label 
                  className="group flex items-center gap-2.5 cursor-pointer text-xs text-slate-600 select-none"
                  onClick={() => setRememberMe(!rememberMe)}
                >
                  <div className={`
                    flex h-4 w-4 items-center justify-center rounded-md border transition-all duration-150
                    ${rememberMe 
                      ? "border-orange-600 bg-orange-500 text-white shadow-xs shadow-orange-500/30" 
                      : "border-slate-300 bg-white group-hover:border-slate-400"
                    }
                  `}>
                    {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className="font-sans font-medium text-slate-700">Remember this device for 30 days</span>
                </label>
              </div>

              {/* Primary CTA */}
              <div className="pt-1.5 sm:pt-2">
                <Link
                  href="/admin/dashboard"
                  className="group flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#F97316] to-[#EA580C] px-5 font-sans text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_6px_20px_rgba(249,115,22,0.42)] active:translate-y-[1px] active:scale-[0.99]"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Brand Story & 2x2 Feature Cards */}
        <div className="hidden lg:flex w-full flex-col justify-center lg:w-[54%] xl:w-[52%] space-y-4">
          <div className="space-y-1.5">
            <p className="font-mono-eyebrow text-[11px] font-medium tracking-[0.2em] text-[#E7A03B] uppercase">
              Why KickAt?
            </p>
            <h1 className="font-fraunces text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-[-0.02em] leading-[1.12] text-[#211C15]">
              Manage A Healthier, <br />
              Happier World{" "}
              <span className="italic text-[#E7A03B] relative inline-block">
                for Pets
                <span className="absolute bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-[#E7A03B] to-transparent rounded-full" />
              </span>
            </h1>
            <p className="pt-0.5 max-w-[460px] font-sans text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
              Trusted by pet parents across the country who refuse to compromise on quality. Formulated alongside leading veterinary nutritionists.
            </p>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            
            {/* Card 1 */}
            <div className="group flex items-center gap-3.5 rounded-2xl border border-orange-100/70 bg-white/90 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-white hover:shadow-[0_4px_14px_rgba(249,115,22,0.08)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_6px_rgba(249,115,22,0.25)]">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-sm font-semibold text-[#211C15] leading-tight">Manage Products</h3>
                <p className="font-sans text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">Keep inventory and catalog up to date</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group flex items-center gap-3.5 rounded-2xl border border-orange-100/70 bg-white/90 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-white hover:shadow-[0_4px_14px_rgba(249,115,22,0.08)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_6px_rgba(249,115,22,0.25)]">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-sm font-semibold text-[#211C15] leading-tight">Track Orders</h3>
                <p className="font-sans text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">Ensure smooth dispatch and live logistics</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group flex items-center gap-3.5 rounded-2xl border border-orange-100/70 bg-white/90 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-white hover:shadow-[0_4px_14px_rgba(249,115,22,0.08)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_6px_rgba(249,115,22,0.25)]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-sm font-semibold text-[#211C15] leading-tight">Understand Customers</h3>
                <p className="font-sans text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">Build tailored experiences and loyalty</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group flex items-center gap-3.5 rounded-2xl border border-orange-100/70 bg-white/90 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-white hover:shadow-[0_4px_14px_rgba(249,115,22,0.08)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_6px_rgba(249,115,22,0.25)]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-fraunces text-sm font-semibold text-[#211C15] leading-tight">Grow Your Business</h3>
                <p className="font-sans text-[11px] text-slate-500 font-normal mt-0.5 leading-snug">With actionable real-time insights</p>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between pt-3 pb-1 text-xs text-slate-400 border-t border-orange-100/70 shrink-0 select-none">
        <p>© {new Date().getFullYear()} KickAt Ecommerce Platform. All rights reserved.</p>
        
      </footer>
    </div>
  );
}
