import { NextResponse } from "next/server";
import { register } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, name, registrationCode } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Alle Felder erforderlich" }, { status: 400 });
    }

    // Registrierungscode prüfen (falls in Umgebungsvariable gesetzt)
    const requiredCode = process.env.REGISTRATION_CODE;
    if (requiredCode) {
      if (!registrationCode || registrationCode.trim() !== requiredCode.trim()) {
        return NextResponse.json({ error: "Ungültiger Registrierungscode" }, { status: 403 });
      }
    }

    const { sessionId, user } = await register(email, password, name);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return NextResponse.json({ user });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Fehler";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
