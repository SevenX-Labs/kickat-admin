import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-xs focus:ring-orange-500",
      secondary: "bg-slate-800 text-white hover:bg-slate-900 focus:ring-slate-800",
      outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300",
      ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
      danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg",
      md: "h-10 px-4 text-sm rounded-xl",
      lg: "h-12 px-6 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
