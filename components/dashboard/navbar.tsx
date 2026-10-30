"use client";

import { signOut, useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data } = useSession();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/backend-logout", { method: "POST" });
    queryClient.clear();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <header className="topbar">
      <button
        className="menu-button"
        onClick={onMenuClick}
        aria-label="Buka navigasi"
      >
        ☰
      </button>
      <div className="topbar-brand">
        <span className="brand-mark small">C</span>
        <span>
          CariinKos <b>Pengelola</b>
        </span>
      </div>
      <div className="topbar-user">
        <span>{data?.user?.name || data?.user?.email || "Pemilik"}</span>
        <button
          className="button button-quiet"
          onClick={logout}
          disabled={busy}
        >
          {busy ? "Keluar..." : "Keluar"}
        </button>
      </div>
    </header>
  );
}
