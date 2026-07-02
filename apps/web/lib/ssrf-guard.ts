import { promises as dns } from 'dns';

// SSRF prevention — resolve the hostname and reject any private/reserved IP
// before passing the URL to the crawler. This runs in the worker too via the
// shared package, but validating here as well gives defence in depth.

const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,  // link-local
  /^::1$/,        // IPv6 loopback
  /^fc00:/i,      // IPv6 unique-local
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,      // IPv6 link-local
];

export async function assertNotPrivate(url: string): Promise<void> {
  const { hostname } = new URL(url);

  // Block bare IP literals immediately
  for (const re of PRIVATE_RANGES) {
    if (re.test(hostname)) {
      throw new Error(`Blocked: private/reserved address (${hostname})`);
    }
  }

  // Resolve and check all returned addresses
  let addresses: string[];
  try {
    const result = await dns.lookup(hostname, { all: true });
    addresses = result.map((r) => r.address);
  } catch {
    throw new Error(`Cannot resolve hostname: ${hostname}`);
  }

  for (const addr of addresses) {
    for (const re of PRIVATE_RANGES) {
      if (re.test(addr)) {
        throw new Error(`Blocked: ${hostname} resolves to private address (${addr})`);
      }
    }
  }
}
