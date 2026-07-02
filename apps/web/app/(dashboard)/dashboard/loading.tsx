export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading sites">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-lg bg-snow/[.06]" />
          <div className="h-4 w-28 animate-pulse rounded-md bg-snow/[.04]" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-xl bg-snow/[.06]" />
      </div>
      <div className="grid gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-snow/[.06] bg-abyss-2/40"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
