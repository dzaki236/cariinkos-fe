import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { KosPhotoGallery } from "@/components/public/kos-photo-gallery";
import { KosCommunity } from "@/components/public/kos-community";
import { PublicRetryLink } from "@/components/public/public-retry-link";
import {
  getPublicKos,
  PublicKosApiError,
  type PublicKos,
} from "@/lib/public-kos-api";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type KosPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ retry?: string | string[] }>;
};

export async function generateMetadata({ params }: KosPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return { title: "Kos tidak ditemukan | CariinKos" };

  try {
    const { data: kos } = await getPublicKos(id);
    return {
      title: `${kos.name} | CariinKos`,
      description: kos.description?.trim() || `Informasi harga, lokasi, dan ketersediaan ${kos.name}.`,
    };
  } catch {
    return { title: "Detail kos | CariinKos", description: "Informasi detail kos di CariinKos." };
  }
}

export default async function KosDetailPage({ params, searchParams }: KosPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const retryKey = Array.isArray(query.retry) ? query.retry[0] : query.retry;
  if (!UUID_PATTERN.test(id)) notFound();

  let kos: PublicKos;
  try {
    const response = await getPublicKos(id, retryKey);
    kos = response.data;
  } catch (error) {
    if (error instanceof PublicKosApiError && error.status === 404) notFound();
    return (
      <main className="public-page">
        <PublicHeader isAuthenticated={false} />
        <section className="public-content public-state" role="alert">
          <h1>Detail kos belum dapat dimuat</h1>
          <p>Periksa koneksi layanan lalu coba lagi.</p>
          <PublicRetryLink href={`/kos/${encodeURIComponent(id)}`}>Coba lagi</PublicRetryLink>
        </section>
      </main>
    );
  }

  const address = [kos.address, kos.subdistrict, kos.district, kos.city, kos.province]
    .filter(Boolean)
    .join(", ");
  const phone = kos.contact?.phone?.trim();
  const whatsappNumber = kos.contact?.whatsapp?.replace(/\D/g, "");
  const whatsapp = whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined;
  const mapLink = safeWebUrl(kos.gmaps_link);
  const session = await getServerSession(authOptions);

  return (
    <main className="public-page">
      <PublicHeader isAuthenticated={Boolean(session?.user?.id)} />
      <article className="public-content kos-detail">
        <Link className="public-back" href="/">Kembali ke daftar kos</Link>
        <p className="public-draft-label">
          Draft without direction · ENERGY 1 / RHYTHM 1 / MOTION 1
        </p>
        <header className="kos-detail-heading">
          <div>
            <h1>{kos.name}</h1>
            <p className="kos-detail-location">{address}</p>
          </div>
          <p className="kos-detail-price">
            <strong>{rupiah.format(kos.price_monthly)}</strong>
            <span>per bulan</span>
          </p>
        </header>

        {kos.photos?.length ? (
          <KosPhotoGallery name={kos.name} photos={kos.photos} />
        ) : (
          <p className="kos-no-photos" role="status">Foto belum tersedia.</p>
        )}

        <dl className="kos-facts">
          <div><dt>Tipe kos</dt><dd>{typeLabel(kos.type)}</dd></div>
          <div><dt>Kamar tersedia</dt><dd>{kos.available_rooms} dari {kos.total_rooms}</dd></div>
          <div><dt>Minimum sewa</dt><dd>{kos.minimum_rent_months} bulan</dd></div>
          {kos.room_size != null && <div><dt>Luas kamar</dt><dd>{kos.room_size} m²</dd></div>}
        </dl>

        {kos.description?.trim() && (
          <section className="kos-detail-section">
            <h2>Tentang kos</h2>
            <p className="kos-description">{kos.description}</p>
          </section>
        )}
        {kos.rules?.trim() && (
          <section className="kos-detail-section">
            <h2>Aturan kos</h2>
            <p className="kos-description">{kos.rules}</p>
          </section>
        )}
        {!!kos.facilities?.length && (
          <section className="kos-detail-section">
            <h2>Fasilitas</h2>
            <ul className="kos-facilities">
              {kos.facilities.map((facility) => <li key={facility.id}>{facility.name}</li>)}
            </ul>
          </section>
        )}
        {(phone || whatsapp || mapLink) && (
          <section className="kos-contact-section" aria-labelledby="contact-title">
            <h2 id="contact-title">Kontak dan lokasi</h2>
            <p>{kos.contact?.contact_name}</p>
            <div className="kos-contact-actions">
              {phone && <a className="public-action" href={`tel:${phone}`}>Telepon</a>}
              {whatsapp && <a className="public-action" href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>}
              {mapLink && <a className="public-action" href={mapLink} target="_blank" rel="noreferrer">Buka peta</a>}
            </div>
          </section>
        )}
        <KosCommunity kosId={kos.id} />
      </article>
      <footer className="public-footer">CariinKos · Informasi berdasarkan data yang tersedia</footer>
    </main>
  );
}

function PublicHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="public-header">
      <Link className="public-brand" href="/" aria-label="CariinKos, beranda">CariinKos</Link>
      <nav className="public-header-actions" aria-label="Akun">
        {isAuthenticated ? <Link className="public-login" href="/favorit">Favorit</Link> : <Link className="public-login" href="/register">Daftar pencari</Link>}
        <Link className="public-login" href={isAuthenticated ? "/dashboard/profile" : "/login"}>{isAuthenticated ? "Profil" : "Masuk"}</Link>
      </nav>
    </header>
  );
}

function typeLabel(type: PublicKos["type"]) {
  if (type === "man") return "Khusus pria";
  if (type === "woman") return "Khusus wanita";
  return "Campur";
}

function safeWebUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}
