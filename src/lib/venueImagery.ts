import { assetUrl } from "./config";
import type { PublicVenue } from "./types";

/** Deterministic editorial fallbacks — unique per venue when no cover is uploaded */
const EDITORIAL_POOL = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1552569970-398a6920ba8?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1528607929212-2636ec44253e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1400&q=85",
];

function hashIndex(id: string, length: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % length;
}

export function venueCoverUrl(venueId: string, coverImage: string | null | undefined) {
  const uploaded = assetUrl(coverImage);
  if (uploaded) return uploaded;
  return EDITORIAL_POOL[hashIndex(venueId, EDITORIAL_POOL.length)];
}

export type PublicVenueDisplay = PublicVenue & { displayCoverUrl: string };

export function enrichVenueDisplay(venue: PublicVenue): PublicVenueDisplay {
  return { ...venue, displayCoverUrl: venueCoverUrl(venue.id, venue.coverImage) };
}

export function enrichVenuesDisplay(venues: PublicVenue[]): PublicVenueDisplay[] {
  return venues.map(enrichVenueDisplay);
}
