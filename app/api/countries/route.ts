import { prisma } from "../../../lib/db/client";
import { jsonOk } from "../../../lib/api/response";

export async function GET() {
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { isoCode: true, name: true, coverageLevel: true }
  });
  return jsonOk({ items: countries });
}
