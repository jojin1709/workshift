import { cookies } from "next/headers";
import crypto from "node:crypto";

/**
 * Minimal, self-contained admin session mechanism. The PUBLIC site
 * has no login (product spec §5) — this exists solely to gate the
 * internal data-health dashboard (spec §34). Swap in a real identity
 * provider before shipping to production if you need SSO; this
 * signed-cookie approach is a reasonable, dependency-free default.
 */

const COOKIE_NAME = "workshift_admin_session";

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not configured — admin area is disabled.");
  return s;
}

export function signSession(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, iat: Date.now() })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): { email: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
    if (!allowed.includes(String(data.email).toLowerCase())) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

export function getAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
