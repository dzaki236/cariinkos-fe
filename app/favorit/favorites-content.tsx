"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/lib/query-client";
import { UserLogoutButton } from "@/components/public/user-logout-button";

type Favorite = {
  id: string;
  kos_id: string;
  note?: string | null;
  kos?: { name: string; city: string; district: string; price_monthly: number; cover_photo?: string | null };
};

export function FavoritesContent() {
  const { status } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    apiRequest<{ data: Favorite[] }>("favorites")
      .then((payload) => { if (active) setFavorites(payload.data ?? []); })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Favorite gagal dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status]);

  async function remove(favorite: Favorite) {
    setBusyId(favorite.kos_id);
    try {
      await apiRequest(`kos/${encodeURIComponent(favorite.kos_id)}/favorite`, { method: "DELETE" });
      setFavorites((current) => current.filter((item) => item.id !== favorite.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Favorite gagal dihapus.");
    } finally { setBusyId(""); }
  }

  async function saveNote(favorite: Favorite) {
    setBusyId(favorite.kos_id);
    setError("");
    try {
      const payload = await apiRequest<{ data: Favorite }>(`kos/${encodeURIComponent(favorite.kos_id)}/favorite`, {
        method: "PUT",
        body: JSON.stringify({ note: (notes[favorite.id] ?? favorite.note ?? "").trim() || null }),
      });
      setFavorites((current) => current.map((item) => item.id === favorite.id ? payload.data : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Catatan gagal diperbarui.");
    } finally { setBusyId(""); }
  }

  return (
    <main className="public-page">
      <header className="public-header"><Link className="public-brand" href={status === "authenticated" ? "/user" : "/"}>CariinKos</Link>{status === "authenticated" ? <nav className="public-header-actions" aria-label="Navigasi akun"><Link className="public-login" href="/user/profile">Profil</Link><UserLogoutButton /></nav> : <Link className="public-login" href="/login">Profil</Link>}</header>
      <section className="public-content">
        <Link className="public-back" href="/">Kembali ke daftar kos</Link>
        <h1>Kos favorit</h1>
        {status === "unauthenticated" ? <p>Silakan <Link href="/login">masuk</Link> untuk melihat kos favorit.</p> : null}
        {error && <p role="alert">{error}</p>}
        {loading ? <p role="status">Memuat kos favorit...</p> : favorites.length === 0 ? <p>Belum ada kos yang disimpan.</p> : (
          <ul className="kos-list">
            {favorites.map((favorite) => <li className="kos-list-item" key={favorite.id}>
              <article>
                <Link className="kos-list-link" href={`/kos/${encodeURIComponent(favorite.kos_id)}`}>
                  <span className="kos-list-copy"><strong className="kos-list-name">{favorite.kos?.name ?? "Kos tersimpan"}</strong><span className="kos-list-location">{[favorite.kos?.district, favorite.kos?.city].filter(Boolean).join(", ")}</span></span>
                </Link>
                <label>Catatan<input value={notes[favorite.id] ?? favorite.note ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [favorite.id]: event.target.value }))} maxLength={2000} /></label>
                <div className="kos-community-buttons"><button className="public-action" type="button" onClick={() => saveNote(favorite)} disabled={busyId === favorite.kos_id}>Simpan catatan</button><button className="public-action" type="button" onClick={() => remove(favorite)} disabled={busyId === favorite.kos_id}>{busyId === favorite.kos_id ? "Memproses..." : "Hapus favorit"}</button></div>
              </article>
            </li>)}
          </ul>
        )}
      </section>
    </main>
  );
}
