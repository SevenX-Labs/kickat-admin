import { Star } from "lucide-react";

export const metadata = {
  title: "Reviews",
};

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Reviews & Ratings</h1>
          <p className="text-sm text-slate-500">Moderate product testimonials, feedback, and verified buyer reviews.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <Star className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Product Ratings & Testimonials</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">Moderate and approve customer feedback across products and food items.</p>
      </div>
    </div>
  );
}
