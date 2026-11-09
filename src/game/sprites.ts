// Original procedural building art, cached per building type.
import { P, setCtx, ctx, poly, line, circle, ellipse, flat, box, shadow, winL, winR, doorL, gable, hip, flatRoof, cyl, ring, tree, pine, bush, fence, shade } from "./draw";
import { BUILDINGS } from "./data";
import type { ItemId } from "./data";

export const SPR_SCALE = 2;
const TOP = 210, PAD = 30;
export interface Sprite { c: HTMLCanvasElement; ox: number; oy: number; w: number; h: number }
const cache = new Map<string, Sprite>();

export function sprite(key: string, w: number, h: number, draw: () => void, restore?: CanvasRenderingContext2D): Sprite {
  const hit = cache.get(key); if (hit) return hit;
  const cw = (w + h) * 32 + PAD * 2, ch = TOP + (w + h) * 16 + PAD;
  const c = document.createElement("canvas");
  c.width = cw * SPR_SCALE; c.height = ch * SPR_SCALE;
  const g = c.getContext("2d")!;
  g.scale(SPR_SCALE, SPR_SCALE); g.translate(h * 32 + PAD, TOP);
  setCtx(g); draw();
  if (restore) setCtx(restore);
  const s = { c, ox: h * 32 + PAD, oy: TOP, w: cw, h: ch };
  cache.set(key, s); return s;
}

const flowersAt = (u: number, v: number, n = 5) => {
  const cols = ["#ff6b8a", "#ffd23f", "#ffffff", "#ff8f3f", "#c86bff"];
  for (let i = 0; i < n; i++) { const p = P(u + (i % 3) * 0.08, v + Math.floor(i / 3) * 0.08); circle({ x: p.x, y: p.y - 2 }, 1.8, cols[i % cols.length]); }
};
const chimney = (u: number, v: number, h0: number, h1: number, col = "#a0533a") => { box(u, v, u + 0.1, v + 0.1, h0, h1, col); box(u - 0.015, v - 0.015, u + 0.115, v + 0.115, h1, h1 + 2, "#5a3a2a"); };

