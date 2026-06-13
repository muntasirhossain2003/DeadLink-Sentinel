import { Redis } from 'ioredis';
import { startWorker } from './queue/worker.js';
import { log } from './logger.js';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error('REDIS_URL is not set');

const redis = new Redis(redisUrl, { maxRetriesPerRequest: null });

const worker = startWorker(redis);

log.info('worker started, waiting for jobs');

// Graceful shutdown: finish the current job before exiting
async function shutdown() {
  log.info('shutting down worker');
  await worker.close();
  await redis.quit();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
