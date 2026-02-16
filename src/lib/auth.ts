import { cookies } from "next/headers";
import { getDb, saveDb } from "./db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function register(email: string, password: string, name: string) {
  const db = await getDb();

  const existing = db.exec("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    throw new Error("E-Mail bereits registriert");
  }

  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)", [id, email, hash, name]);

  const sessionId = uuidv4();
  db.run("INSERT INTO sessions (id, user_id, email, name) VALUES (?, ?, ?, ?)", [sessionId, id, email, name]);
  saveDb();

  return { sessionId, user: { id, email, name } };
}

export async function login(email: string, password: string) {
  const db = await getDb();

  const result = db.exec("SELECT id, email, password_hash, name FROM users WHERE email = ?", [email]);
  if (!result.length || !result[0].values.length) {
    throw new Error("Ungültige Anmeldedaten");
  }

  const [id, userEmail, hash, name] = result[0].values[0] as string[];

  if (!bcrypt.compareSync(password, hash)) {
    throw new Error("Ungültige Anmeldedaten");
  }

  const sessionId = uuidv4();
  db.run("INSERT INTO sessions (id, user_id, email, name) VALUES (?, ?, ?, ?)", [sessionId, id, userEmail, name]);
  saveDb();

  return { sessionId, user: { id, email: userEmail, name } };
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return null;

  const db = await getDb();
  const result = db.exec(
    "SELECT user_id, email, name FROM sessions WHERE id = ? AND expires_at > datetime('now')",
    [sessionId]
  );

  if (!result.length || !result[0].values.length) return null;
  const [userId, email, name] = result[0].values[0] as string[];
  return { userId, email, name };
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (sessionId) {
    const db = await getDb();
    db.run("DELETE FROM sessions WHERE id = ?", [sessionId]);
    saveDb();
  }
}
