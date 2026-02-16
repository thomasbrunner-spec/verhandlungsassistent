"use client";

import { useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const ctx = Object.entries(companyData)
      .filter(([, v]) => v?.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: PROMPTS.supplier.text,
          userMessage: `Analysiere "${name}"${industry ? ` (${industry})` : ""}.\n${ctx ? `Kontext:\n${ctx}` : ""}\nRecherchiere und identifiziere Wettbewerber.`,
        }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setAnalysis(d.response);
      onChange({ name, industry, analysis: d.response });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      setAnalysis("Fehler: " + msg);
    }
    setLoading(false);
  };

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
      <Btn onClick={run} disabled={!name.trim() || loading}>
        {loading ? "Analysiert..." : "Lieferant analysieren"}
      </Btn>
      {loading && <Spinner text="KI recherchiert Marktdaten..." />}
      {analysis && !loading && (
        <div style={{ marginTop: "20px", borderRadius: "10px", padding: "20px", background: C.bgCard, border: `1px solid ${C.border}` }}>
          <Markdown text={analysis} />
          <ExportBar text={analysis} title="Lieferantenanalyse" />
        </div>
      )}
    </div>
  );
}
