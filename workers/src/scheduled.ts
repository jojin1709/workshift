/**
 * Cloudflare Worker entrypoint for WorkShift's scheduled pipeline.
 * Cron schedules are declared in wrangler.toml (§ [triggers]) and
 * mapped to job names here. Each job is isolated: a thrown error in
 * one cron invocation is logged and does not crash the worker.
 *
 * NOTE: this worker calls into the same TypeScript service layer as
 * the Next.js app (server/services/*) so ingestion logic lives in one
 * place. For a real Cloudflare deployment, bundle those modules with
 * the worker build (see package.json "worker:dev" / "worker:deploy")
 * and ensure DATABASE_URL etc. are set as Worker secrets, not plain
 * vars, via `wrangler secret put`.
 */

export interface Env {
  DATABASE_URL: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_AI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  GROQ_API_KEY?: string;
}

interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type JobName =
  | "hourly-priority-sources"
  | "six-hourly-research-update"
  | "daily-evidence-processing"
  | "daily-relationship-update"
  | "daily-score-recalculation"
  | "weekly-source-health-check"
  | "weekly-data-quality-report";

function jobForCron(cron: string): JobName | null {
  const map: Record<string, JobName> = {
    "0 * * * *": "hourly-priority-sources",
    "0 */6 * * *": "six-hourly-research-update",
    "30 2 * * *": "daily-evidence-processing",
    "0 3 * * *": "daily-relationship-update",
    "30 3 * * *": "daily-score-recalculation",
    "0 4 * * 1": "weekly-source-health-check",
    "30 4 * * 1": "weekly-data-quality-report"
  };
  return map[cron] ?? null;
}

async function runJob(job: JobName, env: Env): Promise<void> {
  // Each branch is intentionally a thin dispatcher — the actual logic
  // lives in server/services/*, imported dynamically here so the
  // worker bundle only pulls in what a given job needs.
  switch (job) {
    case "hourly-priority-sources":
    case "six-hourly-research-update": {
      const { runIngestionPass } = await import("../../server/services/ingestion");
      const result = await runIngestionPass();
      console.log(JSON.stringify({ job, result }));
      break;
    }
    case "daily-evidence-processing":
    case "daily-relationship-update": {
      console.log(JSON.stringify({ job, status: "no-op — implement claim/evidence linking pass here" }));
      break;
    }
    case "daily-score-recalculation": {
      console.log(JSON.stringify({ job, status: "no-op — implement scoring recalculation pass here" }));
      break;
    }
    case "weekly-source-health-check":
    case "weekly-data-quality-report": {
      console.log(JSON.stringify({ job, status: "no-op — implement health/quality report generation here" }));
      break;
    }
  }
}

const scheduledWorker = {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const job = jobForCron(event.cron);
    if (!job) {
      console.warn(`No job mapped for cron expression: ${event.cron}`);
      return;
    }
    try {
      await runJob(job, env);
    } catch (err) {
      // One failed job must not crash the worker or block future runs.
      console.error(JSON.stringify({ job, error: String(err) }));
    }
  },

  async fetch(): Promise<Response> {
    return new Response("WorkShift scheduled worker. Use Cloudflare Cron Triggers to invoke jobs.", { status: 200 });
  }
};

export default scheduledWorker;
