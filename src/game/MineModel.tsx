import { useEffect, useRef } from "react";

type Props = {
  zoom: number;
  camera: { x: number; y: number };
  viewportHeight: number;
};

// A real GLB overlay anchored to an isometric map tile. Existing canvas
// rendering, buildings, game state, and controls remain unchanged.
export default function MineModel({ zoom, camera, viewportHeight }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const tag = "model-viewer";
    const scriptId = "google-model-viewer-script";
    const mount = () => {
      if (!host.isConnected || host.firstChild) return;
      const viewer = document.createElement(tag);
      viewer.setAttribute("src", "/models/sample_2026-11-10T035231.710.glb");
      viewer.setAttribute("alt", "3D mine asset");
      viewer.setAttribute("camera-controls", "");
      viewer.setAttribute("shadow-intensity", "0.8");
      viewer.setAttribute("exposure", "1");
      viewer.setAttribute("interaction-prompt", "none");
      viewer.style.width = "100%";
      viewer.style.height = "100%";
      viewer.style.background = "transparent";
      viewer.style.pointerEvents = "auto";
      host.appendChild(viewer);
    };

    if (customElements.get(tag)) {
      mount();
      return;
    }
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "module";
      script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
      document.head.appendChild(script);
    }
    script.addEventListener("load", mount, { once: true });
    return () => script?.removeEventListener("load", mount);
  }, []);

  const tileX = 29;
  const tileY = 25;
  const left = `calc(50% + ${camera.x + (tileX - tileY) * 32 * zoom}px)`;
  const top = `${Math.max(90, viewportHeight * 0.16) + camera.y + (tileX + tileY) * 16 * zoom}px`;
  const size = Math.max(150, 310 * zoom);

  return (
    <div
      ref={hostRef}
      aria-label="3D mine"
      style={{
        position: "absolute",
        zIndex: 1,
        left,
        top,
        width: size,
        height: size * 0.82,
        transform: "translate(-50%, -82%)",
        pointerEvents: "auto",
      }}
    />
  );
}
