"use client";

import { useState, useEffect } from "react";
import { C } from "@/data/colors";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface Props {
  currentEmail: string;
}

export default function AdminPanel({ currentEmail }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => {
        if (r.status === 403) {
          setIsAdmin(false);
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        if (d.error) {
          setError(d.error);
        } else {
          setIsAdmin(true);
          setUsers(d.users || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Verbindungsfehler");
        setLoading(false);
      });
  }, []);

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Nutzer "${email}" wirklich löschen? Alle Daten werden entfernt.`)) return;
    setDeleting(userId);
    try {
      const r = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const d = await r.json();
      if (d.error) {
        setError(d.error);
      } else {
        setUsers(users.filter((u) => u.id !== userId));
      }
    } catch {
      setError("Löschfehler");
    }
    setDeleting(null);
  };

  if (!isAdmin && !loading) return null;

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ width: 24, height: 24, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px", color: C.textPrimary }}>
        👑 Administration
      </h3>
      <p style={{ fontSize: "13px", marginBottom: "20px", color: C.textSecondary }}>
        {users.length} registrierte Nutzer
      </p>

      {error && (
        <div style={{
          marginBottom: "16px",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "13px",
          background: C.accentBg,
          border: `1px solid ${C.accentBorder}`,
          color: C.accent,
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {users.map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: "10px",
              background: C.bgCard,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary }}>
                  {u.name}
                </span>
                {u.email === currentEmail && (
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: C.accentBg,
                    border: `1px solid ${C.accentBorder}`,
                    color: C.accent,
                  }}>
                    ADMIN
                  </span>
                )}
              </div>
              <span style={{ fontSize: "12px", color: C.textMuted }}>{u.email}</span>
              <span style={{ fontSize: "11px", color: C.textDim, marginLeft: "12px" }}>
                seit {new Date(u.createdAt).toLocaleDateString("de-DE")}
              </span>
            </div>
            {u.email !== currentEmail && (
              <button
                onClick={() => deleteUser(u.id, u.email)}
                disabled={deleting === u.id}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: deleting === u.id ? "wait" : "pointer",
                  border: `1px solid ${C.error}40`,
                  background: `${C.error}15`,
                  color: C.error,
                  fontFamily: "inherit",
                  opacity: deleting === u.id ? 0.5 : 1,
                }}
              >
                {deleting === u.id ? "..." : "Löschen"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
