"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "@/data/colors";

const inputStyle = {
  width: "100%",
  paddingLeft: "14px",
  paddingRight: "14px",
  paddingTop: "10px",
  paddingBottom: "10px",
  borderRadius: "8px",
  fontSize: "13px",
  outline: "none",
  background: C.bgInput,
  border: `1px solid ${C.border}`,
  color: C.textPrimary,
};

const labelStyle = {
  display: "block" as const,
  fontSize: "12px",
  fontWeight: "500" as const,
  marginBottom: "6px",
  color: C.textSecondary,
};

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister
      ? { email, password, name, registrationCode }
      : { email, password };

    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (data.error) {
        setError(data.error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Verbindungsfehler");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: C.bgDeep
    }}>
      <div style={{
        width: "100%",
        maxWidth: "448px",
        padding: "32px",
        borderRadius: "12px",
        background: C.bgCard,
        border: `1px solid ${C.border}`
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px", fontFamily: "'Space Mono', monospace" }}>
            <span style={{ color: C.accent }}>KI</span>
            <span style={{ color: C.textPrimary }}>-Verhandlungs</span>
            <span style={{ color: C.textMuted }}>assistent</span>
          </h1>
          <p style={{ fontSize: "12px", marginTop: "8px", color: C.textDim, fontFamily: "'Space Mono', monospace" }}>
            Powered by Claude AI
          </p>
        </div>

        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "24px", textAlign: "center", color: C.textPrimary }}>
          {isRegister ? "Registrieren" : "Anmelden"}
        </h2>

        {error && (
          <div style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "13px",
            background: C.accentBg,
            border: `1px solid ${C.accentBorder}`,
            color: C.accent
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Ihr Name"
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Registrierungscode</label>
                <input
                  type="text"
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Code vom Administrator"
                />
              </div>
            </>
          )}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder="name@firma.de"
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
              placeholder="Mindestens 6 Zeichen"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              paddingTop: "12px",
              paddingBottom: "12px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              border: "none",
              transition: "opacity 0.3s ease",
              background: C.accent,
              color: "#fff",
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? "..." : isRegister ? "Registrieren" : "Anmelden"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: C.textMuted }}>
          {isRegister ? "Bereits registriert?" : "Noch kein Konto?"}{" "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              color: C.accent
            }}
          >
            {isRegister ? "Anmelden" : "Registrieren"}
          </button>
        </p>
      </div>
    </div>
  );
}
