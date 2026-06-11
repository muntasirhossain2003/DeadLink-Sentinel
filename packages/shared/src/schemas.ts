import { z } from 'zod';

// ---------------------------------------------------------------------------
// Site / scan option schemas — single source of truth for runtime validation
// and static types. Zod infers TypeScript types so there's no divergence.
// ---------------------------------------------------------------------------

export const ScanOptionsSchema = z.object({
  maxPages: z.union([z.literal(25), z.literal(100), z.literal(250)]).default(100),
  maxDepth: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).default(3),
  includePatterns: z.array(z.string()).default([]),
  excludePatterns: z.array(z.string()).default([]),
  checkExternalLinks: z.boolean().default(true),
});

export type ScanOptionsInput = z.input<typeof ScanOptionsSchema>;
export type ScanOptions = z.output<typeof ScanOptionsSchema>;

export const CreateSiteSchema = z.object({
  name: z.string().min(1).max(100),
  rootUrl: z
    .string()
    .url()
    .refine((u) => u.startsWith('https://') || u.startsWith('http://'), {
      message: 'URL must start with http:// or https://',
    }),
  scanOptions: ScanOptionsSchema.optional(),
});

export type CreateSiteInput = z.infer<typeof CreateSiteSchema>;

export const StartScanSchema = z.object({
  siteId: z.string().cuid(),
  options: ScanOptionsSchema.optional(),
});

export type StartScanInput = z.infer<typeof StartScanSchema>;

// Demo scan — no auth, visitor-facing, hard-capped at 25 pages
export const DemoScanSchema = z.object({
  url: z
    .string()
    .url()
    .refine((u) => u.startsWith('https://') || u.startsWith('http://'), {
      message: 'URL must start with http:// or https://',
    }),
});

export type DemoScanInput = z.infer<typeof DemoScanSchema>;
