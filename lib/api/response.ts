import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: number) {
  return NextResponse.json({ data }, { status: init ?? 200 });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSizeRaw = Number(searchParams.get("pageSize") ?? 20) || 20;
  const pageSize = Math.min(100, Math.max(1, pageSizeRaw)); // never unbounded (spec §42)
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
