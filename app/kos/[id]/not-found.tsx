import Link from "next/link";

export default function KosNotFound() {
  return (
    <main className="public-page">
      <header className="public-header">
        <Link className="public-brand" href="/">CariinKos</Link>
        <Link className="public-login" href="/login">Masuk sebagai pemilik</Link>
      </header>
      <section className="public-content public-state" role="status">
        <h1>Kos tidak ditemukan</h1>
        <p>Data kos ini tidak tersedia atau tautannya tidak valid.</p>
        <Link className="public-action" href="/">Lihat daftar kos</Link>
      </section>
    </main>
  );
}
