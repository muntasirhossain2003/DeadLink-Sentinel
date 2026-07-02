import Link from 'next/link';
import type { Scan, Site } from '@deadlink-sentinel/db';
import { startScan } from '@/actions/scan-actions';
import { deleteSite } from '@/actions/site-actions';
import { ScoreBadge } from '@/components/site/score-badge';
import { StatusPill } from '@/components/site/status-pill';

interface Props {
  site: Site;
  latestScan: Scan | null;
}

export function SiteCard({ site, latestScan }: Props) {
  const isActive = latestScan?.status === 'RUNNING' || latestScan?.status === 'QUEUED';

  return (
    <div className="group rounded-2xl border border-snow/[.09] bg-abyss-2/50 px-6 py-5 backdrop-blur-sm transition-all hover:border-sonar/25 hover:shadow-[0_0_40px_rgba(43,217,194,.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href={`/sites/${site.id}`} className="group/link inline-block">
            <h2 className="font-display text-lg font-bold transition-colors group-hover/link:text-sonar">
              {site.name}
              <span className="ml-2 inline-block translate-x-0 text-sonar opacity-0 transition-all group-hover/link:translate-x-1 group-hover/link:opacity-100">
                →
              </span>
            </h2>
          </Link>
          <p className="mt-1 truncate font-mono text-xs text-fog">{site.rootUrl}</p>
        </div>

        {latestScan?.healthScore != null && (
          <div className="shrink-0 text-right">
            <ScoreBadge score={latestScan.healthScore} size="lg" />
          </div>
        )}
      </div>

      {latestScan && (
        <div className="mt-3 flex items-center gap-4 font-mono text-xs text-[#5C7589]">
          <StatusPill status={latestScan.status} />
          <span>{latestScan.pagesCrawled} pages</span>
          <Link
            href={`/sites/${site.id}/scans/${latestScan.id}`}
            className={isActive ? 'text-sonar hover:underline' : 'hover:text-snow hover:underline'}
          >
            {isActive ? 'watch live →' : 'latest report →'}
          </Link>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <form action={startScan}>
          <input type="hidden" name="siteId" value={site.id} />
          <button
            type="submit"
            disabled={isActive}
            className="rounded-lg bg-sonar px-4 py-2 font-display text-xs font-bold text-abyss transition-all hover:shadow-[0_0_20px_rgba(43,217,194,.35)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isActive ? 'Scanning…' : latestScan?.status === 'COMPLETED' ? 'Re-scan' : 'Start scan'}
          </button>
        </form>

        <Link
          href={`/sites/${site.id}`}
          className="rounded-lg border border-snow/[.08] px-4 py-2 font-display text-xs font-bold text-fog transition-all hover:border-snow/25 hover:text-snow"
        >
          History
        </Link>

        <form action={deleteSite.bind(null, site.id)} className="ml-auto">
          <button
            type="submit"
            className="rounded-lg border border-transparent px-4 py-2 font-display text-xs font-bold text-[#5C7589] transition-all hover:border-coral/40 hover:text-coral"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
