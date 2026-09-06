import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs shadow-slate-100", className)}
      {...props}
    />
  );
}
