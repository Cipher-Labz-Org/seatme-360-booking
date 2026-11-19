"use client";

import { useEffect, useRef, useState } from "react";
import { assetUrl } from "@/lib/config";
import "pannellum/build/pannellum.css";

export type ViewerTable = {
  id: string;
  code: string;
  label?: string;
  pitch: number;
  yaw: number;
  sceneId?: string | null;
  minGuests?: number;
  maxGuests?: number;
  status?: "available" | "reserved" | "unsuitable" | "neutral" | "selected";
};

export type ViewerScene = {
  id: string;
  name: string;
  panoramaUrl: string;
  isMain?: boolean;
  tableId?: string | null;
  defaultPitch?: number | null;
  defaultYaw?: number | null;
  navHotspots: { pitch: number; yaw: number; targetSceneId: string; label: string }[];
};

type Props = {
  panoramaPath?: string | null;
  scenes?: ViewerScene[];
  activeSceneId?: string;
  onSceneChange?: (sceneId: string) => void;
  tables: ViewerTable[];
  defaultPitch?: number;
  defaultYaw?: number;
  defaultHfov?: number;
  mode: "book" | "edit";
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Booking mode: open table details popover instead of selecting immediately. */
  onTableMarkerClick?: (id: string) => void;
  onPlace?: (pitch: number, yaw: number) => void;
  apiRef?: React.MutableRefObject<PanoramaViewerApi | null>;
  sceneFadeMs?: number;
};

type PannellumViewer = {
  destroy: () => void;
  on: (event: string, fn: (...args: unknown[]) => void) => void;
  mouseEventToCoords: (ev: MouseEvent) => [number, number];
  loadScene?: (sceneId: string, pitch?: number, yaw?: number, hfov?: number) => void;
  getPitch?: () => number;
  getYaw?: () => number;
};

export type PanoramaViewerApi = {
  getLookAt: () => { pitch: number; yaw: number } | null;
  isReady: () => boolean;
  loadScene: (sceneId: string) => void;
};

function loadPannellumScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.pannellum) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-pannellum="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load 360 viewer")));
      return;
    }
    const script = document.createElement("script");
    script.src = "/vendor/pannellum.js";
    script.dataset.pannellum = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("360 viewer script missing. Run npm install in frontend."));
    document.body.appendChild(script);
  });
}

function preloadPanorama(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (url.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve();
    img.onerror = () =>
      reject(
        new Error(
          "Panorama image could not load. Restart backend & frontend (npm run dev), then upload again."
        )
      );
    img.src = url;
  });
}

declare global {
  interface Window {
    pannellum?: {
      viewer: (id: string, config: Record<string, unknown>) => PannellumViewer;
    };
  }
}

function tablesForScene(scene: ViewerScene, scenes: ViewerScene[], tables: ViewerTable[]) {
  if (scene.tableId) return [];
  const firstId = scenes.find((s) => s.isMain)?.id ?? scenes[0]?.id;
  return tables.filter((t) => {
    if (!t.sceneId) {
      return scenes.length <= 1 || scene.id === firstId;
    }
    return t.sceneId === scene.id;
  });
}

