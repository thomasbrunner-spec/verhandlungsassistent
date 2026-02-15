"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#0a0a1a" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #1a1a2e", borderTopColor: "#e94560", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!user) return null;
  const apn = projects.find(p => p.id === activeProject)?.name;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a1a", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#ccd6f6" }}>
      {/* ── Sidebar ── */}
      <div style={{ width: sb ? 250 : 0, overflow: "hidden", background: "#0d0d1f", borderRight: "1px solid #1a1a3a", transition: "width 0.3s", flexShrink: 0 }}>
        <div style={{ padding: "20px 14px", width: 250 }}>
          {/* Logo */}
          <div style={{ marginBottom: 26 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Mono',monospace", lineHeight: 1.3, margin: 0 }}>
              <span style={{ color: "#e94560" }}>KI</span>
              <span style={{ color: "#ccd6f6" }}>-Verhandlungs</span>
              <br />
              <span style={{ color: "#6b7394" }}>assistent</span>
            </h1>
            <p style={{ color: "#4a4a6a", fontSize: 10, marginTop: 6, fontFamily: "'Space Mono',monospace" }}>Powered by Claude AI</p>
          </div>

          {/* Project selector */}
          <div style={{ marginBottom: 16, borderRadius: 8, padding: 12, background: "#0a0a1a", border: "1px solid #1a1a3a" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#4a4a6a" }}>Projekt</span>
              <button onClick={() => setShowPM(!showPM)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#4a4a6a", padding: 0, fontFamily: "inherit" }}>⚙</button>
            </div>
            {apn ? <p style={{ fontSize: 12, fontWeight: 600, color: "#e94560", margin: 0 }}>{apn}</p> : <p style={{ fontSize: 11, fontStyle: "italic", color: "#4a4a6a", margin: 0 }}>Kein Projekt</p>}
          </div>

          {showPM && (
            <div style={{ marginBottom: 16, borderRadius: 8, padding: 12, background: "#16162a", border: "1px solid #2a2a4a" }}>
              <h3 style={{ fontSize: 11, fontWeight: 600, color: "#ccd6f6", margin: "0 0 8px" }}>Projekte verwalten</h3>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Neues Projekt..." onKeyDown={e => e.key === "Enter" && createP()}
                  style={{ flex: 1, padding: "6px 8px", borderRadius: 4, fontSize: 11, outline: "none", background: "#1a1a2e", border: "1px solid #2a2a4a", color: "#ccd6f6", fontFamily: "inherit" }} />
                <button onClick={createP} disabled={!newProjectName.trim()} style={{ padding: "6px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", background: "#e94560", color: "#fff", opacity: newProjectName.trim() ? 1 : 0.4, fontFamily: "inherit" }}>+</button>
              </div>
              <div style={{ maxHeight: 128, overflowY: "auto" }}>
                {projects.map(p => (
                  <div key={p.id} onClick={() => { setActiveProject(p.id); setShowPM(false); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: 4, cursor: "pointer", marginBottom: 2, background: p.id === activeProject ? "#e9456012" : "transparent" }}>
                    <span style={{ fontSize: 11, color: p.id === activeProject ? "#e94560" : "#8892b0" }}>{p.name}</span>
                    <button onClick={e => { e.stopPropagation(); delP(p.id); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#4a4a6a", padding: 0, fontFamily: "inherit" }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module navigation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {MODS.map(mod => (
              <button key={mod.id} onClick={() => setM(mod.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: m === mod.id ? "#e9456012" : "transparent", cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "inherit" }}>
                <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{mod.i}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: m === mod.id ? 600 : 400, color: m === mod.id ? "#e94560" : "#8892b0", margin: 0 }}>
                    {mod.id > 0 && mod.id < 7 ? `${mod.id}. ` : ""}{mod.n}
                  </p>
                  <p style={{ fontSize: 9, color: "#4a4a6a", marginTop: 1, margin: 0 }}>{mod.d}</p>
                </div>
              </button>
            ))}
          </div>

          {/* User */}
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1a1a3a" }}>
            <p style={{ fontSize: 11, color: "#6b7394", margin: "0 0 4px" }}>{user.name}</p>
            <p style={{ fontSize: 10, color: "#4a4a6a", margin: "0 0 12px" }}>{user.email}</p>
            <button onClick={logout} style={{ width: "100%", padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1px solid #2a2a4a", color: "#4a4a6a", fontFamily: "inherit" }}>Abmelden</button>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "14px 22px", borderBottom: "1px solid #1a1a3a", display: "flex", alignItems: "center", gap: 14, background: "#0d0d1f" }}>
          <button onClick={() => setSb(!sb)} style={{ background: "none", border: "none", color: "#6b7394", cursor: "pointer", fontSize: 18, padding: 0, fontFamily: "inherit" }}>{sb ? "◀" : "▶"}</button>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{MODS[m].i} {MODS[m].n}</h2>
            <p style={{ fontSize: 11, color: "#4a4a6a", margin: 0 }}>{MODS[m].d}</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 28, overflowY: "auto", maxWidth: 860 }}>
          {!activeProject && m > 0 ? (
            <div style={{ background: "#16162a", border: "1px solid #2a2a4a", borderRadius: 10, padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 36, marginBottom: 12 }}>📁</p>
              <p style={{ color: "#6b7394", fontSize: 13, marginBottom: 16 }}>Bitte erstellen oder wählen Sie ein Verhandlungsprojekt.</p>
              <button onClick={() => { setSb(true); setShowPM(true); }} style={{ padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "#e94560", color: "#fff", fontFamily: "inherit" }}>Projekt erstellen</button>
            </div>
          ) : (
            <>
              {m === 0 && <Module0 onKbChange={setKb} />}
              {m === 1 && <Module1 data={cd} onChange={hCD} />}
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
