import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  await logout();
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return NextResponse.json({ ok: true });
}
