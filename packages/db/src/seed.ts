import { prisma } from './index.js';

// Creates the sentinel "demo" user + site that anonymous demo scans attach
// to (see apps/web/app/api/demo-scan/route.ts — DEMO_SITE_ID = 'demo').
// Idempotent: safe to run multiple times.

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@deadlink-sentinel.internal' },
    update: {},
    create: {
      id: 'demo-user',
      email: 'demo@deadlink-sentinel.internal',
      name: 'Demo',
    },
  });

  await prisma.site.upsert({
    where: { id: 'demo' },
    update: {},
    create: {
      id: 'demo',
      userId: demoUser.id,
      rootUrl: 'https://example.com',
      name: 'Demo scans',
    },
  });

  console.log('Seeded demo user + site');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
