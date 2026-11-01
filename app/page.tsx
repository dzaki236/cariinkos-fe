import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, getRoleHome } from "@/lib/auth";
import { KosListing } from "@/components/public/kos-listing";
import { PublicRetryLink } from "@/components/public/public-retry-link";
import { UserLogoutButton } from "@/components/public/user-logout-button";
import { getPublicKosList, PublicKosApiError } from "@/lib/public-kos-api";

export const metadata: Metadata = {
  title: "CariinKos | Daftar Kos",
  description: "Lihat daftar kos dan detail yang tersedia dari CariinKos.",
};

const PER_PAGE = 10;

type HomeProps = {
  searchParams: Promise<{ page?: string | string[]; retry?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  await connection();
  const params = await searchParams;
  const requestedPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const retryKey = Array.isArray(params.retry) ? params.retry[0] : params.retry;
  const session = await getServerSession(authOptions);
  const parsedPage = Number(requestedPage ?? "1");
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let result;
  let failed = false;
  try {
    result = await getPublicKosList(page, PER_PAGE, retryKey);
  } catch (error) {
    failed = true;
    if (!(error instanceof PublicKosApiError)) {
      console.error("Public kos list request failed", error);
    }
  }

  return (
    <main className="public-page">
      <header className="public-header">
        <Link className="public-brand" href="/" aria-label="CariinKos, beranda">
          CariinKos
        </Link>
        <nav className="public-header-actions" aria-label="Akun">
          {session?.user?.id && session.user.role === "user" ? <Link className="public-login" href="/favorit">Favorit</Link> : null}
          <Link className="public-login" href={session?.user?.id ? getRoleHome(session.user.role) : "/register"}>{session?.user?.id ? "Akun saya" : "Daftar pencari"}</Link>
          {session?.user?.id && session.user.role === "user" ? <UserLogoutButton /> : null}
          {!session?.user?.id ? <Link className="public-login" href="/login">Masuk</Link> : null}
        </nav>
      </header>

      <section className="public-content" aria-labelledby="listing-title">
        <div className="public-heading">
          <p className="public-draft-label">
            <hr/>
          </p>
          <h1 id="listing-title">Daftar kos</h1>
          <p className="public-intro">
            Bandingkan lokasi, harga, dan ketersediaan dari data kos yang tersedia.
          </p>
        </div>

        {failed ? (
          <div className="public-state" role="alert">
            <h2>Daftar kos belum dapat dimuat</h2>
            <p>Periksa koneksi layanan lalu coba lagi.</p>
            <PublicRetryLink href="/">Coba lagi</PublicRetryLink>
          </div>
        ) : result?.data.length === 0 ? (
          <div className="public-state" role="status">
            <h2>Belum ada kos untuk ditampilkan</h2>
            <p>Daftar akan muncul di sini saat data tersedia.</p>
          </div>
        ) : result ? (
          <KosListing response={result} />
        ) : null}
      </section>
      <footer className="public-footer">CariinKos · Informasi berdasarkan data yang tersedia</footer>
    </main>
  );
}
