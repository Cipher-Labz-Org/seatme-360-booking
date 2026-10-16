"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  actions?: React.ReactNode;
  transparent?: boolean;
};

/** Primary customer navigation — sticky royal black & gold header */
export function LuxuryNavigation({ actions, transparent = false }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`topbar ${transparent && !scrolled ? "topbar-transparent" : ""} ${scrolled ? "topbar-scrolled" : ""}`}
    >
      <div className="topbar-accent" aria-hidden />
      <div className="container nav">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            S
          </span>
          <span className="brand-text font-[family-name:var(--font-display)] tracking-wide">SeatMe</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/discover">Discover</Link>
          <Link href="/#experience-360">360° Experience</Link>
          <Link href="/#experience">How it works</Link>
          <Link href="/client/login">For restaurants</Link>
          <Link className="nav-muted" href="/admin/login">
            Admin
          </Link>
        </nav>
        <div className="nav-actions">
          <Link className="button ghost" href="/client/login">
            Restaurant login
          </Link>
          <Link className="button primary" href="/discover">
            Find a table →
          </Link>
          {actions}
        </div>
      </div>
    </header>
  );
}
