import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { signSession, ADMIN_COOKIE_NAME } from "../../../../lib/security/admin-session";
import { jsonError } from "../../../../lib/api/response";
import { logger } from "../../../../lib/observability/logger";

/**
 * Passphrase is compared against ADMIN_SESSION_SECRET using a
 * constant-time comparison. This is intentionally simple; replace
 * with real SSO/OAuth for a production admin surface with multiple
 * operators. Rate-limited via middleware.ts.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());

  if (!secret || allowed.length === 0 || allowed[0] === "") {
    return jsonError("Admin login is not configured for this deployment.", 503);
  }

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").toLowerCase();
  const passphrase = String(body?.passphrase ?? "");

  const validEmail = allowed.includes(email);
  const validPassphrase =
    passphrase.length === secret.length &&
    crypto.timingSafeEqual(Buffer.from(passphrase), Buffer.from(secret));

  if (!validEmail || !validPassphrase) {
    logger.warn({ email }, "Failed admin login attempt");
    return jsonError("Invalid credentials.", 401);
  }

  const token = signSession(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8
  });
  return res;
}
