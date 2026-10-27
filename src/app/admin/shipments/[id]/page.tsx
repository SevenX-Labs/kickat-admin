import { redirect } from "next/navigation";

export default async function ShipmentDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  redirect(`/admin/dashboard/shipments/${resolved.id}`);
}
