import { Redis } from 'ioredis';

// Singleton Redis client — same pattern as the Prisma client.
// Used for scan-progress pub/sub (worker publishes, SSE route subscribes).

declare global {
  // eslint-disable-next-line no-var
  var __redis: Redis | undefined;
}

function createRedis(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL environment variable is not set');
  return new Redis(url, { maxRetriesPerRequest: null });
}

export const redis: Redis = globalThis.__redis ?? (globalThis.__redis = createRedis());

if (process.env.NODE_ENV !== 'production') {
  globalThis.__redis = redis;
}

export function scanProgressChannel(scanId: string): string {
  return `scan:progress:${scanId}`;
}
