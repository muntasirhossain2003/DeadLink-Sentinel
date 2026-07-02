import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@deadlink-sentinel/db';
import { startScan } from '@/actions/scan-actions';
import { HealthTimeline, type TimelinePoint } from '@/components/site/health-timeline';
import { ScoreBadge } from '@/components/site/score-badge';
import { StatusPill } from '@/components/site/status-pill';

interface Props {
  params: { siteId: string };
}

export default async function SiteDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const site = await prisma.site.findFirst({
    where: { id: params.siteId, userId: session.user.id },
    include: {
      scans: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!site) notFound();

  const completed = site.scans.filter(
    (s) => s.status === 'COMPLETED' && s.healthScore != null,
  );

  const timeline: TimelinePoint[] = completed
    .slice(0, 20)
    .reverse()
    .map((s) => ({
      date: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(
        s.finishedAt ?? s.createdAt,
      ),
      score: s.healthScore!,
    }));

  const latest = site.scans[0];
  const hasActive = latest?.status === 'QUEUED' || latest?.status === 'RUNNING';

  return (
    <div className="space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <Link
          href="/dashboard"
          className="font-mono text-xs text-[#5C7589] transition-colors hover:text-sonar"
        >
          ← dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">{site.name}</h1>
            <a
              href={site.rootUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-mono text-xs text-fog transition-colors hover:text-sonar"
            >
              {site.rootUrl} ↗
            </a>
          </div>
          <form action={startScan}>
            <input type="hidden" name="siteId" value={site.id} />
            <button
              type="submit"
              disabled={hasActive}
              className="rounded-xl bg-sonar px-6 py-3 font-display text-sm font-bold text-abyss transition-all hover:shadow-[0_0_24px_rgba(43,217,194,.4)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {hasActive ? 'Scan in progress…' : 'Start scan'}
            </button>
          </form>
        </div>
      </div>

      {/* Timeline card */}
      <section className="rounded-2xl border border-snow/[.09] bg-abyss-2/50 p-6 backdrop-blur-sm">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-display text-base font-bold">Health score over time</h2>
          {completed[0] && (
            <ScoreBadge score={completed[0].healthScore!} size="lg" />
          )}
        </div>
        <HealthTimeline data={timeline} />
      </section>

      {/* Scan history */}
      <section>
        <h2 className="mb-4 font-display text-base font-bold">Scan history</h2>
        {site.scans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-snow/20 py-16 text-center">
            <p className="font-display font-bold">No scans yet</p>
            <p className="mt-2 text-sm text-fog">Start your first scan to see results here</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-snow/[.09]">
            <table className="w-full">
              <thead className="border-b border-snow/[.09] bg-abyss-2/60">
                <tr className="font-mono text-[11px] uppercase tracking-[.12em] text-fog">
                  <th className="px-5 py-3.5 text-left font-medium">Date</th>
                  <th className="px-5 py-3.5 text-left font-medium">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium">Pages</th>
                  <th className="px-5 py-3.5 text-right font-medium">Score</th>
                  <th className="px-5 py-3.5 text-right font-medium" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-snow/[.05]">
                {site.scans.map((scan) => (
                  <tr key={scan.id} className="transition-colors hover:bg-snow/[.02]">
                    <td className="px-5 py-4 font-mono text-xs text-snow">
                      {new Intl.DateTimeFormat('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(scan.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={scan.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-xs text-fog">
                      {scan.pagesCrawled}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {scan.healthScore != null ? (
                        <ScoreBadge score={scan.healthScore} />
                      ) : (
                        <span className="font-mono text-xs text-[#5C7589]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/sites/${site.id}/scans/${scan.id}`}
                        className="font-mono text-xs text-sonar hover:underline"
                      >
                        {scan.status === 'RUNNING' || scan.status === 'QUEUED'
                          ? 'watch live →'
                          : 'view report →'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
