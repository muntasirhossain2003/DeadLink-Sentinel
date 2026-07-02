import { type NextRequest, NextResponse } from 'next/server';
import { DemoScanSchema, type ScanJobData, DEFAULT_SCAN_OPTIONS } from '@deadlink-sentinel/shared';
import { prisma } from '@deadlink-sentinel/db';
import { assertNotPrivate } from '@/lib/ssrf-guard';
import { redis } from '@/lib/redis';
import { getScanQueue } from '@/lib/queue';

// Demo scan — no auth required but rate-limited to 1 scan per IP per day.
// The result is not persisted to a user account.

const DEMO_SITE_ID = 'demo'; // sentinel value; worker treats isDemo:true specially

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const body = await request.json();
  const parsed = DemoScanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  try {
    await assertNotPrivate(parsed.data.url);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Invalid URL' }, { status: 400 });
  }

  // IP-based rate limit: one demo scan per IP per day
  const rateLimitKey = `demo:ratelimit:${ip}`;
  const existing = await redis.get(rateLimitKey);
  if (existing) {
    return NextResponse.json(
      { error: 'Demo limit reached. You can run one free scan per day. Sign up for unlimited scans.' },
      { status: 429 },
    );
  }

  // Create a temporary scan record (no siteId FK — demo scans are ephemeral)
  // We use a special "demo" site that is pre-created via seed, or handle in worker
  const scan = await prisma.scan.create({
    data: {
      siteId: DEMO_SITE_ID,
      status: 'QUEUED',
    },
  });

  const jobData: ScanJobData = {
    scanId: scan.id,
    siteId: DEMO_SITE_ID,
    rootUrl: parsed.data.url,
    options: { ...DEFAULT_SCAN_OPTIONS, maxPages: 25 },
    isDemo: true,
  };

  const queue = getScanQueue();
  await queue.add('crawl', jobData, { attempts: 1 });
  await queue.close();

  // Set rate-limit marker with 24-hour TTL
  await redis.set(rateLimitKey, '1', 'EX', 86400);

  return NextResponse.json({ scanId: scan.id });
}
