"use client";

import React from "react";

export function Spinner({ text = "KI analysiert..." }: { text?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", gap: 14 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #1a1a2e", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "#6b7394", fontSize: 13, fontStyle: "italic" }}>{text}</p>
    </div>
  );
}

export function Btn({ onClick, children, variant = "primary", disabled = false, style: extra = {} }: {
  onClick?: () => void; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost"; disabled?: boolean; style?: React.CSSProperties; className?: string;
}) {
  const v: Record<string, React.CSSProperties> = {
    primary: { background: "#e94560", color: "#fff", border: "none" },
    secondary: { background: "transparent", color: "#e94560", border: "1px solid #e94560" },
    ghost: { background: "transparent", color: "#8892b0", border: "1px solid #2a2a4a" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: "inherit", ...v[variant], ...extra }}>
      {children}
    </button>
  );
}

export function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", padding: "11px 14px", background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 8, color: "#ccd6f6", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
      onFocus={e => e.target.style.borderColor = "#e94560"} onBlur={e => e.target.style.borderColor = "#2a2a4a"} />
  );
}

export function Input({ value, onChange, placeholder, label, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, color: "#8892b0", marginBottom: 5, fontWeight: 500 }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", background: "#1a1a2e", border: "1px solid #2a2a4a", borderRadius: 8, color: "#ccd6f6", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = "#e94560"} onBlur={e => e.target.style.borderColor = "#2a2a4a"} />
    </div>
  );
}

export function QuestionCard({ question, hint, value, onChange, onSkip, type = "textarea", options = [] }: {
  question: string; hint?: string; value: string; onChange: (v: string) => void; onSkip: () => void; type?: "textarea" | "select"; options?: string[];
}) {
  return (
    <div style={{ background: "#16162a", border: "1px solid #2a2a4a", borderRadius: 10, padding: 20, marginBottom: 12 }}>
      <p style={{ color: "#ccd6f6", fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{question}</p>
      {hint && <p style={{ color: "#6b7394", fontSize: 11, marginBottom: 10, fontStyle: "italic" }}>{hint}</p>}
      {type === "textarea" && <TextArea value={value} onChange={onChange} placeholder="Ihre Antwort..." rows={3} />}
      {type === "select" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {options.map(o => (
            <button key={o} onClick={() => onChange(o)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, border: value === o ? "1px solid #e94560" : "1px solid #2a2a4a", background: value === o ? "#e9456018" : "transparent", color: value === o ? "#e94560" : "#8892b0", cursor: "pointer", fontFamily: "inherit" }}>{o}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button onClick={onSkip} style={{ background: "none", border: "none", color: "#4a4a6a", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Überspringen →</button>
      </div>
    </div>
  );
}

export function Markdown({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n"); const els: React.ReactNode[] = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("### ")) els.push(<h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: "#e94560", margin: "18px 0 6px" }}>{l.slice(4)}</h3>);
    else if (l.startsWith("## ")) els.push(<h2 key={i} style={{ fontSize: 17, fontWeight: 700, color: "#ccd6f6", margin: "22px 0 8px" }}>{l.slice(3)}</h2>);
    else if (l.startsWith("# ")) els.push(<h1 key={i} style={{ fontSize: 19, fontWeight: 700, color: "#ccd6f6", margin: "26px 0 10px" }}>{l.slice(2)}</h1>);
    else if (l.startsWith("- ") || l.startsWith("* ")) {
      const items: string[] = []; while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { items.push(lines[i].slice(2)); i++; }
      els.push(<ul key={`u${i}`} style={{ paddingLeft: 20, margin: "6px 0" }}>{items.map((t, j) => <li key={j} style={{ color: "#8892b0", fontSize: 13, lineHeight: 1.7, marginBottom: 2 }}>{inl(t)}</li>)}</ul>); continue;
    } else if (l.match(/^\d+\. /)) {
      const items: string[] = []; while (i < lines.length && lines[i].match(/^\d+\. /)) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      els.push(<ol key={`o${i}`} style={{ paddingLeft: 20, margin: "6px 0" }}>{items.map((t, j) => <li key={j} style={{ color: "#8892b0", fontSize: 13, lineHeight: 1.7, marginBottom: 2 }}>{inl(t)}</li>)}</ol>); continue;
    } else if (l.trim() === "") els.push(<div key={i} style={{ height: 6 }} />);
    else els.push(<p key={i} style={{ color: "#8892b0", fontSize: 13, lineHeight: 1.7, margin: "3px 0" }}>{inl(l)}</p>);
    i++;
  }
  return <div>{els}</div>;
}

function inl(t: string): React.ReactNode {
  return t.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i} style={{ color: "#ccd6f6", fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p
  );
}

export function LIFOBadge({ style }: { style: string }) {
  const C: Record<string, { color: string; bg: string; name: string }> = {
    SH: { color: "#2E7D32", bg: "#2E7D3212", name: "Unterstützend/Hergebend (SH)" },
    CT: { color: "#C62828", bg: "#C6282812", name: "Bestimmend/Übernehmend (CT)" },
    CH: { color: "#1565C0", bg: "#1565C012", name: "Bewahrend/Festhaltend (CH)" },
    AD: { color: "#F57F17", bg: "#F57F1712", name: "Anpassend/Harmonisierend (AD)" },
  };
  const s = C[style]; if (!s) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: s.bg, border: `1px solid ${s.color}40` }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 10 }}>{style}</div>
      <span style={{ color: s.color, fontSize: 12, fontWeight: 600 }}>{s.name}</span>
    </div>
  );
}
