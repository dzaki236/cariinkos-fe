import { Suspense } from "react";
import { KosDetail } from "@/components/dashboard/kos-detail";

export default function KosDetailPage({
  params,
}: PageProps<"/dashboard/kos/[id]">) {
  return (
    <Suspense fallback={<p className="state-message">Memuat detail kos...</p>}>
      <KosDetailPageContent params={params} />
    </Suspense>
  );
}

async function KosDetailPageContent({
  params,
}: Pick<PageProps<"/dashboard/kos/[id]">, "params">) {
  const { id } = await params;
  return <KosDetail id={id} />;
}
