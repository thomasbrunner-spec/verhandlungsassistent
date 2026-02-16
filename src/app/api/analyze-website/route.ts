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

Antworte AUSSCHLIESSLICH im folgenden JSON-Format (ohne Markdown-Codeblock, nur reines JSON).
WICHTIG: Verwende KEINE Zeilenumbrüche innerhalb der Werte. Schreibe jeden Wert in einer einzigen Zeile.

{
  "company_name": "Name des Unternehmens",
  "industry": "Branche/Industrie",
  "employees": "Ungefähre Mitarbeiterzahl (falls erkennbar)",
  "revenue": "Ungefährer Umsatz (falls erkennbar)",
  "position": "Marktposition und Kerngeschäft in einem Satz",
  "strengths": "Stärken und USPs des Unternehmens in einem Satz",
  "description": "Was macht das Unternehmen, Produkte und Dienstleistungen, Marktposition, besondere Merkmale"
}

Wenn du eine Information nicht finden kannst, lass das Feld leer ("").`;

    const response = await askAI(
      systemPrompt,
      `Analysiere diese Unternehmens-Website und erstelle ein Profil: ${url}`,
      "",
      model || undefined
    );

    // Extract and parse JSON from AI response
    const profile = extractJsonProfile(response);

    if (!profile) {
      return NextResponse.json(
        { error: "Konnte Unternehmensdaten nicht extrahieren. Bitte versuchen Sie es erneut." },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Analyse-Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function extractJsonProfile(response: string): Record<string, string> | null {
  // Step 1: Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
  let cleaned = response.replace(/```(?:json)?\s*\n?/g, "").replace(/```/g, "").trim();

  // Step 2: Extract the JSON object { ... }
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  let jsonStr = jsonMatch[0];

  // Step 3: Fix control characters INSIDE string values only
  // Strategy: replace all control characters with spaces (safe for both structural and value contexts)
  jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ""); // remove non-standard control chars
  jsonStr = jsonStr.replace(/\r\n/g, "\n"); // normalize line endings
  // Replace newlines inside JSON string values with spaces
  // We do this by processing the string character by character
  jsonStr = sanitizeJsonNewlines(jsonStr);

  // Step 4: Try to parse
  try {
    const parsed = JSON.parse(jsonStr);
    // Ensure all expected fields are strings
    const fields = ["company_name", "industry", "employees", "revenue", "position", "strengths", "description"];
    const result: Record<string, string> = {};
    for (const field of fields) {
      result[field] = typeof parsed[field] === "string" ? parsed[field].trim() : "";
    }
    return result;
  } catch (e) {
    console.error("JSON parse error:", e, "\nInput:", jsonStr.substring(0, 500));
    return null;
  }
}

function sanitizeJsonNewlines(jsonStr: string): string {
  // Walk through the string and replace newlines/tabs inside JSON string values with spaces
  // Outside of string values, newlines are just whitespace and can stay
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < jsonStr.length; i++) {
    const ch = jsonStr[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      // Replace actual newlines/tabs inside string values with spaces
      if (ch === "\n" || ch === "\r") {
        result += " ";
        continue;
      }
      if (ch === "\t") {
        result += " ";
        continue;
      }
    }

    result += ch;
  }

  return result;
}
