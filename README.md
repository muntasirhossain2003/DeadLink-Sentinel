# DeadLink Sentinel

A continuous site-health monitor that sweeps your docs for broken links, dead anchors, and redirect chains — then gives you a 0–100 health score.

Built as a full-stack capstone project to demonstrate modern Next.js patterns, async job processing, and real-time streaming.

---

## What it does

- Crawls your site breadth-first, up to 250 pages
- Detects broken links (4xx/5xx), broken `#fragment` anchors, and redirect chains
- Streams live crawl progress to the browser via Server-Sent Events
- Computes a weighted health score (0–100) after every sweep
- Sends email alerts when new issues appear (Phase 2)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend + Backend | Next.js 14 (App Router), React, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Queue / Jobs | BullMQ + Redis |
| Live updates | Server-Sent Events + Redis pub/sub |
| Auth | Auth.js v5 — GitHub OAuth + magic-link |
| Validation | Zod |
| HTML parsing | cheerio + undici |
| Styling | Tailwind CSS |
| Email | Resend (Phase 2) |
| Deploy | Railway |

---

## Project structure

```
deadlink-sentinel/
├── apps/
│   ├── web/          # Next.js app — dashboard, landing page, API routes
│   └── worker/       # BullMQ consumer — crawler runs here
├── packages/
│   ├── db/           # Prisma schema + client
│   └── shared/       # Domain types, Zod schemas, health score formula
└── .github/
    └── workflows/    # CI — lint, typecheck, test
```

---

## Getting started

**Prerequisites:** Node 20+, PostgreSQL, Redis

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# fill in DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, GITHUB_CLIENT_ID/SECRET

# Run database migrations
npm run db:migrate

# Start the web app
npm run dev

# Start the worker (separate terminal)
npm run dev --workspace=apps/worker
```

---

## Health score formula

`score = 100 − Σ(penalty × count, capped per category)`

| Issue | Penalty | Cap |
|---|---|---|
| Broken internal link | −5 | −50 |
| Broken external link | −2 | −20 |
| Broken anchor | −3 | −15 |
| Redirect chain (≥2 hops) | −1 | −10 |

---

## Roadmap

- **MVP** — crawl, classify, score, stream, dashboard
- **Phase 2** — scheduled scans, email alerts, scan diff (NEW / RECURRING / FIXED), CSV export
- **Phase 3** — GitHub PR comments, public status badges, JS-rendered crawling
