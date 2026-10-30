import { Suspense } from "react";
import { PhotoManager } from "@/components/dashboard/photo-manager";

export default function KosPhotosPage({
  params,
}: PageProps<"/dashboard/kos/[id]/foto">) {
  return (
    <Suspense fallback={<p className="state-message">Memuat foto kos...</p>}>
      <KosPhotosPageContent params={params} />
    </Suspense>
  );
}

async function KosPhotosPageContent({
  params,
}: Pick<PageProps<"/dashboard/kos/[id]/foto">, "params">) {
  const { id } = await params;
  return <PhotoManager id={id} />;
}
