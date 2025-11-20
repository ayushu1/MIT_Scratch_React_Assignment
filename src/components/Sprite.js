// src/components/Sprite.js
import React from "react";

export default function Sprite({ s }) {
  const sizeW = s.width || 60;
  const sizeH = s.height || 60;
  const transform = `translate(-50%,-50%) rotate(${s.angle || 0}deg)`;
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y, width: sizeW, height: sizeH, transform }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", background: s.color || "#7c3aed" }}>
        <div style={{ color: "white", fontSize: 12, fontWeight: 700 }}>{s.name}</div>
      </div>
      {s._balloon && (
        <div style={{ position: "absolute", left: sizeW * 0.9, top: -sizeH * 0.6, background: "white", padding: 6, borderRadius: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
          {s._balloon.kind === "say" ? <div>"{s._balloon.text}"</div> : <div><i>{s._balloon.text}</i></div>}
        </div>
      )}
    </div>
  );
}
