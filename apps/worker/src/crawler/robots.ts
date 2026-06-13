import robotsParser from 'robots-parser';
import { fetchWithTimeout } from './fetcher.js';
import { log } from '../logger.js';

export type RobotsRules = {
  isAllowed: (url: string) => boolean;
  crawlDelay: number; // milliseconds
};

const UA = 'DeadLinkSentinel/1.0';

export async function fetchRobots(rootUrl: string): Promise<RobotsRules> {
  const robotsUrl = new URL('/robots.txt', rootUrl).href;

  try {
    const res = await fetchWithTimeout(robotsUrl, { method: 'GET' });
    const text = res.status === 200 ? await res.text() : '';
    const robots = robotsParser(robotsUrl, text);

    // Respect Crawl-delay directive; enforce a minimum of 500ms, cap at 5s
    const rawDelay = robots.getCrawlDelay(UA);
    const crawlDelay = rawDelay != null
      ? Math.min(Math.max(rawDelay * 1000, 500), 5000)
      : 500; // default: 500ms → 2 req/s

    log.info({ robotsUrl, crawlDelay }, 'robots.txt fetched');

    return {
      isAllowed: (url) => robots.isAllowed(url, UA) ?? true,
      crawlDelay,
    };
  } catch (err) {
    // If robots.txt is unreachable, allow everything and use default delay
    log.warn({ robotsUrl, err }, 'could not fetch robots.txt, proceeding with defaults');
    return { isAllowed: () => true, crawlDelay: 500 };
  }
}
