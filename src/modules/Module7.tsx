"use client";

import { Markdown, LIFOBadge, ExportBar } from "@/components/UIKit";
import { C } from "@/data/colors";

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
  if (lifoData.style) sections.push({ t: "🎯 LIFO-Analyse", c: lifoData.analysis?.replace(/^\[(UH|BÜ|AH|BF)\]\s*/, "") || "" });
  if (strategy) sections.push({ t: "📋 Verhandlungsstrategie", c: strategy });
  if (objections) sections.push({ t: "🛡 Einwandbehandlung", c: objections });

  if (!sections.length) {
    return (
      <div>
        <p style={{ fontSize: "13px", marginBottom: "16px", color: C.textSecondary }}>
          Gesamtübersicht aller Ergebnisse als Verhandlungs-Briefing.
        </p>
        <div style={{
          borderRadius: "10px",
          padding: "32px",
          textAlign: "center",
          background: C.bgCard,
          border: `1px solid ${C.border}`
        }}>
          <p style={{ fontSize: "36px", marginBottom: "12px" }}>📭</p>
          <p style={{ fontSize: "13px", color: C.textMuted }}>Noch keine Ergebnisse. Arbeiten Sie Module 1-5 durch.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "8px", color: C.textSecondary }}>Ihr Verhandlungs-Briefing. Ideal vor dem Termin.</p>
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
            background: C.bgCard,
            border: `1px solid ${C.border}`
          }}>
            <p style={{ fontSize: "20px", marginBottom: "4px" }}>{s.i}</p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: C.textPrimary }}>{s.v}</p>
            <p style={{ fontSize: "10px", color: C.textDim }}>{s.l}</p>
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
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
              listStyle: "none"
            }}
          >
            {s.t}
          </summary>
          <div style={{
            padding: "20px",
            background: C.bgDeep,
            border: `1px solid ${C.border}`,
            borderTop: "none",
            borderRadius: "0 0 8px 8px"
          }}>
            <Markdown text={s.c} />
          </div>
        </details>
      ))}

      {sections.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <ExportBar
            text={sections.map(s => `${s.t}\n\n${s.c}`).join("\n\n---\n\n")}
            title="Verhandlungsbriefing"
          />
        </div>
      )}
    </div>
  );
}
