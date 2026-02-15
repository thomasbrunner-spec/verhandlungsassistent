import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const db = await getDb();
  const result = db.exec("SELECT id, title, content, created_at FROM knowledge_entries WHERE user_id = ? ORDER BY created_at DESC", [session.userId]);
  const entries = result.length ? result[0].values.map((row: unknown[]) => ({ id: row[0], title: row[1], content: row[2], created_at: row[3] })) : [];
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { title, content } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "Titel und Inhalt erforderlich" }, { status: 400 });

  const db = await getDb();
  const id = uuidv4();
  db.run("INSERT INTO knowledge_entries (id, user_id, title, content) VALUES (?, ?, ?, ?)", [id, session.userId, title, content]);
  saveDb();
  return NextResponse.json({ id, title, content });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { id } = await req.json();
  const db = await getDb();
  db.run("DELETE FROM knowledge_entries WHERE id = ? AND user_id = ?", [id, session.userId]);
  saveDb();
  return NextResponse.json({ ok: true });
}
