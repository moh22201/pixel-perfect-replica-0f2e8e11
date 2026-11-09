// Static world layout: terrain, rail line, chunks. No React / rendering.
export const MAP = 64;
export const CHUNK = 8;
export const RAIL_Y = 1;
export const SEA_X = 47;

export type Terrain = "grass" | "sea" | "sand" | "river" | "tarmac" | "dock" | "rail";

export function terrainAt(x: number, y: number): Terrain {
  if (x >= 41 && x <= 44 && y >= 11 && y <= 16) return "dock";
  if (y === RAIL_Y) return "rail";
  if (x >= SEA_X) return "sea";
  if (x >= SEA_X - 2) return "sand";
  if (y === 43 || y === 44) return "river";
  if (x <= 11 && (y === 5 || y === 6)) return "tarmac";
  return "grass";
}

export const inMap = (x: number, y: number) => x >= 0 && y >= 0 && x < MAP && y < MAP;
export const chunkKey = (x: number, y: number) => `${Math.floor(x / CHUNK)},${Math.floor(y / CHUNK)}`;
export const INITIAL_CHUNKS = Array.from({ length: 4 }, (_, y) => Array.from({ length: 6 }, (_, x) => `${x},${y}`)).flat();
export const EXPANDABLE_CHUNKS = Array.from({ length: 2 }, (_, row) => Array.from({ length: 6 }, (_, x) => `${x},${row + 4}`)).flat();

export function hash(x: number, y: number, s = 0) {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
