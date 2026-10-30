import Link from "next/link";

export default function NotFound() {
  return (
    <main className="public-page">
      <header className="public-header">
        <Link className="public-brand" href="/">CariinKos</Link>
        <Link className="public-login" href="/login">Masuk sebagai pemilik</Link>
      </header>
      <section className="public-content public-state" role="status">
        <h1>Halaman tidak ditemukan</h1>
        <p>Alamat yang dibuka tidak tersedia.</p>
        <Link className="public-action" href="/">Kembali ke daftar kos</Link>
      </section>
    </main>
  );
}
