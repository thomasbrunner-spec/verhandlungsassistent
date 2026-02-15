"use client";

import { useState, useEffect, useRef } from "react";
import { Spinner, Btn, Input, TextArea } from "@/components/UIKit";
import { PROMPTS } from "@/data/prompts";

interface Entry {
  id: string;
  title: string;
  content: string;
}

interface Props {
  onKbChange: (kb: string) => void;
}

export default function Module0({ onKbChange }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const rebuildKb = (arr: Entry[]) => {
    onKbChange(arr.length ? arr.map((e) => `[${e.title}]\n${e.content}`).join("\n\n---\n\n") : "");
  };

  useEffect(() => {
    fetch("/api/knowledge")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries || []);
        rebuildKb(d.entries || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    const r = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() }),
    });
    const data = await r.json();
    if (data.id) {
      const updated = [data, ...entries];
      setEntries(updated);
      rebuildKb(updated);
      setNewTitle("");
      setNewContent("");
    }
    setSaving(false);
  };

  const remove = async (id: string) => {
    await fetch("/api/knowledge", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    rebuildKb(updated);
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      const r = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: f.name, content }),
      });
      const data = await r.json();
      if (data.id) {
        const updated = [data, ...entries];
        setEntries(updated);
        rebuildKb(updated);
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };

  if (loading) return <Spinner text="Wissensbasis wird geladen..." />;

  return (
    <div>
      <p style={{ fontSize: "13px", lineHeight: "1.5", marginBottom: "20px", color: "#8892b0" }}>
        Hinterlegen Sie Expertenwissen, das in allen Modulen berücksichtigt wird. Persistent gespeichert.
      </p>

      {entries.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "10px", color: "#ccd6f6" }}>
            Gespeichertes Wissen ({entries.length})
          </h3>
          {entries.map((en) => (
            <div
              key={en.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderRadius: "8px",
                padding: "14px",
                marginBottom: "6px",
                background: "#1a1a2e",
                border: "1px solid #2a2a4a"
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "12px", fontWeight: "600", marginBottom: "2px", color: "#e94560" }}>{en.title}</h4>
                <p style={{ fontSize: "11px", color: "#6b7394" }}>
                  {en.content.slice(0, 180)}{en.content.length > 180 ? "..." : ""}
                </p>
              </div>
              <button
                onClick={() => remove(en.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  paddingLeft: "12px",
                  color: "#4a4a6a"
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        background: "#16162a",
        border: "1px solid #2a2a4a"
      }}>
        <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "14px", color: "#ccd6f6" }}>Neues Wissen hinzufügen</h3>
        <Input value={newTitle} onChange={setNewTitle} placeholder="z.B. LIFO-Stile, Harvard-Konzept..." label="Titel" />
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: "#8892b0" }}>Inhalt</label>
          <TextArea value={newContent} onChange={setNewContent} placeholder="Expertenwissen..." rows={8} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn onClick={save} disabled={!newTitle.trim() || !newContent.trim() || saving}>
            {saving ? "..." : "Speichern"}
          </Btn>
          <Btn variant="secondary" onClick={() => fileRef.current?.click()}>
            Datei hochladen
          </Btn>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv" onChange={upload} style={{ display: "none" }} />
        </div>
      </div>

      <div style={{
        borderRadius: "10px",
        overflow: "hidden",
        background: "#16162a",
        border: "1px solid #2a2a4a"
      }}>
        <button
          onClick={() => setShowPrompts(!showPrompts)}
          style={{
            width: "100%",
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingTop: "14px",
            paddingBottom: "14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "inherit"
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#ccd6f6" }}>System-Prompts anzeigen</span>
          <span
            style={{
              fontSize: "16px",
              transition: "transform 0.3s ease",
              color: "#4a4a6a",
              transform: showPrompts ? "rotate(180deg)" : "none"
            }}
          >
            ▼
          </span>
        </button>
        {showPrompts && (
          <div style={{ paddingLeft: "16px", paddingRight: "16px", paddingBottom: "16px" }}>
            <p style={{ fontSize: "11px", fontStyle: "italic", marginBottom: "14px", color: "#6b7394" }}>
              Prompts steuern das KI-Verhalten – transparent als Qualitätsnachweis.
            </p>
            {Object.entries(PROMPTS).map(([k, { name, text }]) => (
              <div key={k} style={{ marginBottom: "10px" }}>
                <h4 style={{ fontSize: "11px", fontWeight: "600", marginBottom: "4px", color: "#e94560" }}>{name}</h4>
                <pre
                  style={{
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "10px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowY: "auto",
                    background: "#0a0a1a",
                    border: "1px solid #1a1a3a",
                    color: "#6b7394",
                    maxHeight: 180
                  }}
                >
                  {text}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
