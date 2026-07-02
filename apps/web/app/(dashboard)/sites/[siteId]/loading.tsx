export default function SiteLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading site">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded-md bg-snow/[.04]" />
        <div className="h-9 w-64 animate-pulse rounded-lg bg-snow/[.06]" />
        <div className="h-4 w-48 animate-pulse rounded-md bg-snow/[.04]" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-snow/[.06] bg-abyss-2/40" />
      <div className="h-64 animate-pulse rounded-2xl border border-snow/[.06] bg-abyss-2/40" />
    </div>
  );
}
