"use client";

import type { TableSpot, TableAvailability } from "@/lib/types";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

type Props = {
  table: TableSpot;
  status: TableAvailability["status"];
  hasWalkthroughView: boolean;
  onSelect: () => void;
  onWalkToView?: () => void;
  onClose: () => void;
};

export function TableTourPopover({
  table,
  status,
  hasWalkthroughView,
  onSelect,
  onWalkToView,
  onClose,
}: Props) {
  const available = status === "available";

  return (
    <div className="table-tour-popover" role="dialog" aria-label={`Table ${table.code}`}>
      <button type="button" className="table-tour-popover-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <p className="eyebrow">Table</p>
      <h3 className="table-tour-popover-title">{table.code}</h3>
      {table.label ? <p className="table-tour-popover-meta">{table.label}</p> : null}
      <p className="table-tour-popover-meta">
        {table.minGuests}–{table.maxGuests} guests
        {table.seatingType ? ` · ${table.seatingType}` : ""}
      </p>
      <p className={`table-tour-popover-status status-${status}`}>
        {status === "available" && "Available for your party"}
        {status === "reserved" && "Reserved for this time"}
        {status === "unsuitable" && "Not suitable for party size"}
      </p>
      <div className="table-tour-popover-actions">
        {hasWalkthroughView && onWalkToView && (
          <LuxuryButton variant="outline" onClick={onWalkToView}>
            Walk to table view
          </LuxuryButton>
        )}
        {available && (
          <LuxuryButton onClick={onSelect}>Select table</LuxuryButton>
        )}
      </div>
    </div>
  );
}
