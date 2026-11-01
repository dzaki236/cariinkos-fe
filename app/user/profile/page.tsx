"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { appToast } from "@/components/ui/app-toast";
import { apiRequest } from "@/lib/query-client";
import { UserLogoutButton } from "@/components/public/user-logout-button";

export default function UserProfilePage() {
  const { data: session, update } = useSession();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
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
      formElement.reset();
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : "Profil gagal diperbarui.";
      setError(reason);
      appToast.error("Perubahan tidak tersimpan", reason);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="public-page">
      <header className="public-header">
        <Link className="public-brand" href="/user">CariinKos</Link>
        <nav className="public-header-actions" aria-label="Navigasi akun"><Link className="public-login" href="/favorit">Favorit</Link><UserLogoutButton /></nav>
      </header>
      <section className="public-content" aria-labelledby="profile-heading">
        <Link className="public-back" href="/user">Kembali ke akun</Link>
        <h1 id="profile-heading">Profil</h1>
        <p className="public-intro">Perbarui identitas akun dan kata sandi.</p>
        <form className="form-stack user-profile-form" onSubmit={submit}>
          <label>Nama<input name="name" defaultValue={session?.user?.name ?? ""} maxLength={255} required /></label>
          <label>Email<input name="email" type="email" defaultValue={session?.user?.email ?? ""} maxLength={255} required /></label>
          <fieldset>
            <legend>Ganti kata sandi (opsional)</legend>
            <label>Kata sandi saat ini<input name="old_password" type="password" autoComplete="current-password" /></label>
            <label>Kata sandi baru<input name="new_password" type="password" autoComplete="new-password" minLength={8} /></label>
            <label>Ulangi kata sandi baru<input name="new_password_confirmation" type="password" autoComplete="new-password" minLength={8} /></label>
          </fieldset>
          {error && <p className="error-message" role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}
          <button className="button button-primary" disabled={pending}>{pending ? "Menyimpan..." : "Simpan perubahan"}</button>
        </form>
      </section>
    </main>
  );
}
