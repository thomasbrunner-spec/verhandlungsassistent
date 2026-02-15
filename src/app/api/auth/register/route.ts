import { NextResponse } from "next/server";
import { register } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Alle Felder erforderlich" }, { status: 400 });
    }
    const { sessionId, user } = await register(email, password, name);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return NextResponse.json({ user });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Fehler";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
