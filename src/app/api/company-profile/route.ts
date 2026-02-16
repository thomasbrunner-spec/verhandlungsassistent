import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, saveDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const db = await getDb();
  const result = db.exec(
    "SELECT company_name, industry, website, employees, revenue, position, strengths, description FROM company_profiles WHERE user_id = ?",
    [session.userId]
  );

  if (!result.length || !result[0].values.length) {
    return NextResponse.json({ profile: null });
  }

  const [company_name, industry, website, employees, revenue, position, strengths, description] = result[0].values[0] as string[];
  return NextResponse.json({
    profile: { company_name, industry, website, employees, revenue, position, strengths, description }
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  try {
    const profile = await req.json();
    const db = await getDb();

    const existing = db.exec("SELECT id FROM company_profiles WHERE user_id = ?", [session.userId]);

    if (existing.length && existing[0].values.length) {
      db.run(
        `UPDATE company_profiles SET
          company_name = ?, industry = ?, website = ?, employees = ?, revenue = ?,
          position = ?, strengths = ?, description = ?, updated_at = datetime('now')
        WHERE user_id = ?`,
        [profile.company_name || "", profile.industry || "", profile.website || "",
         profile.employees || "", profile.revenue || "", profile.position || "",
         profile.strengths || "", profile.description || "", session.userId]
      );
    } else {
      db.run(
        `INSERT INTO company_profiles (id, user_id, company_name, industry, website, employees, revenue, position, strengths, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), session.userId, profile.company_name || "", profile.industry || "",
         profile.website || "", profile.employees || "", profile.revenue || "",
         profile.position || "", profile.strengths || "", profile.description || ""]
      );
    }

    saveDb();
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
