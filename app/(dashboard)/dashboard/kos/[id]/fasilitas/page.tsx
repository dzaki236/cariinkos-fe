import { Suspense } from "react";
import { KosFacilityManager } from "@/components/dashboard/facility-manager";

export default function KosFacilitiesPage({
  params,
}: PageProps<"/dashboard/kos/[id]/fasilitas">) {
  return (
    <Suspense
      fallback={<p className="state-message">Memuat fasilitas kos...</p>}
    >
      <KosFacilitiesPageContent params={params} />
    </Suspense>
  );
}

async function KosFacilitiesPageContent({
  params,
}: Pick<PageProps<"/dashboard/kos/[id]/fasilitas">, "params">) {
  const { id } = await params;
  return <KosFacilityManager id={id} />;
}
