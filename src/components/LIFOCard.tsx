"use client";

import { LIFO } from "@/data/lifo";

export default function LIFOCard({ style }: { style: string }) {
  const st = LIFO[style];
  if (!st) return null;

  return (
    <div style={{ background: st.bg, border: `2px solid ${st.color}30`, borderRadius: 12, padding: 22, marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: st.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18 }}>{style}</div>
        <div>
          <h3 style={{ color: st.color, fontSize: 16, fontWeight: 700, margin: 0 }}>{st.name}</h3>
          <p style={{ color: "#8892b0", fontSize: 11, marginTop: 2 }}>Ermittelter primärer LIFO-Stil</p>
        </div>
      </div>
      <p style={{ color: "#8892b0", fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}><strong style={{ color: "#ccd6f6" }}>Kernmerkmale:</strong> {st.traits}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ background: "#0a0a1a60", borderRadius: 10, padding: 14 }}>
          <h4 style={{ color: "#4CAF50", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Do&apos;s</h4>
          {st.doList.map((d, i) => <p key={i} style={{ color: "#8892b0", fontSize: 11, lineHeight: 1.6 }}>• {d}</p>)}
        </div>
        <div style={{ background: "#0a0a1a60", borderRadius: 10, padding: 14 }}>
          <h4 style={{ color: "#ef5350", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Don&apos;ts</h4>
          {st.dontList.map((d, i) => <p key={i} style={{ color: "#8892b0", fontSize: 11, lineHeight: 1.6 }}>• {d}</p>)}
        </div>
      </div>
      <div style={{ background: "#0a0a1a60", borderRadius: 10, padding: 14 }}>
        <h4 style={{ color: "#FF9800", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Verhalten unter Druck</h4>
        <p style={{ color: "#8892b0", fontSize: 11, lineHeight: 1.6 }}>{st.underPressure}</p>
      </div>
    </div>
  );
}
