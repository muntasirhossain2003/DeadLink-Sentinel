import { fetch, type RequestInit, type Response } from 'undici';

const UA = 'DeadLinkSentinel/1.0 (+https://deadlink-sentinel.dev)';
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        ...(init.headers as Record<string, string> | undefined),
      },
      // Don't follow redirects automatically — we want to record the chain
      redirect: 'manual',
    });
  } finally {
    clearTimeout(timer);
  }
}

// HEAD request with exponential-backoff retries — used for external links
export async function headWithRetry(url: string): Promise<Response> {
  let lastErr: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await sleep(500 * 2 ** (attempt - 1));
    }
    try {
      return await fetchWithTimeout(url, { method: 'HEAD' });
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr;
}

// Follows redirects manually and records each hop in the chain
export async function fetchFollowingRedirects(
  url: string,
  maxHops = 10,
): Promise<{ finalResponse: Response; chain: string[] }> {
  const chain: string[] = [];
  let current = url;

  for (let hop = 0; hop < maxHops; hop++) {
    const res = await fetchWithTimeout(current, { method: 'GET' });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) break;

      const next = new URL(location, current).href;
      chain.push(current);
      current = next;
      continue;
    }

    return { finalResponse: res, chain };
  }

  // Exceeded maxHops — return the last response
  const res = await fetchWithTimeout(current, { method: 'GET' });
  return { finalResponse: res, chain };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
