import { API_URL, isDemoMode } from "@/lib/config";
import { getMockVenueDetail, MOCK_VENUES } from "@/lib/demo/mockData";
import type { PublicVenue } from "@/lib/types";
import type { VenueDetailData } from "@/components/venue/VenueDetailView";

export async function fetchPublicVenues(): Promise<PublicVenue[]> {
  if (isDemoMode()) return MOCK_VENUES;
  const res = await fetch(`${API_URL}/api/public/venues`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPublicVenue(id: string): Promise<VenueDetailData | null> {
  if (isDemoMode()) return getMockVenueDetail(id);
  const res = await fetch(`${API_URL}/api/public/venues/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}