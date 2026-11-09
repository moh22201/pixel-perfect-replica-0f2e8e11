// Game rules and state transitions. Pure TypeScript, no React or canvas.
import {
  BUILDINGS, CROPS, CROP_YIELD, ITEMS, LEVEL_XP, ORDER_RULES, ROAD_COST, START, HARVEST_XP,
  UPGRADE_SLOT_COST, BARN_UPGRADE, EXPANSION_BASE_COST, EXPANSION_STEP,
  type BuildingDef, type ItemId, type OrderSource, type Recipe,
} from "./data";
import { INITIAL_CHUNKS, EXPANDABLE_CHUNKS, MAP, chunkKey, inMap, terrainAt, CHUNK } from "./world";

export interface Job { recipe: string; start: number; end: number }
export interface Building {
  uid: number; def: string; x: number; y: number;
  crop?: { item: ItemId; start: number; end: number } | null;
  jobs?: Job[];
  extraSlots?: number;
}
export interface Order { id: number; source: OrderSource; items: Partial<Record<ItemId, number>>; coins: number; xp: number }
export interface GameState {
  v: 1; coins: number; xp: number;
  storage: Partial<Record<ItemId, number>>;
  barnBonus: number;
  buildings: Building[];
  roads: string[];
  unlocked: string[];
  orders: Order[];
  nextId: number;
}

export const key = (x: number, y: number) => `${x},${y}`;
export const def = (b: Building): BuildingDef => BUILDINGS[b.def];

export function levelOf(xp: number) {
  let l = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) if (xp >= LEVEL_XP[i]) l = i + 1;
  return l;
}
export function levelProgress(xp: number) {
  const l = levelOf(xp);
  const a = LEVEL_XP[l - 1] ?? 0, b = LEVEL_XP[l] ?? a + 1000;
  return { level: l, frac: Math.min(1, (xp - a) / (b - a)), next: b };
}

export function capacity(s: GameState) {
  return s.buildings.reduce((n, b) => n + (def(b).storage ?? 0), 0) + s.barnBonus;
}
export const stored = (s: GameState) => Object.values(s.storage).reduce((a, b) => a + (b ?? 0), 0);
export const population = (s: GameState) => s.buildings.reduce((n, b) => n + (def(b).population ?? 0), 0);
export const has = (s: GameState, it: ItemId) => s.storage[it] ?? 0;

function add(s: GameState, it: ItemId, n: number) { s.storage[it] = Math.max(0, (s.storage[it] ?? 0) + n); }

// ---------- occupancy ----------
export function occupancy(s: GameState, ignore?: number) {
  const m = new Map<string, number>();
  for (const b of s.buildings) {
    if (b.uid === ignore) continue;
    const d = def(b);
    for (let i = 0; i < d.w; i++) for (let j = 0; j < d.h; j++) m.set(key(b.x + i, b.y + j), b.uid);
  }
  return m;
}
export function buildingAt(s: GameState, x: number, y: number) {
  const uid = occupancy(s).get(key(x, y));
  return s.buildings.find((b) => b.uid === uid);
}
export function canPlace(s: GameState, defId: string, x: number, y: number, ignore?: number) {
  const d = BUILDINGS[defId];
  const occ = occupancy(s, ignore);
  const roads = new Set(s.roads);
  const unlocked = new Set(s.unlocked);
  for (let i = 0; i < d.w; i++) for (let j = 0; j < d.h; j++) {
    const tx = x + i, ty = y + j;
    if (!inMap(tx, ty)) return false;
    const t = terrainAt(tx, ty);
    if (t !== "grass" && t !== "sand") return false;
    if (!unlocked.has(chunkKey(tx, ty))) return false;
    if (occ.has(key(tx, ty)) || roads.has(key(tx, ty))) return false;
  }
  return true;
}

