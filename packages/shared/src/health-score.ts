// Health Score formula v1.
//
// Score = 100 minus weighted penalties, floored at 0.
// Caps prevent one systemic issue from wiping out the entire score — a site
// with 50 broken internal links should not show 0 when all other signals are
// healthy.

export type ScoreInput = {
  brokenInternal: number;
  brokenExternal: number;
  brokenAnchors: number;
  redirectChains: number; // chains with >= 2 hops
  missingAltText?: number; // Phase 2
  missingTitle?: number;   // Phase 2
  missingMeta?: number;    // Phase 2
};

type PenaltyRule = {
  perIssue: number;
  cap: number;
};

const PENALTIES: Record<keyof ScoreInput, PenaltyRule> = {
  brokenInternal:  { perIssue: 5,   cap: 50 },
  brokenExternal:  { perIssue: 2,   cap: 20 },
  brokenAnchors:   { perIssue: 3,   cap: 15 },
  redirectChains:  { perIssue: 1,   cap: 10 },
  missingAltText:  { perIssue: 0.5, cap: 5  },
  missingTitle:    { perIssue: 0.5, cap: 5  },
  missingMeta:     { perIssue: 0.5, cap: 5  },
};

export function computeHealthScore(input: ScoreInput): number {
  let totalPenalty = 0;

  for (const [key, rule] of Object.entries(PENALTIES) as [keyof ScoreInput, PenaltyRule][]) {
    const count = input[key] ?? 0;
    totalPenalty += Math.min(count * rule.perIssue, rule.cap);
  }

  return Math.max(0, Math.round(100 - totalPenalty));
}
