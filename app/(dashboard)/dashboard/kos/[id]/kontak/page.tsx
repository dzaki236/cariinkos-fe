import { Suspense } from "react";
import { ContactManager } from "@/components/dashboard/contact-manager";

export default function KosContactPage({
  params,
}: PageProps<"/dashboard/kos/[id]/kontak">) {
  return (
    <Suspense fallback={<p className="state-message">Memuat kontak kos...</p>}>
      <KosContactPageContent params={params} />
    </Suspense>
  );
}

async function KosContactPageContent({
  params,
}: Pick<PageProps<"/dashboard/kos/[id]/kontak">, "params">) {
  const { id } = await params;
  return <ContactManager id={id} />;
}
