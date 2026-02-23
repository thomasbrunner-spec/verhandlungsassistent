"use client";

import { useState, useRef } from "react";
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

// Streaming-Helper: Liest SSE-Stream und gibt Text live zurück
async function readStream(
  response: Response,
  onText: (fullText: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Kein Stream verfügbar");

  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

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
          onText(fullText);
        }
        if (event.error) throw new Error(event.error);
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }

  return fullText;
}

export default function Module5({ companyData, supplierData, lifoData, objections, onObjectionsChange }: Props) {
  const [mode, setMode] = useState<"single" | "auto" | null>(null);
  const [customObj, setCustomObj] = useState("");
  const [analysis, setAnalysis] = useState(objections || "");
  const [streamText, setStreamText] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const ctx = Object.entries(companyData)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n") || "k.A.";
  const li = lifoData.style ? `LIFO: ${LIFO[lifoData.style]?.name}` : "LIFO: k.A.";

  const runStreaming = async (systemPrompt: string, userMessage: string) => {
    setLoading(true);
    setStreamText("");
    setAnalysis("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const r = await fetch("/api/ai-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemPrompt,
          useWebSearch: false,
          userMessage,
        }),
      });

      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.error || "API-Fehler");
      }

      const fullText = await readStream(r, setStreamText);
      setAnalysis(fullText);
      setStreamText("");
      onObjectionsChange(fullText);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Fehler";
      setAnalysis("Fehler: " + msg);
      setStreamText("");
    }
    setLoading(false);
  };

  const runAuto = () => {
    runStreaming(
      PROMPTS.objections.text,
      `=== EIGENES UNTERNEHMEN ===\n${ctx}\n\n=== LIEFERANT: ${supplierData.name || "k.A."} ===\n${supplierData.analysis ? `Analyse:\n${supplierData.analysis}` : "Keine Analyse."}\n\n=== LIFO-PROFIL ===\n${li}\n${lifoData.analysis ? `Analyse: ${lifoData.analysis.replace(/^\[(UH|BÜ|AH|BF)\]\s*/, "").substring(0, 500)}` : ""}\n\nAntizipiere 6-8 KONKRETE Einwände, die dieser spezifische Lieferant in dieser Situation bringen wird.`
    );
  };

  const runSingle = () => {
    if (!customObj.trim()) return;
    runStreaming(
      PROMPTS.singleObj.text,
      `=== EIGENES UNTERNEHMEN ===\n${ctx}\n\n=== LIEFERANT: ${supplierData.name || "k.A."} ===\n${supplierData.analysis ? `Analyse:\n${supplierData.analysis.substring(0, 800)}` : ""}\n\n=== LIFO-PROFIL ===\n${li}\n\nEinwand: "${customObj}"`
    );
  };

  const cancel = () => {
    abortRef.current?.abort();
    setLoading(false);
    if (streamText) {
      setAnalysis(streamText + "\n\n---\n*[Generierung abgebrochen]*");
      onObjectionsChange(streamText);
      setStreamText("");
    }
  };

  const displayText = streamText || analysis;

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
          <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
            <Btn onClick={runSingle} disabled={!customObj.trim() || loading}>
              {loading ? "..." : "Einwand analysieren"}
            </Btn>
            {loading && <Btn onClick={cancel}>Abbrechen</Btn>}
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
          <div style={{ display: "flex", gap: "10px" }}>
            <Btn onClick={runAuto} disabled={loading}>
              {loading ? "..." : "Einwände generieren"}
            </Btn>
            {loading && <Btn onClick={cancel}>Abbrechen</Btn>}
          </div>
        </div>
      )}

      {loading && <Spinner text="Analysiert Einwände (Streaming)..." />}
      {displayText && (
        <div style={{ marginTop: "20px", borderRadius: "10px", padding: "20px", background: C.bgCard, border: `1px solid ${C.border}` }}>
          <Markdown text={displayText} />
          {!loading && <ExportBar text={displayText} title="Einwandbehandlung" />}
        </div>
      )}
    </div>
  );
}
