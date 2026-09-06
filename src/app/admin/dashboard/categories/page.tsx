import { FolderTree, Plus } from "lucide-react";

export const metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Categories</h1>
          <p className="text-sm text-slate-500">Organize store catalog hierarchy, tags, and category collections.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-600 transition">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <FolderTree className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Catalog Categories</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">Manage pet food, supplements, treats, accessories, and grooming collections.</p>
      </div>
    </div>
  );
}
