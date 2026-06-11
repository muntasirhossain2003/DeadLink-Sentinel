import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@deadlink-sentinel/db';
import { ScanResultsView } from '@/components/scan/scan-results-view';

interface Props {
  params: { siteId: string; scanId: string };
}

export default async function ScanPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const scan = await prisma.scan.findFirst({
    where: {
      id: params.scanId,
      siteId: params.siteId,
      site: { userId: session.user.id },
    },
    include: {
      site: { select: { name: true, rootUrl: true } },
      linkChecks: {
        orderBy: { checkedAt: 'asc' },
      },
      pages: {
        orderBy: { depth: 'asc' },
        take: 100,
      },
    },
  });

  if (!scan) notFound();

  return <ScanResultsView scan={scan} />;
}
