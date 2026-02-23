"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/data/colors";
import Module0 from "@/modules/Module0";
import Module1 from "@/modules/Module1";
import Module2 from "@/modules/Module2";
import Module3 from "@/modules/Module3";
import Module4 from "@/modules/Module4";
import Module5 from "@/modules/Module5";
import Module6 from "@/modules/Module6";
import Module7 from "@/modules/Module7";

interface User { userId: string; email: string; name: string; }
interface Project { id: string; name: string; }

const MODS = [
  { id: 0, n: "Wissensbasis", i: "📚", d: "Expertenwissen & Prompts" },
  { id: 1, n: "Unternehmensprofil", i: "🏢", d: "Eigene Position" },
  { id: 2, n: "Lieferantenanalyse", i: "🔍", d: "Markt & Wettbewerber" },
  { id: 3, n: "LIFO-Analyse", i: "🎯", d: "Gesprächspartner" },
  { id: 4, n: "Strategie", i: "📋", d: "Harvard-Drehbuch & Agenda" },
  { id: 5, n: "Einwandbehandlung", i: "🛡", d: "Einwände antizipieren" },
  { id: 6, n: "Simulation", i: "🎭", d: "Verhandlung üben" },
  { id: 7, n: "Briefing", i: "📊", d: "Ergebnis-Zusammenfassung" },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [m, setM] = useState(0);
  const [sb, setSb] = useState(true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [showPM, setShowPM] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [kb, setKb] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-haiku-4-5");
  const [cd, setCd] = useState<Record<string, string>>({});
  const [sd, setSd] = useState<{ name: string; industry: string; analysis: string }>({ name: "", industry: "", analysis: "" });
  const [lfd, setLfd] = useState<{ behaviors: string; analysis: string; style: string }>({ behaviors: "", analysis: "", style: "" });
  const [strat, setStrat] = useState("");
  const [obj, setObj] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setUser(d.user); else router.push("/login");
      setLoading(false);
    }).catch(() => { router.push("/login"); setLoading(false); });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/projects").then(r => r.json()).then(d => {
      setProjects(d.projects || []);
      if (d.projects?.length > 0 && !activeProject) setActiveProject(d.projects[0].id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPD = useCallback(async (pid: string) => {
    const r = await fetch(`/api/project-data?projectId=${pid}`);
    const d = await r.json();
    const data = d.data || {};
    setCd(data.companyData ? JSON.parse(data.companyData) : {});
    setSd(data.supplierData ? JSON.parse(data.supplierData) : { name: "", industry: "", analysis: "" });
    setLfd(data.lifoData ? JSON.parse(data.lifoData) : { behaviors: "", analysis: "", style: "" });
    setStrat(data.strategy || "");
    setObj(data.objections || "");
  }, []);

  useEffect(() => { if (activeProject) loadPD(activeProject); }, [activeProject, loadPD]);

  const saveMD = useCallback(async (key: string, value: string) => {
    if (!activeProject) return;
    await fetch("/api/project-data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projectId: activeProject, module: 0, key, value }) });
  }, [activeProject]);

  const hCD = useCallback((data: Record<string, string>) => { setCd(data); saveMD("companyData", JSON.stringify(data)); }, [saveMD]);
  const hSD = useCallback((data: { name: string; industry: string; analysis: string }) => { setSd(data); saveMD("supplierData", JSON.stringify(data)); }, [saveMD]);
  const hLD = useCallback((data: { behaviors: string; analysis: string; style: string }) => { setLfd(data); saveMD("lifoData", JSON.stringify(data)); }, [saveMD]);
  const hSt = useCallback((s: string) => { setStrat(s); saveMD("strategy", s); }, [saveMD]);
  const hOb = useCallback((o: string) => { setObj(o); saveMD("objections", o); }, [saveMD]);

  const createP = async () => {
    if (!newProjectName.trim()) return;
    const r = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newProjectName.trim() }) });
    const d = await r.json();
    if (d.id) { setProjects([{ id: d.id, name: d.name }, ...projects]); setActiveProject(d.id); setNewProjectName(""); setShowPM(false); setCd({}); setSd({ name: "", industry: "", analysis: "" }); setLfd({ behaviors: "", analysis: "", style: "" }); setStrat(""); setObj(""); }
  };

  const delP = async (id: string) => {
    await fetch("/api/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const u = projects.filter(p => p.id !== id); setProjects(u);
    if (activeProject === id) setActiveProject(u.length > 0 ? u[0].id : null);
  };

  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); };

  if (loading) return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: C.bgDeep }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!user) return null;
  const apn = projects.find(p => p.id === activeProject)?.name;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bgMain, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.textPrimary }}>
      {/* ── Sidebar ── */}
      <div style={{ width: sb ? 290 : 0, overflow: "hidden", background: C.bgSidebar, borderRight: `1px solid ${C.border}`, transition: "width 0.3s", flexShrink: 0 }}>
        <div style={{ padding: "24px 18px", width: 290 }}>
          {/* Logo */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono',monospace", lineHeight: 1.3, margin: 0 }}>
              <span style={{ color: C.accent }}>KI</span>
              <span style={{ color: C.textPrimary }}>-Verhandlungs</span>
              <br />
              <span style={{ color: C.textMuted }}>assistent</span>
            </h1>
            <p style={{ color: C.textDim, fontSize: 11, marginTop: 6, fontFamily: "'Space Mono',monospace" }}>Powered by Claude AI</p>
          </div>

          {/* Project selector */}
          <div style={{ marginBottom: 18, borderRadius: 8, padding: 14, background: C.bgDeep, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: C.textDim }}>Projekt</span>
              <button onClick={() => setShowPM(!showPM)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: C.textDim, padding: 0, fontFamily: "inherit" }}>⚙</button>
            </div>
            {apn ? <p style={{ fontSize: 14, fontWeight: 600, color: C.accent, margin: 0 }}>{apn}</p> : <p style={{ fontSize: 13, fontStyle: "italic", color: C.textDim, margin: 0 }}>Kein Projekt</p>}
          </div>

          {showPM && (
            <div style={{ marginBottom: 18, borderRadius: 8, padding: 14, background: C.bgCard, border: `1px solid ${C.borderLight}` }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: "0 0 10px" }}>Projekte verwalten</h3>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Neues Projekt..." onKeyDown={e => e.key === "Enter" && createP()}
                  style={{ flex: 1, padding: "8px 10px", borderRadius: 6, fontSize: 13, outline: "none", background: C.bgInput, border: `1px solid ${C.borderLight}`, color: C.textPrimary, fontFamily: "inherit" }} />
                <button onClick={createP} disabled={!newProjectName.trim()} style={{ padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: C.accent, color: "#fff", opacity: newProjectName.trim() ? 1 : 0.4, fontFamily: "inherit" }}>+</button>
              </div>
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                {projects.map(p => (
                  <div key={p.id} onClick={() => { setActiveProject(p.id); setShowPM(false); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 6, cursor: "pointer", marginBottom: 3, background: p.id === activeProject ? C.accentBg : "transparent" }}>
                    <span style={{ fontSize: 13, color: p.id === activeProject ? C.accent : C.textSecondary }}>{p.name}</span>
                    <button onClick={e => { e.stopPropagation(); delP(p.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.textDim, padding: 0, fontFamily: "inherit" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module navigation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {MODS.map(mod => (
              <button key={mod.id} onClick={() => setM(mod.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, border: "none", background: m === mod.id ? C.accentBg : "transparent", cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "inherit" }}>
                <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>{mod.i}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: m === mod.id ? 600 : 400, color: m === mod.id ? C.accent : C.textSecondary, margin: 0 }}>
                    {mod.id > 0 && mod.id < 7 ? `${mod.id}. ` : ""}{mod.n}
                  </p>
                  <p style={{ fontSize: 11, color: C.textDim, marginTop: 2, margin: 0 }}>{mod.d}</p>
                </div>
              </button>
            ))}
          </div>

          {/* User */}
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 4px" }}>{user.name}</p>
            <p style={{ fontSize: 11, color: C.textDim, margin: "0 0 14px" }}>{user.email}</p>
            <button onClick={logout} style={{ width: "100%", padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: `1px solid ${C.borderLight}`, color: C.textDim, fontFamily: "inherit" }}>Abmelden</button>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14, background: C.bgSidebar }}>
          <button onClick={() => setSb(!sb)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, fontFamily: "inherit" }}>{sb ? "◀" : "▶"}</button>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{MODS[m].i} {MODS[m].n}</h2>
            <p style={{ fontSize: 11, color: C.textDim, margin: 0 }}>{MODS[m].d}</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 28, overflowY: "auto", maxWidth: 860 }}>
          {!activeProject && m > 1 ? (
            <div style={{ background: C.bgCard, border: `1px solid ${C.borderLight}`, borderRadius: 10, padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>📁</p>
              <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 16 }}>Bitte erstellen oder wählen Sie ein Verhandlungsprojekt.</p>
              <button onClick={() => { setSb(true); setShowPM(true); }} style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: C.accent, color: "#fff", fontFamily: "inherit" }}>Projekt erstellen</button>
            </div>
          ) : (
            <>
              {m === 0 && <Module0 onKbChange={setKb} selectedModel={selectedModel} onModelChange={setSelectedModel} />}
              {m === 1 && <Module1 data={cd} onChange={hCD} hasProject={!!activeProject} />}
              {m === 2 && <Module2 data={sd} onChange={hSD} companyData={cd} />}
              {m === 3 && <Module3 data={lfd} onChange={hLD} />}
              {m === 4 && <Module4 companyData={cd} supplierData={sd} lifoData={lfd} strategy={strat} onStrategyChange={hSt} />}
              {m === 5 && <Module5 companyData={cd} supplierData={sd} lifoData={lfd} objections={obj} onObjectionsChange={hOb} />}
              {m === 6 && <Module6 companyData={cd} supplierData={sd} lifoData={lfd} />}
              {m === 7 && <Module7 companyData={cd} supplierData={sd} lifoData={lfd} strategy={strat} objections={obj} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
