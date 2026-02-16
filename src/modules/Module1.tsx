"use client";

import { useState, useEffect } from "react";
import { Spinner, Btn, Input, TextArea } from "@/components/UIKit";
import { C } from "@/data/colors";

interface Profile {
  company_name: string;
  industry: string;
  website: string;
  employees: string;
  revenue: string;
  position: string;
  strengths: string;
  description: string;
}

const EMPTY_PROFILE: Profile = {
  company_name: "",
  industry: "",
  website: "",
  employees: "",
  revenue: "",
  position: "",
  strengths: "",
  description: "",
};

interface Props {
  data: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
  hasProject?: boolean;
}

export default function Module1({ data, onChange, hasProject = true }: Props) {
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");

  useEffect(() => {
    fetch("/api/company-profile")
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          setProfile(d.profile);
          setWebsiteUrl(d.profile.website || "");
          // Sync to project data
          syncToProjectData(d.profile);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncToProjectData = (p: Profile) => {
    onChange({
      ...data,
      company: p.company_name,
      industry: p.industry,
      volume: data.volume || "",
      relationship: data.relationship || "",
      currentTerms: data.currentTerms || "",
      goals: data.goals || "",
      dependency: data.dependency || "",
      alternatives: data.alternatives || "",
      constraints: data.constraints || "",
      companyDescription: p.description,
      companyStrengths: p.strengths,
      companyPosition: p.position,
    });
  };

  const update = (key: keyof Profile, value: string) => {
    const updated = { ...profile, [key]: value };
    setProfile(updated);
    setSaved(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    await fetch("/api/company-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    syncToProjectData(profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const analyzeWebsite = async () => {
    if (!websiteUrl.trim()) return;
    setAnalyzing(true);
    try {
      const r = await fetch("/api/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl.trim() }),
      });
      const d = await r.json();
      if (d.profile) {
        const merged: Profile = {
          company_name: d.profile.company_name || profile.company_name,
          industry: d.profile.industry || profile.industry,
          website: websiteUrl.trim(),
          employees: d.profile.employees || profile.employees,
          revenue: d.profile.revenue || profile.revenue,
          position: d.profile.position || profile.position,
          strengths: d.profile.strengths || profile.strengths,
          description: d.profile.description || profile.description,
        };
        setProfile(merged);
        setSaved(false);
      } else if (d.error) {
        alert(d.error);
      }
    } catch {
      alert("Fehler bei der Website-Analyse");
    }
    setAnalyzing(false);
  };

  if (loading) return <Spinner text="Unternehmensprofil wird geladen..." />;

  const filledCount = Object.values(profile).filter(v => v?.trim()).length;

  return (
    <div>
      <p style={{ fontSize: "13px", lineHeight: "1.5", marginBottom: "20px", color: C.textSecondary }}>
        Ihr Unternehmensprofil wird als Stammdaten gespeichert und gilt für alle Verhandlungsprojekte.
      </p>

      {/* Website Analysis */}
      <div style={{
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        background: C.bgCard,
        border: `1px solid ${C.borderLight}`
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: C.textPrimary }}>
          Website analysieren
        </h3>
        <p style={{ fontSize: "12px", color: C.textMuted, marginBottom: "14px" }}>
          Die KI liest Ihre Website und füllt das Profil automatisch aus.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <input
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              placeholder="https://www.ihr-unternehmen.de"
              onKeyDown={e => e.key === "Enter" && analyzeWebsite()}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: C.bgInput,
                border: `1px solid ${C.borderLight}`,
                borderRadius: 8,
                color: C.textPrimary,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box"
              }}
            />
          </div>
          <Btn onClick={analyzeWebsite} disabled={!websiteUrl.trim() || analyzing}>
            {analyzing ? "Analysiere..." : "Website auslesen"}
          </Btn>
        </div>
        {analyzing && (
          <div style={{ marginTop: "12px" }}>
            <Spinner text="Website wird analysiert... Dies kann einen Moment dauern." />
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div style={{
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "20px",
        background: C.bgCard,
        border: `1px solid ${C.borderLight}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: C.textPrimary, margin: 0 }}>
            Stammdaten
          </h3>
          <span style={{ fontSize: "11px", color: C.textDim }}>
            {filledCount}/{Object.keys(EMPTY_PROFILE).length} ausgefüllt
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Input value={profile.company_name} onChange={v => update("company_name", v)} label="Unternehmensname" placeholder="z.B. Mustermann GmbH" />
          <Input value={profile.industry} onChange={v => update("industry", v)} label="Branche" placeholder="z.B. Automotive, Pharma..." />
          <Input value={profile.employees} onChange={v => update("employees", v)} label="Mitarbeiter" placeholder="z.B. 250" />
          <Input value={profile.revenue} onChange={v => update("revenue", v)} label="Jahresumsatz" placeholder="z.B. 50 Mio. EUR" />
        </div>

        <Input value={profile.website} onChange={v => update("website", v)} label="Website" placeholder="https://..." />

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: C.textSecondary, marginBottom: 5, fontWeight: 500 }}>Marktposition & Kerngeschäft</label>
          <TextArea value={profile.position} onChange={v => update("position", v)} placeholder="Was ist Ihre Marktposition?" rows={3} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: C.textSecondary, marginBottom: 5, fontWeight: 500 }}>Stärken & USPs</label>
          <TextArea value={profile.strengths} onChange={v => update("strengths", v)} placeholder="Was sind Ihre Stärken?" rows={3} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: C.textSecondary, marginBottom: 5, fontWeight: 500 }}>Unternehmensbeschreibung</label>
          <TextArea value={profile.description} onChange={v => update("description", v)} placeholder="Ausführliche Beschreibung..." rows={5} />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Btn onClick={saveProfile} disabled={saving}>
            {saving ? "Speichere..." : "Stammdaten speichern"}
          </Btn>
          {saved && <span style={{ fontSize: "12px", color: C.success, fontWeight: 600 }}>✓ Gespeichert</span>}
        </div>
      </div>

      {/* Project-specific negotiation fields */}
      {hasProject ? (
        <div style={{
          borderRadius: "10px",
          padding: "20px",
          background: C.bgCard,
          border: `1px solid ${C.borderLight}`
        }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: C.textPrimary }}>
            Projektspezifisch
          </h3>
          <p style={{ fontSize: "12px", color: C.textMuted, marginBottom: "14px" }}>
            Diese Angaben gelten nur für die aktuelle Verhandlungsrunde.
          </p>

          <Input value={data.volume || ""} onChange={v => onChange({ ...data, volume: v })} label="Einkaufsvolumen beim Lieferanten" placeholder="Jährlich in EUR" />
          <Input value={data.relationship || ""} onChange={v => onChange({ ...data, relationship: v })} label="Bisherige Geschäftsbeziehung" placeholder="Dauer, Qualität" />
          <Input value={data.currentTerms || ""} onChange={v => onChange({ ...data, currentTerms: v })} label="Aktuelle Konditionen" placeholder="Preise, Zahlungsziele, Rabatte..." />

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: C.textSecondary, marginBottom: 5, fontWeight: 500 }}>Verhandlungsziele</label>
            <TextArea value={data.goals || ""} onChange={v => onChange({ ...data, goals: v })} placeholder="z.B. Preisreduktion um 5%, bessere Zahlungsziele..." rows={3} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: C.textSecondary, marginBottom: 8, fontWeight: 500 }}>Abhängigkeit vom Lieferanten</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Gering", "Mittel", "Hoch", "Kritisch"].map(o => (
                <button key={o} onClick={() => onChange({ ...data, dependency: o })}
                  style={{
                    padding: "7px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                    border: data.dependency === o ? `1px solid ${C.accent}` : `1px solid ${C.borderLight}`,
                    background: data.dependency === o ? C.accentBg : "transparent",
                    color: data.dependency === o ? C.accent : C.textSecondary
                  }}>
                  {o}
                </button>
              ))}
            </div>
          </div>

          <Input value={data.alternatives || ""} onChange={v => onChange({ ...data, alternatives: v })} label="Alternative Lieferanten" placeholder="Welche? Warum (nicht)?" />
          <Input value={data.constraints || ""} onChange={v => onChange({ ...data, constraints: v })} label="Interne Vorgaben/Einschränkungen" placeholder="Budget, Compliance, Zeitdruck..." />
        </div>
      ) : (
        <div style={{
          borderRadius: "10px",
          padding: "20px",
          background: C.bgCard,
          border: `1px solid ${C.borderLight}`,
          textAlign: "center"
        }}>
          <p style={{ fontSize: "13px", color: C.textMuted, margin: 0 }}>
            Erstellen Sie ein Projekt, um projektspezifische Verhandlungsdaten einzugeben.
          </p>
        </div>
      )}
    </div>
  );
}
