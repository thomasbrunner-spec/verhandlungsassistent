"use client";

import { useState } from "react";
import { Spinner, Btn, Markdown, LIFOBadge } from "@/components/UIKit";
import { LIFO } from "@/data/lifo";
import { PROMPTS } from "@/data/prompts";

interface Props {
  companyData: Record<string, string>;
  supplierData: { name: string; analysis: string };
  lifoData: { style: string };
  strategy: string;
  onStrategyChange: (s: string) => void;
}

export default function Module4({ companyData, supplierData, lifoData, strategy, onStrategyChange }: Props) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const ctx = Object.entries(companyData)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const lifoStyle = lifoData.style && LIFO[lifoData.style];
    const lb = lifoStyle
      ? `\nLIFO-STIL: ${lifoStyle.name}\nMerkmale: ${lifoStyle.traits}\nAnsprache: ${lifoStyle.approach}\nDo's: ${lifoStyle.doList.join(", ")}\nDon'ts: ${lifoStyle.dontList.join(", ")}\nUnter Druck: ${lifoStyle.underPressure}`
      : "";

    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: PROMPTS.strategy.text,
          userMessage: `UNTERNEHMEN:\n${ctx || "k.A."}\n\nLIEFERANT: ${supplierData.name || "k.A."}\n${supplierData.analysis ? "Analyse liegt vor." : ""}${lb}\n\nErstelle DETAILLIERTE AGENDA mit Zeitblöcken. Hebe LIFO-Besonderheiten deutlich hervor.`,
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      onStrategyChange(d.response);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      onStrategyChange("Fehler: " + msg);
    }
    setLoading(false);
  };

  const checks = [
    { l: "Unternehmensprofil", ok: Object.values(companyData).some((v) => v?.trim()) },
    { l: "Lieferantenanalyse", ok: !!supplierData.analysis },
    { l: "LIFO-Analyse", ok: !!lifoData.style },
  ];

  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "14px", color: "#8892b0" }}>
        Harvard-Strategie mit Agenda, Drehbuch und LIFO-Formulierungen.
      </p>

      {!checks.some((c) => c.ok) && (
        <div style={{
          borderRadius: "8px",
          padding: "14px",
          marginBottom: "14px",
          background: "#F57F1712",
          border: "1px solid #F57F1730"
        }}>
          <p style={{ fontSize: "12px", color: "#F57F17" }}>Für optimale Ergebnisse Module 1-3 ausfüllen.</p>
        </div>
      )}

      <div style={{
        borderRadius: "8px",
        padding: "14px",
        marginBottom: "16px",
        background: "#1a1a2e",
        border: "1px solid #2a2a4a"
      }}>
        <p style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: "#ccd6f6" }}>Datenbasis:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {checks.map((c) => (
            <span
              key={c.l}
              style={{
                paddingLeft: "10px",
                paddingRight: "10px",
                paddingTop: "2px",
                paddingBottom: "2px",
                borderRadius: "9999px",
                fontSize: "11px",
                background: c.ok ? "#2E7D3215" : "#2a2a4a",
                color: c.ok ? "#4CAF50" : "#4a4a6a",
                border: `1px solid ${c.ok ? "#2E7D3230" : "#2a2a4a"}`
              }}
            >
              {c.ok ? "✓" : "○"} {c.l}
            </span>
          ))}
        </div>
        {lifoData.style && (
          <div style={{ marginTop: "10px" }}>
            <LIFOBadge style={lifoData.style} />
          </div>
        )}
      </div>

      <Btn onClick={run} disabled={loading}>
        {loading ? "Wird erstellt..." : "Strategie generieren"}
      </Btn>
      {loading && <Spinner text="Erstellt Harvard-Strategie mit Agenda..." />}
      {strategy && !loading && (
        <div style={{ marginTop: "20px", borderRadius: "10px", padding: "20px", background: "#16162a", border: "1px solid #2a2a4a" }}>
          <Markdown text={strategy} />
        </div>
      )}
    </div>
  );
}
