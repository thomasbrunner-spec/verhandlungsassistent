import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const db = await getDb();
  const result = db.exec("SELECT id, name, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC", [session.userId]);
  const projects = result.length ? result[0].values.map((row: unknown[]) => ({ id: row[0], name: row[1], created_at: row[2], updated_at: row[3] })) : [];
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Projektname erforderlich" }, { status: 400 });

  const db = await getDb();
  const id = uuidv4();
  db.run("INSERT INTO projects (id, user_id, name) VALUES (?, ?, ?)", [id, session.userId, name]);
  saveDb();
  return NextResponse.json({ id, name });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { id } = await req.json();
  const db = await getDb();
  db.run("DELETE FROM project_data WHERE project_id = ?", [id]);
  db.run("DELETE FROM projects WHERE id = ? AND user_id = ?", [id, session.userId]);
  saveDb();
  return NextResponse.json({ ok: true });
}
