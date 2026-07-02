import { Worker } from 'bullmq';
import type { Redis } from 'ioredis';
import type { ScanJobData } from '@deadlink-sentinel/shared';
import { runCrawl } from '../crawler/index.js';
import { log } from '../logger.js';

// BullMQ receives plain connection options rather than the shared ioredis
// instance: npm may install bullmq with a nested ioredis copy whose Redis
// class is not type-compatible with ours. The ioredis instance is kept only
// for progress pub/sub.
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
    // required by BullMQ for its blocking connection
    maxRetriesPerRequest: null,
  };
}

export function startWorker(redis: Redis): Worker<ScanJobData> {
  const worker = new Worker<ScanJobData>(
    'scans',
    async (job) => {
      log.info({ jobId: job.id, scanId: job.data.scanId }, 'processing scan job');
      await runCrawl(job.data, redis);
    },
    {
      connection: redisConnection(),
      // Only 2 concurrent scans — stays within Railway free-tier RAM limits
      concurrency: 2,
      // Auto-mark scans stuck >30min as failed (NFR-04)
      lockDuration: 30 * 60 * 1000,
    },
  );

  worker.on('completed', (job) => {
    log.info({ jobId: job.id }, 'job completed');
  });

  worker.on('failed', (job, err) => {
    log.error({ jobId: job?.id, err }, 'job failed');
  });

  worker.on('error', (err) => {
    log.error({ err }, 'worker error');
  });

  return worker;
}
