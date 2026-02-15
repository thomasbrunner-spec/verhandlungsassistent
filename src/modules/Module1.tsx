"use client";

import { QuestionCard } from "@/components/UIKit";

interface Props {
  data: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}

const QUESTIONS = [
  { k: "company", q: "Unternehmensname?", h: "Name und Beschreibung" },
  { k: "industry", q: "Branche?", h: "z.B. Automotive, Pharma..." },
  { k: "volume", q: "Einkaufsvolumen beim Lieferanten?", h: "Jährlich in EUR" },
  { k: "relationship", q: "Bisherige Geschäftsbeziehung?", h: "Dauer, Qualität" },
  { k: "currentTerms", q: "Aktuelle Konditionen?", h: "Preise, Zahlungsziele, Rabatte..." },
  { k: "goals", q: "Verhandlungsziele?", h: "z.B. Preisreduktion, bessere Konditionen..." },
  {
    k: "dependency",
    q: "Abhängigkeit vom Lieferanten?",
    t: "select" as const,
    o: ["Gering – leicht austauschbar", "Mittel – Alternativen vorhanden", "Hoch – schwer ersetzbar", "Kritisch – keine Alternative"],
  },
  { k: "alternatives", q: "Alternative Lieferanten?", h: "Welche? Warum (nicht)?" },
  { k: "constraints", q: "Interne Vorgaben/Einschränkungen?", h: "Budget, Compliance, Zeitdruck..." },
];

export default function Module1({ data, onChange }: Props) {
  const filled = QUESTIONS.filter((q) => data[q.k]?.trim()).length;

  return (
    <div>
      <p style={{ fontSize: "13px", marginBottom: "6px", color: "#8892b0" }}>
        Beschreiben Sie Ihre Verhandlungsposition. Alle Fragen überspringbar.
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: "#2a2a4a" }}>
          <div
            style={{
              height: "100%",
              borderRadius: "2px",
              transition: "width 0.3s ease",
              width: `${(filled / QUESTIONS.length) * 100}%`,
              background: "#e94560"
            }}
          />
        </div>
        <span style={{ fontSize: "11px", color: "#4a4a6a" }}>
          {filled}/{QUESTIONS.length}
        </span>
      </div>
      {QUESTIONS.map((q) => (
        <QuestionCard
          key={q.k}
          question={q.q}
          hint={q.h}
          value={data[q.k] || ""}
          onChange={(v) => onChange({ ...data, [q.k]: v })}
          onSkip={() => onChange({ ...data, [q.k]: "" })}
          type={(q.t as "textarea" | "select") || "textarea"}
          options={q.o || []}
        />
      ))}
    </div>
  );
}
