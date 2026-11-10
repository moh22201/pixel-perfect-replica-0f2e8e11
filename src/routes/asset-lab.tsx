import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";

function AssetLab() {
  const viewerHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = viewerHost.current;
    if (!host) return;
    const tag = "model-viewer";
    const scriptId = "asset-lab-model-viewer";
    const mount = () => {
      if (!host.isConnected || host.firstChild) return;
      const viewer = document.createElement(tag) as HTMLElement;
      viewer.setAttribute("src", "/models/sample_2026-11-10T035231.710.glb");
      viewer.setAttribute("alt", "Mine 3D asset on the isolated test pad");
      viewer.setAttribute("camera-controls", "");
      viewer.setAttribute("touch-action", "pan-y");
      viewer.setAttribute("interaction-prompt", "auto");
      viewer.setAttribute("shadow-intensity", "1");
      viewer.setAttribute("exposure", "1");
      viewer.setAttribute("camera-orbit", "35deg 68deg 5m");
      viewer.setAttribute("min-camera-orbit", "auto auto 2m");
      viewer.setAttribute("max-camera-orbit", "auto auto 12m");
      viewer.setAttribute("rotation-per-second", "0deg");
      viewer.style.width = "min( min(78vw, 760px), 100%)";
      viewer.style.height = "min(64vh, 560px)";
      viewer.style.background = "transparent";
      viewer.style.display = "block";
      viewer.style.margin = "0 auto";
      host.appendChild(viewer);
    };
    if (customElements.get(tag)) mount();
    else {
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
    }
  }, []);

  const pads = ["Farm plot", "Empty plot", "Workshop plot", "Storage plot"];
  return (
    <main style={{ minHeight: "100vh", color: "#344536", background: "linear-gradient(180deg,#d9edf4 0%,#e8f1d9 42%,#b9d49a 100%)", fontFamily: "ui-rounded,system-ui,sans-serif", overflow: "hidden" }}>
      <header style={{height:68,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",background:"#fffdf1",borderBottom:"2px solid #d4c49c",boxShadow:"0 3px 12px #536b3b22"}}>
        <div><div style={{fontSize:19,fontWeight:900}}>3D Asset Test Yard</div><div style={{fontSize:11,color:"#7d896c"}}>ISOLATED WORKSHOP · NOT THE MAIN GAME WORLD</div></div>
        <a href="/" style={{padding:"9px 13px",borderRadius:12,background:"#e7f0d9",color:"#45613e",fontWeight:800,textDecoration:"none"}}>← Main world</a>
      </header>
      <section style={{maxWidth:1100,margin:"0 auto",padding:"18px 16px 30px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div><h1 style={{fontSize:24,fontWeight:900,margin:"4px 0"}}>Mine asset · Test pad A1</h1><p style={{margin:0,fontSize:13,color:"#65775b"}}>A fixed ground platform for checking scale, placement, materials and rotation.</p></div>
          <span style={{background:"#e4f0d8",border:"1px solid #b8d09f",borderRadius:99,padding:"7px 12px",fontSize:12,fontWeight:800}}>● Standalone test scene</span>
        </div>
        <div style={{position:"relative",marginTop:18,minHeight:570,borderRadius:28,overflow:"hidden",border:"2px solid #a9c48c",background:"linear-gradient(180deg,#cce6ed 0%,#e6efd4 48%,#b4d18d 100%)",boxShadow:"0 14px 35px #526e3b25"}}>
          <div style={{position:"absolute",inset:"0 0 36% 0",background:"radial-gradient(ellipse at 50% 100%,#a8ca91 0%,#b9d6a5 45%,transparent 75%)"}}/>
          <div style={{position:"absolute",left:"50%",top:"57%",width:"min(82%,780px)",height:250,transform:"translate(-50%,-50%)",background:"linear-gradient(145deg,#a9c982,#8eb76c)",border:"8px solid #759e5a",borderRadius:34,boxShadow:"0 20px 0 #688b50,0 30px 35px #3d583b55",clipPath:"polygon(12% 0,88% 0,100% 50%,88% 100%,12% 100%,0 50%)"}}/>
          <div style={{position:"absolute",left:"50%",top:"57%",width:"min(70%,660px)",height:200,transform:"translate(-50%,-50%)",border:"2px dashed #eaf3cf88",borderRadius:24,pointerEvents:"none"}}/>
          <div ref={viewerHost} style={{position:"absolute",inset:"5px 0 60px",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}/>
          <div style={{position:"absolute",left:14,bottom:14,zIndex:3,background:"#fffdf0eF",border:"1px solid #d7c99e",borderRadius:12,padding:"8px 11px",fontSize:12,fontWeight:800}}>Drag to rotate · Pinch to zoom</div>
          <div style={{position:"absolute",right:14,bottom:14,zIndex:3,background:"#fffdf0eF",border:"1px solid #d7c99e",borderRadius:12,padding:"8px 11px",fontSize:12,fontWeight:800}}>Fixed platform · No city camera</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:14}}>
          {pads.map((name,i)=><div key={name} style={{background:"#f9f8e9",border:"1px solid #cbd8b5",borderRadius:15,padding:13,opacity:i===0?1:.78}}><div style={{fontSize:11,color:"#81906d",fontWeight:800}}>PAD {String(i+1).padStart(2,"0")}</div><div style={{fontWeight:900,marginTop:4}}>{name}</div><div style={{fontSize:11,color:"#718067",marginTop:3}}>{i===0?"Mine loaded here": "Reserved for future assets"}</div></div>)}
        </div>
        <p style={{fontSize:12,color:"#6c7e61",textAlign:"center",marginTop:16}}>This page is isolated from the main town scene. Testing here does not move or alter existing buildings.</p>
      </section>
    </main>
  );
}

export const Route = createFileRoute("/asset-lab")({ component: AssetLab });