export function PanoramaViewer({
  panoramaPath,
  scenes,
  activeSceneId,
  onSceneChange,
  tables,
  defaultPitch = -4,
  defaultYaw = 45,
  defaultHfov = 105,
  mode,
  selectedId,
  onSelect,
  onTableMarkerClick,
  onPlace,
  apiRef,
  sceneFadeMs = 900,
}: Props) {
  const containerId = useRef(`panorama-${Math.random().toString(36).slice(2)}`);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const onSelectRef = useRef(onSelect);
  const onTableMarkerClickRef = useRef(onTableMarkerClick);
  const onPlaceRef = useRef(onPlace);
  const onSceneChangeRef = useRef(onSceneChange);
  const modeRef = useRef(mode);
  const loadedSceneRef = useRef<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sceneTransition, setSceneTransition] = useState(false);

  onSelectRef.current = onSelect;
  onTableMarkerClickRef.current = onTableMarkerClick;
  onPlaceRef.current = onPlace;
  onSceneChangeRef.current = onSceneChange;
  modeRef.current = mode;

  const useMultiScene = !!scenes && scenes.length > 0;
  const resolvedActiveId = useMultiScene
    ? activeSceneId && scenes!.some((s) => s.id === activeSceneId)
      ? activeSceneId
      : scenes!.find((s) => s.isMain)?.id ?? scenes![0].id
    : null;

  const tablesKey = tables
    .map((t) => `${t.id}:${t.status}:${t.pitch}:${t.yaw}:${t.sceneId}:${t.minGuests}:${t.maxGuests}`)
    .join("|");
  const scenesKey = useMultiScene
    ? scenes!.map((s) => `${s.id}:${s.panoramaUrl}:${s.navHotspots.length}:${s.isMain}:${s.tableId}`).join("|")
    : "";

  useEffect(() => {
    if (!useMultiScene && !panoramaPath) {
      setStatus("idle");
      return;
    }
    if (useMultiScene && scenes!.length === 0) {
      setStatus("idle");
      return;
    }

    const urls = useMultiScene
      ? (scenes!.map((s) => assetUrl(s.panoramaUrl)).filter(Boolean) as string[])
      : ([assetUrl(panoramaPath!)].filter(Boolean) as string[]);

    if (urls.length === 0) return;

    let cancelled = false;
    setStatus("loading");
    setErrorMsg("");

    (async () => {
      try {
        await loadPannellumScript();
        await Promise.all(urls.map((u) => preloadPanorama(u)));
        if (cancelled || !window.pannellum) return;

        viewerRef.current?.destroy();

        const hotspotElement = (
          div: HTMLDivElement,
          args: { id: string; code: string; status: string; minGuests?: number; maxGuests?: number }
        ) => {
          div.classList.add("table-hotspot", args.status);
          div.dataset.label = args.code;
          div.setAttribute("role", "button");
          div.setAttribute("aria-label", `Table ${args.code}`);
          if (args.minGuests != null && args.maxGuests != null) {
            div.dataset.guests = `${args.minGuests}-${args.maxGuests}`;
          }
          div.addEventListener("click", (e) => {
            e.stopPropagation();
            if (modeRef.current !== "book") return;
            if (onTableMarkerClickRef.current) onTableMarkerClickRef.current(args.id);
            else if (onSelectRef.current) onSelectRef.current(args.id);
          });
        };

        let config: Record<string, unknown>;

        if (useMultiScene && scenes) {
          const startId =
            activeSceneId && scenes.some((s) => s.id === activeSceneId)
              ? activeSceneId
              : scenes.find((s) => s.isMain)?.id ?? scenes[0].id;
          const sceneMap: Record<string, unknown> = {};
          for (const scene of scenes) {
            const pano = assetUrl(scene.panoramaUrl)!;
            const sceneTables = tablesForScene(scene, scenes, tables);
            sceneMap[scene.id] = {
              type: "equirectangular",
              panorama: pano,
              ...(pano.startsWith("http") ? { crossOrigin: "anonymous" } : {}),
              pitch: scene.defaultPitch ?? defaultPitch,
              yaw: scene.defaultYaw ?? defaultYaw,
              hfov: defaultHfov,
              hotSpots: [
                ...sceneTables.map((t) => ({
                  pitch: t.pitch,
                  yaw: t.yaw,
                  cssClass: `table-hotspot ${t.status === "selected" ? "selected" : (t.status ?? "neutral")}`,
                  createTooltipFunc: hotspotElement,
                  createTooltipArgs: {
                    id: t.id,
                    code: t.code,
                    status: t.status ?? "neutral",
                    minGuests: t.minGuests,
                    maxGuests: t.maxGuests,
                  },
                })),
                ...scene.navHotspots.map((h) => ({
                  pitch: h.pitch,
                  yaw: h.yaw,
                  type: "scene",
                  sceneId: h.targetSceneId,
                  text: h.label || "Walk →",
                  cssClass: "scene-nav-hotspot scene-nav-arrow",
                })),
              ],
            };
          }
          config = {
            default: {
              firstScene: startId,
              sceneFadeDuration: sceneFadeMs,
              pitch: defaultPitch,
              yaw: defaultYaw,
              hfov: defaultHfov,
              autoLoad: true,
              autoRotate: mode === "book" ? -2 : 0,
              autoRotateInactivityDelay: 3500,
              compass: true,
              showZoomCtrl: true,
              showFullscreenCtrl: true,
            },
            scenes: sceneMap,
          };
        } else {
          const url = assetUrl(panoramaPath!)!;
          config = {
            type: "equirectangular",
            panorama: url,
            autoLoad: true,
            autoRotate: mode === "book" ? -2 : 0,
            autoRotateInactivityDelay: 3500,
            compass: true,
            showZoomCtrl: true,
            showFullscreenCtrl: true,
            pitch: defaultPitch,
            yaw: defaultYaw,
            hfov: defaultHfov,
            hotSpots: tables.map((t) => ({
              pitch: t.pitch,
              yaw: t.yaw,
              cssClass: `table-hotspot ${t.status === "selected" ? "selected" : (t.status ?? "neutral")}`,
              createTooltipFunc: hotspotElement,
              createTooltipArgs: {
                id: t.id,
                code: t.code,
                status: t.status ?? "neutral",
                minGuests: t.minGuests,
                maxGuests: t.maxGuests,
              },
            })),
          };
          if (url.startsWith("http")) {
            config.crossOrigin = "anonymous";
          }
        }

        viewerRef.current = window.pannellum.viewer(containerId.current, config);

        viewerRef.current.on("load", () => {
          if (!cancelled) {
            setStatus("ready");
            setSceneTransition(false);
            if (useMultiScene && scenes) {
              const current =
                activeSceneId && scenes.some((s) => s.id === activeSceneId)
                  ? activeSceneId
                  : scenes.find((s) => s.isMain)?.id ?? scenes[0]?.id;
              if (current) loadedSceneRef.current = current;
            }
            if (apiRef) {
              apiRef.current = {
                isReady: () => true,
                getLookAt: () => {
                  const v = viewerRef.current;
                  if (!v?.getPitch || !v.getYaw) return null;
                  return { pitch: v.getPitch(), yaw: v.getYaw() };
                },
                loadScene: (sceneId: string) => {
                  if (loadedSceneRef.current === sceneId) return;
                  loadedSceneRef.current = sceneId;
                  viewerRef.current?.loadScene?.(sceneId);
                },
              };
            }
          }
        });
        viewerRef.current.on("error", (msg: unknown) => {
          if (!cancelled) {
            setStatus("error");
            setSceneTransition(false);
            setErrorMsg(typeof msg === "string" ? msg : "Panorama failed to render.");
          }
        });
        viewerRef.current.on("scenechange", (...args: unknown[]) => {
          const raw = args[0];
          const nextId =
            typeof raw === "string" ? raw : (raw as { sceneId?: string } | undefined)?.sceneId;
          if (!nextId) return;
          if (loadedSceneRef.current === nextId) return;
          loadedSceneRef.current = nextId;
          setSceneTransition(true);
          onSceneChangeRef.current?.(nextId);
        });

        if (mode === "edit") {
          const placeFromEvent = (...args: unknown[]) => {
            const event = args[0] as MouseEvent;
            if (event.button !== 0) return;
            const coords = viewerRef.current!.mouseEventToCoords(event);
            onPlaceRef.current?.(coords[0], coords[1]);
          };
          viewerRef.current.on("mousedown", placeFromEvent);
          viewerRef.current.on("mouseup", placeFromEvent);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err instanceof Error ? err.message : "Failed to start 360° view");
        }
      }
    })();

    return () => {
      cancelled = true;
      loadedSceneRef.current = null;
      if (apiRef) apiRef.current = null;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [
    panoramaPath,
    useMultiScene,
    scenesKey,
    tablesKey,
    defaultPitch,
    defaultYaw,
    defaultHfov,
    mode,
    sceneFadeMs,
  ]);

  useEffect(() => {
    if (!useMultiScene || !resolvedActiveId || !viewerRef.current?.loadScene) return;
    if (status !== "ready") return;
    if (loadedSceneRef.current === resolvedActiveId) return;
    loadedSceneRef.current = resolvedActiveId;
    viewerRef.current.loadScene(resolvedActiveId);
  }, [resolvedActiveId, useMultiScene, status]);

  const showEmpty = !useMultiScene && !panoramaPath;

  if (showEmpty) {
    return (
      <div className="panorama-empty">
        <span className="degree-badge">360°</span>
        <strong>No panorama yet</strong>
        <small>Upload a 2:1 equirectangular image — the interactive view will appear here.</small>
      </div>
    );
  }

  return (
    <div className="panorama-viewer-wrap">
      {useMultiScene && scenes && scenes.length > 1 && (
        <div className="scene-tabs" role="tablist" aria-label="Tour viewpoints">
          {scenes
            .filter((s) => !s.tableId)
            .concat(scenes.filter((s) => s.tableId))
            .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
            .map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === resolvedActiveId}
                className={`scene-tab ${s.id === resolvedActiveId ? "active" : ""}`}
                onClick={() => {
                  if (loadedSceneRef.current === s.id) return;
                  loadedSceneRef.current = s.id;
                  setSceneTransition(true);
                  onSceneChange?.(s.id);
                  viewerRef.current?.loadScene?.(s.id);
                }}
              >
                {s.name}
              </button>
            ))}
        </div>
      )}
      {(status === "loading" || sceneTransition) && (
        <div className="panorama-status overlay" aria-live="polite">
          {status === "loading" ? "Loading 360° view…" : "Moving to next viewpoint…"}
        </div>
      )}
      {status === "error" && (
        <div className="panorama-empty">
          <strong>Could not open panorama</strong>
          <small>{errorMsg}</small>
        </div>
      )}
      <div
        id={containerId.current}
        className="panorama-host"
        style={{
          display: status === "error" ? "none" : "block",
        }}
      />
      {status === "ready" && mode === "edit" && (
        <p className="panorama-edit-hint">Click anywhere in the view to set a position, then Save table or tour link.</p>
      )}
      {status === "ready" && mode === "book" && (
        <p className="panorama-edit-hint">
          Gold markers = tables · gold arrows = walk to another real 360° viewpoint
        </p>
      )}
    </div>
  );
}
