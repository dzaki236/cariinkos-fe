"use client";

import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function UserLogoutButton() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/backend-logout", { method: "POST" });
    } finally {
      queryClient.clear();
      await signOut({ callbackUrl: "/login" });
    }
  }

  return (
    <button className="public-login" type="button" onClick={logout} disabled={busy}>
      {busy ? "Keluar..." : "Keluar"}
    </button>
  );
}
