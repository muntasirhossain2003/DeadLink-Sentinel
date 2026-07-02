import { Queue } from 'bullmq';
import type { ScanJobData } from '@deadlink-sentinel/shared';

// BullMQ gets plain connection options rather than our shared ioredis
// instance: npm can install bullmq with its own nested ioredis copy, and the
// two Redis classes are not type-compatible. A plain options object sidesteps
// the class-identity problem entirely.
function redisConnection() {
  const raw = process.env.REDIS_URL;
  if (!raw) throw new Error('REDIS_URL is not set');
  const url = new URL(raw);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    ...(url.username ? { username: url.username } : {}),
    ...(url.password ? { password: url.password } : {}),
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
  };
}

export function getScanQueue(): Queue<ScanJobData> {
  return new Queue<ScanJobData>('scans', { connection: redisConnection() });
}
