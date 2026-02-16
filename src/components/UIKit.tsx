"use client";

import React from "react";
import { C } from "@/data/colors";

export function Spinner({ text = "KI analysiert..." }: { text?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", gap: 14 }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ color: C.textMuted, fontSize: 13, fontStyle: "italic" }}>{text}</p>
    </div>
  );
}

export function Btn({ onClick, children, variant = "primary", disabled = false, style: extra = {} }: {
  onClick?: () => void; children: React.ReactNode; variant?: "primary" | "secondary" | "ghost"; disabled?: boolean; style?: React.CSSProperties; className?: string;
}) {
  const v: Record<string, React.CSSProperties> = {
    primary: { background: C.accent, color: "#fff", border: "none" },
    secondary: { background: "transparent", color: C.accent, border: `1px solid ${C.accent}` },
    ghost: { background: "transparent", color: C.textSecondary, border: `1px solid ${C.borderLight}` },
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
      style={{ width: "100%", padding: "11px 14px", background: C.bgInput, border: `1px solid ${C.borderLight}`, borderRadius: 8, color: C.textPrimary, fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
      onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
  );
}

export function Input({ value, onChange, placeholder, label, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, color: C.textSecondary, marginBottom: 5, fontWeight: 500 }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", background: C.bgInput, border: `1px solid ${C.borderLight}`, borderRadius: 8, color: C.textPrimary, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderLight} />
    </div>
  );
}

export function QuestionCard({ question, hint, value, onChange, onSkip, type = "textarea", options = [] }: {
  question: string; hint?: string; value: string; onChange: (v: string) => void; onSkip: () => void; type?: "textarea" | "select"; options?: string[];
}) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.borderLight}`, borderRadius: 10, padding: 20, marginBottom: 12 }}>
      <p style={{ color: C.textPrimary, fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{question}</p>
      {hint && <p style={{ color: C.textMuted, fontSize: 11, marginBottom: 10, fontStyle: "italic" }}>{hint}</p>}
      {type === "textarea" && <TextArea value={value} onChange={onChange} placeholder="Ihre Antwort..." rows={3} />}
      {type === "select" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {options.map(o => (
            <button key={o} onClick={() => onChange(o)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, border: value === o ? `1px solid ${C.accent}` : `1px solid ${C.borderLight}`, background: value === o ? C.accentBg : "transparent", color: value === o ? C.accent : C.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>{o}</button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button onClick={onSkip} style={{ background: "none", border: "none", color: C.textDim, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Überspringen →</button>
      </div>
    </div>
  );
}

export function Markdown({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n"); const els: React.ReactNode[] = []; let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("### ")) els.push(<h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: C.accent, margin: "18px 0 6px" }}>{l.slice(4)}</h3>);
    else if (l.startsWith("## ")) els.push(<h2 key={i} style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, margin: "22px 0 8px" }}>{l.slice(3)}</h2>);
    else if (l.startsWith("# ")) els.push(<h1 key={i} style={{ fontSize: 19, fontWeight: 700, color: C.textPrimary, margin: "26px 0 10px" }}>{l.slice(2)}</h1>);
    else if (l.startsWith("- ") || l.startsWith("* ")) {
      const items: string[] = []; while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { items.push(lines[i].slice(2)); i++; }
      els.push(<ul key={`u${i}`} style={{ paddingLeft: 20, margin: "6px 0" }}>{items.map((t, j) => <li key={j} style={{ color: C.textSecondary, fontSize: 13, lineHeight: 1.7, marginBottom: 2 }}>{inl(t)}</li>)}</ul>); continue;
    } else if (l.match(/^\d+\. /)) {
      const items: string[] = []; while (i < lines.length && lines[i].match(/^\d+\. /)) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      els.push(<ol key={`o${i}`} style={{ paddingLeft: 20, margin: "6px 0" }}>{items.map((t, j) => <li key={j} style={{ color: C.textSecondary, fontSize: 13, lineHeight: 1.7, marginBottom: 2 }}>{inl(t)}</li>)}</ol>); continue;
    } else if (l.trim() === "") els.push(<div key={i} style={{ height: 6 }} />);
    else els.push(<p key={i} style={{ color: C.textSecondary, fontSize: 13, lineHeight: 1.7, margin: "3px 0" }}>{inl(l)}</p>);
    i++;
  }
  return <div>{els}</div>;
}

function inl(t: string): React.ReactNode {
  return t.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i} style={{ color: C.textPrimary, fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p
  );
}

export function ExportBar({ text, title = "Export" }: { text: string; title?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePDF = () => {
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a2e; line-height: 1.7; font-size: 14px; }
  h1 { color: #c48820; font-size: 22px; border-bottom: 2px solid #c48820; padding-bottom: 8px; }
  h2 { color: #333; font-size: 18px; margin-top: 24px; }
  h3 { color: #c48820; font-size: 15px; margin-top: 18px; }
  ul, ol { padding-left: 24px; }
  li { margin-bottom: 4px; }
  strong { color: #1a1a2e; }
  p { margin: 6px 0; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; color: #888; font-size: 11px; }
</style></head><body>
<h1>${title}</h1>
${text.split("\n").map(l => {
      if (l.startsWith("### ")) return `<h3>${l.slice(4)}</h3>`;
      if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
      if (l.startsWith("# ")) return `<h1>${l.slice(2)}</h1>`;
      if (l.startsWith("- ") || l.startsWith("* ")) return `<ul><li>${l.slice(2)}</li></ul>`;
      if (l.match(/^\\d+\\. /)) return `<ol><li>${l.replace(/^\\d+\\. /, "")}</li></ol>`;
      if (l.trim() === "") return "<br/>";
      return `<p>${l.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</p>`;
    }).join("\n")}
<div class="footer">KI-Verhandlungsassistent — Exportiert am ${new Date().toLocaleDateString("de-DE")} ${new Date().toLocaleTimeString("de-DE")}</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (w) { w.onload = () => { setTimeout(() => { w.print(); }, 500); }; }
  };

  if (!text.trim()) return null;

  return (
    <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${C.borderLight}` }}>
      <button onClick={handleCopy}
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: `1px solid ${C.borderLight}`, background: copied ? "#2E7D3218" : "transparent", color: copied ? "#2E7D32" : C.textSecondary, fontFamily: "inherit", transition: "all 0.2s" }}>
        {copied ? "✓ Kopiert!" : "📋 Kopieren"}
      </button>
      <button onClick={handlePDF}
        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", border: `1px solid ${C.borderLight}`, background: "transparent", color: C.textSecondary, fontFamily: "inherit", transition: "all 0.2s" }}>
        📄 PDF / Drucken
      </button>
    </div>
  );
}

export function LIFOBadge({ style }: { style: string }) {
  const LC: Record<string, { color: string; bg: string; name: string }> = {
    UH: { color: "#1565C0", bg: "#1565C012", name: "Unterstützend/Hergebend (UH)" },
    "BÜ": { color: "#C62828", bg: "#C6282812", name: "Bestimmend/Übernehmend (BÜ)" },
    AH: { color: "#F57F17", bg: "#F57F1712", name: "Anpassend/Harmonisierend (AH)" },
    BF: { color: "#2E7D32", bg: "#2E7D3212", name: "Bewahrend/Festhaltend (BF)" },
  };
  const s = LC[style]; if (!s) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: s.bg, border: `1px solid ${s.color}40` }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 10 }}>{style}</div>
      <span style={{ color: s.color, fontSize: 12, fontWeight: 600 }}>{s.name}</span>
    </div>
  );
}
