"use client";

import { useState, useRef } from "react";
import { Spinner, Btn, Markdown, LIFOBadge, ExportBar } from "@/components/UIKit";
import { LIFO } from "@/data/lifo";
import { PROMPTS } from "@/data/prompts";
import { C } from "@/data/colors";

interface Props {
  companyData: Record<string, string>;
  supplierData: { name: string; industry: string; analysis: string };
  lifoData: { style: string; analysis: string };
  strategy: string;
  onStrategyChange: (s: string) => void;
}

export default function Module4({ companyData, supplierData, lifoData, strategy, onStrategyChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    setLoading(true);
    setStreamText("");
    onStrategyChange("");

    const ctx = Object.entries(companyData)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const detectedStyle = lifoData.style || (lifoData.analysis?.match(/^\[(UH|BÜ|AH|BF)\]/)?.[1] ?? "");
    const lifoInfo = detectedStyle && LIFO[detectedStyle];
    const lb = lifoInfo
      ? `\nLIFO-STIL: ${lifoInfo.name}\nMerkmale: ${lifoInfo.traits}\nAnsprache: ${lifoInfo.approach}\nDo's: ${lifoInfo.doList.join(", ")}\nDon'ts: ${lifoInfo.dontList.join(", ")}\nUnter Druck: ${lifoInfo.underPressure}`
      : "";

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const r = await fetch("/api/ai-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemPrompt: PROMPTS.strategy.text,
          useWebSearch: false,
          userMessage: `=== EIGENES UNTERNEHMEN ===\n${ctx || "k.A."}\n\n=== LIEFERANT: ${supplierData.name || "k.A."} ===\n${supplierData.analysis ? `Lieferantenanalyse:\n${supplierData.analysis}` : "Keine Analyse vorhanden."}\n\n=== LIFO-PROFIL DES GESPRÄCHSPARTNERS ===${lb}\n${lifoData.analysis ? `\nDetaillierte LIFO-Analyse:\n${lifoData.analysis.replace(/^\[(UH|BÜ|AH|BF)\]\s*/, "")}` : ""}\n\nErstelle ein VOLLSTÄNDIGES Verhandlungsdrehbuch mit detaillierter Agenda und wortwörtlichen Formulierungen. Beziehe dich auf ALLE oben genannten konkreten Daten.`,
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);
            if (event.text) {
              fullText += event.text;
              setStreamText(fullText);
            }
            if (event.error) {
              throw new Error(event.error);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue; // JSON parse error ignorieren
            throw e;
          }
        }
      }

      onStrategyChange(fullText);
      setStreamText("");
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        // Abgebrochen vom Nutzer
        return;
      }
      const msg = e instanceof Error ? e.message : "Fehler";
      onStrategyChange("Fehler: " + msg);
      setStreamText("");
    }
    setLoading(false);
  };

  const cancel = () => {
    abortRef.current?.abort();
    setLoading(false);
    if (streamText) {
      onStrategyChange(streamText + "\n\n---\n*[Generierung abgebrochen]*");
      setStreamText("");
    }
  };

  const displayText = streamText || strategy;

  // LIFO-Stil: Entweder direkt aus style oder aus der Analyse extrahieren
  const lifoStyle = lifoData.style || (lifoData.analysis?.match(/^\[(UH|BÜ|AH|BF)\]/)?.[1] ?? "");

  const checks = [
    { l: "Unternehmensprofil", ok: Object.values(companyData).some((v) => v?.trim()) },
    { l: "Lieferantenanalyse", ok: !!supplierData.analysis },
    { l: "LIFO-Analyse", ok: !!lifoStyle || !!lifoData.analysis },
  ];

  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "14px", color: C.textSecondary }}>
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
        background: C.bgInput,
        border: `1px solid ${C.border}`
      }}>
        <p style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px", color: C.textPrimary }}>Datenbasis:</p>
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
                background: c.ok ? "#2E7D3215" : C.borderLight,
                color: c.ok ? "#4CAF50" : C.textDim,
                border: `1px solid ${c.ok ? "#2E7D3230" : C.borderLight}`
              }}
            >
              {c.ok ? "✓" : "○"} {c.l}
            </span>
          ))}
        </div>
        {lifoStyle && (
          <div style={{ marginTop: "10px" }}>
            <LIFOBadge style={lifoStyle} />
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <Btn onClick={run} disabled={loading}>
          {loading ? "Wird erstellt..." : "Strategie generieren"}
        </Btn>
        {loading && (
          <Btn onClick={cancel}>
            Abbrechen
          </Btn>
        )}
      </div>
      {loading && <Spinner text="Erstellt Harvard-Strategie mit Agenda (Streaming)..." />}
      {displayText && (
        <div style={{ marginTop: "20px", borderRadius: "10px", padding: "20px", background: C.bgCard, border: `1px solid ${C.border}` }}>
          <Markdown text={displayText} />
          {!loading && <ExportBar text={displayText} title="Verhandlungsstrategie" />}
        </div>
      )}
    </div>
  );
}
