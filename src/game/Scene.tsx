import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BUILDINGS, CROPS, ITEMS, type ItemId } from "./data";
import {
  buildingAt, capacity, collect, createInitialState, cropStage, def, has, harvest,
  levelOf, levelProgress, load, plant, save, startJob, stored, type Building, type GameState,
} from "./state";
import { MAP, hash, terrainAt } from "./world";
import { P, setCtx, flat, line, poly, ellipse } from "./draw";
import { buildingSprite, cropSprite } from "./sprites";

const VIEW_W = 1500;
const VIEW_H = 850;
const MIN_ZOOM = 0.28;
const MAX_ZOOM = 0.78;
const ORIGIN_X = VIEW_W / 2;
const ORIGIN_Y = 86;

function drawWorld(canvas: HTMLCanvasElement, state: GameState, now: number, selected: number | null, zoom: number, camera: { x: number; y: number }) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = VIEW_W * dpr;
  canvas.height = VIEW_H * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, "#9ed8ed");
  sky.addColorStop(0.58, "#d4e9c5");
  sky.addColorStop(1, "#a8ce83");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Distant rolling hills and soft tree lines create a continuous landscape beyond the town.
  ctx.save();
  ctx.globalAlpha = 0.72;
  for (let i = 0; i < 9; i++) {
    const x = i * 205 - 70;
    const y = 92 + (i % 3) * 34;
    ctx.fillStyle = ["#86bd82", "#a2cc88", "#78b47d"][i % 3];
    ctx.beginPath(); ctx.ellipse(x, y, 190, 88 + (i % 2) * 24, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(ORIGIN_X + camera.x, ORIGIN_Y + camera.y);
  ctx.scale(zoom, zoom);
  setCtx(ctx);

  // A broad, irregular meadow under the isometric city replaces the isolated square tile.
  poly(
    [P(-7, -5), P(MAP + 7, -5), P(MAP + 10, MAP + 5), P(-6, MAP + 8)],
    "#9bcf78", "#7eb365", 5,
  );
  // Distant mountain silhouettes sit beyond the playable land.
  for (let i = 0; i < 7; i++) {
    const x = i * 8 + 1;
    const p = P(x, -3, 0);
    poly(
      [{ x: p.x - 150, y: p.y + 18 }, { x: p.x, y: p.y - 170 - (i % 3) * 28 }, { x: p.x + 155, y: p.y + 18 }],
      i % 2 ? "#8eb8a0" : "#a1c4a0", "#83aa91", 3,
    );
    poly(
      [{ x: p.x - 48, y: p.y - 92 }, { x: p.x, y: p.y - 170 - (i % 3) * 28 }, { x: p.x + 48, y: p.y - 92 }],
      "#e8f1dc",
    );
  }

  // Soft landscape backdrop and every terrain tile in the enlarged city map.
  for (let y = 0; y < MAP; y++) {
    for (let x = 0; x < MAP; x++) {
      const terrain = terrainAt(x, y);
      let color = "#8fca63";
      if (terrain === "sea") color = "#55b9d5";
      if (terrain === "sand" || terrain === "dock") color = terrain === "sand" ? "#e5d39a" : "#a98a64";
      if (terrain === "river") color = "#55b9d5";
      if (terrain === "rail") color = "#a9a99b";
      if (terrain === "tarmac") color = "#b7ad99";
      flat(x, y, x + 1, y + 1, color, 0, "rgba(255,255,255,0.09)");
      if (terrain === "grass" && hash(x, y) > 0.78) {
        const p = P(x + 0.5, y + 0.5);
        ellipse({ x: p.x, y: p.y }, 3, 1.5, hash(x, y, 2) > 0.5 ? "#a7d879" : "#79b956");
      }
      if (terrain === "sea" && hash(x, y, 3) > 0.65) {
        const p = P(x + 0.5, y + 0.5);
        line({ x: p.x - 8, y: p.y }, { x: p.x + 8, y: p.y }, "rgba(230,250,255,0.35)", 2);
      }
    }
  }

  // Roads are drawn above the terrain and below all buildings.
  for (const road of state.roads) {
    const [x, y] = road.split(",").map(Number);
    flat(x, y, x + 1, y + 1, "#c9b99b", 1, "rgba(111,91,66,0.25)");
    const p = P(x + 0.5, y + 0.5, 2);
    ellipse(p, 2.4, 1.2, "rgba(255,255,255,0.28)");
  }

  // Rail sleepers and a double rail line.
  for (let x = 0; x < MAP; x += 0.42) {
    const p = P(x, 1.5, 3);
    line({ x: p.x - 8, y: p.y }, { x: p.x + 8, y: p.y }, "#665d51", 2);
  }
  line(P(0, 1.28, 4), P(MAP, 1.28, 4), "#555b60", 2.8);
  line(P(0, 1.72, 4), P(MAP, 1.72, 4), "#555b60", 2.8);

  // Buildings are painter-sorted so rear objects are drawn first.
  const ordered = [...state.buildings].sort((a, b) => (a.x + a.y) - (b.x + b.y));
  for (const b of ordered) {
    const d = def(b);
    if (b.uid === selected) {
      poly(
        [P(b.x, b.y), P(b.x + d.w, b.y), P(b.x + d.w, b.y + d.h), P(b.x, b.y + d.h)],
        "rgba(255,220,70,0.22)", "#f6c84c", 2.5,
      );
    }
    const sprite = buildingSprite(b.def, ctx);
    const p = P(b.x, b.y);
    ctx.drawImage(sprite.c, p.x - sprite.ox, p.y - sprite.oy, sprite.w, sprite.h);
    if (b.def === "field" && b.crop) {
      const crop = cropSprite(b.crop.item, cropStage(b, now), ctx);
      const cp = P(b.x, b.y);
      ctx.drawImage(crop.c, cp.x - crop.ox, cp.y - crop.oy, crop.w, crop.h);
    }
    if (b.def === "field" && !b.crop) {
      const p2 = P(b.x + 0.5, b.y + 0.5, 1);
      ellipse(p2, 7, 3, "rgba(90,65,35,0.25)");
    }
    if (b.jobs?.some(j => j.end <= now)) {
      const p2 = P(b.x + d.w / 2, b.y + d.h / 2, 70);
      ellipse(p2, 9, 5, "#ffe36a");
      ellipse({ x: p2.x, y: p2.y - 2 }, 5, 3, "#fff7c4");
    }
  }

  // Decorative groves, flower patches and rocks enrich the land beyond the first town blocks.
  for (let y = 3; y < MAP - 3; y += 3) {
    for (let x = 2; x < MAP - 3; x += 4) {
      if (hash(x, y, 11) > 0.78 && terrainAt(x, y) === "grass" && !state.buildings.some(b => Math.abs(b.x - x) < 2 && Math.abs(b.y - y) < 2)) {
        const p = P(x + 0.5, y + 0.5);
        const r = 8 + hash(x, y, 12) * 8;
        ellipse({ x: p.x + 5, y: p.y + 8 }, r * 1.3, r * 0.48, "rgba(65,105,54,0.22)");
        ellipse({ x: p.x, y: p.y - r * 0.55 }, r, r * 0.72, hash(x, y, 13) > 0.5 ? "#4f9b58" : "#68ad5b");
        ellipse({ x: p.x - 3, y: p.y - r * 0.75 }, r * 0.58, r * 0.42, "#91c96e");
      }
    }
  }

  // A soft shoreline and decorative foam make the water edge legible.
  for (let y = 10; y < 19; y++) {
    const p = P(38.9, y + 0.5);
    line({ x: p.x, y: p.y - 10 }, { x: p.x, y: p.y + 10 }, "rgba(255,255,255,0.5)", 2);
  }
  ctx.restore();
}

function ActionButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button onClick={onClick} disabled={disabled} style={{
    border: "1px solid #d8c9a8", borderRadius: 12, padding: "9px 12px",
    background: disabled ? "#e8e4d9" : "linear-gradient(#fffdf4,#f2e5c8)",
    color: disabled ? "#9c978a" : "#51402a", fontWeight: 700, fontSize: 13,
    boxShadow: "0 2px 0 rgba(94,72,40,.12)", cursor: disabled ? "default" : "pointer",
  }}>{children}</button>;
}

