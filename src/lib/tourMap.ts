import type { PanoramaScenePublic, TableSpot } from "./types";

/** Map each tour scene to an approximate floor-plan position (average of table markers in that scene). */
export function sceneFloorPositions(
  scenes: PanoramaScenePublic[],
  tables: TableSpot[]
): Map<string, { x: number; y: number }> {
  const map = new Map<string, { x: number; y: number }>();
  for (const scene of scenes) {
    if (scene.tableId) {
      const t = tables.find((x) => x.id === scene.tableId);
      if (t?.floorX != null && t.floorY != null) {
        map.set(scene.id, { x: t.floorX, y: t.floorY });
        continue;
      }
    }
    const inScene = tables.filter((t) => {
      if (scene.tableId) return t.id === scene.tableId;
      if (t.sceneId) return t.sceneId === scene.id;
      return scene.isMain || scene.sortOrder === 0;
    });
    const positioned = inScene.filter((t) => t.floorX != null && t.floorY != null);
    if (positioned.length === 0) continue;
    const x = positioned.reduce((s, t) => s + (t.floorX ?? 0), 0) / positioned.length;
    const y = positioned.reduce((s, t) => s + (t.floorY ?? 0), 0) / positioned.length;
    map.set(scene.id, { x, y });
  }
  return map;
}

export function mainSceneId(scenes: PanoramaScenePublic[]): string | null {
  const main = scenes.find((s) => s.isMain);
  return main?.id ?? scenes[0]?.id ?? null;
}

export function viewpointSceneForTable(scenes: PanoramaScenePublic[], tableId: string): string | null {
  return scenes.find((s) => s.tableId === tableId)?.id ?? null;
}
