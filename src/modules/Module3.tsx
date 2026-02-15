"use client";

import { useState } from "react";
import { Spinner, Btn, TextArea, Markdown } from "@/components/UIKit";
import LIFOCard from "@/components/LIFOCard";
import { PROMPTS } from "@/data/prompts";

interface LIFOData {
  behaviors: string;
  analysis: string;
  style: string;
}

interface Props {
  data: LIFOData;
  onChange: (data: LIFOData) => void;
}

const HINTS = [
  "Kommunikationsstil? (direkt, diplomatisch, detailorientiert, enthusiastisch)",
  "Entscheidungsverhalten? (schnell, bedacht, konsensorientiert)",
  "Was ist besonders wichtig?",
  "Verhalten unter Druck/Konflikten?",
  "Auftreten? (formell, locker, strukturiert, kreativ)",
];

export default function Module3({ data, onChange }: Props) {
  const [behaviors, setBehaviors] = useState(data.behaviors || "");
  const [analysis, setAnalysis] = useState(data.analysis || "");
  const [style, setStyle] = useState(data.style || "");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!behaviors.trim()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: PROMPTS.lifo.text,
          userMessage: `Verhaltensbeschreibung:\n\n${behaviors}`,
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setAnalysis(d.response);
      const m = d.response.match(/^\[(SH|CT|CH|AD)\]/);
      const detected = m ? m[1] : "";
      setStyle(detected);
      onChange({ behaviors, analysis: d.response, style: detected });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      setAnalysis("Fehler: " + msg);
    }
    setLoading(false);
  };

  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "6px", color: "#8892b0" }}>
        Beschreiben Sie das Verhalten Ihres Gesprächspartners.
      </p>
      <div style={{
        borderRadius: "8px",
        padding: "14px",
        marginBottom: "16px",
        background: "#1a1a2e",
        border: "1px solid #2a2a4a"
      }}>
        <p style={{ fontSize: "11px", marginBottom: "6px", color: "#4a4a6a" }}>Leitfragen:</p>
        {HINTS.map((h, i) => (
          <p key={i} style={{ fontSize: "11px", lineHeight: "1.5", color: "#6b7394" }}>→ {h}</p>
        ))}
      </div>
      <TextArea value={behaviors} onChange={setBehaviors} placeholder="Typisches Verhalten..." rows={6} />
      <div style={{ marginTop: "14px" }}>
        <Btn onClick={run} disabled={!behaviors.trim() || loading}>
          {loading ? "Analysiert..." : "LIFO-Stil analysieren"}
        </Btn>
      </div>
      {loading && <Spinner text="Analysiert Verhaltensmuster..." />}
      {style && !loading && <LIFOCard style={style} />}
      {analysis && !loading && (
        <div style={{ marginTop: "14px", borderRadius: "10px", padding: "20px", background: "#16162a", border: "1px solid #2a2a4a" }}>
          <Markdown text={analysis.replace(/^\[(SH|CT|CH|AD)\]\s*/, "")} />
        </div>
      )}
    </div>
  );
}
