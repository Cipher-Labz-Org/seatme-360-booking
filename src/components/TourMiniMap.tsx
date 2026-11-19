"use client";

import { assetUrl } from "@/lib/config";

export type TourMapScene = {
  id: string;
  name: string;
  isMain?: boolean;
  /** 0–100 percent on floor plan */
  x?: number | null;
  y?: number | null;
};

type Props = {
  floorPlanUrl: string | null | undefined;
  scenes: TourMapScene[];
  activeSceneId: string | null;
  onGoToScene: (sceneId: string) => void;
};

export function TourMiniMap({ floorPlanUrl, scenes, activeSceneId, onGoToScene }: Props) {
  const src = floorPlanUrl ? assetUrl(floorPlanUrl) : null;
  const active = scenes.find((s) => s.id === activeSceneId);

  if (!src || scenes.length === 0) {
    return (
      <div className="tour-minimap tour-minimap-fallback" aria-label="Current viewpoint">
        <span className="tour-minimap-label">{active?.name ?? "360° tour"}</span>
      </div>
    );
  }

  return (
    <div className="tour-minimap" aria-label="Tour map — current viewpoint">
      <div className="tour-minimap-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="tour-minimap-img" />
        {scenes.map((s) => {
          if (s.x == null || s.y == null) return null;
          const isActive = s.id === activeSceneId;
          return (
            <button
              key={s.id}
              type="button"
              className={`tour-minimap-dot ${isActive ? "active" : ""} ${s.isMain ? "main" : ""}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              title={s.name}
              onClick={() => onGoToScene(s.id)}
            >
              <span className="sr-only">{s.name}</span>
            </button>
          );
        })}
      </div>
      <p className="tour-minimap-caption">{active?.name ?? "Explore"}</p>
    </div>
  );
}