const ART: Record<string, () => void> = {
  cottage() {
    shadow(0.18, 0.2, 0.82, 0.8, 40);
    flat(0.42, 0.8, 0.58, 1, "#d8cdb5");
    box(0.18, 0.2, 0.82, 0.8, 0, 24, "#f4e4c4");
    doorL(0.43, 0.57, 0.8, 15);
    winL(0.22, 0.36, 0.8, 8, 17); winL(0.64, 0.78, 0.8, 8, 17);
    winR(0.82, 0.3, 0.48, 8, 17); winR(0.82, 0.55, 0.72, 8, 17);
    gable(0.18, 0.2, 0.82, 0.8, 24, 18, true, "#d9534f", "#f4e4c4");
    chimney(0.3, 0.26, 32, 46);
    bush(0.12, 0.92, 0.6); flowersAt(0.66, 0.86, 4);
  },
  townhouse() {
    shadow(0.15, 0.15, 0.85, 1.85, 70);
    box(0.15, 0.15, 0.85, 1.85, 0, 62, "#f2d27a");
    box(0.15, 0.15, 0.85, 1.85, 0, 3, "#b98a52");
    doorL(0.4, 0.6, 1.85, 16, "#3f6e8c");
    for (const f of [0, 1, 2]) {
      const h = 6 + f * 19;
      if (f > 0) winL(0.38, 0.62, 1.85, h, h + 12);
      for (const v of [0.35, 0.85, 1.35]) winR(0.85, v, v + 0.25, h, h + 12);
    }
    gable(0.15, 0.15, 0.85, 1.85, 62, 20, false, "#8b4a2b", "#f2d27a");
    winL(0.43, 0.57, 1.85, 66, 74);
    chimney(0.62, 0.4, 70, 86);
    flowersAt(0.18, 1.9, 3);
  },
  house() {
    shadow(0.25, 0.25, 1.6, 1.55, 70);
    flat(0.1, 0.1, 1.9, 1.9, "#8fcd5a");
    flat(0.8, 1.55, 1.05, 1.95, "#e2d6bc");
    fence(0.08, 0.08, 1.92, 1.92, "#ffffff", false);
    box(0.25, 0.25, 1.6, 1.55, 0, 46, "#d7e8f2");
    for (const u of [0.35, 1.25]) { winL(u, u + 0.22, 1.55, 6, 18); winL(u, u + 0.22, 1.55, 28, 40); }
    winL(0.8, 1.05, 1.55, 28, 40);
    doorL(0.82, 1.03, 1.55, 18, "#b5482f");
    box(0.75, 1.55, 1.1, 1.75, 20, 22, "#ffffff");
    for (const v of [0.4, 0.95]) { winR(1.6, v, v + 0.3, 6, 18); winR(1.6, v, v + 0.3, 28, 40); }
    hip(0.25, 0.25, 1.6, 1.55, 46, 24, "#3d6fa8");
    chimney(1.2, 0.5, 56, 74, "#c46a4a");
    box(1.65, 0.3, 1.9, 1.1, 0, 22, "#c9d6de"); gable(1.65, 0.3, 1.9, 1.1, 22, 8, false, "#3d6fa8", "#c9d6de", 0.04);
    tree(1.75, 1.7, 0.75); bush(0.25, 1.75, 0.8); flowersAt(0.4, 1.65, 5);
  },
  apartment() {
    shadow(0.15, 0.15, 1.85, 1.85, 110);
    box(0.15, 0.15, 1.85, 1.85, 0, 96, "#f0b48a");
    box(0.15, 0.15, 1.85, 1.85, 0, 14, "#c98d68");
    winL(0.8, 1.2, 1.85, 0, 12, "#6fb3d4");
    box(0.72, 1.85, 1.28, 2.05, 13, 15, "#ffffff");
    for (let f = 1; f < 5; f++) {
      const h = 18 + (f - 1) * 19;
      for (const u of [0.25, 0.55, 1.25, 1.55]) winL(u, u + 0.2, 1.85, h, h + 12);
      box(0.22, 1.85, 0.8, 1.97, h - 2, h, "#ffffff"); box(1.2, 1.85, 1.78, 1.97, h - 2, h, "#ffffff");
      for (const v of [0.3, 0.7, 1.1, 1.5]) winR(1.85, v, v + 0.2, h, h + 12);
    }
    flatRoof(0.15, 0.15, 1.85, 1.85, 96, "#d89a70");
    box(0.4, 0.4, 0.75, 0.7, 100, 110, "#b8c2c8"); box(1.1, 0.5, 1.4, 0.75, 100, 108, "#c9d1d6");
    cyl(1.5, 1.4, 0.18, 100, 118, "#9aa6ad");
  },
  villa() {
    shadow(0.2, 0.2, 1.8, 1.4, 60);
    flat(0.05, 0.05, 1.95, 2.95, "#93d061");
    flat(0.15, 1.5, 1.05, 2.85, "#ece6d8");
    flat(0.25, 1.6, 0.95, 2.75, "#4fc3e8");
    flat(0.3, 1.65, 0.6, 2.2, "rgba(255,255,255,0.25)", 0, null);
    box(0.2, 0.2, 1.8, 1.4, 0, 40, "#fbf6ec");
    for (const u of [0.3, 0.7, 1.2]) winL(u, u + 0.25, 1.4, 8, 28, "#8fd0ee", "#d0703c");
    for (const v of [0.4, 0.9]) winR(1.8, v, v + 0.3, 8, 28, "#7cbcd8", "#d0703c");
    hip(0.2, 0.2, 1.8, 1.4, 40, 22, "#d0703c");
    box(1.1, 1.4, 1.8, 2.6, 0, 26, "#fbf6ec");
    winL(1.25, 1.65, 2.6, 4, 20, "#8fd0ee", "#d0703c");
    for (const v of [1.6, 2.1]) winR(1.8, v, v + 0.3, 6, 20, "#7cbcd8", "#d0703c");
    gable(1.1, 1.4, 1.8, 2.6, 26, 14, false, "#d0703c", "#fbf6ec");
    // deck chairs + umbrella
    box(0.15, 2.85, 0.35, 2.95, 0, 3, "#ffffff");
    const c = P(1.0, 2.8); line(c, { x: c.x, y: c.y - 24 }, "#7a5230", 1.5);
    poly([{ x: c.x - 13, y: c.y - 20 }, { x: c.x + 13, y: c.y - 20 }, { x: c.x, y: c.y - 30 }], "#f25f5c");
    pine(1.9, 0.1, 0.8);
  },
  shop() {
    shadow(0.2, 0.2, 1.8, 1.7, 50);
    flat(0.1, 1.7, 1.9, 1.95, "#e8dcc4");
    box(0.2, 0.2, 1.8, 1.7, 0, 36, "#f7efe2");
    box(0.2, 0.2, 1.8, 1.7, 0, 4, "#9a6a4a");
    winL(0.3, 0.8, 1.7, 4, 20, "#bfe6f7"); winL(1.25, 1.7, 1.7, 4, 20, "#bfe6f7");
    doorL(0.9, 1.15, 1.7, 20, "#2f7a46");
    winR(1.8, 0.35, 0.8, 4, 20, "#a6d3e6"); winR(1.8, 1.0, 1.45, 4, 20, "#a6d3e6");
    // awnings
    for (let i = 0; i < 8; i++) {
      const u0 = 0.2 + i * 0.2, u1 = u0 + 0.2;
      poly([P(u0, 1.7, 26), P(u1, 1.7, 26), P(u1, 1.98, 18), P(u0, 1.98, 18)], i % 2 ? "#ffffff" : "#e2483d", "rgba(0,0,0,0.15)");
    }
    for (let i = 0; i < 7; i++) {
      const v0 = 0.2 + i * 0.214, v1 = v0 + 0.214;
      poly([P(1.8, v0, 26), P(1.8, v1, 26), P(2.02, v1, 18), P(2.02, v0, 18)], i % 2 ? "#e9e9e9" : "#c23a30", "rgba(0,0,0,0.15)");
    }
    flatRoof(0.2, 0.2, 1.8, 1.7, 36, "#d6c7ae");
    box(0.5, 1.55, 1.5, 1.65, 40, 54, "#2f7a46");
    poly([P(0.6, 1.65, 43), P(1.4, 1.65, 43), P(1.4, 1.65, 51), P(0.6, 1.65, 51)], "#f7e7a1", null);
    box(0.4, 0.4, 0.7, 0.7, 40, 48, "#b8c2c8");
    box(0.1, 1.75, 0.3, 1.9, 0, 8, "#c8843d"); box(1.7, 1.75, 1.9, 1.9, 0, 8, "#7fb24a");
  },
  cafe() {
    shadow(0.2, 0.2, 1.8, 1.0, 45);
    flat(0.1, 1.0, 1.9, 1.9, "#c79a6a"); 
    for (let i = 1; i < 9; i++) line(P(0.1 + i * 0.2, 1.0), P(0.1 + i * 0.2, 1.9), "rgba(90,55,30,0.35)", 0.8);
    box(0.2, 0.2, 1.8, 1.0, 0, 32, "#fde3b0");
    winL(0.3, 0.7, 1.0, 4, 22, "#ffe9a8"); winL(1.2, 1.7, 1.0, 4, 22, "#ffe9a8"); doorL(0.85, 1.05, 1.0, 22, "#3c8d7a");
    winR(1.8, 0.35, 0.8, 6, 22, "#ffd98a");
    gable(0.2, 0.2, 1.8, 1.0, 32, 16, true, "#3c8d7a", "#fde3b0");
    for (const [u, v, c] of [[0.5, 1.4, "#f25f5c"], [1.2, 1.3, "#ffd23f"], [0.9, 1.75, "#3c8d7a"], [1.6, 1.7, "#f25f5c"]] as const) {
      const p = P(u, v);
      ellipse({ x: p.x, y: p.y }, 7, 3.5, "#ffffff"); line(p, { x: p.x, y: p.y - 22 }, "#666", 1.2);
      poly([{ x: p.x - 14, y: p.y - 19 }, { x: p.x + 14, y: p.y - 19 }, { x: p.x, y: p.y - 29 }], c);
      poly([{ x: p.x, y: p.y - 19 }, { x: p.x + 14, y: p.y - 19 }, { x: p.x, y: p.y - 29 }], shade(c, -0.2), null);
    }
    bush(0.15, 1.9, 0.7); bush(1.9, 1.05, 0.7);
  },
  school() {
    shadow(0.2, 0.3, 2.8, 1.3, 60);
    flat(0.1, 1.35, 2.9, 2.9, "#dccba4");
    line(P(1.6, 1.6), P(1.6, 2.7), "#ffffff", 1.2); line(P(0.4, 2.15), P(2.7, 2.15), "#ffffff", 1.2);
    box(0.2, 0.3, 2.8, 1.3, 0, 40, "#e3965f");
    for (let i = 0; i < 7; i++) { const u = 0.3 + i * 0.35; if (i !== 3) { winL(u, u + 0.22, 1.3, 6, 18); winL(u, u + 0.22, 1.3, 24, 34); } }
    doorL(1.35, 1.65, 1.3, 20, "#3f6e8c");
    winR(2.8, 0.5, 0.8, 6, 18); winR(2.8, 0.5, 0.8, 24, 34); winR(2.8, 0.9, 1.15, 6, 18); winR(2.8, 0.9, 1.15, 24, 34);
    gable(0.2, 0.3, 2.8, 1.3, 40, 18, true, "#5a6f8a", "#e3965f");
    box(1.3, 0.6, 1.7, 1.0, 50, 76, "#f3ead8");
    circle(P(1.5, 1.0, 66), 4, "#ffffff", "#5a6f8a");
    hip(1.3, 0.6, 1.7, 1.0, 76, 18, "#5a6f8a", 0.05);
    const f = P(2.6, 2.6); line(f, { x: f.x, y: f.y - 50 }, "#cfcfcf", 1.5);
    poly([{ x: f.x, y: f.y - 50 }, { x: f.x + 14, y: f.y - 45 }, { x: f.x, y: f.y - 40 }], "#e2483d");
    tree(0.4, 2.6, 0.8); tree(2.65, 1.6, 0.7, 1);
    const h = P(0.8, 1.8); line(h, { x: h.x, y: h.y - 22 }, "#555", 1.5); box(0.72, 1.74, 0.88, 1.78, 20, 28, "#ffffff");
  },
  townhall() {
    flat(0.05, 0.05, 2.95, 2.95, "#e7dcc6");
    for (let i = 1; i < 6; i++) { line(P(0.05 + i * 0.5, 0.05), P(0.05 + i * 0.5, 2.95), "rgba(150,130,100,0.25)", 0.7); line(P(0.05, 0.05 + i * 0.5), P(2.95, 0.05 + i * 0.5), "rgba(150,130,100,0.25)", 0.7); }
    shadow(0.3, 0.4, 2.7, 2.0, 80);
    box(0.3, 0.4, 2.7, 2.0, 0, 46, "#f4ecd8");
    for (const u of [0.4, 0.7, 2.1, 2.4]) { winL(u, u + 0.18, 2.0, 8, 22, "#9fd8f2", "#f8f4ea"); winL(u, u + 0.18, 2.0, 28, 40, "#9fd8f2", "#f8f4ea"); }
    for (const v of [0.6, 1.0, 1.4]) { winR(2.7, v, v + 0.2, 8, 22); winR(2.7, v, v + 0.2, 28, 40); }
    hip(0.3, 0.4, 2.7, 2.0, 46, 26, "#4f7fb5");
    box(1.25, 0.95, 1.75, 1.45, 56, 86, "#f4ecd8");
    circle(P(1.5, 1.45, 76), 6, "#ffffff", "#8a6a2a"); line(P(1.5, 1.45, 76), P(1.5, 1.45, 80), "#333", 1); line(P(1.5, 1.45, 76), P(1.53, 1.45, 76), "#333", 1);
    winR(1.75, 1.05, 1.35, 60, 70);
    const d = P(1.5, 1.2, 86);
    ctx().beginPath(); ctx().ellipse(d.x, d.y, 20, 10, 0, Math.PI, 0); ctx().quadraticCurveTo(d.x + 20, d.y - 26, d.x, d.y - 30); ctx().quadraticCurveTo(d.x - 20, d.y - 26, d.x - 20, d.y); ctx().fillStyle = "#e7b63c"; ctx().fill(); ctx().strokeStyle = "#a07a20"; ctx().stroke();
    line({ x: d.x, y: d.y - 30 }, { x: d.x, y: d.y - 40 }, "#a07a20", 1.5);
    // portico
    box(0.95, 2.0, 2.05, 2.5, 0, 3, "#ece4d0"); box(0.95, 2.25, 2.05, 2.6, 0, 1.5, "#ece4d0");
    doorL(1.35, 1.65, 2.0, 24, "#7a4a2a");
    box(0.9, 2.0, 2.1, 2.3, 40, 46, "#ffffff");
    poly([P(0.9, 2.3, 46), P(2.1, 2.3, 46), P(1.5, 2.3, 62)], "#fbf7ee");
    for (let i = 0; i < 5; i++) { const u = 0.98 + i * 0.27; box(u, 2.14, u + 0.08, 2.22, 3, 40, "#ffffff"); }
    for (const u of [0.15, 2.85]) { const p = P(u, 2.85); line(p, { x: p.x, y: p.y - 44 }, "#bbb", 1.4); poly([{ x: p.x, y: p.y - 44 }, { x: p.x + 12, y: p.y - 40 }, { x: p.x, y: p.y - 36 }], "#3a8fd6"); }
    bush(0.3, 2.4, 0.9); bush(2.7, 2.4, 0.9); flowersAt(0.4, 2.6, 6); flowersAt(2.4, 2.6, 6);
  },
  park() {
    flat(0.04, 0.04, 1.96, 1.96, "#92d363");
    flat(0.85, 0.04, 1.15, 1.96, "#ead9b0", 0, null); flat(0.04, 0.85, 1.96, 1.15, "#ead9b0", 0, null);
    for (const [u, v] of [[0.4, 0.4], [1.6, 1.6], [0.4, 1.6]]) { const p = P(u, v); ellipse(p, 18, 9, "#6fb84a"); flowersAt(u - 0.1, v - 0.1, 6); }
    cyl(1, 1, 0.42, 0, 6, "#cfc8b8", "#5ec2ea");
    cyl(1, 1, 0.12, 6, 16, "#d8d2c4", "#5ec2ea");
    box(1.3, 0.25, 1.7, 0.35, 4, 6, "#9a6a3a"); box(0.25, 1.3, 0.35, 1.7, 4, 6, "#9a6a3a");
    tree(1.6, 0.35, 0.8); pine(0.3, 0.3, 0.75);
    const lp = P(1.25, 1.75); line(lp, { x: lp.x, y: lp.y - 28 }, "#3a3a3a", 1.4); circle({ x: lp.x, y: lp.y - 29 }, 3, "#fff3b0");
  },
  tree() { tree(0.5, 0.55, 1.05); },
  pine() { pine(0.5, 0.55, 1.1); },
  flowers() {
    const p = P(0.5, 0.5); ellipse(p, 22, 11, "#6b4a2a"); ellipse({ x: p.x, y: p.y - 1 }, 20, 9.5, "#5b8f3a");
    const cols = ["#ff6b8a", "#ffd23f", "#ffffff", "#ff8f3f"];
    for (let i = 0; i < 16; i++) { const a = i * 2.4, r = (i % 4) * 4 + 3; circle({ x: p.x + Math.cos(a) * r * 1.3, y: p.y - 3 + Math.sin(a) * r * 0.6 }, 2.4, cols[i % 4]); }
  },
  field() {
    flat(0.04, 0.04, 0.96, 0.96, "#9b6a3a", 0, "rgba(80,50,20,0.4)");
    flat(0.08, 0.08, 0.92, 0.92, "#a8763f", 1, null);
    for (let i = 1; i < 5; i++) line(P(0.1, i * 0.2, 1), P(0.9, i * 0.2, 1), "#8a5a2e", 1.2);
  },
  barn() {
    cyl(1.6, 0.45, 0.3, 0, 62, "#dcdcd2"); ring(1.6, 0.45, 0.3, 20, "#b8b8ae"); ring(1.6, 0.45, 0.3, 40, "#b8b8ae");
    const t = P(1.6, 0.45, 62); ctx().beginPath(); ctx().ellipse(t.x, t.y, 13.5, 6.7, 0, Math.PI, 0); ctx().quadraticCurveTo(t.x + 12, t.y - 14, t.x, t.y - 16); ctx().quadraticCurveTo(t.x - 12, t.y - 14, t.x - 13.5, t.y); ctx().fillStyle = "#c0473d"; ctx().fill();
    shadow(0.2, 0.4, 1.5, 1.7, 55);
    box(0.2, 0.4, 1.5, 1.7, 0, 36, "#c8423a");
    const dl = [P(0.55, 1.7, 0), P(1.15, 1.7, 0), P(1.15, 1.7, 26), P(0.55, 1.7, 26)];
    poly(dl, "#9a2f28", "#ffffff", 1.5);
    line(dl[0], dl[2], "#ffffff", 1.5); line(dl[1], dl[3], "#ffffff", 1.5); line(P(0.85, 1.7, 0), P(0.85, 1.7, 26), "#ffffff", 1.2);
    winR(1.5, 0.7, 1.0, 12, 24, "#f2d27a", "#ffffff"); winR(1.5, 1.15, 1.45, 12, 24, "#f2d27a", "#ffffff");
    gable(0.2, 0.4, 1.5, 1.7, 36, 26, false, "#6d5a52", "#c8423a");
    winL(0.75, 0.95, 1.7, 42, 52, "#f2d27a", "#ffffff");
    for (const [u, v] of [[1.65, 1.5], [1.8, 1.75], [1.62, 1.85]]) cyl(u, v, 0.12, 0, 10, "#e8c25a", "#f2d27a");
  },
  cowshed() {
    flat(0.05, 0.05, 1.95, 2.95, "#9bd567");
    for (let i = 0; i < 10; i++) { const p = P(0.3 + (i % 3) * 0.6, 1.2 + Math.floor(i / 3) * 0.5); line(p, { x: p.x + 2, y: p.y - 4 }, "#6fb248", 1); }
    fence(0.05, 0.05, 1.95, 2.95, "#f4ead8", false);
    box(0.15, 0.15, 1.85, 0.95, 0, 30, "#b5653c");
    for (const u of [0.35, 1.35]) winL(u, u + 0.3, 0.95, 0, 20, "#5a3a2a", "#ffffff");
    winR(1.85, 0.35, 0.7, 12, 22, "#f2d27a", "#ffffff");
    gable(0.15, 0.15, 1.85, 0.95, 30, 16, true, "#7a5640", "#b5653c");
    box(0.3, 2.3, 1.0, 2.45, 0, 7, "#8a5a36", "#6fb8d8");
  },
  cowshedFront() { fence(0.05, 0.05, 1.95, 2.95, "#f4ead8", true); },
  coop() {
    flat(0.05, 0.05, 1.95, 1.95, "#dcc68c");
    fence(0.05, 0.05, 1.95, 1.95, "#f4ead8", false);
    box(0.2, 0.2, 1.1, 0.95, 0, 6, "#7a5230");
    box(0.2, 0.2, 1.1, 0.95, 6, 28, "#efd7a2");
    winL(0.5, 0.75, 0.95, 8, 22, "#5a3a2a", "#ffffff");
    line(P(0.62, 0.95, 6), P(0.75, 1.35, 0), "#9a6a3a", 3);
    gable(0.2, 0.2, 1.1, 0.95, 28, 14, true, "#d9534f", "#efd7a2");
    box(1.3, 0.3, 1.7, 0.5, 0, 5, "#c8a46a", "#e8c25a");
  },
  coopFront() { fence(0.05, 0.05, 1.95, 1.95, "#f4ead8", true); },
  feedmill() {
    shadow(0.45, 0.45, 1.55, 1.55, 80);
    box(0.45, 0.45, 1.55, 1.55, 0, 58, "#dccaa6");
    for (let h = 10; h < 58; h += 10) { line(P(0.45, 1.55, h), P(1.55, 1.55, h), "rgba(120,100,70,0.3)", 0.8); line(P(1.55, 1.55, h), P(1.55, 0.45, h), "rgba(120,100,70,0.3)", 0.8); }
    doorL(0.8, 1.05, 1.55, 18, "#7a4a2a"); winR(1.55, 0.8, 1.05, 30, 42);
    hip(0.45, 0.45, 1.55, 1.55, 58, 30, "#8a5a3a");
    box(1.25, 1.2, 1.9, 1.9, 0, 20, "#c9a46a"); gable(1.25, 1.2, 1.9, 1.9, 20, 10, true, "#6d5a52", "#c9a46a", 0.04);
    for (const [u, v] of [[0.2, 1.7], [0.35, 1.85], [0.15, 1.95]]) { box(u, v - 0.1, u + 0.14, v, 0, 7, "#efe0bf"); }
  },
  bakery() {
    shadow(0.2, 0.2, 1.8, 1.7, 60);
    box(0.2, 0.2, 1.8, 1.7, 0, 38, "#c96f4a");
    for (let h = 6; h < 38; h += 6) { line(P(0.2, 1.7, h), P(1.8, 1.7, h), "rgba(110,50,30,0.3)", 0.6); line(P(1.8, 1.7, h), P(1.8, 0.2, h), "rgba(80,30,20,0.3)", 0.6); }
    winL(0.3, 0.75, 1.7, 6, 24, "#ffd27a"); winL(1.3, 1.7, 1.7, 6, 24, "#ffd27a"); doorL(0.9, 1.15, 1.7, 24, "#5b3a2a");
    for (let i = 0; i < 8; i++) { const u0 = 0.2 + i * 0.2; poly([P(u0, 1.7, 30), P(u0 + 0.2, 1.7, 30), P(u0 + 0.2, 1.92, 24), P(u0, 1.92, 24)], i % 2 ? "#f7e7c4" : "#7a4a2a", "rgba(0,0,0,0.15)"); }
    winR(1.8, 0.45, 0.85, 8, 24, "#ffc65a"); winR(1.8, 1.05, 1.45, 8, 24, "#ffc65a");
    gable(0.2, 0.2, 1.8, 1.7, 38, 20, false, "#5b3a2a", "#c96f4a");
    circle(P(1.0, 1.7, 48), 6, "#f3d36b", "#7a4a2a");
    box(1.35, 0.35, 1.6, 0.6, 40, 78, "#8a4a3a"); box(1.32, 0.32, 1.63, 0.63, 78, 82, "#5a3a2a");
  },
  dairy() {
    cyl(0.6, 0.55, 0.33, 0, 72, "#e3eaf0"); ring(0.6, 0.55, 0.33, 24, "#5b9bd5", 2); ring(0.6, 0.55, 0.33, 48, "#5b9bd5", 2);
    cyl(1.4, 0.55, 0.33, 0, 72, "#e3eaf0"); ring(1.4, 0.55, 0.33, 24, "#5b9bd5", 2); ring(1.4, 0.55, 0.33, 48, "#5b9bd5", 2);
    line(P(0.6, 0.55, 74), P(1.4, 0.55, 74), "#9aa6ad", 3);
    shadow(0.2, 1.05, 1.8, 2.8, 60);
    box(0.2, 1.05, 1.8, 2.8, 0, 44, "#eef3f7");
    poly([P(0.2, 2.8, 30), P(1.8, 2.8, 30), P(1.8, 2.8, 36), P(0.2, 2.8, 36)], "#3a7cc4", null);
    poly([P(1.8, 2.8, 30), P(1.8, 1.05, 30), P(1.8, 1.05, 36), P(1.8, 2.8, 36)], "#2c62a0", null);
    for (const u of [0.3, 0.75, 1.4]) winL(u, u + 0.25, 2.8, 10, 24);
    poly([P(1.0, 2.8, 0), P(1.3, 2.8, 0), P(1.3, 2.8, 22), P(1.0, 2.8, 22)], "#6c7a86");
    for (const v of [1.3, 1.8, 2.3]) winR(1.8, v, v + 0.3, 10, 24);
    flatRoof(0.2, 1.05, 1.8, 2.8, 44, "#c9d4dc");
    box(1.4, 1.3, 1.6, 1.5, 48, 86, "#d8dfe5"); box(1.38, 1.28, 1.62, 1.52, 86, 90, "#5b9bd5");
    box(0.4, 1.4, 0.9, 1.8, 48, 56, "#b8c2c8");
  },
  sugar() {
    cyl(1.55, 0.4, 0.15, 0, 96, "#b84a3a"); ring(1.55, 0.4, 0.15, 80, "#ffffff", 3); ring(1.55, 0.4, 0.15, 70, "#ffffff", 3);
    shadow(0.2, 0.2, 1.8, 1.8, 50);
    box(0.2, 0.7, 1.8, 1.8, 0, 34, "#e7d9bc");
    for (const u of [0.35, 0.85]) winL(u, u + 0.3, 1.8, 8, 24, "#9fd8f2");
    poly([P(1.3, 1.8, 0), P(1.65, 1.8, 0), P(1.65, 1.8, 24), P(1.3, 1.8, 24)], "#5f6f7a");
    for (const v of [0.9, 1.35]) winR(1.8, v, v + 0.3, 8, 24);
    for (let i = 0; i < 3; i++) {
      const v0 = 0.7 + i * 0.367, v1 = v0 + 0.367;
      poly([P(0.2, v0, 34), P(1.8, v0, 34), P(1.8, v0, 50), P(0.2, v0, 50)], "#9fd8f2");
      poly([P(0.2, v0, 50), P(1.8, v0, 50), P(1.8, v1, 34), P(0.2, v1, 34)], "#8a8f96");
      poly([P(1.8, v0, 34), P(1.8, v0, 50), P(1.8, v1, 34)], shade("#e7d9bc", -0.25));
    }
    box(0.25, 0.2, 0.9, 0.6, 0, 18, "#d0b88a");
    for (const [u, v] of [[1.95, 1.0], [1.95, 1.3]]) box(u - 0.08, v - 0.2, u, v + 0.1, 0, 6, "#9bc95a");
  },
  textile() {
    cyl(0.5, 0.35, 0.15, 0, 104, "#a84a3a"); cyl(2.5, 0.35, 0.15, 0, 104, "#a84a3a"); ring(0.5, 0.35, 0.15, 90, "#ffffff", 3); ring(2.5, 0.35, 0.15, 90, "#ffffff", 3);
    cyl(1.5, 0.35, 0.22, 30, 60, "#8aa0b2"); for (const du of [-0.15, 0.15]) line(P(1.5 + du, 0.35, 0), P(1.5 + du, 0.35, 32), "#6a7d8c", 2);
    shadow(0.2, 0.6, 2.8, 2.6, 60);
    box(0.2, 0.6, 2.8, 2.6, 0, 44, "#b9c7d6");
    box(0.2, 0.6, 2.8, 2.6, 0, 6, "#7f8f9f");
    for (let i = 0; i < 6; i++) { const u = 0.3 + i * 0.42; if (i !== 2) winL(u, u + 0.28, 2.6, 12, 32, "#bfe6f7"); }
    poly([P(1.15, 2.6, 0), P(1.55, 2.6, 0), P(1.55, 2.6, 30), P(1.15, 2.6, 30)], "#56636f");
    for (const v of [0.9, 1.4, 1.95]) winR(2.8, v, v + 0.3, 12, 32);
    for (let i = 0; i < 4; i++) {
      const v0 = 0.6 + i * 0.5, v1 = v0 + 0.5;
      poly([P(0.2, v0, 44), P(2.8, v0, 44), P(2.8, v0, 62), P(0.2, v0, 62)], "#a6dcf2");
      poly([P(0.2, v0, 62), P(2.8, v0, 62), P(2.8, v1, 44), P(0.2, v1, 44)], "#6f7f8f");
      poly([P(2.8, v0, 44), P(2.8, v0, 62), P(2.8, v1, 44)], shade("#b9c7d6", -0.25));
    }
    const cols = ["#d65a5a", "#6aa6d8", "#f2c14e", "#6bbf6b"];
    for (let i = 0; i < 4; i++) cyl(0.35 + i * 0.25, 2.8, 0.09, 0, 14, cols[i]);
  },
  warehouse() {
    shadow(0.15, 0.2, 1.85, 1.8, 50);
    box(0.15, 0.2, 1.85, 1.8, 0, 38, "#9aa7b1");
    for (let i = 1; i < 16; i++) { const u = 0.15 + i * 0.106; line(P(u, 1.8, 0), P(u, 1.8, 38), "rgba(60,70,80,0.25)", 0.7); }
    for (let i = 1; i < 15; i++) { const v = 0.2 + i * 0.106; line(P(1.85, v, 0), P(1.85, v, 38), "rgba(40,50,60,0.3)", 0.7); }
    poly([P(0.5, 1.8, 0), P(1.2, 1.8, 0), P(1.2, 1.8, 28), P(0.5, 1.8, 28)], "#d9a43a");
    for (let h = 3; h < 28; h += 3) line(P(0.5, 1.8, h), P(1.2, 1.8, h), "rgba(120,80,20,0.4)", 0.6);
    gable(0.15, 0.2, 1.85, 1.8, 38, 12, true, "#6f7d88", "#9aa7b1");
    for (const [u, v, c] of [[1.5, 1.95, "#b98a55"], [1.7, 1.95, "#c8a06a"], [1.6, 1.95, "#b98a55"]] as const) box(u - 0.08, v - 0.1, u + 0.08, v, 0, 10, c);
    box(1.52, 1.85, 1.68, 1.95, 10, 18, "#c8a06a");
  },
  station() {
    flat(0, 0, 3, 0.62, "#cfc8ba", 3);
    box(0, 0, 3, 0.62, 0, 3, "#cfc8ba");
    line(P(0, 0.06, 3.2), P(3, 0.06, 3.2), "#f2c94c", 1.5);
    shadow(0.5, 0.7, 2.5, 1.8, 50);
    box(0.5, 0.75, 2.5, 1.8, 0, 38, "#f2e2c4");
    for (const u of [0.65, 1.0, 1.85, 2.2]) winL(u, u + 0.2, 1.8, 8, 26, "#9fd8f2", "#7a4a2a");
    doorL(1.35, 1.65, 1.8, 26, "#7a4a2a");
    winR(2.5, 1.0, 1.3, 8, 26, "#7cbcd8", "#7a4a2a"); winR(2.5, 1.4, 1.65, 8, 26, "#7cbcd8", "#7a4a2a");
    hip(0.5, 0.75, 2.5, 1.8, 38, 20, "#a2463c");
    box(1.3, 1.05, 1.7, 1.45, 46, 70, "#f2e2c4"); circle(P(1.5, 1.45, 60), 5, "#ffffff", "#7a4a2a");
    hip(1.3, 1.05, 1.7, 1.45, 70, 14, "#a2463c", 0.04);
    for (const u of [0.2, 1.0, 2.0, 2.8]) line(P(u, 0.45, 3), P(u, 0.45, 28), "#3b4b55", 2);
    poly([P(0.05, 0.02, 30), P(2.95, 0.02, 30), P(2.95, 0.62, 26), P(0.05, 0.62, 26)], "#2f6f8f");
    poly([P(0.05, 0.62, 26), P(2.95, 0.62, 26), P(2.95, 0.62, 23), P(0.05, 0.62, 23)], "#245873", null);
    box(0.4, 0.3, 0.7, 0.36, 3, 7, "#8a5a36"); box(2.3, 0.3, 2.6, 0.36, 3, 7, "#8a5a36");
    flat(1.3, 1.8, 1.7, 2.0, "#d8cdb5");
  },
  orders() {
    shadow(0.2, 0.3, 1.0, 0.5, 30);
    for (const u of [0.25, 0.95]) box(u, 0.42, u + 0.06, 0.48, 0, 34, "#7a5230");
    poly([P(0.2, 0.5, 12), P(1.05, 0.5, 12), P(1.05, 0.5, 36), P(0.2, 0.5, 36)], "#a8743f");
    poly([P(0.15, 0.5, 36), P(1.1, 0.5, 36), P(1.1, 0.3, 42), P(0.15, 0.3, 42)], "#c0473d");
    for (const [u, h, c] of [[0.3, 20, "#ffffff"], [0.55, 24, "#fff3b0"], [0.8, 19, "#ffffff"]] as const)
      poly([P(u, 0.52, h), P(u + 0.18, 0.52, h), P(u + 0.18, 0.52, h + 10), P(u, 0.52, h + 10)], c, "rgba(0,0,0,0.2)");
    // delivery truck
    shadow(1.15, 0.25, 1.9, 0.75, 20);
    box(1.15, 0.28, 1.65, 0.72, 4, 24, "#f4f4f0");
    box(1.65, 0.3, 1.9, 0.7, 4, 17, "#e2483d"); winR(1.9, 0.38, 0.62, 10, 16, "#7cbcd8", "#e2483d");
    for (const u of [1.3, 1.75]) { const p = P(u, 0.72, 4); ellipse(p, 4, 3.5, "#2b2b2b"); }
  },
  hangar() {
    shadow(0.1, 0.2, 1.9, 1.8, 45);
    box(0.1, 0.2, 1.9, 1.8, 0, 26, "#c7ccd2");
    poly([P(0.4, 1.8, 0), P(1.6, 1.8, 0), P(1.6, 1.8, 24), P(0.4, 1.8, 24)], "#4a535c");
    for (let i = 1; i < 6; i++) line(P(0.4 + i * 0.2, 1.8, 0), P(0.4 + i * 0.2, 1.8, 24), "#3a4148", 0.8);
    // curved roof as segmented arch along u
    const segs = 6;
    for (let i = segs - 1; i >= 0; i--) {
      const a0 = (i / segs) * Math.PI, a1 = ((i + 1) / segs) * Math.PI;
      const v0 = 1.0 + Math.cos(a0) * 0.9, v1 = 1.0 + Math.cos(a1) * 0.9, h0 = 26 + Math.sin(a0) * 22, h1 = 26 + Math.sin(a1) * 22;
      poly([P(0.05, v0, h0), P(1.95, v0, h0), P(1.95, v1, h1), P(0.05, v1, h1)], shade("#9aa4ae", (Math.cos((a0 + a1) / 2)) * 0.25));
    }
    ctx().beginPath();
    for (let i = 0; i <= segs; i++) { const a = (i / segs) * Math.PI; const p = P(1.95, 1.0 + Math.cos(a) * 0.9, 26 + Math.sin(a) * 22); i ? ctx().lineTo(p.x, p.y) : ctx().moveTo(p.x, p.y); }
    ctx().closePath(); ctx().fillStyle = shade("#c7ccd2", -0.25); ctx().fill();
    poly([P(0.6, 1.95, 0), P(1.4, 1.95, 0), P(1.4, 1.95, 0.5), P(0.6, 1.95, 0.5)], "#f2c94c", null);
  },
  tower() {
    shadow(0.3, 0.3, 0.7, 0.7, 90);
    cyl(0.5, 0.5, 0.18, 0, 70, "#f4f4f0"); ring(0.5, 0.5, 0.18, 30, "#e2483d", 3);
    box(0.22, 0.22, 0.78, 0.78, 70, 74, "#d8d8d0");
    box(0.25, 0.25, 0.75, 0.75, 74, 88, "#6fc0e2", "#5aa8c8");
    box(0.2, 0.2, 0.8, 0.8, 88, 92, "#59646e");
    line(P(0.5, 0.5, 92), P(0.5, 0.5, 108), "#59646e", 1.5); circle(P(0.5, 0.5, 108), 2, "#e2483d");
  },
  harbor() {
    shadow(0.2, 0.2, 1.8, 1.8, 50);
    box(0.2, 0.2, 1.8, 1.8, 0, 36, "#5d8fb8");
    box(0.2, 0.2, 1.8, 1.8, 0, 4, "#3e6688");
    for (const u of [0.35, 1.3]) winL(u, u + 0.3, 1.8, 10, 26, "#bfe6f7");
    doorL(0.85, 1.15, 1.8, 24, "#ffffff");
    winR(1.8, 0.45, 0.8, 10, 26); winR(1.8, 1.1, 1.45, 10, 26);
    gable(0.2, 0.2, 1.8, 1.8, 36, 18, true, "#e9ecef", "#5d8fb8");
    const lb = P(1.8, 1.0, 18); ctx().beginPath(); ctx().ellipse(lb.x, lb.y, 5, 7, 0, 0, Math.PI * 2); ctx().strokeStyle = "#e2483d"; ctx().lineWidth = 3; ctx().stroke();
    for (const [u, v] of [[0.1, 1.95], [0.3, 1.95]]) box(u, v - 0.12, u + 0.15, v, 0, 9, "#b98a55");
  },
  crane() {
    for (const [u, v] of [[0.15, 0.15], [0.75, 0.15], [0.15, 0.75], [0.75, 0.75]]) box(u, v, u + 0.1, v + 0.1, 0, 40, "#f2b632");
    line(P(0.2, 0.85, 4), P(0.8, 0.85, 36), "#d99a1e", 2); line(P(0.85, 0.2, 4), P(0.85, 0.8, 36), "#c4891a", 2);
    box(0.12, 0.12, 0.88, 0.88, 40, 48, "#f2b632");
    box(0.38, 0.38, 0.62, 0.62, 48, 78, "#f2b632");
    box(0.55, 0.3, 0.85, 0.6, 48, 62, "#e9ecef"); winR(0.85, 0.35, 0.55, 52, 60);
  },
  containers() {
    const cols = ["#d9534f", "#3a7cc4", "#4caf50", "#f2994a", "#7a8a96"];
    box(0.1, 0.15, 0.9, 0.48, 0, 16, cols[0]); box(0.1, 0.52, 0.9, 0.85, 0, 16, cols[1]); box(0.1, 0.15, 0.9, 0.48, 16, 32, cols[3]);
    for (let i = 1; i < 8; i++) { line(P(0.1 + i * 0.1, 0.85, 0), P(0.1 + i * 0.1, 0.85, 16), "rgba(0,0,0,0.18)", 0.6); line(P(0.1 + i * 0.1, 0.48, 16), P(0.1 + i * 0.1, 0.48, 32), "rgba(0,0,0,0.18)", 0.6); }
  },
};

