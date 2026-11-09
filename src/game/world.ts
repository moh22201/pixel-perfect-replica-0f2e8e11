// Static world layout: terrain, rail line, chunks. No React / rendering.
export const MAP = 56;
export const CHUNK = 8;
export const RAIL_Y = 1;
export const SEA_X = 39;

export type Terrain = "grass" | "sea" | "sand" | "river" | "tarmac" | "dock" | "rail";

export function terrainAt(x: number, y: number): Terrain {
  if (x >= 33 && x <= 36 && y >= 11 && y <= 16) return "dock";
  if (y === RAIL_Y) return "rail";
  if (x >= SEA_X) return "sea";
  if (x >= SEA_X - 2) return "sand";
  if (y === 43 || y === 44) return "river";
  if (x <= 11 && (y === 5 || y === 6)) return "tarmac";
  return "grass";
}

export const inMap = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP && y < MAP;
export const chunkKey = (x: number, y: number) => `${Math.floor(x / CHUNK)},${Math.floor(y / CHUNK)}`;
export const INITIAL_CHUNKS = ["0,0", "1,0", "2,0", "3,0", "0,1", "1,1", "2,1", "3,1", "0,2", "1,2", "2,2", "3,2"];
export const EXPANDABLE_CHUNKS = ["0,3", "1,3", "2,3", "3,3", "0,4", "1,4", "2,4", "3,4"];

export function hash(x: number, y: number, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
