import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/db";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "thomasbrunner@mac.com";

function isAdmin(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// GET: Alle Nutzer auflisten
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  if (!isAdmin(session.email)) {
    return NextResponse.json({ error: "Kein Admin-Zugang" }, { status: 403 });
  }

  const db = await getDb();
  const result = db.exec(
    "SELECT id, email, name, created_at FROM users ORDER BY created_at DESC"
  );

  if (!result.length || !result[0].values.length) {
    return NextResponse.json({ users: [] });
  }

  const users = result[0].values.map((row: unknown[]) => ({
    id: row[0],
    email: row[1],
    name: row[2],
    createdAt: row[3],
  }));

  return NextResponse.json({ users });
}

// DELETE: Nutzer löschen
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  if (!isAdmin(session.email)) {
    return NextResponse.json({ error: "Kein Admin-Zugang" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId erforderlich" }, { status: 400 });
  }

  // Admin darf sich nicht selbst löschen
  if (userId === session.userId) {
    return NextResponse.json({ error: "Sie können sich nicht selbst löschen" }, { status: 400 });
  }

  const db = await getDb();

  // Sessions des Nutzers löschen
  db.run("DELETE FROM sessions WHERE user_id = ?", [userId]);
  // Projekte und Daten des Nutzers löschen
  db.run("DELETE FROM project_data WHERE project_id IN (SELECT id FROM projects WHERE user_id = ?)", [userId]);
  db.run("DELETE FROM projects WHERE user_id = ?", [userId]);
  db.run("DELETE FROM knowledge_entries WHERE user_id = ?", [userId]);
  db.run("DELETE FROM company_profiles WHERE user_id = ?", [userId]);
  // Nutzer löschen
  db.run("DELETE FROM users WHERE id = ?", [userId]);
  saveDb();

  return NextResponse.json({ success: true });
}
