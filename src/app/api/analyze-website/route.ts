import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { askAI } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  try {
    const { url, model } = await req.json();
    if (!url) return NextResponse.json({ error: "URL erforderlich" }, { status: 400 });

    const systemPrompt = `Du bist ein Business-Analyst. Analysiere die Website des Unternehmens und erstelle ein strukturiertes Unternehmensprofil.

Antworte AUSSCHLIESSLICH im folgenden JSON-Format (ohne Markdown-Codeblock, nur reines JSON):
{
  "company_name": "Name des Unternehmens",
  "industry": "Branche/Industrie",
  "employees": "Ungefähre Mitarbeiterzahl (falls erkennbar)",
  "revenue": "Ungefährer Umsatz (falls erkennbar)",
  "position": "Marktposition und Kerngeschäft",
  "strengths": "Stärken und USPs des Unternehmens",
  "description": "Ausführliche Beschreibung: Was macht das Unternehmen, Produkte/Dienstleistungen, Marktposition, besondere Merkmale"
}

Wenn du eine Information nicht finden kannst, lass das Feld leer ("").`;

    const response = await askAI(
      systemPrompt,
      `Analysiere diese Unternehmens-Website und erstelle ein Profil: ${url}`,
      "",
      model || undefined
    );

    // Try to parse JSON from response
    let profile;
    try {
      // Try direct parse
      profile = JSON.parse(response);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        profile = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: "Konnte Unternehmensdaten nicht extrahieren", raw: response }, { status: 500 });
      }
    }

    return NextResponse.json({ profile });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Analyse-Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
