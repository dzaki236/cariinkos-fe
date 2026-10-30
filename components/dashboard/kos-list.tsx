"use client";

import Link from "next/link";
import { useState } from "react";
import { useKosList } from "@/lib/kos-data";

export function KosList() {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const query = useKosList(page, perPage);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">RUANG KERJA / KOS</p>
          <h1>Data kos</h1>
          <p className="muted">Kelola informasi dan ketersediaan kamar.</p>
        </div>
        <Link className="button button-primary" href="/dashboard/kos/new">
          Tambah kos <span aria-hidden="true">+</span>
        </Link>
      </div>
      {query.isPending ? (
        <p className="state-message">Memuat data kos...</p>
      ) : query.isError ? (
        <div className="state-message error-message" role="alert">
          {query.error.message}
          <button
            className="button button-quiet"
            onClick={() => query.refetch()}
          >
            Coba lagi
          </button>
        </div>
      ) : query.data?.data.length === 0 ? (
        <div className="empty-state">
          <span className="empty-index">KOS / 00</span>
          <h2>Belum ada data kos</h2>
          <p>Tambahkan kos pertama untuk mulai mengelola informasinya.</p>
          <Link className="text-link" href="/dashboard/kos/new">
            Tambah kos <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama kos</th>
                  <th>Lokasi</th>
                  <th>Kamar tersedia</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {query.data?.data.map((kos) => (
                  <tr key={kos.id}>
                    <td>
                      <Link
                        className="table-primary"
                        href={`/dashboard/kos/${kos.id}`}
                      >
                        {kos.name}
                      </Link>
                      <span className="table-secondary">
                        Rp {kos.price_monthly.toLocaleString("id-ID")} / bulan
                      </span>
                    </td>
                    <td>
                      {kos.city}, {kos.district}
                    </td>
                    <td>
                      {kos.available_rooms} / {kos.total_rooms}
                    </td>
                    <td>
                      <span className={`status status-${kos.status}`}>
                        {kos.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="row-action"
                        href={`/dashboard/kos/${kos.id}`}
                        aria-label={`Lihat ${kos.name}`}
                      >
                        →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>
              Halaman {query.data?.meta.page} dari {query.data?.meta.last_page}{" "}
              · {query.data?.meta.total} kos
            </span>
            <div>
              <button
                className="button button-quiet"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Sebelumnya
              </button>
              <button
                className="button button-quiet"
                disabled={page >= (query.data?.meta.last_page ?? 1)}
                onClick={() => setPage((value) => value + 1)}
              >
                Berikutnya
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
