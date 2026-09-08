"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  UserCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck
} from "lucide-react";
import { AdminAuthService } from "@/services/adminAuthService";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Wizard state: 1: Admin ID -> 2: OTP -> 3: New Password -> 4: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form values
  const [adminId, setAdminId] = useState("kickat2021");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Loading flags
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Step 1: Send OTP and IMMEDIATELY move to Step 2 (OTP page)
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMsg(null);

    const trimmed = adminId.trim();
    if (!trimmed) {
      setError("Please provide your Admin ID.");
      return;
    }

    // Immediately advance to Step 2 OTP verification page
    setStep(2);
    setSendingOtp(true);
    setInfoMsg(`Sending 6-digit OTP to email linked to ${trimmed}...`);

    // Dispatch background OTP request
    AdminAuthService.forgotPassword({ adminId: trimmed })
      .then((res) => {
        setInfoMsg(res.message || `6-digit OTP sent to email linked to ${trimmed}`);
        setError(null);
      })
      .catch((err: any) => {
        const serverMsg =
          err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Unable to dispatch OTP. Please check your Admin ID.";
        setError(serverMsg);
      })
      .finally(() => {
        setSendingOtp(false);
      });
  };

  // Resend OTP handler on Step 2
  const handleResendOtp = () => {
    setError(null);
    const trimmed = adminId.trim();
    if (!trimmed) {
      setStep(1);
      return;
    }

    setSendingOtp(true);
    setInfoMsg(`Resending 6-digit code to email linked to ${trimmed}...`);

    AdminAuthService.forgotPassword({ adminId: trimmed })
      .then((res) => {
        setInfoMsg(res.message || `New 6-digit OTP sent to registered email for ${trimmed}`);
        setError(null);
      })
      .catch((err: any) => {
        const serverMsg =
          err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Unable to resend OTP. Please try again.";
        setError(serverMsg);
      })
      .finally(() => {
        setSendingOtp(false);
      });
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await AdminAuthService.verifyResetOtp({
        adminId: adminId.trim(),
        otp: trimmedOtp,
      });
      setResetToken(res.resetToken);
      setInfoMsg("OTP verified successfully! Configure your new password below.");
      setStep(3);
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "Invalid or expired OTP code. Please check and try again.";
      setError(serverMsg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password must contain at least 1 uppercase letter, 1 number, and 1 special symbol.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const payload = {
      resetToken,
      newPassword,
      confirmPassword,
    };

    // Clear sensitive password inputs from memory
    setNewPassword("");
    setConfirmPassword("");
    setResettingPassword(true);

    try {
      const res = await AdminAuthService.resetPassword(payload);
      // Wipe ephemeral reset token and OTP from memory
      setResetToken("");
      setOtp("");
      setInfoMsg(res.message || "Password updated successfully!");
      setStep(4);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2500);
    } catch (err: any) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "Password reset failed. The reset token may have expired.";
      setError(serverMsg);
    } finally {
      setResettingPassword(false);
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
              Password Recovery Wizard
            </span>

            <h2 className="mt-2 font-fraunces text-2xl sm:text-[26px] font-bold tracking-[-0.02em] text-[#211C15]">
              {step === 1 && "Recover Access"}
              {step === 2 && "Enter Verification OTP"}
              {step === 3 && "Set New Password"}
              {step === 4 && "Success!"}
            </h2>

            <p className="mt-1 text-xs sm:text-[13px] text-slate-500 max-w-[320px] leading-relaxed">
              {step === 1 && "Enter your unique Admin ID to receive a secure 6-digit recovery code on your linked email."}
              {step === 2 && `Enter the 6-digit OTP code sent to the email linked to ${adminId}.`}
              {step === 3 && "Choose a strong new password with at least 8 characters, uppercase, number & symbol."}
              {step === 4 && "Your administrator password has been safely updated."}
            </p>
          </div>

          {/* Step Indicator */}
          {step < 4 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    step === s 
                      ? "w-7 bg-orange-500" 
                      : step > s 
                        ? "w-2 bg-emerald-500" 
                        : "w-2 bg-slate-200"
                  }`} />
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Feedback Banners */}
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-800 animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {sendingOtp && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/80 p-3 text-xs text-amber-800 animate-fade-in">
              <Loader2 className="h-4 w-4 shrink-0 text-amber-600 animate-spin" />
              <span>Dispatching 6-digit OTP code to registered email...</span>
            </div>
          )}

          {infoMsg && !error && !sendingOtp && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-800 animate-fade-in">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Admin ID */}
          {step === 1 && (
            <form className="mt-5 space-y-4" onSubmit={handleRequestOtp}>
              <div className="space-y-1.5 text-left">
                <label className="font-mono-eyebrow text-[10px] font-medium tracking-[0.14em] text-slate-700 uppercase">
                  Admin ID
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <UserCheck className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="e.g. kickat2021"
                    className="h-11 sm:h-12 w-full rounded-[12px] border border-slate-200/90 bg-[#FBFDFE] pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="group flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#F97316] to-[#EA580C] px-5 font-sans text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] cursor-pointer"
                >
                  <span>Send 6-Digit OTP</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-semibold">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-orange-600 hover:underline cursor-pointer"
                >
                  Already have OTP?
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Verify 6-digit OTP */}
          {step === 2 && (
            <form className="mt-5 space-y-4" onSubmit={handleVerifyOtp}>
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="font-mono-eyebrow text-[10px] font-medium tracking-[0.14em] text-slate-700 uppercase">
                    6-Digit OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={sendingOtp}
                    className="text-[11px] font-semibold text-orange-600 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {sendingOtp ? "Resending..." : "Resend OTP"}
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <KeyRound className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="h-11 sm:h-12 w-full text-center tracking-[0.3em] font-mono text-base font-bold rounded-[12px] border border-slate-200/90 bg-[#FBFDFE] pl-10 pr-4 text-slate-800 placeholder-slate-300 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="group flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#F97316] to-[#EA580C] px-5 font-sans text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                >
                  {verifyingOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code & Continue</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Change Admin ID</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Create New Password */}
          {step === 3 && (
            <form className="mt-5 space-y-4" onSubmit={handleResetPassword}>
              <div className="space-y-1.5 text-left">
                <label className="font-mono-eyebrow text-[10px] font-medium tracking-[0.14em] text-slate-700 uppercase">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 sm:h-12 w-full rounded-[12px] border border-slate-200/90 bg-[#FBFDFE] pl-10 pr-11 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex h-full w-10 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="font-mono-eyebrow text-[10px] font-medium tracking-[0.14em] text-slate-700 uppercase">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-[18px] w-[18px]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-11 sm:h-12 w-full rounded-[12px] border border-slate-200/90 bg-[#FBFDFE] pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="group flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-b from-[#F97316] to-[#EA580C] px-5 font-sans text-sm font-bold text-white shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="mt-6 space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-xs">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Password updated successfully</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
                  Your account password is now reset. Redirecting you to the sign-in page...
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#F97316] to-[#EA580C] px-5 py-3 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all w-full cursor-pointer"
                >
                  <span>Go to Sign In Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-center sm:justify-start pt-3 pb-5 sm:pb-2 text-center sm:text-left text-[11px] sm:text-xs text-slate-400 border-t border-orange-100/70 shrink-0 select-none">
        <p>© {new Date().getFullYear()} KickAt Ecommerce Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
