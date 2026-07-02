// Domain types shared between web app and worker.
// These mirror the Prisma enums but are kept independent so the worker
// doesn't need a direct Prisma dependency for types.

export type Role = 'USER' | 'ADMIN';

export type ScanStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type AlertSchedule = 'NONE' | 'DAILY' | 'WEEKLY';

// ---------------------------------------------------------------------------
// Link classification — discriminated union
//
// The compiler forces every consumer to handle each branch explicitly.
// This is one of the interview talking points: type safety that prevents
// "unclassifiable link silently becoming OK" bugs.
// ---------------------------------------------------------------------------

export type LinkResultOk = {
  kind: 'OK';
  httpStatus: number;
};

export type LinkResultBroken = {
  kind: 'BROKEN';
  httpStatus: number | null;
  errorDetail: string;
};

export type LinkResultRedirect = {
  kind: 'REDIRECT';
  httpStatus: number;
  redirectChain: string[];
};

export type LinkResultBrokenAnchor = {
  kind: 'BROKEN_ANCHOR';
  httpStatus: number; // the page returned 200
  fragment: string;
  availableIds: string[]; // ids that do exist on the page
};

export type LinkClassification =
  | LinkResultOk
  | LinkResultBroken
  | LinkResultRedirect
  | LinkResultBrokenAnchor;

// ---------------------------------------------------------------------------
// Scan options — the canonical type lives in schemas.ts (Zod-inferred),
// keeping runtime validation and the static type from ever diverging.
// ---------------------------------------------------------------------------

import type { ScanOptions } from './schemas.js';

export const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  maxPages: 100,
  maxDepth: 3,
  includePatterns: [],
  excludePatterns: [],
  checkExternalLinks: true,
};

// ---------------------------------------------------------------------------
// Progress events — published to Redis, streamed to browser via SSE
// ---------------------------------------------------------------------------

export type ScanProgressEvent =
  | { type: 'CRAWL_STARTED'; scanId: string; rootUrl: string }
  | { type: 'PAGE_CRAWLED'; scanId: string; url: string; depth: number; pagesCrawled: number }
  | { type: 'LINK_CHECKED'; scanId: string; targetUrl: string; result: LinkClassification['kind'] }
  | { type: 'SCAN_COMPLETED'; scanId: string; healthScore: number; pagesCrawled: number }
  | { type: 'SCAN_FAILED'; scanId: string; errorMessage: string };

// ---------------------------------------------------------------------------
// BullMQ job payload
// ---------------------------------------------------------------------------

export type ScanJobData = {
  scanId: string;
  siteId: string;
  rootUrl: string;
  options: ScanOptions;
  isDemo: boolean;
};
