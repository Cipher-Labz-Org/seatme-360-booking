"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientDashboardShell } from "@/components/client/ClientDashboardShell";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth-storage";

type Location = {
  id: string;
  name: string;
  description: string;
  panoramaUrl: string | null;
  _count: { tables: number };
};

export function ClientVenueView({ id }: { id: string }) {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const load = () => api<Location[]>(`/api/client/venues/${id}/locations`).then(setLocations);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "CLIENT") {
      router.replace("/client/login");
      return;
    }
    load().catch(() => showToast("Failed to load locations"));
  }, [id, router]);

  const addLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api(`/api/client/venues/${id}/locations`, { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", description: "" });
      showToast("Location added");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <ClientDashboardShell title="Dining locations" subtitle="Each location supports multi-scene 360°, floor plans, and table hotspots.">
        <div className="dash-inline-links">
          <Link href="/client">← All venues</Link>
          <Link href={`/client/venues/${id}/content`}>Venue page content</Link>
        </div>

        <form className="panel form-grid" onSubmit={addLocation} style={{ marginTop: 16, maxWidth: 480 }}>
          <label>
            Location name
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label>
            Description
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <button type="submit" className="button primary">
            + Add location
          </button>
        </form>

        <div className="restaurant-grid" style={{ marginTop: 24 }}>
          {locations.map((loc) => (
            <Link key={loc.id} className="restaurant-card" href={`/client/locations/${loc.id}`}>
              <div className="restaurant-body">
                <h3>{loc.name}</h3>
                <p className="lead" style={{ fontSize: 14 }}>
                  {loc.description || "Configure 360° and tables"}
                </p>
                <div className="restaurant-meta">
                  <span>{loc._count.tables} tables</span>
                  {loc.panoramaUrl && (
                    <>
                      <span>•</span>
                      <span>Panorama uploaded</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </ClientDashboardShell>
  );
}
