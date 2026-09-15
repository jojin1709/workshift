# Deployment

## 1. Database

Provision a Postgres instance (Supabase recommended). Set
`DATABASE_URL` (and `DIRECT_DATABASE_URL` if using a pooled
connection). Run:

```bash
npm run db:migrate
```

## 2. Vercel (Next.js app)

1. Import the repository into Vercel.
2. Set all variables from `.env.example` that you're using in the
   Vercel project's Environment Variables settings — at minimum
   `DATABASE_URL` and `NEXT_PUBLIC_SITE_URL`.
3. Build command: `npm run build`. Output: Next.js default.
4. Deploy.

## 3. Cloudflare (scheduled worker)

1. `wrangler login`
2. Set secrets (never commit these):
   ```bash
   wrangler secret put DATABASE_URL
   wrangler secret put ANTHROPIC_API_KEY   # optional
   wrangler secret put OPENAI_API_KEY      # optional
   ```
3. Review `wrangler.toml` cron schedule.
4. `npm run worker:deploy`

## 4. DNS / CDN / WAF

Point your domain's DNS through Cloudflare. Enable WAF rules for the
`/admin` and `/api/admin` paths at minimum. Cache static assets at the
edge; do not cache `/api/admin/*` or any response containing the
admin session cookie.

## 5. Post-deploy checklist

- [ ] `/api/health` returns `{ status: "ok" }`
- [ ] `/api/stats` returns real (possibly zero) counts, not fixed
      placeholder numbers
- [ ] `/admin` requires login and is `noindex`
- [ ] `wrangler tail` shows cron jobs firing on schedule
- [ ] At least one source in `lib/ingestion/source-registry.ts` has
      been changed from `UNSUPPORTED` to `ENABLED` and verified working
      before you rely on live data
- [ ] `.env` is not committed; secrets are set via Vercel/Wrangler
      secret storage, not the repo

This document describes how to deploy the codebase in this
repository. No deployment has actually been performed on your behalf —
you'll need real Vercel/Cloudflare/Postgres credentials to execute
these steps yourself.
