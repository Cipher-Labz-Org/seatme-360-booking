export type VenueType = "RESTAURANT" | "HOTEL";

export type PublicVenue = {
  id: string;
  type: VenueType;
  name: string;
  city: string;
  description: string;
  cuisine?: string;
  priceHint?: string;
  coverImage: string | null;
  locations: { id: string; name: string; panoramaUrl: string | null }[];
};

export type SceneNavHotspot = {
  id: string;
  sceneId: string;
  targetSceneId: string;
  pitch: number;
  yaw: number;
  label: string;
};

export type PanoramaScenePublic = {
  id: string;
  name: string;
  panoramaUrl: string;
  sortOrder: number;
  isMain?: boolean;
  tableId?: string | null;
  defaultPitch?: number | null;
  defaultYaw?: number | null;
  navFrom: SceneNavHotspot[];
};

export type PublicLocation = {
  id: string;
  name: string;
  description: string;
  panoramaUrl: string | null;
  defaultPitch: number;
  defaultYaw: number;
  defaultHfov: number;
  floorPlanUrl?: string | null;
  venue: { id: string; name: string; city: string; type: VenueType };
  tables: TableSpot[];
  scenes?: PanoramaScenePublic[];
};

export type TableSpot = {
  id: string;
  code: string;
  label: string;
  minGuests: number;
  maxGuests: number;
  pitch: number;
  yaw: number;
  sceneId?: string | null;
  floorX?: number | null;
  floorY?: number | null;
  panoramaUrl?: string | null;
  seatingType?: string;
};

export type TableAvailability = {
  tableId: string;
  status: "available" | "reserved" | "unsuitable";
};
