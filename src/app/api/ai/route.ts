import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { askAI } from "@/lib/ai";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  try {
    const { systemPrompt, userMessage, useKnowledge } = await req.json();
    if (!systemPrompt || !userMessage) {
      return NextResponse.json({ error: "systemPrompt und userMessage erforderlich" }, { status: 400 });
    }

    let knowledgeBase = "";
    if (useKnowledge !== false) {
      const db = await getDb();
      const result = db.exec(
        "SELECT title, content FROM knowledge_entries WHERE user_id = ?",
        [session.userId]
      );
      if (result.length && result[0].values.length) {
        knowledgeBase = result[0].values
          .map((row: unknown[]) => `[${row[0]}]\n${row[1]}`)
          .join("\n\n---\n\n");
      }
    }

    const response = await askAI(systemPrompt, userMessage, knowledgeBase);
    return NextResponse.json({ response });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "KI-Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
