import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-Mail und Passwort erforderlich" }, { status: 400 });
    }
    const { sessionId, user } = await login(email, password);
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
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
