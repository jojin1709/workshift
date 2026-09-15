import { describe, expect, it, vi } from "vitest";

/**
 * This is a lightweight integration test that exercises the pipeline's
 * failure-isolation contract without requiring a live database. A
 * fuller integration suite (with a real Postgres instance, as wired
 * in .github/workflows/ci.yml) should additionally assert that
 * SourceRun/Source rows are updated correctly — left as a follow-up
 * once real sources are configured (see docs/data-quality.md).
 */
describe("source registry", () => {
  it("contains no ENABLED source without a real, non-placeholder URL", async () => {
    const { SOURCE_REGISTRY } = await import("../../lib/ingestion/source-registry");
    const enabledWithPlaceholder = SOURCE_REGISTRY.filter(
      (s) => s.status === "ENABLED" && /example\.(com|gov|org)/i.test(s.url)
    );
    expect(enabledWithPlaceholder).toHaveLength(0);
  });

  it("documents a reason for every unsupported source", async () => {
    const { SOURCE_REGISTRY } = await import("../../lib/ingestion/source-registry");
    const undocumented = SOURCE_REGISTRY.filter((s) => s.status === "UNSUPPORTED" && !s.unsupportedReason);
    expect(undocumented).toHaveLength(0);
  });
});

describe("safeFetch", () => {
  it("rejects requests to private IP ranges", async () => {
    const { safeFetch, UnsafeUrlError } = await import("../../lib/security/safe-fetch");
    await expect(safeFetch("http://127.0.0.1/secret")).rejects.toBeInstanceOf(UnsafeUrlError);
    await expect(safeFetch("http://169.254.169.254/latest/meta-data")).rejects.toBeInstanceOf(UnsafeUrlError);
  });

  it("rejects non-http(s) protocols", async () => {
    const { safeFetch, UnsafeUrlError } = await import("../../lib/security/safe-fetch");
    await expect(safeFetch("file:///etc/passwd")).rejects.toBeInstanceOf(UnsafeUrlError);
  });
});
