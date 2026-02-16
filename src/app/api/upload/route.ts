import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";

    if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".csv")) {
      text = buffer.toString("utf-8");
    } else if (name.endsWith(".pdf")) {
      text = extractPdfText(buffer);
    } else if (name.endsWith(".docx")) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (name.endsWith(".pptx")) {
      text = await extractPptxText(buffer);
    } else {
      return NextResponse.json({ error: "Dateiformat nicht unterstützt. Erlaubt: PDF, DOCX, PPTX, TXT, MD, CSV" }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Keine Textinhalte in der Datei gefunden" }, { status: 400 });
    }

    // Save as knowledge entry
    const id = uuidv4();
    const db = await getDb();
    db.run(
      "INSERT INTO knowledge_entries (id, user_id, title, content) VALUES (?, ?, ?, ?)",
      [id, session.userId, file.name, text.trim()]
    );
    saveDb();

    return NextResponse.json({ id, title: file.name, content: text.trim() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Upload-Fehler";
    console.error("Upload error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function extractPdfText(buffer: Buffer): string {
  // Extract text from PDF without pdfjs-dist (which needs browser APIs)
  // This reads raw text streams from the PDF binary
  const str = buffer.toString("latin1");
  const texts: string[] = [];

  // Method 1: Extract text between BT (Begin Text) and ET (End Text) operators
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(str)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g);
    if (tjMatches) {
      for (const tj of tjMatches) {
        const textMatch = tj.match(/\(([^)]*)\)/);
        if (textMatch) texts.push(textMatch[1]);
      }
    }
    // TJ arrays: [(text) num (text) ...]
    const tjArrayMatches = block.match(/\[(.*?)\]\s*TJ/g);
    if (tjArrayMatches) {
      for (const tja of tjArrayMatches) {
        const parts = tja.match(/\(([^)]*)\)/g);
        if (parts) {
          texts.push(parts.map(p => p.slice(1, -1)).join(""));
        }
      }
    }
  }

  // Method 2: Look for stream content with readable text
  if (texts.length === 0) {
    // Fallback: extract anything that looks like readable text
    const streamRegex = /stream\r?\n([\s\S]*?)endstream/g;
    while ((match = streamRegex.exec(str)) !== null) {
      const content = match[1];
      // Only keep streams that have enough readable ASCII
      const readable = content.replace(/[^\x20-\x7E\n\r]/g, "");
      if (readable.length > 20 && readable.length / content.length > 0.5) {
        texts.push(readable.trim());
      }
    }
  }

  // Decode PDF escape sequences
  let result = texts.join(" ")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");

  // Clean up: remove excessive whitespace
  result = result.replace(/\s+/g, " ").trim();

  return result;
}

async function extractPptxText(buffer: Buffer): Promise<string> {
  // PPTX is a zip containing XML files
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Readable } = require("stream");
  const { createUnzip } = await import("zlib");

  // Simple approach: read the PPTX as a zip and extract text from slide XML files
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(buffer);
    const texts: string[] = [];

    // Get all slide files sorted
    const slideFiles = Object.keys(zip.files)
      .filter(f => f.match(/ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
        return numA - numB;
      });

    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async("string");
      // Extract text from XML tags <a:t>...</a:t>
      const matches = content.match(/<a:t>([^<]*)<\/a:t>/g);
      if (matches) {
        const slideText = matches.map(m => m.replace(/<\/?a:t>/g, "")).join(" ");
        texts.push(slideText);
      }
    }

    return texts.join("\n\n");
  } catch {
    return "";
  }
}
