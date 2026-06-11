import { PrismaClient } from '@prisma/client';

// Re-export everything from Prisma so consumers only import from @deadlink-sentinel/db
export * from '@prisma/client';

declare global {
  // In development the module cache is cleared on every hot-reload, which would
  // create a new PrismaClient on each request and quickly exhaust connection
  // limits. Attaching one instance to globalThis survives hot-reloads.
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? (globalThis.__prisma = createPrismaClient());

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
