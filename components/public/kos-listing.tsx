import Image from "next/image";
import Link from "next/link";
import type { PublicKosListResponse } from "@/lib/public-kos-api";
import { StarRating } from "@/components/public/star-rating";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function KosListing({ response }: { response: PublicKosListResponse }) {
  const { data, meta } = response;

  return (
    <>
      <p className="public-result-count" aria-live="polite">
        {meta.total} kos · halaman {meta.page} dari {Math.max(meta.last_page, 1)}
      </p>
      <ul className="kos-list">
        {data.map((kos) => (
          <li className="kos-list-item" key={kos.id}>
            <Link className="kos-list-link" href={`/kos/${encodeURIComponent(kos.id)}`}>
              {kos.cover_photo ? (
                <Image
                  className="kos-cover"
                  src={kos.cover_photo}
                  alt={`Foto kos ${kos.name}`}
                  width={320}
                  height={220}
                  unoptimized
                />
              ) : (
                <span className="kos-cover-missing">Foto tidak tersedia</span>
              )}
              <span className="kos-list-copy">
                <strong className="kos-list-name">{kos.name}</strong>
                <span className="kos-list-location">
                  {[kos.district, kos.city, kos.province].filter(Boolean).join(", ")}
                </span>
                <span className="kos-list-rating">
                  <StarRating value={kos.rattings ?? 0} />
                  <span>{(kos.rattings ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 1 })}/5</span>
                </span>
                <span className="kos-list-availability">
                  {kos.favorite_count ?? 0} favorit
                </span>
                <span className="kos-list-price">{rupiah.format(kos.price_monthly)} / bulan</span>
                <span className="kos-list-availability">
                  {kos.available_rooms} kamar tersedia
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <nav className="public-pagination" aria-label="Navigasi halaman daftar kos">
        {meta.page > 1 ? (
          <Link className="public-action" href={`/?page=${meta.page - 1}`}>
            Halaman sebelumnya
          </Link>
        ) : <span />}
        <span aria-label={`Halaman ${meta.page} dari ${Math.max(meta.last_page, 1)}`}>
          {meta.page} / {Math.max(meta.last_page, 1)}
        </span>
        {meta.page < meta.last_page ? (
          <Link className="public-action" href={`/?page=${meta.page + 1}`}>
            Halaman berikutnya
          </Link>
        ) : <span />}
      </nav>
    </>
  );
}
