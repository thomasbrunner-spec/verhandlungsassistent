"use client";

import { useState } from "react";
import { Spinner, Btn, TextArea, Markdown, LIFOBadge, ExportBar } from "@/components/UIKit";
import { LIFO } from "@/data/lifo";
import { PROMPTS } from "@/data/prompts";
import { C } from "@/data/colors";

interface Props {
  companyData: Record<string, string>;
  supplierData: { name: string; analysis: string };
  lifoData: { style: string; analysis: string };
  objections: string;
  onObjectionsChange: (o: string) => void;
}

export default function Module5({ companyData, supplierData, lifoData, objections, onObjectionsChange }: Props) {
  const [mode, setMode] = useState<"single" | "auto" | null>(null);
  const [customObj, setCustomObj] = useState("");
  const [analysis, setAnalysis] = useState(objections || "");
  const [loading, setLoading] = useState(false);

  const ctx = Object.entries(companyData)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n") || "k.A.";
  const li = lifoData.style ? `LIFO: ${LIFO[lifoData.style]?.name}` : "LIFO: k.A.";

  const runAuto = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: PROMPTS.objections.text,
          userMessage: `=== EIGENES UNTERNEHMEN ===\n${ctx}\n\n=== LIEFERANT: ${supplierData.name || "k.A."} ===\n${supplierData.analysis ? `Analyse:\n${supplierData.analysis}` : "Keine Analyse."}\n\n=== LIFO-PROFIL ===\n${li}\n${lifoData.analysis ? `Analyse: ${lifoData.analysis.replace(/^\[(UH|BÜ|AH|BF)\]\s*/, "").substring(0, 500)}` : ""}\n\nAntizipiere 6-8 KONKRETE Einwände, die dieser spezifische Lieferant in dieser Situation bringen wird.`,
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setAnalysis(d.response);
      onObjectionsChange(d.response);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      setAnalysis("Fehler: " + msg);
    }
    setLoading(false);
  };

  const runSingle = async () => {
    if (!customObj.trim()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: PROMPTS.singleObj.text,
          userMessage: `=== EIGENES UNTERNEHMEN ===\n${ctx}\n\n=== LIEFERANT: ${supplierData.name || "k.A."} ===\n${supplierData.analysis ? `Analyse:\n${supplierData.analysis.substring(0, 800)}` : ""}\n\n=== LIFO-PROFIL ===\n${li}\n\nEinwand: "${customObj}"`,
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setAnalysis(d.response);
      onObjectionsChange(d.response);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      setAnalysis("Fehler: " + msg);
    }
    setLoading(false);
  };

  if (!mode) {
    return (
      <div>
        <p style={{ fontSize: "13px", marginBottom: "24px", color: C.textSecondary }}>
          Bereiten Sie sich auf Einwände vor. Wählen Sie Ihren Ansatz:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {[
            { m: "single" as const, icon: "🎯", title: "Konkreten Einwand eingeben", desc: "Sie erwarten einen bestimmten Einwand und möchten eine maßgeschneiderte Reaktionsstrategie." },
            { m: "auto" as const, icon: "🤖", title: "KI-generierte Einwände", desc: "Die KI antizipiert die wahrscheinlichsten Einwände basierend auf allen Informationen." },
          ].map(({ m, icon, title, desc }) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                borderRadius: "12px",
                padding: "24px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.3s ease",
                background: C.bgCard,
                border: `2px solid ${C.border}`,
                fontFamily: "inherit"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
            >
              <span style={{ fontSize: "28px", display: "block", marginBottom: "12px" }}>{icon}</span>
              <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px", color: C.textPrimary }}>{title}</h3>
              <p style={{ fontSize: "12px", lineHeight: "1.5", color: C.textMuted }}>{desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => { setMode(null); setAnalysis(""); }}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "12px",
          cursor: "pointer",
          marginBottom: "16px",
          color: C.textDim,
          fontFamily: "inherit"
        }}
      >
        ← Zurück zur Auswahl
      </button>

      {mode === "single" && (
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px", color: C.textPrimary }}>Konkreten Einwand analysieren</h3>
          <p style={{ fontSize: "13px", marginBottom: "16px", color: C.textSecondary }}>Geben Sie den erwarteten Einwand ein.</p>
          <TextArea value={customObj} onChange={setCustomObj} placeholder='z.B. "Die Rohstoffpreise sind um 15% gestiegen..."' rows={4} />
          <div style={{ marginTop: "14px" }}>
            <Btn onClick={runSingle} disabled={!customObj.trim() || loading}>
              {loading ? "..." : "Einwand analysieren"}
            </Btn>
          </div>
        </div>
      )}

      {mode === "auto" && (
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: "600", marginBottom: "6px", color: C.textPrimary }}>KI-generierte Einwandanalyse</h3>
          <p style={{ fontSize: "13px", marginBottom: "16px", color: C.textSecondary }}>
            KI antizipiert Einwände basierend auf allen Daten.
          </p>
          {lifoData.style && (
            <div style={{ marginBottom: "16px" }}>
              <LIFOBadge style={lifoData.style} />
            </div>
          )}
          <Btn onClick={runAuto} disabled={loading}>
            {loading ? "..." : "Einwände generieren"}
          </Btn>
        </div>
      )}

      {loading && <Spinner text="Analysiert Einwände..." />}
      {analysis && !loading && (
        <div style={{ marginTop: "20px", borderRadius: "10px", padding: "20px", background: C.bgCard, border: `1px solid ${C.border}` }}>
          <Markdown text={analysis} />
          <ExportBar text={analysis} title="Einwandbehandlung" />
        </div>
      )}
    </div>
  );
}
