"use client";

import { useEffect } from "react";
import { LogOut, X, Loader2 } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      {/* Click outside backdrop */}
      <div 
        className="fixed inset-0" 
        onClick={() => {
          if (!isLoading) onClose();
        }} 
      />

      {/* 3D Clay Modal Container */}
      <div className="clay-modal relative z-10 w-full max-w-sm sm:max-w-md p-6 sm:p-7 bg-white space-y-5 animate-scale-in text-center select-none shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="clay-button absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 transition cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 3D Badge Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 text-rose-600 border border-rose-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(244,63,94,0.15)] mx-auto">
          <LogOut className="h-8 w-8 text-rose-500 stroke-[2.2]" />
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h2 className="font-fraunces text-xl sm:text-2xl font-bold text-[#2A241E] tracking-tight">
            Confirm Sign Out
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-[310px] mx-auto font-normal">
            Are you sure you want to end your current session? You will need your Admin ID and password to access the portal again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="clay-button flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer rounded-xl disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white bg-gradient-to-b from-[#F97316] to-[#EA580C] hover:brightness-105 active:scale-[0.99] rounded-xl shadow-[0_4px_16px_rgba(249,115,22,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <span>Yes, Sign Out</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default LogoutModal;
