export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card">
      <p className="font-display text-3xl font-semibold text-navy-900">{value.toLocaleString()}</p>
      <p className="mt-1 text-sm text-navy-600">{label}</p>
    </div>
  );
}