export default function GameScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"actions" | "storage">("actions");
  const [zoom, setZoom] = useState(0.39);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [panelOpen, setPanelOpen] = useState(false);
  const dragRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  useEffect(() => {
    setGame(load());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (game && canvasRef.current) drawWorld(canvasRef.current, game, now, selected, zoom, camera);
  }, [game, now, selected, zoom, camera]);

  const update = useCallback((fn: (draft: GameState) => string | null | void) => {
    setGame(prev => {
      if (!prev) return prev;
      const draft = structuredClone(prev);
      const message = fn(draft);
      if (message) setNotice(message);
      else setNotice("Saved");
      save(draft);
      return draft;
    });
  }, []);

  const active = useMemo(() => game?.buildings.find(b => b.uid === selected) ?? null, [game, selected]);
  const activeDef = active && game ? def(active) : null;
  const progress = game ? levelProgress(game.xp) : null;

  const onCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!game) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const sx = (event.clientX - rect.left) * (VIEW_W / rect.width);
    const sy = (event.clientY - rect.top) * (VIEW_H / rect.height);
    const px = (sx - ORIGIN_X - camera.x) / zoom;
    const py = (sy - ORIGIN_Y - camera.y) / zoom;
    const u = (px / 32 + py / 16) / 2;
    const v = (py / 16 - px / 32) / 2;
    const hit = buildingAt(game, Math.floor(u), Math.floor(v));
    setSelected(hit?.uid ?? null);
    setTab("actions");
    setPanelOpen(Boolean(hit));
    setNotice(hit ? BUILDINGS[hit.def].name : "");
  };

  if (!game || !progress) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#d9edcf", color: "#47613c", fontWeight: 800 }}>Preparing your town…</div>;

  const run = (fn: (draft: GameState) => string | null | void) => update(fn);
  const itemOptions = CROPS.filter(c => levelOf(game.xp) >= c.level);
  const selectedJobs = active?.jobs ?? [];

  return <main style={{ minHeight: "100vh", background: "linear-gradient(#d9edf5,#e8efcf 58%,#d6e7b9)", color: "#51412d", fontFamily: "ui-rounded, system-ui, sans-serif", overflow: "hidden" }}>
    <header style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 18px", background: "linear-gradient(#fffdf4,#f2e5c8)", borderBottom: "3px solid #d3bd8f", boxShadow: "0 3px 10px #6c795333", position: "relative", zIndex: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, display: "grid", placeItems: "center", background: "linear-gradient(145deg,#83c957,#3d9b50)", color: "white", fontSize: 24, boxShadow: "inset 0 2px 2px #ffffff88,0 3px 0 #347d3c" }}>✿</div>
        <div><div style={{ fontSize: 19, fontWeight: 900, letterSpacing: "-.5px" }}>Harvest Haven</div><div style={{ fontSize: 10, color: "#8b7658", fontWeight: 800, letterSpacing: 1.4 }}>YOUR LITTLE WORLD</div></div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <div style={{ background: "#fff9e9", border: "1px solid #d9c69e", borderRadius: 20, padding: "7px 13px", fontWeight: 900 }}>🪙 {game.coins.toLocaleString()}</div>
        <div style={{ background: "#fff9e9", border: "1px solid #d9c69e", borderRadius: 20, padding: "7px 13px", fontWeight: 900 }}>⭐ Level {progress.level}</div>
        <div style={{ background: "#fff9e9", border: "1px solid #d9c69e", borderRadius: 20, padding: "7px 13px", fontWeight: 900 }}>📦 {stored(game)} / {capacity(game)}</div>
      </div>
    </header>

    <div style={{ height: 5, background: "#b6a27b" }}><div style={{ height: "100%", width: (progress.frac * 100) + "%", background: "linear-gradient(90deg,#f5cf52,#8acb54)", transition: "width .3s" }} /></div>

    <section style={{ height: "calc(100vh - 82px)", minHeight: 560, position: "relative", overflow: "hidden", touchAction: "none" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          onWheel={e => { e.preventDefault(); setZoom(z => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * (e.deltaY < 0 ? 1.1 : 0.9)))); }}
          onPointerDown={e => { if (e.button !== 0) return; dragRef.current = { x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y }; }}
          onPointerMove={e => { if (dragRef.current && (e.buttons & 1)) setCamera({ x: dragRef.current.cx + e.clientX - dragRef.current.x, y: dragRef.current.cy + e.clientY - dragRef.current.y }); }}
          onPointerUp={() => { dragRef.current = null; }}
          onPointerLeave={() => { dragRef.current = null; }}
          aria-label="Interactive isometric town map"
          style={{ display: "block", width: "100%", height: "100%", cursor: "grab", touchAction: "none" }}
        />
      </div>

      <div style={{ position: "absolute", left: 14, top: 14, padding: "8px 12px", borderRadius: 14, background: "#fffdf0eF", border: "1px solid #d7c49a", boxShadow: "0 3px 12px #4b633322", fontSize: 12, fontWeight: 800, pointerEvents: "none" }}>
        🌤️ Sunny day <span style={{ color: "#8c7958", marginLeft: 8 }}>Tap a building or field</span>
      </div>

      {notice && <div style={{ position: "absolute", top: 56, left: 14, padding: "6px 10px", borderRadius: 10, background: "#fffdf0eF", fontSize: 12, fontWeight: 700, color: "#6d8050" }}>{notice}</div>}

      <div style={{ position: "absolute", right: 14, top: 14, display: "flex", flexDirection: "column", gap: 7, zIndex: 3 }}>
        <ActionButton onClick={() => setZoom(z => Math.min(MAX_ZOOM, +(z * 1.18).toFixed(3)))}>＋ Zoom in</ActionButton>
        <ActionButton onClick={() => setZoom(z => Math.max(MIN_ZOOM, +(z / 1.18).toFixed(3)))}>− Zoom out</ActionButton>
        <ActionButton onClick={() => { setZoom(0.39); setCamera({ x: 0, y: 0 }); }}>◎ Reset view</ActionButton>
        <ActionButton onClick={() => setPanelOpen(v => !v)}>{panelOpen ? "Hide panel" : "Open panel"}</ActionButton>
      </div>

      {panelOpen && <aside style={{ position: "absolute", right: 14, top: 166, width: "min(310px, calc(100vw - 28px))", maxHeight: "calc(100% - 180px)", overflow: "auto", background: "linear-gradient(160deg,#fffdf5f5,#f4e8ccf5)", border: "2px solid #d3bd8f", borderRadius: 18, boxShadow: "0 8px 24px #4b553344", padding: 13, backdropFilter: "blur(8px)" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button onClick={() => setTab("actions")} style={{ flex: 1, border: 0, borderRadius: 10, padding: 8, background: tab === "actions" ? "#d7edbd" : "#eee5d2", color: "#5a563a", fontWeight: 800 }}>Building</button>
          <button onClick={() => setTab("storage")} style={{ flex: 1, border: 0, borderRadius: 10, padding: 8, background: tab === "storage" ? "#d7edbd" : "#eee5d2", color: "#5a563a", fontWeight: 800 }}>Barn</button>
        </div>
        {tab === "storage" ? <div>
          <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 4 }}>📦 Barn storage</div>
          <div style={{ fontSize: 12, color: "#887657", marginBottom: 10 }}>{stored(game)} of {capacity(game)} units used</div>
          {Object.entries(game.storage).filter(([, n]) => (n ?? 0) > 0).map(([id, qty]) => <div key={id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 3px", borderBottom: "1px solid #e7dcc5", fontSize: 13 }}><span>{ITEMS[id as ItemId].name}</span><b>{qty}</b></div>)}
        </div> : active && activeDef ? <div>
          <div style={{ fontSize: 17, fontWeight: 900 }}>{activeDef.name}</div>
          <div style={{ fontSize: 12, color: "#8b7658", lineHeight: 1.45, margin: "4px 0 12px" }}>{activeDef.desc}</div>
          {active.def === "field" ? <div>
            {active.crop ? <div>
              <div style={{ background: "#e5f0d5", borderRadius: 10, padding: 10, marginBottom: 9 }}>
                <b>{ITEMS[active.crop.item].name}</b>
                <div style={{ height: 7, background: "#c7d5b5", borderRadius: 8, marginTop: 7, overflow: "hidden" }}><div style={{ height: "100%", width: Math.min(100, Math.max(0, (now - active.crop.start) / (active.crop.end - active.crop.start) * 100)) + "%", background: "#79bb4c" }} /></div>
                <div style={{ fontSize: 11, marginTop: 5 }}>{now >= active.crop.end ? "Ready to harvest" : Math.max(1, Math.ceil((active.crop.end - now) / 1000)) + " sec remaining"}</div>
              </div>
              <ActionButton onClick={() => run(s => harvest(s, active.uid, Date.now()))} disabled={now < active.crop.end || stored(game) + 2 > capacity(game)}>🌾 Harvest</ActionButton>
            </div> : <div>
              <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>Choose seeds</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{itemOptions.map(c => <ActionButton key={c.item} onClick={() => run(s => plant(s, active.uid, c.item, Date.now()))} disabled={has(game, c.item) < 1}>🌱 {ITEMS[c.item].name} ({has(game, c.item)})</ActionButton>)}</div>
            </div>}
          </div> : activeDef.recipes?.length ? <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Production recipes</div>
            {activeDef.recipes.map(r => <div key={r.id} style={{ padding: "8px 0", borderTop: "1px solid #e7dcc5" }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{ITEMS[r.output].name} · {r.time}s</div>
              <div style={{ fontSize: 11, color: "#887657", margin: "3px 0 6px" }}>Uses {Object.entries(r.inputs).map(([id, n]) => (n + " " + ITEMS[id as ItemId].name)).join(", ")}</div>
              <ActionButton onClick={() => run(s => startJob(s, active.uid, r.id, Date.now()))}>Start production</ActionButton>
            </div>)}
            {selectedJobs.length > 0 && <div style={{ marginTop: 8, fontSize: 12 }}>Queue: {selectedJobs.length} · {selectedJobs.filter(j => j.end <= now).length} ready</div>}
            <div style={{ marginTop: 8 }}><ActionButton onClick={() => run(s => { const result = collect(s, active.uid, Date.now()); return result.err ?? (result.got.length ? "Collected production" : "Nothing ready"); })} disabled={!selectedJobs.some(j => j.end <= now)}>📦 Collect goods</ActionButton></div>
          </div> : <div style={{ fontSize: 12, color: "#887657" }}>Select a field, factory or animal building to see its available actions.</div>}
        </div> : <div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>Your town</div>
          <p style={{ fontSize: 12, color: "#887657", lineHeight: 1.5 }}>Select a field to plant and harvest, or choose a factory to manage production.</p>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <span style={{ background: "#e4efcf", borderRadius: 9, padding: "6px 8px", fontSize: 11, fontWeight: 800 }}>🌾 {game.buildings.filter(b => b.def === "field").length} fields</span>
            <span style={{ background: "#e4efcf", borderRadius: 9, padding: "6px 8px", fontSize: 11, fontWeight: 800 }}>🏭 {game.buildings.filter(b => ["bakery","dairy","sugar","feedmill"].includes(b.def)).length} factories</span>
            <span style={{ background: "#e4efcf", borderRadius: 9, padding: "6px 8px", fontSize: 11, fontWeight: 800 }}>🏡 {game.buildings.filter(b => BUILDINGS[b.def].kind === "house").length} homes</span>
          </div>
        </div>}
      </aside>}
      <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", gap: 7, flexWrap: "wrap" }}>
        <ActionButton onClick={() => { setSelected(null); setTab("actions"); setPanelOpen(false); }}>🗺️ Town</ActionButton>
        <ActionButton onClick={() => { setTab("storage"); setPanelOpen(true); }}>📦 Storage</ActionButton>
      </div>
    </section>
  </main>;
}
