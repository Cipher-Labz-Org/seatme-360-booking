import type { PublicLocation, PublicVenue, TableAvailability } from "@/lib/types";
import type { VenueDetailData } from "@/components/venue/VenueDetailView";

export const DEMO_VENUE_COLMBO = "demo-venue-colombo";
export const DEMO_LOCATION_MAIN = "demo-location-main";
export const DEMO_VENUE_GALLE = "demo-venue-galle";
export const DEMO_LOCATION_TERRACE = "demo-location-terrace";

/** Self-hosted in `public/demo/` — same-origin, no CORS issues for WebGL 360° */
const PANO_MAIN = "/demo/main.jpg";
const PANO_BAR = "/demo/bar.jpg";

export const MOCK_VENUES: PublicVenue[] = [
  {
    id: DEMO_VENUE_COLMBO,
    type: "RESTAURANT",
    name: "The Harbour Room",
    city: "Colombo",
    description:
      "Waterfront dining with table-by-table 360° previews — reserve the view that fits your occasion.",
    cuisine: "Contemporary Sri Lankan",
    priceHint: "$$$",
    coverImage: null,
    locations: [{ id: DEMO_LOCATION_MAIN, name: "Main Dining Hall", panoramaUrl: PANO_MAIN }],
  },
  {
    id: DEMO_VENUE_GALLE,
    type: "HOTEL",
    name: "Fort House Terrace",
    city: "Galle",
    description: "Boutique hotel restaurant overlooking the ramparts — demo venue for portfolio review.",
    cuisine: "Seafood · Grill",
    priceHint: "$$",
    coverImage: null,
    locations: [{ id: DEMO_LOCATION_TERRACE, name: "Sunset Terrace", panoramaUrl: PANO_BAR }],
  },
];

const COLOMBO_TABLES = [
  {
    id: "demo-table-t01",
    code: "T-01",
    label: "Window banquette",
    minGuests: 2,
    maxGuests: 4,
    pitch: -2,
    yaw: 120,
    sceneId: "demo-scene-main",
    floorX: 0.28,
    floorY: 0.42,
    seatingType: "Banquette",
  },
  {
    id: "demo-table-t02",
    code: "T-02",
    label: "Chef's counter",
    minGuests: 2,
    maxGuests: 2,
    pitch: 4,
    yaw: -35,
    sceneId: "demo-scene-main",
    floorX: 0.52,
    floorY: 0.38,
    seatingType: "Counter",
  },
  {
    id: "demo-table-t03",
    code: "T-03",
    label: "Private corner",
    minGuests: 4,
    maxGuests: 6,
    pitch: -6,
    yaw: 210,
    sceneId: "demo-scene-main",
    floorX: 0.72,
    floorY: 0.55,
    panoramaUrl: PANO_BAR,
    seatingType: "Booth",
  },
  {
    id: "demo-table-t04",
    code: "T-04",
    label: "Bar lounge",
    minGuests: 2,
    maxGuests: 4,
    pitch: 0,
    yaw: 10,
    sceneId: "demo-scene-bar",
    floorX: 0.85,
    floorY: 0.32,
    seatingType: "Lounge",
  },
];

const COLOMBO_SCENES = [
  {
    id: "demo-scene-main",
    name: "Main dining",
    panoramaUrl: PANO_MAIN,
    sortOrder: 0,
    isMain: true,
    defaultPitch: -4,
    defaultYaw: 45,
    navFrom: [
      {
        id: "demo-nav-1",
        sceneId: "demo-scene-main",
        targetSceneId: "demo-scene-bar",
        pitch: -8,
        yaw: 75,
        label: "Bar lounge",
      },
    ],
  },
  {
    id: "demo-scene-bar",
    name: "Bar lounge",
    panoramaUrl: PANO_BAR,
    sortOrder: 1,
    isMain: false,
    tableId: null,
    navFrom: [
      {
        id: "demo-nav-2",
        sceneId: "demo-scene-bar",
        targetSceneId: "demo-scene-main",
        pitch: -5,
        yaw: -140,
        label: "Main dining",
      },
    ],
  },
  {
    id: "demo-scene-t03",
    name: "T-03 viewpoint",
    panoramaUrl: PANO_BAR,
    sortOrder: 2,
    isMain: false,
    tableId: "demo-table-t03",
    navFrom: [],
  },
];

const MOCK_LOCATIONS: Record<string, PublicLocation> = {
  [DEMO_LOCATION_MAIN]: {
    id: DEMO_LOCATION_MAIN,
    name: "Main Dining Hall",
    description:
      "Explore the room in 360°, pick a table that matches your party size, and confirm in one flow (demo data — no live reservation).",
    panoramaUrl: PANO_MAIN,
    defaultPitch: -4,
    defaultYaw: 45,
    defaultHfov: 105,
    floorPlanUrl: null,
    venue: {
      id: DEMO_VENUE_COLMBO,
      name: "The Harbour Room",
      city: "Colombo",
      type: "RESTAURANT",
    },
    tables: COLOMBO_TABLES,
    scenes: COLOMBO_SCENES,
  },
  [DEMO_LOCATION_TERRACE]: {
    id: DEMO_LOCATION_TERRACE,
    name: "Sunset Terrace",
    description: "Open-air terrace demo with a single main panorama.",
    panoramaUrl: PANO_BAR,
    defaultPitch: -2,
    defaultYaw: 0,
    defaultHfov: 100,
    floorPlanUrl: null,
    venue: {
      id: DEMO_VENUE_GALLE,
      name: "Fort House Terrace",
      city: "Galle",
      type: "HOTEL",
    },
    tables: [
      {
        id: "demo-table-g01",
        code: "G-01",
        label: "Rampart view",
        minGuests: 2,
        maxGuests: 4,
        pitch: -3,
        yaw: 90,
        sceneId: "demo-scene-terrace",
        floorX: 0.5,
        floorY: 0.5,
        seatingType: "Outdoor",
      },
    ],
    scenes: [
      {
        id: "demo-scene-terrace",
        name: "Terrace",
        panoramaUrl: PANO_BAR,
        sortOrder: 0,
        isMain: true,
        navFrom: [],
      },
    ],
  },
};

