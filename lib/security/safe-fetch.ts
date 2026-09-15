import { logger } from "../observability/logger";

/**
 * All outbound ingestion requests MUST go through this function.
 * Never call fetch() directly from an ingestion adapter. See
 * docs/security.md §"Scraper security" and product spec §36.
 */

const PRIVATE_IP_PATTERNS = [
  /^127\./, // loopback
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./, // link-local / cloud metadata (169.254.169.254)
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i
];

const BLOCKED_HOSTS = new Set(["localhost", "metadata.google.internal"]);

export class UnsafeUrlError extends Error {}

function assertSafeHostname(hostname: string) {
  const lower = hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(lower)) {
    throw new UnsafeUrlError(`Blocked hostname: ${hostname}`);
  }
  if (PRIVATE_IP_PATTERNS.some((p) => p.test(lower))) {
    throw new UnsafeUrlError(`Blocked private/internal address: ${hostname}`);
  }
}

function assertAllowedHost(hostname: string) {
  const allowList = (process.env.INGESTION_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  if (allowList.length === 0) return; // no allowlist configured — rely on protocol/IP checks only
  if (!allowList.includes(hostname.toLowerCase())) {
    throw new UnsafeUrlError(`Host not in INGESTION_ALLOWED_HOSTS: ${hostname}`);
  }
}

export interface SafeFetchOptions {
  timeoutMs?: number;
  maxRedirects?: number;
  headers?: Record<string, string>;
}

export async function safeFetch(rawUrl: string, options: SafeFetchOptions = {}): Promise<Response> {
  const timeoutMs = options.timeoutMs ?? Number(process.env.INGESTION_FETCH_TIMEOUT_MS ?? 10000);
  const maxRedirects = options.maxRedirects ?? 3;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError(`Invalid URL: ${rawUrl}`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new UnsafeUrlError(`Blocked protocol: ${url.protocol}`);
  }

  assertSafeHostname(url.hostname);
  assertAllowedHost(url.hostname);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let currentUrl = url;
    let redirects = 0;
    // Manual redirect handling so every hop is re-validated — an
    // attacker-controlled redirect to an internal address must not
    // be followed blindly.
    while (true) {
      const res = await fetch(currentUrl.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "user-agent": "WorkShiftBot/1.0 (+https://workshift.example/about-our-crawler)",
          ...options.headers
        }
      });

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (!location) return res;
        redirects += 1;
        if (redirects > maxRedirects) {
          throw new UnsafeUrlError("Too many redirects");
        }
        currentUrl = new URL(location, currentUrl);
        assertSafeHostname(currentUrl.hostname);
        assertAllowedHost(currentUrl.hostname);
        continue;
      }

      return res;
    }
  } catch (err) {
    logger.warn({ url: rawUrl, error: String(err) }, "safeFetch failed");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
