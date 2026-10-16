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
  status?: "available" | "reserved" | "unsuitable" | "neutral" | "selected";
};

export type ViewerScene = {
  id: string;
  name: string;
  panoramaUrl: string;
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
  onPlace?: (pitch: number, yaw: number) => void;
  apiRef?: React.MutableRefObject<PanoramaViewerApi | null>;
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

function tablesForScene(sceneId: string, scenes: ViewerScene[], tables: ViewerTable[]) {
  const firstId = scenes[0]?.id;
  return tables.filter((t) => {
    if (!t.sceneId) {
      return scenes.length <= 1 || sceneId === firstId;
    }
    return t.sceneId === sceneId;
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
  onPlace,
  apiRef,
}: Props) {
  const containerId = useRef(`panorama-${Math.random().toString(36).slice(2)}`);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const onSelectRef = useRef(onSelect);
  const onPlaceRef = useRef(onPlace);
  const onSceneChangeRef = useRef(onSceneChange);
  const modeRef = useRef(mode);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  onSelectRef.current = onSelect;
  onPlaceRef.current = onPlace;
  onSceneChangeRef.current = onSceneChange;
  modeRef.current = mode;

  const useMultiScene = !!scenes && scenes.length > 0;
  const firstSceneId = useMultiScene ? (activeSceneId ?? scenes![0].id) : null;

  const tablesKey = tables.map((t) => `${t.id}:${t.status}:${t.pitch}:${t.yaw}:${t.sceneId}`).join("|");
  const scenesKey = useMultiScene
    ? scenes!.map((s) => `${s.id}:${s.panoramaUrl}:${s.navHotspots.length}`).join("|")
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
      ? scenes!.map((s) => assetUrl(s.panoramaUrl)).filter(Boolean) as string[]
      : [assetUrl(panoramaPath!)].filter(Boolean) as string[];

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
          args: { id: string; code: string; status: string }
        ) => {
          div.classList.add("table-hotspot", args.status);
          div.dataset.label = args.code;
          div.addEventListener("click", (e) => {
            e.stopPropagation();
            if (modeRef.current === "book" && onSelectRef.current) onSelectRef.current(args.id);
          });
        };

        let config: Record<string, unknown>;

        if (useMultiScene && scenes) {
          const startId = activeSceneId && scenes.some((s) => s.id === activeSceneId) ? activeSceneId : scenes[0].id;
          const sceneMap: Record<string, unknown> = {};
          for (const scene of scenes) {
            const pano = assetUrl(scene.panoramaUrl)!;
            const sceneTables = tablesForScene(scene.id, scenes, tables);
            sceneMap[scene.id] = {
              type: "equirectangular",
              panorama: pano,
              ...(pano.startsWith("http") ? { crossOrigin: "anonymous" } : {}),
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
                  },
                })),
                ...scene.navHotspots.map((h) => ({
                  pitch: h.pitch,
                  yaw: h.yaw,
                  type: "scene",
                  sceneId: h.targetSceneId,
                  text: h.label || "Next area →",
                  cssClass: "scene-nav-hotspot",
                })),
              ],
            };
          }
          config = {
            default: {
              firstScene: startId,
              sceneFadeDuration: 800,
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
            if (apiRef) {
              apiRef.current = {
                isReady: () => true,
                getLookAt: () => {
                  const v = viewerRef.current;
                  if (!v?.getPitch || !v.getYaw) return null;
                  return { pitch: v.getPitch(), yaw: v.getYaw() };
                },
              };
            }
          }
        });
        viewerRef.current.on("error", (msg: unknown) => {
          if (!cancelled) {
            setStatus("error");
            setErrorMsg(typeof msg === "string" ? msg : "Panorama failed to render.");
          }
        });
        viewerRef.current.on("scenechange", (...args: unknown[]) => {
          const data = args[0] as { sceneId?: string } | undefined;
          if (data?.sceneId) onSceneChangeRef.current?.(data.sceneId);
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
  ]);

  useEffect(() => {
    if (!useMultiScene || !activeSceneId || !viewerRef.current?.loadScene) return;
    viewerRef.current.loadScene(activeSceneId);
  }, [activeSceneId, useMultiScene]);

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
        <div className="scene-tabs" role="tablist" aria-label="Tour areas">
          {scenes.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === firstSceneId}
              className={`scene-tab ${s.id === firstSceneId ? "active" : ""}`}
              onClick={() => {
                onSceneChange?.(s.id);
                viewerRef.current?.loadScene?.(s.id);
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      {status === "loading" && <div className="panorama-status overlay">Loading 360° view…</div>}
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
          Drag to look around · gold dots = tables · labeled arrows = walk to another area
        </p>
      )}
    </div>
  );
}
