"use client";

import { Markdown, LIFOBadge } from "@/components/UIKit";

interface Props {
  companyData: Record<string, string>;
  supplierData: { name: string; industry: string; analysis: string };
  lifoData: { style: string; analysis: string };
  strategy: string;
  objections: string;
}

export default function Module7({ companyData, supplierData, lifoData, strategy, objections }: Props) {
  const sections: { t: string; c: string }[] = [];
  const ce = Object.entries(companyData).filter(([, v]) => v?.trim());

  if (ce.length) sections.push({ t: "🏢 Unternehmensprofil", c: ce.map(([k, v]) => `**${k}**: ${v}`).join("\n") });
  if (supplierData.analysis) sections.push({ t: `🔍 Lieferantenanalyse – ${supplierData.name || ""}`, c: supplierData.analysis });
  if (lifoData.style) sections.push({ t: "🎯 LIFO-Analyse", c: lifoData.analysis?.replace(/^\[(SH|CT|CH|AD)\]\s*/, "") || "" });
  if (strategy) sections.push({ t: "📋 Verhandlungsstrategie", c: strategy });
  if (objections) sections.push({ t: "🛡 Einwandbehandlung", c: objections });

  if (!sections.length) {
    return (
      <div>
        <p style={{ fontSize: "13px", marginBottom: "16px", color: "#8892b0" }}>
          Gesamtübersicht aller Ergebnisse als Verhandlungs-Briefing.
        </p>
        <div style={{
          borderRadius: "10px",
          padding: "32px",
          textAlign: "center",
          background: "#16162a",
          border: "1px solid #2a2a4a"
        }}>
          <p style={{ fontSize: "36px", marginBottom: "12px" }}>📭</p>
          <p style={{ fontSize: "13px", color: "#6b7394" }}>Noch keine Ergebnisse. Arbeiten Sie Module 1-5 durch.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "8px", color: "#8892b0" }}>Ihr Verhandlungs-Briefing. Ideal vor dem Termin.</p>
      {lifoData.style && (
        <div style={{ marginBottom: "16px" }}>
          <LIFOBadge style={lifoData.style} />
        </div>
      )}

      <div style={{
        display: "grid",
        gap: "10px",
        marginBottom: "20px",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))"
      }}>
        {[
          { l: "Lieferant", v: supplierData.name || "–", i: "🏭" },
          { l: "Branche", v: supplierData.industry || companyData.industry || "–", i: "📊" },
          { l: "LIFO", v: lifoData.style || "–", i: "🎯" },
          { l: "Abhängigkeit", v: companyData.dependency?.split(" – ")[0] || "–", i: "🔗" },
        ].map((s, i) => (
          <div key={i} style={{
            borderRadius: "8px",
            padding: "14px",
            textAlign: "center",
            background: "#16162a",
            border: "1px solid #2a2a4a"
          }}>
            <p style={{ fontSize: "20px", marginBottom: "4px" }}>{s.i}</p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: "#ccd6f6" }}>{s.v}</p>
            <p style={{ fontSize: "10px", color: "#4a4a6a" }}>{s.l}</p>
          </div>
        ))}
      </div>

      {sections.map((s, i) => (
        <details key={i} style={{ marginBottom: "8px" }} open={i < 2}>
          <summary
            style={{
              borderRadius: "8px",
              paddingLeft: "16px",
              paddingRight: "16px",
              paddingTop: "14px",
              paddingBottom: "14px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              background: "#16162a",
              border: "1px solid #2a2a4a",
              color: "#ccd6f6",
              listStyle: "none"
            }}
          >
            {s.t}
          </summary>
          <div style={{
            padding: "20px",
            background: "#12122a",
            border: "1px solid #2a2a4a",
            borderTop: "none",
            borderRadius: "0 0 8px 8px"
          }}>
            <Markdown text={s.c} />
          </div>
        </details>
      ))}
    </div>
  );
}
