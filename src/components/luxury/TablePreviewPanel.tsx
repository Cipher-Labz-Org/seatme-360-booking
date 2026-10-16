"use client";

import type { TableSpot, TableAvailability } from "@/lib/types";
import { LuxuryButton } from "./LuxuryButton";

type Props = {
  table: TableSpot;
  status: TableAvailability["status"];
  locationName: string;
  onViewFromTable: () => void;
  onReserve: () => void;
  onClose: () => void;
  viewingTablePanorama: boolean;
};

export function TablePreviewPanel({
  table,
  status,
  locationName,
  onViewFromTable,
  onReserve,
  onClose,
  viewingTablePanorama,
}: Props) {
  const available = status === "available";
  const hasTableView = Boolean(table.panoramaUrl);

  return (
    <div className="table-preview-panel" role="dialog" aria-label={`Table ${table.code}`}>
      <button type="button" className="table-preview-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <p className="eyebrow">Selected table</p>
      <h3 className="table-preview-title">{table.code}</h3>
      <p className="table-preview-meta">
        {table.label || locationName} · {table.minGuests}–{table.maxGuests} guests
        {table.seatingType ? ` · ${table.seatingType}` : ""}
      </p>
      <p className={`table-preview-status status-${status}`} aria-live="polite">
        {status === "available" && "Available for your party"}
        {status === "reserved" && "Reserved for this time"}
        {status === "unsuitable" && "Not suitable for party size"}
      </p>
      {!hasTableView && (
        <p className="table-preview-fallback">Table-specific 360° not uploaded — area view will be shown.</p>
      )}
      <div className="table-preview-actions">
        {available && !viewingTablePanorama && (
          <LuxuryButton variant="outline" onClick={onViewFromTable}>
            View from this table
          </LuxuryButton>
        )}
        {available && (
          <LuxuryButton onClick={onReserve}>{viewingTablePanorama ? "Reserve this view" : "Select & reserve"}</LuxuryButton>
        )}
      </div>
    </div>
  );
}
