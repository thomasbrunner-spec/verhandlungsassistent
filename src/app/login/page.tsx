"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister ? { email, password, name } : { email, password };

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
      background: "#0a0a1a"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "448px",
        padding: "32px",
        borderRadius: "12px",
        background: "#16162a",
        border: "1px solid #2a2a4a"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px", fontFamily: "'Space Mono', monospace" }}>
            <span style={{ color: "#e94560" }}>KI</span>
            <span style={{ color: "#ccd6f6" }}>-Verhandlungs</span>
            <span style={{ color: "#6b7394" }}>assistent</span>
          </h1>
          <p style={{ fontSize: "12px", marginTop: "8px", color: "#4a4a6a", fontFamily: "'Space Mono', monospace" }}>
            Powered by Claude AI
          </p>
        </div>

        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "24px", textAlign: "center", color: "#ccd6f6" }}>
          {isRegister ? "Registrieren" : "Anmelden"}
        </h2>

        {error && (
          <div style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "13px",
            background: "#e9456018",
            border: "1px solid #e9456030",
            color: "#e94560"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: "#8892b0" }}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  paddingLeft: "14px",
                  paddingRight: "14px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                  background: "#1a1a2e",
                  border: "1px solid #2a2a4a",
                  color: "#ccd6f6"
                }}
                placeholder="Ihr Name"
              />
            </div>
          )}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: "#8892b0" }}>E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                paddingLeft: "14px",
                paddingRight: "14px",
                paddingTop: "10px",
                paddingBottom: "10px",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
                background: "#1a1a2e",
                border: "1px solid #2a2a4a",
                color: "#ccd6f6"
              }}
              placeholder="name@firma.de"
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px", color: "#8892b0" }}>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: "100%",
                paddingLeft: "14px",
                paddingRight: "14px",
                paddingTop: "10px",
                paddingBottom: "10px",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
                background: "#1a1a2e",
                border: "1px solid #2a2a4a",
                color: "#ccd6f6"
              }}
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
              background: "#e94560",
              color: "#fff",
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? "..." : isRegister ? "Registrieren" : "Anmelden"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#6b7394" }}>
          {isRegister ? "Bereits registriert?" : "Noch kein Konto?"}{" "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              color: "#e94560"
            }}
          >
            {isRegister ? "Anmelden" : "Registrieren"}
          </button>
        </p>
      </div>
    </div>
  );
}
