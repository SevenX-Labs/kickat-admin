import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-5 pb-6 w-full min-w-0">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-3.5 w-64 rounded-md" />
      </div>

      <div className="clay-card p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <Skeleton className="h-24 w-24 rounded-3xl shrink-0" />
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <Skeleton className="h-6 w-44 rounded-xl mx-auto sm:mx-0" />
            <Skeleton className="h-3.5 w-80 rounded-md mx-auto sm:mx-0" />
            <Skeleton className="h-3 w-48 rounded-md mx-auto sm:mx-0" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="clay-inset p-3 space-y-1">
              <Skeleton className="h-2.5 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
