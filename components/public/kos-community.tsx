"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/lib/query-client";

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: { id: string; name: string };
};
type Favorite = { id: string; kos_id: string; note?: string | null };
type ReviewList = { data: Review[] };
type FavoriteList = { data: Favorite[] };
type ReviewResponse = { data: Review };

export function KosCommunity({ kosId }: { kosId: string }) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorite, setFavorite] = useState<Favorite | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/backend/public/kos/${encodeURIComponent(kosId)}/reviews`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Ulasan belum dapat dimuat.");
        return (await response.json()) as ReviewList;
      })
      .then((payload) => { if (active) setReviews(payload.data ?? []); })
      .catch((error: unknown) => { if (active) setMessage(error instanceof Error ? error.message : "Ulasan belum dapat dimuat."); });
    return () => { active = false; };
  }, [kosId]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id || session.user.role !== "user") {
      return;
    }
    let active = true;
    Promise.all([
      apiRequest<FavoriteList>("favorites"),
      apiRequest<ReviewList>(`public/kos/${encodeURIComponent(kosId)}/reviews`),
    ]).then(async ([favorites, publicReviews]) => {
      if (!active) return;
      setFavorite(favorites.data.find((item) => item.kos_id === kosId) ?? null);
      const ownReview = publicReviews.data.find((item) => item.user?.id === session.user.id);
      if (ownReview) {
        try {
          const own = await apiRequest<ReviewResponse>(`kos/${encodeURIComponent(kosId)}/review/${encodeURIComponent(ownReview.id)}`);
          if (active) setReview(own.data);
        } catch {
          if (active) setReview(ownReview);
        }
      } else if (active) setReview(null);
    }).catch(() => { if (active) setMessage("Status akun belum dapat dimuat."); });
    return () => { active = false; };
  }, [kosId, session?.user?.id, session?.user?.role, status]);

  async function toggleFavorite() {
    setPending(true);
    setMessage("");
    try {
      if (favorite) {
        await apiRequest(`kos/${encodeURIComponent(kosId)}/favorite`, { method: "DELETE" });
        setFavorite(null);
      } else {
        const payload = await apiRequest<{ data: Favorite }>(`kos/${encodeURIComponent(kosId)}/favorite`, {
          method: "POST",
          body: JSON.stringify({ note: note.trim() || null }),
        });
        setFavorite(payload.data);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Favorite gagal diperbarui.");
    } finally { setPending(false); }
  }

  async function saveFavoriteNote() {
    if (!favorite) return;
    setPending(true);
    setMessage("");
    try {
      const payload = await apiRequest<{ data: Favorite }>(`kos/${encodeURIComponent(kosId)}/favorite`, {
        method: "PUT",
        body: JSON.stringify({ note: note.trim() || null }),
      });
      setFavorite(payload.data);
      setMessage("Catatan favorit diperbarui.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Catatan favorit gagal diperbarui.");
    } finally { setPending(false); }
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const payload = await apiRequest<ReviewResponse>(`kos/${encodeURIComponent(kosId)}/reviews`, {
        method: review ? "PUT" : "POST",
        body: JSON.stringify({ rating: Number(rating), comment: comment.trim() }),
      });
      setReview(payload.data);
      setReviews((current) => [payload.data, ...current.filter((item) => item.id !== payload.data.id)]);
      setComment("");
      setMessage("Ulasan tersimpan.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ulasan gagal disimpan.");
    } finally { setPending(false); }
  }

  async function deleteReview() {
    setPending(true);
    setMessage("");
    try {
      await apiRequest(`kos/${encodeURIComponent(kosId)}/reviews`, { method: "DELETE" });
      setReviews((current) => current.filter((item) => item.id !== review?.id));
      setReview(null);
      setComment("");
      setMessage("Ulasan dihapus.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ulasan gagal dihapus.");
    } finally { setPending(false); }
  }

  return (
    <section className="kos-detail-section kos-community" aria-labelledby="community-title">
      <h2 id="community-title">Ulasan pencari kos</h2>
      {status === "authenticated" && session?.user?.role === "user" ? (
        <div className="kos-community-actions">
          <label>Catatan favorit <input value={note || favorite?.note || ""} onChange={(event) => setNote(event.target.value)} maxLength={2000} placeholder="Opsional" /></label>
          <button className="public-action" type="button" onClick={toggleFavorite} disabled={pending}>
            {favorite ? "Hapus dari favorit" : "Simpan ke favorit"}
          </button>
          {favorite && <button className="public-action" type="button" onClick={saveFavoriteNote} disabled={pending}>Simpan catatan</button>}
          <form className="form-stack" onSubmit={submitReview}>
            <label>Penilaian
              <select value={rating} onChange={(event) => setRating(event.target.value)}>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} dari 5</option>)}
              </select>
            </label>
            <label>Ulasan
              <textarea value={comment || review?.comment || ""} onChange={(event) => setComment(event.target.value)} maxLength={2000} required rows={4} />
            </label>
            <div className="kos-community-buttons">
              <button className="public-action" type="submit" disabled={pending}>{review ? "Perbarui ulasan" : "Kirim ulasan"}</button>
              {review && <button className="public-action" type="button" onClick={deleteReview} disabled={pending}>Hapus ulasan</button>}
            </div>
          </form>
        </div>
      ) : status === "authenticated" ? (
        <p>Ulasan dan favorit tersedia untuk akun pencari kos.</p>
      ) : (
        <p><Link href="/login">Masuk</Link> atau <Link href="/register">buat akun pencari</Link> untuk memberi ulasan dan menyimpan kos.</p>
      )}
      {message && <p role="status" aria-live="polite">{message}</p>}
      {reviews.length ? (
        <ul className="kos-review-list">
          {reviews.map((item) => (
            <li key={item.id}>
              <strong>{item.user?.name ?? "Pencari kos"} · {item.rating}/5</strong>
              <p>{item.comment}</p>
              <time dateTime={item.created_at}>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(item.created_at))}</time>
            </li>
          ))}
        </ul>
      ) : <p>Belum ada ulasan untuk kos ini.</p>}
    </section>
  );
}
