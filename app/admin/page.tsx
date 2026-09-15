import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "../../lib/security/admin-session";
import { prisma } from "../../lib/db/client";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  const session = getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [recentRuns, sourceHealth, dataQualityEvents] = await Promise.all([
    prisma.pipelineRun.findMany({ orderBy: { startedAt: "desc" }, take: 10 }),
    prisma.source.groupBy({ by: ["status"], _count: true }),
    prisma.dataQualityEvent.findMany({ where: { resolved: false }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold">Data health dashboard</h1>
      <p className="mt-1 text-sm text-navy-500">Signed in as {session.email}</p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Pipeline runs</h2>
        {recentRuns.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No pipeline runs recorded yet.</p>
        ) : (
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy-900/10 text-navy-500">
                <th className="py-2">Job</th>
                <th>Status</th>
                <th>Processed</th>
                <th>Created</th>
                <th>Rejected</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.map((r) => (
                <tr key={r.id} className="border-b border-navy-900/5">
                  <td className="py-2">{r.jobName}</td>
                  <td>{r.status}</td>
                  <td>{r.recordsProcessed}</td>
                  <td>{r.recordsCreated}</td>
                  <td>{r.recordsRejected}</td>
                  <td>{r.startedAt.toISOString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Source health</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {sourceHealth.length === 0 ? (
            <p className="text-sm text-navy-500">No sources registered yet.</p>
          ) : (
            sourceHealth.map((g) => (
              <span key={g.status} className="rounded-full border border-navy-900/10 px-3 py-1 text-sm">
                {g.status}: {g._count}
              </span>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Open data quality events</h2>
        {dataQualityEvents.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">No unresolved data quality events.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {dataQualityEvents.map((e) => (
              <li key={e.id} className="rounded-xl border border-navy-900/10 p-3">
                <span className="font-medium">{e.type}</span> — {e.detail}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
