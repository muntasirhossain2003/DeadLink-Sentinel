import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@deadlink-sentinel/db';
import { SiteCard } from '@/components/dashboard/site-card';
import { NewSiteButton } from '@/components/dashboard/new-site-button';

export default async function DashboardPage() {
  const session = await auth();
  // Layout ensures session exists, but TypeScript needs the check
  if (!session?.user?.id) return null;

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    include: {
      scans: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Your sites</h1>
          <p className="mt-1 text-sm text-fog">{sites.length} / 3 monitored sites</p>
        </div>
        {sites.length < 3 && <NewSiteButton />}
      </div>

      {sites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-snow/20 py-20 text-center">
          <p className="font-display text-lg font-bold">No sites yet</p>
          <p className="mt-2 text-sm text-fog">Add your first site to start monitoring</p>
          <div className="mt-6"><NewSiteButton /></div>
        </div>
      ) : (
        <Suspense fallback={<div className="text-fog text-sm">Loading…</div>}>
          <div className="grid gap-4">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} latestScan={site.scans[0] ?? null} />
            ))}
          </div>
        </Suspense>
      )}
    </div>
  );
}
