import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer site-footer-premium">
      <div className="container footer-premium-grid">
        <div className="footer-brand-col">
          <Link className="brand brand-footer" href="/">
            <span className="brand-mark">S</span>
            <span>SeatMe</span>
          </Link>
          <p className="footer-tagline">
            Interactive luxury reservations with immersive 360° table selection — crafted for extraordinary hospitality.
          </p>
        </div>
        <div className="footer-col">
          <h4>Discover</h4>
          <nav className="footer-links-col">
            <Link href="/discover">Restaurants</Link>
            <Link href="/#experience-360">360° experiences</Link>
            <Link href="/#experience">How it works</Link>
          </nav>
        </div>
        <div className="footer-col">
          <h4>Partners</h4>
          <nav className="footer-links-col">
            <Link href="/client/login">Restaurant login</Link>
            <Link href="/admin/login">Platform admin</Link>
          </nav>
        </div>
        <div className="footer-col">
          <h4>Reserve</h4>
          <nav className="footer-links-col">
            <Link href="/discover">Find a table</Link>
          </nav>
        </div>
      </div>
      <div className="container footer-bottom">
        <p className="footer-copy">© {new Date().getFullYear()} SeatMe. All rights reserved.</p>
      </div>
    </footer>
  );
}
