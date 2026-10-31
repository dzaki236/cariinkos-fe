"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiRequest } from "@/lib/query-client";

type User = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "user";
  disabled_at?: string | null;
  created_at: string;
};

export default function UsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "owner") router.replace("/dashboard");
  }, [router, session?.user?.role, status]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "owner") return;
    let active = true;
    apiRequest<{ data: User[] }>("users")
      .then((payload) => { if (active) setUsers(payload.data ?? []); })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : "Pengguna gagal dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session?.user?.role, status]);

  async function toggle(user: User) {
    setBusyId(user.id);
    setError("");
    try {
      const payload = await apiRequest<{ data: User }>(`users/${encodeURIComponent(user.id)}/status`, {
        method: "PUT",
        body: JSON.stringify({ active: Boolean(user.disabled_at) }),
      });
      setUsers((current) => current.map((item) => item.id === user.id ? payload.data : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Status pengguna gagal diubah.");
    } finally { setBusyId(""); }
  }

  return (
    <section className="dashboard-content">
      <header className="page-heading"><div><p className="eyebrow">AKUN</p><h1>Pengguna</h1><p className="muted">Kelola akses akun pencari kos.</p></div></header>
      {error && <p className="error-message" role="alert">{error}</p>}
      {loading ? <p role="status">Memuat pengguna...</p> : users.length === 0 ? <p>Belum ada akun pengguna.</p> : (
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Nama</th><th>Email</th><th>Status</th><th>Terdaftar</th><th>Aksi</th></tr></thead><tbody>
          {users.map((user) => {
            const active = !user.disabled_at;
            return <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{active ? "Aktif" : "Nonaktif"}</td><td>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(user.created_at))}</td><td>{user.role === "user" && <button className="button button-quiet" type="button" onClick={() => toggle(user)} disabled={busyId === user.id}>{busyId === user.id ? "Menyimpan..." : active ? "Nonaktifkan" : "Aktifkan"}</button>}</td></tr>;
          })}
        </tbody></table></div>
      )}
    </section>
  );
}
