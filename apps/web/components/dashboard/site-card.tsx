import Link from 'next/link';
import type { Scan, Site } from '@deadlink-sentinel/db';
import { startScan } from '@/actions/scan-actions';
import { deleteSite } from '@/actions/site-actions';

interface Props {
  site: Site;
  latestScan: Scan | null;
}

const STATUS_COLOURS: Record<string, string> = {
  COMPLETED: 'text-sonar',
  RUNNING: 'text-amber',
  QUEUED: 'text-amber',
  FAILED: 'text-coral',
  CANCELLED: 'text-fog',
};

function scoreColour(score: number) {
  if (score >= 80) return 'text-sonar';
  if (score >= 60) return 'text-amber';
  return 'text-coral';
}

export function SiteCard({ site, latestScan }: Props) {
  return (
    <div className="rounded-2xl border border-snow/[.09] bg-abyss-2/50 px-6 py-5 backdrop-blur-sm transition-all hover:border-snow/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold">{site.name}</h2>
          <p className="mt-1 font-mono text-xs text-fog">{site.rootUrl}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {latestScan?.healthScore != null && (
            <span className={`font-display text-2xl font-black ${scoreColour(latestScan.healthScore)}`}>
              {latestScan.healthScore}
            </span>
          )}
        </div>
      </div>

      {latestScan && (
        <div className="mt-3 flex items-center gap-4 font-mono text-xs text-[#5C7589]">
          <span className={STATUS_COLOURS[latestScan.status] ?? 'text-fog'}>
            {latestScan.status.toLowerCase()}
          </span>
          <span>{latestScan.pagesCrawled} pages crawled</span>
          {(latestScan.status === 'RUNNING' || latestScan.status === 'QUEUED') && (
            <Link
              href={`/sites/${site.id}/scans/${latestScan.id}`}
              className="text-sonar hover:underline"
            >
              watch live →
            </Link>
          )}
          {latestScan.status === 'COMPLETED' && (
            <Link
              href={`/sites/${site.id}/scans/${latestScan.id}`}
              className="hover:underline"
            >
              view report →
            </Link>
          )}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <form action={startScan}>
          <input type="hidden" name="siteId" value={site.id} />
          <button
            type="submit"
            className="rounded-lg bg-sonar px-4 py-2 font-display text-xs font-bold text-abyss transition-all hover:shadow-[0_0_20px_rgba(43,217,194,.35)]"
          >
            {latestScan?.status === 'COMPLETED' ? 'Re-scan' : 'Start scan'}
          </button>
        </form>

        <form action={deleteSite.bind(null, site.id)}>
          <button
            type="submit"
            className="rounded-lg border border-snow/[.08] px-4 py-2 font-display text-xs font-bold text-fog transition-all hover:border-coral/40 hover:text-coral"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
