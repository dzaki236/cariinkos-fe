"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Ringkasan", mark: "01" },
  { href: "/dashboard/kos", label: "Data kos", mark: "02" },
  { href: "/dashboard/fasilitas", label: "Fasilitas", mark: "03" },
  { href: "/dashboard/users", label: "Pengguna", mark: "04" },
  { href: "/dashboard/profile", label: "Profil", mark: "05" },
];

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const visibleLinks = links.filter(
    (link) => link.href !== "/dashboard/users" || session?.user?.role === "owner",
  );
  return (
    <>
      {open && (
        <button
          className="sidebar-scrim"
          aria-label="Tutup navigasi"
          onClick={onNavigate}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <p className="sidebar-label">MENU UTAMA</p>
        <nav aria-label="Navigasi dashboard">
          {visibleLinks.map((link) => {
            const active =
              link.href === "/dashboard"
                ? pathname === link.href
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="nav-mark">{link.mark}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          Sistem terhubung
        </div>
      </aside>
    </>
  );
}
