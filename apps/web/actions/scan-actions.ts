'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@deadlink-sentinel/db';
import { StartScanSchema, DEFAULT_SCAN_OPTIONS, type ScanJobData } from '@deadlink-sentinel/shared';
import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

function getScanQueue() {
  return new Queue<ScanJobData>('scans', { connection: redis });
}

export async function startScan(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Not authenticated');

  const parsed = StartScanSchema.safeParse({
    siteId: formData.get('siteId'),
  });
  if (!parsed.success) return { error: 'Invalid site' };

  // Verify ownership
  const site = await prisma.site.findFirst({
    where: { id: parsed.data.siteId, userId: session.user.id },
  });
  if (!site) return { error: 'Site not found' };

  // Block concurrent scans on the same site
  const running = await prisma.scan.findFirst({
    where: { siteId: site.id, status: { in: ['QUEUED', 'RUNNING'] } },
  });
  if (running) return { error: 'A scan is already in progress for this site.' };

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