// ---------- construction ----------
export function place(s: GameState, defId: string, x: number, y: number): string | null {
  const d = BUILDINGS[defId];
  if (levelOf(s.xp) < d.level) return `Reach level ${d.level}`;
  if (s.coins < d.cost) return "Not enough coins";
  if (!canPlace(s, defId, x, y)) return "Can't build here";
  s.coins -= d.cost;
  s.buildings.push({ uid: s.nextId++, def: defId, x, y, jobs: [] });
  return null;
}
export function move(s: GameState, uid: number, x: number, y: number) {
  const b = s.buildings.find((q) => q.uid === uid);
  if (!b || !def(b).movable || !canPlace(s, b.def, x, y, uid)) return false;
  b.x = x; b.y = y; return true;
}
export function remove(s: GameState, uid: number) {
  const b = s.buildings.find((q) => q.uid === uid);
  if (!b || !def(b).removable) return false;
  s.buildings = s.buildings.filter((q) => q.uid !== uid);
  return true;
}
export function canRoad(s: GameState, x: number, y: number) {
  if (!inMap(x, y)) return false;
  const t = terrainAt(x, y);
  if (t !== "grass" && t !== "sand" && t !== "river") return false;
  if (!new Set(s.unlocked).has(chunkKey(x, y))) return false;
  return !occupancy(s).has(key(x, y));
}
export function toggleRoad(s: GameState, x: number, y: number): string | null {
  const k = key(x, y);
  const i = s.roads.indexOf(k);
  if (i >= 0) { s.roads.splice(i, 1); return null; }
  if (!canRoad(s, x, y)) return "Can't build a road here";
  if (s.coins < ROAD_COST) return "Not enough coins";
  s.coins -= ROAD_COST; s.roads.push(k); return null;
}

// ---------- expansion ----------
export function expansionCost(s: GameState) {
  const bought = s.unlocked.length - INITIAL_CHUNKS.length;
  return EXPANSION_BASE_COST + bought * EXPANSION_STEP;
}
export function expandable(s: GameState) {
  const u = new Set(s.unlocked);
  return EXPANDABLE_CHUNKS.filter((c) => {
    if (u.has(c)) return false;
    const [cx, cy] = c.split(",").map(Number);
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => u.has(`${cx + dx},${cy + dy}`));
  });
}
export function expand(s: GameState, chunk: string): string | null {
  if (!expandable(s).includes(chunk)) return "Not available";
  const c = expansionCost(s);
  if (s.coins < c) return "Not enough coins";
  s.coins -= c; s.unlocked.push(chunk); return null;
}
export const chunkOrigin = (c: string) => c.split(",").map((n) => Number(n) * CHUNK) as [number, number];

// ---------- fields ----------
export function cropStage(b: Building, now: number) {
  if (!b.crop) return -1;
  const f = (now - b.crop.start) / (b.crop.end - b.crop.start);
  return f >= 1 ? 3 : f > 0.6 ? 2 : f > 0.25 ? 1 : 0;
}
export function plant(s: GameState, uid: number, item: ItemId, now: number): string | null {
  const b = s.buildings.find((q) => q.uid === uid);
  const c = CROPS.find((q) => q.item === item);
  if (!b || !c || b.crop) return "Field is busy";
  if (levelOf(s.xp) < c.level) return `Reach level ${c.level}`;
  if (has(s, item) < 1) return `You need 1 ${ITEMS[item].name}`;
  add(s, item, -1);
  b.crop = { item, start: now, end: now + c.time * 1000 };
  return null;
}
export function harvest(s: GameState, uid: number, now: number): string | null {
  const b = s.buildings.find((q) => q.uid === uid);
  if (!b?.crop || now < b.crop.end) return "Not ready";
  if (stored(s) + CROP_YIELD > capacity(s)) return "Barn is full";
  add(s, b.crop.item, CROP_YIELD); s.xp += HARVEST_XP; b.crop = null; return null;
}

// ---------- production ----------
export const recipeOf = (b: Building, id: string) => def(b).recipes?.find((r) => r.id === id) as Recipe;
export const slotsOf = (b: Building) => (def(b).slots ?? 1) + (b.extraSlots ?? 0);

