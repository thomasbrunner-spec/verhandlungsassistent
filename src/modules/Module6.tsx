"use client";

import { useState, useEffect, useRef } from "react";
import { Spinner, Btn, Markdown } from "@/components/UIKit";
import LIFOCard from "@/components/LIFOCard";
import { LIFO } from "@/data/lifo";
import { PROMPTS } from "@/data/prompts";

interface Msg { role: "user" | "supplier"; text: string; }

interface Props {
  companyData: Record<string, string>;
  supplierData: { name: string };
  lifoData: { style: string };
}

export default function Module6({ companyData, supplierData, lifoData }: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [feedbackRequested, setFeedbackRequested] = useState(false);
  const [feedback, setFeedback] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const buildSysPrompt = (isFeedback = false) => {
    if (isFeedback) return PROMPTS.feedback.text;
    const lifoStyle = lifoData.style && LIFO[lifoData.style];
    return `${PROMPTS.sim.text}\nLieferant: "${supplierData.name || "?"}"\n${lifoStyle ? `LIFO: ${lifoStyle.name}. ${lifoStyle.traits}. Unter Druck: ${lifoStyle.underPressure}` : ""}${companyData.volume ? `\nVolumen: ${companyData.volume}` : ""}${companyData.currentTerms ? `\nKonditionen: ${companyData.currentTerms}` : ""}`;
  };

  const start = async () => {
    setStarted(true);
    setLoading(true);
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: buildSysPrompt(),
          userMessage: "Verhandlung beginnt. Begrüße den Einkäufer.",
        }),
      });
      const d = await r.json();
      setMsgs([{ role: "supplier", text: d.response || d.error }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      setMsgs([{ role: "supplier", text: "Fehler: " + msg }]);
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const newMsgs: Msg[] = [...msgs, { role: "user", text: input }];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    const history = newMsgs.map((m) => `${m.role === "user" ? "EINKÄUFER" : "LIEFERANT"}: ${m.text}`).join("\n\n");
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: buildSysPrompt(),
          userMessage: `Verlauf:\n\n${history}\n\nReagiere als Lieferant.`,
        }),
      });
      const d = await r.json();
      setMsgs([...newMsgs, { role: "supplier", text: d.response || d.error }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      setMsgs([...newMsgs, { role: "supplier", text: "Fehler: " + msg }]);
    }
    setLoading(false);
  };

  const getFeedback = async () => {
    setFeedbackRequested(true);
    setLoading(true);
    const history = msgs.map((m) => `${m.role === "user" ? "EINKÄUFER" : "LIEFERANT"}: ${m.text}`).join("\n\n");
    try {
      const r = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: buildSysPrompt(true),
          userMessage: `Dialog:\n\n${history}\n${lifoData.style ? `\nLIFO: ${LIFO[lifoData.style]?.name}` : ""}\nFeedback bitte.`,
        }),
      });
      const d = await r.json();
      setFeedback(d.response || d.error);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      setFeedback("Fehler: " + msg);
    }
    setLoading(false);
  };

  if (!started) {
    return (
      <div>
        <p style={{ fontSize: "13px", marginBottom: "14px", color: "#8892b0" }}>
          Simulation mit KI als Lieferant{lifoData.style ? ` (${LIFO[lifoData.style]?.name})` : ""}. Anschließend Feedback.
        </p>
        {lifoData.style && <LIFOCard style={lifoData.style} />}
        <div style={{ marginTop: "16px" }}>
          <Btn onClick={start}>Simulation starten</Btn>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        borderRadius: "10px",
        marginBottom: "14px",
        overflowY: "auto",
        background: "#0d0d1a",
        border: "1px solid #2a2a4a",
        maxHeight: 480
      }}>
        <div style={{ padding: "16px" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              marginBottom: "14px",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start"
            }}>
              <div
                style={{
                  maxWidth: "80%",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  borderRadius: "10px",
                  background: m.role === "user" ? "#e9456018" : "#1a1a2e",
                  border: `1px solid ${m.role === "user" ? "#e9456030" : "#2a2a4a"}`
                }}
              >
                <p style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: m.role === "user" ? "#e94560" : "#6b7394"
                }}>
                  {m.role === "user" ? "Sie (Einkäufer)" : `Lieferant${lifoData.style ? ` [${lifoData.style}]` : ""}`}
                </p>
                <p style={{
                  fontSize: "13px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  color: "#ccd6f6"
                }}>{m.text}</p>
              </div>
            </div>
          ))}
          {loading && <Spinner text="Lieferant antwortet..." />}
          <div ref={endRef} />
        </div>
      </div>

      {!feedbackRequested && (
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ihre Antwort..."
            rows={2}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            style={{
              flex: 1,
              paddingLeft: "14px",
              paddingRight: "14px",
              paddingTop: "10px",
              paddingBottom: "10px",
              borderRadius: "8px",
              fontSize: "13px",
              resize: "none",
              outline: "none",
              background: "#1a1a2e",
              border: "1px solid #2a2a4a",
              color: "#ccd6f6",
              fontFamily: "inherit"
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Btn onClick={send} disabled={!input.trim() || loading} style={{ paddingLeft: "14px", paddingRight: "14px", paddingTop: "10px", paddingBottom: "10px" }}>Senden</Btn>
            <Btn variant="secondary" onClick={getFeedback} disabled={msgs.length < 4 || loading} style={{ paddingLeft: "14px", paddingRight: "14px", paddingTop: "8px", paddingBottom: "8px", fontSize: "11px" }}>
              Feedback
            </Btn>
          </div>
        </div>
      )}

      {feedback && (
        <div style={{ marginTop: "20px", borderRadius: "10px", padding: "20px", background: "#16162a", border: "2px solid #e94560" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "14px", color: "#e94560" }}>Verhandlungsfeedback</h3>
          <Markdown text={feedback} />
        </div>
      )}
    </div>
  );
}
