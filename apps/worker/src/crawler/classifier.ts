import type { LinkClassification } from '@deadlink-sentinel/shared';
import { fetchWithTimeout, fetchFollowingRedirects, headWithRetry } from './fetcher.js';
import { log } from '../logger.js';

// Classify a single link.
// Internal links get a full GET so we can also parse their content.
// External links get a HEAD-only check to stay polite.

export async function classifyLink(
  targetUrl: string,
  fragment: string | null,
  isExternal: boolean,
  pageHtmlCache: Map<string, string>, // avoids re-fetching pages we already crawled
): Promise<LinkClassification> {
  try {
    if (isExternal) {
      return await classifyExternal(targetUrl);
    }
    return await classifyInternal(targetUrl, fragment, pageHtmlCache);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    log.warn({ targetUrl, detail }, 'link check threw');
    return { kind: 'BROKEN', httpStatus: null, errorDetail: detail };
  }
}

async function classifyInternal(
  url: string,
  fragment: string | null,
  cache: Map<string, string>,
): Promise<LinkClassification> {
  // Strip fragment to get the page URL
  const pageUrl = new URL(url);
  pageUrl.hash = '';
  const pageHref = pageUrl.href;

  // Follow redirects to get the final response + chain
  const { finalResponse, chain } = await fetchFollowingRedirects(pageHref);

  if (chain.length >= 2) {
    // Redirect chain — report it even if the final destination is OK
    return {
      kind: 'REDIRECT',
      httpStatus: finalResponse.status,
      redirectChain: [...chain, finalResponse.url ?? pageHref],
    };
  }

  const status = finalResponse.status;

  if (status >= 400) {
    return { kind: 'BROKEN', httpStatus: status, errorDetail: `HTTP ${status}` };
  }

  // Page returned 2xx — now check the fragment if present
  if (fragment) {
    let html = cache.get(pageHref);
    if (!html) {
      html = await finalResponse.text();
      cache.set(pageHref, html);
    } else {
      // We already consumed the body above; just use the cache
    }

    const { parsePage } = await import('./parser.js');
    const parsed = parsePage(html, pageHref);

    if (!parsed.headingIds.has(fragment)) {
      return {
        kind: 'BROKEN_ANCHOR',
        httpStatus: status,
        fragment,
        availableIds: [...parsed.headingIds],
      };
    }
  }

  return { kind: 'OK', httpStatus: status };
}

async function classifyExternal(url: string): Promise<LinkClassification> {
  try {
    const res = await headWithRetry(url);

    // Some servers reject HEAD — fall back to GET
    if (res.status === 405) {
      const getRes = await fetchWithTimeout(url, { method: 'GET' });
      if (getRes.status >= 400) {
        return { kind: 'BROKEN', httpStatus: getRes.status, errorDetail: `HTTP ${getRes.status}` };
      }
      return { kind: 'OK', httpStatus: getRes.status };
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location') ?? '';
      return { kind: 'REDIRECT', httpStatus: res.status, redirectChain: [url, location] };
    }

    if (res.status >= 400) {
      return { kind: 'BROKEN', httpStatus: res.status, errorDetail: `HTTP ${res.status}` };
    }

    return { kind: 'OK', httpStatus: res.status };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { kind: 'BROKEN', httpStatus: null, errorDetail: detail };
  }
}
