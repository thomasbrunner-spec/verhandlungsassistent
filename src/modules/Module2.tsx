"use client";

import { useState, useRef } from "react";
import { Spinner, Btn, Input, Markdown, ExportBar } from "@/components/UIKit";
import { PROMPTS } from "@/data/prompts";
import { C } from "@/data/colors";

interface SupplierData {
  name: string;
  industry: string;
  analysis: string;
}

interface Props {
  data: SupplierData;
  onChange: (data: SupplierData) => void;
  companyData: Record<string, string>;
}

export default function Module2({ data, onChange, companyData }: Props) {
  const [name, setName] = useState(data.name || "");
  const [industry, setIndustry] = useState(data.industry || "");
  const [analysis, setAnalysis] = useState(data.analysis || "");
  const [streamText, setStreamText] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setStreamText("");
    setAnalysis("");

    const ctx = Object.entries(companyData)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const r = await fetch("/api/ai-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemPrompt: PROMPTS.supplier.text,
          useWebSearch: true, // Lieferantenanalyse braucht Web-Recherche
          userMessage: `Analysiere "${name}"${industry ? ` (${industry})` : ""}.\n${ctx ? `Kontext:\n${ctx}` : ""}\nRecherchiere und identifiziere Wettbewerber.`,
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
          const d = line.slice(6).trim();
          if (d === "[DONE]") continue;

          try {
            const event = JSON.parse(d);
            if (event.text) {
              fullText += event.text;
              setStreamText(fullText);
            }
            if (event.error) throw new Error(event.error);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      setAnalysis(fullText);
      setStreamText("");
      onChange({ name, industry, analysis: fullText });
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
    if (streamText) {
      setAnalysis(streamText + "\n\n---\n*[Generierung abgebrochen]*");
      onChange({ name, industry, analysis: streamText });
      setStreamText("");
    }
  };

  const displayText = streamText || analysis;

  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "16px", color: C.textSecondary }}>
        KI recherchiert Marktposition, Finanzdaten, Entwicklungen und Wettbewerber.
      </p>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <div style={{ flex: 2 }}>
          <Input value={name} onChange={setName} placeholder="z.B. Bosch..." label="Lieferantenname" />
        </div>
        <div style={{ flex: 1 }}>
          <Input value={industry} onChange={setIndustry} placeholder="Elektronik..." label="Branche (optional)" />
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <Btn onClick={run} disabled={!name.trim() || loading}>
          {loading ? "Analysiert..." : "Lieferant analysieren"}
        </Btn>
        {loading && <Btn onClick={cancel}>Abbrechen</Btn>}
      </div>
      {loading && <Spinner text="KI recherchiert Marktdaten (Streaming)..." />}
      {displayText && (
        <div style={{ marginTop: "20px", borderRadius: "10px", padding: "20px", background: C.bgCard, border: `1px solid ${C.border}` }}>
          <Markdown text={displayText} />
          {!loading && <ExportBar text={displayText} title="Lieferantenanalyse" />}
        </div>
      )}
    </div>
  );
}
