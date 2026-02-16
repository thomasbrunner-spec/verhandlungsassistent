"use client";

import { useState, useEffect, useRef } from "react";
import { Spinner, Btn, Input, TextArea } from "@/components/UIKit";
import { PROMPTS } from "@/data/prompts";
import { C } from "@/data/colors";

const MODELS = [
  { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", desc: "Schnellstes Modell, günstig (empfohlen)" },
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", desc: "Schnell & leistungsstark" },
  { id: "claude-opus-4-20250514", name: "Claude Opus 4", desc: "Stärkstes Modell, langsamer" },
];

interface Entry {
  id: string;
  title: string;
  content: string;
}

interface Props {
  onKbChange: (kb: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function Module0({ onKbChange, selectedModel, onModelChange }: Props) {
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

  const [uploading, setUploading] = useState(false);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", f);
      const r = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await r.json();
      if (data.error) {
        alert(data.error);
      } else if (data.id) {
        const updated = [data, ...entries];
        setEntries(updated);
        rebuildKb(updated);
      }
    } catch {
      alert("Fehler beim Hochladen");
    }
    setUploading(false);
    e.target.value = "";
  };

  if (loading) return <Spinner text="Wissensbasis wird geladen..." />;

  return (
    <div>
      <p style={{ fontSize: "13px", lineHeight: "1.5", marginBottom: "20px", color: C.textSecondary }}>
        Hinterlegen Sie Expertenwissen, das in allen Modulen berücksichtigt wird. Persistent gespeichert.
      </p>

      {/* Model Selection */}
      <div style={{
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        background: C.bgCard,
        border: `1px solid ${C.border}`
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "14px", color: C.textPrimary }}>KI-Modell</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {MODELS.map(mod => (
            <button
              key={mod.id}
              onClick={() => onModelChange(mod.id)}
              style={{
                flex: "1 1 0",
                minWidth: "160px",
                padding: "14px 16px",
                borderRadius: "8px",
                border: selectedModel === mod.id ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                background: selectedModel === mod.id ? C.accentBg : C.bgDeep,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                transition: "all 0.2s"
              }}
            >
              <p style={{ fontSize: "13px", fontWeight: 600, color: selectedModel === mod.id ? C.accent : C.textPrimary, margin: "0 0 4px" }}>{mod.name}</p>
              <p style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}>{mod.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {entries.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "10px", color: C.textPrimary }}>
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
                background: C.bgInput,
                border: `1px solid ${C.border}`
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "12px", fontWeight: "600", marginBottom: "2px", color: C.accent }}>{en.title}</h4>
                <p style={{ fontSize: "11px", color: C.textMuted }}>
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
                  color: C.textDim
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
        background: C.bgCard,
        border: `1px solid ${C.border}`
      }}>
        <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "14px", color: C.textPrimary }}>Neues Wissen hinzufügen</h3>
        <Input value={newTitle} onChange={setNewTitle} placeholder="z.B. LIFO-Stile, Harvard-Konzept..." label="Titel" />
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: C.textSecondary }}>Inhalt</label>
          <TextArea value={newContent} onChange={setNewContent} placeholder="Expertenwissen..." rows={8} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn onClick={save} disabled={!newTitle.trim() || !newContent.trim() || saving}>
            {saving ? "..." : "Speichern"}
          </Btn>
          <Btn variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Wird verarbeitet..." : "Datei hochladen"}
          </Btn>
          <input ref={fileRef} type="file" accept=".txt,.md,.csv,.pdf,.docx,.pptx" onChange={upload} style={{ display: "none" }} />
        </div>
      </div>

      <div style={{
        borderRadius: "10px",
        overflow: "hidden",
        background: C.bgCard,
        border: `1px solid ${C.border}`
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
          <span style={{ fontSize: "13px", fontWeight: "600", color: C.textPrimary }}>System-Prompts anzeigen</span>
          <span
            style={{
              fontSize: "16px",
              transition: "transform 0.3s ease",
              color: C.textDim,
              transform: showPrompts ? "rotate(180deg)" : "none"
            }}
          >
            ▼
          </span>
        </button>
        {showPrompts && (
          <div style={{ paddingLeft: "16px", paddingRight: "16px", paddingBottom: "16px" }}>
            <p style={{ fontSize: "11px", fontStyle: "italic", marginBottom: "14px", color: C.textMuted }}>
              Prompts steuern das KI-Verhalten – transparent als Qualitätsnachweis.
            </p>
            {Object.entries(PROMPTS).map(([k, { name, text }]) => (
              <div key={k} style={{ marginBottom: "10px" }}>
                <h4 style={{ fontSize: "11px", fontWeight: "600", marginBottom: "4px", color: C.accent }}>{name}</h4>
                <pre
                  style={{
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "10px",
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowY: "auto",
                    background: C.bgDeep,
                    border: `1px solid ${C.borderLight}`,
                    color: C.textMuted,
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
