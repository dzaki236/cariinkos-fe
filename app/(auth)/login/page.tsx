"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { appToast } from "@/components/ui/app-toast";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [router, status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      if (result?.ok) {
        appToast.success("Berhasil masuk");
        router.push("/dashboard");
      } else {
        const message = "Email atau kata sandi tidak valid.";
        setError(message);
        appToast.error("Gagal masuk", message);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Terjadi kesalahan saat masuk.";
      setError(message);
      appToast.error("Gagal masuk", message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-heading">
        <div className="brand-mark" aria-hidden="true">
          C
        </div>
        <p className="eyebrow">CARIINKOS / PENGELOLAAN</p>
        <h1 id="login-heading">Masuk ke akun Anda</h1>
        <p className="muted">Kelola informasi kos dalam satu tempat.</p>
        <form onSubmit={submit} className="form-stack">
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Kata sandi
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button className="button button-primary" disabled={pending}>
            {pending ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </section>
      <aside className="login-aside">
        <span className="aside-kicker">KHUSUS PEMILIK</span>
        <p>Tempat data kos Anda tetap tertata.</p>
      </aside>
    </main>
  );
}
