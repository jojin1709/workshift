import { prisma } from "../../../lib/db/client";
import { jsonOk, jsonError } from "../../../lib/api/response";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return jsonOk({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (err) {
    return jsonError("Database unavailable", 503);
  }
}
