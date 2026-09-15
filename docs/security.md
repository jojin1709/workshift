# Security

## Secrets

All secrets (`DATABASE_URL`, `*_API_KEY`, `ADMIN_SESSION_SECRET`,
`CLOUDFLARE_API_TOKEN`) are read server-side only via
`process.env` — never exposed to the browser. Only variables prefixed
`NEXT_PUBLIC_` are ever bundled client-side, and none of the secrets
above use that prefix.

## SSRF protection

All ingestion HTTP requests go through `lib/security/safe-fetch.ts`,
which:

- rejects non-`http(s)` protocols
- rejects private/loopback/link-local addresses and cloud metadata
  hosts (including `169.254.169.254`)
- re-validates every redirect hop instead of following blindly
- enforces a request timeout
- optionally enforces an explicit `INGESTION_ALLOWED_HOSTS` allowlist

## Input validation

- Query params: `parsePagination()` clamps `page`/`pageSize`
  (`lib/api/response.ts`) so no endpoint returns an unbounded dataset.
- AI inputs/outputs: validated by Zod (`lib/validation/ai-schemas.ts`).
- Recommendation input: validated by `RecommendationInputSchema`
  before ever reaching the AI provider.

## SQL injection

All database access goes through Prisma's parameterized query
builder — no raw string-interpolated SQL exists in the codebase.

## Admin auth

`/admin/*` is not part of the public site and is not indexed
(`X-Robots-Tag: noindex, nofollow`, plus `app/admin/page.tsx`'s own
metadata and `app/robots.ts`). Sessions are HMAC-signed, HTTP-only,
`SameSite=Strict` cookies (`lib/security/admin-session.ts`). Login
attempts are rate-limited (`middleware.ts`).

## Rate limiting

`middleware.ts` applies a sliding-window limiter to `/api/*` (120
req/min/IP) and a stricter one to `/api/admin/login` (10 req/min/IP).
Swap the in-memory bucket store for Redis (`REDIS_URL`) in a
multi-instance deployment.

## Security headers / CSP

Set globally in `next.config.mjs`: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, a restrictive `Content-Security-Policy`,
and a locked-down `Permissions-Policy`.

## Prompt injection

See `docs/ai-system.md` — untrusted source text is wrapped and
explicitly labeled as inert data before being sent to any AI provider.

## Error sanitization

API routes return generic error messages (`jsonError()`) rather than
raw exception text or stack traces. Detailed errors are only written
to the structured logger (`lib/observability/logger.ts`), which
redacts anything that looks like a secret.
