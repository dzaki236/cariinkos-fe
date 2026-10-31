"use client";

import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { appToast } from "@/components/ui/app-toast";
import { apiRequest } from "@/lib/query-client";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const input: Record<string, string> = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
    };
    const newPassword = String(form.get("new_password") ?? "");
    if (newPassword) {
      input.old_password = String(form.get("old_password") ?? "");
      input.new_password = newPassword;
      input.new_password_confirmation = String(form.get("new_password_confirmation") ?? "");
    }
    try {
      await apiRequest("users/profile", { method: "PUT", body: JSON.stringify(input) });
      await update({ user: { name: input.name, email: input.email } });
      setMessage("Profil berhasil diperbarui.");
      appToast.success("Profil diperbarui");
      (event.currentTarget as HTMLFormElement).reset();
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : "Profil gagal diperbarui.";
      setError(reason);
      appToast.error("Perubahan tidak tersimpan", reason);
    } finally { setPending(false); }
  }

  return (
    <section className="dashboard-content">
      <header className="page-heading"><div><p className="eyebrow">AKUN</p><h1>Profil</h1><p className="muted">Perbarui identitas akun dan kata sandi.</p></div></header>
      <form className="form-stack dashboard-form" onSubmit={submit}>
        <label>Nama<input name="name" defaultValue={session?.user?.name ?? ""} maxLength={255} required /></label>
        <label>Email<input name="email" type="email" defaultValue={session?.user?.email ?? ""} maxLength={255} required /></label>
        <fieldset><legend>Ganti kata sandi (opsional)</legend>
          <label>Kata sandi saat ini<input name="old_password" type="password" autoComplete="current-password" /></label>
          <label>Kata sandi baru<input name="new_password" type="password" autoComplete="new-password" minLength={8} /></label>
          <label>Ulangi kata sandi baru<input name="new_password_confirmation" type="password" autoComplete="new-password" minLength={8} /></label>
        </fieldset>
        {error && <p className="error-message" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        <button className="button button-primary" disabled={pending}>{pending ? "Menyimpan..." : "Simpan perubahan"}</button>
      </form>
    </section>
  );
}