export function startJob(s: GameState, uid: number, recipeId: string, now: number): string | null {
  const b = s.buildings.find((q) => q.uid === uid);
  if (!b) return "Missing";
  const r = recipeOf(b, recipeId);
  if (!r) return "Unknown recipe";
  if (levelOf(s.xp) < r.level) return `Reach level ${r.level}`;
  b.jobs ??= [];
  if (b.jobs.length >= slotsOf(b)) return "Queue is full";
  for (const [it, n] of Object.entries(r.inputs)) if (has(s, it as ItemId) < (n ?? 0)) return `Need ${n} ${ITEMS[it as ItemId].name}`;
  for (const [it, n] of Object.entries(r.inputs)) add(s, it as ItemId, -(n ?? 0));
  const d = def(b);
  const start = d.parallel ? now : Math.max(now, b.jobs.at(-1)?.end ?? now);
  b.jobs.push({ recipe: r.id, start, end: start + r.time * 1000 });
  return null;
}
export const readyJobs = (b: Building, now: number) => (b.jobs ?? []).filter((j) => j.end <= now);
export function collect(s: GameState, uid: number, now: number) {
  const b = s.buildings.find((q) => q.uid === uid);
  if (!b) return { got: [] as { item: ItemId; qty: number }[], err: "Missing" };
  const got: { item: ItemId; qty: number }[] = [];
  let err: string | null = null;
  for (const j of readyJobs(b, now)) {
    const r = recipeOf(b, j.recipe);
    if (stored(s) + r.qty > capacity(s)) { err = "Barn is full"; break; }
    add(s, r.output, r.qty); s.xp += Math.ceil(r.time / 30);
    got.push({ item: r.output, qty: r.qty });
    b.jobs = b.jobs!.filter((q) => q !== j);
  }
  return { got, err };
}
export function upgradeSlots(s: GameState, uid: number): string | null {
  const b = s.buildings.find((q) => q.uid === uid);
  if (!b) return "Missing";
  const c = UPGRADE_SLOT_COST * (1 + (b.extraSlots ?? 0));
  if (s.coins < c) return "Not enough coins";
  s.coins -= c; b.extraSlots = (b.extraSlots ?? 0) + 1; return null;
}
export const upgradeCost = (b: Building) => UPGRADE_SLOT_COST * (1 + (b.extraSlots ?? 0));
export function upgradeBarn(s: GameState): string | null {
  if (s.coins < BARN_UPGRADE.cost) return "Not enough coins";
  s.coins -= BARN_UPGRADE.cost; s.barnBonus += BARN_UPGRADE.add; return null;
}

// ---------- orders ----------
/** Items the player can currently produce, given level and buildings. */
export function producibleItems(s: GameState): ItemId[] {
  const lvl = levelOf(s.xp);
  const out = new Set<ItemId>();
  if (s.buildings.some((b) => b.def === "field")) CROPS.filter((c) => c.level <= lvl).forEach((c) => out.add(c.item));
  for (const b of s.buildings) for (const r of def(b).recipes ?? []) if (r.level <= lvl) out.add(r.output);
  return [...out];
}
export function makeOrder(s: GameState, source: OrderSource, rnd = Math.random): Order {
  const pool = producibleItems(s);
  const items: Partial<Record<ItemId, number>> = {};
  const kinds = 1 + Math.floor(rnd() * Math.min(3, pool.length));
  for (let i = 0; i < kinds; i++) {
    const it = pool[Math.floor(rnd() * pool.length)];
    items[it] = (items[it] ?? 0) + 1 + Math.floor(rnd() * 3);
  }
  const value = Object.entries(items).reduce((a, [it, n]) => a + ITEMS[it as ItemId].value * (n ?? 0), 0);
  const rule = ORDER_RULES[source];
  return { id: s.nextId++, source, items, coins: Math.round(value * rule.coinMul), xp: Math.max(1, Math.round(value * rule.xpMul)) };
}
export function refillOrders(s: GameState) {
  for (const src of Object.keys(ORDER_RULES) as OrderSource[]) {
    while (s.orders.filter((o) => o.source === src).length < ORDER_RULES[src].count) s.orders.push(makeOrder(s, src));
  }
}
export function canFulfill(s: GameState, o: Order) {
  return Object.entries(o.items).every(([it, n]) => has(s, it as ItemId) >= (n ?? 0));
}
export function fulfill(s: GameState, id: number): string | null {
  const o = s.orders.find((q) => q.id === id);
  if (!o) return "Missing";
  if (!canFulfill(s, o)) return "Missing items";
  for (const [it, n] of Object.entries(o.items)) add(s, it as ItemId, -(n ?? 0));
  s.coins += o.coins; s.xp += o.xp;
  s.orders = s.orders.filter((q) => q !== o);
  s.orders.push(makeOrder(s, o.source));
  return null;
}
export function discardOrder(s: GameState, id: number) {
  const o = s.orders.find((q) => q.id === id);
  if (!o) return;
  s.orders = s.orders.filter((q) => q !== o);
  s.orders.push(makeOrder(s, o.source));
}

