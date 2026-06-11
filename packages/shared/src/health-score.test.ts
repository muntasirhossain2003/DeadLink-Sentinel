import { describe, it, expect } from 'vitest';
import { computeHealthScore } from './health-score.js';

describe('computeHealthScore', () => {
  it('returns 100 for a perfectly clean site', () => {
    expect(computeHealthScore({
      brokenInternal: 0,
      brokenExternal: 0,
      brokenAnchors: 0,
      redirectChains: 0,
    })).toBe(100);
  });

  it('applies -5 per broken internal link', () => {
    expect(computeHealthScore({
      brokenInternal: 2,
      brokenExternal: 0,
      brokenAnchors: 0,
      redirectChains: 0,
    })).toBe(90);
  });

  it('caps broken internal penalty at -50', () => {
    expect(computeHealthScore({
      brokenInternal: 100,
      brokenExternal: 0,
      brokenAnchors: 0,
      redirectChains: 0,
    })).toBe(50);
  });

  it('applies mixed penalties correctly', () => {
    // 1 broken internal (-5) + 3 broken external (-6) + 2 broken anchors (-6) = -17 → 83
    expect(computeHealthScore({
      brokenInternal: 1,
      brokenExternal: 3,
      brokenAnchors: 2,
      redirectChains: 0,
    })).toBe(83);
  });

  it('floors at 0 even when cumulative penalties exceed 100', () => {
    expect(computeHealthScore({
      brokenInternal: 50,  // capped at -50
      brokenExternal: 50,  // capped at -20
      brokenAnchors: 20,   // capped at -15
      redirectChains: 20,  // capped at -10
      missingAltText: 20,  // capped at -5
    })).toBe(0);
  });
});
