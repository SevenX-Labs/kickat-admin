"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  LockKeyhole, 
  Clock, 
  Shield
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@kickat.in");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <div className="relative min-h-screen w-full bg-[#FFFBF7] text-slate-800 font-sans overflow-x-hidden flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Decorative Paw Prints floating in background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.08] select-none">
        {/* Top left paw */}
        <svg className="absolute top-8 left-[38%] h-20 w-20 text-[#EA580C] fill-current -rotate-12" viewBox="0 0 24 24">
          <path d="M12 8.5c1.38 0 2.5-1.12 2.5-2.5S13.38 3.5 12 3.5 9.5 4.62 9.5 6s1.12 2.5 2.5 2.5zm-5 2c1.38 0 2.5-1.12 2.5-2.5S8.38 5.5 7 5.5 4.5 6.62 4.5 8s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 5.5 17 5.5 14.5 6.62 14.5 8s1.12 2.5 2.5 2.5zm-12.5 4c1.38 0 2.5-1.12 2.5-2.5S5.88 9.5 4.5 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5zm15 0c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-7.5 6c3.04 0 5.5-1.57 5.5-3.5 0-.85-.48-1.63-1.28-2.22-.84-.63-2.02-1.03-3.37-1.03s-2.53.4-3.37 1.03c-.8.59-1.28 1.37-1.28 2.22 0 1.93 2.46 3.5 5.5 3.5z"/>
        </svg>
        {/* Far top right paw */}
        <svg className="absolute top-24 right-16 h-28 w-28 text-[#EA580C] fill-current rotate-25" viewBox="0 0 24 24">
          <path d="M12 8.5c1.38 0 2.5-1.12 2.5-2.5S13.38 3.5 12 3.5 9.5 4.62 9.5 6s1.12 2.5 2.5 2.5zm-5 2c1.38 0 2.5-1.12 2.5-2.5S8.38 5.5 7 5.5 4.5 6.62 4.5 8s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 5.5 17 5.5 14.5 6.62 14.5 8s1.12 2.5 2.5 2.5zm-12.5 4c1.38 0 2.5-1.12 2.5-2.5S5.88 9.5 4.5 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5zm15 0c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-7.5 6c3.04 0 5.5-1.57 5.5-3.5 0-.85-.48-1.63-1.28-2.22-.84-.63-2.02-1.03-3.37-1.03s-2.53.4-3.37 1.03c-.8.59-1.28 1.37-1.28 2.22 0 1.93 2.46 3.5 5.5 3.5z"/>
        </svg>
        {/* Mid right paw */}
        <svg className="absolute bottom-40 right-10 h-24 w-24 text-[#EA580C] fill-current -rotate-15" viewBox="0 0 24 24">
          <path d="M12 8.5c1.38 0 2.5-1.12 2.5-2.5S13.38 3.5 12 3.5 9.5 4.62 9.5 6s1.12 2.5 2.5 2.5zm-5 2c1.38 0 2.5-1.12 2.5-2.5S8.38 5.5 7 5.5 4.5 6.62 4.5 8s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 5.5 17 5.5 14.5 6.62 14.5 8s1.12 2.5 2.5 2.5zm-12.5 4c1.38 0 2.5-1.12 2.5-2.5S5.88 9.5 4.5 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5zm15 0c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-7.5 6c3.04 0 5.5-1.57 5.5-3.5 0-.85-.48-1.63-1.28-2.22-.84-.63-2.02-1.03-3.37-1.03s-2.53.4-3.37 1.03c-.8.59-1.28 1.37-1.28 2.22 0 1.93 2.46 3.5 5.5 3.5z"/>
        </svg>
        {/* Mid left paw */}
        <svg className="absolute top-[42%] left-6 h-16 w-16 text-[#EA580C] fill-current rotate-45" viewBox="0 0 24 24">
          <path d="M12 8.5c1.38 0 2.5-1.12 2.5-2.5S13.38 3.5 12 3.5 9.5 4.62 9.5 6s1.12 2.5 2.5 2.5zm-5 2c1.38 0 2.5-1.12 2.5-2.5S8.38 5.5 7 5.5 4.5 6.62 4.5 8s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 5.5 17 5.5 14.5 6.62 14.5 8s1.12 2.5 2.5 2.5zm-12.5 4c1.38 0 2.5-1.12 2.5-2.5S5.88 9.5 4.5 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5zm15 0c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-7.5 6c3.04 0 5.5-1.57 5.5-3.5 0-.85-.48-1.63-1.28-2.22-.84-.63-2.02-1.03-3.37-1.03s-2.53.4-3.37 1.03c-.8.59-1.28 1.37-1.28 2.22 0 1.93 2.46 3.5 5.5 3.5z"/>
        </svg>
      </div>

      {/* Top Bar: Back to Website */}
      <header className="relative z-20 flex w-full justify-end px-6 pt-6 sm:px-12 sm:pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-orange-600 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Website</span>
        </Link>
      </header>

      {/* Main Two-Column Layout */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 py-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-16">
        
        {/* Left Column: Branding, Mission, Feature Highlights & Pets Graphic */}
        <div className="flex w-full flex-col justify-between lg:w-[48%] xl:w-[45%]">
          <div>
            {/* Top Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-32">
                <Image
                  src="/logo-clean.png"
                  alt="KickAt"
                  width={130}
                  height={48}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100/70 px-3 py-1 text-[11px] font-bold tracking-wider text-orange-700">
                <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
                Admin Portal
              </span>
            </div>

            {/* Headline */}
            <div className="mt-8">
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                For a Better Tomorrow
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
                Manage <br />
                A Healthier, <br />
                Happier World <br />
                <span className="text-[#FF7A00]">for Pets</span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-slate-600 leading-relaxed">
                Access your admin dashboard to manage products, orders, customers and grow KickAt together.
              </p>
            </div>

            {/* Features List */}
            <div className="mt-8 space-y-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/60 text-orange-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manage Products</h3>
                  <p className="text-xs text-slate-500">Keep your inventory up to date</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/60 text-orange-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Track Orders</h3>
                  <p className="text-xs text-slate-500">Ensure smooth deliveries</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/60 text-orange-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Understand Customers</h3>
                  <p className="text-xs text-slate-500">Build better experiences</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100/60 text-orange-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Grow Your Business</h3>
                  <p className="text-xs text-slate-500">With powerful insights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Golden Retriever and Kitten Graphic at bottom left */}
          <div className="relative mt-8 flex items-end">
            <div className="relative h-64 w-full max-w-[420px] overflow-hidden rounded-2xl">
              <Image 
                src="/login-pets.png" 
                alt="Happy Pets" 
                fill 
                className="object-contain object-bottom"
                priority
              />
            </div>
            <div className="hidden sm:block absolute right-4 bottom-14 -rotate-6">
              <span className="font-serif italic text-sm font-bold text-slate-700 tracking-tight flex items-center gap-1">
                Happy Pets <br /> Happier People <span className="text-orange-600 text-xs">♥</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pristine Floating Login Card */}
        <div className="relative mt-10 w-full max-w-lg lg:mt-0 lg:w-[48%] xl:w-[46%]">
          {/* Subtle playful slogan floating on side */}
          <div className="pointer-events-none absolute -top-8 -right-6 hidden xl:block rotate-12">
            <p className="font-serif italic text-xs font-semibold text-orange-700/80">
              Because <br /> they matter ♥
            </p>
          </div>

          {/* White Card Container */}
          <div className="rounded-[32px] border border-orange-100/80 bg-white p-8 shadow-2xl shadow-orange-500/5 sm:p-11">
            
            {/* Logo in Card Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative h-12 w-32">
                <Image
                  src="/logo-clean.png"
                  alt="KickAt"
                  width={130}
                  height={44}
                  className="object-contain"
                  priority
                />
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Admin Portal Access
              </p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Enter your credentials to access the store management system.
              </p>
            </div>

            {/* Form */}
            <form className="mt-7 space-y-4" onSubmit={(e) => e.preventDefault()}>
              
              {/* EMAIL ADDRESS */}
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kickat.in"
                    className="w-full rounded-xl border border-slate-200 bg-[#FBFDFE] py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                    Password
                  </label>
                  <Link
                    href="/admin/forgot-password"
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-[#FBFDFE] py-3 pl-10 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-slate-300 text-orange-600 focus:ring-orange-500 accent-orange-500"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              {/* SIGN IN BUTTON */}
              <div className="pt-2">
                <Link
                  href="/admin/dashboard"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5C00] to-[#FF7A00] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition duration-200 hover:brightness-105 active:scale-[0.99]"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* OR CONTINUE WITH */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold tracking-wider uppercase text-slate-400">
                  <span className="bg-white px-3">Or continue with</span>
                </div>
              </div>

              {/* SIGN IN WITH GOOGLE */}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>

            {/* 3 Pillars Security Badges */}
            <div className="mt-7 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
              <div className="flex flex-col items-center">
                <Shield className="h-4 w-4 text-slate-400 mb-1" />
                <p className="text-[11px] font-bold text-slate-700">Secure</p>
                <p className="text-[10px] text-slate-400">SSL Encrypted</p>
              </div>
              <div className="flex flex-col items-center border-x border-slate-100">
                <LockKeyhole className="h-4 w-4 text-slate-400 mb-1" />
                <p className="text-[11px] font-bold text-slate-700">Role Based</p>
                <p className="text-[10px] text-slate-400">Access Control</p>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="h-4 w-4 text-slate-400 mb-1" />
                <p className="text-[11px] font-bold text-slate-700">24/7</p>
                <p className="text-[10px] text-slate-400">Activity Monitoring</p>
              </div>
            </div>

            {/* Bottom SSL note */}
            <p className="mt-5 text-center text-[11px] text-slate-400">
              Protected by KickAt 256-bit SSL Admin Authentication
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Corner Tagline */}
      <footer className="relative z-10 hidden sm:flex justify-end px-12 py-4">
        <div className="text-right">
          <p className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Pets People A Brighter</p>
          <p className="text-[9px] font-bold tracking-widest text-orange-600 uppercase border-b-2 border-orange-500 inline-block">Tomorrow</p>
        </div>
      </footer>
    </div>
  );
}
