"use client";

import { useParams } from "next/navigation";
import { KosForm } from "@/components/dashboard/kos-form";
import { useKos } from "@/lib/kos-data";

export default function EditKosPage() {
  const params = useParams<{ id: string }>();
  const query = useKos(params.id);
  if (query.isPending)
    return <p className="state-message">Memuat data kos...</p>;
  if (query.isError)
    return (
      <p className="error-message" role="alert">
        {query.error.message}
      </p>
    );
  return <KosForm kos={query.data.data} />;
}
