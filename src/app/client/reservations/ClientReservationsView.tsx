"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ClientDashboardShell } from "@/components/client/ClientDashboardShell";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth-storage";

const STATUSES = ["PENDING", "CONFIRMED", "SEATED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

type Booking = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestMobile: string;
  date: string;
  time: string;
  partySize: number;
  occasion: string;
  status: (typeof STATUSES)[number];
  table: { code: string; location: { name: string; venue: { name: string } } };
};

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ClientReservationsView() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [view, setView] = useState<"timeline" | "table">("timeline");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const weekStart = todayIso();
  const weekEnd = addDays(weekStart, 6);

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ from: weekStart, to: weekEnd });
    if (statusFilter) qs.set("status", statusFilter);
    const data = await api<Booking[]>(`/api/client/bookings?${qs}`);
    setBookings(data);
  }, [weekStart, weekEnd, statusFilter]);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "CLIENT") {
      router.replace("/client/login");
      return;
    }
    load().catch(() => showToast("Could not load reservations"));
  }, [router, load]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const countsByDay = useMemo(() => {
    const m = new Map<string, number>();
    weekDays.forEach((d) => m.set(d, 0));
    bookings.forEach((b) => {
      if (m.has(b.date)) m.set(b.date, (m.get(b.date) ?? 0) + 1);
    });
    return m;
  }, [bookings, weekDays]);

  const dayBookings = useMemo(() => bookings.filter((b) => b.date === selectedDate), [bookings, selectedDate]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api(`/api/client/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      showToast("Status updated");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed");
    }
  };

  const sorted = useMemo(
    () => [...dayBookings].sort((a, b) => a.time.localeCompare(b.time)),
    [dayBookings]
  );

  return (
    <ClientDashboardShell title="Reservations" subtitle="Calendar, service timeline, and live status for every cover.">
      <div className="res-calendar-strip">
        {weekDays.map((d) => (
          <button
            key={d}
            type="button"
            className={`res-cal-day ${d === selectedDate ? "active" : ""}`}
            onClick={() => setSelectedDate(d)}
          >
            <span>{new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" })}</span>
            <strong>{d.slice(8)}</strong>
            <small>{countsByDay.get(d) ?? 0} bookings</small>
          </button>
        ))}
      </div>

      <div className="res-toolbar">
        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Active (non-cancelled)</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="view-mode-tabs">
          <button type="button" className={view === "timeline" ? "active" : ""} onClick={() => setView("timeline")}>
            Timeline
          </button>
          <button type="button" className={view === "table" ? "active" : ""} onClick={() => setView("table")}>
            Table
          </button>
        </div>
      </div>

      {view === "timeline" ? (
        <ul className="res-timeline">
          {sorted.length === 0 ? (
            <li className="empty-state">No reservations for this day.</li>
          ) : (
            sorted.map((b) => (
              <li key={b.id}>
                <time>{b.time}</time>
                <div className="res-timeline-body">
                  <strong>{b.guestName}</strong>
                  <span>
                    {b.partySize} guests · Table {b.table.code} · {b.table.location.name} · {b.table.location.venue.name}
                  </span>
                  {b.occasion && <span className="res-occasion">{b.occasion}</span>}
                  <span className="res-contact">
                    {b.guestMobile}
                    {b.guestEmail ? ` · ${b.guestEmail}` : ""}
                  </span>
                </div>
                <select
                  className="res-status-select"
                  value={b.status}
                  onChange={(e) => updateStatus(b.id, e.target.value)}
                  aria-label={`Status for ${b.guestName}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </li>
            ))
          )}
        </ul>
      ) : (
        <div className="table-wrap dash-panel" style={{ marginTop: 16 }}>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Guest</th>
                <th>Party</th>
                <th>Table</th>
                <th>Venue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)" }}>
                    No reservations for this day.
                  </td>
                </tr>
              ) : (
                sorted.map((b) => (
                  <tr key={b.id}>
                    <td>{b.time}</td>
                    <td>
                      {b.guestName}
                      <br />
                      <small>{b.guestMobile}</small>
                    </td>
                    <td>{b.partySize}</td>
                    <td>
                      {b.table.code} · {b.table.location.name}
                    </td>
                    <td>{b.table.location.venue.name}</td>
                    <td>
                      <select value={b.status} onChange={(e) => updateStatus(b.id, e.target.value)}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </ClientDashboardShell>
  );
}