export function buildingSprite(defId: string, restore: CanvasRenderingContext2D): Sprite {
  const d = BUILDINGS[defId];
  return sprite(defId, d.w, d.h, ART[defId] ?? (() => box(0.1, 0.1, d.w - 0.1, d.h - 0.1, 0, 20, "#cccccc")), restore);
}
export function frontSprite(defId: string, restore: CanvasRenderingContext2D): Sprite | null {
  const k = defId + "Front"; if (!ART[k]) return null;
  const d = BUILDINGS[defId];
  return sprite(k, d.w, d.h, ART[k], restore);
}

const CROP_LOOK: Record<string, { leaf: string; ripe: string; tall: number }> = {
  wheat: { leaf: "#8cc152", ripe: "#e8c25a", tall: 14 },
  corn: { leaf: "#5fae3c", ripe: "#f2d23c", tall: 22 },
  carrot: { leaf: "#5fae3c", ripe: "#f0802c", tall: 9 },
  sugarcane: { leaf: "#7cbf4a", ripe: "#b9d96a", tall: 24 },
  cotton: { leaf: "#4f8f3a", ripe: "#ffffff", tall: 12 },
};
export function cropSprite(item: ItemId, stage: number, restore: CanvasRenderingContext2D): Sprite {
  return sprite(`crop:${item}:${stage}`, 1, 1, () => {
    const L = CROP_LOOK[item]; const g = [0.35, 0.65, 1, 1][stage];
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const u = 0.17 + i * 0.22, v = 0.17 + j * 0.22, p = P(u, v, 1), t = L.tall * g;
      if (item === "wheat") { for (let k = -1; k <= 1; k++) line({ x: p.x + k * 2, y: p.y }, { x: p.x + k * 3, y: p.y - t }, stage === 3 ? "#c9a040" : L.leaf, 1.4); if (stage === 3) for (let k = -1; k <= 1; k++) ellipse({ x: p.x + k * 3, y: p.y - t }, 1.6, 3.2, L.ripe); }
      else if (item === "corn") { line(p, { x: p.x, y: p.y - t }, L.leaf, 2.2); line({ x: p.x, y: p.y - t * 0.5 }, { x: p.x - 5, y: p.y - t * 0.7 }, L.leaf, 1.5); line({ x: p.x, y: p.y - t * 0.6 }, { x: p.x + 5, y: p.y - t * 0.8 }, L.leaf, 1.5); if (stage === 3) ellipse({ x: p.x + 2, y: p.y - t * 0.55 }, 2, 4, L.ripe); }
      else if (item === "carrot") { if (stage === 3) ellipse({ x: p.x, y: p.y - 1 }, 2.5, 2, L.ripe); for (let k = -1; k <= 1; k++) line(p, { x: p.x + k * 3, y: p.y - t }, L.leaf, 1.5); }
      else if (item === "sugarcane") { for (let k = -1; k <= 1; k += 2) { line({ x: p.x + k, y: p.y }, { x: p.x + k * 2, y: p.y - t }, stage === 3 ? "#a8c75a" : L.leaf, 2); } line({ x: p.x, y: p.y - t * 0.7 }, { x: p.x + 6, y: p.y - t * 0.9 }, "#5fae3c", 1.2); }
      else { circle({ x: p.x, y: p.y - t * 0.5 }, 3.5 * g + 1, L.leaf); if (stage === 3) { circle({ x: p.x - 2, y: p.y - t * 0.6 }, 2.2, L.ripe); circle({ x: p.x + 2, y: p.y - t * 0.7 }, 2.2, L.ripe); } }
    }
  }, restore);
}