// ---------- initial town ----------
export function createInitialState(): GameState {
  const s: GameState = { v: 1, coins: START.coins, xp: 0, storage: { ...START.storage }, barnBonus: 0, buildings: [], roads: [], unlocked: [...INITIAL_CHUNKS], orders: [], nextId: 1 };
  const B = (d: string, x: number, y: number) => s.buildings.push({ uid: s.nextId++, def: d, x, y, jobs: [] });
  const road = (x0: number, y0: number, x1: number, y1: number) => {
    for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) {
      const k = key(x, y); if (!s.roads.includes(k)) s.roads.push(k);
    }
  };
  road(0, 9, 31, 9); road(16, 2, 16, 23); road(0, 17, 31, 17); road(26, 9, 26, 23); road(26, 13, 32, 13); road(7, 9, 7, 23); road(0, 23, 31, 23);
  // transport
  B("station", 13, 2); B("orders", 17, 3); B("hangar", 1, 2); B("tower", 4, 3);
  B("harbor", 30, 10); B("crane", 34, 11); B("crane", 34, 15); B("containers", 33, 13); B("containers", 33, 14); B("containers", 32, 15);
  // farm
  for (let x = 0; x <= 5; x++) for (let y = 11; y <= 12; y++) B("field", x, y);
  for (let x = 0; x <= 2; x++) B("field", x, 14);
  B("barn", 3, 14); B("cowshed", 8, 10); B("feedmill", 11, 10); B("coop", 11, 13); B("pine", 13, 10); B("tree", 10, 15);
  // industry
  B("bakery", 17, 10); B("dairy", 20, 10); B("sugar", 23, 11); B("warehouse", 17, 14); B("tree", 22, 15);
  // residential & community
  B("townhall", 18, 19); B("park", 22, 19); B("shop", 22, 21); B("cafe", 24, 19);
  B("cottage", 17, 18); B("cottage", 21, 18); B("cottage", 17, 22); B("townhouse", 24, 21); B("house", 27, 18); B("house", 29, 18);
  B("apartment", 27, 20); B("cottage", 29, 20); B("cottage", 30, 21); B("tree", 25, 18); B("flowers", 21, 22);
  B("house", 8, 18); B("cottage", 10, 18); B("cottage", 11, 18); B("townhouse", 12, 18); B("cottage", 8, 21); B("cottage", 9, 21);
  B("school", 13, 19); B("tree", 15, 18); B("flowers", 10, 20); B("pine", 14, 22);
  B("cottage", 20, 3); B("cottage", 21, 3); B("house", 22, 3); B("townhouse", 24, 3); B("house", 25, 3); B("cottage", 27, 3);
  B("apartment", 18, 6); B("cottage", 20, 6); B("house", 21, 6); B("cottage", 23, 6); B("park", 24, 6); B("tree", 26, 6); B("tree", 28, 5); B("pine", 29, 7);
  B("villa", 2, 18); B("cottage", 4, 18); B("cottage", 5, 18); B("cottage", 0, 21); B("tree", 5, 21); B("tree", 1, 15); B("pine", 4, 20);
  B("tree", 10, 3); B("pine", 11, 7); B("tree", 2, 8); B("flowers", 12, 3); B("tree", 8, 7); B("pine", 9, 4);
  B("tree", 30, 5); B("flowers", 27, 7); B("pine", 31, 3); B("tree", 19, 15); B("pine", 24, 15); B("tree", 29, 15); B("flowers", 28, 15);
  // pre-plant a few fields at varied stages
  const now = Date.now();
  s.buildings.filter((b) => b.def === "field").forEach((b, i) => {
    const item: ItemId = i % 3 === 2 ? "corn" : "wheat";
    const t = (item === "corn" ? 60 : 30) * 1000;
    const startAgo = [0.1, 0.4, 0.8, 1.2][i % 4] * t;
    b.crop = { item, start: now - startAgo, end: now - startAgo + t };
  });
  // validate: drop any overlapping buildings from layout mistakes
  const seen = new Set<string>(s.roads);
  s.buildings = s.buildings.filter((b) => {
    const d = def(b); const ks: string[] = [];
    for (let i = 0; i < d.w; i++) for (let j = 0; j < d.h; j++) ks.push(key(b.x + i, b.y + j));
    if (ks.some((k) => seen.has(k))) { console.warn("layout overlap", b.def, b.x, b.y); return false; }
    ks.forEach((k) => seen.add(k)); return true;
  });
  refillOrders(s);
  return s;
}

const SAVE_KEY = "harvest-haven-save-v1";
export function save(s: GameState) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* ignore */ } }
export function load(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { const s = JSON.parse(raw) as GameState; if (s.v === 1) { refillOrders(s); return s; } }
  } catch { /* ignore */ }
  return createInitialState();
}
export function resetSave() { try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ } }
export { MAP };
