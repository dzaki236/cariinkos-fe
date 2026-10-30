"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useKos } from "@/lib/kos-data";
import { apiRequest } from "@/lib/query-client";
import { appToast } from "@/components/ui/app-toast";
import { ConfirmAction } from "@/components/dashboard/confirm-action";

export function KosDetail({ id }: { id: string }) {
  const query = useKos(id);
  const router = useRouter();
  const client = useQueryClient();
  if (query.isPending)
    return <p className="state-message">Memuat detail kos...</p>;
  if (query.isError) {
    return (
      <div className="state-message error-message" role="alert">
        {query.error.message}
        <button className="button button-quiet" onClick={() => query.refetch()}>
          Coba lagi
        </button>
      </div>
    );
  }
  const kos = query.data.data;

  async function remove() {
    try {
      await apiRequest(`kos/${id}`, { method: "DELETE" });
      await client.invalidateQueries({ queryKey: ["kos"] });
      appToast.success("Data kos berhasil dihapus");
      router.push("/dashboard/kos");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Kos gagal dihapus.";
      appToast.error("Kos gagal dihapus", message);
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DATA KOS / DETAIL</p>
          <h1>{kos.name}</h1>
          <p className="muted">
            {kos.address} · {kos.city}
          </p>
        </div>
        <div className="heading-actions">
          <Link
            className="button button-quiet"
            href={`/dashboard/kos/${id}/edit`}
          >
            Ubah data
          </Link>
          <ConfirmAction
            title={`Hapus ${kos.name}?`}
            description="Tindakan ini tidak dapat dibatalkan. Data kos akan dihapus permanen."
            onConfirm={remove}
          >
            <button className="button button-danger-quiet">Hapus</button>
          </ConfirmAction>
        </div>
      </div>

      <section className="detail-overview">
        <div>
          <span className="detail-label">HARGA PER BULAN</span>
          <strong>Rp {kos.price_monthly.toLocaleString("id-ID")}</strong>
        </div>
        <div>
          <span className="detail-label">KAMAR TERSEDIA</span>
          <strong>
            {kos.available_rooms} <small>/ {kos.total_rooms}</small>
          </strong>
        </div>
        <div>
          <span className="detail-label">STATUS</span>
          <strong>
            <span className={`status status-${kos.status}`}>{kos.status}</span>
          </strong>
        </div>
        <div>
          <span className="detail-label">TIPE KOS</span>
          <strong>{kos.type ?? "-"}</strong>
        </div>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">INFORMASI</p>
            <h2>Ringkasan kos</h2>
          </div>
        </div>
        <p className="detail-description">
          {kos.description || "Belum ada deskripsi."}
        </p>
        <p className="muted">
          {kos.province} · {kos.city} · {kos.district}
        </p>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PENGELOLAAN</p>
            <h2>Data terkait</h2>
          </div>
        </div>
        <div className="module-links">
          <Link href={`/dashboard/kos/${id}/fasilitas`}>
            <span>01 / FASILITAS</span>
            <strong>{kos.facilities?.length ?? 0} fasilitas</strong>
            <b aria-hidden="true">→</b>
          </Link>
          <Link href={`/dashboard/kos/${id}/foto`}>
            <span>02 / FOTO</span>
            <strong>{kos.photos?.length ?? 0} foto</strong>
            <b aria-hidden="true">→</b>
          </Link>
          <Link href={`/dashboard/kos/${id}/kontak`}>
            <span>03 / KONTAK</span>
            <strong>{kos.contact?.contact_name ?? "Belum diatur"}</strong>
            <b aria-hidden="true">→</b>
          </Link>
        </div>
      </section>
    </>
  );
}
