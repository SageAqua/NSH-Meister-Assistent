export function EmptyStateCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
      <p className="text-2xl font-semibold">{title}</p>
      <p className="mt-2 text-zinc-500">{subtitle}</p>
    </div>
  );
}

export function ErrorStateCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-2xl font-semibold text-red-800">{title}</p>
      <p className="mt-2 text-red-700">{subtitle}</p>
    </div>
  );
}
