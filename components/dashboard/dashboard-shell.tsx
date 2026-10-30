"use client";

import { useState } from "react";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="dashboard-frame">
      <Navbar onMenuClick={() => setMenuOpen((value) => !value)} />
      <div className="dashboard-body">
        <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
