export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

/** Panorama/cover images — same origin via Next rewrite (/uploads → API) for WebGL 360° viewer */
export function assetUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `${API_URL}/${path.replace(/^\//, "")}`;
}
