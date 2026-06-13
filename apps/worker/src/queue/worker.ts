import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import type { ScanJobData } from '@deadlink-sentinel/shared';
import { runCrawl } from '../crawler/index.js';
import { log } from '../logger.js';

export function startWorker(redis: Redis): Worker {
  const worker = new Worker<ScanJobData>(
    'scans',
    async (job) => {
      log.info({ jobId: job.id, scanId: job.data.scanId }, 'processing scan job');
      await runCrawl(job.data, redis);
    },
    {
      connection: redis,
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
