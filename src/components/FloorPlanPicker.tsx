"use client";

import { assetUrl } from "@/lib/config";

export type FloorTable = {
  id: string;
  code: string;
  floorX: number | null;
  floorY: number | null;
  status?: "available" | "reserved" | "unsuitable" | "neutral" | "selected";
};

type Props = {
  floorPlanUrl: string;
  tables: FloorTable[];
  mode: "book" | "edit";
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onPlace?: (id: string, x: number, y: number) => void;
};

export function FloorPlanPicker({ floorPlanUrl, tables, mode, selectedId, onSelect, onPlace }: Props) {
  const src = assetUrl(floorPlanUrl);
  if (!src) {
    return <div className="empty-state">Floor plan image missing.</div>;
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (mode === "edit" && onPlace && selectedId) {
      onPlace(selectedId, x, y);
    }
  };

  return (
    <div className="floor-plan-wrap">
      <div className="floor-plan-stage" onClick={handleClick} role="presentation">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Floor plan" className="floor-plan-image" />
        {tables.map((t) => {
          if (t.floorX == null || t.floorY == null) return null;
          const status = t.status ?? "neutral";
          return (
            <button
              key={t.id}
              type="button"
              className={`floor-plan-dot ${status}`}
              style={{ left: `${t.floorX}%`, top: `${t.floorY}%` }}
              title={t.code}
              onClick={(e) => {
                e.stopPropagation();
                if (mode === "book" && onSelect) onSelect(t.id);
                if (mode === "edit" && onSelect) onSelect(t.id);
              }}
            >
              {t.code}
            </button>
          );
        })}
      </div>
      {mode === "edit" && (
        <p className="panorama-edit-hint">Select a table in the list, then click the floor plan to set its position.</p>
      )}
      {mode === "book" && (
        <p className="panorama-edit-hint">Tap a table on the floor plan — selection stays in sync with 360° view.</p>
      )}
    </div>
  );
}
