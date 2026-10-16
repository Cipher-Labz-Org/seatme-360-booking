"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientDashboardShell } from "@/components/client/ClientDashboardShell";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth-storage";

type Venue = {
  id: string;
  name: string;
  city: string;
  type: "RESTAURANT" | "HOTEL";
  _count: { locations: number };
};

type DashboardData = {
  venueCount: number;
  locationCount: number;
  tableCount: number;
  bookingsToday: number;
  bookingsUpcoming: number;
  recentBookings: {
    id: string;
    guestName: string;
    date: string;
    time: string;
    partySize: number;
    status: string;
    table: { code: string; location: { name: string; venue: { name: string } } };
  }[];
};

export function ClientHomeView() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [form, setForm] = useState<{ type: "RESTAURANT" | "HOTEL"; name: string; city: string; description: string }>({
    type: "RESTAURANT",
    name: "",
    city: "",
    description: "",
  });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const load = async () => {
    const [v, d] = await Promise.all([
      api<Venue[]>("/api/client/venues"),
      api<DashboardData>("/api/client/dashboard"),
    ]);
    setVenues(v);
    setDash(d);
  };

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "CLIENT") {
      router.replace("/client/login");
      return;
    }
    load().catch(() => showToast("Could not load dashboard"));
  }, [router]);

  const createVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/client/venues", { method: "POST", body: JSON.stringify(form) });
      setForm({ type: "RESTAURANT", name: "", city: "", description: "" });
      showToast("Venue added");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <ClientDashboardShell
      title="Overview"
      subtitle="Manage venues, 360° dining rooms, and tonight’s reservations from one place."
    >
      {dash && (
        <div className="metric-grid dash-metrics">
          <div className="metric">
            <span className="eyebrow">Venues</span>
            <strong>{dash.venueCount}</strong>
          </div>
          <div className="metric">
            <span className="eyebrow">Dining locations</span>
            <strong>{dash.locationCount}</strong>
          </div>
          <div className="metric">
            <span className="eyebrow">Tables mapped</span>
            <strong>{dash.tableCount}</strong>
          </div>
          <div className="metric">
            <span className="eyebrow">Today</span>
            <strong>{dash.bookingsToday}</strong>
            <small>covers booked</small>
          </div>
          <div className="metric">
            <span className="eyebrow">Upcoming</span>
            <strong>{dash.bookingsUpcoming}</strong>
            <small>active reservations</small>
          </div>
        </div>
      )}

      <div className="dash-two-col">
        <section className="dash-panel">
          <div className="dash-section-head">
            <h2>Your venues</h2>
            <Link href="/client/reservations" className="button ghost">
              All reservations →
            </Link>
          </div>
          {venues.length === 0 ? (
            <div className="empty-state">No venues yet — add your first property below.</div>
          ) : (
            <div className="venue-dash-list">
              {venues.map((v) => (
                <Link key={v.id} className="venue-dash-row" href={`/client/venues/${v.id}`}>
                  <div>
                    <strong>{v.name}</strong>
                    <span>
                      {v.type} · {v.city} · {v._count.locations} locations
                    </span>
                  </div>
                  <span className="venue-dash-actions">
                    <span className="button outline small">Manage</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="dash-panel">
          <h2>Next reservations</h2>
          {!dash?.recentBookings.length ? (
            <p className="lead" style={{ fontSize: 14, marginTop: 12 }}>
              Bookings from your public pages will appear here.
            </p>
          ) : (
            <ul className="res-timeline compact">
              {dash.recentBookings.map((b) => (
                <li key={b.id}>
                  <time>
                    {b.date} · {b.time}
                  </time>
                  <div>
                    <strong>{b.guestName}</strong>
                    <span>
                      {b.partySize} guests · {b.table.code} · {b.table.location.venue.name}
                    </span>
                  </div>
                  <span className={`status-pill status-${b.status.toLowerCase()}`}>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="dash-panel" style={{ marginTop: 24 }}>
        <h2>Add venue</h2>
        <form className="form-grid" onSubmit={createVenue} style={{ marginTop: 16, maxWidth: 560 }}>
          <label>
            Type
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "RESTAURANT" | "HOTEL" }))}
            >
              <option value="RESTAURANT">Restaurant</option>
              <option value="HOTEL">Hotel (dining spaces)</option>
            </select>
          </label>
          <label>
            Name
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label>
            City
            <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required />
          </label>
          <label className="span-2">
            Description
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <button type="submit" className="button primary">
            + Add venue
          </button>
        </form>
      </section>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </ClientDashboardShell>
  );
}
