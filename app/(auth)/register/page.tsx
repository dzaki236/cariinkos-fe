"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { appToast } from "@/components/ui/app-toast";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [router, status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await registerUser({
        name: String(form.get("name") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      });
      appToast.success("Akun berhasil dibuat", "Silakan masuk dengan email dan kata sandi Anda.");
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      router.push(result?.ok ? "/" : "/login");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Pendaftaran gagal.";
      setError(message);
      appToast.error("Tidak dapat membuat akun", message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="register-heading">
        <div className="brand-mark" aria-hidden="true">C</div>
        <p className="eyebrow">CARIINKOS / AKUN PENCARI</p>
        <h1 id="register-heading">Buat akun pencari kos</h1>
        <p className="muted">Simpan kos dan bagikan pengalaman Anda.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Nama<input name="name" autoComplete="name" maxLength={255} required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" maxLength={255} required /></label>
          <label>Kata sandi<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="button button-primary" disabled={pending}>
            {pending ? "Membuat akun..." : "Daftar"}
          </button>
        </form>
        <p className="muted">Sudah punya akun? <Link href="/login">Masuk</Link></p>
      </section>
      <aside className="login-aside"><span className="aside-kicker">PENCARI KOS</span><p>Temukan tempat tinggal yang sesuai, lalu simpan untuk dibandingkan.</p></aside>
    </main>
  );
}
