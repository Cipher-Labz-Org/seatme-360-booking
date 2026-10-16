"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getUser, type StoredUser } from "@/lib/auth-storage";

const NAV: { href: string; label: string; match: (path: string) => boolean }[] = [
  {
    href: "/client",
    label: "Overview",
    match: (p) =>
      p === "/client" || p.startsWith("/client/venues") || p.startsWith("/client/locations"),
  },
  { href: "/client/reservations", label: "Reservations", match: (p) => p.startsWith("/client/reservations") },
];

export function ClientDashboardShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const businessLabel = user?.businessName ?? "Partner";

  return (
    <div className="dashboard-shell dashboard-shell-premium">
      <aside className="sidebar sidebar-premium">
        <Link className="brand sidebar-brand" href="/client">
          <span className="brand-mark">S</span>
          <span className="sidebar-brand-text">
            <strong suppressHydrationWarning>{businessLabel}</strong>
            <small>Partner console</small>
          </span>
        </Link>
        <nav className="sidebar-nav">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link key={item.href + item.label} href={item.href} className={active ? "active" : ""}>
                {item.label}
              </Link>
            );
          })}
          <Link href="/" className="sidebar-nav-muted">
            Public site ↗
          </Link>
        </nav>
        <div className="sidebar-footer">
          <p className="sidebar-user-email" suppressHydrationWarning>
            {user?.email ?? ""}
          </p>
          <button
            type="button"
            className="button ghost sidebar-signout"
            onClick={() => {
              clearAuth();
              router.push("/client/login");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="dashboard-main dashboard-main-premium">
        {(title || subtitle) && (
          <header className="dash-page-header">
            {title && <h1>{title}</h1>}
            {subtitle && <p className="lead">{subtitle}</p>}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
