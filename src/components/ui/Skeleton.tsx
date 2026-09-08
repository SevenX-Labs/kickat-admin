import React from "react";

export function Skeleton({ 
  className = "",
  variant = "default"
}: { 
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <div 
      className={`
        rounded-2xl shrink-0
        ${variant === "light" ? "skeleton-shimmer-light" : "skeleton-shimmer"}
        ${className}
      `} 
    />
  );
}

/**
 * 4 Top Row 3D Clay Stat Cards Skeleton
 */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${count === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"} gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="clay-card p-4 sm:p-5 flex flex-col justify-between min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24 rounded-lg" />
            <Skeleton className="h-5 w-5 rounded-md" />
          </div>
          <div className="flex items-end justify-between pt-1">
            <div className="space-y-2">
              <Skeleton className="h-7 w-28 sm:w-32 rounded-xl" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="h-12 w-14 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Complete Dashboard Skeleton Layout
 * Matches exact geometry of the primary KickAt dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-5 pb-6 w-full min-w-0 no-scrollbar animate-fade-in">
      
      {/* 1. Top Row: 4 Stat Cards */}
      <StatCardsSkeleton count={4} />

      {/* 2. Middle Row: Spending Overview + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full min-w-0">
        
        {/* Spending Overview Donut (5 Cols) */}
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-5 space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-xl" />
          </div>

          {/* Donut circle & center placeholder */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            <div className="relative h-40 w-40 sm:h-44 sm:w-44 flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-full" />
              <div className="absolute h-24 w-24 rounded-full bg-white flex flex-col items-center justify-center space-y-1">
                <Skeleton className="h-2.5 w-10 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-lg" />
              </div>
            </div>

            {/* Legend items */}
            <div className="space-y-2.5 w-full sm:w-auto">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-18 rounded-md" />
                  </div>
                  <Skeleton className="h-3 w-12 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions & Desk Scene (7 Cols) */}
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-7 space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* 4 Transaction Rows (7 Cols) */}
            <div className="md:col-span-7 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                      <Skeleton className="h-3.5 w-24 sm:w-28 rounded-md" />
                      <Skeleton className="h-2.5 w-16 rounded-md" />
                    </div>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <Skeleton className="h-3.5 w-14 rounded-md" />
                    <Skeleton className="h-2.5 w-10 rounded-md ml-auto" />
                  </div>
                </div>
              ))}
            </div>

            {/* 3D Desk Scene Skeleton (5 Cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-[#F5EFE9] space-y-3">
              <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-xl" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: Goals Progress + Smart Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full min-w-0">
        <div className="clay-card p-4 sm:p-5 lg:p-6 lg:col-span-7 space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="clay-inset p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-xl" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-20 rounded-md" />
                      <Skeleton className="h-2.5 w-14 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-8 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Smart Tip Card Skeleton (5 Cols) */}
        <div className="clay-tip-card p-4 sm:p-5 lg:p-6 lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start gap-3.5">
            <Skeleton className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-3/4 rounded-md" />
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>

    </div>
  );
}

/**
 * Grid of Cards Skeleton (for Categories, Testimonials, Campaigns, Blogs)
 */
export function GridCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4 sm:space-y-5 pb-6 w-full min-w-0">
      {/* Header bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-3.5 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>

      {/* 4 Stat Cards */}
      <StatCardsSkeleton count={4} />

      {/* Search & Filter Bar */}
      <div className="clay-card p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-14 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 w-full min-w-0">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="clay-card p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-4/5 rounded-md" />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-3 w-14 rounded-md" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-8 flex-1 rounded-xl" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Data Table & Row List Skeleton (for Products, Orders, Customers, Shipments)
 */
export function TableListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4 sm:space-y-5 pb-6 w-full min-w-0">
      {/* Header bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-3.5 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-2xl" />
      </div>

      {/* 4 Stat Cards */}
      <StatCardsSkeleton count={4} />

      {/* Search & Filter Bar */}
      <div className="clay-card p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-16 rounded-xl" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>

      {/* Table Card Skeleton */}
      <div className="clay-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>

        <div className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-32 sm:w-48 rounded-md" />
                  <Skeleton className="h-2.5 w-20 sm:w-28 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-14 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-xl hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
