"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepNavigationProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export const STEPS = [
  { id: 1, label: "Basic Information", shortLabel: "Basic" },
  { id: 2, label: "Product Photos", shortLabel: "Photos" },
  { id: 3, label: "Pricing & Options", shortLabel: "Pricing" },
  { id: 4, label: "Product Information", shortLabel: "Details" },
  { id: 5, label: "Additional Information", shortLabel: "Extra" },
  { id: 6, label: "Review & Publish", shortLabel: "Review" },
];

export function StepNavigation({
  currentStep,
  completedSteps,
  onStepClick,
}: StepNavigationProps) {
  return (
    <div className="clay-card p-3 sm:p-4 mb-6 border border-slate-200/80 bg-white/95 backdrop-blur-xs">
      <nav aria-label="Product Creation Steps" className="relative">
        <ol className="grid grid-cols-6 gap-1 sm:gap-2">
          {STEPS.map((step) => {
            const isCurrent = step.id === currentStep;
            const isCompleted = completedSteps.includes(step.id) && !isCurrent;
            const isClickable = isCompleted || step.id <= currentStep;

            return (
              <li key={step.id} className="relative flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`w-full flex flex-col items-center py-2 px-1 rounded-xl transition text-center select-none ${
                    isCurrent
                      ? "bg-[#FFF5EB] text-[#FF7A00] font-bold shadow-xs border border-orange-200/80"
                      : isCompleted
                      ? "hover:bg-slate-50 text-slate-700 cursor-pointer"
                      : "text-slate-400 opacity-60 cursor-not-allowed"
                  }`}
                >
                  {/* Step Indicator Circle */}
                  <div
                    className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs font-bold transition mb-1.5 ${
                      isCurrent
                        ? "bg-[#FF7A00] text-white shadow-xs"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span className="hidden sm:inline text-xs truncate max-w-[110px]">
                    {step.label}
                  </span>
                  <span className="sm:hidden text-[11px] truncate max-w-[50px]">
                    {step.shortLabel}
                  </span>

                  {/* Sub-status Indicator */}
                  <span
                    className={`text-[9px] uppercase tracking-wider font-semibold hidden md:inline mt-0.5 ${
                      isCurrent
                        ? "text-orange-600 font-bold"
                        : isCompleted
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {isCurrent
                      ? "Current"
                      : isCompleted
                      ? "Complete"
                      : "Upcoming"}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
