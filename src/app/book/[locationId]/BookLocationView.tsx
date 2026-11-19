"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TablePreviewPanel } from "@/components/luxury/TablePreviewPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { TopBar } from "@/components/TopBar";
import { FloorPlanPicker } from "@/components/FloorPlanPicker";
import { PanoramaViewer, type PanoramaViewerApi } from "@/components/PanoramaViewer";
import { TableTourPopover } from "@/components/TableTourPopover";
import { TourMiniMap } from "@/components/TourMiniMap";
import { api } from "@/lib/api";
import { mainSceneId, sceneFloorPositions, viewpointSceneForTable } from "@/lib/tourMap";
import type { PublicLocation, TableAvailability } from "@/lib/types";

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const OCCASIONS = [
  "Solo Dining",
  "Couple",
  "Family",
  "Friends",
  "Business Dining",
  "Birthday",
  "Anniversary",
  "Special Occasion",
];

type BookProps = {
  locationId: string;
  initialDate?: string;
  initialTime?: string;
  initialGuests?: string;
  initialOccasion?: string;
};

export function BookLocationView({
  locationId,
  initialDate,
  initialTime,
  initialGuests,
  initialOccasion,
}: BookProps) {
  const [location, setLocation] = useState<PublicLocation | null>(null);
  const [availability, setAvailability] = useState<TableAvailability[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popoverTableId, setPopoverTableId] = useState<string | null>(null);
  const [tourSceneId, setTourSceneId] = useState<string | null>(null);
  const panoramaApiRef = useRef<PanoramaViewerApi | null>(null);
  const [viewMode, setViewMode] = useState<"360" | "list" | "floor">("360");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    restaurant: string;
    reference: string;
    table: string;
    date: string;
    time: string;
    guests: string;
    status: string;
  } | null>(null);
  const [form, setForm] = useState({
    date: initialDate ?? tomorrowIso(),
    time: initialTime ?? "19:00",
    guests: initialGuests ?? "2",
    occasion: initialOccasion ?? "Couple",
    name: "",
    email: "",
    mobile: "",
    specialRequests: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const loadLocation = useCallback(async () => {
    const data = await api<PublicLocation>(`/api/public/locations/${locationId}`, { auth: false });
    setLocation(data);
  }, [locationId]);

  const loadAvailability = useCallback(async () => {
    const qs = new URLSearchParams({
      date: form.date,
      time: form.time,
      partySize: form.guests,
    });
    const data = await api<{ availability: TableAvailability[] }>(
      `/api/public/locations/${locationId}/availability?${qs}`,
      { auth: false }
    );
    setAvailability(data.availability);
  }, [locationId, form.date, form.time, form.guests]);

  useEffect(() => {
    loadLocation()
      .catch(() => showToast("Could not load location"))
      .finally(() => setLoading(false));
  }, [loadLocation]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      ...(initialDate ? { date: initialDate } : {}),
      ...(initialTime ? { time: initialTime } : {}),
      ...(initialGuests ? { guests: initialGuests } : {}),
      ...(initialOccasion ? { occasion: initialOccasion } : {}),
    }));
  }, [initialDate, initialTime, initialGuests, initialOccasion]);

  const sceneIdsKey = location?.scenes?.map((s) => s.id).join(",") ?? "";

  useEffect(() => {
    if (!location?.scenes?.length) return;
    const main = mainSceneId(location.scenes);
    setTourSceneId((prev) =>
      prev && location.scenes!.some((s) => s.id === prev) ? prev : main
    );
  }, [location?.id, sceneIdsKey]);

  useEffect(() => {
    if (!location?.id) return;
    loadAvailability().catch(() => showToast("Could not load availability"));
  }, [location?.id, loadAvailability]);

  const statusMap = useMemo(() => {
    const m = new Map<string, TableAvailability["status"]>();
    availability.forEach((a) => m.set(a.tableId, a.status));
    return m;
  }, [availability]);

  const selected = location?.tables.find((t) => t.id === selectedId) ?? null;

  const tourScenes = useMemo(() => {
    if (!location?.scenes?.length) return undefined;
    return location.scenes.map((s) => ({
      id: s.id,
      name: s.name,
      panoramaUrl: s.panoramaUrl,
      isMain: s.isMain,
      tableId: s.tableId,
      defaultPitch: s.defaultPitch,
      defaultYaw: s.defaultYaw,
      navHotspots: s.navFrom.map((h) => ({
        pitch: h.pitch,
        yaw: h.yaw,
        targetSceneId: h.targetSceneId,
        label: h.label,
      })),
    }));
  }, [location]);

  const activePanorama = useMemo(() => {
    if (!location) return null;
    if (tourScenes?.length) return null;
    return location.panoramaUrl;
  }, [location, tourScenes]);

  const mapScenes = useMemo(() => {
    if (!location?.scenes?.length) return [];
    const positions = sceneFloorPositions(location.scenes, location.tables);
    return location.scenes.map((s) => {
      const pos = positions.get(s.id);
      return {
        id: s.id,
        name: s.name,
        isMain: s.isMain,
        x: pos?.x ?? null,
        y: pos?.y ?? null,
      };
    });
  }, [location]);

  const mainId = location?.scenes?.length ? mainSceneId(location.scenes) : null;
  const activeViewpointScene = location?.scenes?.find((s) => s.id === tourSceneId);
  const atTableViewpoint = Boolean(activeViewpointScene?.tableId);

  const viewerTables = useMemo(() => {
    if (!location) return [];
    return location.tables.map((t) => ({
      id: t.id,
      code: t.code,
      label: t.label,
      pitch: t.pitch,
      yaw: t.yaw,
      sceneId: t.sceneId,
      minGuests: t.minGuests,
      maxGuests: t.maxGuests,
      status: (statusMap.get(t.id) === "available"
        ? selectedId === t.id
          ? "selected"
          : "available"
        : statusMap.get(t.id) ?? "reserved") as "available" | "reserved" | "unsuitable" | "neutral" | "selected",
    }));
  }, [location, statusMap, selectedId]);

  const floorTables = useMemo(() => {
    if (!location) return [];
    return location.tables.map((t) => ({
      id: t.id,
      code: t.code,
      floorX: t.floorX ?? null,
      floorY: t.floorY ?? null,
      status: (statusMap.get(t.id) === "available"
        ? selectedId === t.id
          ? "selected"
          : "available"
        : statusMap.get(t.id) ?? "reserved") as "available" | "reserved" | "unsuitable" | "neutral" | "selected",
    }));
  }, [location, statusMap, selectedId]);

  const availableCount = useMemo(
    () => availability.filter((a) => a.status === "available").length,
    [availability]
  );

  const goToScene = (sceneId: string) => {
    setTourSceneId((prev) => (prev === sceneId ? prev : sceneId));
    panoramaApiRef.current?.loadScene(sceneId);
  };

  const goToMainRoom = () => {
    if (mainId) goToScene(mainId);
  };

  const onSelect = (id: string) => {
    const status = statusMap.get(id);
    if (status !== "available") {
      showToast("That table is not available for your party or time.");
      return;
    }
    setSelectedId(id);
    setPopoverTableId(null);
  };

  const onTableMarkerClick = (id: string) => {
    setPopoverTableId(id);
  };

  const popoverTable = location?.tables.find((t) => t.id === popoverTableId) ?? null;
  const popoverStatus = popoverTableId ? statusMap.get(popoverTableId) ?? "reserved" : "reserved";

  const walkToTableView = (tableId: string) => {
    if (!location?.scenes) return;
    const sceneId = viewpointSceneForTable(location.scenes, tableId);
    if (!sceneId) {
      showToast("No walkthrough panorama uploaded for this table yet.");
      return;
    }
    setPopoverTableId(null);
    goToScene(sceneId);
  };

  const onBook = async () => {
    if (!selectedId) {
      showToast("Select an available table.");
      return;
    }
    if (!form.name.trim() || !form.mobile.trim()) {
      setDetailsOpen(true);
      showToast("Enter your name and mobile number.");
      return;
    }
    try {
      const booking = await api<{ id: string }>("/api/public/bookings", {
        method: "POST",
        auth: false,
        body: JSON.stringify({
          tableId: selectedId,
          guestName: form.name.trim(),
          guestEmail: form.email.trim(),
          guestMobile: form.mobile.trim(),
          date: form.date,
          time: form.time,
          partySize: Number(form.guests),
          occasion: form.occasion,
          specialRequests: form.specialRequests.trim(),
        }),
      });
      setConfirmation({
        restaurant: location?.venue.name ?? "SeatMe",
        reference: booking.id.slice(-8).toUpperCase(),
        table: location?.tables.find((t) => t.id === selectedId)?.code ?? "Table",
        date: form.date,
        time: form.time,
        guests: form.guests,
        status: "Confirmed",
      });
      setModalOpen(true);
      loadAvailability();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Booking failed");
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="container page-main">
          <div className="loading-shimmer">Preparing your dining experience…</div>
        </main>
      </>
    );
  }

  if (!location) {
    return (
      <>
        <TopBar />
        <main className="container empty-state" style={{ marginTop: 48 }}>
          Location not found.
        </main>
      </>
    );
  }

  const selectedStatus = selectedId ? statusMap.get(selectedId) ?? "reserved" : "reserved";
  const noTablesConfigured = location.tables.length === 0;

  return (
    <>
      <TopBar />
      <main className="container page-main booking-page">
        <section className="page-header">
          <div className="page-header-row">
            <div>
              <p className="eyebrow">
                {location.venue.name} · {location.venue.city}
              </p>
              <h1>{location.name}</h1>
              <p className="lead">Plan your evening, explore in 360°, preview your table view, and reserve.</p>
            </div>
            <span className="live-chip">360° live</span>
          </div>
          <ol className="booking-progress booking-progress-lux" aria-label="Booking steps">
            <li className="active">Restaurant</li>
            <li className="active">Date & time</li>
            <li className={viewMode === "360" || viewMode === "floor" ? "active" : ""}>Explore 360°</li>
            <li className={selectedId ? "active" : ""}>Select table</li>
            <li className={atTableViewpoint ? "active" : ""}>Table viewpoint</li>
            <li className={modalOpen ? "active" : ""}>Confirm</li>
          </ol>
        </section>

        {noTablesConfigured ? (
          <div className="booking-notice booking-notice-warn" role="status">
            <strong>No tables on this map yet</strong>
            <p>
              The 360° room is live, but the restaurant has not placed table markers. Booking opens once the venue adds
              tables in <Link href="/client/login">Restaurant login</Link> → location → click in 360° → Save table.
            </p>
          </div>
        ) : availableCount === 0 ? (
          <div className="booking-notice" role="status">
            <strong>No tables free for this date, time, and party size</strong>
            <p>Try another time or fewer guests, or pick a table from the list (gray = unavailable).</p>
          </div>
        ) : null}

        <div className="view-mode-tabs panorama-controls-float">
          <button type="button" className={viewMode === "360" ? "active" : ""} onClick={() => setViewMode("360")}>
            360° View
          </button>
          {location.floorPlanUrl && (
            <button type="button" className={viewMode === "floor" ? "active" : ""} onClick={() => setViewMode("floor")}>
              Floor plan
            </button>
          )}
          <button type="button" className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
            Table list
          </button>
          {mainId && tourSceneId && tourSceneId !== mainId && (
            <button type="button" className="button outline" onClick={goToMainRoom}>
              ← Back to main room
            </button>
          )}
        </div>

        <section className="booking-layout booking-layout-immersive">
          <div className="panel panel-royal panorama-frame booking-viewer-col">
            {viewMode === "360" ? (
              <div className="booking-viewer-stack">
                {atTableViewpoint && activeViewpointScene?.tableId && (
                  <div className="viewpoint-scene-banner" role="status">
                    <strong>
                      {location.tables.find((t) => t.id === activeViewpointScene.tableId)?.code ?? "Table"} viewpoint
                    </strong>
                    <span>Real 360° captured at this table — use arrows or tabs to explore nearby areas.</span>
                    {statusMap.get(activeViewpointScene.tableId) === "available" &&
                      selectedId !== activeViewpointScene.tableId && (
                        <button
                          type="button"
                          className="button primary small"
                          onClick={() => onSelect(activeViewpointScene.tableId!)}
                        >
                          Select this table
                        </button>
                      )}
                    {mainId && (
                      <button type="button" className="button ghost small" onClick={goToMainRoom}>
                        Main room
                      </button>
                    )}
                  </div>
                )}
                <TourMiniMap
                  floorPlanUrl={location.floorPlanUrl}
                  scenes={mapScenes}
                  activeSceneId={tourSceneId}
                  onGoToScene={goToScene}
                />
                <PanoramaViewer
                  panoramaPath={activePanorama}
                  scenes={tourScenes}
                  activeSceneId={tourSceneId ?? undefined}
                  onSceneChange={(id) => setTourSceneId((prev) => (prev === id ? prev : id))}
                  tables={viewerTables}
                  defaultPitch={location.defaultPitch}
                  defaultYaw={location.defaultYaw}
                  defaultHfov={location.defaultHfov}
                  mode="book"
                  selectedId={selectedId}
                  onTableMarkerClick={onTableMarkerClick}
                  apiRef={panoramaApiRef}
                />
                {popoverTable && (
                  <div className="table-tour-popover-anchor">
                    <TableTourPopover
                      table={popoverTable}
                      status={popoverStatus}
                      hasWalkthroughView={Boolean(
                        location.scenes && viewpointSceneForTable(location.scenes, popoverTable.id)
                      )}
                      onSelect={() => onSelect(popoverTable.id)}
                      onWalkToView={() => walkToTableView(popoverTable.id)}
                      onClose={() => setPopoverTableId(null)}
                    />
                  </div>
                )}
                {selected && viewMode === "360" && !popoverTable && (
                  <div className="lux-bottom-sheet table-preview-sheet">
                    <TablePreviewPanel
                      table={selected}
                      status={selectedStatus}
                      locationName={location.name}
                      viewingTablePanorama={atTableViewpoint && selected.id === activeViewpointScene?.tableId}
                      onViewFromTable={() => walkToTableView(selected.id)}
                      onReserve={onBook}
                      onClose={() => setSelectedId(null)}
                    />
                  </div>
                )}
              </div>
            ) : viewMode === "floor" && location.floorPlanUrl ? (
              <FloorPlanPicker
                floorPlanUrl={location.floorPlanUrl}
                tables={floorTables}
                mode="book"
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ) : (
              <ul className="table-list-select">
                {location.tables.map((t) => {
                  const st = statusMap.get(t.id) ?? "reserved";
                  const zone =
                    location.scenes?.find((s) => s.id === t.sceneId)?.name || location.name;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={`table-list-item ${selectedId === t.id ? "selected" : ""} ${st}`}
                        disabled={st !== "available"}
                        onClick={() => onSelect(t.id)}
                      >
                        <span>
                          <strong>{t.code}</strong>
                          <em className="table-list-zone">{zone}</em>
                          {t.label ? <em className="table-list-desc">{t.label}</em> : null}
                        </span>
                        <span className="table-list-meta">
                          {t.minGuests}–{t.maxGuests} guests
                          <br />
                          {st === "available" ? "Available" : st === "unsuitable" ? "Party size" : "Unavailable"}
                          {t.panoramaUrl ? " · Table preview" : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <aside className={`panel panel-royal booking-side-panel ${detailsOpen ? "open" : ""}`}>
            <button
              type="button"
              className="booking-details-toggle"
              onClick={() => setDetailsOpen((open) => !open)}
              aria-expanded={detailsOpen}
            >
              {detailsOpen ? "Hide reservation details" : "Reservation details"}
            </button>
            <h3 className="booking-panel-title">Your reservation</h3>
            <div className="form-grid" style={{ marginTop: 16 }}>
              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </label>
              <label>
                Time
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                />
              </label>
              <label>
                Guests
                <select value={form.guests} onChange={(e) => setForm((f) => ({ ...f, guests: e.target.value }))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Occasion
                <select value={form.occasion} onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))}>
                  {OCCASIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Name
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label>
                Mobile
                <input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
              </label>
              <label>
                Special requests
                <textarea
                  rows={2}
                  value={form.specialRequests}
                  onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
                />
              </label>
            </div>
            <div className="selection-box">
              {selected ? (
                <>
                  <strong>{selected.code}</strong>
                  <p className="selection-meta">
                    {(location.scenes?.find((s) => s.id === selected.sceneId)?.name || location.name)}
                    {" · "}
                    {selected.minGuests}–{selected.maxGuests} guests
                    {selected.seatingType ? ` · ${selected.seatingType}` : ""}
                  </p>
                  {selected.label ? <p className="selection-meta">{selected.label}</p> : null}
                  {selected.panoramaUrl && location.scenes && viewpointSceneForTable(location.scenes, selected.id) && (
                    <button
                      type="button"
                      className="button outline"
                      style={{ marginTop: 10 }}
                      onClick={() => walkToTableView(selected.id)}
                    >
                      Walk to table 360°
                    </button>
                  )}
                </>
              ) : (
                <p className="selection-meta">Select a table in 360° or from the list.</p>
              )}
            </div>
            <button
              type="button"
              className="button primary"
              style={{ width: "100%", marginTop: 16 }}
              disabled={!selectedId || noTablesConfigured}
              onClick={onBook}
            >
              Confirm reservation
            </button>
            <p className="form-footnote">
              <Link href={`/venues/${location.venue.id}`}>← Back to venue</Link>
            </p>
          </aside>
        </section>
      </main>

      <div className="mobile-reserve-bar">
        <div className="mobile-reserve-inner">
          <div>
            <strong>{selected ? `Table ${selected.code}` : "Select a table"}</strong>
            <span>
              {form.date} · {form.time} · {form.guests} guests
            </span>
          </div>
          <button
            type="button"
            className="button primary"
            disabled={!selectedId || noTablesConfigured}
            onClick={onBook}
          >
            Confirm
          </button>
        </div>
      </div>

      <SiteFooter />

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
      {modalOpen && confirmation && (
        <div
          className="modal open"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal-card confirmation-luxury">
            <div className="success-icon">✓</div>
            <p className="eyebrow">Reservation confirmed</p>
            <h3>{confirmation.restaurant}</h3>
            <dl className="confirmation-details">
              <div>
                <dt>Booking reference</dt>
                <dd className="confirmation-ref">{confirmation.reference}</dd>
              </div>
              <div>
                <dt>Table</dt>
                <dd>{confirmation.table}</dd>
              </div>
              <div>
                <dt>Date & time</dt>
                <dd>
                  {confirmation.date} at {confirmation.time}
                </dd>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>{confirmation.guests}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{confirmation.status}</dd>
              </div>
            </dl>
            <p className="form-footnote">No payment has been taken. The restaurant will honour this reservation.</p>
            <button
              type="button"
              className="button primary"
              onClick={() => {
                setModalOpen(false);
                setConfirmation(null);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
