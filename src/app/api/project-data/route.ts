import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const module = searchParams.get("module");

  if (!projectId) return NextResponse.json({ error: "projectId erforderlich" }, { status: 400 });

  const db = await getDb();
  let query = "SELECT data_key, data_value FROM project_data WHERE project_id = ?";
  const params: (string | number)[] = [projectId];

  if (module !== null) {
    query += " AND module = ?";
    params.push(parseInt(module));
  }

  const result = db.exec(query, params);
  const data: Record<string, string> = {};
  if (result.length) {
    result[0].values.forEach((row: unknown[]) => {
      data[row[0] as string] = row[1] as string;
    });
  }
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const { projectId, module, key, value } = await req.json();
  if (!projectId || module === undefined || !key) {
    return NextResponse.json({ error: "projectId, module, key erforderlich" }, { status: 400 });
  }

  const db = await getDb();
  const id = uuidv4();
  db.run(
    `INSERT INTO project_data (id, project_id, module, data_key, data_value, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(project_id, module, data_key) DO UPDATE SET data_value = ?, updated_at = datetime('now')`,
    [id, projectId, module, key, value, value]
  );
  saveDb();

  // Update project's updated_at
  db.run("UPDATE projects SET updated_at = datetime('now') WHERE id = ?", [projectId]);
  saveDb();

  return NextResponse.json({ ok: true });
}
