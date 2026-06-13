import { prisma } from '@deadlink-sentinel/db';
import {
  computeHealthScore,
  type ScanJobData,
  type ScanProgressEvent,
} from '@deadlink-sentinel/shared';
import type { Redis } from 'ioredis';
import { fetchFollowingRedirects } from './fetcher.js';
import { parsePage } from './parser.js';
import { classifyLink } from './classifier.js';
import { fetchRobots } from './robots.js';
import { log } from '../logger.js';

const SCAN_PROGRESS_CHANNEL = (scanId: string) => `scan:progress:${scanId}`;

export async function runCrawl(job: ScanJobData, redis: Redis): Promise<void> {
  const { scanId, rootUrl, options, isDemo } = job;
  const publish = (event: ScanProgressEvent) =>
    redis.publish(SCAN_PROGRESS_CHANNEL(scanId), JSON.stringify(event));

  log.info({ scanId, rootUrl }, 'crawl started');

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: 'RUNNING', startedAt: new Date() },
  });

  await publish({ type: 'CRAWL_STARTED', scanId, rootUrl });

  try {
    await crawl({ scanId, rootUrl, options, isDemo, redis, publish });

    await publish({
      type: 'SCAN_COMPLETED',
      scanId,
      healthScore: (await prisma.scan.findUnique({ where: { id: scanId }, select: { healthScore: true } }))?.healthScore ?? 0,
      pagesCrawled: (await prisma.scan.findUnique({ where: { id: scanId }, select: { pagesCrawled: true } }))?.pagesCrawled ?? 0,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error({ scanId, err }, 'crawl failed');

    await prisma.scan.update({
      where: { id: scanId },
      data: { status: 'FAILED', finishedAt: new Date(), errorMessage: msg },
    });

    await publish({ type: 'SCAN_FAILED', scanId, errorMessage: msg });
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Core BFS loop
// ---------------------------------------------------------------------------

async function crawl({
  scanId,
  rootUrl,
  options,
  redis,
  publish,
}: ScanJobData & { redis: Redis; publish: (e: ScanProgressEvent) => Promise<number> }) {
  const origin = new URL(rootUrl).origin;
  const robots = await fetchRobots(rootUrl);

  const visited = new Set<string>(); // page URLs (no fragment)
  const queue: Array<{ url: string; depth: number }> = [{ url: rootUrl, depth: 0 }];

  // Cache raw HTML of crawled pages so the classifier can verify fragments
  // without re-fetching the page
  const htmlCache = new Map<string, string>();

  let pagesCrawled = 0;

  // Accumulate counts for the health score calculation
  const counts = {
    brokenInternal: 0,
    brokenExternal: 0,
    brokenAnchors: 0,
    redirectChains: 0,
  };

  while (queue.length > 0 && pagesCrawled < options.maxPages) {
    const item = queue.shift();
    if (!item) break;
    const { url, depth } = item;

    // Normalise: strip fragment for dedup
    const pageUrl = new URL(url);
    pageUrl.hash = '';
    const pageHref = pageUrl.href;

    if (visited.has(pageHref)) continue;
    if (!robots.isAllowed(pageHref)) {
      log.debug({ pageHref }, 'robots.txt disallowed, skipping');
      continue;
    }

    visited.add(pageHref);

    // Politeness delay
    await sleep(robots.crawlDelay);

    // Fetch the page
    let html: string;
    let httpStatus: number;

    try {
      const { finalResponse } = await fetchFollowingRedirects(pageHref);
      httpStatus = finalResponse.status;

      if (httpStatus >= 400) {
        log.warn({ pageHref, httpStatus }, 'page returned error');
        continue;
      }

      html = await finalResponse.text();
      htmlCache.set(pageHref, html);
    } catch (err) {
      log.warn({ pageHref, err }, 'failed to fetch page');
      continue;
    }

    const parsed = parsePage(html, pageHref);
    pagesCrawled++;

    // Persist the page record
    const pageRecord = await prisma.page.create({
      data: {
        scanId,
        url: pageHref,
        httpStatus,
        title: parsed.title,
        hasMetaDescription: parsed.hasMetaDescription,
        depth,
      },
    });

    await publish({ type: 'PAGE_CRAWLED', scanId, url: pageHref, depth, pagesCrawled });

    // Check every link found on this page
    for (const link of parsed.links) {
      const linkUrl = new URL(link.href);
      const isExternal = linkUrl.origin !== origin;

      // Skip external links if the user turned off that option
      if (isExternal && !options.checkExternalLinks) continue;

      const classification = await classifyLink(link.href, link.fragment, isExternal, htmlCache);

      // Tally for health score
      if (classification.kind === 'BROKEN') {
        isExternal ? counts.brokenExternal++ : counts.brokenInternal++;
      } else if (classification.kind === 'BROKEN_ANCHOR') {
        counts.brokenAnchors++;
      } else if (classification.kind === 'REDIRECT' && classification.redirectChain.length >= 2) {
        counts.redirectChains++;
      }

      // Persist link check result
      await prisma.linkCheck.create({
        data: {
          scanId,
          sourcePageId: pageRecord.id,
          targetUrl: link.href,
          isExternal,
          result: classification.kind === 'BROKEN_ANCHOR' ? 'BROKEN_ANCHOR'
                : classification.kind === 'REDIRECT' ? 'REDIRECT'
                : classification.kind === 'BROKEN' ? 'BROKEN'
                : 'OK',
          httpStatus: classification.httpStatus,
          redirectChain:
            classification.kind === 'REDIRECT'
              ? classification.redirectChain
              : undefined,
          errorDetail:
            classification.kind === 'BROKEN'
              ? classification.errorDetail
              : classification.kind === 'BROKEN_ANCHOR'
              ? `missing #${classification.fragment}`
              : undefined,
        },
      });

      await publish({ type: 'LINK_CHECKED', scanId, targetUrl: link.href, result: classification.kind });

      // Queue same-origin pages for crawling (within depth limit)
      if (!isExternal && depth < options.maxDepth) {
        const nextUrl = new URL(link.href);
        nextUrl.hash = '';
        if (!visited.has(nextUrl.href)) {
          queue.push({ url: nextUrl.href, depth: depth + 1 });
        }
      }
    }
  }

  // Finalise: compute health score and mark scan completed
  const healthScore = computeHealthScore(counts);

  await prisma.scan.update({
    where: { id: scanId },
    data: {
      status: 'COMPLETED',
      finishedAt: new Date(),
      pagesCrawled,
      healthScore,
    },
  });

  log.info({ scanId, pagesCrawled, healthScore }, 'crawl completed');
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
