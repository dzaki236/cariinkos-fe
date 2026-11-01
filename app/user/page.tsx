import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserLogoutButton } from "@/components/public/user-logout-button";

export default async function UserHomePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "owner") redirect("/dashboard");

  return (
    <main className="public-page">
      <header className="public-header">
        <Link className="public-brand" href="/">CariinKos</Link>
        <nav className="public-header-actions" aria-label="Navigasi akun">
          <Link className="public-login" href="/favorit">Favorit</Link>
          <Link className="public-login" href="/user/profile">Profil</Link>
          <UserLogoutButton />
        </nav>
      </header>
      <section className="public-content" aria-labelledby="user-home-heading">
        <p className="public-draft-label">AKUN PENCARI KOS</p>
        <h1 id="user-home-heading">Halo, {session.user.name || session.user.email}</h1>
        <p className="public-intro">Temukan kos yang sesuai dan simpan pilihan yang ingin Anda bandingkan.</p>
        <div className="user-home-links">
          <Link className="public-action" href="/">Jelajahi daftar kos</Link>
          <Link className="public-action" href="/favorit">Lihat kos favorit</Link>
          <Link className="public-action" href="/user/profile">Kelola profil</Link>
        </div>
      </section>
    </main>
  );
}
