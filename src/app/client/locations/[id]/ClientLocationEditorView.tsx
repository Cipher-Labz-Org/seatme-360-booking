"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PanoramaViewerApi } from "@/components/PanoramaViewer";
import { ClientDashboardShell } from "@/components/client/ClientDashboardShell";
import { FloorPlanPicker } from "@/components/FloorPlanPicker";
import { PanoramaViewer } from "@/components/PanoramaViewer";
import { API_URL } from "@/lib/config";
import { api } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth-storage";
import type { TableSpot } from "@/lib/types";
import {
  formatMb,
  MAX_PANORAMA_UPLOAD_BYTES,
  MAX_PANORAMA_UPLOAD_MB,
} from "@/lib/upload-limits";

type LocationDetail = {
  id: string;
  name: string;
  panoramaUrl: string | null;
  floorPlanUrl?: string | null;
  defaultPitch: number;
  defaultYaw: number;
  defaultHfov: number;
};

type EditorScene = {
  id: string;
  name: string;
  panoramaUrl: string;
  navFrom: { id: string; targetSceneId: string; pitch: number; yaw: number; label: string }[];
};

export function ClientLocationEditorView({ id }: { id: string }) {
  const router = useRouter();
  const [location, setLocation] = useState<LocationDetail | null>(null);
  const [scenes, setScenes] = useState<EditorScene[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [placeMode, setPlaceMode] = useState<"table" | "nav">("table");
  const [tables, setTables] = useState<TableSpot[]>([]);
  const [pendingCoords, setPendingCoords] = useState<{ pitch: number; yaw: number } | null>(null);
  const [tableForm, setTableForm] = useState({ code: "", label: "", minGuests: "2", maxGuests: "4" });
  const [navForm, setNavForm] = useState({ targetSceneId: "", label: "Walk through →" });
  const [newSceneName, setNewSceneName] = useState("");
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  const [floorEditTableId, setFloorEditTableId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const panoramaApiRef = useRef<PanoramaViewerApi | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const loadTables = () => api<TableSpot[]>(`/api/client/locations/${id}/tables`).then(setTables);

  const loadScenes = () =>
    api<EditorScene[]>(`/api/client/locations/${id}/scenes`).then((list) => {
      setScenes(list);
      setActiveSceneId((prev) => (prev && list.some((s) => s.id === prev) ? prev : list[0]?.id ?? null));
      if (list.length > 1 && !navForm.targetSceneId) {
        setNavForm((f) => ({ ...f, targetSceneId: list[1]?.id ?? list[0]?.id ?? "" }));
      }
    });

  const loadLocation = useCallback(async () => {
    const pub = await api<LocationDetail & { venue: unknown }>(`/api/public/locations/${id}`, { auth: false });
    setLocation({
      id: pub.id,
      name: pub.name,
      panoramaUrl: pub.panoramaUrl,
      floorPlanUrl: pub.floorPlanUrl ?? null,
      defaultPitch: pub.defaultPitch,
      defaultYaw: pub.defaultYaw,
      defaultHfov: pub.defaultHfov,
    });
    setFloorPlanUrl(pub.floorPlanUrl ?? null);
  }, [id]);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "CLIENT") {
      router.replace("/client/login");
      return;
    }
    Promise.all([loadLocation(), loadTables(), loadScenes()]).catch(() => showToast("Failed to load"));
  }, [id, router, loadLocation]);

  const uploadPanorama = async (file: File) => {
    if (file.size > MAX_PANORAMA_UPLOAD_BYTES) {
      throw new Error(
        `File is ${formatMb(file.size)} MB. Maximum is ${MAX_PANORAMA_UPLOAD_MB} MB. Export a smaller JPG or compress the panorama.`
      );
    }
    const fd = new FormData();
    fd.append("file", file);
    const token = getToken();
    const res = await fetch(`${API_URL}/api/client/locations/${id}/panorama`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Upload failed");
    }
    const updated = await res.json();
    setLocation((l) => (l ? { ...l, panoramaUrl: updated.panoramaUrl } : l));
    await loadScenes();
    showToast("Panorama uploaded — click inside the 360° view below to place a table");
  };

  const addScene = async (file: File) => {
    if (file.size > MAX_PANORAMA_UPLOAD_BYTES) {
      throw new Error(`Max ${MAX_PANORAMA_UPLOAD_MB} MB per panorama.`);
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", newSceneName.trim() || "New area");
    const token = getToken();
    const res = await fetch(`${API_URL}/api/client/locations/${id}/scenes`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Upload failed");
    }
    setNewSceneName("");
    await loadScenes();
    showToast("New tour scene added — add gold navigation links between areas");
  };

  const onPlace = useCallback(
    (pitch: number, yaw: number) => {
      if (placeMode === "nav") {
        setPendingCoords({ pitch, yaw });
        showToast("Tour link position captured — choose target scene and Save tour link");
        return;
      }
      setPendingCoords({ pitch, yaw });
      showToast("Table position captured — now press Save table");
    },
    [placeMode]
  );

  const saveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingCoords) {
      showToast("Click inside the 360° view to place a table first");
      return;
    }
    try {
      await api(`/api/client/locations/${id}/tables`, {
        method: "POST",
        body: JSON.stringify({
          code: tableForm.code,
          label: tableForm.label,
          minGuests: Number(tableForm.minGuests),
          maxGuests: Number(tableForm.maxGuests),
          pitch: pendingCoords.pitch,
          yaw: pendingCoords.yaw,
          sceneId: activeSceneId,
        }),
      });
      setTableForm({ code: "", label: "", minGuests: "2", maxGuests: "4" });
      setPendingCoords(null);
      showToast("Table saved");
      loadTables();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    }
  };

  const saveNavHotspot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSceneId || !pendingCoords) {
      showToast("Click in the 360° view to place a tour link first");
      return;
    }
    if (!navForm.targetSceneId || navForm.targetSceneId === activeSceneId) {
      showToast("Choose a different target scene");
      return;
    }
    try {
      await api(`/api/client/scenes/${activeSceneId}/nav-hotspots`, {
        method: "POST",
        body: JSON.stringify({
          pitch: pendingCoords.pitch,
          yaw: pendingCoords.yaw,
          targetSceneId: navForm.targetSceneId,
          label: navForm.label,
        }),
      });
      setPendingCoords(null);
      showToast("Tour navigation link saved");
      loadScenes();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed");
    }
  };

  const deleteNavHotspot = async (hotspotId: string) => {
    await api(`/api/client/nav-hotspots/${hotspotId}`, { method: "DELETE" });
    loadScenes();
    showToast("Tour link removed");
  };

  const deleteTable = async (tableId: string) => {
    await api(`/api/client/tables/${tableId}`, { method: "DELETE" });
    loadTables();
    showToast("Table removed");
  };

  const uploadFloorPlan = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const token = getToken();
    const res = await fetch(`${API_URL}/api/client/locations/${id}/floor-plan`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Upload failed");
    }
    const updated = await res.json();
    setFloorPlanUrl(updated.floorPlanUrl);
    showToast("Floor plan uploaded");
  };

  const placeOnFloorPlan = async (tableId: string, x: number, y: number) => {
    await api(`/api/client/tables/${tableId}`, {
      method: "PATCH",
      body: JSON.stringify({ floorX: x, floorY: y }),
    });
    loadTables();
    showToast("Floor position saved");
  };

  const viewerScenes = useMemo(
    () =>
      scenes.length
        ? scenes.map((s) => ({
            id: s.id,
            name: s.name,
            panoramaUrl: s.panoramaUrl,
            navHotspots: s.navFrom.map((h) => ({
              pitch: h.pitch,
              yaw: h.yaw,
              targetSceneId: h.targetSceneId,
              label: h.label,
            })),
          }))
        : undefined,
    [scenes]
  );

  const viewerTables = useMemo(
    () =>
      tables.map((t) => ({
        id: t.id,
        code: t.code,
        pitch: t.pitch,
        yaw: t.yaw,
        sceneId: t.sceneId,
        status: "neutral" as const,
      })),
    [tables]
  );

  const captureLookAt = () => {
    const look = panoramaApiRef.current?.getLookAt();
    if (!look) {
      showToast("360° still loading — scroll up, wait for the image, then click the view or try again");
      document.getElementById("panorama-studio")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPendingCoords(look);
    showToast("Table position captured — now press Save table");
  };

  const uploadTablePanorama = async (tableId: string, file: File) => {
    if (file.size > MAX_PANORAMA_UPLOAD_BYTES) {
      throw new Error(`Max ${MAX_PANORAMA_UPLOAD_MB} MB per panorama.`);
    }
    const fd = new FormData();
    fd.append("file", file);
    const token = getToken();
    const res = await fetch(`${API_URL}/api/client/tables/${tableId}/panorama`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Upload failed");
    }
    loadTables();
    showToast("Table 360° view uploaded");
  };

  return (
    <ClientDashboardShell
      title={`${location?.name ?? "Location"} · 360° studio`}
      subtitle="Upload panoramas, link tour scenes, map tables on the floor plan, and set table-specific views."
    >
        <div className="dash-inline-links">
          <Link href="/client">← Overview</Link>
          <Link href={`/book/${id}`}>Preview booking ↗</Link>
        </div>

        <div className="panel" style={{ marginTop: 16 }}>
          <h3>360° scenes</h3>
          <p className="upload-hint" style={{ marginTop: 8 }}>
            First upload is your main room. Add more scenes for bar, terrace, private dining — then link them with tour
            navigation hotspots.
          </p>
          <label className="upload-field" style={{ marginTop: 12 }}>
            Main / replace primary panorama
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadPanorama(file).catch((err) => showToast(err.message));
                e.target.value = "";
              }}
            />
          </label>
          <div className="form-grid" style={{ maxWidth: 480, marginTop: 12 }}>
            <label>
              New scene name
              <input value={newSceneName} onChange={(e) => setNewSceneName(e.target.value)} placeholder="e.g. Terrace" />
            </label>
            <label>
              Add another scene (panorama file)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addScene(file).catch((err) => showToast(err.message));
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <span className="upload-hint">
            JPG or PNG · up to {MAX_PANORAMA_UPLOAD_MB} MB. Recommended 2:1 equirectangular (e.g. 8192×4096).
          </span>
          <div className="panorama-frame" id="panorama-studio">
            <PanoramaViewer
              panoramaPath={scenes.length ? null : (location?.panoramaUrl ?? null)}
              scenes={viewerScenes}
              activeSceneId={activeSceneId ?? undefined}
              onSceneChange={setActiveSceneId}
              tables={viewerTables}
              defaultPitch={location?.defaultPitch}
              defaultYaw={location?.defaultYaw}
              defaultHfov={location?.defaultHfov}
              mode="edit"
              onPlace={onPlace}
              apiRef={panoramaApiRef}
            />
          </div>
          {!location?.panoramaUrl && !scenes.length && (
            <p className="booking-notice" style={{ marginTop: 12 }}>
              Upload a panorama above first — then click inside the 360° image to mark where this table sits.
            </p>
          )}
        </div>

        <div className="panel" style={{ marginTop: 24 }}>
          <h3>Floor plan (optional)</h3>
          <p className="upload-hint">Upload a top-down layout — guests can pick tables on the plan or in 360°.</p>
          <label className="upload-field" style={{ marginTop: 12 }}>
            Floor plan image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFloorPlan(file).catch((err) => showToast(err.message));
                e.target.value = "";
              }}
            />
          </label>
          {floorPlanUrl && (
            <div className="panorama-frame" style={{ marginTop: 12 }}>
              <FloorPlanPicker
                floorPlanUrl={floorPlanUrl}
                tables={tables.map((t) => ({
                  id: t.id,
                  code: t.code,
                  floorX: t.floorX ?? null,
                  floorY: t.floorY ?? null,
                  status: floorEditTableId === t.id ? "selected" : "neutral",
                }))}
                mode="edit"
                selectedId={floorEditTableId}
                onSelect={setFloorEditTableId}
                onPlace={placeOnFloorPlan}
              />
            </div>
          )}
        </div>

        <div className="view-mode-tabs" style={{ marginTop: 16 }}>
          <button type="button" className={placeMode === "table" ? "active" : ""} onClick={() => setPlaceMode("table")}>
            Place table
          </button>
          <button
            type="button"
            className={placeMode === "nav" ? "active" : ""}
            onClick={() => setPlaceMode("nav")}
            disabled={scenes.length < 2}
          >
            Place tour link
          </button>
        </div>

        <div className="booking-layout">
          {placeMode === "table" ? (
          <form className="panel form-grid" onSubmit={saveTable}>
            <h3>Add table hotspot</h3>
            {!pendingCoords && (
              <div className="booking-notice booking-notice-warn">
                <strong>Step 1 — mark the table in 360°</strong>
                <p>
                  Scroll up to the panorama, <strong>click</strong> where guests should tap the table, then save. Or use
                  the button below after you point the camera at the table.
                </p>
                <button
                  type="button"
                  className="button outline"
                  style={{ marginTop: 10 }}
                  onClick={() => document.getElementById("panorama-studio")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Go to 360° viewer
                </button>
              </div>
            )}
            {pendingCoords && (
              <p style={{ fontSize: 13, color: "var(--muted)" }}>
                Position: pitch {pendingCoords.pitch.toFixed(1)}, yaw {pendingCoords.yaw.toFixed(1)}
              </p>
            )}
            <button type="button" className="button ghost" onClick={captureLookAt}>
              Use current 360° view direction
            </button>
            <label>
              Table code
              <input value={tableForm.code} onChange={(e) => setTableForm((f) => ({ ...f, code: e.target.value }))} required />
            </label>
            <label>
              Label
              <input value={tableForm.label} onChange={(e) => setTableForm((f) => ({ ...f, label: e.target.value }))} />
            </label>
            <label>
              Min guests
              <input
                type="number"
                min={1}
                value={tableForm.minGuests}
                onChange={(e) => setTableForm((f) => ({ ...f, minGuests: e.target.value }))}
              />
            </label>
            <label>
              Max guests
              <input
                type="number"
                min={1}
                value={tableForm.maxGuests}
                onChange={(e) => setTableForm((f) => ({ ...f, maxGuests: e.target.value }))}
              />
            </label>
            <button type="submit" className="button primary">
              Save table
            </button>
          </form>
          ) : (
            <form className="panel form-grid" onSubmit={saveNavHotspot}>
              <h3>Tour navigation link</h3>
              <p className="upload-hint">Click in the 360° view where guests should tap to walk to another scene.</p>
              {pendingCoords && (
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  Position: pitch {pendingCoords.pitch.toFixed(1)}, yaw {pendingCoords.yaw.toFixed(1)}
                </p>
              )}
              <label>
                Target scene
                <select
                  value={navForm.targetSceneId}
                  onChange={(e) => setNavForm((f) => ({ ...f, targetSceneId: e.target.value }))}
                  required
                >
                  <option value="">Select…</option>
                  {scenes
                    .filter((s) => s.id !== activeSceneId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Label
                <input value={navForm.label} onChange={(e) => setNavForm((f) => ({ ...f, label: e.target.value }))} />
              </label>
              <button type="submit" className="button primary">
                Save tour link
              </button>
            </form>
          )}

          <div className="panel">
            <h3>Tables</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Guests</th>
                    <th>Table 360°</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {tables.map((t) => (
                    <tr key={t.id}>
                      <td>{t.code}</td>
                      <td>
                        {t.minGuests}–{t.maxGuests}
                      </td>
                      <td>
                        <label className="upload-hint" style={{ cursor: "pointer" }}>
                          {t.panoramaUrl ? "Replace view" : "Upload view"}
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadTablePanorama(t.id, file).catch((err) => showToast(err.message));
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </td>
                      <td>
                        <button type="button" className="button ghost" onClick={() => deleteTable(t.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link className="button ghost" style={{ marginTop: 16, display: "inline-flex" }} href={`/book/${id}`}>
              Preview guest booking →
            </Link>
            {scenes.length > 0 && (
              <>
                <h3 style={{ marginTop: 24 }}>Tour links (this scene)</h3>
                <ul className="venue-cms-menu-list">
                  {(scenes.find((s) => s.id === activeSceneId)?.navFrom ?? []).map((h) => {
                    const target = scenes.find((s) => s.id === h.targetSceneId);
                    return (
                      <li key={h.id}>
                        <span>
                          → {target?.name ?? h.targetSceneId} ({h.label || "link"})
                        </span>
                        <button type="button" className="button ghost small" onClick={() => deleteNavHotspot(h.id)}>
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </ClientDashboardShell>
  );
}
