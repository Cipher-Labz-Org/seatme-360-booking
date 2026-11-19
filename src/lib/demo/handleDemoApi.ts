import { ApiError } from "@/lib/apiError";
import {
  createMockBookingId,
  getMockAvailability,
  getMockLocation,
  getMockVenueDetail,
  MOCK_VENUES,
} from "./mockData";

type ApiOptions = RequestInit & { auth?: boolean };

function parseAvailabilityQuery(path: string) {
  const [, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  return {
    date: params.get("date") ?? "",
    time: params.get("time") ?? "19:00",
    partySize: Number(params.get("partySize") ?? "2"),
  };
}

export async function handleDemoApi<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  if (method === "GET" && path === "/api/public/venues") {
    return MOCK_VENUES as T;
  }

  const venueMatch = path.match(/^\/api\/public\/venues\/([^/?]+)$/);
  if (method === "GET" && venueMatch) {
    const venue = getMockVenueDetail(venueMatch[1]);
    if (!venue) throw new ApiError(404, "Not found");
    return venue as T;
  }

  const locationMatch = path.match(/^\/api\/public\/locations\/([^/?]+)$/);
  if (method === "GET" && locationMatch) {
    const location = getMockLocation(locationMatch[1]);
    if (!location) throw new ApiError(404, "Not found");
    return location as T;
  }

  const availabilityMatch = path.match(/^\/api\/public\/locations\/([^/?]+)\/availability/);
  if (method === "GET" && availabilityMatch) {
    const locationId = availabilityMatch[1];
    if (!getMockLocation(locationId)) throw new ApiError(404, "Not found");
    const { time, partySize } = parseAvailabilityQuery(path);
    if (!Number.isFinite(partySize) || partySize < 1) {
      throw new ApiError(400, "date, time, partySize required");
    }
    return { availability: getMockAvailability(locationId, partySize, time) } as T;
  }

  if (method === "POST" && path === "/api/public/bookings") {
    let body: { tableId?: string } = {};
    if (typeof options.body === "string") {
      try {
        body = JSON.parse(options.body) as { tableId?: string };
      } catch {
        throw new ApiError(400, "Invalid JSON");
      }
    }
    if (!body.tableId) throw new ApiError(400, "tableId required");
    return { id: createMockBookingId() } as T;
  }

  throw new ApiError(
    503,
    "Demo mode: this action is not available. Sign in and admin features need a live API."
  );
}