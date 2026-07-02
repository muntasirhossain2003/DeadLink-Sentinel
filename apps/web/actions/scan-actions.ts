'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@deadlink-sentinel/db';
import { StartScanSchema, DEFAULT_SCAN_OPTIONS, type ScanJobData } from '@deadlink-sentinel/shared';
import { getScanQueue } from '@/lib/queue';

// Used directly as a <form action>, so it must return void.
// Failure cases silently refresh the page — the UI already prevents them
// (button disabled while a scan is active), so they only occur on races.
export async function startScan(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const parsed = StartScanSchema.safeParse({
    siteId: formData.get('siteId'),
  });
  if (!parsed.success) return;

  // Verify ownership
  const site = await prisma.site.findFirst({
    where: { id: parsed.data.siteId, userId: session.user.id },
  });
  if (!site) return;

  // Block concurrent scans on the same site
  const running = await prisma.scan.findFirst({
    where: { siteId: site.id, status: { in: ['QUEUED', 'RUNNING'] } },
  });
  if (running) {
    revalidatePath(`/sites/${site.id}`);
    return;
  }

  const scan = await prisma.scan.create({
    data: { siteId: site.id, status: 'QUEUED' },
  });

  const jobData: ScanJobData = {
    scanId: scan.id,
    siteId: site.id,
    rootUrl: site.rootUrl,
    options: DEFAULT_SCAN_OPTIONS,
    isDemo: false,
  };

  const queue = getScanQueue();
  await queue.add('crawl', jobData, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
  });
  await queue.close();

  revalidatePath('/dashboard');
  redirect(`/sites/${site.id}/scans/${scan.id}`);
}