const MOCK_VENUE_DETAILS: Record<string, VenueDetailData> = {
  [DEMO_VENUE_COLMBO]: {
    id: DEMO_VENUE_COLMBO,
    name: "The Harbour Room",
    city: "Colombo",
    description:
      "An elevated dining room on the waterfront — curated tasting menus, wine pairings, and walkthrough table selection for guests who want to choose their view before they arrive.",
    type: "RESTAURANT",
    cuisine: "Contemporary Sri Lankan",
    priceHint: "$$$",
    tagline: "Reserve your perspective",
    address: "Port City Promenade, Colombo 01",
    phone: "+94 11 555 0100",
    contactEmail: "reservations@harbour-room.demo",
    amenities: JSON.stringify(["Valet parking", "Sommelier", "Private dining", "Harbour view"]),
    openingHours: JSON.stringify([
      { day: "Mon – Thu", hours: "12:00 – 15:00 · 18:30 – 23:00" },
      { day: "Fri – Sun", hours: "12:00 – 00:00" },
    ]),
    mapEmbedUrl: "",
    coverImage: null,
    gallery: [
      {
        id: "demo-gal-1",
        imageUrl:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85",
        caption: "Tasting menu presentation",
      },
      {
        id: "demo-gal-2",
        imageUrl:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",
        caption: "Main dining room",
      },
    ],
    menuCategories: [
      {
        id: "demo-cat-1",
        name: "Signatures",
        items: [
          {
            id: "demo-item-1",
            name: "Lagoon crab curry",
            description: "Stone-ground spices, roasted coconut, appam",
            price: "Rs 4,800",
          },
          {
            id: "demo-item-2",
            name: "Harbour catch — grill",
            description: "Day boat selection, sambol trio",
            price: "Rs 5,200",
          },
        ],
      },
      {
        id: "demo-cat-2",
        name: "Dessert",
        items: [
          {
            id: "demo-item-3",
            name: "Jaggery crème brûlée",
            description: "Pandan, palm treacle",
            price: "Rs 1,650",
          },
        ],
      },
    ],
    locations: [
      {
        id: DEMO_LOCATION_MAIN,
        name: "Main Dining Hall",
        description: "360° walkthrough with multiple vantage scenes.",
        panoramaUrl: PANO_MAIN,
        _count: { tables: 4 },
      },
    ],
  },
  [DEMO_VENUE_GALLE]: {
    id: DEMO_VENUE_GALLE,
    name: "Fort House Terrace",
    city: "Galle",
    description: "Coastal boutique hotel dining — demo copy for client preview.",
    type: "HOTEL",
    cuisine: "Seafood · Grill",
    priceHint: "$$",
    tagline: "Sunset seating",
    address: "Church Street, Galle Fort",
    phone: "+94 91 555 0200",
    contactEmail: "hello@forthouse.demo",
    amenities: JSON.stringify(["Ocean view", "Cocktail bar", "Live music weekends"]),
    openingHours: JSON.stringify([
      { day: "Daily", hours: "11:00 – 23:00" },
    ]),
    mapEmbedUrl: "",
    coverImage: null,
    gallery: [
      {
        id: "demo-gal-g1",
        imageUrl:
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=85",
        caption: "Terrace at dusk",
      },
    ],
    menuCategories: [
      {
        id: "demo-cat-g1",
        name: "Grill",
        items: [
          {
            id: "demo-item-g1",
            name: "Spiced reef fish",
            description: "Wood fire, lime leaf butter",
            price: "Rs 3,900",
          },
        ],
      },
    ],
    locations: [
      {
        id: DEMO_LOCATION_TERRACE,
        name: "Sunset Terrace",
        description: "Single-scene 360° demo.",
        panoramaUrl: PANO_BAR,
        _count: { tables: 1 },
      },
    ],
  },
};

/** Simulated “reserved” table for demo realism (T-02 at 19:00 on any date). */
const RESERVED_TABLE_DEMO = "demo-table-t02";

export function getMockVenueDetail(id: string): VenueDetailData | null {
  return MOCK_VENUE_DETAILS[id] ?? null;
}

export function getMockLocation(id: string): PublicLocation | null {
  return MOCK_LOCATIONS[id] ?? null;
}

export function getMockAvailability(
  locationId: string,
  partySize: number,
  time: string
): TableAvailability[] {
  const location = MOCK_LOCATIONS[locationId];
  if (!location) return [];
  return location.tables.map((table) => {
    const fitsParty = partySize >= table.minGuests && partySize <= table.maxGuests;
    const conflict =
      locationId === DEMO_LOCATION_MAIN &&
      table.id === RESERVED_TABLE_DEMO &&
      time === "19:00";
    return {
      tableId: table.id,
      status: !fitsParty ? "unsuitable" : conflict ? "reserved" : "available",
    };
  });
}

export function createMockBookingId(): string {
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}