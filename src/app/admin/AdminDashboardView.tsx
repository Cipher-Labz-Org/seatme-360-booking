"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { clearAuth, getUser } from "@/lib/auth-storage";

type ClientRow = {
  id: string;
  businessName: string;
  active: boolean;
  user: { email: string };
  _count: { venues: number };
};

type VenueRow = {
  id: string;
  name: string;
  city: string;
  type: string;
  active: boolean;
  client: { businessName: string };
};

type Overview = {
  clientCount: number;
  activeClients: number;
  venueCount: number;
  activeVenues: number;
  locationCount: number;
  tableCount: number;
  bookingCount: number;
  bookingsToday: number;
  pendingBookings: number;
  storageLabel: string;
  recentBookings: {
    id: string;
    guestName: string;
    date: string;
    time: string;
    partySize: number;
    status: string;
    table: { code: string; location: { name: string; venue: { name: string; client: { businessName: string } } } };
  }[];
};

export function AdminDashboardView() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [venues, setVenues] = useState<VenueRow[]>([]);
  const [tab, setTab] = useState<"clients" | "venues" | "activity">("clients");
  const [form, setForm] = useState({ businessName: "", email: "", password: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const load = async () => {
    const [o, c, v] = await Promise.all([
      api<Overview>("/api/admin/overview"),
      api<ClientRow[]>("/api/admin/clients"),
      api<VenueRow[]>("/api/admin/venues"),
    ]);
    setOverview(o);
    setClients(c);
    setVenues(v);
  };

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }
    load().catch(() => showToast("Failed to load admin data"));
  }, [router]);

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/admin/clients", { method: "POST", body: JSON.stringify(form) });
      setForm({ businessName: "", email: "", password: "" });
      showToast("Client created");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="dashboard-shell dashboard-shell-premium">
      <aside className="sidebar sidebar-premium">
        <Link className="brand sidebar-brand" href="/admin">
          <span className="brand-mark">S</span>
          <span className="sidebar-brand-text">
            <strong>SeatMe</strong>
            <small>Platform admin</small>
          </span>
        </Link>
        <nav className="sidebar-nav">
          <button type="button" className={tab === "clients" ? "active" : ""} onClick={() => setTab("clients")}>
            Clients
          </button>
          <button type="button" className={tab === "venues" ? "active" : ""} onClick={() => setTab("venues")}>
            Venues
          </button>
          <button type="button" className={tab === "activity" ? "active" : ""} onClick={() => setTab("activity")}>
            Activity
          </button>
          <Link href="/" className="sidebar-nav-muted">
            Public site ↗
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button
            type="button"
            className="button ghost sidebar-signout"
            onClick={() => {
              clearAuth();
              router.push("/admin/login");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="dashboard-main dashboard-main-premium">
        <header className="dash-page-header">
          <h1>Platform control</h1>
          <p className="lead">Tenants, venues, storage, and reservation volume across the network.</p>
        </header>

        {overview && (
          <div className="metric-grid dash-metrics">
            <div className="metric">
              <span className="eyebrow">Clients</span>
              <strong>
                {overview.activeClients}/{overview.clientCount}
              </strong>
              <small>active</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Venues live</span>
              <strong>
                {overview.activeVenues}/{overview.venueCount}
              </strong>
            </div>
            <div className="metric">
              <span className="eyebrow">Tables</span>
              <strong>{overview.tableCount}</strong>
              <small>{overview.locationCount} locations</small>
            </div>
            <div className="metric">
              <span className="eyebrow">Bookings today</span>
              <strong>{overview.bookingsToday}</strong>
            </div>
            <div className="metric">
              <span className="eyebrow">All-time bookings</span>
              <strong>{overview.bookingCount}</strong>
            </div>
            <div className="metric">
              <span className="eyebrow">Upload storage</span>
              <strong>{overview.storageLabel}</strong>
              <small>panoramas & media</small>
            </div>
          </div>
        )}

        {tab === "clients" && (
          <section className="dash-panel">
            <h2>Client accounts</h2>
            <form className="form-grid" onSubmit={createClient} style={{ marginTop: 16, maxWidth: 520 }}>
              <label>
                Business name
                <input
                  value={form.businessName}
                  onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                  required
                />
              </label>
              <label>
                Login email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </label>
              <button type="submit" className="button primary">
                + Create client
              </button>
            </form>
            <div className="table-wrap" style={{ marginTop: 20 }}>
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Email</th>
                    <th>Venues</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td>{c.businessName}</td>
                      <td>{c.user.email}</td>
                      <td>{c._count.venues}</td>
                      <td>
                        <span className={`status-pill ${c.active ? "status-confirmed" : "status-cancelled"}`}>
                          {c.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={async () => {
                            await api(`/api/admin/clients/${c.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ active: !c.active }),
                            });
                            load();
                          }}
                        >
                          {c.active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "venues" && (
          <section className="dash-panel">
            <h2>All venues</h2>
            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Client</th>
                    <th>City</th>
                    <th>Type</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {venues.map((v) => (
                    <tr key={v.id}>
                      <td>{v.name}</td>
                      <td>{v.client.businessName}</td>
                      <td>{v.city}</td>
                      <td>{v.type}</td>
                      <td>
                        <button
                          type="button"
                          className="button ghost small"
                          onClick={async () => {
                            await api(`/api/admin/venues/${v.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ active: !v.active }),
                            });
                            load();
                          }}
                        >
                          {v.active ? "Hide" : "Show"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "activity" && overview && (
          <section className="dash-panel">
            <h2>Recent bookings</h2>
            <ul className="res-timeline compact" style={{ marginTop: 16 }}>
              {overview.recentBookings.map((b) => (
                <li key={b.id}>
                  <time>
                    {b.date} · {b.time}
                  </time>
                  <div>
                    <strong>{b.guestName}</strong>
                    <span>
                      {b.partySize} guests · {b.table.location.venue.client.businessName} / {b.table.location.venue.name}
                    </span>
                  </div>
                  <span className={`status-pill status-${b.status.toLowerCase()}`}>{b.status}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}
