"use client";

import { useState, useRef } from "react";
import { Spinner, Btn, TextArea, Markdown, ExportBar } from "@/components/UIKit";
import LIFOCard from "@/components/LIFOCard";
import { PROMPTS } from "@/data/prompts";
import { C } from "@/data/colors";

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

function detectLIFOStyle(text: string): string {
  const m = text.match(/^\[(UH|BÜ|AH|BF)\]/);
  return m ? m[1] : "";
}

export default function Module3({ data, onChange }: Props) {
  const [behaviors, setBehaviors] = useState(data.behaviors || "");
  const [analysis, setAnalysis] = useState(data.analysis || "");
  const [streamText, setStreamText] = useState("");
  const [style, setStyle] = useState(data.style || "");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!behaviors.trim()) return;
    setLoading(true);
    setStreamText("");
    setAnalysis("");
    setStyle("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const r = await fetch("/api/ai-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemPrompt: PROMPTS.lifo.text,
          useWebSearch: false,
          userMessage: `Verhaltensbeschreibung:\n\n${behaviors}`,
        }),
      });

      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "API-Fehler");
      }

      const reader = r.body?.getReader();
      if (!reader) throw new Error("Kein Stream verfügbar");

      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";
      let detectedStyle = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") continue;

          try {
            const event = JSON.parse(d);
            if (event.text) {
              fullText += event.text;
              setStreamText(fullText);

              // LIFO-Stil erkennen sobald der Tag am Anfang komplett ist
              if (!detectedStyle && fullText.length > 4) {
                detectedStyle = detectLIFOStyle(fullText);
                if (detectedStyle) setStyle(detectedStyle);
              }
            }
            if (event.error) throw new Error(event.error);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      // Finaler Check falls Stil noch nicht erkannt
      if (!detectedStyle) {
        detectedStyle = detectLIFOStyle(fullText);
        if (detectedStyle) setStyle(detectedStyle);
      }

      setAnalysis(fullText);
      setStreamText("");
      onChange({ behaviors, analysis: fullText, style: detectedStyle });
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Fehler";
      setAnalysis("Fehler: " + msg);
      setStreamText("");
    }
    setLoading(false);
  };

  const cancel = () => {
    abortRef.current?.abort();
    setLoading(false);
    const detected = detectLIFOStyle(streamText);
    if (streamText) {
      setAnalysis(streamText + "\n\n---\n*[Generierung abgebrochen]*");
      onChange({ behaviors, analysis: streamText, style: detected });
      setStreamText("");
    }
  };

  const displayText = streamText || analysis;
  const cleanText = displayText.replace(/^\[(UH|BÜ|AH|BF)\]\s*/, "");

  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "6px", color: C.textSecondary }}>
        Beschreiben Sie das Verhalten Ihres Gesprächspartners.
      </p>
      <div style={{
        borderRadius: "8px",
        padding: "14px",
        marginBottom: "16px",
        background: C.bgInput,
        border: `1px solid ${C.border}`
      }}>
        <p style={{ fontSize: "11px", marginBottom: "6px", color: C.textDim }}>Leitfragen:</p>
        {HINTS.map((h, i) => (
          <p key={i} style={{ fontSize: "11px", lineHeight: "1.5", color: C.textMuted }}>→ {h}</p>
        ))}
      </div>
      <TextArea value={behaviors} onChange={setBehaviors} placeholder="Typisches Verhalten..." rows={6} />
      <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
        <Btn onClick={run} disabled={!behaviors.trim() || loading}>
          {loading ? "Analysiert..." : "LIFO-Stil analysieren"}
        </Btn>
        {loading && <Btn onClick={cancel}>Abbrechen</Btn>}
      </div>
      {loading && <Spinner text="Analysiert Verhaltensmuster (Streaming)..." />}
      {style && <LIFOCard style={style} />}
      {cleanText && (
        <div style={{ marginTop: "14px", borderRadius: "10px", padding: "20px", background: C.bgCard, border: `1px solid ${C.border}` }}>
          <Markdown text={cleanText} />
          {!loading && <ExportBar text={cleanText} title="LIFO-Analyse" />}
        </div>
      )}
    </div>
  );
}
