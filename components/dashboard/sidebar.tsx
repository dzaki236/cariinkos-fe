"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Ringkasan", mark: "01" },
  { href: "/dashboard/kos", label: "Data kos", mark: "02" },
  { href: "/dashboard/fasilitas", label: "Fasilitas", mark: "03" },
];

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
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
          {links.map((link) => {
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
