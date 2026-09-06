import { Truck } from "lucide-react";

export const metadata = {
  title: "Shipments",
};

export default function ShipmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shipments & Logistics</h1>
          <p className="text-sm text-slate-500">Track active dispatches, courier partners, and tracking IDs.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Truck className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900">Shipment Logistics Center</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">Monitor real-time courier statuses, manifest generation, and delivery tracking.</p>
      </div>
    </div>
  );
}
